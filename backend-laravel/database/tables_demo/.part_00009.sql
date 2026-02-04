-- Table structure for table `chats`
--

CREATE TABLE `chats` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `user_type` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chats`
--

INSERT INTO `chats` (`id`, `user_id`, `user_type`, `deleted_at`, `created_at`, `updated_at`) VALUES
(5, 6, 'deliveryman', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(7, 8, 'admin', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(62, 1, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(101, 1, 'customer', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(215, 3, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(217, 2, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(218, 4, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(219, 5, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(220, 6, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(221, 7, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(222, 8, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(223, 9, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(224, 10, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(225, 11, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(329, 204, 'deliveryman', NULL, '2025-09-24 23:02:14', '2025-09-24 23:02:14'),
(330, 104, 'customer', NULL, '2025-09-26 23:03:16', '2025-09-26 23:03:16'),
(331, 105, 'customer', NULL, '2025-09-29 22:14:09', '2025-09-29 22:14:09'),
(332, 106, 'customer', NULL, '2025-09-29 22:15:04', '2025-09-29 22:15:04'),
(333, 107, 'customer', NULL, '2025-10-04 23:21:09', '2025-10-04 23:21:09');

-- --------------------------------------------------------

--
