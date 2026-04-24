# Tavsiye Motoru & Funnel Stratejisi — QuickEcommerce

**Hazırlayan:** Claude Code (Mimar)
**Tarih:** 2026-04-23
**Kapsam:** Sportoonline.com (customer-web-nextjs + backend-laravel)

---

## 1. Yönetici Özeti

Bu belge, **sepete ekleme sırasında ve sonrasında** devreye girecek bir tavsiye motoru ile, **kullanıcının ilk ziyaretinden satın alma sonrasına kadar** uzanan bir **satış tüneli (conversion funnel)** mimarisini önerir.

**Hedef:**
- Sepet ortalama tutarını (AOV) **%15–30** artırmak
- Sepet terk oranını **%20** azaltmak
- Dönüşüm oranını (CR) **%10** yukarı çekmek
- "Tekrar satın alma" oranını artırmak

**Strateji özeti:**
Mevcut altyapı (flash sale, shipping campaigns, recently viewed, wishlist) tavsiye motorunun iskeletini zaten sağlıyor. Yapmamız gereken, bu parçaları **funnel aşamalarına göre koordine eden bir orkestrasyon katmanı** eklemek ve **sepete özel 6 farklı tavsiye bloğu** geliştirmek.

---

## 2. Mevcut Durum — Repo Analizi

Aşağıdaki özellikler zaten mevcut ve tavsiye motorunun **yapı taşları** olarak kullanılabilir:

| Özellik | Konum | Kullanım Potansiyeli |
|---------|-------|----------------------|
| Cart store (Zustand) | `src/stores/cart-store.ts` | Sepet içeriği okuma |
| Recently viewed (localStorage) | `src/stores/recently-viewed-store.ts` | Kişiselleştirme sinyali |
| Wishlist | `src/modules/wishlist/` | Güçlü satın alma niyeti sinyali |
| Flash sale system | `backend-laravel/app/Models/FlashSale.php` | Aciliyet hissi |
| Shipping campaigns | `shipping_campaigns` tablosu (min_order_value) | Eşik bazlı upsell |
| Coupons (min_order_value) | `coupons` tablosu | Eşik bazlı upsell |
| Popular/Trending/BestSelling | `FrontendController` | Sosyal kanıt |
| Related products | `RelatedProductPublicResource` | Cross-sell temeli |
| Categories + subcategories | `ProductCategory` | İçerik tabanlı filtreleme |
| Product tags | `products.tag` | Benzerlik hesaplama |
| Order history (kullanıcı girişi) | `orders` tablosu | Collaborative filtering |

**Eksikler:**
- Sepet anında tetiklenen tavsiye API'si yok
- "Sıkça birlikte alınanlar" (co-purchase matrix) hesabı yok
- Sepet terk e-maili yok
- Funnel aşamalarını takip eden unified analytics yok
- Bundle (paket) ürün yapısı yok

---

## 3. Funnel (Satış Tüneli) Mimarisi

Kullanıcı yolculuğunu 6 aşamaya bölüyoruz. **Her aşamaya özel tavsiye tipi** var.

```
┌──────────────────────────────────────────────────────────────┐
│  1. AWARENESS        │ Ana sayfa, arama, kategori           │
│  → popüler ürünler, flash sale, banner                       │
├──────────────────────────────────────────────────────────────┤
│  2. INTEREST         │ Ürün detay sayfası                   │
│  → related products, "bu mağazadan", incelenen benzerler    │
├──────────────────────────────────────────────────────────────┤
│  3. CONSIDERATION    │ Sepete ekleme, favori, karşılaştırma │
│  → "birlikte alınanlar", "%X indirim için Y TL ekle"        │
├──────────────────────────────────────────────────────────────┤
│  4. INTENT           │ Sepet sayfası, ödemeye git butonu    │
│  → son dakika upsell, kargo eşiği, kupon                    │
├──────────────────────────────────────────────────────────────┤
│  5. PURCHASE         │ Ödeme sayfası, onay                  │
│  → sepete ek ürün önerisi (impulse), son kargo uyarısı      │
├──────────────────────────────────────────────────────────────┤
│  6. POST-PURCHASE    │ Sipariş takip, tekrar sipariş        │
│  → "bir dahaki sefer", tamamlayıcı ürün, loyalty            │
└──────────────────────────────────────────────────────────────┘
```

Bu belge özellikle **3. CONSIDERATION** ve **4. INTENT** aşamalarına odaklanır.

---

## 4. Sepet Tavsiye Motoru — 6 Blok Stratejisi

