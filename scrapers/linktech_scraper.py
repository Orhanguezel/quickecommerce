"""
linktech.com.tr Urun Scraper — /shop liste-tabanli (HIZLI)
----------------------------------------------------------
LinkTech (Odoo). Eski scraper: ~80 listing sayfasi (stok icin) + 1740 urun
detay sayfasi (~32 dk). Ama /shop liste sayfasi her urun kartinda URL + FIYAT
(itemprop=price) + stok (.tp-product-stock-label OOS) hepsini iceriyor.
Bu yuzden detay cekimine GEREK YOK — sadece liste sayfalarini gez (~80 istek,
~1-2 dk). sync:source-prices url ile esler; stock_quantity 1/0.

Kullanim: python3 scrapers/linktech_scraper.py [--limit N]
Cikti: data/source-products/linktech_products.json
"""
import argparse
import json
import re
import sys
import time

import requests
from bs4 import BeautifulSoup

try:
    from shopify_scraper import HEADERS, resolve_output
except Exception:  # pragma: no cover
    HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    def resolve_output(name):
        return f"data/source-products/{name}"

BASE_URL = "https://www.linktech.com.tr"
DEFAULT_CATEGORY = "Teknoloji"
# Trailing Odoo product_id; URL'de /en/ /tr/ locale oneki ve ?page=N query
# olabilir (locale slug DB ile uyusmaz -> id ile esleriz).
PROD_ID_RE = re.compile(r"/shop/.+?-(\d+)(?:[/?#]|$)")
LOCALE_RE = re.compile(r"^/[a-z]{2}/shop/", re.I)
MAX_PAGES = 120


def _canon_url(href):
    """/en/shop/...-123?page=2 -> https://www.linktech.com.tr/shop/...-123"""
    href = href.split("?", 1)[0].split("#", 1)[0].rstrip("/")
    href = re.sub(r"^/[a-z]{2}/shop/", "/shop/", href, flags=re.I)
    if not href.startswith("http"):
        href = BASE_URL + href
    return href


def _price(card):
    el = card.select_one("[itemprop='price']")
    if not el:
        return None
    raw = el.get("content") or el.get_text(strip=True)
    try:
        return round(float(str(raw).replace(",", "")), 2)
    except (TypeError, ValueError):
        return None


def _to_product(href, price, in_stock):
    pid_m = PROD_ID_RE.search(href)
    pid = pid_m.group(1) if pid_m else ""
    url = _canon_url(href)
    slug = url.split("/shop/", 1)[-1]
    qty = 1 if in_stock else 0
    return {
        "url": url,
        "slug": slug,
        "source_product_id": pid,
        "category": DEFAULT_CATEGORY,
        "original_price": price,
        "discounted_price": None,
        "stock_quantity": qty,
        "available": in_stock,
        "variants": [{
            "title": "Default Title", "sku": "", "barcode": "",
            "price": price, "compare_at_price": None,
            "available": in_stock, "stock_quantity": qty,
        }],
    }


def run(output_file, limit=0):
    t0 = time.time()
    print(f"linktech /shop liste scraper: {BASE_URL}")
    session = requests.Session()
    session.headers.update(HEADERS)

    products = {}
    seen_urls = set()
    page = 1
    while page <= MAX_PAGES:
        url = f"{BASE_URL}/shop" if page == 1 else f"{BASE_URL}/shop/page/{page}"
        try:
            resp = session.get(url, timeout=30)
            resp.raise_for_status()
        except Exception as exc:  # noqa: BLE001
            print(f"  sayfa {page} HATASI: {exc}; durduruldu.", file=sys.stderr)
            break
        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select("form[action*='/shop/cart'], div.oe_product, .oe_product_cart")
        page_urls = set()
        new = 0
        for c in cards:
            a = c.select_one("a[href*='/shop/']")
            if not a:
                continue
            href = a.get("href") or ""
            if not PROD_ID_RE.search(href):
                continue
            full = _canon_url(href)
            page_urls.add(full)
            in_stock = not bool(c.select_one(".tp-product-stock-label"))
            if full not in products:
                products[full] = _to_product(href, _price(c), in_stock)
                new += 1
        if not page_urls:
            print(f"  sayfa {page}: urun karti yok, durduruldu.")
            break
        if not (page_urls - seen_urls) and page > 1:
            print(f"  sayfa {page}: yeni URL yok (son sayfa gecildi), durduruldu.")
            break
        seen_urls.update(page_urls)
        print(f"  sayfa {page}: +{new} (toplam {len(products)})", flush=True)
        if limit and len(products) >= limit:
            break
        page += 1

    out = list(products.values())
    if limit:
        out = out[:limit]
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    in_stock = sum(1 for p in out if p["available"])
    print(f"\nTamamlandi! {len(out)} urun ({in_stock} stokta) -> {output_file}  [{time.time()-t0:.1f}s]")
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--output", default=None)
    args = ap.parse_args()
    run(args.output or resolve_output("linktech_products.json"), limit=args.limit)
