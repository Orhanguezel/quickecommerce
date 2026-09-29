# Sportoonline veri düzeltmeleri — 2026-09-29

Derin analiz 2026-09-29 kontrol listesinin §6, §7, §9, §10 ve §11 maddeleri için hazırlanan betikler.
**Hiçbiri henüz canlıda uygulanmadı.** Tüm sayılar canlı DB'den salt okuma ile ölçüldü (2026-09-29, VPS HEAD 3b141004).

## Nasıl çalıştırılır

Betikler tinker ile uyumludur. `php artisan tinker < dosya` **çalışmaz**: psysh, satır satır okurken çok satırlı closure'da parse hatası veriyor. Bunun yerine `--execute` kullanın:

```bash
ssh vps-sportoonline
cd /var/www/quikecommerce/backend-laravel
# betiği sunucuya kopyaladıktan sonra (ör. /root/data-fixes/):
php artisan tinker --execute="$(cat /root/data-fixes/01_category_remap_sporcu_besinleri.php)"          # DRY-RUN
VERBOSE=1 php artisan tinker --execute="$(cat /root/data-fixes/01_category_remap_sporcu_besinleri.php)" # satır satır
DRY=0 php artisan tinker --execute="$(cat /root/data-fixes/01_category_remap_sporcu_besinleri.php)"     # UYGULA
```

- Varsayılan her zaman DRY-RUN'dır. DB'ye yalnız `DRY=0` ile yazılır.
- Uygulama sırasında her betik `/root/fixNN-...-<zaman>.json` rollback dosyası yazar (satır bazında `before` ve `after`).
- Geri almak için: `DRY=0 FILE=/root/fixNN-....json php artisan tinker --execute="$(cat 00_rollback.php)"`. Bu betik, satırın şimdiki değeri `after` ile aynı değilse o satırı atlar. Zorlamak için `FORCE=1` verilir.
- Ürün, kategori, banner ve blog değişikliklerinden sonra betikler `public-catalog:version` cache sürümünü yeniler. Next.js ISR (`s-maxage=60`) ilk istekte güncellenir.

## Çalıştırma sırası

| Sıra | Dosya | Ön koşul | Ölçülen etki (dry-run) |
|---|---|---|---|
| 0 | **Kod deploy'u** (aşağıda "Kodda yapılması gerekenler" 1 ve 2) | — | 301 yönlendirmeleri ve eprotein eşlemesi |
| 1 | `01_category_remap_sporcu_besinleri.php` | — | 2.287 ürün taşınıyor, 1.001'i görünür |
| 2 | `02_category_merge_duplicates.php` | Kod 1 ve 2 deploy edilmiş olmalı | 199 ürün taşınıyor, 5 kategori `status=0` |
| 3 | `03_blog_cleanup.php` | 01 ve 02'den sonra (link hedefleri dolmuş olur) | 34 kayıt (15 yazı × base/tr + 58/59'un df/en çevirileri) |
| 4 | `04_home_links_permanent.php` | 01 ve 02'den sonra | 5 kayıt (2 banner, 3 slider) |
| 5 | `06_maraton_store_passive.php` | — | 1 mağaza `status` 1→0 |
| – | `07_report_thin_descriptions.php` | salt okuma | CSV raporu |
| – | `00_rollback.php` | rollback JSON dosyası | geri alma |

§11 sameAs için betik yok, iş kodda (aşağıda anlatılıyor). Bu yüzden `05` numarası boş bırakıldı.

---

## 01 — Sporcu Besinleri (711) → doğru yaprak kategori

**Ölçüm:** `sporcu-besinleri` (id 711, `spor-beslenmesi` altında) kategorisinde 3.857 ürün var. Bunların 3.816'sı onaylı, **1.692'si görünür** (onaylı, mağazası aktif, stoklu ve fiyatlı varyantı var; sitedeki ~1.696 bu sayı). `proteinler` (368) alt ağacında 9, `kreatin` (370) alt ağacında 8 görünür ürün var.

**Bağlantı:** Ürün `products.category_id` kolonuna bağlı. Pivot tablo yok.

