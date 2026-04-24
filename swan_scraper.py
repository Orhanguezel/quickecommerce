"""
SWAN Uniform scraper (ikas / Next.js embedded JSON)
---------------------------------------------------
Kullanim:
  python swan_scraper.py
  python swan_scraper.py --limit 10 --skip-images

Cikti:
  - swan_products.json
  - swan_images/
"""

import argparse
import hashlib
import html
import json
import os
import re
import time
import xml.etree.ElementTree as ET
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup


BASE_URL = "https://swanuniform.com"
SITEMAP_URL = f"{BASE_URL}/products.xml"
OUTPUT_FILE = "swan_products.json"
IMAGE_DIR = "swan_images"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}

session = requests.Session()
session.headers.update(HEADERS)


def strip_html(value: str) -> str:
    if not value:
        return ""
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    value = re.sub(r"</p\s*>", "\n", value, flags=re.I)
    value = re.sub(r"<[^>]+>", "", value)
    return re.sub(r"\n{3,}", "\n\n", html.unescape(value)).strip()


def make_slug(name: str) -> str:
    slug = (name or "").lower()
    tr_map = str.maketrans("şçğüöıİŞÇĞÜÖ", "scguoiISCGUO")
    slug = slug.translate(tr_map)
    return re.sub(r"[^a-z0-9]+", "-", slug).strip("-")[:180]


def safe_float(value: Any) -> Optional[float]:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except Exception:
        return None


def get_image_url(image_id: Optional[str], file_name: str = "", size: int = 1080) -> str:
    if not image_id:
        return ""
    merchant_id = "df3bda06-facf-404a-8fdd-1bfa971adbf3"
    if file_name:
        return f"https://cdn.myikas.com/images/{merchant_id}/{image_id}/{size}/{file_name}.webp"
    return f"https://cdn.myikas.com/images/{merchant_id}/{image_id}/{size}"


def download_image(url: str, subfolder: str = "") -> Optional[str]:
    if not url or not url.startswith("http"):
        return None

    try:
        path = urlparse(url).path
        ext = os.path.splitext(path)[1] or ".jpg"
        filename = hashlib.md5(url.encode("utf-8")).hexdigest()[:12] + ext
        save_dir = os.path.join(IMAGE_DIR, subfolder) if subfolder else IMAGE_DIR
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, filename)

        if os.path.exists(file_path):
            return file_path

        resp = session.get(url, timeout=30)
        resp.raise_for_status()
        with open(file_path, "wb") as f:
            f.write(resp.content)
        return file_path
    except Exception as exc:
        print(f"    Gorsel indirilemedi: {url[:120]} -> {exc}")
        return None


def fetch_product_urls() -> List[str]:
    resp = session.get(SITEMAP_URL, timeout=30)
    resp.raise_for_status()

    root = ET.fromstring(resp.text)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = []
    for node in root.findall("sm:url", ns):
        loc = node.findtext("sm:loc", default="", namespaces=ns).strip()
        if loc:
            urls.append(loc)
    return urls


def extract_next_data(html_text: str) -> Dict[str, Any]:
    soup = BeautifulSoup(html_text, "html.parser")
    tag = soup.find("script", id="__NEXT_DATA__")
    if not tag or not tag.string:
        raise ValueError("__NEXT_DATA__ bulunamadi")
    return json.loads(tag.string)


def extract_ld_product(soup: BeautifulSoup) -> Dict[str, Any]:
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = (tag.string or "").strip()
        if not raw:
            continue
        try:
            data = json.loads(raw)
        except Exception:
            continue
        if isinstance(data, dict) and data.get("@type") == "Product":
            return data
    return {}


def extract_category_name(page_props: Dict[str, Any], soup: BeautifulSoup) -> str:
    product = page_props.get("pageSpecificData") or {}
    categories = product.get("categories") or []
    for cat in categories:
        name = (cat or {}).get("name")
        if name:
            return name

    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = (tag.string or "").strip()
        if not raw:
            continue
        try:
            data = json.loads(raw)
        except Exception:
            continue
        if isinstance(data, dict) and data.get("@type") == "BreadcrumbList":
            items = data.get("itemListElement") or []
            if len(items) >= 2:
                return (items[-2] or {}).get("name") or "Genel"
    return "Genel"


def build_variant_map(product: Dict[str, Any]) -> List[Dict[str, Any]]:
    variant_types = product.get("variantTypes") or product.get("productVariantTypes") or []
    options = []
    option_names = []

    for vt in variant_types:
        variant_type = vt.get("variantType") or vt
        name = variant_type.get("name") or ""
        values = [
            vv.get("name")
            for vv in (variant_type.get("values") or vt.get("variantValues") or [])
            if vv and vv.get("name")
        ]
        if name:
            option_names.append(name)
            options.append({"name": name, "values": values})

    variants_out = []
    for variant in product.get("variants") or []:
        prices = variant.get("prices") or []
        price_info = prices[0] if prices else {}
        sell_price = safe_float(price_info.get("sellPrice"))
        discount_price = safe_float(price_info.get("discountPrice"))

        price = sell_price
        compare_at_price = None
        if discount_price and sell_price and discount_price < sell_price:
            compare_at_price = sell_price
            price = discount_price

        stock_total = sum((s.get("stockCount") or 0) for s in (variant.get("stocks") or []))
        available = bool(stock_total > 0 or variant.get("sellIfOutOfStock"))

        value_nodes = variant.get("variantValues") or variant.get("selectedVariantValues") or []
        value_names = [v.get("name") for v in value_nodes if v and v.get("name")]

        item = {
            "title": " / ".join(value_names) if value_names else "default",
            "sku": variant.get("sku") or "",
            "barcode": variant.get("barcode") or ((variant.get("barcodeList") or [""])[0]),
            "price": price,
            "compare_at_price": compare_at_price,
            "available": available,
            "stock_quantity": stock_total,
        }

        for idx, value in enumerate(value_names[:3], start=1):
            item[f"option{idx}"] = value

        variants_out.append(item)

    return options, variants_out


