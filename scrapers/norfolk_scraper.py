"""
Norfolk.com.tr Urun Scraper (Shopify JSON API)
-------------------------------------------------
Kullanim:
    python norfolk_scraper.py            # fiyat/stok (hizli, gorselsiz)
    python norfolk_scraper.py --images   # ilk import icin gorsellerle
Cikti: norfolk_products.json (repo'da data/source-products/ altina)
"""

import sys

from shopify_scraper import resolve_image_dir, resolve_output, run

if __name__ == "__main__":
    run(
        base_url="https://norfolk.com.tr",
        output_file=resolve_output("norfolk_products.json"),
        vendor="Norfolk",
        default_category="Çorap & Giyim",
        image_dir=resolve_image_dir("norfolk_images"),
        with_images="--images" in sys.argv,
    )
