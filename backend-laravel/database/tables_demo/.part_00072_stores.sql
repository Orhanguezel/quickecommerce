-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `store_seller_id` bigint(20) UNSIGNED DEFAULT NULL,
  `store_type` enum('grocery','bakery','medicine','makeup','bags','clothing','furniture','books','gadgets','animals-pet','fish') DEFAULT NULL,
  `tax` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_number` varchar(255) DEFAULT NULL,
  `subscription_type` varchar(50) DEFAULT NULL,
  `admin_commission_type` varchar(255) DEFAULT NULL,
  `admin_commission_amount` decimal(10,2) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `delivery_charge` decimal(10,2) DEFAULT NULL,
  `delivery_time` varchar(50) DEFAULT NULL,
  `delivery_self_system` tinyint(1) DEFAULT 0,
  `delivery_take_away` tinyint(1) DEFAULT 0,
  `order_minimum` int(11) DEFAULT 0,
  `veg_status` int(11) DEFAULT 0 COMMENT '0 = Non-Vegetarian, 1 = Vegetarian',
  `off_day` varchar(50) DEFAULT NULL,
  `enable_saling` int(11) DEFAULT 0 COMMENT '0 = Sales disabled, 1 = Sales enabled',
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_image` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT 0 COMMENT '0 = Pending, 1 = Active, 2 = Inactive',
  `online_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `area_id`, `store_seller_id`, `store_type`, `tax`, `tax_number`, `subscription_type`, `admin_commission_type`, `admin_commission_amount`, `name`, `slug`, `phone`, `email`, `logo`, `banner`, `address`, `latitude`, `longitude`, `is_featured`, `opening_time`, `closing_time`, `delivery_charge`, `delivery_time`, `delivery_self_system`, `delivery_take_away`, `order_minimum`, `veg_status`, `off_day`, `enable_saling`, `meta_title`, `meta_description`, `meta_image`, `status`, `online_at`, `created_by`, `updated_by`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'grocery', 5.00, 'VAT123457', 'subscription', 'percentage', 10.00, 'Taze Market', 'fresh-grocer', '1234567891', 'tazemarket@example.com', '1297', NULL, 'Yeşil Sokak No:456, Merkez', 23.7948895, 90.4051046, 1, '07:00:00', '21:00:00', 3.00, '30-45 dakika', 1, 1, 30, 1, 'Çarşamba', 1, 'Taze Market - Mahallenizin Güvenilir Marketi', 'Taze Market’te günlük taze ve doğal market ürünlerini avantajlı fiyatlarla keşfedin.', 'fresh_grocer_meta_image.png', 1, '2025-09-30 00:03:38', 1, 8, NULL, '2025-03-10 01:43:00', '2025-09-30 00:03:38'),
(2, 1, 1, 'bakery', 5.00, 'VAT123458', 'commission', 'percentage', 10.00, 'Tatlı Lezzetler Fırını', 'sweet-treats-bakery', '1234567892', 'tatlilezzetler@example.com', '1297', '592', 'Şeker Caddesi No:789, Merkez', 23.7948895, 90.4051046, 1, '06:00:00', '20:00:00', 4.00, '20-40 dakika', 1, 1, 20, 0, 'Pazartesi', 1, 'Tatlı Lezzetler Fırını - Günlük Taptaze Ürünler', 'Ekmek, pasta, börek ve tatlı çeşitlerini her gün taptaze şekilde Tatlı Lezzetler Fırını’nda bulun.', 'sweet_treats_meta_image.png', 1, '2025-07-15 22:21:05', 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(3, 1, 1, 'medicine', 5.00, 'VAT123459', 'commission', 'percentage', 10.00, 'Sağlık Önce Eczanesi', 'health-first-pharmacy', '1234567893', 'saglikonce@example.com', '1297', '596', 'Sağlık Bulvarı No:101, Merkez', 23.7948895, 90.4051046, 1, '09:00:00', '22:00:00', 5.00, '30-60 dakika', 1, 1, 50, 0, 'Pazar', 1, 'Sağlık Önce Eczanesi - Güvenilir İlaç ve Sağlık Ürünleri', 'Reçeteli/reçetesiz ürünler ve sağlık ihtiyaçlarınızı güvenle Sağlık Önce Eczanesi’nden temin edin.', 'health_first_meta_image.png', 1, NULL, 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(4, 1, 1, 'makeup', 5.00, 'VAT123460', 'commission', 'percentage', 10.00, 'Glamour Güzellik', 'glamour-beauty', '1234567894', 'glamourguzellik@example.com', '1297', '601', 'Güzellik Sokak No:202, Merkez', 23.7953490, 90.4029920, 1, '10:00:00', '20:00:00', 4.00, '30-45 dakika', 1, 1, 20, 0, 'Salı', 1, 'Glamour Güzellik - Seçkin Makyaj ve Bakım Ürünleri', 'Makyaj ve cilt bakımında önde gelen markaları Glamour Güzellik’te keşfedin.', 'glamour_beauty_meta_image.png', 1, NULL, 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(5, 1, 1, 'bags', 5.00, 'VAT123461', 'commission', 'percentage', 10.00, 'Çanta Dünyası', 'bag-world', '1234567895', 'cantadunyasi@example.com', '1297', '19', 'Moda Caddesi No:303, Merkez', 23.7953490, 90.4029920, 1, '10:00:00', '19:00:00', 4.00, '20-30 dakika', 1, 1, 30, 0, 'Pazartesi', 1, 'Çanta Dünyası - Şık ve Kullanışlı Çantalar', 'Günlük kullanım ve özel günler için şık çanta modellerini Çanta Dünyası’nda keşfedin.', 'bag_world_meta_image.png', 1, '2025-09-22 22:19:16', 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(6, 1, 1, 'clothing', 5.00, 'VAT123462', 'commission', 'percentage', 10.00, 'Trend Giyim', 'trendy-apparel', '1234567896', 'trendgiyim@example.com', '1297', NULL, 'Moda Bulvarı No:404, Merkez', 23.7950303, 90.4045412, 1, '09:00:00', '21:00:00', 5.00, '30-50 dakika', 1, 1, 40, 0, 'Perşembe', 1, 'Trend Giyim - Herkes İçin Moda', 'Kadın, erkek ve çocuk kategorilerinde sezonun trend parçalarını Trend Giyim’de keşfedin.', 'trendy_apparel_meta_image.png', 1, NULL, 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(7, 3, 1, 'furniture', 5.00, 'VAT123463', 'commission', 'percentage', 10.00, 'Konfor Yaşam Mobilya', 'comfort-living-furniture', '1234567897', 'konforyasam@example.com', '1297', '597', 'Ev Sokak No:505, Merkez', 40.6508170, -73.9404280, 1, '10:00:00', '20:00:00', 10.00, '1-2 saat', 1, 0, 100, 0, 'Pazar', 1, 'Konfor Yaşam Mobilya - Eviniz İçin Kaliteli Mobilyalar', 'Salon, yatak odası ve ofis için modern ve kullanışlı mobilyaları Konfor Yaşam Mobilya’da inceleyin.', 'comfort_living_meta_image.png', 1, NULL, 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(8, 2, 1, 'books', 5.00, 'VAT123464', 'commission', 'percentage', 10.00, 'Okur Dünyası', 'readers-paradise', '1234567898', 'okurdunyasi@example.com', '1297', '594', 'Bilgi Sokak No:606, Merkez', 23.7953490, 90.4029920, 1, '09:00:00', '18:00:00', 4.00, '30-60 dakika', 1, 1, 15, 0, 'Cumartesi', 1, 'Okur Dünyası - Kitap Tutkunlarının Adresi', 'Çok satanlardan klasiklere, her türden kitabı Okur Dünyası’nda keşfedin.', 'readers_paradise_meta_image.png', 1, NULL, 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(9, 1, 1, 'gadgets', 5.00, 'VAT123465', 'commission', 'percentage', 10.00, 'Teknoloji Merkezi', 'tech-haven', '1234567899', 'teknolojimerkezi@example.com', '1297', NULL, 'Gadget Bulvarı No:707, Merkez', 23.7953490, 90.4029920, 1, '10:00:00', '21:00:00', 5.00, '30-60 dakika', 1, 1, 50, 0, 'Cuma', 1, 'Teknoloji Merkezi - Yeni Nesil Cihazlar ve Aksesuarlar', 'Akıllı telefonlar, aksesuarlar ve elektronik ürünlerde en yeni seçenekleri Teknoloji Merkezi’nde bulun.', 'tech_haven_meta_image.png', 1, '2025-09-29 04:12:32', 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-29 04:12:32'),
(10, 1, 1, 'animals-pet', 5.00, 'VAT123467', 'commission', 'percentage', 10.00, 'Pati & Tırnak', 'paws--claws', '1234567901', 'patitirnak@example.com', '1297', NULL, 'Pet Sokağı No:909, Merkez', 23.7948895, 90.4051046, 1, '09:00:00', '20:00:00', 7.00, '30-60 dakika', 1, 1, 25, 0, 'Perşembe', 1, 'Pati & Tırnak - Evcil Dostlarınız İçin Her Şey', 'Mama, oyuncak, bakım ve aksesuar ürünlerini Pati & Tırnak’ta keşfedin.', 'paws_and_claws_meta_image.png', 1, NULL, 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(11, 1, 1, 'fish', 5.00, 'VAT123468', 'commission', 'percentage', 10.00, 'Akvaryum Market', 'the-fish-bowl', '1234567902', 'akvaryummarket@example.com', '1297', NULL, 'Akvaryum Caddesi No:1010, Merkez', 23.7950303, 90.4045412, 1, '10:00:00', '19:00:00', 5.00, '30-45 dakika', 1, 1, 20, 0, 'Çarşamba', 1, 'Akvaryum Market - Balık ve Akvaryum Ürünleri', 'Balık, akvaryum, yem ve ekipman ihtiyaçlarınız için Akvaryum Market’te doğru ürünü bulun.', 'the_fish_bowl_meta_image.png', 1, NULL, 1, 8, NULL, '2025-03-10 01:43:00', '2025-09-23 23:35:00');
