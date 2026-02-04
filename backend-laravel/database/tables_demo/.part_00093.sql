-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `activity_scope` varchar(255) DEFAULT NULL,
  `email_verify_token` text DEFAULT NULL,
  `email_verified` int(11) NOT NULL DEFAULT 0 COMMENT '0=unverified, 1=verified',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `password_changed_at` timestamp NULL DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `def_lang` varchar(255) DEFAULT NULL,
  `activity_notification` tinyint(1) NOT NULL DEFAULT 1,
  `firebase_token` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `facebook_id` varchar(255) DEFAULT NULL,
  `apple_id` varchar(255) DEFAULT NULL,
  `store_owner` bigint(20) UNSIGNED DEFAULT NULL COMMENT '1=store_owner',
  `store_seller_id` bigint(20) UNSIGNED DEFAULT NULL,
  `stores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`stores`)),
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0=Inactive,1=Active,2=Suspended',
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `online_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `deactivated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `slug`, `phone`, `email`, `activity_scope`, `email_verify_token`, `email_verified`, `email_verified_at`, `password`, `password_changed_at`, `image`, `def_lang`, `activity_notification`, `firebase_token`, `google_id`, `facebook_id`, `apple_id`, `store_owner`, `store_seller_id`, `stores`, `status`, `is_available`, `online_at`, `remember_token`, `deactivated_at`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'Store', 'Admin', 'store-admin', '10515191941', 'seller@gmail.com', 'store_level', '242748', 1, '2025-08-07 01:44:15', '$2y$12$GLk.V7aTwFT1DIkYy.AU6uXxqJPw1D8PgPUcbEn3UMIErt82ecBpC', '2025-04-08 22:41:57', '1300', NULL, 1, NULL, NULL, NULL, NULL, 1, 1, '\"[1,3,4]\"', 1, 1, '2025-10-04 22:00:16', NULL, NULL, NULL, '2021-06-26 22:13:00', '2025-10-05 03:59:30'),
(6, 'Delivery', 'Man', 'delivery-man', '+1246358666', 'deliveryman@gmail.com', 'delivery_level', NULL, 1, '2025-08-03 23:00:38', '$2y$12$L3k0.WvFxUPwNFIvvO7Vm.gP5ZGofNn..yADnb5XoM/mo6X7wh5kq', '2025-07-07 17:08:06', '1300', NULL, 1, '554345345345', NULL, NULL, NULL, 0, 1, NULL, 1, 1, '2025-09-26 21:59:00', NULL, NULL, NULL, '2022-03-17 10:25:39', '2025-09-26 21:59:00');

-- --------------------------------------------------------

--
