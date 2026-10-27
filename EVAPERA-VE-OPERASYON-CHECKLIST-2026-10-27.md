# Evapera ve operasyon kontrol listesi — 27 Ekim 2026

## Uygulama durumu (27 Ekim, canlı)

- [x] Kullanıcı Evapera anlaşmasını ve yetkili kaynağın `evapera.com` olduğunu doğruladı.
- [x] Python sanal ortamı 3.13'e geri bağlandı; hedefli Provitanya tarama/senkronu hatasız geçti. PR: <https://github.com/Orhanguezel/quickecommerce/pull/30>.
- [x] Sağlık raporu, eski başarısızlığı aynı günkü başarılı tekrar denemeden sonra göstermeyecek şekilde düzeltildi (PR #30; canlıda doğrulandı).
- [x] Kayıtlı tarayıcısı olmayan Heyday #78 ve Neptün #79'un 880 saattir bayat kalan 23 eşlemesindeki 20 pozitif stok sıfırlandı; geri alma verisi canlı sunucuda `backend-laravel/storage/app/private/ops/legacy-source-stock-20261027.json` (600 izinli). İki public mağazada satılabilir ürün sayısı 0.
- [x] Kullanıcının “diğer mağazalar gibi” talimatıyla Evapera #81 açıldı: mevcut tedarikçi mağaza modeli `dropship`, %10 komisyon, 48 saat gönderim hedefi. 13 ürün `approved`, 56 varyantın 52'si stoklu; public listede 12 ürün var. Açılış öncesi durum özel yedekte: `backend-laravel/storage/app/private/ops/evapera-before-activation-20261027.json`.
- [x] Kaynaktaki Evapera logosu yerel Media kaydına alındı; marka #550 ve 13 ürünün marka/SEO alanları tamamlandı. Önceki ürün alanları özel yedekte: `backend-laravel/storage/app/private/ops/evapera-before-brand-metadata-20261027.json`.
- [x] 13 ürünün başlık/açıklaması, 56 varyantın fiyat/stoku/SKU'su ve görselleri kaynakla karşılaştırıldı. 7 üründeki açık yazım/biçim hatası düzeltildi; 45 renk/ölçü varyantının kaynak görseli bağlandı. Güncel tarama 13 ürün, kalite doğrulaması 0 hata/0 uyarı; canlıda 114 benzersiz görsel dosyası geçerli, 12 stoklu ürün API'si HTTP 200. Geri alma kayıtları `backend-laravel/storage/app/private/ops/evapera-copy-before-20261027.json` ve `evapera-variant-images-before-20261027.json`.
- [x] Pasif mağazaların public API'de görünmesi engellendi; Evapera açılışından sonra `store-details/evapera` HTTP 200, `store-list` içinde #81 ve `product-list?store_id=81` 12 stoklu ürün döndü.
- [ ] Tüm eski kaynaklar için kurtarma taraması çalışıyor; tamamlanma ve bir sonraki gerçek cron sonucu ayrıca doğrulanacak.
- [x] Masaüstü ve 390 px mobil tarayıcıda mağaza/ürün açıldı; görsel, logo, 12 ürün, varyant fiyat değişimi (5 kg sarı ₺249) ve misafir sepete ekleme (1 ürün, ₺249) doğrulandı. Mobil yatay taşma, görünen kırık görsel ve konsol hatası yok.
- [x] Platformun kargo ve iade politika sayfaları HTTP 200; global Geliver gönderici kimliği yapılandırılmış, Evapera'ya özel kimlik boş. Mağaza seller #3'e bağlı ve Store cüzdanı aktif.
- [ ] Gerçek ödeme/sipariş, tedarikçi kabulü ve Geliver gönderisi henüz yapılmadı; gerçek gönderici adresi sağlanırsa mağazaya özel Geliver kimliği bağlanacak. Şimdilik mevcut dropship mağazalarındaki global fallback kullanılıyor.
- [ ] Nilvera sandbox/PROD erişimi ve mali teyit kullanıcı tarafında henüz hazır değil; gerçek fatura geçişi bekliyor.
- [ ] Nilvera için ayrıca canlı kod/erişim kapısı var: Sportoonline sunucusunda e-fatura ince istemcisi ve observer bulunmadı, `efatura.guezelwebdesign.com` DNS çözülmedi. Hazır olduğu varsayılmadan servis ve dağıtım ayrıca doğrulanacak.
- [x] Mevcut Nilvera ince istemcisi güncel ana dala taşındı, varsayılan kapalı observer kaydı eklendi; 10 test/28 doğrulama geçti. Taslak PR: <https://github.com/Orhanguezel/quickecommerce/pull/31>. Canlıya alınmadı.
- [ ] Fiziksel mağaza adresi/açılış tarihi ile reklam bütçesi henüz kesinleşmedi.

## Kaynak ve mevcut durum

- Orhan'ın paylaştığı WhatsApp metni: Evapera mağazası eklenecek; `evapera.com.tr` ve “TRAIN ELEVATE REPEAT” bağlantısı verilmiş.
- `WhatsApp Audio 2026-10-27 at 19.28.15 (1).ogg`: yeni, yola yakın pasaj içindeki fiziksel mağazaya geçiş; reklam yatırımıyla sipariş artırma beklentisi; Cimri'de bazen ikinci sayfada görünme. Bazı marka/ürün sözcükleri kayıtta net değil.
- `WhatsApp Audio 2026-10-27 at 19.28.15.ogg`: Nilvera ile yeni görüşme ve entegrasyonu tamamlama; sonrasında kampanya/banner ve rutin kontroller dışında tekrar eden kod işleri kalmayan istikrarlı bir sistem hedefi.
- 27 Ekim 2026 canlı okumasında `stores` tablosunda Evapera adı/slug'ı ve `product_source_mappings` içinde Evapera kaynağı bulunmadı.
- `evapera.com.tr` kontrolü zaman aşımına uğradı. Kullanıcı yetkili kaynak olarak `.com` adresini doğruladı. Erişilen katalog `https://evapera.com/?post_type=product` üzerinde. WooCommerce Store API `https://evapera.com/?rest_route=/wc/store/v1/products&per_page=100&page=1` 13 ürün döndürdü: 12 stokta, 1 stok dışı, 10 varyasyonlu. Bu yalnızca gözlenen anlık katalogdur.
- `CLAUDE.md` gereği okunan 27 Ekim scraper sağlık çıktısında günlük çalışmada 1 başarılı/25 başarısız scraper, akşam `linktech` çalışmasında Python `requests` modülü eksikliği görüldü. Yeni kaynak eklemeden önce bu operasyonel engel ayrı ele alınmalı.

## P0 — Mevcut otomasyonu tekrar güvenilir hale getir

- [x] Günlük 25 scraper hatasının ortak nedeni bulundu: sanal ortam Python 3.13 için kurulmuşken çalıştırıcı 3.14'e işaret ediyordu; `requests`/`bs4` yüklenemiyordu. Python yolu düzeltildi, bağımlılık/versiyon ön kontrolü cron komutlarına eklendi (PR #30).
- [x] Hedefli Provitanya taraması ve fiyat/stok senkronu geçti: 1940 kaynak ürünü, 1848 eşleme, 0 hata. Evapera hedefli tarama/senkronu da 0 hata verdi.
- [ ] 27 Ekim tam kurtarma taraması ile sonraki gerçek 02:00 UTC cron sonucunu kontrol et. Ürün fiyatı/stoku bayatsa satışa açık olup olmadığını kaynak bazında doğrula.
- [ ] Heyday ve Neptün için güvenilir günlük kaynak taraması/senkronu kurulmadan eski stokları yeniden açma. Bu iki kaynak mevcut `run-all.sh`/aktif kaynak kayıt listesinde yok.
- [x] Mevcut günlük gözlemler doğrulandı: `monitor:commerce-health` 07:00 UTC, `scrapers:health-check` 09:00 UTC, `scrapers:enforce-freshness --hours=36 --apply` her saatin 20. dakikası. 27 Ekim okumasında temel sayfalar/DB/cache çalışıyor, başarısız kuyruk işi 0; bayat 15 kaynağın satışa açık stok adedi 0. Cimri ve Google XML feed'leri HTTP 200.
- [ ] Alarm sahibi ve ödeme/fatura sağlayıcı paneli kontrolü operasyon ekibince atanacak. Sonraki gerçek cron döngüsü ile feed kabul/sıralama sonucu ayrıca doğrulanacak.

**Kabul:** En az bir gerçek cron döngüsünde beklenen aktif kaynaklar başarılı; başarısız kaynaklar ve etkiledikleri mağazalar görünür; bayat veri satışa açılmıyor.

## P1 — Evapera mağazası

- [x] Kullanıcı satış anlaşmasını ve yetkili kaynak `evapera.com` alan adını doğruladı; ardından Evapera'yı diğer tedarikçi mağazalar gibi yönetme talimatı verdi.
- [x] 13 ürün, 56 varyant, kaynak ID/SKU, varyant fiyat/stok, görsel ve kategori eşleşmeleri incelendi; 13 ürün taslak içe aktarıldı.
- [x] WooCommerce Store API ve ürün sayfasındaki varyasyon JSON'u doğrulandı; varyant fiyat/stokunu koruyan Evapera tarayıcısı hazırlandı (PR #29).
- [x] Kalite doğrulaması 0 hata/0 uyarı, dry-run 0 hata/0 kopya, gerçek taslak içe aktarma 13/13 ve ilk stok senkronu 0 hata verdi.
- [x] Ürün metni denetimi: 13 açıklama kaynak HTML'siyle karşılaştırıldı, 7 üründe açık yazım/biçim kusuru düzeltildi ve tarayıcıya kalıcı düzeltme eklendi. 45 varyantın ayrı kaynak görseli canlıda bağlandı; içe aktarıcı yeni ürünlerde görseli kaynak URL'sine göre eşleştiriyor. 114 yerel görsel dosyası ve 12 stoklu ürün API'si doğrulandı.
- [x] Mevcut tedarikçi mağaza modeliyle mağaza #81 açıldı. %10 komisyon, 48 saat gönderim hedefi, global kargo/iade politikası ve Geliver fallback kullanılıyor; gerçek Evapera gönderici adresi uydurulmadı.
- [~] Mağaza ve örnek ürün masaüstü/mobilde açıldı; görsel, varyant fiyatı, stok ve misafir sepeti doğrulandı. Gerçek ödeme/sipariş ve Geliver gönderisi ile sonraki gerçek cron döngüsü henüz kabul edilmedi.

**Kabul:** Evapera kendi mağaza URL'sinde 12 stoklu ürünle görünür; varyant fiyatı ve görseller canlı tarayıcıda doğrulandı. Gerçek sipariş/Geliver gönderisi ve sonraki günlük fiyat/stok döngüsü ayrı kabul adımlarıdır.

## P2 — Nilvera e-Arşiv geçişi

- [ ] Mevcut `YAPILACAKLAR.md` e-fatura Faz 0 koşullarından devam et; yeni bir fatura sistemi tasarlama. Nilvera ile ikinci görüşmede sandbox ve PROD erişimi, sözleşme, mali mühür gereği ve entegrasyon testini netleştir.
- [ ] Mali müşavirle mükellefiyet, KDV, iptal/iade, fatura serisi ve firma bilgilerinin yazılı teyidini al. Anahtarları yalnız güvenli yapılandırmada tut.
- [ ] Önce sandbox'ta `paid` sipariş → kuyruk → Nilvera yanıtı → webhook → PDF/ETTN ve iptal/iade akışlarını uçtan uca doğrula; başarısızlık/tekrar deneme davranışını test et.
- [ ] PROD mock kapatma ve ilk gerçek fatura için ayrı geçiş penceresi, geri alma ve muhasebe onayı hazırla; tek gerçek faturayı Nilvera paneli ve uygulama kayıtlarıyla karşılaştır.

**Kabul:** Sandbox uçtan uca geçer; PROD'da yalnız doğrulanmış firma ve mali ayarlarla tek gerçek belge kesilir, PDF ve durum uygulamada görünür. Bugünkü kodun varlığı gerçek fatura teslimi sayılmaz.

## P3 — Fiziksel mağaza, reklam ve Cimri

- [ ] Yeni fiziksel mağazanın adresi, açılış tarihi, çalışma saatleri, teslim alma/sevkiyat rolü ve sitede gösterilecek bilgilerini doğrula; ilgili iletişim/mağaza sayfalarını ancak bu verilerle güncelle.
- [ ] Son 4 haftanın organik, reklam, Cimri ve doğrudan trafik/sipariş verisini kanal bazında çıkar. Ses kaydındaki “ikinci sayfa” gözlemini ürün bazında Cimri paneli/sıralama kanıtıyla eşleştir; feed erişimi, redler, fiyat ve stok tutarlılığını kontrol et.
- [x] Cimri XML (`/feeds/cimri.xml`) ve Google XML (`/feeds/google.xml`) canlı HTTP 200. Bu, Cimri hesabında kabul ve görünürlük sıralamasını kanıtlamaz.
- [ ] Reklam için hedef ürünler, bütçe üst sınırı, ölçüm ve başarı ölçütünü belirle; küçük bir test önerisi hazırla. Bütçe veya kampanyayı ayrıca onaylanmış ticari karara göre aç.

**Kabul:** Fiziksel mağaza bilgileri doğrulanmış; Cimri görünürlük sorununun ürün bazında nedeni ölçülmüş; reklam testi maliyet ve sipariş sonucuyla değerlendirilebilir.

## Önce netleşecek kararlar

1. Evapera'nın satış anlaşması ve yetkili kaynak alan adı `evapera.com` kullanıcı tarafından doğrulandı.
2. Kullanıcının “diğer mağazalar gibi” yönlendirmesiyle mevcut dropship/%10/48 saat ve global politika uygulandı. Evapera'ya özel Geliver gönderici adresi ve ilk gerçek gönderi ayrıca doğrulanacak.
3. Nilvera ikinci görüşmesinin sahibi ve sandbox/PROD erişim tarihi nedir?
4. Fiziksel mağaza bilgileri yayınlanacak mı; reklam testi için onaylı bütçe/ürün grubu nedir?
