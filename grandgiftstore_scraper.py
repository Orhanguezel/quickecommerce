"""
GrandGiftStore.com Ürün Scraper (WooCommerce Store API)
--------------------------------------------------------
Kullanım: python grandgiftstore_scraper.py
Çıktı: grandgiftstore_products.json, grandgiftstore_images/
"""

import requests, json, time, os, re, hashlib

API_BASE = "https://grandapi.tasarimhizmetim.com/wp-json/wc/store/v1"
SITE_URL = "https://www.grandgiftstore.com"
IMAGE_DIR = "grandgiftstore_images"
OUTPUT_FILE = "grandgiftstore_products.json"
PER_PAGE = 10  # Store API max per_page

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
}

session = requests.Session()
session.headers.update(HEADERS)


def strip_html(html_str):
    if not html_str:
        return ""
    from html import unescape
    text = re.sub(r"<[^>]+>", "", html_str)
    return re.sub(r"\s+", " ", unescape(text)).strip()


def make_slug(name):
    slug = name.lower()
    tr_map = str.maketrans("şçğüöıİŞÇĞÜÖ", "scguoiISCGUO")
    slug = slug.translate(tr_map)
    return re.sub(r"[^a-z0-9]+", "-", slug).strip("-")[:80]


def download_image(url, subfolder=""):
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
        resp = session.get(url, timeout=30)
        resp.raise_for_status()
        with open(filepath, "wb") as f:
            f.write(resp.content)
        return filepath
    except Exception as e:
        print(f"    Görsel indirilemedi: {url[:60]} -> {e}")
        return None


def fetch_all_products():
    """Store API ile tüm ürünleri çek."""
    all_products = []
    page = 1

    while True:
        url = f"{API_BASE}/products?per_page={PER_PAGE}&page={page}"
        print(f"  Sayfa {page} çekiliyor...")
        try:
            resp = session.get(url, timeout=20)
            resp.raise_for_status()
            products = resp.json()

            if not products:
                break

            all_products.extend(products)
            total = resp.headers.get("X-WP-Total", "?")
            total_pages = int(resp.headers.get("X-WP-TotalPages", 1))
            print(f"    {len(products)} ürün (toplam: {total})")

            if page >= total_pages:
                break
            page += 1
            time.sleep(0.5)
        except Exception as e:
            print(f"    HATA: {e}")
            break

    print(f"\n  Toplam {len(all_products)} ürün çekildi.")
    return all_products


def process_products(raw_products):
    """Ham API verisini standart formata dönüştür."""
    processed = []

    for raw in raw_products:
        product_id = raw.get("id")
        name = raw.get("name", "")
        slug = raw.get("slug", "") or make_slug(name)
        description = strip_html(raw.get("description", ""))
        short_description = strip_html(raw.get("short_description", ""))
        sku = raw.get("sku", "") or ""
        product_type = raw.get("type", "simple")

        # Fiyat bilgisi
        prices = raw.get("prices", {})
        currency_minor_unit = prices.get("currency_minor_unit", 2)
        divisor = 10 ** currency_minor_unit

        regular_price = float(prices.get("regular_price", 0)) / divisor
        sale_price = float(prices.get("sale_price", 0)) / divisor
        current_price = float(prices.get("price", 0)) / divisor

        original_price = regular_price if regular_price > 0 else current_price
        discounted_price = sale_price if raw.get("on_sale") and sale_price < original_price else None
        currency = prices.get("currency_code", "USD")

        # Görseller
        images = raw.get("images", [])
        image_urls = [img.get("src") for img in images if img.get("src")]

        # Kategoriler
        categories = raw.get("categories", [])
        category_names = [cat.get("name", "") for cat in categories]

        # Varyantlar
        variations = raw.get("variations", [])
        attributes = raw.get("attributes", [])
        variant_list = []

        for var in variations:
            var_prices = var.get("prices", {})
            var_divisor = 10 ** var_prices.get("currency_minor_unit", 2)
            variant_list.append({
                "id": var.get("id"),
                "name": " / ".join([a.get("value", "") for a in var.get("attributes", [])]),
                "sku": var.get("sku", ""),
                "price": float(var_prices.get("price", 0)) / var_divisor,
                "regular_price": float(var_prices.get("regular_price", 0)) / var_divisor,
                "in_stock": var.get("is_in_stock", True),
            })

        option_list = []
        for attr in attributes:
            option_list.append({
                "name": attr.get("name", ""),
                "values": attr.get("terms", []) if isinstance(attr.get("terms"), list)
                    else [t.get("name", "") for t in attr.get("terms", [])] if isinstance(attr.get("terms"), list)
                    else [],
            })

        processed.append({
            "source": "grandgiftstore",
            "source_id": product_id,
            "sku": sku,
            "name": name,
            "slug": slug,
            "description": description or short_description,
            "short_description": short_description,
            "categories": category_names,
            "original_price": original_price,
            "discounted_price": discounted_price,
            "currency": currency,
            "in_stock": raw.get("is_in_stock", True),
            "on_sale": raw.get("on_sale", False),
            "average_rating": raw.get("average_rating", "0"),
            "review_count": raw.get("review_count", 0),
            "image_urls": image_urls,
            "images_local": [],
            "variants": variant_list,
            "options": option_list,
            "product_url": f"{SITE_URL}/tr/product/{slug}",
            "type": product_type,
        })

    return processed


def download_all_images(products):
    """Tüm ürün görsellerini indir."""
    os.makedirs(IMAGE_DIR, exist_ok=True)
    total_images = sum(len(p["image_urls"]) for p in products)
    downloaded = 0

    for i, product in enumerate(products, 1):
        subfolder = make_slug(product["name"])[:50]
        local_paths = []
        print(f"  [{i}/{len(products)}] {product['name'][:50]} ({len(product['image_urls'])} görsel)")

        for url in product["image_urls"]:
            path = download_image(url, subfolder)
            if path:
                local_paths.append(path)
                downloaded += 1
            time.sleep(0.15)

        product["images_local"] = local_paths

    print(f"\n  {downloaded}/{total_images} görsel indirildi.")


def main():
    print("=" * 60)
    print("GrandGiftStore.com Ürün Scraper")
    print("=" * 60)

    print("\n[1/4] Ürünler çekiliyor...")
    raw_products = fetch_all_products()

    if not raw_products:
        print("Hiç ürün bulunamadı!")
        return

    print("\n[2/4] Ürünler işleniyor...")
    products = process_products(raw_products)
    print(f"  {len(products)} ürün işlendi.")

    print("\n[3/4] Görseller indiriliyor...")
    download_all_images(products)

    print("\n[4/4] JSON kaydediliyor...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print(f"  {OUTPUT_FILE} kaydedildi.")

    # Özet
    print("\n" + "=" * 60)
    print(f"ÖZET:")
    print(f"  Toplam ürün: {len(products)}")
    print(f"  Stokta: {sum(1 for p in products if p['in_stock'])}")
    print(f"  İndirimli: {sum(1 for p in products if p['on_sale'])}")

    cats = {}
    for p in products:
        for c in p["categories"]:
            cats[c] = cats.get(c, 0) + 1
    print(f"  Kategoriler:")
    for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"    - {cat}: {count}")
    print("=" * 60)


if __name__ == "__main__":
    main()
