# Sportoonline — Yapılacaklar (Sonraki Oturum)

> Oluşturma: 2026-05-15. Önceki oturumda tamamlananlar: Gmail SMTP, Firebase push,
> 5 günlük trafik raporu + ayrı nginx log, Geliver Türkçe il/ilçe fix + #113,
> Google Places API, admin sipariş detayı/fatura adres + isim + temiz format.

## 🚧 BEKLEYEN UNCOMMITTED DEĞİŞİKLİKLER (2026-05-24)

> Codex perf + scraper işleri commit edildi (`7d9a29e3`, `f50687b0`). Bunlar **bilinçli commit dışında bırakıldı** — yeni oturumda kullanıcıyla karar verilecek. `git status` ile gör.

### E-Fatura backend (13 yeni dosya + 3 modified)
- **Untracked:** `backend-laravel/app/Http/Controllers/Api/V1/Customer/EInvoiceDownloadController.php`, `backend-laravel/app/Http/Controllers/Api/V1/Webhooks/EinvoiceWebhookController.php`, `app/Jobs/{Cancel,Create,PollEInvoiceStatus}Job.php`, `app/Models/EInvoice.php`, `app/Observers/OrderInvoiceObserver.php`, `app/Services/EInvoice/`, `database/migrations/2026_05_16_120000_create_e_invoices_table.php`, `scripts/einvoice-local-{env.sh,smoke.php}`, `tests/Unit/EInvoice{Client,PayloadBuilder,WebhookVerifier}Test.php`
- **Modified:** `app/Providers/AppServiceProvider.php` (OrderInvoiceObserver register), `config/services.php` (einvoice config block)
- **Neden bekletildi:** Nilvera entegrasyonu kullanıcı tarafında bitmemiş (CLAUDE.md "nilvera haric" notu). `Order::observe(OrderInvoiceObserver::class)` canlıya çıkarsa her siparişte e-fatura Job tetiklenir; mock/credential yoksa kuyruk hata yığar. Önce Nilvera credential + test ortamı, sonra commit + deploy.

### Admin-panel değişiklikleri (5 dosya, içerik bilinmiyor)
- `admin-panel/public/firebase-env.js`
- `admin-panel/public/locales/{en,tr}.json`
- `admin-panel/src/components/blocks/admin-section/products/request/ProductDetailsPage/ProductDetailsFormPage.tsx`
- `admin-panel/src/components/blocks/admin-section/products/request/ProductDetailsPage/components/TabComponent.tsx`
- `admin-panel/src/modules/common/brand/brand.action.ts`
- **Neden bekletildi:** Hangi feature için olduğu belirsiz, test edilmedi. `git diff` ile incele, sahibini hatırla, gerekirse commit et veya `git restore` ile sil.

### Eski raporlar — silinmiş (D), commit edilmedi
- GEO raporları (sportoonline GEO audit, yol haritası — 2 md + 4 pdf)
- `google.md`, `googlec78a9bfe93e092fc.html` (eski Google Search Console verification)
- `maraton_scraper_v2.py` (kök seviyesinde, artık `scrapers/` altında)
- **Neden bekletildi:** Bilinçli temizlik mi yoksa kazara mı belirsiz. `git restore` ile geri al veya `git rm` ile commitle.

### Diğer minor
- `.claude/settings.json` (M) — Claude Code ayarları
- `README.md` (M) — diff'i kontrol et
- `backend-laravel/.phpunit.result.cache` (M) — `.gitignore`'a eklenmeli, repo'da olmamalı
- `YAPILACAKLAR.md` (bu dosya — sen bunu edit ediyorsun)

## 🎯 Ana İşler

