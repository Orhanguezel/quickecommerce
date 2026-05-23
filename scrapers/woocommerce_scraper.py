"""
Ortak WooCommerce Store API urun scraper cekirdegi.
-------------------------------------------------
WooCommerce magazalari `Store API` ile ayni semayi verir; ince wrapper'lar
(maskotmeyvepresleri vs.) bu modulu tuketir.

API yolu otomatik denenir:
    /wp-json/wc/store/v1/products
    /wp-json/wc/store/products
    /?rest_route=/wc/store/products   (permalink kapali siteler icin)

Cikti semasi everlast_scraper.py / shopify_scraper.py ile birebir aynidir
-> `sync:source-prices` ve `import:products` degisiklik gerektirmeden calisir.

Not: Store API anahtar GEREKTIRMEZ (publike acik, salt-okunur). 403 donen
siteler (orn. ceysport) WAF/anti-bot ardindadir; HTML scraper gerekir.
"""

import json
import time

import requests

# Ortak yardimcilar shopify cekirdeginden yeniden kullanilir (tek kaynak).
from shopify_scraper import (  # noqa: F401  (resolve_* wrapper'lar tarafindan import edilir)
    HEADERS,
    _download_image,
    make_slug,
    resolve_image_dir,
    resolve_output,
    strip_html,
)
import re

API_CANDIDATES = [
    "/wp-json/wc/store/v1/products",
    "/wp-json/wc/store/products",
    "/?rest_route=/wc/store/products",
]


def _num(value):
    """Bos/None/gecersiz degerleri 0.0'a indirger."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _detect_api(session, base_url):
    """Calisan Store API endpoint'ini bulur (JSON liste donen ilk aday)."""
    for path in API_CANDIDATES:
        sep = "&" if "?" in path else "?"
        url = f"{base_url}{path}{sep}per_page=1&page=1"
        try:
            resp = session.get(url, timeout=20)
        except Exception:  # noqa: BLE001
            continue
        if resp.status_code != 200:
            continue
        if "application/json" not in resp.headers.get("content-type", ""):
            continue
        try:
            data = resp.json()
        except ValueError:
            continue
        if isinstance(data, list):
            return f"{base_url}{path}"
    return None


def _fetch_all(session, api_url, per_page=100):
    """Store API'den tum urunleri sayfalayarak ceker."""
    all_products = []
    page = 1
    sep = "&" if "?" in api_url else "?"
    while True:
        url = f"{api_url}{sep}per_page={per_page}&page={page}"
        print(f"  Store API sayfa {page}")
        try:
            resp = session.get(url, timeout=30)
            resp.raise_for_status()
            products = resp.json()
        except Exception as exc:  # noqa: BLE001
            print(f"    HATA: {exc}")
            break
        if not isinstance(products, list) or not products:
            break
        all_products.extend(products)
        total = resp.headers.get("X-WP-Total", "?")
        total_pages = int(resp.headers.get("X-WP-TotalPages", 0) or 0)
        print(f"    {len(products)} urun (toplam: {total})")
        if total_pages and page >= total_pages:
            break
        if len(products) < per_page:
            break
        page += 1
        time.sleep(0.4)
    return all_products


def _slug_from(raw, name):
    slug = (raw.get("slug") or "").strip()
    if slug:
        return slug
    permalink = (raw.get("permalink") or "").strip()
    match = re.search(r"/([^/?#]+)/?$", permalink)
    if match:
        return match.group(1)
    return make_slug(name)


