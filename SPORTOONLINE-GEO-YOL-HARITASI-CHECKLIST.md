# Sportoonline GEO Yol Haritasi ve Uygulama Checklist

Hazirlanma tarihi: 2026-05-10  
Son uygulama guncellemesi: 2026-05-10  
Kaynak raporlar:
- `GEO-AUDIT-REPORT-sportoonline.md`
- `GEO-RAPOR-Sportoonline-2026-05-10.pdf`
- `GEO-REPORT-sportoonline.pdf`

## 1. Durum Ozeti

Sportoonline GEO skoru raporlarda 30-34/100 araliginda. Site AI crawler erisimi tarafinda iyi durumda, ancak AI arama motorlarinin markayi guvenilir bir varlik olarak tanimasi ve icerigi alintilamasi icin gerekli sinyaller zayif.

En kritik sorunlar:
- `llms.txt` yok.
- Organization schema yok.
- Product schema fiyat, stok, aciklama ve rich result alanlari eksik/hatalarli.
- Blog iceriklerinde yazar, uzmanlik, kaynak ve ticari iliski aciklamasi yok.
- Kategori sayfalarinda temel SEO/GEO metadata eksik.
- Sitemap urun ve kategori URL'lerini yeterince kapsamiyor.
- Marka otoritesi zayif: LinkedIn sirket sayfasi, YouTube, inceleme platformlari, Wikidata/Wikipedia hazirligi yok veya yetersiz.
- Analytics ve reklam/retargeting olcumu eksik.
- Teknik guven sinyalleri eksik: HSTS, CSP, redirect zinciri, cache stratejisi, gorsel boyutlari.

Hedef:
- 7 gun icinde GEO skorunu yaklasik 45-50 bandina cikarmak.
- 30 gun icinde 60-65 bandina ulasmak.
- 90 gun icinde off-site otorite ve icerik kümeleriyle 75+ bandini hedeflemek.

## 2. Onceliklendirme Mantigi

P0: Crawler, schema, indexleme, olcum ve guven sinyallerini engelleyen kritik maddeler.  
P1: AI citability ve E-E-A-T'i dogrudan etkileyen icerik ve kategori iyilestirmeleri.  
P2: Marka otoritesi, platform optimizasyonu ve performans iyilestirmeleri.  
P3: Uzun vadeli otorite ve rekabet avantaji.

## 3. P0 - Ilk 72 Saat

### Teknik ve Schema

- [x] SSL otomatik yenilemeyi dogrula: `certbot renew --dry-run`. Sportoonline sertifikalari basarili.
- [x] `/llms.txt` dosyasini yayinla.
- [x] Gerekirse `/llms-full.txt` dosyasini yayinla.
- [x] `robots.txt` icinde GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Googlebot ve Bingbot icin acik `Allow: /` direktiflerini netlestir.
- [x] Ana sayfaya Organization JSON-LD ekle.
- [x] Organization schema icinde `name`, `url`, `logo`, `contactPoint`, `sameAs`, `address` alanlarini doldur.
- [x] Hakkimizda ve Iletisim sayfalarindaki konum tutarsizligini gider. Tek NAP standardi belirle.
- [x] Product schema fiyat alaninin gercek fiyati gostermesini sagla.
- [x] Product schema stok bilgisini sayfadaki stok durumu ile esitle.
- [x] Product schema `description` alanindaki kesilme hatasini duzelt.
- [x] Product schema icin `priceValidUntil` ekle.
- [x] `aggregateRating` sadece gercek yorum/puan varsa uretilecek sekilde kosullu hale getir.
- [x] Article schema `datePublished` ve `dateModified` alanlarini ISO 8601 formatina cevir.
- [x] BlogPosting schema icin `author` alanini Person olarak ekle.
- [x] Ana sayfaya HSTS header ekle.
- [x] CSP icin once raporlama modunda politika hazirla, sonra kademeli uygula.

### Olcum

