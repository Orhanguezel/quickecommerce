/*

-- .part_00003_blog_categories.sql
-- Table structure for table `blog_categories`
--


CREATE TABLE `blog_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `meta_title` text DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '0 = Inactive, 1 = Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/
--
-- Dumping data for table `blog_categories` (TR)
--

INSERT INTO `blog_categories`
(`id`, `name`, `slug`, `meta_title`, `meta_description`, `status`, `created_at`, `updated_at`) VALUES
(2, 'Sağlık ve İyi Yaşam', 'technology', 'Sağlık ve İyi Yaşam', 'Sağlık ve iyi yaşam üzerine içerikler', 1, '2025-03-11 01:01:14', '2025-09-23 23:18:11'),
(3, 'Moda', 'health-wellness', 'Moda', 'Moda ve stil içerikleri', 0, '2025-03-11 01:01:32', '2025-09-25 04:28:55'),
(4, 'Market & Gıda İçgörüleri', 'business-finance', 'Market & Gıda İçgörüleri', 'Market alışverişi ve gıda üzerine içerikler', 1, '2025-03-11 01:01:50', '2025-03-19 22:14:21'),
(5, 'Güzellik & Makyaj Trendleri', 'beauty-makeup-trends', 'Güzellik & Makyaj Trendleri', 'Güzellik ve makyaj dünyasındaki trendler', 1, '2025-03-19 22:15:24', '2025-03-19 22:15:24'),
(6, 'Moda & Stil', 'fashion-style', 'Moda & Stil', 'Güncel moda ve stil içerikleri', 1, '2025-03-19 22:15:45', '2025-09-23 23:17:14'),
(7, 'Ev & Yaşam', 'home-living', 'Ev & Yaşam', 'Ev yaşamı ve dekorasyon önerileri', 1, '2025-03-19 22:16:07', '2025-09-24 23:35:43'),
(8, 'Evcil Hayvan Bakımı & Sağlık', 'pet-care-wellness', 'Evcil Hayvan Bakımı & Sağlık', 'Evcil hayvanların bakımı ve sağlığına dair içerikler', 1, '2025-03-19 22:16:23', '2025-09-25 04:27:15')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `slug`=VALUES(`slug`), `meta_title`=VALUES(`meta_title`), `meta_description`=VALUES(`meta_description`), `status`=VALUES(`status`), `created_at`=VALUES(`created_at`), `updated_at`=VALUES(`updated_at`);

-- --------------------------------------------------------
