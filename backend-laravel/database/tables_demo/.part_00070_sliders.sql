-- Table structure for table `sliders`
--

CREATE TABLE `sliders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `platform` enum('web','mobile') NOT NULL DEFAULT 'web',
  `title` varchar(255) NOT NULL,
  `title_color` varchar(255) DEFAULT NULL,
  `sub_title` varchar(255) DEFAULT NULL,
  `sub_title_color` varchar(255) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `description_color` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `bg_image` varchar(255) DEFAULT NULL,
  `bg_color` varchar(255) DEFAULT NULL,
  `button_text` varchar(255) DEFAULT NULL,
  `button_text_color` varchar(255) DEFAULT NULL,
  `button_bg_color` varchar(255) DEFAULT NULL,
  `button_hover_color` varchar(255) DEFAULT NULL,
  `button_url` varchar(255) DEFAULT NULL,
  `redirect_url` varchar(255) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0 - Inactive, 1 - Active',
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sliders`
--

INSERT INTO `sliders` (`id`, `platform`, `title`, `title_color`, `sub_title`, `sub_title_color`, `description`, `description_color`, `image`, `bg_image`, `bg_color`, `button_text`, `button_text_color`, `button_bg_color`, `button_hover_color`, `button_url`, `redirect_url`, `order`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'web', 'Taze ve Organik Market Ürünleri', '#3bb77e', 'Günlük İhtiyaçlarınız Kapınıza Gelsin', '#5d5d5d', 'Çiftlikten taze ürünler ve temel gıda seçeneklerini kolayca satın alın.', '#5d5d5d', '1305', '1307', '#FFF8DC', 'Hemen Alışveriş Yap', '#ffff', '#3bb77e', '#038f4e', NULL, NULL, 1, 1, '8', '8', '2025-03-10 21:46:23', '2025-09-28 01:16:27'),
(2, 'web', 'Her Gün Taptaze Fırından', '#8d5c42', 'Sıcak ve Lezzetli Atıştırmalıklar', '#4d483e', 'Günlük taze ekmek, kek ve pastaların tadını çıkarın.', '#8d5c42', '1306', '1307', '#FAEBD7', 'Hemen Al', '#ffff', '#8d5c42', '#833105', NULL, NULL, 2, 1, '8', '8', '2025-03-10 21:46:48', '2025-09-28 01:16:29'),
(3, 'web', 'Sağlığınız Önceliğimiz', '#434343', 'Güvenilir İlaçlar Elinizin Altında', '#4a8543', 'Reçeteli ve reçetesiz ürünleri güvenle temin edin.', '#4e4f51', '1302', '1307', '#F0F8FF', 'Hemen Satın Al', '#ffff', '#4b8544', '#034403', NULL, NULL, 3, 1, '8', '8', '2025-03-10 21:47:18', '2025-09-28 01:16:38'),
(4, 'web', 'Güzellik Burada Başlar', '#e26980', 'Premium Kozmetiklerle Işıldayın', '#4e4f51', 'Makyaj ve cilt bakımında önde gelen markaları keşfedin.', '#4a2d36', '1295', '1307', '#FFF0F5', 'Keşfet', '#ffffff', '#e26980', '#da2748', NULL, NULL, 4, 1, '8', '8', '2025-03-11 04:12:41', '2025-09-28 01:16:43'),
(5, 'web', 'Şık ve Kullanışlı Çantalar', '#353436', 'Stilinizi Her Yere Taşıyın', '#b77364', 'Trend el çantaları, sırt çantaları ve daha fazlasını keşfedin.', '#353436', '1308', '1307', '#F5F5DC', 'Göz At', '#ffff', '#9d665a', '#733c2f', NULL, NULL, 5, 1, '8', '8', '2025-03-11 04:14:13', '2025-09-28 01:16:53'),
(6, 'web', 'Her Ortama Uygun Moda', '#c47c09', 'Dolabınızı Bugün Yenileyin', '#898989', 'Her mevsime uygun şık kombinleri keşfedin.', '#575757', '1309', '1307', '#F0FFFF', 'Hemen Alışveriş Yap', '#ffff', '#c47c09', '#a2680b', NULL, NULL, 6, 1, '8', '8', '2025-03-11 04:15:58', '2025-09-28 01:16:59'),
(7, 'web', 'Konfor ve Şıklık Bir Arada', '#ac9b6e', 'Her Mekâna Uygun Premium Mobilya', '#909090', 'Ev ve ofis için zarif mobilyaları keşfedin.', '#808080', '1305', '1307', '#F5F5DC', 'Hemen Keşfet', '#ffff', '#918154', '#7b6833', NULL, NULL, 7, 1, '8', '8', '2025-03-11 04:17:26', '2025-09-28 01:17:04'),
(8, 'web', 'Bilgi Dünyasının Kapılarını Açın', '#3f4551', 'Bir Sonraki Favori Kitabınızı Bulun', '#469303', 'Her ilgi alanına uygun geniş kitap koleksiyonunu keşfedin.', '#469303', '1306', '1307', '#FFF5EE', 'Hemen Oku', '#ffff', '#60b417', '#458111', NULL, NULL, 8, 1, '8', '8', '2025-03-11 04:18:48', '2025-09-28 01:17:11'),
(9, 'web', 'Akıllı ve Yenilikçi Teknoloji', '#0036b4', 'En Yeni Cihazlarla Hayatınızı Yükseltin', '#648dee', 'Kaliteli akıllı telefonlar, aksesuarlar ve daha fazlasını satın alın.', '#2c5bc9', '1308', '1307', '#6f9aff', 'Hemen Alışveriş Yap', '#ffff', '#345ec1', '#0036b4', NULL, NULL, 9, 1, '8', '8', '2025-03-11 04:19:59', '2025-09-28 01:17:20'),
(10, 'web', 'Patili Dostlarınız İçin', '#f26f29', 'Evcil Hayvanınızın İhtiyacı Olan Her Şey', '#4d483e', 'Mama, oyuncak ve evcil hayvan aksesuarlarını keşfedin.', '#3f4551', '1302', '1307', '#FFF8DC', 'Hemen Alışveriş Yap', '#ffff', '#f26f29', '#dd6e32', NULL, NULL, 10, 1, '8', '8', '2025-03-11 04:22:23', '2025-09-28 01:17:26'),
(11, 'web', 'Taze ve Sağlıklı Deniz Ürünleri', '#f6808c', 'Okyanustan Sofranıza', '#f9a4ad', 'En taze balık ve deniz ürünleri kapınıza gelsin.', '#ca858c', '1295', '1307', '#E0F7FA', 'Hemen Sipariş Ver', '#ffff', '#eb6876', '#db3d4d', NULL, NULL, 11, 1, '8', '8', '2025-03-11 04:24:22', '2025-09-28 01:17:31'),
(12, 'mobile', 'Taze ve Organik Market Ürünleri', '#3bb77e', 'Günlük İhtiyaçlarınız Kapınıza Gelsin', '#5d5d5d', 'Çiftlikten taze ürünleri satın alın', '#5d5d5d', '1305', '1307', '#FFF8DC', 'Hemen Alışveriş Yap', '#ffff', '#3bb77e', '#038f4e', NULL, NULL, 101, 1, '8', '8', '2025-05-27 10:37:04', '2025-09-28 01:29:36'),
(14, 'mobile', 'Taptaze Fırından', '#8d5c42', 'Sıcak ve Lezzetli Atıştırmalıklar', '#4d483e', 'Günlük taze ekmek, kek ve pastaların tadını çıkarın.', '#8d5c42', '1306', '1307', '#FAEBD7', 'Hemen Al', '#ffff', '#8d5c42', '#833105', NULL, NULL, 102, 1, '8', '8', '2025-06-28 11:35:37', '2025-09-28 01:15:01');

-- --------------------------------------------------------

--
