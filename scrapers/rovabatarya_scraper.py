"""
Rovabatarya.com Urun Scraper (OpenCart)
-------------------------------------------------
Rova bir OpenCart magazasidir, ancak urun sayfalarindaki JSON-LD `Product`
blogu BOZUK uretilir (trailing virgul + Twig kalintisi `%}`). Bu yuzden
generic opencart_scraper.py wrapper'i KULLANILAMAZ; bunun yerine OpenCart
HTML markup'i dogrudan okunur:
  - fiyat   -> <h2 class="price">2.227,30₺</h2>
  - indirim -> .price-old (varsa)
  - stok    -> #button-cart uzerindeki `disabled` attribute / "Tukendi" metni
  - sku     -> "Urun Kodu:" liste maddesi
opencart_scraper.py'deki paylasilan yardimcilar (sitemap kesfi, fiyat
temizleme, JSON-LD okuma) yeniden kullanilir.

Kullanim:
    python rovabatarya_scraper.py              # tum katalog (fiyat/stok)
    python rovabatarya_scraper.py --limit=8    # test: ilk 8 urun
    python rovabatarya_scraper.py --images     # ilk import icin gorsellerle
Cikti: data/source-products/rovabatarya_products.json
"""

import json
import re
import sys
import time

import requests
from bs4 import BeautifulSoup

from opencart_scraper import (
    _clean_price,
    _discover_urls,
    _jsonld_product,
)
from shopify_scraper import (
    HEADERS,
    _download_image,
    make_slug,
    resolve_image_dir,
    resolve_output,
    strip_html,
)

BASE_URL = "https://www.rovabatarya.com"
SITEMAP_URL = "https://www.rovabatarya.com/sitemap.xml"
VENDOR = "Rova"
DEFAULT_CATEGORY = "Telefon Bataryasi & Aksesuar"

# Sitemap'te urun olmayan URL'ler (anasayfa, kategori feed'i vb.) elenir.
NON_PRODUCT_RE = re.compile(r"(index\.php|/$)", re.I)


def _stock_from_html(soup):
    """OpenCart sepet butonundan stok durumunu cikarir.

    Stok yoksa `#button-cart` `disabled` olur ve metni "Tukendi" gosterir.
    """
    btn = soup.select_one("#button-cart")
    if btn is not None:
        if btn.has_attr("disabled"):
            return False
        if "tükendi" in btn.get_text(strip=True).lower():
            return False
        return True
    # Buton bulunamadi -> JSON-LD'ye birakilir (cagiran tarafta None doner).
    return None


def _price_from_html(soup):
    """(original_price, discounted_price) dondurur.

    Rova ana fiyati <h2 class="price"> icinde; indirim varsa .price-old eski
    fiyati tasir.
    """
    new_el = soup.select_one("h2.price, .price-new, .product-price-new")
    old_el = soup.select_one(".price-old, .product-price-old")
    new_p = _clean_price(new_el.get_text()) if new_el else None
    old_p = _clean_price(old_el.get_text()) if old_el else None
    if new_p and old_p and old_p > new_p:
        return old_p, new_p
    if new_p:
        return new_p, None
    return None, None


def _sku_from_html(soup):
    """"Urun Kodu: XXX" liste maddesinden SKU okur."""
    for li in soup.select("li"):
        text = li.get_text(" ", strip=True)
        m = re.match(r"(?:Ürün Kodu|Stok Kodu|Model)\s*[:：]\s*(.+)", text, re.I)
        if m:
            return m.group(1).strip()[:64]
    return ""


def _images_from_html(soup):
    images = []
    # Ana gorsel + galeri thumbnail'lari.
    for sel in (".thumbnails a", ".image-additional a", "a.thumbnail",
                ".product-image a", "a[data-fancybox]", ".magnific-popup"):
        for a in soup.select(sel):
            href = (a.get("href") or "").strip()
            if href.startswith("http") and href not in images:
                images.append(href)
    main = soup.select_one(".product-image img, #image, .main-image img")
    if main:
        src = (main.get("src") or main.get("data-src") or "").strip()
        if src.startswith("http") and src not in images:
            images.insert(0, src)
    if not images:
        og = soup.select_one('meta[property="og:image"]')
        if og and (og.get("content") or "").startswith("http"):
            images.append(og["content"].strip())
    return images


