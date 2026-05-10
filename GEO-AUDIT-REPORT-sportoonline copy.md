# GEO Audit Raporu: Sportoonline

**Denetim Tarihi:** 2026-05-10  
**URL:** https://sportoonline.com  
**İşletme Türü:** Çok Satıcılı Spor Ürünleri Pazaryeri  
**Analiz Yöntemi:** curl ham HTML + fetch_page.py (Scrapling) — build sonrası canlı kontrol

> **2026-05-10 kontrol notu:** Bu rapor, `SPORTOONLINE-GEO-YOL-HARITASI-CHECKLIST.md`
> ile birebir karşılaştırılmadan okunmamalı. Checklist'teki birçok P0/P1 madde
> zaten uygulanmış. Aşağıdaki "eksik" maddelerin bir kısmı gerçek kod eksigi
> değil; canlı deploy/env, CMS içeriği veya audit yorumu farkından kaynaklanıyor.
>
> Net canlı bulgu: `NEXT_PUBLIC_SITE_URL=http://localhost:3003` değeri canlı
> Organization JSON-LD içinde `url:"http://localhost:3003"` olarak görünmüş.
> Bu, kod yapılmış olsa bile entity/canonical sinyalini bozduğu için raporda
> "olmamış" gibi görünebilir. Kod tarafında SEO URL sabiti localhost değerini
> production domain'e normalize edecek şekilde düzeltildi.

---

## Genel GEO Skoru: 37/100 — Kritik (üst sınır)

Site teknik altyapısını büyük ölçüde doğru kurmuş. Tüm sayfalar title/meta/canonical içeriyor; schema kapsamı iyi; robots.txt, sitemap ve llms.txt production'da çalışıyor. Skoru aşağı çeken iki ana etken: **blog içeriği yok** (AI alıntı için birincil kaynak) ve **birkaç yapısal schema/meta hatası**.

| Kategori | Skor | Ağırlık | Ağırlıklı |
|---|---|---|---|
| AI Citability | 32/100 | %25 | 8.0 |
| Brand Authority | 22/100 | %20 | 4.4 |
| Content E-E-A-T | 28/100 | %20 | 5.6 |
| Technical GEO | 68/100 | %15 | 10.2 |
| Schema & Structured Data | 60/100 | %10 | 6.0 |
| Platform Optimization | 28/100 | %10 | 2.8 |
| **GEO Skoru** | | | **37/100** |

---

## Sayfa Bazlı Mevcut Durum

| Sayfa | Title | Meta Desc | Canonical | Schema |
|---|---|---|---|---|
| /tr (Ana Sayfa) | ✅ | ✅ | ✅ | Organization, WebSite |
| /tr/urun/[slug] | ✅ | ✅ | ✅ | Organization, **Product**, BreadcrumbList |
| /tr/kategori/[slug] | ✅ | ✅ | ✅ | Organization, BreadcrumbList, **CollectionPage**, **FAQPage** |
| /tr/hakkimizda | ✅ | ⚠️ zayıf | ✅ | Organization, **AboutPage** |
| /tr/iletisim | ✅ | ⚠️ zayıf | ✅ | Organization |
| /tr/blog | ✅ | ✅ | ✅ | Organization, BreadcrumbList |
| robots.txt | ✅ Tüm AI crawler'lar izinli | | | Sitemap directive doğru |
| sitemap.xml | ✅ 2236 URL | | | Production URL'ler |
| llms.txt | ✅ Doğru URL'ler | | | İyi yapı |

---

## Tespit Edilen Gerçek Sorunlar

### Yüksek Öncelik

