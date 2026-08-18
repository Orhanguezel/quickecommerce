"""
provitanya.com Urun Scraper — API tabanli (HIZLI)
--------------------------------------------------
provitanya Nuxt 3 + OpenCart headless. Frontend katalog verisini
`/api/products?limit=N&page=M` JSON endpoint'inden ceker — bu endpoint TUM
katalogu (urun basina seo_keyword + GERCEK quantity + stok + fiyat) tek/bir
kac istekte doner. Eski per-urun HTML scrape (1853 istek / ~40 dk) yerine
~1 istek / <1 sn.

Cikti semasi `sync:source-prices` ile uyumlu (url/slug + stock_quantity int +
original_price/discounted_price). stock_quantity GERCEK miktardir (bool degil)
-> oversell minimize, "On Siparis" yerine gercek stok gosterilebilir.

Kullanim:
  python3 scrapers/provitanya_scraper.py            # tum katalog
  python3 scrapers/provitanya_scraper.py --limit 20 # test

Cikti: data/source-products/provitanya_products.json
"""
import argparse
import json
import sys
import time
import urllib.request

try:
    from shopify_scraper import resolve_output
except Exception:  # standalone test fallback
    def resolve_output(name):
        return f"data/source-products/{name}"

BASE = "https://www.provitanya.com"
API = BASE + "/api/products"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
DEFAULT_CATEGORY = "Sağlık & Sporcu Besinleri"
PAGE_SIZE = 1000


def _get_json(url, retries=3):
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=40) as resp:
                return json.loads(resp.read().decode("utf-8", "replace"))
        except Exception as exc:  # noqa: BLE001
            last = exc
            time.sleep(2 * (i + 1))
    raise RuntimeError(f"API alinamadi ({url}): {last}")


def _num(v):
    try:
        f = float(v)
        return round(f, 2) if f > 0 else None
    except (TypeError, ValueError):
        return None


def _stock_qty(p):
    """GERCEK miktar -> int. is_in_stock False ise 0; True ama miktar yoksa 1."""
    in_stock = bool(p.get("is_in_stock"))
    try:
        qty = int(p.get("quantity") or 0)
    except (TypeError, ValueError):
        qty = 0
    if not in_stock:
        return 0
    return qty if qty > 0 else 1


def _to_product(p):
    slug = (p.get("seo_keyword") or "").strip()
    if not slug:
        return None
    # Historical sitemap imports accidentally stored /provitanya-blog/*
    # articles as products. The current API should contain catalogue rows,
    # but fail closed if a content URL/record appears again.
    raw_url = str(p.get("url") or p.get("href") or "").lower()
    product_type = str(p.get("type") or p.get("record_type") or "").lower()
    if "/provitanya-blog/" in raw_url or product_type in {"blog", "article", "post"}:
        return None
    list_price = _num(p.get("retail_price_with_tax")) or _num(p.get("price_with_tax"))
    special = _num(p.get("retail_special_with_tax"))
    # special yalniz gercek indirimse uygula
    if special is not None and list_price is not None and special >= list_price:
        special = None
    qty = _stock_qty(p)
    barcode = str(p.get("model") or "").strip()
    sku = str(p.get("product_id") or "").strip()
    variant = {
        "title": "Default Title",
        "sku": sku,
        "barcode": barcode,
        "price": list_price,
        "compare_at_price": None,
        "available": qty > 0,
        "stock_quantity": qty,
    }
    return {
        "url": f"{BASE}/{slug}",
        "slug": slug,
        "name": (p.get("name") or "").strip(),
        "vendor": (p.get("manufacturer_name") or "").strip(),
        "barcode": barcode,
        "sku": sku,
        "source_product_id": sku,
        "category": DEFAULT_CATEGORY,
        "parent_category": None,
        "original_price": list_price,
        "discounted_price": special,
        "stock_quantity": qty,
        "available": qty > 0,
        "variants": [variant],
    }


def run(output_file, limit=0):
    t0 = time.time()
    print(f"provitanya API scraper: {API}", flush=True)
    products = []
    seen = set()
    page = 1
    while True:
        url = f"{API}?limit={PAGE_SIZE}&page={page}"
        data = _get_json(url)
        batch = data.get("products") or []
        if not batch:
            break
        for p in batch:
            prod = _to_product(p)
            if prod and prod["url"] not in seen:
                seen.add(prod["url"])
                products.append(prod)
        print(f"  sayfa {page}: +{len(batch)} (toplam {len(products)}) hasMore={data.get('hasMore')}", flush=True)
        if not data.get("hasMore"):
            break
        page += 1
        if limit and len(products) >= limit:
            break
        if page > 50:
            print("  [50 sayfa limit]", file=sys.stderr)
            break
    if limit:
        products = products[:limit]

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    in_stock = sum(1 for p in products if p["available"])
    dt = time.time() - t0
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta) "
          f"-> {output_file}  [{dt:.1f}s]", flush=True)
    return products


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--output", default=None)
    args = parser.parse_args()
    run(args.output or resolve_output("provitanya_products.json"), limit=args.limit)
