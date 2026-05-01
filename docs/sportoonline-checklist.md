# Sportoonline Talep Checklist

Bu dosya, musteriden gelen talepleri oncelik sirasina gore toparlamak icin hazirlandi.
Detay tartismalari sonraki adimlarda her madde altinda yapilacak.

## Kritik

### 1. [x] Cimri Feed -> Google Feed formatina cevrilecek
- Mevcut `https://sportoonline.com/feeds/cimri.xml` Google Feed formatinda degil.
- Feed, Google Shopping XML standardina uygun hale getirilecek.
- Cimri Type Feed'e ait `merchantItemId` ve benzeri ozel urun alanlari kaldirilacak.
- Guncellenen XML linki Cimri tarafina iletilecek.
- Cimri geri bildirimi: XML icinde Cimri Type Feed etiketleri bulunmamali, sadece Google Feed taslagindaki etiketler kalmali.
- Durum: `/feeds/cimri.xml` Google Merchant RSS yapisinda; urun item'larinda yalniz `g:*` Google Merchant etiketleri kalacak sekilde Cimri tipi ozel etiketler kaldirildi.

### 2. [x] PAYTR test modu bildirim / callback sorunu
- Test modunda bildirim kismina takilma oldugu iletilmis.
- Odeme sonrasi callback / notification akisi incelenecek.
- Test odemesi alip log ve request dogrulamasi yapilacak.
- Durum: Callback endpointlerine gelen PayTR bildirimi icin log eklendi; dogrulama ve `OK` donusu korunuyor.
- Durum: `paytr:diagnose-callback` artisan komutu eklendi; PayTR hash payload'i uretip lokal dogrulama yapiyor ve istenirse callback endpointine POST atabiliyor.
- Durum: PayTR servisinde DB credential eksikse `.env` degerlerine fallback eklendi; test modunda lokal hash dogrulamasi basarili.
- Durum: `paytr_callback_logs` tablosu eklendi; callback controller her istegi `received -> processed|hash_mismatch|unknown_oid|exception` outcome'u ile kaydediyor. `GET /v1/admin/paytr/callback-logs` + `/stats` endpoint'leri ve `/admin/paytr-logs` admin ekrani ile (son 24sa sayaci + filtrelenebilir tablo) artik SSH log erisimi olmadan dogrulanabiliyor.

### 3. [x] Admin urun stoklari 0 gorunuyor
- Adminde urunu goruntulerken stok `0` gorunuyor.
- Gercekte stok olsa da sifir gorunme problemi var.
- Stok kaynagi, varyant stok toplami ve admin gosterim mantigi incelenecek.
- Durum: Urun kaynaklarina varyant stok toplami (`stock`) ve gosterim varyanti eklendi; admin urun liste/detay verisi artik varyant toplam stok bilgisini tasiyor.

### 4. [x] Seller panel -> magaza ekle -> komisyon adiminda ilerlemiyor
- Seller panelde magaza ekle akisinda komisyon alaninda ilerleme sorunu var.
- Frontend validasyon, submit akisi ve backend response kontrol edilecek.
- Durum: Seller magaza ekleme is akisi komisyon plani aciksa varsayilan olarak `commission` secimine dusuyor; `0/false` komisyon ayari dogru disable ediliyor.

### 5. [x] Favorilerde bazi urunlerde fiyat 0 gozukuyor
- Favorilere eklenen bazi urunlerin fiyatlari `0` veya hatali gorunuyor.
- Kampanya, varyant ve fiyat fallback mantigi kontrol edilecek.
- Durum: Wishlist ve ortak urun resource'lari ilk varyant yerine fiyatli gosterim varyantini kullanacak sekilde duzenlendi.

### 6. [x] Son gorulenlerde bazi urunlerde fiyat 0 gozukuyor
- Son gorulen urunler kullanici bazli dogru geliyor ancak fiyatlarda hata var.
- Son gorulenler icin kullanilan fiyat hesabi kontrol edilecek.
- Durum: Kullanici bazli `recently-viewed-products` API eklendi; son gorulen urunlerde de ortak fiyat/stok fallback mantigi kullaniliyor.

