# Seller Panel — Düzeltme Listesi

## ✅ Tamamlananlar

- [X] **#1** Seller panelde yeni mağaza açarken açılış ve kapanış saatlerini giremiyorum

  - `opening_time` / `closing_time` inputları multi-lang döngüsünün dışına çıkarıldı, artık tek render ediliyorlar
- [X] **#2** Seller panelde komisyon veya abonelik seçip gönder'e basınca tepki vermiyor

  - `onSubmit` içindeki null-safety düzeltildi (undefined `.length` sessiz crash'i giderildi)
  - Commission/subscription backend ayarı kapalıysa sekme disabled gösteriliyor
  - `activeTab` boşken submit engellendi
- [X] **#9** İptal veya iade olan ürünün geri stok olması (eksilen stok yerine koyulması)

  - `OrderObserver` zaten doğru çalışıyordu (cancelled → stok iade, refunded → stok iade)
  - `$user` undefined ve `$ref_id` guest branch eksikliği düzeltildi (crash önlendi)
- [X] **#10b** Bazı kısımlarda İngilizce kelimeler

  - BusinessPlanSection'daki "POS System", "Live Chat", "Order Limit", "Product Limit", "Featured Limit" → çeviri keyine alındı
- [X] **#11** Mağaza başvurusunda 6 karakterli şifre kabul edildi, seller panele girişte min 8 uyarısı

  - Frontend başvuru formu: min 6 → min 8 düzeltildi
  - Backend `registerSeller`: `min:8` kuralı eklendi
- [X] **#13** Satıcı kayıt/profilinde telefon numarası — ülke kodu Türkiye default gelmeli

  - `AppPhoneNumberInput` bileşeninde `country="us"` → `country="tr"` değiştirildi
- [X] **#14** Satıcılar sadece kendi ürünlerini görüyor olmalı

  - Backend zaten doğru çalışıyordu: `SellerProductManageController` `store_seller_id` ile filtreli, sipariş listesi de `pluck('id')` + `contains()` ile kendi siparişlerine kısıtlı
- [X] **#12** Satıcı profili düzenlenemiyor (KYC bilgileri eksik)

  - `SellerProfileResource`: `seller_applications` tablosundaki KYC verileri eklendi
  - `SellerManageController::updateProfile()`: şirket, adres, banka alanlarını kabul edip `seller_applications`'a kaydediyor
  - `ProfileSettingsForm.tsx`: "KYC / Şirket Bilgileri" sekmesi eklendi (şirket, adres, banka bölümleri)
  - KYC durumu (onaylı/beklemede/reddedildi) banner olarak gösteriliyor
  - Hassas KYC alanı (vergi no, IBAN, hesap sahibi) değiştirildiğinde durum otomatik "beklemede"ye sıfırlanıyor
  - ⚠️ iyzico alt üye hesabı açma akışı henüz entegre edilmedi (ayrı görev)

---

## 🔴 Bekleyen Düzeltmeler

- [ ] **#3** Mağaza başvuru akışı uçtan uca test edilecek

  - Başvuru gönderme, e-posta doğrulama, admin onayı
- [ ] **#4** Başvuruyu görüntüleme ve düzenleme

  - Admin panelde başvuru detay/düzenleme ekranı doğrulanacak
- [ ] **#5** Mağaza, tür vb ekleme (Bug #1 ve #2 ile bağlantılı — o düzeltmeler sonrası kalan sorunlar)
- [X] **#6** Komisyon/abonelik düzenleme

  - Mevcut durum doğrulandı: her iki yön implementedi.
  - subscription→commission: `BusinessPlanDetails.tsx` → `CommissionConfirmModal` → `useSubscriptionToCommissionMutation` → `POST business-plan-change`
  - commission→subscription: "Switch to Subscription" butonu `showPackages` state'ini açıyor → seller abonelik paketi seçip satın alıyor (`BuyPackage` mutation)
  - Backend toggle mantığı (`SellerBusinessSettingsController::businessPlanChange`) doğru çalışıyor.
  - Herhangi bir kod değişikliği gerektirmedi.
- [X] **#7** Ürün ekleme — türe göre varyantların gelmesi

  - Root cause: `useForm` defaultValues bir kez değerlendirilir; Redux hydration gecikmesinde `store_type` boş gelirse form'un `type` alanı `''` kalıyor, `useProductAttributeQuery({ enabled: !!type })` hiç tetiklenmiyor.
  - Fix: `CreateOrUpdateProductForm.tsx` — create modda (`!data`) `store_type` kullanılabilir olduğunda `setValue('type', store_type)` çağıran useEffect eklendi.
- [X] **#8** Sipariş yönetimi

  - Seller sipariş listesi, durum güncelleme, filtreleme büyük ölçüde çalışıyordu.
  - Fix (backend): Multi-store branch'de `SellerStoreOrderController::allOrders()` 3 hata düzeltildi:
    1. `refunded` status filtresi `refund_status` yerine `status` kolonunu sorguluyordu
    2. `payment_status` filtresi `orderMaster` ilişkisi yerine orders tablosuna direkt yazılmıştı
    3. POS siparişleri (`whereNot('order_type', 'pos')`) hariç tutulmuyordu
- [X] **#10a** Ürün listesinde instock 0 gösteriyor

  - Root cause: `generateCombinations` tüm unique attribute değerlerinden kartezyen çarpım yapıyordu, ama stok/fiyat `${productIdx}-${variantIdx}` ile indeksleniyordu. Kombinasyon sayısı varyant sayısından fazla çıkınca indeksler uyuşmadı → yanlış/boş stok okundu.
  - Fix: Her variant için label direkt kendi `attributes` değerlerinden `Object.values(attrs).flat().join("-")` ile türetiliyor. 7 bileşende aynı düzeltme uygulandı (SellerProductsList, InventoryList×2, StockReport×2, RequestProductsList, RequestList, TrashListTableComponent).
- [X] **#12b** iyzico alt üye hesabı açma akışı

  - `IyzicoService::createSubMerchant()`: TC/vergi no uzunluğuna ve şirket adı varlığına göre PERSONAL / PRIVATE_COMPANY / LIMITED_OR_JOINT_STOCK_COMPANY tipi otomatik belirleniyor
  - `IyzicoService::isMarketplaceMode()`: gateway credentials'tan marketplace modunu okur
  - `AdminSellerManageController::approveSellerApplication()`: KYC onaylandığında;
    1. Marketplace mode aktifse iyzico API'yi çağırır
    2. Dönen `subMerchantKey` → `seller_applications.iyzico_sub_merchant_key` + `iyzico_registered_at`
    3. Satıcıya ait tüm store'ların ID'leri → gateway `store_sub_merchant_keys` JSON map'ine eklenir
    4. iyzico hatası onayı bloklamaz; `iyzico_warning` field'ı ile admin'e uyarı gösterilir
  - Migration: `seller_applications` tablosuna `iyzico_sub_merchant_key` + `iyzico_registered_at` kolonları eklendi
  - ⚠️ Üretim sunucusunda `php artisan migrate` çalıştırılmalı

- [X] **#kyc-profile-save** Satıcı profil KYC bilgileri kaydedilmiyor (sayfa yenilenince kayboluyor)

  - Root cause: `SellerManageController::updateProfile()` sadece mevcut `seller_applications` kaydı varsa güncelliyordu; kayıt yoksa (admin tarafından oluşturulan satıcılar) `if ($application)` bloğu sessizce atlanıyordu.
  - Fix: `else` bloğu eklendi — kayıt yoksa `SellerApplication::create()` ile yeni kayıt oluşturuluyor.

- [X] **#kyc-register** Satıcı kayıt formuna KYC alanları eklendi

  - `RegisterSchema` → `BaseRegisterObject` + `SellerRegisterSchema` olarak yeniden yapılandırıldı
  - `BecomeASeller.tsx` ve `BecomeASellerThemeTwo.tsx`: Şirket, Adres, Banka bölümlerini içeren accordion KYC formu eklendi
  - `onSubmit` `application_details` nested formatına dönüştürülüyor (backend uyumlu)
  - Register sırasında doldurulan KYC verileri `seller_applications` tablosuna kaydediliyor (backend zaten bu şekilde çalışıyor)
- [X] **#15** Satıcı ve admin giriş sayfasına uygun görsel eklenmesi

  - Root cause: Admin giriş formu (`sign-in.tsx`) `com_seller_login_page_image` ve `com_seller_login_page_title/subtitle` kullanıyordu — admin için yanlış field.
  - Fix: Admin login formu `com_login_page_image`, `com_login_page_title`, `com_login_page_subtitle` field'larını kullanıyor.
  - Seller login formu (`StoreOwnerSignInForm.tsx`) zaten `com_seller_login_page_image` kullanıyordu — doğru.
  - Her iki görseli admin panelde "Page Settings → Login Page" bölümünden yükleyebilirsiniz.
- [X] **#16** Sepete ürün eklerken animasyonlu ekleme

  - Framer Motion yok, saf CSS animasyonu tercih edildi (bağımlılık eklenmedi).
  - `globals.css`: `@keyframes cart-pop` ve `.animate-cart-pop` eklendi (yukarı çıkıp kaybolan badge).
  - `product-card.tsx`: `isAdding` state eklendi; tıklayınca 600ms "+1" badge float-up animasyonu, buton scale-down feedback.

satici ürün ekleyebilmesi icin kyc nin onaylanmasi ve banka alt magazasinin acilmasi gerekiyor iyzico da...

- [X] **#store-add-empty** `store/add` formunda alan/mağaza tipi dropdown'ları ilk açılışta boş geliyordu

  - Root cause: `useAreaDropdownQuery` ve `useStoreTypeQuery` sayfa mount'unda ilk kez çalışıyordu; veri gelene kadar dropdown'lar boş görünüyordu.
  - Fix: Bu iki query `SellerLayout`'a taşındı (prefetch). Artık layout mount'unda cache'e alınıyor, `store/add` açıldığında veri hazır geliyor.

- [X] **#seller-profile-image** Satıcı profil sayfasında resim yüklenemiyor

  - Root cause: "Upload Files" sekmesinde yükleme sonrası görseli SEÇMEK gerekiyordu ama UI bunu belirtmiyordu; SELECT butonu disabled kalıyordu.
  - Fix: `PhotoUploadModal.tsx` — yükleme başarılı olunca `image_id` ile `selectedImages` ve `lastSelectedImages` otomatik set ediliyor. Kullanıcı yükleyince direkt "Fotoğraf Seç" butonu aktif hale geliyor.
