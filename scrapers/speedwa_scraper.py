"""
speedwa.com.tr Urun Scraper (custom platform - HTML scrape)
-------------------------------------------------
speedwa.com.tr WooCommerce DEGILDIR; ozel bir PHP/IIS platformudur. Store API
yoktur, urun sayfalari JSON-LD gommaz. Sitemap yalniz kategori URL'leri verir.

Akis:
  1. sitemap.xml -> /products/category/... kategori URL'leri
  2. Her kategori sayfasi (sayfalama: ?s=1, ?s=2 ...) -> urun kartlari
     (.custom-product-card: ad, URL, gorsel, fiyat)
  3. Her urun sayfasi -> SKU, ek gorseller, fiyat dogrulama
     (urun detay sayfalari Referer header'i ister; aksi halde "hata" doner)

Fiyatlar TRY (zaten TL). Indirim markup'i sitede gozukmuyor -> discounted_price
cogunlukla None; varsa eski-fiyat selector'lari yine denenir.

Kullanim:
    python speedwa_scraper.py               # tum katalog (fiyat/stok)
    python speedwa_scraper.py --limit=8      # test: ilk 8 urun
    python speedwa_scraper.py --images       # ilk import icin gorsellerle
Cikti: speedwa_products.json (repo'da data/source-products/ altina)
"""

import json
import re
import socket
import sys
import time
from html import unescape

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter

try:
    from urllib3.util.retry import Retry
except ImportError:  # urllib3 < 1.26 fallback
    from urllib3.util import Retry

# Sosket seviyesi sert timeout: requests' HTTP-level timeout'u TLS/keep-alive
# yarim-kalmis durumlarda atlandigi durumlar icin son safety net (47dk hang
# yasandi -> 2026-05-22).
socket.setdefaulttimeout(60)

from shopify_scraper import (
    _download_image,
    make_slug,
    resolve_image_dir,
    resolve_output,
    resolve_relative_urls,
    strip_html,
)

