"""neptun.com.tr catalog scraper.

Neptun exposes price and a server-rendered add-to-basket control.  The latter
is the only public stock evidence, so products without both the button and the
hidden product id are emitted with zero stock (fail closed).

Usage:
  python3 scrapers/neptun_scraper.py
  python3 scrapers/neptun_scraper.py --limit 2 --output /tmp/neptun-test.json
"""

from __future__ import annotations

import argparse
import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

from shopify_scraper import HEADERS, resolve_output, strip_html

SITE = "https://www.neptun.com.tr"
CATALOG_URL = f"{SITE}/urunler"
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


def discover_urls(html: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    expected_host = urlparse(SITE).hostname
    urls = [urljoin(SITE, node["href"]) for node in soup.select("#products a.item[href]")]
    return list(dict.fromkeys(
        url for url in urls
        if urlparse(url).hostname == expected_host and urlparse(url).path.startswith("/urunler/")
    ))


def parse_price(value: str) -> float:
    cleaned = re.sub(r"[^0-9,.]", "", value or "")
    if "," in cleaned:
        cleaned = cleaned.replace(".", "").replace(",", ".")
    price = float(cleaned or 0)
    if price <= 0:
        raise ValueError("invalid product price")
    return round(price, 2)


def parse_product(html: str, url: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.get_text(" ", strip=True) if soup.title else ""
    name = re.sub(r"\s*\|\s*Neptün\s*$", "", title).strip()
    price_node = soup.select_one("#product-detail .real-price")
    image_node = soup.select_one("#product-detail img.main-img[src]")
    description_node = soup.select_one("#product-detail .desc")
    if not name or not price_node or not image_node:
        raise ValueError(f"required product fields missing: {url}")

    match = re.search(r"-(\d+)$", urlparse(url).path.rstrip("/"))
    if not match:
        raise ValueError(f"source product id missing: {url}")
    source_id = match.group(1)
    button = soup.select_one("#product-detail button.add-basket")
    hidden_id = soup.select_one('#product-detail input[name="urun_id"][value]')
    available = bool(button and hidden_id and hidden_id.get("value") == source_id)
    price = parse_price(price_node.get_text(" ", strip=True))
    image = urljoin(SITE, image_node["src"])
    description = str(description_node) if description_node else ""
    slug = urlparse(url).path.rstrip("/").rsplit("/", 1)[-1]
    sku = f"NEPTUN-{source_id}"

    return {
        "name": name,
        "slug": slug,
        "url": url,
        "source_product_id": source_id,
        "category": CATEGORY,
        "parent_category": None,
        "vendor": "Neptün",
        "product_type": "",
        "description_html": description,
        "description_text": strip_html(description),
        "original_price": price,
        "discounted_price": None,
        "discount_rate": None,
        "sku": sku,
        "barcode": "",
        "available": available,
        "stock_quantity": 1 if available else 0,
        "specifications": [],
        "all_image_urls": [image],
        "thumbnail_url": image,
        "variants": [{
            "source_variant_id": source_id,
            "title": "Default Title",
            "sku": sku,
            "barcode": "",
            "price": price,
            "compare_at_price": None,
            "stock_quantity": 1 if available else 0,
            "available": available,
            "option1": None,
            "option2": None,
            "option3": None,
        }],
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
    urls = discover_urls(fetch(session, CATALOG_URL))
    if not urls:
        raise RuntimeError("Neptun catalog did not contain product URLs")
    if args.limit:
        urls = urls[:args.limit]

    products = []
    for index, url in enumerate(urls, 1):
        product = parse_product(fetch(session, url), url)
        products.append(product)
        print(f"[{index}/{len(urls)}] {product['name']} stock={product['stock_quantity']}", flush=True)

    output = Path(args.output or resolve_output("neptun_products.json"))
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(output.suffix + ".tmp")
    temporary.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(output)
    print(f"Complete: {len(products)} products -> {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
