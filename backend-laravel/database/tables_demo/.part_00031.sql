-- Table structure for table `live_locations`
--

CREATE TABLE `live_locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `trackable_type` varchar(255) NOT NULL,
  `trackable_id` bigint(20) UNSIGNED NOT NULL,
  `ref` varchar(255) DEFAULT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `live_locations`
--

INSERT INTO `live_locations` (`id`, `trackable_type`, `trackable_id`, `ref`, `order_id`, `latitude`, `longitude`, `last_updated`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\DeliveryMan', 6, NULL, 6, 23.8028426, 90.3701493, '2025-09-24 04:17:42', '2025-09-24 03:18:45', '2025-09-24 04:17:42'),
(2, 'App\\Models\\DeliveryMan', 6, NULL, 8, 23.8028426, 90.3701493, '2025-09-24 04:17:42', '2025-09-24 03:33:21', '2025-09-24 04:17:42');

-- --------------------------------------------------------

--
