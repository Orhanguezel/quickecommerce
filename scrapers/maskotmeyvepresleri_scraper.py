"""
Maskotmeyvepresleri.com Urun Scraper (WooCommerce Store API)
-------------------------------------------------
Kullanim:
    python maskotmeyvepresleri_scraper.py            # fiyat/stok (hizli, gorselsiz)
    python maskotmeyvepresleri_scraper.py --images   # ilk import icin gorsellerle
Cikti: maskotmeyvepresleri_products.json (repo'da data/source-products/ altina)
"""

import sys

from woocommerce_scraper import resolve_image_dir, resolve_output, run

if __name__ == "__main__":
    run(
        base_url="https://www.maskotmeyvepresleri.com",
        output_file=resolve_output("maskotmeyvepresleri_products.json"),
        vendor="Maskot Meyve Presleri",
        default_category="Meyve Sıkacağı",
        image_dir=resolve_image_dir("maskotmeyvepresleri_images"),
        with_images="--images" in sys.argv,
    )
