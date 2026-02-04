-- Table structure for table `currencies`
--

CREATE TABLE `currencies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(10) NOT NULL,
  `symbol` varchar(10) NOT NULL,
  `exchange_rate` decimal(15,6) NOT NULL DEFAULT 1.000000,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `name`, `code`, `symbol`, `exchange_rate`, `is_default`, `status`, `created_at`, `updated_at`) VALUES
(3, 'USD', 'USD', '$', 1.000000, 0, 1, '2025-08-24 03:02:57', '2025-08-24 06:27:32'),
(6, 'BDT', 'BDT', 'TK', 122.000000, 0, 1, '2025-08-24 04:11:01', '2025-08-24 06:27:25'),
(7, 'EUR', 'EUR', '€', 2.000000, 0, 1, '2025-08-24 04:15:18', '2025-08-24 06:28:32');
(8, 'TRY', 'TRY', '₺', 23.500000, 1, 1, '2025-08-24 04:20:45', '2025-08-24 06:29:10');

-- --------------------------------------------------------

--
