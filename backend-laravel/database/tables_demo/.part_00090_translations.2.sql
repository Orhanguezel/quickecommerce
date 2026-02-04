-- Table structure for table `translations`

/*
CREATE TABLE `translations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `translatable_id` bigint(20) UNSIGNED NOT NULL,
  `translatable_type` varchar(255) NOT NULL,
  `language` varchar(255) NOT NULL DEFAULT 'tr',
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

*/

-- Dumping data for table `translations`
INSERT INTO `translations` (`id`, `translatable_id`, `translatable_type`, `language`, `key`, `value`, `created_at`, `updated_at`) VALUES
(338, 2, 'App\\Models\\BlogCategory', 'tr', 'name', 'Sağlık ve İyi Yaşam', NULL, NULL),
(339, 2, 'App\\Models\\BlogCategory', 'tr', 'meta_title', 'Sağlık ve İyi Yaşam', NULL, NULL),
(340, 2, 'App\\Models\\BlogCategory', 'tr', 'meta_description', 'Sağlık ve İyi Yaşam', NULL, NULL),
(341, 3, 'App\\Models\\BlogCategory', 'tr', 'name', 'Fırıncılık ve Tatlılar', NULL, NULL),
(342, 3, 'App\\Models\\BlogCategory', 'tr', 'meta_title', 'Fırıncılık ve Tatlılar', NULL, NULL),
(343, 3, 'App\\Models\\BlogCategory', 'tr', 'meta_description', 'Fırıncılık ve Tatlılar', NULL, NULL),
(344, 4, 'App\\Models\\BlogCategory', 'tr', 'name', 'Market İçgörüleri', NULL, NULL),
(345, 4, 'App\\Models\\BlogCategory', 'tr', 'meta_title', 'Market İçgörüleri', NULL, NULL),
(346, 4, 'App\\Models\\BlogCategory', 'tr', 'meta_description', 'Market İçgörüleri', NULL, NULL),

(347, 2, 'App\\Models\\Blog', 'tr', 'title', 'Fırıncılık 101: Kusursuz Kek ve Hamur İşleri İçin İpuçları', NULL, NULL),
(348, 2, 'App\\Models\\Blog', 'tr', 'description', 'Fırıncılık hem bir sanat hem de bilimdir; hassasiyet ve doğru teknikler gerektirir. En önemli noktalardan biri malzemeleri doğru ölçmektir; küçük farklılıklar bile sonucu etkileyebilir. Özellikle yumurta ve tereyağı gibi oda sıcaklığındaki malzemeler daha pürüzsüz bir karışım elde etmenize yardımcı olur. Fırını önceden ısıtmak kritiktir; soğuk fırına konan hamur eşit pişmeyebilir. Fırınınızı tanımak da önemlidir—bazı fırınlarda sıcak noktalar bulunur; bu nedenle pişirme sırasında tepsileri bir kez çevirmek daha dengeli sonuç verir. Ayrıca katlama, çırpma ve karıştırma gibi teknikler istenen dokuyu doğrudan etkiler. Yeni başlayanlar için önce basit tariflerle başlayıp sonra daha karmaşık tekniklere geçmek özgüven kazandırır. Son olarak, kek ve hamur işlerini süslemeden önce mutlaka soğutun; aksi halde krema eriyebilir ve görüntü bozulabilir. Pratik ve sabırla herkes fırıncılıkta ustalaşabilir.', NULL, NULL),

(516, 188, 'App\\Models\\Product', 'tr', 'name', 'Ulric Thomas', NULL, NULL),
(517, 188, 'App\\Models\\Product', 'tr', 'description', 'At ratione consequat', NULL, NULL),
(518, 188, 'App\\Models\\Product', 'tr', 'meta_title', 'Dolore sed voluptas', NULL, NULL),
(519, 188, 'App\\Models\\Product', 'tr', 'meta_description', 'Voluptatem est iru', NULL, NULL),
(520, 187, 'App\\Models\\Product', 'tr', 'name', 'Summer Mcconnell', NULL, NULL),
(521, 187, 'App\\Models\\Product', 'tr', 'description', 'In velit occaecat te', NULL, NULL),
(522, 187, 'App\\Models\\Product', 'tr', 'meta_title', 'Ut pariatur Quia du', NULL, NULL),
(523, 187, 'App\\Models\\Product', 'tr', 'meta_description', 'Labore officia proid', NULL, NULL),

(524, 22, 'App\\Models\\Coupon', 'tr', 'title', 'WELCOME10', NULL, NULL),
(525, 22, 'App\\Models\\Coupon', 'tr', 'description', 'İlk siparişte %10 indirim.', NULL, NULL),

