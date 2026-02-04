-- Table structure for table `order_delivery_histories`
--

CREATE TABLE `order_delivery_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `deliveryman_id` bigint(20) UNSIGNED NOT NULL,
  `reason` text DEFAULT NULL COMMENT 'Reason for ignoring or cancelling delivery',
  `status` varchar(255) NOT NULL COMMENT 'accepted, ignored, pickup, shipped, delivered, cancelled',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_delivery_histories`
--

INSERT INTO `order_delivery_histories` (`id`, `order_id`, `deliveryman_id`, `reason`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 6, NULL, 'accepted', '2025-09-23 22:32:20', '2025-09-23 22:32:20'),
(2, 3, 6, NULL, 'processing', '2025-09-23 22:32:20', '2025-09-23 22:32:20'),
(3, 3, 6, NULL, 'pickup', '2025-09-23 22:46:32', '2025-09-23 22:46:32'),
(4, 3, 6, NULL, 'shipped', '2025-09-23 22:46:36', '2025-09-23 22:46:36'),
(5, 3, 6, NULL, 'delivered', '2025-09-23 22:46:49', '2025-09-23 22:46:49'),
(6, 6, 6, NULL, 'accepted', '2025-09-24 03:18:21', '2025-09-24 03:18:21'),
(7, 6, 6, NULL, 'processing', '2025-09-24 03:18:21', '2025-09-24 03:18:21'),
(8, 6, 6, NULL, 'pickup', '2025-09-24 03:18:32', '2025-09-24 03:18:32'),
(9, 6, 6, NULL, 'shipped', '2025-09-24 03:18:36', '2025-09-24 03:18:36'),
(10, 6, 6, NULL, 'delivered', '2025-09-24 03:18:42', '2025-09-24 03:18:42'),
(11, 8, 6, NULL, 'accepted', '2025-09-24 03:32:26', '2025-09-24 03:32:26'),
(12, 8, 6, NULL, 'processing', '2025-09-24 03:32:26', '2025-09-24 03:32:26'),
(13, 8, 6, NULL, 'pickup', '2025-09-24 03:33:05', '2025-09-24 03:33:05'),
(14, 8, 6, NULL, 'shipped', '2025-09-24 03:33:11', '2025-09-24 03:33:11'),
(15, 8, 6, NULL, 'delivered', '2025-09-24 03:33:18', '2025-09-24 03:33:18'),
(16, 7, 6, 'resonance', 'ignored', '2025-09-24 22:13:39', '2025-09-24 22:13:39'),
(17, 2, 6, 'resonance', 'ignored', '2025-09-24 22:13:43', '2025-09-24 22:13:43'),
(18, 5, 6, NULL, 'accepted', '2025-09-24 22:16:00', '2025-09-24 22:16:00'),
(19, 5, 6, NULL, 'processing', '2025-09-24 22:16:00', '2025-09-24 22:16:00');

-- --------------------------------------------------------

--
