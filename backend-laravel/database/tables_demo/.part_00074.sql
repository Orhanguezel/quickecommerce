-- Table structure for table `store_area_settings`
--

CREATE TABLE `store_area_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `store_area_id` bigint(20) UNSIGNED NOT NULL,
  `delivery_time_per_km` int(11) NOT NULL,
  `min_order_delivery_fee` decimal(10,2) DEFAULT NULL,
  `delivery_charge_method` varchar(255) DEFAULT NULL COMMENT 'fixed, per_km, range_wise',
  `out_of_area_delivery_charge` decimal(10,2) DEFAULT NULL,
  `fixed_charge_amount` decimal(10,2) DEFAULT NULL,
  `per_km_charge_amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_area_settings`
--

INSERT INTO `store_area_settings` (`id`, `store_area_id`, `delivery_time_per_km`, `min_order_delivery_fee`, `delivery_charge_method`, `out_of_area_delivery_charge`, `fixed_charge_amount`, `per_km_charge_amount`, `created_at`, `updated_at`) VALUES
(1, 1, 5, 50.00, 'per_km', 100.00, NULL, 5.00, '2025-03-10 01:43:00', '2025-09-23 04:29:03'),
(2, 2, 5, 10.00, 'range_wise', 100.00, 100.00, 10.00, '2025-04-06 03:58:12', '2025-09-23 04:31:44'),
(3, 6, 100, 60.00, 'range_wise', 200.00, 20.00, 5.00, '2025-04-19 11:17:32', '2025-05-17 11:53:47'),
(4, 10, 60, 60.00, 'per_km', 100.00, 70.00, 2.00, '2025-06-18 09:09:24', '2025-06-18 09:45:55'),
(5, 3, 8, 60.00, 'fixed', 120.00, 100.00, NULL, '2025-09-23 04:33:15', '2025-09-23 04:33:46');

-- --------------------------------------------------------

--
