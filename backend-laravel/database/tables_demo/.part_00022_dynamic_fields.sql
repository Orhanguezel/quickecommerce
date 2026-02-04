

INSERT INTO `dynamic_fields` (`id`, `name`, `slug`, `store_type`, `type`, `is_required`, `status`, `created_at`, `updated_at`) VALUES
(14, 'Ölçüler', 'dimensions', 'bags', 'select', 0, 'archived', '2025-09-03 04:54:13', '2025-09-22 05:16:07'),
(15, 'Su Geçirmez', 'waterproof', 'bags', 'boolean', 0, 'archived', '2025-09-03 04:56:32', '2025-09-22 05:16:07'),
(16, 'Askı', 'strap', 'bags', 'text', 0, 'archived', '2025-09-03 04:59:12', '2025-09-22 05:16:07'),
(18, 'Cilt Tipi', 'skin-type', 'makeup', 'select', 0, 'archived', '2025-09-04 06:02:47', '2025-09-08 02:37:14'),
(19, 'Materyal', 'material', 'bags', 'select', 1, 'archived', '2025-09-06 21:41:10', '2025-09-22 05:16:07'),
(20, 'Dozaj Formu', 'dosage-form', 'medicine', 'multiselect', 0, 'archived', '2025-09-06 22:52:44', '2025-09-09 21:48:26'),
(21, 'Cinsiyet', 'gender', 'clothing', 'checkbox', 0, 'archived', '2025-09-07 05:41:52', '2025-09-09 21:47:56'),
(22, 'Tarih / Saat', 'date-time', 'grocery', 'date', 0, 'active', '2025-09-20 03:02:24', '2025-09-20 03:02:24')
ON DUPLICATE KEY UPDATE
  `name`        = VALUES(`name`),
  `slug`        = VALUES(`slug`),
  `store_type`  = VALUES(`store_type`),
  `type`        = VALUES(`type`),
  `is_required` = VALUES(`is_required`),
  `status`      = VALUES(`status`),
  `created_at`  = VALUES(`created_at`),
  `updated_at`  = VALUES(`updated_at`);

-- --------------------------------------------------------
