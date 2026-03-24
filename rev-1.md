# QuickEcommerce Revizyon 1 - Checklist

Tarih: 2026-03-24

> **UYARI:** Canli sunucuda `php artisan db:seed` (genel) ASLA calistirilmamali! Tum urunler, tema ayarlari ve mevcut veriler silinir. Sadece `--class=SeederAdi` ile spesifik seeder calistirilabilir. Detay: CLAUDE.md

## Durum

- [X] **1. Magaza ekleme akisi** — Komisyon/abonelik secimi sonrasi surec ilerlemiyor → TAMAMLANDI
- [X] **2. Kategori/ozellik ekleme kisitlamasi** — Seller menusunden kaldirildi → TAMAMLANDI
- [X] **3. Yazar listesi kaldirilacak** — Seller menusunden kaldirildi → TAMAMLANDI

### CANLIYA DEPLOY NOTU

Asagidaki SQL canlida calistirilacak (permission id'leri farkli olabilir, once kontrol et):

```sql
-- Seller menusunden Kategori, Ozellik, Yazar kaldirma
DELETE FROM role_has_permissions WHERE permission_id IN (
  SELECT id FROM permissions WHERE perm_title IN ('Categories','Attributes','Authors') AND available_for='store_level'
);
DELETE FROM permissions WHERE perm_title IN ('Categories','Attributes','Authors') AND available_for='store_level';
```

- [X] **4. Magazayi ziyaret et 404** — Link `/stores/details/` → `/{locale}/magaza/{slug}` olarak duzeltildi → TAMAMLANDI
- [X] **5. Cuzdan akisi eksikleri** — Wallet/deposit/transaction akisi kontrol edildi, store_id auto-select fix ile sorun cozuldu → TAMAMLANDI
- [X] **6. Para cekme talebi** — Withdraw request akisi kontrol edildi, store_id bazli calisiyor, sorun yok → TAMAMLANDI
- [X] **7. PayTR test modu bildirimi** — Canlida kapatilacak (asagidaki deploy notuna bak) → TAMAMLANDI

### CANLIYA DEPLOY NOTU — PayTR Test Modu

PayTR canli onay geldikten sonra:

1. `.env` dosyasinda `PAYTR_TEST_MODE=false` yap
2. Ya da admin panelden: Payment Settings → PayTR → "Test Mode" toggle'ini kapat
3. `php artisan db:seed --class=PaymentGatewaySeeder` (opsiyonel, .env degisikligi yeterli degilse)

- [X] **8. Kategori-varyant eslesmesi** — Incelendi: Varyantlar product_id'ye bagli, category_id yok. Bu yapisal bir tasarim, "EK" maddesiyle birlikte ele alinacak → ANALIZ TAMAMLANDI
- [X] **9. Sepete ekle butonu pozisyonu** — Mobilde sticky bottom bar eklendi (fiyat + sepete ekle), xl altinda gorunur → TAMAMLANDI
- [ ] **10. Kullanici sayfasi iyilestirmeleri** — Genel UI/UX iyilestirmeleri (spesifik detay bekleniyor)
- [X] **11. Banner/flash kart sayisi** — Kodda sabit limit yok, API tum bannerlari donuyor. Admin panelden yeni banner/flash deal eklenebilir → TAMAMLANDI (icerik ekleme isi)
- [X] **12. Kargo sistemi** — Incelendi: Gonderi/iade kodu ve kargo secimi calisiyor. Iade kargosu otomatik en ucuz seciliyor. Ilce hatasi adres NULL oldugunda fallback'te olusabilir, canlida test gerekiyor → ANALIZ TAMAMLANDI
- [X] **13. Tema rengi** — Tema rengi API'den dinamik geliyor (setting_options tablosu). Admin Panel → Theme Settings → Primary Color hex degerini logo tonundaki yesile degistir (ornek: #22C55E veya #16A34A) → TAMAMLANDI (admin islem)
- [ ] **14. Kullanici filtreleme** — Filtreleme kismi gozden gecirilecek (spesifik sorun detayi bekleniyor)
- [ ] **EK. Multi store type + varyant** — DB altyapisi hazir (store_store_types pivot tablosu mevcut). Frontend store_types array gonderiyor. Ture gore varyant filtreleme henuz implemente edilmedi, ayri planlama gerekiyor

## Ilave Duzeltmeler

- [X] **15. Konum sec verisi gecersiz** — Area API'den donen veriler (Taksim, Besiktas vb.) gecersiz/test verisi. Gercek teslimat alanlari admin panelden girilmeli, su an header'da konum secici gizlenecek.
  - Dosya: `customer-web-nextjs/src/components/layout/header-variant-1.tsx` (satir 201-210)
  - Dosya: `customer-web-nextjs/src/components/layout/header-variant-2.tsx` (satir 91-106)

- [X] **16. Urun resimleri kare format** — Ana sayfada urun resimleri `aspect-[4/3]` ile kare yakin gorunuyor. Kiyafet urunleri icin dikey dikdortgen (`aspect-[3/4]`) olmali.
  - Dosya: `customer-web-nextjs/src/components/product/product-card.tsx` (satir 311)
  - Dosya: `customer-web-nextjs/src/components/home/infinite-products-section.tsx` (satir 30, skeleton)

- [X] **17. Bos kategoriler gizlenmeli** — Frontend filtreleme zaten mevcut ve calisiyor. `product_count=0` olan kategoriler gizleniyor. Alt kategorilerinde urun olan ust kategoriler (Market, Fast Food vb.) dogru olarak gorunuyor ve ilk urunlu alt kategoriye yonlendiriliyor.
  - Dosya: `customer-web-nextjs/src/components/home/category-section.tsx` (satir 48-68)
  - Dosya: `customer-web-nextjs/src/app/[locale]/kategoriler/page.tsx` (satir 66-74)
  - Backend: `backend-laravel/app/Http/Controllers/Api/V1/FrontendController.php` `productCategoryList()` (satir 1793-1875)

- [X] **18. Satici basvuru giris linki yanlis** — "Zaten hesabiniz var mi? Giris yap" linki `/giris` (musteri girisi) yerine `panel.sportoonline.com/tr/seller/signin` (satici girisi) olmali. Admin paneldeki satici giris sayfasindaki "Satici ol" linki de `sportoonline.com/tr/satici-basvuru` sayfasina gitmeli.
  - Dosya: `customer-web-nextjs/src/app/[locale]/satici-basvuru/become-seller-client.tsx` (satir 725)
  - Dosya: `admin-panel/src/components/molecules/store-owner-form/StoreOwnerSignInForm.tsx` (satir 327)
  - Dosya: `admin-panel/src/config/sellerRoutes.ts` (satir 3)

- [X] **19. Giris/kayit sayfasi resim konumu** — Masaustunde resim formun icinde gorunuyor. Resim sol tarafa ayri kolon olarak cikmali. Grid yapisinda resim sol kolona, form sag kolona gecmeli.
  - Dosya: `customer-web-nextjs/src/app/[locale]/giris/login-client.tsx` (satir 148-171)
  - Dosya: `customer-web-nextjs/src/app/[locale]/kayit/register-client.tsx` (satir 148-171)
