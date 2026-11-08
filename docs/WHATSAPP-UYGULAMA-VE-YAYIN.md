# WhatsApp uygulaması ve yayın durumu — 2026-11-08

## Durum

Kullanıcı bilgisi: **Sportoonline için yeni numara henüz alınmadı.** Kod varsayılan olarak gönderime kapalıdır. OSGB hesabı, numarası, tokenı veya aboneliği değiştirilmedi. Müşteriye gerçek mesaj gönderilmedi. Bu belge yerel testleri, canlı yazılım yayınını ve bekleyen Meta teslim kabulünü ayrı kaydeder. Güncel yayın kanıtı en alttaki 2026-11-08 bölümündedir.

- Uygulama PR: https://github.com/Orhanguezel/quickecommerce/pull/34 (taslak; canlı kabul açık).
- Uygulama dalı: `codex/whatsapp-implementation`; taban `20a51f80`.
- Araştırma PR'ı: https://github.com/Orhanguezel/quickecommerce/pull/33
- Yönetici ekranı: `/tr/admin/system-management/whatsapp`.
- API: `/api/v1/admin/whatsapp`, müşteri tercihi `/api/v1/customer/profile/whatsapp-preferences`, webhook `/api/v1/webhooks/whatsapp`.
- Bağlantı, ayarlar ve tercih güncellemesi POST kullanır; araştırma belgesindeki önerilen `/integrations` ve PATCH adları uygulanmış sözleşme değildir. Gerçek rotalar `routes/whatsapp-api.php` dosyasındadır.

## Uygulananlar

1. Ayrı WABA ve numara aidiyeti kontrolü, şifreli sırlar, bağlantı sürümü, sağlık kontrolü, ayrı abonelik işlemi. OSGB callback'i numaraya göre ayırmadığından ilk sürüm yalnız tek Sportoonline numarası içeren WABA kabul eder.
2. Sekiz tablo: bağlantı, şablon, müşteri izni, izin geçmişi, numara engeli, mesaj, deneme, webhook. Benzersiz olay anahtarı ve mesaj ID'si; mesaj/ham webhook içerikleri şifreli. Telefonlar sorgulama için DB'de açık, API listelerinde maskelidir.
3. Checkout sipariş izni ve Hesabım tercihi. Teslimat adresinin alıcı telefonu kullanılmaz. Eski istemcinin alan göndermemesi sipariş düzeyinde kapalı tercih oluşturur. Misafir hesabına kalıcı hesap izni verilmez. Telefon sahipliği için yeni SMS doğrulaması eklenmedi: kullanıcı açıkça kendi WhatsApp numarasını belirtir.
4. Altı Türkçe utility şablon sözleşmesi; onay/kategori/dil/parametre/snapshot hash denetimi, sayfalama ve zamanlı senkron. Başvuru taslakları `docs/whatsapp/templates.tr.json`; henüz Meta'ya gönderilmedi.
5. Transaction içi outbox, commit sonrası database/whatsapp kuyruğu, atomik claim, 60 saniye lease, 45 saniye worker timeout ve 15 saniye HTTP timeout. Zaman aşımı/süreç kaybı `unknown` olur; kör tekrar yapılmaz. Erken callback ve opaque correlation ile doğrulanmış sonuç eşlenebilir.
6. Global anahtar, olay anahtarları, pilot allowlist, şablon/izin/olay güncelliği kontrolü, hesap başına 60 deneme/dakika ve numara başına 6 saniye yerel sınır. Kesin geçici ret dışında yeniden deneme yok.
7. Ham HMAC, WABA ve numara kontrolü, kalıcı/dedup webhook, sırasız teslim durumu, DUR/STOP iptali. Desteklenmeyen kimlik ham şifreli olayda karantinada kalır; telefon uydurulmaz. İptal ACK öncesi işlenir.
8. iyzico callback ve reconciliation, PayTR, cüzdan ve sağlayıcıda paid olan Stripe session; kapıda ödeme; Geliver gerçek sevk/teslim ve müşteri/admin/seller iptali. iyzico doğrulanmış iade tutarı kullanılır. Çok mağazalı ödemede tek ödeme olayı, sevkte gerçek shipment kimliği kullanılır.
9. Bağlantı, şablonlar, pilot önizleme/açık gönderim, maskeli geçmiş, sınırlı yeniden deneme, konuşma, 24 saat metin/dosya yanıtı, kullanıcı tarafından başlatılan okundu bilgisi ve günde bir mesai dışı yanıt.
10. `whatsapp.manage`, `whatsapp.inbox`, `whatsapp.send` izinleri ve system_level kontrolü. `whatsapp:grant USER_ID` yalnız seçilen mevcut yöneticiyi yetkilendirir; seeder kullanmaz. Mevcut salt okunur yönetici middleware'i korunur.
11. JPEG/PNG/PDF, en fazla 5 MB; dosya herkese açık uploads alanına yazılmaz. Gelen dosya yalnız yetkili endpoint üzerinden, host/boyut/hash doğrulanarak indirilir. Sağlayıcıda medya süresi dolmuşsa indirme başarısız olabilir. Varsayılan 90 gün sonra içerik temizlenir; olay anahtarı/teslim audit'i yeniden gönderimi önlemek için korunur.

