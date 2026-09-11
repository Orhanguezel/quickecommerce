"""
Ortak OpenCart urun scraper cekirdegi.
-------------------------------------------------
OpenCart urun sayfalari cogunlukla JSON-LD `Product` semasi gomar; bu modul
once JSON-LD'yi okur, indirim icin OpenCart fiyat markup'ina bakar, JSON-LD
yoksa standart OpenCart HTML'ine duser.

Urun URL'leri sitemap'ten kesfedilir:
  - OpenCart google_sitemap feed (index.php?route=extension/feed/google_sitemap)
  - veya klasik sitemap.xml (url_pattern regex ile urun URL'i filtrelenir)

Cikti semasi everlast_scraper.py ile birebir aynidir
-> `sync:source-prices` ve `import:products` degisiklik gerektirmeden calisir.
"""

import json
import re
import time
from urllib.parse import quote, unquote, urlsplit, urlunsplit

import requests
from bs4 import BeautifulSoup

from shopify_scraper import (  # noqa: F401  (resolve_* wrapper'lar tarafindan import edilir)
    HEADERS,
    _download_image,
    clean_description_html,
    make_slug,
    resolve_image_dir,
    resolve_output,
    resolve_relative_urls,
    strip_html,
)


def _clean_price(text):
    """Turkce/uluslararasi fiyat formatlarini guvenli parse eder.

    Kabul edilen ornekler:
      '1.234,56 TL' -> 1234.56  (TR full: nokta thousands, virgul decimal)
      '1.600 TL'    -> 1600     (TR thousands sep only — KRITIK: eski bug 1.6 donuyordu)
      '1,600 TL'    -> 1600     (TR thousands sep with comma)
      '1.99 TL'     -> 1.99     (decimal point)
      '1,99 TL'     -> 1.99     (decimal comma)
      '1.234.567'   -> 1234567  (multiple thousands)
      '1600'        -> 1600
    Gecersizse None.

    Heuristic: tek separator + son grup 3 digit ise thousands; aksi decimal.
    """
    if text is None:
        return None
    t = re.sub(r"[^\d.,]", "", str(text))
    if not t:
        return None

    has_dot = "." in t
    has_comma = "," in t

    if has_dot and has_comma:
        # Karisik: hangisi son? Son olan decimal kabul edilir
        # "1.234,56" -> nokta thousands, virgul decimal
        # "1,234.56" -> virgul thousands, nokta decimal
        if t.rfind(",") > t.rfind("."):
            t = t.replace(".", "").replace(",", ".")
        else:
            t = t.replace(",", "")
    elif has_comma:
        parts = t.split(",")
        # "1,600" (3 digit son) -> thousands; "1,99" (1-2 digit son) -> decimal
        if len(parts) > 2 or (len(parts) == 2 and len(parts[1]) == 3):
            t = t.replace(",", "")
        else:
            t = t.replace(",", ".")
    elif has_dot:
        parts = t.split(".")
        # "1.600" (3 digit) -> thousands; "1.99" (1-2 digit) -> decimal
        # "1.234.567" (coklu nokta) -> tum thousands
        if len(parts) > 2 or (len(parts) == 2 and len(parts[1]) == 3):
            t = t.replace(".", "")
        # decimal point - olduğu gibi birak

    try:
        val = float(t)
        return round(val, 2) if val > 0 else None
    except ValueError:
        return None