(584, 2, 'App\\Models\\Page', 'tr', 'title', 'Şartlar ve Koşullar', NULL, NULL),
(585, 2, 'App\\Models\\Page', 'tr', 'content', '<h2>📄 <strong>Şartlar ve Koşullar</strong></h2><p>Quick Ecommerce''e hoş geldiniz. Bu Şartlar ve Koşullar, platformumuzun kullanımına ilişkin kural ve düzenlemeleri açıklar.</p><p>Platforma erişerek veya platformu kullanarak bu şartlara uymayı ve şartlarla bağlı olmayı kabul etmiş olursunuz. Şartların herhangi bir bölümünü kabul etmiyorsanız hizmetlerimizi kullanmamalısınız.</p><p></p><hr><h3>1. 🛍️ <strong>Platformumuzu Kullanma</strong></h3><ul><li><p>En az <strong>18 yaşında</strong> olmalısınız veya siteyi bir veli/vasinin gözetiminde kullanmalısınız.</p></li><li><p>Platformu yalnızca yasal amaçlarla kullanmayı kabul edersiniz.</p></li><li><p>Her türlü dolandırıcılık, kötüye kullanım veya yasa dışı faaliyet kesinlikle yasaktır.</p></li><li><p></p></li></ul><hr><h3>2. 👤 <strong>Kullanıcı Hesapları</strong></h3><ul><li><p>Hesabınızın ve şifrenizin gizliliğini korumaktan siz sorumlusunuz.</p></li><li><p>Kayıt sırasında doğru ve eksiksiz bilgi sağlamayı kabul edersiniz.</p></li><li><p><strong>Quick Ecommerce</strong> şartlarımızı ihlal ettiği tespit edilen hesapları askıya alma veya sonlandırma hakkını saklı tutar.</p></li></ul><hr><p></p><h3>3. 🛒 <strong>Siparişler ve İşlemler</strong></h3><ul><li><p>Web sitesi üzerinden verilen tüm siparişler, ürün bulunabilirliğine ve sipariş fiyatının onayına tabidir.</p></li><li><p>Herhangi bir nedenle siparişleri iptal etme veya sipariş miktarını sınırlama hakkımız saklıdır.</p></li></ul><hr><p></p><h3>4. 📦 <strong>Satıcı Sorumlulukları</strong></h3><ul><li><p>Satıcılar, doğru listeleme bilgisi, stok uygunluğu ve zamanında teslimatı sağlamalıdır.</p></li><li><p>Ürünler, <strong>Satıcı Politikası</strong>nda tanımlanan kalite ve güvenlik standartlarını karşılamalıdır.</p></li><li><p>Platformun satıcılar tarafından kötüye kullanımı, hesabın askıya alınmasına yol açabilir.</p></li></ul><hr><p></p><h3>5. 💳 <strong>Fiyatlandırma ve Ödeme</strong></h3><ul><li><p>Tüm fiyatlar <strong>$</strong> cinsinden listelenir ve aksi belirtilmedikçe uygulanabilir vergileri içerir.</p></li><li><p>Fiyatları önceden bildirimde bulunmaksızın değiştirme hakkımız saklıdır.</p></li></ul><hr><p></p><h3>6. 🔄 İadeler, Geri Ödemeler ve İptaller</h3><ul><li><p>İadeler, değişimler ve iptaller hakkında bilgi için lütfen <strong>İade ve Geri Ödeme Politikası</strong>nı inceleyin.</p></li></ul><hr><p></p><h3>7. 🔐 <strong>Gizlilik Politikası</strong></h3><ul><li><p>Sitemizi kullanımınız, kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklayan <strong>Gizlilik Politikası</strong>na da tabidir.</p></li></ul><hr><p></p><h3>8. 🚫 <strong>Yasaklı Faaliyetler</strong></h3><p>Kullanıcıların aşağıdakileri yapması yasaktır:</p><ul><li><p>Yürürlükteki yasaları ihlal etmek</p></li><li><p>Başkasının fikri mülkiyet haklarını ihlal etmek</p></li><li><p>Virüs veya kötü amaçlı kod yüklemek ya da iletmek</p></li><li><p>Diğer hesaplara yetkisiz erişim sağlamaya çalışmak</p></li></ul><hr><p></p><h3>9. 📜 <strong>Fikri Mülkiyet</strong></h3><ul><li><p>Platformdaki tüm içerik, tasarım, logo ve ticari markalar Quick Ecommerce veya lisans verenlerine aittir.</p></li><li><p>Önceden yazılı izin alınmadan hiçbir içerik kullanılamaz.</p></li></ul><hr><p></p><h3>10. ⚖️ <strong>Sorumluluğun Sınırlandırılması</strong></h3><ul><li><p>Platformun kullanımından veya kullanılamamasından kaynaklanan dolaylı, arızi veya sonuç olarak doğan zararlardan sorumlu tutulamayız.</p></li></ul><hr><p></p><h3>11. 🛠️ <strong>Değişiklikler</strong></h3><ul><li><p>Bu şartları dilediğimiz zaman güncelleme veya değiştirme hakkımız saklıdır.</p></li><li><p>Değişikliklerden sonra platformu kullanmaya devam etmeniz, güncellenmiş şartları kabul ettiğiniz anlamına gelir.</p></li></ul><hr><p></p><h3>12. 📞 <strong>Bize Ulaşın</strong></h3><p>Bu Şartlar hakkında sorularınız varsa bizimle iletişime geçin:</p><p><strong>E-posta:</strong> example.support@gmail.com<br><strong>Telefon:</strong> +2001700000000</p>', NULL, NULL),
(586, 2, 'App\\Models\\Page', 'tr', 'meta_title', 'Online Ürün Satın Al - Harika Mağaza', NULL, NULL),
(587, 2, 'App\\Models\\Page', 'tr', 'meta_description', 'Harika Mağaza''da ürünlerde en iyi fırsatlar.', NULL, NULL),
(588, 2, 'App\\Models\\Page', 'tr', 'meta_keywords', 'harika mağaza, en iyi fırsatlar, online ürünler', NULL, NULL),

(610, 187, 'App\\Models\\Product', 'tr', 'meta_keywords', 'asdf', NULL, NULL),

(611, 5, 'App\\Models\\Page', 'tr', 'title', 'Gizlilik Politikası', NULL, NULL),
(612, 5, 'App\\Models\\Page', 'tr', 'content', '<h1><strong>Gizlilik Politikası</strong></h1><h2>Gizlilik ve Bilgi Güvenliği Politikası</h2><p>Quick Ecommerce''e hoş geldiniz. Bu Şartlar ve Koşullar (\"Şartlar\"), çok satıcılı e-ticaret platformumuzu kullanımınızı düzenler ve alıcılar, satıcılar ve ziyaretçiler dahil tüm kullanıcılar için geçerlidir. Platforma erişerek veya platformu kullanarak bu şartlara uymayı kabul edersiniz.</p><p>Platformumuz, bağımsız satıcıların ürün listeleyip satabildiği; alıcıların ise ürünleri inceleyip satın alabildiği bir pazar yeri sağlar. Bu işlemleri kolaylaştırmakla birlikte, ürünlerin satışı veya teslimatı süreçlerinde doğrudan taraf olmayabiliriz.</p><p>Lütfen bu şartları dikkatle inceleyin. Kabul etmiyorsanız platformu kullanmayı bırakmalısınız. Sorularınız veya destek için example.support@gmail.com adresinden bizimle iletişime geçin.</p><h2>Topladığımız Bilgiler</h2><p></p><h3>1. Kişisel Bilgiler</h3><ul><li><p><strong>Ad Soyad:</strong> Kimlik doğrulama, faturalandırma ve teslimat amaçlarıyla kullanılır.</p></li><li><p><strong>E-posta Adresi:</strong> Hesap oluşturma, iletişim ve sipariş bildirimleri için gereklidir.</p></li><li><p><strong>Telefon Numarası:</strong> Hesap doğrulama, sipariş güncellemeleri ve müşteri desteği için kullanılır.</p></li><li><p><strong>Fatura ve Teslimat Adresi:</strong> Ödeme işlemleri ve satın alınan ürünlerin teslimi için gereklidir.</p></li></ul><h3>2. Hesap Bilgileri</h3><ul><li><p><strong>Kullanıcı Adı:</strong> Giriş yapmak ve hesabın tanınması için kullanıcı tarafından seçilir.</p></li><li><p><strong>Şifre:</strong> Kullanıcı hesaplarını korumak için güvenli şekilde şifrelenir ve saklanır.</p></li><li><p><strong>Profil Detayları:</strong> Avatar, tercihler, kayıtlı adresler ve iletişim ayarlarını içerebilir.</p></li></ul><h3>3. Ödeme Bilgileri</h3><ul><li><p><strong>İşlem Geçmişi:</strong> Ödemeler, satın almalar, iadeler ve uyuşmazlık kayıtları.</p></li><li><p><strong>Faturalandırma Bilgileri:</strong> Ödeme yöntemi (kredi/banka kartı, dijital cüzdan vb.) bilgilerini içerebilir.</p></li><li><p><strong>Üçüncü Taraf Ödeme Verileri:</strong> Tam kart bilgilerini saklamadığımız durumlarda, ödeme ortaklarımız gerekli bilgileri güvenli şekilde işler ve saklar.</p></li></ul><h3>4. Cihaz ve Kullanım Verileri</h3><ul><li><p><strong>IP Adresi:</strong> Dolandırıcılığı tespit etmek, güvenliği sağlamak ve konuma göre içerik sunmak için kullanılabilir.</p></li><li><p><strong>Tarayıcı Türü ve İşletim Sistemi:</strong> Web sitesi deneyimini optimize etmek için kullanılır.</p></li><li><p><strong>Çerezler ve İzleme Teknolojileri:</strong> Oturum yönetimi, kimlik doğrulama ve pazarlama iyileştirmeleri için kullanılabilir.</p></li><li><p><strong>Analitik Veriler:</strong> Kullanıcı davranışlarını ve site trafiğini analiz etmek için (ör. Google Analytics) üçüncü taraf araçlar aracılığıyla toplanabilir.</p></li></ul><h3>5. Satıcıya Özgü Veriler</h3><ul><li><p><strong>İşletme Bilgileri:</strong> İşletme adı, kayıt detayları ve vergi kimliği gibi bilgileri içerebilir.</p></li><li><p><strong>Mağaza Bilgileri:</strong> Mağaza adı, logo, politikalar ve iletişim bilgilerini içerir.</p></li><li><p><strong>Yüklenen İçerikler:</strong> Ürün listeleri, açıklamalar, görseller ve satış için gereken diğer medya içerikleri.</p></li></ul><h2>Veri Koruma, Güvenlik ve İzleme Teknolojileri</h2><h3>1. Veri Koruma ve Güvenlik</h3><ul><li><p><strong>Şifreleme ve Güvenli Saklama:</strong> Şifreler ve ödeme verileri dahil hassas veriler güvenli şekilde saklanır.</p></li><li><p><strong>Güvenli Ödeme İşleme:</strong> İşlemler, finansal veriyi korumak için uygun standartlara sahip ödeme altyapıları üzerinden yürütülür.</p></li><li><p><strong>Erişim Kontrolü:</strong> Hassas verilere yalnızca yetkili personel erişebilir ve sıkı güvenlik prosedürleri uygulanır.</p></li><li><p><strong>Dolandırıcılık Önleme:</strong> Şüpheli faaliyetleri tespit etmek için otomatik güvenlik araçları ve izleme sistemleri kullanılabilir.</p></li><li><p><strong>Düzenli Güvenlik Denetimleri:</strong> Güvenliği artırmak için periyodik değerlendirmeler ve güncellemeler yapılabilir.</p></li></ul><h3>2. Çerezler ve İzleme Teknolojileri</h3><ul><li><p><strong>Zorunlu Çerezler:</strong> Web sitesi işlevselliği için gereklidir; giriş doğrulama ve alışveriş sepeti yönetimi gibi işlemleri destekler.</p></li><li><p><strong>Performans ve Analitik Çerezleri:</strong> Kullanıcı davranışlarını analiz ederek kullanıcı deneyimini iyileştirmemize yardımcı olur.</p></li><li><p><strong>Reklam ve Pazarlama Çerezleri:</strong> Gezinme etkinliğine göre kişiselleştirilmiş reklamlar ve yeniden pazarlama kampanyaları için kullanılabilir.</p></li><li><p><strong>Üçüncü Taraf İzleme:</strong> Bazı çerezler, etkileşimi anlamamıza ve optimize etmemize yardımcı olmak için üçüncü taraf hizmetler (ör. Google Analytics, Facebook Pixel) tarafından yerleştirilebilir.</p></li></ul>', NULL, NULL),
(613, 5, 'App\\Models\\Page', 'tr', 'meta_title', 'Online Ürün Satın Al - Harika Mağaza', NULL, NULL),
(614, 5, 'App\\Models\\Page', 'tr', 'meta_description', 'My Amazing Store''da uygun fiyatlarla kaliteli ürünlerde en iyi fırsatları bulun.', NULL, NULL),
(615, 5, 'App\\Models\\Page', 'tr', 'meta_keywords', 'harika mağaza, en iyi fırsatlar, online ürünler', NULL, NULL),

