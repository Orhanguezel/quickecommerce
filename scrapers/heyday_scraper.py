"""heydaytr.com product scraper (ikas / embedded Next.js product data).

The public JSON-LD contains the current selling price, while the embedded
``__NEXT_DATA__`` payload contains the list price, exact stock quantity and
variant labels.  Both are checked so that a missing stock signal fails closed.

Usage:
  python3 scrapers/heyday_scraper.py
  python3 scrapers/heyday_scraper.py --limit 1 --output /tmp/heyday-test.json
"""

from __future__ import annotations

import argparse
import json
import re
import time
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

from shopify_scraper import HEADERS, resolve_output, resolve_relative_urls, strip_html

SITE = "https://heydaytr.com"
SITEMAP = f"{SITE}/products.xml"
CATEGORY = "Sporcu Besinleri"


def fetch(session: requests.Session, url: str) -> str:
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            response = session.get(url, timeout=(10, 45))
            response.raise_for_status()
            if not response.text.strip():
                raise ValueError("empty response")
            return response.text
        except (requests.RequestException, ValueError) as exc:
            last_error = exc
            if attempt < 2:
                time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"fetch failed for {url}: {last_error}")


def discover_urls(session: requests.Session) -> list[str]:
    xml = fetch(session, SITEMAP)
    urls = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml)
    expected_host = urlparse(SITE).hostname
    return list(dict.fromkeys(
        url for url in urls if urlparse(url).hostname == expected_host
    ))


def _jsonld_product(soup: BeautifulSoup) -> dict:
    for node in soup.select('script[type="application/ld+json"]'):
        try:
            value = json.loads(node.string or "")
        except (TypeError, json.JSONDecodeError):
            continue
        candidates = value if isinstance(value, list) else [value]
        for candidate in candidates:
            if isinstance(candidate, dict) and candidate.get("@type") == "Product":
                return candidate
    raise ValueError("Product JSON-LD missing")


def _next_product(soup: BeautifulSoup) -> dict:
    node = soup.select_one("#__NEXT_DATA__")
    if not node or not node.string:
        raise ValueError("__NEXT_DATA__ missing")
    data = json.loads(node.string)
    product = data.get("props", {}).get("pageProps", {}).get("pageSpecificData")
    if not isinstance(product, dict) or not product.get("id"):
        raise ValueError("ikas product data missing")
    return product


def _images(value: object) -> list[str]:
    values = value if isinstance(value, list) else [value]
    return list(dict.fromkeys(
        item for item in values if isinstance(item, str) and item.startswith("http")
    ))


def parse_product(html: str, url: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    schema = _jsonld_product(soup)
    product = _next_product(soup)
    name = str(product.get("name") or schema.get("name") or "").strip()
    if not name:
        raise ValueError("product name missing")

    variants = []
    for raw in product.get("variants") or []:
        prices = [p for p in raw.get("prices") or [] if p.get("currencyCode") == "TRY"]
        if not prices:
            raise ValueError(f"TRY price missing for variant {raw.get('id')}")
        price_data = prices[0]
        list_price = float(price_data.get("sellPrice") or 0)
        discount_price = float(price_data.get("discountPrice") or 0)
        if list_price <= 0:
            raise ValueError(f"invalid list price for variant {raw.get('id')}")
        current_price = discount_price if 0 < discount_price < list_price else list_price

        if "stock" not in raw or not isinstance(raw["stock"], (int, float)):
            raise ValueError(f"stock evidence missing for variant {raw.get('id')}")
        stock = max(0, int(raw["stock"])) if raw.get("isActive") is True else 0
        labels = [
            str(value.get("name") or "").strip()
            for value in raw.get("variantValues") or []
            if str(value.get("name") or "").strip()
        ]
        barcode_list = raw.get("barcodeList") or []
        variants.append({
            "source_variant_id": str(raw.get("id") or ""),
            "title": " / ".join(labels) or "Default Title",
            "sku": str(raw.get("sku") or ""),
            "barcode": str(barcode_list[0]) if barcode_list else "",
            "price": current_price,
            "compare_at_price": list_price if current_price < list_price else None,
            "stock_quantity": stock,
            "available": stock > 0,
            **{f"option{i + 1}": labels[i] if i < len(labels) else None for i in range(3)},
        })
    if not variants:
        raise ValueError("variants missing")

    active_variants = [variant for variant in variants if variant["available"]] or variants
    lowest = min(active_variants, key=lambda variant: variant["price"])
    description = resolve_relative_urls(str(product.get("description") or schema.get("description") or ""), url)
    images = _images(schema.get("image"))
    slug = urlparse(url).path.rstrip("/").rsplit("/", 1)[-1]

    return {
        "name": name,
        "slug": slug,
        "url": url,
        "source_product_id": str(product["id"]),
        "category": CATEGORY,
        "parent_category": None,
        "vendor": "Heyday",
        "product_type": "",
        "description_html": description,
        "description_text": strip_html(description),
        "original_price": lowest["compare_at_price"] or lowest["price"],
        "discounted_price": lowest["price"] if lowest["compare_at_price"] else None,
        "discount_rate": None,
        "sku": lowest["sku"],
        "barcode": lowest["barcode"],
        "available": any(variant["available"] for variant in variants),
        "stock_quantity": sum(variant["stock_quantity"] for variant in variants),
        "specifications": [],
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else "",
        "variants": variants,
        "options": [],
        "downloaded_images": [],
        "tags": [],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--output")
    args = parser.parse_args()
    if args.limit < 0 or (args.limit and not args.output):
        parser.error("limited runs require --output to protect canonical data")

    session = requests.Session()
    session.headers.update(HEADERS)
    urls = discover_urls(session)
    if not urls:
        raise RuntimeError("products.xml did not contain Heyday product URLs")
    if args.limit:
        urls = urls[:args.limit]

    products = []
    for index, url in enumerate(urls, 1):
        product = parse_product(fetch(session, url), url)
        products.append(product)
        print(f"[{index}/{len(urls)}] {product['name']} variants={len(product['variants'])} stock={product['stock_quantity']}", flush=True)

    output = Path(args.output or resolve_output("heyday_products.json"))
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(output.suffix + ".tmp")
    temporary.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(output)
    print(f"Complete: {len(products)} products -> {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
