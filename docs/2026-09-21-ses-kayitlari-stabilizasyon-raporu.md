# 2026-09-21 Ses Kayıtları — Stabilizasyon Kontrol Listesi

Bu rapor 14 ve 21 Eylül tarihli WhatsApp ses kayıtlarındaki talepleri, uygulanan düzeltmeleri ve canlı doğrulama kanıtlarını içerir. Çalışma kök dizinde kontrol listesi olarak başlatıldı; ses kayıtlarındaki işler tamamlandığı için kalıcı kayıt olarak `docs/` altına taşındı.

## 1. Ödeme bütünlüğü ve bekleyen siparişler

- [x] iyzico boş/geçersiz taşıma yanıtının kesin ödeme reddi sayıldığı kök neden doğrulandı.
- [x] Checkout sonucu ve Approval çağrılarına yalnız boş yanıtta güvenli tekrar eklendi.
- [x] Belirsiz callback sonucunda siparişin `failed` yapılması engellendi.
- [x] Son 48 saatteki bekleyen iyzico siparişleri için 5 dakikalık otomatik mutabakat eklendi.
- [x] Paralel checkout isteklerinin birbirinin siparişini silmesi backend kilidiyle engellendi.
- [x] #247, iyzico SUCCESS kanıtıyla `paid` durumuna getirildi.
- [x] #238'in iyzico onay kaydı düzeltildi.
- [x] #237 mükerrer 387 TL tahsilat kullanıcı onayıyla iyzico'dan iptal edildi.
- [x] Müşteriye iptal ve geçerli #238 siparişi hakkında e-posta gönderildi.

## 2. Eski #229 siparişi ve yanlış e-posta

- [x] #229'un ödeme tamamlanmadığı için temizlenmiş sipariş olduğu doğrulandı.
- [x] `pending` durumundaki geçici checkout siparişleri için müşteri durum e-postası engellendi.
- [x] Aynı durumun tekrar kaydı ve geriye doğru sipariş durum geçişleri engellendi.
- [x] Düzeltmenin canlı kaydı ve testleri 12 Eylül olay raporunda mevcut.

## 3. Maskot Meyve Presleri mağazasının kaldırılması

- [x] Canlı mağaza #56'nın `status=2` ve `deleted_at=2026-09-21 14:58:12` olduğu doğrulandı.
- [x] Mağazaya bağlı 45 ürünün tamamının soft delete edildiği doğrulandı; müşteriye açık ürün kalmadı.
- [x] `maskotmeyvepresleri` kaynağını registry içinde pasif yap ve gerekçeyi kaydet.
- [x] Kaynağı günlük `run-all.sh` scraper zincirinden çıkar.
- [x] Health check’in kaldırılmış kaynak için uyarı üretmediği doğrulandı; kaynak sayısı 26’ya indi.
- [x] Canlı mağaza URL’si ve Next.js önbelleği temizlendikten sonra `404` dönüyor; katalogda müşteri erişimi yok.

## 4. e-protein eldiven varyantları

### Kanıt

- [x] Canlı kaynak HTML'deki `productDetailModel.products` listesinin gerçek varyant SKU, stok ve fiyatlarını içerdiği doğrulandı.
- [x] `productVariantData` kayıtlarının `urunID` üzerinden renk/beden seçeneklerini gerçek varyanta bağladığı doğrulandı.
- [x] Mevcut scraper'ın bu modeli okumayıp tek `Default Title` ürettiği doğrulandı.
- [x] #247 ürününün Boodun Profesyonel Fitness Eldiveni Siyah (#900), SKU `DS7U4SJO` olduğu; beden bilgisinin yerel attributes alanında eksik olduğu doğrulandı.

### Kod ve veri düzeltmesi