Sepet/sepet drawer ve sepet sayfasında gösterilecek tavsiye blokları. Sırayla **ROI'si en yüksek** olandan başlıyorum.

### Blok 1 — "Kargo Bedava İçin X TL Daha Ekle" (EN YÜKSEK ÖNCELİK)

**Mevcut durum:** `shipping_campaigns` tablosu ve `min_order_value` alanı zaten var.
**Eksik:** Sepet içinde kullanıcıya görsel olarak gösterilmiyor.

**Strateji:**
- Sepet drawer'ın üstünde bir **progress bar** + "67 TL daha ekle, kargo bedava" mesajı
- Eşik dolunca konfeti/yeşil ikon ("Kargo bedava kazandın! 🎉")
- Eşiğin **%20 altında** olan ürünlerden 3 tane öner (fiyat uyumlu)

**Algoritma:**
```
missingAmount = shippingThreshold - cartTotal
candidates = products
  .where(price >= missingAmount * 0.8 AND price <= missingAmount * 1.5)
  .where(category IN cart.categories OR category IN user.recentlyViewed.categories)
  .orderBy(popularity)
  .limit(6)
```

**Beklenen etki:** AOV **+15%**, bedava kargo eşiğini aşan sepet oranı 2x.

---

### Blok 2 — "Sıkça Birlikte Alınanlar" (Cross-sell)

**Amaç:** Klasik Amazon mantığı. "Bu ürünü alanlar şunu da aldı."

**Algoritma seçenekleri:**

**A) Kural tabanlı (MVP — 1 hafta):**
- `orders` tablosunda aynı siparişte bulunan ürün çiftlerini sayar
- Redis cache'de `co_purchase:{product_id}` → top 10 ürün listesi tutar
- Günlük cron ile günceller

```sql
SELECT p2.product_id, COUNT(*) as freq
FROM order_items oi1
JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi1.product_id != oi2.product_id
WHERE oi1.product_id = ?
GROUP BY oi2.product_id
ORDER BY freq DESC
LIMIT 10
```

**B) İçerik tabanlı (fallback, yeterli sipariş verisi yoksa):**
- Aynı kategori + benzer fiyat aralığı + aynı mağaza
- Tag örtüşmesi (Jaccard similarity)

**C) Hibrit (nihai hedef):**
- Sipariş verisi varsa A, yoksa B. Soğuk başlangıç (cold start) çözümü.

**UI:** Sepet drawer altında yatay carousel — "Sıkça Birlikte Alınanlar".

**Beklenen etki:** Sepete eklenen ürün sayısı **+25%**.

---

### Blok 3 — "Kupon Eşiği için Y TL Daha Ekle"

**Mevcut durum:** Kupon sistemi var, `min_order_value` alanı mevcut.
**Strateji:**
- Kullanıcının sepetinde geçerli olabilecek **aktif kuponları** sorgula
- En yakın eşikli kuponu bul: örn. "500 TL üzeri %15 indirim (SEPET15)"
- "62 TL daha ekle, SEPET15 kuponuyla %15 indirim kazan" mesajı
- Eşik altındaki kupon otomatik uygulanmamalı, görsel ipucu yeterli

**Notifikasyon:** Eşik dolunca toast: "🎉 SEPET15 kuponu artık geçerli, kullanmak ister misin?"

---

### Blok 4 — "Favorilerinden Öner" (Wishlist Triggered Recommendation)

**Hedef:** Sepete eklemeyip sadece favorilere atılmış ürünleri hatırlatmak.

**Koşul:** Kullanıcı giriş yapmış VE wishlist'te ürün var VE bu ürünlerden biri flash sale'de.

**UI:** "Favorilerinden bunlar seni bekliyor — biri şimdi indirimde!"

**Aciliyet:** Flash sale varsa countdown ekle. Stok düşükse "Son 3 adet" badge.

**Beklenen etki:** Wishlist → cart dönüşüm oranı **+40%**.

---

### Blok 5 — "Son Görüntülediklerinden" (Already Built)

Tavsiye bloğu olarak **sepet sayfasında** da göster. Ana sayfadan alıp sepete ekledi mi? Eğer eklemediyse hatırlat.

**Filter:** Sepette olmayan, son 20 içinden en yeni 6 tane.

---

### Blok 6 — "Bu Kategoride Popüler" (Contextual)

**Strateji:** Sepetteki baskın kategoriyi tespit et, o kategorinin en popüler 6 ürününü öner.

