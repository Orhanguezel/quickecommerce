# 2026-09-21 Ses Kayıtları — Stabilizasyon Kontrol Listesi

Bu dosya 14 ve 21 Eylül tarihli WhatsApp ses kayıtlarındaki talepleri tek geçişte tamamlamak için çalışma listesidir. Tüm maddeler doğrulandıktan sonra kalıcı olay/işletim kaydı olarak `docs/` altına taşınacaktır.

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
- [ ] Health check'in kaldırılmış kaynak için uyarı üretmediğini doğrula.
- [ ] Canlı mağaza URL'sinin katalog/store listesinde görünmediğini doğrula.

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
- [ ] Önce yalnız e-protein eldivenlerinde dry-run al; oluşacak/silinecek/güncellenecek varyantları raporla.
- [ ] Canlı DB ve kaynak JSON yedeği al.
- [ ] `--apply` sonrasında tüm eldivenlerde kaynak varyant sayısı, seçenekleri, fiyatı ve stokları karşılaştır.
- [ ] #247 sipariş satırını değiştirmeden, müşteriye aldığı fiyattan gönderim kararını koru.
- [ ] Ürün detay sayfasında renk/beden seçimi ve varyanta göre fiyat değişimini mobil/masaüstü doğrula.
- [ ] Sonraki günlük scrape+sync çalışmasının varyant yapısını bozmadığını doğrula.

## 5. Sistem stabilite kapıları

- [ ] `scrapers:health-check` içindeki yedi uyarıyı kaynak bazında sınıflandır: gerçek arıza, kaldırılmış kaynak, mapping açığı, fail-open şüphesi.
- [ ] Maskot uyarısını kaldırılmış kaynak temizliğiyle kapat.
- [ ] e-protein fail-open stok sinyalini gerçek varyant stoklarıyla kapat.
- [ ] Multiprice'taki 129 mapping'siz stoklu varyantı e-protein düzeltmesi sonrası yeniden say; kalanları kaynağa göre ayır.
- [ ] Ortholand tazelik ve raketspor/Yonex eksik mapping uyarılarını ayrı çalışma maddelerine dönüştür.
- [ ] Dekomum ve Herbinatura stok parser'larının gerçekten stok=0 üretebildiğini örnek ürünlerle doğrula; belirsizse fail-closed uygula.
- [ ] Checkout, ödeme callback, sipariş e-postası, scraper health ve queue için tek canlı smoke-test raporu al.
- [ ] Genel regresyon testleri ve ilgili frontend production buildlerini çalıştır.
- [ ] Canlı yayın yedeği, komut çıktıları ve kalan sınırlamaları `docs/` altındaki son rapora yaz.

## Tamamlanma ölçütü

- Maskot hiçbir müşteri ekranında veya günlük scraper çalışmasında yer almaz.
- e-protein varyantlı ürünleri kaynak SKU/renk/beden/fiyat/stok yapısıyla eşleşir.
- Mevcut siparişler ve özellikle #247 değişmeden korunur.
- Ödeme belirsizliği siparişi yanlışlıkla `failed` yapmaz ve otomatik mutabakat çalışır.
- Sağlık kontrolündeki her uyarının sahibi, eylemi ve doğrulama kanıtı vardır.
- Bu dosya tamamlanan kanıtlarla `docs/2026-09-21-ses-kayitlari-stabilizasyon-raporu.md` yoluna taşınır.
