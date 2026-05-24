#!/usr/bin/env python3
"""
Powertec Urun Scraper (Ticimax — powertecshop.com)
-------------------------------------------------
powertec.com.tr yalnizca bir TANITIM sitesidir (Next.js, fiyat/stok YOK;
her urun "Satin Al" ile powertecshop.com'a yonlendirir). Gercek magaza ve
fiyat/stok verisi **powertecshop.com** uzerindedir — Ticimax platformu.

powertecshop.com Cloudflare arkasindadir; HTML sayfalari "Just a moment"
JS challenge dondurur. Bu yuzden maraton ile ayni cozum kullanilir:
detay sayfalari merkezi scraper-service uzerinden cekilir:
  https://scraper.guezelwebdesign.com/api/v1/scrape (mode: stealthy)

Ticimax urun sayfalari JSON-LD `Product` semasi gomar (ad, sku, fiyat TRY,
stok, gorseller) -> opencart_scraper.py'deki JSON-LD yardimcilari kullanilir.
Urun URL'leri Ticimax XML sitemap'inden kesfedilir (sitemap CF disinda,
duz HTTP ile erisilebilir).

Cikti semasi everlast/shopify ciktisiyla birebir aynidir -> `sync:source-prices`
ve `import:products` degisiklik gerektirmeden calisir.

Kullanim (SCRAPER_* env zorunlu; repo .env'inde tanimli):
    SCRAPER_URL=https://scraper.guezelwebdesign.com \\
    SCRAPER_API_KEY=scraper-sportoonline-... \\
      python powertec_scraper.py [--limit 8] [--images]
Cikti: data/source-products/powertec_products.json
"""

import argparse
import json
import os
import re
import sys
import time
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

import requests

from opencart_scraper import (
    _clean_price,
    _images_from_jsonld,
    _jsonld_product,
    _offer,
)
from shopify_scraper import _download_image, make_slug, resolve_image_dir, resolve_output, resolve_relative_urls, strip_html

# --- repo .env'ini yukle (SCRAPER_* degiskenleri icin) ---
try:
    from paths import load_repo_env

    load_repo_env()
except Exception:  # noqa: BLE001
    pass

STORE_BASE = "https://www.powertecshop.com"
SITEMAP_INDEX = f"{STORE_BASE}/sitemap.xml"
DEFAULT_CATEGORY = "Kişisel Bakım"