### 7. [x] Kargo bedava / kargo kampanyasi ayari duzenlenemiyor
- Musterinin kastinin `kargo bedava` ayari oldugu dusunuluyor.
- Admin tarafinda bu alan neden duzenlenemiyor incelenecek.
- Free shipping kampanyasi ve kargo kural edit akisi kontrol edilecek.
- Durum: Admin kargo kampanyasi update istegi backend route ile uyumlu hale getirildi (`update/{id}`).

## Yuksek Oncelik

### 8. [x] Son gorulenler kullanici hesabindan anasayfaya tasinacak
- Su an kullanici hesabinda gorunen alan anasayfada section olarak gosterilecek.
- Kullanici sisteme girdiginde daha once gezdigi urunleri anasayfada gorecek.
- Bu madde fiyat `0` sorunu cozulduktan sonra tamamlanmis sayilacak.
- Durum: Backend API ve tema ayari tarafinda `recently_viewed_section` alanlari hazirlandi.
- Durum: Next.js storefront anasayfa akisi `recently_viewed_section` blogunu render ediyor; `RecentlyViewedSection` fiyat fallbackleri duzeltilen urun verisiyle anasayfada gosterime hazir.
- Durum: `recently_viewed_section` anasayfa sirasinda Flash Satis Urunleri'nin hemen altina sabitlendi ve tek satir yatay urun akisi olarak korunuyor.
- Durum: Tema layout'unda `recently_viewed_section` blogu yoksa anasayfada otomatik olarak Flash Satis Urunleri'nin hemen arkasina ekleniyor.
- Durum: `/tr/hesabim` canlı kontrol edildi; giris yapmayan kullanicida login sayfasina temiz yonlenme icin hesap API sorgulari auth token yokken kapatildi.

### 9. [x] Sayfalar / CMS icerikleri duzenlenemiyor
- Sayfalar kisminin duzenleme akisinda sorun var.
- Ozellikle iletisim sayfasindaki yanlis / eski gorsel icerigi guncellenecek.
- Durum: Admin sayfa formunda varsayilan `status/theme_name` degerleri duzeltildi; backend sayfa guncellemede `theme_name`, `content` JSON ve `meta_keywords` normalize ediliyor.
- Durum: Sayfa detay resource'u root `content` icin JSON parse + `image_url` uretimi yapacak hale getirildi; contact admin formunda gorsel artik kare oran zorunluluguna takilmiyor.
- Durum: Iletisim sayfasi frontend'inde admin resim yuklemediyse yer tutucu `538x475` metni yerine markali gradient arka plan + MessageSquare ikonu + "Sana yardimci olmaktan mutluluk duyariz" karsilama metni gosteriliyor. Admin isterse admin panelden uygun media ID'yi atar; aksi halde sayfa profesyonel gorunuyor.

### 10. [x] Google Ads ayarlari ve kampanya cikisi
- Google Ads ayarlari yapilacak.
- Kampanya cikabilmek icin gerekli temel altyapi kontrol edilecek.
- Feed, donusum olcumu ve temel reklam hazirligi birlikte degerlendirilecek.
- Durum: Google Merchant feed hazir; SEO ayarlarina Google Ads Conversion ID ve purchase label alanlari eklendi. Next.js storefront `gtag` ile Ads config ve purchase conversion sinyali gonderecek sekilde baglandi.
- Durum: Admin SEO Settings formunda canli dogrulama rozeti eklendi (`AW-XXXXXX` regex + label uzunluk kontrolu). Bos/yanlis deger durumunda amber "eksik" uyarisi; her iki alan dolu ve formatli ise yesil "yapilandirildi" rozeti gorunuyor.
- Durum: Client-side `trackGoogleAdsPurchase` artik eksik konfigurasyonda `console.warn`, firing durumunda `console.info` basiyor; admin browser DevTools ile dogrulayabilir.
- Kalan: Gercek Google Ads `AW-...` ID ve purchase conversion label admin panelden girilmeli (arac hazir); kampanya Google Ads hesabinda yayinlanmali.

