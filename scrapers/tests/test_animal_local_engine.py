import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch
from urllib.error import HTTPError
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import animalturkiye_scraper as scraper

class LocalEngineTest(unittest.TestCase):
    def engine_response(self, status, html):
        response = Mock()
        response.json.return_value = {'success':True,'status_code':status,'html':html,'cache_hit':False}
        return response

    @patch.object(scraper, 'load_repo_env')
    @patch.dict(os.environ, {'LOCAL_SCRAPER_URL':'http://127.0.0.1:8200','LOCAL_SCRAPER_API_KEY':'test-key'})
    def test_blocked_http_retries_local_stealth_engine(self, _load):
        with patch.object(scraper.urllib.request,'urlopen',side_effect=HTTPError(scraper.SITE,403,'Forbidden',{},None)), patch.object(scraper.requests,'post',return_value=self.engine_response(200,'<html>verified product</html>')) as post:
            self.assertEqual(scraper.fetch(scraper.SITE),'<html>verified product</html>')
            self.assertEqual(post.call_args.args[0],'http://127.0.0.1:8200/api/v1/scrape')
            self.assertTrue(post.call_args.kwargs['json']['options']['solve_cloudflare'])
            self.assertEqual(post.call_args.kwargs['headers']['Cache-Control'],'no-cache')

    @patch.object(scraper, 'load_repo_env')
    @patch.dict(os.environ, {'LOCAL_SCRAPER_URL':'http://127.0.0.1:8200','LOCAL_SCRAPER_API_KEY':'test-key'})
    def test_engine_transport_success_does_not_accept_supplier_block(self, _load):
        for status in [403,200]:
            with self.subTest(status=status), patch.object(scraper.requests,'post',return_value=self.engine_response(status,'Sorry, you have been blocked')):
                self.assertIsNone(scraper.fetch_with_local_engine(scraper.SITE))

    def test_incomplete_discovery_rejected(self):
        with patch.object(scraper,'fetch',side_effect=[None,'<a href="/urun/product/">Product</a>']):
            self.assertEqual(scraper.discover_slugs(),[])

    def test_partial_products_do_not_replace_existing_output(self):
        with tempfile.TemporaryDirectory() as directory:
            output=Path(directory)/'products.json';output.write_text('previous complete catalogue')
            with patch.object(sys,'argv',['scraper','--workers','1','--output',str(output)]), patch.object(scraper,'discover_slugs',return_value=['a','b']), patch.object(scraper,'fetch',return_value='html'), patch.object(scraper,'parse_product',side_effect=[{'available':True},None,None]):
                self.assertEqual(scraper.main(),1)
            self.assertEqual(output.read_text(),'previous complete catalogue')

if __name__=='__main__':unittest.main()
