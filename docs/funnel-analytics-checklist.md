# Funnel Analytics Checklist

Bu checklist, Sportoonline icin Google Analytics ile paralel calisan, kendi DB'mizde kayit tutan first-party funnel takip sisteminin kurulum planidir. Maddeler tamamlandikca isaretlenecek.

## 1. Mevcut Durum Analizi

- [x] Google Analytics / Ads tag kodlarinin nereden yuklendigini netlestir.
  - `customer-web-nextjs/src/app/[locale]/layout.tsx` icinde `gtag` yukleniyor.
  - Ayarlar `site-general-info` uzerinden `com_google_analytics_id`, `com_google_ads_conversion_id`, `com_google_ads_purchase_label` olarak geliyor.
- [x] Mevcut `funnel_events` tablosunu ve endpoint'i incele.
  - Endpoint: `POST /api/v1/funnel/track`
  - Controller: `backend-laravel/app/Http/Controllers/Api/V1/FunnelEventController.php`
  - Admin endpoint: `GET /api/v1/admin/analytics/funnel`
- [x] Hangi frontend aksiyonlarinda event atildigini listele.
  - Aktif kullanimlar su an sinirli: cart recommendations ve bundle detail tarafinda `trackFunnelEvent` kullaniliyor.
- [x] Nginx gercek IP bilgisinin canli loglarda gorundugunu dogrula.
  - `/var/log/nginx/access.log` gercek ziyaretci IP'sini, URL'yi, referer'i ve user-agent'i yaziyor.
  - Next.js'in backend'e yaptigi server-side API cagirilari dogal olarak sunucu IP'si ile gorunuyor.
- [x] Canli DB'de mevcut funnel verisini kontrol et.
  - `funnel_events` tablosu var ama canli toplam kayit `0`.
- [x] Admin panelde mevcut analytics sayfasini tespit et.
  - `admin-panel/src/app/[locale]/admin/analytics/page.tsx`
  - `admin-panel/src/components/screen/admin-section/analytics/index.tsx`

## 2. Veri Modeli

- [x] `funnel_events` tablosunu gercek takip icin genislet.
- [x] `session_id` ekle.
- [x] `visitor_id` ekle.
- [x] `ip_address` ekle.
- [x] `user_agent` ekle.
- [x] `referer` ekle.
- [x] `url` ekle.
- [x] `path` ekle.
- [x] `locale` ekle.
- [x] `device_type` ekle.
- [x] `browser` ekle.
- [x] `os` ekle.
- [x] `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` ekle.
- [x] `category_id` ekle.
- [x] `order_id` ekle.
- [x] `is_bot` ekle.
- [x] Raporlama icin gerekli indeksleri ekle.

## 3. Event Sozlugu

- [x] Temel ziyaret eventlerini standartlastir: `page_view`, `product_view`, `category_view`, `search`, `store_view`.
- [x] E-ticaret funnel eventlerini standartlastir: `product_click`, `add_to_cart`, `remove_from_cart`, `cart_view`, `checkout_start`, `shipping_selected`, `payment_selected`, `order_created`, `payment_success`, `payment_failed`.
- [x] Pazarlama eventlerini standartlastir: `banner_click`, `coupon_view`, `coupon_apply`, `recommendation_view`, `recommendation_click`.
- [x] Eski event isimleri ile yeni isimler icin geriye uyum map'i kur.

## 4. Backend Tracking API

- [x] `POST /api/v1/funnel/track` endpoint'ini yeni alanlari kabul edecek sekilde guclendir.
- [x] Request IP'sini guvenilir sekilde oku.
- [x] User-agent parse islemi ekle.
- [x] Bot tespiti ekle.
- [x] Validation ve batch insert'i yeni alanlara gore guncelle.
- [ ] Rate limit stratejisini kontrol et.

## 5. Frontend Tracking

