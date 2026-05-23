"""
ProteinMax.com.tr Urun Scraper (OpenCart)
-------------------------------------------------
Kullanim:
    python proteinmax_scraper.py              # tum katalog (fiyat/stok)
    python proteinmax_scraper.py --limit=10   # test: ilk 10 urun
    python proteinmax_scraper.py --images     # ilk import icin gorsellerle
Cikti: proteinmax_products.json (repo'da data/source-products/ altina)

Not: proteinmax urun sayfalari JSON-LD gommaz; opencart_scraper HTML fiyat
markup'ina duser. Urun URL deseni `{slug}-{id}.html`.
"""

import sys

from opencart_scraper import resolve_image_dir, resolve_output, run

if __name__ == "__main__":
    limit = None
    for arg in sys.argv[1:]:
        if arg.startswith("--limit="):
            limit = int(arg.split("=", 1)[1])

    run(
        base_url="https://www.proteinmax.com.tr",
        sitemap_url="https://www.proteinmax.com.tr/sitemap.xml",
        output_file=resolve_output("proteinmax_products.json"),
        vendor="ProteinMax",
        default_category="Sporcu Besinleri",
        url_pattern=r"-\d+\.html$",  # yalniz urun URL'leri (kategori/sayfa elenir)
        image_dir=resolve_image_dir("proteinmax_images"),
        with_images="--images" in sys.argv,
        limit=limit,
    )