**Scraper'lar geri alır mı? Hayır.**
- `sync:source-prices` (günlük cron ve akşam turları) `category_id` alanına hiç dokunmuyor.
- `import:products` yalnız yeni ürün oluşturuyor. Slug zaten varsa ya da `product_slug_redirects` içindeyse ürünü atlıyor. `config/source_category_mappings.php` yalnız bu yeni kayıtlara uygulanıyor.
- `products:backfill-missing-categories` yalnız `category_id IS NULL` olan satırlara yazıyor.
- `categories:repair-taxonomy` yalnız kategori `parent_id` değerlerini düzeltiyor. Zamanlanmış değil.

**Yöntem:** Açık anahtar kelime kuralları kullanılıyor. Önce "bariz yanlış yerleşim" kuralları çalışıyor. Ardından takviye aileleri değerlendiriliyor. Bir ürün birden fazla aileye uyuyorsa (ör. whey+kreatin paketi) **taşınmıyor**. Beyaz listedeki çiftler istisna: bcaa+glutamin, karnitin+termo, protein+bar, jel+elektrolit, gainer+karbonhidrat. Marka adındaki "Protein Ocean", "ProteinMax" ve "Muscle Pump" kural eşleşmesinden önce siliniyor.

Kural bazında sayılar (taşınan / görünür):

| Hedef | Adet |
|---|---|
| whey-protein | 303 (111) |
| bcaa | 183 (81) |
| protein-bar | 159 (40) |
| kreatin + monohidrat + mikronize | 151 (73) |
| vitaminler + kompleks-vitaminler | 164 (89) |
| izole-protein | 92 (25) |
| kilo (gainer) | 90 (36) |
| guc-ve-performans (pre-workout) | 87 (32) |
| sivi-karnitin + karnitin | 117 (55) |
| glutamin, arjinin, eaa, sitrulin, beta-alanin, tribulus, kompleks-amino | 171 (112) |
| magnezyum, omega-3, zma/mineraller, eklem, kolajen, probiyotik, q10 | 209 (117) |
| karbonhidrat/jel/elektrolit/fıstık ezmesi/patlak | 172 (61) |
| diğer protein (generic ≥400 g, protein tozu, atıştırmalık, bitkisel, kazein, yumurta, et) + CLA + termojenik | 154 (38) |

Bariz yanlış yerleşimler:

| Kural | Hedef (var olan kategori) | Adet |
|---|---|---|
| personal_care (şampuan, sabun, deodorant, güneş kremi, saç yağı, cımbız, prezervatif…) | `kisisel-bakim` (1070) | 179 (122) |
| yoga_pilates (yoga matı, pilates bandı) | `yoga-pilates` (375) | 44 (0, eProtein pasif) |
| kids_vitamin | `vitaminler` (526) | 8 (6) |
| water_bottle (matara/suluk) | `mataralar-termoslar` (381) | 3 (2) |
| diaper_rash (pişik) | `bebek-bakimi-kk` (491) | 1 (1) |

Taşınmayanlar:
- 73 belirsiz (birden fazla aileye uyuyor)
- 323 aksesuar/giyim (shaker, tişört, eşofman, çanta, eldiven). Net bir hedef yok.
- 162 "sahte ürün": kategori adıyla birebir aynı ya da rakamsız, stoksuz, en fazla 4 kelimelik adlar ("Kazein Protein", "Termojenik Ürünler", "EPİLASYON, AĞDA, TRAŞ"). Kaynak sitenin kategori sayfalarından üretilmiş kayıtlar. **Ayrı bir iş olarak pasife alınmaları önerilir.**
- 1.012 kuralsız ürün `711`'de kalıyor.

Uygulamadan sonra 711'de yaklaşık 691 görünür ürün kalır.

Dikkat: `kisisel-bakim` ve `bebek-bakimi-kk`, `category-utils.ts` içindeki `LEGACY_MARKETPLACE_CATEGORY_SLUGS/TERMS` listesinde. Bu kategoriler spor navigasyonunda ve sitemap'te **görünmez**. Ürünler yine de ürün URL'si ve arama ile erişilebilir kalır. Spor sitesi için istenen sonuç budur.

Önizleme dosyaları: `fix01-dryrun-2026-09-29.txt` (satır satır) ve `fix01-preview-2026-09-29.csv`.

## 02 — Kopya kategoriler