def _discover_urls(session, sitemap_url, url_pattern=None, _depth=0, _seen=None):
    """Sitemap'ten urun URL'lerini toplar (tekil, sirali).

    OpenCart google_sitemap feed'i tum katalogu anlik uretir -> yavas
    olabilir, bu yuzden uzun timeout verilir.

    <sitemapindex> ise nested <loc>'lari recursive olarak izler (max 3 seviye).
    Modern OpenCart / Magento / Shopify magazalari sitemap index kullanir;
    bu olmadan provitanya tarzi feed'ler kacirilir (2026-06-04 sessiz fail).
    """
    if _seen is None:
        _seen = set()
    if sitemap_url in _seen or _depth > 3:
        return []
    _seen.add(sitemap_url)

    try:
        resp = session.get(sitemap_url, timeout=180)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"  Sitemap HATASI ({sitemap_url}): {exc}")
        return []

    text = resp.text
    locs = [loc.strip() for loc in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", text)]

    # Sitemap index ise nested'lara in.
    if "<sitemapindex" in text:
        urls = []
        for nested in locs:
            urls.extend(_discover_urls(session, nested, url_pattern, _depth + 1, _seen))
        return list(dict.fromkeys(urls))

    pat = re.compile(url_pattern) if url_pattern else None
    urls = [loc for loc in locs if not pat or pat.search(loc)]
    return list(dict.fromkeys(urls))


def _jsonld_product(html):
    """Sayfadaki ilk JSON-LD `Product` nesnesini dondurur (@graph dahil)."""
    for block in re.findall(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.S | re.I,
    ):
        try:
            data = json.loads(block.strip())
        except ValueError:
            continue
        candidates = data if isinstance(data, list) else [data]
        for item in list(candidates):
            if isinstance(item, dict) and isinstance(item.get("@graph"), list):
                candidates.extend(item["@graph"])
        for item in candidates:
            if isinstance(item, dict):
                t = item.get("@type")
                if t == "Product" or (isinstance(t, list) and "Product" in t):
                    return item
    return None


def _offer(jsonld):
    offers = (jsonld or {}).get("offers")
    if isinstance(offers, list):
        return offers[0] if offers else {}
    if isinstance(offers, dict):
        return offers
    return {}


def _images_from_jsonld(value):
    if not value:
        return []
    if isinstance(value, str):
        return [value]
    out = []
    if isinstance(value, list):
        for v in value:
            if isinstance(v, str):
                out.append(v)
            elif isinstance(v, dict) and v.get("url"):
                out.append(v["url"])
    elif isinstance(value, dict) and value.get("url"):
        out.append(value["url"])
    return out


def _normalize_image_url(url):
    if not isinstance(url, str) or not url.startswith("http"):
        return url
    parts = urlsplit(url.strip())
    path = "/".join(quote(unquote(segment), safe="") for segment in parts.path.split("/"))
    return urlunsplit((parts.scheme, parts.netloc, path, parts.query, parts.fragment))


def _html_discount_prices(soup):
    """OpenCart indirim markup'i -> (original, discounted) ya da (None, None)."""
    new_el = soup.select_one(".price-new, #price-special, .product-price-new, .special-price")
    old_el = soup.select_one(".price-old, .product-price-old, .old-price")
    new_p = _clean_price(new_el.get_text()) if new_el else None
    old_p = _clean_price(old_el.get_text()) if old_el else None
    if new_p and old_p and old_p > new_p:
        return old_p, new_p
    return None, None


def _html_main_price(soup):
    """Indirimsiz tek fiyati OpenCart markup'indan cikarir."""
    ip = soup.select_one('[itemprop="price"]')
    if ip:
        price = _clean_price(ip.get("content") or ip.get_text())
        if price:
            return price
    for sel in (".product-price", "h2.price", ".price-normal", "#price",
                ".product-info .price", ".price"):
        el = soup.select_one(sel)
        if el:
            price = _clean_price(el.get_text())
            if price:
                return price
    return None


_OUT_OF_STOCK_SELECTORS = (
    # OpenCart tema-spesifik out-of-stock butonlari (regex/text aramadan daha
    # guvenilir cunku HTML get_text() bazi durumlarda script-yazilan div'leri
    # atliyor — proteinmax 2026-06-04 sessiz fail).
    ".ekle_button_stokta_yok",     # proteinmax
    ".out-of-stock",
    ".outofstock",
    ".stokta-yok",
    ".stok-yok",
    ".stock-out",
    ".product-out-of-stock",
    ".sold-out",
    ".product-sold-out",
    "button[data-out-of-stock]",
    "a[href*='/notify']",          # notify-me linki
)

_OUT_OF_STOCK_RAW_PATTERNS = (
    # bs4 get_text() bazi temalarda kacirir (ornegin script.innerHTML icinden
    # render edilen container'lar). Ham HTML uzerinde regex fallback.
    r"gelince\s*haber\s*ver",
    r"stok\s*ta?\s*yok",            # "stokta yok" + "stok yok" + "stok ta yok"
    r"t[uü]kenmi[sş]?t?[iı]?r?",    # tükendi/tükenmiştir
    r"out\s*of\s*stock",
    r"sold\s*out",
    r"ekle_button_stokta_yok",      # tema class (proteinmax)
    r'class\s*=\s*["\'][^"\']*\bout-of-stock\b',
)

_IN_STOCK_SELECTORS = (
    "#button-cart",
    "button#button-cart",
    ".btn-add-to-cart",
    ".add-to-cart-btn",
    "button[data-add-to-cart]",
)


def _html_stock_status(soup, raw_html=None):
    """Sayfa HTML'inden stok sinyali okur. 3 katmanli:
    1) CSS selector (en guvenilir) — out-of-stock spesifik class'lar
    2) Ham HTML regex (bs4 get_text() kacirsa bile yakalar)
    3) Gorulebilir text taramasi (eski mantik)

    Returns: True/False/None.
    """
    # 0) POZITIF, KAPSAMLI sinyal: ana urunun "Sepete Ekle" butonu (#button-cart).
    #    Bu id sayfada TEKILDIR ve yalniz ana urune aittir — related/sidebar/
    #    "son gezilen" urunler bu id'yi kullanmaz. Bu yuzden out-of-stock CSS/
    #    regex taramasindan ONCE kontrol edilir: aksi halde sayfadaki ilgili
    #    urunlerden biri tukenmisse (".ekle_button_stokta_yok" / "gelince haber
    #    ver" sidebar'da gecince) ana urun yanlislikla tukenmis isaretleniyordu
    #    (proteinmax 2026-06-25: 2046/2046 urun yanlis "available=False").
    cart_btn = soup.select_one('#button-cart, input#button-cart, button#button-cart')
    if cart_btn is not None and not cart_btn.has_attr('disabled'):
        return True

    # 1) CSS class detection
    for sel in _OUT_OF_STOCK_SELECTORS:
        if soup.select_one(sel):
            return False

    # 2) Raw HTML regex (script-rendered div'ler dahil)
    if raw_html:
        for pat in _OUT_OF_STOCK_RAW_PATTERNS:
            if re.search(pat, raw_html, re.I):
                return False

    # 3) Gorunur text (fallback)
    text = soup.get_text(" ", strip=True).lower()
    out_of_stock_terms = (
        "stokta yok", "stok yok", "tükendi", "tukenmiştir", "tükenmiştir",
        "out of stock", "sold out", "notify me", "gelince haber ver",
    )
    if any(term in text for term in out_of_stock_terms):
        return False

    # In-stock sinyalleri (text-tabanli)
    in_stock_terms = ("stokta var", "sepete ekle", "add to cart", "in stock")
    if any(term in text for term in in_stock_terms):
        return True

    # CSS in-stock buton — disabled olmadigi surece in-stock varsayilir
    for sel in _IN_STOCK_SELECTORS:
        el = soup.select_one(sel)
        if el is not None and not el.has_attr("disabled"):
            return True

    return None


def _parse_product(session, url, vendor, default_category):
    try:
        resp = session.get(url, timeout=25)
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"    HATA {url}: {exc}")
        return None

    html = resp.text
    soup = BeautifulSoup(html, "html.parser")
    jsonld = _jsonld_product(html) or {}
    offer = _offer(jsonld)

    name = (jsonld.get("name") or "").strip()
    if not name:
        h1 = soup.select_one("h1")
        name = h1.get_text(strip=True) if h1 else ""
    if not name:
        return None
    # OpenCart JSON-LD adina sik sik " Fiyatı" ekler -> temizle.
    name = re.sub(r"\s*Fiyat[ıi]\s*$", "", name, flags=re.I).strip()

    sku = str(jsonld.get("sku") or jsonld.get("mpn") or "").strip()

    # Fiyat: JSON-LD offer.price kanonik kabul edilir (urun semasinin standart
    # alani). HTML .price-new/.price-old unscoped — ilgili/sidebar urunlerin
    # markup'ini kapabilir (2026-05-23 Hardline bug: 2340g + 908g iki ayri
    # urun aynen 3737.93/4398.00 aliyordu cunku ayni sidebar block secildi).
    # Bu yuzden:
    #   1) JSON-LD price varsa: original_price = jl_price; indirim ancak HTML
    #      .price-new degeri JSON-LD price ile orcadan tutuyorsa kabul edilir
    #      (1 TL tolerans) — aksi halde discount=None birakilir
    #   2) JSON-LD yoksa: eski HTML mantigi fallback
    jl_price = _clean_price(offer.get("price") or offer.get("lowPrice"))
    if jl_price is not None:
        original_price = jl_price
        discounted_price = None
        new_el = soup.select_one(".price-new, #price-special, .product-price-new, .special-price")
        old_el = soup.select_one(".price-old, .product-price-old, .old-price")
        new_p = _clean_price(new_el.get_text()) if new_el else None
        old_p = _clean_price(old_el.get_text()) if old_el else None
        # HTML indirim markup'i JSON-LD ile uyumluysa indirimi kullan.
        if new_p and old_p and old_p > new_p and abs(new_p - jl_price) < 1:
            original_price = old_p
            discounted_price = new_p
    else:
        # JSON-LD yoksa eski HTML fallback (proteinmax tarzi).
        original_price, discounted_price = _html_discount_prices(soup)
        if original_price is None:
            original_price = _html_main_price(soup)
            discounted_price = None

    avail = str(offer.get("availability") or "").lower().replace("/", "").replace("_", "")
    html_stock = _html_stock_status(soup, raw_html=html)
    if "outofstock" in avail or "soldout" in avail or "discontinued" in avail:
        in_stock = False
    elif html_stock is False:
        in_stock = False
    elif "instock" in avail or "preorder" in avail or "backorder" in avail:
        in_stock = True
    elif html_stock is True:
        in_stock = True
    else:
        # 2026-06-04 KOKLU DEGISIKLIK: hicbir net "stokta var" sinyali yok =
        # tedbirli davran (False). Eskiden default True idi -> yok satissa yol
        # aciyordu. Tedarikciler genelde "stokta yok" sinyalini gosterir; bu
        # sinyal goremedigimizde "muhtemelen var" varsayimi yanlis -> default
        # "muhtemelen yok" yapildi. Yan etki: ayri "tek sinyalli" temalar
        # icin tema-spesifik in-stock selector eklemek gerekebilir.
        in_stock = False

    images = _images_from_jsonld(jsonld.get("image"))
    # OpenCart temalari arasinda galeri markup'i degisir; genis selector +
    # tekil "popup" linkleri (proteinmax gibi temalar) + og:image fallback.
    for a in soup.select(".thumbnails a, .image-additional a, a.thumbnail, "
                         "a#popup, a.popup, .product-image a, a[data-fancybox]"):
        href = (a.get("href") or "").strip()
        if href.startswith("http") and href not in images:
            images.append(href)
    if not images:
        og = soup.select_one('meta[property="og:image"]')
        if og and (og.get("content") or "").startswith("http"):
            images.append(og["content"].strip())
    images = list(dict.fromkeys(_normalize_image_url(img) for img in images if img))

    desc_html = jsonld.get("description") or ""
    desc_el = soup.select_one("#tab-description, #product-description, .tab-content")
    if desc_el:
        desc_html = str(desc_el)
    desc_html = resolve_relative_urls(clean_description_html(desc_html), url)

    brand = jsonld.get("brand")
    if isinstance(brand, dict):
        brand = brand.get("name", "")

    slug_match = re.search(r"/([^/?#]+?)(?:\.html)?(?:[?#].*)?$", url)
    slug = slug_match.group(1) if slug_match else make_slug(name)

    price = original_price if discounted_price is None else discounted_price
    return {
        "name": name,
        "slug": slug,
        "url": url,
        "category": default_category,
        "parent_category": None,
        "vendor": brand or vendor,
        "product_type": "",
        "description_html": desc_html,
        "description_text": strip_html(desc_html),
        "original_price": original_price,
        "discounted_price": discounted_price,
        "discount_rate": None,
        "sku": sku,
        "barcode": "",
        "available": in_stock,
        "specifications": [],
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else "",
        "variants": [{
            "title": "Default Title",
            "sku": sku,
            "barcode": "",
            "price": price,
            "compare_at_price": original_price if discounted_price is not None else None,
            "available": in_stock,
            "option1": None,
            "option2": None,
            "option3": None,
        }],
        "options": [],
        "downloaded_images": [],
        "tags": [],
    }


