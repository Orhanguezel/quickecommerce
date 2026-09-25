"""
animalturkiye.com Urun Scraper (WooCommerce, JSON-LD)
------------------------------------------------------
Animal Turkiye — store#75. Site vitafy.com.tr ile ayni altyapiyi paylasiyor
(sitemap vitafy URL'leri listeler); urun slug'lari iki sitede ortak.

NEDEN YENIDEN YAZILDI (2026-08-18): Eski scraper `/urunler/{id}/{slug}/`
adreslerini cekiyordu. Site URL yapisini `/urun/{slug}/` olarak degistirdi ve
eski adresler 302 ile /tum-urunler/'e dusuyor; scraper 1 Temmuz'da exit=1 verip
oldu, magazanin fiyatlari 28 Haziran'da dondu. 51 gun sonra tespit edildiginde
Animal 100% Whey bizde 5.990 TL, kaynakta 6.990 TL idi.

Cekim: her slug once animalturkiye.com'da, bulunamazsa vitafy.com.tr'de
denenir (kataloglar tam ortusmuyor).

Kesif: /sitemap.xml ile /tum-urunler/ birlesimi. Sitemap vitafy slug'larini
verir ama animalturkiye'ye ozel olanlari (or. animal-100-whey-protein-181kg)
kacirir; listeleme sayfasi JS ile yuklendigi icin tek basina o da 10 urunde
kalir. Ikisinin birlesimi mapping'lerimizin tamamini kapsiyor.

STOK: JSON-LD offers.availability. Parser fail-CLOSED — alan okunamazsa urun
stokta SAYILMAZ (yok satmaktansa satmamak yeglenir).

MAPPING NOTU: DB'deki 24 mapping `source_name = animalturkiye` ve eski
`/urunler/...` URL'leriyle kayitli. sync:source-prices URL -> id -> slug
sirasiyla eslestirdigi icin slug uzerinden tutuyor; URL'leri guncellemeye
gerek yok. Bu yuzden cikti `slug` alani sitedeki slug ile birebir ayni olmali.

Kullanim:
  python3 scrapers/animalturkiye_scraper.py [--limit 5]

Cikti: data/source-products/animalturkiye_products.json
"""

import argparse
import json
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from shopify_scraper import resolve_output

SITE = "https://www.animalturkiye.com"
# Ayni katalogu paylasan klon site. Iki sitenin urun listesi TAM ortusmuyor:
# 14 slug yalnizca vitafy'de, animal-100-whey-protein-181kg yalnizca
# animalturkiye'de yayinda. Ikisi de denenmezse magazanin 24 urununun ancak
# 10'u fiyat alabiliyor — bu da sync'in guvenlik kilidini tetikleyip stok
# sifirlamayi tamamen devre disi birakiyor.
MIRROR = "https://vitafy.com.tr"
SITEMAP = f"{SITE}/sitemap.xml"
UA = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
    )
}
VENDOR = "Animal Türkiye"


def fetch(url: str, timeout: int = 30) -> str | None:
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status != 200:
                return None
            return resp.read().decode("utf-8", "replace")
    except Exception as exc:  # ag/DNS/HTTP — urun atlanir, tarama devam eder
        print(f"  fetch FAIL {url[-45:]}: {exc}", file=sys.stderr, flush=True)
        return None


def discover_slugs() -> list[str]:
    """
    Iki kaynagin BIRLESIMI:
      - /sitemap.xml : vitafy.com.tr adreslerini listeler, slug'lar ortak
      - /tum-urunler/: yalnizca animalturkiye'de olan slug'lar burada cikar
    Tek basina sitemap yetmiyor; ornegin animal-100-whey-protein-181kg
    sitemap'te yok ama sitede var ve bizim mapping'imiz tam o slug'a bagli.
    """
    slugs: list[str] = []

    xml = fetch(SITEMAP)
    if xml:
        for loc in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml):
            match = re.search(r"/urun/([a-z0-9\-]+)/?$", loc)
            if match:
                slugs.append(match.group(1))

    listing = fetch(f"{SITE}/tum-urunler/")
    if listing:
        slugs.extend(re.findall(r'href="(?:' + re.escape(SITE) + r')?/urun/([a-z0-9\-]+)/"', listing))

    return list(dict.fromkeys(slugs))


