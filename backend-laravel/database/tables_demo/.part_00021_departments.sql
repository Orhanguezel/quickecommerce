
INSERT INTO `departments` (`id`, `name`, `status`, `created_at`, `updated_at`) VALUES
(10, 'Teknik Destek / BT', 1, '2025-03-10 01:43:10', '2025-05-22 04:40:56'),
(14, 'Müşteri Destek', 1, '2025-04-27 06:58:25', '2025-05-22 04:40:14')
ON DUPLICATE KEY UPDATE
  `name`       = VALUES(`name`),
  `status`     = VALUES(`status`),
  `created_at` = VALUES(`created_at`),
  `updated_at` = VALUES(`updated_at`);

-- --------------------------------------------------------
