"""
Ortak Shopify urun scraper cekirdegi.
-------------------------------------------------
Shopify magazalari `/products.json` ile ayni semayi verir; norfolk ve
superstacy gibi siteler bu modulu ince wrapper'larla tuketir.

Cikti semasi everlast_scraper.py ile birebir aynidir -> `sync:source-prices`
ve `import:products` komutlari degisiklik gerektirmeden calisir.
"""

import hashlib
import json
import os
import re
import time
from html import unescape
from pathlib import Path

import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def resolve_output(filename):
    """JSON cikti yolunu layout'tan bagimsiz cozer.

    Repo layout'ta (scrapers/ altinda) -> data/source-products/<filename>.
    VPS kok layout'ta (script /var/www/quikecommerce/ kokunde) -> <filename>
    (cron `cd /var/www/quikecommerce` yaptigi icin cwd koke yazar).
    """
    here = Path(__file__).resolve().parent
    repo_dir = here.parent / "data" / "source-products"
    if here.name == "scrapers" or repo_dir.is_dir():
        repo_dir.mkdir(parents=True, exist_ok=True)
        return str(repo_dir / filename)
    return filename


def resolve_image_dir(dirname):
    """Gorsel dizinini layout'tan bagimsiz cozer (yalniz --images modunda kullanilir)."""
    here = Path(__file__).resolve().parent
    repo_dir = here.parent / "assets" / "source-images"
    base = repo_dir if (here.name == "scrapers" or repo_dir.is_dir()) else here
    path = base / dirname
    path.mkdir(parents=True, exist_ok=True)
    return str(path)


def strip_html(html_str):
    if not html_str:
        return ""
    text = re.sub(r"<[^>]+>", "", html_str)
    return re.sub(r"\s+", " ", unescape(text)).strip()


def clean_description_html(html):
    """Urun aciklamasindan CSS/JS kirligini temizler.

    - <style>...</style> ve <script>...</script> bloklarini cikartir
    - Aciklamanin BASINDA yer alan CSS yorum/kurallarini (`/* ... */`,
      `.cls { ... }`, `#id { ... }`, `@media { ... }`) tek tek siler;
      ilk CSS-olmayan icerikte (HTML tag, normal metin) durur

    eprotein/Body Attack tarzi JSON-LD description'lar bazen style+HTML
    karisik gelir; bu fonksiyon olmadan CSS musteriye text olarak gorunur
    (2026-05-23 bug). Plain text icerik korunur.
    """
    if not html:
        return ""
    cleaned = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.S | re.I)
    cleaned = re.sub(r'<script[^>]*>.*?</script>', '', cleaned, flags=re.S | re.I)

    # Bastaki CSS yorum + kurallarini sira ile sok — selector .class/#id/@media
    # ile basliyorsa CSS olarak kabul et (text ile karistirmamak icin
    # konservatif: harf-baslangiclari islenmez).
    # `@media { .x{} .y{} }` gibi tek-seviye nested bloklari da yakalar.
    css_block = re.compile(
        r'[\.\#@][^{}]*?\{(?:[^{}]|\{[^{}]*?\})*\}', re.S
    )
    css_comment = re.compile(r'/\*.*?\*/', re.S)
    while True:
        s = cleaned.lstrip()
        if not s:
            cleaned = ""
            break
        m = css_comment.match(s)
        if m:
            cleaned = s[m.end():]
            continue
        m = css_block.match(s)
        if m:
            cleaned = s[m.end():]
            continue
        cleaned = s
        break
    return cleaned.strip()


def make_slug(name):
    slug = (name or "").lower()
    slug = slug.translate(str.maketrans("şçğüöıİŞÇĞÜÖ", "scguoiISCGUO"))
    return re.sub(r"[^a-z0-9]+", "-", slug).strip("-")[:80]


def _download_image(session, url, image_dir, subfolder):
    if not url or not url.startswith("http"):
        return None
    try:
        ext = os.path.splitext(url.split("?")[0])[1] or ".jpg"
        filename = hashlib.md5(url.encode()).hexdigest()[:12] + ext
        save_dir = os.path.join(image_dir, subfolder) if subfolder else image_dir
        os.makedirs(save_dir, exist_ok=True)
        path = os.path.join(save_dir, filename)
        if not os.path.exists(path):
            resp = session.get(url, timeout=20)
            resp.raise_for_status()
            with open(path, "wb") as f:
                f.write(resp.content)
        return path
    except Exception as exc:  # noqa: BLE001
        print(f"    gorsel hatasi {url}: {exc}")
        return None