- [x] GA4 kurulumu icin site ayari/env fallback destegi ekle.
- [x] Google Tag Manager kurulumu icin site ayari/env fallback destegi ekle.
- [x] Google OAuth Client ID'nin admin paneldeki Social Login ayarindan public siteye aktarilmasini sagla.
- [x] Google ile giris butonunu dinamik Google Client ID ile calisacak hale getir.
- [x] Google Maps anahtari icin mevcut Google Map Settings akisini dogrula; anahtar Google Cloud'dan alinip admin panele girilecek.
- [x] E-ticaret eventlerini tanimla: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`.
- [x] Facebook Pixel / Meta CAPI kararini ver ve en az Pixel'i kur. Kod tarafi `NEXT_PUBLIC_META_PIXEL_ID` ile hazir.
- [x] Google Search Console dogrulama dosyasini canli dogrula: `/googlec78a9bfe93e092fc.html` ve `/tr/googlec78a9bfe93e092fc.html` `200`.
- [x] Bing Webmaster Tools dogrulama dosyasini canli dogrula: `/BingSiteAuth.xml` ve `/tr/BingSiteAuth.xml` `200`.
- [x] Google/Bing sitemap kesfini dogrula: `robots.txt` icinde `Sitemap: https://sportoonline.com/sitemap.xml` var.
- [x] Canli sitemap XML gecerliligini ve kapsami dogrula: `https://sportoonline.com/sitemap.xml` parse basarili, `2234` URL.
- [x] Sitemap ve ana URL'leri IndexNow ile Bing destekli motorlara bildir. Son yanit: `submitted=6`, `status=200`, `ok=true`.
- [ ] Google Search Console panelinde sitemap durumunu `Basarili` olarak manuel dogrula. Google sitemap ping kapali; panel/API OAuth gerekir.
- [ ] Bing Webmaster Tools panelinde sitemap durumunu `Success` olarak manuel dogrula. Bing anonim sitemap ping kapali; panel/API key gerekir.
- [ ] Google Merchant Center "Web sitesinin veya online magaza iyilestirilmesi gerekiyor" uyarisi icin politika, bozuk link, placeholder icerik, urun/feed-site uyumu ve inceleme istegi adimlarini tamamla.

### Indexleme

- [x] Sitemap'in urun URL'lerini kapsadigini dogrula.
- [x] Sitemap'in kategori URL'lerini kapsadigini dogrula.
- [x] Buyuk katalog icin `sitemap_index.xml` yapisina gec.
- [x] Sitemap `lastmod` alanlarini gercek guncelleme tarihleriyle uret.
- [x] IndexNow anahtarini olustur.
- [x] Urun, kategori ve blog guncellemelerinde IndexNow ping entegrasyonu yap. `/api/indexnow` endpoint'i eklendi.

## 4. P1 - Ilk 7 Gun

### Kategori Sayfalari

- [x] Tum kategori sayfalari icin benzersiz title uret.
- [x] Tum kategori sayfalari icin 120-160 karakter meta description uret.
- [x] Her kategori sayfasinda tek ve net H1 kullan.
- [x] Canonical URL ekle.
- [x] OG title, OG description ve OG image ekle.
- [x] Twitter card metadata'sini sayfa bazli uret.
- [x] `hreflang` etiketlerini kucuk harfle ve dogru locale degerleriyle uret.
- [x] `x-default` stratejisini netlestir.
- [x] Kategori sayfalarina BreadcrumbList schema ekle.
- [x] Oncelikli kategorilere FAQ bolumu ekle: whey protein, kosu ayakkabisi, fitness ekipmani, outdoor.
- [x] FAQ bolumleri icin FAQPage schema ekle.

### Blog E-E-A-T

- [x] Her blog yazisina yazar adi ekle.
- [x] Yazar kutusu ekle: Engin Eser adi, unvan, uzmanlik, kisa bio ve profil linki.
- [x] Engin Eser yazar profil sayfasini ekle: `/tr/yazar/engin-eser`, `/en/yazar/engin-eser`.
- [x] Yazar profil resmi alani ekle; gercek fotograf yoksa mevcut yorum/avatar kalibindaki placeholder goster.
- [x] Person schema ekle. BlogPosting author ve yazar profil sayfasi `Person` JSON-LD ile canli dogrulandi.
- [x] Fitness ve beslenme yazilarina tibbi/egzersiz feragat notu ekle.
- [x] Urun karsilastirma yazilarina ticari iliski aciklamasi ekle.
- [ ] Her blog yazisina 3-5 guvenilir kaynak ekle.
- [ ] Baslikta vaat edilen liste sayisi ile icerik sayisini esitle.
- [ ] En yuksek trafikli 3 blog yazisini en az 1.000 kelimeye genislet.
- [ ] Her genisletilen yazida ozet cevap, karsilastirma tablosu ve SSS bolumu kullan.