## Bilinçli gönderim sınırları

- Manuel “ödendi/iade edildi” alan değişimi sağlayıcı kanıtı değildir. Mevcut manuel refund repository yalnız DB durumunu değiştirir; bu yoldan banka iadesi yapıldı mesajı üretilmez. Manuel sağlayıcı teyidi için mevcut ödeme entegrasyonunda doğrulanmış referans/tutar gerekir.
- Paket kaydı olmadan admin'in yalnız “shipped/delivered” işaretlemesi otomatik kargo mesajı üretmez. Barkod oluşturulması da sevk değildir.
- Etkinleştirmeden önce oluşturulmuş siparişler gönderim kapısında `historical_order` ile bastırılır. Tarihî ödeme replay komutu yoktur.
- Serbest metin 24 saat dışında gönderilmez. Mevcut şablonlar sipariş olaylarına bağlıdır; genel pazarlama gönderimi yoktur.
- Meta'nın güncel teknik doküman erişimi araştırmada 429 döndü. Config'teki v23.0 OSGB referansıyla sabitlenmiştir; yeni hesabın canlı Graph sözleşmesi ve izinleri pilot öncesi doğrulanmalıdır.

## Doğrulama

- `tests/Feature/WhatsappTest.php`: 29 test, 81 assertion geçti (sahte HTTP, SQLite).
- İzole **MySQL 8.0.46**: sekiz tablo migration'ı uygulandı; iki ayrı PHP worker aynı mesajı eşzamanlı işledi: bir Meta fake çağrısı, bir attempt, accepted durumu. Harness: `tests/Support/whatsapp-concurrency.php`; test socket'i `/tmp/whatsapp-mysql-data/mysql.sock`, DB `whatsapp_test`.
- Admin ve müşteri `bun run build` geçti. Bunlar test ortamı build’leridir; canlı paket doğru üretim ortam değişkenleriyle yeniden derlenmelidir. Admin lint mevcut warning'lerle geçti. Müşteri genel lint **82 hata, 29 warning** ile geçmedi; yeni WhatsApp bileşeni hedefli lint'ten geçti. Genel lint başarı olarak işaretlenmedi.
- Playwright yerel API fixture'larıyla bağlantısız/bağlı ekranları açtı. 390px ölçüm: viewport=390, scrollWidth=390; masaüstü 1440px. Ortak navbar mobil boşlukları daraltıldı. Son konsol kontrolü sıfır error. Bu test gerçek canlı oturum/Meta kabulü değildir.
- Genel PHPUnit ayrıca çalıştırıldı: mevcut iyzico marketplace testlerinin eski constructor çağrısından 4 hata ve örnek HTTP testinde test APP_KEY eksikliğinden 1 hata. Bu genel sonuç geçmedi; WhatsApp testleri ayrı başarılıdır.
- Canlı entegrasyon patch’i salt okunur indirilen 19 dosyanın kopyasında `git apply --check` kontrolünden geçti; birleştirilmiş PHP dosyaları syntax kontrolünden geçti.
- İlk yerel doğrulama sırasında gerçek ödeme/mesaj, canlı migration ve worker aktivasyonu yapılmadı. Sonraki canlı yayın aşağıda kayıtlıdır.

## Canlı kaynakları koruma

Canlı HEAD `33d17a14`, yerel taban `20a51f80`, origin/main `ce31b675` farklıdır. Feature dalındaki tüm eski dosyaları doğrudan sunucuya kopyalamayın. Canlıda bulunan `CouponCombinationPolicy`, `PaidOrderCancellationService` ve GA4 purchase/refund çağrıları korunmalıdır.

`docs/whatsapp/live-source-map.json` dosya hashlerini kaydeder. `docs/whatsapp/live-integration.patch` yalnız mevcut canlı dosyalara WhatsApp değişikliklerini uygular. Birleşimde kupon sepet fingerprint'i ve WhatsApp state'i birlikte korundu. Yayın anında kaynak değişmişse patch kontrolü başarısız olur; yeni canlı sürümle tekrar birleştirilir. Yeni WhatsApp dosyaları feature PR'ından alınır. Bu paket sonraki canlı yayın sırasında kaynak hashleri yeniden doğrulanarak uygulandı.

