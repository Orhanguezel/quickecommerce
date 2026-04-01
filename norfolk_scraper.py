"""
Norfolk.com.tr Urun Scraper (Shopify JSON API)
------------------------------------------------
Shopify /products.json endpoint'inden tum urunleri ceeker.
Scraping gerekmez — yapilandirilmis JSON API.

Kullanim:
  pip install requests
  python norfolk_scraper.py

Cikti:
  norfolk_products.json  — Urun verileri
  norfolk_images/        — Indirilen urun gorselleri
"""

import requests
import json
import time
import os
import re
import hashlib
from html import unescape

BASE_URL = "https://norfolk.com.tr"
IMAGE_DIR = "norfolk_images"
OUTPUT_FILE = "norfolk_products.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    )
}

session = requests.Session()
session.headers.update(HEADERS)


def strip_html(html_str: str) -> str:
    """HTML etiketlerini temizle, duz metin don."""
    if not html_str:
        return ""
    text = re.sub(r'<[^>]+>', '', html_str)
    text = unescape(text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def make_slug(name: str) -> str:
    """Turkce karakterleri temizleyip slug olustur."""
    slug = name.lower()
    tr_map = str.maketrans("şçğüöıİŞÇĞÜÖ", "scguoiisccguo")
    slug = slug.translate(tr_map)
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    return slug.strip('-')[:80]


def download_image(url: str, subfolder: str = "") -> str | None:
    """Gorseli indir, yerel dosya yolunu dondur."""
    if not url or not url.startswith("http"):
        return None
    try:
        ext = os.path.splitext(url.split("?")[0])[1] or ".jpg"
        filename = hashlib.md5(url.encode()).hexdigest()[:12] + ext

        save_dir = os.path.join(IMAGE_DIR, subfolder) if subfolder else IMAGE_DIR
        os.makedirs(save_dir, exist_ok=True)
        filepath = os.path.join(save_dir, filename)

        if os.path.exists(filepath):
            return filepath

        resp = session.get(url, timeout=20)
        resp.raise_for_status()

        with open(filepath, "wb") as f:
            f.write(resp.content)

        return filepath
    except Exception as e:
        print(f"    Gorsel indirilemedi: {url[:80]} -> {e}")
        return None


def fetch_all_products() -> list[dict]:
    """Shopify JSON API'den tum urunleri cek (sayfalama ile)."""
    all_products = []
    page = 1

    while True:
        url = f"{BASE_URL}/products.json?limit=250&page={page}"
        print(f"  Sayfa {page}: {url}")

        try:
            resp = session.get(url, timeout=20)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"  HATA: {e}")
            break

        products = data.get("products", [])
        if not products:
            print(f"  Bos sayfa — tamamlandi.")
            break

        all_products.extend(products)
        print(f"  -> {len(products)} urun cekildi (toplam: {len(all_products)})")

        page += 1
        time.sleep(0.5)

    return all_products


def fetch_all_collections() -> dict:
    """Koleksiyonlari cek — urun-koleksiyon eslestirmesi icin."""
    collections = {}
    page = 1

    while True:
        url = f"{BASE_URL}/collections.json?limit=250&page={page}"
        try:
            resp = session.get(url, timeout=15)
            resp.raise_for_status()
            data = resp.json()
        except Exception:
            break

        cols = data.get("collections", [])
        if not cols:
            break

        for c in cols:
            collections[c["id"]] = {
                "title": c.get("title", ""),
                "handle": c.get("handle", ""),
            }

        page += 1
        time.sleep(0.3)

    return collections


def fetch_product_collections_map() -> dict:
    """Her urunun hangi koleksiyonda oldugunu bul."""
    product_collections = {}
    page = 1

    # /collections/all uzerinden tum urunleri collection bilgisi ile cekelim
    collections_data = fetch_all_collections()

    for col_id, col_info in collections_data.items():
        handle = col_info["handle"]
        # Genel koleksiyonlari atla
        if handle in ("all", "frontpage", "en-yeniler", "cok-satan-gunluk-coraplar",
                       "cok-satan-outdoor-coraplar", "cok-satan-saglik-coraplari"):
            continue

        cpage = 1
        while True:
            url = f"{BASE_URL}/collections/{handle}/products.json?limit=250&page={cpage}"
            try:
                resp = session.get(url, timeout=15)
                resp.raise_for_status()
                data = resp.json()
            except Exception:
                break

            products = data.get("products", [])
            if not products:
                break

            for p in products:
                pid = p["id"]
                if pid not in product_collections:
                    product_collections[pid] = []
                if col_info["title"] not in product_collections[pid]:
                    product_collections[pid].append(col_info["title"])

            cpage += 1
            time.sleep(0.3)

    return product_collections


