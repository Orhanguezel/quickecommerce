# CLAUDE.md — QuickEcommerce

> **Claude Code talimati:** Bu dosya quickecommerce dizininde calisirken otomatik baglama dahil olur. "Aktif Hatirlatmalar" bolumunde her madde icin `Today's date` ile karsilastir, vakti gelmis maddeleri kullaniciya **proaktif olarak** hatirlat — kullanici sormasa bile.

## 🔔 Aktif Hatirlatmalar (TARIH ILE KONTROL ET)

### 🔔 2026-06-05 sabah (KOKLU STOK SISTEMI — ILK GERCEK CRON SONRASI)
**Why:** 2026-06-04'te scraper stok sistemi koklu refactor edildi: provitanya 10 gunluk sessiz fail duzeltildi, proteinmax "GELINCE HABER VER" detection eklendi, SyncSourcePrices bool→100 yerine bool→1 yapildi, Telegram alarm sistemi kuruldu (`@haldefiyat_fiyat_bot`). Yarin 05:00 TR'de ilk gercek cron tum sistemle calisacak.
**Yapilacak (sabah ilk is):**
```bash
# 1) Telegram'a saglik raporu geldi mi kontrol et (sportoonlinecom hesabi)
# Bos = tum sistem temiz. Sorun varsa digest gelir.

# 2) DB tarafinda stok=100 oraninin dustugunu dogrula (bool→1 etkisi)
ssh vps-sportoonline 'cd /var/www/quikecommerce/backend-laravel && php artisan scrapers:health-check --quiet-when-ok'
# Beklenen: 0 sorun (stok=100 oranlari %1'in altina dusmus olmali)

# 3) Spot check: yok satan urunler artik tukendi mi
ssh vps-sportoonline 'cd /var/www/quikecommerce/backend-laravel && php artisan tinker --execute="
echo \"stok=0 / source: \"; echo App\\Models\\ProductVariant::whereHas(\"sourceMapping\")->where(\"stock_quantity\", 0)->count();
echo \" / stok=1 / source: \"; echo App\\Models\\ProductVariant::whereHas(\"sourceMapping\")->where(\"stock_quantity\", 1)->count();
"'
```
- **Eger sorun yoksa**: Sistem koklu calisiyor, manuel kontrol bitti.
- **Telegram'a sorun digest geldi**: log oku → `tail -100 /var/www/quikecommerce/logs/scrapers-20260605.log`
- **stok=1 sayisi ~13.000 civari**: bool→1 etkisi dogru, frontend "Stokta" gosteriyor (sayi gizli).
- **scrapers-health.log da incele**: `tail /var/www/quikecommerce/backend-laravel/storage/logs/scrapers-health.log`

### 🔔 2026-06-08 civari (1 HAFTA STOK SISTEMI GOZLEM)
**Yapilacak:** 4 gun stok sistemi calistiktan sonra:
- Telegram'da kac alarm geldi? (cron fail'leri yakalandi mi?)
- Yok satan urunler oldu mu? (musteri sikayeti / siparis kontrol)
- Hangi scraper'lar hala "bool only" donduruyorsa onlara da CSS class detection eklenmesi gerekebilir (linktech/eprotein/herbinatura — %100 true donduruyorlar)

### 🔔 2026-05-22 civari (SIPARIS MAIL LOGLARI — OKU)
**Why:** 2026-05-15'te Gmail SMTP canliya alindi (`sportoonlinecom@gmail.com`) ve daha once sessizce yutulan sipariş mail/push hatalari artik loglaniyor. Bir hafta gercek siparis trafigi sonrasi loglar okunup teslimat saglikli mi dogrulanmali.
**Yapilacak:** Kullaniciya proaktif hatirlat ve calistir:
```bash
ssh vps-sportoonline "grep -E '\[order-email\]|\[order-push\]' /var/www/quikecommerce/backend-laravel/storage/logs/laravel*.log | tail -50"
```
- **Cikti bos** → mail/push akisi temiz, sorun yok (ideal).
- **`[order-email]` satirlari var** → siparis maili gitmiyor olabilir. Hata mesajina bak:
  - Gmail auth/limit (5xx, "Daily user sending limit exceeded") → ~500/gun limiti asildi, transactional servise gecis konus
  - Connection/timeout → VPS'ten smtp.gmail.com:587 erisimi/firewall
  - Template/data hatasi → `order-created*` sablonlari veya order verisi
