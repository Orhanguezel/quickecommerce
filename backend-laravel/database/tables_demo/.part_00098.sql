-- Table structure for table `wallet_withdrawals_transactions`
--

CREATE TABLE `wallet_withdrawals_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `wallet_id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `owner_type` varchar(255) DEFAULT NULL COMMENT 'store or deliveryman or customer',
  `withdraw_gateway_id` bigint(20) UNSIGNED NOT NULL,
  `gateway_name` varchar(255) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `fee` decimal(15,2) NOT NULL DEFAULT 0.00,
  `gateways_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gateways_options`)),
  `details` longtext DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending' COMMENT 'pending, approved, rejected',
  `reject_reason` text DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallet_withdrawals_transactions`
--

INSERT INTO `wallet_withdrawals_transactions` (`id`, `wallet_id`, `owner_id`, `owner_type`, `withdraw_gateway_id`, `gateway_name`, `amount`, `fee`, `gateways_options`, `details`, `approved_by`, `approved_at`, `status`, `reject_reason`, `attachment`, `created_at`, `updated_at`) VALUES
(1, 4, 6, 'App\\Models\\User', 2, 'Stripe', 100.00, 0.00, '\"{\\\"account_number\\\":\\\"55456686565665\\\",\\\"branch_name\\\":\\\"test\\\"}\"', 'hhhdhhdhjd', NULL, NULL, 'pending', NULL, NULL, '2025-09-23 23:20:16', '2025-09-23 23:20:16'),
(2, 2, 1, 'App\\Models\\Store', 2, 'Stripe', 100.00, 0.00, '\"{\\\"Account Name\\\":\\\"121212\\\",\\\"Account Number\\\":\\\"1212121\\\",\\\"Branch Name\\\":\\\"2121\\\"}\"', '2121', 8, '2025-09-24 22:48:11', 'approved', NULL, NULL, '2025-09-24 22:47:36', '2025-09-24 22:48:11');

-- --------------------------------------------------------

--
