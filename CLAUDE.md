# CLAUDE.md — QuickEcommerce

> **Claude Code talimati:** Bu dosya quickecommerce dizininde calisirken otomatik baglama dahil olur. "Aktif Hatirlatmalar" bolumunde her madde icin `Today's date` ile karsilastir, vakti gelmis maddeleri kullaniciya **proaktif olarak** hatirlat — kullanici sormasa bile.

## 🔔 Aktif Hatirlatmalar (TARIH ILE KONTROL ET)

### 🔔 2026-08-25 (E-POSTA DOGRULAMA — 3 GUN SONRA KONTROL)
**Why:** 2026-08-22'de misafir checkout e-posta kod dogrulamasi + telefon dogrulamasi canliya alindi (sahte siparis #204). Uyelik dogrulamasi (`com_user_email_verification`) KASITLI KAPALI birakildi — once misafir tarafi gozlenecek.
**Yapilacak:**
```bash
# Kac kod istendi / kac misafir dogrulandi
ssh vps-sportoonline 'cd /var/www/quikecommerce/backend-laravel && php artisan tinker --execute="
echo \"bekleyen kod: \", \DB::table(\"email_verification_codes\")->count(), PHP_EOL;
echo \"dogrulanmis misafir: \", \DB::table(\"customers\")->where(\"is_guest\",1)->where(\"email_verified\",1)->count(), PHP_EOL;
echo \"22 Agustos sonrasi misafir: \", \DB::table(\"customers\")->where(\"is_guest\",1)->where(\"created_at\",\">\",\"2026-08-22\")->count(), PHP_EOL;"'
# Kod maili gonderilemedi hatasi var mi
ssh vps-sportoonline 'grep -c "email-verification. kod gonderilemedi" /var/www/quikecommerce/backend-laravel/storage/logs/laravel.log'
```
- **Dogrulanan misafir sayisi ~ yeni misafir sayisi ise**: akis saglikli. Uyelik dogrulamasini da acmayi degerlendir:
  `php artisan customers:backfill-email-verified` (tekrar, yeni kayitlar icin) → sonra admin panelden `com_user_email_verification = on`.
- **Yeni misafir sayisi bariz DUSTUYSE** (kod adimi terk ediliyorsa): kill switch `com_guest_checkout_email_verification = off`.
- Detay/tuzaklar: memory `email-verification-system`.

### 🔔 2026-06-07 sabah (4-SCRAPER FIX ILK GERCEK CRON SONRASI)
**Why:** 2026-06-06'da musclepump_import (TCP timeout) + compexturkiye/eprotein/proteinavm (HTTP 301) FAIL etti. ScrapersRunOne.php source bazli `SCRAPER_URL=http://127.0.0.1:8200` override eklendi (yerel scraper service) + musclepump_scraper.py'a fallback eklendi. 07'de 02:00 UTC (05:00 TR) cron ilk kez bu fix'lerle calisacak.
**Yapilacak (sabah ilk is):**
```bash
# Yerel scraper service ayakta mi
ssh vps-sportoonline 'curl -s http://127.0.0.1:8200/health'
# Beklenen: {"status":"ok","redis":"ok","browsers":"configured"}

# 4 fail eden scraper bugun nasil calismis
ssh vps-sportoonline 'cd /var/www/quikecommerce/backend-laravel && php artisan scrapers:health-check'
# Beklenen: compexturkiye/eprotein/proteinavm/musclepump_import "JSON eski" alarmlari KAYBOLMUS olmali (24h altinda).

# Telegram'a FAIL geldi mi
# @haldefiyat_fiyat_bot kanalindan kontrol et
```
- **Eger 4'unun de JSON tazelik 24h altinda**: fix calisiyor. Sistem temiz.
- **Hala FAIL veriyor**: log oku → `tail -80 /var/www/quikecommerce/logs/scrapers-20260607.log`. Yerel scraper 1010/timeout mu yakalandi?
- **eprotein 266 missing mapping silindi (2026-06-06)** — yeni cron'da fresh sitemap'tan yeni mapping yaratir.

