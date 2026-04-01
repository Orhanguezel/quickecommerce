"""
Dropick JSON -> QuickEcommerce Import CSV
------------------------------------------
dropick_products.json dosyasindan admin panelin anlayacagi
CSV formatinda export olusturur.

Kullanim:
  python dropick_to_csv.py

Cikti: dropick_import.csv
"""

import json
import csv
import re

INPUT_FILE = "dropick_products.json"
OUTPUT_FILE = "dropick_import.csv"

# ===== AYARLAR — kendi DB degerlerinle degistir =====
STORE_ID = 41
PRODUCT_TYPE = "sports"
BEHAVIOUR = "physical"
STATUS = "approved"
RETURN_IN_DAYS = 14
CASH_ON_DELIVERY = 1
MAX_CART_QTY = 10

# Kategori ID eslestirmesi — admin panelden kategori olusturup ID'leri buraya yaz
# Bos birakirsan import sirasinda kategori atanmaz, sonra admin panelden atarsin
CATEGORY_MAP = {
    "Pickleball Raketleri": "",
    "Cocuk Raketleri": "",
    "Fiber Glass Raketler": "",
    "Karbon Fiber Raketler": "",
    "Kevlar Raketler": "",
    "Pickleball Toplari": "",
    "Giyim": "",
    "Cocuk Giyim": "",
    "Erkek Giyim": "",
    "Kadin Giyim": "",
    "Aksesuarlar": "",
    "Portatif Fileler": "",
    "Kampanyalar": "",
}

# Brand ID — admin panelden "Dropick" markasi olusturup ID'yi buraya yaz
BRAND_ID = ""

# Unit ID — admin panelden birim olusturup ID'yi buraya yaz (adet, takim vs.)
UNIT_ID = ""
# =================================================


def make_slug(name: str) -> str:
    """Turkce karakterleri temizleyip slug olustur."""
    slug = name.lower()
    tr_map = str.maketrans("şçğüöıİŞÇĞÜÖ", "scguoiisccguo")
    slug = slug.translate(tr_map)
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')[:80]
    return slug


def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    # CSV header — exported_data2.csv ile birebir ayni format
    headers = [
        "id", "store_id", "category_id", "brand_id", "unit_id",
        "name", "slug", "warranty", "return_in_days", "type",
        "cash_on_delivery", "behaviour", "delivery_time_min", "delivery_time_max",
        "max_cart_qty", "order_count", "views", "status",
        "available_time_starts", "available_time_ends",
        "manufacture_date", "expiry_date"
    ]

    # Duplicate slug kontrolu
    seen_slugs = set()
    rows = []

    for i, product in enumerate(products):
        slug = product.get("slug") or make_slug(product["name"])

        # Duplicate slug varsa numara ekle
        original_slug = slug
        counter = 2
        while slug in seen_slugs:
            slug = f"{original_slug}-{counter}"
            counter += 1
        seen_slugs.add(slug)

        category_id = CATEGORY_MAP.get(product.get("category", ""), "")

        row = {
            "id": 90000 + i,  # yuksek ID — mevcut urunlerle cakismaz
            "store_id": STORE_ID,
            "category_id": category_id,
            "brand_id": BRAND_ID,
            "unit_id": UNIT_ID,
            "name": product["name"],
            "slug": slug,
            "warranty": "null",
            "return_in_days": RETURN_IN_DAYS,
            "type": PRODUCT_TYPE,
            "cash_on_delivery": CASH_ON_DELIVERY,
            "behaviour": BEHAVIOUR,
            "delivery_time_min": "",
            "delivery_time_max": "",
            "max_cart_qty": MAX_CART_QTY,
            "order_count": 0,
            "views": 0,
            "status": STATUS,
            "available_time_starts": "",
            "available_time_ends": "",
            "manufacture_date": "",
            "expiry_date": "",
        }
        rows.append(row)

    with open(OUTPUT_FILE, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers, quoting=csv.QUOTE_ALL)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Tamamlandi! {len(rows)} urun -> {OUTPUT_FILE}")
    print(f"\nOnemli: CSV sadece urun tanimini import eder.")
    print(f"Fiyat, gorsel, aciklama icin admin panelden tek tek veya")
    print(f"artisan komutuyla ayri islem gerekir.")
    print(f"\nKategori ID'leri bos birakild. Once admin panelden kategorileri")
    print(f"olustur, sonra dropick_to_csv.py icindeki CATEGORY_MAP'i guncelle.")


if __name__ == "__main__":
    main()
