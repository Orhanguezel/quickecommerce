-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `validity` int(11) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` double NOT NULL DEFAULT 0,
  `pos_system` tinyint(1) NOT NULL DEFAULT 0,
  `self_delivery` tinyint(1) NOT NULL DEFAULT 0,
  `mobile_app` tinyint(1) NOT NULL DEFAULT 0,
  `live_chat` tinyint(1) NOT NULL DEFAULT 0,
  `order_limit` int(11) NOT NULL DEFAULT 0,
  `product_limit` int(11) NOT NULL DEFAULT 0,
  `product_featured_limit` int(11) NOT NULL DEFAULT 0,
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0=inactive, 1=active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (
  `id`, `name`, `type`, `validity`, `image`, `description`, `price`,
  `pos_system`, `self_delivery`, `mobile_app`, `live_chat`,
  `order_limit`, `product_limit`, `product_featured_limit`,
  `status`, `created_at`, `updated_at`
) VALUES
(
  2,
  'Deneme Paketi',
  'Haftalık',
  7,
  '1297',
  'Sportoonline platformunu ücretsiz denemeniz için sunulan başlangıç paketidir. Sınırlı ürün ve sipariş hakkı içerir. Yeni satıcılar için idealdir.',
  0,
  0, 0, 0, 0,
  10, 10, 2,
  1,
  '2025-04-17 07:05:16',
  '2025-09-28 03:41:37'
),
(
  3,
  'Başlangıç Paketi',
  'Aylık',
  30,
  '1297',
  'Küçük işletmeler için uygun, temel satış özelliklerini içeren pakettir. Ürün listeleme ve sipariş alma için yeterli başlangıç sunar.',
  30,
  0, 0, 0, 0,
  50, 50, 5,
  1,
  '2025-04-17 07:05:16',
  '2025-06-18 10:23:52'
),
(
  4,
  'Standart Paket',
  '6 Aylık',
  180,
  '1297',
  'Aktif satış yapan mağazalar için önerilen pakettir. POS sistemi, kendi teslimat seçeneği ve canlı destek özelliklerini içerir.',
  100,
  1, 1, 0, 1,
  100, 150, 10,
  1,
  '2025-04-17 07:05:16',
  '2025-05-20 12:19:37'
),
(
  5,
  'Premium Paket',
  'Yıllık',
  365,
  '1297',
  'Büyümeyi hedefleyen mağazalar için kapsamlı çözümler sunar. Mobil uygulama, POS, canlı sohbet ve yüksek ürün/sipariş limitleri içerir.',
  200,
  1, 1, 1, 1,
  500, 200, 15,
  1,
  '2025-04-17 07:05:16',
  '2025-05-20 12:19:20'
),
(
  6,
  'Kurumsal Paket',
  'Uzun Süreli',
  1095,
  '1297',
  'Büyük ölçekli ve kurumsal mağazalar için tasarlanmıştır. En yüksek limitler, tüm sistem özellikleri ve uzun süreli kullanım avantajı sunar.',
  500,
  1, 1, 1, 1,
  1000, 500, 25,
  1,
  '2025-04-17 07:05:16',
  '2025-05-20 12:22:24'
);
