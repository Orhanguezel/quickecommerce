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

from bs4 import BeautifulSoup

from shopify_scraper import clean_description_html, make_slug, resolve_relative_urls, strip_html  # noqa: F401

# Varsayilan YEREL servis (2026-06-21): dis scraper.guezelwebdesign.com kaldirildi,
# CF-agir IdeaSoft/Ticimax sitelerinde ~1s'de HTTP 500 doruyordu.
SCRAPER_URL = os.environ.get("SCRAPER_URL", "http://127.0.0.1:8200").rstrip("/")
SCRAPER_API_KEY = os.environ.get(
    "SCRAPER_API_KEY", "scraper-sportoonline-Eq4lGI4KV4CLCMluihY9t9pn0jrZMmf-"
)
SCRAPER_TIMEOUT = int(os.environ.get("SCRAPER_TIMEOUT", "90"))


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


def fetch_plain(url: str, timeout: int = 25) -> str | None:
    """Duz HTTP GET (CF korumasiz sitemap/XML icin). Basarisizsa None.

    Ticimax/IdeaSoft sitemap path'leri (/sitemap.xml, /sitemap/products/N.xml)
    Cloudflare challenge'i ile korunMUYOR; bunlari pahali stealth tarayici yerine
    dogrudan cekmek hem hizli (0.2s) hem guvenilir. Yalnizca urun detay sayfalari
    CF arkasindadir, onlar scrape() ile cekilmeye devam eder.
    """
    req = urlrequest.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept": "application/xml,text/xml,text/html,*/*",
        },
    )
    try:
        with urlrequest.urlopen(req, timeout=timeout) as resp:
            if getattr(resp, "status", 200) != 200:
                return None
            return resp.read().decode("utf-8", "replace")
    except (HTTPError, URLError, TimeoutError, OSError):
        return None


def fetch_sitemap(url: str) -> str | None:
    """Sitemap/XML cek: once duz HTTP (hizli), <loc> yoksa stealth fallback."""
    html = fetch_plain(url)
    if html and "<loc>" in html:
        return html
    res = scrape(url)
    return res.html if res.ok else None


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
    root_html = fetch_sitemap(sitemap_index)
    if not root_html:
        print("  HATA: sitemap index alinamadi (duz HTTP + stealth basarisiz)", file=sys.stderr)
        return []

    locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", root_html)
    product_sitemaps = [u for u in locs if "/products/" in u or "sitemap/products" in u]

    # Sitemap index degil de dogrudan urun sitemap'i gelmis olabilir.
    if not product_sitemaps and any("/sitemap/" not in u for u in locs):
        print("  sitemap.xml dogrudan urun listesi gibi gorunuyor", flush=True)
        return list(dict.fromkeys(locs))

    print(f"  {len(product_sitemaps)} urun alt sitemap'i bulundu", flush=True)
    urls: list[str] = []
    for sm in product_sitemaps:
        sm_html = fetch_sitemap(sm)
        if not sm_html:
            print(f"  alt sitemap atlandi: {sm}", flush=True)
            continue
        sm_urls = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", sm_html)
        urls.extend(sm_urls)
        print(f"  {sm.rsplit('/', 1)[-1]}: +{len(sm_urls)} URL", flush=True)
    return list(dict.fromkeys(urls))


def discover_category_product_urls(
    site_base: str,
    category_paths: list[str],
    max_pages: int = 15,
    delay: float = 1.0,
    page_param: str = "sayfa",
) -> list[str]:
    """Belirli kategori sayfalarindaki urun URL'lerini dondurur.

    Neden sitemap yetmiyor: sitemap tum magazayi duz liste olarak verir, kategori
    bilgisi tasimaz. "Sadece spor-outdoor urunlerini cek" gibi bir istek icin
    kategori sayfasini gezmek gerekir.

    Neden kategori sayfasindaki href'ler dogrudan kullanilamaz: Ticimax/IdeaSoft
    kategori sayfasindaki linkler urun, marka ve alt kategori linkleriyle ayni
    formatta (/slug). Ayirt etmek icin sitemap'teki urun slug kumesi ile
    KESISIM alinir — sitemap'te olan slug kesin urundur.

    Sayfalama: ?{page_param}=N. Yeni urun gelmeyen ilk sayfada durulur.
    DIKKAT: Ticimax'ta parametre "sayfa"dir; "?page=2" SESSIZCE yok sayilip
    sayfa 1 doner (yanlis parametreyle tarama 80 urunde biter, 176'yi gormez).
    Yeni bir site eklerken parametreyi once dogrula.
    """
    all_products = discover_product_urls(site_base)
    if not all_products:
        return []
    slug_to_url = {u.rstrip("/").rsplit("/", 1)[-1]: u for u in all_products}
    print(f"  sitemap urun slug havuzu: {len(slug_to_url)}", flush=True)

    found: dict[str, str] = {}
    for path in category_paths:
        path = "/" + path.strip("/")
        print(f"\n[1b/3] Kategori taraniyor: {site_base}{path}", flush=True)
        before_category = len(found)
        for page in range(1, max_pages + 1):
            url = f"{site_base}{path}" if page == 1 else f"{site_base}{path}?{page_param}={page}"
            res = scrape(url, mode="stealthy")
            if not res.ok or not res.html:
                print(f"  sayfa {page}: FAIL ({res.error}) — kategori durduruldu", flush=True)
                break

            hrefs = {
                h.strip("/").rsplit("/", 1)[-1]
                for h in re.findall(r'href="(/[^"?#]{4,})"', res.html)
            }
            page_slugs = hrefs & slug_to_url.keys()
            new = [s for s in page_slugs if s not in found]
            for s in new:
                found[s] = slug_to_url[s]
            print(f"  sayfa {page}: {len(page_slugs)} urun ({len(new)} yeni) | toplam {len(found)}", flush=True)

            if not new:
                print(f"  sayfa {page} yeni urun getirmedi — kategori bitti", flush=True)
                break
            time.sleep(delay)
        print(f"  {path}: +{len(found) - before_category} urun", flush=True)

    return list(found.values())


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
    soup = BeautifulSoup(html, "html.parser")

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
    page_text = soup.get_text(" ", strip=True).lower()
    out_of_stock_terms = (
        "stokta yok",
        "stok yok",
        "tükendi",
        "tukenmiştir",
        "tükenmiştir",
        "out of stock",
        "sold out",
        "gelince haber ver",
    )
    html_out_of_stock = any(term in page_text for term in out_of_stock_terms)

    if "outofstock" in avail_raw or "soldout" in avail_raw or "discontinued" in avail_raw:
        in_stock = False
    elif avail_raw:
        in_stock = (
            "instock" in avail_raw
            or "preorder" in avail_raw
            or "backorder" in avail_raw
        )
    elif html_out_of_stock:
        in_stock = False
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

    desc_html = resolve_relative_urls(clean_description_html(str(jsonld.get("description") or "")), url)
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
        limit: int = 0, delay: float = 0.4,
        category_paths: list[str] | None = None, max_pages: int = 15) -> list[dict]:
    """IdeaSoft magazasini stealth ile scrape eder, JSON ciktiyi yazar.

    category_paths verilirse SADECE o kategorilerdeki urunler cekilir
    (or. ["/spor-outdoor"]); verilmezse magazanin tamami taranir.
    """
    site_base = site_base.rstrip("/")
    print(f"IdeaSoft (stealth) scraper: {site_base}")
    print("=" * 55)

    if not SCRAPER_URL or not SCRAPER_API_KEY:
        print("HATA: SCRAPER_URL ve SCRAPER_API_KEY env zorunlu.", file=sys.stderr)
        raise SystemExit(2)

    if category_paths:
        print(f"KATEGORI FILTRESI aktif: {', '.join(category_paths)}", flush=True)
        urls = discover_category_product_urls(site_base, category_paths, max_pages=max_pages)
    else:
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
        # 429 (Too Many Requests) — Cloudflare/site rate-limit'i: artan bekleme
        # ile tekrar dene (eprotein gibi sert siteler tek seferde 429 doner).
        _retry = 0
        while (not res.ok) and _retry < 3 and (
            (res.status == 429) or ("429" in str(res.error or ""))
        ):
            _retry += 1
            _wait = 15 * (2 ** (_retry - 1))  # 15s, 30s, 60s
            print(f"  [{i}/{len(urls)}] 429 rate-limit -> {_wait}s bekle, retry {_retry}/3", flush=True)
            time.sleep(_wait)
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
