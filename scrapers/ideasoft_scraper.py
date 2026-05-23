"""
Ortak IdeaSoft / Ticimax tarzi urun scraper cekirdegi (Scrapling stealth).
-------------------------------------------------------------------------
proteinavm.com ve eprotein.com.tr gibi siteler IdeaSoft altyapisini kullanir
ve SERT bir Cloudflare duvari arkasindadir; duz `requests`/`curl` 403 veya
challenge sayfasi dondurur. Bu yuzden tum istekler scraper-service uzerinden
(stealth tarayici) gider:
    https://scraper.guezelwebdesign.com/api/v1/scrape  (mode: stealthy)

Akis:
  1. /sitemap.xml -> alt sitemap'ler (sitemap/products/N.xml) -> urun URL'leri
  2. her urun sayfasi stealth ile cekilir
  3. sayfadaki JSON-LD `Product` parse edilir (fiyat TRY, sku, brand, gorsel,
     aciklama, stok durumu)

Cikti semasi everlast_scraper.py / shopify_scraper.py ile birebir aynidir
-> `sync:source-prices` ve `import:products` degisiklik gerektirmeden calisir.

Fiyatlar zaten TRY (TL) -> kur cevirme YOK.

scrape() fonksiyonu maraton_scraper_v2.py paterni ile birebir aynidir
(endpoint, header, payload).

Kullanim (wrapper'lar uzerinden):
  SCRAPER_URL=https://scraper.guezelwebdesign.com \\
  SCRAPER_API_KEY=scraper-sportoonline-... \\
    python3 scrapers/proteinavm_scraper.py [--limit 5]
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
from dataclasses import dataclass
from html import unescape
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

from shopify_scraper import clean_description_html, make_slug, strip_html  # noqa: F401

SCRAPER_URL = os.environ.get("SCRAPER_URL", "https://scraper.guezelwebdesign.com").rstrip("/")
SCRAPER_API_KEY = os.environ.get(
    "SCRAPER_API_KEY", "scraper-sportoonline-Eq4lGI4KV4CLCMluihY9t9pn0jrZMmf-"
)
SCRAPER_TIMEOUT = int(os.environ.get("SCRAPER_TIMEOUT", "60"))


@dataclass
class ScrapeResult:
    ok: bool
    status: int | None
    html: str | None
    error: str | None = None


def scrape(url: str, mode: str = "stealthy", solve_cf: bool = True) -> ScrapeResult:
    """scraper-service /api/v1/scrape cagrisi (maraton_scraper_v2.py paterni)."""
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
            # Servis onundeki CF, varsayilan Python-urllib UA'sini 403'ler.
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        method="POST",
    )
    try:
        with urlrequest.urlopen(req, timeout=SCRAPER_TIMEOUT + 30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        return ScrapeResult(False, None, None, str(exc))

    return ScrapeResult(
        ok=bool(data.get("success")),
        status=data.get("status_code"),
        html=data.get("html"),
        error=data.get("error"),
    )


def _clean_price(text) -> float | None:
    """'6.900,00 TL' / '6900.00' -> 6900.0. Gecersizse None."""
    if text is None:
        return None
    t = re.sub(r"[^\d.,]", "", str(text))
    if not t:
        return None
    if "," in t and "." in t:
        t = t.replace(".", "").replace(",", ".")
    elif "," in t:
        t = t.replace(",", ".")
    try:
        val = float(t)
        return round(val, 2) if val > 0 else None
    except ValueError:
        return None


def discover_product_urls(site_base: str) -> list[str]:
    """sitemap.xml -> products alt sitemap'leri -> tum urun URL'leri."""
    sitemap_index = f"{site_base}/sitemap.xml"
    print(f"[1/3] Sitemap index cekiliyor: {sitemap_index}", flush=True)
    root = scrape(sitemap_index)
    if not root.ok or not root.html:
        print(f"  HATA: sitemap index alinamadi: {root.error}", file=sys.stderr)
        return []

    locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", root.html)
    product_sitemaps = [u for u in locs if "/products/" in u or "sitemap/products" in u]

    # Sitemap index degil de dogrudan urun sitemap'i gelmis olabilir.
    if not product_sitemaps and any("/sitemap/" not in u for u in locs):
        print("  sitemap.xml dogrudan urun listesi gibi gorunuyor", flush=True)
        return list(dict.fromkeys(locs))

    print(f"  {len(product_sitemaps)} urun alt sitemap'i bulundu", flush=True)
    urls: list[str] = []
    for sm in product_sitemaps:
        sm_res = scrape(sm)
        if not sm_res.ok or not sm_res.html:
            print(f"  alt sitemap atlandi: {sm} ({sm_res.error})", flush=True)
            continue
        sm_urls = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", sm_res.html)
        urls.extend(sm_urls)
        print(f"  {sm.rsplit('/', 1)[-1]}: +{len(sm_urls)} URL", flush=True)
    return list(dict.fromkeys(urls))


def _jsonld_product(html: str) -> dict | None:
    """Sayfadaki ilk JSON-LD `Product` nesnesini dondurur (@graph dahil)."""
    for block in re.findall(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.S | re.I,
    ):
        try:
            data = json.loads(block.strip(), strict=False)
        except ValueError:
            continue
        candidates = data if isinstance(data, list) else [data]
        for item in list(candidates):
            if isinstance(item, dict) and isinstance(item.get("@graph"), list):
                candidates.extend(item["@graph"])
        for item in candidates:
            if isinstance(item, dict):
                t = item.get("@type")
                if t == "Product" or (isinstance(t, list) and "Product" in t):
                    return item
    return None


def _offer(jsonld: dict) -> dict:
    offers = (jsonld or {}).get("offers")
    if isinstance(offers, list):
        return offers[0] if offers else {}
    if isinstance(offers, dict):
        return offers
    return {}


def _images_from_jsonld(value) -> list[str]:
    if not value:
        return []
    if isinstance(value, str):
        return [value] if value.startswith("http") else []
    out: list[str] = []
    if isinstance(value, list):
        for v in value:
            if isinstance(v, str) and v.startswith("http"):
                out.append(v)
            elif isinstance(v, dict) and str(v.get("url", "")).startswith("http"):
                out.append(v["url"])
    elif isinstance(value, dict) and str(value.get("url", "")).startswith("http"):
        out.append(value["url"])
    return out


def parse_product(html: str, url: str, vendor: str, default_category: str) -> dict | None:
    """JSON-LD Product -> standart (everlast) sema. Yoksa None."""
    jsonld = _jsonld_product(html)
    if not jsonld:
        return None

    name = unescape(str(jsonld.get("name") or "")).strip()
    if not name:
        return None

    offer = _offer(jsonld)
    # AggregateOffer durumunda offer.price olmaz, sadece lowPrice + highPrice
    # bulunur (cesitli varyantlar). lowPrice'i alirsak en kucuk varyantin
    # fiyatini kullaniriz -> urun sayfasinda gosterilen varsayilan fiyatin
    # YARISI gibi gorunebilir (kullanici bug raporu 2026-05-23). Bu yuzden:
    # 1) offer.price varsa onu kullan (tek offer durumu)
    # 2) yoksa highPrice (under-selling olmasin)
    # 3) son fallback lowPrice
    price = _clean_price(offer.get("price"))
    if price is None:
        price = _clean_price(offer.get("highPrice")) or _clean_price(offer.get("lowPrice"))

    # IdeaSoft JSON-LD'de indirim ayri verilmez; offer.price guncel (satis)
    # fiyatidir. piyasa/eski fiyat HTML markup'tan denenir.
    discounted_price = None
    original_price = price
    old_m = re.search(
        r'(?:spanPiyasaFiyat[ıi]|productOldPrice|product-old-price|line-through)[^>]*>'
        r'\s*([^<]+?)\s*<',
        html, re.I,
    )
    if old_m:
        old_price = _clean_price(old_m.group(1))
        if old_price and price and old_price > price:
            original_price = old_price
            discounted_price = price

    # Stok: JSON-LD availability varsa onu kullan.
    # Bazi IdeaSoft kurulumlari (orn. eprotein) availability alanini hic
    # vermez -> bu durumda urun "stokta" kabul edilir. Sayfa metni icinde
    # "tukendi" aramak GUVENILMEZ: kelime IdeaSoft JS dil paketinde
    # (urunlistesi_tukendi) her sayfada sabit gecer -> yanlis negatif uretir.
    avail_raw = str(offer.get("availability") or "").lower()
    avail_raw = avail_raw.replace("/", "").replace("_", "").replace("-", "")
    if avail_raw:
        in_stock = (
            "instock" in avail_raw
            or "preorder" in avail_raw
            or "backorder" in avail_raw
        )
    else:
        in_stock = True

    sku = str(jsonld.get("sku") or jsonld.get("mpn") or "").strip()
    if sku.startswith("{{") or sku.startswith("("):
        sku = ""

    barcode = str(jsonld.get("gtin13") or jsonld.get("gtin") or "").strip()

    brand = jsonld.get("brand")
    if isinstance(brand, dict):
        brand = brand.get("name", "")
    brand = (brand or "").strip()

    images = _images_from_jsonld(jsonld.get("image"))
    if not images:
        og = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html, re.I)
        if og and og.group(1).startswith("http"):
            images.append(og.group(1).strip())

    desc_html = clean_description_html(str(jsonld.get("description") or ""))
    desc_text = strip_html(desc_html)

    slug = url.rstrip("/").rsplit("/", 1)[-1] or make_slug(name)

    variant_price = original_price if discounted_price is None else discounted_price
    return {
        "name": name,
        "slug": slug,
        "url": url,
        "category": default_category,
        "parent_category": None,
        "vendor": brand or vendor,
        "product_type": "",
        "description_html": desc_html,
        "description_text": desc_text,
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
            "price": variant_price,
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


def run(site_base: str, output_file: str, vendor: str, default_category: str,
        limit: int = 0, delay: float = 0.4) -> list[dict]:
    """IdeaSoft magazasini stealth ile scrape eder, JSON ciktiyi yazar."""
    site_base = site_base.rstrip("/")
    print(f"IdeaSoft (stealth) scraper: {site_base}")
    print("=" * 55)

    if not SCRAPER_URL or not SCRAPER_API_KEY:
        print("HATA: SCRAPER_URL ve SCRAPER_API_KEY env zorunlu.", file=sys.stderr)
        raise SystemExit(2)

    urls = discover_product_urls(site_base)
    if not urls:
        print("HATA: urun URL'i bulunamadi.", file=sys.stderr)
        raise SystemExit(1)
    print(f"  Toplam {len(urls)} urun URL'i bulundu", flush=True)

    if limit > 0:
        urls = urls[:limit]
        print(f"  --limit aktif: ilk {limit} URL ile test", flush=True)

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
        product = parse_product(res.html, url, vendor, default_category)
        if not product or not product.get("original_price"):
            failed.append(url)
            print(f"  [{i}/{len(urls)}] no-jsonld/no-price: {url[-50:]}", flush=True)
            continue
        products.append(product)
        if i == 1 or i % 25 == 0 or i == len(urls):
            elapsed = time.time() - started
            rate = i / elapsed if elapsed > 0 else 0
            eta = (len(urls) - i) / rate if rate > 0 else 0
            print(
                f"  [{i}/{len(urls)}] {product['name'][:40]} | "
                f"{product['original_price']} TL | avg {elapsed/i:.1f}s | ETA {eta/60:.0f} dk",
                flush=True,
            )
        # Incremental write: her 50 urunde JSON snapshot — timeout/kill
        # durumunda partial veri kaybolmasin (atomic temp+rename).
        if len(products) % 50 == 0:
            try:
                tmp = f"{output_file}.tmp"
                with open(tmp, "w", encoding="utf-8") as f:
                    json.dump(products, f, ensure_ascii=False, indent=2)
                os.replace(tmp, output_file)
                print(f"  [checkpoint] {len(products)} urun yazildi -> {output_file}",
                      flush=True)
            except Exception as exc:  # noqa: BLE001
                print(f"  WARN: incremental write hatasi: {exc}", flush=True)
        if delay:
            time.sleep(delay)

    print(f"\n[3/3] {len(products)} urun OK, {len(failed)} fail", flush=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p.get("available"))
    print(f"  -> {output_file} ({len(products)} kayit, {in_stock} stokta)", flush=True)
    if not products:
        raise SystemExit(1)
    return products