def _fetch_all(session, base_url):
    """`/products.json` + koleksiyonlardan tum urunleri toplar (id ile tekil)."""
    all_products = {}

    page = 1
    while True:
        url = f"{base_url}/products.json?limit=250&page={page}"
        print(f"  products.json sayfa {page}")
        try:
            resp = session.get(url, timeout=25)
            resp.raise_for_status()
            products = resp.json().get("products", [])
        except Exception as exc:  # noqa: BLE001
            print(f"    HATA: {exc}")
            break
        if not products:
            break
        for p in products:
            all_products[p["id"]] = p
        print(f"    {len(products)} urun")
        page += 1
        time.sleep(0.5)

    try:
        resp = session.get(f"{base_url}/collections.json?limit=250", timeout=20)
        collections = resp.json().get("collections", [])
    except Exception:  # noqa: BLE001
        collections = []

    for col in collections:
        handle = col.get("handle", "")
        if handle in ("frontpage", ""):
            continue
        cpage = 1
        while True:
            url = f"{base_url}/collections/{handle}/products.json?limit=250&page={cpage}"
            try:
                resp = session.get(url, timeout=20)
                products = resp.json().get("products", [])
            except Exception:  # noqa: BLE001
                break
            if not products:
                break
            for p in products:
                if p["id"] not in all_products:
                    all_products[p["id"]] = p
            cpage += 1
            time.sleep(0.3)

    return list(all_products.values())


def _process(raw_products, base_url, vendor, default_category):
    processed = []
    for raw in raw_products:
        handle = raw.get("handle", "")
        title = raw.get("title", "")
        body_html = raw.get("body_html", "") or ""
        product_type = raw.get("product_type", "")
        images = raw.get("images", [])
        image_urls = [img["src"] for img in images if img.get("src")]
        variants = raw.get("variants", [])
        options = raw.get("options", [])

        main_variant = next(
            (v for v in variants if v.get("available")),
            variants[0] if variants else None,
        )
        original_price = discounted_price = None
        sku = barcode = ""

        if main_variant:
            price = float(main_variant.get("price", 0) or 0)
            compare = main_variant.get("compare_at_price")
            compare_price = float(compare) if compare else None
            if compare_price and compare_price > price:
                original_price = compare_price
                discounted_price = price
            else:
                original_price = price
            sku = main_variant.get("sku", "") or ""
            barcode = main_variant.get("barcode", "") or ""

        variant_list = []
        for v in variants:
            vcompare = v.get("compare_at_price")
            variant_list.append(
                {
                    "title": v.get("title", ""),
                    "sku": v.get("sku", "") or "",
                    "barcode": v.get("barcode", "") or "",
                    "price": float(v.get("price", 0) or 0),
                    "compare_at_price": float(vcompare) if vcompare else None,
                    "available": v.get("available", False),
                    "option1": v.get("option1"),
                    "option2": v.get("option2"),
                    "option3": v.get("option3"),
                }
            )

        specifications = []
        if product_type:
            specifications.append({"name": "Urun Tipi", "value": product_type})

        processed.append(
            {
                "name": title,
                "slug": handle or make_slug(title),
                "url": f"{base_url}/products/{handle}",
                "category": product_type or default_category,
                "parent_category": None,
                "vendor": raw.get("vendor", "") or vendor,
                "product_type": product_type,
                "description_html": body_html,
                "description_text": strip_html(body_html),
                "original_price": original_price,
                "discounted_price": discounted_price,
                "discount_rate": None,
                "sku": sku,
                "barcode": barcode,
                "specifications": specifications,
                "all_image_urls": image_urls,
                "thumbnail_url": image_urls[0] if image_urls else "",
                "variants": variant_list,
                "options": [
                    {"name": o.get("name", ""), "values": o.get("values", [])}
                    for o in options
                ],
                "downloaded_images": [],
                "tags": raw.get("tags", []),
            }
        )
    return processed


def run(base_url, output_file, vendor, default_category="Ürün",
        image_dir=None, with_images=False):
    """Bir Shopify magazasini scrape eder ve JSON ciktiyi yazar.

    with_images=False (varsayilan): cron'da fiyat/stok sync icin gorsel
    indirilmez -> hizli. with_images=True yalniz ilk import icin gerekir.
    """
    base_url = base_url.rstrip("/")
    print(f"Shopify scraper: {base_url}")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)

    raw = _fetch_all(session, base_url)
    print(f"\nToplam {len(raw)} urun cekildi.")

    products = _process(raw, base_url, vendor, default_category)

    if with_images and image_dir:
        print("\nGorseller indiriliyor...")
        for i, p in enumerate(products, 1):
            print(f"  [{i}/{len(products)}] {p['slug'][:60]}")
            downloaded = []
            for img_url in p.get("all_image_urls", []):
                local = _download_image(session, img_url, image_dir, p["slug"][:60])
                if local:
                    downloaded.append({"remote_url": img_url, "local_path": local})
            p["downloaded_images"] = downloaded

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(
        1 for p in products if any(v["available"] for v in p["variants"])
    )
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta) -> {output_file}")
    return products
