# UCP / Agentic Checkout Hazırlık Checklist'i — Sportoonline

> **Amaç:** Sportoonline.com'u AI ajanlarının (Google Search AI Mode, Gemini vb.) ürünü okuyup **doğrudan satın alabileceği** bir e-ticaret backend'ine dönüştürmek — Google Universal Commerce Protocol (UCP) uyumu.
>
> **Durum:** Başlangıç seviyesi. Ürün verisi sayfalarda mevcut; UCP profil + checkout/cart/order API katmanı yok.
>
> **Son güncelleme:** 2026-07-07

---

## ⚠️ Kritik Uyarı — Önce Oku

Bu checklist'teki her madde iki gruptan birine girer:

| İşaret | Anlamı | Aksiyon |
|--------|--------|---------|
| 🟢 **GÜVENLİ** | UCP gerçek/uygun olsa da olmasa da siteyi iyileştirir | Hemen başlanabilir |
| 🔴 **DOĞRULA** | Dış kaynaktan gelen UCP spec iddiasına dayanır (endpoint isimleri, alan adları, SLO'lar) | **Google resmi dokümanıyla teyit etmeden kod yazma** |

**Neden bu ayrım var:** UCP spec detayları (`/.well-known/ucp`, `native_commerce.checkout_eligibility`, endpoint isimleri, SLO tabloları) ikinci el bir analizden geldi. Bu tür protokol detayları çok inandırıcı biçimde uydurulabilir. İnşaata başlamadan önce **her 🔴 madde resmi Google UCP dokümanıyla birebir doğrulanmalı.**

Referans dokümanlar (doğrulanacak):
- `support.google.com/merchants/answer/16837055` — UCP genel bakış
- `developers.google.com/merchant/ucp/guides` — implementation rehberi
- `developers.google.com/merchant/ucp/guides/ucp-profile` — `/.well-known/ucp`
- `developers.google.com/merchant/ucp/guides/checkout/native` — native checkout
- `developers.google.com/merchant/ucp/guides/cart-api` — cart API
- `developers.google.com/merchant/ucp/guides/orders` — order lifecycle
- `developers.google.com/merchant/ucp/guides/merchant-center` — feed hazırlığı
- `developers.google.com/pay/api/universal-commerce-protocol/google-pay-payment-handler`

---

## Faz 0 — Doğrulama (İNŞAATTAN ÖNCE ZORUNLU)

Kod yazmadan önce metindeki spec iddialarını gerçek dokümanla teyit et.

- [ ] 🔴 UCP'nin ve `/.well-known/ucp` profil dosyasının gerçek bir standart olduğunu resmi dokümandan doğrula
- [ ] 🔴 Endpoint sözleşmelerini teyit et:
  - `POST /checkout-sessions`
  - `GET /checkout-sessions/{id}`
  - `PUT /checkout-sessions/{id}`
  - `POST /checkout-sessions/{id}/complete`
  - `POST /checkout-sessions/{id}/cancel`
  - `POST /carts` (CreateCart → `continue_url` döner)
- [ ] 🔴 `native_commerce.checkout_eligibility` (boolean) alanının gerçek feed spec'inde olduğunu doğrula
- [ ] 🔴 `merchant_item_id` eşleme alanını doğrula
- [ ] 🔴 `consumer_notice` alanlarını (hukuki uyarı gerektiren ürünler için) doğrula
- [ ] 🔴 SLO hedeflerini teyit et: create/update p50 ~1sn / p95 ~4-5sn; complete p50 ~6sn / p95 ~10sn
- [ ] 🔴 **Coğrafi uygunluk**: Metne göre özellik şu an ABD/Kanada/Avustralya için. Türkiye merkezli mağaza için UCP-powered checkout'un ne zaman/nasıl açılacağını netleştir. (TR desteklenmiyorsa Faz 3-5 beklemeye alınır, ama Faz 1-2-6 yine yapılır.)
- [ ] 🔴 Auth mekanizmasını doğrula (metin: `Authorization: Bearer <access_token>`)

---

## Faz 1 — Ürün Uygunluk Filtresi 🟢

Katalogdaki her ürün için "agentic checkout'a açılabilir mi?" kararı. Tüm kataloğu toplu açmak yerine **güvenli liste** oluştur.

- [ ] 🟢 Ürün tablosuna `ucp_eligible` (boolean, default `false`) alanı ekle
  - **DB Kuralı hatırlatma:** `ALTER TABLE` YASAK. İlgili seed SQL dosyasındaki `CREATE TABLE`'a kolonu ekle, `db:seed:*:fresh` ile kur. (Canlıda `db:seed` YASAK — tinker veya tek `--class` seeder kullan.)
- [ ] 🟢 `ucp_eligible = true` yalnızca şu koşullarda:
  - [ ] Ürün fiziksel (dijital/hizmet değil)
  - [ ] Stokta var (gerçek miktar veya bool-true)
  - [ ] Fiyat ve para birimi net
  - [ ] Standart kargo ile gönderilebilir (özel kargo değil)
  - [ ] İade politikası var
  - [ ] Ön sipariş / kişiye özel / final sale değil
  - [ ] Abonelik / taksit zorunlu / hediye kartı / yaş-doğrulama gerektiren değil
  - [ ] Policy/safety riski yok
- [ ] 🟢 **Dijital/hizmet ürünlerini kesin dışla** (ana sayfada öne çıkanlar):
  - "Sosyal Medya Yönetim Paneli ve İçerik Otomasyon Altyapısı"
  - "Kişiye Özel Antrenman Takip ve Koçluk Uygulaması"
  - "Hazır E-Ticaret Sitesi Kurulumu"
- [ ] 🟢 Stok durumu ile senkron: `stock_is_exact` + bool-stok kaynakları (provitanya/swan vs. bool-only kaynaklar) filtreye yansısın
- [ ] 🟢 **Takviye / vitamin / protein kategorileri** için ayrı politika kontrolü: sağlık iddiası, zorunlu uyarı, yaş/kategori kısıtı → uygun değilse `false`, uygunsa `consumer_notice` doldur
- [ ] 🟢 Filtreyi tekrar-çalıştırılabilir bir komut/job yap (stok değiştikçe `ucp_eligible` güncellensin — post-order stok teyit sistemine benzer)

---

## Faz 2 — Ürün Verisi & Merchant Center Feed Temizliği 🟢

### 2a. Structured Data (JSON-LD)
- [ ] 🟢 Her ürün detay sayfasında JSON-LD: `Product`, `Offer`, `Brand`
- [ ] 🟢 `AggregateRating` / `Review` (review sistemi zaten var — bağla)
- [ ] 🟢 `BreadcrumbList`, `Organization`
- [ ] 🟢 Mümkünse shipping + return policy markup
- [ ] 🟢 **Açıklama sızıntısını temizle:** Bazı ürün açıklamalarında `tailwind.config` ve şema/FAQ kod parçaları düz metin olarak görünüyor (ör. "Applied Nutrition Lifestyle Suluk"). Kaynağını kod seviyesinde bul ve temizle — ajanlar bunu ürün açıklaması sanıyor.

### 2b. Feed Bütünlüğü
- [ ] 🟢 **Fiyat/stok tek kaynaktan:** Sitedeki fiyat/stok ile feed'deki fiyat/stok aynı kaynaktan üretilsin. Scraper sync (`sync:source-prices`) ile çelişmemeli.
- [ ] 🟢 **Teslimat vaadi doğruluğu:** Geçmişe düşmüş kargo tarihleri görülüyor (ör. bir üründe "1 Temmuz - 4 Temmuz" ifadesi bugüne göre geçmiş). Teslimat tarihi dinamik hesaplanmalı — yanlış vaat iptal/şikayet üretir.
- [ ] 🟢 **Stokta-yok ürünler:** "Stokta Yok" olanlar feed'de checkout eligible OLMAMALI (ör. Dymatize Iso 100). Faz 1 filtresiyle otomatik dışlansın.
- [ ] 🟢 Zorunlu feed alanları eksiksiz: `id`, `title`, `description`, `link`, `image_link`, `availability`, `price`, `brand`, `gtin/mpn`, `condition`, `shipping`, `return_policy`
- [ ] 🔴 UCP uygunluk alanlarını feed'e ekle (Faz 0 sonrası): `native_commerce.checkout_eligibility`, gerekiyorsa `consumer_notice`, `merchant_item_id`

### 2c. Merchant Center Hesabı
- [ ] 🟢 Müşteri destek bilgisi (en az 1 contact method: URL / e-posta / telefon) MC'ye eklenmeli
- [ ] 🟢 **İletişim tutarlılığı:** footer, KVKK/Aydınlatma, iade, destek, checkout ekranlarındaki iletişim bilgileri tek kaynaktan ve aynı olsun. (Şu an KVKK'da ve satıcı başvuru sayfasında farklı iletişim bilgileri görünüyor.) — İlgili: `[[google-merchant-misrepresentation]]`

---

## Faz 3 — UCP API Katmanı 🔴 (Faz 0 tamamlanmadan başlama)

Backend'e (Laravel) eklenecek servisler. Öneri taban yol: `/ucp/v1/...`

- [ ] 🔴 `/.well-known/ucp` — public JSON, auth İSTEMEZ, capability discovery
  - version, services, capabilities (checkout / cart / order), payment handler'lar, public key'ler
- [ ] 🔴 `POST /ucp/v1/checkout-sessions` — session oluştur
- [ ] 🔴 `GET /ucp/v1/checkout-sessions/{id}` — session oku
- [ ] 🔴 `PUT /ucp/v1/checkout-sessions/{id}` — güncelle (adres değişince vergi + kargo yeniden hesapla)
- [ ] 🔴 `POST /ucp/v1/checkout-sessions/{id}/complete` — ödemeyi tamamla, order döndür
- [ ] 🔴 `POST /ucp/v1/checkout-sessions/{id}/cancel` — iptal
- [ ] 🔴 `POST /ucp/v1/carts` — cart transfer, `continue_url` döndür (ödeme yapmaz)
- [ ] 🔴 **Deterministik doğrulama** her aşamada (create/update/complete):
  - Ürün hâlâ stokta mı? (SourceStockProbe / stok teyit sistemiyle uyumlu)
  - Fiyat değişti mi?
  - Adresle kargo hesaplanıyor mu?
  - Vergi/ücretler doğru mu?
  - Kupon geçerli mi?
  - Ödeme token'ı işlenebilir mi?
- [ ] 🔴 Endpoint'ler idempotent + loglanabilir + SLO'ya uygun hızlı
- [ ] 🔴 Ürün ID eşlemesi: checkout API'nin beklediği ID ile feed ID farklıysa `merchant_item_id` map'i

---

## Faz 4 — Ödeme Entegrasyonu 🔴

- [ ] 🔴 Google Pay payment handler'ı doğrula (Google Wallet ödeme yöntemi → merchant'a güvenli payment instrument)
- [ ] 🔴 **Payment adapter katmanı:** Google Pay token'ını mevcut PSP ile işle
  - iyzico (aktif, marketplace mode) — `[[iyzico-marketplace-submerchant]]`
  - PayTR (aktif, test mode — canlı geçiş bekleniyor)
- [ ] 🔴 `complete` aşamasında token → PSP charge → order oluşturma akışı

---

## Faz 5 — Order Lifecycle Webhook 🔴

- [ ] 🔴 Sipariş oluşturuldu → Google order webhook (full order entity)
- [ ] 🔴 Kargoya verildi → status update
- [ ] 🔴 Teslim edildi → status update
- [ ] 🔴 Event kaynağı: mevcut sipariş yönetimi + kargo entegrasyonu (Geliver) beslesin
- [ ] 🔴 (Opsiyonel) OAuth 2.0 identity linking — kullanıcı hesabı eşleştirme

---

## Faz 6 — Marketplace / Merchant-of-Record Netliği 🟢

Sportoonline çoklu mağaza/satıcı yapısında (Boost, Dropick, Everlast, Muscle Pump, Provitanya vb.).

- [ ] 🟢 **MoR kararı:** Platform mı merchant-of-record, yoksa satıcı/submerchant mı?
  - iyzico marketplace modunda para alt-üye bakiyesine gidiyor, ana panelde görünmüyor. Platform mağazaları (store_seller_id boş) varsayılan alt-üyeye düşüyor. → `[[iyzico-marketplace-submerchant]]`
- [ ] 🟢 Ödeme akışı netleşsin (kim tahsil ediyor, kim alt-üye)
- [ ] 🟢 İade akışı netleşsin (post-order auto-refund sistemi + manuel iade)
- [ ] 🟢 Müşteri desteği ve yasal sorumluluk hangi tarafta?
- [ ] 🟢 UCP profilinde/feed'de her ürünün satıcısı doğru gösterilsin

---

## Öncelik Sırası (Önerilen)

1. **Faz 1 + Faz 2 + Faz 6** (hepsi 🟢) — UCP'den bağımsız olarak siteyi iyileştirir, hemen başlanabilir.
2. **Faz 0** (🔴 doğrulama) — API inşaatına karar vermeden önce zemin.
3. **Faz 3 → 4 → 5** (🔴) — yalnızca Faz 0 net sonuç verirse ve TR uygunsa.

> **Genel prensip:** Her ürün, her sepet, her ödeme ve her sipariş olayı **hem insan arayüzü hem de makine/ajan API'si tarafından aynı güvenilir kaynaktan** okunmalı. Bu sağlanırsa UCP/MCP veya sonraki agentic standartlara uyum kolaylaşır.