def process_product(url: str) -> Dict[str, Any]:
    resp = session.get(url, timeout=30)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    next_data = extract_next_data(resp.text)
    page_props = ((next_data.get("props") or {}).get("pageProps") or {})
    product = page_props.get("pageSpecificData") or {}
    ld_product = extract_ld_product(soup)

    name = (product.get("name") or ld_product.get("name") or "").strip()
    if not name:
        raise ValueError("Urun adi bulunamadi")

    description_raw = (
        product.get("description")
        or product.get("descriptionHtml")
        or ld_product.get("description")
        or ""
    )
    description_html = description_raw
    description_text = strip_html(description_raw)

    category_name = extract_category_name(page_props, soup)

    image_urls = []
    for img in ld_product.get("image") or []:
        if img and img not in image_urls:
            image_urls.append(img)

    if not image_urls:
        for img in product.get("images") or []:
            image = img.get("image") or {}
            image_id = image.get("id") or img.get("imageId")
            file_name = img.get("fileName") or ""
            full = get_image_url(image_id, file_name=file_name, size=1080)
            if full and full not in image_urls:
                image_urls.append(full)

    prices = product.get("prices") or []
    price_info = prices[0] if prices else {}
    original_price = safe_float(price_info.get("sellPrice"))
    discounted_price = safe_float(price_info.get("discountPrice"))
    if discounted_price and original_price and discounted_price >= original_price:
        discounted_price = None

    options, variants = build_variant_map(product)
    main_variant = next((v for v in variants if v.get("available")), variants[0] if variants else None)

    if original_price is None and main_variant:
        original_price = main_variant.get("compare_at_price") or main_variant.get("price")
        discounted_price = (
            main_variant.get("price")
            if main_variant.get("compare_at_price")
            else None
        )

    sku = (
        product.get("sku")
        or product.get("barcode")
        or (main_variant or {}).get("sku")
        or ld_product.get("sku")
        or ld_product.get("mpn")
        or ""
    )
    barcode = product.get("barcode") or (main_variant or {}).get("barcode") or ""

    specifications = []
    if product.get("brand", {}).get("name"):
        specifications.append({"name": "Marka", "value": product["brand"]["name"]})
    if product.get("gender"):
        specifications.append({"name": "Cinsiyet", "value": product["gender"]})
    if product.get("usageType"):
        specifications.append({"name": "Kullanim Tipi", "value": product["usageType"]})

    return {
        "name": name,
        "slug": product.get("slug") or make_slug(name),
        "url": url,
        "category": category_name,
        "parent_category": None,
        "vendor": (product.get("brand") or {}).get("name") or "SWAN UNIFORM",
        "product_type": "medical-uniform",
        "description_html": description_html,
        "description_text": description_text,
        "original_price": original_price,
        "discounted_price": discounted_price,
        "discount_rate": None,
        "sku": sku,
        "barcode": barcode,
        "specifications": specifications,
        "all_image_urls": image_urls,
        "thumbnail_url": image_urls[0] if image_urls else "",
        "variants": variants,
        "options": options,
        "downloaded_images": [],
        "tags": [],
    }


def download_all_images(products: List[Dict[str, Any]]) -> None:
    print("\nGorseller indiriliyor...")
    os.makedirs(IMAGE_DIR, exist_ok=True)

    for idx, product in enumerate(products, start=1):
        slug = product["slug"][:80]
        print(f"  [{idx}/{len(products)}] {slug}")
        downloaded = []
        for img_url in product.get("all_image_urls", []):
            local = download_image(img_url, subfolder=slug)
            if local:
                downloaded.append({"remote_url": img_url, "local_path": local})
        product["downloaded_images"] = downloaded
        print(f"    {len(downloaded)} gorsel")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Ilk N urunu cek")
    parser.add_argument("--skip-images", action="store_true", help="Gorsel indirme")
    args = parser.parse_args()

    print("SWAN Uniform Scraper")
    print("=" * 50)

    urls = fetch_product_urls()
    print(f"Sitemap urun sayisi: {len(urls)}")

    if args.limit and args.limit > 0:
        urls = urls[: args.limit]
        print(f"Limit uygulandi: {len(urls)}")

    products = []
    for idx, url in enumerate(urls, start=1):
        print(f"[{idx}/{len(urls)}] {url}")
        try:
            item = process_product(url)
            products.append(item)
        except Exception as exc:
            print(f"  HATA: {exc}")
        time.sleep(0.2)

    print(f"\nBasarili cekilen urun: {len(products)}")

    if not args.skip_images:
        download_all_images(products)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"\nTamamlandi -> {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