| Kategori | Ölçüm | Karar |
|---|---|---|
| `tek-kullanim` (732, kök) | 2 ürün (Muscle Pump whey 30 gr) | Ürünler `whey-protein`'e gidiyor, kategori kapanıyor |
| `tek-kullanimliklar` (734, kök) | 4 ürün (karnitin shot, pre-workout saşe) | Ürünler `sivi-karnitin` ve `guc-ve-performans`'a gidiyor, kategori kapanıyor |
| `spor-outdoor` (1088, kök, navigasyonda değil) | 175 ürün (multiprice), 155'i stoklu. **İçerik outdoor değil fitness**: dambıl, barbell, yoga matı, direnç bandı | `outdoor-kamp`'a birleştirmek yanlış olurdu. Ürünler fitness-egzersiz alt ağacına dağıtılıyor: ağırlıklar 48, yoga-pilates 32, giyim 18, crossfit 7, havlu 6, bisiklet 3, kardiyo 2, matara 1, kalan 58 `fitness-egzersiz`. 1088 kapanıyor |
| `outdoor-kamp` (378) | 0 doğrudan ürün, alt ağacında 286 ürün, ana navigasyonda | **Kalıyor** |
| `spor-aletleri` (801) | 697 Ceysport ürünü (641 stoklu), `fitness-egzersiz` çocuğu, display_order=2. Alt kategori olarak görünmesi gerekiyor | **Kalıyor**. Asıl kopyaları kapanıyor: `diger-ekipmanlar` (686, 11 ürün) ve `spor-ekipmani` (697, 1 ürün). Bu 12 Everlast boks ürünü dislik→`dovus-sporlari`, lapa, bandaj, boks-torbası ve atlama-ipi kategorilerine taşınıyor |
| yoga-pilates (375) yanlış yerleşim | 4 tatami + 1 duvar minderi, 1 uyku tulumu | Tatami ve duvar minderi `spor-aletleri`'ne gidiyor (diğer 17 tatami orada). Uyku tulumu `uyku-tulumlari`'na gidiyor |

Toplam 199 ürün taşınıyor ve 5 kategori `status=0` oluyor. Betik, kapanacak bir kategoride ürün ya da aktif alt kategori kalırsa durur. Önizleme dosyaları: `fix02-dryrun-2026-09-29.txt` ve `fix02-preview-2026-09-29.csv`.

### 301 için gerekenler (kod — betik yapmaz)

`/product-category/list?all=true` yalnız `status=1` kategorileri döndürüyor (`FrontendController::productCategoryList`). Kategori pasife alındığında kategori sayfasında tam eşleşme kalmıyor. `findLegacyCategory()` (`kategori/[slug]/page.tsx:85`) yalnız slug normalizasyonu yapıyor: NFKD, `-gt-` ve sondaki `-<id>` temizleniyor. Bu yüzden `tek-kullanim` gibi bir slug'ı **başka bir** slug'a eşleyemiyor ve sayfa 404 döndürüyor. Veri tarafında bir kategori yönlendirme tablosu yok (`product_slug_redirects` yalnız ürünler için).

Sitemap aynı API'yi kullanıyor (`sitemap.ts:82`), bu yüzden pasif kategoriler sitemap'ten kendiliğinden düşer.

**En basit çözüm** `customer-web-nextjs/next.config.ts` → `redirects()` dizisine şu satırları eklemek. `statusCode: 301` gerçek bir 301 üretir. `permanent: true` ya da `permanentRedirect()` kullanılırsa sonuç 308 olur.

```ts
// Birlestirilen kategoriler (data-fix 2026-09-29, 02_category_merge_duplicates.php)
{ source: "/:locale(tr|en)/kategori/tek-kullanim", destination: "/:locale/kategori/spor-beslenmesi", statusCode: 301 },
{ source: "/:locale(tr|en)/kategori/tek-kullanimliklar", destination: "/:locale/kategori/spor-beslenmesi", statusCode: 301 },
{ source: "/:locale(tr|en)/kategori/spor-outdoor", destination: "/:locale/kategori/fitness-egzersiz", statusCode: 301 },
{ source: "/:locale(tr|en)/kategori/diger-ekipmanlar", destination: "/:locale/kategori/spor-aletleri", statusCode: 301 },
{ source: "/:locale(tr|en)/kategori/spor-ekipmani", destination: "/:locale/kategori/spor-aletleri", statusCode: 301 },
```

