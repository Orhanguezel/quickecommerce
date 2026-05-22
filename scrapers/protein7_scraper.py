"""
protein7.com Urun Scraper (kategori JSON-LD ItemList)
-------------------------------------------------
protein7.com custom Laravel sitesi; kategori sayfasi sayfa icinde
JSON-LD `ItemList` gomuyor (urun adi, sku, url, fiyat TRY, stok).
Tek sayfa istegi -> tum kategori urunleri (sayfalama yok).

Kullanim:
    python protein7_scraper.py                       # whey-protein
    python protein7_scraper.py izole-protein kreatin # baska kategoriler
Cikti: protein7_products.json (repo'da data/source-products/ altina)
"""

import json
import re
import sys
import time
from html import unescape

import requests

from shopify_scraper import resolve_output

BASE_URL = "https://protein7.com"
OUTPUT_FILE = resolve_output("protein7_products.json")
DEFAULT_CATEGORIES = ["whey-protein"]
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html",
}


def slug_from_url(url):
    return url.rstrip("/").rsplit("/", 1)[-1]


def parse_itemlist(html):
    """Kategori sayfasindaki JSON-LD ItemList'ten Product listesi cikarir."""
    for block in re.findall(
        r"<script[^>]*application/ld\+json[^>]*>(.+?)</script>", html, re.S
    ):
        try:
            data = json.loads(block.strip(), strict=False)
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict) and data.get("@type") == "ItemList":
            return [
                el["item"]
                for el in data.get("itemListElement", [])
                if isinstance(el, dict) and isinstance(el.get("item"), dict)
            ]
    return []


def process_product(item, category):
    offers = item.get("offers", {})
    if isinstance(offers, list):
        offers = offers[0] if offers else {}

    price = None
    raw_price = str(offers.get("price", "")).strip()
    if raw_price:
        try:
            price = round(float(raw_price), 2)
        except ValueError:
            price = None

    availability = str(offers.get("availability", "")).lower()
    available = "outofstock" not in availability and "soldout" not in availability

    brand = item.get("brand")
    if isinstance(brand, dict):
        brand = brand.get("name", "")

    images = item.get("image", [])
    if isinstance(images, str):
        images = [images]
    images = [i for i in images if isinstance(i, str) and i.startswith("http")]

    url = item.get("url", "")

    return {
        "name": unescape(str(item.get("name", ""))).strip(),
        "slug": slug_from_url(url),
        "url": url,
        "category": category,
        "parent_category": "Protein Tozu",
        "vendor": brand or "",
        "product_type": item.get("category", category),
        "description_html": "",
        "description_text": unescape(str(item.get("description", ""))).strip(),
        "original_price": price,
        "discounted_price": None,
        "discount_rate": None,
        "sku": str(item.get("sku") or "").strip(),
        "barcode": "",
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
    categories = sys.argv[1:] or DEFAULT_CATEGORIES
    print(f"protein7.com scraper — kategoriler: {', '.join(categories)}")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)

    products = {}
    for category in categories:
        url = f"{BASE_URL}/{category}"
        print(f"  {category} ...")
        try:
            resp = session.get(url, timeout=25)
            resp.raise_for_status()
        except Exception as exc:  # noqa: BLE001
            print(f"    HATA: {exc}")
            continue

        items = parse_itemlist(resp.text)
        print(f"    {len(items)} urun (JSON-LD ItemList)")
        for item in items:
            product = process_product(item, category)
            if product["slug"] and product["original_price"]:
                products[product["slug"]] = product
        time.sleep(0.5)

    result = list(products.values())
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in result if p["available"])
    print(f"\nTamamlandi! {len(result)} urun ({in_stock} stokta) -> {OUTPUT_FILE}")
    if not result:
        sys.exit(1)


if __name__ == "__main__":
    main()
