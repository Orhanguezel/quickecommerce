import json
import sys
import unittest
from unittest.mock import Mock, patch
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ticimax_brand_scraper import parse_product, category_for, extract_content, fetch_html


def html(brand='Yonex', stock=9, model_patch=None):
    variant = dict(id=101, stokAdedi=stock, aktif=True, anaUrun=False,
                   satisFiyati=657.5, satisKDV=131.5, barkod='123')
    model = dict(productId=1, brandName=brand, productCurrency='TRY', productActive=True,
                 products=[dict(variant, id=100, stokAdedi=0, anaUrun=True), variant],
                 productVariantData=[dict(urunID=101, tanim='L0')])
    model.update(model_patch or {})
    ld = {'@type':'Product', 'name':'Test racket', 'brand':{'name':brand},
          'description':'Racket', 'offers':{'price':'789.00'}, 'image':'https://example.com/image.jpg'}
    return '<script type="application/ld+json">'+json.dumps(ld)+'</script><script>var productDetailModel = '+json.dumps(model)+';</script>'

class TicimaxTests(unittest.TestCase):
    def test_local_service_rate_limit_waits_then_retries(self):
        limited = Mock(status_code=429, headers={'Retry-After': '30'})
        success = Mock(status_code=200)
        success.json.return_value = {'success': True, 'status_code': 200, 'html': '<html>product</html>'}
        with patch.dict('os.environ', {'LOCAL_SCRAPER_API_KEY': 'test', 'LOCAL_SCRAPER_URL': 'http://127.0.0.1:8200'}), \
                patch('ticimax_brand_scraper.requests.post', side_effect=[limited, success]), \
                patch('ticimax_brand_scraper.time.sleep') as sleep:
            self.assertEqual(fetch_html('https://www.heynut.com.tr/product'), '<html>product</html>')
            sleep.assert_called_once_with(30)

    def test_native_panels_supply_description_and_specs_when_jsonld_is_empty(self):
        content = '''<div id="divOnyazi"><p>Fıstık ezmesi</p></div>
        <div id="divTabOzellikler"><table><tr><td>Ağırlık</td><td>195 g</td></tr></table></div>
        <div id="divTabOdemeSecenekleri">Taksit 999 TL</div>
        <div id="divUrunOzellikAlani"><li class="Tab_1"><a>Saklama Koşulları</a>
        <div class="urunDetayPanel">Serin yerde saklayınız.</div></li></div>'''
        result = extract_content(content)
        self.assertIn('Fıstık ezmesi', result['description_text'])
        self.assertIn('Saklama Koşulları', result['description_text'])
        self.assertNotIn('999', result['description_text'])
        self.assertEqual(result['specifications'], [{'name': 'Ağırlık', 'value': '195 g'}])

    def test_content_removes_active_html_and_retains_jsonld_fallback(self):
        result = extract_content('''<div id="divTabOzellikler"><p onclick="bad()">Açıklama</p>
        <script>bad()</script><img src=x onerror="bad()"><a href="javascript:bad()">Bilgi</a></div>''')
        self.assertNotIn('bad()', result['description_html'])
        self.assertNotIn('<img', result['description_html'])
        self.assertIn('Bilgi', result['description_text'])
        self.assertEqual(extract_content('<html></html>', '<p>Yedek açıklama</p>')['description_text'], 'Yedek açıklama')
        self.assertEqual(extract_content('<div id="divTabOzellikler"></div>', 'Yedek açıklama')['description_text'], 'Yedek açıklama')

    def test_vat_and_selectable_variant_stock(self):
        p=parse_product(html(), 'https://www.raketspor.com.tr/yonex-racket', 'raketspor_yonex')
        self.assertEqual(p['original_price'], 789)
        self.assertEqual(len(p['variants']), 1)
        self.assertEqual(p['variants'][0]['option1'], 'L0')
        self.assertEqual(p['stock_quantity'], 9)

    def test_other_brand_rejected(self):
        with self.assertRaises(ValueError):
            parse_product(html(brand='Joma'), 'https://www.raketspor.com.tr/test', 'raketspor_yonex')

    def test_zero_and_inactive_stock(self):
        for h in [html(stock=0),html(model_patch={'productActive':False})]:
            self.assertFalse(parse_product(h,'https://www.raketspor.com.tr/test','raketspor_yonex')['available'])

    def test_missing_model_not_assumed_in_stock(self):
        with self.assertRaises(ValueError):
            parse_product('<html>challenge</html>','https://www.heynut.com.tr/test','heynut')

    def test_discount_and_currency(self):
        v=dict(id=156,stokAdedi=1,aktif=True,satisFiyati=316.8317,satisKDV=3.168317,
               indirimliFiyati=178.2178,indirimliKDV=1.782178)
        h=html('HeynuT',model_patch={'products':None,'productVariantData':None,'product':v})
        p=parse_product(h,'https://www.heynut.com.tr/test','heynut')
        self.assertEqual((p['original_price'],p['discounted_price']),(320,180))
        with self.assertRaises(ValueError):
            parse_product(html(model_patch={'productCurrency':'USD'}),'https://www.raketspor.com.tr/test','raketspor_yonex')

    def test_categories_follow_the_actual_product_type(self):
        self.assertEqual(category_for('raketspor_yonex', 'Yonex Tenis Şort Etek Beyaz'), 'Spor Giyim')
        self.assertEqual(category_for('raketspor_yonex', 'Yonex YW0053 Kadın Atleti'), 'Spor Giyim')
        self.assertEqual(category_for('heynut', 'HeynuT Hurma Pekmezi'), 'Bal & Pekmez')
        self.assertEqual(category_for('heynut', 'HeynuT Hindistan Cevizi Yağı'), 'Hindistan Cevizi Yağı')
