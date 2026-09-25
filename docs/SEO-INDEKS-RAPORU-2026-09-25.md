# Sportoonline — İndeksleme ve SEO Sorunları Raporu (2026-09-25)

**Kaynaklar**

1. Google Search Console "Sayfa dizine ekleme" dışa aktarımı
   (`https___sportoonline.com_tr_-Coverage-2026-09-25.zip`, veri 2026-06-27 → 2026-09-21)
2. Tanitio SEO analiz kataloğu (`sportoonline-seo-katalog (1).pdf`, 199 sayfa, 10 sayfalık örneklem, 1165 kontrol satırı)
3. Bu rapor için yapılan **canlı doğrulama**: sitemap'ler, ~550 URL'nin HTTP durumu,
   canonical/robots/başlık taraması ve canlı veritabanı sayımları (vps-sportoonline, salt okunur)

> GSC dışa aktarımında **örnek URL yok**, yalnız sayılar var. Hangi URL grubunun hangi
> GSC kovasına düştüğü bu yüzden canlı veriyle çıkarıldı; her bulguda kanıt belirtildi.

---

## 1. Yönetici özeti

| Gösterge | Değer | Yorum |
|---|---|---|
| Dizine eklenen | **11.753** (zirve 11.816, 29 Ağu) | Ağustos sonundan beri düşüyor |
| Dizine eklenmeyen | **3.736** (3.052 → 3.736, +%22 son 1 ayda) | Artıyor |
| Günlük gösterim | Haz sonu ort. **378** → Eylül ort. **257** | **−%32** |
| Sitemap'teki URL | **6.643** (6.572 ürün + 71 statik) | Google'ın bildiği ~15.500 URL'nin yarısından az |
| Canlı DB ürün | 13.534 silinmemiş, **yalnız 6.572'si satılabilir** | **6.962 ürün satışta değil ama sayfası 200 + indekslenebilir** |

**Ana teşhis:** Sorun tek bir teknik hata değil, **katalog ile indeks arasındaki kopukluk**.
Google, sitemap'te olmayan, satışta olmayan, "Tükendi" yazan ~7.000 ürün sayfasını
hâlâ indekslenebilir (200, `robots` yok) olarak görüyor. Bunlara ek olarak satılabilir
ürünlerin üçte biri ince/kopya açıklama taşıyor. Google bu düşük değerli sayfa kütlesini
"Tarandı – şu anda dizine eklenmiş değil" kovasına atıyor ve sitenin genel kalite
sinyali düşüyor; gösterim kaybı bununla uyumlu.

İkinci büyük bulgu SEO'nun ötesinde: **Mesafeli Satış Sözleşmesi sayfası Üye
Sözleşmesi metnini gösteriyor** (%99 aynı metin). Bu yasal bir eksik (6502 sayılı
Kanun / Mesafeli Sözleşmeler Yönetmeliği) ve ödeme kuruluşu / Merchant Center
denetiminde sorun çıkarır.

---

## 2. Google Search Console — kova kova analiz

GSC "Önemli sorunlar" tablosu:

| # | Sebep | Sayfa | Doğrulama | Gerçek sorun mu? | Kök neden (canlı kanıt) |
|---|---|---|---|---|---|
| G1 | Tarandı – şu anda dizine eklenmiş değil | **1.720** | Başarısız | **EVET — en büyük** | Satışta olmayan 6.962 ürünün 200 "Tükendi" sayfası + 2.068 ince açıklamalı + 1.573 kopya açıklamalı satılabilir ürün (bkz. §3.1, §3.2) |
| G2 | Bulunamadı (404) | **1.061** | Başarısız | Kısmen | Katalogdan silinen ürünler. Temmuz listesindeki 120 örnekten **104'ü artık 410**, 15'i 200 (geri gelmiş), 1'i 404. 410 dönen URL'ler GSC'de yine "404" kovasında görünür — **beklenen durum**, indeksten düşmeleri zaman alır. |
| G3 | Doğru standart etikete sahip alternatif sayfa | **751** | Başarısız | Hayır (bilgi) | `?page=`, `?sort=`, `?flash_sale_id=` gibi parametreli URL'ler canonical ile ana sayfaya bağlanıyor. Tek düzeltilecek kısım: sayfalamanın canonical'ı (bkz. S7) |
| G4 | Keşfedildi – şu anda dizine eklenmiş değil | 79 | Başlatılmadı | Evet | Zayıf iç bağlantı: kategori sayfaları SSR'da yalnız 20 ürün basıyor, sayfalama linki yok (sonsuz kaydırma) |
| G5 | "noindex" etiketi tarafından hariç tutuldu | 60 | Başlatılmadı | Hayır | `/tr/ara?q=…` arama sayfaları (bilinçli `noindex, follow`) — ana sayfadaki popüler arama çiplerinden linkleniyor |
| G6 | Yönlendirmeli sayfa | 50 | Başlatılmadı | Hayır | `/en/*` → `/tr/*` 308, 113 slug yönlendirmesi, `/` → `/tr`, www → kök. Hepsi doğru çalışıyor |
| G7 | Kullanıcı tarafından seçilen standart sayfa olmadan kopya | **7** | Başlatılmadı | **EVET** | Sitemap'te birebir kopya sayfa çiftleri (bkz. S4) |
| G8 | Robots.txt tarafından engellendi | 6 | Başlatılmadı | Hayır | `/tr/destek`, `/tr/giris`, `/tr/favorilerim` vb. — bilinçli engel |
| G9 | Sunucu hatası (5xx) | 1 | Başlatılmadı | İzle | Paralel taramada 2 geçici zaman aşımı gözlendi, tekrarda 200. Tekil olay |
| G10 | Kopya, Google farklı standart seçti | 1 | Başlatılmadı | Evet | Büyük olasılıkla `/tr/paket` (canonical'ı 301 dönen köke işaret ediyor, bkz. S5) |

**Doğrulama notu:** G1/G2/G3 için GSC'de "Düzeltmeyi doğrula" başlatılmış ve
"Başarısız" olmuş. G2 ve G3 bir hata değil — kaldırılmış ürün 404/410 dönmeye devam
ettikçe, parametreli URL canonical taşıdıkça doğrulama **her zaman** başarısız olur.
Bu iki kova için doğrulama tekrar başlatılmamalı. G1 doğrulaması ancak §3.1–3.2
düzeltmeleri canlıya çıktıktan sonra başlatılmalı.

**Trend:** 25 Tem'de dizine eklenmeyen +538 (en locale'in kaldırılması, `/en/*` → 308),
5 Eyl'de +510 (katalog küçülmesi: Temmuz'da 10.632 satılabilir ürün vardı, bugün 6.572).

---

## 3. Kök nedenler — ayrıntı

### 3.1 Satışta olmayan 6.962 ürün indekslenebilir "Tükendi" sayfası (KRİTİK)

Canlı DB (2026-09-25):

| Grup | Adet | Canlı yanıt (75 örnek) |
|---|---|---|
| Ürün `status != approved` (admin pasife almış) | 472 | 200, `robots` yok, "Tükendi" |
| Mağazası kapalı/askıda (`stores.status != 1` veya `sales_suspended_at`) | 2.914 | 200, `robots` yok, "Tükendi" |
| Mağaza açık ama geçerli varyant/fiyat/stok yok | 3.576 | 200, `robots` yok, "Tükendi" |

Mağaza bazında en büyük kaynaklar: Linktech 1.740 (mağaza st=2), EYB 985, Provitanya 914,
Rova Batarya 528 (st=2), BodyFit 436, eProtein 431 (st=0), Maraton 317, ProteinMax 283,
Speedwa 272, Dekomum 216 (st=2).