### 🔔 2026-06-08 civari (1 HAFTA STOK SISTEMI GOZLEM)
**Yapilacak:** 4 gun stok sistemi calistiktan sonra:
- Telegram'da kac alarm geldi? (cron fail'leri yakalandi mi?)
- Post-order auto-refund (30dk delay) tetiklendi mi? Kac otomatik iade?
- Yok satan urunler oldu mu? (musteri sikayeti / siparis kontrol)
- Hangi scraper'lar hala "bool only" donduruyorsa onlara da CSS class detection eklenmesi gerekebilir (linktech/herbinatura — %100 true donduruyorlar)

### 🔔 BEKLEYEN: Maraton magazasi karari
**Durum (2026-06-06 tespit):** maraton.com.tr **memlekethosting.com'a redirect** — tedarikci siteyi kapatmis. Sportoonline DB'de Maraton Sportswear (store_id=47) status=1 (aktif), 317 urun, tum stok=0. Sipariş alinmiyor zaten ama frontend'de magaza linki goruluyor.
**Yapilacak (kullanici karari):**
- A) Magazayi pasif yap: `\$store = Store::find(47); \$store->status = 0; \$store->save();` → frontend'de magaza linki kaybolur.
- B) Urunleri soft-delete: 317 product soft-delete, kategorilerde gozukmesin.
- C) Birakma (mevcut), stok=0 olarak gozukmesi yeterli.

### 🔔 BEKLEYEN: dropick + norfolk scraper yazimi
**Why:** `data/source-products/dropick_products.json` (74 urun) ve `data/source-products/norfolk_products.json` (309 urun) JSON'lari **manuel** yukleniyor. Scraper script yok.
**Yapilacak (kullanici onaylarsa):**
- JSON'larda `url` alani var mi kontrol → `python3 -c "import json; d=json.load(open('data/source-products/dropick_products.json')); print(d[0].keys())"`
- URL pattern net ise her ikisi icin scraper yaz (dropick.com, norfolk.com.tr — anti-bot kontrol et)
- run-all.sh'a ekle, gunluk cron'a katil

### 🔔 BEKLEYEN: yesilmarka sporcu besinleri scraper
**Why:** https://yesilmarka.com/sporcu-besinleri — sadece sporcu besinleri kategorisi kazinacak.
- `scrapers/musclepump_scraper.py` patternini takip et.
- `yesilmarka_products.json` -> import:products veya sync:source-prices.
- run-all.sh + gunluk cron.

### 🔔 BEKLEYEN: e-Fatura GIB entegrasyonu
- Mevcut: admin PDF fatura (html2canvas+jsPDF).
- Hedef: Turkiye e-Fatura/e-Arsiv. Saglayici karari gerek (Foriba/Logo/Parasut/Nilvera).
- VKN/TCKN, vergi no, fatura senaryosu InvoiceResource'e eklenecek.

### 🔔 BEKLEYEN: Geliver gonderici = satici adresi
**Why:** Mevcut akis `store?->geliver_sender_address_id ?? com_option(...) ?: config(...)` zaten destekliyor. Eksik: her saticinin Geliver'da `sender_address_id` olusturma akisi.
- Admin/seller panelinde: "Magaza adresimi Geliver'da kaydet" butonu → API call + dönen ID'yi store.geliver_sender_address_id'e yaz.

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
| stealth scraper 500/fail | Yerel servis ayakta mi? `ssh vps-sportoonline 'curl -s http://127.0.0.1:8200/health'` → `{"status":"ok",...}`. Degilse `cd /opt/scraper-service && docker compose restart`. (Dis servis guezelwebdesign 2026-06-21 KALDIRILDI.) |
| Cron entry yok | `crontab -e` ile geri ekle: `0 2 * * * /var/www/quikecommerce/scrapers/run-all.sh >> /var/log/cron-scrapers.log 2>&1` |
| sync exit code != 0 | Laravel `sync:source-prices` parametre/JSON format hatasi. Manuel `--dry-run` ile test et |

