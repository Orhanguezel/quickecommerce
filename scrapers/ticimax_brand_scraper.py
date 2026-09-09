"""Verified Ticimax model scraper for Heynut and Yonex at Raketspor.

Only complete runs replace the canonical output. Limited runs require a separate
output. Browser work is restricted to the local sportoonline scraper service.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
import os
import re
import time
from pathlib import Path
from urllib.parse import urljoin, urlsplit
from xml.etree import ElementTree

import requests
from bs4 import BeautifulSoup
from ideasoft_scraper import parse_product as parse_base
from shopify_scraper import resolve_output

SOURCES = {
    'heynut': ('https://www.heynut.com.tr', 'HeynuT', 'Fıstık Ezmeleri'),
    'raketspor_yonex': ('https://www.raketspor.com.tr', 'Yonex', 'Tenis & Badminton'),
}


def model_from_html(html):
    match = re.search(r'\bvar\s+productDetailModel\s*=\s*', html)
    if not match:
        raise ValueError('Ticimax product model missing')
    model = json.JSONDecoder().raw_decode(html[match.end():])[0]
    if not isinstance(model, dict) or not model.get('productId'):
        raise ValueError('Invalid product model')
    return model


def category_for(source, name):
    name = name.casefold()
    if source == 'raketspor_yonex':
        clothing = any(word in name for word in ['ayakkabı', 'ayakkabi', 'şort', 'sort ', 'tshirt', 'tişört', 'atlet', 'tayt', 'bra ', 'brası', 'etek', 'çorap', 'corap', 'eşofman', 'esofman', 'mont ', 'ceket'])
        return 'Spor Giyim' if clothing else ('Badminton' if 'badminton' in name else ('Tenis & Badminton' if 'raket' in name else 'Tenis Aksesuarları'))
    elif 'yağı' in name:
        return 'Hindistan Cevizi Yağı'
    elif 'pekmezi' in name or 'balı' in name:
        return 'Bal & Pekmez'
    elif 'ezmesi' not in name:
        return 'Kuruyemişler'
    return SOURCES[source][2]


def parse_product(html, url, source):
    _, brand, category = SOURCES[source]
    model = model_from_html(html)
    if str(model.get('brandName', '')).casefold() != brand.casefold():
        raise ValueError(f'Unexpected brand at {url}')
    data = parse_base(html, url, brand, category)
    if not data:
        raise ValueError(f'Product JSON-LD missing: {url}')
    if str(model.get('productCurrency', '')).upper() not in {'TRY', 'TL'}:
        # Some Ticimax installations provide a currency object.
        currency = model.get('productCurrency')
        if not isinstance(currency, dict) or currency.get('dovizKodu') != 'TRY':
            raise ValueError(f'Unsupported currency: {url}')
    variants = []
    raw_variants = model.get('products') or [model.get('product')]
    attributes = model.get('productVariantData') or []
    for raw in raw_variants:
        if not isinstance(raw, dict):
            raise ValueError('Variant model missing')
        selected = [a for a in attributes if a.get('urunID') == raw.get('id')]
        if attributes and raw.get('anaUrun') and not selected:
            continue  # Parent record is not a selectable size/colour.
        if attributes and not selected:
            raise ValueError(f'Variant options missing: {url}')
        if len(selected) > 3:
            raise ValueError('More than three option dimensions')
        if 'stokAdedi' not in raw or 'aktif' not in raw:
            raise ValueError('Variant stock evidence missing')
        original = round(float(raw['satisFiyati']) + float(raw['satisKDV']), 2)
        discount = round(float(raw.get('indirimliFiyati', 0)) + float(raw.get('indirimliKDV', 0)), 2)
        price = discount if 0 < discount < original else original
        if price <= 0:
            raise ValueError('Invalid variant price')
        quantity = max(0, int(float(raw['stokAdedi']))) if raw['aktif'] and model.get('productActive') else 0
        labels = [str(a['tanim']) for a in selected]
        variants.append({
            'source_variant_id': str(raw['id']),
            'sku': f"{source.upper()}-{raw['id']}",
            'barcode': raw.get('barkod') or '',
            'title': ' / '.join(labels) or 'Default Title',
            'price': price, 'compare_at_price': original if price < original else None,
            'available': quantity > 0, 'stock_quantity': quantity,
            **{f'option{i+1}': labels[i] if i < len(labels) else None for i in range(3)},
        })
    if not variants:
        raise ValueError('No selectable variants')
    lowest = min((v for v in variants if v['available']), key=lambda v: v['price'], default=None)
    lowest = lowest or min(variants, key=lambda v: v['price'])
    images = [i['bigImagePath'] for i in model.get('productImages', [])
              if i.get('active') and i.get('bigImagePath') and i.get('imageType') == 1]
    data.update({
        'source_product_id': str(model['productId']), 'vendor': brand,
        'sku': lowest['sku'], 'variants': variants,
        'original_price': lowest['compare_at_price'] or lowest['price'],
        'discounted_price': lowest['price'] if lowest['compare_at_price'] else None,
        'available': any(v['available'] for v in variants),
        'stock_quantity': sum(v['stock_quantity'] for v in variants),
        'all_image_urls': list(dict.fromkeys(images or data['all_image_urls'])),
    })
    data['category'] = category_for(source, data['name'])
    data['thumbnail_url'] = data['all_image_urls'][0] if data['all_image_urls'] else ''
    return data


def fetch_html(url):
    # A single local browser request at a time; no external VPS fallback.
    endpoint = os.environ.get('LOCAL_SCRAPER_URL', 'http://127.0.0.1:8200').rstrip('/')
    if urlsplit(endpoint).hostname not in {'127.0.0.1', 'localhost'}:
        raise ValueError('Use the isolated local sportoonline scraper service')
    key = os.environ.get('LOCAL_SCRAPER_API_KEY') or os.environ.get('SCRAPER_API_KEY')
    if not key:
        raise ValueError('Local scraper credentials missing')
    for attempt in range(3):
        try:
            response = requests.post(endpoint + '/api/v1/scrape',
                headers={'Authorization': 'Bearer ' + key},
                json={'url': url, 'mode': 'stealthy', 'options': {
                    'headless': True, 'network_idle': False, 'timeout': 60,
                    'solve_cloudflare': True}, 'return_html': True}, timeout=95)
            response.raise_for_status()
            result = response.json()
            if not result.get('success') or result.get('status_code') != 200 or not result.get('html'):
                raise ValueError('Scraper returned blocked or empty content')
            return result['html']
        except (requests.RequestException, ValueError):
            if attempt == 2:
                raise
            time.sleep(5 * (attempt + 1))


def sitemap_urls(base):
    def locs(url):
        r = requests.get(url, timeout=(10, 30)); r.raise_for_status()
        return [e.text.strip() for e in ElementTree.fromstring(r.text).iter()
                if e.tag.rsplit('}', 1)[-1] == 'loc' and e.text]
    maps = [u for u in locs(base + '/sitemap.xml') if '/products/' in u]
    if not maps:
        raise ValueError('Product sitemap missing')
    urls = []
    for sitemap in maps:
        children = locs(sitemap)
        if not children:
            raise ValueError('Empty product sitemap')
        urls.extend(children)
    return list(dict.fromkeys(urls))


def discover(source):
    base, _, _ = SOURCES[source]
    if source == 'heynut':
        urls = sitemap_urls(base)
    else:
        urls = []
        page = base + '/yonex'
        visited = set()
        while page not in visited:
            visited.add(page)
            soup = BeautifulSoup(fetch_html(page), 'html.parser')
            found = [urljoin(base, a['href']) for a in soup.select('.productName a[href]')]
            if not found:
                raise ValueError('Yonex listing has no products')
            urls.extend(found)
            pages = [urljoin(page, a['href']) for a in soup.select('.pageNumber a[href], .pagination a[href]')]
            remaining = [u for u in pages if u not in visited
                         and urlsplit(u).hostname == urlsplit(base).hostname
                         and urlsplit(u).path == '/yonex'
                         and re.fullmatch(r'sayfa=\d+', urlsplit(u).query)]
            if not remaining:
                break
            page = remaining[0]
            if len(visited) > 30:
                raise ValueError('Unexpected pagination loop')
    urls = list(dict.fromkeys(urls))
    if not urls or any(urlsplit(u).hostname != urlsplit(base).hostname for u in urls):
        raise ValueError('Unexpected product URL origin or empty catalog')
    return urls


def main(default_source=None):
    from paths import load_repo_env
    load_repo_env()
    parser = argparse.ArgumentParser()
    parser.add_argument('source', choices=SOURCES, nargs='?' if default_source else None, default=default_source)
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--output')
    parser.add_argument('--checkpoint', help='Separate restart checkpoint, maximum age 3 hours')
    args = parser.parse_args()
    if args.limit < 0 or (args.limit and not args.output):
        parser.error('Limited runs require --output')
    urls = discover(args.source)
    if args.limit: urls = urls[:args.limit]
    checkpoint = Path(args.checkpoint) if args.checkpoint else None
    output = Path(args.output or resolve_output(args.source + '_products.json'))
    if checkpoint and checkpoint.resolve() == output.resolve():
        parser.error('Checkpoint must differ from canonical output')
    completed = {}
    if checkpoint and checkpoint.exists() and time.time() - checkpoint.stat().st_mtime < 10800:
        completed = json.loads(checkpoint.read_text())
    products = []
    def fetch_product(url):
        cached = completed.get(url)
        if cached and time.time() - cached.get('fetched_at', 0) < 10800:
            return url, cached
        product = parse_product(fetch_html(url), url, args.source)
        time.sleep(0.5)
        return url, {'fetched_at': time.time(), 'product': product}
    # Two browser jobs maximum, and checkpoints are written only by this thread.
    pool = ThreadPoolExecutor(max_workers=2)
    try:
        for i, (url, entry) in enumerate(pool.map(fetch_product, urls), 1):
            completed[url] = entry
            if checkpoint:
                checkpoint.parent.mkdir(parents=True, exist_ok=True)
                checkpoint_temp = checkpoint.with_suffix('.tmp')
                checkpoint_temp.write_text(json.dumps(completed, ensure_ascii=False))
                checkpoint_temp.replace(checkpoint)
            product = entry['product']
            product['category'] = category_for(args.source, product['name'])
            products.append(product)
            print(f"[{i}/{len(urls)}] {product['name'][:65]} variants={len(product['variants'])} stock={product['stock_quantity']}", flush=True)
    finally:
        pool.shutdown(wait=True, cancel_futures=True)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix('.tmp')
    temporary.write_text(json.dumps(products, ensure_ascii=False, indent=2))
    temporary.replace(output)
    print(f'Complete: {len(products)} products -> {output}', flush=True)


if __name__ == '__main__':
    main()