### 11. [x] Swan Uniform urun yukleme
- `https://swanuniform.com/` urunleri sisteme yuklenecek.
- Durum: urunler cekildi.
- Sonraki adim gerekiyorsa import sureci yapilacak.
- Durum: `swan_products.json` icinde 357 urun dogrulandi. Mevcut `import:products` komutu Swan/Norfolk/Dropick formatlari icin genisletildi ve Swan varyant stoklarini JSON'daki gercek `stock_quantity` degeriyle alacak hale getirildi.
- Durum: `Swan Uniform` magazasi olusturuldu (`store_id=25`) ve import calistirildi. 327 urun, 2094 varyant yuklendi; 30 duplicate slug atlandi, hata yok.

## Orta Oncelik

### 12. [x] Navbar daha guclu / dolu hale getirilecek
- Navbar yapisi daha zengin gosterilecek.
- Pazaryeri ve buyuk e-ticaret ornekleri referans alinacak.
- Kategori / marka / kampanya / hizli erisim mantigi degerlendirilecek.
- Durum: Next.js storefront header'ina urunler, firsatlar ve kuponlar icin ikonlu hizli erisim seridi eklendi; kategori dropdown'u alt kategori ve urun adedi bilgisini gosterecek sekilde zenginlestirildi.
- Durum: Trendyol DE referansina benzer kompakt ust bar, genis arama alani, ikon+metin hesap/favori/sepet aksiyonlari ve kategori odakli yatay nav yapisi uygulandi. Renk tokenleri degistirilmedi; mevcut theme tokenlari kullanildi.
- Durum: `Kategoriler` tiklandiginda tam genislikte overlay mega menu aciliyor; sol kategori rail'i, orta alt kategori kolonlari ve sagda kategori gorselli kampanya kartlari eklendi.
- Durum: `/sportoonline-trendyol.html` taslagina daha yakin olacak sekilde koyu topbar, token tabanli header/main/nav yapisi, cizgili arama kutusu ve dikey ikon aksiyonlari guncellendi.
- Durum: Kategori mega menu paneli Trendyol referansina daha yakin olacak sekilde viewport genisligine yayildi; sol kategori rail'i, orta kolonlar ve sag kampanya kartlari daha dengeli olculere cekildi.
- Durum: Aktif olmayan `2 al 1 ode` / `3 al 2 ode` gibi satin-al/ode kampanya kategorileri header nav ve mega menu kategori agacindan haric tutuldu; normal kategori deneyimi Trendyol referansina yaklastirildi.
- Durum: Mega menude hard-coded firsat/yeni gelen rail satirlari kaldirildi; sol rail, orta kolonlar ve gorsel kartlar sadece dinamik kategori verisinden uretiliyor. Bos `display_order` degerli import kategorileri nav basina gelmeyecek sekilde siralama duzeltildi.
- Durum: Mega menu sol kategori satirlari artik gercek kategori linki olarak calisiyor; alt kategorisi olmayan kategorilerde orta alan bos kalmasin diye diger dinamik kategoriler kolon olarak gosteriliyor.
- Durum: Header nav ve mega menu sadece dogrudan urunu olan (`product_count > 0`) kategorileri gosteriyor; parent olup urunsuz kalan bos kategori linkleri gizlendi.

