-- Table structure for table `order_masters`
--

CREATE TABLE `order_masters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `shipping_address_id` varchar(255) DEFAULT NULL,
  `order_amount` decimal(15,2) DEFAULT NULL,
  `coupon_code` varchar(255) DEFAULT NULL,
  `coupon_title` varchar(255) DEFAULT NULL,
  `coupon_discount_amount_admin` decimal(15,2) DEFAULT NULL,
  `product_discount_amount` decimal(15,2) DEFAULT NULL,
  `flash_discount_amount_admin` decimal(15,2) DEFAULT NULL,
  `shipping_charge` decimal(15,2) DEFAULT NULL,
  `additional_charge_name` varchar(255) DEFAULT NULL,
  `additional_charge_amount` decimal(15,2) DEFAULT NULL,
  `additional_charge_commission` decimal(15,2) DEFAULT NULL,
  `paid_amount` decimal(15,2) DEFAULT NULL,
  `payment_gateway` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL COMMENT 'pending , paid, failed',
  `transaction_ref` varchar(255) DEFAULT NULL,
  `transaction_details` varchar(255) DEFAULT NULL,
  `order_notes` varchar(255) DEFAULT NULL,
  `default_currency_code` varchar(10) DEFAULT NULL,
  `currency_code` varchar(10) DEFAULT NULL,
  `exchange_rate` decimal(15,2) NOT NULL DEFAULT 1.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_masters`
--

INSERT INTO `order_masters` (`id`, `customer_id`, `area_id`, `shipping_address_id`, `order_amount`, `coupon_code`, `coupon_title`, `coupon_discount_amount_admin`, `product_discount_amount`, `flash_discount_amount_admin`, `shipping_charge`, `additional_charge_name`, `additional_charge_amount`, `additional_charge_commission`, `paid_amount`, `payment_gateway`, `payment_status`, `transaction_ref`, `transaction_details`, `order_notes`, `default_currency_code`, `currency_code`, `exchange_rate`, `created_at`, `updated_at`) VALUES
(1, 1, 0, '1', 334.60, NULL, NULL, 0.00, 200.00, 0.00, 124.60, NULL, NULL, NULL, 0.00, 'cash_on_delivery', 'pending', NULL, NULL, NULL, 'USD', 'USD', 1.00, '2025-09-23 05:44:41', '2025-09-23 05:44:42'),
(2, 1, 0, '2', 334.60, NULL, NULL, 0.00, 200.00, 0.00, 124.60, NULL, NULL, NULL, 0.00, 'cash_on_delivery', 'pending', NULL, NULL, NULL, 'USD', 'USD', 1.00, '2025-09-23 06:03:39', '2025-09-23 06:03:40'),
(3, 1, 0, '3', 755.00, NULL, NULL, 0.00, 600.00, 0.00, 125.00, NULL, NULL, NULL, 0.00, 'cash_on_delivery', 'paid', NULL, NULL, NULL, 'USD', 'USD', 1.00, '2025-09-23 21:50:37', '2025-09-23 22:46:49'),
(4, 1, 0, '4', 699.60, NULL, NULL, 0.00, 500.00, 0.00, 124.60, NULL, 50.00, 2.50, 0.00, 'cash_on_delivery', 'pending', NULL, NULL, NULL, 'USD', 'USD', 1.00, '2025-09-24 02:07:27', '2025-09-24 02:07:28'),
(5, 1, 0, '5', 239.60, NULL, NULL, 0.00, 100.00, 0.00, 124.60, NULL, 10.00, 0.50, 0.00, 'cash_on_delivery', 'pending', NULL, NULL, NULL, 'USD', 'USD', 1.00, '2025-09-24 02:27:01', '2025-09-24 02:27:02'),
(6, 1, 0, '6', 240.00, NULL, NULL, 0.00, 100.00, 0.00, 125.00, NULL, 10.00, 1.00, 0.00, 'cash_on_delivery', 'paid', NULL, NULL, NULL, 'USD', 'USD', 1.00, '2025-09-24 02:59:26', '2025-09-24 03:18:42'),
(7, 1, 0, '7', 230.00, NULL, NULL, 0.00, 100.00, 0.00, 125.00, NULL, NULL, NULL, 0.00, 'cash_on_delivery', 'pending', NULL, NULL, NULL, 'USD', 'USD', 1.00, '2025-09-24 03:12:03', '2025-09-24 03:12:04'),
(8, 1, 0, '8', 311.75, NULL, NULL, 0.00, 100.00, 0.00, 196.75, NULL, 10.00, 0.50, 0.00, 'cash_on_delivery', 'paid', NULL, NULL, NULL, 'USD', 'USD', 1.00, '2025-09-24 03:26:54', '2025-09-24 03:33:18'),
(9, 1, 0, '9', 1164.48, NULL, NULL, 0.00, 10.00, 148.50, 196.75, NULL, 84.15, 8.42, 0.00, 'cash_on_delivery', 'pending', NULL, NULL, NULL, 'USD', 'USD', 1.00, '2025-09-24 03:35:08', '2025-09-24 03:35:09'),
(12, 1, NULL, NULL, 434.49, NULL, NULL, 0.00, 23.00, 4.10, NULL, NULL, NULL, NULL, NULL, 'cash', 'paid', NULL, NULL, NULL, NULL, NULL, 1.00, '2025-09-24 05:07:34', '2025-09-24 05:07:34'),
(13, 1, NULL, NULL, 173.25, NULL, NULL, 0.00, 4.00, 0.00, NULL, NULL, NULL, NULL, NULL, 'cash', 'paid', NULL, NULL, NULL, NULL, NULL, 1.00, '2025-09-24 05:11:27', '2025-09-24 05:11:27'),
(14, 1, 0, '10', 62335.80, NULL, NULL, 0.00, 469.00, 0.00, 61843.35, NULL, NULL, NULL, 0.00, 'cash_on_delivery', 'pending', NULL, NULL, NULL, 'USD', 'USD', 1.00, '2025-09-25 00:02:14', '2025-09-25 00:02:15'),
(15, 1, 0, '11', 65727.03, NULL, NULL, 0.00, 644.00, 148.50, 62040.10, NULL, 174.15, 17.42, 0.00, 'cash_on_delivery', 'pending', NULL, NULL, NULL, 'USD', 'USD', 1.00, '2025-09-25 00:12:01', '2025-09-25 00:12:03'),
(16, 1, 0, '12', 1575.35, NULL, NULL, 0.00, 100.00, 0.00, 1460.35, NULL, 10.00, 0.50, 0.00, 'cash_on_delivery', 'pending', NULL, NULL, NULL, 'USD', 'USD', 1.00, '2025-09-25 06:10:22', '2025-09-25 06:10:22');

-- --------------------------------------------------------

--
