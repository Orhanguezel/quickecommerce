"""
Everlast.com.tr Urun Scraper (Shopify JSON API)
-------------------------------------------------
Kullanim: python everlast_scraper.py
Cikti: everlast_products.json, everlast_images/
"""

import requests, json, time, os, re, hashlib

BASE_URL = "https://everlast.com.tr"
IMAGE_DIR = "everlast_images"
OUTPUT_FILE = "everlast_products.json"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

session = requests.Session()
session.headers.update(HEADERS)


def strip_html(html_str):
    if not html_str: return ""
    from html import unescape
    text = re.sub(r'<[^>]+>', '', html_str)
    return re.sub(r'\s+', ' ', unescape(text)).strip()


def make_slug(name):
    slug = name.lower()
    tr_map = str.maketrans("şçğüöıİŞÇĞÜÖ", "scguoiISCGUO")
    slug = slug.translate(tr_map)
    return re.sub(r'[^a-z0-9]+', '-', slug).strip('-')[:80]


def download_image(url, subfolder=""):
    if not url or not url.startswith("http"): return None
    try:
        ext = os.path.splitext(url.split("?")[0])[1] or ".jpg"
        filename = hashlib.md5(url.encode()).hexdigest()[:12] + ext
        save_dir = os.path.join(IMAGE_DIR, subfolder) if subfolder else IMAGE_DIR
        os.makedirs(save_dir, exist_ok=True)
        filepath = os.path.join(save_dir, filename)
        if os.path.exists(filepath): return filepath
        resp = session.get(url, timeout=20)
        resp.raise_for_status()
        with open(filepath, "wb") as f: f.write(resp.content)
        return filepath
    except Exception as e:
        print(f"    Gorsel indirilemedi: {url[:60]} -> {e}")
        return None


def fetch_all_products():
    """Tum koleksiyonlardan urunleri topla."""
    all_products = {}

    # Once /products.json'dan cek
    page = 1
    while True:
        url = f"{BASE_URL}/products.json?limit=250&page={page}"
        print(f"  products.json sayfa {page}")
        try:
            resp = session.get(url, timeout=20)
            resp.raise_for_status()
            products = resp.json().get("products", [])
            if not products: break
            for p in products:
                all_products[p["id"]] = p
            print(f"    {len(products)} urun")
            page += 1
            time.sleep(0.5)
        except Exception as e:
            print(f"    HATA: {e}")
            break

    # Koleksiyonlardan da cek (bazi urunler /products.json'da gorulmuyor)
    try:
        resp = session.get(f"{BASE_URL}/collections.json", timeout=15)
        collections = resp.json().get("collections", [])
    except:
        collections = []

    for col in collections:
        handle = col.get("handle", "")
        if handle in ("frontpage",): continue
        cpage = 1
        while True:
            url = f"{BASE_URL}/collections/{handle}/products.json?limit=250&page={cpage}"
            try:
                resp = session.get(url, timeout=15)
                products = resp.json().get("products", [])
                if not products: break
                for p in products:
                    if p["id"] not in all_products:
                        all_products[p["id"]] = p
                        print(f"    +{p['title'][:50]} ({handle})")
                cpage += 1
                time.sleep(0.3)
            except:
                break

    return list(all_products.values())


def process_products(raw_products):
    processed = []
    for raw in raw_products:
        handle = raw.get("handle", "")
        title = raw.get("title", "")
        body_html = raw.get("body_html", "") or ""
        product_type = raw.get("product_type", "")
        tags = raw.get("tags", [])
        images = raw.get("images", [])
        image_urls = [img["src"] for img in images if img.get("src")]
        variants = raw.get("variants", [])
        options = raw.get("options", [])

        main_variant = next((v for v in variants if v.get("available")), variants[0] if variants else None)
        original_price = discounted_price = None
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

        variant_list = []
        for v in variants:
            vprice = float(v.get("price", 0) or 0)
            vcompare = v.get("compare_at_price")
            variant_list.append({
                "title": v.get("title", ""),
                "sku": v.get("sku", "") or "",
                "price": vprice,
                "compare_at_price": float(vcompare) if vcompare else None,
                "available": v.get("available", False),
                "option1": v.get("option1"),
                "option2": v.get("option2"),
                "option3": v.get("option3"),
            })

        specifications = []
        if product_type:
            specifications.append({"name": "Urun Tipi", "value": product_type})

        processed.append({
            "name": title,
            "slug": handle or make_slug(title),
            "url": f"{BASE_URL}/products/{handle}",
            "category": product_type or "Spor Ekipmanı",
            "parent_category": None,
            "vendor": raw.get("vendor", "Everlast"),
            "product_type": product_type,
            "description_html": body_html,
            "description_text": strip_html(body_html),
            "original_price": original_price,
            "discounted_price": discounted_price,
            "discount_rate": None,
            "sku": sku,
            "barcode": "",
            "specifications": specifications,
            "all_image_urls": image_urls,
            "thumbnail_url": image_urls[0] if image_urls else "",
            "variants": variant_list,
            "options": [{"name": o.get("name",""), "values": o.get("values",[])} for o in options],
            "downloaded_images": [],
            "tags": tags,
        })
    return processed


def download_all_images(products):
    print("\nGorseller indiriliyor...")
    os.makedirs(IMAGE_DIR, exist_ok=True)
    for i, p in enumerate(products, 1):
        slug = p["slug"][:60]
        print(f"  [{i}/{len(products)}] {slug}")
        downloaded = []
        for img_url in p.get("all_image_urls", []):
            local = download_image(img_url, subfolder=slug)
            if local: downloaded.append({"remote_url": img_url, "local_path": local})
        p["downloaded_images"] = downloaded
        print(f"    {len(downloaded)} gorsel")


def main():
    print("Everlast.com.tr Scraper")
    print("=" * 50)

    raw = fetch_all_products()
    print(f"\nToplam {len(raw)} urun cekildi.")

    products = process_products(raw)
    download_all_images(products)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    cats = {}
    for p in products:
        cats[p["category"]] = cats.get(p["category"], 0) + 1

    total_imgs = sum(len(p.get("downloaded_images", [])) for p in products)
    print(f"\nTamamlandi! {len(products)} urun -> {OUTPUT_FILE}")
    print(f"Toplam gorsel: {total_imgs}")
    print(f"\nKategoriler:")
    for c, n in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {c}: {n}")


if __name__ == "__main__":
    main()
