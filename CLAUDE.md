# CLAUDE.md — QuickEcommerce

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
| **maraton** | Cloudflare | Scrapling Stealthy (`maraton_scraper_v2.py`) | ~2.4 saat (401 urun) |
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