(783, 189, 'App\\Models\\Product', 'tr', 'name', 'Paws & Tails Premium Köpek Maması', NULL, NULL),
(784, 189, 'App\\Models\\Product', 'tr', 'description', 'Tüylü dostunuz için besleyici ve dengeli bir öğün. Sağlık ve enerji desteği için yüksek kaliteli proteinler, vitaminler ve minerallerle hazırlanmıştır.', NULL, NULL),

(799, 10, 'App\\Models\\Store', 'tr', 'name', 'Patiler ve Pençeler', NULL, NULL),



(1391, 6, 'App\\Models\\Page', 'tr', 'title', 'İade Politikaları', NULL, NULL),
(1392, 6, 'App\\Models\\Page', 'tr', 'content', '<p>🧾 İade ve Geri Ödeme Politikası Müşterilerimiz için sorunsuz bir alışveriş deneyimi sunmayı hedefliyoruz. Çok satıcılı platformumuzda iadelerin ve geri ödemelerin nasıl işlediğini anlamak için lütfen İade ve Geri Ödeme Politikamızı dikkatlice okuyun.<br><br> 🛒 Genel İade Politikası Müşteriler, ürünü teslim aldıktan sonra 30 gün içinde iade talebinde bulunabilir. İadeler yalnızca aşağıdaki durumlarda kabul edilir: Kargo sırasında hasar görmesi Arızalı veya çalışmaması Yanlış ürün gönderilmesi veya anlatıldığı gibi olmaması Ürün kullanılmamış olmalı, orijinal ambalajında ve tüm orijinal etiket/etiketleri üzerinde olmalıdır. <br><br>🔄 Satıcıya Özel İade Politikaları Her satıcının ürün türüne göre farklı iade politikaları olabilir. Her zaman ilgili mağaza/ürün sayfasında belirtilen iade politikasını kontrol edin. Bir satıcı belirli bir politika tanımlamazsa, genel iade politikası geçerli olur.<br><br> 💸 Geri Ödeme Süreci İade edilen ürün teslim alınıp incelendikten sonra, geri ödemeler 7–10 iş günü içinde orijinal ödeme yöntemine yapılır. Müşteriler mağaza kredisi seçebilir</p>', NULL, NULL),
(1393, 6, 'App\\Models\\Page', 'tr', 'meta_title', 'İade Politikaları', NULL, NULL),
(1394, 6, 'App\\Models\\Page', 'tr', 'meta_description', 'İade Politikaları', NULL, NULL),
(1395, 6, 'App\\Models\\Page', 'tr', 'meta_keywords', 'İade Politikaları', NULL, NULL),

(1710, 1, 'App\\Models\\EmailTemplate', 'tr', 'name', 'Kullanıcı Kaydı', NULL, NULL),
(1711, 1, 'App\\Models\\EmailTemplate', 'tr', 'subject', 'Hoş Geldiniz', NULL, NULL),

(2097, 205, 'App\\Models\\Product', 'tr', 'meta_keywords', 'm', NULL, NULL),

(2121, 1, 'App\\Models\\StoreType', 'tr', 'name', 'Market', NULL, NULL),
(2122, 1, 'App\\Models\\StoreType', 'tr', 'description', 'Market Bilgisi', NULL, NULL),

(2144, 212, 'App\\Models\\Product', 'tr', 'name', 'Jackfruit E5', NULL, NULL),
(2145, 212, 'App\\Models\\Product', 'tr', 'description', 'Bu, dünyadaki en iyi jackfruit E5', NULL, NULL),
(2146, 212, 'App\\Models\\Product', 'tr', 'meta_title', 'Jackfruit E5', NULL, NULL),
(2147, 212, 'App\\Models\\Product', 'tr', 'meta_description', 'Bu, dünyadaki en iyi jackfruit E5', NULL, NULL),

(2521, 51, 'App\\Models\\ProductAttribute', 'tr', 'name', 'Ağırlık Satıcı İngilizce', NULL, NULL),

(4928, 78, 'App\\Models\\Product', 'tr', 'name', 'Seyahat Spor Çantası', NULL, NULL),
(5303, 58, 'App\\Models\\ProductAttribute', 'tr', 'name', 'Yeşil Biberler', NULL, NULL),

