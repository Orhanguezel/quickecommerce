"""
westnutrition.com.tr Takviye Edici Gida Scraper (IdeaSoft)
-------------------------------------------------
West Nutrition + Herbina markalarinin resmi magazasi. Sadece
/kategori/takviye-edici-gidalar kategorisindeki urunler cekilir.

Stok kaynagi (2026-09-29 dogrulandi):
  - Urun sayfasi: <input data-stockamount='2939'> gercek stok ADEDI verir;
    ayrica microdata <link itemprop='availability' href='schema.org/InStock'>.
    Tukenmis urunlerde OutOfStock + "Gelince Haber Ver" birlikte gorunur
    (efferwell-vitamin-c, magnezyum-kompleks-60 ile test edildi).
  - Varyantli urunler (aroma secenekli, paketler): IdeaSoft
    POST /product/related-options zincirlenerek her kombinasyonun alt urun
    id'si, SKU'su ve stok adedi alinir. Varyant stoklarinin toplami sayfadaki
    data-stockamount ile birebir tutuyor (BCAA 4:1:1: 967+988+984=2939).
    Endpoint fiyat donmez; alt urun fiyati ana urunle ayni (kontrol edildi).

FAIL-CLOSED: stok adedi ve availability okunamazsa urun stok 0 yazilir.
Bir varyant istegi basarisiz olursa urun hic yazilmaz (kismi varyant listesi
sync'te var olan varyantlari "kalkmis" sanip sifirlardi).

Kategori sayfasi tukenen urunleri listelemiyor olabilir; bu yuzden onceki
ciktidaki URL'ler de taranir — tukenen urun "missing" yerine stok 0 raporlanir.

Kullanim:
    python westnutrition_scraper.py              # tam tarama
    python westnutrition_scraper.py --limit 5    # test modu
Cikti: data/source-products/westnutrition_products.json
"""

import argparse
import json
import os
import re
import sys
import time

import requests
from bs4 import BeautifulSoup

from shopify_scraper import (
    clean_description_html,
    make_slug,
    resolve_output,
    resolve_relative_urls,
    strip_html,
)

BASE_URL = "https://www.westnutrition.com.tr"
CATEGORY_PATH = "/kategori/takviye-edici-gidalar"
PARENT_CATEGORY = "Takviye Edici Gidalar"
OUTPUT_NAME = "westnutrition_products.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
}


class ScrapeError(Exception):
    pass


def _clean_price(text):
    """'1.234,56 TL' -> 1234.56. Gecersizse None."""
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


def _abs_url(url):
    if not url:
        return ""
    url = url.strip()
    if url.startswith("//"):
        return "https:" + url
    if url.startswith("/"):
        return BASE_URL + url
    return url


def _get(session, url, retries=3):
    for attempt in range(1, retries + 1):
        try:
            resp = session.get(url, timeout=30)
            if resp.status_code == 404:
                return None
            if resp.status_code == 429:
                raise ScrapeError("429")
            resp.raise_for_status()
            return resp
        except Exception as exc:  # noqa: BLE001
            if attempt == retries:
                raise ScrapeError(f"GET {url}: {exc}") from exc
            time.sleep(5 * attempt)


def _related_options(session, parent_id, group_id, next_group_id, selected):
    """IdeaSoft varyant zinciri. `selected` ilk gruptan son seçime dogru sirali;
    tema JS'i listeyi tersten (son secim once) gonderir, ayni sekilde yollanir."""
    data = [
        ("parent_product_id", parent_id),
        ("selected_option_group_id", group_id),
    ]
    if next_group_id:
        data.append(("next_option_group_id", next_group_id))
    for opt in reversed(selected):
        data.append(("selected_options[]", opt))

    for attempt in range(1, 4):
        try:
            resp = session.post(
                f"{BASE_URL}/product/related-options",
                data=data,
                headers={"X-Requested-With": "XMLHttpRequest"},
                timeout=30,
            )
            payload = resp.json()
            if payload.get("success"):
                return payload["data"]["options"]
            raise ScrapeError(f"success=false: {str(payload)[:120]}")
        except Exception as exc:  # noqa: BLE001
            if attempt == 3:
                raise ScrapeError(f"related-options {parent_id}/{selected}: {exc}") from exc
            time.sleep(3 * attempt)


def _variant_groups(soup):
    groups = []
    for g in soup.select(".variant-plural .variant-list-group"):
        title = g.select_one(".variant-group-title")
        groups.append({
            "id": g.get("data-group-id"),
            "title": title.get_text(strip=True) if title else "",
            "options": [
                (sp.get("data-option-id"), sp.get("data-option-title", "").strip())
                for sp in g.select("span[data-option-id]")
            ],
        })
    return [g for g in groups if g["id"] and g["options"]]


