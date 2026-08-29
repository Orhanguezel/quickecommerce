# Sadakat kampanyası — duyuru scriptleri

`php artisan tinker <dosya>` ile çalıştırılır. Hepsi **tekrar çalıştırılabilir**
(idempotent) ve JSON'a dokunanlar önce `storage/app/theme_one_backup_*.json`
yedeği alır.

| Script | Ne yapar |
|---|---|
| `create_loyalty_page.php` | `sadakat-programi` koşullar sayfasını canlı ayarlardan üretir (taslak/yayın durumunu **değiştirmez**) |
| `add_loyalty_topbar.php` | Üst duyuru şeridini `theme_one` JSON'una ekler/günceller |
| `add_loyalty_banner.php` | Anasayfa banner'ını ekler + layout bloğunu yerleştirir |

## ⚠️ Oranlar değişirse bunları TEKRAR ÇALIŞTIR

Tema popup ve banner sistemi metin içinde **değişken desteklemiyor**; tutarlar
JSON'a ve `banners` tablosuna **sabit** yazılıyor. `com_loyalty_review_bonus_*`
değerlerini değiştirirsen duyurular eski rakamı göstermeye devam eder —
yayınlanmış bir vaadin yanlış olması demektir.

```bash
php artisan tinker scripts/loyalty/create_loyalty_page.php
php artisan tinker scripts/loyalty/add_loyalty_topbar.php
php artisan tinker scripts/loyalty/add_loyalty_banner.php
php artisan cache:clear
```

Aynı şey **kampanya kapatılırsa** da geçerli: `com_loyalty_enabled = off`
yapmak kod içindeki `ReviewRewardBanner`'ları otomatik gizler ama üst şerit ile
anasayfa banner'ını **gizlemez** — onları elle kapatman gerekir
(`enabled_disabled = off` / `banners.status = 0`).

## Banner neden iki parça?

Frontend banner'ı `banners` tablosundaki **sırasıyla** (instance) buluyor
(`home-client.tsx` → `resolveByInstance`). Yani tabloya kayıt eklemek tek
başına hiçbir şey göstermez; `theme_one` JSON'undaki
`theme_home_page.layout_blocks` içine o sırayı gösteren bir `banner_section`
bloğu da gerekiyor. Script ikisini birlikte yapar.

**Kırılganlık:** aradaki bir banner silinirse sıra kayar ve blok yanlış
banner'ı gösterir. Banner silindikten sonra `add_loyalty_banner.php` yeniden
çalıştırılmalı.
