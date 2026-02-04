-- =========================================================
-- Banner TR Translations
-- SAFE SEED (DELETE + INSERT)
-- =========================================================

START TRANSACTION;

DELETE FROM translations
WHERE language = 'tr'
  AND translatable_type = 'App\\Models\\Banner';

INSERT INTO translations
(translatable_id, translatable_type, language, `key`, `value`, created_at, updated_at)
VALUES
-- Banner #4
(4, 'App\\Models\\Banner', 'tr', 'title', 'Günlük İhtiyaçlarınız, Her Zaman Taze', NOW(), NOW()),
(4, 'App\\Models\\Banner', 'tr', 'description', 'Güvenilir yerel satıcılardan yüksek kaliteli ürünler hızlıca kapınıza gelsin.', NOW(), NOW()),
(4, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Alışveriş Yap', NOW(), NOW()),

-- Banner #7
(7, 'App\\Models\\Banner', 'tr', 'title', 'Her Sezon Şıklığı Yeniden Tanımlayın', NOW(), NOW()),
(7, 'App\\Models\\Banner', 'tr', 'description', '%50’ye Varan Moda İndirimleri', NOW(), NOW()),
(7, 'App\\Models\\Banner', 'tr', 'button_text', 'Satın Al', NOW(), NOW()),

-- Banner #10
(10, 'App\\Models\\Banner', 'tr', 'title', 'Alışveriş Tutkunları İçin Buradayız', NOW(), NOW()),
(10, 'App\\Models\\Banner', 'tr', 'description', 'Ekstra %50 İndirim Fırsatını Kaçırmayın', NOW(), NOW()),
(10, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Al', NOW(), NOW()),

-- Banner #13
(13, 'App\\Models\\Banner', 'tr', 'title', 'Sağlık Desteği Artık Çok Kolay', NOW(), NOW()),
(13, 'App\\Models\\Banner', 'tr', 'description', 'Güvenli ve sertifikalı ilaçlar, hızlı teslimatla kapınızda.', NOW(), NOW()),
(13, 'App\\Models\\Banner', 'tr', 'button_text', 'Şimdi İncele', NOW(), NOW()),

-- Banner #14
(14, 'App\\Models\\Banner', 'tr', 'title', 'Trend Görünüm, Günlük Konfor', NOW(), NOW()),
(14, 'App\\Models\\Banner', 'tr', 'description', 'Günlük konfor ve özgüven için tasarlanmış geniş koleksiyonu keşfedin.', NOW(), NOW()),
(14, 'App\\Models\\Banner', 'tr', 'button_text', 'Alışveriş Yap', NOW(), NOW()),

-- Banner #15
(15, 'App\\Models\\Banner', 'tr', 'title', 'Online Mağazanızı Bugün Açın', NOW(), NOW()),
(15, 'App\\Models\\Banner', 'tr', 'description', 'Teknik bilgiye gerek yok. Ürünleriniz, markanız ve platformumuz yeterli.', NOW(), NOW()),
(15, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Başla', NOW(), NOW()),

-- Banner #17
(17, 'App\\Models\\Banner', 'tr', 'title', 'Her Sezon Şıklık', NOW(), NOW()),
(17, 'App\\Models\\Banner', 'tr', 'description', '%50’ye Varan Sezon Sonu İndirimleri', NOW(), NOW()),
(17, 'App\\Models\\Banner', 'tr', 'button_text', 'Şimdi Al', NOW(), NOW()),

-- Banner #18
(18, 'App\\Models\\Banner', 'tr', 'title', 'Güzellik Kendini Gösterir', NOW(), NOW()),
(18, 'App\\Models\\Banner', 'tr', 'description', 'Cesur renkler ve kusursuz dokunuşlar', NOW(), NOW()),
(18, 'App\\Models\\Banner', 'tr', 'button_text', 'Keşfet', NOW(), NOW()),

-- Banner #19
(19, 'App\\Models\\Banner', 'tr', 'title', 'Sezon Sonu İndirimi', NOW(), NOW()),
(19, 'App\\Models\\Banner', 'tr', 'description', 'Sınırlı süreli fırsatlar — kaçırmayın', NOW(), NOW()),
(19, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Al', NOW(), NOW()),

-- Banner #20
(20, 'App\\Models\\Banner', 'tr', 'title', 'Günlük Lüks', NOW(), NOW()),
(20, 'App\\Models\\Banner', 'tr', 'description', 'Premium stil ve özel fırsatlar sizi bekliyor', NOW(), NOW()),
(20, 'App\\Models\\Banner', 'tr', 'button_text', 'Şimdi Al', NOW(), NOW()),

-- Banner #21
(21, 'App\\Models\\Banner', 'tr', 'title', 'Zarafet Yeniden Tanımlandı', NOW(), NOW()),
(21, 'App\\Models\\Banner', 'tr', 'description', 'Kadın elbiselerinde %40’a varan indirimler', NOW(), NOW()),
(21, 'App\\Models\\Banner', 'tr', 'button_text', 'Alışveriş Yap', NOW(), NOW()),

-- Banner #22
(22, 'App\\Models\\Banner', 'tr', 'title', 'Tarzını Yanında Taşı', NOW(), NOW()),
(22, 'App\\Models\\Banner', 'tr', 'description', 'Günlük ve tasarım çantalarda büyük fırsatlar', NOW(), NOW()),
(22, 'App\\Models\\Banner', 'tr', 'button_text', 'Şimdi İncele', NOW(), NOW()),

-- Banner #23
(23, 'App\\Models\\Banner', 'tr', 'title', 'Sezona Uygun Giyin', NOW(), NOW()),
(23, 'App\\Models\\Banner', 'tr', 'description', '%45’e varan şık kombin fırsatları', NOW(), NOW()),
(23, 'App\\Models\\Banner', 'tr', 'button_text', 'Hemen Al', NOW(), NOW());

COMMIT;