def _enumerate_variants(session, parent_id, groups):
    """Tum kombinasyonlari dondurur: [(option_titles, option_dict), ...].

    Sondan bir onceki grupta yapilan istek, son grubun her secenegi icin tam
    kombinasyonu (alt urun id + stok) zaten dondurur; son grup icin ayrica
    istek atmaya gerek yok. Tek gruplu urunde her secenek ayri sorgulanir.
    """
    combos = []

    if len(groups) == 1:
        g = groups[0]
        for opt_id, opt_title in g["options"]:
            for o in _related_options(session, parent_id, g["id"], None, [opt_id]):
                combos.append(([opt_title], o))
            time.sleep(0.2)
        return combos

    def walk(level, selected, titles):
        g, nxt = groups[level], groups[level + 1]
        for opt_id, opt_title in g["options"]:
            sel = selected + [opt_id]
            if level + 1 == len(groups) - 1:
                for o in _related_options(session, parent_id, g["id"], nxt["id"], sel):
                    combos.append((titles + [opt_title, o.get("option_title", "")], o))
                time.sleep(0.2)
            else:
                walk(level + 1, sel, titles + [opt_title])

    walk(0, [], [])
    return combos


def _description(soup, url):
    row = soup.select_one(".product-detail-tab-row.active")
    body = None
    if row:
        panes = [c for c in row.find_all("div", recursive=False)
                 if "d-md-none" not in (c.get("class") or [])]
        body = panes[0] if panes else row
    html = body.decode_contents() if body else ""
    html = clean_description_html(resolve_relative_urls(html, url))
    return html


def _images(soup):
    images = []
    for a in soup.select(".thumb-item a"):
        src = _abs_url(a.get("data-zoom-image") or a.get("data-image") or "")
        if src.startswith("http") and src not in images:
            images.append(src)
    if not images:
        for el in soup.select(".product-image img, meta[itemprop=image]"):
            src = _abs_url(el.get("content") or el.get("src") or "")
            if src.startswith("http") and src not in images:
                images.append(src)
    return images


def parse_product(session, url):
    resp = _get(session, url)
    # Kaldirilan urunler 404 veriyor ya da anasayfaya yonleniyor (tribu90).
    if resp is None or "/urun/" not in resp.url:
        return None
    soup = BeautifulSoup(resp.text, "html.parser")

    pid_el = soup.select_one("input[name=productId]")
    h1 = soup.select_one("h1")
    if not pid_el or not h1:
        return None
    parent_id = pid_el.get("value")
    name = h1.get_text(strip=True)

    new_el = soup.select_one(".product-price-new")
    old_el = soup.select_one(".product-price-old")
    new_p = _clean_price(new_el.get_text()) if new_el else None
    old_p = _clean_price(old_el.get_text()) if old_el else None
    original_price = discounted_price = None
    if new_p and old_p and old_p > new_p:
        original_price, discounted_price = old_p, new_p
    elif new_p:
        original_price = new_p
    if original_price is None:
        meta_price = soup.select_one("meta[itemprop=price]")
        original_price = _clean_price(meta_price.get("content")) if meta_price else None
    if original_price is None:
        return None
    price = discounted_price if discounted_price is not None else original_price
    compare_at = original_price if discounted_price is not None else None

    # --- stok (fail-closed) ---
    qty_el = soup.select_one("input[data-stockamount]")
    stock_qty = None
    if qty_el:
        try:
            stock_qty = max(0, int(float(qty_el.get("data-stockamount"))))
        except (TypeError, ValueError):
            stock_qty = None
    avail_el = soup.select_one("[itemprop=availability]")
    avail = ((avail_el.get("href") or avail_el.get("content") or "") if avail_el else "").lower()
    microdata_in = "instock" in avail.replace("/", "")
    if stock_qty is None:
        stock_qty = 1 if microdata_in else 0
    elif not microdata_in:
        stock_qty = 0
    available = stock_qty > 0

    sku_el = soup.select_one("[itemprop=sku]")
    sku = (sku_el.get("content") or sku_el.get_text(strip=True)).strip() if sku_el else ""
    brand_el = soup.select_one("[itemprop=brand] [itemprop=name]")
    brand = (brand_el.get("content") or brand_el.get_text(strip=True)).strip() if brand_el else ""

    crumbs = [a.get_text(strip=True) for a in soup.select("#breadcrumbs a")
              if "/kategori/" in (a.get("href") or "")]
    category = crumbs[-1] if crumbs else PARENT_CATEGORY

    images = _images(soup)
    desc_html = _description(soup, url)
    slug = re.search(r"/urun/([^/?#]+)", url).group(1)

    variants = []
    options = []
    groups = _variant_groups(soup)
    if groups:
        options = [{"name": g["title"] or f"Secenek {i + 1}"} for i, g in enumerate(groups)]
        for titles, o in _enumerate_variants(session, parent_id, groups):
            v_qty = max(0, int(float(o.get("product_stock_amount") or 0)))
            # 3'ten fazla grup gelirse fazlasi option3'e katlanir.
            opts = titles[:2] + [" / ".join(titles[2:])] if len(titles) > 3 else titles
            opts += [None] * (3 - len(opts))
            variants.append({
                "id": str(o["product_id"]),
                "title": o.get("variant_name") or " / ".join(titles),
                "sku": o.get("product_sku") or "",
                "barcode": "",
                "price": price,
                "compare_at_price": compare_at,
                "stock_quantity": v_qty,
                "available": v_qty > 0,
                "option1": opts[0],
                "option2": opts[1],
                "option3": opts[2],
            })
        if not variants:
            raise ScrapeError(f"{url}: varyant grubu var ama kombinasyon donmedi")
        stock_qty = sum(v["stock_quantity"] for v in variants)
        available = stock_qty > 0
    else:
        variants.append({
            "id": str(parent_id),
            "title": "Default Title",
            "sku": sku,
            "barcode": "",
            "price": price,
            "compare_at_price": compare_at,
            "stock_quantity": stock_qty,
            "available": available,
            "option1": None,
            "option2": None,
            "option3": None,
        })

    return {
        "source_product_id": str(parent_id),
        "name": name,
        "slug": slug or make_slug(name),
        "url": url,
        "category": category,
        "parent_category": PARENT_CATEGORY,
        "vendor": brand or "West Nutrition",
        "product_type": "",
        "description_html": desc_html,
        "description_text": strip_html(desc_html),
        "original_price": original_price,
        "discounted_price": discounted_price,
        "discount_rate": None,
        "sku": sku,
        "barcode": "",
        "available": available,
        "stock_quantity": stock_qty,
        "specifications": [],
        "all_image_urls": images,
        "thumbnail_url": images[0] if images else "",
        "variants": variants,
        "options": options,
        "downloaded_images": [],
        "tags": [],
    }


