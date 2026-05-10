"""
Muscle Pump Resmi Site Scraper (musclepump.com.tr)
---------------------------------------------------

Kaynak: Akinsoft tabanli HTML magaza, sitemap'te 184 urun.
Botlamaya duyarli degil — Googlebot UA ile direkt curl'le calisir.

Cikti:
  data/source-products/musclepump_products.json + assets/source-images/musclepump_images/
"""

import json, os, re, time, hashlib
from urllib.parse import urlparse
import requests
from paths import source_image_dir, source_product_path

BASE = "https://musclepump.com.tr"
SITEMAP = f"{BASE}/products_1.xml"
OUT_JSON = source_product_path("musclepump_products.json")
IMAGE_DIR = source_image_dir("musclepump_images")
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "tr-TR,tr;q=0.9",
}

session = requests.Session()
session.headers.update(HEADERS)


def make_slug(name: str, max_len: int = 80) -> str:
    s = (name or "").lower()
    tr_map = str.maketrans("şçğüöıİŞÇĞÜÖ", "scguoiISCGUO")
    s = s.translate(tr_map)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:max_len]


def parse_product(html: str, url: str) -> dict | None:
    """
    Akinsoft HTML'inde structured veri:
      - GA dataLayer:  item_id / item_name (urunBaslik) / price / item_category / item_brand
      - og:title, og:description, og:image
      - sepetFiyat = parseFloat('FIYAT'.replace(...
      - urunBaslik = ConvertNormalString(`URUN_ADI`)
    """
    # Real product name from urunBaslik backtick literal (en güvenilir kaynak)
    name_m = re.search(r"urunBaslik\s*=\s*ConvertNormalString\(\s*`([^`]+)`", html)
    name = name_m.group(1).strip() if name_m else None

    # Fallback: og:title - " / Muscle Pump" suffix ya da " | ..." cleanup
    if not name:
        og_title = re.search(r'<meta\s+property="og:title"\s+content="([^"]+)"', html)
        if og_title:
            name = re.sub(r"\s*/\s*Muscle Pump.*$|\s*\|\s*Muscle Pump.*$", "", og_title.group(1)).strip()

    if not name:
        return None

    # Price
    price_m = re.search(r"sepetFiyat\s*=\s*parseFloat\(\s*'([0-9.,]+)'\s*\.replace\(", html)
    price = 0.0
    if price_m:
        try:
            price = float(price_m.group(1).replace(",", "."))
        except Exception:
            price = 0.0

    # Item id (Akinsoft urun ID)
    item_id_m = re.search(r"item_id\s*:\s*'([^']+)'", html)
    item_id = item_id_m.group(1) if item_id_m else None

    # Category from gtag event
    cat_m = re.search(r"item_category\s*:\s*'([^']+)'", html)
    category = cat_m.group(1).strip() if cat_m else None

    # Brand
    brand_m = re.search(r"item_brand\s*:\s*'([^']+)'", html)
    brand = brand_m.group(1).strip() if brand_m else "Muscle Pump"

    # Description
    desc_m = re.search(r'<meta\s+property="og:description"\s+content="([^"]*)"', html)
    description = desc_m.group(1).strip() if desc_m else ""

    # Image — ana görsel /Resim/{id}.jpg + thumb sürümü og:image
    image_urls = []
    if item_id:
        image_urls.append(f"{BASE}/Resim/{item_id}.jpg")
    og_img = re.search(r'<meta\s+property="og:image"\s+content="([^"]+)"', html)
    if og_img and og_img.group(1) not in image_urls:
        image_urls.append(og_img.group(1))

    # Galeri görselleri — UrunResimleri / image rotation div
    gallery = re.findall(
        r'(?:src|data-src|href)="([^"]+/Resim/[^"]+\.(?:jpg|jpeg|png|webp))"',
        html, re.IGNORECASE,
    )
    for g in gallery:
        full = g if g.startswith("http") else BASE + g
        if full not in image_urls:
            image_urls.append(full)
    # Filter logo/footer/category icon images
    image_urls = [
        u for u in image_urls
        if not any(x in u.lower() for x in ("logo_", "/minik/", "/dosyalar/", "iyzico", "watermark", "/banner"))
    ]

    # SKU code from URL or use item_id
    # URL pattern: .../prd-name-VARIANT-PRODUCT_CODE
    url_code_m = re.search(r"-(\d+)$", url.rstrip("/"))
    sku = item_id or (url_code_m.group(1) if url_code_m else None)

    # Stock — sayfa "Stokta Yok" / "Stoğu Tükenmiş" göstergesi yoksa in-stock
    in_stock = not any(s.lower() in html.lower() for s in ["stokta yok", "stoğu tükenmiş", "tükenmiş"])

    return {
        "url": url,
        "source_id": item_id,
        "name": name,
        "slug": make_slug(name),
        "sku": sku or f"MP-{item_id or 'unk'}",
        "brand": brand or "Muscle Pump",
        "category": category or "Genel",
        "description": description,
        "price": price,
        "currency": "TRY",
        "in_stock": in_stock,
        "all_image_urls": image_urls,
        "thumbnail_url": image_urls[0] if image_urls else None,
    }


