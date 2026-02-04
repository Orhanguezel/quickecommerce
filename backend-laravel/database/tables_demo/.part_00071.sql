-- Table structure for table `sms_providers`
--

CREATE TABLE `sms_providers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `expire_time` int(11) NOT NULL DEFAULT 1,
  `credentials` longtext DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0: Inactive, 1: Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sms_providers`
--

INSERT INTO `sms_providers` (`id`, `name`, `slug`, `logo`, `expire_time`, `credentials`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Nexmo', 'nexmo', NULL, 5, '{\"nexmo_api_key\":\"d008d407\",\"nexmo_api_secret\":\"HvMKGiT0CjvZqJgT\"}', 1, NULL, '2025-07-07 06:43:27'),
(2, 'Twilio', 'twilio', NULL, 5, '{\"twilio_sid\":\"ACd9b1fe3992f74b20008f7d6a5962f883\",\"twilio_auth_key\":\"fd536f87af14b0d769220b1859f9b4ff\",\"twilio_number\":\"+16206661971\"}', 1, NULL, '2025-06-24 11:58:28');

-- --------------------------------------------------------

--