Sıra şöyle olmalı: önce kod deploy edilir (yönlendirme, kategori aktifken de çalışır), sonra `DRY=0 02_...` çalıştırılır.

### Kodda yapılması gerekenler

1. Yukarıdaki `next.config.ts` redirect satırları.
2. `backend-laravel/config/source_category_mappings.php:17` → `'eprotein' => ['fallback_category_id' => 1088]` satırı **367** (veya 711) yapılmalı. Yapılmazsa bir sonraki eprotein `import:products` çalıştırması `SourceCategoryMapper` tarafından "pasif hedef" hatasıyla durdurulur. eProtein mağazası (69) şu an zaten `status=0`. Günlük fiyat senkronu etkilenmez.
3. (§10, 04 ile ilgili) `home-client.tsx:197-229` içindeki flash kampanya linkleri. Ayrıntı 04 bölümünde.

## 03 — Blog

Blog gövdesi `blogs.description` alanında ve `translations` tablosunda duruyor (`translatable_type=Modules\Blog\app\Models\Blog`, `key=description`, diller tr/df/en). **tr çevirisi base ile birebir aynı**, betik ikisini de güncelliyor. df ve en çevirileri eski, kısa (~900 bayt) sürümler. Bunlarda şablon ya da arama linki yok. Yalnız 58 ve 59 numaralı yazılara not ekleniyor.

**(a) Arama linkleri → kategori.** Eşleme tablosu betikte `$termMap` olarak duruyor. Bir link yalnız hedef kategorinin alt ağacında **en az 3 satılabilir ürün** varsa değiştiriliyor (`MIN_PRODUCTS`). Aksi halde arama linki korunuyor.

| Arama terimi | Kategori | Bugün | 01 ve 02'den sonra (tahmin) |
|---|---|---|---|
| whey protein | whey-protein | 5 → değişir | ~116 |
| isolate | izole-protein | 2 → atlanır | ~27 → değişir |
| kreatin | kreatin | 8 → değişir | ~81 |
| protein bar | protein-bar | 0 | ~40 → değişir |
| enerji jeli | karbonhidrat-ve-jel | 1 | ~21 → değişir |
| egzersiz matı / yoga matı / pilates topu | yoga-pilates | 6 → değişir | ~38 |
| dumbbell | agirliklar-dambillar | 0 | ~48 → değişir |
| koşu çorabı | spor-corabi | 42 → değişir | 42 |
| fitness ekipmanı | fitness-egzersiz | 750 → değişir | ~900 |
| termos | mataralar-termoslar | 1 | ~4 → değişir |
| bisiklet eldiveni | bisiklet | 0 | 3 → değişir |
| atlama ipi | okul-dostu-urunler-atlama-ipleri | 1 | ~2 → atlanır |
| uyku tulumu, kamp çadırı, trekking çantası, yüzücü gözlüğü/bonesi/tahtası, diz desteği | uyku-tulumlari, cadirlar, sirt-cantalari, yuzucu-gozlugu, bileklik-dizlik-koruyucular | 0–1 | 0–1 → atlanır |

Bilinçli olarak eşlenmeyen terimler (net kategori yok): shaker, direnç bandı, esneme bandı, foam roller, kafa lambası, mat, kamp ocağı, bisiklet kaskı, bisiklet aydınlatma, koşu ekipmanı, spor saat, akıllı saat, koşu/yürüyüş/trail/outdoor ayakkabı. Akıllı saat kategorileri Linktech'in elektronik ağacında; spor ayakkabı ağacında koşu ayakkabısı yok.

**(b) Şablon bölümler.** Bir H2 bölümü şu koşulların ikisi de sağlanırsa siliniyor:
- Aynı başlık en az 3 yazıda geçiyor.
- Bölümün cümle kümesi, en az 2 başka yazıdaki aynı başlıklı bölümle Jaccard ≥ 0,5 benzerlik gösteriyor. Hesaplamadan önce yazı başlığı metinden çıkarılıyor.