- [x] `visitor_id` localStorage/cookie ile uret.
- [x] `session_id` sessionStorage ile uret.
- [x] Sayfa degisimlerinde `page_view` gonder.
- [x] Urun karti tiklamalarinda `product_click` gonder.
- [x] Urun detay acildiginda `product_view` gonder.
- [x] Sepete ekleme/geri cikarma olaylarini kaydet.
- [x] Arama sorgularini `search` olarak kaydet.
- [x] Sepet ve checkout adimlarini kaydet.
- [x] Event queue, `sendBeacon`, retry ve duplicate kontrolunu guclendir.
- [ ] Google Analytics eventleriyle uyumlu ortak tracker katmani kur.

## 6. Admin Panel Dashboard

- [x] Mevcut `/admin/analytics` ekranini yeni metriklere gore genislet.
- [x] Ozet kartlari ekle: ziyaretci, oturum, urun goruntuleme, sepete ekleme, checkout, siparis, donusum orani.
- [x] Funnel grafigini yeni event sozlugune gore guncelle.
- [x] En cok ziyaret edilen sayfalar raporu ekle.
- [x] En cok goruntulenen/tiklanan urunler raporu ekle.
- [x] En cok aranan kelimeler raporu ekle.
- [x] UTM kampanya raporu ekle.
- [x] Son eventler tablosu ekle.
- [x] Rapor sorgularinda bot / gercek kullanici ayrimini ekle.
  - Overview bot event toplamlarini ayri veriyor.
  - Funnel ve recommendation CTR varsayilan olarak `is_bot = false` uzerinden hesaplaniyor.
- [ ] Admin arayuzune bot / gercek kullanici filtre kontrolu ekle.
- [ ] Tarih filtresini bugun, dun, son 7 gun, son 30 gun ve ozel aralik icin uygun hale getir.

## 7. KVKK / Gizlilik

- [ ] IP saklama yaklasimini belirle.
  - Ilk surumde tam IP DB'ye yazilacak; gerekirse sonraki adimda hash/anonymize edilecek.
- [ ] Cookie consent ile analytics event gonderimini iliskilendir.
- [ ] Admin panelde hassas verileri gerektiginde maskele.
- [ ] Detay veri saklama suresi icin politika belirle.

## 8. Performans ve Bakim

- [ ] Event endpoint'ini hizli batch insert ile tut.
- [ ] Veri buyurse gunluk aggregate tablolarini planla.
- [x] Bot ve monitor trafiklerini raporlarda ayrilastir.
- [ ] Log ve DB takiplerini deploy sonrasi canlida dogrula.

## 9. Test ve Yayin

- [x] Backend PHP syntax kontrolu yap.
  - `FunnelEventController.php`, `AdminFunnelAnalyticsController.php`, migration, model, route ve bootstrap dosyalari `php -l` ile kontrol edildi.
- [x] Admin panel build kontrolu yap.
  - `npm run build` basarili. Sadece mevcut dosyalardan gelen eski lint uyarilari var.
- [x] Diff whitespace kontrolu yap.
  - `git diff --check` basarili.
- [x] Customer web build kontrolu yap.
  - Sandbox disi network izniyle `npm run build` basarili; TypeScript asamasi tamamlandi.
- [ ] Customer web lint kontrolu temiz hale getir.
  - `npm run lint` calisti; yeni analytics dosyalarinda hata gorunmedi.
  - Repo genelinde mevcut 73 error / 31 warning var (`any`, React Compiler kurallari, mevcut UI komponentleri vb.).
- [ ] Local event gonderim testi yap.
  - Local Laravel route-list denemesi DB baglantisi olmadigi icin tamamlanamadi.
- [ ] Canlida test IP ile `page_view`, `product_click`, `add_to_cart`, `checkout_start` dogrula.
- [ ] Admin panelde kayitlarin gorunmesini dogrula.
- [ ] Nginx gercek IP ve Laravel kaydedilen IP karsilastirmasini yap.
- [ ] Deploy sonrasi 10 dakika access log, DB ve admin ekranini takip et.
