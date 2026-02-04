-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `wallet_id` bigint(20) UNSIGNED NOT NULL,
  `transaction_ref` varchar(255) DEFAULT NULL,
  `transaction_details` text DEFAULT NULL,
  `amount` double NOT NULL DEFAULT 0,
  `type` varchar(255) NOT NULL COMMENT 'credit or debit',
  `purpose` varchar(255) DEFAULT NULL,
  `payment_gateway` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL COMMENT 'pending , paid, failed',
  `status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '0=pending, 1=success',
  `currency_code` varchar(10) DEFAULT NULL,
  `exchange_rate` decimal(15,2) NOT NULL DEFAULT 1.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallet_transactions`
--

INSERT INTO `wallet_transactions` (`id`, `wallet_id`, `transaction_ref`, `transaction_details`, `amount`, `type`, `purpose`, `payment_gateway`, `payment_status`, `status`, `currency_code`, `exchange_rate`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, NULL, 570, 'credit', 'Order  Earnings', NULL, NULL, 1, NULL, 1.00, '2025-09-23 22:46:49', '2025-09-23 22:46:49'),
(2, 4, NULL, NULL, 113, 'credit', 'Delivery Earnings', NULL, NULL, 1, NULL, 1.00, '2025-09-23 22:46:49', '2025-09-23 22:46:49'),
(3, 2, NULL, NULL, 105, 'credit', 'Order  Earnings', NULL, NULL, 1, NULL, 1.00, '2025-09-24 03:18:42', '2025-09-24 03:18:42'),
(4, 4, NULL, NULL, 113, 'credit', 'Delivery Earnings', NULL, NULL, 1, NULL, 1.00, '2025-09-24 03:18:42', '2025-09-24 03:18:42'),
(5, 2, NULL, NULL, 104.5, 'credit', 'Order  Earnings', NULL, NULL, 1, NULL, 1.00, '2025-09-24 03:33:18', '2025-09-24 03:33:18'),
(6, 4, NULL, NULL, 177.08, 'credit', 'Delivery Earnings', NULL, NULL, 1, NULL, 1.00, '2025-09-24 03:33:18', '2025-09-24 03:33:18'),
(7, 2, NULL, NULL, 100, 'debit', 'withdrawal', NULL, NULL, 1, NULL, 1.00, '2025-09-24 22:48:11', '2025-09-24 22:48:11'),
(16, 1, 'pi_3SCGTPLFbM0VBPtJ0b2uCVGm', 'Deposit funds to wallet', 255, 'credit', 'deposit', 'Stripe', 'paid', 1, 'USD', 1.00, '2025-09-28 03:00:50', '2025-09-28 03:02:16'),
(25, 264, 'pi_3SCeIJFQkOXqMwIh0qT4N7Vg', NULL, 300, 'credit', 'deposit', 'stripe', 'paid', 1, 'USD', 1.00, '2025-09-29 04:26:08', '2025-09-29 04:27:16'),
(26, 2, 'pi_3SCfk3FQkOXqMwIh0bUIa3nt', NULL, 20, 'credit', 'deposit', 'stripe', 'paid', 1, 'USD', 1.00, '2025-09-29 05:59:17', '2025-09-29 06:00:00');

-- --------------------------------------------------------

--