**Sepette "Kamp çadırı" varsa:**
- Outdoor kategorisinde popüler ürünler: kamp ocağı, uyku tulumu, fener

**Algoritma:**
```
dominantCategory = mostFrequent(cart.items.map(i => i.category))
recommendations = products
  .where(category = dominantCategory)
  .where(id NOT IN cart.itemIds)
  .orderBy(orders_count DESC)
  .limit(6)
```

---

## 5. Aciliyet & Sosyal Kanıt Öğeleri (Psychological Levers)

Bu öğeler tavsiye bloklarına **eklenir**, ayrı blok değildir. Ama dönüşümü ciddi artırırlar.

### 5.1 Stok Aciliyet Göstergesi
- `stock_quantity <= 5` ise ürün kartında kırmızı "Son 5 adet!" etiketi
- `stock_quantity <= 2` ise yanıp sönen uyarı

### 5.2 Sosyal Kanıt Sayaçları
- "Bu ürün bu hafta 147 kere alındı" (orders son 7 gün)
- "Şu an 12 kişi sepetine eklemiş" (real-time, WebSocket ile — nice-to-have)
- "4.8 ⭐ (230 değerlendirme)"

### 5.3 Zaman Kısıtlı Teklif
- Sepet drawer'ında: "Bu fiyatı 10 dakika boyunca koruyacağız" — placeholder countdown
- Gerçek bir kısıtlama olmasa da FOMO yaratır

### 5.4 Kişiselleştirilmiş Selamlama
- "Selam Orhan, geçen sefer ilgilendiğin ürünler:"
- Login olmuş kullanıcıda

---

## 6. Sepet Terk (Abandoned Cart) Stratejisi

Kullanıcı sepete ekler ama ödemeyi tamamlamaz. Mevcut repoda bu akış **yok**. Eklenmesi gereken:

### 6.1 Backend — Sepet snapshot kaydı
- `abandoned_carts` tablosu: `user_id`, `cart_items (JSON)`, `cart_total`, `abandoned_at`, `recovered_at`
- Kullanıcı sepete ekledikten 30 dakika sonra etkileşim yoksa → "terk edilmiş" sayılır

### 6.2 Recovery Kanalları
| Kanal | Zamanlama | Mesaj |
|-------|-----------|-------|
| Email #1 | 1 saat sonra | Basit hatırlatma, sepet içeriği |
| Email #2 | 24 saat sonra | "%10 indirim kuponu" ile |
| Push notification | 4 saat sonra | Kısa, "sepetinde X ürün seni bekliyor" |
| SMS (opsiyonel) | 48 saat sonra | Yüksek değerli sepetlerde (>1000 TL) |

### 6.3 Exit-Intent Popup
- Kullanıcı mouse'u browser kapat butonuna götürdüğünde → popup
- "Çıkmadan önce — sepetin için %5 indirim kuponu: AYRILMA5"
- Session-based, aynı oturumda bir kez

**Beklenen etki:** Sepet terk oranı **%68 → %55**, geri kazanılan gelir **+8%**.

---

## 7. Teknik Mimari

### 7.1 Backend — Yeni Endpoint

```
POST /api/v1/cart/recommendations
Body: {
  cart_items: [{ product_id, variant_id, quantity, price }],
  session_id: "...",
  user_id: number | null  // Auth'dan gelir
}

Response: {
  shipping_progress: {
    current_total: 430,
    threshold: 500,
    missing: 70,
    campaign_name: "1000 TL Bedava Kargo"
  },
  coupon_progress: {
    coupon_code: "SEPET15",
    discount_percent: 15,
    missing: 62
  },
  blocks: [
    {
      type: "frequently_bought_together",
      title: "Sıkça Birlikte Alınanlar",
      products: [...]
    },
    {
      type: "category_popular",
      title: "Kamp Ekipmanlarında Popüler",
      products: [...]
    },
    // ...
  ]
}
```

### 7.2 Backend — Servis Katmanı

```php
app/Services/Recommendation/
├── RecommendationOrchestrator.php   // Ana orkestratör, blokları sıralar
├── Strategies/
│   ├── CoPurchaseStrategy.php       // Sıkça birlikte alınanlar
│   ├── CategoryPopularStrategy.php  // Kategoride popüler
│   ├── WishlistTriggeredStrategy.php
│   ├── ShippingThresholdStrategy.php
│   └── RecentlyViewedStrategy.php
└── Repositories/
    └── CoPurchaseRepository.php     // Redis-cached co-purchase matrix
```

