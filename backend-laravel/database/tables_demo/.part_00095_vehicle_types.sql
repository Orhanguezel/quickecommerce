-- Table structure for table `vehicle_types`
--

CREATE TABLE `vehicle_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `capacity` int(11) DEFAULT NULL COMMENT 'Load capacity in kilograms.',
  `speed_range` varchar(255) DEFAULT NULL COMMENT 'Average speed range, e.g., 20-40 km/h.',
  `fuel_type` enum('petrol','diesel','electric','hybrid') DEFAULT NULL,
  `max_distance` int(11) DEFAULT NULL COMMENT 'Maximum distance per trip in kilometers.',
  `extra_charge` decimal(8,2) DEFAULT NULL COMMENT 'Applicable if exceed max distance limit',
  `average_fuel_cost` decimal(8,2) DEFAULT NULL COMMENT 'Fuel cost per trip.',
  `description` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicle_types`
--

INSERT INTO `vehicle_types` (`id`, `name`, `capacity`, `speed_range`, `fuel_type`, `max_distance`, `extra_charge`, `average_fuel_cost`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Motorcycle', 120, '50', 'electric', 10, 0.00, 120.00, NULL, 1, '2025-03-20 01:32:01', '2025-07-20 05:54:49'),
(2, 'Electric Car', 130, '30', 'electric', 10, 0.00, 20.00, NULL, 1, '2025-03-20 01:32:36', '2025-05-14 10:05:00'),
(3, 'Truck', 500, '30', 'petrol', 120, 10.00, 100.00, NULL, 1, '2025-03-20 01:34:46', '2025-07-07 08:36:19');

-- --------------------------------------------------------

--
