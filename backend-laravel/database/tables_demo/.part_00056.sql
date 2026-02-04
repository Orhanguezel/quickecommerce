-- Table structure for table `product_brand`
--

CREATE TABLE `product_brand` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `brand_name` varchar(255) NOT NULL,
  `brand_slug` varchar(255) NOT NULL,
  `brand_logo` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `seller_relation_with_brand` varchar(255) DEFAULT NULL,
  `authorization_valid_from` timestamp NULL DEFAULT NULL,
  `authorization_valid_to` timestamp NULL DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_brand`
--

INSERT INTO `product_brand` (`id`, `brand_name`, `brand_slug`, `brand_logo`, `meta_title`, `meta_description`, `seller_relation_with_brand`, `authorization_valid_from`, `authorization_valid_to`, `display_order`, `created_by`, `updated_by`, `status`, `created_at`, `updated_at`) VALUES
(28, 'Pedigree', 'pedigree-1', '1296', 'Meta Title for Pedigree', 'Meta description for Pedigree', NULL, NULL, NULL, 1, 1, 1, 1, '2025-03-10 01:43:07', '2025-03-24 02:16:20'),
(29, 'Hill’s Science Diet', 'hill’s-science-diet', '1296', 'Meta Title for Hill’s Science Diet', 'Meta description for Hill’s Science Diet', NULL, NULL, NULL, 2, 1, 1, 1, '2025-03-10 01:43:07', '2025-07-23 05:27:34'),
(30, 'Royal Canin', 'royal-canin-1', '1296', 'Meta Title for Royal Canin', 'Meta description for Royal Canin', NULL, NULL, NULL, 3, 1, 1, 1, '2025-03-10 01:43:07', '2025-03-24 02:16:16'),
(31, 'SeaPak', 'seapak-1', '1296', 'Meta Title for SeaPak', 'Meta description for SeaPak', NULL, NULL, NULL, 1, 1, 1, 1, '2025-03-10 01:43:07', '2025-07-23 05:26:27'),
(32, 'Wild Planet', 'wild-planet-1', '1296', 'Meta Title for Wild Planet', 'Meta description for Wild Planet', NULL, NULL, NULL, 2, 1, 1, 1, '2025-03-10 01:43:07', '2025-07-20 05:44:24'),
(46, 'Scott Rogers', 'scott-rogers', '1296', 'Enim quod fugiat libero nobis adipisicing et minima ut officiis ratione esse nihil ex animi autem ex', 'Consectetur aut dolor harum pariatur Iusto consequatur Eum omnis', NULL, NULL, NULL, 92, NULL, NULL, 1, '2025-09-08 02:53:37', '2025-09-08 02:53:37');

-- --------------------------------------------------------

--
