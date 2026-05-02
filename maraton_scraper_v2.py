#!/usr/bin/env python3
"""
Maraton Sportswear (maratonsw.com) Urun Scraper — V2 (Scrapling)

Onceki versiyonun Playwright + headed Chrome ihtiyaci kalkti. Tum CF challenge
+ urun detay parse merkezi scraper-service uzerinden gider:
  https://scraper.guezelwebdesign.com/api/v1/scrape (mode: stealthy)

VPS'te headless calisir, display gerektirmez. Cron icin uygun.

Cikti: maraton_products.json  (sync:source-prices ile uyumlu schema)

Kullanim:
  SCRAPER_URL=https://scraper.guezelwebdesign.com \\
  SCRAPER_API_KEY=scraper-sportoonline-... \\
    python3 maraton_scraper_v2.py [--limit 50] [--out maraton_products.json]
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

SITE_BASE = "https://www.maratonsw.com"
SITEMAP_INDEX = f"{SITE_BASE}/sitemap.xml"

SCRAPER_URL = os.environ.get("SCRAPER_URL", "").rstrip("/")
SCRAPER_API_KEY = os.environ.get("SCRAPER_API_KEY", "")
SCRAPER_TIMEOUT = int(os.environ.get("SCRAPER_TIMEOUT", "60"))


@dataclass
class ScrapeResult:
    ok: bool
    status: int | None
    html: str | None
    error: str | None = None


def scrape(url: str, mode: str = "stealthy", solve_cf: bool = True) -> ScrapeResult:
    if not SCRAPER_URL or not SCRAPER_API_KEY:
        return ScrapeResult(False, None, None, "scraper_env_missing")

    payload = {
        "url": url,
        "mode": mode,
        "options": {
            "headless": True,
            "network_idle": True,
            "timeout": SCRAPER_TIMEOUT,
            "solve_cloudflare": solve_cf,
        },
        "return_html": True,
    }
    body = json.dumps(payload).encode("utf-8")
    req = urlrequest.Request(
        f"{SCRAPER_URL}/api/v1/scrape",
        data=body,
        headers={
            "Authorization": f"Bearer {SCRAPER_API_KEY}",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
        },
        method="POST",
    )
    try:
        with urlrequest.urlopen(req, timeout=SCRAPER_TIMEOUT + 30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as e:
        return ScrapeResult(False, None, None, str(e))

    return ScrapeResult(
        ok=bool(data.get("success")),
        status=data.get("status_code"),
        html=data.get("html"),
        error=data.get("error"),
    )


def fetch_sitemap_urls() -> list[str]:
    """sitemap.xml -> sub-sitemap'ler -> tum urun URL'leri."""
    print(f"[1/3] Sitemap index cekiliyor: {SITEMAP_INDEX}", flush=True)
    root = scrape(SITEMAP_INDEX)
    if not root.ok or not root.html:
        print(f"  HATA: sitemap index alinamadi: {root.error}", file=sys.stderr)
        return []

    sub_sitemaps = re.findall(r"<loc>([^<]+)</loc>", root.html)
    sub_sitemaps = [u for u in sub_sitemaps if "/products/" in u or "products_" in u]
    print(f"  {len(sub_sitemaps)} alt sitemap bulundu", flush=True)

    urls: list[str] = []
    for sm in sub_sitemaps:
        sm_res = scrape(sm)
        if not sm_res.ok or not sm_res.html:
            print(f"  alt sitemap atlandi: {sm} ({sm_res.error})", flush=True)
            continue
        sm_urls = re.findall(r"<loc>([^<]+)</loc>", sm_res.html)
        urls.extend(sm_urls)
        print(f"  {sm.split('/')[-1]}: +{len(sm_urls)} URL", flush=True)
    return urls


def parse_product(html: str, url: str) -> dict | None:
    """JSON-LD Product extract. Yoksa None doner."""
    matches = re.findall(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html,
        re.DOTALL,
    )
    product = None
    for raw in matches:
        try:
            data = json.loads(raw.strip())
        except Exception:
            continue
        if isinstance(data, list):
            for item in data:
                if isinstance(item, dict) and item.get("@type") == "Product":
                    product = item
                    break
        elif isinstance(data, dict) and data.get("@type") == "Product":
            product = data
        if product:
            break

    if not product:
        return None

    offers = product.get("offers") or {}
    if isinstance(offers, list):
        offers = offers[0] if offers else {}

    price = None
    price_raw = offers.get("price") if isinstance(offers, dict) else None
    if price_raw is not None:
        try:
            price = float(str(price_raw).replace(",", "."))
        except Exception:
            pass

    availability_raw = (offers.get("availability") or "") if isinstance(offers, dict) else ""
    in_stock = "InStock" in availability_raw

    sku = product.get("sku") or product.get("mpn") or ""
    images = product.get("image") or []
    if isinstance(images, str):
        images = [images]

    return {
        "url": url,
        "name": product.get("name", "").strip(),
        "sku": str(sku).strip(),
        "brand": (product.get("brand", {}) or {}).get("name") if isinstance(product.get("brand"), dict) else product.get("brand"),
        "price": price,
        "currency": offers.get("priceCurrency") if isinstance(offers, dict) else None,
        "in_stock": in_stock,
        "description": (product.get("description") or "").strip()[:500],
        "image": images[0] if images else None,
        "images": images,
        "slug": url.rstrip("/").split("/")[-1],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Sadece ilk N URL (test icin)")
    parser.add_argument("--out", default="maraton_products.json")
    parser.add_argument("--urls-from", default="", help="URL listesini bu JSON'dan oku (sitemap atla)")
    args = parser.parse_args()

    if not SCRAPER_URL or not SCRAPER_API_KEY:
        print("HATA: SCRAPER_URL ve SCRAPER_API_KEY env zorunlu.", file=sys.stderr)
        return 2

    if args.urls_from and Path(args.urls_from).exists():
        existing = json.loads(Path(args.urls_from).read_text(encoding="utf-8"))
        urls = [item["url"] for item in existing if item.get("url")]
        print(f"[1/3] {args.urls_from}'tan {len(urls)} URL okundu", flush=True)
    else:
        urls = fetch_sitemap_urls()

    if args.limit > 0:
        urls = urls[: args.limit]
        print(f"  --limit aktif: ilk {args.limit} URL ile test", flush=True)

    print(f"\n[2/3] {len(urls)} urun detay sayfasi cekiliyor...", flush=True)
    products: list[dict] = []
    failed: list[str] = []
    started = time.time()
    for i, url in enumerate(urls, 1):
        res = scrape(url, mode="stealthy")
        if not res.ok or not res.html:
            failed.append(url)
            print(f"  [{i}/{len(urls)}] FAIL: {url[-50:]} ({res.error})", flush=True)
            continue
        product = parse_product(res.html, url)
        if not product:
            failed.append(url)
            print(f"  [{i}/{len(urls)}] no-jsonld: {url[-50:]}", flush=True)
            continue
        products.append(product)
        if i == 1 or i % 25 == 0 or i == len(urls):
            elapsed = time.time() - started
            rate = i / elapsed if elapsed > 0 else 0
            eta = (len(urls) - i) / rate if rate > 0 else 0
            name_short = product.get("name", "")[:40]
            price = product.get("price")
            print(
                f"  [{i}/{len(urls)}] {name_short} | {price} TL | "
                f"avg {elapsed/i:.1f}s/urun | ETA {eta/60:.0f} dk",
                flush=True,
            )

    print(f"\n[3/3] {len(products)} urun OK, {len(failed)} fail", flush=True)
    Path(args.out).write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  -> {args.out} ({len(products)} kayit)", flush=True)
    return 0 if products else 1


if __name__ == "__main__":
    sys.exit(main())
