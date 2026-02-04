-- Table structure for table `product_authors`
--

CREATE TABLE `product_authors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `born_date` date DEFAULT NULL,
  `death_date` date DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '1 = active, 0 = inactive',
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_authors`
--

INSERT INTO `product_authors` (`id`, `profile_image`, `cover_image`, `name`, `slug`, `bio`, `born_date`, `death_date`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(6, '1300', NULL, 'Brenna Eaton', 'brenna-eaton', NULL, '1996-01-01', '2024-07-01', 1, 1, '2025-04-07 03:30:53', '2025-07-07 18:09:25'),
(7, '1300', NULL, 'Bill Gates', 'bill-gates', NULL, '1981-01-01', '2025-04-15', 1, 50, '2025-04-15 12:06:29', '2025-07-07 18:09:46');

-- --------------------------------------------------------

--