### Gorsel ve UX

- [ ] Urun gorsellerine aciklayici Turkce alt text ekle.
- [ ] Kategori gorsellerine aciklayici Turkce alt text ekle.
- [ ] Blog gorsellerine konu odakli alt text ekle.
- [x] Gorsellerde explicit `width` ve `height` veya CSS `aspect-ratio` uygula.
- [x] CLS riski olusturan gorsel/kart alanlarini sabit oranli hale getir.

## 5. P1 - 30 Gunluk Icerik Plani

### Revize Edilecek Mevcut Icerikler

- [ ] Whey protein karsilastirma yazisini 1.500+ kelimeye cikar.
- [ ] Kosu ayakkabisi rehberini 1.500+ kelimeye cikar.
- [ ] Maraton/hazirlik icerigini 1.200+ kelimeye cikar.
- [ ] Evde egzersiz yazisinda 10 egzersizi gercekten tamamla.
- [ ] Protein kaynaklari yazisinda 10 kaynak listesini tamamla.
- [ ] Her yazida "kimler icin uygun", "nasil secilir", "sik yapilan hatalar" bolumleri ekle.

### Yeni Icerikler

- [ ] 2026 en iyi whey protein markalari rehberi.
- [ ] Yeni baslayanlar icin kreatin rehberi.
- [ ] Kilo vermek icin evde kullanilabilecek fitness ekipmanlari.
- [ ] Kadinlar icin kosu ayakkabisi secim rehberi.
- [ ] Erkekler icin kosu ayakkabisi secim rehberi.
- [ ] Protein tozu, BCAA ve kreatin farklari.
- [ ] Sporcu besini satin alirken dikkat edilmesi gerekenler.
- [ ] Turkiye'de en cok tercih edilen spor ekipmanlari veri raporu.

### Icerik Formati Standardi

- [ ] Her rehberde 40-60 kelimelik dogrudan cevap ozeti.
- [ ] Karsilastirma tablosu.
- [ ] Urun/kategori ic linkleri.
- [ ] Guvenilir dis kaynaklar.
- [ ] SSS bolumu.
- [ ] Yazar kutusu.
- [ ] Guncelleme tarihi.
- [ ] Ticari iliski aciklamasi.
- [ ] Gerekiyorsa tibbi/egzersiz uyarisi.

## 6. P2 - 30 Gunluk Teknik Iyilestirmeler

- [x] HTTP/www/httpS varyantlarini tek adimda `https://sportoonline.com/tr` adresine yonlendir.
- [x] Ana sayfada agresif `no-store` politikasini gozden gecir.
- [x] ISR veya `stale-while-revalidate` cache stratejisi uygula.
- [x] CDN cache kurallarini sayfa tipine gore ayir.
- [x] Urun ve kategori sayfalarinda cache invalidation stratejisi belirle.
- [ ] Brotli sikistirmayi etkinlestir. Sunucudaki nginx build'inde Brotli modulu gorunmuyor; modul kurulumu gerektiriyor.
- [x] `server_tokens off` ile nginx versiyon bilgisini gizle.
- [x] Mağaza sayfalari icin Store schema'ya `openingHours`, `address` ekle. `geo` icin veri modeli alani bekleniyor.
- [x] Magazalar liste sayfasi icin CollectionPage ve ItemList schema ekle.
- [x] Urunlerde GTIN/MPN/brand alanlarini veri modeli destekliyorsa schema'ya ekle.
- [x] Sosyal profil linklerini footer'da HTML olarak gorunur hale getir.
- [x] Gizlilik politikasi ve KVKK metinlerini veri saklama, kullanici haklari ve iletisim bilgileriyle guncelle.

## 7. P2 - Marka Otoritesi ve Platformlar

