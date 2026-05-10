"""
Maraton scraper çıktısını (data/source-products/maraton_products.json) backend-laravel'in
'import:products' komutunun beklediği Dropick/Norfolk formatına çevirir.

Çıktı: data/imports/maraton_import.json (VPS'e scp ile gönderilebilir)
"""

import json
import re
from collections import defaultdict
from paths import import_path, source_product_path

SRC = source_product_path("maraton_products.json")
DST = import_path("maraton_import.json")

def normalize_name(name: str) -> str:
    # Maraton ön ekini koru ama tekrarları temizle
    name = re.sub(r"\s+", " ", name).strip()
    return name

def main():
    raw = json.load(open(SRC, encoding="utf-8"))
    print(f"Kaynakta {len(raw)} ürün")

    # SKU başına tekleştir (aynı SKU varsa varyantları birleştir — Maraton sitemap zaten unique)
    by_sku = {}
    for p in raw:
        sku = p.get("sku") or ""
        if not sku:
            continue
        if sku in by_sku:
            # Görselleri birleştir
            existing = by_sku[sku]
            seen = set(existing["all_image_urls"])
            for img in p["all_image_urls"]:
                if img not in seen:
                    existing["all_image_urls"].append(img)
                    seen.add(img)
            existing["downloaded_images"] = (
                existing.get("downloaded_images", []) + p.get("downloaded_images", [])
            )
            continue
        by_sku[sku] = p

    print(f"SKU bazında tekil: {len(by_sku)}")

    # Import formatı
    converted = []
    for sku, p in by_sku.items():
        category = p.get("category") or "Genel"
        # Kategori 2 katmanı (parent yok) — basit hierarşi
        parent = None
        # T-Shirt/Atlet/Sweatshirt → Üst Giyim
        upper = {"T-Shirt", "Atlet", "Sweatshirt"}
        lower = {"Eşofman", "Şort", "Tayt"}
        outer = {"Mont/Ceket"}
        accessory = {"Çanta", "Çorap", "Aksesuar"}
        if category in upper: parent = "Üst Giyim"
        elif category in lower: parent = "Alt Giyim"
        elif category in outer: parent = "Dış Giyim"
        elif category in accessory: parent = "Aksesuar"

        # Açıklama: orjinal description çoğu zaman uzun ve dolu — olduğu gibi al
        description = (p.get("description") or "").strip()
        # Newline'ları normalize et
        description = re.sub(r"\n+", "\n\n", description)

        # downloaded_images formatı zaten {remote_url, local_path} — direkt kullanılabilir
        downloaded = p.get("downloaded_images") or []

        converted.append({
            "name": normalize_name(p["name"]),
            "slug": p.get("slug") or "",
            "sku": sku,
            "category": category,
            "parent_category": parent,
            "description_html": "",  # HTML yok, plain text olarak description'a yaz
            "description_text": description,
            "thumbnail_url": p.get("thumbnail_url") or "",
            "original_price": p.get("price", 0),
            "discounted_price": None,
            "all_image_urls": p.get("all_image_urls", []),
            "downloaded_images": downloaded,
            "specifications": [],
            "variants": [],  # Tek varyant — import komutu original_price'tan tek varyant oluşturur
        })

    with open(DST, "w", encoding="utf-8") as f:
        json.dump(converted, f, ensure_ascii=False, indent=2)

    # Özet
    cats = {}
    for c in converted:
        cats[c["category"]] = cats.get(c["category"], 0) + 1

    print(f"\nImport hazır: {DST}")
    print(f"  ürün: {len(converted)}")
    print(f"  görsel toplamı: {sum(len(c['all_image_urls']) for c in converted)}")
    print(f"  kategori dağılımı:")
    for cat, n in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"    {cat}: {n}")

if __name__ == "__main__":
    main()
