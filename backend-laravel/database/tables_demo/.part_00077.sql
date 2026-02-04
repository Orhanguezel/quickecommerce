-- Table structure for table `store_notices`
--

CREATE TABLE `store_notices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` longtext DEFAULT NULL,
  `type` enum('general','specific_store','specific_seller') NOT NULL DEFAULT 'general' COMMENT 'general, specific_store, specific_seller',
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'low' COMMENT 'Priority: low, medium, high',
  `active_date` datetime DEFAULT NULL COMMENT 'Start date of the notice',
  `expire_date` datetime DEFAULT NULL COMMENT 'End date of the notice',
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '0=inactive, 1=active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
