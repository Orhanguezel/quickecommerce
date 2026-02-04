-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `behaviour` varchar(255) DEFAULT NULL COMMENT 'service, digital, consumable, combo',
  `product_sku` varchar(255) DEFAULT NULL,
  `variant_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variant_details`)),
  `product_campaign_id` bigint(20) UNSIGNED DEFAULT NULL,
  `base_price` decimal(15,2) DEFAULT NULL,
  `admin_discount_type` varchar(255) DEFAULT NULL,
  `admin_discount_rate` decimal(15,2) DEFAULT NULL,
  `admin_discount_amount` decimal(15,2) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `quantity` decimal(15,2) DEFAULT NULL,
  `line_total_price_with_qty` decimal(15,2) DEFAULT NULL,
  `coupon_discount_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `line_total_excluding_tax` decimal(15,2) DEFAULT NULL,
  `tax_rate` decimal(15,2) DEFAULT NULL,
  `tax_amount` decimal(15,2) DEFAULT NULL,
  `total_tax_amount` decimal(15,2) DEFAULT NULL,
  `line_total_price` decimal(15,2) DEFAULT NULL,
  `admin_commission_type` varchar(255) DEFAULT NULL,
  `admin_commission_rate` decimal(15,2) NOT NULL DEFAULT 0.00,
  `admin_commission_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `default_currency_code` varchar(10) DEFAULT NULL,
  `currency_code` varchar(10) DEFAULT NULL,
  `exchange_rate` decimal(15,2) NOT NULL DEFAULT 1.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_details`
--

INSERT INTO `order_details` (`id`, `order_id`, `store_id`, `area_id`, `product_id`, `behaviour`, `product_sku`, `variant_details`, `product_campaign_id`, `base_price`, `admin_discount_type`, `admin_discount_rate`, `admin_discount_amount`, `price`, `quantity`, `line_total_price_with_qty`, `coupon_discount_amount`, `line_total_excluding_tax`, `tax_rate`, `tax_amount`, `total_tax_amount`, `line_total_price`, `admin_commission_type`, `admin_commission_rate`, `admin_commission_amount`, `default_currency_code`, `currency_code`, `exchange_rate`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 221, NULL, '7l3vCalJ', '{\"Weight\":\"1000g\",\"color\":\"red\"}', NULL, 100.00, NULL, 0.00, 0.00, 100.00, 2.00, 200.00, 0.00, 200.00, 5.00, 5.00, 10.00, 210.00, 'percentage', 10.00, 20.00, NULL, NULL, 1.00, '2025-09-23 05:44:42', '2025-09-23 05:44:42'),
(2, 2, 1, 1, 221, NULL, '7l3vCalJ', '{\"Weight\":\"1000g\",\"color\":\"red\"}', NULL, 100.00, NULL, 0.00, 0.00, 100.00, 2.00, 200.00, 0.00, 200.00, 5.00, 5.00, 10.00, 210.00, 'percentage', 10.00, 20.00, NULL, NULL, 1.00, '2025-09-23 06:03:39', '2025-09-23 06:03:39'),
(3, 3, 1, 1, 221, NULL, '7l3vCalJ', '{\"Weight\":\"1000g\",\"color\":\"red\"}', NULL, 100.00, NULL, 0.00, 0.00, 100.00, 6.00, 600.00, 0.00, 600.00, 5.00, 5.00, 30.00, 630.00, 'percentage', 10.00, 60.00, NULL, NULL, 1.00, '2025-09-23 21:50:37', '2025-09-23 21:50:38'),
(4, 4, 1, 1, 221, NULL, '7l3vCalJ', '{\"Weight\":\"1000g\",\"color\":\"red\"}', NULL, 100.00, NULL, 0.00, 0.00, 100.00, 5.00, 500.00, 0.00, 500.00, 5.00, 5.00, 25.00, 525.00, 'percentage', 10.00, 50.00, NULL, NULL, 1.00, '2025-09-24 02:07:27', '2025-09-24 02:07:27'),
(5, 5, 1, 1, 221, NULL, '7l3vCalJ', '{\"Weight\":\"1000g\",\"color\":\"red\"}', NULL, 100.00, NULL, 0.00, 0.00, 100.00, 1.00, 100.00, 0.00, 100.00, 5.00, 5.00, 5.00, 105.00, 'percentage', 10.00, 10.00, NULL, NULL, 1.00, '2025-09-24 02:27:01', '2025-09-24 02:27:01'),
(6, 6, 1, 1, 221, NULL, '7l3vCalJ', '{\"Weight\":\"1000g\",\"color\":\"red\"}', NULL, 100.00, NULL, 0.00, 0.00, 100.00, 1.00, 100.00, 0.00, 100.00, 5.00, 5.00, 5.00, 105.00, 'percentage', 10.00, 10.00, NULL, NULL, 1.00, '2025-09-24 02:59:26', '2025-09-24 02:59:27'),
(7, 7, 1, 1, 221, NULL, '7l3vCalJ', '{\"Weight\":\"1000g\",\"color\":\"red\"}', NULL, 100.00, NULL, 0.00, 0.00, 100.00, 1.00, 100.00, 0.00, 100.00, 5.00, 5.00, 5.00, 105.00, 'percentage', 10.00, 10.00, NULL, NULL, 1.00, '2025-09-24 03:12:04', '2025-09-24 03:12:04'),
(8, 8, 1, 1, 221, NULL, '7l3vCalJ', '{\"Weight\":\"1000g\",\"color\":\"red\"}', NULL, 100.00, NULL, 0.00, 0.00, 100.00, 1.00, 100.00, 0.00, 100.00, 5.00, 5.00, 5.00, 105.00, 'percentage', 10.00, 10.00, NULL, NULL, 1.00, '2025-09-24 03:26:55', '2025-09-24 03:26:55'),
(9, 9, 9, 1, 121, 'physical', 'SKU-121-1', '{\"Model\":\"ProMax\",\"Specifications\":\"256GB Storage\"}', 7, 990.00, 'percentage', 15.00, 148.50, 841.50, 1.00, 841.50, 0.00, 841.50, 5.00, 42.08, 42.08, 883.58, 'percentage', 10.00, 84.15, NULL, NULL, 1.00, '2025-09-24 03:35:08', '2025-09-24 03:35:08'),
(12, 12, 1, NULL, 170, NULL, 'WbuZis8H', '{\"Weight\":\"1 each\"}', NULL, 85.00, NULL, 0.00, 0.00, 85.00, 4.00, 340.00, 0.00, 340.00, 5.00, 4.25, 17.00, 357.00, 'percentage', 0.00, 0.00, NULL, NULL, 1.00, '2025-09-24 05:07:34', '2025-09-24 05:07:34'),
(13, 12, 1, NULL, 3, 'consumable', 'SKU-3-1', '{\"Weight\":\"1 kg\"}', NULL, 41.00, 'percentage', 10.00, 4.10, 36.90, 2.00, 73.80, 0.00, 73.80, 5.00, 1.85, 3.69, 77.49, 'percentage', 0.00, 0.00, NULL, NULL, 1.00, '2025-09-24 05:07:34', '2025-09-24 05:07:34'),
(14, 13, 1, NULL, 12, 'consumable', 'SKU-12-1', '{\"Weight\":\"250 g\"}', NULL, 55.00, NULL, 0.00, 0.00, 55.00, 3.00, 165.00, 0.00, 165.00, 5.00, 2.75, 8.25, 173.25, 'percentage', 0.00, 0.00, NULL, NULL, 1.00, '2025-09-24 05:11:27', '2025-09-24 05:11:27'),
(15, 14, 7, 3, 100, 'physical', 'SKU-100-1', '{\"Color\":\"yellow\"}', NULL, 469.00, NULL, 0.00, 0.00, 469.00, 1.00, 469.00, 0.00, 469.00, 5.00, 23.45, 23.45, 492.45, 'percentage', 10.00, 46.90, NULL, NULL, 1.00, '2025-09-25 00:02:15', '2025-09-25 00:02:15'),
(16, 15, 7, 3, 100, 'physical', 'SKU-100-1', '{\"Color\":\"yellow\"}', NULL, 469.00, NULL, 0.00, 0.00, 469.00, 1.00, 469.00, 0.00, 469.00, 5.00, 23.45, 23.45, 492.45, 'percentage', 10.00, 46.90, NULL, NULL, 1.00, '2025-09-25 00:12:02', '2025-09-25 00:12:02'),
(17, 15, 7, 3, 97, 'physical', 'SKU-97-1', '{\"Material\":\"rexine\",\"Dimensions\":\"94x228\",\"Color\":\"Red\"}', NULL, 1135.00, NULL, 0.00, 0.00, 1135.00, 1.00, 1135.00, 0.00, 1135.00, 5.00, 56.75, 56.75, 1191.75, 'percentage', 10.00, 113.50, NULL, NULL, 1.00, '2025-09-25 00:12:02', '2025-09-25 00:12:02'),
(18, 16, 9, 1, 121, 'physical', 'SKU-121-1', '{\"Model\":\"ProMax\",\"Specifications\":\"256GB Storage\"}', 7, 990.00, 'percentage', 15.00, 148.50, 841.50, 1.00, 841.50, 0.00, 841.50, 5.00, 42.08, 42.08, 883.58, 'percentage', 10.00, 84.15, NULL, NULL, 1.00, '2025-09-25 00:12:02', '2025-09-25 00:12:02'),
(19, 16, 9, 1, 122, 'physical', 'SKU-122-1', '{\"Model\":\"ProMax\",\"Specifications\":\"256GB Storage\"}', NULL, 900.00, NULL, 0.00, 0.00, 900.00, 1.00, 900.00, 0.00, 900.00, 5.00, 45.00, 45.00, 945.00, 'percentage', 10.00, 90.00, NULL, NULL, 1.00, '2025-09-25 00:12:02', '2025-09-25 00:12:02'),
(20, 17, 1, 1, 221, NULL, '7l3vCalJ', '{\"Weight\":\"1000g\",\"color\":\"red\"}', NULL, 100.00, NULL, 0.00, 0.00, 100.00, 1.00, 100.00, 0.00, 100.00, 5.00, 5.00, 5.00, 105.00, NULL, 0.00, 0.00, NULL, NULL, 1.00, '2025-09-25 06:10:22', '2025-09-25 06:10:22');

-- --------------------------------------------------------

--