def _jsonld_blocks(html: str) -> list[dict]:
    out = []
    for raw in re.findall(r"<script[^>]*ld\+json[^>]*>(.*?)</script>", html, re.S):
        try:
            data = json.loads(raw)
        except Exception:
            continue
        out.extend(data if isinstance(data, list) else [data])
    return out


def _clean_html(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", value or "")).strip()


def parse_product(html: str, url: str, slug: str) -> dict | None:
    product = next((b for b in _jsonld_blocks(html) if b.get("@type") == "Product"), None)
    if not product:
        return None

    offer = product.get("offers") or {}
    if isinstance(offer, list):
        offer = offer[0] if offer else {}

    try:
        price = float(str(offer.get("price") or 0).replace(",", "."))
    except ValueError:
        price = 0.0

    availability = str(offer.get("availability") or "").lower()
    # Fail-CLOSED: availability okunamazsa urun "stokta" SAYILMAZ.
    available = "instock" in availability.replace("/", "").replace("_", "")

    # Fiyati gizlenen urun (site tukenmislerde 0 basiyor) yine de ciktiya girer:
    # boylece sync onu "kaynakta yok" saymaz, stogu 0'a ceker, fiyata dokunmaz.
    # Atlanirsa kaynak urun sayisi mapping'in yarisinin altina duser ve sync'in
    # guvenlik kilidi stok sifirlamayi tamamen devre disi birakir.
    if price <= 0:
        price = 0.0
        available = False

    images = product.get("image") or []
    if isinstance(images, str):
        images = [images]
    images = [i for i in images if isinstance(i, str)]

    brand = product.get("brand")
    vendor = brand.get("name") if isinstance(brand, dict) else (brand if isinstance(brand, str) else VENDOR)

    return {
        "name": (product.get("name") or "").strip(),
        "slug": slug,
        "url": url,
        "category": "Sporcu Besinleri",
        "parent_category": None,
        "vendor": vendor or VENDOR,
        "product_type": "",
        "description_html": product.get("description") or "",
        "description_text": _clean_html(product.get("description") or ""),
        "original_price": price if price > 0 else None,
        "discounted_price": None,
        "discount_rate": None,
        "sku": product.get("sku") or "",
        "barcode": product.get("gtin13") or product.get("gtin") or "",
        "available": available,
        "specifications": [],
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else None,
        "variants": [{
            "title": "Default Title",
            "sku": product.get("sku") or "",
            "barcode": product.get("gtin13") or "",
            "price": price if price > 0 else None,
            "special_price": None,
            "stock_quantity": 1 if available else 0,
            "available": available,
        }],
        "options": [],
        "downloaded_images": [],
        "tags": [],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Sadece ilk N urun (test icin)")
    parser.add_argument("--workers", type=int, default=4, help="Es zamanli istek sayisi")
    args = parser.parse_args()

    print(f"Animal Turkiye (WooCommerce/JSON-LD) scraper: {SITE}")
    print("=" * 58)

    slugs = discover_slugs()
    if not slugs:
        print("HATA: kesiften urun slug'i alinamadi.", file=sys.stderr)
        return 1
    print(f"[1/2] kesif (sitemap + listeleme): {len(slugs)} urun slug'i")
    if args.limit > 0:
        slugs = slugs[: args.limit]
        print(f"  --limit aktif: ilk {args.limit}")

    started = time.time()

    def one(slug: str) -> dict | None:
        for host in (SITE, MIRROR):
            url = f"{host}/urun/{slug}/"
            html = fetch(url)
            if not html:
                continue
            product = parse_product(html, url, slug)
            if product:
                return product
        return None

    print(f"[2/2] {len(slugs)} urun sayfasi cekiliyor...")
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        results = list(pool.map(one, slugs))

    products = [p for p in results if p]
    failed = len(results) - len(products)

    output_file = resolve_output("animalturkiye_products.json")
    with open(output_file, "w", encoding="utf-8") as handle:
        json.dump(products, handle, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p["available"])
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta, {failed} parse edilemedi) "
          f"-> {output_file} [{time.time() - started:.1f}s]")

    # Tum katalog "stokta" gorunuyorsa stok tespiti muhtemelen calismiyor;
    # sessizce yok satmaya donusmesin diye acikca uyar.
    if products and in_stock == len(products):
        print("UYARI: hicbir urun tukenmis gorunmuyor — stok tespiti dogrulanmali.", file=sys.stderr)

    return 0 if products else 1


if __name__ == "__main__":
    raise SystemExit(main())
