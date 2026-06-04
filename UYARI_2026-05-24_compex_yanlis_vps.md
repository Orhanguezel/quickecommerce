# UYARI — Compex resim scraper'i yanlis VPS'te calisti

**Tarih:** 2026-05-24
**Tetiklenen alarm:** Netdata `load_average_warn` — srv547624 load 11.8 (sonra 3.6'ya dustu)
**Sunucu:** srv547624 = **guezelwebdesign VPS** (72.61.93.212) — **YANLIS YER**

## Olay

`/tmp/compex_fetch_images.py` ve `/tmp/compex.json` guezelwebdesign VPS'inde calistirildi. 161 Compex urunu icin Scrapling Stealthy ile resim indirme denemesi. Sonuc:

| Metrik | Deger |
|---|---|
| Calisma suresi | 37+ dakika |
| Indirilen resim | **0** (Cloudflare bypass kilitlendi) |
| Acilen kalan chrome process | **9.831 zombie + 31 canli** |
| Sistem yuku | 11.8 → 3.6 (2 CPU icin hala yuksek) |
| Bellek | 2.4 GB swap aktif (bellek baskisi) |

## Sebep

Scraper, guezelwebdesign VPS'inde calistirilmamasi gereken yere konuldu. Bu VPS'te canli olarak su projeler var:
- guezelwebdesign.de
- kamanilan.com (FE 3060, BE 8097)
- konigsmassage.de
- gzltemizlik.com
- kaman-social
- ekosistem-sosyal-medya (sozial.wirubu.de — ilk paying tenant)

Hepsi 2 CPU / 8 GB RAM'i paylasiyor. Stealthy Chromium scraping bu VPS'in kapasitesini yer, canli musterileri etkiler.

## Dogru yer

Compex / Maraton tarzi Cloudflare arkasi scraping islerine ait dogru hedefler:

1. **scraper-service** (merkezi) — `scraper.guezelwebdesign.com`, port 8200
   - Repo: github.com/Orhanguezel/scraper-service
   - Scrapling tabanli, API key auth, rate limit, izole
   - Compex resmi cekme islemi buraya bir endpoint olarak eklenmeli
2. **VPS-sportoonline** (`root@srv1275633`, `/var/www/quikecommerce/scrapers/`)
   - Maraton scraper'i zaten burada calisiyor (gunluk cron 02:00 UTC)
   - Compex de buraya tasinabilir, ama tercih edilen scraper-service

## Kural

> Bu repo'nun Cloudflare arkasi scraping islemleri **guezelwebdesign VPS'inde KESINLIKLE calistirilmaz**. Hedef: scraper-service (oncelik) veya VPS-sportoonline.

## Temizlik (yapilacak)

- [x] guezelwebdesign VPS'te calisan `compex_fetch_images.py` (PID 3897390) durdurulacak — `<defunct>` durumda
- [x] /tmp/compex_fetch_images.py, /tmp/compex.json, /tmp/compex_smoke.py silinecek
- [ ] **Zombie chrome process'leri scraper-service container restart ile temizlenecek** (~9.9k zombi, parent: arq worker)
- [ ] Compex resmi cekme isi scraper-service'e endpoint olarak tasinacak

## Asil bug (asagi katmanda bulundu)

guezelwebdesign VPS'te calisan **scraper-service** (`scraper.guezelwebdesign.com`, port 8200) `arq` worker'inda Playwright/Patchright tarafindan spawn edilen Chromium subprocess'leri `waitpid()` cagrilmadan birakiliyor. 3.5 gunde **9.898 defunct chrome** birikmis (parent: PID 3757502 = arq worker).

**Sebep:** scrapling `StealthyFetcher.fetch()` sync — `asyncio.to_thread` icinde subprocess.Popen ile chromium baslatiyor. Browser close yolu CF solve takildiginda exception atinca subprocess'in `Popen.wait()`'i atlaniyor → kernel zombie tutuyor.

**Fix:** `vps-guezel/scraper-service/src/lib/reaper.py` — `_reap_zombies()` eklendi (`os.waitpid(-1, WNOHANG)` loop), cron her 5 dk drain ediyor.

**Deploy:** scraper-service container'i guezelwebdesign VPS'te restart edilmeli:
```bash
ssh orhan@72.61.93.212
cd /var/www/scraper-service && docker compose up -d --build worker
```
Restart hem mevcut zombi chain'i temizler hem yeni reaper'i devreye sokar.

## Referans

- VPS deploy kurallari: `~/.claude/.../memory/MEMORY.md`
- QuickEcommerce scraping detayi: `~/.claude/.../memory/quickecommerce.md`
- Scraper-service: `~/.claude/.../memory/scraper_service.md`
