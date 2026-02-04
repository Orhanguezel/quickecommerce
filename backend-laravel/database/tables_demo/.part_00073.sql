-- Table structure for table `store_areas`
--

CREATE TABLE `store_areas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `coordinates` polygon DEFAULT NULL,
  `center_latitude` decimal(10,7) DEFAULT NULL,
  `center_longitude` decimal(10,7) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=Inactive, 1=Active',
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_areas`
--

INSERT INTO `store_areas` (`id`, `code`, `state`, `city`, `name`, `coordinates`, `center_latitude`, `center_longitude`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Dhaka', 'Gulshan', 'Gulshan', 0x000000000103000000010000000c000000d40ad8fc7c9a5640ed1b3f2752c83740da0ad824a09a5640cec517ca9cc83740dc0ad840cf9a5640a0fcac7e92c83740d90ad834db9a56406a84966789c73740ed0ad8c8bf9a5640d0c41fc43ec73740d20ad8d0c69a56403c742b85cdc63740ea0ad8f8bc9a5640a0926fd44cc63740e10ad83c889a5640854f1d4a6ec63740bd0ad84c699a5640af45cf9103c73740df0ad820599a56409c610913f8c73740d40ad8fc7c9a5640ed1b3f2752c83740d40ad8fc7c9a5640ed1b3f2752c83740, 23.7795189, 90.4159425, 1, 8, NULL, '2025-04-23 09:12:06', '2025-09-23 05:43:42'),
(2, 'NY-003', 'New York', 'Queens', 'Queens', 0x00000000010300000001000000050000006ee00ed4297352c03259dc7f645c444026ff93bf7b7352c08f6cae9ae75c4440c6db4aafcd7352c0d0251c7a8b5d44407ffacf9a1f7452c011df89592f5e44406ee00ed4297352c03259dc7f645c4440, 40.7278202, -73.8060973, 1, NULL, NULL, '2025-05-24 04:09:59', '2025-05-24 04:09:59'),
(3, 'CA-002', 'California', 'San Francisco', 'San Francisco', 0x0000000001030000000100000005000000b5c189e8d79a5ec042b115342de342406ee00ed4299b5ec0836a8313d1e342400ebdc5c37b9b5ec0c423f1f274e44240c6db4aafcd9b5ec005dd5ed218e54240b5c189e8d79a5ec042b115342de34240, 37.7823185, -122.4269285, 1, NULL, NULL, '2025-05-24 04:09:59', '2025-05-24 04:09:59');

-- --------------------------------------------------------

--
