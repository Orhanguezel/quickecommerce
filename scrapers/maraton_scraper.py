"""
Maraton Sportswear (maratonsw.com) Ürün Scraper

T-Soft + Cloudflare bot challenge arkasındaki katalog için
Playwright (headed Chrome) kullanır. Profile cache'lendiği için
çoklu çağrılarda CF challenge çözüldükten sonra otomatik geçer.

Kullanım:
  python scrapers/maraton_scraper.py
Çıktı:
  data/source-products/maraton_products.json + assets/source-images/maraton_images/ klasörü
"""

import json, os, re, sys, time, hashlib
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeoutError
from curl_cffi import requests as cf
from paths import source_image_dir, source_product_path

SITEMAP_PATH = "/tmp/maraton_products.xml"
URL_LIST = "/tmp/maraton_urls.txt"
OUT_JSON = source_product_path("maraton_products.json")
IMAGE_DIR = source_image_dir("maraton_images")
PROFILE_DIR = "/tmp/maraton-chrome-profile2"
SITE_BASE = "https://www.maratonsw.com"

def make_slug(s: str, max_len: int = 80) -> str:
    s = (s or "").lower()
    tr_map = str.maketrans("şçğüöıİŞÇĞÜÖ", "scguoiISCGUO")
    s = s.translate(tr_map)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:max_len]

def download_image(url: str, subfolder: str, session=None) -> str | None:
    if not url or not url.startswith("http"):
        return None
    try:
        ext = os.path.splitext(urlparse(url).path)[1] or ".jpg"
        fname = hashlib.md5(url.encode()).hexdigest()[:12] + ext
        save_dir = os.path.join(IMAGE_DIR, subfolder)
        os.makedirs(save_dir, exist_ok=True)
        path = os.path.join(save_dir, fname)
        if os.path.exists(path):
            return path
        client = session or cf.Session(impersonate="chrome131")
        r = client.get(url, timeout=30)
        if r.status_code != 200 or len(r.content) < 200:
            return None
        with open(path, "wb") as f:
            f.write(r.content)
        return path
    except Exception as e:
        print(f"    img-fail {url[:60]}: {e}")
        return None

def parse_product(html: str, url: str) -> dict | None:
    """Extract Product JSON-LD; fallback to meta tags."""
    matches = re.findall(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.DOTALL,
    )
    product = None
    for m in matches:
        try:
            data = json.loads(m.strip())
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and item.get("@type") == "Product":
                        product = item
                        break
            elif isinstance(data, dict) and data.get("@type") == "Product":
                product = data
                break
        except Exception:
            continue
        if product:
            break
    if not product:
        return None

    offers = product.get("offers") or {}
    if isinstance(offers, list):
        offers = offers[0] if offers else {}

    images = product.get("image") or []
    if isinstance(images, str):
        images = [images]

    brand = product.get("brand")
    if isinstance(brand, dict):
        brand = brand.get("name")

    # Meta keywords for category hint
    keywords_match = re.search(r'<meta\s+name="keywords"\s+content="([^"]*)"', html)
    keywords = keywords_match.group(1) if keywords_match else ""

    short_desc_match = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', html)
    short_desc = short_desc_match.group(1) if short_desc_match else ""

    return {
        "url": url,
        "name": product.get("name") or "",
        "slug": make_slug(product.get("name") or ""),
        "sku": product.get("sku") or product.get("mpn") or "",
        "brand": brand or "Maraton",
        "description": product.get("description") or short_desc,
        "short_description": short_desc,
        "keywords": keywords,
        "price": float(offers.get("price") or 0),
        "currency": (offers.get("priceCurrency") or "TRY").upper(),
        "availability": offers.get("availability") or "",
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else None,
    }

