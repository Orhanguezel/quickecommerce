"""
animaljoy.com.tr Urun Scraper (ikas platformu, JSON-LD)
--------------------------------------------------------
Animal Joy — "Yeni Nesil Sporcu Gidalari". ikas altyapisi (cdn.myikas.com).

Neden basit: site Cloudflare ARKASINDA DEGIL — duz HTTP 200 doner, stealth
tarayiciya (scraper-service) gerek yok. Her urun sayfasi schema.org JSON-LD
`Product` icerir (name, sku, offers.price, offers.availability).

STOK TESPITI DOGRULANDI (2026-07-27): 50 urunluk tam katalog taramasinda
48 InStock / 1 OutOfStock / 1 JSON-LD'siz cikti — yani availability alani
gercek deger uretiyor, "hep stokta" varsayimi yok.

Kullanim:
  python3 scrapers/animaljoy_scraper.py [--limit 5]

Cikti: data/source-products/animaljoy_products.json
"""

import argparse
import json
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from shopify_scraper import resolve_output

SITE = "https://animaljoy.com.tr"
UA = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    )
}
VENDOR = "Animal Joy"


def fetch(url: str, timeout: int = 30) -> str | None:
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", "replace")
    except Exception as exc:  # ag/DNS/HTTP — urun atlanir, tarama devam eder
        print(f"  fetch FAIL {url[-45:]}: {exc}", file=sys.stderr, flush=True)
        return None


def discover_urls() -> list[str]:
    xml = fetch(f"{SITE}/products.xml")
    if not xml:
        return []
    return list(dict.fromkeys(re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml)))


def _jsonld_blocks(html: str) -> list[dict]:
    out = []
    for raw in re.findall(r"<script[^>]*ld\+json[^>]*>(.*?)</script>", html, re.S):
        try:
            data = json.loads(raw)
        except Exception:
            continue
        out.extend(data if isinstance(data, list) else [data])
    return out


_TR_MAP = str.maketrans({
    "ç": "c", "Ç": "c", "ğ": "g", "Ğ": "g", "ı": "i", "İ": "i",
    "ö": "o", "Ö": "o", "ş": "s", "Ş": "s", "ü": "u", "Ü": "u",
})


def slugify(value: str) -> str:
    """
    Urun adindan SEO slug'i uretir.

    Neden URL'deki slug kullanilmiyor: site Turkce adli urunlere Ingilizce slug
    veriyor (FISTIK EZMESI -> peanut-butter). import:products'in kalite kapisi
    bunu "slug urun adiyla uyusmuyor" diye hataya cevirip importu durduruyor,
    ve dogru davranis bu — musteri /urun/peanut-butter degil /urun/fistik-ezmesi
    gormeli. Kaynak eslesmesi zaten `url` alani uzerinden yapiliyor.
    """
    text = (value or "").translate(_TR_MAP).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def _clean_html(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", value or "")).strip()


def parse_product(html: str, url: str) -> dict | None:
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
    if price <= 0:
        return None

    availability = str(offer.get("availability") or "").lower()
    # Fail-CLOSED: availability okunamazsa urun "stokta" SAYILMAZ.
    # (herbinatura/powertec'te bunun tersi yok satmaya sebep oldu.)
    available = "instock" in availability.replace("/", "").replace("_", "")

    images = product.get("image") or []
    if isinstance(images, str):
        images = [images]
    images = [i for i in images if isinstance(i, str)]

    return {
        "name": (product.get("name") or "").strip(),
        "slug": slugify(product.get("name") or "") or url.rstrip("/").rsplit("/", 1)[-1],
        "url": url,
        "category": "Sporcu Besinleri",
        "parent_category": None,
        "vendor": (product.get("brand") or {}).get("name") if isinstance(product.get("brand"), dict) else VENDOR,
        "product_type": "",
        "description_html": product.get("description") or "",
        "description_text": _clean_html(product.get("description") or ""),
        "original_price": price,
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
            "price": price,
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
    parser.add_argument("--workers", type=int, default=5, help="Es zamanli istek sayisi")
    args = parser.parse_args()

    print(f"Animal Joy (ikas) scraper: {SITE}")
    print("=" * 55)

    urls = discover_urls()
    if not urls:
        print("HATA: products.xml'den urun URL'i alinamadi.", file=sys.stderr)
        return 1
    print(f"[1/2] {len(urls)} urun URL'i bulundu")
    if args.limit > 0:
        urls = urls[: args.limit]
        print(f"  --limit aktif: ilk {args.limit}")

    started = time.time()

    def one(url: str) -> dict | None:
        html = fetch(url)
        return parse_product(html, url) if html else None

    print(f"[2/2] {len(urls)} urun sayfasi cekiliyor...")
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        results = list(pool.map(one, urls))

    products = [p for p in results if p]
    failed = len(results) - len(products)

    # Ayni adi tasiyan farkli urunler ayni slug'a dusuyor (ornek: iki ayri
    # "WHEY PROTEIN LANSMAN" sayfasi, biri cikolata-hindistan cevizi). Import
    # mukerrer slug'da duruyor. Cakisanlar URL'deki benzersiz slug'a dusurulur;
    # kalite kapisi ad ile slug arasinda ortak kelime aradigi icin bu da gecer.
    used: set[str] = set()
    for product in products:
        slug = product["slug"]
        if slug in used:
            slug = product["url"].rstrip("/").rsplit("/", 1)[-1]
        product["slug"] = slug
        used.add(slug)

    output_file = resolve_output("animaljoy_products.json")
    with open(output_file, "w", encoding="utf-8") as handle:
        json.dump(products, handle, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p["available"])
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta, {failed} parse edilemedi) "
          f"-> {output_file} [{time.time() - started:.1f}s]")
    return 0 if products else 1


if __name__ == "__main__":
    raise SystemExit(main())