def _category_from_html(html):
    """Rova breadcrumb does not include category; GA4 item_category does."""
    m = re.search(r'"item_category"\s*:\s*"([^"]+)"', html)
    if m and m.group(1).strip():
        return m.group(1).strip()
    return DEFAULT_CATEGORY


def _parse_product(session, url):
    try:
        resp = session.get(url, timeout=25)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"    HATA {url}: {exc}")
        return None

    html = resp.text
    soup = BeautifulSoup(html, "html.parser")
    # JSON-LD bozuk olabilir; basariyla parse olursa yedek kaynak olur.
    jsonld = _jsonld_product(html) or {}

    h1 = soup.select_one("h1")
    name = (h1.get_text(strip=True) if h1 else "") or (jsonld.get("name") or "")
    name = name.strip()
    if not name:
        return None

    original_price, discounted_price = _price_from_html(soup)
    if original_price is None:
        # JSON-LD bozuksa bile bazen offer.price kurtarilabilir.
        offers = jsonld.get("offers") or {}
        if isinstance(offers, list):
            offers = offers[0] if offers else {}
        original_price = _clean_price(offers.get("price"))
        discounted_price = None
    if not original_price:
        return None

    in_stock = _stock_from_html(soup)
    if in_stock is None:
        avail = str((jsonld.get("offers") or {}).get("availability") or "").lower()
        in_stock = "instock" in avail.replace("/", "")

    sku = _sku_from_html(soup)

    images = _images_from_html(soup)

    desc_el = soup.select_one("#tab-description, #product-description")
    desc_html = str(desc_el) if desc_el else (jsonld.get("description") or "")

    # Ozellikler tablosu (#tab-specification).
    specifications = []
    for row in soup.select("#tab-specification tr"):
        cells = row.select("td")
        if len(cells) >= 2:
            key = cells[0].get_text(strip=True)
            val = cells[1].get_text(strip=True)
            if key:
                specifications.append({"name": key, "value": val})

    brand = VENDOR
    jl_brand = jsonld.get("brand")
    if isinstance(jl_brand, dict) and jl_brand.get("name"):
        brand = jl_brand["name"]

    slug_match = re.search(r"/([^/?#]+?)(?:\.html)?(?:[?#].*)?$", url)
    slug = slug_match.group(1) if slug_match else make_slug(name)

    price = original_price if discounted_price is None else discounted_price
    category = _category_from_html(html)

    return {
        "name": name,
        "slug": slug,
        "url": url,
        "category": category,
        "parent_category": None,
        "vendor": brand,
        "product_type": "",
        "description_html": desc_html,
        "description_text": strip_html(desc_html),
        "original_price": original_price,
        "discounted_price": discounted_price,
        "discount_rate": None,
        "sku": sku,
        "barcode": "",
        "available": in_stock,
        "specifications": specifications,
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else "",
        "variants": [{
            "title": "Default Title",
            "sku": sku,
            "barcode": "",
            "price": price,
            "compare_at_price": original_price if discounted_price is not None else None,
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

    output_file = resolve_output("rovabatarya_products.json")
    image_dir = resolve_image_dir("rovabatarya_images")

    print(f"Rovabatarya scraper: {BASE_URL}")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)

    print(f"  Sitemap: {SITEMAP_URL}")
    urls = _discover_urls(session, SITEMAP_URL)
    urls = [u for u in urls if not NON_PRODUCT_RE.search(u)]
    print(f"  {len(urls)} urun URL'i bulundu.")
    if limit:
        urls = urls[:limit]
        print(f"  (TEST limiti: ilk {len(urls)})")
    if not urls:
        print("HATA: urun URL'i bulunamadi.")
        raise SystemExit(1)

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
        time.sleep(0.6)

    if with_images:
        print("\nGorseller indiriliyor...")
        for i, prod in enumerate(products, 1):
            downloaded = []
            for img_url in prod.get("all_image_urls", []):
                local = _download_image(session, img_url, image_dir, prod["slug"][:60])
                if local:
                    downloaded.append({"remote_url": img_url, "local_path": local})
            prod["downloaded_images"] = downloaded

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p.get("available"))
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta, {skipped} atlandi)"
          f" -> {output_file}")
    return products


if __name__ == "__main__":
    main()
