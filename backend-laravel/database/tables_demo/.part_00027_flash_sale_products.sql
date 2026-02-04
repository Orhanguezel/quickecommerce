-- Table structure for table `flash_sale_products`
--

CREATE TABLE `flash_sale_products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `flash_sale_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `updated_by` int(10) UNSIGNED DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `flash_sale_products`
--

INSERT INTO `flash_sale_products` (`id`, `flash_sale_id`, `product_id`, `store_id`, `created_by`, `updated_by`, `rejection_reason`, `reviewed_at`, `status`, `created_at`, `updated_at`) VALUES
(294, 7, 121, 9, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:32:22', '2025-09-28 01:32:22'),
(295, 7, 128, 9, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:32:22', '2025-09-28 01:32:22'),
(296, 7, 133, 9, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:32:22', '2025-09-28 01:32:22'),
(297, 6, 3, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:31', '2025-09-28 01:33:31'),
(298, 6, 4, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:31', '2025-09-28 01:33:31'),
(299, 6, 5, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:31', '2025-09-28 01:33:31'),
(300, 6, 34, 2, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:31', '2025-09-28 01:33:31'),
(301, 6, 166, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:31', '2025-09-28 01:33:31'),
(302, 6, 167, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:31', '2025-09-28 01:33:31'),
(303, 6, 168, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:31', '2025-09-28 01:33:31'),
(304, 6, 169, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:31', '2025-09-28 01:33:31'),
(305, 5, 6, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:37', '2025-09-28 01:33:37'),
(306, 5, 8, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:37', '2025-09-28 01:33:37'),
(307, 5, 10, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:37', '2025-09-28 01:33:37'),
(308, 5, 3, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:37', '2025-09-28 01:33:37'),
(309, 5, 4, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:37', '2025-09-28 01:33:37'),
(310, 5, 5, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:37', '2025-09-28 01:33:37'),
(311, 5, 49, 3, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:37', '2025-09-28 01:33:37'),
(312, 5, 50, 3, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:37', '2025-09-28 01:33:37'),
(313, 5, 51, 3, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:37', '2025-09-28 01:33:37'),
(314, 5, 52, 3, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:37', '2025-09-28 01:33:37'),
(315, 4, 75, 5, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:42', '2025-09-28 01:33:42'),
(316, 4, 4, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:42', '2025-09-28 01:33:42'),
(317, 4, 6, 1, 8, NULL, NULL, NULL, 'approved', '2025-09-28 01:33:42', '2025-09-28 01:33:42');

-- --------------------------------------------------------

--
