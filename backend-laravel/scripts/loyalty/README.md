# Sadakat kampanyası — duyuru scriptleri

**Çalışma dizini `backend-laravel/`** — repo kökünde `artisan` yok.
Bunlar **canlıda** çalıştırılmalı; lokal veritabanı üretim verisi değil.

```bash
cd backend-laravel        # VPS'te: /var/www/quikecommerce/backend-laravel
php artisan tinker scripts/loyalty/create_loyalty_page.php
php artisan tinker scripts/loyalty/add_loyalty_topbar.php
php artisan tinker scripts/loyalty/add_loyalty_banner.php
php artisan cache:clear
```

Hepsi **tekrar çalıştırılabilir** (idempotent). Tema JSON'una dokunanlar önce
`storage/app/theme_one_backup_*.json` yedeği alır.

| Script | Ne yapar |
|---|---|
| `create_loyalty_page.php` | `sadakat-programi` koşullar sayfasını canlı ayarlardan üretir. **Yayın durumuna dokunmaz** — yayındaysa yayında kalır. |
| `add_loyalty_topbar.php` | Üst duyuru şeridini `theme_one` JSON'una ekler/günceller |
| `add_loyalty_banner.php` | Anasayfa banner'ını ekler + layout bloğunu yerleştirir |

## ⚠️ Oranlar değişirse bunları TEKRAR ÇALIŞTIR

Tema popup ve banner sistemi metin içinde **değişken desteklemiyor**; tutarlar
JSON'a ve `banners` tablosuna **sabit** yazılıyor. `com_loyalty_review_bonus_*`
değerlerini değiştirirsen duyurular eski rakamı göstermeye devam eder —
yayınlanmış bir vaadin yanlış olması demektir.

## ⚠️ Kampanya kapatılırsa duyurular KENDİLİĞİNDEN kapanmaz

`com_loyalty_enabled = off` yapmak koddaki `ReviewRewardBanner`'ları otomatik
gizler (sipariş sayfaları, ürün sayfası, sipariş başarılı). Ama **üst şerit ile
anasayfa banner'ını gizlemez** — onlar statik tema verisi. Elle kapatılmalı:

- Üst şerit: `theme_popup_settings` içinde `popup_top_yorum_puan` →
  `enabled_disabled = "off"`
- Banner: `banners` tablosunda #38 → `status = 0`

## Banner neden iki parça?

Frontend banner'ı `banners` tablosundaki **sırasıyla** (instance) buluyor
(`home-client.tsx` → `resolveByInstance`). Yani tabloya kayıt eklemek tek
başına hiçbir şey göstermez; `theme_one` JSON'undaki
`theme_home_page.layout_blocks` içine o sırayı gösteren bir `banner_section`
bloğu da gerekiyor. Script ikisini birlikte yapar ve instance'ı frontend'in
sıralamasıyla (`desktop_row`, `order`, `id`) aynı şekilde hesaplar.

**Kırılganlık:** aradaki bir banner silinirse sıra kayar ve blok yanlış
banner'ı gösterir. Banner silindikten sonra `add_loyalty_banner.php` yeniden
çalıştırılmalı.

## Üst şerit sıralaması

Üst şerit aynı anda **tek** görünür; sıradaki ancak ziyaretçi öncekini
kapatınca gelir (`theme-popup.tsx` → `dismissTop`). Bugün 1. sırada
"Ücretsiz Kargo" var, puan kampanyası 2. sırada. Öne almak için
`popup_top_yorum_puan` kaydının `sort_order` değerini 1'e, kargonunkini 2'ye
çevirmek yeterli.
