# 🛒 QuickEcommerce — Ürün & Mağaza Yönetimi Kılavuzu

> **Versiyon:** 1.0 | **Tarih:** Şubat 2026
> Bu kılavuz, admin panelinde mağaza açmaktan ürün listeleyip yayına almaya kadar tüm adımları öncelik sırasına göre açıklar.

---

## 📋 İçindekiler

1. [Sistem Mimarisi Özeti](#1-sistem-mimarisi-özeti)
2. [Ön Hazırlık — Admin Tanımlamaları](#2-ön-hazırlık--admin-tanımlamaları)
3. [Mağaza Türleri](#3-mağaza-türleri)
4. [Kategori Yapısı](#4-kategori-yapısı)
5. [Marka & Birim](#5-marka--birim)
6. [Özellikler (Attributes / Varyantlar)](#6-özellikler-attributes--varyantlar)
7. [Mağaza Ekleme — Adım Adım](#7-mağaza-ekleme--adım-adım)
8. [Satıcı (Seller) Hesabı Oluşturma](#8-satıcı-seller-hesabı-oluşturma)
9. [Ürün Ekleme — Alan Rehberi](#9-ürün-ekleme--alan-rehberi)
10. [Varyant (SKU) Yönetimi](#10-varyant-sku-yönetimi)
11. [Abonelik & Komisyon Modeli](#11-abonelik--komisyon-modeli)
12. [Flaş Kampanya Ekleme](#12-flaş-kampanya-ekleme)
13. [Öncelik Sırası — Hızlı Başlangıç Checklist](#13-öncelik-sırası--hızlı-başlangıç-checklist)
14. [Sık Yapılan Hatalar](#14-sık-yapılan-hatalar)

---

## 1. Sistem Mimarisi Özeti

```
Admin (Süper Kullanıcı)
 ├── Mağaza Türü tanımlar       (StoreType)
 ├── Ana Kategori tanımlar      (ProductCategory, type=store_type)
 ├── Marka tanımlar             (ProductBrand)
 ├── Birim tanımlar             (Unit: kg, adet, litre…)
 ├── Özellik/Varyant tanımlar   (ProductAttribute → değerleri)
 └── Abonelik Paketi tanımlar   (SubscriptionPackage)

Satıcı (Seller)
 ├── Mağaza açar               (Store ← store_type bağlanır)
 ├── Abonelik seçer            (commission veya subscription)
 └── Ürün ekler                (Product → Variants → Specifications)

Müşteri (Customer)
 └── Onaylı ürünleri görür, sepete ekler, ödeme yapar
```

---

## 2. Ön Hazırlık — Admin Tanımlamaları

> **⚠️ Bu adımları atlamak ürün ekleyememe / boş dropdown sorunlarına yol açar.**

### 2.1 Kontrol Listesi

Bir satıcı ürün ekleyebilmeden önce adminin şunları tanımlamış olması gerekir:

| # | Tanımlama | Admin Menüsü | Zorunlu mu? |
|---|-----------|-------------|-------------|
| 1 | Mağaza Türü (Store Type) | Ayarlar → Mağaza Türleri | ✅ Evet |
| 2 | Ana Kategori + Alt Kategori | Ürünler → Kategoriler | ✅ Evet |
| 3 | Birim (kg, adet, litre…) | Ürünler → Birimler | ✅ Evet |
| 4 | Marka | Ürünler → Markalar | ❌ Hayır (opsiyonel) |
| 5 | Özellik (Attribute) | Ürünler → Özellikler | ❌ Hayır (varyant yoksa) |
| 6 | Abonelik Paketi | Abonelik → Paketler | ⚠️ Komisyonsuz model için |
| 7 | Bölge (Store Area) | Ayarlar → Bölgeler | ⚠️ Teslimat için |

---

## 3. Mağaza Türleri

### 3.1 Mevcut Türler

Sistem 27 mağaza türünü destekler. Her türün farklı:
- Teslimat süresi ve ücret hesaplama yöntemi vardır
- Kategori filtrelemesi bu türe göre yapılır
- Özellikler (attributes) türe göre tanımlanabilir

| Tür Kodu | Görünen Ad | Teslimat Yöntemi |
|----------|-----------|-----------------|
| `general` | Genel Mağaza | km başına |
| `grocery` | Market | km başına |
| `bakery` | Fırın & Pastane | sabit ücret |
| `medicine` | Eczane & Sağlık | bölge bazlı |
| `makeup` | Makyaj & Güzellik | sabit ücret |
| `bags` | Çanta & Aksesuar | km başına |
| `clothing` | Giyim & Ayakkabı | km başına |
| `furniture` | Mobilya | bölge bazlı |
| `books` | Kitap & Kırtasiye | sabit ücret |
| `gadgets` | Elektronik & Teknoloji | km başına |
| `animals-pet` | Evcil Hayvan | bölge bazlı |
| `fish` | Balıkçılık | sabit ücret |
| `restaurant` | Restoran | km başına |
| `cafe` | Kafe | sabit ücret |
| `fast-food` | Fast Food | sabit ücret |
| `florist` | Çiçekçi | sabit ücret |
| `sports` | Spor | km başına |
| `toy` | Oyuncak | sabit ücret |
| `jewelry` | Takı & Mücevher | sabit ücret |
| `home-decor` | Ev Dekorasyon | km başına |
| `auto-parts` | Oto Yedek Parça | km başına |
| `organic` | Organik | km başına |
| `butcher` | Kasap | sabit ücret |
| `fruit-vegetable` | Meyve & Sebze | km başına |
| `ice-cream` | Dondurma | sabit ücret |
| `hardware` | Hırdavat | km başına |
| `baby-kids` | Bebek & Çocuk | sabit ücret |

### 3.2 Çoklu Tür (Multi-Type)

Bir mağaza **birden fazla türde** faaliyet gösterebilir:
```
Örnek: "Spor & Beslenme Mağazası"
  → store_type = ["sports", "grocery"]
  → Bu mağazanın ürünleri hem spor hem market kategorilerini görebilir
```

---

## 4. Kategori Yapısı

### 4.1 Hiyerarşi

```
Ana Kategori (parent_id = NULL, type = "sports")
 ├── Alt Kategori 1 (parent_id = ana.id)
 │    └── Alt-Alt Kategori (sınırsız derinlik)
 └── Alt Kategori 2
```

### 4.2 `type` Alanının Önemi

**Her kategorinin bir `type` alanı vardır.**
Bu alan, mağaza türüyle eşleşmelidir:

```
Kategori: "Spor Beslenmesi"   → type = "sports"
Kategori: "Fırın Ürünleri"   → type = "bakery"
Kategori: "Elektronik"        → type = "gadgets"
```

> **Kural:** Bir mağaza türü `sports` ise, ürün eklerken sadece `type = "sports"` olan kategoriler listede görünür.
> Kategori türü yanlış ayarlanırsa dropdown boş gelir!

### 4.3 Global vs. Mağazaya Özel Kategoriler

| Tür | `store_id` | Kim Oluşturur? | Kim Görebilir? |
|-----|-----------|----------------|----------------|
| **Global Kategori** | `NULL` | **Admin** (Admin Panel → Kategoriler) | O türdeki tüm mağazalar |
| **Mağazaya Özel** | `store.id` | **Satıcı** (Satıcı Paneli → Kategoriler) | Sadece o mağaza |

#### ⚠️ Önemli Ayrım

**Admin panelinden mağazaya özel kategori oluşturamazsınız.**

```
Admin Panel → Kategoriler
  → Burada oluşturulan her kategori GLOBALdir (store_id = NULL)
  → Türe göre filtrelenir (type = "sports" / "grocery" / ...)
  → O türdeki tüm mağazalar görür

Satıcı Paneli → Kategoriler (Seller → Mağazam → Kategoriler)
  → Burada oluşturulan kategori SADECE O MAĞAZAYA aittir (store_id = store.id)
  → Satıcı kendi alt kategorilerini burada yönetir
  → Admin tarafından müdahale edilemez
```

#### Doğru İş Akışı

```
1. Admin → "Spor Giyim" ana kategorisi oluşturur (global, type="clothing")
   └─ Tüm giyim mağazaları görür

2. Satıcı "Nike TR" → kendi alt kategorilerini ekler:
   ├─ "Koşu Ayakkabıları" (store-specific, parent = "Spor Giyim")
   ├─ "Antrenman Kıyafetleri"
   └─ "Aksesuar"
   └─ Bu kategoriler sadece Nike TR mağazasında görünür

3. Ürün eklenirken:
   ├─ Global kategori seçilebilir → "Spor Giyim"
   └─ Mağazaya özel kategori de görünür → "Koşu Ayakkabıları"
```

Başlangıçta tüm kategorileri **global** (Admin Panel'den) olarak tanımlayın.
Satıcılar ihtiyaç duyarsa kendi panellerinden özel alt kategoriler ekleyebilir.

### 4.4 Mevcut Root (Ana) Kategoriler

Sistemde 29 ana kategori tanımlıdır. Bunlar:

```
Spor: spor-beslenmesi, fitness-egzersiz, outdoor-kamp,
      takim-bireysel-sporlar, spor-giyim-ayakkabi, spor-teknoloji,
      canta-aksesuar, spor-kitaplari

Gıda: market, firin-pastane, restoran, kafe, fast-food,
      organik, kasap, meyve-sebze, dondurma

Sağlık & Güzellik: eczane-saglik, makyaj-guzellik

Ev & Yaşam: mobilya, ev-dekorasyon, hirdavat

Özel: evcil-hayvan, balikcililik, cicekci, oyuncak,
      taki-mucevher, oto-yedek-parca, bebek-cocuk
```

---

## 5. Marka & Birim

### 5.1 Marka (Brand)

- Ürün ekleme formunda **opsiyonel** seçilir
- Her markanın logosu, SEO bilgileri tanımlanabilir
- Marka eklemek ürün güvenilirliğini artırır ama zorunlu değildir

```
Admin Panel → Ürünler → Markalar → Yeni Marka Ekle
  - Marka Adı (çok dilli)
  - Logo
  - SEO başlığı & açıklaması
```

### 5.2 Birim (Unit)

- Ürünün **ölçü birimidir**: `adet`, `kg`, `litre`, `paket`, `kutu`…
- Ürün formunda **zorunludur** (eğer fiyat/stok birimi belirtilecekse)
- Her varyant farklı bir birim kullanabilir

```
Admin Panel → Ürünler → Birimler → Yeni Birim Ekle
  - Birim Adı: "Kilogram", "Adet", "Litre" (çok dilli)
  - Sıralama
```

**Önerilen Temel Birimler:**

| Kod | Ad | Kullanım |
|-----|----|---------|
| `adet` | Adet | Elektronik, oyuncak, aksesuar |
| `kg` | Kilogram | Gıda, meyve/sebze, et |
| `g` | Gram | Baharat, kuru gıda |
| `lt` | Litre | İçecek, deterjan |
| `ml` | Mililitre | Parfüm, şurup |
| `paket` | Paket | Toplu ürünler |
| `kutu` | Kutu | Hazır gıda, ilaç |
| `porsiyon` | Porsiyon | Restoran, kafe |

---

## 6. Özellikler (Attributes / Varyantlar)

### 6.1 Ne İşe Yarar?

Özellikler, bir ürünün **seçilebilir boyutlarını** tanımlar:
- Beden: `XS / S / M / L / XL`
- Renk: `Siyah / Beyaz / Kırmızı`
- Ağırlık: `250g / 500g / 1kg`

### 6.2 İki Katmanlı Sistem

**Katman 1 — Mağaza Türüne Göre (Genel)**
```
Tür "sports" için:  Beden, Renk, Ağırlık, Malzeme
Tür "clothing" için: Beden, Renk, Kumaş Tipi
Tür "food" için:    Boyut, Porsiyon, Tat
```

**Katman 2 — Kategoriye Göre (Özgün)**
```
"Spor Beslenmesi" kategorisi için:
  → Tat / Aroma (Çikolata, Vanilya, Çilek…)
  → Ağırlık (250g, 500g, 1kg, 2kg…)
  → Form (Toz, Kapsül, Tablet, Jel, Bar)
  → Kapsül Sayısı (30, 60, 90, 120, 240)
  → Hacim (250ml, 500ml, 750ml, 1L)

"Bebek & Çocuk" kategorisi için:
  → Yaş (0-3ay, 3-6ay, 6-12ay, 1-2yaş…)
  → Beden (50, 56, 62, 68, 74, 80…)
  → Cinsiyet
  → Malzeme (Pamuk, Organik Pamuk, Bambu)
```

### 6.3 Özellik Ekleme Kuralları

```
Admin Panel → Ürünler → Özellikler → Yeni Özellik Ekle

Zorunlu:
  - Özellik Adı (çok dilli: TR + EN)
  - Tür VEYA Kategori (en az biri)

Opsiyonel:
  - Değerler (önceden tanımlı değerler, sonradan eklenebilir)
    Örnek: "Beden" için değerler: XS, S, M, L, XL, XXL

Kural:
  → Sadece "Tür" seçilirse → o türdeki tüm mağazalar kullanır
  → Sadece "Kategori" seçilirse → sadece o kategorideki ürünler
  → Her ikisi de boş bırakılırsa → tüm ürünlere genel özellik
```

> **Not:** Değer eklemek zorunda değilsiniz. Satıcı ürün eklerken kendi değerini de girebilir.

---

## 7. Mağaza Ekleme — Adım Adım

### 7.1 Önkoşullar

Mağaza açmadan önce şunlar tanımlı olmalı:
- ✅ Mağaza türü mevcut
- ✅ Bölge (StoreArea) tanımlanmış
- ✅ Satıcı kullanıcı hesabı açılmış

### 7.2 Mağaza Formu — Alan Rehberi

```
ZORUNLU ALANLAR
├── Mağaza Adı            → "Sportif Market" (çok dilli)
├── Mağaza Türü           → sports / grocery / restaurant…
├── Satıcı               → ilgili satıcı kullanıcı
└── Faturalama Modeli     → "Komisyon" veya "Abonelik"

ÖNEMLİ ALANLAR
├── Bölge (Area)          → Teslimat bölgesi — boş kalırsa teslimat kırılır!
├── Logo                 → 200×200 px, şeffaf arka plan
├── Banner               → 1200×400 px
├── Adres                → Tam adres (Google Maps entegrasyonu için)
├── Koordinat            → Harita pinleme için lat/lng
├── Açılış/Kapanış Saati → "09:00" / "22:00"
├── Vergi Oranı          → %0-100, varsayılan 0
└── Min. Sipariş Tutarı  → Teslimat için minimum ₺ değeri

OPSİYONEL
├── Tatil Günü           → "Pazar", "Sunday"
├── Veg Status           → Yalnızca yiyecek mağazaları için (Vegan/Vejeteryan)
├── Teslimat Ücreti      → Sabit ücret (bölge ayarından bağımsız)
├── Teslimat Süresi      → "1-3 iş günü", "30-45 dakika"
└── SEO (Meta başlık, açıklama, görsel)
```

### 7.3 Mağaza Durumları

```
Yeni Mağaza → status = 0 (Beklemede)
              ↓ Admin onaylar
              status = 1 (Aktif) ← müşteriler görebilir

Admin devre dışı bırakır → status = 2 (Pasif)
Admin reddeder          → status = 3 (Reddedildi)
```

> **⚠️ Dikkat:** Mağaza onaylanmadan müşteri tarafında ürünler görünmez!

---

## 8. Satıcı (Seller) Hesabı Oluşturma

### 8.1 Öncelik Sırası

```
1. Kullanıcı kaydı oluştur
2. Kullanıcıya "Satıcı" rolü ata
3. Mağaza oluştur + satıcıyla ilişkilendir
4. Abonelik / komisyon modeli seç
5. Satıcıya panel erişimi ver
6. Satıcı ürün eklemeye başlar
7. Admin her ürünü onaylar
```

### 8.2 Kullanıcı → Mağaza İlişkisi

```
User (Satıcı Kullanıcı)
  └── store_owner = true
  └── activity_scope = "store_level"

Store (Mağaza)
  └── store_seller_id = User.id  ← İlişki buradan kurulur
```

### 8.3 Abonelik vs. Komisyon

| Model | Ne Zaman? | Avantaj | Dikkat |
|-------|-----------|---------|--------|
| **Komisyon** | Küçük/yeni satıcılar | Başlangıç maliyeti yok | Her sipariş üzerinden % kesinti |
| **Abonelik** | Yüksek hacimli satıcılar | Sabit maliyet, limit kontrolü | `product_limit`, `order_limit` dolunca ürünler görünmez |

**Abonelik paketi dolarsa ne olur?**
```
order_limit = 0 → Mağazanın ürünleri müşteri tarafında KAYBOLUR
product_limit dolunca → Yeni ürün eklenemez
```
→ Bu nedenle abonelik yenileme takibi kritiktir!

---

## 9. Ürün Ekleme — Alan Rehberi

### 9.1 Zorunlu → Opsiyonel Sırasıyla

```
SEVİYE 1 — MUTLAKA GİRİLMELİ
├── Ürün Adı (TR + EN)
├── Mağaza seçimi
├── Kategori seçimi         ← Mağaza seçilince filtrelenir
└── En az 1 Varyant         ← Fiyat ve stok burada tutulur

SEVİYE 2 — ÖNERİLİR
├── Ürün Açıklaması (TR + EN, zengin metin)
├── Ana Görsel               (en az 800×800 px, beyaz/şeffaf arka plan)
├── Galeri Görselleri        (ek açılar)
├── Birim (kg, adet…)
└── Marka

SEVİYE 3 — OPSİYONEL
├── Video URL (YouTube/Vimeo)
├── Garanti bilgisi
├── İade politikası
├── Teslimat süresi (ürüne özel, mağaza ayarını ezebilir)
├── Kargo Hariç Max. Adet
└── SEO (meta başlık, açıklama, anahtar kelimeler)

SEVİYE 4 — ÖZEL ÜRÜN TÜRLERİ
├── Üretim/Son Kullanma Tarihi  ← Gıda/ilaç için
├── Müsaitlik saatleri          ← Restoran/kafe için
└── Davranış tipi               ← Ürün / Servis / Kombo / Tüketilecek
```

### 9.2 Kategori Seçimi ve Özellikler

```
Adım 1: Mağaza seç → type="sports" otomatik atanır
Adım 2: Kategori seç (sadece "sports" kategorileri görünür)
         Örn: "Spor Beslenmesi" seçildi (id=454)
Adım 3: Varyant alanında → o kategoriye özel özellikler görünür:
         - Tat / Aroma → Çikolata, Vanilya, Çilek…
         - Ağırlık     → 250g, 500g, 1kg…
         - Form        → Toz, Kapsül, Tablet…
```

### 9.3 Görsel Standartları

| Alan | Boyut | Format | Notlar |
|------|-------|--------|--------|
| Ana Görsel | 800×800 | JPG/PNG/WebP | Kare, beyaz arka plan tercih edilir |
| Galeri | 800×800 | JPG/PNG | En fazla 8-10 adet |
| Varyant Görseli | 600×600 | JPG/PNG | Renk/beden farklılıkları için |
| Mağaza Logo | 200×200 | PNG (şeffaf) | |
| Mağaza Banner | 1200×400 | JPG/PNG | |
| Kategori Thumb | 400×400 | PNG | İkon tarzı |

### 9.4 Ürün Durumları

```
Yeni Ürün → status = "pending"
             ↓ Admin onaylar
             status = "approved"  ← müşteriler görebilir

Admin devre dışı bırakır → status = "inactive"
Admin askıya alır        → status = "suspended"
```

---

## 10. Varyant (SKU) Yönetimi

### 10.1 Varyant Nedir?

Bir ürünün her **farklı kombinasyonu** ayrı bir varyanttır:

```
Ürün: "Whey Protein"
  ├── Varyant 1: Tat=Çikolata, Ağırlık=1kg → SKU: WP-CHO-1KG
  ├── Varyant 2: Tat=Çikolata, Ağırlık=2kg → SKU: WP-CHO-2KG
  ├── Varyant 3: Tat=Vanilya, Ağırlık=1kg  → SKU: WP-VAN-1KG
  └── Varyant 4: Tat=Vanilya, Ağırlık=2kg  → SKU: WP-VAN-2KG
```

### 10.2 Varyant Alanları

```
ZORUNLU
├── Fiyat (₺)              → Satış fiyatı
└── Stok Adedi             → 0 = tükendi

ÖNEMLİ
├── SKU Kodu               → Satıcının iç kodu (zorunlu değil ama takip için önerilir)
├── İndirimli Fiyat        → 0 veya boş = indirim yok
└── Varyant Görseli        → O kombinasyona özel resim

OPSİYONEL
├── Ağırlık (brüt/net/kap) → Kargo hesaplaması için
├── Boyutlar (en/boy/yük)  → Büyük ürünler için
├── Paket Miktarı          → "6'lı paket" gibi
└── Birim (override)       → Ürünün birimini değiştirir
```

### 10.3 Stok Durumları

| Durum | Koşul | Müşteriye Gösterimi |
|-------|-------|---------------------|
| Stokta | `stock_quantity > 10` | "Stokta Var" |
| Az Kaldı | `0 < stock_quantity ≤ 10` | "Az Kaldı!" |
| Tükendi | `stock_quantity = 0` | "Stok Yok" (sipariş alınamaz) |

---

## 11. Abonelik & Komisyon Modeli

### 11.1 Komisyon Modeli

```
Mağaza → subscription_type = "commission"

→ Ürün/sipariş limiti YOK
→ Her sipariş tamamlandığında admin_commission_rate kadar kesinti
→ Kesinti: sabit tutar veya yüzde olabilir

Örnek:
  Sipariş: ₺150
  Komisyon: %10
  Satıcıya ödenen: ₺135
  Admin komisyonu: ₺15
```

### 11.2 Abonelik Modeli

```
Mağaza → subscription_type = "subscription"

Paket özellikleri:
  ├── Ürün limiti      → max kaç ürün listeleyebilir
  ├── Sipariş limiti   → ayda max kaç sipariş
  ├── Öne çıkan limit  → max kaç ürünü featured yapabilir
  └── Özellikler:
       ├── pos_system       → POS kasası erişimi
       ├── self_delivery    → Kendi kuryesi
       ├── mobile_app       → Mobil uygulama görünürlüğü
       └── live_chat        → Müşteri ile canlı chat
```

### 11.3 Limit Dolunca Ne Olur?

```
order_limit = 0 veya abonelik expired → Mağaza ürünleri FRONTENDde KAYBOLUR
                                         (admin/satıcı panelinde görünür)

product_limit doldu → Yeni ürün ekleme engellenir
featured_limit doldu → Ürün öne çıkarılamaz
```

---

## 12. Flaş Kampanya Ekleme

### 12.1 Akış

```
1. Admin → Kampanyalar → Yeni Flaş Kampanya
   ├── Başlık (çok dilli)
   ├── Başlangıç / Bitiş zaati
   ├── İndirim türü: Sabit (₺) veya Yüzde (%)
   ├── İndirim miktarı
   └── Satış limiti (opsiyonel: kaç adet satılınca kapansın)

2. Satıcı → Kampanyalar → Ürün Ekle
   └── Ürünü listeye ekler (status = "pending")

3. Admin → Kampanyalar → Ürünleri Onayla
   └── status = "approved" → ürün kampanyada görünür

4. Kampanya otomatik kapanır:
   └── Bitiş saati gelince VEYA satış limiti dolunca
```

### 12.2 Dikkat Edilmesi Gerekenler

- Kampanya ürününün **stok varyantta** dolu olması gerekir
- Mağazanın **aboneliği aktif** olmalı (komisyon modeli sınırsız)
- Kampanya **bitiş saatini geçerse** otomatik deaktive olur
- İndirim fiyatı varyantın **normal fiyatının altına** inmemeli

---

## 13. Öncelik Sırası — Hızlı Başlangıç Checklist

### 🟥 Yeni Bir Platform İçin (İlk Kurulum)

```
[ ] 1. Mağaza türlerini kontrol et (27 tür mevcut, gerekirse ekle)
[ ] 2. Birimleri tanımla (kg, adet, litre, porsiyon vb.)
[ ] 3. Ana kategorileri ekle (mağaza türüyle eşleştirerek)
[ ] 4. Kategorilere özellik tanımla (veya seeder çalıştır)
[ ] 5. Markalar için temel markalar ekle
[ ] 6. Abonelik paketlerini tanımla
[ ] 7. Bölgeleri (StoreArea) tanımla + teslimat ücretlerini ayarla
```

### 🟧 Yeni Bir Satıcı / Mağaza Açarken

```
[ ] 1. Satıcı kullanıcı hesabını oluştur
[ ] 2. Kullanıcıya "Seller" rolü ata
[ ] 3. Mağaza formu doldur:
       - Mağaza adı, türü
       - Logo ve banner yükle
       - Adres + koordinat gir
       - Açılış/kapanış saati
       - Faturalama modeli seç (komisyon/abonelik)
[ ] 4. Mağazayı onayla (Admin)
[ ] 5. Abonelik modeli ise abonelik başlat
```

### 🟨 Yeni Bir Ürün Eklerken

```
[ ] 1. Mağazanın onaylı ve aktif olduğunu doğrula
[ ] 2. Doğru kategoriyi seç (mağaza türüyle eşleşen)
[ ] 3. Ürün adını TR + EN olarak gir
[ ] 4. En az 1 ana görsel yükle (800×800 önerilen)
[ ] 5. En az 1 varyant ekle:
       - Fiyat gir
       - Stok adedi gir
       - Özellikleri seç (tat, beden, renk vb.)
[ ] 6. Açıklama yaz (SEO için TR + EN)
[ ] 7. Ürünü kaydet → Admin onayına gönderilir
[ ] 8. Admin ürünü onayla
```

### 🟩 Ürün Yayında, Satış Başladı

```
[ ] Stok takibi yap (varyantta stok adedi)
[ ] Düşen stoklar için bildirim kur
[ ] Abonelik limiti dolmadan yenile
[ ] Kampanyalar için başvur
[ ] Ürün görsellerini ve açıklamalarını periyodik güncelle
```

---

## 14. Sık Yapılan Hatalar

### ❌ Hata 1: Kategori Dropdown Boş Geliyor

**Neden:** Mağaza türü `sports` ama kategorilerin `type` alanı `grocery`
**Çözüm:** Kategori düzenleme ekranında `type` alanını mağaza türüyle eşleştir

### ❌ Hata 2: Varyantlar Görünmüyor (Ürün Eklerken)

**Neden:** Kategori seçildi ama o kategoriye özellik tanımlanmamış
**Çözüm:**
```
Admin → Özellikler → Yeni Ekle
  Tür: sports  VEYA  Kategori: "Spor Beslenmesi"
  Değerler: Çikolata, Vanilya, Çilek…
```

### ❌ Hata 3: Ürün Müşteri Tarafında Görünmüyor

Kontrol listesi:
```
1. Ürün status = "approved" mu?             → Admin onayı gerekli
2. Mağaza status = 1 (Aktif) mi?            → Admin onayı gerekli
3. Abonelik modeli ise order_limit > 0 mu?  → Abonelik yenile
4. Varyant stok_quantity > 0 mu?            → Stok gir
5. Varyant status = 1 (Aktif) mi?           → Varyantı aktifleştir
```

### ❌ Hata 4: Aynı Ürün İki Defa Görünüyor

**Neden:** Hem türe hem kategoriye aynı isimde özellik tanımlanmış
**Çözüm:** Özellikler → listeyi kontrol et, duplicate olanları sil

### ❌ Hata 5: Fiyat/Stok Görünmüyor

**Neden:** Fiyat ürün düzeyinde değil, **varyant düzeyinde** tutulur
**Çözüm:** Ürün formunda "Varyantlar" sekmesine geç, varyant fiyatını gir

### ❌ Hata 6: Mağaza Seeder Sonrası Eksik Görünüyor

**Neden:** `StoreSeeder` eski versiyonla çalıştırıldı, `is_featured = NULL`
**Çözüm:**
```bash
php artisan db:seed --class=StoreSeeder --force
```
> Direkt SQL ile `UPDATE stores SET is_featured = 1` yapma! Seeder kullan.

---

## 📌 Önemli Teknik Notlar

### Çok Dilli Giriş (i18n)

Tüm ürün adı, açıklama, kategori adı alanları **TR + EN** girişi destekler.
Bir dil girilmezse fallback olarak varsayılan dil (df) kullanılır.

```
Ürün Adı TR: "Whey Protein Çikolata"
Ürün Adı EN: "Whey Protein Chocolate"
```

### Seeder Stratejisi (Production)

```bash
# Her deploy'da çalışan (güvenli) seeder:
php artisan db:seed --class=ProductionSeeder --force

# Sadece ilk kurulumda çalışan (veri siler!) seeder:
php artisan db:seed --class=InitialSetupSeeder --force
```

> **⚠️ Asla local database'de manuel SQL güncellemesi yapma!**
> Her değişiklik seeder ile yapılmalı, yoksa production'a yansımaz.

### Görsel Yükleme Sorunu (Production)

```bash
rm -f public/storage && php artisan storage:link
chmod -R 775 storage/app/public
```

---

*Son güncelleme: Şubat 2026*