## Yayın sırası

Kullanıcının 2026-11-08 tarihli “canlıya al” talimatıyla yalnız WhatsApp migration’ı uygulandı. Genel veya sınıflı db:seed çalıştırılmadı.

1. Yeni numara, yalnız Sportoonline numarasını içeren WABA, Meta App ve gerekli sistem kullanıcısı izinlerini hazırlayın. Token/App Secret sohbet yerine yönetici formundan girilir. Numara CONNECTED/CLOUD_API ve hesap AVAILABLE olmalıdır.
2. DB ve mevcut uygulama sürümünün erişimi kısıtlı yedeğini alın. APP_KEY'i ayrı güvenli yedekte tutun; anahtarı loga veya PR'a yazmayın.
3. Canlı hash manifestini karşılaştırın. Mevcut dosyalara `git apply --check` ile entegrasyon patch'ini kontrol edin; yeni dosyaları ve build'leri staging dizininde hazırlayın. Canlı ödemelere eski checkout/kupon dosyası yazmayın.
4. Kullanıcı yayın yetkisiyle yalnız `2026_11_08_170000_create_whatsapp_tables.php` migration'ını uygun bakım/yayın anında çalıştırın. Rollback tablolardaki audit'i siler; normal rollback için down çalıştırılmaz.
5. Doğru HTTPS callback ile kodu yayınlayın. Panelden aktivasyon isteniyorsa `WHATSAPP_ENABLED=true`, hesap düzeyinde gönderim kapalı olsun. Müşteri tercihi hesap genel kullanıma açılana kadar kapalıdır. Route/403/şifreli ayar yazma denetimi ve kuyruk tablosunu kontrol edin. Belirlenmiş yöneticiyi `whatsapp:grant USER_ID` ile yetkilendirin.
6. Supervisor örneğini kurun; kullanıcı/path doğrulanmadan başlatmayın. database queue retry_after=90 > timeout45; schedule mevcut dakikalık scheduler'ı kullanır. `whatsapp:dispatch` her dakika, `whatsapp:refresh` 10 dakikada, içerik temizliği günlük çalışır.
7. Hesabı panelden bağlayın, ayrı işlemle webhook aboneliği yapın. Gerçek challenge ve imzalı callback, OSGB aboneliğinin değişmediği, şablonların APPROVED/UTILITY/tr olduğu doğrulansın.
8. Belirlenmiş pilot numaraları girin. `WHATSAPP_ENABLED=true`, config yenileme ve yalnız WhatsApp worker başlatma sonrası panelde pilotu etkinleştirin. Açık pilot alıcı izni olmadan test gönderimi yapmayın.
9. Ödeme/sevk/teslim/iade senaryoları için Meta mesaj ID + delivered webhook + alıcı gözlemi + admin kaydı doğrulayın. API 200/accepted tek başına teslim değildir. İlk 24 saat ve 7 gün hata/unknown/kuyruk gecikmesini gözleyin; sonra seçilmiş olaylarla yaygınlaştırın.

## Durdurma, kurtarma, anahtar döndürme

- Acil durdurma: kanal anahtarını kapatın veya `WHATSAPP_ENABLED=false` + config yenileme yapın; WhatsApp worker grubunu durdurun. Webhook ve `whatsapp:dispatch` kaydı işleyebilir; gönderim gate kapalıdır. Genel `queue:retry all`/`queue:clear` kullanılmaz.
- `unknown` otomatik replay edilmez. Callback veya sağlayıcı kanıtı beklenir; provider mesaj ID'si olmayan şüpheli işlem elle yeni mesaj olarak kopyalanmaz.
- Uygulama rollback'inde DB tablolarını koruyun; outbox ve webhook audit'i silmeyin. Etkin gönderimi kapatın, sürüm dosyalarını yedekten geri alın.
- APP_KEY rotasyonunda önce tüm şifreli verinin ve eski anahtarın güvenli yedeği alınır. Laravel `APP_PREVIOUS_KEYS` eski anahtarı geçişte çözebilmek için yapılandırılır; yeni anahtarla okuma/yazma testi yapılır. Tüm bağlantı/message/webhook kayıtları kontrollü batch ile yeniden şifrelenmeden önceki anahtar kaldırılmaz. Anahtar kaybı içerik ve token kaybıdır; tekrar bağlantı eski kayıtları çözmez.
- `whatsapp:prune` dry-run; `whatsapp:prune --apply` yalnız süresi dolmuş içerikleri temizler. Audit/consent saklama ve müşteri silme taleplerindeki anonimleştirme politikası işletme tarafından kesinleştirilmelidir.

## Kalan canlı kabul

