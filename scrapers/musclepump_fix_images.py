"""
MusclePump'da gorseli olmayan urunlerin gorsellerini thumb.ashx
handler uzerinden cek ve data/source-products/musclepump_products.json'i guncelle.
"""

import json, os, re, hashlib, requests
from urllib.parse import urlparse
from paths import source_image_dir, source_product_path

DATA = source_product_path("musclepump_products.json")
IMG_DIR = source_image_dir("musclepump_images")
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)"}

session = requests.Session()
session.headers.update(HEADERS)


def make_slug(name, max_len=80):
    s = (name or "").lower()
    tr = str.maketrans("şçğüöıİŞÇĞÜÖ", "scguoiISCGUO")
    return re.sub(r"[^a-z0-9]+", "-", s.translate(tr)).strip("-")[:max_len]


def to_thumb_url(direct_url, width=800, height=800):
    """https://musclepump.com.tr/Resim/3409.jpg
       -> https://musclepump.com.tr/thumb.ashx?width=800&height=800&Resim=/Resim/3409.jpg"""
    parsed = urlparse(direct_url)
    path = parsed.path  # /Resim/3409.jpg
    return f"https://musclepump.com.tr/thumb.ashx?width={width}&height={height}&Resim={path}"


def download(url, subfolder):
    try:
        ext = ".jpg"  # thumb.ashx genelde JPG/PNG verir; uzantı önemsiz
        fname = hashlib.md5(url.encode()).hexdigest()[:12] + ext
        save_dir = os.path.join(IMG_DIR, subfolder)
        os.makedirs(save_dir, exist_ok=True)
        path = os.path.join(save_dir, fname)
        if os.path.exists(path) and os.path.getsize(path) > 1000:
            return path
        r = session.get(url, timeout=20)
        if r.status_code != 200 or len(r.content) < 1000:
            return None
        # PNG vs JPG ayır
        if r.content[:8] == b"\x89PNG\r\n\x1a\n":
            path = path.replace(".jpg", ".png")
        with open(path, "wb") as f:
            f.write(r.content)
        return path
    except Exception as e:
        print(f"    fail {url[:60]}: {e}")
        return None


def main():
    data = json.load(open(DATA, encoding="utf-8"))
    fixed = 0
    still_missing = []

    for p in data:
        if p.get("downloaded_images"):
            continue  # Zaten görseli var
        # Görselsiz — image_urls'leri thumb.ashx ile yeniden dene
        sub = make_slug(p["name"])[:50]
        local = []
        new_urls = []
        for url in p.get("all_image_urls", []):
            # Sadece /Resim/ direkt URL'leri için thumb.ashx çevir
            if "/Resim/" in url and "thumb.ashx" not in url:
                thumb = to_thumb_url(url, 800, 800)
                path = download(thumb, sub)
                if path:
                    local.append({"remote_url": thumb, "local_path": path})
                    new_urls.append(thumb)
            else:
                # zaten thumb.ashx ise direkt
                path = download(url, sub)
                if path:
                    local.append({"remote_url": url, "local_path": path})
                    new_urls.append(url)
        if local:
            p["downloaded_images"] = local
            # all_image_urls listesine de yenileri ekle
            existing = set(p.get("all_image_urls", []))
            for u in new_urls:
                if u not in existing:
                    p.setdefault("all_image_urls", []).append(u)
            p["thumbnail_url"] = new_urls[0]
            fixed += 1
            print(f"  ✓ {p['name'][:55]} → {len(local)} img")
        else:
            still_missing.append(p)

    print(f"\n{fixed} ürün için görsel eklendi. {len(still_missing)} hâlâ görselsiz.")
    if still_missing:
        print("\nGörselsiz kalan örnek:")
        for p in still_missing[:5]:
            print(f"  - {p['name'][:55]}")

    with open(DATA, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\nKaydedildi: {DATA}")


if __name__ == "__main__":
    main()
