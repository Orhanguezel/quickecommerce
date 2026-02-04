-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `available_for` varchar(255) NOT NULL DEFAULT 'system_level',
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `locked` tinyint(1) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `available_for`, `name`, `guard_name`, `locked`, `status`, `created_at`, `updated_at`) VALUES
(1, 'system_level', 'Super Admin', 'api', 1, 1, '2023-08-11 05:57:33', '2023-08-11 05:57:33'),
(2, 'store_level', 'Store Admin', 'api', 1, 1, '2023-08-11 05:57:33', '2023-08-11 05:57:33'),
(6, 'delivery_level', 'Delivery Man', 'api', 1, 1, '2023-08-11 05:57:33', '2023-08-11 05:57:33'),
(17, 'system_level', 'Admin', 'api', 0, 1, '2025-05-15 03:39:59', '2025-05-15 03:39:59'),
(21, 'store_level', 'Store Manager', 'api', 0, 1, '2025-07-09 05:52:11', '2025-07-09 05:52:11');

-- --------------------------------------------------------

--
