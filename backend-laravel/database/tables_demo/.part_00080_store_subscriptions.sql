-- Table structure for table `store_subscriptions`
--

CREATE TABLE `store_subscriptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `store_id` int(10) UNSIGNED NOT NULL,
  `subscription_id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `validity` int(11) NOT NULL,
  `price` double NOT NULL DEFAULT 0,
  `pos_system` tinyint(1) NOT NULL DEFAULT 0,
  `self_delivery` tinyint(1) NOT NULL DEFAULT 0,
  `mobile_app` tinyint(1) NOT NULL DEFAULT 0,
  `live_chat` tinyint(1) NOT NULL DEFAULT 0,
  `order_limit` int(11) NOT NULL DEFAULT 0,
  `product_limit` int(11) NOT NULL DEFAULT 0,
  `product_featured_limit` int(11) NOT NULL DEFAULT 0,
  `payment_gateway` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL,
  `transaction_ref` varchar(255) DEFAULT NULL,
  `manual_image` varchar(255) DEFAULT NULL,
  `expire_date` timestamp NULL DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0=pending, 1=active, 2=cancelled',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_subscriptions`
--

INSERT INTO `store_subscriptions` (
  `id`, `store_id`, `subscription_id`, `name`, `type`, `validity`, `price`,
  `pos_system`, `self_delivery`, `mobile_app`, `live_chat`,
  `order_limit`, `product_limit`, `product_featured_limit`,
  `payment_gateway`, `payment_status`, `transaction_ref`, `manual_image`,
  `expire_date`, `status`, `created_at`, `updated_at`
) VALUES
-- Store #1 (grocery) — Standart Paket
(1, 1, 4, 'Standart Paket', NULL, 367, 100, 1, 1, 0, 1, 210, 310, 22, 'wallet', 'paid', NULL, NULL, '2026-09-26 05:46:55', 1, '2025-09-24 05:46:55', '2025-09-24 22:46:50'),

-- Store #2 (bakery) — Başlangıç Paketi
(2, 2, 1, 'Başlangıç Paketi', NULL, 30, 19.90, 0, 1, 0, 1, 120, 200, 10, 'wallet', 'paid', NULL, NULL, '2025-10-24 10:00:00', 1, '2025-09-24 10:00:00', '2025-09-24 10:00:00'),

-- Store #3 (medicine) — Kurumsal Paket (daha yüksek limit)
(3, 3, 4, 'Kurumsal Paket', NULL, 365, 249.90, 1, 1, 1, 1, 9999, 5000, 200, 'wallet', 'paid', NULL, NULL, '2026-09-24 10:05:00', 1, '2025-09-24 10:05:00', '2025-09-24 10:05:00'),

-- Store #4 (makeup) — Pro Paket (mobil + canlı destek)
(4, 4, 3, 'Pro Paket', NULL, 180, 149.90, 1, 0, 1, 1, 1500, 2000, 120, 'wallet', 'paid', NULL, NULL, '2026-03-23 10:10:00', 1, '2025-09-24 10:10:00', '2025-09-24 10:10:00'),

-- Store #5 (bags) — Gelişmiş Paket
(5, 5, 2, 'Gelişmiş Paket', NULL, 90, 69.90, 0, 0, 0, 1, 600, 800, 40, 'wallet', 'paid', NULL, NULL, '2025-12-23 10:15:00', 1, '2025-09-24 10:15:00', '2025-09-24 10:15:00'),

-- Store #6 (clothing) — Pro Paket (yüksek ürün limiti)
(6, 6, 3, 'Pro Paket', NULL, 365, 199.90, 1, 0, 1, 1, 5000, 8000, 300, 'wallet', 'paid', NULL, NULL, '2026-09-24 10:20:00', 1, '2025-09-24 10:20:00', '2025-09-24 10:20:00'),

-- Store #7 (furniture) — Standart Paket (daha düşük sipariş limiti, yüksek sepet)
(7, 7, 4, 'Standart Paket', NULL, 365, 129.90, 1, 1, 0, 1, 1200, 1500, 80, 'wallet', 'paid', NULL, NULL, '2026-09-24 10:25:00', 1, '2025-09-24 10:25:00', '2025-09-24 10:25:00'),

-- Store #8 (books) — Başlangıç Paketi (az ürün, orta sipariş)
(8, 8, 1, 'Başlangıç Paketi', NULL, 30, 9.90, 0, 0, 0, 1, 300, 500, 20, 'wallet', 'paid', NULL, NULL, '2025-10-24 10:30:00', 1, '2025-09-24 10:30:00', '2025-09-24 10:30:00'),

-- Store #9 (gadgets) — Kurumsal Paket (POS + mobil + yüksek limit)
(9, 9, 4, 'Kurumsal Paket', NULL, 365, 299.90, 1, 0, 1, 1, 9999, 12000, 500, 'wallet', 'paid', NULL, NULL, '2026-09-24 10:35:00', 1, '2025-09-24 10:35:00', '2025-09-24 10:35:00'),

-- Store #10 (animals-pet) — Gelişmiş Paket (self delivery açık)
(10, 10, 2, 'Gelişmiş Paket', NULL, 180, 89.90, 0, 1, 0, 1, 1200, 1500, 70, 'wallet', 'paid', NULL, NULL, '2026-03-23 10:40:00', 1, '2025-09-24 10:40:00', '2025-09-24 10:40:00'),

-- Store #11 (fish) — Standart Paket
(11, 11, 4, 'Standart Paket', NULL, 365, 119.90, 1, 1, 0, 1, 1800, 2200, 90, 'wallet', 'paid', NULL, NULL, '2026-09-24 10:45:00', 1, '2025-09-24 10:45:00', '2025-09-24 10:45:00');