Yeni numara/WABA/App, Meta şablon onayı, pilot alıcı ve destek sorumlusu; gerçek Meta webhook ve alıcı teslim kabulü; güncel provider sözleşmesi. Bu adımlar bitmeden checklist'in tamamı veya canlı entegrasyon tamamlandı denmez.


## 2026-11-08 canlı yayın ilerlemesi

- Kullanıcı ayrıca aktivasyonun panel üzerinden tamamlanmasını istedi. Yönetim ekranına kurulum adımları eklendi; bağlantısız hesapta mesaj listesi sorgulanmaz.
- Yayın dizini: `/var/www/whatsapp-release-20261108`; mevcut canlı kaynaklardan oluşturuldu, 19 kaynak hash'i kontrol edilip entegrasyon patch'i uygulandı. Git çalışma dosyaları yerinde düzenlenmedi; backend yeni release dizinine yönlendirildi.
- Güvenli yedek: `/var/backups/whatsapp-20261108` (DB dump 257015666 byte ve ayrı `.env`). Eski backend `/var/www/quikecommerce/backend-laravel.pre-whatsapp-20261108`, storage korunuyor.
- Sekiz tablo migration'ı tamamlandı. Mevcut Orhan yöneticisine (ID 4) üç WhatsApp izni verildi.
- Panelden aktivasyon için sunucu altyapı anahtarı açık; bağlantı henüz yok ve gönderim kapalı. Yeni bağlantılar da disabled/pilot olarak oluşturulur. Müşteri tercihi yalnız bağlı, etkin, pilot dışı, sağlıklı hesapta açılır. Etkinleştirme en az bir olay ve o olayların onaylı şablonlarını zorunlu tutar.
- Canlı API: yetkili status 200/configured=false, yetkisiz status 401, imzasız webhook 403, boş connect 422. Gerçek Meta çağrısı/mesajı yapılmadı.
- Sunucuda Supervisor yok; mevcut PM2 altyapısıyla `sportoonline-whatsapp` iki worker olarak kuruldu. `ops/whatsapp/pm2.config.cjs` gerçek yapılandırmadır. Dakikalık dispatch, 10 dakikalık refresh ve günlük prune mevcut scheduler'da doğrulandı.
- Rollback: gönderimi durdurun; yalnız WhatsApp worker grubunu durdurun. Backend symlink'i kaldırıp `backend-laravel.pre-whatsapp-20261108` dizinini eski adına taşıyın; PHP-FPM'i reload ve mevcut genel worker'ı restart edin. WhatsApp tablolarını/audit verisini silmeyin.


### Tamamlanan canlı panel kabulü

- Panel: https://panel.sportoonline.com/tr/admin/system-management/whatsapp — Sistem Araçları → WhatsApp Business. Orhan hesabının gerçek API yetkisiyle geçici, süreli oturum kullanılarak doğrulandı; kabul sonrası geçici token iptal edildi.
- Üretim admin build'i (Next 15.5.19) ve müşteri build'i (Next 16.1.6) mevcut canlı `.env` değerleriyle geçti. Admin 3100 canary 200 sonrası deploy dizini değiştirildi; önceki paket `admin-panel/deploy.pre-whatsapp-20261108`. Müşteri önceki paketi `customer-web-nextjs/.next.pre-whatsapp-20261108`. Açık oturumların eski static chunk'ları korundu.
- Menü bağlantısına tıklama → kurulum başlığı, hesap formu, “Kapalı — kurulum bekleniyor” doğrulandı. Boş form tarayıcıda engelleniyor; API ayrıca 422 döndürüyor. 390px ekran/scrollWidth=390; konsolda sıfır error. Kanıt ekranları `/tmp/wa-live-desktop.png`, `/tmp/wa-live-mobile-top.png`.
- Panel, mağaza ana sayfa, hesap, ödeme ve ürün liste API'si 200. Müşteri uygulaması restart anındaki kısa 502 sonrasında yeniden kontrol edildi: 200. Eski backend public/storage bağlantısı yeni release'te korundu.
- İki WhatsApp worker online, hata dosyaları 0 byte. Bağlantı/mesaj/attempt/WhatsApp kuyruğu 0. `retry_after=90`; scheduler kayıtları ve boş hesapta refresh/dispatch çalışması doğrulandı.
- 29 hedefli test / 81 assertion geçti. Yeni testler: sunucu altyapısı açıkken bağlantısız/pilot hesapta müşteri izni gizli; panel onaysız şablonla etkinleştiremiyor.
- Yazılım canlıya alındı. Numara satın alma, Meta hesap/numara kurulumu, şablonların Meta onayı ve izinli pilotta gerçek teslim henüz tamamlanmadı. OSGB kaynakları değiştirilmedi.