(5446, 18, 'App\\Models\\Page', 'tr', 'title', 'Kargo ve Teslimat Politikası', NULL, NULL),
(5447, 18, 'App\\Models\\Page', 'tr', 'content', '<h2>🚚 <strong>Kargo ve Teslimat Politikası</strong></h2><p></p><p>Siparişinizi doğru şekilde, iyi durumda ve her zaman zamanında teslim etmeye kararlıyız.</p><h3>⏱️ Kargo Süreleri</h3><ul><li><p>Siparişler genellikle <strong>1–2 iş günü</strong> içinde hazırlanır ve kargoya verilir.</p></li><li><p>Teslimat süresi, teslimat adresine ve seçilen teslimat yöntemine bağlıdır:</p><ul><li><p><strong>Yerel teslimat</strong>: 1–3 gün</p></li><li><p><strong>Yurt içi kargo</strong>: 3–7 gün</p></li><li><p><strong>Uluslararası</strong> (varsa): 7–21 gün</p></li><li><p></p></li></ul></li></ul><h3>💰 <strong>Kargo Ücretleri</strong></h3><ul><li><p><strong>[örn. $50]</strong> üzeri siparişlerde ücretsiz kargo</p></li><li><p>Daha küçük siparişler için standart bir kargo ücreti uygulanır (ödeme adımında hesaplanır).</p></li><li><p></p></li></ul><h3>📦 <strong>Teslimat Ortakları</strong></h3><p>Zamanında ve güvenli teslimat sağlamak için <strong>[Kargo Firma İsimleri]</strong> gibi güvenilir lojistik ortaklarıyla çalışırız.</p><h3>📍 Sipariş Takibi</h3><p>Siparişiniz kargoya verildiğinde, teslimat durumunu takip edebilmeniz için size <strong>takip numarası</strong> içeren bir e-posta/SMS gönderilecektir.</p><h3>📌 <strong>Teslimat Denemeleri</strong></h3><ul><li><p>Teslimat için <strong>en fazla 3 kez</strong> deneme yapılır.</p></li><li><p>Başarısız denemelerden sonra sipariş satıcıya iade edilebilir.</p></li><li><p></p></li></ul><h3>📦 <strong>Hasarlı veya Eksik Ürünler</strong></h3><ul><li><p>Hasarlı bir ürün aldıysanız veya ürünlerinizin eksik olduğunu fark ettiyseniz, fotoğraflar ve sipariş detaylarıyla birlikte teslimattan sonraki <strong>48 saat</strong> içinde bizimle iletişime geçin.</p></li></ul>', NULL, NULL),
(5448, 18, 'App\\Models\\Page', 'tr', 'meta_title', 'Test Sayfası Türkçe Meta', NULL, NULL),
(5449, 18, 'App\\Models\\Page', 'tr', 'meta_description', 'Test Sayfası Türkçe Açıklama', NULL, NULL),
(5450, 18, 'App\\Models\\Page', 'tr', 'meta_keywords', 'Test Sayfası Türkçe', NULL, NULL),

(6764, 1, 'App\\Models\\Slider', 'tr', 'title', 'Taze ve Organik Market Ürünleri', NULL, NULL),
(6765, 1, 'App\\Models\\Slider', 'tr', 'sub_title', 'Günlük İhtiyaçlarınız Kapınıza Gelsin', NULL, NULL),
(6766, 1, 'App\\Models\\Slider', 'tr', 'description', 'Çiftlikten taze ürünleri ve temel gıda malzemelerini kolayca satın alın.', NULL, NULL),
(6767, 1, 'App\\Models\\Slider', 'tr', 'button_text', 'Şimdi Satın Al', NULL, NULL),


(7189, 225, 'App\\Models\\Product', 'tr', 'name', 'Karışık Taze Meyveler', NULL, NULL),
(7190, 225, 'App\\Models\\Product', 'tr', 'description', '<p style=\"text-align: left\">Doğanın en iyi meyvelerinden oluşan, renk, lezzet ve besin değeriyle dolu canlı bir karışım. Bu lezzetli harman; özenle seçilmiş mevsim favorilerini içerir ve tatlılık, ekşilik ve tazeliğin mükemmel dengesini sunar. Atıştırmalık olarak, tatlılarda, smoothie''lerde ya da sağlıklı bir yan seçenek olarak idealdir; karışık meyveler, her lokmada birden fazla meyvenin iyiliğini keyifle tüketmenin ferahlatıcı bir yoludur.</p>', NULL, NULL),

(7197, 1, 'App\\Models\\StoreType', 'tr', 'additional_charge_name', 'Paketleme Ücreti', NULL, NULL),
(7216, 2, 'App\\Models\\StoreType', 'tr', 'name', 'Fırın', NULL, NULL),
(7217, 2, 'App\\Models\\StoreType', 'tr', 'additional_charge_name', 'Paketleme Ücreti', NULL, NULL),
(7220, 3, 'App\\Models\\StoreType', 'tr', 'name', 'Eczane', NULL, NULL),

