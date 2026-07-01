"""
animalturkiye.com Urun Scraper (ozel platform, Cloudflare)
----------------------------------------------------------
Animal Turkiye = Universal Nutrition / Animal markasi resmi distributoru.
Ozel e-ticaret altyapisi; urunler `/urunler/<id>/<slug>/` deseninde, hepsi tek
`sitemap.xml` icinde listelenir (urun + kategori URL'leri karisik). Cloudflare
arkasinda olsa da GET istekleri 200 doner -> duz HTTP yeterli (stealth fallback).

Her urun sayfasinda JSON-LD `Product` vardir ANCAK sitenin bir bug'i nedeniyle
bazi alanlar tirnaksiz URL degeri icerir (orn. `"@id": https://...`/breadcrumb)
-> ham JSON-LD gecersiz. Parse oncesi bu onarilir, sonra ideasoft_scraper'in
JSON-LD -> standart sema cevirici `parse_product()`'i yeniden kullanilir.

Kullanim:
  python3 scrapers/animalturkiye_scraper.py [--limit 5]
Cikti: data/source-products/animalturkiye_products.json
"""

import argparse
import json
import os
import re
import sys
import time

import ideasoft_scraper as base
from shopify_scraper import resolve_output

SITE_BASE = "https://www.animalturkiye.com"
VENDOR = "Animal Türkiye"
DEFAULT_CATEGORY = "Sporcu Besinleri"

_JSONLD_RE = re.compile(
    r'(<script[^>]*type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)',
    re.S | re.I,
)
# `: https://...."` gibi acilis tirnagi eksik URL degerlerini onar.
_UNQUOTED_URL_RE = re.compile(r'(:\s*)(https?://[^"\s,}\]]+)"')

# Aciklama icindeki base64 gomulu gorseller (data: URI) DB'de translations.value'yu
# tasirir (1406 Data too long). <img src="data:...base64,..."> ve ham data: URI'leri sil.
_DATA_IMG_RE = re.compile(r'<img[^>]*src=["\']data:[^"\']*["\'][^>]*>', re.I)
_DATA_URI_RE = re.compile(r'data:[a-zA-Z0-9.+/-]+;base64,[A-Za-z0-9+/=\s]+', re.I)
# Kalan tum <img> (bos src dahil) — encoded (&lt;img...&gt;) ve duz formlar.
_IMG_RE = re.compile(r'<img\b[^>]*>|&lt;img\b.*?&gt;', re.I | re.S)
# Bos <p><br></p> gurultusu — encoded ve duz.
_EMPTY_P_RE = re.compile(
    r'<p>\s*(?:<br\s*/?>)?\s*</p>|&lt;p&gt;\s*(?:&lt;br\s*/?&gt;)?\s*&lt;/p&gt;', re.I
)
_DESC_MAX = 12000


def _clean_desc(text: str) -> str:
    """Aciklamadan base64 + kalan/bos <img> + bos <p> kalintilarini temizle, uzunluk sinirla.

    animalturkiye urun aciklamalari genelde sadece 'TETT : <tarih>' + base64 gomulu
    gorselden ibarettir; base64 silinince geriye bos <img> kalir -> bunlar da silinir.
    """
    if not text:
        return text
    text = _DATA_IMG_RE.sub("", text)
    text = _DATA_URI_RE.sub("", text)
    text = _IMG_RE.sub("", text)
    text = _EMPTY_P_RE.sub("", text)
    return text.strip()[:_DESC_MAX]


def _repair_jsonld(html: str) -> str:
    """Sayfadaki ld+json bloklarini onar (tirnaksiz URL degerleri) -> gecerli JSON."""
    def _fix(m: "re.Match") -> str:
        return m.group(1) + _UNQUOTED_URL_RE.sub(r'\1"\2"', m.group(2)) + m.group(3)
    return _JSONLD_RE.sub(_fix, html)


def discover_product_urls() -> list[str]:
    sitemap = f"{SITE_BASE}/sitemap.xml"
    print(f"[1/3] Sitemap cekiliyor: {sitemap}", flush=True)
    xml = base.fetch_sitemap(sitemap)
    if not xml:
        print("  HATA: sitemap alinamadi.", file=sys.stderr)
        return []
    locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml)
    # 2026-07-01: animalturkiye.com/sitemap.xml artik kaynak site vitafy.com.tr'nin
    # urun URL'lerini listeliyor (path /urun/, ESKI /urunler/ degil) — bu yuzden
    # eski "/urunler/" filtresi 0 URL donduruyordu. Her iki deseni de kabul et.
    # (animalturkiye = vitafy klonu, store#75 — bkz. memory animalturkiye-vitafy-store75.)
    urls = [u for u in dict.fromkeys(locs) if "/urun/" in u or "/urunler/" in u]
    print(f"  {len(locs)} URL -> {len(urls)} urun URL'i", flush=True)
    return urls


def _fetch(url: str) -> str | None:
    """Once duz HTTP (hizli), JSON-LD yoksa stealth servis fallback."""
    html = base.fetch_plain(url)
    if html and "application/ld+json" in html:
        return html
    res = base.scrape(url, mode="stealthy")
    return res.html if res.ok else None


def run(limit: int = 0, delay: float = 0.3) -> list[dict]:
    print(f"animalturkiye (ozel/JSON-LD) scraper: {SITE_BASE}")
    print("=" * 55)
    urls = discover_product_urls()
    if not urls:
        print("HATA: urun URL'i bulunamadi.", file=sys.stderr)
        raise SystemExit(1)
    if limit > 0:
        urls = urls[:limit]
        print(f"  --limit aktif: ilk {limit} URL", flush=True)

    output_file = resolve_output("animalturkiye_products.json")
    print(f"\n[2/3] {len(urls)} urun detay sayfasi cekiliyor...", flush=True)
    products: list[dict] = []
    failed: list[str] = []
    started = time.time()
    for i, url in enumerate(urls, 1):
        html = _fetch(url)
        if not html:
            failed.append(url)
            print(f"  [{i}/{len(urls)}] FETCH FAIL: {url[-50:]}", flush=True)
            continue
        product = base.parse_product(_repair_jsonld(html), url, VENDOR, DEFAULT_CATEGORY)
        if not product or not product.get("original_price"):
            failed.append(url)
            print(f"  [{i}/{len(urls)}] no-jsonld/no-price: {url[-50:]}", flush=True)
            continue
        # Aciklamadaki base64 gomulu gorselleri temizle (DB truncate korumasi)
        product["description_html"] = _clean_desc(product.get("description_html", ""))
        product["description_text"] = _clean_desc(product.get("description_text", ""))
        products.append(product)
        if i == 1 or i % 10 == 0 or i == len(urls):
            elapsed = time.time() - started
            print(
                f"  [{i}/{len(urls)}] {product['name'][:40]} | "
                f"{product['original_price']} TL | {'STOK' if product['available'] else 'YOK'}",
                flush=True,
            )
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


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Sadece ilk N urun (test)")
    args = parser.parse_args()
    run(limit=args.limit)
