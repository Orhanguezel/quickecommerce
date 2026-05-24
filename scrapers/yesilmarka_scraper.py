"""
yesilmarka.com Urun Scraper — SADECE Sporcu Besinleri
-------------------------------------------------
yesilmarka.com ikas platformu; kategori listesi client-side API'den
yuklendigi icin sitemap (`products.xml`) uzerinden gidilir: her urun
sayfasindaki JSON-LD `Product` + `BreadcrumbList` parse edilir,
breadcrumb'inda "Sporcu Besinleri" gecen urunler tutulur (tum site DEGIL).

musclepump_scraper.py paterni (sitemap + urun sayfasi).

Kullanim: python yesilmarka_scraper.py
Cikti: yesilmarka_products.json (repo'da data/source-products/ altina)
"""

import json
import re
import sys
import time
from html import unescape

import requests

from shopify_scraper import resolve_output, resolve_relative_urls

BASE_URL = "https://yesilmarka.com"
SITEMAP = f"{BASE_URL}/products.xml"
OUTPUT_FILE = resolve_output("yesilmarka_products.json")
CATEGORY_FILTER = "sporcu besinleri"  # breadcrumb'da bu gecmeli
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html",
}


def strip_html(value):
    if not value:
        return ""
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", "", value))).strip()


def jsonld_blocks(html):
    out = []
    for block in re.findall(
        r"<script[^>]*application/ld\+json[^>]*>(.+?)</script>", html, re.S
    ):
        try:
            out.append(json.loads(block.strip(), strict=False))
        except json.JSONDecodeError:
            continue
    return out


def price_from_offers(offers):
    """Offer / AggregateOffer / liste -> (price, available)."""
    if isinstance(offers, list):
        offers = offers[0] if offers else {}
    if not isinstance(offers, dict):
        return None, True

    raw = offers.get("price") or offers.get("lowPrice")
    price = None
    if raw not in (None, ""):
        try:
            price = round(float(str(raw)), 2)
        except ValueError:
            price = None

    availability = str(offers.get("availability", "")).lower()
    available = "outofstock" not in availability and "soldout" not in availability
    return price, available


def parse_product(url, html):
    """Sporcu Besinleri urunuyse dict dondurur; degilse None."""
    product = breadcrumb = None
    for block in jsonld_blocks(html):
        items = block if isinstance(block, list) else [block]
        for j in items:
            if not isinstance(j, dict):
                continue
            if j.get("@type") == "Product":
                product = j
            elif j.get("@type") == "BreadcrumbList":
                breadcrumb = j

    if not product:
        return None

    crumbs = []
    if breadcrumb:
        for el in breadcrumb.get("itemListElement", []):
            name = el.get("name") or (el.get("item") or {}).get("name") or ""
            crumbs.append(unescape(str(name)).strip())

    # breadcrumb: [site_adi, ust_kategori, alt_kategori, ..., urun_adi]
    # ilk oge site adidir ("...Sporcu Besinleri...nin Yerli Ureticisi") ve
    # son oge urun adi -> ikisi de filtreden haric, yalniz kategori yolu.
    category_crumbs = crumbs[1:-1]
    crumb_text = " > ".join(category_crumbs).lower()
    if CATEGORY_FILTER not in crumb_text:
        return None  # sporcu besinleri disindaki urunler atlanir

    price, available = price_from_offers(product.get("offers", {}))

    brand = product.get("brand")
    if isinstance(brand, dict):
        brand = brand.get("name", "")

    images = product.get("image", [])
    if isinstance(images, str):
        images = [images]
    images = [i for i in images if isinstance(i, str) and i.startswith("http")]

    # en alt kategori (" - " sonrasi SEO eki temizlenir)
    category = (category_crumbs[-1].split(" - ")[0]
                if category_crumbs else "Sporcu Besinleri")
    parent = "Sporcu Besinleri"

    desc_html = resolve_relative_urls(str(product.get("description", "")), url)

    return {
        "name": unescape(str(product.get("name", ""))).strip(),
        "slug": url.rstrip("/").rsplit("/", 1)[-1],
        "url": url,
        "category": category,
        "parent_category": parent,
        "vendor": brand or "Yeşilmarka",
        "product_type": category,
        "description_html": desc_html,
        "description_text": strip_html(desc_html),
        "original_price": price,
        "discounted_price": None,
        "discount_rate": None,
        "sku": str(product.get("sku") or product.get("mpn") or "").strip(),
        "barcode": str(product.get("gtin13") or product.get("gtin") or "").strip(),
        "available": available,
        "specifications": [],
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else "",
        "variants": [],
        "options": [],
        "downloaded_images": [],
        "tags": [],
    }


def main():
    print(f"yesilmarka.com scraper — SADECE '{CATEGORY_FILTER}'")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)

    resp = session.get(SITEMAP, timeout=25)
    resp.raise_for_status()
    urls = re.findall(r"<loc>([^<]+)</loc>", resp.text)
    print(f"Sitemap'te {len(urls)} urun — her biri kategori icin kontrol ediliyor.\n")

    products = []
    skipped = 0
    failed = []
    for i, url in enumerate(urls, 1):
        try:
            page = session.get(url, timeout=20)
            page.raise_for_status()
            product = parse_product(url, page.text)
        except Exception as exc:  # noqa: BLE001
            failed.append(url)
            print(f"  [{i}/{len(urls)}] HATA {url}: {exc}")
            time.sleep(0.4)
            continue

        if product:
            products.append(product)
            stok = "stokta" if product["available"] else "tukendi"
            print(f"  [{i}/{len(urls)}] ✓ {product['name'][:48]} — "
                  f"{product['original_price']} TL ({stok})")
        else:
            skipped += 1
        time.sleep(0.4)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p["available"])
    print(f"\nTamamlandi! {len(products)} sporcu besini urunu ({in_stock} stokta) "
          f"-> {OUTPUT_FILE}")
    print(f"Kategori disi atlanan: {skipped} | parse hatasi: {len(failed)}")
    if not products:
        sys.exit(1)


if __name__ == "__main__":
    main()
