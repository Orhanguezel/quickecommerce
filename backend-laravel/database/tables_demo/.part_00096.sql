-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `owner_type` varchar(255) NOT NULL COMMENT 'store or deliveryman or customer',
  `balance` double NOT NULL DEFAULT 0,
  `earnings` decimal(15,2) NOT NULL DEFAULT 0.00,
  `withdrawn` decimal(15,2) NOT NULL DEFAULT 0.00,
  `refunds` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '0=inactive, 1=active',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`id`, `owner_id`, `owner_type`, `balance`, `earnings`, `withdrawn`, `refunds`, `status`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'App\\Models\\Customer', 255, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:01', '2025-09-29 02:38:56'),
(2, 1, 'App\\Models\\Store', 499.5, 779.50, 100.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-09-29 06:00:00'),
(4, 6, 'App\\Models\\User', 403.08, 403.08, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:10', '2025-09-24 03:33:18'),
(257, 2, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-09-13 03:40:39'),
(258, 3, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-09-11 03:17:54'),
(259, 4, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-09-15 00:17:07'),
(260, 5, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-09-16 05:35:12'),
(261, 6, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-08-07 04:09:50'),
(262, 7, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-08-07 04:08:07'),
(263, 8, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-07-21 06:41:01'),
(264, 9, 'App\\Models\\Store', 300, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-09-29 04:27:16'),
(265, 10, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-07-21 06:41:01'),
(266, 11, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-07-21 06:41:01');

-- --------------------------------------------------------

--
