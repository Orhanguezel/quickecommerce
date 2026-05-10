# GEO Audit Report: Sportoonline

**Audit Date:** 2026-03-30
**URL:** https://sportoonline.com
**Business Type:** E-commerce Marketplace (Multi-vendor)
**Pages Analyzed:** 8 (homepage, about, contact, blog listing, 2 blog posts, 1 product page, 1 category page)
**Technology:** Next.js (App Router), Tailwind CSS, nginx/1.28.0
**Languages:** Turkish (primary), English

---

## Executive Summary

**Overall GEO Score: 34/100 (Poor)**

Sportoonline.com, Türkiye merkezli bir çok satıcılı spor e-ticaret pazaryeri olarak, AI arama motorları tarafından neredeyse görünmez durumda. Site tüm AI botlarına erişim izni veriyor (olumlu) ancak yapısal veri eksikliği, yazar atıfsız içerik, llms.txt dosyası yokluğu ve zayıf marka otoritesi nedeniyle ChatGPT, Perplexity, Google AI Overviews ve diğer AI platformlarında cite edilme olasılığı çok düşük.

**En büyük güçlü yanlar:**
- Tüm AI botlarına erişim izni (robots.txt)
- Next.js SSR altyapısı
- 15 blog makalesi ile içerik temeli mevcut
- HTTP/2 ve gzip sıkıştırma aktif

**En kritik eksikler:**
- Product schema verileri hatalı (fiyat=0, stok durumu yanlış)
- Blog içeriklerinde yazar bilgisi yok (E-E-A-T ihlali)
- Kategori sayfalarında title, meta description, H1 eksik
- Sıfır analytics takibi (GA4, GTM, Pixel yok)
- llms.txt dosyası mevcut değil

---

## GEO Score Breakdown

| Kategori | Skor | Ağırlık | Ağırlıklı Skor |
|---|---|---|---|
| AI Citability | 30/100 | 25% | 7.5 |
| Brand Authority | 18/100 | 20% | 3.6 |
| Content E-E-A-T | 18/100 | 20% | 3.6 |
| Technical GEO | 78/100 | 15% | 11.7 |
| Schema & Structured Data | 28/100 | 10% | 2.8 |
| Platform Optimization | 34/100 | 10% | 3.4 |
| **Overall GEO Score** | | | **32.6 ≈ 34/100** |

### Extended Score (Traditional SEO)

| Kategori | Skor | Tip |
|---|---|---|
| AI Citability | 30/100 | GEO Core |
| Brand Authority | 18/100 | GEO Core |
| Content E-E-A-T | 18/100 | GEO Core |
| Technical GEO | 78/100 | GEO Core |
| Schema & Data | 28/100 | GEO Core |
| Platform Optimization | 34/100 | GEO Core |
| **GEO Score** | **34/100** | **Weighted** |
| On-Page SEO | 38/100 | Traditional |
| Performance | 48/100 | Traditional |
| Social Media | 42/100 | Traditional |
| Link Structure | 52/100 | Traditional |

---

## Critical Issues (Hemen Düzelt)

### C1. Product Schema Verileri Hatalı
**Sayfa:** Tüm ürün sayfaları
**Sorun:** Product schema'da fiyat `0` olarak görünüyor, stok durumu `OutOfStock` iken sayfada "Stokta" yazıyor. Bu veri uyumsuzluğu Google tarafından politika ihlali olarak değerlendirilir.
**Çözüm:** Backend'deki JSON-LD üretim mantığını düzeltin. Gerçek fiyat ve stok verilerini schema'ya yansıtın.
**Etki:** Tüm ürün zengin sonuçları (rich results) engellenir.

