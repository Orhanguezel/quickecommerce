-- Table structure for table `store_types`
--

CREATE TABLE `store_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `total_stores` bigint(20) NOT NULL DEFAULT 0,
  `additional_charge_enable_disable` tinyint(1) NOT NULL DEFAULT 0,
  `additional_charge_name` varchar(255) DEFAULT NULL,
  `additional_charge_amount` decimal(8,2) DEFAULT NULL,
  `additional_charge_type` enum('fixed','percentage') DEFAULT NULL,
  `additional_charge_commission` decimal(8,2) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=Inactive, 1=Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_types`
--

INSERT INTO `store_types` (
  `id`, `name`, `type`, `image`, `description`,
  `total_stores`,
  `additional_charge_enable_disable`, `additional_charge_name`,
  `additional_charge_amount`, `additional_charge_type`, `additional_charge_commission`,
  `status`, `created_at`, `updated_at`
) VALUES
(1,  'Market',          'grocery',      '1297', 'Günlük market alışverişi: taze gıda, temel ihtiyaçlar ve hızlı teslimat.', 1, 1, 'Paketleme Ücreti',        10.00, 'percentage',  5.00, 1, NULL, '2025-09-28 03:27:06'),
(2,  'Fırın & Pastane',  'bakery',       '1297', 'Günlük taze ekmek, pasta, börek ve fırın ürünleri.',                      1, 0, 'Paketleme Ücreti',        10.00, 'percentage',  5.00, 1, NULL, '2025-09-23 04:37:58'),
(3,  'Eczane',           'medicine',     '1297', 'Reçeteli / reçetesiz ürünler ve sağlık ihtiyaçları için güvenilir alışveriş.', 1, 1, 'Güvenli Teslim Ücreti',  10.00, 'fixed',       2.00, 1, NULL, '2025-09-23 01:05:57'),
(4,  'Kozmetik',         'makeup',       '1297', 'Makyaj, cilt bakımı ve kişisel bakım ürünleri.',                         1, 1, 'Paketleme Ücreti',        12.00, 'percentage', 10.00, 1, NULL, '2025-09-23 01:05:48'),
(5,  'Çanta',            'bags',         '1297', 'El çantası, sırt çantası, valiz ve aksesuarlar.',                        1, 1, 'Paketleme Ücreti',        10.00, 'percentage', 15.00, 1, NULL, '2025-09-23 01:05:46'),
(6,  'Giyim',            'clothing',     '1297', 'Kadın, erkek, çocuk giyim ve sezon ürünleri.',                           1, 0, 'Paketleme Ücreti',        10.00, 'percentage', 12.00, 1, NULL, '2025-09-23 01:05:57'),
(7,  'Mobilya',          'furniture',    '1297', 'Ev ve ofis mobilyaları, dekorasyon ve yaşam ürünleri.',                  1, 0, 'Paketleme Ücreti',        10.00, 'percentage', 10.00, 1, NULL, '2025-09-23 01:05:49'),
(8,  'Kitap',            'books',        '1297', 'Roman, eğitim, çocuk kitapları ve diğer yayınlar.',                      1, 1, 'Paketleme Ücreti',         5.00, 'fixed',       5.00, 1, NULL, '2025-09-23 01:05:48'),
(9,  'Teknoloji',        'gadgets',      '1297', 'Telefon, aksesuar, elektronik ürünler ve teknoloji ekipmanları.',       1, 1, 'Paketleme Ücreti',        10.00, 'percentage', 10.00, 1, NULL, '2025-09-23 01:05:46'),
(10, 'Evcil Hayvan',     'animals-pet',  '1297', 'Evcil hayvan maması, oyuncak, aksesuar ve bakım ürünleri.',              1, 1, 'Özel Paketleme Ücreti',  20.00, 'fixed',      30.00, 1, NULL, '2025-09-23 04:38:45'),
(11, 'Balık & Deniz',    'fish',         '1297', 'Taze balık, deniz ürünleri ve soğuk zincirle teslim edilebilen ürünler.', 1, 0, 'Soğuk Zincir Ücreti',     10.00, 'percentage', 10.00, 1, NULL, '2025-10-05 22:28:19');

-- --------------------------------------------------------

--
