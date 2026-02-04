-- Table structure for table `order_addresses`
--

CREATE TABLE `order_addresses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_master_id` bigint(20) UNSIGNED DEFAULT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'home' COMMENT 'home, office, others',
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `road` varchar(255) DEFAULT NULL,
  `house` varchar(255) DEFAULT NULL,
  `floor` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_addresses`
--

INSERT INTO `order_addresses` (`id`, `order_master_id`, `area_id`, `type`, `name`, `email`, `contact_number`, `address`, `latitude`, `longitude`, `road`, `house`, `floor`, `postal_code`, `created_at`, `updated_at`) VALUES
(1, 1, 0, 'office', NULL, 'customer@gmail.com', '8801784655252', 'Mirpur-10, ঢাকা, Bangladesh', '23.8028556', '90.3748344', '10', '120', '5', '1200', '2025-09-23 05:44:41', '2025-09-23 05:44:41'),
(2, 2, 0, 'office', NULL, 'customer@gmail.com', '8801784655252', 'Mirpur-10, ঢাকা, Bangladesh', '23.8028556', '90.3748344', '10', '120', '5', '1200', '2025-09-23 06:03:39', '2025-09-23 06:03:39'),
(3, 3, 0, 'office', NULL, 'customer@gmail.com', '8801784655252', 'Mirpur-10, ঢাকা, Bangladesh', '23.8028556', '90.3748344', '10', '120', '5', '1200', '2025-09-23 21:50:37', '2025-09-23 21:50:37'),
(4, 4, 0, 'office', NULL, 'customer@gmail.com', '8801784655252', 'Mirpur-10, ঢাকা, Bangladesh', '23.8028556', '90.3748344', '10', '120', '5', '1200', '2025-09-24 02:07:27', '2025-09-24 02:07:27'),
(5, 5, 0, 'office', NULL, 'customer@gmail.com', '8801784655252', 'Mirpur-10, ঢাকা, Bangladesh', '23.8028556', '90.3748344', '10', '120', '5', '1200', '2025-09-24 02:27:01', '2025-09-24 02:27:01'),
(6, 6, 0, 'office', NULL, 'customer@gmail.com', '8801784655252', 'Mirpur-10, ঢাকা, Bangladesh', '23.8028556', '90.3748344', '10', '120', '5', '1200', '2025-09-24 02:59:26', '2025-09-24 02:59:26'),
(7, 7, 0, 'office', NULL, 'customer@gmail.com', '8801784655252', 'Mirpur-10, ঢাকা, Bangladesh', '23.8028556', '90.3748344', '10', '120', '5', '1200', '2025-09-24 03:12:04', '2025-09-24 03:12:04'),
(8, 8, 0, 'office', NULL, 'customer@gmail.com', '8801784655252', 'Mirpur-10, ঢাকা, Bangladesh', '23.9234214343835', '90.30891643125003', '10', '120', '5', '1200', '2025-09-24 03:26:54', '2025-09-24 03:26:54'),
(9, 9, 0, 'office', NULL, 'customer@gmail.com', '8801784655252', 'Mirpur-10, ঢাকা, Bangladesh', '23.9234214343835', '90.30891643125003', '10', '120', '5', '1200', '2025-09-24 03:35:08', '2025-09-24 03:35:08'),
(10, 14, 0, 'office', NULL, 'customer@gmail.com', '8801784655252', 'Mirpur-10, ঢাকা, Bangladesh', '23.9234214343835', '90.30891643125003', '10', '120', '5', '1200', '2025-09-25 00:02:14', '2025-09-25 00:02:14'),
(11, 15, 0, 'office', NULL, 'customer@gmail.com', '8801784655252', 'Mirpur-10, ঢাকা, Bangladesh', '23.9234214343835', '90.30891643125003', '10', '120', '5', '1200', '2025-09-25 00:12:01', '2025-09-25 00:12:01'),
(12, 16, 0, 'home', NULL, 'customer@gmail.com', '8801789998999', 'Dinajpur', '25.6221484', '88.6437963', '23', '23', '33', '5240', '2025-09-25 06:10:22', '2025-09-25 06:10:22');

-- --------------------------------------------------------

--
