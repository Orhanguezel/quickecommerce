"""
Dropick.com.tr Urun Scraper (OpenCart - sitemap + JSON-LD)
-------------------------------------------------
Dropick Shopify degil; urunler `/sitemap_productlist.xml` ile kesfedilir,
her urun sayfasindaki JSON-LD (`@type=Product`) + HTML price-old/price-new
ile fiyat/stok cikarilir.

Kullanim: python dropick_scraper.py
Cikti: dropick_products.json (repo'da data/source-products/ altina)
"""

import json
import re
import sys
import time
from html import unescape

import requests

from shopify_scraper import resolve_output, resolve_relative_urls

BASE_URL = "https://www.dropick.com.tr"
SITEMAP = f"{BASE_URL}/sitemap_productlist.xml"
OUTPUT_FILE = resolve_output("dropick_products.json")
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def strip_html(html_str):
    if not html_str:
        return ""
    text = re.sub(r"<[^>]+>", "", html_str)
    return re.sub(r"\s+", " ", unescape(text)).strip()


def parse_tr_price(text):
    """'9.200,00 TL' -> 9200.0 ; bos/gecersiz -> None."""
    if not text:
        return None
    m = re.search(r"[\d.,]+", text)
    if not m:
        return None
    raw = m.group(0).replace(".", "").replace(",", ".")
    try:
        return float(raw)
    except ValueError:
        return None


def fetch_product_urls(session):
    resp = session.get(SITEMAP, timeout=20)
    resp.raise_for_status()
    return re.findall(r"<loc>([^<]+)</loc>", resp.text)


def extract_jsonld_product(html):
    """JSON-LD bloklarindan @type=Product olani dondurur (anahtarlar strip'li)."""
    for block in re.findall(
        r"<script[^>]*application/ld\+json[^>]*>(.+?)</script>", html, re.S
    ):
        try:
            data = json.loads(block.strip(), strict=False)
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict) and data.get("@type") == "Product":
            return {k.strip(): v for k, v in data.items()}
    return None


class ProductRemoved(Exception):
    """Sitemap'te olan ama katalogdan kaldirilmis urun."""


def parse_product(url, html):
    ld = extract_jsonld_product(html)
    if not ld:
        if "Ürün bulunamadı" in html or "Urun bulunamadi" in html:
            raise ProductRemoved
        return None

    name = unescape(str(ld.get("name", ""))).strip()
    if not name:
        return None

    offers = ld.get("offers", {})
    if isinstance(offers, list):
        offers = offers[0] if offers else {}
    availability = str(offers.get("availability", "")).lower()
    available = "outofstock" not in availability and "soldout" not in availability

    # Fiyat: sayfadaki ilk price-old/price-new ana urune aittir.
    old_match = re.search(r'class="price-old"[^>]*>([^<]+)<', html)
    new_match = re.search(r'class="price-new"[^>]*>([^<]+)<', html)
    price_old = parse_tr_price(old_match.group(1)) if old_match else None
    price_new = parse_tr_price(new_match.group(1)) if new_match else None
    ld_price = parse_tr_price(str(offers.get("price", "")))

    if price_old and price_new and price_old > price_new:
        original_price, discounted_price = price_old, price_new
    else:
        original_price = price_new or ld_price or price_old
        discounted_price = None

    discount_rate = None
    if original_price and discounted_price and original_price > 0:
        discount_rate = round((1 - discounted_price / original_price) * 100, 1)

    brand = ld.get("brand")
    if isinstance(brand, dict):
        brand = brand.get("name", "")

    images = ld.get("image", [])
    if isinstance(images, str):
        images = [images]
    images = [i for i in images if isinstance(i, str) and i.startswith("http")]

    # JSON-LD gorseli urun klasorunu verir -> ayni klasordeki tum gorselleri al.
    if images:
        folder = images[0].rsplit("/", 1)[0]
        esc = re.escape(folder)
        extra = re.findall(rf'{esc}/[^\s"\'<>]+\.(?:jpg|jpeg|png|webp)', html, re.I)
        for img in extra:
            if img not in images:
                images.append(img)

    breadcrumb = re.findall(r'itemprop="name"[^>]*>([^<]+)<', html)
    category = unescape(breadcrumb[-2].strip()) if len(breadcrumb) >= 2 else "Pickleball"
    parent_category = unescape(breadcrumb[0].strip()) if breadcrumb else None

    slug = url.rstrip("/").rsplit("/", 1)[-1]
    description_html = resolve_relative_urls(str(ld.get("description", "")), url)
    description = strip_html(description_html)

    return {
        "name": name,
        "slug": slug,
        "url": url,
        "category": category,
        "parent_category": parent_category,
        "vendor": brand or "Dropick",
        "product_type": category,
        "description_html": description_html,
        "description_text": description,
        "original_price": original_price,
        "discounted_price": discounted_price,
        "discount_rate": discount_rate,
        "sku": str(ld.get("sku") or ld.get("mpn") or "").strip(),
        "barcode": str(ld.get("gtin13") or ld.get("gtin") or "").strip(),
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
    print(f"Dropick scraper: {BASE_URL}")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)

    urls = fetch_product_urls(session)
    print(f"Sitemap'ten {len(urls)} urun URL'si bulundu.\n")

    products = []
    removed = []
    failed = []
    for i, url in enumerate(urls, 1):
        try:
            resp = session.get(url, timeout=20)
            resp.raise_for_status()
            product = parse_product(url, resp.text)
        except ProductRemoved:
            removed.append(url)
            product = None
        except Exception as exc:  # noqa: BLE001
            product = None
            failed.append(url)
            print(f"  [{i}/{len(urls)}] HATA {url}: {exc}")
        if product:
            products.append(product)
            stok = "stokta" if product["available"] else "tukendi"
            print(f"  [{i}/{len(urls)}] {product['name'][:55]} - "
                  f"{product['original_price']} TL ({stok})")
        time.sleep(0.4)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p["available"])
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta) -> {OUTPUT_FILE}")
    print(f"Katalogdan kaldirilmis (sitemap'te kalan): {len(removed)}")
    if failed:
        print(f"GERCEK parse hatasi {len(failed)} URL:")
        for url in failed:
            print(f"  - {url}")
    if not products:
        sys.exit(1)


if __name__ == "__main__":
    main()
