# Sportoonline — Yapılacaklar (Sonraki Oturum)

> Oluşturma: 2026-05-15. Önceki oturumda tamamlananlar: Gmail SMTP, Firebase push,
> 5 günlük trafik raporu + ayrı nginx log, Geliver Türkçe il/ilçe fix + #113,
> Google Places API, admin sipariş detayı/fatura adres + isim + temiz format.

## 🎯 Ana İşler

- [~] **1. E-Fatura sistemi adapte** — büyük ölçüde TAMAM, canlı geçiş gated
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
  - **Kalan (sırayla):**

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
- [~] **3. yesilmarka.com scraper — KISMEN, gözden geçirme gerek**
  - Scraper var: `scrapers/yesilmarka_scraper.py` (6329 B), VPS root'ta deploy, cron'da.
  - Mevcut durum: `yesilmarka_products.json` 4 ürün, source mapping 4 kayıt — ama
    **dedicated yesilmarka mağazası YOK** (mappings başka bir mağazaya bağlanmış, muhtemelen musclepump).
  - Sorular: (a) 4 ürün doğru mu, scraper bütün sporcu besinleri kategorisini çekiyor mu yoksa kısıtlı mı? (b) Yeni `yesilmarka` mağazası açıp ürünleri oraya import mi etmeli, yoksa musclepump altında mı tutulsun?
- [~] **4. Elle yüklenmiş mağazalar — BÜYÜK ÖLÇÜDE TAMAM**
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
         - [ ] proteinavm bitince import doğrulama
         - [ ] 14 yeni scraper'ı `run-all.sh` + günlük cron'a ekle (VPS, fiyat/
           stok otomatik güncelleme)
         - [ ] 703 ürünün boş description'ı admin paneli üzerinden manuel
           doldurulacak (kullanıcı kararı 2026-05-23)
         - [ ] powertec için Cloudflare bypass stratejisi (whitelist ya da farklı IP)
  - [X] **D. Maraton full catalog — haftalık cron eklendi (2026-05-23)**

    - **`run-maraton-full.sh`** yazıldı + VPS'e deploy: `--urls-from` flag'siz,
      sitemap discovery yapar (~16sa), `maraton_full_products.json`'a yazar
      (günlük outlet'in `maraton_products.json`'una dokunmaz),
      `import:products STORE_ID=47 --status=approved --skip-images --no-interaction`
      ile yeni ürünleri ekler (duplicate'lar slug bazlı atlanır, mevcut 401
      outlet bozulmaz).
    - **Cron entry:** `0 6 * * 0 /var/www/quikecommerce/scrapers/run-maraton-full.sh`
      → Pazar 06:00 UTC = 09:00 TR (günlük cron 05:00 TR'de bitiyor, 1sa boşluk).
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
- [ ] **proteinavm retry bitiş + import** (devam ediyor)
- [ ] **Yarın 05:00 TR ilk full cron run takibi** — 27 scraper günlük + Pazar 09:00 TR Maraton full.
- [ ] **yesilmarka 4 ürün incelemesi** — dedicated mağaza mı / musclepump altında mı (kullanıcı kararı).

## 🔔 Tarihli Hatırlatma

- [X] ~2026-05-22: sipariş mail logları okundu. Tek hata: 2026-05-15'te
  `createOrderNotification` — iptal edilen Order #105 için mağaza bildirimi
  insert'i `notifiable_id` null patlamış. **Düzeltildi**:
  `OrderManageNotificationService::notifyStore` artık `store?->seller?->id`
  null ise bildirim oluşturmuyor. SMTP/mail gönderimi sağlıklı.
