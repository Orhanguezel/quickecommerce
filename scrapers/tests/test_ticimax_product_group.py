import copy
import json
from pathlib import Path
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ticimax_brand_scraper import parse_product

class ProductGroupTest(unittest.TestCase):
    def setUp(self):
        self.model = json.loads((Path(__file__).parent / 'fixtures/yonex-product-group.json').read_text())

    def parse(self, kind='ProductGroup', group_id='12279'):
        schema = {'@type': kind, 'productGroupID': group_id, 'name': 'Yonex Vcore 100', 'image': []}
        html = '<script type="application/ld+json">' + json.dumps(schema) + '</script><script>var productDetailModel = ' + json.dumps(self.model) + ';</script>'
        return parse_product(html, 'https://www.raketspor.com.tr/yonex-vcore', 'raketspor_yonex')

    def test_real_group_uses_selectable_variants_and_vat_inclusive_price(self):
        product = self.parse()
        self.assertEqual([v['source_variant_id'] for v in product['variants']], ['68278', '68279', '68280'])
        self.assertEqual([v['stock_quantity'] for v in product['variants']], [0, 0, 3])
        self.assertEqual([v['price'] for v in product['variants']], [16607.0] * 3)

    def test_existing_product_format_unchanged(self):
        self.assertEqual(self.parse('Product')['variants'], self.parse()['variants'])

    def test_wrong_group_rejected(self):
        with self.assertRaisesRegex(ValueError, 'does not match'):
            self.parse(group_id='different')

    def test_missing_stock_rejected(self):
        del self.model['products'][1]['stokAdedi']
        with self.assertRaisesRegex(ValueError, 'stock evidence'):
            self.parse()

    def test_wrong_brand_rejected(self):
        self.model['brandName'] = 'Other'
        with self.assertRaisesRegex(ValueError, 'Unexpected brand'):
            self.parse()

if __name__ == '__main__':
    unittest.main()
