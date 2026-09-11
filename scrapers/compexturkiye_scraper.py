"""
compexturkiye.com Urun Scraper (WooCommerce + Cloudflare, Scrapling stealth)
----------------------------------------------------------------------------
compexturkiye.com, Compex elektrikli kas stimulasyon (EMS/NMES) cihazlari
satan WordPress/WooCommerce sitesidir. Site SERT bir Cloudflare duvari
arkasindadir -> duz curl/requests Store API'ye 403 / challenge doner.

Bu yuzden WooCommerce Store API (`/wp-json/wc/store/v1/products`) sayfalari
scraper-service stealth tarayicisi uzerinden cekilir. Store API zaten temiz
JSON dondurdugu icin (fiyat TRY, stok, varyant, gorsel) ham veri
woocommerce_scraper._process ile standart (everlast) semaya cevrilir.

scrape() cagrisi maraton_scraper_v2.py paterni ile birebir aynidir
(endpoint, header, payload).

Fiyatlar zaten TRY (TL) -> kur cevirme YOK.

Kullanim:
  SCRAPER_URL=https://scraper.guezelwebdesign.com \\
  SCRAPER_API_KEY=scraper-sportoonline-... \\
    python3 scrapers/compexturkiye_scraper.py [--limit 5]

Cikti: data/source-products/compexturkiye_products.json
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

from shopify_scraper import resolve_output
from woocommerce_scraper import _process

SITE_BASE = "https://compexturkiye.com"
STORE_API = f"{SITE_BASE}/wp-json/wc/store/v1/products"
PER_PAGE = 50

SCRAPER_URL = os.environ.get("SCRAPER_URL", "https://scraper.guezelwebdesign.com").rstrip("/")
SCRAPER_API_KEY = os.environ.get("SCRAPER_API_KEY", "")
SCRAPER_TIMEOUT = int(os.environ.get("SCRAPER_TIMEOUT", "60"))


def scrape_html(url: str, mode: str = "stealthy", solve_cf: bool = True):
    """scraper-service /api/v1/scrape cagrisi (maraton_scraper_v2.py paterni).

    return: (ok: bool, html: str | None, error: str | None)
    """
    if not SCRAPER_URL or not SCRAPER_API_KEY:
        return False, None, "scraper_env_missing"

    payload = {
        "url": url,
        "mode": mode,
        "options": {
            "headless": True,
            # WooCommerce keeps background requests alive; the useful JSON
            # response arrives before network-idle and waiting caused 500s.
            "network_idle": False,
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
            # Servis onundeki CF, varsayilan Python-urllib UA'sini 403'ler.
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        method="POST",
    )
    data = None
    last_error = None
    for attempt in range(3):
        try:
            with urlrequest.urlopen(req, timeout=SCRAPER_TIMEOUT + 30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            break
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
            last_error = str(exc)
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
    if data is None:
        return False, None, last_error

    return bool(data.get("success")), data.get("html"), data.get("error")


def fetch_store_api_page(page: int) -> list | None:
    """Store API'nin bir sayfasini stealth ile ceker, JSON listesi dondurur."""
    url = f"{STORE_API}?per_page={PER_PAGE}&page={page}"
    ok, html, error = scrape_html(url)
    if not ok or not html:
        print(f"    HATA sayfa {page}: {error}", file=sys.stderr)
        return None
    try:
        data = json.loads(html.strip())
    except json.JSONDecodeError:
        # Cloudflare challenge sayfasi JSON yerine HTML dondurmus olabilir.
        print(f"    HATA sayfa {page}: JSON degil (challenge?)", file=sys.stderr)
        return None
    if not isinstance(data, list):
        return None
    return data


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Sadece ilk N urun (test icin)")
    args = parser.parse_args()

    output_file = resolve_output("compexturkiye_products.json")
    print(f"WooCommerce (stealth) scraper: {SITE_BASE}")
    print("=" * 55)

    if not SCRAPER_URL or not SCRAPER_API_KEY:
        print("HATA: SCRAPER_URL ve SCRAPER_API_KEY env zorunlu.", file=sys.stderr)
        return 2

    raw: list[dict] = []
    page = 1
    while True:
        print(f"  Store API sayfa {page} (stealth) ...", flush=True)
        items = fetch_store_api_page(page)
        if items is None:
            if page == 1:
                print("HATA: Store API'den hic veri alinamadi.", file=sys.stderr)
                return 1
            break
        if not items:
            break
        raw.extend(items)
        print(f"    {len(items)} urun (toplam {len(raw)})", flush=True)
        if args.limit and len(raw) >= args.limit:
            break
        if len(items) < PER_PAGE:
            break
        page += 1
        time.sleep(0.5)

    if args.limit:
        raw = raw[: args.limit]
        print(f"  --limit aktif: ilk {len(raw)} urun ile test", flush=True)

    print(f"\nToplam {len(raw)} ham urun -> standart semaya ceviriliyor...", flush=True)
    products = _process(
        raw,
        base_url=SITE_BASE,
        vendor="Compex",
        default_category="Kas Stimulasyon Cihazlari",
    )

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p.get("available"))
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta) -> {output_file}")
    return 0 if products else 1


if __name__ == "__main__":
    sys.exit(main())
