# Sportoonline GEO Audit Checklist

**Denetim tarihi:** 2026-05-10  
**Son kontrol:** 2026-05-10 canlı deploy sonrası  
**URL:** https://sportoonline.com  
**Amaç:** Bu dosya artık okunabilir rapor değil, eksikleri adım adım kapatmak için çalışma checklist'idir. Tamamlanan işler tekrar eksik sayılmamalı.

## Kontrol Notu

- [x] `llms.txt`, `llms-full.txt`, robots AI crawler direktifleri, sitemap ve IndexNow route'ları eklendi.
- [x] Organization, WebSite, Product, BreadcrumbList, CollectionPage, FAQPage, AboutPage ve BlogPosting schema altyapısı eklendi.
- [x] Canlı `NEXT_PUBLIC_SITE_URL=http://localhost:3003` etkisi kodda normalize edildi; canlı HTML'de `localhost` sızıntısı son kontrolde görünmedi.
- [x] Blog sayfası var ve canlı API blog döndürüyor. Eski rapordaki “Blog 0 yazı” bulgusu güncel değil.
- [ ] Bu checklist tamamlandıkça madde işaretleri güncellenecek; yeni denetim skoru daha sonra tekrar ölçülecek.

## Canlı Blog Durumu

- [x] `https://sportoonline.com/tr/blog` canlı `200`.
- [x] `https://sportoonline.com/api/v1/blogs?per_page=12&page=1` canlı `200`.
- [x] Blog API canlı toplamı: `15` yayımlanmış yazı.
- [x] İlk sayfada `10` yazı dönüyor; backend `per_page` parametresini destekliyor.
- [x] Blog detay sayfalarında `BlogPosting` JSON-LD, `Person` author, publisher Organization ve breadcrumb var.
- [ ] Blog içerikleri GEO açısından hâlâ zayıf: kaynak, uzunluk, tablo, SSS ve doğrudan cevap formatı eksik.
- [x] Audit aracının “blog yok” demesinin ilk kontrolü yapıldı: canlı API 15 yazı döndürüyor; blog liste sayfasına `Blog` + `ItemList` JSON-LD eklendi. İçerik kalitesi ayrı madde olarak kalıyor.

## P0 - Kritik Teknik ve Schema

- [x] `og:url` ana sayfa, ürün, kategori, blog, hakkımızda ve iletişim metadata'larına eklendi.
- [x] WebSite schema `url` değeri kök domain mantığıyla düzeltildi.
- [x] Organization URL, logo, contactPoint, sameAs ve address alanları dolduruldu.
- [x] Organization address alanları `streetAddress`, `addressLocality`, `addressRegion`, `postalCode`, `addressCountry` olarak ayrıştırıldı.
- [x] ContactPage JSON-LD iletişim sayfasına eklendi.
- [x] Product schema fiyat, stok, açıklama ve `priceValidUntil` alanları düzeltildi.
- [x] `aggregateRating` sadece gerçek yorum/puan varsa üretilecek hale getirildi.
- [x] BlogPosting `author`, ISO tarih ve publisher logo alanları eklendi.
- [x] Sitemap `sitemap.xml` ve `sitemap_index.xml` canlı çalışıyor.
- [x] Google doğrulama dosyası canlı `200`.
- [x] Bing doğrulama dosyası canlı `200`.
- [x] IndexNow key dosyası canlı `200`.
- [ ] Google Search Console sitemap durumu panelden manuel doğrulanacak.
- [ ] Bing Webmaster Tools sitemap durumu panelden manuel doğrulanacak.
- [ ] Google Merchant Center uyarısı için politika, feed ve site uyumu ayrı kontrol edilecek.

## P1 - Blog ve E-E-A-T Eksikleri