Her strategy aynı interface'i implement eder:
```php
interface RecommendationStrategy {
    public function recommend(CartContext $ctx): Collection;
    public function priority(CartContext $ctx): int;  // Sıralama için
    public function isApplicable(CartContext $ctx): bool;
}
```

### 7.3 Frontend — Component Yapısı

```
src/components/cart/
├── cart-recommendations.tsx          // Ana container, API'den data çeker
├── blocks/
│   ├── shipping-progress-bar.tsx
│   ├── coupon-progress-bar.tsx
│   ├── frequently-bought-block.tsx
│   ├── category-popular-block.tsx
│   └── wishlist-reminder-block.tsx
└── atoms/
    ├── urgency-badge.tsx            // "Son 3 adet"
    └── social-proof-badge.tsx       // "147 kere alındı"
```

### 7.4 Co-Purchase Matrix — Cron Job

```php
// app/Console/Commands/BuildCoPurchaseMatrix.php
// Günlük 03:00'te çalışır

$pairs = DB::table('order_items as oi1')
    ->join('order_items as oi2', function($j){
        $j->on('oi1.order_id', '=', 'oi2.order_id')
          ->where('oi1.product_id', '!=', 'oi2.product_id');
    })
    ->select('oi1.product_id as a', 'oi2.product_id as b', DB::raw('COUNT(*) as freq'))
    ->groupBy('oi1.product_id', 'oi2.product_id')
    ->having('freq', '>=', 2)
    ->get();

// Redis'e yaz: co_purchase:{product_id} → [top 10 product IDs]
foreach ($grouped as $productId => $related) {
    Redis::set("co_purchase:{$productId}", json_encode($related), 'EX', 86400 * 2);
}
```

---

## 8. Faz Bazlı Uygulama Planı

### Faz 1 — MVP (2 hafta) — **"Hızlı kazanımlar"** ✅ TAMAMLANDI
- [x] Kargo progress bar (sepet drawer + sepet sayfası)
- [x] Kupon progress bar
- [x] "Son Görüntülediklerinden" sepet sayfasında blok
- [x] Exit-intent popup (basit %5 kupon)
- [x] Stok aciliyet badge'leri (sepetteki ürünlerde)

**ROI:** Kargo eşiğine ulaşan sepet 2x, AOV %10–15 artar.

### Faz 2 — Tavsiye Motoru Çekirdeği (3 hafta) ✅ TAMAMLANDI
- [x] `POST /api/v1/cart/recommendations` endpoint
- [x] CoPurchaseRepository + günlük cron job (03:00)
- [x] Frequently bought together blok
- [x] Category popular blok
- [x] Backend orchestrator + strategy pattern

**ROI:** Sepete eklenen ürün sayısı %25 artar.

### Faz 3 — Sepet Terk Recovery (2 hafta) ✅ TAMAMLANDI
- [x] `abandoned_carts` tablosu ve snapshot endpoint (frontend debounced sync)
- [x] Email template'leri (3 kademe: 1sa, 24sa, 48sa)
- [x] Queued job ile email gönderimi (ShouldQueue, every-15min dispatcher)
- [x] Admin panelde "sepet terk analizi" dashboard (stats + filtrelenebilir tablo)

**ROI:** Terk edilen sepetlerin %12'si geri kazanılır.