SCRAPER_URL = os.environ.get("SCRAPER_URL", "").rstrip("/")
SCRAPER_API_KEY = os.environ.get("SCRAPER_API_KEY", "")
SCRAPER_TIMEOUT = int(os.environ.get("SCRAPER_TIMEOUT", "70"))

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/xml,text/xml,*/*;q=0.8",
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
}


def scrape_via_service(url, mode="stealthy"):
    """Cloudflare arkasindaki sayfayi scraper-service ile ceker -> html | None."""
    if not SCRAPER_URL or not SCRAPER_API_KEY:
        return None
    payload = {
        "url": url,
        "mode": mode,
        "options": {
            "headless": True,
            "network_idle": True,
            "timeout": SCRAPER_TIMEOUT,
            "solve_cloudflare": True,
        },
        "return_html": True,
    }
    req = urlrequest.Request(
        f"{SCRAPER_URL}/api/v1/scrape",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {SCRAPER_API_KEY}",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            # Scrapling servisi onundeki Cloudflare default Python-urllib UA'yi
            # 403'ler -> tarayici UA'si zorunlu (2026-05-23 fix, ideasoft_scraper
            # ve maraton_scraper_v2 patternine birebir uyumlu).
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        method="POST",
    )
    try:
        with urlrequest.urlopen(req, timeout=SCRAPER_TIMEOUT + 40) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        print(f"    scraper-service HATA: {exc}")
        return None
    if not data.get("success") or not data.get("html"):
        print(f"    scraper-service basarisiz: status={data.get('status_code')} "
              f"err={data.get('error')}")
        return None
    return data.get("html")


def discover_urls(session):
    """Ticimax sitemap index -> urun alt sitemap'leri -> /urun-slug URL'leri.

    Sitemap'ler duz XML; Cloudflare disinda kalir, normal HTTP ile cekilebilir.
    Erisim engellenirse scraper-service'e duser.
    """
    def _get(url):
        try:
            r = session.get(url, timeout=40)
            if r.status_code == 200 and "<loc>" in r.text:
                return r.text
        except Exception:  # noqa: BLE001
            pass
        # CF engeli -> scraper-service
        return scrape_via_service(url, mode="fast") or ""

    root = _get(SITEMAP_INDEX)
    if not root:
        print("  HATA: sitemap index alinamadi.")
        return []

    sub = [
        loc.strip()
        for loc in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", root)
        if "products" in loc
    ]
    print(f"  {len(sub)} urun alt sitemap bulundu")

    urls = []
    for sm in sub:
        text = _get(sm)
        locs = [loc.strip() for loc in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", text)]
        urls.extend(locs)
        print(f"    {sm.split('/')[-1]}: +{len(locs)} URL")
        time.sleep(0.3)

    return list(dict.fromkeys(urls))


def parse_product(html, url):
    """Ticimax urun sayfasi JSON-LD `Product` -> standart cikti dict'i."""
    jsonld = _jsonld_product(html) or {}
    if not jsonld:
        return None

    name = (jsonld.get("name") or "").strip()
    if not name:
        m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S | re.I)
        if m:
            name = strip_html(m.group(1))
    if not name:
        return None

    offer = _offer(jsonld)

    # Fiyat: JSON-LD offer (Ticimax indirimde dusuk fiyati price'a yazar).
    price = _clean_price(offer.get("price") or offer.get("lowPrice"))
    list_price = _clean_price(offer.get("highPrice"))
    original_price = discounted_price = None
    if price and list_price and list_price > price:
        original_price, discounted_price = list_price, price
    elif price:
        original_price = price

    avail = str(offer.get("availability") or "").lower().replace("/", "").replace("_", "")
    in_stock = "instock" in avail or avail == ""

    sku = str(jsonld.get("sku") or jsonld.get("mpn") or "").strip()
    barcode = str(jsonld.get("gtin13") or jsonld.get("gtin") or "").strip()

    brand = jsonld.get("brand")
    if isinstance(brand, dict):
        brand = brand.get("name", "")
    brand = (brand or "").strip()

    images = _images_from_jsonld(jsonld.get("image"))

    desc_html = jsonld.get("description") or ""
    m = re.search(
        r'<div[^>]*(?:id=["\']tab-?(?:aciklama|description)["\']|'
        r'class=["\'][^"\']*urun-?aciklama[^"\']*["\'])[^>]*>(.*?)</div>',
        html, re.S | re.I,
    )
    if m and len(m.group(1)) > len(strip_html(desc_html)):
        desc_html = m.group(0)
    desc_html = resolve_relative_urls(desc_html, url)

    slug_match = re.search(r"/([^/?#]+?)(?:\.html)?(?:[?#].*)?$", url)
    slug = slug_match.group(1) if slug_match else make_slug(name)

    final_price = original_price if discounted_price is None else discounted_price

    return {
        "name": name,
        "slug": slug,
        "url": url,
        "category": DEFAULT_CATEGORY,
        "parent_category": None,
        "vendor": brand or "Powertec",
        "product_type": "",
        "description_html": desc_html,
        "description_text": strip_html(desc_html),
        "original_price": original_price,
        "discounted_price": discounted_price,
        "discount_rate": None,
        "sku": sku,
        "barcode": barcode,
        "available": in_stock,
        "specifications": [],
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else "",
        "variants": [{
            "title": "Default Title",
            "sku": sku,
            "barcode": barcode,
            "price": final_price,
            "compare_at_price": original_price if discounted_price is not None else None,
            "available": in_stock,
            "option1": None,
            "option2": None,
            "option3": None,
        }],
        "options": [],
        "downloaded_images": [],
        "tags": [],
    }


def main():
    parser = argparse.ArgumentParser(description="powertecshop.com (Ticimax) scraper")
    parser.add_argument("--limit", type=int, default=0, help="Sadece ilk N urun (test)")
    parser.add_argument("--images", action="store_true", help="Gorselleri indir")
    args = parser.parse_args()

    output_file = resolve_output("powertec_products.json")
    print(f"powertec scraper (Ticimax / powertecshop.com) -> {output_file}")
    print("=" * 50)

    if not SCRAPER_URL or not SCRAPER_API_KEY:
        print("HATA: SCRAPER_URL ve SCRAPER_API_KEY env zorunlu "
              "(powertecshop.com Cloudflare arkasinda). repo .env kontrol et.")
        sys.exit(2)

    session = requests.Session()
    session.headers.update(HEADERS)

    print("[1/2] Sitemap'ten urun URL'leri toplaniyor...")
    urls = discover_urls(session)
    print(f"  Toplam {len(urls)} urun URL'i.")
    if args.limit > 0:
        urls = urls[: args.limit]
        print(f"  (TEST limiti: ilk {len(urls)})")
    if not urls:
        print("HATA: urun URL'i bulunamadi.")
        sys.exit(1)

    print(f"\n[2/2] {len(urls)} urun detay sayfasi cekiliyor (scraper-service)...")
    products = []
    skipped = 0
    blocked = 0
    for i, url in enumerate(urls, 1):
        html = scrape_via_service(url)
        if not html:
            blocked += 1
            skipped += 1
            print(f"  [{i}/{len(urls)}] engellendi/bos: {url[-55:]}")
            continue
        prod = parse_product(html, url)
        if prod and prod["original_price"]:
            products.append(prod)
            if i == 1 or i % 25 == 0 or i == len(urls):
                print(f"  [{i}/{len(urls)}] {prod['name'][:42]} | "
                      f"{prod['original_price']} TL | stok {prod['available']}")
        else:
            skipped += 1
            print(f"  [{i}/{len(urls)}] JSON-LD yok / fiyatsiz: {url[-55:]}")
        # Incremental write: her 20 üründe checkpoint -> timeout vurursa
        # partial veri korunur (2026-05-24 fix; powertec'in 91 ürün × ~20sn
        # scrape süresi 30+ dakika sürebilir).
        if len(products) > 0 and len(products) % 20 == 0:
            try:
                tmp = f"{output_file}.tmp"
                with open(tmp, "w", encoding="utf-8") as f:
                    json.dump(products, f, ensure_ascii=False, indent=2)
                os.replace(tmp, output_file)
                print(f"  [checkpoint] {len(products)} urun yazildi -> {output_file}",
                      flush=True)
            except Exception as exc:  # noqa: BLE001
                print(f"  WARN: incremental write hatasi: {exc}", flush=True)
        time.sleep(0.4)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    if args.images and products:
        image_dir = resolve_image_dir("powertec_images")
        print(f"\nGorseller indiriliyor -> {image_dir}")
        for prod in products:
            downloaded = []
            for img_url in prod.get("all_image_urls", []):
                local = _download_image(session, img_url, image_dir, prod["slug"][:60])
                if local:
                    downloaded.append({"remote_url": img_url, "local_path": local})
            prod["downloaded_images"] = downloaded
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p.get("available"))
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta, {skipped} atlandi, "
          f"{blocked} CF engeli) -> {output_file}")
    if not products:
        if blocked:
            print("UYARI: tum sayfalar Cloudflare tarafindan engellendi (error 1010). "
                  "powertecshop.com scraper-service IP'sini whitelist'lemeli ya da "
                  "scraper VPS'ten calistirilmali.")
        sys.exit(1)


if __name__ == "__main__":
    main()
