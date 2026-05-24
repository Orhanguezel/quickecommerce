# AGENTS.md — QuickEcommerce / Codex Görev Listesi

> **Codex için talimat:** Bu dosya Claude Code'un (mimar) sana atadığı görevleri içerir.
> Genel kurallar: [`CLAUDE.md`](./CLAUDE.md), durum/bağlam: [`YAPILACAKLAR.md`](./YAPILACAKLAR.md).
> Canlı sunucu erişimi: `ssh vps-sportoonline` (parolasız key auth).
> **Live DB**: `php artisan db:seed` ASLA çalıştırma (CLAUDE.md uyarısı). Bireysel `--class` ile bile çok dikkatli.

## Canlı Erişim Notu

Canlı server `vps-sportoonline` SSH kısa yolundadır. Sunucu yolu: `/var/www/quikecommerce/`. Frontend Next.js + Laravel backend. Admin paneli `admin-panel/`, müşteri web `customer-web-nextjs/`.

---

## Aktif Görevler (Öncelik Sırasına Göre)

### 🎯 Görev 1 — Geliver: satıcı bazlı sender address (orta-büyük)

**Bağlam:** Şu an Geliver kargo gönderimleri tek global sender address ID (`8ba4a825-…`) kullanıyor. Her satıcının kendi adresinden alınması istendi. Backend altyapı **hazır**: `GdeliveryService::buildShipmentData` zaten `store->geliver_sender_address_id ?? global` sırasını destekliyor — sadece data + UI eksik.

**Yapılacaklar:**
1. **Backend — stores tablosuna kolon ekle (yoksa):** `geliver_sender_address_id` (varchar nullable). Migration veya zaten varsa atla.
2. **Backend — Geliver sender address oluşturma servisi:**
   - `App\Services\Geliver\GeliverSenderAddressService` (yeni) — Geliver API'sine sender address POST eder, dönen ID'yi store'a yazar.
   - Endpoint: `POST /admin-api/v1/stores/{id}/geliver-sender-address` (sender address create/sync) ve `GET` (mevcut durumu döndür).
   - Form alanları: ad, soyad, telefon, e-posta, adres, il, ilçe (Türkçe — `geliver_ascii_normalize` KULLANMA, son fix Türkçe il/ilçeyi koruyor; bkz commit `ac8d8269`).
3. **Admin panel UI:** `admin-panel/src/components/blocks/admin-section/stores/...` altında mağaza düzenleme formuna **"Geliver Gönderici Adresi"** sekmesi ekle. Mağaza store_seller_id'si varsa o satıcının seller adresinden auto-fill önerisi sun.
4. **Seller panel UI:** Satıcının kendi mağazasını yönettiği ekranda da aynı bölüm (kendi adresini bağlasın).
5. **Test:** Birkaç store için sender address bağla → bir order'ı bu store'dan oluştur → Geliver'a giden payload'da `senderAddressId` doğru ID mi diye `storage/logs/` veya GdeliveryService log'undan teyit et.