def _process(raw_products, base_url, vendor, default_category):
    """Ham Store API verisini standart (everlast) semaya cevirir."""
    processed = []
    for raw in raw_products:
        name = (raw.get("name") or "").strip()
        if not name:
            continue
        slug = _slug_from(raw, name)
        permalink = raw.get("permalink") or f"{base_url}/?p={raw.get('id')}"
        product_type = raw.get("type", "simple")

        prices = raw.get("prices", {}) or {}
        minor = 10 ** int(prices.get("currency_minor_unit", 2) or 2)
        regular = _num(prices.get("regular_price")) / minor
        sale = _num(prices.get("sale_price")) / minor
        current = _num(prices.get("price")) / minor
        on_sale = bool(raw.get("on_sale"))

        base_price = regular if regular > 0 else current
        if on_sale and 0 < sale < base_price:
            original_price = round(base_price, 2)
            discounted_price = round(sale, 2)
        else:
            original_price = round(base_price, 2) if base_price > 0 else None
            discounted_price = None

        in_stock = bool(raw.get("is_in_stock", True))
        sku = raw.get("sku", "") or ""

        images = raw.get("images", []) or []
        image_urls = [img.get("src") for img in images if img.get("src")]

        categories = raw.get("categories", []) or []
        cat_names = [c.get("name", "") for c in categories if c.get("name")]

        attributes = raw.get("attributes", []) or []
        specifications = []
        options = []
        for attr in attributes:
            terms = attr.get("terms", []) or []
            vals = [t.get("name", "") for t in terms if t.get("name")]
            attr_name = attr.get("name", "")
            if attr_name and vals:
                specifications.append({"name": attr_name, "value": ", ".join(vals)})
                options.append({"name": attr_name, "values": vals})

        variant_price = round(current if current > 0 else base_price, 2)
        compare = round(regular, 2) if on_sale and regular > current else None

        variant_list = []
        variations = raw.get("variations", []) or []
        if variations:
            # Store API liste yaniti varyant fiyatini vermez; urun fiyati
            # ile doldurulur (fiyat/stok sync urun seviyesinden de calisir).
            for var in variations:
                attrs = var.get("attributes", []) or []
                title = " / ".join(a.get("value", "") for a in attrs) or "Variant"
                variant_list.append({
                    "title": title,
                    "sku": "",
                    "barcode": "",
                    "price": variant_price,
                    "compare_at_price": compare,
                    "available": in_stock,
                    "option1": attrs[0].get("value") if len(attrs) > 0 else None,
                    "option2": attrs[1].get("value") if len(attrs) > 1 else None,
                    "option3": attrs[2].get("value") if len(attrs) > 2 else None,
                })
        else:
            # Basit urun -> tek "Default Title" varyant (Shopify uyumu).
            variant_list.append({
                "title": "Default Title",
                "sku": sku,
                "barcode": "",
                "price": variant_price,
                "compare_at_price": compare,
                "available": in_stock,
                "option1": None,
                "option2": None,
                "option3": None,
            })

        desc_html = raw.get("description", "") or ""
        short_html = raw.get("short_description", "") or ""

        processed.append({
            "name": name,
            "slug": slug,
            "url": permalink,
            "category": cat_names[0] if cat_names else default_category,
            "parent_category": None,
            "vendor": vendor,
            "product_type": product_type,
            "description_html": desc_html,
            "description_text": strip_html(desc_html) or strip_html(short_html),
            "original_price": original_price,
            "discounted_price": discounted_price,
            "discount_rate": None,
            "sku": sku,
            "barcode": "",
            "available": in_stock,
            "specifications": specifications,
            "all_image_urls": image_urls,
            "thumbnail_url": image_urls[0] if image_urls else "",
            "variants": variant_list,
            "options": options,
            "downloaded_images": [],
            "tags": [t.get("name", "") for t in (raw.get("tags", []) or []) if t.get("name")],
        })
    return processed


def run(base_url, output_file, vendor, default_category="Ürün",
        image_dir=None, with_images=False, api_base=None):
    """Bir WooCommerce magazasini Store API ile scrape eder, JSON yazar.

    with_images=False (varsayilan): cron fiyat/stok sync icin gorsel
    indirilmez -> hizli. with_images=True yalniz ilk import icin gerekir.
    api_base verilirse otomatik tespit atlanir.
    """
    base_url = base_url.rstrip("/")
    print(f"WooCommerce scraper: {base_url}")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)
    session.headers["Accept"] = "application/json"

    api_url = api_base or _detect_api(session, base_url)
    if not api_url:
        print("HATA: WooCommerce Store API bulunamadi (403/404).")
        print("      Site WAF/anti-bot ardinda olabilir -> HTML scraper gerekir.")
        raise SystemExit(1)
    print(f"  API: {api_url}")

    raw = _fetch_all(session, api_url)
    print(f"\nToplam {len(raw)} urun cekildi.")
    if not raw:
        print("HATA: Hic urun donmedi.")
        raise SystemExit(1)

    products = _process(raw, base_url, vendor, default_category)

    if with_images and image_dir:
        print("\nGorseller indiriliyor...")
        for i, prod in enumerate(products, 1):
            print(f"  [{i}/{len(products)}] {prod['slug'][:60]}")
            downloaded = []
            for img_url in prod.get("all_image_urls", []):
                local = _download_image(session, img_url, image_dir, prod["slug"][:60])
                if local:
                    downloaded.append({"remote_url": img_url, "local_path": local})
            prod["downloaded_images"] = downloaded

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p.get("available"))
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta) -> {output_file}")
    return products