(7255, 221, 'App\\Models\\Product', 'tr', 'name', 'Dalından Taze Elmalar', NULL, NULL),
(7256, 221, 'App\\Models\\Product', 'tr', 'description', '<p>Kıtır, sulu ve doğal olarak tatlı—dalından taze elmalarımız, eşsiz lezzet ve tazelik sunmak için en olgun zamanında özenle toplanır. Besin değeri yüksek bahçelerde titizlikle yetiştirilen bu elmalar; atıştırmalık olarak, fırın tariflerinde ya da meyve suyu yapımında mükemmeldir. Vitamin ve antioksidanlarla dolu olduğu için tüm aile için sağlıklı bir tercihtir.</p>', NULL, NULL),
(7268, 186, 'App\\Models\\Product', 'tr', 'name', 'Organik Soğuk Sıkım Elma Suyu', NULL, NULL),
(7269, 186, 'App\\Models\\Product', 'tr', 'description', '<p><strong>Organik Soğuk Sıkım Elma Suyu</strong> ile her yudumda doğanın saf özünü keşfedin. Sertifikalı organik bahçelerden temin edilen elmalarla özenle üretilen bu meyve suyu; kıtır tatlılık ve doğal ferahlığın mükemmel dengesini sunar. Geleneksel meyve sularından farklı olarak ürünümüz, elmaların besin değerini, aromasını ve tazeliğini en üst düzeyde korumak için soğuk sıkım yöntemiyle hazırlanır — doğanın amaçladığı gibi.</p><p></p><p>Meyve suyumuzu farklı kılan; meyvenin kalitesi ve arkasındaki süreçtir. Yalnızca sentetik pestisit, gübre veya GDO kullanılmadan yetiştirilen, özenle seçilmiş elmalar kullanırız. Elmalar en olgun zamanda hasat edildikten sonra nazikçe yıkanır, ayıklanır ve ısı kullanılmadan soğuk sıkım yapılır — bu yöntem, ısıtma olmadan meyve suyunun elde edilmesini sağlar. Böylece C vitamini, potasyum ve antioksidanlar gibi; geleneksel pastörizasyonda genellikle kaybolan temel besin öğelerinin korunmasına yardımcı olur.</p>', NULL, NULL),
(7275, 182, 'App\\Models\\Product', 'tr', 'name', 'Kaliteli Et ve Tavuk Parçaları', NULL, NULL),
(7276, 182, 'App\\Models\\Product', 'tr', 'description', '<p>Güvenilir çiftliklerden temin edilen ve en yüksek hijyen standartlarında işlenen, özenle seçilmiş tavuk ve et parçalarımızla en iyi lezzeti deneyimleyin. Her porsiyon tazeliği, yumuşaklığı ve zengin aromayı korumak için dikkatle ayıklanır, temizlenir ve paketlenir. İster doyurucu bir güveç, ister hafta sonu mangalı, ister hızlı bir hafta içi yemeği hazırlıyor olun; premium parçalarımız her seferinde harika tat ve kalite sağlar. Tazelik, besin değeri ve pratikliği önemseyen aileler ve ev aşçıları için idealdir.</p>', NULL, NULL),
(7382, 181, 'App\\Models\\Product', 'tr', 'name', 'Ilık Su Istakoz Kuyrukları', NULL, NULL),
(7383, 181, 'App\\Models\\Product', 'tr', 'description', '<p>Zengin ve tatlı aromasıyla, yumuşak dokusuyla öne çıkan premium <strong>Ilık Su Istakoz Kuyrukları</strong>nın keyfini çıkarın. Tropikal sulardan temin edilen bu ıstakoz kuyrukları, soğuk su türlerine göre biraz daha yumuşak et yapısıyla bilinir; bu da onları ızgara, fırın veya ızgara üstü pişirme için ideal hale getirir. Her kuyruk özenle temizlenir ve tazeliği kilitlemek için şoklanarak dondurulur; böylece restoran kalitesinde deniz ürünleri mutfağınıza kadar gelir. Şık akşam yemekleri, özel günler veya gurme tarifler için mükemmel olan bu ürün, her lokmada lüks bir deniz ürünü deneyimi sunar.</p>', NULL, NULL),
(7389, 180, 'App\\Models\\Product', 'tr', 'name', 'Otla Beslenmiş Dana Kıyma', NULL, NULL),
(7390, 180, 'App\\Models\\Product', 'tr', 'description', '<p>Seçkin dana etlerinden hazırlanan yüksek kaliteli dana kıymamız; zengin lezzet, ideal doku ve güvenilir tazeliği her pakette sunar. Hamburger, köfte, taco veya ev yapımı doyurucu yemekler için ideal olan bu çok yönlü et; doğal tadını korumak için taze çekilir ve minimum düzeyde işlenir. Yağ ve et oranı dengeli olduğu için eşit pişer ve sulu kalır; hem şeflerin hem de ev aşçılarının favori seçimidir. Dolgu yok, katkı yok—yalnızca güvenebileceğiniz saf ve lezzetli dana eti.</p>', NULL, NULL),

(7459, 4, 'App\\Models\\OrderRefundReason', 'tr', 'reason', 'Hasarlı veya Arızalı Ürün Teslim Aldım', NULL, NULL),
(7461, 5, 'App\\Models\\OrderRefundReason', 'tr', 'reason', 'Yanlış Ürün Teslim Edildi', NULL, NULL),
(7464, 7, 'App\\Models\\OrderRefundReason', 'tr', 'reason', 'Fikrimi Değiştirdim', NULL, NULL),
(10713, 8, 'App\\Models\\OrderRefundReason', 'tr', 'reason', 'Ürüne İhtiyacım Yok', NULL, NULL),

(10964, 21, 'App\\Models\\Page', 'tr', 'title', '\"Harika Mağaza\"', NULL, NULL),
(10965, 21, 'App\\Models\\Page', 'tr', 'content', '\"<h1>Gizlilik Politikası<\\/h1><h2>Gizlilik ve Bilgi Güvenliği Politikası<\\/h2><p><strong>Sharpmart<\\/strong>''a hoş geldiniz. Bu Şartlar ve Koşullar (\\\"Şartlar\\\"), çok satıcılı e-ticaret platformumuzu kullanımınızı düzenler ve alıcılar, satıcılar ve ziyaretçiler dahil tüm kullanıcılar için geçerlidir. Platforma erişerek veya platformu kullanarak bu Şartlara uymayı kabul edersiniz.<\\/p><p>Platformumuz, bağımsız satıcıların ürün listeleyip satabildiği ve alıcıların ürünleri inceleyip satın alabildiği bir pazar yeri sağlar. Bu işlemleri kolaylaştırmakla birlikte, ürünlerin satışı veya teslimatı süreçlerinde doğrudan taraf değiliz.<\\/p><p>Lütfen bu Şartları dikkatle inceleyin. Kabul etmiyorsanız platformu kullanmayı bırakmalısınız. Her türlü soru veya destek için [Destek E-postası] adresinden bizimle iletişime geçin.<\\/p><h2>Topladığımız Bilgiler<\\/h2><h3>1. Kişisel Bilgiler<\\/h3><ul><li><strong>Ad Soyad:<\\/strong> Kimlik doğrulama, faturalandırma ve teslimat amaçlarıyla kullanılır.<\\/li><li><strong>E-posta Adresi:<\\/strong> Hesap oluşturma, iletişim ve sipariş onayları için gereklidir.<\\/li><li><strong>Telefon Numarası:<\\/strong> Hesap doğrulama, sipariş güncellemeleri ve müşteri desteği için kullanılır.<\\/li><li><strong>Fatura ve Teslimat Adresi:<\\/strong> Ödeme işlemleri ve satın alınan ürünlerin teslimi için gereklidir.<\\/li><\\/ul><h3>2. Hesap Bilgileri<\\/h3><ul><li><strong>Kullanıcı Adı:<\\/strong> Giriş yapmak ve hesabın tanınması için kullanıcı tarafından seçilir.<\\/li><li><strong>Şifre:<\\/strong> Kullanıcı hesaplarını korumak için güvenli şekilde şifrelenir ve saklanır.<\\/li><li><strong>Profil Detayları:<\\/strong> Avatar, tercihler, kayıtlı adresler ve iletişim ayarlarını içerebilir.<\\/li><\\/ul><h3>3. Ödeme Bilgileri<\\/h3><ul><li><strong>İşlem Geçmişi:<\\/strong> Ödemeler, satın almalar, iadeler ve uyuşmazlık kayıtları.<\\/li><li><strong>Faturalandırma Bilgileri:<\\/strong> Ödeme yöntemini içerir (kredi\\\/banka kartı, dijital cüzdanlar vb.).<\\/li><li><strong>Üçüncü Taraf Ödeme Verileri:<\\/strong> Tam kart bilgilerini saklamadığımız durumlarda, ödeme ortaklarımız işlemleri güvenli şekilde gerçekleştirir ve gerekli detayları saklar.<\\/li><\\/ul><h3>4. Cihaz ve Kullanım Verileri<\\/h3><ul><li><strong>IP Adresi:<\\/strong> Dolandırıcılığı tespit etmek, güvenliği sağlamak ve konuma göre içeriği kişiselleştirmek için kullanılır.<\\/li><li><strong>Tarayıcı Türü ve İşletim Sistemi:<\\/strong> Web sitesi deneyimini optimize etmek için kullanılır.<\\/li><li><strong>Çerezler ve İzleme Teknolojileri:<\\/strong> Oturum yönetimi, kullanıcı kimlik doğrulaması ve pazarlama iyileştirmelerini sağlar.<\\/li><li><strong>Analitik Veriler:<\\/strong> Kullanıcı davranışını, site trafiğini ve etkileşim metriklerini analiz etmek için üçüncü taraf araçlarla (örn. Google Analytics) toplanır.<\\/li><\\/ul><h3>5. Satıcıya Özgü Veriler<\\/h3><ul><li><strong>İşletme Bilgileri:<\\/strong> İşletme adı, kayıt detayları ve vergi kimliği gibi bilgiler.<\\/li><li><strong>Mağaza Bilgileri:<\\/strong> Mağaza adı, logo, politikalar ve iletişim detayları.<\\/li><li><strong>Yüklenen İçerikler:<\\/strong> Ürün listeleri, açıklamalar, görseller ve satış için gereken diğer medya içerikleri.<\\/li><\\/ul><h2>Veri Koruma, Güvenlik ve İzleme Teknolojileri<\\/h2><h3>1. Veri Koruma ve Güvenlik<\\/h3><ul><li><strong>Şifreleme ve Güvenli Saklama:<\\/strong> Şifreler ve ödeme bilgileri dahil tüm hassas veriler şifrelenir ve güvenli şekilde saklanır.<\\/li><li><strong>Güvenli Ödeme İşleme:<\\/strong> İşlemler, PCI-DSS uyumlu ödeme altyapıları üzerinden gerçekleştirilir ve finansal verinin korunmasını sağlar.<\\/li><li><strong>Erişim Kontrolü:<\\/strong> Hassas verilere yalnızca yetkili personel erişebilir; sıkı güvenlik protokolleri uygulanır.<\\/li><li><strong>Dolandırıcılık Önleme:<\\/strong> Otomatik güvenlik araçları ve izleme sistemleri ile dolandırıcılık faaliyetleri tespit edilir.<\\/li><li><strong>Düzenli Güvenlik Denetimleri:<\\/strong> Veri güvenliği önlemlerini geliştirmek için periyodik değerlendirmeler ve güncellemeler yapılır.<\\/li><\\/ul><h3>2. Çerezler ve İzleme Teknolojileri<\\/h3><ul><li><strong>Zorunlu Çerezler:<\\/strong> Web sitesinin çalışması için gereklidir; giriş doğrulama ve sepet yönetimi gibi işlevleri kapsar.<\\/li><li><strong>Performans ve Analitik Çerezleri:<\\/strong> Kullanıcı davranışını analiz ederek trafiği takip eder ve deneyimi iyileştirir.<\\/li><li><strong>Reklam ve Pazarlama Çerezleri:<\\/strong> Gezinme etkinliğine göre kişiselleştirilmiş reklamlar ve yeniden pazarlama için kullanılır.<\\/li><li><strong>Üçüncü Taraf İzleme:<\\/strong> Bazı çerezler, etkileşimi anlamamıza ve optimize etmemize yardımcı olmak için üçüncü taraf servisler (örn. Google Analytics, Facebook Pixel) tarafından yerleştirilebilir.<\\/li><\\/ul>\"', NULL, NULL),
(10966, 21, 'App\\Models\\Page', 'tr', 'meta_title', '\"Online Ürün Satın Al - Harika Mağaza\"', NULL, NULL),
(10967, 21, 'App\\Models\\Page', 'tr', 'meta_description', '\"Harika Mağaza''da ürünlerde en iyi fırsatlar.\"', NULL, NULL),
(10968, 21, 'App\\Models\\Page', 'tr', 'meta_keywords', '\"harika mağaza, en iyi fırsatlar, online ürünler\"', NULL, NULL),


