"""
AyakkabıMalzemeMarket.com Scraper (OpenCart)
----------------------------------------------
Sadece "Ayakkabi Ic Tabanliklar" ve "Ayak Sagligi Urunleri" kategorileri.
Kullanim: python scrapers/ayakkabi_scraper.py
Cikti: data/source-products/ayakkabi_products.json, assets/source-images/ayakkabi_images/
"""

import requests, json, time, os, re, hashlib
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from paths import source_image_dir, source_product_path

BASE_URL = "https://www.ayakkabimalzememarket.com"
IMAGE_DIR = source_image_dir("ayakkabi_images")
OUTPUT_FILE = source_product_path("ayakkabi_products.json")
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

CATEGORIES = [
    {"name": "Ayakkabi Ic Tabanliklar", "url": "/ayakkabi-ic-tabanliklar", "parent": None},
    {"name": "Ayak Sagligi Urunleri",   "url": "/ayak-sagligi-urunleri",  "parent": None},
]

session = requests.Session()
session.headers.update(HEADERS)


def clean_price(price_str):
    try:
        cleaned = price_str.replace("TL", "").replace(".", "").replace(",", ".").strip()
        return float(cleaned)
    except:
        return None


def make_slug(name):
    slug = name.lower()
    tr_map = str.maketrans("şçğüöıİŞÇĞÜÖ", "scguoiISCGUO")
    slug = slug.translate(tr_map)
    return re.sub(r'[^a-z0-9]+', '-', slug).strip('-')[:80]


def download_image(url, subfolder=""):
    if not url or not url.startswith("http"): return None
    try:
        ext = os.path.splitext(url.split("?")[0])[1] or ".jpg"
        filename = hashlib.md5(url.encode()).hexdigest()[:12] + ext
        save_dir = os.path.join(IMAGE_DIR, subfolder) if subfolder else IMAGE_DIR
        os.makedirs(save_dir, exist_ok=True)
        filepath = os.path.join(save_dir, filename)
        if os.path.exists(filepath): return filepath
        resp = session.get(url, timeout=20)
        resp.raise_for_status()
        with open(filepath, "wb") as f: f.write(resp.content)
        return filepath
    except Exception as e:
        print(f"    Gorsel indirilemedi: {url[:60]} -> {e}")
        return None


def scrape_product_detail(product_url):
    """Detay sayfasindan aciklama ve gorseller."""
    detail = {"description_html": "", "description_text": "", "all_images": [], "specifications": []}
    try:
        resp = session.get(product_url, timeout=15)
        resp.raise_for_status()
    except:
        return detail

    soup = BeautifulSoup(resp.text, "html.parser")

    # Aciklama
    desc = soup.select_one("#tab-description, .tab-content, .product-description")
    if desc:
        detail["description_html"] = str(desc)
        detail["description_text"] = desc.get_text(separator="\n", strip=True)

    # Gorseller
    for img in soup.select(".product-image img, .image img, a.thumbnail img, .product-gallery img"):
        src = img.get("src") or img.get("data-src") or ""
        if src:
            full = urljoin(BASE_URL, src)
            if full not in detail["all_images"]:
                detail["all_images"].append(full)

    # Popup/buyuk gorseller
    for a in soup.select("a.thumbnail, a[data-lightbox], a.colorbox"):
        href = a.get("href", "")
        if href and href.endswith(('.jpg', '.png', '.jpeg', '.webp')):
            full = urljoin(BASE_URL, href)
            if full not in detail["all_images"]:
                detail["all_images"].append(full)

    # Ana gorsel
    main_img = soup.select_one(".product-image img, #image, .main-image img")
    if main_img:
        src = main_img.get("src", "")
        full = urljoin(BASE_URL, src)
        if full not in detail["all_images"]:
            detail["all_images"].insert(0, full)

    # Ozellikler tablosu
    for row in soup.select(".tab-specification tr, .attribute tr, table tr"):
        cells = row.select("td")
        if len(cells) >= 2:
            key = cells[0].get_text(strip=True)
            val = cells[1].get_text(strip=True)
            if key:
                detail["specifications"].append({"name": key, "value": val})

    return detail


