INSERT INTO `coupons`
(`id`, `title`, `description`, `image`, `status`, `created_by`, `created_at`, `updated_at`)
VALUES
(22, 'WELCOME10', '<p>İlk siparişinizde %10 indirim.</p>', '1304', 1, 8, '2025-03-20 03:05:54', '2025-09-28 00:58:02'),
(23, 'ILKSIPARIS15', '<p>İlk siparişinize özel %15 indirim.</p>', '1304', 1, 8, '2025-03-20 03:06:10', '2025-09-28 00:58:02'),
(24, 'SEPET50', '<p>500 TL ve üzeri alışverişlerde 50 TL indirim.</p>', '1304', 1, 8, '2025-03-20 03:06:25', '2025-09-28 00:58:02'),
(25, 'KARGO0', '<p>Tüm siparişlerde ücretsiz kargo.</p>', '1304', 1, 8, '2025-03-20 03:06:40', '2025-09-28 00:58:02'),
(26, 'HAFTASONU20', '<p>Hafta sonuna özel %20 indirim.</p>', '1304', 1, 8, '2025-03-20 03:06:55', '2025-09-28 00:58:02')
ON DUPLICATE KEY UPDATE
  `title`       = VALUES(`title`),
  `description` = VALUES(`description`),
  `image`       = VALUES(`image`),
  `status`      = VALUES(`status`),
  `created_by`  = VALUES(`created_by`),
  `updated_at`  = VALUES(`updated_at`);
