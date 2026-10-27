"""Evapera WooCommerce catalog with verified per-variation price and stock.

The public Store API lists variation IDs but omits their prices and stock.
Those values are read from WooCommerce's product-page variation JSON. A partial
catalog is never written, so price/stock sync cannot consume guessed variants.
"""

import html
import json
import sys

import requests
from bs4 import BeautifulSoup

from shopify_scraper import HEADERS, resolve_image_dir, resolve_output
from woocommerce_scraper import _fetch_all, _process, _download_image

BASE_URL = "https://evapera.com"
API_URL = f"{BASE_URL}/?rest_route=/wc/store/v1/products"
CATEGORY_MAP = {
    "Pilates": "Yoga & Pilates",
    "Yoga": "Yoga & Pilates",
    "Atlama İpi": "Fitness Aksesuarları",
    "Bisiklet Aksesuarları": "Bisiklet",
    "Ab wheel": "Fitness Aksesuarları",
    "Fitness": "Fitness & Egzersiz",
}


def _variation_data(session, raw):
    response = session.get(raw["permalink"], timeout=30)
    response.raise_for_status()
    form = BeautifulSoup(response.text, "html.parser").select_one(
        "form.variations_form[data-product_variations]"
    )
    if form is None:
        raise ValueError(f"Variation form missing: {raw['id']}")
    variations = json.loads(html.unescape(form["data-product_variations"]))
    expected = {int(item["id"]) for item in raw.get("variations", [])}
    actual = {int(item["variation_id"]) for item in variations}
    if not expected or expected != actual:
        raise ValueError(f"Variation ID mismatch: {raw['id']} ({len(expected)} vs {len(actual)})")
    return variations


def _variant(row):
    attributes = list(row.get("attributes", {}).values())
    price = float(row.get("display_price") or 0)
    regular = float(row.get("display_regular_price") or 0)
    if price <= 0:
        raise ValueError(f"Invalid variation price: {row.get('variation_id')}")
    available = bool(row.get("is_in_stock") and row.get("is_purchasable")
                     and row.get("variation_is_active"))
    max_qty = row.get("max_qty")
    stock = int(max_qty) if available and isinstance(max_qty, (int, float)) else int(available)
    return {
        "id": row["variation_id"],
        "source_variant_id": row["variation_id"],
        "title": " / ".join(attributes) or str(row["variation_id"]),
        "sku": f"EVP-{row['variation_id']}",
        "source_sku": row.get("sku") or "",
        "barcode": "",
        "price": round(price, 2),
        "compare_at_price": round(regular, 2) if regular > price else None,
        "available": available,
        "stock_quantity": max(0, stock) if available else 0,
        "option1": attributes[0] if len(attributes) > 0 else None,
        "option2": attributes[1] if len(attributes) > 1 else None,
        "option3": attributes[2] if len(attributes) > 2 else None,
        "image_url": (row.get("image") or {}).get("url"),
    }


def scrape(with_images=False):
    session = requests.Session()
    session.headers.update(HEADERS)
    session.headers["Accept"] = "application/json"
    raw_products = _fetch_all(session, API_URL)
    if not raw_products:
        raise ValueError("Empty Evapera catalog")
    products = _process(raw_products, BASE_URL, "Evapera", "Fitness")
    if len(products) != len(raw_products):
        raise ValueError("Products missing after normalization")

    for raw, product in zip(raw_products, products):
        product["source_product_id"] = raw["id"]
        product["source_sku"] = product["sku"]
        product["sku"] = f"EVP-P-{raw['id']}"
        source_categories = [item.get("name", "") for item in raw.get("categories", [])]
        product["category"] = next(
            (CATEGORY_MAP[name] for name in source_categories if name in CATEGORY_MAP),
            "Fitness & Egzersiz",
        )
        if raw.get("type") == "variable":
            product["variants"] = [_variant(row) for row in _variation_data(session, raw)]
            product["available"] = any(row["available"] for row in product["variants"])
            for row in product["variants"]:
                image_url = row.get("image_url")
                if image_url and image_url not in product["all_image_urls"]:
                    product["all_image_urls"].append(image_url)
        else:
            if not product["variants"] or not product["variants"][0]["price"]:
                raise ValueError(f"Invalid simple product price: {raw['id']}")
            product["variants"][0]["stock_quantity"] = int(bool(product["available"]))
            product["variants"][0]["source_variant_id"] = raw["id"]
            product["variants"][0]["source_sku"] = product["variants"][0]["sku"]
            product["variants"][0]["sku"] = f"EVP-{raw['id']}"

        if not product["all_image_urls"]:
            raise ValueError(f"Product image missing: {raw['id']}")

    if with_images:
        image_dir = resolve_image_dir("evapera_images")
        for product in products:
            for url in product["all_image_urls"]:
                local = _download_image(session, url, image_dir, product["slug"][:60])
                if not local:
                    raise ValueError(f"Image download failed: {url}")
                product["downloaded_images"].append({"remote_url": url, "local_path": local})

    output = resolve_output("evapera_products.json")
    with open(output, "w", encoding="utf-8") as stream:
        json.dump(products, stream, ensure_ascii=False, indent=2)
    print(f"Evapera: {len(products)} products, "
          f"{sum(p['available'] for p in products)} in stock -> {output}")
    return products


if __name__ == "__main__":
    try:
        scrape(with_images="--images" in sys.argv)
    except (requests.RequestException, ValueError, KeyError, TypeError) as exc:
        print(f"Evapera scraper failed without writing catalog: {exc}", file=sys.stderr)
        raise SystemExit(1)
