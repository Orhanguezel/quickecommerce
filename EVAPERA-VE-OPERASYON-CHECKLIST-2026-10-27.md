# Evapera ve operasyon kontrol listesi — 27 Ekim 2026

## Uygulama durumu (27 Ekim, canlı)

- [x] Kullanıcı Evapera anlaşmasını ve yetkili kaynağın `evapera.com` olduğunu doğruladı.
- [x] Python sanal ortamı 3.13'e geri bağlandı; hedefli Provitanya tarama/senkronu hatasız geçti. PR: <https://github.com/Orhanguezel/quickecommerce/pull/30>.
- [x] Sağlık raporu, eski başarısızlığı aynı günkü başarılı tekrar denemeden sonra göstermeyecek şekilde düzeltildi (PR #30; canlıda doğrulandı).
- [x] Kayıtlı tarayıcısı olmayan Heyday #78 ve Neptün #79'un 880 saattir bayat kalan 23 eşlemesindeki 20 pozitif stok sıfırlandı; geri alma verisi canlı sunucuda `/tmp/legacy-source-stock-20261027.json` (600 izinli). İki public mağazada satılabilir ürün sayısı 0.
- [x] Evapera #81 pasif mağaza açıldı; 13 ürün `pending`, 56 varyant ve kaynak eşlemesi hazır. Görseller yerel Media kaydına alındı; kalite kapısı 0 hata/0 uyarı ve ilk fiyat/stok senkronu 0 hata. PR: <https://github.com/Orhanguezel/quickecommerce/pull/29>.
- [x] Kaynaktaki Evapera logosu yerel Media kaydına alındı; public dosya HTTP 200 ve kaynakla aynı içerik. Mağaza meta başlığı/açıklaması hazırlandı; mağaza hâlâ pasif.
- [x] Pasif mağazanın doğrudan public API'de görünmesi düzeltildi; `store-details/evapera` artık 404, `product-list?store_id=81` 0 ürün.
- [ ] Tüm eski kaynaklar için kurtarma taraması çalışıyor; tamamlanma ve bir sonraki gerçek cron sonucu ayrıca doğrulanacak.
- [ ] Evapera komisyonu, kargo ve iade sorumluluğu açıklanınca mağaza ve ürünler onaylanıp yayınlanacak; ardından gerçek müşteri akışı ve Geliver gönderici adresi doğrulanacak.
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

- [x] Kullanıcı satış anlaşmasını ve yetkili kaynak `evapera.com` alan adını doğruladı. Komisyon, sevkiyat ve iade sorumluluğu bekliyor.
- [x] 13 ürün, 56 varyant, kaynak ID/SKU, varyant fiyat/stok, görsel ve kategori eşleşmeleri incelendi; 13 ürün taslak içe aktarıldı.
- [x] WooCommerce Store API ve ürün sayfasındaki varyasyon JSON'u doğrulandı; varyant fiyat/stokunu koruyan Evapera tarayıcısı hazırlandı (PR #29).
- [x] Kalite doğrulaması 0 hata/0 uyarı, dry-run 0 hata/0 kopya, gerçek taslak içe aktarma 13/13 ve ilk stok senkronu 0 hata verdi.
- [~] Pasif mağaza #81, kaynak kaydı, yerel görseller, logo ve meta bilgileri hazır. Kapak/adres/Geliver gönderici adresi ile komisyon ve kargo/iade kuralları ticari teyitten sonra tamamlanacak.
- [ ] Ürün içe aktarma sonrası mağaza ve örnek ürün sayfalarını masaüstü/mobilde aç; görsel, varyant seçimi, fiyat, stok, sepete ekleme ve sipariş akışını doğrula. Günlük fiyat/stok yenilemesini cron ve sağlık raporuna kat; ilk gerçek döngüde kaynak/site karşılaştırması yap.

**Kabul:** Evapera kendi mağaza URL'sinde görünür; yalnız doğrulanmış stoklu ürünler satılır; varyant fiyat/stok ve görseller kaynakla eşleşir; yeni ürün ve sonraki fiyat/stok değişimi izlenebilir. Canlı mağaza açma ve ticari ayarlar bu planın uygulama aşamasıdır.

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
2. Evapera için komisyon, fiyat kuralı, kargo/gönderici ve iade sorumluluğu nedir?
3. Nilvera ikinci görüşmesinin sahibi ve sandbox/PROD erişim tarihi nedir?
4. Fiziksel mağaza bilgileri yayınlanacak mı; reklam testi için onaylı bütçe/ürün grubu nedir?
