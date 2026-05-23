"""
crestaofficial.com Urun Scraper (custom Laravel — OpenGraph product meta)
--------------------------------------------------------------------------
crestaofficial.com custom bir Laravel storefront'tur (JSON-LD yok). Urun
sayfalari OpenGraph `product:*` meta etiketlerini gomar (ad, marka, fiyat
TRY, stok, gorsel, urun grubu). Beden secenekleri `feature-select`
linklerinde `data-id` / `data-stock` ile gelir.

Her renk ayri bir urun URL'idir (`...-1001-M-RED`, `...-1001-M-BLK`); beden
ise tek sayfa icinde varyant olarak listelenir.

Urun URL'leri `sitemap.xml` -> `/tr/urun/...` desenli loc'lardan kesfedilir.

Kullanim:
    python scrapers/crestaofficial_scraper.py                # fiyat/stok
    python scrapers/crestaofficial_scraper.py --limit=8      # test
    python scrapers/crestaofficial_scraper.py --images       # ilk import icin

Cikti: data/source-products/crestaofficial_products.json
Cikti semasi everlast/shopify ciktisiyla birebir aynidir.
"""

import json
import re
import sys
import time

import requests
from bs4 import BeautifulSoup

from shopify_scraper import (
    HEADERS,
    _download_image,
    make_slug,
    resolve_image_dir,
    resolve_output,
    strip_html,
)

BASE_URL = "https://www.crestaofficial.com"
SITEMAP_URL = "https://crestaofficial.com/sitemap.xml"
PRODUCT_URL_RE = re.compile(r"https?://(?:www\.)?crestaofficial\.com/tr/urun/")
VENDOR = "Cresta"
DEFAULT_CATEGORY = "Outdoor Giyim"


def _clean_price(text):
    """'2.490,00' / '2490.00' -> 2490.0. Gecersizse None."""
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
    """sitemap.xml'den `/tr/urun/` desenli urun URL'lerini toplar."""
    try:
        resp = session.get(SITEMAP_URL, timeout=60)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"  Sitemap HATASI: {exc}")
        return []
    locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", resp.text)
    urls = [loc.strip() for loc in locs if PRODUCT_URL_RE.match(loc.strip())]
    return list(dict.fromkeys(urls))


def _meta(soup, prop):
    el = soup.find("meta", attrs={"property": prop})
    return (el.get("content") or "").strip() if el and el.get("content") else ""


