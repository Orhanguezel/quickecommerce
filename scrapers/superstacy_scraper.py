"""
Superstacy.com.tr Urun Scraper (Shopify JSON API)
-------------------------------------------------
Kullanim:
    python superstacy_scraper.py            # fiyat/stok (hizli, gorselsiz)
    python superstacy_scraper.py --images   # ilk import icin gorsellerle
Cikti: superstacy_products.json (repo'da data/source-products/ altina)
"""

import sys

from shopify_scraper import resolve_image_dir, resolve_output, run

if __name__ == "__main__":
    run(
        base_url="https://www.superstacy.com.tr",
        output_file=resolve_output("superstacy_products.json"),
        vendor="Superstacy",
        default_category="Giyim",
        image_dir=resolve_image_dir("superstacy_images"),
        with_images="--images" in sys.argv,
    )