- [x] IdeaSoft/Ticimax parser'a `productDetailModel` varyant ayrıştırıcısı ekle.
- [x] Her varyant için kaynak ID, SKU/barkod, KDV dahil fiyat, kesin stok, renk/beden attributes ve görsel üret.
- [x] JSON-LD tek varyant fallback'ini varyant modeli bulunmadığında koru.
- [x] Parser için tek varyant, renk+beden, fiyat farkı ve stokta olmayan kombinasyon testleri ekle.
- [x] Mevcut ürünlerde yapısal varyantları idempotent biçimde oluşturan/güncelleyen dry-run varsayılanlı komut ekle.
- [x] Sipariş geçmişinde kullanılan varyant satırlarını silme; eski varyantı pasifleştirip stok 0 yaparak SKU/ilişki bütünlüğünü koru.
- [x] Yalnız eProtein eldivenlerinde dry-run alındı: ilk planda 47 oluşturma, 1 güncelleme, 30 eski varyantı pasifleştirme, 0 hata.
- [x] Canlı DB ve kaynak JSON yedekleri alındı; yollar aşağıdaki canlı kanıt bölümünde kayıtlı.
- [x] Uygulama sonrası 48 çok seçenekli varyantta kaynak/DB SKU, fiyat, stok ve Renk/Beden karşılaştırması yapıldı; uyuşmazlık 0. Tek Crossfit varyantı ayrıca doğrulandı.
- [x] #247 sipariş satırı değiştirilmedi: ürün #900, SKU `DS7U4SJO`, 760,50 TL, adet 1; master ve alt sipariş `paid`.
- [x] Ürün #900 sayfası canlıda HTTP 200; iki aktif seçenek (`S-M`, `L-XL`) ile 845/945 TL fiyatları server çıktısında doğrulandı.
- [x] Günlük scraper’ın kullandığı kanonik JSON güncellendi; aynı kaynakla tekrar dry-run `create=0, update=0, disable=0, unchanged=49, errors=0` verdi.

## 5. Sistem stabilite kapıları

- [x] Sağlık uyarıları kaynak bazında sınıflandırıldı; yedi uyarıdan beşi kapatıldı, iki gerçek takip maddesi kaldı.
- [x] Maskot uyarısı kaynak pasifleştirme ve cron zincirinden çıkarma ile kapatıldı.
- [x] eProtein fail-open uyarısı kesin varyant stoklarının kanonik çıktıya alınmasıyla kapatıldı.
- [x] Multiprice’taki 129 varyantın tamamının kaynak mapping’i olmayan manuel ürünlere ait olduğu belirlendi. Health sorgusu karma mağazalarda yalnız kaynak bağlantılı ürünleri değerlendirecek şekilde düzeltildi.
- [x] Ortholand tazelik ve raketspor/Yonex eksik mapping uyarıları aşağıda ayrı sahipli takip maddelerine dönüştürüldü.
- [x] Dekomum native WooCommerce `is_in_stock`, Herbinatura microdata + fail-closed kanıtları registry metadata’sına işlendi; doğrulanmış kaynaklar için yanlış fail-open alarmı kaldırıldı.
- [x] Canlı smoke test: ödeme mutabakatı 5 dakikalık schedule’da, scraper health çalışıyor, database queue `0 / OK`, Maskot 404, eProtein ürün sayfası 200, müşteri e-postası SMTP logunda başarılı.
- [x] Scraper testleri 13/13 geçti; PHP syntax kontrolleri temiz. Bu geçişte frontend dosyası değişmedi; canlı HTTP kontrolleri uygulandı.
- [x] Canlı yedekler, komut sonuçları ve kalan iki takip maddesi bu rapora yazıldı.

## Tamamlanma ölçütü

- Maskot hiçbir müşteri ekranında veya günlük scraper çalışmasında yer almaz.
- e-protein varyantlı ürünleri kaynak SKU/renk/beden/fiyat/stok yapısıyla eşleşir.
- Mevcut siparişler ve özellikle #247 değişmeden korunur.
- Ödeme belirsizliği siparişi yanlışlıkla `failed` yapmaz ve otomatik mutabakat çalışır.
- Sağlık kontrolündeki her uyarının sahibi, eylemi ve doğrulama kanıtı vardır.
- Bu dosya tamamlanan kanıtlarla `docs/2026-09-21-ses-kayitlari-stabilizasyon-raporu.md` yoluna taşınır.