### 13. [x] Kategoriler daha premium gosterilecek
- Kategori kartlari ve sunumu daha premium gorunmeli.
- Tipografi, oranlar, gorsel kullanimi ve kart duzeni gelistirilecek.
- Durum: Anasayfa kategori section'i yuvarlak ikon listesi yerine gorsel agirlikli, hover efektli, urun/alt kategori bilgisini gosteren premium yatay kart yapisina cevrildi.
- Durum: Trendyol konseptine uygun olarak anasayfa kategori section'i kompakt, dairesel gorsel rail yapisina guncellendi; yatay kaydirma ve ok kontrolleri eklendi.
- Durum: Kategori rail'i taslaktaki gibi beyaz/kart bant icine alindi; kategori gorselleri daha kompakt yuvarlak forma cekildi.
- Durum: Tema render akisi kategori blogunu slider'dan once gelirse otomatik olarak slider'in altina tasiyacak sekilde normalize edildi.
- Durum: Anasayfa yuvarlak kategori rail'inde satin-al/ode kampanya kategorileri gosterilmeyecek sekilde filtrelendi.
- Durum: Anasayfa yuvarlak kategori rail'i de header ile ayni kategori siralama kuralini kullaniyor; bos siralama degerleri one alinmiyor.
- Durum: Anasayfa kategori rail'i ve `/kategoriler` sayfasi sadece urunlu kategorileri gosteriyor; bos kategoriler listelenmiyor.
- Durum: Bos parent kategori URL'lerine gidildiginde, varsa altindaki urunlu kategori ID'leriyle urun listesi doldurulacak sekilde kategori sayfasi fallback'i eklendi.
- Durum: Anasayfa `Kategoriler / Populer kategorilere goz atin` carousel'i artik kategori API'sinden 500 kayit cekiyor ve parent/child ayrimi yapmadan tum urunlu kategorileri yatay carousel icinde gosteriyor.
- Durum: Anasayfa kategori carousel'inde kendi gorseli olmayan urunlu leaf kategoriler icin en yakin parent kategori gorseli fallback olarak kullaniliyor; carousel tek satir snap-scroll yapisina sikilastirildi.
- Durum: Parent gorseli de olmayan kategoriler icin banner, child/sibling ve dataset icindeki uygun kategori gorseli fallback zinciri eklendi; carousel item'lari ikon fallback'e dusmeyecek sekilde gorsel buluyor.
- Durum: Anasayfa kategori carousel'i ve header nav tekrar en ust kategori seviyesiyle sinirlandi; urunlu alt kategoriye sahip parent kategoriler bos sayfa acmayacak sekilde parent link fallback'i ile gosteriliyor.
- Durum: Anasayfa kategori carousel oklarinin sabit popup/floating butonlar altinda kalmamasi icin kontrol butonlari iceride konumlandirildi ve z-index yukseltilerek tiklanabilir hale getirildi.
- Durum: Anasayfa kategori carousel'i otomatik ve kesintisiz kayacak sekilde loop yapisina cevrildi; item listesi iki kez render edilerek scroll yarida gorunmeden basa sariyor, hover/focus/touch sirasinda kullanici kontrolu icin duruyor.
- Durum: Otomatik scroll ile CSS `scroll-smooth` cakismasi giderildi; auto hareket piksel bazli hizlandirildi, ok tiklamalari auto-scroll'u kisa sure durdurup kontrollu scroll yapiyor.
- Durum: Browser'in kucuk `scrollLeft` artislarini yuvarlamasi nedeniyle auto hareketin yavas kalmasi, sanal scroll pozisyonu ref'i ile birikimli hale getirilerek giderildi.
- Durum: Kategori API'sine `representative_product_image_url` eklendi; kategori thumb/banner yoksa carousel ilgili kategorideki gercek urun gorselini, parent/child zincirinde bulabildigi ilk gercek urun/kategori gorselini kullaniyor. Auto carousel hizi artirildi.
- Durum: Kategori `product_count` hesabi canli urun listesiyle ayni kurala cekildi; sadece `approved` urunler sayiliyor ve onayli urunu olmayan alt kategoriler kategori sayfalarinda render edilmiyor.
- Durum: Turkce karakterli kategori slug'lari URL encode edilince kategori bulunamama sorunu duzeltildi; `/kategori/kamp-mutfa%C4%9F%C4%B1` gibi linkler dogru kategoriye eslesiyor.

