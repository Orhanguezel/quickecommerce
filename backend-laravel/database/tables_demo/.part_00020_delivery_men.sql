

INSERT INTO `delivery_men`
(`id`, `user_id`, `store_id`, `vehicle_type_id`, `area_id`, `identification_type`, `identification_number`, `identification_photo_front`, `identification_photo_back`, `address`, `is_verified`, `verified_at`, `status`, `created_by`, `updated_by`, `deleted_at`, `created_at`, `updated_at`) VALUES
(50, 6, NULL, 1, 1, 'nid', '5445345345345345345345', NULL, NULL, 'Atatürk Mah. Gül Sk. No:1, Kadıköy/İstanbul, Türkiye', 1, NULL, 'approved', 8, NULL, NULL, '2025-07-30 23:17:43', '2025-07-30 23:17:43'),
(54, 204, NULL, 2, 3, 'nid', '7567565746785678', NULL, NULL, NULL, 0, NULL, 'approved', 8, NULL, NULL, '2025-09-24 23:02:15', '2025-09-24 23:02:15')
ON DUPLICATE KEY UPDATE
  `user_id`                 = VALUES(`user_id`),
  `store_id`                = VALUES(`store_id`),
  `vehicle_type_id`         = VALUES(`vehicle_type_id`),
  `area_id`                 = VALUES(`area_id`),
  `identification_type`     = VALUES(`identification_type`),
  `identification_number`   = VALUES(`identification_number`),
  `identification_photo_front` = VALUES(`identification_photo_front`),
  `identification_photo_back`  = VALUES(`identification_photo_back`),
  `address`                 = VALUES(`address`),
  `is_verified`             = VALUES(`is_verified`),
  `verified_at`             = VALUES(`verified_at`),
  `status`                  = VALUES(`status`),
  `created_by`              = VALUES(`created_by`),
  `updated_by`              = VALUES(`updated_by`),
  `deleted_at`              = VALUES(`deleted_at`),
  `created_at`              = VALUES(`created_at`),
  `updated_at`              = VALUES(`updated_at`);