- [x] LinkedIn profil/sirket URL'lerini site `sameAs` ve footer sinyallerinde gorunur hale getir. LinkedIn bot korumasi `999` donduruyor; tarayici manuel kontrol gerekli.
- [ ] LinkedIn sirket sayfasini tarayicidan optimize et: logo, aciklama, site URL'i, NAP ve ilk paylasim.
- [ ] LinkedIn'de haftalik kategori/rehber paylasim rutini baslat.
- [x] YouTube kanali canli dogrulandi: `https://www.youtube.com/@sportoonline6835` `200`.
- [ ] Ilk 3 YouTube videosunu yayinla: whey protein inceleme, kosu ayakkabisi secimi, ev fitness ekipmanlari.
- [ ] Videolari ilgili blog yazilarina embed et.
- [ ] Trustpilot veya benzeri inceleme profili olustur.
- [x] Sikayetvar marka profili canli dogrulandi: `https://www.sikayetvar.com/sportoonline` `200`; kurumsal uyelik bilgisi eklendi.
- [ ] Sikayetvar yanit sureci kur: sorumlu kisi, SLA, hazir yanit sablonlari.
- [ ] Google Business Profile kaydi olustur veya duzelt.
- [ ] Tum off-site profillerde ayni marka adi, adres, telefon ve site URL'i kullan.
- [ ] Reddit/Eksi Sozluk gibi platformlarda spam olmayan, uzmanlik odakli marka dinleme ve yanit sureci kur.

## 8. P3 - 90 Gunluk Stratejik Program

### Topical Authority Kümeleri

- [ ] Protein takviyeleri pillar sayfasi.
- [ ] Protein takviyeleri icin 5-8 destekleyici makale.
- [ ] Kosu ekipmanlari pillar sayfasi.
- [ ] Kosu ekipmanlari icin 5-8 destekleyici makale.
- [ ] Ev fitness ekipmanlari pillar sayfasi.
- [ ] Ev fitness icin 5-8 destekleyici makale.
- [ ] Outdoor spor ekipmanlari pillar sayfasi.
- [ ] Outdoor icin 5-8 destekleyici makale.

### Birincil Veri ve AI Alintilanabilirlik

- [ ] Katalog ve satis verilerinden anonimlestirilmis trend raporu hazirla.
- [ ] "Turkiye'de En Cok Satan Spor Urunleri 2026" raporunu yayinla.
- [ ] Sezonluk kategori trendleri yayinla.
- [ ] Basina ve sektorel yayinlara veri odakli bulten gonder.
- [ ] Blog yazilarinda ozgun veri grafiklerini kullan.

### Entity ve Bilgi Grafigi

- [x] Wikidata kullanici hesabi olusturuldu: `https://www.wikidata.org/wiki/User:Sportoonline`.
- [x] Wikidata kullanici sayfasi icin seffaflik ve uygulama rehberi hazirlandi: `docs/sportoonline-wikidata-kullanici-rehberi.md`.
- [x] Wikidata uygunluk ve kaynak ihtiyacini ilk seviye analiz et. Sonuc: kullanici sayfasi acilabilir, marka item'i icin bagimsiz kaynaklar birikmeden ilerlenmemeli.
- [x] Wikidata kullanici sayfasina cikar iliskisi/seffaflik beyanini ekle. Canli raw sayfada dogrulandi.
- [ ] Sportoonline icin Wikidata item taslagi hazirla; kaynak yeterliligi saglanmadan yayinlama.
- [ ] Wikipedia icin notability sartlarini karsilayacak ucuncu taraf kaynaklari biriktir.
- [ ] Marka hakkinda tarafsiz, kaynakli basin/sector yayinlari edin.
- [x] Organization schema `sameAs` listesini tum dogrulanmis profillerle genislet. LinkedIn `https://www.linkedin.com/in/sporto-online-965632409/`, YouTube `https://www.youtube.com/@sportoonline6835` ve Sikayetvar `https://www.sikayetvar.com/sportoonline` eklendi.

## 9. Basari Metrikleri

### Teknik Metrikler

- [ ] Rich Results Test'te Product schema hatasiz.
- [ ] Rich Results Test'te Article/BlogPosting schema hatasiz.
- [x] Sitemap'te kategori ve urun URL kapsami %95+.
- [ ] Search Console index coverage hatalari azaliyor.
- [x] HSTS aktif.
- [x] CSP en az raporlama modunda aktif.
- [x] Redirect zinciri tek 301.
- [x] CLS iyi seviyede.