(13640, 237, 'App\\Models\\Product', 'tr', 'name', 'Taze Domates', NULL, NULL),
(13641, 237, 'App\\Models\\Product', 'tr', 'description', '<p><strong>Genel Bakış:</strong><br>Taze Domates; canlı rengi, sulu dokusu ve besin değeriyle dolu bir meyvedir (çoğunlukla sebze olarak kullanılır) ve çok çeşitli yemeklere lezzet, renk ve sağlık faydası katar. En iyi koşullarda yetiştirilen domateslerimiz, üstün tat, doku ve tazelik sağlamak için en olgun döneminde özenle toplanır. Salatalarda, soslarda, çorbalarda veya sandviçlerde kullanılsın; Taze Domates, her öğünü zenginleştiren doğal tatlılık ve hafif ekşiliğin ferah bir karışımını sunar.</p><hr><h3><strong>Öne Çıkan Özellikler:</strong></h3><p>🌱 <strong>Premium Kalite</strong> – Zengin rengi, diri dokusu ve lezzeti için özenle seçilir.<br>🍅 <strong>Doğal Olarak Sulu ve Lezzetli</strong> – Ferah bir tat için tatlılık ve asiditenin ideal dengesi.<br>🌿 <strong>Besin Değeri Yüksek</strong> – A, C, K vitaminleri; potasyum ve likopen gibi antioksidanlar açısından zengindir.<br>🚜 <strong>Dalından Taze</strong> – Maksimum tazelik için güvenilir yerel çiftliklerden temin edilir.<br>🌎 <strong>Çok Yönlü Kullanım</strong> – Salata, sos, ızgara, fırın, atıştırmalık ve daha fazlası için idealdir.<br>📦 <strong>Çevre Dostu Ambalaj</strong> – Tazeliği korumak ve çevresel etkiyi azaltmak için sürdürülebilir şekilde paketlenir.</p><hr><h3><strong>Faydaları:</strong></h3><p>✅ <strong>Kalp Sağlığını Destekler</strong> – Domatesteki likopen, kardiyovasküler sağlığın korunmasına yardımcı olur.<br>✅ <strong>Bağışıklığı Güçlendirir</strong> – Yüksek C vitamini içeriği bağışıklık sistemini destekler.<br>✅ <strong>Cilt Sağlığını Destekler</strong> – Antioksidanlar UV hasarı ve yaşlanmaya karşı korunmaya yardımcı olur.<br>✅ <strong>Düşük Kalorilidir</strong> – Kilo kontrolüne dikkat edenler için sağlıklı, su oranı yüksek bir atıştırmalıktır.</p><hr><h3><strong>Kullanım Önerileri:</strong></h3><ul><li><p><strong>Salatalarda taze</strong> (Caprese, Yunan veya bahçe salataları)</p></li><li><p><strong>Ev yapımı soslar ve salsalar</strong> (marinara, bruschetta, pico de gallo)</p></li><li><p><strong>Izgara veya fırında</strong> (yan yemek ya da sebze karışımlarında)</p></li><li><p><strong>Çorbalarda blenderdan</strong> (domates bisque, gazpacho)</p></li><li><p><strong>Sandviçler ve burgerler</strong> (sulu dokunuş için dilimleyerek)</p></li><li><p><strong>Sağlıklı atıştırmalık</strong> (bir tutam tuz veya humusla)</p></li></ul><hr><h3><strong>Saklama Talimatları:</strong></h3><ul><li><p><strong>Oda Sıcaklığı:</strong> Olgunlaşmamış domatesleri olgunlaşması için oda sıcaklığında bekletin.</p></li><li><p><strong>Buzdolabında:</strong> Olgun domatesleri tazeliği uzatmak için buzdolabında saklayın (en iyi tat için birkaç gün içinde tüketin).</p></li><li><p><strong>Doğrudan Güneşten Kaçının:</strong> Aşırı olgunlaşmayı ve doku kaybını önler.</p></li></ul><hr><p><strong>Mevcut Seçenekler:</strong></p><ul><li><p><strong>Tekli</strong> (Küçük haneler için ideal)</p></li><li><p><strong>Toplu Paketler</strong> (Restoranlar, yemek hazırlayanlar ve kalabalık aileler için harika)</p></li></ul><p><strong>Mevsimsellik:</strong> Yıl boyu bulunur, en yoğun lezzet yaz aylarındadır.</p><hr><p><strong>Neden Taze Domateslerimizi Seçmelisiniz?</strong><br>Kaliteyi, sürdürülebilirliği ve lezzeti önceliklendiriyoruz; böylece her domates sofranıza çiftlik tazeliğini getirir. İster ev aşçısı, ister şef, ister sağlık meraklısı olun; Taze Domateslerimiz canlı ve lezzetli öğünler için mükemmel bir malzemedir.</p><hr><p><strong>Taze Domatesin doğal iyiliğinin tadını çıkarın—lezzetin besinle buluştuğu yer!</strong> 🍅✨</p>', NULL, NULL),
(13642, 237, 'App\\Models\\Product', 'tr', 'meta_title', 'Taze domates', NULL, NULL),
(13643, 237, 'App\\Models\\Product', 'tr', 'meta_description', 'Taze domates', NULL, NULL),
(13644, 237, 'App\\Models\\Product', 'tr', 'meta_keywords', 'domates, sebze, taze, sağlıklı', NULL, NULL),

