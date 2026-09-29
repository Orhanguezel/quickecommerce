#!/usr/bin/env python3
"""Derin analiz 2026-09-29 duzeltmelerinin canli kabul testleri.

Kullanim:
  python3 scripts/verify-derin-analiz.py                 # tum kontroller
  python3 scripts/verify-derin-analiz.py prices          # 20 SKU fiyat esitligi
  python3 scripts/verify-derin-analiz.py monitor-categories [--out FILE]
      # tek tur kategori izleme satiri (cron ile 15 dk'da bir, 24 saat)

Yalniz GET istegi atar; siparis/sepet olusturmaz.
"""
import json
import re
import sys
import time
import urllib.error
import urllib.request

SITE = "https://sportoonline.com"
API = f"{SITE}/api/v1"
UA = "Mozilla/5.0 (verify-derin-analiz)"

FAILURES: list[str] = []


def get(url: str, timeout: int = 60) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return res.status, res.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as err:
        return err.code, err.read().decode("utf-8", "replace")


def check(ok: bool, label: str) -> None:
    print(("OK   " if ok else "FAIL ") + label)
    if not ok:
        FAILURES.append(label)


def ld_blocks(html: str) -> list[dict]:
    out = []
    for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            out.append(json.loads(raw))
        except json.JSONDecodeError:
            pass
    return out


def display_price(product: dict) -> float | None:
    """customer-web lib/product-pricing.ts resolveProductPricing ile ayni kural."""
    def pos(v):
        try:
            n = float(v)
            return n if n > 0 else None
        except (TypeError, ValueError):
            return None

    variants = (product.get("variants") or []) + (product.get("singleVariant") or [])
    chosen = None
    for vid in [product.get("default_variant_id")]:
        chosen = next((v for v in variants if v.get("id") == vid and (pos(v.get("price")) or pos(v.get("special_price")))), None)
    if not chosen:
        chosen = next((v for v in variants if pos(v.get("price")) or pos(v.get("special_price"))), None)
    if chosen:
        price, special = pos(chosen.get("price")), pos(chosen.get("special_price"))
        original = price or special
        base = special if (price and special and special < price) else None
    else:
        original = pos(product.get("price")) or pos(product.get("special_price"))
        rs = pos(product.get("special_price"))
        base = rs if (original and rs and rs < original) else None
    shown = base or original
    fs = product.get("flash_sale")
    if shown and fs and float(fs.get("discount_amount") or 0) > 0:
        d = float(fs["discount_amount"])
        shown = max(0.0, shown - (shown * d / 100 if fs.get("discount_type") == "percentage" else d))
    return round(shown, 2) if shown else None


def prices() -> None:
    print("\n== Fiyat esitligi (sayfa JSON-LD / meta / API) + feed ==")
    _, feed = get(f"{SITE}/feeds/google.xml", timeout=120)
    feed_items = {}
    for item in re.findall(r"<item>(.*?)</item>", feed, re.S):
        link = re.search(r"<g:link><!\[CDATA\[(.*?)\]\]>", item)
        if not link:
            continue
        sale = re.search(r"<g:sale_price>([\d.]+) TRY", item)
        price = re.search(r"<g:price>([\d.]+) TRY", item)
        feed_items[link.group(1).rsplit("/", 1)[-1]] = float((sale or price).group(1))

    # 5+ flash sale urunu, sonra genel liste — toplam 20 SKU
    slugs: list[str] = []
    _, fs_body = get(f"{API}/product-list?per_page=40&language=tr&has_flash_sale=1")
    _, all_body = get(f"{API}/product-list?per_page=60&language=tr&sort=popular")
    for body in (fs_body, all_body):
        try:
            data = json.loads(body).get("data") or []
        except json.JSONDecodeError:
            data = []
        for p in data:
            if p.get("slug") and p["slug"] not in slugs:
                if body is fs_body and not p.get("flash_sale"):
                    continue
                slugs.append(p["slug"])
    slugs = slugs[:20]

    for slug in slugs:
        _, api_body = get(f"{API}/product/{slug}?language=tr")
        try:
            product = json.loads(api_body)["data"]
        except (json.JSONDecodeError, KeyError, TypeError):
            check(False, f"{slug}: API okunamadi")
            continue
        expected = display_price(product)
        status, html = get(f"{SITE}/tr/urun/{slug}")
        offer = next((b.get("offers", {}).get("price") for b in ld_blocks(html) if b.get("@type") == "Product"), None)
        meta = re.findall(r'product:price:amount" content="([^"]+)', html)
        parts = [f"beklenen={expected}", f"jsonld={offer}", f"meta={meta[:1]}"]
        ok = status == 200 and expected is not None and offer is not None and abs(float(offer) - expected) < 0.01
        ok = ok and (not meta or abs(float(meta[0]) - expected) < 0.01)
        if slug in feed_items:
            parts.append(f"feed={feed_items[slug]}")
            ok = ok and abs(feed_items[slug] - expected) < 0.01
        tag = " [flash]" if product.get("flash_sale") else ""
        check(ok, f"{slug}{tag}: " + " ".join(parts))