Ölçüm iki şablon ailesi gösterdi:
- **9 yazı** (49, 52–56, 58–60) şu bölümleri taşıyor: Detaylı Rehber Planı, Kimler İçin Uygun?, Uygulama Adımları, Alışverişte Dikkat Edilecekler, Sık Yapılan Hatalar, Haftalık Kullanım Önerisi, Uygulama Senaryoları, Bakım/Saklama, Karar Matrisi, Sık Sorulan Sorular, Son Kontrol Listesi, Editoryal Not. Bunların hepsi 9 yazıda birebir aynı.
- **6 yazı** (46, 47, 48, 50, 51, 57) şu bölümleri taşıyor: Pratik Uygulama Planı, Alışveriş ve Kullanım Kontrol Listesi, Ne Zaman Güncelleme Yapılmalı? (6 yazıda); Editoryal Değerlendirme ve Takip, Ölçüm ve Karar Verme (5 yazıda).

Yazıya özgü bölümler **korunuyor**. Örneğin 46/47/48/51/57'deki "Sık Yapılan Hatalar" ve SSS bölümleri ve 60'taki özgün "Sık Yapılan Hatalar" bölümü benzerlik eşiğini geçmedi. Beyaz liste (hiç silinmez): Sportoonline İç Linkleri, Sportoonline İç Link Önerileri, Güvenilir Kaynaklar, Kaynaklar ve Ek Okuma.

İkinci "Kısa cevap" paragrafı tam olarak **6 yazıda** var (46, 47, 48, 50, 51, 57) ve siliniyor. Geo kutusundaki birinci "Kısa cevap" korunuyor.

**(c)** `100-kilo-veren-adam-ahmetin-hikayesi` yazısının en üstüne şu not ekleniyor: "Not: Bu yazıdaki hikâye, genel bilgilendirme amaçlı örnek bir anlatımdır." (tr/df; en çevirisine İngilizcesi).

**(d)** `kosucu-dizi-nedenleri-ve-tedavisi` yazısının en üstüne tıbbi uyarı ekleniyor. Tedavi iddiası içeren cümleler **değiştirilmedi**, insan incelemesi için aşağıda:
- "İlk aşamada RICE protokolü (Dinlenme, Buz, Kompresyon, Elevasyon)."
- "Ardından fizik tedavi ve güçlendirme egzersizleri."
- "Kuadriseps ve kalça kaslarını güçlendirin."
- "Ağrı devam ediyorsa koşuya ara vermek, yükü azaltmak ve fizyoterapi değerlendirmesi almak güvenli yaklaşımdır." (kısa cevap kutusu)
- "Ağrı 2 haftadan uzun sürerse, şişlik varsa veya hareket kısıtlılığı oluşursa mutlaka doktora başvurun."
- Ayrıca başlık ("Nedenleri ve **Tedavisi**") ve "Tedavi" H2'si de tedavi vaadi gibi okunuyor. Başlık ve slug değişikliği bu betiğin kapsamında değil. en/df çevirilerinde aynı "Treatment/Tedavi" bölümleri var.

Önizleme: `blog-diffs/<id>-<slug>.<dil>.before.html`, `.after.html` ve `.diff` dosyaları. Bu dosyalar `MIN_PRODUCTS=0` ile üretildi, yani eşlenebilen **bütün** linkleri değişmiş gösteriyor. Uygulama anında eşiği geçemeyen linkler (yukarıdaki tabloya bakın) korunur. Dry-run çıktıları: `fix03-dryrun-2026-09-29.txt` (bugünkü eşikle) ve `fix03-dryrun-MIN0-preview.txt`.

## 04 — Ana sayfa linkleri

**`/ara?q=` linkleri tamamen DB'de duruyor.** Kodda sabit bir link yok.

| Kayıt | Eski | Yeni |
|---|---|---|
| banners#33 "Sağlık Desteği Artık Çok Kolay" | `/tr/ara?q=whey` | `/tr/kategori/whey-protein` (≥3 ürün şartı, 01'den sonra ~116) |
| banners#35 "Premium Seçimler" | `/tr/ara?q=yonex` | `/tr/marka/yonex` (117 ürün) |
| sliders#40 "Güvenli Spor Alanları İçin" | `/tr/ara?q=tatami` | `/tr/kategori/spor-aletleri` (tüm tatamiler 02'den sonra burada) |
| sliders#45 "Her Anında Sana Eşlik Eder.." | `/tr/ara?q=sigg` | `/tr/marka/sigg` (136 ürün) |
| sliders#46 "Premium Seçimler" | `/tr/ara?q=pilates%20yoga` | `/tr/kategori/yoga-pilates` |
| banners#32 "Editörün Seçimi %100 Emilim" | `/tr/ara?q=biotech` | **Dokunulmadı.** Biotech markası ya da kategorisi yok |

