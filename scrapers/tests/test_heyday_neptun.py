import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import heyday_scraper
import neptun_scraper


def heyday_html(stock=10, include_stock=True):
    schema = {
        "@type": "Product",
        "name": "Protein Gummies 60g x 6 adet",
        "description": "Proteinli atıştırmalık",
        "image": ["https://cdn.example.test/gummies.webp"],
    }
    variant = {
        "id": "variant-1",
        "sku": "HD-002",
        "barcodeList": ["8684072911147"],
        "isActive": True,
        "prices": [{"currencyCode": "TRY", "sellPrice": 860, "discountPrice": 499}],
        "variantValues": [{"name": "Karışık"}],
    }
    if include_stock:
        variant["stock"] = stock
    next_data = {
        "props": {"pageProps": {"pageSpecificData": {
            "id": "product-1",
            "name": "Protein Gummies 60g x 6 adet",
            "description": "<p>Proteinli atıştırmalık</p>",
            "variants": [variant],
        }}},
    }
    return (
        '<script type="application/ld+json">' + json.dumps(schema) + "</script>"
        '<script id="__NEXT_DATA__" type="application/json">' + json.dumps(next_data) + "</script>"
    )


class HeydayTests(unittest.TestCase):
    def test_exact_discount_stock_and_variant_are_parsed(self):
        product = heyday_scraper.parse_product(
            heyday_html(), "https://heydaytr.com/protein-gummies-60g-x-6-adet"
        )
        self.assertEqual((product["original_price"], product["discounted_price"]), (860, 499))
        self.assertEqual(product["stock_quantity"], 10)
        self.assertEqual(product["variants"][0]["option1"], "Karışık")
        self.assertEqual(product["variants"][0]["barcode"], "8684072911147")

    def test_missing_stock_evidence_fails_closed(self):
        with self.assertRaisesRegex(ValueError, "stock evidence missing"):
            heyday_scraper.parse_product(
                heyday_html(include_stock=False), "https://heydaytr.com/product"
            )


class NeptunTests(unittest.TestCase):
    def detail_html(self, include_button=True):
        controls = (
            '<button class="add-basket">SEPETE EKLE</button>'
            '<input type="hidden" name="urun_id" value="7">'
            if include_button else ""
        )
        return f'''<html><head><title>Neptune Krill Oil | Neptün</title></head><body>
        <section id="product-detail"><img class="main-img" src="/product.jpg">
        <p class="real-price">1.740,00 TL</p>{controls}
        <div class="desc"><p>Krill yağı içeren takviye edici gıda.</p></div></section>
        </body></html>'''

    def test_price_content_and_positive_stock_evidence(self):
        product = neptun_scraper.parse_product(
            self.detail_html(), "https://www.neptun.com.tr/urunler/neptune-krill-oil-7"
        )
        self.assertEqual(product["name"], "Neptune Krill Oil")
        self.assertEqual(product["original_price"], 1740)
        self.assertEqual(product["stock_quantity"], 1)
        self.assertIn("Krill yağı", product["description_text"])

    def test_missing_add_to_basket_is_out_of_stock(self):
        product = neptun_scraper.parse_product(
            self.detail_html(include_button=False),
            "https://www.neptun.com.tr/urunler/neptune-krill-oil-7",
        )
        self.assertFalse(product["available"])
        self.assertEqual(product["variants"][0]["stock_quantity"], 0)


if __name__ == "__main__":
    unittest.main()
