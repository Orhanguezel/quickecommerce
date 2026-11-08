# Scraper sağlık incelemesi — 8 Kasım 2026

## Başlangıç

Canlı panel: https://panel.sportoonline.com/tr/admin/scrapers

- Kayıtlı 36 kaynak: 25 sağlıklı, 1 kritik, 10 pasif. 152 açık alarm.
- Günlük taramada Animal Türkiye ve Raketspor/Yonex başarısız.
- Heyday ve Neptün aktif mağazalara bağlı olmasına rağmen registry ve günlük zincirde eksikti. Son verileri 21 Eylül tarihliydi.
- Animal Türkiye günlük zincirde çalışıyor, registry'de eski Temmuz notuyla pasif görünüyordu. Son başarılı çalışma 30 Ekim; 14 varyant eski stokla satıştaydı.

## Düzeltmeler

- Ticimax `ProductGroup` JSON-LD desteği. Grup kimliği `productDetailModel.productId` ile aynı olmalı. Fiyat ve stok yalnız doğrulanmış Ticimax varyant modelinden okunur; ana/parent kayıt satılabilir varyant sayılmaz.
- Heyday ve Neptün registry ve günlük cron zincirine eklendi.
- Animal Türkiye registry durumu gerçek günlük çalışma düzeniyle eşlendi; 403 engeli görünür ve güncellik karantinasına tabi.
- Cron ve manuel çalıştırmada senkronizasyon hatası artık başarılı çalışma olarak kaydedilmez.
- Günlük logdan sonra tamamlanan doğrulanmış kurtarma çalışması, eski cron hatasını sağlık raporunda geçersiz kılar.

## Canlı doğrulamalar

- Heyday: 2 ürün, 4 eşleşme; doğrulama 0 hata/0 uyarı; sync 4 güncelleme, 0 hata, 0 fiyat sınırı.
- Neptün: 20 ürün; doğrulama 0 hata/0 uyarı; 1 yeni varyant eşleşmesi, toplam 19 eşleşme; 17 güncelleme, 2 stoksuz, 0 hata, 0 fiyat sınırı.
- Animal Türkiye: ana alan adı, www, alternatif Vitafy ve Woo endpoint'i HTTP 403. VPS üzerindeki yerel tarayıcı servisi de engelli. 14 eski stoklu varyant mevcut 36 saat güncellik kuralıyla sıfırlandı. Günlük yeniden deneme açık. Tedarikçinin sunucu erişim engelini kaldırması gerekiyor.
- Yonex: 64/64 ürün çekildi. Doğrulama 0 hata; kaynakta kısa açıklaması olan 5 üründe içerik uyarısı var (fiyat/stok hatası değil). 291 eşleşme kontrol edildi: 67 güncelleme, 32 stoksuz kayıt, kaynakta artık bulunmayan 192 eski eşleşme stok 0 olarak korundu. Sync 0 hata, 0 fiyat sınırı. Başarılı çalışma #5499, eski 6 kaynak alarmı otomatik kapandı.
- Testler: 5 ayrıştırıcı testi + 3 gerçek shell fonksiyonunu izole stub ortamında çalıştıran sonuç testi geçti. PHP syntax, bash syntax ve diff whitespace kontrolleri geçti.

## Son canlı durum (18:56 UTC)

- 38 kaynak: **28 sağlıklı, 0 uyarı, 1 kritik, 9 bilinçli pasif**.
- Kritik tek kaynak Animal Türkiye; sağlık komutundaki 3 bulgu aynı erişim olayının eski JSON, başarısız çalışma ve eski sync belirtileri.
- Açık alarmlar **152 → 8**: 6 Yonex alarmı otomatik; 138 eski rapor/tekrar/iyileşmiş karantina kaydı gerekçesiyle kapandı. Kayıtlar silinmedi, önce yedeklendi.
- Kalan 8: Animal Türkiye erişim olayı #520, 4 manuel iade ve 3 sipariş stok teyidi. Siparişlerin finansal/teslimat durumunu doğrulamadan kapatılmadı.
- Yönetici tarayıcısında Heyday, Neptün, Yonex sağlıklı; Yonex 67 stoklu varyant; Animal Türkiye 0 stoklu varyant; alarm sayısı 8 olarak görüldü. Sayfa ve overview/sources/alerts API’leri HTTP 200.
- PR: https://github.com/Orhanguezel/quickecommerce/pull/36

## Alarm yönetimi

Sipariş stok teyidi ve manuel iade alarmları bu işlemde kapatılmaz. Eski scraper raporları yalnız yeni sağlık kontrolüyle uzlaştırılarak, tekrar kayıtlar güncel açık olay referansıyla arşivlenir. Çözülmemiş tedarikçi erişimi açık kalır. İşlem sırasında dış bildirim göndermeyen `--no-alert` kullanılır.

## Yayın ve geri alma

- İzole kaynak dizini: `/var/www/scraper-health-release-20261108/`.
- Önceki scriptler, değişen backend dosyaları, kaynak JSON'ları ve etkilenen DB satırlarının yedekleri `backups/` altında.
- Repo içindeki iki değişen script staged dosyalara symlink ile bağlandı; aktif backend release'e üç PHP dosyası hedefli aktarıldı, PHP-FPM reload edildi.
- Geri alma: script symlinklerini yedek dosyalara yönlendir; üç PHP dosyasını yedeklerden geri koy ve PHP-FPM reload et. Eski stok verisini körlemesine geri yükleme; tedarikçi güncelliği tekrar doğrulanmalı.
- Migration, seed veya müşteri bildirimi gerektirmez.

## Animal Türkiye — yerel motor entegrasyonu

Kullanıcı geri bildirimi üzerine günlük scriptin doğrudan HTTP kullandığı doğrulandı. `animalturkiye_scraper.py` artık HTTP hatasında yalnız VPS içindeki `http://127.0.0.1:8200` motoruna döner: `stealthy`, `solve_cloudflare=true`, 120 saniye, önbellek atlama. API'nin HTTP 200 yanıtı kaynak erişimi sayılmaz; kaynak `status_code=200` ve gerçek içerik şarttır. En fazla 2 paralel ürün; eksik keşif veya tek ürün hatasında çıktı yayınlanmaz; sınırlı tarama ayrı `--output` ister.

Canlı motor denemeleri (önbelleksiz):

| Mod | Kaynak sonucu |
| --- | --- |
| Stealth + Cloudflare çözme | 403, blok sayfası |
| Fast | 403, blok sayfası |
| Dynamic Chromium | 403, blok sayfası |
| Görünür Stealth Chromium / Xvfb | 403, `No Cloudflare challenge found` |

Motor sürümü Scrapling 0.4.8. Hazır bir proxy yapılandırması yok. Görünür tarayıcı denemesi aynı yerel motor container'ında geçici Xvfb ile yapıldı; servis genel ayarları değiştirilmedi. Mevcut sunucu çıkışıyla engel aşılamadı. Sağlıklı/stokta duruma geçiş yapılmadı. Yetkilendirilmiş farklı ağ çıkışı veya tedarikçi tarafında erişim izni gerekiyor.

4 yeni regresyon testi (403 → yerel motor, motorun 200 yanıtı içinde kaynak 403'ünü reddetme, eksik keşif, eksik ürün taramasında eski çıktıyı koruma) ile toplam **12 test geçti**. Canlı giriş noktasında yerel motor çağrısı loglandı; eski katalog SHA-256 kontrolüyle değişmeden kaldı. Geri alma için `backups/animalturkiye_scraper.py` korundu.