### 15. [x] Premium hero slider taslak uyumu
- `sportoonline-trendyol.html` taslagindaki tek buyuk gorsel + okunakli metin konsepti uygulanacak.
- Slider icinde sagdaki ayrik kucuk urun/gorsel kullanimi kaldirilacak.
- Slider metinleri arka plan gorselinde daha okunakli olacak.
- Durum: Next.js hero slider varyantlari tek premium yapida birlestirildi; `bg_image_url` yoksa `image_url` arka plan olarak kullaniliyor, sagdaki ayrik kucuk gorsel render edilmiyor.
- Durum: Slider metinleri token tabanli foreground/background gradient overlay ve drop-shadow ile okunur hale getirildi; CTA, oklar ve dotlar token siniflariyla calisiyor.
- Durum: Canli aktif web slider icerikleri standartlastirildi; bozuk/eksik metinler ve uyumsuz CTA'lar duzeltildi. Pickleball, Spor Teknoloji ve Spor Ayakkabi icin 3 yeni slider taslagi eklendi, `status=0` ile pasif birakildi.
- Durum: Slider basligindaki drop-shadow kaldirildi; mobilde baslik, etiket, aciklama ve CTA alanlari kapsayici genisliginde kalacak sekilde overflow korumalari eklendi.
- Durum: Mobil ve tablet genisliklerinde slider sag/sol ok butonlari gizlendi; swipe ve dot navigasyon korunarak metinlerin oklar altinda kalmasi engellendi.
- Durum: Mobil/tablet slider autoplay kapatildi; dokunmatik tut-surukle-birak gecisi eklendi ve slayt kullanici hareketine gore elle degisecek hale getirildi.

## Dusuk Oncelik / Danisma

### 14. [x] Video araci degerlendirmesi
- `Nim` video duzenleyici YouTube ve Instagram icin uygun mu degerlendirilecek.
- Bu madde teknik bug fix degil, arac onerisi / degerlendirme niteliginde.
- Degerlendirme: Nim, kisa sosyal medya videolari icin uygun bir AI video uretim araci olarak konumlanmis; text/image-to-video, lip sync, upscale, tek tikla script/voiceover/caption/final edit gibi akislari var. YouTube Shorts, Instagram Reels ve TikTok formatlarinda hizli icerik uretimi icin denenebilir.
- Sinir: Klasik frame-by-frame kurgu, marka onayli hassas montaj, uzun video post-prod ve ileri renk/ses duzenleme icin tek basina yeterli gorunmuyor; bu islerde CapCut/Premiere/DaVinci gibi editore son duzenleme gerekebilir.
- Kaynak notu: Nim resmi sayfasi ve yardim merkezi 2026-04-23 tarihinde incelendi (`nim.video`, `about.nim.video/help`).

## Musteri Talepleri Turu 2 (2026-04-30)

Site sahibinden gelen 8 madde:

