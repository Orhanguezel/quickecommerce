# Sportoonline Reklam Uygunluğu — Uygulama Checklist'i

> Başlangıç: 2026-08-22  
> Branch: `codex/ad-readiness-pilot` (stacked base: `codex/admin-analytics-tabs`)  
> Canlı güvenlik kuralı: migration ve veri importu canlıda otomatik çalıştırılmaz. Genel `db:seed` kesinlikle kullanılmaz.

## Bitti Tanımı

- En az 20 ürün tüm uygunluk kapılarını geçer.
- Pilot ürünlerin piyasa fiyatı son 48 saat içinde ve kaynak bazında doğrulanmıştır.
- Google Merchant pilot feed/etiket kabul oranı en az `%95` olur.
- Fiyat uyuşmazlığı oranı `%2` altında kalır.
- Stokta olmayan veya fiyat verisi bayatlayan ürün reklam havuzundan otomatik çıkar.
- Reklam harcaması sonrası katkı marjı SKU bazında ölçülür.

## 0. Güvenli Temel

- [X] Canlı reklam uygunluk kuralları ve hesaplanan/saklanan sonuçlar denetlendi.
- [X] Canlı baz ölçüm alındı: `0` uygun, `60` hero, `52` kalite-hazır hero, `0` güncel piyasa fiyatı.
- [X] Google feed'in uygunluk filtresinden bağımsız olduğu doğrulandı (`3.502` item, filtre kapalı).
- [X] Karar raporu oluşturuldu: `docs/reports/reklam-uygunluk-yol-haritasi-2026-08-22/report.html`.
- [ ] Analytics ekranında hero hazırlığı ile tüm katalog hijyenini ayrı paydalarla göster.
- [ ] Uygunluk kapı waterfall'u ve Google feed filtre durumunu ekle.
- [ ] Mevcut Google feed'e bağlı Merchant Center/kampanya bağımlılıklarını kaydet.

## 1. Piyasa Fiyatı Veri Hattı

- [X] Kaynak, URL, fiyat, para birimi ve gözlem zamanını saklayan veri modelini ekle.
- [X] Ürün üzerinde güncel minimum, medyan ve kaynak sayısı özetlerini tut.
- [X] CSV importunu eski formatla uyumlu, kaynaklı ve tekrar çalıştırılabilir hale getir.
- [X] Yalnız son `48` saatteki kaynakların son gözlemlerinden aggregate üret.
- [X] CSV sözleşmesi: `product_id|slug`, `price|market_min_price`; önerilen ek alanlar `source_name`, `source_url`, `observed_at`, `currency_code=TRY`.
- [ ] Piyasa fiyatı sağlayıcı/kaynak listesini kesinleştir.
- [ ] Kaynaklardan günlük veri üreten adapter/job geliştir.
- [ ] Başarı oranı `%95` altına düştüğünde veya veri bayatladığında alarm üret.
- [ ] Pilot 20 ürün için dry-run CSV hazırla ve insan kontrolünden geçir.
- [ ] Canlı migration/import için ayrı release onayı al.

## 2. Pilot Ürün Seçimi

- [X] `commerce:select-ad-pilot` salt-okunur aday raporu komutunu geliştir.
- [X] Sıralama: ödenmiş sipariş → benzersiz sepete ekleyen → benzersiz ziyaretçi.
- [X] Zorunlu kapılar: canlı stok, geçerli fiyat, kalite ≥80, mağaza profili ≥80.
- [ ] Marj alt sınırı ve reklam sonrası katkı marjı kuralını tanımla.
- [X] Tek mağaza payını en fazla `%40` ile sınırla; en az 3 mağaza hedefle.
- [X] Dropick, Speedwa, Swan ve pasif/karantinadaki kaynakları pilot dışında tut.
- [ ] Sağlık/takviye ürünlerine ayrıca Merchant politika kontrolü uygula.
- [ ] İlk 20 ürünü manuel onayla ve seçim nedenini kaydet.

## 3. Feed ve Merchant Center

- [ ] Mevcut feed'i kesmeden ayrı pilot feed veya `custom_label_0=ads_ready` ekle.
- [ ] Pilot feed'de yalnız güncel fiyatlı, stoklu ve `ads_eligible=true` ürünleri yayınla.
- [ ] Görsel, fiyat, stok ve politika uyuşmazlıklarını feed öncesi doğrula.
- [ ] Merchant Center kabul/ret sonuçlarını SKU bazında kaydet.
- [ ] En az 20 uygun ürün ve `%95` kabul görülmeden global filtreyi açma.
- [ ] Kesim için rollback adımını yaz ve test et.

## 4. Kampanya ve Ölçüm

- [ ] Küçük bütçeli pilot kampanya oluştur.
- [ ] SKU bazında gösterim, tıklama, harcama, sipariş ve katkı marjını raporla.
- [ ] ROAS yanında reklam sonrası katkı marjını ana guardrail yap.
- [ ] Negatif katkı, `%2+` fiyat reddi veya `%95-` fiyat tazeliğinde etkilenen SKU'yu durdur.
- [ ] 20 → 50 → 100 genişlemesini performans kapılarına bağla.

## 5. Test ve Release

- [ ] Migration'ı yalnız lokal/test veritabanında çalıştır.
- [ ] CSV import dry-run ve apply testlerini tamamla.
- [ ] Readiness hesaplama regresyon testlerini çalıştır.
- [ ] Feed testleri ve frontend build/lint çalıştır.
- [ ] Ayrı PR aç; canlı migration ve deploy manuel onayla yapılacak.
- [ ] Canlı sonrası readiness log, feed item sayısı ve Merchant kabulünü doğrula.