## Otomatik Scraping Sistemi (2026-05-02 LIVE)

**~22 aktif scraper gunluk cron** ile calisir (her gun **05:00 TR**, 02:00 UTC) — kayit ve listeleme `ScraperSourceRegistry.php`.

**Anti-bot katmani:**
- Cogu kaynak (compexturkiye, eprotein, proteinavm, herbinatura, vs.) **Scrapling stealth** uzerinden ceker (`SCRAPER_URL` env'i).
- **TEK servis — YEREL** (2026-06-21): `http://127.0.0.1:8200` (/opt/scraper-service, vps-sportoonline Docker). Tum stealth scraper'lar bunu kullanir. `.env`/run-all.sh: `SCRAPER_URL=http://127.0.0.1:8200` + `SCRAPER_API_KEY=scraper-sportoonline-internal-...` (default artik yerel).
- **Dis servis `https://scraper.guezelwebdesign.com` KALDIRILDI (2026-06-21).** Health "ok" donse de `/api/v1/scrape` CF-agir IdeaSoft/compex siteleri icin ~1s'de HTTP 500 doruyordu; compex+proteinavm 5 gun (06-16→06-21) FAIL etti. Tum shell driver (run-all/run-intraday/run-evening/run-maraton), python (ideasoft_scraper fallback) ve `ScrapersRunOne.php` default'u yerele cevrildi; `scraper.guezelwebdesign.com` referansi kalmadi (sadece yorum). Health raporundaki "Maraton fail → guezelwebdesign health" satiri artik gecersiz.

**Pasif kaynaklar** (registry `STATUS_PASSIVE`): maraton (site kapali), powertec (CF 1010), raketspor (CF 1010). Saglik kontrolu bunlari es geciyor.

**Akis:** her scraper -> `*_products.json` -> `php artisan sync:source-prices <name> ./..._products.json --apply`
- `sync:source-prices` SADECE fiyat/stok guncel — yeni urun eklemez (guvenli)
- `--max-change-percent=30` — %30+ degisiklikleri atlar (yanlis veri korumasi)
- **Bool stok kaynaklari** (provitanya, proteinmax, dekomum, vb.): stock_quantity=1 (true) veya 0 (false). Frontend sayi gizler "Stokta" gosterir.
- Wrapper: `/var/www/quikecommerce/scrapers/run-all.sh`
- Log: `/var/www/quikecommerce/logs/scrapers-YYYYMMDD.log`
- Cron entry: `0 2 * * * ...`

## Post-Order Otomatik Stok Teyit + iyzico Iade (2026-06-06 LIVE)

Bool-only stok kaynaklari gun icinde stok bitirebilir (sabah cron 05:00, musteri 21:00'de siparis verir, tedarikci tukenmis olur). Mevcut akis:

1. `IyzicoPaymentController::callback()` paid sonrasi `PostOrderStockCheckJob::dispatch($master->id)->delay(30 dk)`.
2. Queue worker 30 dk sonra her siparis satirinin `source_product_url`'i icin `SourceStockProbe` (yerel scraper) — JSON-LD availability + HTML attribute + gorsel text icinde out-of-stock kelime arar.
3. Kesin out-of-stock -> `IyzicoRefundService::refundOrderForStockOut()` -> iyzico Cancel API (henuz Approve edilmemis, paymentId ile cancel) -> DB.transaction: `payment_status='refunded'`, `orders.status='cancelled'`, `refund_status='refunded'`, `order_refunds` kayit (admin "iade edilenler" sayfasinda gozukur).
4. Belirsiz sinyal -> ScraperAlerter Telegram digest, admin manuel kontrol eder.

**Manuel test**: `php artisan order:check-stock {id} [--dry-run]`.

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
