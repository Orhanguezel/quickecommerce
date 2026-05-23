"""
musullu.com Urun Scraper (ikas platformu — JSON-LD Product)
-------------------------------------------------------------
musullu.com `ikas` (modern Turk e-ticaret) uzerinde calisir. Urun URL'leri
`products.xml` sitemap'inden kesfedilir; her urun sayfasi temiz bir JSON-LD
`Product` nesnesi gomar (ad, fiyat TRY, stok, gorsel, marka).

Kullanim:
    python scrapers/musullu_scraper.py                # fiyat/stok (gorselsiz)
    python scrapers/musullu_scraper.py --limit=8      # test
    python scrapers/musullu_scraper.py --images       # ilk import icin gorseller
Cikti: data/source-products/musullu_products.json

Cikti semasi everlast/shopify ciktisiyla birebir aynidir
-> `sync:source-prices` ve `import:products` degisiklik gerektirmeden calisir.
"""

import json
import re
import sys
import time

import requests

from shopify_scraper import (
    HEADERS,
    _download_image,
    make_slug,
    resolve_image_dir,
    resolve_output,
    strip_html,
)

BASE_URL = "https://musullu.com"
SITEMAP_URL = f"{BASE_URL}/products.xml"
VENDOR = "Musullu"
DEFAULT_CATEGORY = "Mutfak Ekipmanlari"


def _discover_urls(session):
    """products.xml sitemap'inden urun URL'lerini toplar (tekil, sirali)."""
    try:
        resp = session.get(SITEMAP_URL, timeout=60)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"  Sitemap HATASI: {exc}")
        return []
    locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", resp.text)
    return list(dict.fromkeys(loc.strip() for loc in locs))


def _jsonld_product(html):
    """Sayfadaki ilk JSON-LD `Product` nesnesini dondurur."""
    for block in re.findall(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.S | re.I,
    ):
        try:
            data = json.loads(block.strip())
        except ValueError:
            continue
        candidates = data if isinstance(data, list) else [data]
        for item in candidates:
            if isinstance(item, dict):
                t = item.get("@type")
                if t == "Product" or (isinstance(t, list) and "Product" in t):
                    return item
    return None


def _clean_price(value):
    if value is None:
        return None
    try:
        val = float(str(value).replace(",", "."))
        return round(val, 2) if val > 0 else None
    except (TypeError, ValueError):
        return None


def _images_from_jsonld(value):
    if not value:
        return []
    if isinstance(value, str):
        return [value]
    out = []
    if isinstance(value, list):
        for v in value:
            if isinstance(v, str):
                out.append(v)
            elif isinstance(v, dict) and v.get("url"):
                out.append(v["url"])
    elif isinstance(value, dict) and value.get("url"):
        out.append(value["url"])
    return [u for u in out if isinstance(u, str) and u.startswith("http")]


def _parse_product(session, url):
    try:
        resp = session.get(url, timeout=25)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"    HATA {url}: {exc}")
        return None

    jsonld = _jsonld_product(resp.text)
    if not jsonld:
        return None

    name = (jsonld.get("name") or "").strip()
    if not name:
        return None

    offers = jsonld.get("offers")
    if isinstance(offers, list):
        offer = offers[0] if offers else {}
    elif isinstance(offers, dict):
        offer = offers
    else:
        offer = {}

    price = _clean_price(offer.get("price") or offer.get("lowPrice"))
    if not price:
        return None

    avail = str(offer.get("availability") or "").lower()
    in_stock = "outofstock" not in avail and "soldout" not in avail

    brand = jsonld.get("brand")
    if isinstance(brand, dict):
        brand = brand.get("name", "")

    sku = str(jsonld.get("sku") or jsonld.get("mpn") or jsonld.get("productId") or "").strip()
    images = _images_from_jsonld(jsonld.get("image"))

    desc_html = jsonld.get("description") or ""
    slug_match = re.search(r"/([^/?#]+?)(?:[?#].*)?$", url)
    slug = slug_match.group(1) if slug_match else make_slug(name)

    return {
        "name": name,
        "slug": slug,
        "url": url,
        "category": DEFAULT_CATEGORY,
        "parent_category": None,
        "vendor": brand or VENDOR,
        "product_type": "",
        "description_html": desc_html,
        "description_text": strip_html(desc_html),
        "original_price": price,
        "discounted_price": None,
        "discount_rate": None,
        "sku": sku,
        "barcode": str(jsonld.get("gtin") or jsonld.get("gtin13") or "").strip(),
        "available": in_stock,
        "specifications": [],
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else "",
        "variants": [{
            "title": "Default Title",
            "sku": sku,
            "barcode": "",
            "price": price,
            "compare_at_price": None,
            "available": in_stock,
            "option1": None,
            "option2": None,
            "option3": None,
        }],
        "options": [],
        "downloaded_images": [],
        "tags": [],
    }


def main():
    args = sys.argv[1:]
    with_images = "--images" in args
    limit = None
    for a in args:
        if a.startswith("--limit="):
            limit = int(a.split("=", 1)[1])

    print("musullu.com scraper (ikas / JSON-LD Product)")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)

    print(f"  Sitemap: {SITEMAP_URL}")
    urls = _discover_urls(session)
    print(f"  {len(urls)} urun URL'i bulundu.")
    if limit:
        urls = urls[:limit]
        print(f"  (TEST limiti: ilk {len(urls)})")
    if not urls:
        print("HATA: urun URL'i bulunamadi.")
        sys.exit(1)

    products = []
    skipped = 0
    for i, url in enumerate(urls, 1):
        if i == 1 or i % 25 == 0:
            print(f"  [{i}/{len(urls)}] ...")
        prod = _parse_product(session, url)
        if prod:
            products.append(prod)
        else:
            skipped += 1
        time.sleep(0.5)

    if with_images:
        image_dir = resolve_image_dir("musullu_images")
        print("\nGorseller indiriliyor...")
        for i, prod in enumerate(products, 1):
            downloaded = []
            for img_url in prod.get("all_image_urls", []):
                local = _download_image(session, img_url, image_dir, prod["slug"][:60])
                if local:
                    downloaded.append({"remote_url": img_url, "local_path": local})
            prod["downloaded_images"] = downloaded

    output_file = resolve_output("musullu_products.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p["available"])
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta, {skipped} atlandi)"
          f" -> {output_file}")
    if not products:
        sys.exit(1)


if __name__ == "__main__":
    main()
