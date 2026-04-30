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