- [x] Blog sayfası yayında.
- [x] Blog detay sayfasında yazar kutusu var.
- [x] Engin Eser yazar profil route'u var: `/tr/yazar/engin-eser`.
- [x] BlogPosting author `Person` schema ile bağlandı.
- [x] Fitness/beslenme içeriklerine uyarı ve ticari ilişki açıklaması altyapısı eklendi.
- [ ] Her blog yazısına 3-5 güvenilir kaynak eklenecek.
- [ ] En yüksek potansiyelli ilk 3 yazı 1.000+ kelimeye genişletilecek.
- [ ] Başlıkta vaat edilen liste sayısı içerikte gerçekten tamamlanacak.
- [ ] Her rehbere 40-60 kelimelik doğrudan cevap özeti eklenecek.
- [ ] Her rehbere karşılaştırma tablosu eklenecek.
- [ ] Her rehbere SSS bölümü eklenecek.
- [ ] Blog görsellerine konu odaklı Türkçe alt text girilecek.
- [ ] İç linkler ürün/kategori sayfalarına bilinçli şekilde yerleştirilecek.

### Öncelikli Blog Revizyonları

- [ ] “Evde Yapabileceğiniz 10 Etkili Egzersiz” yazısı gerçekten 10 egzersizi kapsayacak şekilde genişletilecek.
- [ ] “Sporcular İçin En İyi 10 Protein Kaynağı” yazısı 10 kaynağı tamamlayacak.
- [ ] “İlk Maratonunuza Nasıl Hazırlanırsınız?” yazısı 1.200+ kelime rehber formatına getirilecek.
- [ ] “Doğru Koşu Ayakkabısı Nasıl Seçilir?” yazısı tablo + SSS + kaynaklarla güçlendirilecek.
- [ ] “Kas Kütlesi Artırmak İçin 5 Altın Kural” yazısı kaynak ve sağlık uyarılarıyla güçlendirilecek.

## P1 - Meta ve Sayfa Kalitesi

- [x] Hakkımızda fallback meta description uzatıldı.
- [x] İletişim fallback meta description uzatıldı.
- [ ] CMS'teki Hakkımızda meta description fallback'i eziyorsa CMS alanı güncellenecek.
- [ ] CMS'teki İletişim meta description fallback'i eziyorsa CMS alanı güncellenecek.
- [ ] `twitter:site` için gerçek X/Twitter hesabı varsa eklenecek; yoksa hesap açma kararı verilecek.
- [ ] Organization telefon numarası placeholder ise gerçek numara ile değiştirilecek.
- [ ] Footer ve schema'daki NAP bilgisi aynı kaynak üzerinden doğrulanacak.

## P1 - Kategori ve Ürün İçerikleri

- [x] Kategori sayfalarında title/meta/canonical/hreflang üretimi var.
- [x] Kategori sayfalarında BreadcrumbList, CollectionPage ve FAQPage var.
- [x] Öncelikli kategori FAQ altyapısı eklendi.
- [ ] Kategori açıklamaları AI alıntılanabilir rehber metinleriyle güçlendirilecek.
- [ ] Ürün görsellerine açıklayıcı Türkçe alt text eklenecek.
- [ ] Kategori görsellerine açıklayıcı Türkçe alt text eklenecek.
- [ ] Spor kategorisiyle ilgisiz ürünler katalogdan/öne çıkanlardan temizlenecek.
- [ ] Product schema seller adı `multiprice` yerine gerçek mağaza adıyla iyileştirilecek.
- [ ] `priceValidUntil` otomatik ileri tarih mekanizması izlenecek.

## P2 - Teknik ve Güvenlik

- [x] HSTS aktif.
- [x] CSP Report-Only aktif.
- [x] Redirect zinciri tek ana production domain'e yönleniyor.
- [x] Görsellerde sabit oran/CLS azaltma düzenlemeleri yapıldı.
- [x] Nginx + Next.js security header tekrarları için Next tarafındaki `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` kaldırıldı. Canlı header deploy sonrası tekrar doğrulanacak.
- [ ] CSP report-only politikası test sonrası enforce moduna alınacak.
- [ ] Brotli için sunucu modül durumu ayrıca değerlendirilecek.
- [ ] Unsplash görselleri kritik alanlardan kendi CDN'e taşınacak.
- [ ] Rich Results Test Product sonucu manuel kontrol edilecek.
- [ ] Rich Results Test Article/BlogPosting sonucu manuel kontrol edilecek.