BASE_URL = "https://speedwa.com.tr"
SITEMAP = "https://speedwa.com.tr/sitemap.xml"
VENDOR = "SpeedWA"
DEFAULT_CATEGORY = "Telefon Aksesuarı"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,*/*;q=0.8"
    ),
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
    # Keep-alive havuzunda yarim kalan socket'lerin tekrar takilmasini
    # onlemek icin her istekte yeni socket.
    "Connection": "close",
}


def _clean_price(text):
    """'2.999,00 TL' -> 2999.0. Gecersiz/sifir/bos -> None."""
    if text is None:
        return None
    t = re.sub(r"[^\d.,]", "", str(text))
    if not t:
        return None
    if "," in t and "." in t:
        t = t.replace(".", "").replace(",", ".")
    elif "," in t:
        t = t.replace(",", ".")
    try:
        val = float(t)
        return round(val, 2) if val > 0 else None
    except ValueError:
        return None


def _discover_categories(session):
    """sitemap.xml -> /products/category/... URL'leri (tekil, sirali)."""
    try:
        resp = session.get(SITEMAP, timeout=(10, 30))
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"  Sitemap HATASI: {exc}")
        return []
    locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", resp.text)
    cats = [loc.strip() for loc in locs if "/products/category/" in loc]
    return list(dict.fromkeys(cats))


def _slug_from_url(url):
    """speedwa urun URL'i kok seviyede flat slug: /tribit-stormbox-... ."""
    return url.rstrip("/").rsplit("/", 1)[-1]


def _collect_from_category(session, cat_url):
    """Bir kategorinin tum sayfalarindaki urun kartlarini toplar.

    Sayfalama: ilk sayfa cat_url, sonrakiler cat_url?s=1, ?s=2 ...
    Doner: {url: {name, url, thumbnail_url, list_price}} sozlugu.
    """
    found = {}
    page = 0
    while True:
        url = cat_url if page == 0 else f"{cat_url.rstrip('/')}/?s={page}"
        try:
            resp = session.get(url, headers={"Referer": BASE_URL}, timeout=(10, 30))
            resp.raise_for_status()
        except Exception as exc:  # noqa: BLE001
            print(f"    kategori sayfa HATASI {url}: {exc}")
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select(".custom-product-card")
        if not cards:
            break

        new_on_page = 0
        for card in cards:
            link = card.select_one("h2.custom-product-title a, a[href]")
            if not link:
                continue
            href = (link.get("href") or "").strip()
            if not href or "/products/category/" in href:
                continue
            if not href.startswith("http"):
                href = BASE_URL.rstrip("/") + "/" + href.lstrip("/")
            href = href.split("?")[0].split("#")[0]
            if href in found:
                continue

            title_el = card.select_one("h2.custom-product-title a")
            name = (title_el.get_text(strip=True) if title_el else "") or (
                link.get("title") or ""
            )
            img = card.select_one("img")
            thumb = ""
            if img:
                thumb = (img.get("src") or img.get("data-src") or "").strip()
            price_el = card.select_one(".custom-product-price")
            list_price = _clean_price(price_el.get_text()) if price_el else None

            found[href] = {
                "name": unescape(name).strip(),
                "url": href,
                "thumbnail_url": thumb,
                "list_price": list_price,
            }
            new_on_page += 1

        # Sayfada yeni urun yoksa (ya da 24'ten az kart) son sayfa.
        if new_on_page == 0 or len(cards) < 24:
            break
        page += 1
        time.sleep(0.4)
    return found


def _parse_detail(session, url):
    """Urun detay sayfasindan SKU, gorseller, fiyat, aciklama, stok cikarir."""
    try:
        resp = session.get(url, headers={"Referer": BASE_URL}, timeout=(10, 30))
        resp.raise_for_status()
    except Exception as exc:  # noqa: BLE001
        print(f"    detay HATASI {url}: {exc}")
        return {}
    # Detay sayfasi Referer olmadan 4 byte "hata" doner -> kisa govdeyi atla.
    if len(resp.content) < 500:
        print(f"    detay bos/engellendi {url}")
        return {}

    html = resp.text
    soup = BeautifulSoup(html, "html.parser")
    detail = {}

    h1 = soup.select_one("h1.product-title, h1")
    if h1:
        detail["name"] = unescape(h1.get_text(strip=True))

    # SKU: "SKU : XXX" metni.
    m = re.search(r"SKU\s*:\s*([A-Za-z0-9\-/_.]+)", html)
    if m:
        detail["sku"] = m.group(1).strip()

    # Fiyat: detay sayfasindaki .product-price.
    price_el = soup.select_one(".product-price, .custom-product-price")
    if price_el:
        detail["price"] = _clean_price(price_el.get_text())
    # Eski fiyat (indirim) -> nadiren var.
    old_el = soup.select_one(
        ".old-price, .product-old-price, .eski-fiyat, "
        ".price-box del, .price-box s"
    )
    if old_el:
        detail["old_price"] = _clean_price(old_el.get_text())

    # Gorseller: narbulut CDN urun gorselleri.
    images = []
    for src in re.findall(
        r'https://oss\.narbulut\.com/[^\s"\'<>]+/products/[^\s"\'<>]+', html
    ):
        if src not in images:
            images.append(src)
    if images:
        detail["all_image_urls"] = images

    # Aciklama: urun aciklama paneli (cogu urunde bos).
    desc = soup.select_one(
        "#product-desc-content .product-desc-content, "
        ".product-desc-content, .product-description"
    )
    if desc:
        text = desc.get_text(" ", strip=True)
        if text:
            detail["description_html"] = str(desc)

    # Stok: "Tükendi" / "Stokta Yok" -> stok disi.
    low = html.lower()
    if "tükendi" in low or "stokta yok" in low or "stok dışı" in low:
        detail["available"] = False
    else:
        detail["available"] = True

    return detail


def _build_product(card, detail):
    """Kart + detay verisini standart (everlast) semaya birlestirir."""
    name = detail.get("name") or card["name"]
    url = card["url"]
    sku = detail.get("sku", "")

    price = detail.get("price") or card.get("list_price")
    old_price = detail.get("old_price")
    if old_price and price and old_price > price:
        original_price, discounted_price = old_price, price
    else:
        original_price, discounted_price = price, None

    images = detail.get("all_image_urls") or []
    if card.get("thumbnail_url") and card["thumbnail_url"] not in images:
        images = [card["thumbnail_url"]] + images
    images = [i for i in images if i and i.startswith("http")]

    available = detail.get("available", True)
    desc_html = resolve_relative_urls(detail.get("description_html", ""), url)
    current_price = discounted_price if discounted_price is not None else original_price

    return {
        "name": name,
        "slug": _slug_from_url(url) or make_slug(name),
        "url": url,
        "category": card.get("category") or DEFAULT_CATEGORY,
        "parent_category": card.get("parent_category"),
        "vendor": VENDOR,
        "product_type": "",
        "description_html": desc_html,
        "description_text": strip_html(desc_html),
        "original_price": original_price,
        "discounted_price": discounted_price,
        "discount_rate": None,
        "sku": sku,
        "barcode": "",
        "available": available,
        "specifications": [],
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else card.get("thumbnail_url", ""),
        "variants": [
            {
                "title": "Default Title",
                "sku": sku,
                "barcode": "",
                "price": current_price,
                "compare_at_price": (
                    original_price if discounted_price is not None else None
                ),
                "available": available,
                "option1": None,
                "option2": None,
                "option3": None,
            }
        ],
        "options": [],
        "downloaded_images": [],
        "tags": [],
    }


def main():
    limit = None
    with_images = "--images" in sys.argv
    for arg in sys.argv[1:]:
        if arg.startswith("--limit="):
            limit = int(arg.split("=", 1)[1])

    output_file = resolve_output("speedwa_products.json")
    image_dir = resolve_image_dir("speedwa_images")

    print(f"speedwa.com.tr scraper (custom platform HTML): {BASE_URL}")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)
    # Sinirli retry + kucuk havuz: sonsuz takilma onlemi.
    retry = Retry(total=2, backoff_factor=1, status_forcelist=(500, 502, 503, 504))
    adapter = HTTPAdapter(max_retries=retry, pool_connections=4, pool_maxsize=4)
    session.mount("https://", adapter)
    session.mount("http://", adapter)

    categories = _discover_categories(session)
    print(f"  {len(categories)} kategori URL'i bulundu.")
    if not categories:
        print("HATA: kategori URL'i bulunamadi.")
        sys.exit(1)

    # Kategorileri gez, urun kartlarini topla (URL ile tekil).
    print("\nADIM 1: Kategoriler taraniyor (urun kartlari)...")
    cards = {}
    for i, cat_url in enumerate(categories, 1):
        cat_slug = cat_url.rstrip("/").rsplit("/", 1)[-1]
        cat_name = cat_slug.replace("-", " ").title()
        found = _collect_from_category(session, cat_url)
        for url, card in found.items():
            if url not in cards:
                card.setdefault("category", cat_name)
                cards[url] = card
        if i % 10 == 0 or i == len(categories):
            print(f"  [{i}/{len(categories)}] toplam {len(cards)} urun karti")
        # Test modunda yeterli kart toplaninca kategori taramayi kes.
        if limit and len(cards) >= limit:
            print(f"  (TEST limiti: {len(cards)} kart yeterli, tarama durduruldu)")
            break
        time.sleep(0.3)

    card_list = list(cards.values())
    if limit:
        card_list = card_list[:limit]
        print(f"  (TEST limiti: ilk {len(card_list)} urun)")

    # Detay sayfalarini gez.
    print("\nADIM 2: Detay sayfalari taraniyor...")
    products = []
    skipped = 0
    for i, card in enumerate(card_list, 1):
        if i == 1 or i % 25 == 0:
            print(f"  [{i}/{len(card_list)}] ...")
        detail = _parse_detail(session, card["url"])
        product = _build_product(card, detail)
        if product["original_price"]:
            products.append(product)
        else:
            skipped += 1
        time.sleep(0.5)

    if with_images and image_dir:
        print("\nGorseller indiriliyor...")
        for prod in products:
            downloaded = []
            for img_url in prod.get("all_image_urls", []):
                local = _download_image(session, img_url, image_dir, prod["slug"][:60])
                if local:
                    downloaded.append({"remote_url": img_url, "local_path": local})
            prod["downloaded_images"] = downloaded

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    in_stock = sum(1 for p in products if p.get("available"))
    print(
        f"\nTamamlandi! {len(products)} urun ({in_stock} stokta, {skipped} atlandi)"
        f" -> {output_file}"
    )
    if not products:
        sys.exit(1)


if __name__ == "__main__":
    main()
