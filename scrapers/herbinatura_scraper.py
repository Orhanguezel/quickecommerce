"""
herbinatura.com Urun Scraper (IdeaSoft)
-------------------------------------------------
herbinatura.com IdeaSoft e-ticaret platformudur. Urun sayfalari JSON-LD
GOMMEZ; bunun yerine standart IdeaSoft schema.org *microdata*'sini kullanir:
  meta[itemprop=price] / meta[itemprop=priceCurrency]
  link[itemprop=availability]  (https://schema.org/InStock)
  meta[itemprop=Gtin13]        (barkod)
  span[itemprop=sku]
  [itemprop=brand] meta[itemprop=name]
Indirim icin `.product-price-new` / `.product-price-old` markup'i okunur.

Urun URL'leri IdeaSoft XML sitemap'inden kesfedilir:
  /sitemap.xml -> /xml/sitemap_product_*.xml -> /urun/<slug>

Cikti semasi everlast/shopify ciktisiyla birebir aynidir -> `sync:source-prices`
ve `import:products` degisiklik gerektirmeden calisir.

Kullanim:
    python herbinatura_scraper.py                 # fiyat/stok (hizli, gorselsiz)
    python herbinatura_scraper.py --limit 8       # test modu
    python herbinatura_scraper.py --images        # ilk import icin gorsellerle
Cikti: data/source-products/herbinatura_products.json
"""

import argparse
import re
import sys
import time

import requests
from bs4 import BeautifulSoup

from shopify_scraper import (
    _download_image,
    make_slug,
    resolve_image_dir,
    resolve_output,
    strip_html,
)

BASE_URL = "https://www.herbinatura.com"
DEFAULT_CATEGORY = "Takviye Edici Gıda"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
}


def _clean_price(text):
    """'1.234,56 TL' -> 1234.56. Gecersizse None."""
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


def _abs_url(url):
    """`//host/path` veya `/path` -> tam https URL."""
    if not url:
        return ""
    url = url.strip()
    if url.startswith("//"):
        return "https:" + url
    if url.startswith("/"):
        return BASE_URL + url
    return url


