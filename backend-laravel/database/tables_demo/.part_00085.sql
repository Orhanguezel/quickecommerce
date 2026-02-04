-- Table structure for table `system_commissions`
--

CREATE TABLE `system_commissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subscription_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `commission_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `commission_type` varchar(255) DEFAULT NULL,
  `commission_amount` decimal(8,2) NOT NULL DEFAULT 0.00,
  `default_order_commission_rate` decimal(8,2) DEFAULT NULL,
  `default_delivery_commission_charge` decimal(8,2) DEFAULT NULL,
  `order_shipping_charge` decimal(8,2) DEFAULT NULL,
  `order_confirmation_by` varchar(255) NOT NULL DEFAULT 'deliveryman',
  `order_include_tax_amount` tinyint(1) NOT NULL DEFAULT 0,
  `order_additional_charge_enable_disable` tinyint(1) NOT NULL DEFAULT 0,
  `order_additional_charge_name` varchar(255) DEFAULT NULL,
  `order_additional_charge_amount` decimal(8,2) DEFAULT NULL,
  `order_additional_charge_commission` decimal(8,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_commissions`
--

INSERT INTO `system_commissions` (
  `id`,
  `subscription_enabled`,
  `commission_enabled`,
  `commission_type`,
  `commission_amount`,
  `default_order_commission_rate`,
  `default_delivery_commission_charge`,
  `order_shipping_charge`,
  `order_confirmation_by`,
  `order_include_tax_amount`,
  `order_additional_charge_enable_disable`,
  `order_additional_charge_name`,
  `order_additional_charge_amount`,
  `order_additional_charge_commission`,
  `created_at`,
  `updated_at`
) VALUES
(
  1,
  1,
  1,
  'percentage',
  10.00,
  20.00,
  10.00,
  1.00,
  'deliveryman',
  1,
  1,
  'İşlem Ücreti',
  0.00,
  0.00,
  NULL,
  '2025-09-23 04:21:46'
);