def process_products(raw_products: list[dict], product_collections: dict) -> list[dict]:
    """Shopify JSON verisini QuickEcommerce import formatina cevir."""
    processed = []

    for raw in raw_products:
        product_id = raw["id"]
        handle = raw.get("handle", "")
        title = raw.get("title", "")

        # Aciklama
        body_html = raw.get("body_html", "") or ""
        description_text = strip_html(body_html)

        # Kategoriler
        product_type = raw.get("product_type", "")
        collections = product_collections.get(product_id, [])
        category = product_type or (collections[0] if collections else "Diger")

        # Etiketler
        tags = raw.get("tags", [])

        # Gorseller
        images = raw.get("images", [])
        image_urls = [img["src"] for img in images if img.get("src")]

        # Varyantlar
        variants = raw.get("variants", [])
        options = raw.get("options", [])

        # Ana fiyat (ilk mevcut variant)
        main_variant = None
        for v in variants:
            if v.get("available", False):
                main_variant = v
                break
        if not main_variant and variants:
            main_variant = variants[0]

        original_price = None
        discounted_price = None
        sku = ""

        if main_variant:
            price = float(main_variant.get("price", 0) or 0)
            compare = main_variant.get("compare_at_price")
            compare_price = float(compare) if compare else None

            if compare_price and compare_price > price:
                original_price = compare_price
                discounted_price = price
            else:
                original_price = price

            sku = main_variant.get("sku", "") or ""

        # Tum varyantlari isle
        variant_list = []
        for v in variants:
            vprice = float(v.get("price", 0) or 0)
            vcompare = v.get("compare_at_price")
            vcompare_price = float(vcompare) if vcompare else None

            variant_list.append({
                "title": v.get("title", ""),
                "sku": v.get("sku", "") or "",
                "price": vprice,
                "compare_at_price": vcompare_price,
                "available": v.get("available", False),
                "option1": v.get("option1"),
                "option2": v.get("option2"),
                "option3": v.get("option3"),
            })

        # Ozellikler (specifications) — tags ve product_type'dan
        specifications = []
        if product_type:
            specifications.append({"name": "Urun Tipi", "value": product_type})

        # body_html icinden fiber/material bilgisi cikart
        material_match = re.search(
            r'(\d+%\s*\w+(?:\s*,?\s*\d+%\s*\w+)*)',
            description_text
        )
        if material_match:
            specifications.append({"name": "Malzeme", "value": material_match.group(1)})

        slug = handle or make_slug(title)

        processed.append({
            "shopify_id": product_id,
            "name": title,
            "slug": slug,
            "url": f"{BASE_URL}/products/{handle}",
            "category": category,
            "parent_category": None,
            "collections": collections,
            "tags": tags,
            "vendor": raw.get("vendor", "NORFOLK"),
            "product_type": product_type,
            "description_html": body_html,
            "description_text": description_text,
            "original_price": original_price,
            "discounted_price": discounted_price,
            "discount_rate": None,
            "sku": sku,
            "barcode": "",
            "specifications": specifications,
            "all_image_urls": image_urls,
            "thumbnail_url": image_urls[0] if image_urls else "",
            "variants": variant_list,
            "options": [{"name": o.get("name", ""), "values": o.get("values", [])} for o in options],
            "downloaded_images": [],
        })

    return processed


def download_all_images(products: list[dict]):
    """Tum urun gorsellerini indir."""
    print("\n" + "=" * 60)
    print("Gorseller indiriliyor...")
    print("=" * 60)

    os.makedirs(IMAGE_DIR, exist_ok=True)

    for i, product in enumerate(products, 1):
        slug = product["slug"][:60]
        print(f"  [{i}/{len(products)}] {slug}")

        downloaded = []
        for img_url in product.get("all_image_urls", []):
            local_path = download_image(img_url, subfolder=slug)
            if local_path:
                downloaded.append({
                    "remote_url": img_url,
                    "local_path": local_path,
                })

        product["downloaded_images"] = downloaded
        print(f"    {len(downloaded)} gorsel indirildi")


def main():
    print("Norfolk.com.tr Shopify Scraper")
    print("=" * 60)

    # 1. Tum urunleri cek
    print("\nADIM 1: Urunler cekiliyor...")
    raw_products = fetch_all_products()
    print(f"Toplam {len(raw_products)} urun cekildi.\n")

    # 2. Koleksiyon eslestirmesini cek
    print("ADIM 2: Koleksiyon eslestirmesi yapiliyor...")
    product_collections = fetch_product_collections_map()
    print(f"{len(product_collections)} urun-koleksiyon eslestirmesi yapildi.\n")

    # 3. Verileri isle
    print("ADIM 3: Veriler isleniyor...")
    products = process_products(raw_products, product_collections)
    print(f"{len(products)} urun islendi.\n")

    # 4. Gorselleri indir
    download_all_images(products)

    # 5. JSON kaydet
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    # Istatistikler
    total_images = sum(len(p.get("downloaded_images", [])) for p in products)
    total_with_desc = sum(1 for p in products if p.get("description_text"))
    total_with_variants = sum(1 for p in products if len(p.get("variants", [])) > 1)

    cats = {}
    for p in products:
        cat = p["category"]
        cats[cat] = cats.get(cat, 0) + 1

    print(f"\nTamamlandi! {len(products)} urun -> {OUTPUT_FILE}")
    print(f"\nGenel Istatistikler:")
    print(f"  Toplam urun: {len(products)}")
    print(f"  Toplam gorsel: {total_images}")
    print(f"  Aciklamasi olan: {total_with_desc}")
    print(f"  Varyantli urunler: {total_with_variants}")

    print(f"\nKategori Ozeti (ilk 20):")
    for cat, count in sorted(cats.items(), key=lambda x: -x[1])[:20]:
        print(f"  {cat}: {count} urun")


if __name__ == "__main__":
    main()
