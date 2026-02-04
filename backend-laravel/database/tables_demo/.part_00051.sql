-- Table structure for table `pos_store_customers`
--

CREATE TABLE `pos_store_customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pos_store_customers`
--

INSERT INTO `pos_store_customers` (`id`, `customer_id`, `store_id`, `created_at`, `updated_at`) VALUES
(1, 107, 5, '2025-10-04 23:21:09', '2025-10-04 23:21:09');

-- --------------------------------------------------------

--
