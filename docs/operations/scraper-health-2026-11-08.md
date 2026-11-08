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
- Yonex: tam katalog kurtarma sonucu aşağıda tamamlanacak.
- Testler: 5 ayrıştırıcı testi + 3 gerçek shell fonksiyonunu izole stub ortamında çalıştıran sonuç testi geçti. PHP syntax, bash syntax ve diff whitespace kontrolleri geçti.

## Alarm yönetimi

Sipariş stok teyidi ve manuel iade alarmları bu işlemde kapatılmaz. Eski scraper raporları yalnız yeni sağlık kontrolüyle uzlaştırılarak, tekrar kayıtlar güncel açık olay referansıyla arşivlenir. Çözülmemiş tedarikçi erişimi açık kalır. İşlem sırasında dış bildirim göndermeyen `--no-alert` kullanılır.

## Yayın ve geri alma

- İzole kaynak dizini: `/var/www/scraper-health-release-20261108/`.
- Önceki scriptler, değişen backend dosyaları, kaynak JSON'ları ve etkilenen DB satırlarının yedekleri `backups/` altında.
- Repo içindeki iki değişen script staged dosyalara symlink ile bağlandı; aktif backend release'e üç PHP dosyası hedefli aktarıldı, PHP-FPM reload edildi.
- Geri alma: script symlinklerini yedek dosyalara yönlendir; üç PHP dosyasını yedeklerden geri koy ve PHP-FPM reload et. Eski stok verisini körlemesine geri yükleme; tedarikçi güncelliği tekrar doğrulanmalı.
- Migration, seed veya müşteri bildirimi gerektirmez.
