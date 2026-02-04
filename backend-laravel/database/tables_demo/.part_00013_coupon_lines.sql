-- Table structure for table `coupon_lines`
--

CREATE TABLE `coupon_lines` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `coupon_id` bigint(20) UNSIGNED DEFAULT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `coupon_code` varchar(255) NOT NULL,
  `discount_type` varchar(255) NOT NULL COMMENT 'percentage or amount',
  `discount` double NOT NULL,
  `min_order_value` double DEFAULT NULL,
  `max_discount` double DEFAULT NULL,
  `usage_limit` int(10) UNSIGNED DEFAULT NULL COMMENT 'Global usage limit for the coupon',
  `usage_count` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Number of times the coupon has been used globally',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '0=inactive, 1=active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupon_lines`
--

INSERT INTO `coupon_lines` (`id`, `coupon_id`, `customer_id`, `coupon_code`, `discount_type`, `discount`, `min_order_value`, `max_discount`, `usage_limit`, `usage_count`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(22, 22, 1, 'ZUCLKZZL', 'percentage', 10, 100, 20, 60, 41, '2024-09-04 00:00:00', '2026-06-05 00:00:00', 1, '2025-03-21 21:47:10', '2025-08-26 02:20:17'),
(26, 22, 73, 'DPFWRO2X', 'percentage', 5, 100, 100, 5, 0, '2025-09-23 00:00:00', '2025-09-30 00:00:00', 1, '2025-09-23 01:00:35', '2025-09-23 01:01:53'),
(27, 22, NULL, '595SGFHH', 'percentage', 5, 200, 100, 5, 0, '2025-09-23 00:00:00', '2025-09-30 00:00:00', 1, '2025-09-23 01:07:01', '2025-09-23 01:07:01');

-- --------------------------------------------------------

--
