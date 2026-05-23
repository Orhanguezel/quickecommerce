"""
ceysport.com Urun Scraper (WooCommerce - HTML scrape)
-------------------------------------------------
ceysport.com WooCommerce (WoodMart temasi) ile calisir; ancak `/wp-json`
Store API'si WAF arkasinda 403 doner -> HTML scrape gerekir.

Akis:
  1. WooCommerce urun sitemap'leri (product-sitemap1..N.xml) ile URL kesfi
  2. Her urun sayfasi: ad/sku/gorsel/kategori JSON-LD `Product`'tan,
     fiyat/stok WooCommerce HTML markup'indan (.price ins/del, p.stock)

JSON-LD `Product` semasinda `offers` (fiyat) YOK -> fiyat HTML'den okunur.
"FIYAT SORUNUZ" gibi fiyatsiz urunler atlanir (original_price None).

Kullanim:
    python ceysport_scraper.py               # tum katalog (fiyat/stok)
    python ceysport_scraper.py --limit=8      # test: ilk 8 urun
    python ceysport_scraper.py --images       # ilk import icin gorsellerle
Cikti: ceysport_products.json (repo'da data/source-products/ altina)
"""

import json
import re
import sys
import time
from html import unescape

import requests
from bs4 import BeautifulSoup

from shopify_scraper import (
    _download_image,
    make_slug,
    resolve_image_dir,
    resolve_output,
    strip_html,
)

BASE_URL = "https://ceysport.com"
SITEMAP_INDEX = "https://ceysport.com/sitemap_index.xml"
VENDOR = "CEYSPORT"
DEFAULT_CATEGORY = "Spor Aletleri"

