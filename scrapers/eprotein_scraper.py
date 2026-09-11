"""
eprotein.com.tr Urun Scraper (Ticimax + Cloudflare, Scrapling stealth)
-----------------------------------------------------------------------
eprotein.com.tr SERT bir Cloudflare duvari arkasinda -> duz curl/requests 403
doner; tum istekler scraper-service stealth tarayicisi uzerinden ve
**solve_cloudflare=true** ile gider (bu bayrak olmadan CF challenge sayfasi
doner, 2026-07-27'de "scraper olu" teshisinin gercek sebebi buydu).

2026-07-27 KAPSAM DEGISIKLIGI (kullanici karari):
  Bu magazadan artik SADECE "Spor & Outdoor" kategorisi cekilir — egzersiz
  ekipmanlari, direnc lastikleri, matlar, aksesuarlar. Supplement/sporcu
  besinleri CEKILMEZ (o taraf baska kaynaklardan zaten geliyor).
  Cikan urunler eProtein magazasina degil **multiprice (store#41)** altina
  import edilir.

Urun kesfi: sitemap urun slug havuzu ∩ kategori sayfasindaki href'ler
(bkz. ideasoft_scraper.discover_category_product_urls).

Kullanim:
  SCRAPER_URL=http://127.0.0.1:8200 \\
  SCRAPER_API_KEY=scraper-sportoonline-internal-... \\
    python3 scrapers/eprotein_scraper.py [--limit 5] [--all-categories]

Cikti: data/source-products/eprotein_products.json
"""

import argparse

from ideasoft_scraper import run
from shopify_scraper import resolve_output

# Sadece bu kategori agaci cekilir. Alt kategoriler (shaker, agirlik eldiveni,
# spor giyim ...) zaten /spor-outdoor listesinde gorundugu icin tek path yeterli;
# eksik kalirsa buraya alt path eklenir.
SPOR_OUTDOOR_PATHS = ["/spor-outdoor"]

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Sadece ilk N urun (test icin)")
    parser.add_argument(
        "--all-categories",
        action="store_true",
        help="Kategori filtresini kapat, TUM magazayi tara (supplementler dahil)",
    )
    args = parser.parse_args()

    run(
        site_base="https://www.eprotein.com.tr",
        output_file=resolve_output("eprotein_products.json"),
        vendor="eProtein",
        default_category="Spor & Outdoor",
        limit=args.limit,
        # eprotein Cloudflare'i agresif rate-limit eder (429). Istekler arasi
        # daha buyuk gecikme + ideasoft_scraper'daki 429 backoff retry birlikte.
        delay=1.5,
        category_paths=None if args.all_categories else SPOR_OUTDOOR_PATHS,
    )
