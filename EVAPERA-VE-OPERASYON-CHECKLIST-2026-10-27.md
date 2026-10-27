# Evapera ve operasyon kontrol listesi — 27 Ekim 2026

## Uygulama durumu (27 Ekim, canlı)

- [x] Kullanıcı Evapera anlaşmasını ve yetkili kaynağın `evapera.com` olduğunu doğruladı.
- [x] Python sanal ortamı 3.13'e geri bağlandı; hedefli Provitanya tarama/senkronu hatasız geçti. PR: <https://github.com/Orhanguezel/quickecommerce/pull/30>.
- [x] Evapera #81 pasif mağaza açıldı; 13 ürün `pending`, 56 varyant ve kaynak eşlemesi hazır. Görseller yerel Media kaydına alındı; kalite kapısı 0 hata/0 uyarı ve ilk fiyat/stok senkronu 0 hata. PR: <https://github.com/Orhanguezel/quickecommerce/pull/29>.
- [x] Pasif mağazanın doğrudan public API'de görünmesi düzeltildi; `store-details/evapera` artık 404, `product-list?store_id=81` 0 ürün.
- [ ] Tüm eski kaynaklar için kurtarma taraması çalışıyor; tamamlanma ve bir sonraki gerçek cron sonucu ayrıca doğrulanacak.
- [ ] Evapera komisyonu, kargo ve iade sorumluluğu açıklanınca mağaza ve ürünler onaylanıp yayınlanacak; ardından gerçek müşteri akışı ve Geliver gönderici adresi doğrulanacak.
- [ ] Nilvera sandbox/PROD erişimi ve mali teyit kullanıcı tarafında henüz hazır değil; gerçek fatura geçişi bekliyor.
- [ ] Nilvera için ayrıca canlı kod/erişim kapısı var: Sportoonline sunucusunda e-fatura ince istemcisi ve observer bulunmadı, `efatura.guezelwebdesign.com` DNS çözülmedi. Hazır olduğu varsayılmadan servis ve dağıtım ayrıca doğrulanacak.
- [ ] Fiziksel mağaza adresi/açılış tarihi ile reklam bütçesi henüz kesinleşmedi.

## Kaynak ve mevcut durum

- Orhan'ın paylaştığı WhatsApp metni: Evapera mağazası eklenecek; `evapera.com.tr` ve “TRAIN ELEVATE REPEAT” bağlantısı verilmiş.
- `WhatsApp Audio 2026-10-27 at 19.28.15 (1).ogg`: yeni, yola yakın pasaj içindeki fiziksel mağazaya geçiş; reklam yatırımıyla sipariş artırma beklentisi; Cimri'de bazen ikinci sayfada görünme. Bazı marka/ürün sözcükleri kayıtta net değil.
- `WhatsApp Audio 2026-10-27 at 19.28.15.ogg`: Nilvera ile yeni görüşme ve entegrasyonu tamamlama; sonrasında kampanya/banner ve rutin kontroller dışında tekrar eden kod işleri kalmayan istikrarlı bir sistem hedefi.
- 27 Ekim 2026 canlı okumasında `stores` tablosunda Evapera adı/slug'ı ve `product_source_mappings` içinde Evapera kaynağı bulunmadı.
- `evapera.com.tr` kontrolü zaman aşımına uğradı. Kullanıcı yetkili kaynak olarak `.com` adresini doğruladı. Erişilen katalog `https://evapera.com/?post_type=product` üzerinde. WooCommerce Store API `https://evapera.com/?rest_route=/wc/store/v1/products&per_page=100&page=1` 13 ürün döndürdü: 12 stokta, 1 stok dışı, 10 varyasyonlu. Bu yalnızca gözlenen anlık katalogdur.
- `CLAUDE.md` gereği okunan 27 Ekim scraper sağlık çıktısında günlük çalışmada 1 başarılı/25 başarısız scraper, akşam `linktech` çalışmasında Python `requests` modülü eksikliği görüldü. Yeni kaynak eklemeden önce bu operasyonel engel ayrı ele alınmalı.

## P0 — Mevcut otomasyonu tekrar güvenilir hale getir

- [ ] Günlük 25 scraper hatasını kaynak ve hata nedenine göre ayır; özellikle Python ortamında `requests` bulunmamasının kapsamını belirle. Çalışan sanal ortam/bağımlılık yolu ve cron komutunu karşılaştır.
- [ ] Düzeltme sonrası hedefli scraper çalıştırması, JSON tazeliği, fiyat/stok senkronu ve sonraki gerçek cron sonucunu kontrol et. Ürün fiyatı/stoku güncel değilse vitrine alma kuralının çalıştığını doğrula.
- [ ] Scraper, kuyruk, ödeme, stok, feed ve fatura için günlük sağlık görünümü ve alarm sahipliği tanımla. Hata için geri alma/manuel işlem adımlarını yaz.

**Kabul:** En az bir gerçek cron döngüsünde beklenen aktif kaynaklar başarılı; başarısız kaynaklar ve etkiledikleri mağazalar görünür; bayat veri satışa açılmıyor.

## P1 — Evapera mağazası

- [ ] Yetkili Evapera alan adını ve katalog kaynağını teyit et: paylaşılan `.com.tr` ile çalışan `.com` arasındaki farkı çöz. Satıcı, satış/tedarik ilişkisi, fiyatlandırma ve sevkiyat sorumluluğunu yazılı netleştir.
- [ ] 13 ürünlük kaynak örneğini incele: ürün kimliği/SKU, varyant rengi-ölçüsü, varyant bazlı fiyat-stok, açıklama, görsel URL ve kategori eşleşmesi. Stok dışı ürün vitrine çıkmamalı.
- [ ] WooCommerce Store API için mevcut `scrapers/woocommerce_scraper.py` çekirdeğiyle küçük bir yerel çıktı üret; permalink kapalı olduğu için `?rest_route=/wc/store/v1/products` yolunu ve varsa varyant uçlarını doğrula.
- [ ] JSON'u `scrapers:validate-products` ve `import:products --dry-run --source-name=evapera` ile kontrol et; sıfır fiyat, belirsiz stok, eksik görsel ve yinelenen ürünleri ayıkla. Kaynak URL/ID ve SKU eşlemesini koru.
- [ ] Mağaza adı, logo, kapak, açıklama, komisyon, adres, kargo/iade kuralları ve Geliver gönderici adresini hazırla. Ayrı mağaza kaydı ve `ScraperSourceRegistry` kaydı oluştur; ürünleri ancak ticari ve veri kontrolleri tamamlanınca yayınla.
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
- [ ] Reklam için hedef ürünler, bütçe üst sınırı, ölçüm ve başarı ölçütünü belirle; küçük bir test önerisi hazırla. Bütçe veya kampanyayı ayrıca onaylanmış ticari karara göre aç.

**Kabul:** Fiziksel mağaza bilgileri doğrulanmış; Cimri görünürlük sorununun ürün bazında nedeni ölçülmüş; reklam testi maliyet ve sipariş sonucuyla değerlendirilebilir.

## Önce netleşecek kararlar

1. Evapera'nın yetkili katalog/satış alan adı `.com` mu, `.com.tr` mi? Ürünleri Sportoonline'da satma ve sevkiyat anlaşması hazır mı?
2. Evapera için komisyon, fiyat kuralı, kargo/gönderici ve iade sorumluluğu nedir?
3. Nilvera ikinci görüşmesinin sahibi ve sandbox/PROD erişim tarihi nedir?
4. Fiziksel mağaza bilgileri yayınlanacak mı; reklam testi için onaylı bütçe/ürün grubu nedir?