- Bu sayfaların hiçbiri sitemap'te değil (sitemap `publiclySellable()` ile üretiliyor),
  ama Google onları geçmişten biliyor ve 200 aldığı için indeks adayı sayıyor.
- Ürün şeması doğru şekilde `OutOfStock` diyor; sayfa yine de `index` durumda.
- **Admin'in pasife aldığı ürün herkese açık kalıyor** — bu SEO dışı bir iş kuralı hatası da.
- Kaynak: `customer-web-nextjs/src/app/[locale]/urun/[slug]/page.tsx` — `robots`
  yalnız çevirisi olmayan locale için `noindex` üretiyor; satılabilirliğe bakmıyor.
  410 listesi (`/api/v1/sitemap/gone-products`) yalnız soft-delete edilmiş 1.739 ürünü kapsıyor.

### 3.2 İnce ve kopya ürün içeriği (YÜKSEK)

6.572 satılabilir üründen:

- **2.068 (%31)** açıklaması 150 karakterden kısa veya boş
- **25** açıklaması ürün adının aynısı (örn. Boodun Luminous Bisiklet Eldiveni: `description` = ad)
- **1.573** ürün, açıklamasını en az bir başka ürünle birebir paylaşıyor (varyant kopyaları: "1 Adet / 20 Adet" gibi)
- Açıklamalar tedarikçi sitelerinden kazındığı için web'de zaten var olan metin — Google açısından özgün değer yok
- **120** satılabilir üründe ASCII dışı slug (`İ`, `ı`, birleşik nokta) var

### 3.3 Konu dışı katalog ve dağınık kategori ağacı (ORTA)

- `/tr/kategoriler` 130+ kategori listeliyor; bir kısmı spor dışı: bal-pekmez, kuruyemişler,
  organik gıda, bitkisel yağlar, tavla, okey, satranç, yazılım, dijital ürünler, mutfak
  ekipmanları. Temmuz 404 listesi saç düzleştirici, kahve, zeytinyağı, tesettür üniforma
  gibi ürünlerle doluydu; bugün de pasif ürünlerde "fön başlığı" gibi örnekler var.
  Spor otoritesi seyreliyor.
- Kopya/örtüşen kategoriler: `tek-kullanim` ↔ `tek-kullanimliklar` (%78 aynı),
  `vitamin-mineral` ↔ `vitamin-mineraller` ↔ `vitaminler`, `sporcu-besinleri` ↔
  `spor-beslenmesi`, `corap` ↔ `spor-corabi` ↔ `gunluk-corap`.
- Bozuk slug'lar: HTML `&gt;` karakteri slug'a girmiş (`raket-sporlari-gt-masa-tenisi-gt-agdemirler`,
  `okul-dostu-urunler-gt-atlama-ipleri`), ID ekli slug (`performans-ve-guc-517`),
  birleşik noktalı İ (`i̇zole-protein-494`).
- Sitemap'te **yalnız 7 kategori** var; 130+ kategorinin geri kalanı sitemap dışı.

### 3.4 Zayıf iç bağlantı ve sayfalama (ORTA)

- Kategori sayfaları SSR HTML'de yalnız **20 ürün linki** veriyor ve sayfalama linki
  yok (sonsuz kaydırma). Kategori içindeki 21. üründen sonrası HTML'den erişilemiyor.
- `/tr/urunler?page=2…7` linkleri var ama her biri canonical ile `/tr/urunler`'e bağlı —
  Google sayfalamayı kopya sayıp içindeki linkleri daha az takip edebilir.
- Kampanyalar, kuponlar, hakkımızda ve yasal sayfaların ana içeriği yalnız ana sayfaya link veriyor.

### 3.5 Yanıltıcı marka sinyali (YÜKSEK — Merchant Center riski)

- Ana sayfa meta açıklaması: "…Nike, Adidas, Puma ve daha birçok marka." Katalogda bu markalar yok.
- `/tr/marka/nike` ve `/tr/marka/adidas`: **200, indekslenebilir, 0 ürün, 117 kelime**
  (soft-404). Başlık da küçük harf: "nike Ürünleri | Sportoonline".
