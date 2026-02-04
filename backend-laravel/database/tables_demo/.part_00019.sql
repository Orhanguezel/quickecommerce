-- Table structure for table `delivery_man_reviews`
--

CREATE TABLE `delivery_man_reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `deliveryman_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `review` longtext DEFAULT NULL COMMENT 'Customer’s feedback about the deliveryman',
  `rating` tinyint(3) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Rating from 1 to 5',
  `is_verified` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Indicates if the review has been verified by the admin',
  `reviewed_at` timestamp NULL DEFAULT NULL COMMENT 'The time when the review was created',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
