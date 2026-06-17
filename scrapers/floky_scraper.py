"""
floky.tr Urun Scraper (Shopify JSON API)
-------------------------------------------------
floky.tr saf bir Shopify magazasidir (Floky Socks — kaydirmaz/spor corap).
`/products.json` + koleksiyonlar uzerinden tum katalog cekilir; cikti semasi
everlast/norfolk/superstacy ile birebir aynidir -> sync:source-prices ve
import:products komutlari degisiklik gerektirmez.

Kullanim:
    python floky_scraper.py            # fiyat/stok (hizli, gorselsiz)
    python floky_scraper.py --images   # ilk import icin gorsellerle
Cikti: floky_products.json (repo'da data/source-products/ altina)
"""

import sys

from shopify_scraper import resolve_image_dir, resolve_output, run

if __name__ == "__main__":
    run(
        base_url="https://floky.tr",
        output_file=resolve_output("floky_products.json"),
        vendor="Floky",
        default_category="Çorap",
        image_dir=resolve_image_dir("floky_images"),
        with_images="--images" in sys.argv,
    )