### GEO ve Icerik Metrikleri

- [ ] GEO skoru 30-34 bandindan 50+ bandina cikti.
- [ ] 30 gun sonunda 60+ hedefi yakalandi.
- [ ] En az 10 blog yazisinda yazar, kaynak ve schema tamamlandi.
- [ ] En az 4 kategori sayfasinda FAQPage schema aktif.
- [ ] ChatGPT/Perplexity test sorgularinda Sportoonline veya Sportoonline icerikleri gorunmeye basladi.

### Ticari Metrikler

- [ ] GA4 e-ticaret eventleri calisiyor.
- [ ] Organik trafik artis trendi basladi.
- [ ] Kategori sayfalarindan urun goruntuleme artiyor.
- [ ] Blogdan urun/kategori sayfalarina ic link tiklamalari olculuyor.
- [ ] Retargeting kitleleri birikmeye basladi.

## 10. Uygulama Sirasi

1. Schema, `llms.txt`, sitemap ve analytics eksiklerini kapat.
2. Kategori metadata ve blog E-E-A-T sorunlarini duzelt.
3. En yuksek potansiyelli blog ve kategori sayfalarini derinlestir.
4. Teknik performans, cache, redirect ve guvenlik basliklarini tamamla.
5. Marka otoritesi icin off-site profilleri ve video/inceleme kanallarini kur.
6. 90 gunluk topical authority ve veri raporu programina gec.

## 11. Haftalik Sprint Plani

### Hafta 1

- [x] SSL, HSTS, temel CSP.
- [x] `llms.txt`.
- [x] Organization schema.
- [x] Product schema fiyat/stok/description/priceValidUntil.
- [x] Article tarih ve author schema.
- [x] GA4, GTM, Pixel.
- [x] Bing Webmaster Tools XML dogrulama dosyasi eklendi. `https://sportoonline.com/BingSiteAuth.xml` ve `https://sportoonline.com/tr/BingSiteAuth.xml` canli `200`.
- [x] NAP tutarsizligi duzeltmesi.

### Hafta 2

- [x] Kategori metadata sablonlari.
- [x] Kategori H1/canonical/OG/hreflang.
- [x] Sitemap index ve urun/kategori kapsami.
- [x] Yazar kutusu ve Person schema.
- [x] Blog feragat ve ticari iliski notlari.
- [ ] Ilk 3 blog genisletmesi.

### Hafta 3

- [x] FAQPage schema'li oncelikli kategori FAQ'lari.
- [ ] 3 yeni satin alma/karsilastirma rehberi.
- [x] Gorsel alt text ve boyut/ratio duzeltmeleri.
- [x] BreadcrumbList ve ItemList kapsami.
- [x] Hakkimizda sayfasi E-E-A-T revizyonu.

### Hafta 4

- [x] IndexNow entegrasyonu.
- [x] Cache/ISR stratejisi.
- [x] Redirect zinciri duzeltmesi.
- [x] Footer sosyal linkleri.
- [x] LinkedIn profili Organization `sameAs` alanina eklendi: `https://www.linkedin.com/in/sporto-online-965632409/`.
- [x] YouTube kanali Organization `sameAs` alanina eklendi: `https://www.youtube.com/@sportoonline6835`.
- [ ] Trust/review platform profilleri.

## 12. Uygulama Notlari ve Yeni Eksikler

### 2026-05-10 Kodla Tamamlananlar

