"""
EYB.com.tr Urun Scraper (T-Soft)
-------------------------------------------------
Eyuboglu Celik (eyb.com.tr) bir T-Soft magazasidir ve Victorinox'un Turkiye
resmi distributorudur. T-Soft urun sayfalari temiz bir JSON-LD `Product`
blogu gomar (name, image[], description, sku, brand, offers.price/currency/
availability) -> bu en saglam kaynaktir.

URL kesfi:
  - sitemap.xml tek dosyadir; urun, kategori ve sistem sayfalarini birlikte
    listeler. Sistem sayfalari (.xhtml/.htm/.php) elenir. Kalan slug'lar tek
    tek gezilir; sayfada gecerli bir JSON-LD `Product` blogu varsa urundur,
    yoksa (kategori / product.group) atlanir.

Cikti semasi everlast_scraper.py ile birebir aynidir.

Kullanim:
    python eyb_scraper.py              # tum katalog (fiyat/stok)
    python eyb_scraper.py --limit=8    # test: ilk 8 ADAY url'den gecerli urunler
    python eyb_scraper.py --images     # ilk import icin gorsellerle
Cikti: data/source-products/eyb_products.json
"""

import json
import re
import sys
import time

import requests
from bs4 import BeautifulSoup

from opencart_scraper import _clean_price, _jsonld_product
from shopify_scraper import (
    HEADERS,
    _download_image,
    make_slug,
    resolve_image_dir,
    resolve_output,
    resolve_relative_urls,
    strip_html,
)

BASE_URL = "https://www.eyb.com.tr"
SITEMAP_URL = "https://www.eyb.com.tr/sitemap.xml"
VENDOR = "Eyüboğlu Çelik"
DEFAULT_CATEGORY = "Çakı & Outdoor"

# Urun olmayan URL'ler: T-Soft sistem sayfalari .xhtml/.htm/.php uzantili,
# bir de anasayfa. Geri kalan slug'lar urun ADAYIDIR (kategoriler dahil;
# kategoriler JSON-LD `Product` bulunmadigi icin gezme sirasinda elenir).
NON_PRODUCT_RE = re.compile(r"(\.xhtml|\.htm|\.php)(\?|$)|eyb\.com\.tr/?$", re.I)


def _discover_urls(session):
    """sitemap.xml'den urun ADAY URL'lerini toplar (tekil, sirali)."""
    try:
        resp = session.get(SITEMAP_URL, timeout=120)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"  Sitemap HATASI: {exc}")
        return []
    locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", resp.text)
    urls = [u.strip() for u in locs if not NON_PRODUCT_RE.search(u.strip())]
    return list(dict.fromkeys(urls))


def _offer(jsonld):
    offers = (jsonld or {}).get("offers")
    if isinstance(offers, list):
        return offers[0] if offers else {}
    if isinstance(offers, dict):
        return offers
    return {}


def _images_from_jsonld(value):
    if not value:
        return []
    if isinstance(value, str):
        return [value]
    out = []
    for v in value if isinstance(value, list) else [value]:
        if isinstance(v, str):
            out.append(v)
        elif isinstance(v, dict) and v.get("url"):
            out.append(v["url"])
    return out


