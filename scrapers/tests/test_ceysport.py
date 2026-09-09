import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import ceysport_scraper as scraper
import requests
from bs4 import BeautifulSoup


class CeysportTests(unittest.TestCase):
    def test_transport_switches_after_block(self):
        session = Mock()
        session._ceysport_use_curl = False
        session.get.side_effect = requests.HTTPError('403')
        with patch.object(scraper.subprocess, 'run', return_value=Mock(stdout='<xml/>')) as curl:
            self.assertEqual(scraper._fetch_text(session, scraper.SITEMAP_INDEX), '<xml/>')
            scraper._fetch_text(session, scraper.SITEMAP_INDEX)
        self.assertEqual(session.get.call_count, 1)
        self.assertEqual(curl.call_count, 2)

    def test_missing_child_sitemap_fails_entire_discovery(self):
        index = '<sitemapindex><sitemap><loc>https://ceysport.com/product-sitemap.xml</loc></sitemap></sitemapindex>'
        with patch.object(scraper, '_fetch_text', side_effect=[index, requests.HTTPError('403')]):
            with self.assertRaises(requests.HTTPError):
                scraper._discover_urls(Mock())

    def test_challenge_page_is_not_a_sitemap(self):
        with self.assertRaises(ValueError):
            scraper._sitemap_locs('<html><body>Challenge</body></html>')

    def test_stock_requires_positive_evidence(self):
        for markup, expected in [('', False), ('<p class="stock">Sipariş verilebilir</p>', False),
                                 ('<p class="stock out-of-stock">Tükendi</p>', False),
                                 ('<p class="stock in-stock">5 adet stokta</p>', True)]:
            with self.subTest(markup=markup):
                self.assertEqual(scraper._parse_stock(BeautifulSoup(markup, 'html.parser')), expected)

    def test_limited_run_cannot_replace_full_output(self):
        with patch.object(sys, 'argv', ['ceysport_scraper.py', '--limit=3']):
            with self.assertRaises(SystemExit) as result:
                scraper.main()
        self.assertEqual(result.exception.code, 2)


if __name__ == '__main__':
    unittest.main()