## P2 - Ölçüm ve Analytics

- [x] GA4 env/site setting fallback desteği var.
- [x] GTM env/site setting fallback desteği var.
- [x] Google Ads purchase label desteği var.
- [x] Meta Pixel env desteği var.
- [x] Funnel event endpoint canlı 200 dönecek şekilde tarih formatı düzeltildi.
- [x] Admin analytics overview query 500 hatası düzeltildi.
- [ ] GA4 e-ticaret eventleri gerçek kullanıcı akışında test edilecek.
- [ ] Blogdan ürün/kategori sayfalarına iç link tıklamaları ölçülecek.
- [ ] Tavsiye Bloğu Performansı için sepet öneri eventleri canlı gerçek akışta doğrulanacak.
- [x] `recommendation_add` event'i öneriden sepete ekleme için ayrıca işaretlenecek şekilde local kodda eklendi.

## P2 - Marka Otoritesi

- [x] LinkedIn profil/sirket URL'leri schema/footer sinyallerinde var.
- [x] YouTube kanalı canlı doğrulandı.
- [x] Şikayetvar profili canlı doğrulandı.
- [x] Wikidata kullanıcı sayfası ve şeffaflık notları hazırlandı.
- [ ] LinkedIn şirket sayfası manuel optimize edilecek.
- [ ] Haftalık LinkedIn paylaşım rutini başlatılacak.
- [ ] İlk 3 YouTube videosu yayınlanacak.
- [ ] Videolar ilgili blog yazılarına embed edilecek.
- [ ] Trustpilot veya benzeri inceleme profili oluşturulacak.
- [ ] Google Business Profile kaydı oluşturulacak veya düzeltilecek.
- [ ] Tüm off-site profillerde aynı marka adı, adres, telefon ve site URL'i kullanılacak.

## P3 - 30/90 Günlük İçerik Programı

- [ ] 2026 en iyi whey protein markaları rehberi.
- [ ] Yeni başlayanlar için kreatin rehberi.
- [ ] Kilo vermek için evde kullanılabilecek fitness ekipmanları.
- [ ] Kadınlar için koşu ayakkabısı seçim rehberi.
- [ ] Erkekler için koşu ayakkabısı seçim rehberi.
- [ ] Protein tozu, BCAA ve kreatin farkları.
- [ ] Sporcu besini satın alırken dikkat edilmesi gerekenler.
- [ ] Türkiye'de en çok tercih edilen spor ekipmanları veri raporu.
- [ ] Protein takviyeleri pillar sayfası.
- [ ] Koşu ekipmanları pillar sayfası.
- [ ] Ev fitness ekipmanları pillar sayfası.
- [ ] Outdoor spor ekipmanları pillar sayfası.

## Başarı Metrikleri

- [ ] GEO skoru yeniden ölçüldüğünde 50+.
- [ ] 30 gün sonunda GEO skoru 60+.
- [ ] En az 10 blog yazısında yazar, kaynak, schema ve SSS tamamlandı.
- [ ] En az 4 kategori sayfasında güçlü FAQPage içeriği aktif.
- [ ] Search Console index coverage hataları azalıyor.
- [ ] Organik trafik artış trendi başlıyor.
- [ ] ChatGPT/Perplexity test sorgularında Sportoonline içerikleri görünmeye başlıyor.

## Sonraki Uygulama Sırası

1. Blog içeriklerini gerçek rehber standardına yükselt.
2. CMS meta alanlarının fallback'i ezip ezmediğini kontrol et.
3. Header tekrarları ve CSP enforce işini tamamla.
4. Product/Article Rich Results manuel testlerini yap.
5. Off-site marka profillerini aynı NAP bilgisiyle güçlendir.
6. 30/90 günlük içerik planını CMS'e sırayla uygula.

*Not: Bu checklist eski audit raporundan türetildi; canlı deploy sonrası gerçek durumla çelişen “blog yok” gibi maddeler düzeltilmiştir.*