Slider'larda `button_url` ve `redirect_url` alanlarının ikisi de güncelleniyor.

Yan etki: ba709544'teki `isBannerRelevantToProduct` (ürün sayfası), banner #33'ü artık adında "whey" geçen her ürün yerine yalnız `category_slug === "whey-protein"` olan ürünlerde gösterir. 01'den sonra bu ~303 ürün demek. İzole ürünlerde görünmez.

**`flash_sale_id=` linkleri kodda üretiliyor, DB'de değil.** Kaynak: `customer-web-nextjs/src/app/[locale]/home-client.tsx:197-229` (`getFlashDealProductsHref`).
- `button_url` boşsa fallback `/urunler?flash_sale_id=<id>` oluyor.
- `button_url` `/urunler` ise `appendFlashSaleId()` parametreyi ekliyor.
- `flash_sales.button_url` değerlerinin hepsi `/urunler` ya da `https://sportoonline.com/tr/urunler`.
- Aynı değer `kampanyalar/campaigns-client.tsx:42` üzerinden kampanya sayfasındaki kartları da besliyor. DB'de `/kampanyalar` yazılırsa kampanya sayfası kendine dönen link üretir.

Bu yüzden 04 betiği `flash_sales` tablosuna **dokunmuyor**. Düzeltme kodda yapılmalı: ana sayfa kartı `href="/kampanyalar"` olmalı (`/tr/kampanyalar` 200 döndürüyor).

## §11 — Organization sameAs

Kaynak **kodda**, DB'de değil:
- `customer-web-nextjs/src/lib/seo.ts:36-43` → `DEFAULT_ORGANIZATION.sameAs`. `layout.tsx:301` bunu yayıyor.
- Wikidata `User:Sportoonline` ve site kökü ise Person şemasında: `src/lib/authors.ts:11-14` (`ENGIN_ESER_AUTHOR.sameAs`). Blog ve yazar sayfasında kullanılıyor.
- Yerel worktree commit **ba709544** bu üç öğeyi zaten kaldırıyor.
- VPS ise hâlâ **3b141004**'te: `seo.ts:41` sikayetvar ve `authors.ts:15` wikidata satırlarını içeriyor. Canlı HTML'de ikisi de görünüyor. Yani iş, ba709544'ün deploy edilmesinden ibaret.

## 06 — Maraton mağazası

`stores#47 Maraton Sportswear` şu an `status=1`. 317 ürününün tamamı `inactive`, stoklu varyant sayısı 0. Betik `status` alanını 0 yapıyor. Otomatik olarak geri açılmaz: `commerce:enforce-store-readiness` yalnız `status=1` mağazaları işliyor ve `status` alanına dokunmuyor. Geri almak için `00_rollback.php` kullanılır.

## 07 — İnce açıklama raporu

`thin-descriptions-by-store-2026-09-29.csv` (mağaza bazında) ve `thin-descriptions-products-2026-09-29.csv` (2.539 ürün satırı). Açıklama değeri tr çevirisinden, o yoksa `products.description` alanından alındı. HTML etiketleri temizlendikten sonra karakter sayısı ölçüldü.

- Onaylı ürün: 13.106. **Boş: 1.681. 1–99 karakter: 858. Toplam ince: 2.539 (%19,4).**
- Görünür ürünlerde (6.554): boş 637, 1–99 karakter 708, toplam **1.345**.
- En büyük kaynaklar (ince / onaylı):
  - EYB: 572/2.864 (görünür 336)
  - ProteinMax: 547/547 (%100 boş; görünür 258)
  - Ceysport: 525/890 (çoğu 1–99 karakter; görünür 489)
  - Speedwa: 258/272 (görünür 0)
  - Provitanya: 148/1.804
  - BodyFit: 106/856
  - Everlast: 90/549
  - Muscle Pump: 57/80
