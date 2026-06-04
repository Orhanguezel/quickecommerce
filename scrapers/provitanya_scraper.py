"""
Provitanya.com Urun Scraper (OpenCart, JSON-LD)
-------------------------------------------------
Kullanim:
    python provitanya_scraper.py              # tum katalog (fiyat/stok)
    python provitanya_scraper.py --limit=10   # test: ilk 10 urun
    python provitanya_scraper.py --images     # ilk import icin gorsellerle
Cikti: provitanya_products.json (repo'da data/source-products/ altina)
"""

import sys

from opencart_scraper import resolve_image_dir, resolve_output, run

if __name__ == "__main__":
    limit = None
    for arg in sys.argv[1:]:
        if arg.startswith("--limit="):
            limit = int(arg.split("=", 1)[1])

    run(
        base_url="https://www.provitanya.com",
        # 2026-06-04: extension/feed/google_sitemap eklentisi 404 doniyor (10 gun
        # sessiz fail). Standart /sitemap.xml index'i product URL'lerini iceriyor;
        # urun-disi URL'leri url_pattern ile eler.
        sitemap_url="https://www.provitanya.com/sitemap.xml",
        output_file=resolve_output("provitanya_products.json"),
        vendor="Provitanya",
        default_category="Sağlık & Sporcu Besinleri",
        url_pattern=r"^https://www\.provitanya\.com/[^/?#]+$",
        image_dir=resolve_image_dir("provitanya_images"),
        with_images="--images" in sys.argv,
        limit=limit,
    )