# Gercekci tarayici User-Agent'i (WAF / anti-bot tetiklememek icin).
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,*/*;q=0.8"
    ),
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
}


def _clean_price(text):
    """'6.720,00₺' -> 6720.0. Gecersiz/sifir/bos -> None."""
    if text is None:
        return None
    t = re.sub(r"[^\d.,]", "", str(text))
    if not t:
        return None
    if "," in t and "." in t:
        t = t.replace(".", "").replace(",", ".")
    elif "," in t:
        t = t.replace(",", ".")
    try:
        val = float(t)
        return round(val, 2) if val > 0 else None
    except ValueError:
        return None


def _discover_urls(session):
    """sitemap_index.xml -> product-sitemap*.xml -> /urun/ URL'leri (tekil)."""
    try:
        resp = session.get(SITEMAP_INDEX, timeout=60)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"  Sitemap index HATASI: {exc}")
        return []

    product_maps = re.findall(
        r"<loc>\s*(https://ceysport\.com/product-sitemap\d+\.xml)\s*</loc>",
        resp.text,
    )
    urls = []
    for sm in product_maps:
        try:
            r = session.get(sm, timeout=60)
            r.raise_for_status()
        except Exception as exc:  # noqa: BLE001
            print(f"    {sm} HATASI: {exc}")
            continue
        locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", r.text)
        # Yalniz urun URL'leri (/urun/...) -> /magaza/ vb. elenir.
        urls.extend(loc.strip() for loc in locs if "/urun/" in loc)
        time.sleep(0.3)
    return list(dict.fromkeys(urls))


def _jsonld_product(html):
    """JSON-LD `@graph` icindeki ilk `Product` nesnesini dondurur."""
    for block in re.findall(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.S | re.I,
    ):
        try:
            data = json.loads(block.strip())
        except ValueError:
            continue
        candidates = data if isinstance(data, list) else [data]
        for item in list(candidates):
            if isinstance(item, dict) and isinstance(item.get("@graph"), list):
                candidates.extend(item["@graph"])
        for item in candidates:
            if isinstance(item, dict):
                t = item.get("@type")
                if t == "Product" or (isinstance(t, list) and "Product" in t):
                    return item
    return None


def _images_from_jsonld(value):
    """JSON-LD `image` -> URL string listesi."""
    if not value:
        return []
    out = []
    items = value if isinstance(value, list) else [value]
    for v in items:
        if isinstance(v, str) and v.startswith("http"):
            out.append(v)
        elif isinstance(v, dict) and str(v.get("url", "")).startswith("http"):
            out.append(v["url"])
    return out


def _main_price_el(soup):
    """Urun ozet alanindaki .price elementi (prev/next nav fiyatlari elenir)."""
    for p in soup.select(".price"):
        if p.find_parent(class_="wd-product-nav-desc"):
            continue
        return p
    return None


def _parse_prices(soup):
    """WooCommerce fiyat markup'i -> (original_price, discounted_price)."""
    price_el = _main_price_el(soup)
    if price_el is None:
        return None, None
    ins = price_el.select_one("ins .woocommerce-Price-amount, ins bdi")
    dele = price_el.select_one("del .woocommerce-Price-amount, del bdi")
    sale = _clean_price(ins.get_text()) if ins else None
    orig = _clean_price(dele.get_text()) if dele else None
    if sale and orig and orig > sale:
        return orig, sale
    # Indirim yok -> ilk gecerli fiyat.
    plain = price_el.select_one(".woocommerce-Price-amount, bdi")
    return (_clean_price(plain.get_text()) if plain else None), None


def _parse_stock(soup):
    """p.stock class'indan stok durumu (out-of-stock -> False)."""
    st = soup.select_one("p.stock, .summary .stock")
    if st is None:
        # Stok bilgisi yoksa varsayilan stokta (WooCommerce stok takibi kapali).
        return True
    classes = st.get("class") or []
    if "out-of-stock" in classes:
        return False
    return True


def _parse_product(session, url):
    try:
        resp = session.get(url, timeout=30)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"    HATA {url}: {exc}")
        return None

    html = resp.text
    soup = BeautifulSoup(html, "html.parser")
    jsonld = _jsonld_product(html) or {}

    name = (jsonld.get("name") or "").strip()
    if not name:
        h1 = soup.select_one("h1.product_title, h1.entry-title, .product_title")
        name = h1.get_text(strip=True) if h1 else ""
    # JSON-LD ad'i HTML entity (&amp; vb.) icerebilir + " - CEYSPORT" suffix'i.
    name = unescape(name)
    name = re.sub(r"\s*[-–]\s*CEYSPORT\s*$", "", name, flags=re.I).strip()
    if not name:
        return None

    original_price, discounted_price = _parse_prices(soup)
    in_stock = _parse_stock(soup)

    sku = str(jsonld.get("sku") or "").strip()
    if not sku:
        sku_el = soup.select_one(".sku_wrapper .sku, .sku")
        sku = sku_el.get_text(strip=True) if sku_el else ""

    # Gorseller: JSON-LD `image` + WooCommerce galeri (data-large_image).
    images = _images_from_jsonld(jsonld.get("image"))
    for img in soup.select(
        ".woocommerce-product-gallery__image img, "
        "figure.woocommerce-product-gallery__wrapper img"
    ):
        src = img.get("data-large_image") or img.get("src") or ""
        if src.startswith("http") and src not in images:
            images.append(src)
    for a in soup.select(".woocommerce-product-gallery__image a"):
        href = (a.get("href") or "").strip()
        if href.startswith("http") and href not in images:
            images.append(href)
    if not images:
        og = soup.select_one('meta[property="og:image"]')
        if og and str(og.get("content", "")).startswith("http"):
            images.append(og["content"].strip())

    # Aciklama: JSON-LD description, yoksa meta description.
    desc_html = jsonld.get("description") or ""
    if not desc_html:
        md = soup.select_one('meta[name="description"]')
        desc_html = md.get("content", "") if md else ""

    # Kategori: JSON-LD `category`, yoksa breadcrumb son adimi.
    category = (jsonld.get("category") or "").strip()
    if not category:
        crumbs = soup.select(".woocommerce-breadcrumb a, nav.woocommerce-breadcrumb a")
        if len(crumbs) > 1:
            category = crumbs[-1].get_text(strip=True)
    if not category or category == "Tüm Ürünler":
        category = DEFAULT_CATEGORY

    slug_match = re.search(r"/urun/([^/?#]+)/?", url)
    slug = slug_match.group(1) if slug_match else make_slug(name)

    # Varyantsiz urun -> tek "Default Title" varyant (Shopify uyumu).
    current_price = discounted_price if discounted_price is not None else original_price
    return {
        "name": name,
        "slug": slug,
        "url": url,
        "category": category,
        "parent_category": None,
        "vendor": VENDOR,
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
        "variants": [
            {
                "title": "Default Title",
                "sku": sku,
                "barcode": "",
                "price": current_price,
                "compare_at_price": (
                    original_price if discounted_price is not None else None
                ),
                "available": in_stock,
                "option1": None,
                "option2": None,
                "option3": None,
            }
        ],
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

    output_file = resolve_output("ceysport_products.json")
    image_dir = resolve_image_dir("ceysport_images")

    print(f"ceysport.com scraper (WooCommerce HTML): {BASE_URL}")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)

    print(f"  Sitemap: {SITEMAP_INDEX}")
    urls = _discover_urls(session)
    print(f"  {len(urls)} urun URL'i bulundu.")
    if limit:
        urls = urls[:limit]
        print(f"  (TEST limiti: ilk {len(urls)})")
    if not urls:
        print("HATA: urun URL'i bulunamadi (WAF/sitemap erisimi?).")
        sys.exit(1)

    products = []
    skipped = 0
    for i, url in enumerate(urls, 1):
        if i == 1 or i % 25 == 0:
            print(f"  [{i}/{len(urls)}] ...")
        prod = _parse_product(session, url)
        if prod and prod["original_price"]:
            products.append(prod)
        else:
            skipped += 1
        time.sleep(0.6)

    if with_images and image_dir:
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
    print(
        f"\nTamamlandi! {len(products)} urun ({in_stock} stokta, {skipped} atlandi)"
        f" -> {output_file}"
    )
    if not products:
        sys.exit(1)


if __name__ == "__main__":
    main()
