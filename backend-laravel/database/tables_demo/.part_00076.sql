-- Table structure for table `store_area_setting_store_types`
--

CREATE TABLE `store_area_setting_store_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `store_area_setting_id` bigint(20) UNSIGNED NOT NULL,
  `store_type_id` bigint(20) UNSIGNED NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '0=Inactive, 1=Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_area_setting_store_types`
--

INSERT INTO `store_area_setting_store_types` (`id`, `store_area_setting_id`, `store_type_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2025-03-10 01:43:00', '2025-03-10 01:43:00'),
(2, 1, 2, 1, '2025-03-10 01:43:00', '2025-03-10 01:43:00'),
(4, 2, 1, 1, NULL, NULL),
(5, 2, 5, 1, NULL, NULL),
(9, 3, 1, 1, NULL, NULL),
(23, 1, 4, 1, NULL, NULL),
(24, 1, 5, 1, NULL, NULL),
(26, 3, 3, 1, NULL, NULL),
(27, 1, 3, 1, NULL, NULL),
(28, 1, 6, 1, NULL, NULL),
(29, 1, 9, 1, NULL, NULL),
(30, 1, 8, 1, NULL, NULL),
(31, 1, 7, 1, NULL, NULL),
(32, 1, 10, 1, NULL, NULL),
(33, 1, 11, 1, NULL, NULL),
(34, 4, 1, 1, NULL, NULL),
(35, 4, 2, 1, NULL, NULL),
(36, 4, 3, 1, NULL, NULL),
(37, 4, 4, 1, NULL, NULL),
(38, 4, 5, 1, NULL, NULL),
(39, 2, 2, 1, NULL, NULL),
(40, 2, 3, 1, NULL, NULL),
(41, 2, 4, 1, NULL, NULL),
(42, 2, 6, 1, NULL, NULL),
(43, 2, 11, 1, NULL, NULL),
(44, 2, 10, 1, NULL, NULL),
(45, 2, 8, 1, NULL, NULL),
(46, 2, 9, 1, NULL, NULL),
(47, 2, 7, 1, NULL, NULL),
(48, 5, 1, 1, NULL, NULL),
(49, 5, 2, 1, NULL, NULL),
(50, 5, 3, 1, NULL, NULL),
(51, 5, 4, 1, NULL, NULL),
(52, 5, 5, 1, NULL, NULL),
(53, 5, 6, 1, NULL, NULL),
(54, 5, 11, 1, NULL, NULL),
(55, 5, 10, 1, NULL, NULL),
(56, 5, 9, 1, NULL, NULL),
(57, 5, 8, 1, NULL, NULL);

-- --------------------------------------------------------

--