def scrape_category(cat_url, cat_name):
    """Kategori sayfasindaki tum urunleri cek (sayfalama dahil)."""
    products = []
    page = 1

    while True:
        url = f"{BASE_URL}{cat_url}?limit=100"
        if page > 1:
            url += f"&page={page}"
        print(f"  [{cat_name}] Sayfa {page}")

        try:
            resp = session.get(url, timeout=15)
            resp.raise_for_status()
        except Exception as e:
            print(f"  HATA: {e}")
            break

        soup = BeautifulSoup(resp.text, "html.parser")

        # Urun kartlari
        cards = soup.select(".product-layout, .product-grid .product-thumb, .product-list .product-thumb")
        if not cards:
            cards = soup.select("div[class*='product']")

        if not cards:
            print(f"  Urun bulunamadi.")
            break

        page_count = 0
        for card in cards:
            # Isim ve URL
            name_tag = card.select_one("h4 a, .caption h4 a, .name a, h2 a, a[title]")
            if not name_tag:
                continue
            name = name_tag.get_text(strip=True) or name_tag.get("title", "")
            product_url = name_tag.get("href", "")
            if not product_url:
                continue
            if not product_url.startswith("http"):
                product_url = urljoin(BASE_URL, product_url)

            # Fiyat
            prices = []
            for price_el in card.select(".price, .price-new, .price-old, span[class*='price']"):
                text = price_el.get_text(strip=True)
                if "TL" in text:
                    p = clean_price(text)
                    if p: prices.append(p)

            # Fallback: tum text'lerden fiyat bul
            if not prices:
                card_text = card.get_text()
                price_matches = re.findall(r'([\d.]+,\d{2})\s*TL', card_text)
                for pm in price_matches:
                    p = clean_price(pm + "TL")
                    if p: prices.append(p)

            original_price = max(prices) if prices else None
            discounted_price = min(prices) if len(prices) > 1 else None
            if discounted_price == original_price:
                discounted_price = None

            # Gorsel
            img = card.select_one("img")
            thumb = ""
            if img:
                thumb = img.get("src") or img.get("data-src") or ""
                if thumb and not thumb.startswith("http"):
                    thumb = urljoin(BASE_URL, thumb)

            products.append({
                "name": name,
                "url": product_url,
                "thumbnail_url": thumb,
                "original_price": original_price,
                "discounted_price": discounted_price,
                "category": cat_name,
            })
            page_count += 1

        print(f"  -> {page_count} urun")

        if page_count == 0:
            break

        # Sonraki sayfa
        next_link = soup.select_one("a.next, ul.pagination li:last-child a, a[rel='next']")
        if not next_link or page_count < 10:
            # Daha az urun geldiyse son sayfa
            break

        page += 1
        time.sleep(1)

    return products


def main():
    print("AyakkabimalzemeMarket Scraper")
    print("=" * 50)

    all_products = []
    seen_urls = set()

    # 1. Kategorileri tara
    print("\nADIM 1: Kategoriler taraniyor...")
    for cat in CATEGORIES:
        print(f"\nKategori: {cat['name']}")
        products = scrape_category(cat["url"], cat["name"])
        for p in products:
            if p["url"] not in seen_urls:
                seen_urls.add(p["url"])
                p["parent_category"] = cat.get("parent")
                all_products.append(p)
        time.sleep(1)

    print(f"\nToplam {len(all_products)} urun bulundu.")

    # 2. Detay sayfalari
    print("\nADIM 2: Detay sayfalari taraniyor...")
    for i, p in enumerate(all_products, 1):
        print(f"  [{i}/{len(all_products)}] {p['name'][:50]}...")
        detail = scrape_product_detail(p["url"])
        p["description_html"] = detail["description_html"]
        p["description_text"] = detail["description_text"]
        p["specifications"] = detail["specifications"]
        p["all_image_urls"] = detail["all_images"]
        p["slug"] = make_slug(p["name"])
        p["sku"] = ""
        p["barcode"] = ""
        p["variants"] = []
        p["options"] = []
        time.sleep(0.8)

    # 3. Gorselleri indir
    print("\nADIM 3: Gorseller indiriliyor...")
    os.makedirs(IMAGE_DIR, exist_ok=True)
    for i, p in enumerate(all_products, 1):
        slug = p["slug"][:60]
        print(f"  [{i}/{len(all_products)}] {slug}")
        downloaded = []
        for img_url in p.get("all_image_urls", []):
            local = download_image(img_url, subfolder=slug)
            if local: downloaded.append({"remote_url": img_url, "local_path": local})
        if not downloaded and p.get("thumbnail_url"):
            local = download_image(p["thumbnail_url"], subfolder=slug)
            if local: downloaded.append({"remote_url": p["thumbnail_url"], "local_path": local})
        p["downloaded_images"] = downloaded
        print(f"    {len(downloaded)} gorsel")

    # 4. JSON kaydet
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    total_imgs = sum(len(p.get("downloaded_images", [])) for p in all_products)
    cats = {}
    for p in all_products:
        cats[p["category"]] = cats.get(p["category"], 0) + 1

    print(f"\nTamamlandi! {len(all_products)} urun -> {OUTPUT_FILE}")
    print(f"Toplam gorsel: {total_imgs}")
    print(f"\nKategoriler:")
    for c, n in cats.items():
        print(f"  {c}: {n}")


if __name__ == "__main__":
    main()