def _discover_urls(session):
    """IdeaSoft sitemap index -> urun alt sitemap'leri -> /urun/ URL'leri."""
    try:
        resp = session.get(f"{BASE_URL}/sitemap.xml", timeout=60)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"  Sitemap index HATASI: {exc}")
        return []

    sub = [
        loc.strip()
        for loc in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", resp.text)
        if "sitemap_product" in loc
    ]
    print(f"  {len(sub)} urun alt sitemap bulundu")

    urls = []
    for sm in sub:
        try:
            r = session.get(sm, timeout=60)
            r.raise_for_status()
        except Exception as exc:  # noqa: BLE001
            print(f"    alt sitemap atlandi: {sm} ({exc})")
            continue
        locs = [loc.strip() for loc in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", r.text)]
        product_locs = [u for u in locs if "/urun/" in u]
        urls.extend(product_locs)
        print(f"    {sm.split('/')[-1].split('?')[0]}: +{len(product_locs)} URL")
        time.sleep(0.3)

    return list(dict.fromkeys(urls))


def _parse_product(session, url):
    try:
        resp = session.get(url, timeout=25)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"    HATA {url}: {exc}")
        return None

    soup = BeautifulSoup(resp.text, "html.parser")

    # --- isim ---
    h1 = soup.select_one("h1")
    name = h1.get_text(strip=True) if h1 else ""
    if not name:
        nm = soup.select_one("span[itemprop=name]")
        name = nm.get_text(strip=True) if nm else ""
    if not name:
        return None

    # --- fiyat: indirim markup'i, yoksa microdata meta ---
    new_el = soup.select_one(".product-price-new")
    old_el = soup.select_one(".product-price-old")
    new_p = _clean_price(new_el.get_text()) if new_el else None
    old_p = _clean_price(old_el.get_text()) if old_el else None

    original_price = discounted_price = None
    if new_p and old_p and old_p > new_p:
        original_price, discounted_price = old_p, new_p
    elif new_p:
        original_price = new_p
    if original_price is None:
        meta_price = soup.select_one("meta[itemprop=price]")
        original_price = _clean_price(meta_price.get("content")) if meta_price else None

    # --- stok ---
    avail_el = soup.select_one("[itemprop=availability]")
    avail = ""
    if avail_el:
        avail = (avail_el.get("href") or avail_el.get("content") or "").lower()
    in_stock = "instock" in avail.replace("/", "") or avail == ""

    # --- sku / barkod ---
    sku = ""
    sku_el = soup.select_one("span[itemprop=sku], [itemprop=sku]")
    if sku_el:
        sku = (sku_el.get("content") or sku_el.get_text(strip=True) or "").strip()
    barcode = ""
    gtin = soup.select_one("meta[itemprop=Gtin13], meta[itemprop=gtin13]")
    if gtin:
        barcode = (gtin.get("content") or "").strip()
    if not sku:
        sku = barcode

    # --- marka ---
    brand = ""
    brand_el = soup.select_one("[itemprop=brand] meta[itemprop=name], [itemprop=brand] [itemprop=name]")
    if brand_el:
        brand = (brand_el.get("content") or brand_el.get_text(strip=True) or "").strip()

    # --- gorseller ---
    images = []
    for a in soup.select(".product-image-item a[data-fancybox], .product-image-item a"):
        href = _abs_url(a.get("href") or a.get("data-image") or "")
        if href.startswith("http") and href not in images:
            images.append(href)
    for img in soup.select(".product-image-item img, .product-image-slider img"):
        src = _abs_url(img.get("src") or img.get("data-src") or "")
        if src.startswith("http") and src not in images:
            images.append(src)
    if not images:
        og = soup.select_one("meta[itemprop=image], meta[property='og:image']")
        if og:
            src = _abs_url(og.get("content") or "")
            if src.startswith("http"):
                images.append(src)

    # --- aciklama ---
    desc_html = ""
    desc_el = soup.select_one(".product-detail-tab-content, .product-detail-tab")
    if desc_el:
        desc_html = str(desc_el)
    if not desc_html:
        md = soup.select_one("meta[itemprop=description], meta[name=description]")
        if md:
            desc_html = md.get("content") or ""

    slug_match = re.search(r"/urun/([^/?#]+)", url)
    slug = slug_match.group(1) if slug_match else make_slug(name)

    price = original_price if discounted_price is None else discounted_price

    return {
        "name": name,
        "slug": slug,
        "url": url,
        "category": DEFAULT_CATEGORY,
        "parent_category": None,
        "vendor": brand or "Herbina",
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
    parser = argparse.ArgumentParser(description="herbinatura.com (IdeaSoft) scraper")
    parser.add_argument("--limit", type=int, default=0, help="Sadece ilk N urun (test)")
    parser.add_argument("--images", action="store_true", help="Gorselleri indir")
    args = parser.parse_args()

    output_file = resolve_output("herbinatura_products.json")
    print(f"herbinatura.com scraper (IdeaSoft) -> {output_file}")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)

    print("[1/2] Sitemap'ten urun URL'leri toplaniyor...")
    urls = _discover_urls(session)
    print(f"  Toplam {len(urls)} urun URL'i.")
    if args.limit > 0:
        urls = urls[: args.limit]
        print(f"  (TEST limiti: ilk {len(urls)})")
    if not urls:
        print("HATA: urun URL'i bulunamadi.")
        sys.exit(1)

    print(f"\n[2/2] {len(urls)} urun detay sayfasi cekiliyor...")
    products = []
    skipped = 0
    for i, url in enumerate(urls, 1):
        if i == 1 or i % 25 == 0 or i == len(urls):
            print(f"  [{i}/{len(urls)}] ...")
        prod = _parse_product(session, url)
        if prod and prod["original_price"]:
            products.append(prod)
        else:
            skipped += 1
        time.sleep(0.6)

    if args.images:
        image_dir = resolve_image_dir("herbinatura_images")
        print(f"\nGorseller indiriliyor -> {image_dir}")
        for i, prod in enumerate(products, 1):
            downloaded = []
            for img_url in prod.get("all_image_urls", []):
                local = _download_image(session, img_url, image_dir, prod["slug"][:60])
                if local:
                    downloaded.append({"remote_url": img_url, "local_path": local})
            prod["downloaded_images"] = downloaded

    import json
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p.get("available"))
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta, {skipped} atlandi)"
          f" -> {output_file}")
    if not products:
        sys.exit(1)


if __name__ == "__main__":
    main()