**Kapsam dışı:** Geliver API key/credential ayarları (zaten config'te). Recipient adresi (zaten çalışıyor).

**Bitti tanımı:**
- En az 2 satıcı için ayrı sender address ID yazılı
- Test siparişi onların kendi adresinden alınıyor (Geliver dashboard'unda görünür)
- Global fallback hâlâ çalışıyor (eski stores için)

**İlgili dosyalar:**
- `backend-laravel/app/Services/Geliver/GdeliveryService.php` (buildShipmentData)
- `backend-laravel/config/services.php` (geliver bloğu)
- `backend-laravel/app/Models/Store.php`
- `admin-panel/src/modules/store/` ve `admin-panel/src/components/blocks/admin-section/stores/`

---

### 🛒 Görev 2 — Checkout harita akışı: Places hatası + city/district zorunluluk (orta)

**Bağlam:** Checkout sayfasında Google Places API hatası sessizce yutuluyor → müşteri il/ilçe seçmeden devam edebiliyor → backend'e eksik adres geliyor. Yeni siparişler baştan doğru formatta gelmeli (admin tarafında zaten temizlenmişti — bkz commit `b6225826`).

**Yapılacaklar:**
1. **Frontend (`customer-web-nextjs`)** — checkout adres adımında (`D adımı`):
   - Places API çağrısında hata yakalandığında **kullanıcıya görünür uyarı** (toast veya inline error).
   - `city` ve `district` form alanları **zorunlu** (Zod schema'da `.min(1)` veya `.nonempty()`).
   - Submit butonu disabled olsun bunlar boşken.
2. **Backend (`backend-laravel`)** — order create endpoint'inde defensive validation:
   - `OrderCreateRequest` (FormRequest) içinde `city` + `district` `required|string` doğrulaması ekle (yoksa).
   - 422 dönsün eksikse.
3. **Test:** Checkout'tan il/ilçe seçmeden submit deneyince UI engellesin; API direct çağrıda 422 dönsün.

**Bitti tanımı:**
- Manual test: Places kapalıyken (network kesik) checkout submit edilemez
- Şehir/ilçe boş submit edildiğinde net hata mesajı
- Backend 422 ile reddediyor

**İlgili dosyalar:**
- `customer-web-nextjs/src/app/[locale]/checkout/...` (adres formu, Places integration)
- `customer-web-nextjs/src/modules/checkout/` (Zod schema)
- `backend-laravel/app/Http/Controllers/Api/V1/Customer/CustomerOrderController.php`
- `backend-laravel/app/Http/Requests/.../OrderCreateRequest.php` (varsa)

---

### 🧾 Görev 3 — Admin-POS / seller / seller-POS fatura+detay adres formatı (küçük-orta)

**Bağlam:** Admin sipariş detay + fatura sayfaları temizlenmişti (commits `b6225826`, `f3adcf29`, `e3477661`) ama admin-POS, seller paneli ve seller-POS bileşenleri hâlâ eski dağınık adres formatında.

**Yapılacaklar:**
1. **Pattern bul:** `admin-panel/src/components/blocks/admin-section/orders/...` altında düzeltilmiş `OrderAddressDisplay` veya benzer komponent. Aynı formatı uygula:
   - Müşteri adı + telefon en üstte
   - Adres tek temiz satır: "Mahalle, Cadde No, Daire — İlçe / İl"
2. **Uygulanacak yerler:**
   - admin-panel POS detay (sipariş kartı + fatura) — `admin-panel/.../pos/...`
   - seller-panel sipariş detay + fatura — `admin-panel/.../seller-section/orders/...` (veya seller'ın repo'su)
   - seller-POS — `admin-panel/.../seller-section/pos/...`
3. **Veri kaynağı**: `order.orderMaster.orderAddress` (referans için admin-orders'a bak).

**Bitti tanımı:**
- Üç bileşende de adres tek satır temiz format
- Fatura çıktısında müşteri adı + adres düzgün

**İlgili dosyalar:**
- Önceki PR/commit'lerdeki düzeltmeler (admin-orders) referans: `git log --oneline | grep -i "fatura\|adres"` → ilgili commit'ler.

---

### 🖼️ Görev 5 — Ürün detay galeri: duplicate first image + click-to-next (orta)

**Bağlam:** Kullanıcı raporu (2026-05-24): "ürün detayda ilk resim 2 kez geliyor, tıklayınca diğer resme geçmesini istiyorum".

**Dosya:** `customer-web-nextjs/src/app/[locale]/urun/[slug]/product-detail-client.tsx`

**Yapılacaklar:**

1. **Duplicate first image fix (~satır 503-507):**
   ```ts
   const allImages = [selectedVariant?.image_url, product.image_url, ...galleryUrls].filter(Boolean) as string[];
   ```
   → URL bazında dedupe ekle:
   ```ts
   const allImages = Array.from(new Set([selectedVariant?.image_url, product.image_url, ...galleryUrls].filter(Boolean))) as string[];
   ```
   Kök neden: backend `gallery_images_urls` bazen ana görseli de içeriyor → dedupe scope frontend'de yeterli.

2. **Main image click → next image (~satır 803):**
   Şu an:
   ```ts
   onClick={() => allImages[normalizedImageIndex] && openLightbox(normalizedImageIndex)}
   ```
   → değiştir:
   ```ts
   onClick={() => setSelectedImage((prev) => (prev + 1) % allImages.length)}
   ```
   Lightbox açma butonu (büyüteç ikonu) ayrı kontrol olarak kalabilir veya silinebilir — kullanıcı kararı.

3. **Tip uyarı:** `customer-web-nextjs/src/modules/product/product.type.ts:42` `gallery_images_urls: string[]` yanlış — backend string veya tek URL dönüyor, `string | string[] | null` olmalı.

**Bitti tanımı:** İki resimli ürünlerde ilk resim 1 kez görünür; ana görsele tıklayınca galeri içinde döngüsel ilerler.

---

### 📦 Görev 6 — Stoğu tükenenleri gizle + 6 ay yenilenmeyenleri auto-delete (orta)

**Bağlam:** Kullanıcı raporu (2026-05-24): "stoğu tükenmiş ürünler listelenmesin, belli bir süre yenilenmesse (örn. 6 ay) ürün sistemden silinsin."

**Yapılacaklar:**

1. **Public catalog filter:** Müşteri-facing API endpoint'lerinde (product-list, store-details, category-list, search) `stock_quantity > 0` filtresi ekle.
   - Referans: commit `6d9b6c31` "Hide products without images from public catalog" — aynı pattern.
   - Admin/seller paneller etkilenmez (hepsi görsün).
   - Backend: ProductResource / public scope query'lerinde join `product_variants` → `where('stock_quantity', '>', 0)`. Variant ALL out-of-stock olunca ürün hidden.

2. **Auto-delete scheduled command:**
   - `php artisan make:command PruneStaleProducts`
   - Logic: `Product::where('updated_at', '<', now()->subMonths(6))->whereDoesntHave('orderDetails')->delete()` (soft-delete; siparişe bağlı olanları koru).
   - Schedule: `app/Console/Kernel.php` → weekly Pazar 03:00 TR.
   - Test: bir-iki eski ürünle çalışıp doğrula.

**Bitti tanımı:**
- Müşteri sitede stoğu 0 ürünler GÖRÜNMEZ; admin'de görünür.
- Schedule kayıtlı; manuel `php artisan schedule:run` ile tetiklenebilir.

---

### ⚡ Görev 7 — Header kategori click performansı (orta)

**Bağlam:** Kullanıcı raporu (2026-05-24): "üst bar kategori tıklamaları geç tepki veriyor, sistem hızlandırma yapmamız gerekiyor".

**Yapılacaklar:**

1. **Profil:**
   - Chrome DevTools Network: kategori click sonrası ne kadar süre, hangi request en yavaş?
   - Backend yanıt süresi: `php artisan tinker` ile category-list endpoint, products?category=X endpoint'lerini ölç.
   - Next.js client navigation prefetch çalışıyor mu (`<Link prefetch={true}>` veya default)?

2. **Olası fix'ler:**
   - Kategori listesi: SSG veya ISR (`revalidate=3600`) ile build-time cache.
   - Header'da `<Link prefetch>` zorla.
   - Backend category endpoint'ine Redis cache (1 saatlik TTL) — Laravel `Cache::remember`.
   - Products by category query'sine eager loading + index review.

3. **Frontend skeleton/optimistic UI:** click sonrası anlık skeleton göster, arkadan data yüklensin.

**Bitti tanımı:** Kategori click → ilk render altında 500ms (P90).

---

### 🚀 Görev 9 — KRİTİK: Site performans optimizasyonu (büyük, çok-katmanlı)

**Bağlam (2026-05-24 perf test sonuçları):** Ürün sayısı 13607'ye çıktı, ana sayfa **9.7sn TTFB**, kategori sayfası **8.3sn**, Provitanya mağaza sayfası **7.4sn TTFB + 12.6 MB payload**. Kabul edilemez. Müşteri kaybı garanti.

**Test komutu** (yeniden ölçmek için): `/tmp/perf_test.sh` (lokalde var, repo'ya commit edilebilir).

**Tespit edilen 3 ana sorun:**

#### 9a. `store-details` endpoint'i tüm ürünleri payload'a koyuyor — 12.6 MB

**Dosya:** `backend-laravel/app/Http/Resources/Seller/Store/StoreDetailsPublicResource.php:68`

Şu an:
```php
'all_products' => StoreProductListPublicResource::collection(
    $this->products()->publiclySellable()
        ->with(['variants' => fn($q) => $q->publiclySellable()->withoutTrashed()->take(1)])
        ->latest()->get()  // ← TÜM ürünler! Provitanya'da 1854 kayıt
),
```

Provitanya store-details response: 12.6 MB, 2.4 MB sadece `all_products` JSON serialization.

**Fix:** ya `->take(20)->get()` ile ilk 20 ürünle sınırla, ya da `all_products`'u TAMAMEN KALDIR ve frontend `/api/v1/product-list?store_id=X` paginated endpoint kullansın. Frontend tarafında `magaza/[slug]/store-detail-client.tsx`'in `all_products`'u nasıl kullandığını incele, gerekirse pagination'a geç.

**Beklenen etki:** mağaza sayfası 7.4s → ~500ms, payload 12.6 MB → ~50 KB.

#### 9b. Ana sayfa 10 paralel API çağrısı, cache yok

**Dosya:** `customer-web-nextjs/src/app/[locale]/page.tsx:82-91`

Ana sayfa server-side 10 endpoint çağırıyor (SLIDER, CATEGORIES per_page=500, FEATURED, NEW_ARRIVALS, BEST_SELLING, TRENDING, FLASH_DEALS, FLASH_DEAL_PRODUCTS, POPULAR_PRODUCTS, BLOGS). Paralel ama en yavaş call total süreyi belirler.

**Backend cache layer:** `.env` `CACHE_STORE=redis` set ama API endpoint'leri kullanmıyor (her request fresh DB hit). Laravel controller'larda:
```php
return Cache::remember("home:featured_products:{$locale}", 3600, function () {
    // mevcut query
});
```
Her endpoint'e 1 saatlik TTL cache ekle. Featured/NewArrivals/BestSelling/Trending/Popular/FlashDeals/Slider/Blogs için ayrı cache key'ler.

**Beklenen etki:** Ana sayfa cache miss durumunda hala 7s (ilk request), cache hit'te <500ms. Cache invalidation: ürün/mağaza/banner CRUD'unda ilgili cache key flush et.

#### 9c. DB query optimizasyonu — N+1 + index eksikleri

**Audit:**
- `php artisan tinker --execute="DB::enableQueryLog(); /* call endpoint */; print_r(DB::getQueryLog());"` ile N+1 ara
- `EXPLAIN` ile slow query analizi
- `products.status` + `product_variants.stock_quantity` composite index ekle (Codex 2026-05-23 stok filter sonrası slow olabilir)
- `products.store_id` + `products.deleted_at` + `products.status` composite index (publiclySellable scope için)
- `with(['variants', 'brand', 'category', 'store'])` eager loading'in her ürün resource'ünde tutarlı uygulandığını doğrula

**Beklenen etki:** Backend API her endpoint 200-400ms'den 50-150ms'ye iner.

---

**Görev önceliği:** 9a (en hızlı kazanım, tek dosya) → 9b (Redis cache, 10+ controller endpoint) → 9c (index migration + audit).

**Bitti tanımı:**
- Ana sayfa TTFB < 1s (cache hit)
- Mağaza sayfası TTFB < 1s (her mağaza için, ürün sayısından bağımsız)
- Kategori sayfası TTFB < 1s
- `/tmp/perf_test.sh` çıktısında tüm endpoint'ler yeşil.

---

### 🎲 Görev 8 — Tüm Ürünler section: kategori rotation random (orta)

**Bağlam:** Kullanıcı raporu (2026-05-24): "tüm ürünler section'ında kategorilere göre ürünler gelsin. Ama hangi kategori ile başlayacağı random olsun. Ben sitede hep aynı ürünler varmış gibi olsun istemiyorum."

**Yapılacaklar:**

1. **"Tüm ürünler" anasayfa section'ı bul** — `customer-web-nextjs/src/app/[locale]/page.tsx` ve modular bileşenlerinde.

2. **Backend veya frontend rotation:**
   - **Frontend tarafı:** her sayfa load'da `categories[seed % categories.length]` ile başla. Seed = `Date.now() / (1000 * 60 * 60)` (saatte değişir) veya `Math.random()` (her load).
   - **Backend tarafı (önerilen):** category list endpoint'ine `?seed=X` query param, backend deterministic shuffle. Cache friendlier.

3. **Kategoriler içinde de hafif shuffle:** Her kategorinin ürünleri de küçük random offset ile (ilk 20 yerine 21-40 sonra 41-60).

4. **SEO etkisi:** Sayfa içeriği random olunca search engine kafa karışabilir. Önerilen: server-side aynı seed kullan (saatlik), URL'de `?seed=`'i tutma. Hostname + saat → tutarlı seed.

**Bitti tanımı:** Anasayfada her ziyarette (veya saatlik) farklı kategoriler ön planda. Aynı seed ile aynı sıra → SEO stabil.

---

### 🔧 Görev 4 — Mikro: `InvoiceResource.php:23` `round(null)` deprecated notice (xs)

**Bağlam:** PHP 8.1+'da `round(null)` deprecated → log'larda gürültü.

**Yapılacaklar:**
1. `backend-laravel/app/Http/Resources/InvoiceResource.php:23` satırını aç.
2. `round($value)` ifadesini `round($value ?? 0)` veya `$value !== null ? round($value, 2) : null` yap.
3. Test çıktısında deprecated notice gitmesi.

**Bitti tanımı:**
- `php artisan tinker --execute="dd(new App\Http\Resources\InvoiceResource(...))"` çıktıda warning yok.

---

## Genel Kurallar

- **Branch:** Her görev için ayrı branch (`codex/gorev-N-kisa-aciklama`). Sonunda PR aç.
- **Test:** PHPUnit varsa çalıştır. Frontend için `bun run lint` + `bun run build` çalıştır.
- **Live DB'ye dokunma:** Migration'ları local'de test et. `php artisan migrate` canlıda son adım, manuel olarak çalıştırılacak — sen PR'da migration dosyasını verirsen yeterli.
- **Türkçe karakter:** Geliver fix'i nedeniyle Türkçe il/ilçe **ASCII normalize edilmez**. Yeni kodda da koruma (`İstanbul`, `Şişli` vb. olduğu gibi).
- **Test verisi:** `php artisan db:seed` ASLA. Sadece `--class=X` ile ve dikkatle.
- **Tamamlanan görevi işle:** YAPILACAKLAR.md'de ilgili maddeyi `[X]` veya `[~]` yap, PR linkini koy.

---

## Claude Code (mimar) Tarafından Yapılan / Yapılacak

- Item 4 (elle-mağaza tasfiyesi): ✅ TAMAM (15 scraper, 10797 ürün canlı, 1223 eski ürün soft-delete)
- run-all.sh + cron: ✅ 27 scraper eklendi (2026-05-23)
- proteinavm retry: 🔄 devam ediyor (~5sa)
- Maraton full catalog scrape: 📋 ayrı haftalık cron planlanacak
- Powertec CF bypass: 📋 araştırılacak (whitelist veya farklı IP stratejisi)