(13656, 11, 'App\\Models\\Menu', 'tr', 'name', 'Ana Menü', NULL, NULL),

(13690, 3, 'App\\Models\\Product', 'tr', 'name', 'Mangolar', NULL, NULL),

(13695, 1, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Günlük İhtiyaçlar', NULL, NULL),
(13696, 1, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Günlük İhtiyaçlar', NULL, NULL),

(13764, 2, 'App\\Models\\Slider', 'tr', 'title', 'Her Gün Taptaze Pişer', NULL, NULL),
(13765, 2, 'App\\Models\\Slider', 'tr', 'sub_title', 'Sıcak ve Lezzetli Atıştırmalıkların Keyfini Çıkarın', NULL, NULL),
(13766, 2, 'App\\Models\\Slider', 'tr', 'description', 'Taptaze pişmiş ekmekleri, kekleri ve hamur işlerini tadın.', NULL, NULL),
(13767, 2, 'App\\Models\\Slider', 'tr', 'button_text', 'Hemen Al', NULL, NULL),
(13772, 3, 'App\\Models\\Slider', 'tr', 'title', 'Sağlığınız Önceliğimiz', NULL, NULL),
(13773, 3, 'App\\Models\\Slider', 'tr', 'sub_title', 'Güvenilir İlaçlar Elinizin Altında', NULL, NULL),
(13774, 3, 'App\\Models\\Slider', 'tr', 'description', 'Reçeteli ve reçetesiz ilaçlara güvenle ulaşın.', NULL, NULL),
(13775, 3, 'App\\Models\\Slider', 'tr', 'button_text', 'Satın Al', NULL, NULL),
(13780, 4, 'App\\Models\\Slider', 'tr', 'title', 'Güzellik Burada Başlar', NULL, NULL),
(13781, 4, 'App\\Models\\Slider', 'tr', 'sub_title', 'Premium Kozmetiklerle Işıldayın', NULL, NULL),
(13782, 4, 'App\\Models\\Slider', 'tr', 'description', 'Makyaj ve cilt bakımı için en iyi markaları keşfedin.', NULL, NULL),
(13783, 4, 'App\\Models\\Slider', 'tr', 'button_text', 'Şimdi Keşfet', NULL, NULL),
(13788, 5, 'App\\Models\\Slider', 'tr', 'title', 'Şık ve Kullanışlı Çantalar', NULL, NULL),
(13789, 5, 'App\\Models\\Slider', 'tr', 'sub_title', 'Tarzınızı Her Yere Taşıyın', NULL, NULL),
(13790, 5, 'App\\Models\\Slider', 'tr', 'description', 'Trend el çantaları, sırt çantaları ve daha fazlasını keşfedin.', NULL, NULL),
(13791, 5, 'App\\Models\\Slider', 'tr', 'button_text', 'Şimdi Göz At', NULL, NULL),
(13796, 7, 'App\\Models\\Slider', 'tr', 'title', 'Konfor ve Tarz Bir Arada', NULL, NULL),
(13797, 7, 'App\\Models\\Slider', 'tr', 'sub_title', 'Her Alan İçin Premium Mobilyalar', NULL, NULL),
(13798, 7, 'App\\Models\\Slider', 'tr', 'description', 'Ev ve ofis için şık mobilyaları bulun.', NULL, NULL),
(13799, 7, 'App\\Models\\Slider', 'tr', 'button_text', 'Şimdi Keşfet', NULL, NULL),
(13804, 8, 'App\\Models\\Slider', 'tr', 'title', 'Bilginin Dünyasını Keşfedin', NULL, NULL),
(13805, 8, 'App\\Models\\Slider', 'tr', 'sub_title', 'Bir Sonraki Favori Okumanızı Bulun', NULL, NULL),
(13806, 8, 'App\\Models\\Slider', 'tr', 'description', 'Her ilgi alanına uygun geniş bir kitap koleksiyonunu keşfedin.', NULL, NULL),
(13807, 8, 'App\\Models\\Slider', 'tr', 'button_text', 'Hemen Oku', NULL, NULL),
(13812, 9, 'App\\Models\\Slider', 'tr', 'title', 'Akıllı ve Yenilikçi Teknoloji', NULL, NULL),
(13813, 9, 'App\\Models\\Slider', 'tr', 'sub_title', 'En Yeni Cihazlarla Yaşam Tarzınızı Yükseltin', NULL, NULL),
(13814, 9, 'App\\Models\\Slider', 'tr', 'description', 'Kaliteli akıllı telefonlar, aksesuarlar ve daha fazlasını satın alın.', NULL, NULL),
(13815, 9, 'App\\Models\\Slider', 'tr', 'button_text', 'Şimdi Satın Al', NULL, NULL),
(13820, 10, 'App\\Models\\Slider', 'tr', 'title', 'Tüylü Dostlarınıza Sevgiyle Bakın', NULL, NULL),
(13821, 10, 'App\\Models\\Slider', 'tr', 'sub_title', 'Evcil Hayvanınızın İhtiyaç Duyduğu Her Şey', NULL, NULL),
(13822, 10, 'App\\Models\\Slider', 'tr', 'description', 'Evcil hayvanlar için mama, oyuncak ve aksesuarları bulun.', NULL, NULL),
(13823, 10, 'App\\Models\\Slider', 'tr', 'button_text', 'Şimdi Satın Al', NULL, NULL),
(13828, 11, 'App\\Models\\Slider', 'tr', 'title', 'Taze ve Sağlıklı Deniz Ürünleri', NULL, NULL),
(13829, 11, 'App\\Models\\Slider', 'tr', 'sub_title', 'Okyanustan Sofranıza', NULL, NULL),
(13830, 11, 'App\\Models\\Slider', 'tr', 'description', 'En taze balık ve deniz ürünlerini kapınıza kadar getirin.', NULL, NULL),
(13831, 11, 'App\\Models\\Slider', 'tr', 'button_text', 'Şimdi Sipariş Ver', NULL, NULL),

(13839, 11, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Taze Fırın Ürünleri', NULL, NULL),
(13840, 11, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Taze Fırın Ürünleri', NULL, NULL),
(13841, 11, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Taze Fırın Ürünleri', NULL, NULL),

(13848, 20, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Eczane İhtiyaçları', NULL, NULL),
(13849, 20, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Eczane İhtiyaçları', NULL, NULL),
(13850, 20, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Eczane İhtiyaçları', NULL, NULL),

(13854, 29, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Güzellik ve Kozmetik', NULL, NULL),
(13855, 29, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Güzellik ve Kozmetik', NULL, NULL),
(13856, 29, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Güzellik ve Kozmetik', NULL, NULL),
(13857, 29, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Güzellik ve Kozmetik', NULL, NULL),
(13858, 29, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Güzellik ve Kozmetik', NULL, NULL),
(13859, 29, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Güzellik ve Kozmetik', NULL, NULL),

(13863, 35, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Çanta Koleksiyonları', NULL, NULL),
(13864, 35, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Çanta Koleksiyonları', NULL, NULL),
(13865, 35, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Çanta Koleksiyonları', NULL, NULL),
(13866, 35, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Çanta Koleksiyonları', NULL, NULL),
(13867, 35, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Çanta Koleksiyonları', NULL, NULL),
(13868, 35, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Çanta Koleksiyonları', NULL, NULL),

(13872, 42, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Giyim ve Stil', NULL, NULL),
(13873, 42, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Giyim ve Stil', NULL, NULL),
(13874, 42, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Giyim ve Stil', NULL, NULL),
(13875, 42, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Giyim ve Stil', NULL, NULL),
(13876, 42, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Giyim ve Stil', NULL, NULL),
(13877, 42, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Giyim ve Stil', NULL, NULL),

(13881, 45, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Mobilya ve Dekorasyon', NULL, NULL),
(13882, 45, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Mobilya ve Dekorasyon', NULL, NULL),
(13883, 45, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Mobilya ve Dekorasyon', NULL, NULL),
(13884, 45, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Mobilya ve Dekorasyon', NULL, NULL),
(13885, 45, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Mobilya ve Dekorasyon', NULL, NULL),
(13886, 45, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Mobilya ve Dekorasyon', NULL, NULL),

(13893, 53, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Kitap Koleksiyonu', NULL, NULL),
(13894, 53, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Kitap Koleksiyonu', NULL, NULL),
(13895, 53, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Kitap Koleksiyonu', NULL, NULL),

(13899, 59, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Teknoloji ve Cihazlar', NULL, NULL),
(13900, 59, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Teknoloji ve Cihazlar', NULL, NULL),
(13901, 59, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Teknoloji ve Cihazlar', NULL, NULL),
(13902, 59, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Teknoloji ve Cihazlar', NULL, NULL),
(13903, 59, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Teknoloji ve Cihazlar', NULL, NULL),
(13904, 59, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Teknoloji ve Cihazlar', NULL, NULL),

(13911, 66, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Evcil Hayvan ve Hayvan Ürünleri', NULL, NULL),
(13912, 66, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Evcil Hayvan ve Hayvan Ürünleri', NULL, NULL),
(13913, 66, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Evcil Hayvan ve Hayvan Ürünleri', NULL, NULL),


(13944, 6, 'App\\Models\\Slider', 'tr', 'title', 'Her Durum İçin Moda', NULL, NULL),
(13945, 6, 'App\\Models\\Slider', 'tr', 'sub_title', 'Gardırobunuzu Bugün Yenileyin', NULL, NULL),
(13946, 6, 'App\\Models\\Slider', 'tr', 'description', 'Tüm mevsimler için şık kombinleri keşfedin.', NULL, NULL),
(13947, 6, 'App\\Models\\Slider', 'tr', 'button_text', 'Şimdi Satın Al', NULL, NULL),

(13956, 46, 'App\\Models\\ProductAttribute', 'tr', 'name', 'Balık Rengi', NULL, NULL),
(13959, 52, 'App\\Models\\ProductAttribute', 'tr', 'name', 'Renk', NULL, NULL),

(13979, 14, 'App\\Models\\Department', 'tr', 'name', 'Müşteri Destek', NULL, NULL),
(13985, 10, 'App\\Models\\Department', 'tr', 'name', 'Teknik Destek / IT', NULL, NULL),

(13989, 2, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Meyveler', NULL, NULL),
(13990, 2, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Meyveler', NULL, NULL),
(13991, 2, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Meyveler', NULL, NULL),
(13992, 3, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Süt Ürünleri', NULL, NULL),
(13993, 3, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Süt Ürünleri', NULL, NULL),
(13994, 3, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Süt Ürünleri', NULL, NULL),
(13995, 4, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'İçecekler', NULL, NULL),

(14001, 2, 'Modules\\Subscription\\app\\Models\\Subscription', 'tr', 'name', 'Deneme Paketi', NULL, NULL),
(14002, 2, 'Modules\\Subscription\\app\\Models\\Subscription', 'tr', 'description', 'Ücretsiz Paket', NULL, NULL),
(14005, 3, 'Modules\\Subscription\\app\\Models\\Subscription', 'tr', 'name', 'Temel Paket', NULL, NULL),
(14006, 3, 'Modules\\Subscription\\app\\Models\\Subscription', 'tr', 'description', 'Temel Paket', NULL, NULL),

(4015, 6, 'App\\Models\\StoreType', 'tr', 'name', 'Giyim', NULL, NULL),
(14017, 7, 'App\\Models\\StoreType', 'tr', 'name', 'Mobilya', NULL, NULL),
(14019, 8, 'App\\Models\\StoreType', 'tr', 'name', 'Kitaplar', NULL, NULL),
(14021, 9, 'App\\Models\\StoreType', 'tr', 'name', 'Elektronik Cihazlar', NULL, NULL),
(14023, 10, 'App\\Models\\StoreType', 'tr', 'name', 'Hayvanlar ve Evcil Hayvanlar', NULL, NULL),
(14025, 11, 'App\\Models\\StoreType', 'tr', 'name', 'Balık', NULL, NULL),

(14961, 12, 'App\\Models\\Slider', 'tr', 'title', 'Taze ve Organik Market Ürünleri', NULL, NULL),
(14962, 12, 'App\\Models\\Slider', 'tr', 'sub_title', 'Günlük İhtiyaçlarınız Kapınıza Gelsin', NULL, NULL),
(14963, 12, 'App\\Models\\Slider', 'tr', 'description', 'Dalından taze ürünleri satın alın', NULL, NULL),
(14964, 12, 'App\\Models\\Slider', 'tr', 'button_text', 'Şimdi Satın Al', NULL, NULL),

(14987, 72, 'App\\Models\\ProductCategory', 'tr', 'category_name', 'Taze Balık', NULL, NULL),
(14988, 72, 'App\\Models\\ProductCategory', 'tr', 'meta_title', 'Taze Balık', NULL, NULL),
(14989, 72, 'App\\Models\\ProductCategory', 'tr', 'meta_description', 'Taze Balık', NULL, NULL),

(15268, 3, 'App\\Models\\VehicleType', 'tr', 'name', 'Kamyon', NULL, NULL)
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);


