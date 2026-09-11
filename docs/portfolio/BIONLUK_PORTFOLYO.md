# Bionluk — QuickEcommerce (çok satıcılı e-ticaret pazaryeri)

Bu dosya Bionluk portfolyo + ilan (gig) akışlarına KOPYALA-YAPIŞTIR içindir.
Kurallar ve limitler: [PROJECT_PORTFOLIO_STANDARD.md](/home/orhan/Documents/Projeler/PROJECT_PORTFOLIO_STANDARD.md)

Canlı proje: https://sportoonline.com · Görseller: `docs/portfolio/assets/` (3200×2000 @2x)

| Sıra | Dosya | İçerik |
|---|---|---|
| 1 (kapak) | `assets/00-cover.png` | Markalı hero + müşteri vitrini önizlemesi (gerçek ürün ve fiyatlar) |
| 2 | `assets/01-katalog.png` | Katalog yönetimi: ürün listesi, kategori dağılımı, fiyat koruma kuralı |
| 3 | `assets/02-pazaryeri.png` | Satıcı mağazaları, pazaryeri ödeme akışı, sipariş durumları, kargo |
| 4 | `assets/03-fiyat-stok.png` | Tedarikçi fiyat ve stok eşitlemesi, kaynak durumu, otomatik iade zinciri |

> Görsellerdeki bütün veri gerçektir: ürün adı, fiyat ve stok `/api/v1/product-list`,
> mağaza adları `/api/v1/store-list`, kategori sayıları `/api/v1/product-category/list`,
> tedarikçi kaynakları `backend-laravel/app/Services/ScraperSourceRegistry.php`.
> Tema yeşili canlı siteden alındı (`--primary: 142 71% 29%`). Müşteri kimliği hiç kullanılmadı.

---
---

# A) PORTFOLYO (panel/portfolyo/yeni)

## Kategori
**Yazılım & Teknoloji → Web Yazılım**

## Başlık (max 60) — **49 karakter**
```
QuickEcommerce — Çok Satıcılı E-Ticaret Pazaryeri```

## Açıklama (max 250 → 245 altına çek) — **238 karakter**
```
Laravel 12 API, Next.js 16 vitrin, yönetim paneli ve Flutter uygulamasıyla çok satıcılı e-ticaret pazaryeri. Satıcı mağazaları, satıcı bazlı ödeme dağıtımı, tedarikçi fiyat ve stok eşitlemesi, sipariş sonrası stok teyidi ve otomatik iade.```

## (İsteğe bağlı) Uzun açıklama

QuickEcommerce, birden fazla satıcının kendi mağazasıyla listelendiği bir e-ticaret pazaryeri
altyapısıdır; sportoonline.com olarak canlı çalışır.

- **Backend:** Laravel 12 API. Ürün, varyant, sipariş, kupon, kargo ve iade akışları.
- **Müşteri vitrini:** Next.js 16, sunucu tarafında render. Arama, kategori, sepet, üyelik,
  sipariş takibi, değerlendirme.
- **Yönetim paneli:** Ayrı Next.js uygulaması. Katalog, kampanya, satıcı ve rapor yönetimi.
- **Mobil:** Flutter ile iOS ve Android; aynı API.
- **Pazaryeri ödemesi:** iyzico alt üye işyeri modeli. Müşteri tutarı satıcı bakiyesine,
  komisyon platform bakiyesine ayrılır. Kapıda ödeme ve havale de destekli.
- **Tedarikçi eşitlemesi:** 25 aktif kaynaktan günlük fiyat ve stok güncellemesi.
  WooCommerce, Ticimax, Shopify, OpenCart, IdeaSoft, Odoo ve ikas altyapıları için ayrı
  çözümleyici. Yeni ürün eklenmez, yalnız fiyat ve stok güncellenir; %30 üzeri değişim
  yanlış veri sayılıp atlanır.
- **Sipariş sonrası stok teyidi:** Stok bilgisini yalnız "var/yok" veren kaynaklarda, ödeme
  alındıktan 30 dakika sonra ürün sayfası yeniden kontrol edilir. Ürün tükenmişse sipariş
  iptal edilip ödeme otomatik iade edilir.
- **Ölçek:** 6.686 yayında ürün, 32 satıcı mağazası, 9 ürünlü kategori.

---
---

# B) İLAN / GIG (panel/ilanlar/yeni)

> ⚠️ Bu ilanda tedarikçi fiyat/stok eşitlemesi (veri kazıma) BİLEREK ANLATILMAZ.
> Bionluk "bot yazılımla veri çekme" hizmetini yasaklıyor; o yetenek yalnız portfolyoda kalır.
> İlan saf e-ticaret geliştirme hizmeti olarak yazıldı: dış link, marka adı, iletişim bilgisi
> ve emoji yok; madde işareti "-".

## Kategori
**Yazılım & Teknoloji → Web Yazılım**

## Başlık (max 60, "Ben, " ile başlar + fiille biter, noktalama yok) — **42 karakter**
```
Ben, çok satıcılı e-ticaret sitesi kurarım```
Alternatifler (≤60):
- `Ben, pazaryeri mantığında e-ticaret sitesi geliştiririm` (55)
- `Ben, satıcılı e-ticaret altyapısı kurar ve teslim ederim` (56)

