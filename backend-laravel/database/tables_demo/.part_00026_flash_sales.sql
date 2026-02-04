-- Table structure for table `flash_sales`
--

CREATE TABLE `flash_sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `title_color` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_color` varchar(255) DEFAULT NULL,
  `background_color` varchar(255) DEFAULT NULL,
  `button_text` varchar(255) DEFAULT NULL,
  `button_text_color` varchar(255) DEFAULT NULL,
  `button_hover_color` varchar(255) DEFAULT NULL,
  `button_bg_color` varchar(255) DEFAULT NULL,
  `button_url` varchar(255) DEFAULT NULL,
  `timer_bg_color` varchar(255) DEFAULT NULL,
  `timer_text_color` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `discount_type` varchar(255) DEFAULT NULL COMMENT 'percentage or amount',
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `special_price` decimal(10,2) DEFAULT NULL COMMENT 'special price for product',
  `purchase_limit` int(10) UNSIGNED DEFAULT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1: active, 0: inactive',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `flash_sales`
--

INSERT INTO `flash_sales` (`id`, `title`, `title_color`, `description`, `description_color`, `background_color`, `button_text`, `button_text_color`, `button_hover_color`, `button_bg_color`, `button_url`, `timer_bg_color`, `timer_text_color`, `image`, `cover_image`, `discount_type`, `discount_amount`, `special_price`, `purchase_limit`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
(4, 'Moda Çılgınlığı', '#000000', 'Gardırobunuzu en yeni moda trendleriyle, kaçırılmayacak fiyatlarla yenileyin!', '#212121', '#ffffff', 'Hemen Alışveriş Yap', '#ffffff', '#4D4D4D', '#000000', NULL, '#dd4a31', '#ffffff', '1308', NULL, 'percentage', 20.00, NULL, 527, '2025-03-23 19:28:00', '2026-01-14 09:45:00', 1, '2025-03-12 23:45:01', '2025-09-28 01:33:42'),
(5, 'Günlük İhtiyaçlarınız', '#000000', 'Tüm şubelerimiz artık hizmetinizde.', '#212121', '#ffffff', 'Hemen Alışveriş Yap', '#ffffff', '#4D4D4D', '#000000', 'https://example.com', '#dd4a31', '#ffffff', '1308', NULL, 'percentage', 10.00, NULL, 128, '2025-03-24 14:01:00', '2026-01-12 04:00:00', 1, '2025-03-13 02:44:32', '2025-09-28 01:33:37'),
(6, 'Zarif', '#000000', 'Evinizi göz alıcı mobilya ve dekorasyon ürünleriyle yenileyin!', '#323232', '#ffffff', 'Hemen Alışveriş Yap', '#ffff', '#4D4D4D', '#000000', NULL, '#dd4a31', '#ffffff', '1308', NULL, 'percentage', 10.00, 0.00, 986, '2025-03-17 21:57:00', '2026-02-27 17:03:00', 1, '2025-03-16 00:02:04', '2025-09-28 01:33:31'),
(7, 'Teknoloji Ürünleri', '#000000', 'En yeni cihazlarla teknoloji deneyiminizi yükseltin; büyük indirimleri kaçırmayın!', '#212121', '#ffffff', 'Hemen Alışveriş Yap', '#ffffff', '#4D4D4D', '#000000', NULL, '#dd4a31', '#ffffff', '1308', '725', 'percentage', 15.00, 0.00, 894, '2025-03-23 18:07:00', '2026-05-02 06:09:00', 1, '2025-03-16 00:05:51', '2025-09-28 01:32:22');

-- --------------------------------------------------------