- [x] `customer-web-nextjs/src/app/llms.txt/route.ts` eklendi.
- [x] `customer-web-nextjs/src/app/llms-full.txt/route.ts` eklendi.
- [x] AI crawlerlar icin robots direktifleri genisletildi.
- [x] Organization JSON-LD locale layout seviyesine eklendi.
- [x] Product JSON-LD fiyat, stok, description, `priceValidUntil`, kosullu `aggregateRating` icin duzeltildi.
- [x] BlogPosting JSON-LD ISO tarih, author Person ve publisher logo ile duzeltildi.
- [x] Blog detay sayfasina yazar, tibbi/egzersiz uyarisi ve ticari iliski aciklamasi eklendi.
- [x] Kategori sayfasina H1, CollectionPage, ItemList ve FAQPage schema eklendi.
- [x] Kategori title/description metinleri TR/EN guncellendi.
- [x] Sitemap slug normalizasyonu kategori/product/store/blog alanlarini kapsayacak sekilde genisletildi.
- [x] Store schema `address` ve `openingHours` ile genisletildi.
- [x] Magazalar liste sayfasina CollectionPage/ItemList schema eklendi.
- [x] HSTS ve CSP Report-Only headerlari Next.js config seviyesine eklendi.
- [x] GA4/GTM/Google Ads/Meta Pixel icin env fallback destegi eklendi.
- [x] Bing ve Google dogrulama meta destegi eklendi.
- [x] IndexNow key dosyasi ve `/api/indexnow` bildirim endpoint'i eklendi.
- [x] `sitemap_index.xml` route'u eklendi.
- [x] `x-default` alternates helper'i ve oncelikli public sayfalarda uygulamasi eklendi.
- [x] `NODE_ENV=development` kaynakli production build kirilmasi build script'inde `NODE_ENV=production` sabitlenerek giderildi.
- [x] Ilk 3 blog revizyonu ve 3 yeni satin alma rehberi icin CMS'e girilebilir brief dokumani hazirlandi: `docs/sportoonline-geo-content-briefs.md`.
- [x] Canli nginx'te `server_tokens off` uygulandi ve reload edildi.
- [x] Canli nginx'te Sportoonline icin HSTS header eklendi ve curl ile dogrulandi.
- [x] Gizlilik politikasi, aydinlatma metni ve KVKK acik riza sayfalari icin dolu fallback metinleri eklendi.
- [x] Hakkimizda sayfasi icin E-E-A-T odakli fallback icerik ve AboutPage schema eklendi.
- [x] `.env.example` GA4, GTM, Meta Pixel, Search Console/Bing ve IndexNow degiskenleriyle guncellendi.
- [x] GA4 `G-CGBRR5W9B1`, GTM `GTM-TVG4NRG5` ve IndexNow key env fallback olarak eklendi.
- [x] Google Ads global site etiketi `AW-315699693` site ayarlarina eklendi ve canli HTML'de `gtag('config','AW-315699693')` olarak dogrulandi.
- [x] Google Ads etiket kapsaminda `/en/...` sayfalar icin tag kontrolu yapildi; canli `/en` ve ornek `/en/kategori/erkek-iç-giyim` sayfalarinda Ads config goruldu. Ads teshisi icin `gtag.js` ana yukleme ID'si `AW-315699693` olacak sekilde siralama duzeltildi.
- [x] Google Ads kapsaminda tag'siz kalabilecek locale'siz eski URL'ler icin middleware kapsami genisletildi; `/urun/...`, `/kategori/...` gibi yollar varsayilan `/tr/...` locale'ine yonleniyor.
- [x] Google Ads teshis araci Next `Script` preload/RSC ciktisini kacirmasin diye `AW-315699693` root `<head>` icine manuel Google tag formatinda eklendi; locale layout'ta AW config tekrari kaldirildi.
- [x] Google Ads satin alma donusumu icin label `INsdC03LslwZEO3jxJYB` site ayarina ve root tag degiskenlerine eklendi.
- [x] Tarayici diline gore `/en` yonlenmesini onlemek icin locale detection kapatildi; varsayilan locale `/tr`.
- [x] Urun detay sayfasindaki Next.js OpenGraph render hatasi giderildi; gecersiz `product` OpenGraph tipi yerine desteklenen `website` kullanildi, Product JSON-LD schema korunuyor.
- [x] CSP report-only basligindan etkisiz `upgrade-insecure-requests` direktifi kaldirildi; Chrome console uyarisi giderildi.
- [x] Satici panelinde urun/siparis gorunmeme sorunu icin store dropdown varsayilani en yeni magazaya alindi ve siparis listesine urun listesiyle ayni magaza fallback'i eklendi. Canli veri: GZL Teknoloji `store_id=54`, SportoFlow urunu `approved`, siparis `107` `confirmed/paid`.
- [x] Eski magaza URL formatlari `/stores/details/:slug` ve `/store/details/:slug`, yeni `/tr/magaza/:slug` route'una 308 redirect edildi; paneldeki eski magaza linkleri yeni route'a cevrildi.
- [x] Firebase Web Analytics config'i eklendi: project `sportoonline-e6793`, measurement ID `G-LWK0WH3C4Z`.
- [x] Google Merchant feed'den `[pause]` attribute'u olmadigi canli dogrulandi; stok disi, spor disi/gida/pekmez, tütün/alkol, supplement/kozmetik riskli urunleri ve okunamayan/kucuk gorselleri Google feed disina alan filtreler eklendi. Canli feed: `452` urun, `pause=0`, `out_of_stock=0`, `empty_image=0`, `image_unreadable=0`, `image_too_small=0`.
- [x] Stok disi urun UI'i guclendirildi: urun karti overlay, detay sayfasi stok rozeti, uyarı paneli, varyant stok etiketi, adet kontrol kilidi ve satin alma butonu kilitleri eklendi.
- [x] Customer web production'a deploy edildi, PM2 restart edildi.
- [x] Canli sayfada GA4 `G-CGBRR5W9B1` ve GTM `GTM-TVG4NRG5` gorundugu curl ile dogrulandi.
- [x] `https://sportoonline.com/indexnow-key.txt`, `llms.txt` ve `sitemap_index.xml` canli 200 olarak dogrulandi.
- [x] Nginx'te `/api/indexnow` Next.js'e yonlendirildi ve 9 kritik URL IndexNow'a gonderildi. API yaniti: `202 Accepted`.
- [x] Sitemap product timeout 60 saniyeye cikarildi; canli sitemap urun/kategori URL kapsami dogrulandi ve IndexNow'a tekrar bildirildi.
- [x] Spor disi eski pazaryeri kategori dikeyleri navigasyon/sitemap kesfinden cikarildi; Sportoonline topical authority sinyali guclendirildi.
- [x] Public store API, Store type ve `Store` JSON-LD icin latitude/longitude destekleri eklendi.
- [x] Canli deploy sonrasi sitemap eski pazaryeri kategori hitleri `0` olarak dogrulandi; store sayfasinda `GeoCoordinates` JSON-LD goruldu.
- [x] Sitemap, magazalar, store detail ve kategoriler URL'leri IndexNow'a tekrar bildirildi. API yaniti: `200 OK`.
- [x] Hakkimizda/Iletisim NAP adres kaynagi admin veritabanindaki Engin Eser magazasi olarak duzeltildi: `1671 sokak no 151c aksoy karşıyaka izmir`, `sportoonlinecom@gmail.com`.
- [x] Global Organization JSON-LD, CMS contact/about icerigi ve site ayarlari ayni admin adres kaynagiyla guncellendi; hatali Levent/Sisli ve placeholder telefon sinyalleri temizlendi.
- [x] Google Search Console HTML dosyasi eklendi. `https://sportoonline.com/googlec78a9bfe93e092fc.html` ve `https://sportoonline.com/tr/googlec78a9bfe93e092fc.html` canli `200`.
- [x] Bing Webmaster XML dosyasi eklendi. `https://sportoonline.com/BingSiteAuth.xml` ve `https://sportoonline.com/tr/BingSiteAuth.xml` canli `200`.
- [x] Google Search Console URL-prefix mulku icin `/tr/sitemap.xml` ve `/tr/sitemap_index.xml` route'lari eklendi. Canli `/tr/sitemap.xml` `200`, URL sayisi `2234`; `/tr/sitemap_index.xml` `200`.
- [x] Search Console `Getirilemedi` hatasi icin `/tr/sitemap.xml` hizlandirildi; artik `308` ile statik root `/sitemap.xml` dosyasina yonleniyor, final `200`, sure `~0.54s`, URL sayisi `2234`.
- [x] Search Console'daki `30 hata` icin sitemap URL slug'lari percent-encode edildi ve Turkce `lastmod` tarihleri ISO formata cevrildi. Canli sitemap: `2234` URL, ham non-ASCII URL/tarih satiri `0`.
- [x] Engin Eser yazar profil route'u, blog detay yazar kutusu, BlogPosting `Person` author schema ve sitemap URL'leri eklendi; canli `200` olarak dogrulandi ve IndexNow'a bildirildi (`submitted=4`, `status=200`).
- [x] Engin Eser profil sayfasi ve blog yazar kutusuna profil gorseli/placeholder davranisi eklendi; gercek profil fotografi olmadigi icin sahte logo gorseli schema'dan cikarildi.
- [x] `sosialmedia/` klasoru Sportoonline icin ozellestirildi; LinkedIn, YouTube, Instagram, Facebook, TikTok ve X/Twitter kanal sablonlari, haftalik/aylik icerik planlari ve yayin kontrol listeleri eklendi.
- [x] Search Console `Gecersiz tarih` ekranindaki satirlar icin `lastmod` daha kati `YYYY-MM-DD` formatina indirildi. Ornek satir 17319: `<lastmod>2026-02-14</lastmod>`; hatali tarih paterni `0`.
- [x] Sikayetvar kurumsal marka profili Organization `sameAs` alanina eklendi ve canli JSON-LD'de gorundugu dogrulandi: `https://www.sikayetvar.com/sportoonline`.
- [x] Sunucudan `mivizu.com` nginx site config'i ve certbot sertifika kaydi kaldirildi; `nginx -t` basarili ve nginx reload edildi.
- [x] Sunucuda kalan `/var/www/productsPark/mivizu.com-20260224T183010.json` dosyasi silindi; `/var/www`, `/etc`, `/root` altinda `mivizu` kalintisi bulunmadigi dogrulandi.

