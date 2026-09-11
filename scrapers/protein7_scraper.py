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
from urllib.parse import urlencode

import requests

from shopify_scraper import resolve_output

BASE_URL = "https://protein7.com"
OUTPUT_FILE = resolve_output("protein7_products.json")
DEFAULT_CATEGORIES = ["whey-protein"]
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html",
}


def _fetch_detail_description(html):
    """Detail page JSON-LD Product schema'sindan description doner."""
    import json as _json
    for m in re.finditer(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.S | re.I):
        try:
            data = _json.loads(m.group(1).strip())
        except Exception:
            continue
        candidates = data if isinstance(data, list) else [data]
        for d in candidates:
            if not isinstance(d, dict):
                continue
            t = d.get("@type", "")
            if "Product" in str(t):
                desc = unescape(str(d.get("description") or "")).strip()
                if desc:
                    return desc
    return ""


def _fetch_aciklama_images(html):
    """Protein7'de bazi urunlerde yazili description yerine `aciklama-*.png`
    resimleri kullanir. B (buyuk) boyut secilir, <img> tag'i ile HTML doner.

    Pattern: .../{slug}-urunaciklama-{brand}-{cat}-{nnn}-{kk}-{B/K/O}.png
    """
    urls = re.findall(
        r'https?://[^"\'\s>]+?urunaciklama[^"\'\s>]*-B\.(?:png|jpg|jpeg|webp)',
        html, re.I,
    )
    # Tekrarlari at, sirayi koru
    seen = []
    for u in urls:
        if u not in seen:
            seen.append(u)
    if not seen:
        return ""
    imgs = "\n".join(f'<p><img src="{u}" alt="Ürün açıklaması" style="max-width:100%;height:auto" /></p>' for u in seen)
    return imgs


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

    # T-Soft gecisi (2026-08): kategori urunleri artik JSON-LD ItemList yerine
    # PRODUCT_DATA.push(JSON.parse('...')) bloklariyla sayfaya gomuluyor.
    items = []
    pattern = r"PRODUCT_DATA\.push\(JSON\.parse\('((?:\\.|[^'])*)'\)\);"
    for match in re.finditer(pattern, html, re.S):
        try:
            # Ilk decode JavaScript string katmanini, ikincisi urun JSON'unu acar.
            encoded = json.loads('"' + match.group(1) + '"')
            product = json.loads(encoded)
        except (json.JSONDecodeError, TypeError):
            continue

        raw_url = str(product.get("url") or "")
        url = raw_url if raw_url.startswith("http") else f"{BASE_URL}/{raw_url.lstrip('/')}"
        image = str(product.get("image") or "")
        items.append({
            "name": product.get("name", ""),
            "sku": product.get("code", ""),
            "url": url,
            "category": product.get("category", ""),
            "brand": {"name": product.get("brand", "")},
            "image": [image] if image else [],
            "offers": {
                "price": product.get("total_sale_price") or product.get("total_price"),
                "availability": "https://schema.org/InStock"
                if product.get("available") and float(product.get("quantity") or 0) > 0
                else "https://schema.org/OutOfStock",
            },
        })
    if items:
        return items
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
        items = []
        for attempt in range(3):
            try:
                # T-Soft/CDN occasionally serves the shell before PRODUCT_DATA.
                # A cache-busting query and retry prevents a false empty run.
                request_url = f"{url}?{urlencode({'scrape_refresh': int(time.time())})}"
                resp = session.get(request_url, timeout=25)
                resp.raise_for_status()
                items = parse_itemlist(resp.text)
                if items:
                    break
            except Exception as exc:  # noqa: BLE001
                print(f"    deneme {attempt + 1}/3 HATA: {exc}")
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
        print(f"    {len(items)} urun (JSON-LD ItemList)")
        for item in items:
            product = process_product(item, category)
            if product["slug"] and product["original_price"]:
                # 2026-06-05: ItemList JSON-LD'sinde description bos geliyor;
                # detail page JSON-LD Product'inda dolu (xpro/optimum vakasi).
                # Her urun icin detay sayfasi fetch + JSON-LD description al.
                if product.get("url"):
                    try:
                        detail = session.get(product["url"], timeout=15)
                        if detail.ok:
                            detail_desc = _fetch_detail_description(detail.text)
                            if detail_desc:
                                product["description_text"] = detail_desc
                                product["description_html"] = detail_desc
                            else:
                                # 2026-06-05: bazi protein7 urunlerinde yazili
                                # desc yerine "aciklama-*.png" resimleri var
                                img_html = _fetch_aciklama_images(detail.text)
                                if img_html:
                                    product["description_html"] = img_html
                                    product["description_text"] = "Ürün açıklaması görseli sağlanmıştır"
                    except Exception:
                        pass
                products[product["slug"]] = product
                time.sleep(0.3)
        time.sleep(0.5)

    result = list(products.values())
    if not result:
        # Son bilinen saglam JSON'u koru. run-all exit kodundan bu run'i fail
        # sayar ve DB senkronunu atlar; bos dosya ile kanit yok edilmez.
        print("\nHATA: hic urun ayrıştırılamadı; mevcut JSON korunuyor.", file=sys.stderr)
        sys.exit(1)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in result if p["available"])
    print(f"\nTamamlandi! {len(result)} urun ({in_stock} stokta) -> {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