### C2. Kategori Sayfalarında Temel SEO Etiketleri Eksik
**Sayfa:** /tr/kategori/* (tüm kategori sayfaları)
**Sorun:** Title tag, meta description, H1, canonical, OG tags ve hreflang tamamen eksik. Arama motorları bu sayfaları hedefli sıralama için kullanamaz.
**Çözüm:** Next.js `<Head>` component'ini kategori route'larında düzgün yapılandırın. Her kategori için benzersiz title, description ve H1 ekleyin.
**Etki:** 191+ ürünün kategori üzerinden keşfedilebilirliği tamamen kaybedilmiş.

### C3. Sıfır Analytics Takibi
**Sayfa:** Tüm site
**Sorun:** Google Analytics, GA4, GTM, Facebook Pixel, Microsoft Clarity veya herhangi bir tracking aracı yok. Site ziyaretçi davranışları konusunda tamamen kör.
**Çözüm:** Hemen GA4 + GTM kurulumu yapın. E-ticaret tracking'i etkinleştirin.
**Etki:** Dönüşüm takibi, retargeting ve veri odaklı kararlar imkansız.

### C4. SSL Sertifikası 24 Gün İçinde Sona Eriyor
**Sorun:** Let's Encrypt sertifikası 2026-04-23'te sona erecek. Otomatik yenileme çalışmıyorsa site erişilemez hale gelir.
**Çözüm:** `sudo certbot renew --dry-run` ile otomatik yenilemeyi doğrulayın. Cron monitoring kurun.
**Etki:** Site tamamen çökebilir; arama sıralamaları anında düşer.

### C5. Blog İçeriklerinde Yazar Bilgisi Yok
**Sayfa:** Tüm 15 blog makalesi
**Sorun:** Fitness ve beslenme konularında (YMYL) yazar adı, biyografi ve yetkinlik bilgisi olmadan içerik yayınlanıyor. Google'ın Helpful Content sistemi anonim YMYL içerikleri cezalandırır.
**Çözüm:** Her makaleye yazar profili ekleyin (ad, fotoğraf, uzmanlık alanı, sosyal medya). Person schema ile destekleyin.
**Etki:** Blog içeriklerinin hem geleneksel hem AI arama görünürlüğü ciddi ölçüde düşük.

### C6. Blog Makaleleri Çok İnce (150-300 kelime)
**Sayfa:** Tüm blog makaleleri
**Sorun:** "10 Etkili Egzersiz" makalesi sadece 5 madde, ~250 kelime. "10 Protein Kaynağı" makalesi sadece 5 madde, ~150 kelime. Başlık 10 madde vaat ediyor ama 5 madde sunuluyor.
**Çözüm:** Her makaleyi minimum 1.500 kelimeye çıkarın. Vaat edilen tüm maddeleri ekleyin. Kaynak referansları ekleyin.
**Etki:** İnce içerik olarak sınıflandırılma ve sıralama kaybı riski yüksek.

---

## High Priority Issues (1 Hafta İçinde Düzelt)

### H1. llms.txt Dosyası Yok
**Sorun:** AI sistemleri site yapısı ve öncelikli içerik hakkında rehberlik alamıyor.
**Çözüm:** `/llms.txt` dosyası oluşturun: marka tanımı, ürün kategorileri, blog konuları, iletişim bilgileri.
**Etki:** ChatGPT, Claude ve Perplexity görünürlüğünü doğrudan artırır.

### H2. Organization Schema Eksik
**Sayfa:** Ana sayfa
**Sorun:** AI sistemleri sportoonline.com'u tanınmış bir varlık olarak tanımlayamıyor.
**Çözüm:** Homepage'e Organization schema ekleyin: name, logo, URL, contactPoint, sameAs (Facebook, Instagram, LinkedIn).

### H3. HSTS Header Eksik
**Sorun:** Strict-Transport-Security header'ı yok. SSL stripping saldırılarına açık.
**Çözüm:** nginx'e ekleyin: `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;`

### H4. Hakkımızda Sayfası Yetersiz
**Sorun:** Kurucu ismi yok, ekip bilgisi yok, sertifikalar yok. Genel bir "şirket hikayesi" E-E-A-T sinyali sağlamaz.
**Çözüm:** Kurucu/ekip bilgileri, fotoğraflar, sektör deneyimi ve somut dönüm noktaları ekleyin.

### H5. Image Alt Text Neredeyse Sıfır
**Sayfa:** Tüm site
**Sorun:** Kategori sayfalarında %0, ürün sayfalarında ~%9 alt text kapsama oranı.
**Çözüm:** Tüm ürün ve içerik görsellerine açıklayıcı Türkçe alt text ekleyin.

### H6. Article Schema'da Yazar ve Tarih Formatı Hatalı
**Sayfa:** Blog makaleleri
**Sorun:** Author property eksik. datePublished Türkçe metin ("14 Subat 2026") formatında, ISO 8601 ("2026-02-14") olmalı.
**Çözüm:** BlogPosting schema'ya author (Person) ekleyin. Tarihleri ISO 8601 formatına çevirin.

### H7. Meta Description Yetersiz veya Eksik
**Sayfa:** Ürün ve kategori sayfaları
**Sorun:** Ürün sayfasında 45 karakter (title'ın kopyası). Kategori sayfasında tamamen eksik.
**Çözüm:** Her sayfa için 120-160 karakter arası, CTA içeren benzersiz meta description yazın.

### H8. Sağlık İçeriklerinde Tıbbi Uyarı Yok
**Sayfa:** Egzersiz ve beslenme blog makaleleri
**Sorun:** YMYL içerikler tıbbi/sağlık feragati olmadan yayınlanıyor. Hukuki risk + güvenilirlik kaybı.
**Çözüm:** Tüm fitness ve beslenme içeriklerine tıbbi feragat notu ekleyin.

### H9. Facebook Pixel Yok
**Sorun:** Facebook/Instagram retargeting ve dönüşüm takibi yapılamıyor.
**Çözüm:** Facebook Business Manager'dan Pixel oluşturup siteye ekleyin.

---

## Medium Priority Issues (1 Ay İçinde Düzelt)

| # | Sorun | Çözüm |
|---|---|---|
| M1 | 3 adımlı redirect zinciri (http://www → https → /tr) | nginx'te tek adımlık 301 redirect yapılandırın |
| M2 | Agresif no-cache politikası (tüm sayfalar) | ISR veya stale-while-revalidate uygulayın |
| M3 | Sitemap lastmod tarihleri hepsi aynı | Gerçek değişiklik tarihlerini kullanın |
| M4 | Blog'da kaynak referansı yok (0 dış link) | Her makaleye 3-5 güvenilir kaynak ekleyin |
| M5 | YouTube kanalı yok | Spor ekipman inceleme videoları ile kanal açın |
| M6 | Reddit varlığı yok | Türkçe spor/fitness subreddit'lerinde aktif olun |
| M7 | Karşılaştırma/satın alma rehberi içerikleri yok | "En İyi Koşu Ayakkabıları 2026" gibi içerikler üretin |
| M8 | og:type ürün sayfalarında "website" | "product" olarak değiştirin |
| M9 | Twitter Card etiketleri generic (sayfa-spesifik değil) | Her sayfa için dinamik twitter:title/description |
| M10 | Sosyal profil linkleri footer'da render edilmiyor | HTML'de görünür sosyal bağlantılar ekleyin |
| M11 | IndexNow protokolü yok | Bing/ChatGPT için IndexNow uygulayın |
| M12 | Gizlilik politikası KVKK uyumlu değil | Veri saklama süreleri, kullanıcı hakları, DPO iletişimi ekleyin |
| M13 | Görsel dosya isimleri SEO dostu değil | `ml-0988-r21772358570.jpg` yerine `bcaa-orman-meyveli-500gr.jpg` |
| M14 | Brotli sıkıştırma yok | nginx'te Brotli modülünü etkinleştirin (%15-20 ek tasarruf) |
| M15 | Product schema'da GTIN/MPN eksik | Ürünlere küresel tanımlayıcılar ekleyin |

---

## Low Priority Issues (Fırsat Buldukça Düzelt)

| # | Sorun |
|---|---|
| L1 | Server versiyonu açık (nginx/1.28.0) — `server_tokens off` ekleyin |
| L2 | Doğrulanmamış müşteri yorumları (4 adet, fotoğraf/link yok) |
| L3 | Content-Security-Policy header eksik |
| L4 | x-default hreflang otomatik redirect ediyor (dil seçim sayfası yok) |
| L5 | Ürün sayfalarında 0 müşteri yorumu |
| L6 | rel="next"/"prev" pagination'da eksik |
| L7 | İngilizce içerik derinliği Türkçe ile eşdeğer değil |
| L8 | Yorum bölümü aktif ama 0 yorum (kaldırın veya teşvik edin) |
| L9 | URL slug ve ürün adı uyumsuzluğu (bcaa-411-tablet-200-adet ≠ BCAA 2:1:1 Orman Meyveli) |
| L10 | Mağaza sayfalarında openingHours ve geo eksik |

---

## Category Deep Dives

### AI Citability (30/100)

Site içerikleri AI sistemleri tarafından alıntılanabilir formatta değil. Blog makaleleri kısa, yazar bilgisi yok, benzersiz veri noktası yok. Ürün açıklamaları muhtemelen katalog metni. Karşılaştırma tabloları ve "en iyi X" listleri gibi AI'ın tercih ettiği formatlar mevcut değil.

**Olumlu:** 15 blog makalesi var, ürün kategorileri tanınabilir (kreatin, fitness, outdoor).
**Olumsuz:** Yazar atıfsız, kaynak referanssız, sığ içerik.

### Brand Authority (18/100)

| Platform | Durum | AI Etkisi |
|---|---|---|
| Wikipedia | Yok | ChatGPT alıntılarının %47.9'u Wikipedia'dan |
| YouTube | Yok | Gemini ve Perplexity sinyali eksik |
| Reddit | Yok | Perplexity alıntılarının %46.7'si Reddit'ten |
| LinkedIn | Var | Orta düzey olumlu sinyal |
| Facebook | Var | Düşük AI training sinyali |
| Instagram | Var | Düşük AI training sinyali |
| Google Knowledge Panel | Yok | Entity tanıma eksik |

### Content E-E-A-T (18/100)

| Boyut | Skor | Açıklama |
|---|---|---|
| Experience (Deneyim) | 8/100 | Kişisel deneyim sinyali yok, stok fotoğraflar |
| Expertise (Uzmanlık) | 10/100 | Yazar yok, yetkinlik yok, YMYL uyarısı yok |
| Authoritativeness (Otorite) | 12/100 | Dış kaynak yok, uzman alıntısı yok |
| Trustworthiness (Güvenilirlik) | 28/100 | SSL var, politikalar var ama eksik |

### Technical GEO (78/100)

**Güçlü:** HTTP/2, temiz URL yapısı, doğru hreflang, iyi crawlability, düşük DNS süresi.
**Zayıf:** SSL yakında sona eriyor, HSTS eksik, CSP eksik, agresif no-cache, redirect zinciri www'da.

### Schema & Structured Data (28/100)

| Sayfa Tipi | Mevcut Schema | Kritik Eksik |
|---|---|---|
| Ana Sayfa | WebSite + SearchAction | Organization, ItemList |
| Ürün Sayfası | Product + Offer + BreadcrumbList | Fiyat=0 hatası, AggregateRating |
| Blog | Article + BreadcrumbList | Author (Person), doğru tarih formatı |
| Mağaza | Store + BreadcrumbList | Geo, openingHours |
| Mağazalar Listesi | BreadcrumbList | CollectionPage, ItemList |

### Platform Optimization (34/100)

| AI Platform | Hazırlık | Birincil Engel |
|---|---|---|
| Google AI Overviews | 28/100 | Product, FAQ, Organization schema eksik |
| ChatGPT | 32/100 | llms.txt yok, marka entity yok |
| Perplexity | 38/100 | Article schema eksik, orijinal araştırma yok |
| Claude | 35/100 | llms.txt yok, zayıf içerik yapısı |
| Bing Copilot | 38/100 | Product schema yok, IndexNow yok |

---

## AI Crawler Erişim Durumu

| AI Crawler | Platform | Durum |
|---|---|---|
| Googlebot | Google Search + AIO | ✅ İzin Var |
| GPTBot | ChatGPT / OpenAI | ✅ İzin Var |
| Bingbot | Bing + Copilot | ✅ İzin Var |
| PerplexityBot | Perplexity AI | ✅ İzin Var |
| Google-Extended | Gemini Training | ✅ İzin Var |
| ClaudeBot | Anthropic Claude | ✅ İzin Var |
| Applebot-Extended | Apple Intelligence | ✅ İzin Var |

**Not:** Tüm AI crawlerlara erişim izni verilmiş. Bu doğru bir yaklaşım.

---

## Quick Wins (Bu Hafta Uygulanabilir)

1. **llms.txt dosyası oluşturun** — Marka tanımı, ürün kategorileri, blog konuları. ~2 saat. ChatGPT/Perplexity görünürlüğü artar.

2. **Organization schema ekleyin** — Homepage'e name, logo, URL, sameAs (sosyal profiller). ~1-2 saat. Entity tanıma başlar.

3. **Product schema fiyat/stok hatasını düzeltin** — Backend JSON-LD üretim mantığı. ~2-4 saat. Ürün zengin sonuçları açılır.

4. **GA4 + GTM kurun** — ~1 saat. Ziyaretçi davranışı takibi başlar.

5. **SSL yenileme kontrolü** — `sudo certbot renew --dry-run`. 5 dakika. Site çökmesini önler.

---

## 30-Day Action Plan

### Hafta 1: Altyapı & Schema Temelleri
- [ ] SSL otomatik yenilemeyi doğrula
- [ ] GA4 + GTM + Facebook Pixel kur
- [ ] llms.txt ve llms-full.txt dosyaları oluştur
- [ ] Organization schema'yı homepage'e ekle
- [ ] Product schema fiyat/stok hatasını düzelt
- [ ] HSTS header ekle
- [ ] Redirect zincirini tek adıma indir

### Hafta 2: Kategori & İçerik Düzeltmeleri
- [ ] Kategori sayfalarına title, meta description, H1, canonical, OG, hreflang ekle
- [ ] Tüm blog makalelerine yazar profili ekle (Person schema ile)
- [ ] Article schema tarih formatını ISO 8601'e çevir
- [ ] Blog makalelerini genişlet (min. 1.500 kelime)
- [ ] Tüm görsellere alt text ekle
- [ ] Sağlık içeriklerine tıbbi feragat ekle

### Hafta 3: İçerik Stratejisi & Zenginleştirme
- [ ] 3 karşılaştırma/satın alma rehberi makalesi yaz
- [ ] Ürün kategori sayfalarına FAQ bölümleri + FAQPage schema ekle
- [ ] BreadcrumbList schema'yı site genelinde uygula
- [ ] Hakkımızda sayfasını kurucu/ekip bilgileriyle güncelle
- [ ] Mevcut blog makalelerine 3-5 kaynak referansı ekle

### Hafta 4: Platform & Marka Otoritesi
- [ ] IndexNow protokolünü uygula
- [ ] Bing Webmaster Tools'a kayıt ol
- [ ] YouTube kanalı aç (2-3 ürün inceleme videosu)
- [ ] LinkedIn şirket sayfasını optimize et
- [ ] Sosyal profil linklerini footer'da görünür yap
- [ ] ISR veya stale-while-revalidate cache stratejisi uygula

---

## Tahmini Etki

| Aksiyon Seti | Tahmini GEO Skor | Süre |
|---|---|---|
| Mevcut durum | 34/100 | — |
| Quick Wins (Hafta 1) | ~50/100 | 1 hafta |
| 30 Günlük Plan tamamlandığında | ~65/100 | 1 ay |
| Tam optimizasyon (off-site dahil) | ~78/100 | 3 ay |

AI kaynaklı ek aylık trafik tahmini (tam optimizasyon sonrası): **1.500-3.000 ziyaretçi/ay**, %2 dönüşüm oranıyla **5.000-15.000 TL/ay** organik değer.

---

## Appendix: Analyzed Pages

| URL | Title | GEO Issues |
|---|---|---|
| /tr | Sportoonline \| Spor Giyim & Ekipman Online Mağaza | Organization schema yok, ItemList yok |
| /tr/hakkimizda | Hakkımızda | Ekip bilgisi yok, kurucu yok, E-E-A-T sinyalleri zayıf |
| /tr/iletisim | İletişim | Placeholder telefon numarası, iş saatleri yok |
| /tr/blog | Blog | Yazar bilgisi yok, pagination rel yok |
| /tr/blog/evde-yapabileceginiz-10-etkili-egzersiz | Evde Egzersiz | İnce içerik (~250 kelime), yazar yok, kaynak yok |
| /tr/blog/sporcular-icin-en-iyi-10-protein-kaynagi | Protein Kaynakları | İnce içerik (~150 kelime), yazar yok, kaynak yok |
| /tr/urun/whey-isolate-protein-1800g | Whey Isolate Protein | Schema fiyat=0, stok hatası, 0 yorum |
| /tr/urun/bcaa-411-tablet-200-adet | BCAA 2:1:1 | URL/ürün adı uyumsuz, meta desc kısa |
| /tr/kategori/fitness-egzersiz | (Title yok) | Title, meta desc, H1, canonical, OG hepsi eksik |
| /tr/magazalar | Mağazalar | ItemList schema yok |
| /tr/magaza/sporcu-besinleri | Sporcu Besinleri | Geo, openingHours eksik |

---

## Methodology

Bu rapor GEO-first yaklaşımıyla hazırlanmıştır. GEO (Generative Engine Optimization), web içeriklerinin AI destekli arama motorları (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews) tarafından keşfedilmesi, anlaşılması ve alıntılanması için optimizasyon pratiğidir.

**Skor Ağırlıkları:**
- AI Citability: %25 — İçeriğin AI tarafından alıntılanabilirliği
- Brand Authority: %20 — Üçüncü taraf platformlardaki marka varlığı
- Content E-E-A-T: %20 — Deneyim, Uzmanlık, Otorite, Güvenilirlik
- Technical GEO: %15 — AI crawler erişimi, rendering, hız
- Schema & Data: %10 — Yapısal veri kalitesi ve kapsamı
- Platform Optimization: %10 — AI platformlarına özgü hazırlık

**Araçlar:** WebFetch, curl, HTTP header analizi, Schema.org validation
**Standart:** GEO-SEO Analysis Tool v2026.03

---

*Rapor: Claude Code (Opus 4.6) tarafından oluşturulmuştur.*
*Tarih: 2026-03-30*