### Ortam Degiskeni Gerektirenler

- [x] `NEXT_PUBLIC_GA_ID` veya admin site ayarindaki GA4 ID girilecek.
- [x] `NEXT_PUBLIC_GTM_ID` veya admin site ayarindaki GTM ID girilecek.
- [x] `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID` veya admin site ayarindaki Google Ads ID girilecek.
- [x] `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL` satin alma donusumu icin Google Ads label girilecek.
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` girilecek.
- [ ] `NEXT_PUBLIC_BING_SITE_VERIFICATION` girilecek.
- [ ] `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` girilecek.
- [x] `INDEXNOW_KEY` ve opsiyonel `INDEXNOW_SECRET` girilecek.
- [x] IndexNow key dosyasi `https://sportoonline.com/indexnow-key.txt` uzerinden dogrulanacak.

### Kod Disi / Operasyonel Kalanlar

- [x] SSL yenileme `certbot renew --dry-run` sunucuda dogrulanacak. `sportoonline.com` ve `panel.sportoonline.com` dry-run basarili.
- [ ] GA4, GTM, Meta Pixel ve Search Console panellerinde mulkiyet/donusum kurulumlari tamamlanacak.
- [ ] Sitemap Google Search Console ve Bing Webmaster Tools'a gonderilecek.
- [x] Hakkimizda/Iletisim NAP bilgisi admin iceriginde tek adrese indirilecek.
- [ ] Blog yazilarinin gercek yazar profilleri, uzmanlik bilgileri ve kaynak referanslari icerik ekibi tarafindan girilecek.
- [ ] Mevcut blog yazilari 1.000-1.500+ kelimeye genisletilecek.
- [ ] Hazirlanan briefler CMS'e uygulanacak: `docs/sportoonline-geo-content-briefs.md`.
- [ ] LinkedIn, YouTube, Trustpilot/Sikayetvar ve Google Business Profile gibi off-site varliklar acilacak veya optimize edilecek.
- [ ] `sitemap_index.xml` ihtiyaci katalog 1.000 URL sinirini asarsa ayrica ele alinacak.
- [x] Store `geo` schema icin magaza veri modeline latitude/longitude alanlari eklenecek.
- [ ] Google Merchant Center icin manuel yeniden inceleme oncesi kategori/urun kapsami ve feed uygunlugu canli ortamda tekrar kontrol edilecek.
- [x] Ayni sunucudaki `mivizu.com` Let's Encrypt renewal 403 kaydi temizlendi; nginx ve certbot tarafinda mivizu kaydi kalmadigi dogrulandi.

### Dogrulama Notu

- [x] `./node_modules/.bin/tsc --noEmit` basarili.
- [x] `bun run build` basarili.