## Açıklama (min 150 / max 2500) — **1450 karakter**
```
Merhaba. Birden fazla satıcının kendi mağazasıyla listelendiği, siparişi ve ödemesi ayrı yürüyen bir e-ticaret sitesi kuruyorum. Tek satıcılı normal bir mağaza da aynı altyapıyla yapılabilir.

Neler yapıyorum:
- Müşteri tarafı: ürün ve kategori sayfaları, arama, sepet, üyelik, sipariş takibi ve değerlendirme.
- Satıcı tarafı: her satıcı için ayrı mağaza sayfası, kendi ürün, stok ve sipariş yönetimi.
- Yönetim paneli: ürün ve kategori yönetimi, kampanya ve kupon, kargo kuralları, iade ve raporlar.
- Ödeme: sanal pos ve 3D Secure kurulumu, pazaryeri modunda satıcı bazlı tutar dağıtımı, kapıda ödeme ve havale seçenekleri.
- Kargo: gönderi etiketi ve takip numarası entegrasyonu, ücretsiz kargo eşiği, satıcı adresine göre gönderici tanımı.
- Arama motoru uyumu: sunucu tarafında oluşturulan sayfalar, ürün ve kategori için yapılandırılmış veri, site haritası ve çok dilli yapı.
- İsteğe bağlı mobil uygulama: aynı servisleri kullanan iOS ve Android uygulaması.

Nasıl çalışıyoruz:
1) İhtiyacınızı ve satıcı modelinizi konuşup kapsamı netleştiriyoruz.
2) Veri yapısı ve ekran akışlarını çıkarıp onayınızı alıyorum.
3) Geliştirme, kurulum ve testleri tamamlayıp sunucunuza kuruyorum.
4) Panel kullanımını anlatıp teslim ediyorum.

Kurulum size özel ve bağımsızdır; kod ve veritabanı sizde kalır, aylık kullanım bedeli çıkmaz. Kullandığım teknolojiler: Laravel, Next.js, React, MySQL ve mobil için Flutter. Kapsamınızı yazarsanız uygun paketi birlikte belirleyelim.```

## Siparişe başlaman için gerekenler (max 500) — **474 karakter**
```
İşe başlamak için şunları paylaşmanız yeterli:

1) Satış modeliniz: tek satıcı mı, çok satıcılı pazaryeri mi; tahmini satıcı ve ürün sayısı.
2) Ürün bilgileriniz: kategori listesi ve varsa mevcut ürün dosyanız.
3) Marka bilgileriniz: logo, renkler ve site adı.
4) Çalışmak istediğiniz sanal pos ile kargo firması.
5) Alan adı ve sunucu erişiminiz; yoksa uygun kurulum önerebilirim.
6) Mobil uygulama isteyip istemediğiniz.

Bilgiler net değilse kısa bir görüşmeyle netleştirebiliriz.```

## Fiyatlandırma ("3'lü Paket" anahtarını AÇ)

Önerilen: **35.000 / 65.000 / 120.000 ₺**

| Alan | TEMEL — 35.000 ₺ | STANDART — 65.000 ₺ | PRO — 120.000 ₺ |
|---|---|---|---|
| Paket adı | Tek Satıcı Mağaza | Pazaryeri Altyapısı | Pazaryeri ve Mobil |
| Teslim süresi | 25 gün | 45 gün | 75 gün |
| Revizyon | 1 | 2 | 3 |
| Müşteri vitrini ve sepet | ✅ | ✅ | ✅ |
| Yönetim paneli | ✅ | ✅ | ✅ |
| Sanal pos ve 3D Secure | ✅ | ✅ | ✅ |
| Çok satıcılı mağaza yapısı | ☐ | ✅ | ✅ |
| Satıcı bazlı ödeme dağıtımı | ☐ | ✅ | ✅ |
| Satıcı paneli | ☐ | ✅ | ✅ |
| Kargo entegrasyonu | ☐ | ✅ | ✅ |
| Kampanya, kupon, iade akışı | ☐ | ✅ | ✅ |
| Çok dilli yapı | ☐ | ☐ | ✅ |
| iOS ve Android uygulaması | ☐ | ☐ | ✅ |

### Paket açıklamaları

**TEMEL** — `Tek satıcılı mağaza. Ürün ve kategori yönetimi, sepet, üyelik, sipariş takibi, sanal pos ve 3D Secure kurulumu, yönetim paneli ve arama motoru uyumlu sayfalar. Sunucuya kurulum ve panel eğitimi dahildir.`

**STANDART** — `TEMEL paketin üzerine çok satıcılı pazaryeri yapısı: her satıcı için mağaza sayfası ve kendi panelinde ürün, stok, sipariş yönetimi; satıcı bazlı ödeme dağıtımı; kargo entegrasyonu; kampanya, kupon ve iade akışları; satıcı ve satış raporları.`

**PRO** — `STANDART paketin üzerine iOS ve Android uygulaması (aynı servisleri kullanır), çok dilli yapı, gelişmiş rapor ekranları ve teslimden sonra bir ay destek. Yüksek ürün sayısı için arama ve listeleme performansı ayrıca düzenlenir.`

---
### Üretim notu
Görseller: `assets/build.mjs` + `assets/gen.mjs` → `node gen.mjs && node shot.mjs "<abs>.html" "<out>.png"`.
`shot.mjs` playwright-core'u kurulu projelerden ilk bulduğunda kullanır (standarttaki
market_pulse yolunda node_modules kurulu değil).
Reddedilirse bu dosyanın en üstüne "⚠️ RED NEDENİ + DÜZELTME" notu ekle.
