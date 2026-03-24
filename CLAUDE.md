# CLAUDE.md — QuickEcommerce

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
