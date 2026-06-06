#!/usr/bin/env python3
"""
Dekomum fiyat/stok scraper (WooCommerce Store API + scraper-service).

Kullanim:
  python3 scrapers/dekomum_scraper.py
  python3 scrapers/dekomum_scraper.py --limit 20

Cikti:
  data/source-products/dekomum_products.json
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
import time
from dataclasses import dataclass
from typing import Any
from urllib import parse, request
from urllib.error import HTTPError, URLError

from paths import load_repo_env, source_product_path
from shopify_scraper import resolve_relative_urls

load_repo_env()

SITE_URL = "https://dekomum.net"
API_BASE = f"{SITE_URL}/wp-json/wc/store/v1"
OUTPUT_FILE = source_product_path("dekomum_products.json")
PER_PAGE = 100

SCRAPER_URL = os.environ.get("SCRAPER_URL", "").rstrip("/")
SCRAPER_API_KEY = os.environ.get("SCRAPER_API_KEY", "")
SCRAPER_TIMEOUT = int(os.environ.get("SCRAPER_TIMEOUT", "60"))


@dataclass
class ScrapeResult:
    ok: bool
    body: str | None
    status: int | None = None
    error: str | None = None


def strip_html(value: str | None) -> str:
    if not value:
        return ""
    text = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    text = re.sub(r"</p\s*>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def price_to_float(prices: dict[str, Any], key: str) -> float | None:
    raw = prices.get(key)
    if raw in (None, ""):
        return None
    try:
        minor_unit = int(prices.get("currency_minor_unit", 2) or 2)
        return round(float(raw) / (10 ** minor_unit), 2)
    except (TypeError, ValueError):
        return None


def scrape_body(url: str) -> ScrapeResult:
    if not SCRAPER_URL or not SCRAPER_API_KEY:
        return ScrapeResult(False, None, error="SCRAPER_URL/SCRAPER_API_KEY missing")

    payload = {
        "url": url,
        "mode": "fast",
        "return_html": True,
        "options": {"timeout": SCRAPER_TIMEOUT},
    }
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(
        f"{SCRAPER_URL}/api/v1/scrape",
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {SCRAPER_API_KEY}",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
        },
    )

    try:
        with request.urlopen(req, timeout=SCRAPER_TIMEOUT + 30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        return ScrapeResult(False, None, error=str(exc))

    return ScrapeResult(
        ok=bool(data.get("success")),
        body=data.get("html") or data.get("text"),
        status=data.get("status_code"),
        error=data.get("error"),
    )


DIRECT_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)


def fetch_json(path: str, params: dict[str, Any] | None = None) -> Any:
    query = f"?{parse.urlencode(params)}" if params else ""
    url = f"{API_BASE}{path}{query}"

    # dekomum.net Cloudflare DEGIL; WooCommerce Store API dogrudan erisilebilir.
    # scraper-service IP'si bu sitede 403 aliyor, bu yuzden ONCE dogrudan dene.
    try:
        req = request.Request(url, headers={
            "User-Agent": DIRECT_UA,
            "Accept": "application/json",
        })
        with request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        direct_err = exc

    # Yedek: scraper-service uzerinden dene
    result = scrape_body(url)
    if not result.ok or not result.body:
        raise RuntimeError(
            f"fetch failed: {url} | direct={direct_err} | svc=({result.status}) {result.error}"
        )
    return json.loads(result.body)


def fetch_all_products(limit: int = 0) -> list[dict[str, Any]]:
    products: list[dict[str, Any]] = []
    page = 1

    while True:
        print(f"  Sayfa {page} cekiliyor...", flush=True)
        per_page = min(PER_PAGE, limit) if limit and page == 1 else PER_PAGE
        batch = fetch_json("/products", {"per_page": per_page, "page": page})
        if not isinstance(batch, list) or not batch:
            break

        products.extend(batch)
        print(f"    +{len(batch)} urun (toplam {len(products)})", flush=True)

        if limit and len(products) >= limit:
            products = products[:limit]
            break

        if len(batch) < PER_PAGE:
            break

        page += 1
        time.sleep(0.25)

    return products


def convert_product(raw: dict[str, Any]) -> dict[str, Any]:
    prices = raw.get("prices") or {}
    current_price = price_to_float(prices, "price")
    regular_price = price_to_float(prices, "regular_price")
    sale_price = price_to_float(prices, "sale_price")

    original_price = regular_price if regular_price and regular_price > 0 else current_price
    discounted_price = sale_price if raw.get("on_sale") and sale_price and original_price and sale_price < original_price else None

    images = raw.get("images") or []
    image_urls = [img.get("src") for img in images if isinstance(img, dict) and img.get("src")]
    categories = raw.get("categories") or []
    category_names = [cat.get("name") for cat in categories if isinstance(cat, dict) and cat.get("name")]

    variants = []
    for variation in raw.get("variations") or []:
        attrs = variation.get("attributes") or []
        title = " / ".join(
            str(attr.get("value") or attr.get("name") or "").strip()
            for attr in attrs
            if isinstance(attr, dict) and (attr.get("value") or attr.get("name"))
        )
        variants.append({
            "id": variation.get("id"),
            "source_variant_id": variation.get("id"),
            "title": title or "default",
            "sku": "",
            "price": discounted_price or original_price,
            "compare_at_price": original_price if discounted_price else None,
            "available": bool(raw.get("is_in_stock", True)),
            "stock_quantity": 1 if raw.get("is_in_stock", True) else 0,
        })

    if not variants:
        variants.append({
            "id": raw.get("id"),
            "source_variant_id": raw.get("id"),
            "title": "default",
            "sku": raw.get("sku") or "",
            "price": discounted_price or original_price,
            "compare_at_price": original_price if discounted_price else None,
            "available": bool(raw.get("is_in_stock", True)),
            "stock_quantity": 1 if raw.get("is_in_stock", True) else 0,
        })

    permalink = raw.get("permalink") or f"{SITE_URL}/urun/{raw.get('slug', '')}/"
    description_html = resolve_relative_urls(raw.get("description") or "", permalink)
    short_description_html = resolve_relative_urls(raw.get("short_description") or "", permalink)

    return {
        "source": "dekomum",
        "source_product_id": raw.get("id"),
        "id": raw.get("id"),
        "sku": raw.get("sku") or "",
        "name": html.unescape(raw.get("name") or ""),
        "slug": raw.get("slug") or "",
        "url": permalink,
        "description_html": description_html,
        "description_text": strip_html(description_html or short_description_html),
        "category": category_names[0] if category_names else "Genel",
        "categories": category_names,
        "original_price": original_price,
        "discounted_price": discounted_price,
        "currency": prices.get("currency_code", "TRY"),
        "available": bool(raw.get("is_in_stock", True)),
        "stock_quantity": 1 if raw.get("is_in_stock", True) else 0,
        "all_image_urls": image_urls,
        "thumbnail_url": image_urls[0] if image_urls else "",
        "variants": variants,
        "options": [
            {
                "name": attr.get("name", ""),
                "values": [
                    term.get("name") if isinstance(term, dict) else str(term)
                    for term in (attr.get("terms") or [])
                ],
            }
            for attr in (raw.get("attributes") or [])
            if isinstance(attr, dict)
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Test icin ilk N urunu cek")
    parser.add_argument("--out", default=OUTPUT_FILE)
    args = parser.parse_args()

    print("Dekomum scraper-service fiyat/stok scraper")
    print("=" * 60)
    raw_products = fetch_all_products(limit=args.limit)
    if not raw_products:
        print("HATA: urun bulunamadi", file=sys.stderr)
        return 1

    products = [convert_product(item) for item in raw_products]
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print("\nTamamlandi")
    print(f"  urun: {len(products)}")
    print(f"  stokta: {sum(1 for p in products if p['available'])}")
    print(f"  indirimli: {sum(1 for p in products if p['discounted_price'])}")
    print(f"  cikti: {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