def _parse_product(session, url):
    """Sayfa bir T-Soft urun sayfasiysa urun dict'i, degilse None."""
    try:
        resp = session.get(url, timeout=25)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"    HATA {url}: {exc}")
        return None

    html = resp.text
    jsonld = _jsonld_product(html)
    if not jsonld:
        # Kategori / product.group / sistem sayfasi -> urun degil.
        return None

    soup = BeautifulSoup(html, "html.parser")
    offer = _offer(jsonld)

    name = (jsonld.get("name") or "").strip()
    if not name:
        h1 = soup.select_one("h1")
        name = h1.get_text(strip=True) if h1 else ""
    # T-Soft JSON-LD adina bazen gorunmez karakterler (ZWSP, NBSP) sizdirir.
    name = name.replace("​", "").replace(" ", " ").strip()
    if not name:
        return None

    price = _clean_price(offer.get("price") or offer.get("lowPrice"))
    if not price:
        return None
    # T-Soft JSON-LD'sinde liste/indirim fiyati ayrimi yok; offer.price satis
    # fiyatidir -> original_price olarak alinir, indirim None.
    original_price = price
    discounted_price = None

    avail = str(offer.get("availability") or "").lower().replace("/", "")
    in_stock = "instock" in avail or avail == ""

    sku = str(jsonld.get("sku") or jsonld.get("mpn") or "").strip()

    images = _images_from_jsonld(jsonld.get("image"))
    if not images:
        og = soup.select_one('meta[property="og:image"]')
        if og and (og.get("content") or "").startswith("http"):
            images.append(og["content"].strip())

    desc_html = jsonld.get("description") or ""
    desc_el = soup.select_one("#tab-description, #productDescription, "
                              ".product-description, #urun_aciklama")
    if desc_el:
        desc_html = str(desc_el)
    desc_html = resolve_relative_urls(desc_html, url)

    brand = jsonld.get("brand")
    if isinstance(brand, dict):
        brand = brand.get("name", "")

    category = jsonld.get("category") or DEFAULT_CATEGORY
    # JSON-LD'de kategori "Hobi > Celestron > Astronomi" gibi gelir -> son
    # parcayi kategori, sondan ikinciyi parent yap.
    parent_category = None
    if isinstance(category, str) and ">" in category:
        parts = [p.strip() for p in category.split(">") if p.strip()]
        if len(parts) >= 2:
            parent_category = parts[-2]
        category = parts[-1] if parts else DEFAULT_CATEGORY

    slug_match = re.search(r"/([^/?#]+?)(?:[?#].*)?$", url)
    slug = slug_match.group(1) if slug_match else make_slug(name)

    return {
        "name": name,
        "slug": slug,
        "url": url,
        "category": category or DEFAULT_CATEGORY,
        "parent_category": parent_category,
        "vendor": brand or VENDOR,
        "product_type": "",
        "description_html": desc_html,
        "description_text": strip_html(desc_html),
        "original_price": original_price,
        "discounted_price": discounted_price,
        "discount_rate": None,
        "sku": sku,
        "barcode": "",
        "available": in_stock,
        "specifications": [],
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else "",
        "variants": [{
            "title": "Default Title",
            "sku": sku,
            "barcode": "",
            "price": original_price,
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
    limit = None
    with_images = "--images" in sys.argv
    for arg in sys.argv[1:]:
        if arg.startswith("--limit="):
            limit = int(arg.split("=", 1)[1])

    output_file = resolve_output("eyb_products.json")
    image_dir = resolve_image_dir("eyb_images")

    print(f"EYB (T-Soft) scraper: {BASE_URL}")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)

    print(f"  Sitemap: {SITEMAP_URL}")
    urls = _discover_urls(session)
    print(f"  {len(urls)} urun ADAY URL'i bulundu.")
    if limit:
        urls = urls[:limit]
        print(f"  (TEST limiti: ilk {len(urls)} aday)")
    if not urls:
        print("HATA: aday URL bulunamadi.")
        raise SystemExit(1)

    products = []
    not_product = 0
    for i, url in enumerate(urls, 1):
        if i == 1 or i % 50 == 0:
            print(f"  [{i}/{len(urls)}] ... ({len(products)} urun)")
        prod = _parse_product(session, url)
        if prod:
            products.append(prod)
        else:
            not_product += 1
        time.sleep(0.5)

    if with_images:
        print("\nGorseller indiriliyor...")
        for prod in products:
            downloaded = []
            for img_url in prod.get("all_image_urls", []):
                local = _download_image(session, img_url, image_dir, prod["slug"][:60])
                if local:
                    downloaded.append({"remote_url": img_url, "local_path": local})
            prod["downloaded_images"] = downloaded

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p.get("available"))
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta, "
          f"{not_product} urun-disi atlandi) -> {output_file}")
    return products


if __name__ == "__main__":
    main()