**1. og:url Tüm Sayfalarda Eksik**  
6 OG tag var (title, description, site_name, locale, image, type) ama `og:url` her sayfada eksik. Facebook, WhatsApp ve AI sistemleri canonical URL için bu tag'e bakıyor.  
Düzeltme — her sayfanın `generateMetadata()` içine:
```typescript
openGraph: { url: `https://sportoonline.com/${locale}/urun/${slug}` }
```

**2. twitter:site Eksik**  
Twitter/X kartı var ama `@handle` yok. Twitter hesabı mevcutsa ekle; yoksa oluştur.

**3. WebSite Schema — url Lokale Kilitli**
```json
// Mevcut (yanlış):
"url": "https://sportoonline.com/tr"
// Olması gereken:
"url": "https://sportoonline.com"
```
WebSite schema sitenin kök domain'ini temsil etmeli; `/tr` ile Google Sitelinks Search Box sinyali zayıflıyor.

**4. Blog — 0 Yayımlanmış İçerik**  
Blog sayfası var, BreadcrumbList schema var, meta tag var. Ama 0 yazı. AI alıntılanabilirliğinin en büyük açığı burada — ürün sayfaları alıntılanmaz, rehber içerikler alıntılanır.

---

### Orta Öncelik

**5. Organization sameAs — LinkedIn URL Yorumu**
```json
// Mevcut: ikisi aynı anda var
"https://www.linkedin.com/in/sporto-online-965632409/"   // ← Checklist'e göre bilinçli eklenmiş profil
"https://www.linkedin.com/company/sportoonline"          // ← Doğru olan
```
Bu madde "yapılmadı" olarak sayılmamalı. Organization entity için şirket sayfası
daha güçlü sinyal verir; `/in/` profilinin kalması ise doğrulanmış off-site profil
stratejisi olarak checklist'te işaretlenmiş. Risk varsa "optimizasyon" maddesi
olarak ele alınmalı, P0/P1 eksik sayılmamalı.

**6. Organization Telefonu Placeholder Formatı**  
`+90 212 555 0 123` — Türkiye'de 555 alanı gerçek bir kodu temsil etmiyor, placeholder formatı. Schema'yı ve görünen telefonu gerçek numara ile güncelle.

**7. Organization Adresi — Eksik Alanlar + İngilizce**
```json
// Mevcut:
"streetAddress": "Levent Mah. Buyukdere Cad. No:185, Sisli, Istanbul, Turkey"
// Olması gereken:
"streetAddress": "Levent Mah. Büyükdere Cad. No:185",
"addressLocality": "Şişli",
"addressRegion": "İstanbul",
"postalCode": "34394",
"addressCountry": "TR"
```
`postalCode` ve `addressRegion` eksik; LocalBusiness schema eligibility için zorunlu.

**8. Güvenlik Header Tekrarı**  
`x-frame-options`, `x-content-type-options`, `referrer-policy` response'da 2 kez geliyor — Next.js ve Nginx katmanı ikisi birden ekliyor. Teknik sorun değil ama HTTP spec açısından yanlış. `next.config.js`'deki `headers()` bölümünü temizle.

Kontrol notu: canlı header'da tekrar hâlâ var. Bu, uygulama kodunun "yapılmamış"
olmasından çok Nginx + Next.js katmanlarının aynı başlığı eklemesinden kaynaklanıyor.
Tekrarsız sonuç için tek kaynak seçilmeli; tercihen production Nginx'te bırakılıp
Next `headers()` tarafındaki aynı security header'ları kaldırılmalı.

**9. CSP Sadece Report-Only**  
`Content-Security-Policy-Report-Only` logluyor ama bloklamıyor. Policy (`default-src 'self'; object-src 'none'`) iyi tasarlanmış; test edip `Content-Security-Policy` olarak aktifleştir.

**10. Hakkımızda ve İletişim Meta Desc Zayıf**

| Sayfa | Mevcut | Karakter |
|---|---|---|
| Hakkımızda | "Sporto Online hakkında bilgi edinin" | 36 |
| İletişim | "Sporto Online ile iletişime geçin" | 34 |

Her ikisi de SERP'te snippet oluşturulamayacak kadar kısa. 140-160 karakter hedefle.

Kod notu: fallback TR/EN meta description metinleri 2026-05-10'da uzatıldı. Eğer
canlıda hâlâ kısa görünüyorsa CMS'teki `meta_description` alanı fallback'i eziyor
olabilir veya yeni build henüz deploy edilmemiş olabilir.

---

## Checklist'e Göre Zaten Tamamlanmış Olanlar

Aşağıdaki maddeler bu raporda tekrar "eksik" gibi görünse de checklist ve kod
kontrolüne göre tamamlanmış kabul edilmeli:

- `llms.txt`, `llms-full.txt`, AI crawler robots direktifleri.
- Organization JSON-LD varlığı ve temel `name`, `url`, `logo`, `contactPoint`, `sameAs`, `address` alanları.
- Product JSON-LD fiyat, stok, açıklama, `priceValidUntil`, koşullu `aggregateRating`.
- BlogPosting `author`, ISO tarih, Person schema ve yazar profil route'u.
- Kategori title/meta/canonical/hreflang, BreadcrumbList, CollectionPage, FAQPage.
- Sitemap ürün/kategori kapsaması, `sitemap_index.xml`, IndexNow endpoint ve key dosyası.
- GA4, GTM, Google Ads ve Pixel kod desteği.
- HSTS ve CSP Report-Only.

## Hâlâ Gerçekten Kalan / Operasyonel Maddeler

- Blog içerikleri hâlâ kaynak, uzunluk ve rehber formatı açısından zayıf: 3-5 güvenilir kaynak, 1000+ kelime, özet cevap, tablo ve SSS gerekiyor.
- Google/Bing Search Console panel durumları manuel/API ile doğrulanmalı.
- Google Merchant Center uyarısı için feed-site-politika uyumu ve yeniden inceleme süreci devam ediyor.
- Off-site authority tarafında LinkedIn şirket sayfası optimizasyonu, YouTube videoları, Trustpilot/Google Business Profile işleri operasyonel olarak kalıyor.
- Canlı Nginx + Next security header tekrarları tek katmana indirilmeli.
- Canlı env/deploy kontrolü: `NEXT_PUBLIC_SITE_URL` production'da localhost olmamalı. Kod normalize edildi, fakat deploy sonrası canlı HTML tekrar kontrol edilmeli.

---

### Düşük Öncelik

**11. Ürün Schema — AggregateRating Yok**  
Şu an değerlendirme olmadığı için normal; ama ilk değerlendirme geldiğinde schema altyapısı hazır olsun.

**12. Katalog Tutarsızlığı**  
"En İyi Fırsatlar" bölümünde iPhone 15/16 ekran koruyucusu, 20W şarj cihazı ve "Hazır E-Ticaret Sitesi Kurulumu" ürün olarak görünüyor. Spor kategorisiyle alakasız bu ürünler AI sistemlerinin site tanımlamasını karıştırıyor.

**13. Product schema seller adı: "multiprice"**  
Satıcı adı branded değil; dükkân ismi ile değiştirilmeli.

**14. priceValidUntil — Ağustos 2026**  
3 ay içinde ürün schema'daki `priceValidUntil` süresi dolacak; otomatik güncelleme mekanizması kur.

**15. Hero Görseller Unsplash CDN'den**  
`images.unsplash.com` üçüncü taraf bağımlılığı; LCP için kendi CDN'ine taşı.

---

## Schema Tamamlık Özeti

| Schema | Durum | Kapsam |
|---|---|---|
| Organization | ✅ (3 düzeltme gerekiyor) | Tüm sayfalar |
| WebSite + SearchAction | ✅ (url düzeltme gerekiyor) | Ana sayfa |
| Product + Offers | ✅ | Ürün detay |
| BreadcrumbList | ✅ | Ürün + kategori + blog |
| CollectionPage | ✅ | Kategori |
| FAQPage | ✅ (2 FAQ mevcut) | Kategori |
| AboutPage | ✅ | Hakkımızda |
| Article/BlogPosting | ❌ | Blog boş |
| AggregateRating | ❌ | Değerlendirme yok |
| ContactPage | ❌ | İletişim sayfası |

---

## Öncelikli Aksiyon Planı

### Bu Hafta (kod değişikliği az)
1. `og:url` — tüm `generateMetadata()` çağrılarına `openGraph.url` ekle
2. WebSite schema `url` → `https://sportoonline.com` (kök)
3. Organization sameAs — `/in/sporto-online-965632409/` çıkar
4. Güvenlik header tekrarını gider (next.config.js)
5. Hakkımızda + İletişim meta desc'leri 140+ karaktere çıkar

### Önümüzdeki 2 Hafta (içerik)
6. İlk 3 blog yazısı: 1000+ kelime, yazarlı, tarihli
7. Organization telefon + adres (postalCode, addressRegion) gerçek değerlerle güncelle
8. CSP enforce moduna geçir

### 1 Ay (kademeli)
9. AggregateRating schema altyapısı (değerlendirme geldiğinde otomatik devreye girsin)
10. Katalog tutarsız ürünleri gözden geçir
11. Unsplash hero → kendi CDN
12. IndexNow (Bing) implementasyonu

---

## Ek: Veri Doğrulama Notu

Önceki iki analiz build sırasında yapılmıştı (502 yanıtları, eksik meta). Bu rapor build tamamlandıktan sonra canlı siteye karşı çalıştırıldı.

*Rapor: geo-seo-claude GEO Audit — Sportoonline v3.0 — 2026-05-10*
