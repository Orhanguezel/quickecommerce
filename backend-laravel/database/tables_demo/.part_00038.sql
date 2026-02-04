-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_master_id` bigint(20) UNSIGNED DEFAULT NULL,
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `invoice_number` varchar(255) DEFAULT NULL,
  `invoice_date` timestamp NULL DEFAULT NULL,
  `order_type` varchar(255) DEFAULT NULL COMMENT 'regular, pos',
  `delivery_option` varchar(255) DEFAULT NULL COMMENT 'home_delivery, parcel, takeaway',
  `delivery_type` varchar(255) DEFAULT NULL COMMENT 'standard, express, freight',
  `delivery_time` varchar(255) DEFAULT NULL,
  `order_amount` decimal(8,2) DEFAULT NULL,
  `order_amount_store_value` decimal(8,2) DEFAULT NULL,
  `order_amount_admin_commission` decimal(8,2) DEFAULT NULL,
  `product_discount_amount` decimal(8,2) DEFAULT NULL,
  `flash_discount_amount_admin` decimal(8,2) DEFAULT NULL,
  `coupon_discount_amount_admin` decimal(8,2) DEFAULT NULL,
  `shipping_charge` decimal(8,2) DEFAULT NULL,
  `delivery_charge_admin` decimal(8,2) DEFAULT NULL,
  `delivery_charge_admin_commission` decimal(8,2) DEFAULT NULL,
  `order_additional_charge_name` varchar(255) DEFAULT NULL,
  `order_additional_charge_amount` decimal(8,2) DEFAULT NULL,
  `order_additional_charge_store_amount` decimal(8,2) DEFAULT NULL,
  `order_admin_additional_charge_commission` decimal(8,2) DEFAULT NULL,
  `is_reviewed` tinyint(1) DEFAULT NULL,
  `confirmed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `cancel_request_by` bigint(20) UNSIGNED DEFAULT NULL,
  `cancel_request_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` bigint(20) UNSIGNED DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `delivery_completed_at` timestamp NULL DEFAULT NULL,
  `refund_status` enum('requested','processing','refunded','rejected') DEFAULT NULL COMMENT 'requested, processing, refunded, rejected',
  `payment_status` enum('pending','partially_paid','paid','cancelled','failed','refunded') NOT NULL DEFAULT 'pending' COMMENT 'pending, partially_paid, paid, cancelled, failed, refunded',
  `status` enum('pending','confirmed','processing','pickup','shipped','delivered','cancelled','on_hold') NOT NULL DEFAULT 'pending' COMMENT 'pending,confirmed,processing,pickup, shipped, delivered, cancelled, on_hold',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_master_id`, `store_id`, `area_id`, `invoice_number`, `invoice_date`, `order_type`, `delivery_option`, `delivery_type`, `delivery_time`, `order_amount`, `order_amount_store_value`, `order_amount_admin_commission`, `product_discount_amount`, `flash_discount_amount_admin`, `coupon_discount_amount_admin`, `shipping_charge`, `delivery_charge_admin`, `delivery_charge_admin_commission`, `order_additional_charge_name`, `order_additional_charge_amount`, `order_additional_charge_store_amount`, `order_admin_additional_charge_commission`, `is_reviewed`, `confirmed_by`, `confirmed_at`, `cancel_request_by`, `cancel_request_at`, `cancelled_by`, `cancelled_at`, `delivery_completed_at`, `refund_status`, `payment_status`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2509235NV60O2LY', '2025-09-23 05:44:41', 'regular', 'home_delivery', 'standard', NULL, 334.60, 190.00, 20.00, 200.00, 0.00, 0.00, 124.60, 112.14, 12.46, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 1, '2025-09-23 06:01:17', NULL, NULL, 'pending', 'cancelled', '2025-09-23 05:44:41', '2025-09-23 06:01:17'),
(2, 2, 1, 1, '2509235NVPR1BAH', '2025-09-23 06:03:39', 'regular', 'home_delivery', 'standard', NULL, 334.60, 190.00, 20.00, 200.00, 0.00, 0.00, 124.60, 112.14, 12.46, NULL, NULL, NULL, NULL, 0, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'processing', '2025-09-23 06:03:39', '2025-09-24 22:18:45'),
(3, 3, 1, 1, '2509245ON326YJN', '2025-09-23 21:50:37', 'regular', 'home_delivery', 'standard', NULL, 755.00, 570.00, 60.00, 600.00, 0.00, 0.00, 125.00, 113.00, 13.00, NULL, NULL, NULL, NULL, 0, 6, '2025-09-23 22:32:20', NULL, NULL, NULL, NULL, '2025-09-23 22:46:49', NULL, 'paid', 'delivered', '2025-09-23 21:50:37', '2025-09-23 22:46:49'),
(4, 4, 1, 1, '2509245OUIAS41K', '2025-09-24 02:07:27', 'regular', 'home_delivery', 'standard', NULL, 699.60, 522.50, 50.00, 500.00, 0.00, 0.00, 124.60, 112.14, 12.46, 'Packaging Charge', 50.00, 47.50, 2.50, 0, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'processing', '2025-09-24 02:07:27', '2025-09-24 22:25:26'),
(5, 5, 1, 1, '2509245OV2NOJ5Q', '2025-09-24 02:27:01', 'regular', 'home_delivery', 'standard', NULL, 239.60, 104.50, 10.00, 100.00, 0.00, 0.00, 124.60, 112.14, 12.46, 'Packaging Charge', 10.00, 9.50, 0.50, 0, 6, '2025-09-24 22:16:00', NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'processing', '2025-09-24 02:27:01', '2025-09-24 22:16:00'),
(6, 6, 1, 1, '2509245OW0DY2BT', '2025-09-24 02:59:26', 'regular', 'home_delivery', 'standard', NULL, 240.00, 105.00, 10.00, 100.00, 0.00, 0.00, 125.00, 113.00, 13.00, 'Packaging Charge', 10.00, 10.00, 1.00, 0, 6, '2025-09-24 03:18:21', NULL, NULL, NULL, NULL, '2025-09-24 03:18:42', NULL, 'paid', 'delivered', '2025-09-24 02:59:26', '2025-09-24 03:18:42'),
(7, 7, 1, 1, '2509245OWDIVLST', '2025-09-24 03:12:04', 'regular', 'home_delivery', 'standard', NULL, 230.00, 95.00, 10.00, 100.00, 0.00, 0.00, 125.00, 113.00, 13.00, NULL, NULL, NULL, NULL, 0, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'processing', '2025-09-24 03:12:04', '2025-09-24 22:56:01'),
(8, 8, 1, 1, '2509245OWSYXJF3', '2025-09-24 03:26:54', 'regular', 'home_delivery', 'standard', NULL, 311.75, 104.50, 10.00, 100.00, 0.00, 0.00, 196.75, 177.08, 19.68, 'Packaging Charge', 10.00, 9.50, 0.50, 0, 6, '2025-09-24 03:32:26', NULL, NULL, NULL, NULL, '2025-09-24 03:33:18', NULL, 'paid', 'delivered', '2025-09-24 03:26:54', '2025-09-24 03:33:18'),
(9, 9, 9, 1, '2509245OX1J6DF8', '2025-09-24 03:35:08', 'regular', 'home_delivery', 'standard', NULL, 1164.48, 875.16, 84.15, 10.00, 148.50, 0.00, 196.75, 177.08, 19.68, 'Packaging Fee', 84.15, 75.73, 8.42, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'pickup', '2025-09-24 03:35:08', '2025-09-24 21:47:25'),
(12, 12, 1, NULL, '2509245OZPP7WXC', '2025-09-24 05:07:34', 'pos', 'in_store', 'immediate', NULL, 434.49, 434.49, 0.00, 23.00, 4.10, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'delivered', '2025-09-24 05:07:34', '2025-09-24 05:07:34'),
(13, 13, 1, NULL, '2509245OZTR0DNX', '2025-09-24 05:11:27', 'pos', 'in_store', 'immediate', NULL, 173.25, 173.25, 0.00, 4.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'delivered', '2025-09-24 05:11:27', '2025-09-24 05:11:27'),
(14, 14, 7, 3, '2509255PWIBP407', '2025-09-25 00:02:14', 'regular', 'home_delivery', 'standard', NULL, 62335.80, 445.55, 46.90, 469.00, 0.00, 0.00, 61843.35, 55659.02, 6184.34, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'confirmed', '2025-09-25 00:02:14', '2025-09-27 22:47:01'),
(15, 15, 7, 3, '2509255PWSI5ICZ', '2025-09-25 00:12:01', 'regular', 'home_delivery', 'standard', NULL, 63527.55, 1523.80, 160.40, 534.00, 0.00, 0.00, 61843.35, 55659.02, 6184.34, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'confirmed', '2025-09-25 00:12:01', '2025-09-27 22:45:31'),
(16, 15, 9, 1, '2509255PWSINTIL', '2025-09-25 00:12:02', 'regular', 'home_delivery', 'standard', NULL, 2199.48, 1811.16, 174.15, 110.00, 148.50, 0.00, 196.75, 177.08, 19.68, 'Packaging Fee', 174.15, 156.73, 17.42, 0, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'processing', '2025-09-25 00:12:02', '2025-09-25 06:06:33'),
(17, 16, 1, 1, '2509255Q75CQGYQ', '2025-09-25 06:10:22', 'regular', 'home_delivery', 'standard', NULL, 1575.35, 114.50, 0.00, 100.00, 0.00, 0.00, 1460.35, 1314.32, 146.04, 'Packaging Charge', 10.00, 9.50, 0.50, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'pending', '2025-09-25 06:10:22', '2025-09-27 23:50:18');

-- --------------------------------------------------------

--