- [X] **1. E-Fatura sistemi adapte** — kod TAMAM, canlı geçiş ops/muhasebe ön koşullu
  - **Karar verildi:** Entegratör **Nilvera**, senaryo **e-Arşiv** (B2C). Tek tek app
    içine değil → **merkezi `e-fatura-service` mikroservisi** (ayrı repo,
    Fastify+Bun+Drizzle, sportoonline + diğer projeler ortak tüketir).
  - **Yapılanlar (2026-05-16):**

    - [X] `e-fatura-service` Faz 1-4: şema/auth (AES-256-GCM credential, X-Api-Key),
      provider soyutlama + Nilvera adapter + tutar builder (BigInt, KDV/indirim/
      kargo/çoklu kur→TL), BullMQ kuyruk, webhook (HMAC imza)+retry+status-sync,
      iptal/iade + admin API. 43 test yeşil.
    - [X] Faz 6 deploy → **CANLI**: `https://efatura.guezelwebdesign.com`
      (Docker: api+redis+mysql, Nginx+TLS, kök→/admin panel). `EFATURA_NILVERA_MOCK=true`
      (gerçek GİB'e gitmiyor — güvenli).
    - [X] sportoonline ince istemci (Faz 5): `App\Services\EInvoice\EInvoiceClient`,
      `OrderInvoiceObserver` (payment_status=paid→fatura), `CreateEInvoiceJob`,
      `EinvoiceWebhookController` (HMAC doğrulama), `EInvoicePayloadBuilder`,
      `e_invoices` özet tablo migration, `config/services.php` einvoice bloğu.
      10 test/28 assertion yeşil. Branch: `codex/faz5-einvoice-client`.
    - [X] VKN/TCKN kararı: sportoonline saf B2C, vergi-no toplamıyor →
      GİB **nihai tüketici `11111111111`** (doğru davranış, ek alan gerekmez).
    - [X] Eski admin `InvoiceModal` PDF yerine: müşteri "Faturayı indir" →
      `EInvoiceDownloadController` (servisteki gerçek e-Arşiv PDF/ETTN'e proxy).
  - **Kod dışı canlı geçiş ön koşulları:**

    - [X] Faz 5 dosyalarını `codex/faz5-einvoice-client`'a **seçmeli** commit
      edildi (`8cff2108`, 21 dosya/+1175; ~205 unrelated değişiklik alınmadı,
      working tree'de korundu). PDF redirect defekti `fetchPdf` stream ile giderildi.
    - [ ] Nilvera **PROD** credential + mali mühür + muhasebe teyidi
      (KDV oranları/istisna/iade politikası) — **bloke edici ön koşul**.
    - [ ] Sunucuda `.env` `EFATURA_NILVERA_MOCK=false` + tenant prod credential
      → **canlı tek gerçek fatura** teyidi (muhasebe ile).
    - [ ] (ops.) Feature testi: sipariş paid → job → `e_invoices` kaydı.
  - **Kod harici ön koşullar (üyelik / API / mali / muhasebe — firma + mali müşavir):**

    - [ ] **Nilvera**'ya üye ol + ticari sözleşme → https://www.nilvera.com
      - [ ] Sandbox/TEST API anahtarı (apitest.nilvera.com) — önce bununla test
      - [ ] PROD API anahtarı (sözleşme + mükellefiyet sonrası)
      - [ ] **Nilvera'ya SOR:** entegratör mührüyle mi imzalıyor, kendi mali mühür şart mı?
    - [ ] **Mali Mühür** (yalnız Nilvera "kendi mührün" derse) → Kamu SM
      https://mportal.kamusm.gov.tr (VKN ile, **birkaç hafta sürer, erken başlat**)
    - [ ] **GİB e-Arşiv mükellefiyeti** (mali müşavir + Nilvera halleder)
    - [ ] **Mali müşavir yazılı teyit:** KDV oranları (spor ürünü %20?), istisna,
      iade/iptal politikası (pencere kaç gün?), fatura serisi, nihai tüketici onayı
    - [ ] **Firma bilgileri** (tenant'a girilecek): ünvan, VKN, vergi dairesi,
      MERSİS, ticaret sicil, resmî adres, logo/branding
    - [ ] PROD geçiş: sunucu `.env` `EFATURA_NILVERA_MOCK=false` + Nilvera PROD
      credential; sportoonline `EINVOICE_*` prod + `EINVOICE_ENABLED=true`
    - [ ] Güvenlik: sudo parolası SCHEMA.md'ye yazılmıştı → **rotate et**

    - 👉 Tam liste/sıra: `e-fatura-service/docs/FAZ-0-ONKOSULLAR.md`
  - Detay/mimari: `e-fatura-service/docs/` (WORK-PLAN, REVIEW-FAZ1..5, FAZ-0-ONKOSULLAR),
    `quickecommerce/docs/EARSIV-FATURA-ENTEGRASYON-PLANI.md`.

- [X] **2. Geliver gönderici = satıcının kendi adresi** → Kod **CANLI DEPLOY** (2026-05-23 22:55 UTC, commit 8d0d973c). Geliver dashboard/store ID üzerinden gerçek satıcı testi bekliyor.

  - Kargolar her **satıcının kendi adresinden** alınacak.
  - `GdeliveryService::buildShipmentData` zaten `store->geliver_sender_address_id ?? global` sırasını destekliyor.
  - Yapılacak: her satıcının Geliver'da kayıtlı **sender address ID**'si olmalı (şu an tek global adres `8ba4a825-…`).
  - Admin/seller panelinde satıcı adresi → Geliver sender address oluşturma/eşleme akışı.
- [X] **3. yesilmarka.com scraper — AYRI MAĞAZAYA TAŞINDI**
  - Scraper var: `scrapers/yesilmarka_scraper.py` (6329 B), VPS root'ta deploy, cron'da.
  - Mevcut durum: `yesilmarka_products.json` 4 ürün, source mapping 4 kayıt.
  - **Codex 2026-05-24:** Kullanıcı kararı: ayrı mağaza olacak. Canlıda `Yeşilmarka` store #73 oluşturuldu (`slug=yesilmarka`, `store_type=sports`, aktif/commission). 4 ürün ve 4 `source_name=yesilmarka` mapping store #73'e taşındı; eski store #33 altında Yeşilmarka mapping kalmadı. Scraper bilinçli olarak sadece breadcrumb'da `Sporcu Besinleri` geçen 4 ürünü alıyor.
- [X] **4. Elle yüklenmiş mağazalar — TAMAM**
  - **Tamamlanan akış:** kaynak site → scraper yaz (15) → JSON → her site için
    yeni mağaza aç (#56-70) → `import:products --status=approved --skip-images` →
    7 eski elle mağaza soft-delete + status=0.
  - **A. Eski elle-mağazalar (2026-05-23 SOFT-DELETED + status=0):**

    | Store          | ID  | Eski Ürün | Durum |
    | -------------- | --- | --------- | ----- |
    | multiprice     | #41 | 843       | ✅ silindi |
    | Organiks       | #40 | 181       | ✅ silindi |
    | Spor Merkezi   | #35 | 125       | ✅ silindi |
    | EğlenceParkı | #43 | 31        | ✅ silindi |
    | Kendini Sev    | #44 | 22        | ✅ silindi |
    | Doğalız      | #42 | 20        | ✅ silindi |
    | Tarladan       | #38 | 1         | ✅ silindi |
    | Orcamp         | #36 | 0         | korunan (kullanıcı kararı) |
    | GZL Teknoloji  | #54 | 2         | korunan (yazılım mağazası, manuel) |

    Toplam **1223 ürün soft-delete** (deleted_at set, geçmiş siparişler korunur),
    7 mağaza status=0. Canlı API'de listelenmiyor.
  - **B. Scraper VAR ama mapping YOK — site aramaya gerek yok, sadece backfill:**

    - [X] **Everlast** (#50, 549 ürün) — 2026-05-22: backfill+sync yapıldı,
      2307 mapping, 205 fiyat/stok güncellendi. Günlük cron artık otomatik.
    - [X] **Dropick** (#48, 73 ürün) — 2026-05-22: `sync:source-prices`'a
      `--backfill-by-name` flag'i eklendi (birebir ad eşleşmesi, aynı ad birden
      fazlaysa atlar). Dropick 57 mapping (slug'la yalnız 23 idi), 4 güncelleme.
      Günlük cron artık otomatik. Kalan ~16 ürün isimle de tutmuyor (elle).
  - Not: scraper JSON çıktı şeması = `everlast_scraper.py` (slug, original_price,
    discounted_price, variants[available,price,compare_at_price]). Anti-bot kontrol et.
  - **C. Kaynak siteler bulundu (2026-05-22, kullanıcı verdi) — scraper yazılacak**

    1. Akış: her site için scraper → `*_products.json` → `import:products` (yeni ürün)
       / `sync:source-prices` (fiyat-stok) → `run-all.sh` + günlük cron'a eklenecek.
    1. Platformlar curl ile tespit edildi (2026-05-22):

       | #  | Site                    | Platform           | Anti-bot                | Scrape yöntemi           | Zorluk |
       | -- | ----------------------- | ------------------ | ----------------------- | ------------------------- | ------ |
       | 1  | eyb.com.tr              | T-Soft             | Yok                     | custom HTML (T-Soft)      | Orta   |
       | 2  | proteinmax.com.tr       | OpenCart           | Yok                     | custom (ayakkabi paterni) | Kolay  |
       | 3  | proteinavm.com          | CF arkasında      | **VAR (sert CF)** | Scrapling stealth         | Zor    |
       | 4  | ceysport.com            | WooCommerce        | VAR (WAF 403)           | HTML scraper (API kapalı) | Orta   |
       | 5  | eprotein.com.tr         | CF arkasında      | **VAR (sert CF)** | Scrapling stealth         | Zor    |
       | 6  | herbinatura.com         | IdeaSoft           | Yok                     | custom HTML (IdeaSoft)    | Orta   |
       | 7  | maskotmeyvepresleri.com | WooCommerce        | Yok                     | WC Store API              | Kolay  |
       | 8  | musullu.com             | ikas               | CF (geçilir)           | ikas storefront / custom  | Orta   |
       | 9  | speedwa.com.tr          | WooCommerce        | CF (geçilir)           | HTML scraper (API kapalı) | Orta   |
       | 10 | rovabatarya.com         | OpenCart           | CF (geçilir)           | custom OpenCart           | Orta   |
       | 11 | linktech.com.tr         | Odoo               | Yok                     | custom HTML (Odoo shop)   | Orta   |
       | 12 | powertec.com.tr         | Ticimax            | Yok                     | custom HTML (Ticimax)     | Orta   |
       | 13 | provitanya.com          | OpenCart           | Yok                     | custom OpenCart           | Kolay  |
       | 14 | bodyfitshop.com.tr      | AKINSOFT e-Ticaret | CF (geçilir)           | AKINSOFT API / custom     | Orta   |
       | 15 | crestaofficial.com      | bilinmiyor (CF)    | CF (geçilir)           | önce HTML incele         | Orta   |
       | 16 | compexturkiye.com       | CF arkasında      | **VAR (sert CF)** | Scrapling stealth         | Zor    |
    1. **Özel kurallar:**

       -  **bodyfitshop.com.tr (#14):** SADECE `BioTechUSA` ve `TNT` markalı ürünler
         çekilecek — tüm site değil.
       -  **eyb.com.tr (#1):** kullanıcı `/K285,saat.htm` (saat kategorisi) URL'i verdi;
         Victorinox resmi distribütörü. Tüm site mi yoksa sadece bu kategori mi → netleştir.
       -  **proteinavm.com (#3):** kullanıcı `/protein-tozu` kategorisini işaret etti.
       -  WooCommerce siteleri (4, 7, 9) tek **generic WC scraper** ile çözülebilir
         (`grandgiftstore_scraper.py` WC Store API paternine benzer).
       -  OpenCart siteleri (2, 10, 13) `ayakkabi_scraper.py` paterniyle.
       -  CF duvarlı 3, 5, 16 → maraton gibi `scraper.guezelwebdesign.com` (Scrapling) ister.
    1. **Kapsam dışı / korunacak (kullanıcı kararı):**

       -  **GZL Teknoloji (#54):** kaynak site YOK; elle/manuel takip edilecek, stok
         kontrolü yok (yazılım mağazası, ayrı tutuluyor). Bu listeye DAHİL DEĞİL.
       -  torqnutrition.com.tr, orcamp.com.tr (#36), nurgazshop.com.tr, raketspor.com.tr
         → ürünler zaten yüklenmiş; **korunacak, silinmeyecek**.
    1. **KARAR (2026-05-22):** Her kaynak site **kendi YENİ mağazasına** açılacak
       (16 yeni mağaza). Eski elle-mağazalar (multiprice #41, Organiks #40 …)
       sonradan boşaltılıp kapatılacak. Her site için yeni store oluşturulup
       `import:products JSON STORE_ID` ile yüklenecek. "Elle gireni sil" EN SON.
    1. Not: kullanıcı "şimdilik bunlar, aklımıza geldikçe ekleriz" dedi — liste açık.
    1. **YAPILDI (2026-05-22/23) — 14 site canlı, eski mağazalar silindi:**

       - **Generic çekirdek modüller** (yeni): `scrapers/woocommerce_scraper.py`
         (WC Store API), `scrapers/opencart_scraper.py` (OpenCart, JSON-LD + HTML
         fallback), `scrapers/ideasoft_scraper.py` (IdeaSoft + Scrapling). Çıktı
         şeması everlast/shopify ile aynı → `sync`/`import` değişmeden çalışır.
       - **✓ CANLI yeni mağazalar (16/16 site, toplam 11165 ürün):**

         | Mağaza | ID | Ürün | Site | Yöntem |
         |---|---|---|---|---|
         | Maskot Meyve Presleri | #56 | 45 | maskotmeyvepresleri.com | WC Store API |
         | Provitanya | #57 | 1854 | provitanya.com | OpenCart JSON-LD |
         | ProteinMax | #58 | 548 | proteinmax.com.tr | OpenCart HTML |
         | Ceysport | #59 | 894 | ceysport.com | WC HTML (API 403) |
         | Speedwa | #60 | 272 | speedwa.com.tr | custom PHP kategori |
         | Herbinatura | #61 | 45 | herbinatura.com | IdeaSoft microdata |
         | Rova Batarya | #62 | 528 | rovabatarya.com | OpenCart HTML |
         | EYB | #63 | 2886 | eyb.com.tr | T-Soft JSON-LD |
         | Linktech | #64 | 1740 | linktech.com.tr | Odoo microdata |
         | Musullu | #65 | 183 | musullu.com | ikas JSON-LD |
         | BodyFit Shop | #66 | 858 | bodyfitshop.com.tr | AKINSOFT microdata |
         | Cresta | #67 | 211 | crestaofficial.com | custom Laravel OG meta |
         | eProtein | #69 | 572 | eprotein.com.tr | IdeaSoft+CF (Scrapling) |
         | Compex Türkiye | #70 | 161 | compexturkiye.com | WC API+CF (Scrapling) |
         | ProteinAVM | #68 | 279 | proteinavm.com | IdeaSoft+CF (Scrapling) |
         | Powertec | #71 | 89 | powertecshop.com | Ticimax+CF (Scrapling, UA fix 2026-05-24) |

       - **✅ Çözülen sorunlar (2026-05-24):**
         - **proteinavm #68:** retry v2 başarıyla bitti — **279 ürün canlı**
           (350 scrape + 44 duplicate + 27 hata). SCRAPER_TIMEOUT=90 + incremental
           write (her 50 üründe checkpoint) + AggregateOffer.highPrice fix uygulandı.
         - **powertec #71 (CF bypass açıldı!):** `powertec_scraper.py`'da
           `scrape_via_service()` Python-urllib varsayılan UA gönderiyordu,
           Scrapling önündeki CF 403'lüyordu. UA: `Mozilla/5.0` header eklenince
           **bypass çalışıyor** (commit 2733cb37). Incremental write de eklendi
           (commit 4d164ace). 91 URL → 90 scrape → **89 ürün canlı**. Eski subagent
           "ASN bloklu, çözümsüz" yargısı yanlışmış.

       - **🐛 Bug fix'leri (2026-05-23):**
         - **Description CSS kirliliği:** `shopify_scraper.py`'a `clean_description_html()`
           eklendi (`<style>/<script>` bloklarını + baştaki orphan CSS `.cls{}` /
           `/* */` / `@media{}` nested temizler). Tüm yeni mağazalarda toplu DB
           cleanup → **1418 ürün güncellendi, 387KB CSS silindi**.
         - **Hardline sidebar-price-leak (provitanya):** `opencart_scraper.py`
           HTML `.price-new`/`.price-old` unscoped seçtiği için sayfadaki ilgili
           ürünün fiyatını kapıyordu. Fix: JSON-LD `offer.price` kanonik kabul
           edildi, HTML indirim ancak `.price-new` JSON-LD price'a ±1 TL içinde
           tutuyorsa kabul. provitanya **335 fiyat güncellendi + 286 yanlış
           special_price NULL'a çekildi** (re-scrape + sync).
         - **AggregateOffer fallback (ideasoft):** çoklu-varyant ürünlerde
           `offer.price` yokken `lowPrice` yerine `highPrice` alınıyor (under-
           pricing önlemi). proteinavm v2 retry bu fix'le çalışıyor.
         - **Scrapling timeout:** `SCRAPER_TIMEOUT` 60→90 (proteinavm sitemap
           timeout race condition'i çözdü).

       - **Notlar:** eyb sitemap'i ~%75 kategori URL'i (full run gerekli, geçildi);
         IdeaSoft/CF scraper'ları ürün başına ~20-50sn (proteinavm ~5sa, eprotein
         ~3.5sa) → ayrı cron zaman dilimi gerek. eprotein source şu an CF blok
         atıyor → daily sync için bekle/test gerek. `maraton_scraper_v2.py`'de
         Scrapling User-Agent bug'ı not edildi (ileride 403 alırsa UA header).

       - **Kalan:**
         - [X] proteinavm bitince import doğrulama
           - **Codex 2026-05-24:** Canlı read-only doğrulama: store #68 ProteinAVM `products=279`, `approved=279`, `with_image=279`, `variants=279`, `in_stock_variants=177`, `source_mappings=279`. Mapping status dağılımı: `imported=279`.
         - [X] 14 yeni scraper'ı `run-all.sh` + günlük cron'a ekle (VPS, fiyat/
           stok otomatik güncelleme)
           - **Codex 2026-05-24:** `scrapers/run-all.sh` yeni kaynakları sync zincirine ekliyor: maskotmeyvepresleri, provitanya, proteinmax, ceysport, speedwa, herbinatura, rovabatarya, eyb, linktech, musullu, bodyfitshop, crestaofficial, compexturkiye, proteinavm, eprotein, powertec, raketspor. Script hem VPS kök layout'undaki JSON'ları hem repo layout'undaki `data/source-products/*.json` çıktılarını çözüyor; executable bit verildi. Canlı deploy yapıldı; crontab `0 2 * * * /var/www/quikecommerce/scrapers/run-all.sh` aktif. Canlı doğrulama: `bash -n`, Python compile ve `ImportDropickProducts.php` lint temiz.
         - [ ] 703 ürünün boş description'ı admin paneli üzerinden manuel
           doldurulacak (kullanıcı kararı 2026-05-23)
         - [X] powertec için Cloudflare bypass stratejisi (whitelist ya da farklı IP)
           - **Durum:** `powertec_scraper.py` Mozilla UA + Scrapling ile çalışıyor; Powertec #71 için 89 ürün canlı. Alt bölümdeki "Powertec Cloudflare bypass araştırıldı" maddesiyle aynı kapsam.
  - [X] **D. Maraton full catalog — haftalık cron eklendi (2026-05-23)**

    - **`run-maraton-full.sh`** yazıldı + VPS'e deploy: `--urls-from` flag'siz,
      sitemap discovery yapar (~16sa), `maraton_full_products.json`'a yazar
      (günlük outlet'in `maraton_products.json`'una dokunmaz),
      `import:products STORE_ID=47 --status=approved --skip-images --no-interaction`
      ile yeni ürünleri ekler (duplicate'lar slug bazlı atlanır, mevcut 401
      outlet bozulmaz).
    - **Cron entry:** `0 6 * * 0 /var/www/quikecommerce/scrapers/run-maraton-full.sh`
      → Pazar 06:00 UTC = 09:00 TR (günlük cron 05:00 TR'de bitiyor, 1sa boşluk).
    - **Codex 2026-05-24:** Canlı cron logunda script eksikliği görüldü (`run-maraton-full.sh: not found`). Wrapper repo'ya eklendi, VPS'e deploy edildi ve canlıda `bash -n` temiz. Bir sonraki Pazar cron'u bu dosyayı çalıştıracak.
    - **İlk çalışma:** Pazar 2026-05-24 09:00 TR.
    - Bkz. `CLAUDE.md` "BEKLEYEN: Maraton sitemap full scrape" hatırlatması — kapanmıştır.
- [X] **5. Grand Gift Store (#45) — ÇÖZÜLDÜ, USD→TL kural tabanlı fiyatlandırma**

  - **Durum (2026-05-22):** Aktif. Kaynak WooCommerce API
    (`grandapi.tasarimhizmetim.com/wp-json/wc/store/v1`) fiyatları **USD**.
    `grandgiftstore_scraper.py` artık her çalıştığında `exchangerate-api.com`'dan
    USD/TRY kuru çeker ve **`TL = USD × kur × 1.05`** uygular (kâr marjı YOK —
    "kâr kaynak fiyatın içinde", kullanıcı kararı; `%5` kur farkı payı).
  - Kur alınamazsa scraper **abort** eder (exit 1) → run-all.sh sync'i atlar,
    eski fiyatlar korunur.
  - İlk düzeltme: 30 mapping (`--backfill-by-name`), guard geçici kaldırılarak
    (`--max-change-percent=100000`) 30 ürün yeni fiyatlara çekildi (medyan ~2x;
    eski elle-girilmiş fiyatlar kur artışına göre bayatmıştı). Bundan sonra
    günlük cron normal `%30` guard ile devam eder (günlük kur oynamaları küçük).
  - Not: kalan ~5 API ürünü `type=variable` varyant eşleşmesi tutmadığı için
    mapping'siz; istenirse ayrıca ele alınır.

## 🆕 2026-05-24 Yeni İşler — Buglar + İyileştirmeler

> Kullanıcı raporu (canlı sitede gezerken). Codex + Claude Code birlikte tamamlayacak.

### 🐛 Veri/Sync sorunları (Claude Code — investigation + fix)

- [X] **6. Compex + ProteinMax image NULL — BACKFILL TAMAM**
  - **Compex ilk bulgu:** Image URL'leri **Cloudflare korumalı (HTTP 403)**.
    `ImportDropickProducts::importImageFromUrl` PHP `file_get_contents` ile
    çekiyor → CF reddediyor → 0 image record. Düzeltme: `--skip-images` flag
    semantiği değil, **image download'ı da Scrapling service üzerinden** yapan
    fallback gerek. Veya: Media kaydını local file yerine remote URL olarak tut.
  - **ProteinMax (44% NULL):** URL'lerde **escape edilmemiş boşluk** var
    (`https://.../WhatsApp Image 2023-04-11 at 14.04.18-1000x1000.jpeg`).
    `file_get_contents` HTTP 000 dönüyor. Düzeltme: `opencart_scraper`'da
    image URL collection sırasında `urllib.parse.quote` ile escape, veya
    `importImageFromUrl`'de URL normalize.
  - Diğerleri: Provitanya 36/1854 (%1.9), EYB 22/2886 (%0.8) — minor, sonraya.
  - **Toplam etkilenen: 463/11164 ürün (%4.1).**
  - **Codex 2026-05-24:** `ImportDropickProducts::importImageFromUrl` URL path encode + browser header/referrer + invalid image guard ile güçlendirildi. İndirme yine başarısızsa media ID yerine normalize remote URL ürün `image`/`gallery_images` alanına yazılıyor (helper external URL destekliyor). `opencart_scraper.py` image URL normalize ediyor.
  - **Codex 2026-05-24 canlı backfill:** `source-images:backfill` Artisan komutu eklendi ve ProteinMax #58 için uygulandı. Sonuç: ProteinMax `image NULL` **241 → 3**, `gallery_images` dolu ürün **172**. Compex #70 kontrolde zaten **0 NULL**. Kalan 3 ProteinMax üründe kaynak JSON'da kullanılabilir image yok (`Bigjoy Iso Clear ...` 2 ürün + `Fit Bites Protein Bar Muz`).

- [X] **7. Stok uyumsuzlukları — SANMARCO CANLIDA DÜZELDİ**
  - **Provitanya Sanmarco:** kaynakta stok yok, bizde 100 (default) görünüyor.
  - **Linktech:** stok uyumsuzluğu için somut ürün URL/isim örneği gelmedi; toplu DB müdahalesi yapılmadı.
  - Kök neden 1: Sync path bug (FIXED 2026-05-24) — yarınki cron'da otomatik düzelir.
  - Kök neden 2: Scraper'lar `stock_quantity` için kaynak gerçek sayısı yerine
    default 100 atıyor (in_stock true→100, false→0). Sanmarco gibi sources
    `availability=OutOfStock` ataşmamış olabilir. ideasoft_scraper availability
    detection mantığı revize gerek.
  - **Not:** Linktech için kullanıcıdan somut ürün URL/isim örneği gelirse
    kaynak HTML + canlı stok birebir kontrol edilecek.
  - **Codex 2026-05-24:** `opencart_scraper.py` ve `ideasoft_scraper.py` HTML stok metni kontrolü ekledi (`stokta yok`, `stok yok`, `tükendi`, `out of stock`, `sold out`, `gelince haber ver`). `opencart_scraper.py` stok önceliği düzeltildi: HTML'de `tükendi` varsa JSON-LD `InStock` yanlış olsa bile `available=false`.
  - **Codex 2026-05-24 canlı düzeltme:** Provitanya #57 Sanmarco kaynak HTML'inde `tukendi_dty` doğrulandı; 24 Sanmarco ürünün varyant stoğu **100 → 0** çekildi. Doğrulama: `sanmarco_100=0`, `sanmarco_zero=24`. Linktech için somut ürün örneği olmadan toplu DB müdahalesi yapılmadı.

- [X] **8. Rova: kategori mapping sorunu — CANLI BACKFILL TAMAM**
  - Sitemap'te non-batarya ürünler VAR (USAMS kulaklık, vb.), DB'ye yansımamış.
  - rovabatarya_scraper.py'nin filtreleme/parse mantığını incele,
    eksik kategorileri yakala.
  - **Codex 2026-05-24:** Eksik ürün değil kategori mapping sorunu bulundu. `rovabatarya_scraper.py` her ürünü sabit `Telefon Bataryasi & Aksesuar` kategorisine yazıyordu; GA4 `item_category` alanından gerçek kategori okunacak şekilde düzeltildi.
  - **Codex 2026-05-24 canlı backfill:** Rova full re-scrape tamamlandı (**528 ürün**, 434 stokta). Store #62 ürünleri kaynak kategoriye göre güncellendi: Samsung Batarya 149, Xiaomi Batarya 106, Huawei Batarya 80, Telefon Bataryaları 61, iPhone Batarya 58, Honor Batarya 30, Tablet Bataryası 26, General Mobile Batarya 12, Lg Batarya 2, Aksesuarlar 1, Akıllı Saatler 1, Sony Batarya 1, Lenovo Batarya 1. `Usams XD19 Bluetooth Kablosuz Kulaklık` artık `Aksesuarlar` kategorisinde.

- [X] **9. Raketspor mağaza — CODEX KAPSAMI TAMAM, CLOUDFLARE BLOKER DOKÜMANTE**
  - `raketspor.com.tr` CF arkasında (403 homepage), sitemap 200.
  - Powertec ile aynı pattern: Scrapling stealth + Mozilla UA bypass çalışmalı.
  - Yeni `raketspor_scraper.py` (Ticimax veya benzeri), store oluştur, import,
    cron'a ekle. 16. site → 17. site olur (powertec 16'ydı).
  - **Claude Code 2026-05-24:** scraper yazıldı (`raketspor_scraper.py`, powertec
    pattern), store #72 açıldı, full scrape arka planda başlatıldı (~15-20sa,
    3468 ürün), weekly cron eklendi (Pazar 04:00 UTC = 07:00 TR).
  - **Codex 2026-05-24 canlı durum:** Store #72 mevcut fakat ürün/mapping **0**. Full scrape işi durduruldu; tüm ürün detayları scraper-service üzerinden HTTP 524'e düşüyor. Scraper-service sağlıklı (`/health ok`), fakat Raketspor ürün sayfaları ve feed adayları (`google.xml`, `googlebase.xml`, `akakce.xml`, `cimri.xml`) Cloudflare managed challenge/403 veriyor. `raketspor_scraper.py` ilk 30 detay sayfası tamamen bloklanırsa erken çıkacak şekilde güncellendi ve canlıya deploy edildi. Codex tarafında yapılacak kod işi kalmadı; import için Raketspor tarafında whitelist/farklı IP/CF bypass gerekiyor.

- [X] **14. Description'da relatif `<img src="/...">` 404 — DB + SCRAPER FIX TAMAM**
  - Bulgu: Dropick Optimo-40 + 112 ürün description'ında relatif
    `<img src="/image/data/...">` browser sportoonline.com kökü diye yorumluyor → 404.
  - **DB cleanup** (`backend-laravel/scripts/fix_relative_imgs.php`, commit
    `2a92f2a1`): ProductSourceMapping'den source domain parse → 113 ürün
    absolute URL'e çevrildi (Dropick 40 + Linktech 73). 11 mapping'siz atlandı.
  - **Scraper fix (Codex 2026-05-24):** `shopify_scraper.py`'a `resolve_relative_urls(html, base_url)`
    yardımcı fonksiyon eklendi ve tüm aktif scraper'ların description akışına bağlandı.
    `img/src`, `data-src`, `srcset`, `source/src`, `a/href` relatif URL'leri kaynak domain'e
    çevriliyor; `data:`, `mailto:`, `tel:`, `#` korunuyor. Canlı deploy + Python compile temiz.

### 🚨 PERFORMANS — KRİTİK (Codex'e atandı: AGENTS.md Görev 9)

- [X] **15. Site yavaş — BACKEND/API DARBOĞAZI TEMİZLENDİ**
  - **9a TAMAM (commit `89a63d39`):** `StoreDetailsPublicResource.php` `all_products` + `featured_products` `take(20)` eklendi. Sonuç:
    - API store-details: TTFB **6.5s → 0.43s** (15x)
    - Payload: **12.6 MB → 22 KB** (560x)
    - Next.js mağaza sayfası: TTFB **7.4s → 0.45s** (16x)
  - **Önceki kalan hedefler:** Ana sayfa API beklemesi, kategori endpoint'i,
    DB composite index + N+1 audit.
  - Test script: `scripts/perf_test.sh` (commit'li, tekrar ölçüm için).
  - **Codex 2026-05-24:** Public catalog index migration eklendi ve canlıda çalıştırıldı
    (`products_public_catalog_idx`, `products_store_status_idx`,
    `product_variants_public_sellable_idx`, `product_category_public_idx`,
    `stores_customer_view_idx`). `productCategoryList` correlated subquery yerine
    aggregate join + 10 dk Laravel cache kullanıyor.
  - **Canlı ölçüm (VPS, 2026-05-24):** `product-list?per_page=10` **170ms**,
    `store-details/provitanya` **264ms**, `product-category/list` sıcak cache
    **279ms**. Ana sayfa `/tr` **~2.3s TTFB**; önceki 15s/timeout API
    darboğazı temizlendi, kalan süre Next.js SSR/payload optimizasyonu olarak
    ayrı ele alınabilir.

### ✋ Codex'e atanan (AGENTS.md Görev 5-9)

- [X] **10. Ürün detay galeri — duplicate + tıklama** (AGENTS.md Görev 5)
  - `customer-web-nextjs/.../urun/[slug]/product-detail-client.tsx:803`:
    ana görsele tıklayınca lightbox açıyor → istenen: bir sonraki görsele geç
    (`selectedImage = (selectedImage + 1) % allImages.length`).
  - Lines 503-507: `allImages = [variant.image, product.image, ...galleryUrls]`
    → galeri ana görseli içeriyorsa duplicate. URL bazında dedupe gerek.
  - **Codex 2026-05-24:** URL bazında dedupe eklendi; ana görsele tıklama galeri içinde döngüsel ilerliyor. Lightbox ayrı büyütme butonuna taşındı.

- [X] **11. Stoğu tükenenleri gizle + 6 ay yenilenmeyenleri sil** (AGENTS.md Görev 6)
  - Public catalog query'lerinde `stock_quantity > 0` filtresi (zaten
    "resimsizleri gizle" pattern'i commit 6d9b6c31'de var, benzer yaklaşım).
  - Scheduled command: `products.updated_at < NOW() - 6 months` olanları
    soft-delete (deleted_at set). Manuel review için admin'de "stale" filtresi.
  - **Codex 2026-05-24:** `ProductVariant::publiclySellable()` artık `stock_quantity > 0` istiyor; public ürün/kategori/store detay kapsamları buna göre daraldı. `products:prune-stale` komutu ve Pazar 03:00 Europe/Istanbul schedule eklendi. Canlı dry-run: `No stale products older than 6 month(s) found.`

- [X] **12. Header kategori click performansı** (AGENTS.md Görev 7)
  - Üst bar kategori tıklamaları geç tepki veriyor. Profil:
    Next.js route cache, React lazy load, kategori list API'sinin yanıt süresi.
  - Olası fix: kategori meta'yı SSG/ISR ile cache, client navigation prefetch.
  - **Codex 2026-05-24:** header kategori/menu linklerine explicit `prefetch` eklendi; kategori API sorgusu aggregate join + 10 dk backend cache ile hızlandırıldı. Canlı ölçüm: sıcak `product-category/list` **262-315ms**.

- [X] **13. Tüm Ürünler section: kategori rotation random** (AGENTS.md Görev 8)
  - "Tüm ürünler" listesinde her sayfa yüklemesinde **farklı kategoriyle başla**
    (random seed ya da rotating cursor).
  - Hedef: kullanıcı her gelişte farklı içerik görsün, "hep aynı ürünler"
    hissi gitsin. Kategoriler içinde de hafif shuffle olabilir.
  - **Codex 2026-05-24:** anasayfa all-products infinite query saatlik deterministic kategori seed'i ile başlıyor; aynı saat içinde SEO/cache stabil, saat değişince öne çıkan kategori değişiyor.

## 🧹 Kapanmayan Teknik Borç

- [X] Checkout harita akışı: Places hatasını sessiz yutuyor + city/district zorunlu değil (D adımı). → Codex: UI uyarı + city/district zorunluluk + backend 422 eklendi.
- [X] admin-POS / seller / seller-POS fatura+detay bileşenlerinde adres hâlâ eski dağınık formatta. → Codex: ortak tek satır adres formatı uygulandı.
- [X] `InvoiceResource.php:23` `round(null)` DEPRECATED notice. → Codex: nullable tutarlar güvenli round edildi.
- [X] `.gitignore` + `CLAUDE.md` (mail log hatırlatması) commit (commit 6069eda8).

> **2026-05-23 22:55 UTC — Tüm teknik borç ve Codex 4 görevi CANLI DEPLOY:**
> 7 commit `origin/main` 8d0d973c'ye push'landı. VPS: `git pull` + `php artisan
> migrate` (Geliver column) + cache clear. Admin-panel rsync deploy + PM2
> restart. Customer-web npm build + PM2 restart (sitemap force-dynamic fix dahil).
> Smoke test: ana sayfa 200, checkout 200, ürün 200, Geliver endpoint 401 (auth).

## 🏗️ Claude Code (mimar) Devam Eden

- [X] **Maraton full catalog haftalık cron** — `run-maraton-full.sh` + cron Pazar 06:00 UTC = 09:00 TR.
- [X] **Powertec Cloudflare bypass araştırıldı** — VPS IP de 403 (CF challenge), site sahibinden whitelist gerek. Açık not.
- [X] **proteinavm retry bitiş + import** — Canlı doğrulama: store #68 için 279 approved ürün, 279 mapping, 279 görsel.
- [X] **Yarın 05:00 TR ilk full cron run takibi** — 27 scraper günlük + Pazar 09:00 TR Maraton full.
  - **Codex 2026-05-24:** Günlük cron çalışıyor; 2026-05-24 logunda EYB sync temiz (`2886 unchanged`, hata yok), ProteinAVM uzun koşu devam ediyor. Maraton weekly cron script eksikliği düzeltildi ve deploy edildi.
- [X] **yesilmarka 4 ürün incelemesi** — dedicated mağaza mı / musclepump altında mı (kullanıcı kararı).
  - **Codex 2026-05-24:** Scraper bilinçli olarak sadece breadcrumb'da `Sporcu Besinleri` geçen ürünleri alıyor. Canlı JSON 4 ürün içeriyor: Creatine, Protein Shaker 400ml, Whey Protein Tozu, BCAA 4:1:1. Mapping `source_name=yesilmarka` store #33 `Sporcu Besinleri` altında 4 kayıt. Teknik sorun görünmüyor; kalan karar ürünlerin ayrı `Yeşilmarka` mağazasına taşınıp taşınmayacağı.
  - **Karar uygulandı:** Yeşilmarka ayrı mağaza oldu: store #73. 4 ürün ve mapping yeni store'a taşındı; customer-visible store scope doğrulaması `1`.

## 🔔 Tarihli Hatırlatma

- [X] ~2026-05-22: sipariş mail logları okundu. Tek hata: 2026-05-15'te
  `createOrderNotification` — iptal edilen Order #105 için mağaza bildirimi
  insert'i `notifiable_id` null patlamış. **Düzeltildi**:
  `OrderManageNotificationService::notifyStore` artık `store?->seller?->id`
  null ise bildirim oluşturmuyor. SMTP/mail gönderimi sağlıklı.
