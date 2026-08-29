# Sadakat Puanı Sistemi — Yol Haritası ve Checklist

**Tarih:** 2026-08-29
**Kapsam:** Yorum/alışveriş puanı + puan→hediye çeki sistemi, ve bu sistemin çalışabilmesi için önce kapatılması gereken iki tıkanıklık.

---

## 0. Özet

Sadakat sistemi doğru fikir, ama **bugün açılırsa boşa çalışır**. Sebep basit: sistemin yakıtı yorum ve teslim edilmiş sipariş, ikisi de bugün yok denecek kadar az. Önce huniyi açıyoruz, sonra ödülü koyuyoruz.

### Canlı durum (2026-08-29 tespit)

| Ölçüm | Değer |
|---|---|
| Ödenmiş sipariş | 17 |
| Toplam ciro (GMV) | 42.039,31 TL |
| Platform komisyonu | 4.340,68 TL (**%10,33**) |
| Ortalama sepet | **2.472,90 TL** |
| Ortalama marj / sipariş | ~255 TL |
| Teslim edilen sipariş | 10 |
| **Ödenmiş ama teslim edilmemiş** | **7 sipariş / 11.184,75 TL** |
| Toplam onaylı yorum | **1** |
| Müşteri | 129 (24'ü misafir) |
| Müşteri cüzdanı | 0 |
| Cüzdanla ödenen sipariş | 0 |

**Çıkarım:** %10,33 marjla çalışıyoruz. Geri verilen her kuruş buradan çıkıyor. Sadakat bütçesi bu sayının içinde kurgulanmalı.

### Sıralama

1. **Sipariş durumu hijyeni** — teslim edildi işaretlenmeyen sipariş yorum daveti üretmez
2. **Yorum davet penceresini genişlet** — 2 günü kaçıran sipariş bir daha davet alamıyor
3. **Sadakat sistemi** — huni çalışmaya başlayınca gerçek taban oluşur

---

## 1. Sıra 1 — Sipariş durumu hijyeni

### Sorun

7 ödenmiş sipariş `delivered` durumuna hiç geçmemiş. Üçü **bir aydan eski**:

| Sipariş | Durum | Tutar | Tarih | Bekleme | Müşteri |
|---|---|---|---|---|---|
| #184 | confirmed | 3.450,00 | 2026-07-16 | 44 gün | Ayhan Gülşen |
| #187 | confirmed | 1.099,00 | 2026-07-26 | 34 gün | Can Önür |
| #188 | confirmed | 764,75 | 2026-07-27 | 33 gün | SELÇUK TAŞ |
| #202 | confirmed | 2.025,00 | 2026-08-16 | 13 gün | Okan Dedeoğlu |
| #208 | confirmed | 1.950,00 | 2026-08-24 | 5 gün | ilhan turan |
| #209 | shipped | 699,00 | 2026-08-29 | 0 gün | Ali Akay |
| #211 | confirmed | 1.197,00 | 2026-08-29 | 0 gün | Asiye Bektaş |

### Neden önemli

`delivered` işareti üç şeyi birden tetikliyor:

- **Yorum daveti** (`orders:dispatch-review-requests`) — sadece `status = delivered` siparişlere gider
- **Satıcı cüzdanına hakediş** — `order_amount_store_value` ancak teslimatta yazılıyor
- **İade penceresi** — `OrderRefundRepository` `delivered` değilse `not_delivered` döner

Yani teslim işaretlenmeyen sipariş; yorum üretmez, satıcıya para geçmez, iade edilemez. Sadakat sisteminin puan kaynağı da budur.

### Yapılacak

Bu operasyonel bir iş, kod işi değil. Her sipariş için gerçek durumu tespit edip panelden ilerlet:

- Kargo teslim edilmişse → `delivered`
- Tedarik edilemediyse → `cancelled` + iade
- Hâlâ yolda ise → `shipped` (Geliver webhook'u teslimatta otomatik `delivered` yapar)

**Kalıcı çözüm:** `orders:check-shipping-sla` komutu 15 dakikada bir çalışıyor ama sorgusu `whereNotNull('promised_ship_at')` ile başlıyor. Bu alan **35 siparişin hiçbirinde dolu değil**, dolayısıyla SLA alarmı yapısal olarak hiçbir zaman eşleşmiyor — bu liste bu yüzden sessizce birikti. Sipariş oluşturulurken `promised_ship_at` doldurulursa (örn. mağazanın hazırlık süresi + 1 iş günü) alarm gerçekten çalışmaya başlar.

---

## 2. Sıra 2 — Yorum davet penceresi

### Sorun

`app/Console/Commands/DispatchReviewRequests.php`:

```php
->where('status', 'delivered')
->whereNull('review_request_sent_at')
->whereNotNull('delivery_completed_at')
->where('delivery_completed_at', '>=', now()->subDays(2))   // ← 2 GÜN
```

Komut 11:00–19:00 arası 30 dakikada bir koşuyor. Teslimattan sonraki 2 gün içinde yakalanamayan sipariş **bir daha asla** davet alamıyor. Teslim işareti geç konursa (Sıra 1'deki gibi haftalar sonra), pencere çoktan kapanmış olur.

### Yapılacak

- Pencereyi **14 güne** çıkar (`subDays(2)` → `subDays(14)`)
- Alt sınır ekle: `delivery_completed_at >= '2026-08-01'` gibi bir tabanla, geçmişteki 10 teslimata toplu mail gitmesini engelle
- Tercihen komuta `--since=` parametresi ekle, geriye dönük toplu gönderim kontrollü yapılabilsin

### Düzeltilmiş ilgili hata (2026-08-29, commit `6e6d25fd`)

`RoundNumericFields` trait'i Eloquent'in `isFillable()` metodunu eziyordu; `forceFill()` `$fillable` dışındaki alanları sessizce atıyordu. `review_request_sent_at` hiç yazılamadığı için komut aynı siparişi her 30 dakikada yeniden uygun görüyordu — **sipariş #194'ün müşterisine 2 günde 14 davet maili gitti**. Düzeltildi ve canlıda doğrulandı. Pencere genişletilmeden önce bu düzeltmenin canlıda olduğundan emin ol, yoksa 14 günlük pencere spam'i 7 katına çıkarır.

---

## 3. Sıra 3 — Sadakat puanı sistemi

### 3.1 Şema (onaylandı)

**Kazanma**

| Kaynak | Puan | Koşul |
|---|---|---|
| Sipariş | 1 TL = **1 puan** | Sipariş `delivered` olduğunda. Ödendiğinde **değil** |
| Yorum (görselli) | **2.000 puan = 20 TL** | Yorum `approved` olduğunda, **ürün başına bir kez** |
| Yorum (görselsiz) | **1.000 puan = 10 TL** | Yorum `approved` olduğunda, **ürün başına bir kez** |

Yorum bonusu için iki koruma: **ürün başına bir kez** (aynı ürünü tekrar alıp yeniden
değerlendirse de ikinci bonus yok) ve **sipariş başına en fazla 3 değerlendirme**
(`com_loyalty_review_max_per_order`). Kurye değerlendirmeleri kapsam dışı.

**Harcama**

| Kural | Değer |
|---|---|
| Kur | **1000 puan = 10 TL** |
| Minimum çek | **25 TL** (2.500 puan) |
| Minimum sepet | **500 TL** |
| Geçerlilik | **90 gün** |

### 3.2 Ekonomi kontrolü

Ortalama sepet 2.472,90 TL, komisyon %10,33 → sipariş başına ~255 TL marj.
**Canlıda her siparişte tek ürün var** (17 sipariş / 17 satır), yani pratikte
sipariş başına en fazla bir yorum bonusu çıkıyor.

| | TL | Ciro payı | Marj payı |
|---|---|---|---|
| Sipariş puanı (2.473 puan) | 24,72 | %1,00 | %9,7 |
| Fotoğraflı yorum (2.000 puan) | 20,00 | %0,81 | %7,8 |
| **Toplam** | **44,72** | **%1,81** | **%17,5** |

Kalıcı bir program için yüksek; **lansman kampanyası** olarak makul. Katalogda
tek onaylı yorum var, içerik edinme maliyeti olarak bakılmalı. Hacim gelince
panelden düşürülür — Trendyol da programı hacme ulaşınca kapatmıştı.

**Ayar koruması:** kazanma ve harcama oranları birlikte "efektif geri verme
yüzdesi"ni belirler. Sunucu bunu hesaplayıp **%20 üstünü reddediyor**, ayrıca
`com_loyalty_earn_per_currency` en fazla 10 olabiliyor. (2026-08-29'da panelden
1 TL = 100 puan girilip kazanım açılmıştı; defter boş olduğu için zarar
oluşmadı, koruma bu olaydan sonra eklendi.)

**Neden 1 TL = 1 puan ama 1000 puan = 10 TL?** Kazanma oranı yüksek görünsün, harcama oranı marjı korusun diye. Müşteri "2.473 puan kazandım" görür, karşılığı 24,73 TL'dir. Trendyol dahil tüm sadakat programları bu ayrımı kullanır.

### 3.3 Neden cüzdan değil, kupon

Puan karşılığı **kişiye özel kupon** olarak verilecek. Cüzdan **kullanılmayacak**.

| | Kupon | Cüzdan |
|---|---|---|
| Canlıda kullanımda mı | ✅ 8 kupon, 215 kullanım | ❌ 0 müşteri cüzdanı, 0 sipariş |
| Kişiye özel | ✅ `coupon_lines.customer_id` | ✅ |
| Minimum sepet | ✅ `min_order_value` | ❌ yok |
| Son kullanma | ✅ `start_date` / `end_date` | ❌ yok |
| Tek kullanımlık | ✅ `usage_limit` sayaç | ❌ yok |
| Bilinen hata | — | ⚠️ aşağıya bak |

**Cüzdan yolundaki hata:** `PlaceOrderController::updateWallet()` başarısızlıkta `JsonResponse` döndürüyor, çağıran `if ($success)` yapıyor. PHP'de `JsonResponse` nesnesi **her zaman truthy** — yani bakiye yetmezse sipariş **para düşülmeden "ödendi"** işaretlenir. Bugün zararsız (0 cüzdan, 0 cüzdan siparişi) ama puanları cüzdana yazarsak doğrudan bu hataya basarız.

### 3.4 Kupon motoru — doğrulanmış davranış

`Helpers::checkCoupon()` / `Helpers::applyCoupon()` okundu, gereken her şeyi yapıyor:

- `customer_id` doluysa giriş yapmış müşteriyle eşleşmesi zorunlu ✅
- `start_date` / `end_date` kontrolü ✅
- `min_order_value` kontrolü ✅
- `usage_limit == 0` ise reddediyor; `applyCoupon()` kullanımda `usage_count`'u artırıp `usage_limit`'i **azaltıyor** (geri sayaç) ✅

**İki tuzak — çek üretirken zorunlu:**

1. **`max_discount` NULL BIRAKILAMAZ.** Kod `if ($discount_amount > $coupon->max_discount)` yapıyor. NULL, karşılaştırmada 0'a dönüşür, koşul her zaman doğru olur ve indirim **0 TL**'ye kırpılır. Çek tutarı neyse `max_discount` da o olmalı.
2. **`coupon_id` NULL BIRAKILAMAZ.** Kod `$coupon->coupon->status` diyor. Tek bir üst kupon kaydı ("Sadakat Puanı Çeki") açılıp üretilen tüm `coupon_lines` ona bağlanmalı.

Üretilecek çekin şablonu:

```
coupon_id        = <"Sadakat Puanı Çeki" kaydının id'si>
customer_id      = <müşteri>
coupon_code      = PUAN-XXXXXXXX          (Helpers'ta benzersizlik döngüsü var)
discount_type    = 'amount'
discount         = 25.00                   (çek tutarı)
max_discount     = 25.00                   (ZORUNLU, discount ile aynı)
min_order_value  = 500.00
usage_limit      = 1
start_date       = now()
end_date         = now()->addDays(90)
status           = 1
```

### 3.5 Veri modeli

Puan altyapısı sıfırdan yazılacak — mevcut yarım iskelet yok.

**`loyalty_point_transactions`** (defter; bakiye bu tablodan toplanır, ayrı bakiye alanı tutulmaz)

| Alan | Tip | Not |
|---|---|---|
| `id` | bigint | |
| `customer_id` | FK customers | |
| `points` | int | Kazanım `+`, harcama `-` |
| `type` | enum | `order`, `review`, `redeem`, `expire`, `manual` |
| `reference_type` / `reference_id` | polimorfik | Order / Review / CouponLine |
| `description` | string | Müşteriye gösterilecek metin |
| `expires_at` | datetime, nullable | Kazanımlarda dolu, harcamalarda boş |
| `created_at` | timestamp | |

Benzersiz indeks: `(customer_id, type, reference_type, reference_id)` — aynı sipariş/yorum için ikinci kez puan yazılmasını **veritabanı seviyesinde** engeller. Bu, iki kez tetiklenen bir job'ın çift puan yazmasına karşı tek gerçek koruma.

### 3.6 Tetikleyiciler

| Olay | Nerede | Aksiyon |
|---|---|---|
| Sipariş `delivered` oldu | `GdeliverWebhookController::handleDelivered()` + `AdminOrderManageController` delivered dalı + `DeliverymanManageRepository` | `order_amount` kadar puan yaz, `expires_at = +365 gün` |
| Yorum `approved` oldu | Admin yorum moderasyon aksiyonu | Görselli +250 / görselsiz +100 |
| Sipariş iptal/iade | `refund_status = refunded` veya `status = cancelled` | O siparişin puanını **geri al** (negatif kayıt) |

### Bekleme süresi (14 gün) — iadenin çalışmasını sağlayan şey

Puanın **teslimatta** yazılması tek başına yetmiyor: müşteri puanı teslimat günü
çeke çevirip harcarsa, beş gün sonra gelen iadede geri alınacak puan kalmaz.

Bu yüzden kazanılan puan `available_at` tarihine kadar **beklemede** tutulur
(`com_loyalty_hold_days`, varsayılan **14 gün** — mesafeli satışta cayma hakkı
süresi). Bakiye her zaman yalnızca `available_at IS NULL OR available_at <= NOW()`
satırlarının toplamıdır.

**Durum alanı + cron değil, tarih.** Puanı "olgunlaştıran" bir job olsaydı, job
çalışmadığında puanlar sonsuza kadar askıda kalırdı. Tarih karşılaştırması ile
böyle bir arıza mümkün değil.

| Senaryo | Davranış |
|---|---|
| İade, puan hâlâ beklemedeyken (olağan) | Geri alma kaydı **aynı `available_at` ile** yazılır; iki kayıt bekleyen havuzda netleşir, kullanılabilir bakiyeye dokunulmaz |
| İade, puan açıldıktan sonra | Kullanılabilir bakiyeden düşülür |
| İade, puan zaten harcanmış | Geri alma **kalan bakiye kadar kırpılır**, müşteriye borç çıkarılmaz; fark loglanır (`[loyalty] iade puani tam geri alinamadi`) |

Geri alma kaydına `available_at`'i kopyalamak kritik: "anında" yazsaydık bekleyen
+1000'e karşılık kullanılabilir −1000 olur, bakiye sebepsiz eksiye düşerdi.

`expires_at` de bekleme **bittikten sonra** başlar; 14 gün müşterinin kullanma
süresinden kesilmez.
| Puan bozdurma | Yeni müşteri endpoint'i | Puan düş + kişiye özel kupon üret |

**Kritik:** puan yazımı `delivered` olayına bağlanacak, `paid` olayına değil. Bugün 17 ödenmiş siparişin 7'si teslim edilmemiş; `paid` üzerinden puan verilirse iptal edilen siparişler hayalet puan bırakır.

### 3.7 Admin kontrolü

Mevcut `com_option_get()` deseni kullanılacak (`setting_options` tablosu):

| Ayar | Varsayılan | Açıklama |
|---|---|---|
| `com_loyalty_enabled` | `off` | Ana anahtar |
| `com_loyalty_earn_per_currency` | `1` | 1 TL kaç puan |
| `com_loyalty_redeem_points_per_unit` | `1000` | Kaç puan = 1 birim |
| `com_loyalty_redeem_value` | `10` | O birimin TL karşılığı |
| `com_loyalty_min_redeem_points` | `2500` | Minimum bozdurma |
| `com_loyalty_voucher_min_order` | `500` | Çekin minimum sepeti |
| `com_loyalty_voucher_valid_days` | `90` | Çek geçerliliği |
| `com_loyalty_review_bonus_with_image` | `250` | Görselli yorum |
| `com_loyalty_review_bonus_no_image` | `100` | Görselsiz yorum |
| `com_loyalty_points_expire_days` | `365` | Puan ömrü |

**Kapatma davranışı — ayrı düşünülmeli.** `com_loyalty_enabled = off` yapmak *yeni kazanımı* durdurur; **birikmiş puanlar müşteriye verilmiş bir sözdür**. Kapatırken:

- Yeni puan kazanımı durur
- Mevcut puanlar duyurulan bir tarihe kadar bozdurulabilir kalır
- Üretilmiş çekler `end_date`'ine kadar geçerli kalır

Anahtarı kapatıp puanları anında iptal etmek müşteri kaybettirir. Trendyol da programı kapatırken bu geçişi verdi.

### 3.8 Yasal uyum

Yoruma puan vermek serbest, ama **açıklama zorunlu**. Dayanak: Ticari Reklam ve Haksız Ticari Uygulamalar Yönetmeliği; Reklam Kurulu bu konuda ceza kesiyor. Google Merchant Center ürün yorumu politikası da gizlenmiş teşviki yasaklıyor.

Üç kural, kurguyu bozmuyor:

1. **Puan yıldız sayısından bağımsız.** 1 yıldıza da 5 yıldıza da aynı puan. Olumluya şart koşmak hem hukuki risk hem güvenilirlik kaybı.
2. **Rozet.** Puan kazanılmış yorumun yanında "Puan kazanılan değerlendirme" ibaresi.
3. **Sadece doğrulanmış alışveriş.** `reviews` tablosu zaten `order_id` + `customer_id` taşıyor, bu yapısal olarak garanti.

### 3.9 Yan fayda: misafir → üye dönüşümü

129 müşterinin 24'ü misafir. Misafir checkout gerçek bir `customers` kaydı açıyor (`is_guest = 1`), yani puanı teknik olarak biriktirebilir. "Puanlarınızı kullanmak için hesabınızı tamamlayın" doğal bir dönüşüm kaldıracı olur.

---

## 4. Checklist

> **Durum (2026-08-29 akşamı):** Yazılım tarafı **bitti** — backend, admin paneli ve
> müşteri arayüzü canlıda, `com_loyalty_enabled` **kapalı** duruyor.
> Kalanlar tamamen operasyonel: Sıra 1'deki 7 siparişin durumunu ilerletmek,
> koşullar sayfasını gözden geçirip yayınlamak, sonra programı açıp izlemek.


### Sıra 1 — Sipariş durumu hijyeni

- [ ] #184 (3.450,00 TL, 44 gün) gerçek durumunu tespit et → `delivered` / `cancelled`
- [ ] #187 (1.099,00 TL, 34 gün) gerçek durumunu tespit et
- [ ] #188 (764,75 TL, 33 gün) gerçek durumunu tespit et
- [ ] #202 (2.025,00 TL, 13 gün) gerçek durumunu tespit et
- [ ] #208 (1.950,00 TL, 5 gün) — ürün tedarik edildi mi, kargoya verildi mi
- [ ] #209 (699,00 TL) — kargoda, takip `6487058268514`, Geliver webhook'u teslimatta kapatacak
- [ ] #211 (1.197,00 TL) — kargo süreci başlat
- [ ] İptal edilenler için iade işlemini tamamla
- [x] `promised_ship_at` artık yazılıyor — `OrderService` zaten set ediyordu ama `Order::$fillable`'da olmadığı için mass-assignment **sessizce atıyordu**; bugünkü `Order.php` deploy'u ile düzeldi, canlıda doğrulandı
- [ ] Bir hafta sonra tekrar bak: ödenmiş + teslim edilmemiş sipariş sayısı düşüyor mu

### Sıra 2 — Yorum davet penceresi

- [x] `RoundNumericFields` düzeltmesinin canlıda olduğunu doğrula (`forceFill` testi) — commit `6e6d25fd`
- [x] `DispatchReviewRequests`: `subDays(2)` → `subDays(14)` — `com_review_invite_window_days` ile ayarlanabilir, commit `7aaae0de`
- [x] Geçmişe toplu mail gitmesin diye alt tarih sınırı ekle — `--since` / `com_review_invite_not_before`
- [x] `--since=` parametresi ekle (kontrollü geriye dönük gönderim)
- [x] `--dry-run` ile doğrulandı: 14 gün → boş, 30 gün → #193, `--since=2026-08-20` → boş
- [ ] İlk gerçek koşudan sonra: kaç davet gitti, kaç yorum geldi

### Sıra 3 — Sadakat sistemi

**Veri katmanı**

- [x] `loyalty_point_transactions` migration — canlıda koşuldu
- [x] `(customer_id, type, reference_type, reference_id)` benzersiz indeksi
- [x] `LoyaltyPointTransaction` modeli
- [x] `LoyaltyService`: award / revoke / balance / redeem

**Kazanma**

- [x] `delivered` olan üç akışa da puan yazımı bağlandı (Geliver webhook, admin paneli, kurye)
- [x] Yorum `approved` olduğunda bonus yazılıyor (görselli/görselsiz)
- [x] İptal/iade geri alımı — `OrderObserver` + `IyzicoRefundService` (ham SQL yolu observer'ı tetiklemiyor)
- [x] Aynı sipariş/yorum için ikinci kez puan yazılamadığı test edildi

**Harcama**

- [x] "Sadakat Puanı Çeki" üst kuponu ilk bozdurmada otomatik oluşuyor (`firstOrCreate`)
- [x] Bozdurma endpoint'i: `POST /customer/loyalty/redeem`
- [x] `max_discount = discount` doğrulandı
- [x] `coupon_id` dolu, doğrulandı
- [x] `usage_limit = 1` canlıda test edildi
- [x] Başka müşterinin çeki kullanamadığı test edildi
- [x] `min_order_value` altında reddedildiği test edildi

**Ayarlar ve panel**

- [x] Ayarlar eklendi — `LoyaltySettingsSeeder`, canlıda 12 kayıt
- [x] Admin panelde sadakat ayarları ekranı — `/admin/system-management/loyalty-settings`, açık yükümlülük özeti + canlı geri-verme oranı hesabı
- [x] Admin: müşteri puan geçmişi + manuel puan ekleme/silme — `/admin/loyalty`
- [x] Kapatma akışı: `com_loyalty_enabled` (kazanım) + `com_loyalty_redeem_enabled` (bozdurma) ayrı

**Kampanya duyurusu (popup değil banner)**

- [x] Herkese açık `GET /api/v1/loyalty-campaign` — giriş yapmamış ziyaretçi de görebilir
- [x] Hesabım > Siparişlerim ve Değerlendirmelerim üstünde tam banner
- [x] Yorum yazma dialogunda tek satırlık hatırlatma
- [x] Değerlendirme davet e-postasında kampanya kutusu
- [x] Hepsi kampanya kapalıyken hiçbir şey çizmez
- [x] Yasal açıklama metni tek kaynaktan (`disclosure` alanı) geliyor

**Müşteri arayüzü**

- [x] Hesabım → "Puanlarım" sekmesi: bakiye + TL karşılığı + geçmiş
- [x] Bozdurma ekranı — canlı TL önizlemesi, minimuma ne kadar kaldığı
- [x] Çeklerim listesi — kod kopyalama, min sepet, son kullanma, kullanıldı/süresi doldu
- [x] Sipariş sonrası "X puan kazandınız" bildirimi (UniversalNotification)
- [x] Yorum sonrası "X puan kazandınız" bildirimi
- [x] Misafir CTA'sı — `/customer/loyalty` artık `is_guest` dönüyor

**Uyum**

- [x] Puan yıldız sayısından bağımsız — self-test bunu da doğruluyor
- [x] Yorum kartına "Puan kazanılan değerlendirme" rozeti (`is_incentivized`)
- [x] Koşullar sayfası — `pages` #16 `sadakat-programi`, **TASLAK**; sayılar canlı ayarlardan üretildi, yayınlamak sende

**Açılış**

- [x] `com_loyalty_enabled = off` ile deploy edildi
- [x] Uçtan uca test: `php artisan loyalty:selftest` — canlıda **49/49 geçti** (transaction + rollback, kalıcı yazım yok)
- [x] 14 günlük bekleme süresi (`com_loyalty_hold_days`) — iade geri alımının fiilen çalışması için
- [ ] Koşullar sayfasını (`sadakat-programi`, taslak) gözden geçirip yayınla
- [ ] `php artisan loyalty:selftest` çalıştır (canlıda güvenli), sonra `com_loyalty_enabled = on`
- [ ] Aç, ilk hafta günlük kontrol: dağıtılan puan, üretilen çek, kullanılan çek
- [ ] Bir ay sonra: efektif geri verme oranı %1 civarında mı, marj korunuyor mu

---

## 5. Bilinen tuzaklar

| Tuzak | Sonuç | Nerede |
|---|---|---|
| `coupon_lines.max_discount` NULL | İndirim 0 TL'ye kırpılır, çek işe yaramaz | `Helpers::checkCoupon()` |
| `coupon_lines.coupon_id` NULL | `$coupon->coupon->status` null erişimi | `Helpers::checkCoupon()` |
| Cüzdanla ödeme | Bakiye yetmezse sipariş parasız "ödendi" olur | `PlaceOrderController::updateWallet()` |
| `paid` üzerinden puan | İptal edilen siparişler hayalet puan bırakır | Tasarım kararı |
| Anahtarı kapatınca puan iptali | Müşteri kaybı | Tasarım kararı |
| Trait'te Eloquent metod adı | `forceFill` sessizce çalışmaz | `RoundNumericFields` (düzeltildi) |
| Bekleme süresi 0 | İade koruması kapanır; harcanmış puan geri alınamaz | `com_loyalty_hold_days` (form uyarı veriyor) |
| Geri alma kaydına `available_at` kopyalanmazsa | Bekleyen +N'e karşı kullanılabilir −N → bakiye eksiye düşer | `LoyaltyService::revokeForOrder()` |

## 6. Ölçüm

Açtıktan sonra haftalık bakılacak:

- Dağıtılan puan / dönüştürülen çek / kullanılan çek
- **Efektif geri verme oranı** = kullanılan çek tutarı ÷ GMV → hedef **%1**
- Yorum sayısı (taban: 1)
- Teslim edilen sipariş oranı
- Misafirden üyeliğe dönüşüm
- Puanlı müşterinin tekrar alışveriş oranı vs. puansız