## Kök neden özeti

### iyzico ödeme hatası

İyzico PHP SDK, sağlayıcıdan zaman zaman gelen boş veya geçersiz taşıma yanıtını hata kodu olmayan, alanları `null` bir sonuç nesnesine çeviriyordu. Uygulama bunu kesin ret sanarak siparişi `failed` yapıyordu. Aynı anda tekrarlanan checkout istekleri ikinci bir geçici sipariş ve mükerrer tahsilat da üretebiliyordu. Boş yanıt tekrarları, belirsiz sonucu `pending` tutma, beş dakikalık mutabakat ve checkout kilidi bu zinciri kapattı.

### eProtein varyant hatası

Eski scraper yalnız JSON-LD ürün özetini okuyup `Default Title` oluşturuyordu. Gerçek varyantlar Ticimax `productDetailModel.products`, seçenekler ise `productVariantData` içindeydi. Ayrıca Ticimax seçenek satırlarını kombinasyona göre farklı sırada verdiği için ilk düzeltmede bazı `Renk/Beden` alanları yer değiştirdi. Ayrıştırıcı artık seçenekleri adlarıyla eşleyip sabit `Renk → Beden` düzeninde üretir.

### Health check yanlış alarmları

Maskot kaldırıldığı halde registry ve cron aktifti. Dekomum ile Herbinatura için daha önce doğrulanmış stok sinyali metadata olarak tutulmadığından fail-open alarmı sürüyordu. Multiprice karma mağaza olduğu halde mağaza düzeyinde değerlendirilip 129 manuel varyant kaynak açığı sanılıyordu. Bu üç kontrol düzeltildi.

## Canlı kanıt ve yedekler

- Uygulama yedeği: `/var/www/quikecommerce/backups/audio-stability-20260921-184049`
- eProtein ilk varyant yedeği: `storage/app/backups/eprotein-glove-variants-before-20260921.json`
- eProtein kaynak yedeği: `storage/app/backups/eprotein-products-before-variant-sync-20260921.json`
- Seçenek sırası düzeltmesi öncesi kaynak: `storage/app/backups/eprotein-products-before-option-order-fix-20260921.json`
- iyzico mutabakat yedeği: `storage/app/backups/iyzico-reconcile-20260921.json`
- Mükerrer iptal kaydı: `storage/app/backups/iyzico-cancel-duplicate-237-20260921.json`
- Müşteri e-posta kaydı: `storage/app/backups/customer-email-duplicate-cancel-238-20260921.json`
- Son eProtein idempotence kontrolü: 10 ürün, 49 aktif yapısal varyant, 49 unchanged, 0 işlem, 0 hata.
- Son scraper health: 26 kaynak, 2 gerçek takip uyarısı.

## Açık takip maddeleri

- [ ] **Ortholand:** Multiprice içinde 9 mapping `manual_reviewed`; son sync `2026-09-13 17:01:30`. Repo içinde aktif scraper/registry kaydı yok. Kaynağın emekliye ayrılıp ürünlerin manuel yönetilmesi veya entegrasyonun geri kurulması kararlaştırılmalı.
- [ ] **raketspor_yonex:** 15 onaylı ürüne ait 69/291 mapping son kaynak JSON’da bulunmuyor. Tedarikçiden kalkmış ürünler ile slug değişen ürünler ayrılmalı; ardından stok kapatma veya mapping taşıma uygulanmalı.

Bu iki madde canlı veriyi topluca silme veya ürün kapatma kararı gerektirdiği için bu olay kapsamında otomatik değiştirilmedi. Sağlık raporu bunları görünür tutuyor.
