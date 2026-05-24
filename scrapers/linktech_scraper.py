"""
LinkTech.com.tr Urun Scraper (Odoo e-Ticaret)
-------------------------------------------------
LinkTech bir Odoo magazasidir. Odoo urun sayfalari JSON-LD yerine schema.org
MIKRODATA (itemprop) kullanir:
  - fiyat   -> <span itemprop="price">1299.31...</span> (vergi dahil, ham)
  - indirim -> <span itemprop="listPrice"> ... </span>; indirim YOKSA bu eleman
               `d-none` sinifi tasir, VARSA gorunur ve eski fiyati gosterir.
  - stok    -> <div class="availability_messages">; bos ise stokta,
               icinde uyari metni varsa stok kisitli/yok.
  - sku     -> ozellik tablosunda "Internal Reference"
  - barcode -> ozellik tablosunda "Barcode"
  - kategori-> ozellik tablosunda "Website Product Category"
  - gorsel  -> /web/image/product.image/<id>/image_1024 (galeri)
               + /web/image/product.template/<id>/image_1024 (ana)

URL kesfi: sitemap.xml; urun URL'leri `/shop/<slug>` desenlidir.

Cikti semasi everlast_scraper.py ile birebir aynidir.

Kullanim:
    python linktech_scraper.py              # tum katalog (fiyat/stok)
    python linktech_scraper.py --limit=8    # test: ilk 8 urun
    python linktech_scraper.py --images     # ilk import icin gorsellerle
Cikti: data/source-products/linktech_products.json
"""

import json
import re
import sys
import time
from html import unescape
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from shopify_scraper import (
    HEADERS,
    _download_image,
    make_slug,
    resolve_image_dir,
    resolve_output,
    resolve_relative_urls,
    strip_html,
)

BASE_URL = "https://www.linktech.com.tr"
SITEMAP_URL = "https://www.linktech.com.tr/sitemap.xml"
VENDOR = "LinkTech"
DEFAULT_CATEGORY = "Bilgisayar & Elektronik Aksesuar"

# Odoo urun URL'leri /shop/ altinda.
PRODUCT_URL_RE = re.compile(r"/shop/[^/?#]+", re.I)


def _discover_urls(session):
    """sitemap.xml'den /shop/ urun URL'lerini toplar (tekil, sirali, https)."""
    try:
        resp = session.get(SITEMAP_URL, timeout=120)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"  Sitemap HATASI: {exc}")
        return []
    locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", resp.text)
    urls = []
    for loc in locs:
        loc = loc.strip()
        if not PRODUCT_URL_RE.search(loc):
            continue
        # Sitemap http:// verir; https://www.'a normalize et.
        loc = loc.replace("http://", "https://")
        if "://linktech" in loc and "www." not in loc:
            loc = loc.replace("://linktech", "://www.linktech")
        urls.append(loc)
    return list(dict.fromkeys(urls))


def _price_2dec(raw):
    """Odoo'nun ham ondalikli fiyatini 2 haneye yuvarlar."""
    if raw is None:
        return None
    try:
        val = float(str(raw).strip())
        return round(val, 2) if val > 0 else None
    except ValueError:
        return None


def _spec_value(soup, label):
    """Ozellik tablosunda <h6>label</h6> satirinin deger hucresini dondurur."""
    for h6 in soup.find_all("h6"):
        if h6.get_text(strip=True).lower() == label.lower():
            td = h6.find_parent("td")
            if td is None:
                continue
            row = td.find_parent("tr")
            if row is None:
                continue
            cells = row.find_all("td")
            if len(cells) >= 2:
                return cells[-1].get_text(strip=True)
    return ""


def _parse_product(session, url):
    try:
        resp = session.get(url, timeout=25)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"    HATA {url}: {exc}")
        return None

    html = resp.text
    soup = BeautifulSoup(html, "html.parser")

    # Isim: itemprop="name" tasiyan h1 (Odoo en dogru adi burada verir).
    name_el = soup.select_one('h1[itemprop="name"]') or soup.select_one("h1")
    name = name_el.get_text(strip=True) if name_el else ""
    if not name:
        return None

    # Fiyat: itemprop="price" ham deger; itemprop="listPrice" indirim varsa.
    price_el = soup.select_one('[itemprop="price"]')
    price = _price_2dec(price_el.get("content") or price_el.get_text()) if price_el else None
    if not price:
        return None

    original_price = price
    discounted_price = None
    list_el = soup.select_one('[itemprop="listPrice"]')
    if list_el is not None and "d-none" not in (list_el.get("class") or []):
        # Indirim aktif: listPrice eski fiyat, price guncel fiyat.
        list_text = list_el.get("content") or list_el.get_text()
        list_price = _price_2dec(re.sub(r"[^\d.]", "", str(list_text).replace(",", "")))
        if list_price and list_price > price:
            original_price = list_price
            discounted_price = price

    # Stok: availability_messages bos ise stokta.
    avail_el = soup.select_one(".availability_messages")
    if avail_el is not None:
        avail_text = avail_el.get_text(strip=True).lower()
        in_stock = avail_text == "" or "stokta" in avail_text or "in stock" in avail_text
        if any(k in avail_text for k in ("tükendi", "out of stock", "stokta yok")):
            in_stock = False
    else:
        in_stock = True

    sku = _spec_value(soup, "Internal Reference") or _spec_value(soup, "Dahili Referans")
    barcode = _spec_value(soup, "Barcode") or _spec_value(soup, "Barkod")
    category = (_spec_value(soup, "Website Product Category")
                or _spec_value(soup, "Web Sitesi Ürün Kategorisi")
                or DEFAULT_CATEGORY)

    # Gorseller: galeri (product.image) + ana (product.template), 1024 boyut.
    images = []
    for m in re.findall(r'/web/image/product\.image/\d+/image_1024[^"\'\s>]*', html):
        full = urljoin(BASE_URL, unescape(m))
        if full not in images:
            images.append(full)
    og = soup.select_one('meta[property="og:image"]')
    if og and (og.get("content") or "").startswith("http"):
        og_url = og["content"].strip()
        if og_url not in images:
            images.insert(0, og_url)

    desc_el = soup.select_one("#product_full_description")
    desc_html = str(desc_el) if desc_el else ""
    desc_html = resolve_relative_urls(desc_html, url)

    slug_match = re.search(r"/shop/([^/?#]+)", url)
    slug = slug_match.group(1) if slug_match else make_slug(name)

    final_price = original_price if discounted_price is None else discounted_price
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
        "barcode": barcode,
        "available": in_stock,
        "specifications": [],
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else "",
        "variants": [{
            "title": "Default Title",
            "sku": sku,
            "barcode": barcode,
            "price": final_price,
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

    output_file = resolve_output("linktech_products.json")
    image_dir = resolve_image_dir("linktech_images")

    print(f"LinkTech (Odoo) scraper: {BASE_URL}")
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
        raise SystemExit(1)

    products = []
    skipped = 0
    for i, url in enumerate(urls, 1):
        if i == 1 or i % 50 == 0:
            print(f"  [{i}/{len(urls)}] ...")
        prod = _parse_product(session, url)
        if prod:
            products.append(prod)
        else:
            skipped += 1
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
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta, {skipped} atlandi)"
          f" -> {output_file}")
    return products


if __name__ == "__main__":
    main()