- **`[order-push]` satirlari** → Firebase push; mail kritik degil, ikincil.
- Not: Musteriye hicbir sey yansimiyor (catch'ler hala yutuyor, sadece logluyor) — sessiz hata riski bu yuzden manuel kontrol gerektiriyor.

### 🔔 2026-05-03 sabahi (ILK CRON RUN — KRITIK)
**Yapilacak:** Cron yarın sabah 05:00 TR'de ilk kez çalısacak. Sabah kullaniciya sor:
```bash
ssh vps-sportoonline '/var/www/quikecommerce/scrapers/health.sh'
```
- Beklenen: 6 scraper "OK" (0 saat once), `Bu Gunkun Cron` → 6 basarili, sync exit code 0
- **Eger fail varsa**: log oku → `tail -100 /var/www/quikecommerce/logs/scrapers-20260503.log`
  - Maraton timeout → scraper-service down olabilir, `curl https://scraper.guezelwebdesign.com/health` kontrol
  - Diger scraperlar hata → site yapisi degismis olabilir, manuel test et
  - sync exit !=0 → JSON formatinda alan eksik veya laravel parameter degisimi gerek

### 🔔 2026-05-09 civari (1 HAFTA GOZLEM)
**Yapilacak:** Hafta boyunca cron gunluk basarili calisti mi?
```bash
ssh vps-sportoonline 'ls -la /var/www/quikecommerce/logs/scrapers-*.log | tail -10'
```
- 7 log dosyasi olmasi gerek (her gun 1)
- Eksik gun varsa: cron tetiklenmedi mi, fail oldu mu? → `tail /var/log/cron-scrapers.log`

### 🔔 2026-05-15 civari (LOG RETENTION)
**Yapilacak:** Log dosyalari birikiyor (gunluk ~5MB). 30+ gun olanlari sil:
```bash
ssh vps-sportoonline 'find /var/www/quikecommerce/logs -name "scrapers-*.log" -mtime +30 -delete'
```
- Bunu **otomatik cron** yap: `crontab -e` -> `0 4 * * 0 find /var/www/quikecommerce/logs -name "scrapers-*.log" -mtime +30 -delete`

### 🔔 BEKLEYEN: dropick + norfolk scraper yazimi
**Why:** `data/source-products/dropick_products.json` (74 urun) ve `data/source-products/norfolk_products.json` (309 urun) JSON'lari **manuel** yukleniyor. Scraper script yok.
**Yapilacak (kullanici onaylarsa):**
- JSON'larda `url` alani var mi kontrol → `python3 -c "import json; d=json.load(open('data/source-products/dropick_products.json')); print(d[0].keys())"`
- URL pattern net ise her ikisi icin scraper yaz (dropick.com, norfolk.com.tr — anti-bot kontrol et)
- run-all.sh'a ekle, gunluk cron'a katil

### 🔔 BEKLEYEN: Maraton sitemap full scrape (yeni urun discovery)
**Why:** Mevcut cron `--urls-from data/source-products/maraton_products.json` kullaniyor — sadece 401 mevcut urun guncel. Maraton katalogunda 2737 urun var. Yeni eklenenleri yakalamak icin haftada 1 full sitemap scrape lazim.
**Yapilacak:**
- Ayri cron: `0 22 * * 0` (her Pazar gece 22:00 UTC = 01:00 Pazartesi TR) → sitemap full ~16 saat
- `--urls-from` flag'i kaldir, scraper sitemap discover yapar
- Yeni urunler import:products ile DB'ye eklenmeli (manuel onay)

---

## ⚡ ÖNCE BUNU ÇALIŞTIR (her oturum başında)

Bu projeye baktığında **ilk iş** scraper sağlık raporunu kontrol et:

```bash
ssh vps-sportoonline '/var/www/quikecommerce/scrapers/health.sh'
```

Çıktıda şunlara bak:
- **JSON Output Dosyalari**: Her scraper son N saat onceki bir cikti uretmis mi (OK / ESKI / OLDU)
- **Bu Gunkun Cron**: bugun cron tetiklendi mi, kac scraper basarili oldu
- **Cron Durumu**: cron entry mevcut mu

**Hata pattern → aksiyon:**

| Sorun | Cozum |
|---|---|
| `OLDU` (>168 saat) | Scraper kirilmis veya kaynak sit anti-bot ekledi. `/var/www/quikecommerce/logs/scrapers-YYYYMMDD.log` kontrol et |
| Maraton fail | Scrapling servisi (`scraper.guezelwebdesign.com`) ayakta mi? `curl https://scraper.guezelwebdesign.com/health` |
| Cron entry yok | `crontab -e` ile geri ekle: `0 2 * * * /var/www/quikecommerce/scrapers/run-all.sh >> /var/log/cron-scrapers.log 2>&1` |
| sync exit code != 0 | Laravel `sync:source-prices` parametre/JSON format hatasi. Manuel `--dry-run` ile test et |

## Otomatik Scraping Sistemi (2026-05-02 LIVE)

**6 scraper gunluk cron** ile calisir (her gun **05:00 TR**, 02:00 UTC):

| Scraper | Anti-bot | Yontem | Sure (yaklasik) |
|---|---|---|---|
| **maraton** | Cloudflare | Scrapling Stealthy (`scrapers/maraton_scraper_v2.py`) | ~2.4 saat (401 urun) |
| musclepump | Yok | Direct requests | 5 dk |
| everlast | Yok (Shopify API) | Direct | 5 dk |
| swan | Yok | Direct | 10 dk |
| grandgiftstore | Yok | Direct | 5 dk |
| ayakkabi | Yok (OpenCart) | Direct | 5 dk |

**Akis:** her scraper -> `*_products.json` -> `php artisan sync:source-prices <name> ./..._products.json --apply`
- `sync:source-prices` SADECE fiyat/stok guncel — yeni urun eklemez (guvenli)
- `--max-change-percent=30` — %30+ degisiklikleri atlar (yanlis veri korumasi)
- Wrapper: `/var/www/quikecommerce/scrapers/run-all.sh`
- Log: `/var/www/quikecommerce/logs/scrapers-YYYYMMDD.log`
- Cron entry: `0 2 * * * ...`

**Scrapling servisi:** `https://scraper.guezelwebdesign.com` (FastAPI + Scrapling, vps-guezelwebdesign Docker'da)
**API key (sportoonline):** `scraper-sportoonline-Eq4lGI4KV4CLCMluihY9t9pn0jrZMmf-`

## ⚠️ Manuel Olarak Yonetilen (cron disinda)

- **dropick, norfolk**: Scraper script YOK, JSON manuel yukleniyor
- Yeni urun eklemek icin: `php artisan import:products /path/to/json STORE_ID --apply`

## Proje Ozeti

QuickEcommerce, admin panel, musteri web ve Flutter uygulamasi iceren enterprise bir e-commerce workspace'idir. Backend katmani Laravel 12 ile yurur.

## Workspace Haritasi

- `backend-laravel/`: Laravel backend
- `admin-panel/`: yonetim paneli
- `customer-web-nextjs/`: musteri web uygulamasi
- `customer-app-and-web-flutter/`: Flutter mobil uygulamasi
- `docs/`: ek dokumanlar

## Calisma Kurallari

- Bu projede teknoloji bilgisi yalnizca tek uygulamadan degil tum workspace parcalarindan okunur.
- Web, backend ve mobile kapsami README ile metadata'da birlikte korunur.
- Yeni uygulama parcasi veya canli URL degisikliginde dokumantasyon metadata ile birlikte guncellenir.

## CANLI SUNUCU — KRITIK UYARILAR

### Kesinlikle `php artisan db:seed` calistirilmamali!
Canli sunucuda (`sportoonline.com`) genel `db:seed` komutu **ASLA** calistirilmamalidir. Bu komut:
- Tum urunleri (1000+) siler ve yerine 51 test urunu olusturur
- Tema ayarlarini sifirlar (renkler, header, footer)
- Mevcut kategorileri, bannerlari, kuponlari bozabilir
- Musterilerin sepet/siparis verilerini etkileyebilir

**Tek istisna:** Belirli bir seeder sinifi ile calistirmak (`--class` flagi zorunlu):
```bash
# GUVENLI — sadece belirli seeder
php artisan db:seed --class=PaymentGatewaySeeder

# TEHLIKELI — TUM VERILERI SILER/DEGISTIRIR
php artisan db:seed  # BUNU YAPMA!
```

### Veritabani degisiklikleri icin tercih sirasi:
1. Admin panelden yapilabiliyorsa admin panelden yap
2. `php artisan tinker` ile tek seferlik degisiklik
3. Zorunluysa `--class` ile tek bir seeder calistir
4. **Asla** genel `db:seed` veya `migrate:fresh` calistirma

## Portfolio Metadata Rule

- Proje kokunde `project.portfolio.json` dosyasi zorunludur.
- Yeni uygulama parcasi, stack degisikligi, repo/live URL veya proje ozeti degisirse once bu dosya guncellenir.
- `/home/orhan/Documents/Projeler` altindaki portfolio seedleri bu metadata dosyasindan beslendigi icin bu dosya guncellenmeden is tamamlanmis sayilmaz.