def discover_urls(session, output_file):
    resp = _get(session, BASE_URL + CATEGORY_PATH)
    total_m = re.search(r"Toplam\s+(\d+)\s+ürün", resp.text)
    urls = []
    page = 1
    html = resp.text
    while True:
        found = [
            _abs_url(h) for h in re.findall(r'href="((?:https://www\.westnutrition\.com\.tr)?/urun/[^"?#]+)"', html)
        ]
        new = [u for u in dict.fromkeys(found) if u not in urls]
        urls.extend(new)
        if not new or page >= 20:
            break
        if total_m and len(urls) >= int(total_m.group(1)):
            break
        page += 1
        html = _get(session, f"{BASE_URL}{CATEGORY_PATH}?sayfa={page}").text
    print(f"  kategori: {len(urls)} URL (sitenin bildirdigi toplam: "
          f"{total_m.group(1) if total_m else '?'})")

    # Onceki ciktidaki urunleri de tara: tukenen urun kategori listesinden
    # duserse sync onu "missing" sayar; burada acikca stok 0 raporlanir.
    if os.path.exists(output_file):
        try:
            with open(output_file, encoding="utf-8") as f:
                previous = [p.get("url") for p in json.load(f) if p.get("url")]
            extra = [u for u in previous if u not in urls]
            if extra:
                print(f"  onceki ciktidan +{len(extra)} URL (listede artik yok)")
            urls.extend(extra)
        except Exception as exc:  # noqa: BLE001
            print(f"  WARN: onceki cikti okunamadi: {exc}")
    return urls


def main():
    parser = argparse.ArgumentParser(description="westnutrition.com.tr takviye scraper")
    parser.add_argument("--limit", type=int, default=0, help="Sadece ilk N urun (test)")
    args = parser.parse_args()

    output_file = resolve_output(OUTPUT_NAME)
    print(f"westnutrition.com.tr scraper -> {output_file}")
    print("=" * 50)

    session = requests.Session()
    session.headers.update(HEADERS)

    print("[1/2] Kategori URL'leri toplaniyor...")
    urls = discover_urls(session, output_file)
    if args.limit > 0:
        urls = urls[: args.limit]
    if not urls:
        print("HATA: urun URL'i bulunamadi.")
        sys.exit(1)

    print(f"\n[2/2] {len(urls)} urun cekiliyor...")
    products, failed, gone = [], [], []
    for i, url in enumerate(urls, 1):
        try:
            prod = parse_product(session, url)
        except ScrapeError as exc:
            failed.append(url)
            print(f"  [{i}/{len(urls)}] FAIL {exc}")
            continue
        if prod is None:
            gone.append(url)
            print(f"  [{i}/{len(urls)}] urun yok/kaldirilmis: {url.rsplit('/', 1)[-1]}")
            continue
        products.append(prod)
        print(f"  [{i}/{len(urls)}] {prod['name'][:45]} | {prod['original_price']} TL"
              f" | stok {prod['stock_quantity']} | {len(prod['variants'])} varyant")
        time.sleep(0.5)

    # Kismi tarama korumasi: yarisindan fazlasi fail ise eski JSON'u ezme.
    if failed and len(failed) > len(urls) / 2:
        print(f"HATA: {len(failed)}/{len(urls)} urun fail — cikti yazilmadi.")
        sys.exit(1)

    tmp = output_file + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    os.replace(tmp, output_file)

    in_stock = sum(1 for p in products if p["available"])
    n_var = sum(len(p["variants"]) for p in products)
    print(f"\nTamamlandi! {len(products)} urun / {n_var} varyant ({in_stock} stokta),"
          f" {len(failed)} fail, {len(gone)} kaldirilmis -> {output_file}")
    if not products:
        sys.exit(1)


if __name__ == "__main__":
    main()