### Faz 4 — Kişiselleştirme & A/B Test (3 hafta) ✅ TAMAMLANDI
- [x] Wishlist-triggered recommendations (priority 75, arası strateji)
- [x] A/B test framework (self-hosted: experiments + assignments + hash bucketing)
- [x] Funnel analytics dashboard (admin): huni + blok CTR + experiment sonuçları
- [x] Dinamik blok sıralaması (CTR verileri `recommendation_shown/clicked/added` event'lerinden)

### Faz 5 — İleri Özellikler (4+ hafta) ✅ KISMEN TAMAMLANDI
- [x] Bundle (paket ürün) sistemi (bundles + bundle_items tablosu, public API, admin CRUD, liste/detay sayfası, "Paketi sepete ekle")
- [x] Real-time sosyal kanıt (Redis sorted-set TTL viewer counter, `LiveViewersBadge`)
- [x] Predictive stock warnings (günlük `products:compute-velocity` cron, `VelocityBadge`: critical/high/medium)
- [⏳] ML tabanlı kişisel tavsiye — veri eşiği beklendiği için Faz 5.5'e bırakıldı (aşağı bkz.)

---

## Faz 5.5 — ML Tabanlı Kişisel Tavsiye (Veri Bekliyor)

ML önerisi için eşik: **≥10k sipariş VE ≥1k aktif kullanıcı** — bu seviyenin altında veri seyrekliği sebebiyle model overfit olur ve mevcut kural tabanlı sistem daha iyi sonuç verir.

### 5.5.1 — İki aşamalı ML geçiş planı

**Aşama A — Embedding tabanlı benzerlik (veri: 10k–50k sipariş)**
- **Model:** Item2Vec veya Sentence-Transformers (ürün başlığı + açıklama üzerinden)
- **Altyapı:** pgvector (PostgreSQL eklentisi) veya Pinecone
- **Yer:** Mevcut `CoPurchaseStrategy`'nin yanında yeni bir `SemanticSimilarityStrategy`
- **İş:** Nightly job ürün embedding'lerini üretir, vector DB'ye yazar; çağrı anında sepetin "centroid"ine en yakın N ürün çekilir
- **ROI beklentisi:** Soğuk başlangıç problemini çözer (yeni ürünler de öneri alabilir)

**Aşama B — Matrix factorization (veri: ≥50k sipariş)**
- **Model:** LightFM veya Alternating Least Squares (implicit feedback)
- **Altyapı:** Python microservice (FastAPI) + S3/disk'te serialize edilmiş model
- **Yer:** `CollaborativeFilteringStrategy` — priority 110 (CoPurchase'dan bile yüksek)
- **Nightly yeniden eğitim:** Model boyutu arttıkça haftalık'a düşebilir
- **A/B:** Mutlaka mevcut kural tabanlı sistemle canlı A/B, min 2 hafta

### 5.5.2 — Hazır olunca hangi adımlar atılır

1. **Data audit:** `orders` + `order_details` + `funnel_events` üzerinde kullanıcı-ürün etkileşim matrisinin sparsity'sini ölç. `matrix density ≥ 0.1%` sağlıklı bir alt sınır.
2. **Baseline vs. ML karşılaştırması:** Mevcut CoPurchase+CategoryPopular top-10 önerilerinin bir test seti üzerinde precision@10 ve recall@10'unu ölç. ML bu baseline'ı %20+ aşamıyorsa canlıya alma.
3. **Serving yolu:** 
   - Laravel → Python microservice HTTP (düşük QPS için yeterli)
   - Response cache 1 saat (aynı sepet için tekrar çağrılmasın)
   - Fallback: servis down ise mevcut strategies devreye girer (graceful degradation)
4. **Privacy:** Kullanıcı ID'leri hash'lenerek modele gider, PII (email/telefon/ad) model girdisinde asla yok.

### 5.5.3 — İlgili mevcut altyapı hazır

Bu faz'larda inşa edilen parçalar ML geçişine hazır:
- `funnel_events` tablosu → implicit feedback sinyali (view, add_to_cart, order_placed)
- `experiment_assignments` tablosu → A/B test için hazır altyapı
- `CartRecommendationOrchestrator` strategy pattern → yeni strateji plug-in olarak eklenir
- Redis cache altyapısı → model çıktılarını cache'lemek için kullanılır

### 5.5.4 — Tavsiye: ne zaman başla

**Şu göstergelerden biri gerçekleştiğinde başla:**
- Sipariş sayısı 10.000'i geçti (bir ayda)
- Admin dashboard'daki `end_to_end` dönüşüm oranı 3 ayı aşkın süredir plateau (mevcut sistemden daha fazla artış yok)
- Ürün kataloğu 5.000'i aştı (kategori-tabanlı öneriler seyrekleşiyor)

**Şu durumda başlama:**
- Aylık aktif kullanıcı < 1.000 (model öğrenemez, kural tabanlı daha iyi)
- Ürün ortalama aldırılma oranı < 0.5% (veri çok seyrek)
- Ekipte ML bakım yapacak kimse yok (model drift, retraining sorumluluğu)

---

## 9. Ölçümleme & KPI'lar

Her fazdan sonra ölçüm **zorunlu**. Aksi halde strateji başarılı mı bilemezsin.

### 9.1 Temel Metrikler
| Metrik | Hesaplama | Hedef |
|--------|-----------|-------|
| **Conversion Rate (CR)** | Sipariş / Ziyaretçi | +%10 |
| **Average Order Value (AOV)** | Gelir / Sipariş | +%20 |
| **Cart Abandonment Rate** | Terk / Sepete ekleyen | -%15 |
| **Add-to-Cart Rate** | Sepete eklenen / Ürün görüntüleme | +%8 |
| **Recommendation CTR** | Tavsiyeye tıklama / Tavsiye gösterimi | >%6 |
| **Recommendation ATC Rate** | Tavsiyeden sepete ekleme / Tavsiye tıklama | >%25 |

### 9.2 Funnel Analitik Eventleri

GA4 (veya Matomo) ile takip:

```typescript
// src/lib/analytics/funnel.ts
trackFunnelEvent("cart_recommendation_shown", { block_type, product_ids })
trackFunnelEvent("cart_recommendation_clicked", { block_type, product_id, position })
trackFunnelEvent("cart_recommendation_added", { block_type, product_id })
trackFunnelEvent("shipping_threshold_crossed", { previous_amount, new_amount })
trackFunnelEvent("coupon_threshold_crossed", { coupon_code })
trackFunnelEvent("exit_intent_popup_shown")
trackFunnelEvent("exit_intent_popup_converted")
```

### 9.3 Admin Dashboard (Faz 4)

Günlük raporlar:
- Funnel drop-off: her aşamada kaç kullanıcı kayboluyor?
- Her tavsiye bloğunun **gelir katkısı**
- En çok birlikte alınan ürün çiftleri top 20
- Sepet terk → recovery oranı

---

## 10. A/B Test Planı

Her yeni blok için **kontrol grubu** tut. Körü körüne feature açma.

**Örnek test — Blok 2 (Frequently Bought):**
- Variant A: Blok yok (control)
- Variant B: Blok aktif, 6 ürün göster
- Variant C: Blok aktif, 3 ürün göster + "bundle indirimi %5"
- 2 hafta, min. 1000 kullanıcı/variant
- Ölçüm: AOV, ATC rate, bounce rate

**Araçlar:** GrowthBook (self-hosted, ücretsiz) veya custom flag sistemi (`feature_flags` tablosu).

---

## 11. Riskler & Önlemler

| Risk | Olasılık | Etki | Önlem |
|------|----------|------|-------|
| Tavsiye API yavaş (>300ms) | Orta | Yüksek | Redis cache, edge cache, async fetch |
| Kötü tavsiye → güven kaybı | Orta | Yüksek | A/B test, kullanıcı feedback butonu |
| Soğuk başlangıç (yeni ürün) | Yüksek | Orta | İçerik tabanlı fallback |
| Spam gibi görünme (çok fazla blok) | Düşük | Yüksek | Maks 2 blok / sepet, kullanıcı kapatabilsin |
| Email spam filtresi | Orta | Orta | DKIM/SPF doğru config, opt-out kolay |
| KVKK — kişiselleştirme verisi | Düşük | Yüksek | Rıza bannerı, data retention policy |

---

## 12. Kritik Karar Noktaları — Seninle Tartışılacaklar

1. **Önceliklendirme:** Faz 1'den mi, yoksa direkt Faz 2 tavsiye motorundan mı başlayalım?
2. **Email altyapısı:** Mevcut SMTP yeterli mi, Mailchimp/Resend entegrasyonu mu?
3. **Push notification:** Web push (browser) mi, sadece Flutter app'ten mi?
4. **ML/AI:** Sipariş verisi 10k altındayken hibrit kural tabanlı yeterli. 10k+ olunca embedding tabanlı bir model düşünülebilir (Pinecone / pgvector).
5. **Bundle sistemi:** Ayrı ürün tipi olarak mı (`type = 'bundle'`), yoksa frontend'te mi kurgulanacak?
6. **Exit-intent popup frequency:** Aynı kullanıcıya haftada 1'den fazla göstermeyelim mi?

---

## 13. Sonraki Adım

Bu belgeyi okuduktan sonra aşağıdaki sırayla ilerleyebiliriz:

1. **Karar verme oturumu (30 dk):** 12. bölümdeki sorulara yanıt
2. **Faz 1 scope dondurma:** 2 haftalık sprint planı
3. **Implement:** Kargo progress bar + exit-intent popup ile başla (en görünür, en kolay kazanım)
4. **Ölç:** 1 hafta sonra baseline'a karşı karşılaştır
5. **Karar:** Faz 2'ye geç veya Faz 1'i genişlet

---

**Ek kaynaklar:**
- Baymard Institute — Cart Abandonment Research
- Amazon's "Customers who bought this also bought" (1999 paper)
- Nielsen Norman Group — E-commerce UX Reports
- Shopify — Conversion Rate Optimization Guide