- Merchant Center'daki "Yanlış beyan" cezası geçmişi düşünüldüğünde satılmayan marka
  vaadi ayrıca risk.

---

## 4. Tanitio kataloğu bulguları

Puanlar: **Teknik SEO 58.6/100** (Eylül 12'deki 92.9'dan düşük — fark büyük ölçüde yeni
ağırlıklandırmadan: içerik kalitesi %26 ağırlıkla 11.6 aldı), **GEO hazırlığı 43.5/100**.
Kontrol dağılımı: 718 uygun, 61 iyileştirme, 7 sorun, 379 bilgi.

| Kategori | Puan | Ağırlık | Kayıp |
|---|---|---|---|
| İçerik kalitesi ve özgünlük | 11.6 | %26 | **−22.98** |
| Otorite ve güven (E-E-A-T) | 44.8 | %20 | **−11.04** |
| Konusal otorite | 71.4 | %8 | −2.29 |
| Sayfa içi etiketler | 75 | %8 | −2.00 |
| İç linkler | 71.8 | %6 | −1.69 |
| Başlık terimi tutarlılığı | 66.3 | %4 | −1.35 |
| Teknik, CWV, heading, tarama derinliği, görseller | 100 | — | 0 |

E-E-A-T alt kırılım: Güven 43.8 (14/30), **Uzmanlık 12.1 (5/40)**, Deneyim 30 (6/20), Otorite 100.
GEO: atıf yapılabilirlik 10.7, **marka 5**, E-E-A-T 55, şema 100, platform 100.
Gerçek kullanıcı hızı (CrUX, origin): LCP 1.373 ms, INP 135 ms, CLS 0.06 — **iyi**.

Sayfa bazlı sorunlar (10 sayfa):

| Sayfa | Kelime | Anahtar kelime tutarlılığı | Diğer |
|---|---|---|---|
| `/tr` | 859 | **31 (Sorun)** | HTML 650 KB, 1.748 DOM düğümü, 20 JS, 141 inline style |
| `/tr/blog` | 251 | 36 | içerik sınırda, og:image yok |
| `/tr/yazar/engin-eser` | 122 | 42 | içerik sınırda, og:image yok, 0 görsel |
| `/tr/kampanyalar` | 122 | **15 (Sorun)** | içerik sınırda |
| `/tr/magazalar` | 186 | **14 (Sorun)** | og:image/og:url yok, 4 açık e-posta |
| `/tr/kuponlar` | 136 | **29 (Sorun)** | içerik sınırda |
| `/tr/hakkimizda` | 356 | 41 | og:image yok |
| `/tr/iletisim` | **50** | **22 (Sorun)** | **ince içerik**, 4 linkten 2'si adsız, og:image yok |
| `/tr/kullanim-kosullari` | 165 | 36 | içerik sınırda |
| `/tr/gizlilik-politikasi` | 142 | 36 | içerik sınırda |

Site geneli: SPF yok, DMARC yok (e-posta güvenlik skoru 0/100); 10 sayfanın tamamı
aynı og:image (logo); `/magaza/` ve `/kategori/` bölüm kök sayfası yok; alan adı
bitişine 158 gün (2027-03-03); ana sayfa trust bloğunda yorum/sosyal kanıt, yazar adı ve SSS yok.

**Yanlış pozitifler (işlem gerekmez):**

- "www yönlendirmesi zaman aşımı" — canlıda `https://www.sportoonline.com/` → 301 → `https://sportoonline.com/` çalışıyor.
- "x27" anahtar kelimesi — `&#x27;` normal HTML kaçışı, araç decode etmiyor.
- SSL 86 gün — certbot otomatik yeniliyor.
- `/magaza/` ve `/kategori/` kök sayfası — `/tr/magazalar` ve `/tr/kategoriler` zaten bu işi görüyor; kök yola 301 vermek yeterli.

