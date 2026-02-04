-- Table structure for table `product_specifications`
--

CREATE TABLE `product_specifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `dynamic_field_id` bigint(20) UNSIGNED DEFAULT NULL,
  `dynamic_field_value_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Used only for select/multiselect/checkbox/radio',
  `name` varchar(255) DEFAULT NULL,
  `type` enum('text','textarea','select','multiselect','number','date','time','color','boolean','checkbox','radio') NOT NULL,
  `custom_value` longtext DEFAULT NULL COMMENT 'Free input value (text, textarea, number, date, time, boolean)',
  `status` varchar(255) NOT NULL DEFAULT '1' COMMENT '0: Inactive, 1: Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_specifications`
--

INSERT INTO `product_specifications` (`id`, `product_id`, `dynamic_field_id`, `dynamic_field_value_id`, `name`, `type`, `custom_value`, `status`, `created_at`, `updated_at`) VALUES
(4, 251, 14, 49, 'Dimensions', 'select', '30cm x 20cm', '1', '2025-09-04 04:13:47', '2025-09-04 04:13:47'),
(5, 251, 15, 52, 'Waterproof', 'boolean', 'No', '1', '2025-09-04 04:13:47', '2025-09-04 04:13:47'),
(6, 251, 16, NULL, 'Strap', 'text', 'dddddddddddd tttt', '1', '2025-09-04 04:13:47', '2025-09-04 04:13:47'),
(31, 252, 14, 50, 'Dimensions', 'select', '50cm x 40cm', '1', '2025-09-06 22:37:48', '2025-09-06 22:37:48'),
(32, 252, 15, 52, 'Waterproof', 'boolean', 'No', '1', '2025-09-06 22:37:48', '2025-09-06 22:37:48'),
(33, 252, 16, NULL, 'Strap', 'text', 'asdfasdf', '1', '2025-09-06 22:37:48', '2025-09-06 22:37:48'),
(34, 252, 19, 57, 'New Dynamic', 'select', 'asdf', '1', '2025-09-06 22:37:48', '2025-09-06 22:37:48'),
(63, 254, 14, 49, 'Dimensions', 'select', '30cm x 20cm', '1', '2025-09-07 02:56:08', '2025-09-07 02:56:08'),
(64, 254, 15, 51, 'Waterproof', 'boolean', 'Yes', '1', '2025-09-07 02:56:08', '2025-09-07 02:56:08'),
(65, 254, 16, NULL, 'Strap', 'text', 'asdf', '1', '2025-09-07 02:56:08', '2025-09-07 02:56:08'),
(66, 254, 19, 57, 'New Dynamic', 'select', 'asdf', '1', '2025-09-07 02:56:09', '2025-09-07 02:56:09'),
(67, 254, 20, NULL, 'Multi Select Dynamic field', 'multiselect', 'rrrrrrrrrrrrrrrrrr', '1', '2025-09-07 02:56:09', '2025-09-07 02:56:09'),
(73, 253, 14, 50, 'Dimensions', 'select', '50cm x 40cm', '1', '2025-09-07 05:43:34', '2025-09-07 05:43:34'),
(74, 253, 15, 51, 'Waterproof', 'boolean', 'Yes', '1', '2025-09-07 05:43:34', '2025-09-07 05:43:34'),
(75, 253, 16, NULL, 'Strap', 'text', 'asdfghjkkl', '1', '2025-09-07 05:43:34', '2025-09-07 05:43:34'),
(76, 253, 19, 57, 'New Dynamic', 'select', 'asdf', '1', '2025-09-07 05:43:34', '2025-09-07 05:43:34'),
(77, 253, 20, NULL, 'Multi Select Dynamic field', 'multiselect', 'rrrrrrrrrrrrrrrrrr', '1', '2025-09-07 05:43:34', '2025-09-07 05:43:34'),
(78, 253, 21, NULL, 'Checkbox new field', 'checkbox', 'Male,Female', '1', '2025-09-07 05:43:34', '2025-09-07 05:43:34'),
(79, 255, 14, NULL, 'Dimensions', 'select', NULL, '1', '2025-09-07 22:52:26', '2025-09-07 22:52:26'),
(80, 255, 15, NULL, 'Waterproof', 'boolean', NULL, '1', '2025-09-07 22:52:26', '2025-09-07 22:52:26'),
(81, 255, 16, NULL, 'Strap', 'text', NULL, '1', '2025-09-07 22:52:27', '2025-09-07 22:52:27'),
(82, 255, 19, 57, 'New Dynamic', 'select', 'asdf', '1', '2025-09-07 22:52:27', '2025-09-07 22:52:27'),
(83, 255, 20, NULL, 'Multi Select Dynamic field', 'multiselect', NULL, '1', '2025-09-07 22:52:27', '2025-09-07 22:52:27'),
(84, 255, 21, NULL, 'Checkbox new field', 'checkbox', NULL, '1', '2025-09-07 22:52:27', '2025-09-07 22:52:27'),
(85, 256, 18, NULL, 'Skin Type', 'select', NULL, '1', '2025-09-08 02:19:00', '2025-09-08 02:19:00'),
(88, 258, 14, NULL, 'Dimensions', 'select', NULL, '1', '2025-09-08 02:36:20', '2025-09-08 02:36:20'),
(89, 258, 15, NULL, 'Waterproof', 'boolean', NULL, '1', '2025-09-08 02:36:20', '2025-09-08 02:36:20'),
(90, 258, 16, NULL, 'Strap', 'text', NULL, '1', '2025-09-08 02:36:20', '2025-09-08 02:36:20'),
(91, 258, 19, NULL, 'New Dynamic', 'select', NULL, '1', '2025-09-08 02:36:20', '2025-09-08 02:36:20'),
(92, 258, 20, NULL, 'Multi Select Dynamic field', 'multiselect', NULL, '1', '2025-09-08 02:36:20', '2025-09-08 02:36:20'),
(93, 258, 21, NULL, 'Checkbox new field', 'checkbox', NULL, '1', '2025-09-08 02:36:20', '2025-09-08 02:36:20'),
(94, 257, 18, NULL, 'Skin Type', 'select', NULL, '1', '2025-09-08 02:37:14', '2025-09-08 02:37:14'),
(95, 259, 14, NULL, 'Dimensions', 'select', NULL, '1', '2025-09-08 03:57:17', '2025-09-08 03:57:17'),
(96, 259, 15, NULL, 'Waterproof', 'boolean', NULL, '1', '2025-09-08 03:57:17', '2025-09-08 03:57:17'),
(97, 259, 16, NULL, 'Strap', 'text', NULL, '1', '2025-09-08 03:57:17', '2025-09-08 03:57:17'),
(98, 259, 19, NULL, 'New Dynamic', 'select', NULL, '1', '2025-09-08 03:57:17', '2025-09-08 03:57:17'),
(99, 259, 20, NULL, 'Multi Select Dynamic field', 'multiselect', NULL, '1', '2025-09-08 03:57:17', '2025-09-08 03:57:17'),
(100, 259, 21, NULL, 'Checkbox new field', 'checkbox', NULL, '1', '2025-09-08 03:57:17', '2025-09-08 03:57:17'),
(101, 263, 14, 48, 'Dimensions', 'select', '40cm x 30cm', '1', '2025-09-09 22:15:45', '2025-09-09 22:15:45'),
(102, 263, 15, 51, 'Waterproof', 'boolean', 'Yes', '1', '2025-09-09 22:15:45', '2025-09-09 22:15:45'),
(103, 263, 16, NULL, 'Strap', 'text', NULL, '1', '2025-09-09 22:15:45', '2025-09-09 22:15:45'),
(104, 263, 19, 57, 'Material', 'select', 'Leather', '1', '2025-09-09 22:15:45', '2025-09-09 22:15:45'),
(105, 264, 14, NULL, 'Dimensions', 'select', NULL, '1', '2025-09-09 22:20:39', '2025-09-09 22:20:39'),
(106, 264, 15, NULL, 'Waterproof', 'boolean', NULL, '1', '2025-09-09 22:20:39', '2025-09-09 22:20:39'),
(107, 264, 16, NULL, 'Strap', 'text', NULL, '1', '2025-09-09 22:20:39', '2025-09-09 22:20:39'),
(108, 264, 19, 57, 'Material', 'select', 'Leather', '1', '2025-09-09 22:20:39', '2025-09-09 22:20:39'),
(109, 265, 14, NULL, 'Dimensions', 'select', NULL, '1', '2025-09-09 22:24:55', '2025-09-09 22:24:55'),
(110, 265, 15, NULL, 'Waterproof', 'boolean', NULL, '1', '2025-09-09 22:24:55', '2025-09-09 22:24:55'),
(111, 265, 16, NULL, 'Strap', 'text', NULL, '1', '2025-09-09 22:24:55', '2025-09-09 22:24:55'),
(112, 265, 19, 57, 'Material', 'select', 'Leather', '1', '2025-09-09 22:24:55', '2025-09-09 22:24:55'),
(113, 273, 14, 50, 'Dimensions', 'select', '50cm x 40cm', '1', '2025-09-17 23:35:01', '2025-09-17 23:35:01'),
(114, 273, 15, NULL, 'Waterproof', 'boolean', NULL, '1', '2025-09-17 23:35:01', '2025-09-17 23:35:01'),
(115, 273, 16, NULL, 'Strap', 'text', 'Totam aliqua Non voluptatum quia autem dignissimos deserunt dolor vitae qui omnis dicta velit tempor aliquam odit rerum mollit', '1', '2025-09-17 23:35:01', '2025-09-17 23:35:01'),
(116, 273, 19, 57, 'Material', 'select', 'Leather', '1', '2025-09-17 23:35:01', '2025-09-17 23:35:01'),
(121, 79, 14, 48, 'Dimensions', 'select', '40cm x 30cm', '1', '2025-09-22 02:46:51', '2025-09-22 02:46:51'),
(122, 79, 15, 51, 'Waterproof', 'boolean', 'Yes', '1', '2025-09-22 02:46:51', '2025-09-22 02:46:51'),
(123, 79, 16, NULL, 'Strap', 'text', 'Strap yes', '1', '2025-09-22 02:46:51', '2025-09-22 02:46:51'),
(124, 79, 19, 57, 'Material', 'select', 'Leather', '1', '2025-09-22 02:46:51', '2025-09-22 02:46:51'),
(125, 241, 14, NULL, 'Dimensions', 'select', NULL, '1', '2025-09-22 05:16:07', '2025-09-22 05:16:07'),
(126, 241, 15, NULL, 'Waterproof', 'boolean', NULL, '1', '2025-09-22 05:16:07', '2025-09-22 05:16:07'),
(127, 241, 16, NULL, 'Strap', 'text', NULL, '1', '2025-09-22 05:16:07', '2025-09-22 05:16:07'),
(128, 241, 19, NULL, 'Material', 'select', NULL, '1', '2025-09-22 05:16:07', '2025-09-22 05:16:07');

-- --------------------------------------------------------

--
