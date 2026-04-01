"""
Dropick.com.tr Urun Scraper - Enhanced
---------------------------------------
Kullanim:
  pip install requests beautifulsoup4
  python dropick_scraper.py

Cikti:
  dropick_products.json  — Urun verileri (aciklama, ozellikler, tum gorseller dahil)
  dropick_images/        — Indirilen urun gorselleri
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import os
import re
import hashlib
from urllib.parse import urljoin

BASE_URL = "https://www.dropick.com.tr"
IMAGE_DIR = "dropick_images"
OUTPUT_FILE = "dropick_products.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    )
}

# Tum kategori URL'leri — parent/child iliskisi ile
CATEGORIES = [
    # Ana kategoriler ve alt kategorileri
    {"name": "Pickleball Raketleri",    "url": "/pickleball-raketleri",              "parent": None},
    {"name": "Cocuk Raketleri",         "url": "/pickleball-cocuk-raket",            "parent": "Pickleball Raketleri"},
    {"name": "Fiber Glass Raketler",    "url": "/pickleball-fiber-glass-raketler",   "parent": "Pickleball Raketleri"},
    {"name": "Karbon Fiber Raketler",   "url": "/pickleball-karbon-fiber-raket",     "parent": "Pickleball Raketleri"},
    {"name": "Kevlar Raketler",         "url": "/pickleball-kevlar-raketler",        "parent": "Pickleball Raketleri"},
    {"name": "Pickleball Toplari",      "url": "/pickleball-topu",                   "parent": None},
    {"name": "Giyim",                   "url": "/giyim",                             "parent": None},
    {"name": "Cocuk Giyim",            "url": "/pickleball-cocuk-giyim",             "parent": "Giyim"},
    {"name": "Erkek Giyim",             "url": "/pickleball-erkek-giyim",            "parent": "Giyim"},
    {"name": "Kadin Giyim",             "url": "/pickleball-kadin-giyim",            "parent": "Giyim"},
    {"name": "Aksesuarlar",             "url": "/pickleball-raket-cantasi-kilif",    "parent": None},
    {"name": "Portatif Fileler",        "url": "/pickleball-portatif-file",          "parent": None},
    {"name": "Kampanyalar",             "url": "/kampanyalar-2",                     "parent": None},
]

# requests session for connection reuse
session = requests.Session()
session.headers.update(HEADERS)


def clean_price(price_str: str) -> float | None:
    """'8.250,00 TL' -> 8250.0"""
    try:
        cleaned = price_str.replace("TL", "").replace(".", "").replace(",", ".").strip()
        return float(cleaned)
    except Exception:
        return None


def download_image(url: str, subfolder: str = "") -> str | None:
    """Gorseli indir, yerel dosya yolunu dondur."""
    if not url or not url.startswith("http"):
        return None

    try:
        # Dosya adini URL'den olustur
        ext = os.path.splitext(url.split("?")[0])[1] or ".jpg"
        filename = hashlib.md5(url.encode()).hexdigest()[:12] + ext

        save_dir = os.path.join(IMAGE_DIR, subfolder) if subfolder else IMAGE_DIR
        os.makedirs(save_dir, exist_ok=True)
        filepath = os.path.join(save_dir, filename)

        if os.path.exists(filepath):
            return filepath

        resp = session.get(url, timeout=20)
        resp.raise_for_status()

        with open(filepath, "wb") as f:
            f.write(resp.content)

        return filepath
    except Exception as e:
        print(f"    Gorsel indirilemedi: {url} -> {e}")
        return None


def get_full_size_image_url(thumb_url: str) -> str:
    """Cache URL'ini orijinal boyutlu URL'e cevir.
    image/cache/data/urunler/.../foto-800x800.png -> image/cache/data/urunler/.../foto-2000x2000.png
    veya boyut bilgisini kaldir.
    """
    # Oncelikle 2000x2000 deneyelim
    full_url = re.sub(r'-\d+x\d+\.', '-2000x2000.', thumb_url)
    return full_url


def scrape_product_detail(product_url: str) -> dict:
    """Urun detay sayfasindan aciklama, ozellikler, tum gorseller ve SKU cekilir."""
    detail = {
        "description_html": "",
        "description_text": "",
        "specifications": [],
        "all_images": [],
        "sku": "",
        "barcode": "",
    }

    try:
        resp = session.get(product_url, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"    Detay sayfasi acilamadi: {e}")
        return detail

    soup = BeautifulSoup(resp.text, "html.parser")

    # === ACIKLAMA ===
    # Entigo temasi #tab-desc kullanir (#tab-description degil)
    desc_tab = soup.select_one("#tab-desc") or soup.select_one("#tab-description")
    if desc_tab:
        detail["description_html"] = str(desc_tab)
        detail["description_text"] = desc_tab.get_text(separator="\n", strip=True)

    # === OZELLIKLER ===
    # Entigo temasi #tab-attr kullanir (#tab-specification degil)
    spec_tab = soup.select_one("#tab-attr") or soup.select_one("#tab-specification")
    if spec_tab:
        for row in spec_tab.select("tr"):
            cells = row.select("td")
            if len(cells) >= 2:
                key = cells[0].get_text(strip=True)
                val = cells[1].get_text(strip=True)
                if key:
                    detail["specifications"].append({"name": key, "value": val})

    # === GALERI GORSELLERI ===
    gallery = soup.select_one("#gal1")
    if gallery:
        for img in gallery.select("img"):
            src = img.get("src") or img.get("data-src") or ""
            if src:
                full_src = urljoin(BASE_URL, src)
                # Buyuk boyutlu URL dene
                full_size = get_full_size_image_url(full_src)
                detail["all_images"].append(full_size)

    # Owl carousel thumbnails
    thumbs = soup.select(".owl-thumbs img, .owl-thumb-item img, .prodGal img")
    for img in thumbs:
        src = img.get("src") or img.get("data-src") or ""
        if src:
            full_src = urljoin(BASE_URL, src)
            full_size = get_full_size_image_url(full_src)
            if full_size not in detail["all_images"]:
                detail["all_images"].append(full_size)

    # Fallback: product-image class
    if not detail["all_images"]:
        for img in soup.select(".product-image img, .prodImg img"):
            src = img.get("src") or img.get("data-src") or ""
            if src:
                full_src = urljoin(BASE_URL, src)
                detail["all_images"].append(get_full_size_image_url(full_src))

    # === SKU / BARKOD ===
    # "Urun Kodu: RK-ALTURA-POWER" formatinda aranir
    page_text = soup.get_text()
    sku_match = re.search(r'[ÜU]r[üu]n\s*Kodu\s*[:\-]\s*([A-Za-z0-9\-_]+)', page_text)
    if sku_match:
        detail["sku"] = sku_match.group(1).strip()

    barcode_match = re.search(r'Barkod\s*[:\-]\s*([A-Za-z0-9\-_]+)', page_text)
    if barcode_match:
        detail["barcode"] = barcode_match.group(1).strip()

    return detail


def scrape_category_page(url: str, category_name: str) -> list[dict]:
    """Bir kategori sayfasindaki tum urunleri doner."""
    products = []
    page = 1

    while True:
        # Entigo sayfalama: ?limit=100 ile tum urunleri tek sayfada alabiliriz
        paginated_url = f"{BASE_URL}{url}?limit=100"
        if page > 1:
            paginated_url += f"&page={page}"

        print(f"  [{category_name}] Sayfa {page}: {paginated_url}")

        try:
            resp = session.get(paginated_url, timeout=15)
            resp.raise_for_status()
        except requests.RequestException as e:
            print(f"  HATA: {e}")
            break

        soup = BeautifulSoup(resp.text, "html.parser")

        # Urun kartlarini bul — Entigo temasi .prdbox kullanir
        product_cards = soup.select(".prdbox")

        # Fallback selector'lar
        if not product_cards:
            product_cards = soup.select(".product-item, .urun-item, .item")
        if not product_cards:
            product_cards = soup.select("div[class*='product'], li[class*='product']")

        if not product_cards:
            print(f"  Urun bulunamadi, sayfa sonu.")
            break

        page_products = []
        for card in product_cards:
            # Urun adi — .prd-name kendisi bir <a> tagi
            name_tag = card.select_one("a.prd-name") or card.select_one(".prd-name a, a[title], h2 a, h3 a")
            if not name_tag:
                continue
            name = name_tag.get("title") or name_tag.get_text(strip=True)
            if not name:
                continue

            # Urun URL'i — Entigo relative URL'leri '/' ile baslamiyor
            product_url = name_tag.get("href", "")
            if product_url and not product_url.startswith("http"):
                if not product_url.startswith("/"):
                    product_url = "/" + product_url
                product_url = BASE_URL + product_url

            # Ana gorsel (liste sayfasindaki kucuk gorsel)
            img_tag = card.select_one("img.prd-img") or card.select_one("img")
            image_url = ""
            if img_tag:
                image_url = img_tag.get("src") or img_tag.get("data-src") or ""
                if image_url and not image_url.startswith("http"):
                    image_url = BASE_URL + image_url

            # Fiyatlar — Entigo .price-new (indirimli) ve .price-old (orijinal)
            discounted_price = None
            original_price = None

            price_new_tag = card.select_one(".price-new")
            if price_new_tag:
                discounted_price = clean_price(price_new_tag.get_text())

            price_old_tag = card.select_one(".price-old")
            if price_old_tag:
                original_price = clean_price(price_old_tag.get_text())

            # Eger .price-new/.price-old yoksa, .price div'ini dene
            if discounted_price is None and original_price is None:
                price_tag = card.select_one(".price")
                if price_tag:
                    original_price = clean_price(price_tag.get_text())

            # Eger sadece indirimli fiyat var, orijinal yoksa -> swap
            if original_price is None and discounted_price is not None:
                original_price = discounted_price
                discounted_price = None

            # Fiyat tutarliligi: orijinal her zaman >= indirimli olmali
            if original_price and discounted_price and discounted_price > original_price:
                original_price, discounted_price = discounted_price, original_price

            # Indirim orani
            discount_tag = card.select_one(".pDisco")
            discount_rate = discount_tag.get_text(strip=True) if discount_tag else None

            if name and product_url:
                page_products.append({
                    "category": category_name,
                    "name": name,
                    "url": product_url,
                    "thumbnail_url": image_url,
                    "original_price": original_price,
                    "discounted_price": discounted_price,
                    "discount_rate": discount_rate,
                })

        if not page_products:
            break

        products.extend(page_products)
        print(f"  -> {len(page_products)} urun bulundu")

        # Sonraki sayfa var mi?
        next_link = soup.select_one("a.next, a[rel='next'], .pagination .next a")
        if not next_link:
            break

        page += 1
        time.sleep(0.5)

    return products


def scrape_all():
    """Tum kategorileri ve urun detaylarini tara."""
    all_products = []
    seen_urls = set()

    # 1. ADIM: Tum kategorilerden urun listesini topla
    print("=" * 60)
    print("ADIM 1: Kategori sayfalarindan urun listesi toplanıyor...")
    print("=" * 60)

    for cat in CATEGORIES:
        print(f"\nKategori: {cat['name']}")
        products = scrape_category_page(cat["url"], cat["name"])

        for p in products:
            if p["url"] not in seen_urls:
                seen_urls.add(p["url"])
                p["parent_category"] = cat.get("parent")
                all_products.append(p)

        time.sleep(1)

    print(f"\nToplam {len(all_products)} benzersiz urun bulundu.\n")

    # 2. ADIM: Her urunun detay sayfasini tara
    print("=" * 60)
    print("ADIM 2: Urun detay sayfalari taraniyor...")
    print("=" * 60)

    for i, product in enumerate(all_products, 1):
        print(f"\n[{i}/{len(all_products)}] {product['name'][:60]}...")

        detail = scrape_product_detail(product["url"])

        product["description_html"] = detail["description_html"]
        product["description_text"] = detail["description_text"]
        product["specifications"] = detail["specifications"]
        product["sku"] = detail["sku"]
        product["barcode"] = detail["barcode"]
        product["all_image_urls"] = detail["all_images"]

        time.sleep(0.8)

    # 3. ADIM: Gorselleri indir
    print("\n" + "=" * 60)
    print("ADIM 3: Gorseller indiriliyor...")
    print("=" * 60)

    os.makedirs(IMAGE_DIR, exist_ok=True)

    for i, product in enumerate(all_products, 1):
        # Slug olustur (klasor adi icin)
        slug = re.sub(r'[^a-z0-9]+', '-', product["name"].lower()
                       .replace("ş", "s").replace("ç", "c").replace("ğ", "g")
                       .replace("ü", "u").replace("ö", "o").replace("ı", "i")
                       .replace("İ", "i").replace("Ş", "s").replace("Ç", "c")
                       .replace("Ğ", "g").replace("Ü", "u").replace("Ö", "o"))
        slug = slug.strip("-")[:80]
        product["slug"] = slug

        print(f"  [{i}/{len(all_products)}] {slug}")

        downloaded_images = []

        # Detay sayfasindaki tum gorseller
        for img_url in product.get("all_image_urls", []):
            local_path = download_image(img_url, subfolder=slug)
            if local_path:
                downloaded_images.append({
                    "remote_url": img_url,
                    "local_path": local_path,
                })

        # Eger detaydan gorsel cikmadiysa, thumbnail'i indir
        if not downloaded_images and product.get("thumbnail_url"):
            full_url = get_full_size_image_url(product["thumbnail_url"])
            local_path = download_image(full_url, subfolder=slug)
            if local_path:
                downloaded_images.append({
                    "remote_url": full_url,
                    "local_path": local_path,
                })

        product["downloaded_images"] = downloaded_images
        print(f"    {len(downloaded_images)} gorsel indirildi")

    return all_products


def main():
    print("Dropick.com.tr Enhanced Scraper")
    print("=" * 60)

    products = scrape_all()

    # JSON ciktisi
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"\nTamamlandi! {len(products)} urun -> {OUTPUT_FILE}")

    # Kategori ozeti
    cat_summary = {}
    for p in products:
        cat = p["category"]
        cat_summary[cat] = cat_summary.get(cat, 0) + 1

    total_images = sum(len(p.get("downloaded_images", [])) for p in products)
    total_with_desc = sum(1 for p in products if p.get("description_text"))
    total_with_specs = sum(1 for p in products if p.get("specifications"))

    print(f"\nKategori Ozeti:")
    for cat, count in cat_summary.items():
        print(f"  {cat}: {count} urun")

    print(f"\nGenel Istatistikler:")
    print(f"  Toplam urun: {len(products)}")
    print(f"  Toplam gorsel: {total_images}")
    print(f"  Aciklamasi olan: {total_with_desc}")
    print(f"  Ozellikleri olan: {total_with_specs}")


if __name__ == "__main__":
    main()
