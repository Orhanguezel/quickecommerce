"""
eprotein.com.tr Urun Scraper (IdeaSoft + Cloudflare, Scrapling stealth)
-----------------------------------------------------------------------
eprotein.com.tr sporcu besinleri sitesidir. IdeaSoft altyapisi SERT bir
Cloudflare duvari arkasindadir -> duz curl/requests 403 doner; tum istekler
scraper-service stealth tarayicisi uzerinden gider.

Urun URL'leri /sitemap.xml -> sitemap/products/N.xml zincirinden kesfedilir,
her urun sayfasindaki JSON-LD `Product` parse edilir.

Kullanim:
  SCRAPER_URL=https://scraper.guezelwebdesign.com \\
  SCRAPER_API_KEY=scraper-sportoonline-... \\
    python3 scrapers/eprotein_scraper.py [--limit 5]

Cikti: data/source-products/eprotein_products.json
"""

import argparse

from ideasoft_scraper import run
from shopify_scraper import resolve_output

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Sadece ilk N urun (test icin)")
    args = parser.parse_args()

    run(
        site_base="https://www.eprotein.com.tr",
        output_file=resolve_output("eprotein_products.json"),
        vendor="eProtein",
        default_category="Sporcu Besinleri",
        limit=args.limit,
        # eprotein Cloudflare'i agresif rate-limit eder (429). Istekler arasi
        # daha buyuk gecikme + ideasoft_scraper'daki 429 backoff retry birlikte.
        delay=1.5,
    )
