import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ideasoft_scraper import parse_product


def product_html(products=None, attributes=None):
    ld = {
        "@type": "Product",
        "name": "Test Eldiven",
        "sku": "PARENT",
        "offers": {"price": "845.00", "availability": "https://schema.org/InStock"},
        "image": "https://example.com/glove.jpg",
    }
    model = {
        "productId": 99,
        "productActive": True,
        "products": products,
        "productVariantData": attributes,
    }
    return (
        '<script type="application/ld+json">' + json.dumps(ld) + '</script>'
        '<script>var productDetailModel = ' + json.dumps(model, ensure_ascii=False) + ';</script>'
    )


class IdeaSoftVariantTests(unittest.TestCase):
    def test_colour_size_variants_keep_exact_price_stock_and_sku(self):
        products = [
            {"id": 10, "anaUrun": False, "aktif": True, "stokAdedi": 4,
             "stokKodu": "RED-M", "barkod": "111", "satisFiyati": 900, "satisKDV": 90,
             "indirimliFiyati": 0, "indirimliKDV": 0},
            {"id": 11, "anaUrun": False, "aktif": True, "stokAdedi": 0,
             "stokKodu": "BLACK-L", "barkod": "222", "satisFiyati": 1000, "satisKDV": 100,
             "indirimliFiyati": 800, "indirimliKDV": 80},
        ]
        attributes = [
            {"urunID": 10, "ekSecenekTipiTanim": "Renk", "tanim": "Kırmızı"},
            {"urunID": 10, "ekSecenekTipiTanim": "Beden", "tanim": "M"},
            {"urunID": 11, "ekSecenekTipiTanim": "Renk", "tanim": "Siyah"},
            {"urunID": 11, "ekSecenekTipiTanim": "Beden", "tanim": "L"},
        ]
        result = parse_product(product_html(products, attributes), "https://example.com/glove", "eProtein", "Spor")

        self.assertEqual(len(result["variants"]), 2)
        self.assertEqual(result["variants"][0]["sku"], "RED-M")
        self.assertEqual(result["variants"][0]["stock_quantity"], 4)
        self.assertEqual((result["variants"][0]["option1"], result["variants"][0]["option2"]), ("Kırmızı", "M"))
        self.assertEqual(result["variants"][1]["price"], 880)
        self.assertEqual(result["variants"][1]["compare_at_price"], 1100)
        self.assertFalse(result["variants"][1]["available"])
        self.assertEqual(result["options"], [
            {"name": "Renk", "values": ["Kırmızı", "Siyah"]},
            {"name": "Beden", "values": ["M", "L"]},
        ])

    def test_single_product_keeps_jsonld_fallback(self):
        products = [{"id": 10, "anaUrun": True, "aktif": True, "stokAdedi": 5}]
        result = parse_product(product_html(products, []), "https://example.com/glove", "eProtein", "Spor")
        self.assertEqual(len(result["variants"]), 1)
        self.assertEqual(result["variants"][0]["title"], "Default Title")
        self.assertEqual(result["variants"][0]["price"], 845)

    def test_incomplete_variant_mapping_is_rejected(self):
        products = [
            {"id": 10, "anaUrun": False, "aktif": True, "stokAdedi": 1,
             "stokKodu": "A", "satisFiyati": 100, "satisKDV": 10},
            {"id": 11, "anaUrun": False, "aktif": True, "stokAdedi": 1,
             "stokKodu": "B", "satisFiyati": 100, "satisKDV": 10},
        ]
        with self.assertRaisesRegex(ValueError, "mapping is incomplete"):
            parse_product(product_html(products, [{"urunID": 10, "tanim": "M"}]),
                          "https://example.com/glove", "eProtein", "Spor")


if __name__ == "__main__":
    unittest.main()