---

## 5. Canlı taramada ek bulunan sorunlar

| # | Sorun | Kanıt |
|---|---|---|
| E1 | **Mesafeli Satış Sözleşmesi = Üye Sözleşmesi metni** | `/tr/mesafeli-satis-sozlesmesi` ile `/tr/uye-sozlesmesi` %99 aynı; başlık "Üye Sözleşmesi - Sportoonline"; metin "İşbu Üye Sözleşmesi…" diye başlıyor |
| E2 | Birebir kopya politika sayfaları sitemap'te | `iade-degisim` = `iade-politikasi` (%100), `kargo-politikasi` = `kargo-teslimat` (%100) |
| E3 | Başlıkta çift marka eki | 6 sayfa: "İade Politikası \| Sportoonline \| Sportoonline" vb. DB `meta_title` zaten eki taşıyor, layout şablonu ikinci kez ekliyor |
| E4 | `/tr/paket` canonical'ı yanlış | `canonical = https://sportoonline.com` (301 dönen kök). Sayfa kendi `alternates` tanımlamıyor, layout varsayılanı miras kalıyor |
| E5 | Kapalı Maraton mağazası indekslenebilir ve ana sayfadan linkli | `/tr/magaza/maraton-sportswear` 200 index; 317 ürün tamamı satışta değil |
| E6 | Mağaza sayfa başlıkları ince | 18–24 karakter ("EYB \| Sportoonline") |
| E7 | Satıcı adı kişi adı olarak ürün SSS'sinde | "…engin eser mağazası tarafından satılmaktadır" |
| E8 | sameAs'ta kişisel LinkedIn profili | `linkedin.com/in/sporto-online-965632409` |
| E9 | İletişim sayfası yönlendiren URL'ye linkliyor | `https://sportoonline.com/` (→ `/tr`) |
| E10 | Güncelliğini yitirmiş blog | `2024-en-iyi-akilli-saatler-karsilastirma`; toplam 16 yazı |

---

## 6. Checklist

Öncelik: **P0** = indeks/yasal kritik, **P1** = yüksek, **P2** = orta, **P3** = düşük.
Sahip: **Kod** (Codex uygular), **Kullanıcı** (panel/DNS/iş kararı), **GSC**.

### P0 — İndeks ve yasal

- [ ] **S1. Satışta olmayan ürün sayfaları için indeks politikası** (Kod — backend + web) — **1. adım kodda (dal `seo/indeks-politikasi-sayfalama`), deploy bekliyor**
  - [x] Pasif ürün (`status != approved`) → sayfa açık, **`noindex, follow`**. 410 BİLEREK seçilmedi: 2026-08-18 kararı (tedarikçisi geçici çekilen ürün `inactive` oluyor, 404/410 indeksi kalıcı düşürüyordu). Ürün tekrar onaylanınca kendiliğinden indekslenebilir olur.
  - [x] Mağazası kapalı/askıda (`stores.status != 1` veya `sales_suspended_at`) → `noindex, follow`
  - [x] Ürün API yanıtına `indexable` + `unsellable_reason` (`inactive` / `store_closed` / `out_of_stock`); `urun/[slug]/page.tsx` robots'u buna göre üretir. Alan yoksa (eski backend) eski davranış — deploy sırası serbest.
  - [ ] Geçici stoksuz (onaylı ürün, mağaza açık): bugün **indekste kalıyor** (`OutOfStock`). 30/90 gün kademesi `unsellable_since` kolonu ister (migration) — sonraki adım.
  - [ ] Kalıcı kapalı mağazalar (Linktech, Rova, Dekomum, eProtein) için 410/301 — mağaza kararına bağlı (S12)
  - [ ] Kabul: 75 örneklik pasif set tekrar taranınca 0 adet "200 + index + Tükendi" (deploy sonrası)
