"""data/source-products/musclepump_products.json -> data/imports/musclepump_import.json."""
import json, re
from paths import import_path, source_product_path

SRC = source_product_path("musclepump_products.json")
DST = import_path("musclepump_import.json")

raw = json.load(open(SRC, encoding="utf-8"))
print(f"Kaynak: {len(raw)} ürün")

CATEGORY_PARENTS = {
    "Whey Protein": "Sporcu Besinleri",
    "İzole Protein": "Sporcu Besinleri",
    "Mass Gainer": "Sporcu Besinleri",
    "Kreatin": "Sporcu Besinleri",
    "BCAA": "Sporcu Besinleri",
    "Glutamin": "Sporcu Besinleri",
    "Pre-Workout": "Sporcu Besinleri",
    "L-Carnitine": "Sporcu Besinleri",
    "L-Karnitin": "Sporcu Besinleri",
    "Amino Asit": "Sporcu Besinleri",
    "Kompleks Amino Asitler": "Sporcu Besinleri",
    "Multivitamin": "Vitamin & Mineral",
    "Kompleks Vitaminler": "Vitamin & Mineral",
    "ZMA": "Vitamin & Mineral",
    "Tribulus": "Vitamin & Mineral",
    "L-Arginine": "Vitamin & Mineral",
    "Şort": "Giyim",
    "T-Shirt": "Giyim",
    "Ağırlık Kemeri&Korse": "Aksesuar",
    "Bileklik & Strap": "Aksesuar",
    "Çanta": "Aksesuar",
    "Shaker": "Aksesuar",
    "Havlu": "Aksesuar",
    "Stand": "Aksesuar",
    "Stant": "Aksesuar",
}

converted = []
seen = set()
for p in raw:
    slug = p.get("slug")
    if not slug or slug in seen:
        continue
    seen.add(slug)
    cat = p.get("category", "Genel").strip()
    parent = CATEGORY_PARENTS.get(cat)

    description = re.sub(r"\s+", " ", (p.get("description") or "").strip())

    converted.append({
        "name": p["name"],
        "slug": slug,
        "sku": p.get("sku") or f"MP-{p.get('source_id', '')}",
        "category": cat,
        "parent_category": parent,
        "description_html": "",
        "description_text": description,
        "thumbnail_url": p.get("thumbnail_url") or "",
        "original_price": p.get("price", 0),
        "discounted_price": None,
        "all_image_urls": p.get("all_image_urls", []),
        "downloaded_images": p.get("downloaded_images", []),
        "specifications": [],
        "variants": [],
    })

with open(DST, "w", encoding="utf-8") as f:
    json.dump(converted, f, ensure_ascii=False, indent=2)

cats = {}
for c in converted:
    cats[c["category"]] = cats.get(c["category"], 0) + 1
print(f"\nImport hazır: {DST}")
print(f"  ürün: {len(converted)}")
print(f"  görseli olan: {sum(1 for c in converted if c['downloaded_images'])}")
print(f"  toplam local image: {sum(len(c['downloaded_images']) for c in converted)}")
print("Kategoriler:")
for c, n in sorted(cats.items(), key=lambda x: -x[1])[:10]:
    print(f"  {c}: {n}")