### 15. [~] Seller panel kayit akisi - eksik alanlar (cogu zaten var)
- ~~IBAN / banka hesabi~~ ✅ Satici basvuru formunda var (`bank_iban`, `bank_account_holder`, `bank_name`, `bank_branch_code`)
- ~~Vergi dairesi~~ ✅ Basvuruda var (`tax_office`)
- ~~Logo/banner upload UI~~ ✅ Magaza ekleme formunda `PhotoUploadModal` ile calisiyor
- ⚠️ Teslimat bolgesi (delivery zones): Polygon-tabanli sistem 2026-05-01 itibariyle kaldirildi (Google Places autocomplete'e gecti). Magaza tablosunda flat `delivery_charge`/`delivery_time` alanlari var, bolgeye gore degisken ucret istenirse ayri feature gerek
- ❌ **KVKK / Aydinlatma metni onay kutusu** — satici basvuru formunda YOK
  - Aksiyon: 3 zorunlu checkbox (Aydinlatma Metni, Acik Riza, Uye Sozlesmesi) + `seller_applications.consent_at` timestamp kolonu
  - Backend: `app/Http/Requests/SellerApplicationRequest.php` (varsa) + migration
  - Frontend: `customer-web-nextjs/src/app/[locale]/satici-basvuru/become-seller-client.tsx`
  - Sayfa stub: `/aydinlatma-metni`, `/kvkk-acik-riza`, `/uye-sozlesmesi` yoksa eklenmeli

### 16. [x] Kargo kampanyasi duzenleme - hata raporu (COZULDU 2026-04-30)
- Sorun 1: `useShippingCampaignQueryById` data shape'i yanlis cozuyordu (`data?.data` → tek seviye, gerekirken iki seviye `(data?.data)?.data`). Form `isEdit=false` modunda aciliyor, tum alanlar bos, kullanici min_order_value degistirdiginde CREATE yapiliyor, backend `title` zorunlu deyince 422.
- Sorun 2: Cevirilerde 9 anahtar eksikti (`common.edit_shipping_campaign`, `label.basic_info`, `label.button_settings`, `label.colors`, `place_holder.title`, `place_holder.description`, `button.change_image`, `button.save`, `common.create_shipping_campaign`)
- Sorun 3: zod schema `title.min(2)` — sebepsiz katiydi, `min(1)` yapildi
- Dosyalar: `shipping-campaign.action.ts`, `shipping-campaign.schema.ts`, `public/locales/tr.json`, `public/locales/en.json`

### 17. [ ] Cerez politikasi banner - kullanici tarafinda yok
- Admin'de `gdpr-cookie-settings` form var ama frontend'de banner yok
- KVKK/GDPR uyum icin gerekli
- Yeni component: `customer-web-nextjs/src/components/cookie-banner.tsx`

### 18. [ ] Siparis confirmation email (admin + customer'a anida)
- Mail config var, queue var, OrderPlaced event WebSocket yayini var
- Eksik: siparis OLUSTURURKEN customer'a "siparisin alindi" emaili
- Eksik: admin'e yeni siparis bildirimi (anida email)
- Olasi yer: `App\Listeners\OrderPlacedListener` veya `App\Notifications\OrderCreated`

### 19. [ ] Flash sale fiyat yuvarlama tutarsizlik
- `ProductPublicResource` (liste): `shouldRound()` aktif - 250.75 -> 251
- `ProductDetailsPublicResource` (detay): round YOK - 250.75 olarak kalir
- Tutarsizlik: liste 251, detay 250.75 (veya tam tersi musteri tarafinda)
- Cozum: ProductDetailsPublicResource'a da shouldRound() eklemek

### 20. [ ] SSS / FAQ sayfasi - tamamen yok
- Backend: model/migration/controller yok
- Frontend: /sss veya /faq route yok
- Ceviri anahtari yok
- Yeni feature: tablo + admin CRUD + frontend sayfa

### 21. [ ] Footer icerigi kontrol
- Component dinamik (`useFooterQuery`, `useSiteInfoQuery`)
- Admin panelden duzenlenebilir
- Aksiyon: musteri admin'den icerikleri guncellemeli (kod degisikligi gerekmez)

### 22. [ ] Web push notification (Firebase FCM)
- Backend: `FirebaseNotificationService` var, `fcm_token` kolonu mevcut, mobil app icin calisir
- Frontend (web): service worker yok, FCM Web SDK yok, web push subscription akisi yok
- Aksiyon: `customer-web-nextjs/public/firebase-messaging-sw.js` + FCM Web SDK
- Strateji notu: Sadece FCM modulu kullan (Realtime DB/Firestore'a gerek yok)

## Production Log Bug Listesi (2026-04-30)

VPS Laravel logundan tespit edilen kritik bug'lar (toplam 5786 hata, son hafta):

### 23. [x] BUG#1: relatedProductsWithCategoryFallback() on null (3837 hata)
- En yuksek frekansli bug
- Kaynak: `app/Http/Controllers/Api/V1/FrontendController.php` `productDetails()` metodu
- Cozum: cbd048d3 commit'i ile null check eklendi (line 1665-1671)
- Durum: Kod fix tamam, VPS'e deploy bekliyor (en son hata 2026-04-24)

### 24. [-] BUG#2: storage/framework/cache permission denied (1007 hata)
- Durum: VPS log'da artik gorulmuyor (cozulmus)

### 25. [-] BUG#3: preg_match() empty regular expression (544 hata)
- Kaynak: `vendor/fruitcake/php-cors/src/CorsService.php:183` (CORS config bos pattern)
- Durum: Son hata 2026-02-14, dormant (>2.5 ay aktif degil) — config:cache ile cozulmus

### 26. [-] BUG#4: PHP syntax error 'unexpected identifier URL' (365 hata)
- Durum: Son hata 2026-03-08, dormant (>1.5 ay)

### 27. [-] BUG#5: AppHttpMiddlewareTrustProxies does not exist (202 hata)
- Durum: Son hata 2026-03-08, dormant (>1.5 ay) — composer autoload duzeltilmis

### 28. [-] BUG#6: Invalid '%2c' locale (200 hata)
- Durum: Son hata 2026-02-21, dormant (>2 ay)

### 29. [-] BUG#7: Attempt to read property 'slug' on null (116 hata)
- Durum: Son hata 2026-02-07, dormant (>2.5 ay)

### 30. [-] BUG#8: Undefined constant DEFAULT_LANGUAGE (106 hata)
- Durum: Mevcut log'da hicbir kayit yok

### 31. [x] BUG#9: Arama/urunler/marka sayfalarinda siralama calismiyor (frontend-backend mismatch)
- Sorun: Frontend `price_asc/price_desc` gonderiyor, backend `price_low_high/price_high_low` bekliyor
- Sorun 2: `popular` sort backend'de hic destekli degildi
- Cozum:
  - Frontend duzeltildi: `ara/search-client.tsx`, `urunler/products-client.tsx`, `marka/[slug]/brand-client.tsx`
  - Backend `FrontendController::products()` metoduna `popular` case eklendi (order_count desc, views tiebreaker)
  - kategori sayfasi zaten dogru degerleri kullaniyordu

### 33. [~] PayTR canli mod onboarding — TALEP GONDERILDI 2026-05-01, ONAY BEKLENIYOR
- Sorun: Odeme sayfasi sari banner ile "BU ISLEMI TEST MODUNDA YAPIYORSUNUZ" gosteriyor
- Tespit (2026-04-30):
  - DB `payment_gateways.is_test_mode = 0` (dogru — canli)
  - Backend `PayTRService::createPaymentToken` `test_mode=0` gonderiyor
  - PayTR iframe yine de test modu banner'i gosteriyor → bu PayTR tarafindaki **merchant hesabi onboarding** sorunu
  - PayTR merchant_id: `673164`

**Aksiyon (PayTR merchant panelinde yapilacak, kod degisikligi yok):**

#### a) Bildirim URL duzeltmesi (Bildirim Sureci adimi) — TAMAMLANDI 2026-05-01
- **Sorun 1**: PayTR'nin Bildirim URL'i `www.sportoonline.com/...` olarak girilmis, nginx 301 redirect verdigi icin POST'lar fail oluyor (338 adet 301 vs 5 adet 200 — PayTR IP `212.252.97.250`)
  - Cozum: Bildirim URL `sportoonline.com/api/v1/paytr/callback` (www'siz) yapildi
- **Sorun 2**: URL duzeldikten sonra POST 200 OK donmesine ragmen body 22 byte (gzip stream) donuyor — PayTR'nin checker'i decompress etmedigi icin "OK" string'ini goremiyor, hala fail veriyor
  - Sebep: Nginx HTTP/2 chunked transfer ile Content-Length gondermedigi icin `gzip_min_length 256` filtresi calismiyor, 2 byte "OK" yine gzip oluyor
  - Cozum: `/etc/nginx/sites-enabled/sportoonline.com.conf` icine `location ^~ /api/v1/paytr/ { gzip off; ... }` block'u eklendi (longest-prefix match → /api/ block'undan once)
  - Nginx reload edildi, test: `curl https://sportoonline.com/api/v1/paytr/callback` artik content-encoding: gzip header'i donmuyor, body duz "OK"
  - Backup: `/tmp/sportoonline.com.conf.bak.*` (VPS uzerinde)

#### b) Odeme Transfer Ayarlari (zorunlu — onaysiz canli moda gecmez)
- IBAN: Sirket/sahis adina kayitli banka hesabi (PayTR satislari buraya yatirir)
  - Ilk kayit sonrasi PayTR 1 kurus dogrulama gonderebilir (1-2 is gunu)
- Transfer Periyodu: **Haftalik** onerilir (gunluk daha yuksek komisyon, aylik nakit akisi yavas)
- Minimum Transfer Tutari: 50 TL (boş birak veya dusuk tut)
- Otomatik Transfer: **Acik**
- Hak Edis Suresi: PayTR yeni magazalarda 1-7 gun bekletir, kidemli magazalarda 0-1 gune duser

#### c) Diger evrak ve dogrulamalar
- Vergi levhasi yukle
- Imza sirkuleri / faaliyet belgesi yukle
- PayTR sozlesmesi imzala
- Banka hesap dogrulama (IBAN'a gelen 1 kurus)
- PayTR onayi bekle (genelde 1-3 is gunu)
- Onay sonrasi banner kaybolacak ve gercek karttan tahsilat baslar
- Onay gelene kadar: Test kartlari (`9792 0303 9444 0796` / 12/99 / 000) ile akis test edilebilir, gercek kart kabul edilmez

#### d) Defansif kod onerisi (opsiyonel, gelecekte benzer redirect sorunu yasamamak icin)
- Nginx `sportoonline.com.conf` line 53-55: `return 301 https://sportoonline.com$request_uri;` → `return 308 ...` yapilirsa POST method korunur
- Riski az, faydasi: ileride baska entegrator www URL kullanirsa fail olmaz
- SEO etkisi: 301 ve 308 search engine icin esdeger

### 32. [ ] Sifir stoklu urunleri musteriden gizle (admin'de gorulebilir kalsin)
- Tespit (2026-04-30): 7 magazada toplam 86 urunun tum varyantlari `stock_quantity = 0`
- Ornek: https://sportoonline.com/tr/urun/everlast-spor-ayakkabi-jugs-c5 (5 varyant da 0)
- Davranis:
  - Musteri tarafinda: kategori/arama/listelerde gorunmesin, urun sayfasi 404 ya da "stokta yok" mesaji versin
  - Admin tarafinda: urun listesi normal gorunsun, "stokta yok" filtre/badge ile isaretlensin
- Olasi yaklasim:
  - Backend: `applyPublicCatalogScope` icine `whereHas('variants', fn($q) => $q->where('stock_quantity', '>', 0))` ekle
  - Admin urun listesinde stok durumu sutunu/filtre ekle (zaten var mi kontrol et)
- Etkilenen yerler: kategori, arama, magaza detay, marka, urunler, tum slider/section'lar
- NOT: Bu degisiklik onemli SEO etkisi olabilir — urun URL'leri 410 mu 404 mu donsun karari verilmeli

## Tekrarlayan maddeler birlestirildi

- Son gorulenler anasayfaya alinacak
- Son gorulenlerde fiyat `0` sorunu
- Favorilerde fiyat `0` sorunu
- Stok `0` gozukuyor
- Kategoriler premium gosterilecek

## Notlar

- Onceliklendirme, is etkisi ve dogrudan gelir / operasyon etkisine gore yapildi.
- Feed, odeme, stok ve fiyat problemleri ilk blokta ele alinmali.
- UI iyilestirmeleri teknik sorunlardan sonra gelmeli.
