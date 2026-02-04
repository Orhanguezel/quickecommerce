-- Table structure for table `store_area_setting_range_charges`
--

CREATE TABLE `store_area_setting_range_charges` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `store_area_setting_id` bigint(20) UNSIGNED NOT NULL,
  `min_km` decimal(8,2) NOT NULL,
  `max_km` decimal(8,2) NOT NULL,
  `charge_amount` decimal(10,2) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '0=Inactive, 1=Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_area_setting_range_charges`
--

INSERT INTO `store_area_setting_range_charges` (`id`, `store_area_setting_id`, `min_km`, `max_km`, `charge_amount`, `status`, `created_at`, `updated_at`) VALUES
(61, 3, 5.00, 10.00, 100.00, 1, '2025-05-17 11:53:47', '2025-05-17 11:53:47'),
(64, 2, 1.00, 5.00, 5.00, 1, '2025-09-23 04:31:44', '2025-09-23 04:31:44'),
(65, 2, 5.00, 10.00, 10.00, 1, '2025-09-23 04:31:44', '2025-09-23 04:31:44');

-- --------------------------------------------------------

--