def download_image(url: str, subfolder: str) -> str | None:
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
        r = session.get(url, timeout=20)
        if r.status_code != 200 or len(r.content) < 200:
            return None
        with open(path, "wb") as f:
            f.write(r.content)
        return path
    except Exception:
        return None


def fetch_url_list() -> list[str]:
    print("Sitemap çekiliyor...", flush=True)
    r = session.get(SITEMAP, timeout=30)
    r.raise_for_status()
    urls = re.findall(r"<loc>(https://[^<]+)</loc>", r.text)
    urls = [u for u in urls if "/prd-" in u]
    return list(dict.fromkeys(urls))


def main():
    urls = fetch_url_list()
    print(f"Toplam ürün URL: {len(urls)}", flush=True)

    products = []
    failed = []
    for i, url in enumerate(urls, 1):
        try:
            r = session.get(url, timeout=20)
            if r.status_code != 200:
                print(f"  [{i}/{len(urls)}] HTTP {r.status_code}: {url[-60:]}", flush=True)
                failed.append(url)
                continue
            data = parse_product(r.text, url)
            if not data or not data.get("name"):
                print(f"  [{i}/{len(urls)}] parse fail: {url[-60:]}", flush=True)
                failed.append(url)
                continue
            products.append(data)
            if i % 20 == 0 or i == 1:
                print(f"  [{i}/{len(urls)}] {data['name'][:55]} | {data['price']} TRY", flush=True)
        except Exception as e:
            print(f"  [{i}/{len(urls)}] ERROR: {e}", flush=True)
            failed.append(url)
        time.sleep(0.15)

    print(f"\nÇekildi: {len(products)} | Başarısız: {len(failed)}", flush=True)

    print("\nGörseller indiriliyor...", flush=True)
    total_imgs = 0
    for i, p in enumerate(products, 1):
        sub = make_slug(p["name"])[:50]
        local = []
        for u in p.get("all_image_urls", []):
            path = download_image(u, sub)
            if path:
                local.append({"remote_url": u, "local_path": path})
                total_imgs += 1
        p["downloaded_images"] = local
        if i % 25 == 0 or i == 1:
            print(f"  [{i}/{len(products)}] {len(local)} img | total {total_imgs}", flush=True)

    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    cats = {}
    for p in products:
        cats[p["category"]] = cats.get(p["category"], 0) + 1
    print("\n" + "=" * 60)
    print(f"Toplam ürün : {len(products)}")
    print(f"Toplam görsel: {total_imgs}")
    print("Kategoriler:")
    for c, n in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {c}: {n}")
    print("=" * 60)
    print(f"Çıktı: {OUT_JSON}")
    if failed:
        open("/tmp/musclepump_failed.txt", "w").write("\n".join(failed))
        print(f"Başarısız: /tmp/musclepump_failed.txt ({len(failed)})")


if __name__ == "__main__":
    main()
