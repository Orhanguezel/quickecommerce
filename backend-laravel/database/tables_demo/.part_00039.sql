-- Table structure for table `order_activities`
--

CREATE TABLE `order_activities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ref_id` bigint(20) UNSIGNED DEFAULT NULL,
  `collected_by` bigint(20) UNSIGNED DEFAULT NULL,
  `activity_from` varchar(255) DEFAULT NULL,
  `activity_type` varchar(255) DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `activity_value` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_activities`
--

INSERT INTO `order_activities` (`id`, `order_id`, `store_id`, `ref_id`, `collected_by`, `activity_from`, `activity_type`, `reference`, `activity_value`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, NULL, 'customer', 'order_status', NULL, 'pending', '2025-09-23 05:44:42', '2025-09-23 05:44:42'),
(2, 1, 1, 1, NULL, 'customer', 'payment_status', NULL, 'pending', '2025-09-23 05:44:42', '2025-09-23 05:44:42'),
(3, 1, 1, 1, NULL, 'customer', 'order_status', NULL, 'cancelled', '2025-09-23 06:01:17', '2025-09-23 06:01:17'),
(4, 2, 1, 1, NULL, 'customer', 'order_status', NULL, 'pending', '2025-09-23 06:03:39', '2025-09-23 06:03:39'),
(5, 2, 1, 1, NULL, 'customer', 'payment_status', NULL, 'pending', '2025-09-23 06:03:39', '2025-09-23 06:03:39'),
(6, 2, 1, 1, NULL, 'store', 'order_status', NULL, 'confirmed', '2025-09-23 06:07:48', '2025-09-23 06:07:48'),
(7, 2, 1, 8, NULL, 'admin', 'order_status', NULL, 'processing', '2025-09-23 21:38:57', '2025-09-23 21:38:57'),
(8, 2, 1, 8, NULL, 'admin', 'order_status', NULL, 'pending', '2025-09-23 21:39:34', '2025-09-23 21:39:34'),
(9, 3, 1, 1, NULL, 'customer', 'order_status', NULL, 'pending', '2025-09-23 21:50:37', '2025-09-23 21:50:37'),
(10, 3, 1, 1, NULL, 'customer', 'payment_status', NULL, 'pending', '2025-09-23 21:50:37', '2025-09-23 21:50:37'),
(11, 3, 1, 1, NULL, 'store', 'order_status', NULL, 'confirmed', '2025-09-23 22:12:40', '2025-09-23 22:12:40'),
(12, 3, 1, 8, NULL, 'admin', 'order_status', NULL, 'processing', '2025-09-23 22:13:41', '2025-09-23 22:13:41'),
(13, 3, 1, 6, NULL, 'deliveryman', 'order_status', NULL, 'pickup', '2025-09-23 22:46:32', '2025-09-23 22:46:32'),
(14, 3, 1, 6, NULL, 'deliveryman', 'order_status', NULL, 'shipped', '2025-09-23 22:46:36', '2025-09-23 22:46:36'),
(15, 3, 1, 6, NULL, 'deliveryman', 'order_status', NULL, 'delivered', '2025-09-23 22:46:49', '2025-09-23 22:46:49'),
(16, 3, 1, 6, NULL, 'deliveryman', 'payment_status', NULL, 'paid', '2025-09-23 22:46:49', '2025-09-23 22:46:49'),
(17, 3, NULL, 6, NULL, 'deliveryman', 'cash_collection', NULL, '755.00', '2025-09-23 22:46:49', '2025-09-23 22:46:49'),
(18, 3, NULL, 6, 8, 'deliveryman', 'cash_deposit', 'rafi', '755', '2025-09-23 23:05:16', '2025-09-23 23:05:16'),
(19, 2, 1, 8, NULL, 'admin', 'order_status', NULL, 'confirmed', '2025-09-24 00:02:08', '2025-09-24 00:02:08'),
(20, 2, 1, 8, NULL, 'admin', 'order_status', NULL, 'processing', '2025-09-24 00:02:21', '2025-09-24 00:02:21'),
(21, 4, 1, 1, NULL, 'customer', 'order_status', NULL, 'pending', '2025-09-24 02:07:28', '2025-09-24 02:07:28'),
(22, 4, 1, 1, NULL, 'customer', 'payment_status', NULL, 'pending', '2025-09-24 02:07:28', '2025-09-24 02:07:28'),
(23, 5, 1, 1, NULL, 'customer', 'order_status', NULL, 'pending', '2025-09-24 02:27:01', '2025-09-24 02:27:01'),
(24, 5, 1, 1, NULL, 'customer', 'payment_status', NULL, 'pending', '2025-09-24 02:27:02', '2025-09-24 02:27:02'),
(25, 6, 1, 1, NULL, 'customer', 'order_status', NULL, 'pending', '2025-09-24 02:59:27', '2025-09-24 02:59:27'),
(26, 6, 1, 1, NULL, 'customer', 'payment_status', NULL, 'pending', '2025-09-24 02:59:27', '2025-09-24 02:59:27'),
(27, 7, 1, 1, NULL, 'customer', 'order_status', NULL, 'pending', '2025-09-24 03:12:04', '2025-09-24 03:12:04'),
(28, 7, 1, 1, NULL, 'customer', 'payment_status', NULL, 'pending', '2025-09-24 03:12:04', '2025-09-24 03:12:04'),
(29, 6, 1, 8, NULL, 'admin', 'order_status', NULL, 'confirmed', '2025-09-24 03:14:35', '2025-09-24 03:14:35'),
(30, 6, 1, 8, NULL, 'admin', 'order_status', NULL, 'processing', '2025-09-24 03:15:44', '2025-09-24 03:15:44'),
(31, 6, 1, 6, NULL, 'deliveryman', 'order_status', NULL, 'pickup', '2025-09-24 03:18:32', '2025-09-24 03:18:32'),
(32, 6, 1, 6, NULL, 'deliveryman', 'order_status', NULL, 'shipped', '2025-09-24 03:18:36', '2025-09-24 03:18:36'),
(33, 6, 1, 6, NULL, 'deliveryman', 'order_status', NULL, 'delivered', '2025-09-24 03:18:42', '2025-09-24 03:18:42'),
(34, 6, 1, 6, NULL, 'deliveryman', 'payment_status', NULL, 'paid', '2025-09-24 03:18:42', '2025-09-24 03:18:42'),
(35, 6, NULL, 6, NULL, 'deliveryman', 'cash_collection', NULL, '240.00', '2025-09-24 03:18:42', '2025-09-24 03:18:42'),
(36, 8, 1, 1, NULL, 'customer', 'order_status', NULL, 'pending', '2025-09-24 03:26:55', '2025-09-24 03:26:55'),
(37, 8, 1, 1, NULL, 'customer', 'payment_status', NULL, 'pending', '2025-09-24 03:26:55', '2025-09-24 03:26:55'),
(38, 8, 1, 8, NULL, 'admin', 'order_status', NULL, 'confirmed', '2025-09-24 03:30:03', '2025-09-24 03:30:03'),
(39, 8, 1, 8, NULL, 'admin', 'order_status', NULL, 'processing', '2025-09-24 03:30:46', '2025-09-24 03:30:46'),
(40, 8, 1, 6, NULL, 'deliveryman', 'order_status', NULL, 'pickup', '2025-09-24 03:33:05', '2025-09-24 03:33:05'),
(41, 8, 1, 6, NULL, 'deliveryman', 'order_status', NULL, 'shipped', '2025-09-24 03:33:11', '2025-09-24 03:33:11'),
(42, 8, 1, 6, NULL, 'deliveryman', 'order_status', NULL, 'delivered', '2025-09-24 03:33:18', '2025-09-24 03:33:18'),
(43, 8, 1, 6, NULL, 'deliveryman', 'payment_status', NULL, 'paid', '2025-09-24 03:33:18', '2025-09-24 03:33:18'),
(44, 8, NULL, 6, NULL, 'deliveryman', 'cash_collection', NULL, '311.75', '2025-09-24 03:33:18', '2025-09-24 03:33:18'),
(45, 9, 9, 1, NULL, 'customer', 'order_status', NULL, 'pending', '2025-09-24 03:35:09', '2025-09-24 03:35:09'),
(46, 9, 9, 1, NULL, 'customer', 'payment_status', NULL, 'pending', '2025-09-24 03:35:09', '2025-09-24 03:35:09'),
(47, 9, 9, 8, NULL, 'admin', 'order_status', NULL, 'pickup', '2025-09-24 21:47:27', '2025-09-24 21:47:27'),
(48, 7, 1, 8, NULL, 'admin', 'order_status', NULL, 'processing', '2025-09-24 21:54:53', '2025-09-24 21:54:53'),
(49, 5, 1, 8, NULL, 'admin', 'order_status', NULL, 'processing', '2025-09-24 22:14:36', '2025-09-24 22:14:36'),
(50, 4, 1, 8, NULL, 'admin', 'order_status', NULL, 'processing', '2025-09-24 22:24:40', '2025-09-24 22:24:40'),
(51, 14, 7, 1, NULL, 'customer', 'order_status', NULL, 'pending', '2025-09-25 00:02:15', '2025-09-25 00:02:15'),
(52, 14, 7, 1, NULL, 'customer', 'payment_status', NULL, 'pending', '2025-09-25 00:02:15', '2025-09-25 00:02:15'),
(53, 15, 7, 1, NULL, 'customer', 'order_status', NULL, 'pending', '2025-09-25 00:12:02', '2025-09-25 00:12:02'),
(54, 15, 7, 1, NULL, 'customer', 'payment_status', NULL, 'pending', '2025-09-25 00:12:02', '2025-09-25 00:12:02'),
(55, 16, 9, 1, NULL, 'customer', 'order_status', NULL, 'pending', '2025-09-25 00:12:02', '2025-09-25 00:12:02'),
(56, 16, 9, 1, NULL, 'customer', 'payment_status', NULL, 'pending', '2025-09-25 00:12:02', '2025-09-25 00:12:02'),
(57, 16, 9, 8, NULL, 'admin', 'order_status', NULL, 'processing', '2025-09-25 06:06:16', '2025-09-25 06:06:16'),
(58, 17, 1, 1, NULL, 'customer', 'order_status', NULL, 'pending', '2025-09-25 06:10:22', '2025-09-25 06:10:22'),
(59, 17, 1, 1, NULL, 'customer', 'payment_status', NULL, 'pending', '2025-09-25 06:10:22', '2025-09-25 06:10:22'),
(60, 17, 1, 8, NULL, 'admin', 'order_status', NULL, 'confirmed', '2025-09-27 22:32:02', '2025-09-27 22:32:02'),
(61, 15, 7, 8, NULL, 'admin', 'order_status', NULL, 'confirmed', '2025-09-27 22:45:31', '2025-09-27 22:45:31'),
(62, 14, 7, 8, NULL, 'admin', 'order_status', NULL, 'confirmed', '2025-09-27 22:47:01', '2025-09-27 22:47:01'),
(63, 17, 1, 8, NULL, 'admin', 'order_status', NULL, 'pending', '2025-09-27 23:50:18', '2025-09-27 23:50:18');

-- --------------------------------------------------------

--