def _parse_product(session, url):
    try:
        resp = session.get(url, timeout=25)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"    HATA {url}: {exc}")
        return None

    html = resp.text
    soup = BeautifulSoup(html, "html.parser")

    name = _meta(soup, "og:title")
    if not name:
        h1 = soup.select_one("h1")
        name = h1.get_text(strip=True) if h1 else ""
    if not name:
        return None

    brand = _meta(soup, "product:brand") or VENDOR
    price = _clean_price(_meta(soup, "product:price:amount"))

    # Indirim: product:sale_price varsa indirimli, retail price asil fiyat.
    sale = _clean_price(_meta(soup, "product:sale_price"))
    original_price = price
    discounted_price = None
    if sale and price and sale < price:
        original_price, discounted_price = price, sale

    # HTML fallback fiyat (.pricechange) + indirim markup'i (.old-price ana kutu).
    price_box = soup.select_one(".price-box")
    if original_price is None and price_box:
        pc = price_box.select_one(".pricechange")
        original_price = _clean_price(pc.get_text()) if pc else None
    if discounted_price is None and price_box:
        old = price_box.select_one(".old-price del, .old-price")
        new = price_box.select_one(".special-price, .pricechange")
        op = _clean_price(old.get_text()) if old else None
        np = _clean_price(new.get_text()) if new else None
        if op and np and op > np:
            original_price, discounted_price = op, np
    if not original_price:
        return None

    # Stok: og product:availability ("in stock"/"out of stock").
    avail_meta = _meta(soup, "product:availability").lower()
    page_in_stock = "out" not in avail_meta if avail_meta else True

    # SKU: "Ürün Kodu: 1001-M-RED" metninden.
    sku = ""
    sku_m = re.search(r"(?:Ürün Kodu|STOK KODU)\s*:\s*([A-Za-z0-9._-]+)", html, re.I)
    if sku_m:
        sku = sku_m.group(1).strip()

    # Gorseller: data-zoom-image galeri.
    images = list(dict.fromkeys(
        re.findall(r'data-zoom-image=["\']([^"\']+)["\']', html)
    ))
    images = [i if i.startswith("http") else BASE_URL + i for i in images]
    if not images:
        og = _meta(soup, "og:image")
        if og:
            images.append(og)

    # Aciklama: .price-box sonrasi ilk uzun paragraf.
    desc_html = ""
    desc_p = soup.select_one("p.mt-20.mb-30")
    if desc_p:
        desc_html = str(desc_p)
    else:
        og_desc = _meta(soup, "og:description")
        desc_html = f"<p>{og_desc}</p>" if og_desc else ""

    # Beden varyantlari: feature-select / disable-variant linkleri.
    variants = []
    size_values = []
    for a in soup.select("a.feature-select, a.disable-variant"):
        size = a.get_text(strip=True)
        if not size:
            continue
        stock = a.get("data-stock")
        try:
            v_in_stock = int(stock) > 0
        except (TypeError, ValueError):
            v_in_stock = "disable-variant" not in (a.get("class") or [])
        v_price = _clean_price(a.get("data-price"))
        # data-price genelde 0.00 (ek fiyat farki yok) -> urun fiyatini kullan.
        cur_price = (original_price if discounted_price is None else discounted_price)
        if not v_price:
            v_price = cur_price
        variants.append({
            "title": size,
            "sku": sku,
            "barcode": "",
            "price": v_price,
            "compare_at_price": original_price if discounted_price is not None else None,
            "available": v_in_stock,
            "option1": size,
            "option2": None,
            "option3": None,
        })
        size_values.append(size)

    cur_price = original_price if discounted_price is None else discounted_price
    if not variants:
        # Bedensiz / tek varyantli urun.
        variants = [{
            "title": "Default Title",
            "sku": sku,
            "barcode": "",
            "price": cur_price,
            "compare_at_price": original_price if discounted_price is not None else None,
            "available": page_in_stock,
            "option1": None,
            "option2": None,
            "option3": None,
        }]
        options = []
    else:
        options = [{"name": "Beden", "values": list(dict.fromkeys(size_values))}]

    in_stock = any(v["available"] for v in variants)

    slug_match = re.search(r"/urun/([^/?#]+)", url)
    slug = slug_match.group(1) if slug_match else make_slug(name)

    return {
        "name": name,
        "slug": slug,
        "url": url,
        "category": DEFAULT_CATEGORY,
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
        "specifications": [],
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else "",
        "variants": variants,
        "options": options,
        "downloaded_images": [],
        "tags": [],
    }


def main():
    args = sys.argv[1:]
    with_images = "--images" in args
    limit = None
    for a in args:
        if a.startswith("--limit="):
            limit = int(a.split("=", 1)[1])

    print("crestaofficial.com scraper (custom Laravel — OpenGraph product meta)")
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
        sys.exit(1)

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
        image_dir = resolve_image_dir("crestaofficial_images")
        print("\nGorseller indiriliyor...")
        for prod in products:
            downloaded = []
            for img_url in prod.get("all_image_urls", []):
                local = _download_image(session, img_url, image_dir, prod["slug"][:60])
                if local:
                    downloaded.append({"remote_url": img_url, "local_path": local})
            prod["downloaded_images"] = downloaded

    output_file = resolve_output("crestaofficial_products.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p["available"])
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta, {skipped} atlandi)"
          f" -> {output_file}")
    if not products:
        sys.exit(1)


if __name__ == "__main__":
    main()
