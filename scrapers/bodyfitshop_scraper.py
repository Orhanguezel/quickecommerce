"""
bodyfitshop.com.tr Urun Scraper (AKINSOFT e-Ticaret)
-------------------------------------------------------------
bodyfitshop.com.tr `AKINSOFT E-Ticaret` altyapisinda calisir. Site urun
listelerini JS ile render eder ama her urun sayfasi schema.org `Product`
microdata'sini server-side gomar.

Tum markalar/urunler cekilir — products sitemap'i taranir (kullanici karari
2026-05-22: marka filtresi YOK, site BioTechUSA/TNT tasimadigi icin tum
katalog alinir).

Kullanim:
    python scrapers/bodyfitshop_scraper.py                # fiyat/stok
    python scrapers/bodyfitshop_scraper.py --limit=8      # test
    python scrapers/bodyfitshop_scraper.py --images       # ilk import icin

Cikti: data/source-products/bodyfitshop_products.json
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

BASE_URL = "https://bodyfitshop.com.tr"
SITEMAP_INDEX = f"{BASE_URL}/sitemap.ashx"


def _clean_price(text):
    """'3.500,00 TL' -> 3500.0. Gecersizse None."""
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


def _product_urls_from_sitemap(session):
    """products sitemap'inden tum urun URL'lerini toplar."""
    try:
        idx = session.get(SITEMAP_INDEX, timeout=30)
        idx.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"  Sitemap index HATASI: {exc}")
        return []
    urls = []
    for sm in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", idx.text):
        if "product" not in sm.lower():
            continue
        try:
            resp = session.get(sm, timeout=60)
            resp.raise_for_status()
        except Exception:  # noqa: BLE001
            continue
        urls.extend(re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", resp.text))
    return list(dict.fromkeys(urls))


def _parse_product(session, url):
    """Urun sayfasini parse eder."""
    try:
        resp = session.get(url, timeout=25)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"    HATA {url}: {exc}")
        return None

    soup = BeautifulSoup(resp.text, "html.parser")

    # detail-region = urun detay alani; ilgili Product microdata burada.
    region = soup.find("detail-region") or soup
    right = region.select_one(".detailRightBlock")
    if not right:
        return None

    # --- Marka (itemprop="brand") -> vendor ---
    brand_el = right.select_one('[itemprop="brand"]')
    brand = brand_el.get_text(strip=True) if brand_el else ""

    # --- Ad ---
    name_el = right.select_one('.detailTitleBlock [itemprop="name"]') \
        or region.select_one('[itemprop="name"]')
    name = name_el.get_text(strip=True) if name_el else ""
    if not name:
        return None

    # --- Fiyat (ana urun: detailPriceBlock icindeki itemprop=price) ---
    price = None
    price_meta = right.select_one('.detailPriceBlock meta[itemprop="price"]')
    if price_meta and price_meta.get("content"):
        price = _clean_price(price_meta["content"])
    if price is None:
        fiyat = right.select_one('.detailPriceBlock .priceItem .priceRight b p')
        if fiyat:
            price = _clean_price(fiyat.get_text())
    if not price:
        return None

    # --- Stok: "Stogumuz Tukenmistir" mesaji varsa stokta degil ---
    so_msg = region.select_one(".SOmessage")
    in_stock = True
    if so_msg and so_msg.get_text(strip=True):
        in_stock = False

    # --- SKU / Barkod / Ozellikler (detailInfoItem satirlari) ---
    sku = barcode = ""
    specifications = []
    for item in region.select(".detailInfoItem"):
        text = item.get_text(" ", strip=True)
        m = re.match(r"\s*([^:]+?)\s*:\s*(.+)$", text)
        if not m:
            continue
        key = m.group(1).strip()
        val = m.group(2).strip()
        kl = key.lower()
        if "stok kodu" in kl or "ürün kodu" in kl:
            sku = val
        elif "barkod" in kl or "gtin" in kl:
            barcode = val
        elif key and val and "marka" not in kl:
            specifications.append({"name": key, "value": val})

    # --- Gorseller (AKINSOFT urun gorselleri /Resim/ altinda) ---
    # Tema/icon asset'leri (/Themes/, icons8, loadingAnimation) haric tutulur.
    images = []
    for img in region.select(".detailImagesBlock img, .wrapper img, "
                             ".thumbsImage img, .detailImageGroup img"):
        src = (img.get("data-src") or img.get("src") or "").strip()
        if not src or "/Resim/" not in src:
            continue
        if src.startswith("/"):
            src = BASE_URL + src
        if src.startswith("http") and src not in images:
            images.append(src)
    if not images:
        og = soup.select_one('meta[property="og:image"]')
        if og and (og.get("content") or "").startswith("http"):
            images.append(og["content"].strip())

    # --- Aciklama (#nav-description / itemprop=description sekmesi) ---
    desc_el = region.select_one('#nav-description [itemprop="description"]') \
        or region.select_one('#nav-description') \
        or region.select_one('[itemprop="description"]')
    desc_html = str(desc_el) if desc_el else ""

    slug_match = re.search(r"/(prd-[^/?#]+)", url)
    slug = slug_match.group(1) if slug_match else make_slug(name)

    return {
        "name": name,
        "slug": slug,
        "url": url,
        "category": "Sporcu Besinleri",
        "parent_category": None,
        "vendor": brand,
        "product_type": "",
        "description_html": desc_html,
        "description_text": strip_html(desc_html),
        "original_price": price,
        "discounted_price": None,
        "discount_rate": None,
        "sku": sku,
        "barcode": barcode,
        "available": in_stock,
        "specifications": specifications,
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else "",
        "variants": [{
            "title": "Default Title",
            "sku": sku,
            "barcode": barcode,
            "price": price,
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
    args = sys.argv[1:]
    with_images = "--images" in args
    limit = None
    for a in args:
        if a.startswith("--limit="):
            limit = int(a.split("=", 1)[1])

    print("bodyfitshop.com.tr scraper (AKINSOFT — tum markalar)")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)

    urls = _product_urls_from_sitemap(session)
    print(f"  Sitemap'ten {len(urls)} urun URL'i alindi.")

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
        image_dir = resolve_image_dir("bodyfitshop_images")
        print("\nGorseller indiriliyor...")
        for prod in products:
            downloaded = []
            for img_url in prod.get("all_image_urls", []):
                local = _download_image(session, img_url, image_dir, prod["slug"][:60])
                if local:
                    downloaded.append({"remote_url": img_url, "local_path": local})
            prod["downloaded_images"] = downloaded

    output_file = resolve_output("bodyfitshop_products.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p["available"])
    print(f"\nTamamlandi! {len(products)} urun "
          f"({in_stock} stokta, {skipped} atlandi) -> {output_file}")


if __name__ == "__main__":
    main()