- [ ] **S2. Mesafeli Satış Sözleşmesi içeriğini düzelt** (Kullanıcı: metin / Kod: sayfa kaynağı) — yasal zorunluluk
- [ ] **S3. Marka vaadini düzelt** (Kod + Kullanıcı)
  - [ ] Ana sayfa meta açıklamasından Nike/Adidas/Puma'yı çıkar, gerçekten satılan markaları yaz
  - [ ] 0 ürünlü `/tr/marka/*` → 404 (veya `noindex`); marka başlığını büyük harfle başlat
- [ ] **S4. Kopya sayfaları birleştir** (Kod)
  - [ ] `iade-politikasi` → `iade-degisim` 301 (veya tersi; hangisi indeksliyse o kalsın)
  - [ ] `kargo-teslimat` → `kargo-politikasi` 301
  - [ ] Sitemap'ten yönlenen kopyaları çıkar
- [ ] **S5. `/tr/paket` (ve `paket/[slug]`) kendi canonical'ını üretsin** (Kod)
- [ ] **S6. Çift "| Sportoonline" başlıklarını düzelt** — 6 sayfa, `title: { absolute }` + `buildPageTitle` (Kod)

### P1 — İçerik kalitesi ve tarama

- [x] **S7. Sayfalama** (Kod) — dal `seo/indeks-politikasi-sayfalama`, deploy bekliyor
  - [x] `?page=N` sayfaları kendine canonical veriyor (kategori, `/urunler`, mağaza); filtre/sıralama varyantları temel yola bağlı kalıyor — `paginatedCanonical()` (`lib/seo.ts`)
  - [x] Kategori sayfasına SSR sayfalama linkleri (`rel=prev/next`, 7'lik pencere); sonsuz kaydırma korunuyor. Mağaza ve `/urunler`'de linkler zaten vardı.
  - [x] Yan hata: `?page=N` açılınca sonsuz kaydırma sayfayı "1" sanıp N'i tekrar çekiyordu — başlangıç sayfası artık SSR'dan geliyor
- [ ] **S8. İnce ürün açıklamaları** (Kod + içerik)
  - [ ] 2.068 ürün (<150 kr) ve 25 "açıklama = ad" ürünü için yapılandırılmış açıklama şablonu: özellik tablosu, kullanım, içerik/ölçü, kime uygun
  - [ ] Önceliği trafik/sipariş verisine göre sırala (ilk 500)
  - [ ] Kalite kapısı: `ProductSeoQuality` yeni ürün importunda <150 kr açıklamayı işaretlesin
- [ ] **S9. Kopya açıklamalar** — 1.573 ürün: varyant kopyalarını tek ürün + varyant yapısına topla veya farkı (adet/gramaj) açıklamaya işle (Kod)
- [ ] **S10. Kategori ağacı temizliği** (Kullanıcı karar + Kod)
  - [ ] Kopya kategorileri birleştir + 301 (tek-kullanim/-liklar, vitamin-mineral/-ler/vitaminler, sporcu-besinleri/spor-beslenmesi, çorap grupları)
  - [ ] `-gt-`, ID ekli ve birleşik noktalı slug'ları temiz slug'a 301
  - [ ] Boş kategorilere `noindex`; dolu kategorilerin tamamını sitemap'e ekle (bugün 7)
- [ ] **S11. Konu dışı ürün/kategori kararı** (Kullanıcı): gıda/ev/oyun/yazılım kategorileri ya kaldırılır ya da ayrı bir bölümde `noindex` tutulur
- [ ] **S12. Maraton mağazası** (Kullanıcı — CLAUDE.md'de bekleyen karar): öneri **A** — mağazayı pasife al, ürünler S1 kuralıyla 410; ana sayfadaki linki kaldır
- [ ] **S13. 120 ASCII dışı ürün slug'ı** → `ProductSlugRedirect` ile 308 (Kod)

### P2 — Sayfa içi ve güven

- [ ] **S14. og:image** — blog, yazar, mağazalar, hakkımızda, iletişim için sayfa başına görsel; mağazalar sayfasında og:url de eksik (Kod)
- [ ] **S15. İnce statik sayfalar** — iletişim (50 kelime), kampanyalar, kuponlar, yasal sayfalar: ilgili bölümlere iç link + kısa açıklayıcı metin (Kod + içerik)
- [ ] **S16. Anahtar kelime tutarlılığı** — kampanyalar (15), mağazalar (14), iletişim (22), kuponlar (29), ana sayfa (31): başlıktaki terimleri gövdeye taşı
- [ ] **S17. Mağaza sayfa başlıkları** → "{Mağaza} Ürünleri ve Fiyatları | Sportoonline" (Kod)
- [ ] **S18. E-E-A-T** — blog yazılarında yazar kutusu + güncelleme tarihi; ana sayfada doğrulanmış müşteri yorumu; SSS bölümü; dış otorite kaynağı
- [ ] **S19. Satıcı adı** — "engin eser" mağazasını marka adıyla yeniden adlandır (Kullanıcı)
- [ ] **S20. sameAs'tan kişisel LinkedIn profilini çıkar** (Kod/ayar)
- [ ] **S21. İletişim sayfası** — 2 adsız linke `aria-label`, `https://sportoonline.com/` linkini `/tr` yap
- [ ] **S22. Blog** — 2024 tarihli yazıyı güncelle; aylık en az 2 yeni rehber (kategori kümeleri: protein, kreatin, koşu, kamp)

### P3 — Performans ve altyapı

- [ ] **S23.** Ana sayfa HTML 650 KB / 1.748 DOM / 20 JS dosyası — flash satış bloğunda SSR edilen ürün sayısını azalt, inline style'ları sınıfa taşı
- [ ] **S24.** SPF + DMARC DNS kaydı (Kullanıcı — dnsenable.com): `v=spf1 -all`, `_dmarc` `v=DMARC1; p=reject; …` (Eylül 12'den beri bekliyor)
- [ ] **S25.** Alan adı 2027-03-03'te bitiyor (158 gün) — otomatik yenileme açık mı kontrol et, mümkünse çok yıllık yenile (Kullanıcı)
- [ ] **S26.** `/magaza` ve `/kategori` kök yollarını `/tr/magazalar` ve `/tr/kategoriler`'e 301
- [ ] **S27.** 5xx izleme — paralel taramada geçici zaman aşımı görüldü; nginx/PM2 loglarında 25 Eyl civarı 5xx ara

### GSC işlemleri

- [ ] **G-a.** "Bulunamadı (404)" ve "Alternatif sayfa" için doğrulamayı **tekrar başlatma** (beklenen durum)
- [ ] **G-b.** S1 + S4 + S5 + S7 canlıya çıktıktan sonra "Tarandı – dizine eklenmedi" ve "Kopya" için doğrulama başlat
- [ ] **G-c.** Sitemap'leri yeniden gönder (sitemap_index.xml); S10 sonrası kategori sitemap'i dahil
- [ ] **G-d.** 4 hafta sonra aynı dışa aktarımı al; hedef: dizine eklenmeyen < 2.000, gösterim Haziran seviyesine (≥ 350/gün)

---

## 7. Önerilen sıra

1. **Hafta 1:** S2 (yasal), S1, S3, S4, S5, S6 — hepsi küçük kod değişikliği, etkisi en büyük
2. **Hafta 2:** S7, S10, S12, S13 + GSC doğrulama (G-b, G-c)
3. **Hafta 3–6:** S8, S9 (içerik — en uzun iş), S14–S22
4. Sürekli: S23–S27

**Deploy uyarısı:** Lokal, origin/main ve VPS kod tabanları hâlâ ayrı (bkz. hafıza
`repo-vps-senkron-krizi`). Değişiklikler `deploy-seo-vps` tabanı üzerinden, bundle
yoluyla gönderilmeli; `git pull` VPS'teki commit edilmemiş işi ezer.