def pagination_and_index() -> None:
    print("\n== Sayfalama / indeks politikasi ==")
    for path, want in [
        ("/tr/kategori/proteinler?page=9999", 404),
        ("/tr/urunler?page=9999", 404),
        ("/tr/urunler?page=2", 200),
        ("/tr/kategori/proteinler", 200),
    ]:
        code, _ = get(SITE + path)
        check(code == want, f"{path} -> {code} (beklenen {want})")

    _, html = get(f"{SITE}/tr/urunler?search=whey")
    check('content="noindex, follow"' in html, "/tr/urunler?search= noindex,follow")

    # Filtreli URL'ler kanonik olarak filtresiz sayfaya isaret etmeli.
    for path, canonical in [
        ("/tr/kategori/proteinler?sort=price_low", "/tr/kategori/proteinler"),
        ("/tr/kategori/proteinler?min_price=100&max_price=500", "/tr/kategori/proteinler"),
        ("/tr/urunler?brand_id=18", "/tr/urunler"),
    ]:
        _, html = get(SITE + path)
        found = re.search(r'<link rel="canonical" href="([^"]+)"', html)
        check(bool(found) and found.group(1).endswith(canonical), f"{path} canonical={found.group(1) if found else None}")


def sitemap() -> None:
    print("\n== Sitemap ==")
    _, xml = get(f"{SITE}/sitemap.xml", timeout=120)
    stores = sorted(set(re.findall(r"<loc>https://sportoonline\.com/tr/magaza/([^<]+)</loc>", xml)))
    _, body = get(f"{API}/store-list?per_page=100&language=tr")
    empty = {s["slug"] for s in json.loads(body)["data"] if s.get("total_product") == 0}
    leaked = [s for s in stores if s in empty]
    check(not leaked, f"sitemap'te bos magaza yok ({len(stores)} magaza; sizan={leaked})")


def feed_brand() -> None:
    print("\n== Merchant feed marka ==")
    _, feed = get(f"{SITE}/feeds/google.xml", timeout=120)
    check("<g:brand><![CDATA[Sportoonline]]>" not in feed, "feed'de brand=Sportoonline yok")


def monitor_categories(out: str | None) -> None:
    """24 saatlik izleme: kategori basina gorunen urun sayisi + robots."""
    _, body = get(f"{API}/product-category/list?per_page=1000&all=true&language=tr")
    cats = json.loads(body).get("data") or []
    cats = sorted(cats, key=lambda c: -int(c.get("product_count") or 0))[:20]
    ts = time.strftime("%Y-%m-%dT%H:%M:%S")
    rows = []
    for c in cats:
        slug = c["category_slug"]
        code, html = get(f"{SITE}/tr/kategori/{slug}")
        m = re.search(r"/\s*([\d.]+)\s*Ürün", html)
        noindex = 'name="robots" content="noindex' in html
        rows.append({"ts": ts, "slug": slug, "status": code, "counted": c.get("product_count"),
                     "listed": m.group(1) if m else None, "noindex": noindex})
    line = "\n".join(json.dumps(r, ensure_ascii=False) for r in rows)
    if out:
        with open(out, "a", encoding="utf-8") as fh:
            fh.write(line + "\n")
    else:
        print(line)
    bad = [r["slug"] for r in rows if r["noindex"] and int(r["counted"] or 0) > 0]
    if bad:
        print("UYARI: sayaci dolu ama noindex:", bad, file=sys.stderr)


def main() -> int:
    args = sys.argv[1:]
    if args[:1] == ["monitor-categories"]:
        out = args[args.index("--out") + 1] if "--out" in args else None
        monitor_categories(out)
        return 0
    if args[:1] == ["prices"]:
        prices()
    else:
        prices()
        pagination_and_index()
        sitemap()
        feed_brand()
    print(f"\n{len(FAILURES)} basarisiz kontrol")
    return 1 if FAILURES else 0


if __name__ == "__main__":
    sys.exit(main())