def categorize(product: dict) -> str:
    """Heuristic category from keywords/name."""
    text = (product.get("keywords", "") + " " + product.get("name", "")).lower()
    rules = [
        ("T-Shirt", ["t-shirt", "tshirt", "tişört"]),
        ("Atlet", ["atlet", "tank top"]),
        ("Eşofman", ["eşofman", "esofman", "sweatpants", "jogger"]),
        ("Şort", ["şort", "sort"]),
        ("Tayt", ["tayt", "legging"]),
        ("Sweatshirt", ["sweatshirt", "sweat", "kapüşonlu", "hoodie"]),
        ("Mont/Ceket", ["mont", "ceket", "jacket", "yağmurluk"]),
        ("Çanta", ["çanta", "canta", "bag", "kemer"]),
        ("Çorap", ["çorap", "corap", "sock"]),
        ("Aksesuar", ["bere", "şapka", "havlu"]),
    ]
    for label, keys in rules:
        if any(k in text for k in keys):
            return label
    return "Genel"

def scrape():
    if not os.path.exists(URL_LIST):
        print(f"URL list yok: {URL_LIST}. Önce sitemap'tan üret.")
        sys.exit(1)
    urls = [u.strip() for u in open(URL_LIST) if u.strip()]
    print(f"Hedef URL: {len(urls)}", flush=True)

    products = []
    failed = []

    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            headless=False,
            channel="chrome",
            viewport=None,
            args=["--start-maximized", "--disable-blink-features=AutomationControlled"],
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()

        # CF challenge — homepage'e gidip ilk kez geçtikten sonra cookie ile çalışacak
        print("Homepage'e gidiyoruz, CF challenge bekleniyor...")
        page.goto(SITE_BASE, wait_until="domcontentloaded", timeout=60000)
        for _ in range(60):
            try:
                t = page.title()
                if not any(x in t for x in ("Just a moment", "Bir dakika", "einen Moment", "Un momento")):
                    print(f"  CF cleared: {t[:60]}")
                    break
            except Exception:
                pass
            time.sleep(1)
        else:
            print("  CF challenge geçilemedi — devam ediliyor (manuel müdahale gerekebilir)")

        time.sleep(2)

        for i, url in enumerate(urls, 1):
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=45000)
            except PWTimeoutError:
                print(f"  [{i}/{len(urls)}] TIMEOUT — atlanıyor: {url[-50:]}")
                failed.append(url)
                continue
            time.sleep(0.6)
            # CF re-challenge nadiren olur, kontrol et
            try:
                t = page.title()
                tries = 0
                while any(x in t for x in ("Just a moment", "Bir dakika", "einen Moment")) and tries < 15:
                    time.sleep(1)
                    t = page.title()
                    tries += 1
            except Exception:
                pass

            html = page.content()
            data = parse_product(html, url)
            if not data:
                print(f"  [{i}/{len(urls)}] no-jsonld: {url[-50:]}")
                failed.append(url)
                continue
            data["category"] = categorize(data)
            products.append(data)
            if i % 10 == 0 or i == 1:
                print(f"  [{i}/{len(urls)}] {data['name'][:50]} | {data['price']:.2f} {data['currency']}")

        ctx.close()

    print(f"\n{len(products)} ürün çekildi, {len(failed)} hata.")

    # Görselleri indir (curl_cffi ile, parallel-friendly)
    print("\nGörseller indiriliyor...")
    img_session = cf.Session(impersonate="chrome131")
    total_imgs = 0
    for i, p in enumerate(products, 1):
        sub = make_slug(p["name"])[:50]
        local = []
        for u in p.get("all_image_urls", []):
            path = download_image(u, sub, session=img_session)
            if path:
                local.append({"remote_url": u, "local_path": path})
                total_imgs += 1
        p["downloaded_images"] = local
        if i % 25 == 0 or i == 1:
            print(f"  [{i}/{len(products)}] {len(local)} img | total {total_imgs}")

    # Save JSON
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print(f"Toplam ürün: {len(products)}")
    print(f"Toplam görsel: {total_imgs}")
    cats = {}
    for p in products:
        cats[p["category"]] = cats.get(p["category"], 0) + 1
    for c, n in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {c}: {n}")
    print("=" * 60)
    print(f"Çıktı: {OUT_JSON}")
    if failed:
        open("/tmp/maraton_failed.txt", "w").write("\n".join(failed))
        print(f"Başarısız URL'ler: /tmp/maraton_failed.txt ({len(failed)})")

if __name__ == "__main__":
    scrape()