def run(base_url, output_file, vendor, sitemap_url, default_category="Ürün",
        url_pattern=None, image_dir=None, with_images=False, limit=None, delay=0.6):
    """Bir OpenCart magazasini scrape eder, JSON ciktiyi yazar.

    limit: yalniz test icin (ilk N urun). with_images yalniz ilk import icin.
    """
    base_url = base_url.rstrip("/")
    print(f"OpenCart scraper: {base_url}")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)

    print(f"  Sitemap: {sitemap_url}")
    urls = _discover_urls(session, sitemap_url, url_pattern)
    print(f"  {len(urls)} urun URL'i bulundu.")
    if limit:
        urls = urls[:limit]
        print(f"  (TEST limiti: ilk {len(urls)})")
    if not urls:
        print("HATA: urun URL'i bulunamadi.")
        raise SystemExit(1)

    products = []
    skipped = 0
    for i, url in enumerate(urls, 1):
        if i == 1 or i % 25 == 0:
            print(f"  [{i}/{len(urls)}] ...")
        prod = _parse_product(session, url, vendor, default_category)
        if prod and prod["original_price"]:
            products.append(prod)
        else:
            skipped += 1
        time.sleep(delay)

    if with_images and image_dir:
        print("\nGorseller indiriliyor...")
        for i, prod in enumerate(products, 1):
            downloaded = []
            for img_url in prod.get("all_image_urls", []):
                local = _download_image(session, img_url, image_dir, prod["slug"][:60])
                if local:
                    downloaded.append({"remote_url": img_url, "local_path": local})
            prod["downloaded_images"] = downloaded

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p.get("available"))
    print(f"\nTamamlandi! {len(products)} urun ({in_stock} stokta, {skipped} atlandi)"
          f" -> {output_file}")
    return products
