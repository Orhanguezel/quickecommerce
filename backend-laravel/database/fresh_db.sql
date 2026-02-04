-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 06, 2025 at 09:28 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fresh_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `theme_name` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'who created the banner',
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `title_color` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_color` varchar(255) DEFAULT NULL,
  `background_image` varchar(255) DEFAULT NULL,
  `background_color` varchar(255) DEFAULT NULL,
  `thumbnail_image` varchar(255) DEFAULT NULL,
  `button_text` varchar(255) DEFAULT NULL,
  `button_text_color` varchar(255) DEFAULT NULL,
  `button_hover_color` varchar(255) DEFAULT NULL,
  `button_color` varchar(255) DEFAULT NULL,
  `redirect_url` varchar(255) DEFAULT NULL,
  `location` varchar(255) NOT NULL DEFAULT 'home_page' COMMENT 'the location of the banner Home Page or Store Page',
  `type` varchar(255) DEFAULT NULL COMMENT 'Ex: Banner-1, Banner-2, Banner-3',
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0=inactive, 1=active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `theme_name`, `user_id`, `store_id`, `title`, `title_color`, `description`, `description_color`, `background_image`, `background_color`, `thumbnail_image`, `button_text`, `button_text_color`, `button_hover_color`, `button_color`, `redirect_url`, `location`, `type`, `status`, `created_at`, `updated_at`) VALUES
(4, 'theme_one', 8, NULL, 'Everyday Essentials, Always Fresh', '#5B5B5B', 'Get high-quality groceries delivered fast from trusted local vendors.', '#3D3D3D', NULL, '#F2FDE7', '1306', 'Shop Now', '#ffffff', '#4b761d', '#669D2A', NULL, 'home_page', 'banner_two', 1, '2025-03-10 03:46:42', '2025-09-28 01:09:13'),
(7, 'theme_one', 8, NULL, 'Redefining Style for Every Season', '#3D3D3D', 'Up to 50% Sale Fashion', '#3D3D3D', NULL, '#EFFFDF', '1306', 'Buy Now', '#ffffff', '#468618', '#6A944B', NULL, 'home_page', 'banner_one', 1, '2025-03-10 04:00:32', '2025-09-28 01:09:08'),
(10, 'theme_one', 8, NULL, 'We are here for shopping lovers', '#5B5B5B', 'Get Extra 50% OFF', '#3D3D3D', NULL, '#FFF3E1', '1306', 'Shop Now', '#ffffff', '#925d2e', '#9B6B42', NULL, 'home_page', 'banner_one', 1, '2025-03-10 21:33:36', '2025-09-28 01:09:05'),
(13, 'theme_one', 8, NULL, 'Health Support Made Easy', '#5B5B5B', 'Safe, certified medicines with fast delivery at your convenience.', '#3D3D3D', NULL, '#FFEFD7', '1306', NULL, '#ffffff', '#e0951c', '#FFAC26', NULL, 'home_page', 'banner_two', 1, '2025-07-28 06:21:17', '2025-09-28 01:09:01'),
(14, 'theme_one', 8, NULL, 'Trendy Looks, Everyday Comfort', '#5B5B5B', 'Discover a wide collection of everyday outfits crafted for Comfort and confident living.', '#3D3D3D', NULL, '#FFEBF0', '1306', 'Shop Now', '#ffff', '#cf7766', '#ED8E7A', NULL, 'home_page', 'banner_two', 1, '2025-07-28 06:23:52', '2025-09-28 01:08:51'),
(15, 'theme_one', 8, NULL, 'Launch Your Online Store Today', '#4E6276', NULL, '#93989A', NULL, '#F5F7FF', '1306', NULL, '#ffff', '#0a3eb5', '#3A52B5', NULL, 'home_page', 'banner_three', 1, '2025-07-28 06:31:42', '2025-09-28 01:08:45'),
(17, 'theme_two', 8, NULL, 'Redefining Style for Every Season', '#ffffff', 'Up to 50% Sale Fashion', '#ffffff', NULL, '#F2EFEA', '1305', 'Shop Now', '#000000', '#000000', '#ffffff', NULL, 'home_page', 'banner_one', 1, '2025-09-21 04:45:54', '2025-09-28 01:03:11'),
(18, 'theme_two', 8, NULL, 'Beauty That Speaks', '#000000', 'Discover bold colors & flawless finishes', '#272727', NULL, '#FFD3AF', '1306', 'Shop Now', '#000000', '#000000', '#ffffff', NULL, 'home_page', 'banner_one', 1, '2025-09-21 04:52:08', '2025-09-28 01:04:25'),
(19, 'theme_two', 8, NULL, 'End of Season Sale', '#000000', 'Limited time offers — don’t miss out', '#252525', NULL, '#EECBD0', '1306', 'Shop Now', '#000000', '#000000', '#ffffff', NULL, 'home_page', 'banner_one', 1, '2025-09-21 04:55:51', '2025-09-28 01:05:07'),
(20, 'theme_two', 8, NULL, 'Everyday Luxe', '#000000', 'Premium looks, exclusive offers inside', '#0e0e0e', NULL, '#E3E2E0', '1306', 'Shop Now', '#000000', '#000000', '#ffffff', NULL, 'home_page', 'banner_one', 1, '2025-09-21 05:00:24', '2025-09-28 01:05:12'),
(21, 'theme_two', 8, NULL, 'Elegance Redefined', '#ffffff', 'Up to 40% Off Ladies’ Dresses – Style That Speaks', '#ffffff', NULL, '#D5C2C0', '1305', 'Shop Now', '#000000', '#000000', '#ffffff', NULL, 'home_page', 'banner_two', 1, '2025-09-21 05:27:00', '2025-09-28 01:05:51'),
(22, 'theme_two', 8, NULL, 'Carry It in Style', '#ffffff', 'test', '#ffffff', NULL, '#D8CFCF', '1306', 'Shop Now', '#000000', '#000000', '#ffffff', NULL, 'home_page', 'banner_two', 1, '2025-09-21 05:27:29', '2025-09-28 01:05:22'),
(23, 'theme_two', 8, NULL, 'Dress the Season', '#ffffff', 'Chic outfits now at up to 45% Off', '#ffffff', NULL, '#FFD3AF', '1306', 'Shop Now', '#000000', '#000000', '#ffffff', NULL, 'home_page', 'banner_two', 1, '2025-09-21 05:28:00', '2025-09-28 01:05:28');

-- --------------------------------------------------------













--
-- Table structure for table `blogs`
--

CREATE TABLE `blogs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `admin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `views` int(11) NOT NULL DEFAULT 0,
  `visibility` enum('public','private') NOT NULL DEFAULT 'public' COMMENT 'allowed only = private , public',
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0 = draft, 1 = published',
  `schedule_date` timestamp NULL DEFAULT NULL,
  `tag_name` text DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `meta_image` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blogs`
--

INSERT INTO `blogs` (`id`, `admin_id`, `category_id`, `title`, `slug`, `description`, `image`, `views`, `visibility`, `status`, `schedule_date`, `tag_name`, `meta_title`, `meta_description`, `meta_keywords`, `meta_image`, `created_at`, `updated_at`) VALUES
(2, 8, 3, 'Baking 101: Tips for Perfect Cakes and Pastries', 'my-first-blog-post', 'Baking is both an art and a science, requiring precision and the right techniques. One of the most important aspects of baking is measuring ingredients correctly, as even slight variations can affect the final outcome. Using room-temperature ingredients, especially eggs and butter, helps in achieving a smooth batter consistency. Preheating the oven is crucial, as placing batter in a cold oven can lead to uneven baking. Understanding your oven is also essential—some ovens have hot spots, which means rotating your trays midway through baking can lead to even results. Additionally, mixing techniques such as folding, whisking, and beating play a key role in achieving the desired texture. For beginners, starting with simple recipes before experimenting with complex techniques can build confidence. Lastly, always allow cakes and pastries to cool before frosting to prevent melting or a messy finish. With practice and patience, anyone can master the art of baking.', '1295', 11, 'public', 1, '2025-03-19 18:00:00', NULL, 'Perfect Cakes and Pastries', 'Perfect Cakes and Pastries', 'Cakes, Pastries', NULL, '2025-03-11 01:10:43', '2025-09-15 21:25:53'),
(3, 8, 4, 'Smart Grocery Shopping: Save Money and Reduce Waste', 'biva-mart', 'Grocery shopping can be expensive if not planned properly. The key to saving money is creating a well-structured grocery list based on your weekly meal plan. Buying in bulk and opting for seasonal produce can significantly reduce costs while ensuring you get the freshest ingredients. Another smart tip is to avoid impulse purchases by sticking to your shopping list and not shopping on an empty stomach. Understanding expiration dates and proper food storage techniques can also help prevent waste. Many people throw away food that is still good simply because they don\'t understand labeling terms like \"best before\" and \"use by.\" Additionally, exploring discount stores, loyalty programs, and digital coupons can help maximize savings. By adopting these strategies, you can cut costs while making sustainable choices for your household.', '1295', 7, 'public', 1, '2025-03-19 18:00:00', NULL, 'Smart Grocery', 'Grocery shopping can be expensive if not planned properly.', 'Grocery, Shopping, Money, Smart', NULL, '2025-03-11 01:10:46', '2025-09-17 03:21:31'),
(4, 8, 5, 'Must-Have Makeup Products for Every Skin Type', 'must-have-makeup-products-for-every-skin-type', 'Choosing the right makeup products can enhance your natural beauty while ensuring your skin stays healthy. For oily skin, matte foundations and oil-free primers help control shine and prevent clogged pores. Dry skin benefits from hydrating foundations and creamy concealers that provide moisture while offering coverage. Combination skin requires balancing products—lightweight foundations that control oil in the T-zone while keeping other areas hydrated. Sensitive skin users should opt for fragrance-free, hypoallergenic products to avoid irritation. A good setting spray can help keep makeup in place throughout the day, regardless of skin type. Additionally, multi-purpose products like BB creams and tinted moisturizers simplify routines while offering skincare benefits. Keeping makeup brushes clean is essential to prevent bacteria buildup and breakouts. Finding the right makeup products tailored to your skin’s needs can make a significant difference in your beauty routine.', '1295', 7, 'public', 1, '2025-03-19 18:00:00', NULL, NULL, NULL, 'Beauty, Makeup', NULL, '2025-03-19 22:43:10', '2025-09-21 02:43:20');

-- --------------------------------------------------------

--
-- Table structure for table `blog_categories`
--

CREATE TABLE `blog_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `meta_title` text DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '0 = Inactive, 1 = Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_categories`
--

INSERT INTO `blog_categories` (`id`, `name`, `slug`, `meta_title`, `meta_description`, `status`, `created_at`, `updated_at`) VALUES
(2, 'Health & Wellness', 'technology', 'Health & Wellness', 'Health & Wellness', 1, '2025-03-11 01:01:14', '2025-09-23 23:18:11'),
(3, 'Fashion', 'health-wellness', 'Update Again', 'Update', 0, '2025-03-11 01:01:32', '2025-09-25 04:28:55'),
(4, 'Grocery Insights', 'business-finance', 'Grocery Insights', 'Grocery Insights', 1, '2025-03-11 01:01:50', '2025-03-19 22:14:21'),
(5, 'Beauty & Makeup Trends', 'beauty-makeup-trends', 'Beauty & Makeup Trends', 'Beauty & Makeup Trends', 1, '2025-03-19 22:15:24', '2025-03-19 22:15:24'),
(6, 'Fashion & Style', 'fashion-style', 'Fashion & Style', 'Fashion & Style', 1, '2025-03-19 22:15:45', '2025-09-23 23:17:14'),
(7, 'Home & Living', 'home-living', 'Home & Living', 'Home & Living', 1, '2025-03-19 22:16:07', '2025-09-24 23:35:43'),
(8, 'Pet Care & Wellness', 'pet-care-wellness', 'Pet Care & Wellness', 'Pet Care & Wellness', 1, '2025-03-19 22:16:23', '2025-09-25 04:27:15');

-- --------------------------------------------------------

--
-- Table structure for table `blog_comments`
--

CREATE TABLE `blog_comments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `blog_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `comment` longtext NOT NULL,
  `like_count` int(11) NOT NULL DEFAULT 0,
  `dislike_count` int(11) NOT NULL DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_comment_reactions`
--

CREATE TABLE `blog_comment_reactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `blog_comment_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `reaction_type` enum('like','dislike') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_views`
--

CREATE TABLE `blog_views` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `blog_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_views`
--

INSERT INTO `blog_views` (`id`, `blog_id`, `user_id`, `ip_address`, `created_at`, `updated_at`) VALUES
(1, 5, NULL, '192.168.88.111', '2025-08-11 21:05:36', '2025-08-11 21:05:36'),
(2, 5, NULL, '192.168.88.158', '2025-08-12 02:57:51', '2025-08-12 02:57:51'),
(3, 7, NULL, '192.168.88.158', '2025-08-12 02:58:00', '2025-08-12 02:58:00'),
(4, 6, NULL, '192.168.88.158', '2025-08-12 03:01:18', '2025-08-12 03:01:18'),
(5, 1, NULL, '192.168.88.158', '2025-08-12 03:01:18', '2025-08-12 03:01:18'),
(6, 2, NULL, '192.168.88.158', '2025-08-12 03:01:24', '2025-08-12 03:01:24'),
(7, 12, NULL, '192.168.88.158', '2025-08-12 03:07:02', '2025-08-12 03:07:02'),
(8, 3, NULL, '192.168.88.158', '2025-08-12 03:40:50', '2025-08-12 03:40:50'),
(9, 6, NULL, '192.168.88.111', '2025-08-12 03:44:02', '2025-08-12 03:44:02'),
(10, 7, NULL, '192.168.88.111', '2025-08-12 03:44:07', '2025-08-12 03:44:07'),
(11, 1, NULL, '192.168.88.111', '2025-08-12 03:44:12', '2025-08-12 03:44:12'),
(12, 6, 1, NULL, '2025-08-12 06:33:00', '2025-08-12 06:33:00'),
(13, 2, 1, NULL, '2025-08-13 05:29:51', '2025-08-13 05:29:51'),
(14, 5, 1, NULL, '2025-08-13 05:30:12', '2025-08-13 05:30:12'),
(15, 2, NULL, '192.168.88.111', '2025-08-27 21:51:57', '2025-08-27 21:51:57'),
(16, 4, 1, NULL, '2025-09-01 23:30:14', '2025-09-01 23:30:14'),
(17, 1, 1, NULL, '2025-09-01 23:34:41', '2025-09-01 23:34:41'),
(18, 6, NULL, '192.168.88.181', '2025-09-09 05:38:00', '2025-09-09 05:38:00'),
(19, 7, 1, NULL, '2025-09-09 22:12:33', '2025-09-09 22:12:33'),
(20, 1, NULL, '192.168.88.126', '2025-09-15 21:25:20', '2025-09-15 21:25:20'),
(21, 2, NULL, '192.168.88.126', '2025-09-15 21:25:53', '2025-09-15 21:25:53'),
(22, 3, 1, NULL, '2025-09-17 03:21:31', '2025-09-17 03:21:31'),
(23, 7, NULL, '192.168.88.141', '2025-09-20 00:55:29', '2025-09-20 00:55:29'),
(24, 4, NULL, '192.168.88.111', '2025-09-21 02:43:20', '2025-09-21 02:43:20'),
(25, 5, NULL, '192.168.88.126', '2025-09-27 05:43:14', '2025-09-27 05:43:14'),
(26, 7, NULL, '192.168.88.126', '2025-09-27 22:18:58', '2025-09-27 22:18:58');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chats`
--

CREATE TABLE `chats` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `user_type` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chats`
--

INSERT INTO `chats` (`id`, `user_id`, `user_type`, `deleted_at`, `created_at`, `updated_at`) VALUES
(5, 6, 'deliveryman', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(7, 8, 'admin', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(62, 1, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(101, 1, 'customer', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(215, 3, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(217, 2, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(218, 4, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(219, 5, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(220, 6, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(221, 7, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(222, 8, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(223, 9, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(224, 10, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36'),
(225, 11, 'store', NULL, '2025-05-31 09:05:36', '2025-05-31 09:05:36');

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `chat_id` bigint(20) UNSIGNED NOT NULL,
  `receiver_chat_id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `sender_type` varchar(255) NOT NULL,
  `receiver_id` bigint(20) UNSIGNED NOT NULL,
  `receiver_type` varchar(255) NOT NULL,
  `message` longtext DEFAULT NULL,
  `file` varchar(255) DEFAULT NULL,
  `is_seen` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0: unseen, 1: seen',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_us_messages`
--

CREATE TABLE `contact_us_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `reply` text DEFAULT NULL,
  `replied_by` bigint(20) UNSIGNED DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0 = new, 1 = reviewed, 2 = resolved',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '0=inactive, 1=active',
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coupon_lines`
--

CREATE TABLE `coupon_lines` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `coupon_id` bigint(20) UNSIGNED DEFAULT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `coupon_code` varchar(255) NOT NULL,
  `discount_type` varchar(255) NOT NULL COMMENT 'percentage or amount',
  `discount` double NOT NULL,
  `min_order_value` double DEFAULT NULL,
  `max_discount` double DEFAULT NULL,
  `usage_limit` int(10) UNSIGNED DEFAULT NULL COMMENT 'Global usage limit for the coupon',
  `usage_count` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Number of times the coupon has been used globally',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '0=inactive, 1=active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `currencies`
--

CREATE TABLE `currencies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(10) NOT NULL,
  `symbol` varchar(10) NOT NULL,
  `exchange_rate` decimal(15,6) NOT NULL DEFAULT 1.000000,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `name`, `code`, `symbol`, `exchange_rate`, `is_default`, `status`, `created_at`, `updated_at`) VALUES
(3, 'USD', 'USD', '$', 1.000000, 1, 1, '2025-08-24 03:02:57', '2025-08-24 06:27:32'),
(6, 'BDT', 'BDT', 'TK', 122.000000, 0, 1, '2025-08-24 04:11:01', '2025-08-24 06:27:25'),
(7, 'EUR', 'EUR', '€', 2.000000, 0, 1, '2025-08-24 04:15:18', '2025-08-24 06:28:32');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `birth_day` date DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `def_lang` varchar(255) DEFAULT NULL,
  `firebase_token` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `facebook_id` varchar(255) DEFAULT NULL,
  `apple_id` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `password_changed_at` timestamp NULL DEFAULT NULL,
  `email_verify_token` text DEFAULT NULL,
  `email_verified` int(11) NOT NULL DEFAULT 0 COMMENT '0=unverified, 1=verified',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `verified` int(11) NOT NULL DEFAULT 0 COMMENT '0: not verified, 1: verified',
  `verify_method` varchar(255) NOT NULL DEFAULT 'email',
  `activity_notification` tinyint(1) NOT NULL DEFAULT 1,
  `marketing_email` tinyint(1) NOT NULL DEFAULT 0,
  `marketing_sms` tinyint(1) NOT NULL DEFAULT 0,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1: active, 0: inactive, 2: suspended',
  `online_at` timestamp NULL DEFAULT NULL,
  `deactivated_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `first_name`, `last_name`, `email`, `phone`, `image`, `birth_day`, `gender`, `def_lang`, `firebase_token`, `google_id`, `facebook_id`, `apple_id`, `password`, `password_changed_at`, `email_verify_token`, `email_verified`, `email_verified_at`, `verified`, `verify_method`, `activity_notification`, `marketing_email`, `marketing_sms`, `status`, `online_at`, `deactivated_at`, `remember_token`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'John', 'Doe', 'customer@gmail.com', '+8801711111111', '1300', '1990-01-12', 'male', NULL, 'cYpdbHyePwwtC-0rVkeiI2:APA91bE8s-pPNFd_7mBsPdeiQ4tDj0C6bakYYvFMp9RXjcGfx_oPAdzCR1NEMSpBtDXKgLSviRJRrbfpsFsYvV-cZwGJXW53_CteMmFv9_L6oXtEtobBDeo', NULL, NULL, NULL, '$2y$12$GLk.V7aTwFT1DIkYy.AU6uXxqJPw1D8PgPUcbEn3UMIErt82ecBpC', '2025-09-13 22:41:00', '430314', 1, '2025-08-06 00:14:42', 1, 'email', 1, 1, 0, 1, '2025-10-05 23:47:12', NULL, NULL, NULL, '2025-03-10 01:43:01', '2025-10-05 23:47:12');

-- --------------------------------------------------------

--
-- Table structure for table `customer_addresses`
--

CREATE TABLE `customer_addresses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'home' COMMENT 'home, office, others',
  `email` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `road` varchar(255) DEFAULT NULL,
  `house` varchar(255) DEFAULT NULL,
  `floor` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `status` int(11) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_addresses`
--

INSERT INTO `customer_addresses` (`id`, `customer_id`, `title`, `type`, `email`, `contact_number`, `address`, `latitude`, `longitude`, `area_id`, `road`, `house`, `floor`, `postal_code`, `is_default`, `status`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'Home', 'home', 'customer@gmail.com', '8801702111111', 'Gulshan 1, Dhaka 1212, Bangladesh', '23.7820624', '90.4160527', NULL, '120', NULL, '5', '1200', 0, 1, NULL, '2025-08-07 01:04:06', '2025-09-23 05:32:45'),
(18, 1, 'Mirpur', 'office', 'customer@gmail.com', '8801784655252', 'Mirpur-10, ঢাকা, Bangladesh', '23.9234214343835', '90.30891643125003', NULL, '10', '120', '5', '1200', 0, 1, '2025-09-29 02:43:20', '2025-09-23 05:32:45', '2025-09-29 02:43:20'),
(19, 1, 'Chirir bander', 'home', 'customer@gmail.com', '8801789998999', 'Dinajpur', '25.6221484', '88.6437963', NULL, '23', '23', '33', '5240', 0, 1, NULL, '2025-09-25 03:27:57', '2025-09-29 02:42:24'),
(20, 1, 'Address', 'home', 'customer@gmail.com', '+8801555555655', 'Dinajpur', '25.61750487588113', '88.64475921303635', NULL, '23', '23', '33', '5240', 0, 1, NULL, '2025-09-29 02:42:24', '2025-10-04 09:04:24');

-- --------------------------------------------------------

--
-- Table structure for table `customer_deactivation_reasons`
--

CREATE TABLE `customer_deactivation_reasons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `reason` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deliveryman_deactivation_reasons`
--

CREATE TABLE `deliveryman_deactivation_reasons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `deliveryman_id` bigint(20) UNSIGNED NOT NULL,
  `reason` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
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
-- Table structure for table `delivery_men`
--

CREATE TABLE `delivery_men` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `vehicle_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `identification_type` enum('nid','passport','driving_license') DEFAULT NULL COMMENT 'Type of ID provided',
  `identification_number` varchar(255) DEFAULT NULL COMMENT 'Unique identification number',
  `identification_photo_front` varchar(255) DEFAULT NULL COMMENT 'Front image of ID',
  `identification_photo_back` varchar(255) DEFAULT NULL COMMENT 'Back image of ID',
  `address` varchar(255) DEFAULT NULL,
  `is_verified` int(11) NOT NULL DEFAULT 0 COMMENT '0 - pending, 1 - verified, 2 - rejected',
  `verified_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','approved','inactive','rejected') NOT NULL DEFAULT 'pending',
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `delivery_men`
--

INSERT INTO `delivery_men` (`id`, `user_id`, `store_id`, `vehicle_type_id`, `area_id`, `identification_type`, `identification_number`, `identification_photo_front`, `identification_photo_back`, `address`, `is_verified`, `verified_at`, `status`, `created_by`, `updated_by`, `deleted_at`, `created_at`, `updated_at`) VALUES
(50, 6, NULL, 1, 1, 'nid', '5445345345345345345345', NULL, NULL, 'Gulshan 1, Dhaka 1212, Bangladesh', 1, NULL, 'approved', 8, NULL, NULL, '2025-07-30 23:17:43', '2025-07-30 23:17:43'),
(54, 204, NULL, 2, 3, 'nid', '7567565746785678', NULL, NULL, NULL, 0, NULL, 'approved', 8, NULL, '2025-10-05 23:42:37', '2025-09-24 23:02:15', '2025-10-05 23:42:37');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0 - Inactive, 1 - Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `status`, `created_at`, `updated_at`) VALUES
(10, 'Technical Support / IT', 1, '2025-03-10 01:43:10', '2025-05-22 04:40:56'),
(14, 'Customer Support', 1, '2025-04-27 06:58:25', '2025-05-22 04:40:14');

-- --------------------------------------------------------

--
-- Table structure for table `dynamic_fields`
--

CREATE TABLE `dynamic_fields` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `store_type` varchar(255) NOT NULL,
  `type` enum('text','textarea','select','multiselect','number','date','time','color','boolean','checkbox','radio') NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dynamic_fields`
--

INSERT INTO `dynamic_fields` (`id`, `name`, `slug`, `store_type`, `type`, `is_required`, `status`, `created_at`, `updated_at`) VALUES
(14, 'Dimensions', 'dimensions', 'bags', 'select', 0, 'archived', '2025-09-03 04:54:13', '2025-09-22 05:16:07'),
(15, 'Waterproof', 'waterproof', 'bags', 'boolean', 0, 'archived', '2025-09-03 04:56:32', '2025-09-22 05:16:07'),
(16, 'Strap', 'strap', 'bags', 'text', 0, 'archived', '2025-09-03 04:59:12', '2025-09-22 05:16:07'),
(18, 'Skin Type', 'skin-type', 'makeup', 'select', 0, 'archived', '2025-09-04 06:02:47', '2025-09-08 02:37:14'),
(19, 'Material', 'material', 'bags', 'select', 1, 'archived', '2025-09-06 21:41:10', '2025-09-22 05:16:07'),
(20, 'Dosage Form', 'dosage-form', 'medicine', 'multiselect', 0, 'archived', '2025-09-06 22:52:44', '2025-09-09 21:48:26'),
(21, 'Gender', 'gender', 'clothing', 'checkbox', 0, 'archived', '2025-09-07 05:41:52', '2025-09-09 21:47:56'),
(22, 'Date Time', 'date-time', 'grocery', 'date', 0, 'active', '2025-09-20 03:02:24', '2025-09-20 03:02:24');

-- --------------------------------------------------------

--
-- Table structure for table `dynamic_field_values`
--

CREATE TABLE `dynamic_field_values` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `dynamic_field_id` bigint(20) UNSIGNED NOT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dynamic_field_values`
--

INSERT INTO `dynamic_field_values` (`id`, `dynamic_field_id`, `value`, `created_at`, `updated_at`) VALUES
(42, 11, 'Select 2', '2025-09-03 03:37:53', '2025-09-03 03:37:53'),
(44, 12, 'Input 2', '2025-09-03 03:38:42', '2025-09-03 03:38:42'),
(46, 13, 'Synthetic', '2025-09-03 04:52:53', '2025-09-03 04:52:53'),
(47, 13, 'Canvas', '2025-09-03 04:53:13', '2025-09-03 04:53:13'),
(48, 14, '40cm x 30cm', '2025-09-03 04:54:26', '2025-09-03 04:54:26'),
(49, 14, '30cm x 20cm', '2025-09-03 04:54:40', '2025-09-03 04:54:40'),
(50, 14, '50cm x 40cm', '2025-09-03 04:54:55', '2025-09-03 04:54:55'),
(51, 15, 'Yes', '2025-09-03 04:57:02', '2025-09-03 04:57:02'),
(52, 15, 'No', '2025-09-03 04:57:18', '2025-09-03 04:57:18'),
(54, 18, 'Oily', '2025-09-04 06:03:02', '2025-09-04 06:03:02'),
(55, 18, 'Dry', '2025-09-04 06:03:09', '2025-09-04 06:03:09'),
(56, 18, 'Sensitive', '2025-09-04 06:03:16', '2025-09-04 06:03:16'),
(57, 19, 'Leather', '2025-09-06 22:24:38', '2025-09-09 21:36:13'),
(58, 20, 'Syrup', '2025-09-06 22:52:52', '2025-09-09 21:33:48'),
(59, 20, 'Capsule', '2025-09-06 22:52:56', '2025-09-09 21:33:39'),
(60, 20, 'Tablet', '2025-09-06 22:53:00', '2025-09-09 21:33:33'),
(61, 21, 'Male', '2025-09-07 05:42:11', '2025-09-07 05:42:11'),
(62, 21, 'Female', '2025-09-07 05:42:19', '2025-09-07 05:42:19'),
(63, 21, 'Others', '2025-09-07 05:42:27', '2025-09-07 05:42:27'),
(64, 20, 'Injection', '2025-09-09 21:33:59', '2025-09-09 21:33:59'),
(65, 20, 'Ointment', '2025-09-09 21:34:06', '2025-09-09 21:34:06'),
(66, 19, 'Canvas', '2025-09-09 21:36:19', '2025-09-09 21:36:19'),
(67, 19, 'Nylon', '2025-09-09 21:36:26', '2025-09-09 21:36:26'),
(68, 19, 'Cotton', '2025-09-09 21:36:37', '2025-09-09 21:36:37');

-- --------------------------------------------------------

--
-- Table structure for table `email_templates`
--

CREATE TABLE `email_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=active, 0=inactive',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `email_templates`
--

INSERT INTO `email_templates` (`id`, `type`, `name`, `subject`, `body`, `status`, `created_at`, `updated_at`) VALUES
(1, 'register', 'User Registration ffff', 'Welcome', '<h2> Welcome @name </h2>\n<p> Thank you for joining @site_name </p>\n<ul>\n  <li>Email: @email</li>\n  <li>Phone: @phone</li>\n</ul>', 1, '2025-03-10 01:43:11', '2025-07-23 22:17:01'),
(2, 'password-reset', 'Password Reset', 'Reset Your Password for Laravel', '<h2>Hello @name,</h2><p>We received a request to reset your password. Use this code:</p><h2>@reset_code</h2><p><i>If this wasn’t you, please ignore this email.</i></p>', 1, '2025-03-10 01:43:11', '2025-07-23 22:18:19'),
(3, 'store-creation', 'New Store Created', 'A New Store Has Been Created', '<h1>Hello, @owner_name,</h1>\n                           <p>Your store <strong>@store_name</strong> has been successfully created!</p>', 1, '2025-03-10 01:43:11', '2025-09-23 02:51:18'),
(4, 'subscription-expired', 'Subscription Expired Notification', 'Your Subscription Has Expired!', '<h1>Hello, @owner_name,</h1>\n                           <p>Your subscription for the store <strong>@store_name</strong> has expired on @expiry_date.</p>\n                           <p>Please renew your subscription to continue using our services.</p>', 1, '2025-03-10 01:43:11', '2025-03-25 00:00:44'),
(5, 'subscription-renewed', 'Subscription Renewal Confirmation', 'Your Subscription Has Been Successfully Renewed!', '<h1>Hello, @owner_name,</h1>\n                           <p>Your subscription for the store <strong>@store_name</strong> has been successfully renewed.</p>\n                           <p>New Expiry Date: @new_expiry_date</p>\n                           <p>Thank you for staying with us!</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(6, 'order-created', 'New Order Created', 'You Have a New Order!', '<h1>Hello @customer_name,</h1>\n                           <p>Your order (Order ID: @order_id) has been successfully placed.</p>\n                           <p>Order Amount: @order_amount</p>\n                           <p>We will notify you once your order status changes.</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(7, 'order-created-store', 'New Order Created for Your Store', 'You Have a New Order in Your Store!', '<h1>Hello @store_owner_name,</h1>\n                           <p>Your store <strong>@store_name</strong> has received a new order (Order ID: @order_id).</p>\n                           <p>Order Amount: @order_amount</p>\n                           <p>Please process the order as soon as possible.</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(8, 'order-created-admin', 'New Order Created', 'New Order Placed on the Platform!', '<h1>Hello Admin,</h1>\n                           <p>A new order (Order ID: @order_id) has been placed on the platform.</p>\n                           <p>Order Amount: @order_amount</p>\n                           <p>Please review the order details and take necessary action.</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(9, 'order-status-pending', 'Order Pending Notification', 'Your Order Status: Pending', '<h1>Hello @customer_name,</h1>\n                           <p>Your order (Order ID: @order_id) is now <strong>pending</strong>.</p>\n                           <p>We will notify you once the order status changes.</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(10, 'order-status-confirmed', 'Order Confirmed Notification', 'Your Order Status: Confirmed', '<h1>Hello @customer_name,</h1>\n                           <p>Your order (Order ID: @order_id) has been <strong>confirmed</strong>!</p>\n                           <p>We will notify you once it is processed.</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(11, 'order-status-processing', 'Order Processing Notification', 'Your Order Status: Processing', '<h1>Hello @customer_name,</h1>\n                           <p>Your order (Order ID: @order_id) is now <strong>being processed</strong>.</p>\n                           <p>We will notify you once it is shipped.</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(12, 'order-status-shipped', 'Order Shipped Notification', 'Your Order Status: Shipped', '<h1>Hello @customer_name,</h1>\n                           <p>Your order (Order ID: @order_id) has been <strong>shipped</strong>!</p>\n                           <p>It is on its way to you and will arrive soon.</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(13, 'order-status-delivered', 'Order Delivered Notification', 'Your Order Has Been Delivered!', '<h1>Hello @customer_name,</h1>\n                           <p>Your order (Order ID: @order_id) has been <strong>delivered</strong>!</p>\n                           <p>We hope you enjoy your purchase!</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(14, 'order-status-cancelled', 'Order Cancelled Notification', 'Your Order Has Been Cancelled', '<h1>Hello @customer_name,</h1>\n                           <p>Your order (Order ID: @order_id) has been <strong>cancelled</strong>.</p>\n                           <p>If you have any questions, please contact our support team.</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(15, 'refund-customer', 'Refund Processed', 'Your Refund has Been Processed', '<h1>Hello @customer_name,</h1>\n                           <p>Your refund for Order ID: @order_id has been successfully processed.</p>\n                           <p>Refund Amount: @refund_amount</p>\n                           <p>The amount will be credited back to your account shortly.</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(16, 'refund-store', 'Refund Processed for Your Store', 'A Refund has Been Processed for an Order in Your Store', '<h1>Hello @store_owner_name,</h1>\n                           <p>A refund has been processed for an order in your store (Order ID: @order_id).</p>\n                           <p>Refund Amount: @refund_amount</p>\n                           <p>Please ensure your account is updated accordingly.</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(17, 'wallet-balance-added-customer', 'Customer Wallet Balance Added', 'Your Wallet Balance Has Been Updated', '<h1>Hello @customer_name,</h1>\n                           <p>Your wallet balance has been successfully updated.</p>\n                           <p>New Balance: @balance</p>\n                           <p>Thank you for using our service!</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(18, 'wallet-balance-added-store', 'Store Wallet Balance Added', 'Your Store Wallet Balance Has Been Updated', '<h1>Hello @store_owner_name,</h1>\n                           <p>Your store\'s wallet balance has been successfully updated.</p>\n                           <p>Store: @store_name</p>\n                           <p>New Balance: @balance</p>\n                           <p>Thank you for being a part of our platform!</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(19, 'store-withdrawal-request', 'Store Withdrawal Request', 'A Withdrawal Request Has Been Submitted', '<h1>Hello Admin,</h1>\n                           <p>A withdrawal request has been submitted by @store_owner_name for their store <strong>@store_name</strong>.</p>\n                           <p>Requested Amount: @amount</p>\n                           <p>Please review and take the necessary action.</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(20, 'store-withdrawal-approved', 'Store Withdrawal Approved', 'Your Withdrawal Request Has Been Approved', '<h1>Hello @store_owner_name,</h1>\n                           <p>Your withdrawal request for your store <strong>@store_name</strong> has been approved.</p>\n                           <p>Amount: @amount</p>\n                           <p>The amount will be transferred to your account shortly.</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(21, 'store-withdrawal-declined', 'Store Withdrawal Declined', 'Your Withdrawal Request Has Been Declined', '<h1>Hello @store_owner_name,</h1>\n                           <p>Your withdrawal request for your store <strong>@store_name</strong> has been declined.</p>\n                           <p>Amount: @amount</p>\n                           <p>If you have any questions, please contact the support team.</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(22, 'deliveryman-withdrawal-request', 'Deliveryman Withdrawal Request', 'Your Withdrawal Request Has Been Received', '<h1>Hello @deliveryman_name,</h1>\n                       <p>Your withdrawal request has been successfully submitted for the amount of @amount.</p>\n                       <p>Your request is being reviewed by the admin. You will receive a confirmation email once your request has been processed.</p>\n                       <p>Thank you for your hard work!</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(23, 'deliveryman-earning', 'Delivery Earnings Notification', 'You Have New Earnings!', '<h1>Hello, @deliveryman_name,</h1>\n                            <p>You\'ve received a new earning:</p>\n                            <p><strong>Order ID:</strong> @order_id</p>\n                            <p><strong>Order Amount:</strong> @order_amount</p>\n                            <p><strong>Earnings:</strong> @earnings_amount</p>\n                            <p>Thank you for your hard work!</p>', 1, '2025-03-10 01:43:11', '2025-03-10 01:43:11'),
(24, 'seller-register-for-admin', 'User Registration', 'Hello Admin, A New Seller Just Joined!', '<ul>\n<li><strong>Name:</strong> @name</li>\n<li><strong>Email:</strong> @email</li>\n<li><strong>Phone:</strong> @phone</li>\n</ul>', 1, '2025-03-10 01:43:11', '2025-09-23 02:49:07');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `flash_sales`
--

CREATE TABLE `flash_sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `title_color` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_color` varchar(255) DEFAULT NULL,
  `background_color` varchar(255) DEFAULT NULL,
  `button_text` varchar(255) DEFAULT NULL,
  `button_text_color` varchar(255) DEFAULT NULL,
  `button_hover_color` varchar(255) DEFAULT NULL,
  `button_bg_color` varchar(255) DEFAULT NULL,
  `button_url` varchar(255) DEFAULT NULL,
  `timer_bg_color` varchar(255) DEFAULT NULL,
  `timer_text_color` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `discount_type` varchar(255) DEFAULT NULL COMMENT 'percentage or amount',
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `special_price` decimal(10,2) DEFAULT NULL COMMENT 'special price for product',
  `purchase_limit` int(10) UNSIGNED DEFAULT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1: active, 0: inactive',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `flash_sales`
--

INSERT INTO `flash_sales` (`id`, `title`, `title_color`, `description`, `description_color`, `background_color`, `button_text`, `button_text_color`, `button_hover_color`, `button_bg_color`, `button_url`, `timer_bg_color`, `timer_text_color`, `image`, `cover_image`, `discount_type`, `discount_amount`, `special_price`, `purchase_limit`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
(5, 'Your Daily Needs', '#000000', 'Get Now open all branch', '#212121', '#ffffff', 'Shop Now', '#ffffff', '#4D4D4D', '#000000', 'https://example.com', '#dd4a31', '#ffffff', '1308', NULL, 'percentage', 10.00, NULL, 128, '2025-03-24 14:01:00', '2026-01-12 04:00:00', 1, '2025-03-13 02:44:32', '2025-09-28 01:33:37');

-- --------------------------------------------------------

--
-- Table structure for table `flash_sale_products`
--

CREATE TABLE `flash_sale_products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `flash_sale_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `updated_by` int(10) UNSIGNED DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `flash_sale_products`
--

INSERT INTO `flash_sale_products` (`id`, `flash_sale_id`, `product_id`, `store_id`, `created_by`, `updated_by`, `rejection_reason`, `reviewed_at`, `status`, `created_at`, `updated_at`) VALUES
(318, 5, 1, 1, 8, NULL, NULL, NULL, 'approved', '2025-10-05 23:39:01', '2025-10-05 23:39:01'),
(319, 5, 38, 2, 8, NULL, NULL, NULL, 'approved', '2025-10-05 23:39:01', '2025-10-05 23:39:01'),
(320, 5, 53, 3, 8, NULL, NULL, NULL, 'approved', '2025-10-05 23:39:01', '2025-10-05 23:39:01'),
(321, 5, 91, 6, 8, NULL, NULL, NULL, 'approved', '2025-10-05 23:39:01', '2025-10-05 23:39:01'),
(322, 5, 97, 7, 8, NULL, NULL, NULL, 'approved', '2025-10-05 23:39:01', '2025-10-05 23:39:01'),
(323, 5, 137, 10, 8, NULL, NULL, NULL, 'approved', '2025-10-05 23:39:01', '2025-10-05 23:39:01'),
(324, 5, 121, 9, 8, NULL, NULL, NULL, 'approved', '2025-10-05 23:39:01', '2025-10-05 23:39:01'),
(325, 5, 144, 11, 8, NULL, NULL, NULL, 'approved', '2025-10-05 23:39:01', '2025-10-05 23:39:01');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `linked_social_accounts`
--

CREATE TABLE `linked_social_accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `provider_id` varchar(255) NOT NULL,
  `provider_name` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `live_locations`
--

CREATE TABLE `live_locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `trackable_type` varchar(255) NOT NULL,
  `trackable_id` bigint(20) UNSIGNED NOT NULL,
  `ref` varchar(255) DEFAULT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `live_locations`
--

INSERT INTO `live_locations` (`id`, `trackable_type`, `trackable_id`, `ref`, `order_id`, `latitude`, `longitude`, `last_updated`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\DeliveryMan', 6, NULL, 6, 23.8028426, 90.3701493, '2025-09-24 04:17:42', '2025-09-24 03:18:45', '2025-09-24 04:17:42'),
(2, 'App\\Models\\DeliveryMan', 6, NULL, 8, 23.8028426, 90.3701493, '2025-09-24 04:17:42', '2025-09-24 03:33:21', '2025-09-24 04:17:42');

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_type` varchar(255) DEFAULT NULL,
  `visibility` enum('public','private','restricted') DEFAULT 'public',
  `usage_type` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `format` varchar(255) DEFAULT NULL,
  `file_size` text DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `dimensions` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `media`
--

INSERT INTO `media` (`id`, `user_id`, `user_type`, `visibility`, `usage_type`, `name`, `format`, `file_size`, `path`, `alt_text`, `dimensions`, `created_at`, `updated_at`) VALUES
(525, 8, 'App\\Models\\User', 'public', NULL, '104944.jpg', 'png', '239.53 KB', 'uploads/media-uploader/default/1049441742463590.jpg', NULL, '1000 x 667 pixels', '2025-03-20 03:39:50', '2025-07-08 12:21:44'),
(570, 8, 'App\\Models\\User', 'public', NULL, 'login admin img.png', 'png', '117.05 KB', 'uploads/media-uploader/default/login-admin-img1743928028.png', NULL, '2000 x 2000 pixels', '2025-04-06 02:27:08', '2025-07-08 12:21:44'),
(1093, 8, 'App\\Models\\User', 'public', NULL, 'Get Started.png', 'png', '40.75 KB', 'uploads/media-uploader/default/get-started1752749619.png', NULL, '414 x 401 pixels', '2025-07-17 04:53:39', '2025-07-17 04:53:39'),
(1094, 8, 'App\\Models\\User', 'public', NULL, 'Build Your Store.png', 'png', '33.69 KB', 'uploads/media-uploader/default/build-your-store1752749625.png', NULL, '474 x 385 pixels', '2025-07-17 04:53:45', '2025-07-17 04:53:45'),
(1095, 8, 'App\\Models\\User', 'public', NULL, 'Add Your Products.png', 'png', '47.5 KB', 'uploads/media-uploader/default/add-your-products1752749699.png', NULL, '531 x 411 pixels', '2025-07-17 04:54:59', '2025-07-17 04:54:59'),
(1096, 8, 'App\\Models\\User', 'public', NULL, 'Start Selling.png', 'png', '42.89 KB', 'uploads/media-uploader/default/start-selling1752749703.png', NULL, '474 x 401 pixels', '2025-07-17 04:55:03', '2025-07-17 04:55:03'),
(1097, 8, 'App\\Models\\User', 'public', NULL, 'Earn & Grow.png', 'png', '46.44 KB', 'uploads/media-uploader/default/earn-grow1752749705.png', NULL, '512 x 401 pixels', '2025-07-17 04:55:05', '2025-07-17 04:55:05'),
(1098, 8, 'App\\Models\\User', 'public', NULL, 'Scale Your Business.png', 'png', '38.71 KB', 'uploads/media-uploader/default/scale-your-business1752749706.png', NULL, '485 x 401 pixels', '2025-07-17 04:55:07', '2025-07-17 04:55:07'),
(1099, 8, 'App\\Models\\User', 'public', NULL, 'Personalized Storefront.png', 'png', '6.91 KB', 'uploads/media-uploader/default/personalized-storefront1752749881.png', NULL, '260 x 241 pixels', '2025-07-17 04:58:01', '2025-07-17 04:58:01'),
(1100, 8, 'App\\Models\\User', 'public', NULL, 'Hassle-Free Registration.png', 'png', '6.07 KB', 'uploads/media-uploader/default/hassle-free-registration1752749883.png', NULL, '260 x 241 pixels', '2025-07-17 04:58:03', '2025-07-17 04:58:03'),
(1101, 8, 'App\\Models\\User', 'public', NULL, 'Reach Millions of Customers.png', 'png', '10.7 KB', 'uploads/media-uploader/default/reach-millions-of-customers1752749885.png', NULL, '260 x 241 pixels', '2025-07-17 04:58:05', '2025-07-17 04:58:05'),
(1102, 8, 'App\\Models\\User', 'public', NULL, 'Product Management.png', 'png', '8.99 KB', 'uploads/media-uploader/default/product-management1752750016.png', NULL, '260 x 241 pixels', '2025-07-17 05:00:16', '2025-07-17 05:00:16'),
(1103, 8, 'App\\Models\\User', 'public', NULL, 'Fast & Reliable Shipping.png', 'png', '6.35 KB', 'uploads/media-uploader/default/fast-reliable-shipping1752750019.png', NULL, '260 x 241 pixels', '2025-07-17 05:00:19', '2025-07-17 05:00:19'),
(1104, 8, 'App\\Models\\User', 'public', NULL, 'Secure & Timely Payments.png', 'png', '6.76 KB', 'uploads/media-uploader/default/secure-timely-payments1752750021.png', NULL, '258 x 241 pixels', '2025-07-17 05:00:21', '2025-07-17 05:00:21'),
(1105, 8, 'App\\Models\\User', 'public', NULL, 'Smart Marketing Tools.png', 'png', '10.89 KB', 'uploads/media-uploader/default/smart-marketing-tools1752750023.png', NULL, '260 x 241 pixels', '2025-07-17 05:00:23', '2025-07-17 05:00:23'),
(1106, 8, 'App\\Models\\User', 'public', NULL, 'Dedicated Seller Support.png', 'png', '8.96 KB', 'uploads/media-uploader/default/dedicated-seller-support1752750025.png', NULL, '260 x 241 pixels', '2025-07-17 05:00:25', '2025-07-17 05:00:25'),
(1107, 8, 'App\\Models\\User', 'public', NULL, 'Scale & Succeed.png', 'png', '4.9 KB', 'uploads/media-uploader/default/scale-succeed1752750028.png', NULL, '260 x 241 pixels', '2025-07-17 05:00:28', '2025-07-17 05:00:28'),
(1108, 8, 'App\\Models\\User', 'public', NULL, 'Need help Our experts.png', 'png', '78.47 KB', 'uploads/media-uploader/default/need-help-our-experts1752750137.png', NULL, '985 x 985 pixels', '2025-07-17 05:02:17', '2025-07-17 05:02:17'),
(1109, 8, 'App\\Models\\User', 'public', NULL, 'contact.png', 'png', '41.04 KB', 'uploads/media-uploader/default/contact1752751587.png', NULL, '538 x 475 pixels', '2025-07-17 05:26:28', '2025-07-17 05:26:28'),
(1111, 8, 'App\\Models\\User', 'public', NULL, 'Our Future Vision.png', 'png', '90.61 KB', 'uploads/media-uploader/default/our-future-vision1752752040.png', NULL, '1181 x 880 pixels', '2025-07-17 05:34:00', '2025-07-17 05:34:00'),
(1112, 8, 'App\\Models\\User', 'public', NULL, 'Overcoming Challenges.png', 'png', '62.72 KB', 'uploads/media-uploader/default/overcoming-challenges1752752042.png', NULL, '858 x 600 pixels', '2025-07-17 05:34:02', '2025-07-17 05:34:02'),
(1113, 8, 'App\\Models\\User', 'public', NULL, 'Our Vision and Beginning.png', 'png', '135.84 KB', 'uploads/media-uploader/default/our-vision-and-beginning1752752044.png', NULL, '903 x 880 pixels', '2025-07-17 05:34:04', '2025-07-17 05:34:04'),
(1114, 8, 'App\\Models\\User', 'public', NULL, 'Our vision.png', 'png', '78.07 KB', 'uploads/media-uploader/default/our-vision1752752223.png', NULL, '996 x 575 pixels', '2025-07-17 05:37:03', '2025-07-17 05:37:03'),
(1115, 8, 'App\\Models\\User', 'public', NULL, 'Our Mission.png', 'png', '73.12 KB', 'uploads/media-uploader/default/our-mission1752752227.png', NULL, '952 x 768 pixels', '2025-07-17 05:37:07', '2025-07-17 05:37:07'),
(1176, 8, 'App\\Models\\User', 'public', NULL, 'paypal.png', 'png', '6.18 KB', 'uploads/media-uploader/default/paypal1754548897.png', NULL, '155 x 45 pixels', '2025-08-07 00:41:37', '2025-08-07 00:41:37'),
(1177, 8, 'App\\Models\\User', 'public', NULL, 'stripe.png', 'png', '4.95 KB', 'uploads/media-uploader/default/stripe1754548961.png', NULL, '133 x 57 pixels', '2025-08-07 00:42:41', '2025-08-07 00:42:41'),
(1178, 8, 'App\\Models\\User', 'public', NULL, 'cash on delivery.png', 'png', '22.68 KB', 'uploads/media-uploader/default/cash-on-delivery1754549984.png', NULL, '942 x 434 pixels', '2025-08-07 00:59:45', '2025-08-07 00:59:45'),
(1179, 8, 'App\\Models\\User', 'public', NULL, 'Razorpay.png', 'png', '6.26 KB', 'uploads/media-uploader/default/razorpay1754550444.png', NULL, '152 x 32 pixels', '2025-08-07 01:07:24', '2025-08-07 01:07:24'),
(1180, 8, 'App\\Models\\User', 'public', NULL, 'paytam.png', 'png', '3.05 KB', 'uploads/media-uploader/default/paytam1754550467.png', NULL, '109 x 35 pixels', '2025-08-07 01:07:47', '2025-08-07 01:07:47'),
(1204, 8, 'App\\Models\\User', 'public', NULL, 'Mask group.png', 'png', '1.61 MB', 'uploads/media-uploader/default/mask-group1757561634.png', NULL, '1812 x 595 pixels', '2025-09-10 21:33:55', '2025-09-10 21:33:55'),
(1205, 8, 'App\\Models\\User', 'public', NULL, 'Group 1171281729.png', 'png', '1.84 MB', 'uploads/media-uploader/default/group-11712817291757846167.png', NULL, '1890 x 978 pixels', '2025-09-14 04:36:08', '2025-09-14 04:36:08'),
(1209, 8, 'App\\Models\\User', 'public', NULL, 'Rectangle 3464987.png', 'png', '447.85 KB', 'uploads/media-uploader/default/rectangle-34649871757924741.png', NULL, '610 x 456 pixels', '2025-09-15 02:25:41', '2025-09-15 02:25:41'),
(1210, 8, 'App\\Models\\User', 'public', NULL, 'Rectangle 3464988.png', 'png', '453.05 KB', 'uploads/media-uploader/default/rectangle-34649881757924744.png', NULL, '610 x 456 pixels', '2025-09-15 02:25:44', '2025-09-15 02:25:44'),
(1211, 8, 'App\\Models\\User', 'public', NULL, 'Rectangle 3464989.png', 'png', '422.32 KB', 'uploads/media-uploader/default/rectangle-34649891757924747.png', NULL, '610 x 456 pixels', '2025-09-15 02:25:47', '2025-09-15 02:25:47'),
(1212, 8, 'App\\Models\\User', 'public', NULL, 'Rectangle 3464990.png', 'png', '357.26 KB', 'uploads/media-uploader/default/rectangle-34649901757924920.png', NULL, '610 x 456 pixels', '2025-09-15 02:28:40', '2025-09-15 02:28:40'),
(1213, 8, 'App\\Models\\User', 'public', NULL, 'Rectangle 3464991.png', 'png', '394.02 KB', 'uploads/media-uploader/default/rectangle-34649911757924923.png', NULL, '610 x 456 pixels', '2025-09-15 02:28:43', '2025-09-15 02:28:43'),
(1214, 8, 'App\\Models\\User', 'public', NULL, 'Rectangle 3464992.png', 'png', '397.25 KB', 'uploads/media-uploader/default/rectangle-34649921757924926.png', NULL, '610 x 456 pixels', '2025-09-15 02:28:46', '2025-09-15 02:28:46'),
(1215, 8, 'App\\Models\\User', 'public', NULL, 'Group 1171278900.png', 'png', '2.62 KB', 'uploads/media-uploader/default/group-11712789001757925069.png', NULL, '65 x 60 pixels', '2025-09-15 02:31:09', '2025-09-15 02:31:09'),
(1216, 8, 'App\\Models\\User', 'public', NULL, 'Group 1171278904.png', 'png', '1.43 KB', 'uploads/media-uploader/default/group-11712789041757925072.png', NULL, '65 x 60 pixels', '2025-09-15 02:31:12', '2025-09-15 02:31:12'),
(1217, 8, 'App\\Models\\User', 'public', NULL, 'Group 1171278901.png', 'png', '1.69 KB', 'uploads/media-uploader/default/group-11712789011757925079.png', NULL, '65 x 60 pixels', '2025-09-15 02:31:19', '2025-09-15 02:31:19'),
(1218, 8, 'App\\Models\\User', 'public', NULL, 'Group 1171278910.png', 'png', '1.95 KB', 'uploads/media-uploader/default/group-11712789101757925083.png', NULL, '65 x 60 pixels', '2025-09-15 02:31:23', '2025-09-15 02:31:23'),
(1219, 8, 'App\\Models\\User', 'public', NULL, 'Group 1171278909.png', 'png', '1.54 KB', 'uploads/media-uploader/default/group-11712789091757925087.png', NULL, '65 x 60 pixels', '2025-09-15 02:31:27', '2025-09-15 02:31:27'),
(1220, 8, 'App\\Models\\User', 'public', NULL, 'Group 1171278908.png', 'png', '1.64 KB', 'uploads/media-uploader/default/group-11712789081757925090.png', NULL, '65 x 60 pixels', '2025-09-15 02:31:30', '2025-09-15 02:31:30'),
(1221, 8, 'App\\Models\\User', 'public', NULL, 'Group 1171278905.png', 'png', '2.04 KB', 'uploads/media-uploader/default/group-11712789051757925095.png', NULL, '65 x 60 pixels', '2025-09-15 02:31:35', '2025-09-15 02:31:35'),
(1222, 8, 'App\\Models\\User', 'public', NULL, 'Group 1171278911.png', 'png', '1.83 KB', 'uploads/media-uploader/default/group-11712789111757925099.png', NULL, '65 x 60 pixels', '2025-09-15 02:31:39', '2025-09-15 02:31:39'),
(1223, 8, 'App\\Models\\User', 'public', NULL, 'Group 1171278924.png', 'png', '21.66 KB', 'uploads/media-uploader/default/group-11712789241757925277.png', NULL, '315 x 315 pixels', '2025-09-15 02:34:37', '2025-09-15 02:34:37'),
(1242, 8, 'App\\Models\\User', 'public', NULL, 'logo white.png', 'png', '10.42 KB', 'uploads/media-uploader/default/logo-white1758014724.png', NULL, '238 x 98 pixels', '2025-09-16 03:25:24', '2025-09-16 03:25:24'),
(1294, 8, 'App\\Models\\User', 'public', NULL, 'logo-white1757938667.png', 'png', '3.28 KB', 'uploads/media-uploader/default/logo-white17579386671759037356.png', NULL, '281 x 101 pixels', '2025-09-27 23:29:16', '2025-09-27 23:29:16'),
(1297, 8, 'App\\Models\\User', 'public', NULL, 'store.png', 'png', '3.71 KB', 'uploads/media-uploader/default/store1759038264.png', NULL, '161 x 161 pixels', '2025-09-27 23:44:24', '2025-09-27 23:44:24'),
(1298, 8, 'App\\Models\\User', 'public', NULL, 'product.png', 'png', '12.49 KB', 'uploads/media-uploader/default/product1759039661.png', NULL, '841 x 841 pixels', '2025-09-28 00:07:41', '2025-09-28 00:07:41'),
(1299, 8, 'App\\Models\\User', 'public', NULL, 'product variation.png', 'png', '11.45 KB', 'uploads/media-uploader/default/product-variation1759039666.png', NULL, '881 x 881 pixels', '2025-09-28 00:07:46', '2025-09-28 00:07:46'),
(1301, 8, 'App\\Models\\User', 'public', NULL, 'contact-one.png', 'png', '1.71 KB', 'uploads/media-uploader/default/contact-one1759041601.png', NULL, '255 x 208 pixels', '2025-09-28 00:40:01', '2025-09-28 00:40:01'),
(1302, 8, 'App\\Models\\User', 'public', NULL, 'contact-2.png', 'png', '12.58 KB', 'uploads/media-uploader/default/contact-21759041860.png', NULL, '1858 x 562 pixels', '2025-09-28 00:44:21', '2025-09-28 00:44:21'),
(1303, 8, 'App\\Models\\User', 'public', NULL, 'login-register-page.png', 'png', '4.77 KB', 'uploads/media-uploader/default/login-register-page1759042140.png', NULL, '486 x 530 pixels', '2025-09-28 00:49:00', '2025-09-28 00:49:00'),
(1304, 8, 'App\\Models\\User', 'public', NULL, 'coupons.png', 'png', '13.21 KB', 'uploads/media-uploader/default/coupons1759042648.png', NULL, '701 x 761 pixels', '2025-09-28 00:57:28', '2025-09-28 00:57:28'),
(1305, 8, 'App\\Models\\User', 'public', NULL, 'home-banner-large.png', 'png', '28.11 KB', 'uploads/media-uploader/default/home-banner-large1759042980.png', NULL, '1281 x 1921 pixels', '2025-09-28 01:03:01', '2025-09-28 01:03:01'),
(1306, 8, 'App\\Models\\User', 'public', NULL, 'home-banner-small.png', 'png', '13.21 KB', 'uploads/media-uploader/default/home-banner-small1759043054.png', NULL, '701 x 761 pixels', '2025-09-28 01:04:15', '2025-09-28 01:04:15'),
(1307, 8, 'App\\Models\\User', 'public', NULL, 'slider.png', 'png', '20.11 KB', 'uploads/media-uploader/default/slider1759043650.png', NULL, '2250 x 750 pixels', '2025-09-28 01:14:10', '2025-09-28 01:14:10'),
(1308, 8, 'App\\Models\\User', 'public', NULL, 'flash-banner.png', 'png', '5.6 KB', 'uploads/media-uploader/default/flash-banner1759044731.png', NULL, '351 x 451 pixels', '2025-09-28 01:32:11', '2025-09-28 01:32:11'),
(1309, 8, 'App\\Models\\User', 'public', NULL, 'about-page-1.png', 'png', '13.21 KB', 'uploads/media-uploader/default/about-page-11759045634.png', NULL, '701 x 761 pixels', '2025-09-28 01:47:14', '2025-09-28 01:47:14'),
(1310, 8, 'App\\Models\\User', 'public', NULL, 'contact-one.png', 'png', '1.71 KB', 'uploads/media-uploader/default/contact-one1759048538.png', NULL, '255 x 208 pixels', '2025-09-28 02:35:38', '2025-09-28 02:35:38'),
(1311, 8, 'App\\Models\\User', 'public', NULL, 'user.png', 'png', '19 KB', 'uploads/media-uploader/default/user1759050187.png', NULL, '512 x 512 pixels', '2025-09-28 03:03:07', '2025-09-28 03:03:07'),
(1312, 8, 'App\\Models\\User', 'public', NULL, 'user.png', 'png', '19 KB', 'uploads/media-uploader/default/user1759050403.png', NULL, '512 x 512 pixels', '2025-09-28 03:06:43', '2025-09-28 03:06:43');

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `page_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `position` int(11) NOT NULL DEFAULT 0,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `parent_path` varchar(255) DEFAULT NULL,
  `menu_level` int(11) DEFAULT NULL,
  `menu_path` varchar(255) DEFAULT NULL,
  `menu_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`menu_content`)),
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `page_id`, `name`, `url`, `icon`, `position`, `parent_id`, `parent_path`, `menu_level`, `menu_path`, `menu_content`, `is_visible`, `status`, `created_at`, `updated_at`) VALUES
(11, NULL, 'Main Menu', '/', NULL, 0, NULL, NULL, 0, NULL, '\"[{\\\"id\\\":\\\"new-1753850842405-1\\\",\\\"label\\\":\\\"Home\\\",\\\"url\\\":\\\"\\/\\\",\\\"children\\\":[],\\\"parentId\\\":null,\\\"depth\\\":0,\\\"index\\\":0,\\\"isLast\\\":false,\\\"parent\\\":null},{\\\"id\\\":\\\"new-1753850842405-2\\\",\\\"label\\\":\\\"Product\\\",\\\"url\\\":\\\"products\\\",\\\"children\\\":[],\\\"parentId\\\":null,\\\"depth\\\":0,\\\"index\\\":1,\\\"isLast\\\":false,\\\"parent\\\":null},{\\\"id\\\":\\\"new-1753850842405-3\\\",\\\"label\\\":\\\"Category\\\",\\\"url\\\":\\\"product-categories\\\",\\\"children\\\":[],\\\"parentId\\\":null,\\\"depth\\\":0,\\\"index\\\":2,\\\"isLast\\\":false,\\\"parent\\\":null},{\\\"id\\\":\\\"new-1753850842405-4\\\",\\\"label\\\":\\\"Store\\\",\\\"url\\\":\\\"stores\\\",\\\"children\\\":[],\\\"parentId\\\":null,\\\"depth\\\":0,\\\"index\\\":3,\\\"isLast\\\":false,\\\"parent\\\":null},{\\\"id\\\":\\\"custom-1753778590299\\\",\\\"label\\\":\\\"Pages\\\",\\\"url\\\":\\\"\\/\\\",\\\"children\\\":[{\\\"id\\\":\\\"new-1754552096226-25\\\",\\\"label\\\":\\\"About Page\\\",\\\"url\\\":\\\"about\\\",\\\"children\\\":[],\\\"parentId\\\":\\\"custom-1753778590299\\\",\\\"depth\\\":1,\\\"index\\\":0,\\\"isLast\\\":false,\\\"parent\\\":null},{\\\"id\\\":\\\"new-1754552233634-24\\\",\\\"label\\\":\\\"Contact Page\\\",\\\"url\\\":\\\"contact\\\",\\\"children\\\":[],\\\"parentId\\\":\\\"custom-1753778590299\\\",\\\"depth\\\":1,\\\"index\\\":1,\\\"isLast\\\":false,\\\"parent\\\":null},{\\\"id\\\":\\\"new-1754552308978-6\\\",\\\"label\\\":\\\"Coupon\\\",\\\"url\\\":\\\"coupon\\\",\\\"children\\\":[],\\\"parentId\\\":\\\"custom-1753778590299\\\",\\\"depth\\\":1,\\\"index\\\":2,\\\"isLast\\\":false,\\\"parent\\\":null},{\\\"id\\\":\\\"new-1754552233634-2\\\",\\\"label\\\":\\\"Terms and conditions\\\",\\\"url\\\":\\\"terms-conditions\\\",\\\"children\\\":[],\\\"parentId\\\":\\\"custom-1753778590299\\\",\\\"depth\\\":1,\\\"index\\\":3,\\\"isLast\\\":false,\\\"parent\\\":null},{\\\"id\\\":\\\"new-1754552233634-5\\\",\\\"label\\\":\\\"Privacy Policy\\\",\\\"url\\\":\\\"privacy-policy\\\",\\\"children\\\":[],\\\"parentId\\\":\\\"custom-1753778590299\\\",\\\"depth\\\":1,\\\"index\\\":4,\\\"isLast\\\":false,\\\"parent\\\":null},{\\\"id\\\":\\\"new-1754552233634-18\\\",\\\"label\\\":\\\"Shipping & Delivery Policy\\\",\\\"url\\\":\\\"shipping-policy\\\",\\\"children\\\":[],\\\"parentId\\\":\\\"custom-1753778590299\\\",\\\"depth\\\":1,\\\"index\\\":5,\\\"isLast\\\":true,\\\"parent\\\":null}],\\\"parentId\\\":null,\\\"depth\\\":0,\\\"index\\\":4,\\\"isLast\\\":false,\\\"parent\\\":null,\\\"collapsed\\\":false},{\\\"id\\\":\\\"new-1753850842405-5\\\",\\\"label\\\":\\\"Blog\\\",\\\"url\\\":\\\"blogs\\\",\\\"children\\\":[],\\\"parentId\\\":null,\\\"depth\\\":0,\\\"index\\\":5,\\\"isLast\\\":true,\\\"parent\\\":null},{\\\"id\\\":\\\"new-1759056229190-36\\\",\\\"label\\\":\\\"Become A Seller\\\",\\\"url\\\":\\\"become-a-seller\\\",\\\"children\\\":[],\\\"parentId\\\":null,\\\"depth\\\":0,\\\"index\\\":0,\\\"isLast\\\":true,\\\"parent\\\":null}]\"', 1, 0, '2025-04-07 02:50:01', '2025-09-28 04:44:01');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2024_08_19_063216_create_permission_tables', 1),
(5, '2024_08_19_101423_create_settings_table', 1),
(6, '2024_08_20_031637_create_personal_access_tokens_table', 1),
(7, '2024_08_22_055123_create_modules_table', 1),
(8, '2024_09_01_040725_create_common_table', 1),
(9, '2024_09_18_054554_create_media_table', 1),
(11, '2024_12_01_084123_create_product_variants_table', 1),
(12, '2024_12_01_104154_create_product_authors', 1),
(13, '2024_12_02_061049_create_tags_table', 1),
(14, '2024_12_02_061315_create_units_table', 1),
(16, '2024_12_05_072243_create_system_management_table', 1),
(17, '2024_12_08_041032_create_stores_table', 1),
(18, '2024_12_09_071947_create_linked_social_accounts_table', 1),
(19, '2024_12_10_085252_create_blog_categories_table', 1),
(20, '2024_12_10_085444_create_blogs_table', 1),
(21, '2024_12_10_085521_create_blog_comments_table', 1),
(22, '2024_12_14_041146_create_customer_addresses_table', 1),
(28, '2024_12_17_040318_create_banners_table', 1),
(29, '2024_12_17_060550_create_subscribers_table', 1),
(30, '2024_12_18_120550_create_tickets_table', 1),
(31, '2024_12_18_121039_create_departments_table', 1),
(32, '2024_12_18_123832_create_ticket_messages_table', 1),
(33, '2024_12_21_044253_create_product_tags_table', 1),
(35, '2024_12_23_123354_create_pages_table', 1),
(36, '2024_12_24_123547_create_payment_gateways_table', 1),
(37, '2025_01_01_085646_create_coupon_lines_table', 1),
(38, '2025_01_02_044507_create_wallets_table', 1),
(39, '2025_01_02_045253_create_wallet_transactions_table', 1),
(40, '2025_01_02_065302_create_wishlists_table', 1),
(41, '2025_01_02_092436_create_product_attribute_values_table', 1),
(44, '2025_01_06_053513_create_store_notices_table', 1),
(45, '2025_01_06_055258_create_store_notice_recipients_table', 1),
(46, '2025_01_06_095020_create_withdraw_gateways_table', 1),
(50, '2025_01_13_121305_create_vehicle_types_table', 1),
(52, '2025_01_13_122304_create_delivery_man_reviews_table', 1),
(54, '2025_01_20_054032_create_contact_us_messages_table', 1),
(56, '2025_01_20_085241_create_order_masters_table', 1),
(57, '2025_01_20_085258_create_order_details_table', 1),
(58, '2025_01_21_040554_create_order_activities_table', 1),
(60, '2025_01_29_071946_create_reviews_table', 1),
(61, '2025_01_30_085856_create_review_reactions_table', 1),
(62, '2025_02_05_113010_create_customer_deactivation_reasons_table', 1),
(63, '2025_02_06_112640_create_product_queries_table', 1),
(64, '2025_02_19_100636_create_wallet_withdrawals_transactions_table', 1),
(65, '2025_02_20_091323_create_order_refund_reasons_table', 1),
(66, '2025_02_20_091655_create_order_refunds_table', 1),
(67, '2025_02_22_060508_create_email_templates_table', 1),
(69, '2025_02_24_112001_create_universal_notifications_table', 1),
(70, '2025_03_04_053458_create_blog_views_table', 1),
(71, '2025_03_05_032116_create_blog_comment_reactions_table', 1),
(72, '2025_03_05_081045_create_deliveryman_deactivation_reasons_table', 1),
(73, '2025_03_10_074239_create_product_views_table', 2),
(74, '2025_03_11_040543_create_become_seller_settings_table', 3),
(76, '2025_01_05_044745_create_flash_sales_table', 4),
(79, '2025_03_18_082233_create_contact_settings_table', 7),
(82, '2024_12_04_082107_create_coupons_table', 10),
(83, '2024_12_22_051501_create_customers_table', 11),
(88, '0001_01_01_000000_create_users_table', 14),
(95, '2025_01_12_072301_create_subscriptions_table', 17),
(96, '2025_01_13_100217_create_store_subscriptions_table', 17),
(97, '2025_01_13_121616_create_subscription_histories_table', 17),
(100, '2025_05_06_062702_create_live_locations_table', 18),
(102, '2025_01_05_044804_create_flash_sale_products_table', 20),
(103, '2024_12_01_084047_create_products_table', 21),
(104, '2025_05_19_054302_create_store_types_table', 22),
(107, '2025_03_19_075141_create_menus_table', 24),
(109, '2024_12_14_064131_create_sliders_table', 26),
(110, '2025_02_22_090326_create_order_addresses_table', 27),
(111, '2025_05_27_103715_create_chats_table', 28),
(113, '2025_05_27_103736_create_chat_messages_table', 29),
(114, '2025_06_04_091421_add_online_at_to_customers_table', 30),
(115, '2025_06_04_091421_add_online_at_to_users_table', 30),
(116, '2025_01_14_104513_create_system_commissions_table', 31),
(117, '2025_06_04_091421_add_online_at_to_stores_table', 32),
(118, '2025_06_22_050642_create_sms_providers_table', 33),
(119, '2025_06_22_050752_create_user_otps_table', 33),
(121, '2025_01_20_085135_create_orders_table', 35),
(123, '2025_07_01_145837_add_payment_status_to_orders_table', 37),
(124, '2025_01_21_040744_create_order_delivery_histories_table', 38),
(125, '2025_07_07_101305_create_sitemaps_table', 39),
(126, '2025_01_13_115827_create_delivery_men_table', 40),
(127, '2025_07_03_150756_add_is_verified_and_verified_at_to_delivery_men_table', 41),
(128, '2025_07_08_042733_add_to_user_type_media', 42),
(129, '2025_07_10_161234_add_soft_deletes_to_wallets_table', 43),
(130, '2025_07_08_083747_add_visibility_to_media', 44),
(131, '2025_07_08_084523_add_usage_type_to_media', 44),
(132, '2025_07_15_093755_change_autoload_column_type_in_setting_options_table', 44),
(133, '2025_07_17_043204_add_page_type_to_pages', 44),
(134, '2025_07_20_043027_add_page_builder_to_pages', 45),
(135, '2025_07_21_105008_add_deleted_at_to_product_queries_table', 46),
(136, '2025_07_21_104551_add_deleted_at_to_blog_comments_table', 47),
(137, '2025_07_21_104250_add_deleted_at_to_customer_addresses_table', 48),
(138, '2025_07_21_103928_add_deleted_at_to_reviews_table', 49),
(139, '2025_07_21_103309_add_deleted_at_to_ticket_messages_table', 50),
(140, '2025_07_21_103058_add_deleted_at_to_tickets_table', 51),
(141, '2025_07_21_101343_add_deleted_at_to_chat_messages_table', 52),
(142, '2025_07_21_100714_add_deleted_at_to_chats_table', 53),
(144, '2025_07_28_114347_add_menu_content_to_menus_table', 54),
(145, '2025_08_12_092830_create_pos_store_customers_table', 55),
(149, '2025_08_20_044147_create_currencies_table', 56),
(151, '2025_08_21_095154_add_currency_code_and_exchange_rate_to_order_details_table', 57),
(152, '2025_08_21_095154_add_currency_code_and_exchange_rate_to_order_masters_table', 58),
(153, '2025_08_25_090204_add_currency_to_wallet_transactions_to_wallet_transactions_table', 59),
(154, '2025_08_12_114300_create_dynamic_field_values_table', 60),
(155, '2025_08_12_120914_create_dynamic_fields_table', 60),
(156, '2025_08_13_083958_create_product_specifications_table', 61),
(157, '2025_09_04_042710_add_status_to_dynamic_fields', 61),
(158, '2025_09_14_085815_add_theme_name_to_pages', 62),
(159, '2025_09_15_120050_drop_unique_slug_from_pages', 63),
(160, '2025_09_14_085815_add_theme_name_to_banners', 64);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'admin', 8),
(1, 'App\\Models\\User', 8),
(1, 'App\\Models\\User', 27),
(1, 'App\\Models\\User', 29),
(1, 'App\\Models\\User', 30),
(1, 'App\\Models\\User', 32),
(1, 'App\\Models\\User', 33),
(1, 'App\\Models\\User', 62),
(1, 'App\\Models\\User', 65),
(1, 'App\\Models\\User', 84),
(1, 'App\\Models\\User', 89),
(2, 'admin', 1),
(2, 'App\\Models\\User', 1),
(2, 'App\\Models\\User', 2),
(2, 'App\\Models\\User', 9),
(2, 'App\\Models\\User', 10),
(2, 'App\\Models\\User', 11),
(2, 'App\\Models\\User', 12),
(2, 'App\\Models\\User', 13),
(2, 'App\\Models\\User', 14),
(2, 'App\\Models\\User', 15),
(2, 'App\\Models\\User', 16),
(2, 'App\\Models\\User', 30),
(2, 'App\\Models\\User', 32),
(2, 'App\\Models\\User', 38),
(2, 'App\\Models\\User', 39),
(2, 'App\\Models\\User', 40),
(2, 'App\\Models\\User', 41),
(2, 'App\\Models\\User', 43),
(2, 'App\\Models\\User', 44),
(2, 'App\\Models\\User', 45),
(2, 'App\\Models\\User', 49),
(2, 'App\\Models\\User', 50),
(2, 'App\\Models\\User', 52),
(2, 'App\\Models\\User', 53),
(2, 'App\\Models\\User', 54),
(2, 'App\\Models\\User', 55),
(2, 'App\\Models\\User', 56),
(2, 'App\\Models\\User', 57),
(2, 'App\\Models\\User', 67),
(2, 'App\\Models\\User', 70),
(2, 'App\\Models\\User', 72),
(2, 'App\\Models\\User', 73),
(2, 'App\\Models\\User', 76),
(2, 'App\\Models\\User', 77),
(2, 'App\\Models\\User', 78),
(2, 'App\\Models\\User', 79),
(2, 'App\\Models\\User', 81),
(2, 'App\\Models\\User', 82),
(2, 'App\\Models\\User', 83),
(2, 'App\\Models\\User', 86),
(2, 'App\\Models\\User', 87),
(2, 'App\\Models\\User', 91),
(2, 'App\\Models\\User', 92),
(2, 'App\\Models\\User', 96),
(2, 'admin', 98),
(2, 'admin', 100),
(2, 'admin', 101),
(2, 'admin', 102),
(2, 'admin', 123),
(2, 'admin', 127),
(2, 'admin', 128),
(2, 'admin', 129),
(2, 'admin', 130),
(2, 'admin', 133),
(2, 'admin', 152),
(2, 'admin', 153),
(2, 'admin', 154),
(2, 'admin', 155),
(2, 'admin', 156),
(2, 'admin', 157),
(2, 'admin', 162),
(2, 'admin', 165),
(2, 'admin', 166),
(2, 'admin', 168),
(6, 'App\\Models\\User', 32),
(6, 'App\\Models\\User', 51),
(6, 'App\\Models\\User', 71),
(6, 'App\\Models\\User', 93),
(6, 'admin', 99),
(6, 'admin', 105),
(6, 'admin', 106),
(6, 'admin', 107),
(6, 'admin', 108),
(6, 'admin', 111),
(6, 'admin', 112),
(6, 'admin', 113),
(6, 'admin', 114),
(6, 'admin', 116),
(6, 'admin', 118),
(6, 'admin', 119),
(6, 'admin', 120),
(6, 'admin', 121),
(6, 'admin', 124),
(6, 'admin', 125),
(17, 'App\\Models\\User', 85),
(17, 'App\\Models\\User', 88),
(17, 'admin', 103),
(21, 'admin', 128),
(21, 'admin', 129),
(21, 'admin', 130),
(21, 'admin', 133),
(21, 'admin', 151),
(21, 'admin', 152),
(21, 'admin', 153),
(21, 'admin', 154),
(21, 'admin', 155),
(21, 'admin', 156),
(21, 'admin', 157),
(21, 'admin', 205),
(21, 'admin', 206),
(21, 'admin', 207);

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `module_name` varchar(255) NOT NULL,
  `available_to_seller` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL,
  `position` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_master_id` bigint(20) UNSIGNED DEFAULT NULL,
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `invoice_number` varchar(255) DEFAULT NULL,
  `invoice_date` timestamp NULL DEFAULT NULL,
  `order_type` varchar(255) DEFAULT NULL COMMENT 'regular, pos',
  `delivery_option` varchar(255) DEFAULT NULL COMMENT 'home_delivery, parcel, takeaway',
  `delivery_type` varchar(255) DEFAULT NULL COMMENT 'standard, express, freight',
  `delivery_time` varchar(255) DEFAULT NULL,
  `order_amount` decimal(8,2) DEFAULT NULL,
  `order_amount_store_value` decimal(8,2) DEFAULT NULL,
  `order_amount_admin_commission` decimal(8,2) DEFAULT NULL,
  `product_discount_amount` decimal(8,2) DEFAULT NULL,
  `flash_discount_amount_admin` decimal(8,2) DEFAULT NULL,
  `coupon_discount_amount_admin` decimal(8,2) DEFAULT NULL,
  `shipping_charge` decimal(8,2) DEFAULT NULL,
  `delivery_charge_admin` decimal(8,2) DEFAULT NULL,
  `delivery_charge_admin_commission` decimal(8,2) DEFAULT NULL,
  `order_additional_charge_name` varchar(255) DEFAULT NULL,
  `order_additional_charge_amount` decimal(8,2) DEFAULT NULL,
  `order_additional_charge_store_amount` decimal(8,2) DEFAULT NULL,
  `order_admin_additional_charge_commission` decimal(8,2) DEFAULT NULL,
  `is_reviewed` tinyint(1) DEFAULT NULL,
  `confirmed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `cancel_request_by` bigint(20) UNSIGNED DEFAULT NULL,
  `cancel_request_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` bigint(20) UNSIGNED DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `delivery_completed_at` timestamp NULL DEFAULT NULL,
  `refund_status` enum('requested','processing','refunded','rejected') DEFAULT NULL COMMENT 'requested, processing, refunded, rejected',
  `payment_status` enum('pending','partially_paid','paid','cancelled','failed','refunded') NOT NULL DEFAULT 'pending' COMMENT 'pending, partially_paid, paid, cancelled, failed, refunded',
  `status` enum('pending','confirmed','processing','pickup','shipped','delivered','cancelled','on_hold') NOT NULL DEFAULT 'pending' COMMENT 'pending,confirmed,processing,pickup, shipped, delivered, cancelled, on_hold',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_activities`
--

CREATE TABLE `order_activities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ref_id` bigint(20) UNSIGNED DEFAULT NULL,
  `collected_by` bigint(20) UNSIGNED DEFAULT NULL,
  `activity_from` varchar(255) DEFAULT NULL,
  `activity_type` varchar(255) DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `activity_value` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_addresses`
--

CREATE TABLE `order_addresses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_master_id` bigint(20) UNSIGNED DEFAULT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'home' COMMENT 'home, office, others',
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `road` varchar(255) DEFAULT NULL,
  `house` varchar(255) DEFAULT NULL,
  `floor` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_delivery_histories`
--

CREATE TABLE `order_delivery_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `deliveryman_id` bigint(20) UNSIGNED NOT NULL,
  `reason` text DEFAULT NULL COMMENT 'Reason for ignoring or cancelling delivery',
  `status` varchar(255) NOT NULL COMMENT 'accepted, ignored, pickup, shipped, delivered, cancelled',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `behaviour` varchar(255) DEFAULT NULL COMMENT 'service, digital, consumable, combo',
  `product_sku` varchar(255) DEFAULT NULL,
  `variant_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variant_details`)),
  `product_campaign_id` bigint(20) UNSIGNED DEFAULT NULL,
  `base_price` decimal(15,2) DEFAULT NULL,
  `admin_discount_type` varchar(255) DEFAULT NULL,
  `admin_discount_rate` decimal(15,2) DEFAULT NULL,
  `admin_discount_amount` decimal(15,2) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `quantity` decimal(15,2) DEFAULT NULL,
  `line_total_price_with_qty` decimal(15,2) DEFAULT NULL,
  `coupon_discount_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `line_total_excluding_tax` decimal(15,2) DEFAULT NULL,
  `tax_rate` decimal(15,2) DEFAULT NULL,
  `tax_amount` decimal(15,2) DEFAULT NULL,
  `total_tax_amount` decimal(15,2) DEFAULT NULL,
  `line_total_price` decimal(15,2) DEFAULT NULL,
  `admin_commission_type` varchar(255) DEFAULT NULL,
  `admin_commission_rate` decimal(15,2) NOT NULL DEFAULT 0.00,
  `admin_commission_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `default_currency_code` varchar(10) DEFAULT NULL,
  `currency_code` varchar(10) DEFAULT NULL,
  `exchange_rate` decimal(15,2) NOT NULL DEFAULT 1.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_masters`
--

CREATE TABLE `order_masters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `shipping_address_id` varchar(255) DEFAULT NULL,
  `order_amount` decimal(15,2) DEFAULT NULL,
  `coupon_code` varchar(255) DEFAULT NULL,
  `coupon_title` varchar(255) DEFAULT NULL,
  `coupon_discount_amount_admin` decimal(15,2) DEFAULT NULL,
  `product_discount_amount` decimal(15,2) DEFAULT NULL,
  `flash_discount_amount_admin` decimal(15,2) DEFAULT NULL,
  `shipping_charge` decimal(15,2) DEFAULT NULL,
  `additional_charge_name` varchar(255) DEFAULT NULL,
  `additional_charge_amount` decimal(15,2) DEFAULT NULL,
  `additional_charge_commission` decimal(15,2) DEFAULT NULL,
  `paid_amount` decimal(15,2) DEFAULT NULL,
  `payment_gateway` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL COMMENT 'pending , paid, failed',
  `transaction_ref` varchar(255) DEFAULT NULL,
  `transaction_details` varchar(255) DEFAULT NULL,
  `order_notes` varchar(255) DEFAULT NULL,
  `default_currency_code` varchar(10) DEFAULT NULL,
  `currency_code` varchar(10) DEFAULT NULL,
  `exchange_rate` decimal(15,2) NOT NULL DEFAULT 1.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_refunds`
--

CREATE TABLE `order_refunds` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `order_refund_reason_id` bigint(20) UNSIGNED NOT NULL,
  `customer_note` text DEFAULT NULL,
  `file` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected','refunded') NOT NULL DEFAULT 'pending',
  `amount` decimal(10,2) NOT NULL,
  `reject_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_refund_reasons`
--

CREATE TABLE `order_refund_reasons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reason` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `theme_name` varchar(255) DEFAULT NULL,
  `page_type` varchar(255) NOT NULL DEFAULT 'dynamic_page',
  `layout` varchar(255) DEFAULT 'default',
  `page_class` varchar(255) DEFAULT NULL,
  `enable_builder` tinyint(1) NOT NULL DEFAULT 0,
  `show_breadcrumb` tinyint(1) NOT NULL DEFAULT 1,
  `page_parent` bigint(20) UNSIGNED DEFAULT NULL,
  `page_order` int(11) NOT NULL DEFAULT 0,
  `title` text NOT NULL,
  `slug` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` longtext DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'draft' COMMENT 'draft, published,unpublished',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pages`
--

INSERT INTO `pages` (`id`, `theme_name`, `page_type`, `layout`, `page_class`, `enable_builder`, `show_breadcrumb`, `page_parent`, `page_order`, `title`, `slug`, `content`, `meta_title`, `meta_description`, `meta_keywords`, `status`, `created_at`, `updated_at`) VALUES
(2, 'default', 'dynamic_page', 'default', NULL, 0, 1, NULL, 0, 'Terms and conditions', 'terms-conditions', '<h2>📄 <strong>Terms and Conditions</strong></h2><p>Welcome to Quick Ecommerce. These Terms and Conditions outline the rules and regulations for the use of our platform.</p><p>By accessing or using , you agree to comply with and be bound by these terms. If you disagree with any part of the terms, you must not use our services.</p><p></p><h3>1. 🛍️ <strong>Use of Our Platform</strong></h3><ul><li><p>You must be at least <strong>18 years old</strong> or use the site under the supervision of a guardian.</p></li><li><p>You agree to use the platform only for lawful purposes.</p></li><li><p>Any fraudulent, abusive, or illegal activity is strictly prohibited.</p></li></ul><h3>2. 👤 <strong>User Accounts</strong></h3><ul><li><p>You are responsible for maintaining the confidentiality of your account and password.</p></li><li><p>You agree to provide accurate and complete information during registration.</p></li><li><p><strong>Quick Ecommerce </strong>reserves the right to suspend or terminate accounts found in violation of our terms.</p></li></ul><h3>3. 🛒 <strong>Orders &amp; Transactions</strong></h3><ul><li><p>All orders placed through the website are subject to product availability and confirmation of the order price.</p></li><li><p>We reserve the right to cancel or limit the quantity of any order for any reason.</p></li></ul><h3>4. 📦 <strong>Vendor Responsibilities</strong></h3><ul><li><p>Sellers must ensure accurate listing information, stock availability, and timely fulfillment.</p></li><li><p>Products must meet the quality and safety standards as defined in our <strong>Seller Policy</strong>.</p></li><li><p>Misuse of the platform by vendors may lead to account suspension.</p></li></ul><h3>5. 💳 <strong>Pricing &amp; Payment</strong></h3><ul><li><p>All prices are listed in <strong>$</strong> and are inclusive of applicable taxes unless stated otherwise.</p></li><li><p>We reserve the right to modify prices at any time without prior notice.</p></li></ul><h3>6. 🔄 Returns, Refunds &amp; Cancellations</h3><ul><li><p>Please refer to our <strong>Return &amp; Refund Policy</strong> for information on returns, exchanges, and cancellations.</p></li></ul><h3>7. 🔐 <strong>Privacy Policy</strong></h3><ul><li><p>Your use of our site is also governed by our <strong>Privacy Policy</strong>, which outlines how we collect, use, and protect your personal data.</p></li></ul><h3>8. 🚫 <strong>Prohibited Activities</strong></h3><p>Users are prohibited from:</p><ul><li><p>Violating any applicable laws</p></li><li><p>Infringing on the intellectual property rights of others</p></li><li><p>Uploading or transmitting viruses or malicious code</p></li><li><p>Attempting to gain unauthorized access to other accounts.</p></li></ul><h3>9. 📜 <strong>Intellectual Property</strong></h3><ul><li><p>All content, design, logos, and trademarks on the platform are the property of Quick Ecommerce or its licensors.</p></li><li><p>You may not use any content without prior written consent.</p></li></ul><h3>10. ⚖️ <strong>Limitation of Liability</strong></h3><ul><li><p>We shall not be held liable for any indirect, incidental, or consequential damages arising from the use of or inability to use the platform.</p></li></ul><h3>11. 🛠️ <strong>Modifications</strong></h3><ul><li><p>We reserve the right to update or modify these terms at any time.</p></li><li><p>Continued use of the platform after changes implies acceptance of the revised terms.</p></li></ul><h3>12. 📞 <strong>Contact Us</strong></h3><p>If you have any questions about these Terms, please contact us at:</p><p><strong>Email:</strong> example.support@gmail.com<br><strong>Phone:</strong> +2001700000000</p>', 'Buy Products Online - My Amazing Store', 'Find the best deals on products at My Amazing Store. Quality items at affordable prices.', 'buy products, store, amazing deals, affordable prices', 'publish', '2025-03-20 01:28:54', '2025-09-22 22:22:20'),
(5, 'default', 'dynamic_page', 'default', NULL, 0, 1, NULL, 0, 'Privacy Policy', 'privacy-policy', '<h1><strong>Privacy Policy</strong></h1><h2>Privacy &amp; Information Security Policy</h2><p>Welcome to Quick Ecommerce. These Terms and Conditions (\"Terms\") govern your use of our multivendor e-commerce platform and apply to all users, including buyers, sellers, and visitors. By accessing or using our platform, you agree to comply with these Terms.</p><p>Our platform provides a marketplace where independent vendors can list and sell products, and buyers can browse and purchase products. While we facilitate these transactions, we are not directly involved in the sale or fulfillment of products.</p><p>Please review these Terms carefully. If you do not agree, you should discontinue use of our platform. For any questions or assistance, contact us at example.support@gmail.com</p><h2>Information We Collect</h2><h3>1. Personal Information</h3><ul><li><p><strong>Full Name:</strong> Used for identification, billing, and shipping purposes.</p></li><li><p><strong>Email Address:</strong> Required for account creation, communications, and order confirmations.</p></li><li><p><strong>Phone Number:</strong> Used for account verification, order updates, and customer support.</p></li><li><p><strong>Billing &amp; Shipping Address:</strong> Necessary for processing payments and delivering purchased items.</p></li></ul><h3>2. Account Information</h3><ul><li><p><strong>Username:</strong> Chosen by the user for logging in and account recognition.</p></li><li><p><strong>Password:</strong> Securely encrypted and stored to protect user accounts.</p></li><li><p><strong>Profile Details:</strong> Includes avatar, preferences, saved addresses, and communication settings.</p></li></ul><h3>3. Payment Information</h3><ul><li><p><strong>Transaction History:</strong> Records of payments, purchases, refunds, and disputes.</p></li><li><p><strong>Billing Information:</strong> Includes payment method (credit/debit card, digital wallets, etc.).</p></li><li><p><strong>Third-Party Payment Data:</strong> When we do not store full credit card details, our payment partners securely process transactions and store necessary details.</p></li></ul><h3>4. Device &amp; Usage Data</h3><ul><li><p><strong>IP Address:</strong> Helps detect fraud, maintain security, and personalize content based on location.</p></li><li><p><strong>Browser Type &amp; Operating System:</strong> Used for optimizing the website experience.</p></li><li><p><strong>Cookies &amp; Tracking Technologies:</strong> Enable session management, user authentication, and marketing improvements.</p></li><li><p><strong>Analytics Data:</strong> Collected through third-party tools (e.g., Google Analytics) to analyze user behavior, website traffic, and engagement metrics.</p></li></ul><h3>5. Vendor-Specific Data</h3><ul><li><p><strong>Business Details:</strong> Such as business name, registration details, and tax identification.</p></li><li><p><strong>Store Information:</strong> Includes store name, logo, policies, and contact details.</p></li><li><p><strong>Uploaded Content:</strong> Product listings, descriptions, images, and other media required for selling on the platform.</p></li></ul><h2>Data Protection, Security &amp; Tracking Technologies</h2><h3>1. Data Protection &amp; Security</h3><ul><li><p><strong>Encryption &amp; Secure Storage:</strong> All sensitive data, including passwords and payment information, is encrypted and stored securely.</p></li><li><p><strong>Secure Payment Processing:</strong> Transactions are handled through PCI-DSS-compliant payment gateways, ensuring financial data protection.</p></li><li><p><strong>Access Control:</strong> Only authorized personnel have access to sensitive data, and strict security protocols are in place.</p></li><li><p><strong>Fraud Prevention:</strong> We use automated security tools and monitoring systems to detect fraudulent activities.</p></li><li><p><strong>Regular Security Audits:</strong> We conduct periodic assessments and updates to enhance data security measures.</p></li></ul><h3>2. Cookies &amp; Tracking Technologies</h3><ul><li><p><strong>Essential Cookies:</strong> Necessary for website functionality, including login authentication and shopping cart management.</p></li><li><p><strong>Performance &amp; Analytics Cookies:</strong> Help us analyze user behavior, track website traffic, and improve user experience.</p></li><li><p><strong>Advertising &amp; Marketing Cookies:</strong> Used for personalized ads and remarketing campaigns based on browsing activity.</p></li><li><p><strong>Third-Party Tracking:</strong> Some cookies are placed by third-party services (e.g., Google Analytics, Facebook Pixel) to help us understand and optimize engagement.</p></li></ul>', 'Buy Products Online - Amazing Store', 'Find the best deals on products at My Amazing Store. Quality items at affordable prices.', 'buy products, store, amazing deals, affordable prices', 'publish', '2025-04-08 02:40:57', '2025-09-22 22:20:26'),
(6, 'default', 'dynamic_page', 'default', NULL, 0, 1, NULL, 0, 'Refund Policies', 'refund-policies', '🧾 Refund & Return Policy\nWe strive to ensure a seamless shopping experience for all our customers. Please read our Refund & Return Policy carefully to understand how returns and refunds work on our multivendor platform.\n\n🛒 General Return Policy\nCustomers can request a return within 30 days of receiving the product.\nReturns are accepted only if the item is:\n\nDamaged during transit\n\nDefective or malfunctioning\n\nIncorrect or not as described\n\nThe item must be unused, in its original packaging, and with all original tags/labels attached.\n\n🔄 Vendor-Specific Return Policies\nEach vendor may have unique return policies based on the product type. Always check the return policy mentioned on the individual store/product page.\nIf a vendor doesn\'t define a specific policy, the general return policy will apply.\n\n💸 Refund Process\nAfter the returned item is received and inspected, refunds will be processed to the original payment method within 7–10 business days.\n\nCustomers may choose store credit instead of a direct refund.\n\n🚫 Non-Returnable Items\nItems marked as non-returnable or final sale\n\nPerishable goods (e.g., food, flowers)\n\nPersonal care/hygiene items (e.g., makeup, undergarments)\n\nDownloadable or digital products\n\n📦 Return Shipping\nIf the return is due to vendor error (wrong item, defective, or damaged), return shipping is covered by the vendor.\n\nIf due to customer reasons (e.g., change of mind, wrong size), customer pays the return shipping.\n\n📦 Customer Return Policies by Store Type\n🥦 Grocery\nReturns accepted within 24 hours\n\nOnly for damaged, expired, or wrong items\n\nItems must not be opened or consumed\n\n🍞 Bakery\nReturns within 24 hours\n\nAccepted if spoiled, damaged, or incorrect\n\nMust be in original condition and packaging\n\n💊 Medicine (Health & Wellness)\nReturns within 3 days\n\nOnly if damaged, incorrect, sealed and unused\n\nPrescription medications are non-returnable\n\n💄 Makeup\nReturns within 7 days\n\nMust be sealed, unused, and in original packaging\n\nUsed products cannot be returned due to hygiene concerns\n\n👜 Bags\nReturns within 14 days\n\nItem must be unused, with tags and original packaging\n\n👗 Clothing\nReturns within 14 days\n\nTry-on allowed, but item must be unworn, unwashed, and with tags attached\n\nExchanges allowed for size issues\n\n🛋️ Furniture\nReturns within 7 days\n\nMust be unassembled, in original condition and packaging\n\nCustom-made items are non-returnable\n\n📚 Books\nReturns within 7 days\n\nMust be in new condition, no marks or damage\n\nDigital books are non-refundable\n\n📱 Gadgets (Electronics)\nReturns within 14 days\n\nMust be unused and in original packaging\n\nIf opened, only accepted if defective or non-functional\n\nWarranty claims follow vendor-specific terms\n\n🐾 Animals & Pets\nReturns within 48 hours\n\nOnly accepted for wrong or unhealthy delivery\n\nMust include photo/video proof\n\nLive animals handled case-by-case\n\n🐟 Fish\nReturns within 24 hours\n\nOnly for dead-on-arrival or wrong species\n\nMust report within 1 hour of delivery with visual proof\n\nTank conditions and water temperature may be checked', 'Refund Policies', 'Refund Policies', 'Refund Policies', 'publish', '2025-04-13 08:54:30', '2025-09-15 22:37:34'),
(18, 'default', 'dynamic_page', 'default', NULL, 0, 1, NULL, 0, 'Shipping & Delivery Policy', 'shipping-policy', '<h2>🚚 <strong>Shipping &amp; Delivery Policy</strong></h2><p></p><p>We are committed to delivering your order accurately, in good condition, and always on time.</p><h3>⏱️ Shipping Timeframes</h3><ul><li><p>Orders are usually processed and shipped within <strong>1–2 business days</strong>.</p></li><li><p>Delivery time depends on the shipping address and chosen delivery method:</p><ul><li><p><strong>Local delivery</strong>: 1–3 days</p></li><li><p><strong>National shipping</strong>: 3–7 days</p></li><li><p><strong>International</strong> (if applicable): 7–21 days</p></li><li><p></p></li></ul></li></ul><h3>💰 <strong>Shipping Charges</strong></h3><ul><li><p>Free shipping for orders above <strong>[e.g., $50]</strong></p></li><li><p>A standard shipping fee applies for smaller orders (calculated at checkout).</p></li><li><p></p></li></ul><h3>📦 <strong>Delivery Partners</strong></h3><p>We use trusted logistics partners like <strong>[Courier Names]</strong> to ensure timely and safe delivery.</p><h3>📍 Order Tracking</h3><p>Once your order is shipped, you will receive an email/SMS with a <strong>tracking number</strong> to monitor the delivery status.</p><h3>📌 <strong>Delivery Attempts</strong></h3><ul><li><p>We will attempt delivery <strong>up to 3 times</strong>.</p></li><li><p>After failed attempts, the order may be returned to the seller.</p></li><li><p></p></li></ul><h3>📦 D<strong>amaged or Missing Items</strong></h3><ul><li><p>If you receive a damaged product or find items missing, please contact us within <strong>48 hours</strong> of delivery with photos and order details.</p></li></ul>', 'Test Page Meta', 'Test Page Description', 'Test Page, Description', 'publish', '2025-05-05 12:30:07', '2025-09-15 22:39:41'),
(23, 'theme_two', 'dynamic_page', 'default', NULL, 1, 1, NULL, 0, 'Become A Seller  Theme Two', 'become-a-seller', '{\"login_register_section\":{\"register_title\":\"Create seller account.\",\"register_subtitle\":\"Enter your personal data to create your account\",\"login_title\":\"Login In\",\"login_subtitle\":\"Login in now\",\"agree_button_title\":null,\"social_button_enable_disable\":\"on\",\"background_image\":1205,\"background_image_url\":null},\"on_board_section\":{\"title\":\"Why Start Selling on Quick Ecommerce?\",\"subtitle\":\"The first Unified Go-to-market Platform, Disrobed has all the tools you need to effortlessly run your sales organization\",\"steps\":[{\"title\":\"Get Started\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1209},{\"title\":\"Build Your Store\",\"subtitle\":\"Customize your storefront, showcase your products, and attract customers.\",\"image\":1210},{\"title\":\"Add Your Products\",\"subtitle\":\"List, manage, and optimize your inventory with ease.\",\"image\":1211},{\"title\":\"Start Selling\",\"subtitle\":\"Connect with buyers, fulfill orders, and grow your sales.\",\"image\":1212},{\"title\":\"Earn & Grow\",\"subtitle\":\"Boost your revenue and unlock new business opportunities.\",\"image\":1213},{\"title\":\"Scale Your Business\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1214}]},\"video_section\":{\"section_title\":\"What Customers are saying\",\"section_subtitle\":\"I\'ve never come across a platform that makes onboarding, scaling, and customization so effortless\\u2014seamlessly adapting to your workflow, team, clients, and evolving needs.\",\"video_url\":\"https:\\/\\/www.youtube.com\\/watch?v=otej7WLdPh0\"},\"join_benefits_section\":{\"title\":\"Why Sell on Quick Ecommerce?\",\"subtitle\":\"Join thousands of successful sellers and grow your business with Quick Ecommerce powerful e-commerce platform.\",\"steps\":[{\"title\":\"Reach Millions of Customers\",\"subtitle\":\"Expand your business by connecting with a vast audience actively looking for products like yours.\",\"image\":1215},{\"title\":\"Hassle-Free Registration\",\"subtitle\":\"Sign up effortlessly and start selling without any hidden fees or long approval processes.\",\"image\":1216},{\"title\":\"Personalized Storefront\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1217},{\"title\":\"Product Management\",\"subtitle\":\"Easily add, update, and manage your inventory with our intuitive seller dashboard.\",\"image\":1218},{\"title\":\"Fast & Reliable Shipping\",\"subtitle\":\"Ensure smooth deliveries with SharpMart\\u2019s trusted logistics partners.\",\"image\":1219},{\"title\":\"Secure & Timely Payments\",\"subtitle\":\"Get paid directly to your bank account with a transparent and reliable payment system.\",\"image\":1220},{\"title\":\"Smart Marketing Tools\",\"subtitle\":\"Boost your sales with advertising, promotions, and data-driven marketing strategies.\",\"image\":1221},{\"title\":\"Dedicated Seller Support\",\"subtitle\":\"Get expert guidance, training resources, and 24\\/7 assistance for your business.\",\"image\":1222}]},\"faq_section\":{\"title\":\"Frequently Ask Questions\",\"subtitle\":\"Key information and answers regarding our services and policies.\",\"steps\":[{\"question\":\"Get Started\",\"answer\":\"Sign up for free and begin your journey as a successful seller.\"},{\"question\":\"Build Your Store\",\"answer\":\"Customize your storefront, showcase your products, and attract customers.\"},{\"question\":\"Add Your Products\",\"answer\":\"List, manage, and optimize your inventory with ease.\"},{\"question\":\"Start Selling\",\"answer\":\"Connect with buyers, fulfill orders, and grow your sales.\"},{\"question\":\"Earn & Grow\",\"answer\":\"Boost your revenue and unlock new business opportunities.\"},{\"question\":\"Scale Your Business\",\"answer\":\"Sign up for free and begin your journey as a successful seller.\"}]},\"contact_section\":{\"title\":\"Need help? Our experts are here for you.\",\"subtitle\":\"Our experts are here to assist with any questions about our products, services, or more. Feel free to ask\\u2014we\'re ready to help! Let us make things easier for you.\",\"agree_button_title\":\"I agree to the terms and conditions.\",\"image\":1223,\"image_url\":null}}', 'Become', 'Become A seller Updated Become A seller Updated', 'Become, seller', 'publish', '2025-07-17 04:05:05', '2025-09-28 21:55:40'),
(24, 'theme_two', 'dynamic_page', 'default', NULL, 1, 1, NULL, 0, 'Contact Page', 'contact', '{\"contact_form_section\":{\"title\":\"Quick Ecommerce\",\"subtitle\":\"Feel free to connect with our team and turn your ideas into reality. Our dedicated customer support team is available 24\\/7 to assist you\"},\"contact_details_section\":{\"address\":\"545 Mavis Island, IL 99191\",\"phone\":\"113434134\",\"email\":\"quick_ecommerce_contact@gmail.com\",\"website\":\"#\",\"image\":1302,\"image_url\":null,\"social\":[{\"url\":\"https:\\/\\/www.facebook.com\",\"icon\":\"Facebook\"},{\"url\":\"https:\\/\\/www.instagram.com\",\"icon\":\"Instagram\"},{\"url\":\"https:\\/\\/www.linkedin.com\",\"icon\":\"Linkedin\"}]},\"map_section\":{\"coordinates\":{\"lat\":23.8103,\"lng\":90.4125}}}', 'Contact Page', 'Contact Page', 'Conact, Conact Page', 'publish', '2025-07-17 04:06:56', '2025-09-28 00:46:10'),
(25, 'theme_two', 'dynamic_page', 'default', NULL, 1, 1, NULL, 0, 'About Page', 'about', '{\"about_section\":{\"title\":\"About Quick Ecommerce\",\"subtitle\":\"Where Innovation Meets Seamless Online Shopping\",\"description\":\"At Quick Ecommerce, we redefine eCommerce with a seamless, secure, and user-friendly shopping experience. As a premier online marketplace, we connect buyers and sellers through cutting-edge technology, ensuring effortless transactions and customer satisfaction.\",\"image\":1302,\"image_url\":null},\"story_section\":{\"title\":\"Our Story\",\"subtitle\":\"From a Bold Vision to a Trusted Marketplace: How Quick Ecommerce Was Built to Transform the Future of eCommerce\",\"steps\":[{\"title\":\"Our Vision and Beginning\",\"subtitle\":\"Transforming the eCommerce Landscape with a Vision to Connect Buyers and Sellers Seamlessly\",\"image\":1111},{\"title\":\"Overcoming Challenges\",\"subtitle\":\"Navigating Obstacles with Innovation to Build a Reliable and Secure Marketplace\",\"image\":1111},{\"title\":\"Our Future Vision\",\"subtitle\":\"Continuing to Innovate and Grow, Building a Sustainable eCommerce Ecosystem for the Future\",\"image\":1111}]},\"mission_and_vision_section\":{\"title\":\"Our Mission & Vision\",\"subtitle\":\"At Quick Ecommerce, we are committed to revolutionizing eCommerce by creating a seamless, secure, and customer-centric marketplace. Our mission is to empower businesses with the tools they need to succeed while providing shoppers.\",\"steps\":[{\"title\":\"Our Mission\",\"subtitle\":null,\"description\":\"Make online shopping easy, reliable, and enjoyable for customers. Enable sellers to grow by offering powerful tools and support. Deliver competitive prices, quality products, and exceptional service. Foster a trusted marketplace built on transparency and\",\"image\":1115},{\"title\":\"Our vision\",\"subtitle\":null,\"description\":\"Revolutionize digital commerce by integrating cutting-edge technology. Expand globally, connecting millions of buyers and sellers worldwide. Create a thriving community where businesses succeed and customers shop with confidence. Lead with innovation, con\",\"image\":1112}]},\"testimonial_and_success_section\":{\"title\":\"Testimonials & Success Stories\",\"subtitle\":\"From a Bold Vision to a Trusted Marketplace: How Quick Ecommerce Was Built to Transform the Future of eCommerce\",\"steps\":[{\"title\":\"Bill Gates\",\"subtitle\":\"CEO\",\"description\":\"I highly recommend them to anyone seeking professional web design services!\",\"image\":1300},{\"title\":\"John Anderson\",\"subtitle\":\"CTO\",\"description\":\"Their attention to detail and creative design approach transformed our website into a visually stunning and highly functional platform.\",\"image\":1300},{\"title\":\"Bill Gates\",\"subtitle\":\"CEO\",\"description\":\"I highly recommend them to anyone seeking professional web design services!I highly recommend them to anyone seeking professional web design services!I highly recommend them to anyone seeking professional web design services!I highly recommend them to any\",\"image\":1300},{\"title\":\"John Anderson\",\"subtitle\":\"CEO\",\"description\":\"I highly recommend them to anyone seeking professional web design services!I highly recommend them to anyone seeking professional web design services!I highly recommend them to anyone seeking professional web design services!I highly recommend them to any\",\"image\":1300}]}}', 'About', 'About Page Meta Description', 'About, About Page', 'publish', '2025-07-17 05:34:25', '2025-09-28 01:54:26'),
(31, 'default', 'dynamic_page', 'default', NULL, 0, 1, NULL, 0, 'Customer Service', 'customer-service', '<h2>Get help with orders, payments, returns, and account issues.</h2><p></p><p>Welcome to the Customer Service Center.<br>Our goal is to ensure your experience on our platform is smooth, enjoyable, and secure. Whether you\'re a new customer or a returning shopper, our support team is always ready to help you with your concerns.</p><p>We understand that questions and issues can arise before, during, or after a purchase. From order-related questions to payment issues and account problems, we’re here to guide you every step of the way.</p><p>Here’s what we can help you with:</p><ul><li><p>Tracking and managing your orders</p></li><li><p>Solving payment or billing problems</p></li><li><p>Cancelling or modifying orders (before they ship)</p></li><li><p>Handling product returns and refund requests</p></li><li><p>Updating your account information or password</p></li><li><p>Helping you contact sellers or report issues</p></li></ul><p>We also offer assistance in resolving disputes between buyers and sellers, ensuring that both parties are treated fairly.</p><p>For quick answers, be sure to check our FAQs and policy pages. If you still need help, don’t hesitate to reach out through our support form or live chat. Our customer service is available 24/7 to ensure you get timely assistance.</p><p>Thank you for shopping with us. Your satisfaction is our priority.</p>', 'Customer Service', NULL, NULL, 'publish', '2025-08-04 00:05:34', '2025-09-15 22:40:07'),
(32, 'default', 'dynamic_page', 'default', NULL, 0, 1, NULL, 0, 'Product Support', 'product-support', '<h2>Get help with product issues, defects, specifications, or seller communication.</h2><p></p><p>Product issues can happen — and when they do, we’re here to help you resolve them quickly. Our Product Support team focuses on making sure you’re satisfied with the items you receive and that everything works as expected.</p><p>Whether you’ve received a damaged product, have a question about specifications, or something isn’t working right, we’ll help guide you through the next steps.</p><p>Here’s what Product Support covers:</p><ul><li><p>Questions about product features, materials, or compatibility</p></li><li><p>Missing parts or items upon delivery</p></li><li><p>Faulty or defective items</p></li><li><p>Warranty-related concerns</p></li><li><p>Reaching out to the seller for technical assistance</p></li></ul><p>You can often find important product information, seller warranty policies, and support details right on the product page. However, if something’s unclear or wrong with your order, our team is ready to assist you directly.</p><p>Our platform connects you with multiple stores and sellers, so each situation may vary slightly depending on the seller’s policies. We’re happy to mediate and ensure you receive a fair resolution.</p><p>Product problems shouldn’t slow you down — let us help make it right.</p>', 'Product Support', NULL, NULL, 'publish', '2025-08-04 00:06:14', '2025-09-15 22:40:14'),
(33, 'default', 'dynamic_page', 'default', NULL, 0, 1, NULL, 0, 'Track Order', 'track-order', '<h2>Easily check the status of your orders and monitor delivery updates in real-time.<br></h2><p>After placing your order, you’ll want to know exactly where it is and when it will arrive. Our real-time tracking system helps you stay informed from the moment your order is placed until it reaches your door.</p><p>Here’s how to track your order:</p><ol><li><p>Log in to your account</p></li><li><p>Go to the “My Orders” section</p></li><li><p>Click on the specific order you want to track</p></li><li><p>You’ll see the current status, shipping updates, and estimated delivery date</p></li></ol><p>If your order includes multiple items from different sellers or stores, you may see individual tracking details for each shipment. This helps you understand when each product will arrive, especially in a multivendor environment like ours.</p><p>Tracking statuses you may see include:</p><ul><li><p>Order Placed</p></li><li><p>Processing by Seller</p></li><li><p>Picked Up by Courier</p></li><li><p>In Transit</p></li><li><p>Out for Delivery</p></li><li><p>Delivered</p></li></ul><p>If you don’t see updates, or if the tracking information seems stuck, feel free to contact our support team for help. Delays may sometimes occur due to weather, holidays, or shipping service issues — but we’re always here to provide clarity.</p><p>Stay informed and shop with confidence knowing you can follow every step of your delivery.</p>', 'Track Order', NULL, NULL, 'publish', '2025-08-04 00:07:19', '2025-09-15 22:40:17'),
(36, 'theme_one', 'dynamic_page', 'default', NULL, 1, 1, NULL, 0, 'Become A Seller  Theme Two', 'become-a-seller', '{\"login_register_section\":{\"register_title\":\"Create seller account.\",\"register_subtitle\":\"Enter your personal data to create your account\",\"login_title\":\"Login In\",\"login_subtitle\":\"Login in now\",\"agree_button_title\":null,\"social_button_enable_disable\":\"on\",\"background_image\":1098,\"background_image_url\":null},\"on_board_section\":{\"title\":\"Why Start Selling on Quick Ecommerce?\",\"subtitle\":\"The first Unified Go-to-market Platform, Disrobed has all the tools you need to effortlessly run your sales organization\",\"steps\":[{\"title\":\"Get Started\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1093},{\"title\":\"Build Your Store\",\"subtitle\":\"Customize your storefront, showcase your products, and attract customers.\",\"image\":1094},{\"title\":\"Add Your Products\",\"subtitle\":\"List, manage, and optimize your inventory with ease.\",\"image\":1095},{\"title\":\"Start Selling\",\"subtitle\":\"Connect with buyers, fulfill orders, and grow your sales.\",\"image\":1096},{\"title\":\"Earn & Grow\",\"subtitle\":\"Boost your revenue and unlock new business opportunities.\",\"image\":1097},{\"title\":\"Scale Your Business\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1098}]},\"video_section\":{\"section_title\":\"What Customers are saying\",\"section_subtitle\":\"I\'ve never come across a platform that makes onboarding, scaling, and customization so effortless\\u2014seamlessly adapting to your workflow, team, clients, and evolving needs.\",\"video_url\":null},\"join_benefits_section\":{\"title\":\"Why Sell on Quick Ecommerce?\",\"subtitle\":\"Join thousands of successful sellers and grow your business with Quick Ecommerce\'s powerful e-commerce platform.\",\"steps\":[{\"title\":\"Reach Millions of Customers\",\"subtitle\":\"Expand your business by connecting with a vast audience actively looking for products like yours.\",\"image\":1101},{\"title\":\"Hassle-Free Registration\",\"subtitle\":\"Sign up effortlessly and start selling without any hidden fees or long approval processes.\",\"image\":1100},{\"title\":\"Personalized Storefront\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1099},{\"title\":\"Product Management\",\"subtitle\":\"Easily add, update, and manage your inventory with our intuitive seller dashboard.\",\"image\":1102},{\"title\":\"Fast & Reliable Shipping\",\"subtitle\":\"Ensure smooth deliveries with SharpMart\\u2019s trusted logistics partners.\",\"image\":1103},{\"title\":\"Secure & Timely Payments\",\"subtitle\":\"Get paid directly to your bank account with a transparent and reliable payment system.\",\"image\":1104},{\"title\":\"Smart Marketing Tools\",\"subtitle\":\"Boost your sales with advertising, promotions, and data-driven marketing strategies.\",\"image\":1105},{\"title\":\"Dedicated Seller Support\",\"subtitle\":\"Get expert guidance, training resources, and 24\\/7 assistance for your business.\",\"image\":1106},{\"title\":\"Scale & Succeed\",\"subtitle\":\"Use data-driven analytics and business insights to optimize and expand your sales.\",\"image\":1107}]},\"faq_section\":{\"title\":\"Frequently Ask Questions\",\"subtitle\":\"Key information and answers regarding our services and policies.\",\"steps\":[{\"question\":\"Get Started\",\"answer\":\"Sign up for free and begin your journey as a successful seller.\"},{\"question\":\"Build Your Store\",\"answer\":\"Customize your storefront, showcase your products, and attract customers.\"},{\"question\":\"Add Your Products\",\"answer\":\"List, manage, and optimize your inventory with ease.\"},{\"question\":\"Start Selling\",\"answer\":\"Connect with buyers, fulfill orders, and grow your sales.\"},{\"question\":\"Earn & Grow\",\"answer\":\"Boost your revenue and unlock new business opportunities.\"},{\"question\":\"Scale Your Business\",\"answer\":\"Sign up for free and begin your journey as a successful seller.\"}]},\"contact_section\":{\"title\":\"Need help? Our experts are here for you.\",\"subtitle\":\"Our experts are here to assist with any questions about our products, services, or more. Feel free to ask\\u2014we\'re ready to help! Let us make things easier for you.\",\"agree_button_title\":\"I agree to the terms and conditions.\",\"image\":1108,\"image_url\":null}}', 'Become', 'Become A seller Updated Become A seller Updated', 'Become, seller', 'publish', '2025-07-17 04:05:05', '2025-09-28 03:12:39'),
(38, 'theme_one', 'dynamic_page', 'default', NULL, 1, 1, NULL, 0, 'Contact Page', 'contact', '{\"contact_form_section\":{\"title\":\"Quick Ecommerce\",\"subtitle\":\"Feel free to connect with our team and turn your ideas into reality. Our dedicated customer support team is available 24\\/7 to assist you\"},\"contact_details_section\":{\"address\":\"545 Mavis Island, IL 99191\",\"phone\":\"113434134\",\"email\":\"quick_ecommerce_contact@gmail.com\",\"website\":\"#\",\"image\":1310,\"image_url\":null,\"social\":[]},\"map_section\":{\"coordinates\":{\"lat\":23.8103,\"lng\":90.4125}}}', 'Contact Page', 'Contact Page', 'Conact, Conact Page', 'publish', '2025-07-17 04:06:56', '2025-09-28 02:35:51'),
(39, 'theme_one', 'dynamic_page', 'default', NULL, 1, 1, NULL, 0, 'About Page', 'about', '{\"about_section\":{\"title\":\"About Quick Ecommerce\",\"subtitle\":\"Where Innovation Meets Seamless Online Shopping\",\"description\":\"At Quick Ecommerce, we redefine eCommerce with a seamless, secure, and user-friendly shopping experience. As a premier online marketplace, we connect buyers and sellers through cutting-edge technology, ensuring effortless transactions and customer satisfaction.\",\"image\":1306,\"image_url\":null},\"story_section\":{\"title\":\"Our Story\",\"subtitle\":\"From a Bold Vision to a Trusted Marketplace: How Quick Ecommerce Was Built to Transform the Future of eCommerce\",\"steps\":[{\"title\":\"Our Vision and Beginning\",\"subtitle\":\"Transforming the eCommerce Landscape with a Vision to Connect Buyers and Sellers Seamlessly\",\"image\":1111},{\"title\":\"Overcoming Challenges\",\"subtitle\":\"Navigating Obstacles with Innovation to Build a Reliable and Secure Marketplace\",\"image\":1111},{\"title\":\"Our Future Vision\",\"subtitle\":\"Continuing to Innovate and Grow, Building a Sustainable eCommerce Ecosystem for the Future\",\"image\":1111}]},\"mission_and_vision_section\":{\"title\":\"Our Mission & Vision\",\"subtitle\":\"At Quick Ecommerce, we are committed to revolutionizing eCommerce by creating a seamless, secure, and customer-centric marketplace. Our mission is to empower businesses with the tools they need to succeed while providing shoppers.\",\"steps\":[{\"title\":\"Our Mission\",\"subtitle\":null,\"description\":\"Make online shopping easy, reliable, and enjoyable for customers. Enable sellers to grow by offering powerful tools and support. Deliver competitive prices, quality products, and exceptional service. Foster a trusted marketplace built on transparency and\",\"image\":1115},{\"title\":\"Our vision\",\"subtitle\":null,\"description\":\"Revolutionize digital commerce by integrating cutting-edge technology. Expand globally, connecting millions of buyers and sellers worldwide. Create a thriving community where businesses succeed and customers shop with confidence. Lead with innovation, con\",\"image\":1115}]},\"testimonial_and_success_section\":{\"title\":\"Testimonials & Success Stories\",\"subtitle\":\"From a Bold Vision to a Trusted Marketplace: How Quick Ecommerce Was Built to Transform the Future of eCommerce\",\"steps\":[{\"title\":\"Bill Gates\",\"subtitle\":\"CEO\",\"description\":\"I highly recommend them to anyone seeking professional web design services!\",\"image\":1311},{\"title\":\"John Anderson\",\"subtitle\":\"CTO\",\"description\":\"Their attention to detail and creative design approach transformed our website into a visually stunning and highly functional platform.\",\"image\":1311}]}}', 'About', 'About Page Meta Description', 'About, About Page', 'publish', '2025-07-17 05:34:25', '2025-09-28 03:06:52');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_gateways`
--

CREATE TABLE `payment_gateways` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `auth_credentials` longtext DEFAULT NULL,
  `is_test_mode` tinyint(1) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 Inactive, 1 Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_gateways`
--

INSERT INTO `payment_gateways` (`id`, `name`, `slug`, `image`, `description`, `auth_credentials`, `is_test_mode`, `status`, `created_at`, `updated_at`) VALUES
(1, 'PayPal', 'paypal', '1176', NULL, '{\"paypal_sandbox_client_id\":null,\"paypal_sandbox_client_secret\":null,\"paypal_sandbox_client_app_id\":null,\"paypal_live_client_id\":null,\"paypal_live_client_secret\":null,\"paypal_live_app_id\":null}', 1, 1, '2025-03-10 01:43:09', '2025-08-07 00:41:49'),
(2, 'Stripe', 'stripe', '1177', NULL, '{\"stripe_public_key\":\"sk_test_51QjCbjFQkOXqMwIhjWIxb8NKEkgx5gXc8mmREA3ARAA5e8laAkq0RVXrFjtgPBGIABzmrMgRwLAXikBQW7xp9iwM00SxLhiBWj\",\"stripe_secret_key\":null}', 1, 1, '2025-03-10 01:43:09', '2025-08-24 21:36:11'),
(3, 'Razorpay', 'razorpay', '1179', NULL, '{\"razorpay_api_key\":null,\"razorpay_api_secret\":null}', 1, 1, '2025-03-10 01:43:09', '2025-08-07 01:07:31'),
(4, 'Paytm', 'paytm', '1180', NULL, '{\"paytm_merchant_key\":null,\"paytm_merchant_mid\":null,\"paytm_merchant_website\":null,\"paytm_channel\":null,\"paytm_industry_type\":null}', 1, 1, '2025-03-10 01:43:09', '2025-08-07 01:08:23'),
(5, 'Cash On Delivery', 'cash_on_delivery', '1178', NULL, NULL, 1, 1, '2025-03-10 01:43:09', '2025-08-07 01:01:21');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `available_for` varchar(255) NOT NULL DEFAULT 'system_level',
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `module_title` varchar(255) DEFAULT NULL,
  `perm_title` varchar(255) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `parent_id` varchar(255) DEFAULT NULL,
  `options` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `module` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `available_for`, `name`, `guard_name`, `module_title`, `perm_title`, `icon`, `parent_id`, `options`, `created_at`, `updated_at`, `module`) VALUES
(163, 'delivery_level', '/deliveryman/withdraw-manage', 'api', NULL, 'Withdrawals', '', NULL, '[\"view\",\"insert\",\"others\"]', '2025-03-10 01:42:59', '2025-03-10 01:42:59', NULL),
(8695, 'store_level', 'dashboard', 'api', NULL, 'Dashboard', 'LayoutDashboard', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8696, 'store_level', 'POS Management', 'api', NULL, 'POS Management', 'CircleDollarSign', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8697, 'store_level', 'POS', 'api', NULL, 'POS', 'ListOrdered', '8696', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8698, 'store_level', '/seller/store/pos', 'api', NULL, 'POS', 'ListOrdered', '8697', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8699, 'store_level', '/seller/store/pos/orders', 'api', NULL, 'Orders', 'ListOrdered', '8697', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8700, 'store_level', 'Order Management', 'api', NULL, 'Order Management', '', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8701, 'store_level', 'Orders', 'api', NULL, 'Orders', 'Boxes', '8700', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8702, 'store_level', '/seller/store/orders', 'api', NULL, 'All Orders', '', '8701', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8703, 'store_level', '/seller/store/orders/refund-request', 'api', NULL, 'Returned or Refunded', '', '8701', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8704, 'store_level', 'Product management', 'api', NULL, 'Product management', '', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8705, 'store_level', 'Products', 'api', NULL, 'Products', 'Codesandbox', '8704', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8706, 'store_level', '/seller/store/product/list', 'api', NULL, 'Manage Products', '', '8705', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8707, 'store_level', '/seller/store/product/add', 'api', NULL, 'Add New Product', '', '8705', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8708, 'store_level', '/seller/store/product/stock-report', 'api', NULL, 'Product Low & Out Stock', '', '8705', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8709, 'store_level', '/seller/store/product/inventory', 'api', NULL, 'Inventory', 'PackageOpen', '8705', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8710, 'store_level', '/seller/store/product/import', 'api', NULL, 'Bulk Import', '', '8705', '[\"view\",\"insert\",\"update\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8711, 'store_level', '/seller/store/product/export', 'api', NULL, 'Bulk Export', '', '8705', '[\"view\",\"insert\",\"update\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8712, 'store_level', '/seller/store/attribute/list', 'api', NULL, 'Attributes', 'Layers2', '8704', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8713, 'store_level', '/seller/store/product/author/list', 'api', NULL, 'Authors', 'BookOpenCheck', '8704', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8714, 'store_level', 'Promotional control', 'api', NULL, 'Promotional control', 'Proportions', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8715, 'store_level', 'Flash Sale', 'api', NULL, 'Flash Sale', 'Zap', '8714', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8716, 'store_level', '/seller/store/promotional/flash-deals/active-deals', 'api', NULL, 'Active Deals', '', '8715', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8717, 'store_level', '/seller/store/promotional/flash-deals/my-deals', 'api', NULL, 'My Deals', '', '8715', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8718, 'store_level', 'Communication Center', 'api', NULL, 'Communication Center', 'Headphones', NULL, '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8719, 'store_level', '/seller/store/chat/list', 'api', NULL, 'Chat List', 'MessageSquareMore', '8718', '[\"view\",\"insert\",\"update\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8720, 'store_level', '/seller/store/support-ticket/list', 'api', NULL, 'Tickets', 'Headset', '8718', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8721, 'store_level', '/seller/store/notifications', 'api', NULL, 'All Notifications', 'Bell', '8718', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8722, 'store_level', 'Feedback control', 'api', NULL, 'Feedback control', 'MessageSquareReply', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8723, 'store_level', '/seller/store/feedback-control/review', 'api', NULL, 'Reviews', 'Star', '8722', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8724, 'store_level', '/seller/store/feedback-control/questions', 'api', NULL, 'Questions', 'CircleHelp', '8722', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8725, 'store_level', 'Financial Management', 'api', NULL, 'Financial Management', '', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8726, 'store_level', '/seller/store/financial/withdraw', 'api', NULL, 'Withdrawals', 'BadgeDollarSign', '8725', '[\"view\",\"insert\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8727, 'store_level', '/seller/store/financial/wallet', 'api', NULL, 'Store Wallet', 'Wallet', '8725', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8728, 'store_level', 'Staff control', 'api', NULL, 'Staff control', 'UserRoundPen', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8729, 'store_level', '/seller/store/staff/list', 'api', NULL, 'Staff List', 'Users', '8728', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8730, 'store_level', 'Store Settings', 'api', NULL, 'Store Settings', 'Store', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8731, 'store_level', '/seller/store/settings/business-plan', 'api', NULL, 'Business Plan', 'BriefcaseBusiness', '8730', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8732, 'store_level', '/seller/store/settings/notices', 'api', NULL, 'Notice', 'BadgeAlert', '8730', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8733, 'store_level', '/seller/store/list', 'api', NULL, 'My Stores', 'Store', '8730', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(9775, 'system_level', '/admin/dashboard', 'api', NULL, 'Dashboard', 'LayoutDashboard', NULL, '[\"view\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9776, 'system_level', 'POS Management', 'api', NULL, 'POS Management', 'CircleDollarSign', NULL, '[\"view\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9777, 'system_level', 'POS', 'api', NULL, 'POS', 'ListOrdered', '9776', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9778, 'system_level', '/admin/pos', 'api', NULL, 'POS', 'ListOrdered', '9777', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9779, 'system_level', '/admin/pos/orders', 'api', NULL, 'Orders', 'ListOrdered', '9777', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9780, 'system_level', '/admin/pos/settings', 'api', NULL, 'Settings', 'ListOrdered', '9777', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9781, 'system_level', 'Order Management', 'api', NULL, 'Order Management', '', NULL, '[\"view\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9782, 'system_level', 'Orders', 'api', NULL, 'Orders', 'ListOrdered', '9781', '[\"view\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9783, 'system_level', '/admin/orders', 'api', NULL, 'All Orders', 'ListOrdered', '9782', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9784, 'system_level', '/admin/orders/refund-request', 'api', NULL, 'Returned or Refunded', 'RotateCcw', '9782', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9785, 'system_level', '/admin/orders/refund-reason/list', 'api', NULL, 'Refund Reason', '', '9782', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9786, 'system_level', 'Product management', 'api', NULL, 'Product management', '', NULL, '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9787, 'system_level', 'Products', 'api', NULL, 'Products', 'Codesandbox', '9786', '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9788, 'system_level', '/admin/product/list', 'api', NULL, 'All Products', 'PackageSearch', '9787', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9789, 'system_level', '/admin/product/trash-list', 'api', NULL, 'Trash', 'Trash', '9787', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9790, 'system_level', '/admin/product/request', 'api', NULL, 'Product Approval Request', 'Signature', '9787', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9791, 'system_level', '/admin/product/stock-report', 'api', NULL, 'Product Low & Out Stock', 'Layers', '9787', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9792, 'system_level', '/admin/product/import', 'api', NULL, 'Bulk Import', 'FileUp', '9787', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9793, 'system_level', '/admin/product/export', 'api', NULL, 'Bulk Export', 'Download', '9787', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9794, 'system_level', '/admin/product/inventory', 'api', NULL, 'Product Inventory', 'SquareChartGantt', '9787', '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9795, 'system_level', '/admin/categories', 'api', NULL, 'Categories', 'List', '9786', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9796, 'system_level', '/admin/attribute/list', 'api', NULL, 'Attributes', 'AttributeIcon', '9786', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9797, 'system_level', '/admin/unit/list', 'api', NULL, 'Units', 'Boxes', '9786', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9798, 'system_level', '/admin/dynamic-fields', 'api', NULL, 'Dynamic Fields', 'Boxes', '9786', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9799, 'system_level', '/admin/brand/list', 'api', NULL, 'Brands', 'LayoutList', '9786', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9800, 'system_level', '/admin/tag/list', 'api', NULL, 'Tags', 'Tags', '9786', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9801, 'system_level', '/admin/product/author/list', 'api', NULL, 'Authors', '', '9786', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9802, 'system_level', 'Coupon Management', 'api', NULL, 'Coupon Management', 'SquarePercent', '9786', '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9803, 'system_level', '/admin/coupon/list', 'api', NULL, 'Coupons', '', '9802', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9804, 'system_level', '/admin/coupon-line/list', 'api', NULL, 'Coupon Lines', '', '9802', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9805, 'system_level', 'Sellers & Stores', 'api', NULL, 'Sellers & Stores', '', NULL, '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9806, 'system_level', 'All Sellers', 'api', NULL, 'All Sellers', 'UsersRound', '9805', '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9807, 'system_level', '/admin/seller/list', 'api', NULL, 'Sellers', '', '9806', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9808, 'system_level', '/admin/seller/trash-list', 'api', NULL, 'Trash', 'Trash', '9806', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9809, 'system_level', '/admin/seller/registration', 'api', NULL, 'Register A Seller', '', '9806', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9810, 'system_level', 'All Stores', 'api', NULL, 'All Stores', 'Store', '9805', '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9811, 'system_level', '/admin/store/list', 'api', NULL, 'Store List', 'Store', '9810', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9812, 'system_level', '/admin/store/trash-list', 'api', NULL, 'Trash', 'Trash', '9810', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9813, 'system_level', '/admin/store/add', 'api', NULL, 'Store Add', '', '9810', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9814, 'system_level', '/admin/store/approval', 'api', NULL, 'Store Approval Request', '', '9810', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9815, 'system_level', 'Promotional control', 'api', NULL, 'Promotional control', 'Proportions', NULL, '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9816, 'system_level', 'Flash Sale', 'api', NULL, 'Flash Sale', 'Zap', '9815', '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9817, 'system_level', '/admin/promotional/flash-deals/list', 'api', NULL, 'All Campaigns', '', '9816', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9818, 'system_level', '/admin/promotional/flash-deals/join-request', 'api', NULL, 'Join Campaign Requests', '', '9816', '[\"view\",\"insert\",\"delete\",\"update\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9819, 'system_level', '/admin/promotional/banner/list', 'api', NULL, 'Banners', 'AlignJustify', '9815', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9820, 'system_level', '/admin/slider/list', 'api', NULL, 'Slider', 'SlidersHorizontal', '9815', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9821, 'system_level', 'Feedback Management', 'api', NULL, 'Feedback Management', 'MessageSquareReply', NULL, '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9822, 'system_level', '/admin/feedback-control/review', 'api', NULL, 'Reviews', 'Star', '9821', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9823, 'system_level', '/admin/feedback-control/questions', 'api', NULL, 'Questions', 'CircleHelp', '9821', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9824, 'system_level', 'Blog Management', 'api', NULL, 'Blog Management', '', NULL, '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9825, 'system_level', 'Blogs', 'api', NULL, 'Blogs', 'Rss', '9824', '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9826, 'system_level', '/admin/blog/category', 'api', NULL, 'Category', '', '9825', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9827, 'system_level', '/admin/blog/posts', 'api', NULL, 'Posts', '', '9825', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9828, 'system_level', 'Wallet Management', 'api', NULL, 'Wallet Management', '', NULL, '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9829, 'system_level', '/admin/wallet/list', 'api', NULL, 'Wallet Lists', 'Wallet', '9828', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9830, 'system_level', '/admin/wallet/transactions', 'api', NULL, 'Transaction History', 'History', '9828', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9831, 'system_level', '/admin/wallet/settings', 'api', NULL, 'Wallet Settings', 'Settings', '9828', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9832, 'system_level', 'Deliveryman', 'api', NULL, 'Deliveryman', 'UserRoundPen', NULL, '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9833, 'system_level', '/admin/deliveryman/vehicle-types/list', 'api', NULL, 'Vehicle Types', 'Car', '9832', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9834, 'system_level', '/admin/deliveryman/list', 'api', NULL, 'Deliveryman List', 'UserRoundPen', '9832', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9835, 'system_level', '/admin/deliveryman/trash-list', 'api', NULL, 'Trash', 'Trash', '9832', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9836, 'system_level', '/admin/deliveryman/request', 'api', NULL, 'Deliveryman Requests', 'ListPlus', '9832', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9837, 'system_level', 'Customer management', 'api', NULL, 'Customer management', '', NULL, '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9838, 'system_level', 'All Customers', 'api', NULL, 'All Customers', 'UsersRound', '9837', '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9839, 'system_level', '/admin/customer/list', 'api', NULL, 'Customers', '', '9838', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9840, 'system_level', '/admin/customer/trash-list', 'api', NULL, 'Trash', 'Trash', '9838', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9841, 'system_level', '/admin/customer/subscriber-list', 'api', NULL, 'Subscriber List', '', '9838', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9842, 'system_level', '/admin/customer/contact-messages', 'api', NULL, 'Contact Messages', '', '9838', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9843, 'system_level', 'Staff & Permissions', 'api', NULL, 'Staff & Permissions', '', NULL, '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9844, 'system_level', 'Staff Roles', 'api', NULL, 'Staff Roles', 'LockKeyholeOpen', '9843', '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9845, 'system_level', '/admin/roles/list', 'api', NULL, 'List', '', '9844', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9846, 'system_level', '/admin/roles/add', 'api', NULL, 'Add Role', '', '9844', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9847, 'system_level', 'My Staff', 'api', NULL, 'My Staff', 'Users', '9843', '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9848, 'system_level', '/admin/staff/list', 'api', NULL, 'List', '', '9847', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9849, 'system_level', '/admin/staff/add', 'api', NULL, 'Add Staff', '', '9847', '[\"view\",\"insert\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9850, 'system_level', 'Financial Management', 'api', NULL, 'Financial Management', '', NULL, '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9851, 'system_level', 'Financial', 'api', NULL, 'Financial', 'BadgeDollarSign', '9850', '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9852, 'system_level', '/admin/financial/withdraw/settings', 'api', NULL, 'Withdrawal Settings', '', '9851', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9853, 'system_level', '/admin/financial/withdraw/method/list', 'api', NULL, 'Withdrawal Method', '', '9851', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9854, 'system_level', '/admin/financial/withdraw/history', 'api', NULL, 'Withdraw History', '', '9851', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9855, 'system_level', '/admin/financial/withdraw/request', 'api', NULL, 'Withdraw Requests', '', '9851', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9856, 'system_level', '/admin/financial/cash-collect', 'api', NULL, 'Cash Collect', '', '9851', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9857, 'system_level', 'Report and analytics', 'api', NULL, 'Report and analytics', 'Logs', NULL, '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9858, 'system_level', '/admin/report-analytics/order', 'api', NULL, 'Order Report', 'FileChartColumnIncreasing', '9857', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9859, 'system_level', '/admin/report-analytics/transaction', 'api', NULL, 'Transaction Report', 'ChartNoAxesCombined', '9857', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9860, 'system_level', 'Communication Center', 'api', NULL, 'Communication Center', '', NULL, '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9861, 'system_level', 'Chat', 'api', NULL, 'Chat', 'MessageSquareMore', '9860', '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9862, 'system_level', '/admin/chat/settings', 'api', NULL, 'Chat Settings', '', '9861', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9863, 'system_level', '/admin/chat/manage', 'api', NULL, 'Chat List', '', '9861', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9864, 'system_level', 'Tickets', 'api', NULL, 'Tickets', 'Headphones', '9860', '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9865, 'system_level', '/admin/ticket/department', 'api', NULL, 'Department', '', '9864', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9866, 'system_level', '/admin/support-ticket/list', 'api', NULL, 'All Tickets', '', '9864', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9867, 'system_level', '/admin/notifications', 'api', NULL, 'Notifications', 'Bell', '9860', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9868, 'system_level', '/admin/store-notices', 'api', NULL, 'Notices', 'MessageSquareWarning', '9860', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9869, 'system_level', 'Business Operations', 'api', NULL, 'Business Operations', '', NULL, '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9870, 'system_level', '/admin/business-operations/store-type', 'api', NULL, 'Store Type', 'Store', '9869', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9871, 'system_level', '/admin/business-operations/area/list', 'api', NULL, 'Area Setup', 'Locate', '9869', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9872, 'system_level', 'Subscription', 'api', NULL, 'Subscription', 'PackageCheck', '9869', '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9873, 'system_level', '/admin/business-operations/subscription/package/list', 'api', NULL, 'Subscription Package', '', '9872', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9874, 'system_level', '/admin/business-operations/subscription/store/list', 'api', NULL, 'Store Subscription', '', '9872', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9875, 'system_level', '/admin/business-operations/commission/settings', 'api', NULL, 'Commission Settings', 'BadgePercent', '9869', '[\"view\",\"update\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9876, 'system_level', 'Gateway Management', 'api', NULL, 'Gateway Management', '', NULL, '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9877, 'system_level', '/admin/payment-gateways/settings', 'api', NULL, 'Payment Gateway', 'CreditCard', '9876', '[\"view\",\"update\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9878, 'system_level', '/admin/sms-provider/settings', 'api', NULL, 'SMS Settings', 'CreditCard', '9876', '[\"view\",\"update\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9879, 'system_level', 'System management', 'api', NULL, 'System management', '', NULL, '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9880, 'system_level', '/admin/system-management/general-settings', 'api', NULL, 'General Settings', 'Settings', '9879', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9881, 'system_level', 'Currencies', 'api', NULL, 'Currencies', 'FileSliders', '9879', '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9882, 'system_level', '/admin/system-management/currencies/settings', 'api', NULL, 'Settings', '', '9881', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9883, 'system_level', '/admin/system-management/currencies/manage', 'api', NULL, 'Manage Currencies', '', '9881', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9884, 'system_level', '/admin/pages/list', 'api', NULL, 'Page Lists', 'List', '9879', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9885, 'system_level', 'appearance_settings', 'api', NULL, 'Appearance Settings', 'MonitorCog', '9879', '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9886, 'system_level', '/admin/system-management/themes', 'api', NULL, 'Themes', 'Palette', '9885', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9887, 'system_level', '/admin/system-management/menu-customization', 'api', NULL, 'Menu Customization', '', '9885', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9888, 'system_level', '/admin/system-management/footer-customization', 'api', NULL, 'Footer Customization', '', '9885', '[\"view\",\"update\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9889, 'system_level', 'Email Settings', 'api', NULL, 'Email Settings', 'Mails', '9879', '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9890, 'system_level', '/admin/system-management/email-settings/smtp', 'api', NULL, 'SMTP Settings', '', '9889', '[\"view\",\"update\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9891, 'system_level', '/admin/system-management/email-settings/email-template/list', 'api', NULL, 'Email Templates', '', '9889', '[\"view\",\"update\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9892, 'system_level', '/admin/media-manage', 'api', NULL, 'Media', 'Images', '9879', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9893, 'system_level', '/admin/system-management/seo-settings', 'api', NULL, 'SEO Settings', 'SearchCheck', '9879', '[\"view\",\"update\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9894, 'system_level', '/admin/system-management/sitemap-settings', 'api', NULL, 'Sitemap Settings', 'Network', '9879', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9895, 'system_level', '/admin/system-management/gdpr-cookie-settings', 'api', NULL, 'Cookie Settings', 'Cookie', '9879', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9896, 'system_level', 'Third-Party', 'api', NULL, 'Third-Party', 'Blocks', '9879', '[\"view\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9897, 'system_level', '/admin/system-management/openai-settings', 'api', NULL, 'Open AI Settings', '', '9896', '[\"view\",\"insert\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9898, 'system_level', '/admin/system-management/google-map-settings', 'api', NULL, 'Google Map Settings', '', '9896', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9899, 'system_level', '/admin/system-management/firebase-settings', 'api', NULL, 'Firebase Settings', '', '9896', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9900, 'system_level', '/admin/system-management/social-login-settings', 'api', NULL, 'Social Login Settings', '', '9896', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9901, 'system_level', '/admin/system-management/recaptcha-settings', 'api', NULL, 'Recaptcha Settings', '', '9896', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9902, 'system_level', 'Maintenance Tools', 'api', NULL, 'Maintenance Tools', 'Wrench', '9879', '[\"view\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9903, 'system_level', '/admin/system-management/maintenance-settings', 'api', NULL, 'Maintenance Mode', '', '9902', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9904, 'system_level', '/admin/system-management/cache-management', 'api', NULL, 'Cache Management', 'DatabaseZap', '9902', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9905, 'system_level', '/admin/system-management/database-update-controls', 'api', NULL, 'Database Update', 'Database', '9902', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pos_store_customers`
--

CREATE TABLE `pos_store_customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pos_store_customers`
--

INSERT INTO `pos_store_customers` (`id`, `customer_id`, `store_id`, `created_at`, `updated_at`) VALUES
(1, 107, 5, '2025-10-04 23:21:09', '2025-10-04 23:21:09');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `brand_id` bigint(20) UNSIGNED DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` enum('grocery','bakery','medicine','makeup','bags','clothing','furniture','books','gadgets','animals-pet','fish') DEFAULT NULL,
  `behaviour` enum('consumable','service','digital','combo','physical') DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `video_url` varchar(100) DEFAULT NULL,
  `gallery_images` varchar(255) DEFAULT NULL,
  `warranty` varchar(255) DEFAULT NULL,
  `class` varchar(255) DEFAULT NULL,
  `return_in_days` varchar(255) DEFAULT NULL,
  `return_text` varchar(255) DEFAULT NULL,
  `allow_change_in_mind` varchar(255) DEFAULT NULL,
  `cash_on_delivery` int(11) DEFAULT NULL,
  `delivery_time_min` varchar(255) DEFAULT NULL,
  `delivery_time_max` varchar(255) DEFAULT NULL,
  `delivery_time_text` varchar(255) DEFAULT NULL,
  `max_cart_qty` int(11) DEFAULT NULL,
  `order_count` int(11) DEFAULT NULL,
  `views` int(11) NOT NULL DEFAULT 0,
  `status` enum('draft','pending','approved','inactive','suspended') NOT NULL DEFAULT 'pending',
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `meta_image` text DEFAULT NULL,
  `available_time_starts` timestamp NULL DEFAULT NULL,
  `available_time_ends` timestamp NULL DEFAULT NULL,
  `manufacture_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `store_id`, `category_id`, `brand_id`, `unit_id`, `type`, `behaviour`, `name`, `slug`, `description`, `image`, `video_url`, `gallery_images`, `warranty`, `class`, `return_in_days`, `return_text`, `allow_change_in_mind`, `cash_on_delivery`, `delivery_time_min`, `delivery_time_max`, `delivery_time_text`, `max_cart_qty`, `order_count`, `views`, `status`, `meta_title`, `meta_description`, `meta_keywords`, `meta_image`, `available_time_starts`, `available_time_ends`, `manufacture_date`, `expiry_date`, `is_featured`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 2, 1, 'grocery', 'consumable', 'Fresh Apples', 'fresh-apples-1', 'Fresh Apples are fresh and of premium quality, perfect for your daily needs. Stock up and enjoy every bite!', '1298', NULL, NULL, 'null', 'default', '22', 'Return within the specified days.', '0', 0, '1', '5', 'Can be delayed during holidays.', 2, 183, 417, 'approved', 'Buy Fresh Apples online', 'Order Fresh Apples online and get fresh groceries delivered to your door.', '[\"grocery\",\"Fresh Apples\",\"fresh\",\"0\"]', 'grocery-product0-meta.jpg', '2025-03-10 01:43:00', '2025-04-09 01:43:00', NULL, NULL, 0, NULL, '2025-03-10 01:43:05', '2025-10-05 23:44:52'),
(38, 2, 16, 6, 5, 'bakery', 'consumable', 'Blueberry Scones', 'blueberry-scones-6', 'Blueberry Scones is freshly baked and of premium quality, perfect for your daily needs. Stock up and enjoy every bite!', '1298', NULL, NULL, 'null', 'default', '1', 'Return within the specified days.', '0', 0, '2', '5', 'Can be delayed during holidays.', 10, 16, 285, 'approved', 'Buy Blueberry Scones online', 'Order Blueberry Scones online and get freshly baked goods delivered to your door.', '[\"bakery\",\"Blueberry Scones\",\"fresh\",\"5\"]', 'bakery-product5-meta.jpg', '2025-03-10 01:43:00', '2025-04-09 01:43:00', NULL, NULL, 0, NULL, '2025-03-10 01:43:06', '2025-08-13 05:43:08'),
(53, 3, 23, 9, 70, 'medicine', 'consumable', 'Vitamin C Tablets', 'vitamin-c-tablets-5', 'Vitamin C Tablets is a high-quality pharmaceutical product designed for effective treatment and relief.', '1298', NULL, NULL, 'null', 'default', '9', 'Return within the specified days if the packaging is unopened.', '0', 0, '1', '4', 'Delivery time may vary based on location and availability.', 3, 90, 141, 'approved', 'Buy Vitamin C Tablets online', 'Order Vitamin C Tablets online and get quality medicines delivered safely to your home.', '[\"medicine\",\"Vitamin C Tablets\",\"healthcare\",\"pharmacy\",\"4\"]', 'medicine-product4-meta.jpg', '2025-03-10 01:43:00', '2025-05-09 01:43:00', NULL, NULL, 1, NULL, '2025-05-10 01:43:06', '2025-09-27 00:12:53'),
(74, 4, 31, 2, 5, 'makeup', 'physical', 'Matte Lipstick', 'matte-lipstick-10', 'Matte Lipstick enhances your beauty with a flawless finish, designed for long-lasting wear.', '1298', NULL, NULL, '[{\"warranty_period\":\"2\",\"warranty_text\":\"Months Warranty\"}]', 'default', '30', 'Return within the specified days if unopened and unused.', '0', 0, '2', '7', 'Can be delayed during holidays.', 4, 24, 1013, 'approved', 'Buy Matte Lipstick online', 'Order Matte Lipstick online and get premium beauty products delivered to your doorstep.', '[\"makeup\",\"Matte Lipstick\",\"beauty\",\"cosmetics\",\"9\"]', 'makeup-product9-meta.jpg', '2025-03-10 01:43:00', '2025-05-09 01:43:00', NULL, NULL, 0, NULL, '2025-03-10 01:43:07', '2025-09-08 00:48:25'),
(75, 5, 36, 6, 5, 'bags', 'physical', 'Luxury Handbag', 'luxury-handbag-1', 'Luxury Handbag is stylish, durable, and perfect for your everyday needs.', '1298', NULL, NULL, '[{\"warranty_period\":5,\"warranty_text\":\"Years Warranty\"}]', 'default', '11', 'Return within the specified days if unused.', '0', 0, '2', '6', 'Can be delayed during holidays.', 2, 131, 856, 'approved', 'Buy Luxury Handbag online', 'Order Luxury Handbag online and get high-quality bags delivered to your doorstep.', '[\"bags\",\"Luxury Handbag\",\"travel\",\"fashion\",\"accessories\",\"0\"]', 'bag-product0-meta.jpg', '2025-03-10 01:43:00', '2025-05-09 01:43:00', NULL, NULL, 0, NULL, '2025-03-10 01:43:07', '2025-09-25 03:18:51'),
(91, 6, 43, 8, 5, 'clothing', 'physical', 'Denim Jacket', 'denim-jacket-5', 'Denim Jacket is stylish, comfortable, and perfect for your wardrobe.', '1298', NULL, NULL, '[{\"warranty_period\":\"1\",\"warranty_text\":\"Months Warranty\"}]', 'default', '22', 'Return within the specified days if unworn.', '0', 0, '2', '5', 'Delivery may take longer during peak seasons.', 2, 216, 283, 'approved', 'Buy Denim Jacket online', 'Order Denim Jacket online and update your wardrobe with the latest fashion trends.', '[\"clothing\",\"fashion\",\"Denim Jacket\",\"apparel\",\"4\"]', 'clothing-product4-meta.jpg', '2025-03-10 01:43:00', '2025-05-09 01:43:00', NULL, NULL, 0, NULL, '2025-03-10 01:43:07', '2025-05-05 03:42:45'),
(97, 7, 46, 19, 5, 'furniture', 'physical', 'Luxury Leather Sofa', 'luxury-leather-sofa-1', 'Luxury Leather Sofa is crafted with high-quality materials, offering durability and style for your space.', '1298', NULL, NULL, '[{\"warranty_period\":\"5\",\"warranty_text\":\"Years Warranty\"}]', 'default', '29', 'Return within the specified days if unused and in original packaging.', '0', 0, '5', '14', 'Delivery may take longer due to size and handling.', 3, 274, 10031, 'approved', 'Buy Luxury Leather Sofa online', 'Order Luxury Leather Sofa online and upgrade your home with premium furniture.', '[\"furniture\",\"home decor\",\"Luxury Leather Sofa\",\"interior design\",\"0\"]', 'furniture-product0-meta.jpg', '2025-03-10 01:43:00', '2025-06-08 01:43:00', NULL, NULL, 1, NULL, '2025-03-10 01:43:07', '2025-09-25 00:12:05'),
(117, 8, 57, 23, 5, 'books', 'physical', 'The Divine Comedy', 'the-divine-comedy-7', 'The Divine Comedy is a timeless classic, offering valuable insights and stories from the past.', '1298', NULL, NULL, '[{\"warranty_period\":3,\"warranty_text\":\"Years Warranty\"}]', 'default', '20', 'Return within the specified days if unused and in original condition.', '0', 0, '1', '7', 'Delivery may be delayed due to high demand during holidays.', 7, 95, 2928, 'approved', 'Buy The Divine Comedy online', 'Order The Divine Comedy online and enjoy the world of literature delivered to your doorstep.', '[\"book\",\"The Divine Comedy\",\"classic\",\"literature\",\"6\"]', 'book-product6-meta.jpg', '2025-03-10 01:43:00', '2025-04-09 01:43:00', NULL, NULL, 0, NULL, '2025-03-10 01:43:07', '2025-03-11 23:58:37'),
(121, 9, 60, 9, 5, 'gadgets', 'physical', 'iPhone 16 Pro Max', 'iphone-16-pro-max-1', 'iPhone 16 Pro Max offer the latest technology and superior performance for your daily needs.', '1298', NULL, NULL, '[{\"warranty_period\":\"2\",\"warranty_text\":\"Years Warranty\"}]', 'default', '26', 'Return within the specified days if unused and in original condition.', '0', 0, '1', '3', 'Delivery may be delayed due to high demand during holidays.', 6, 10060, 121, 'approved', 'Buy iPhone 16 Pro Max online', 'Order iPhone 16 Pro Max online and enjoy the latest tech products delivered to your doorstep.', '[\"gadgets\",\"iPhone 16 Pro Max\",\"tech\",\"0\"]', 'gadget-product0-meta.jpg', '2025-03-10 01:43:00', '2025-04-09 01:43:00', NULL, NULL, 1, NULL, '2025-05-13 01:43:07', '2025-09-25 00:12:05'),
(137, 10, 68, 29, 5, 'animals-pet', 'physical', 'Siamese Cat', 'siamese-cat-4', 'Siamese Cat are of the highest quality, perfect for your pet\'s comfort and care.', '1298', NULL, NULL, '[{\"warranty_period\":1,\"warranty_text\":\"Years Warranty\"}]', 'default', '27', 'Return within the specified days if unused and in original condition.', '0', 0, '1', '6', 'Can be delayed during holidays.', 2, 17, 111, 'approved', 'Buy Siamese Cat online', 'Order Siamese Cat online and get the best products for your pets delivered to your door.', '[\"pet supplies\",\"Siamese Cat\",\"pets\",\"3\"]', 'pet-product3-meta.jpg', '2025-03-10 01:43:00', '2025-04-09 01:43:00', NULL, NULL, 0, NULL, '2025-03-10 01:43:07', '2025-03-12 02:08:42'),
(144, 11, 73, NULL, 1, 'fish', 'physical', 'Fresh Salmon Fillets', 'fresh-salmon-fillets-1', 'Fresh Salmon Fillets are fresh and of premium quality, perfect for your daily seafood cravings.', '1298', NULL, NULL, 'null', 'default', '7', 'Return within the specified days if unused and in original condition.', '0', 0, '2', '5', 'Can be delayed during holidays.', 4, 97, 40, 'approved', 'Buy Fresh Salmon Fillets online', 'Order Fresh Salmon Fillets online and get the freshest fish and seafood delivered to your door.', '[\"fish\",\"seafood\",\"Fresh Salmon Fillets\",\"fresh\",\"0\"]', 'fish-product0-meta.jpg', '2025-03-10 01:43:00', '2025-04-09 01:43:00', NULL, NULL, 0, NULL, '2025-03-10 01:43:07', '2025-09-22 02:24:33');

-- --------------------------------------------------------

--
-- Table structure for table `product_attributes`
--

CREATE TABLE `product_attributes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `product_type` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_attributes`
--

INSERT INTO `product_attributes` (`id`, `name`, `product_type`, `created_by`, `updated_by`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Weight', 'grocery', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(2, 'Type', 'grocery', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(3, 'Flavor', 'grocery', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(4, 'Packaging', 'grocery', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(5, 'Packaging Size', 'grocery', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(6, 'Expiry Date', 'grocery', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(7, 'Flavor', 'bakery', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(8, 'Weight', 'bakery', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(9, 'Packaging Type', 'bakery', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(10, 'Expiry Date', 'bakery', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(11, 'Dosage', 'medicine', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(12, 'Manufacturer', 'medicine', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(13, 'Type', 'medicine', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(14, 'Expiry Date', 'medicine', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(15, 'Shade', 'makeup', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(16, 'Volume', 'makeup', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(17, 'Skin Type', 'makeup', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(18, 'Product Type', 'makeup', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(19, 'Packaging', 'makeup', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(20, 'Expiry Date', 'makeup', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(21, 'Color', 'clothing', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(22, 'Size', 'clothing', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(23, 'Material', 'clothing', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(24, 'Material', 'bags', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(25, 'Size', 'bags', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(26, 'Color', 'bags', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(27, 'Style', 'bags', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(28, 'Material', 'furniture', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(29, 'Dimensions', 'furniture', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(30, 'Weight Capacity', 'furniture', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(31, 'Color', 'furniture', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(32, 'Author', 'books', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(33, 'Genre', 'books', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(34, 'Language', 'books', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(35, 'Model', 'gadgets', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(36, 'Specifications', 'gadgets', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(37, 'Color', 'gadgets', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(38, 'Size', 'gadgets', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(39, 'Age', 'animals-pet', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(40, 'Size', 'animals-pet', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(41, 'Weight', 'animals-pet', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(42, 'Color', 'animals-pet', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(43, 'weight', 'fish', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(44, 'Fish Size', 'fish', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(45, 'Fish Location', 'fish', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(46, 'Fish Color', 'fish', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(47, 'Packaging', 'fish', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(48, 'Storage Method', 'fish', 8, 8, 1, '2025-03-10 01:43:03', '2025-03-20 01:22:27'),
(51, 'Weight Seller', 'grocery', 8, NULL, 1, '2025-04-22 05:49:11', '2025-04-22 06:03:16'),
(52, 'Color', 'grocery', 8, NULL, 1, '2025-04-22 08:33:20', '2025-06-17 04:40:36'),
(55, 'qewrqewr', 'grocery', 8, NULL, 1, '2025-04-27 10:20:44', '2025-04-27 10:20:54'),
(57, 'Egg', 'grocery', 1, NULL, 1, '2025-05-04 10:51:50', '2025-05-04 10:51:50'),
(58, 'Green Chiles', 'grocery', 1, NULL, 1, '2025-05-04 10:53:35', '2025-05-04 10:53:35'),
(66, 'Green Chiles', 'grocery', 8, NULL, 1, '2025-06-29 10:03:13', '2025-06-29 10:03:40'),
(68, 'use type', 'makeup', 8, NULL, 1, '2025-08-12 04:13:38', '2025-08-12 04:13:38');

-- --------------------------------------------------------

--
-- Table structure for table `product_attribute_values`
--

CREATE TABLE `product_attribute_values` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attribute_id` bigint(20) UNSIGNED NOT NULL,
  `value` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_attribute_values`
--

INSERT INTO `product_attribute_values` (`id`, `attribute_id`, `value`, `created_at`, `updated_at`) VALUES
(1, 1, '50g', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(2, 1, '100g', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(3, 1, '150g', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(4, 1, '250g', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(5, 1, '500g', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(6, 1, '1kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(7, 1, '1.5kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(8, 1, '2kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(9, 1, '3kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(10, 1, '4kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(11, 1, '5kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(12, 2, 'Fresh', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(13, 2, 'Frozen', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(14, 2, 'Dried', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(15, 2, 'Smoked', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(16, 2, 'Marinated', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(17, 2, 'Liquid', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(18, 2, 'Powder', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(19, 2, 'Spray', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(20, 2, 'Wipes', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(21, 3, 'Spicy', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(22, 3, 'Sweet', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(23, 3, 'Salty', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(24, 3, 'Cheesy', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(25, 3, 'Honey', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(26, 3, 'Chocolate', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(27, 3, 'Vanilla', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(28, 3, 'Fruits', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(29, 4, 'Single Pack', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(30, 4, 'Multi-Pack', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(31, 4, 'Loose', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(32, 4, 'Packed', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(33, 4, 'Resealable Bag', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(34, 4, 'Bottle', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(35, 4, 'Carton', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(36, 4, 'Plastic Tub', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(37, 4, 'Box', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(38, 4, 'Bag', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(39, 5, 'Small', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(40, 5, 'Medium', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(41, 5, 'Large', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(42, 5, '500ml', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(43, 5, '1L', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(44, 5, '5L', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(45, 5, '1 Piece', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(46, 5, '2 Pieces', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(47, 5, '4 Pieces', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(48, 5, '6 Pieces', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(49, 5, '12 Pieces', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(50, 6, '2025-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(51, 6, '2026-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(52, 6, '2027-01-01', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(53, 6, '2027-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(54, 6, '2028-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(55, 6, '2028-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(56, 6, '2029-01-15', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(57, 6, '2029-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(58, 6, '2029-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(59, 6, '2030-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(60, 6, '2030-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(61, 7, 'Vanilla', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(62, 7, 'Chocolate', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(63, 7, 'Strawberry', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(64, 8, '500g', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(65, 8, '1kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(66, 8, '2kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(67, 9, 'Box', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(68, 9, 'Bag', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(69, 9, 'Plastic', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(70, 10, '2025-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(71, 10, '2026-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(72, 10, '2027-01-01', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(73, 10, '2027-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(74, 10, '2028-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(75, 10, '2028-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(76, 10, '2029-01-15', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(77, 10, '2029-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(78, 10, '2029-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(79, 10, '2030-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(80, 10, '2030-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(81, 11, '50mg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(82, 11, '100mg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(83, 11, '200mg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(84, 12, 'Company A', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(85, 12, 'Company B', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(86, 13, 'Tablet', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(87, 13, 'Capsule', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(88, 13, 'Syrup', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(89, 13, 'Injection', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(90, 14, '2025-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(91, 14, '2026-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(92, 14, '2027-01-01', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(93, 14, '2027-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(94, 14, '2028-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(95, 14, '2028-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(96, 14, '2029-01-15', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(97, 14, '2029-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(98, 14, '2029-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(99, 14, '2030-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(100, 14, '2030-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(101, 15, 'Light', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(102, 15, 'Medium', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(103, 15, 'Dark', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(104, 15, 'Fair', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(105, 15, 'Tan', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(106, 15, 'Deep', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(107, 16, '15ml', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(108, 16, '30ml', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(109, 16, '50ml', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(110, 16, '100ml', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(111, 17, 'Oily', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(112, 17, 'Dry', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(113, 17, 'Combination', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(114, 17, 'Sensitive', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(115, 17, 'Normal', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(116, 18, 'Foundation', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(117, 18, 'Concealer', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(118, 18, 'Lipstick', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(119, 18, 'Mascara', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(120, 18, 'Eyeliner', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(121, 18, 'Blush', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(122, 18, 'Highlighter', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(123, 19, 'Tube', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(124, 19, 'Bottle', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(125, 19, 'Compact', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(126, 19, 'Palette', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(127, 20, '2025-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(128, 20, '2026-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(129, 20, '2027-01-01', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(130, 20, '2027-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(131, 20, '2028-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(132, 20, '2028-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(133, 20, '2029-01-15', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(134, 20, '2029-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(135, 20, '2029-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(136, 20, '2030-06-30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(137, 20, '2030-12-31', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(138, 21, 'Red', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(139, 21, 'Blue', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(140, 21, 'Green', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(141, 21, 'Black', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(142, 21, 'White', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(143, 21, 'Yellow', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(144, 21, 'Pink', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(145, 21, 'Purple', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(146, 21, 'Orange', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(147, 21, 'Gray', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(148, 21, 'Brown', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(149, 21, 'Beige', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(150, 21, 'Navy', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(151, 21, 'Turquoise', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(152, 21, 'Indigo', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(153, 22, 'XS', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(154, 22, 'S', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(155, 22, 'M', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(156, 22, 'L', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(157, 22, 'XL', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(158, 22, 'XXL', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(159, 22, 'XXXL', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(160, 22, 'XXS', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(161, 22, 'One Size', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(162, 23, 'Cotton', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(163, 23, 'Leather', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(164, 23, 'Polyester', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(165, 23, 'Linen', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(166, 23, 'Silk', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(167, 23, 'Wool', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(168, 23, 'Nylon', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(169, 23, 'Denim', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(170, 23, 'Spandex', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(171, 23, 'Rayon', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(172, 23, 'Velvet', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(173, 23, 'Fleece', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(174, 23, 'Chiffon', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(175, 23, 'Acrylic', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(176, 24, 'Leather', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(177, 24, 'Canvas', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(178, 24, 'Nylon', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(179, 24, 'Suede', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(180, 24, 'Polyester', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(181, 24, 'Jute', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(182, 24, 'Vegan Leather', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(183, 24, 'PVC', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(184, 24, 'Wool', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(185, 24, 'Satin', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(186, 24, 'Cordura', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(187, 25, 'Small', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(188, 25, 'Medium', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(189, 25, 'Large', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(190, 25, 'Extra Large', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(191, 25, 'Mini', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(192, 25, 'One Size', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(193, 26, 'Red', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(194, 26, 'Blue', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(195, 26, 'Black', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(196, 26, 'Brown', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(197, 26, 'White', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(198, 26, 'Pink', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(199, 26, 'Purple', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(200, 26, 'Beige', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(201, 26, 'Green', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(202, 26, 'Yellow', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(203, 26, 'Orange', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(204, 26, 'Gray', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(205, 26, 'Navy', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(206, 26, 'Tan', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(207, 27, 'Tote', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(208, 27, 'Backpack', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(209, 27, 'Crossbody', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(210, 27, 'Clutch', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(211, 27, 'Satchel', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(212, 27, 'Messenger', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(213, 27, 'Duffel', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(214, 27, 'Shoulder', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(215, 27, 'Hobo', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(216, 27, 'Briefcase', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(217, 28, 'Wood', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(218, 28, 'Metal', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(219, 28, 'Plastic', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(220, 28, 'Glass', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(221, 28, 'Leather', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(222, 28, 'Fabric', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(223, 28, 'Marble', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(224, 28, 'Stone', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(225, 28, 'Concrete', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(226, 28, 'Rattan', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(227, 28, 'Bamboo', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(228, 28, 'Mirrored', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(229, 28, 'Polyurethane', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(230, 28, 'Velvet', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(231, 29, '100x50x30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(232, 29, '150x75x50', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(233, 29, '200x100x75', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(234, 29, '120x60x40', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(235, 29, '180x90x60', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(236, 29, '250x150x100', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(237, 29, '90x45x30', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(238, 29, '60x30x20', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(239, 30, '50kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(240, 30, '100kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(241, 30, '200kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(242, 30, '300kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(243, 30, '500kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(244, 30, '1000kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(245, 31, 'Red', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(246, 31, 'Blue', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(247, 31, 'Green', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(248, 31, 'Black', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(249, 31, 'White', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(250, 31, 'Gray', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(251, 31, 'Brown', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(252, 31, 'Beige', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(253, 31, 'Tan', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(254, 31, 'Navy', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(255, 31, 'Olive', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(256, 31, 'Gold', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(257, 31, 'Silver', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(258, 31, 'Cream', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(259, 31, 'Wooden Finish', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(260, 32, 'Author A', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(261, 32, 'Author B', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(262, 32, 'Author C', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(263, 33, 'Fiction', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(264, 33, 'Non-fiction', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(265, 33, 'Sci-fi', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(266, 34, 'English', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(267, 34, 'Spanish', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(268, 34, 'French', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(269, 35, 'Model X', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(270, 35, 'Model Y', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(271, 35, 'Model Z', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(272, 35, 'ProMax', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(273, 35, 'UltraX', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(274, 35, 'ElitePlus', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(275, 35, 'SmartOne', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(276, 35, 'Vision', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(277, 36, 'Spec 1', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(278, 36, 'Spec 2', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(279, 36, 'Spec 3', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(280, 36, '4GB RAM', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(281, 36, '8GB RAM', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(282, 36, '16GB RAM', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(283, 36, '64GB Storage', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(284, 36, '128GB Storage', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(285, 36, '256GB Storage', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(286, 36, 'Full HD Display', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(287, 36, '4K Display', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(288, 36, 'Bluetooth 5.0', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(289, 36, 'Wi-Fi 6', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(290, 36, '5000mAh Battery', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(291, 36, 'Fast Charging', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(292, 36, 'Water Resistant', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(293, 36, 'GPS Enabled', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(294, 36, 'NFC Support', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(295, 36, 'Wireless Charging', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(296, 36, 'Fingerprint Scanner', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(297, 36, 'Face Recognition', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(298, 37, 'Black', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(299, 37, 'White', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(300, 37, 'Silver', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(301, 37, 'Gold', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(302, 37, 'Blue', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(303, 37, 'Red', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(304, 37, 'Green', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(305, 37, 'Pink', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(306, 37, 'Purple', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(307, 37, 'Gray', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(308, 37, 'Rose Gold', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(309, 37, 'Copper', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(310, 38, 'Small', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(311, 38, 'Medium', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(312, 38, 'Large', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(313, 38, 'Compact', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(314, 38, 'Slim', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(315, 38, 'Standard', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(316, 39, 'Puppy', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(317, 39, 'Kitten', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(318, 39, 'Adult', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(319, 39, 'Senior', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(320, 39, 'Newborn', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(321, 40, 'Small', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(322, 40, 'Medium', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(323, 40, 'Large', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(324, 40, 'Extra Large', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(325, 40, 'Tiny', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(326, 40, 'Miniature', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(327, 41, 'Under 5kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(328, 41, '5kg - 10kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(329, 41, '10kg - 20kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(330, 41, '20kg - 40kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(331, 41, '40kg and above', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(332, 42, 'Black', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(333, 42, 'White', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(334, 42, 'Brown', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(335, 42, 'Golden', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(336, 42, 'Gray', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(337, 42, 'Spotted', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(338, 42, 'Tan', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(339, 42, 'Multi-Color', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(340, 42, 'Cream', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(341, 42, 'Red', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(342, 42, 'Blue', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(343, 42, 'Striped', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(344, 42, 'Spotted', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(345, 43, 'Under 1kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(346, 43, '1kg - 2kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(347, 43, '2kg - 5kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(348, 43, '5kg - 10kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(349, 43, 'Above 10kg', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(350, 44, 'Small', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(351, 44, 'Medium', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(352, 44, 'Large', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(353, 44, 'Extra Large', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(354, 44, 'Miniature', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(355, 44, 'Jumbo', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(375, 47, 'Whole Fish', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(376, 47, 'Fillet', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(377, 47, 'Steak', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(378, 47, 'Sliced', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(379, 47, 'Minced', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(380, 47, 'Canned', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(381, 47, 'Frozen', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(382, 47, 'Smoked', '2025-03-10 01:43:03', '2025-03-10 01:43:03'),
(386, 48, 'Refrigerate', '2025-03-20 01:22:27', '2025-03-20 01:22:27'),
(387, 48, 'Freeze', '2025-03-20 01:22:27', '2025-03-20 01:22:27'),
(388, 48, 'Cool Storage', '2025-03-20 01:22:27', '2025-03-20 01:22:27'),
(402, 51, '50 Kg', '2025-04-22 06:03:25', '2025-04-22 06:03:25'),
(403, 51, '40Kg', '2025-04-22 06:03:25', '2025-04-22 06:03:25'),
(404, 51, '30Kg', '2025-04-22 06:03:25', '2025-04-22 06:03:25'),
(413, 55, 'qer', '2025-04-27 10:20:54', '2025-04-27 10:20:54'),
(417, 57, '4pcs', '2025-05-04 10:51:50', '2025-05-04 10:51:50'),
(418, 57, '8pcs', '2025-05-04 10:51:50', '2025-05-04 10:51:50'),
(419, 57, '12pcs', '2025-05-04 10:51:50', '2025-05-04 10:51:50'),
(426, 58, '1kg', '2025-05-05 09:08:10', '2025-05-05 09:08:10'),
(431, 45, 'Atlantic', '2025-05-15 11:56:26', '2025-05-15 11:56:26'),
(432, 45, 'Pacific', '2025-05-15 11:56:26', '2025-05-15 11:56:26'),
(433, 45, 'Indian Ocean', '2025-05-15 11:56:26', '2025-05-15 11:56:26'),
(434, 45, 'Arctic Ocean', '2025-05-15 11:56:26', '2025-05-15 11:56:26'),
(435, 45, 'Mediterranean Sea', '2025-05-15 11:56:26', '2025-05-15 11:56:26'),
(436, 45, 'Caribbean Sea', '2025-05-15 11:56:26', '2025-05-15 11:56:26'),
(437, 45, 'South China Sea', '2025-05-15 11:56:26', '2025-05-15 11:56:26'),
(438, 45, 'Gulf of Mexico', '2025-05-15 11:56:26', '2025-05-15 11:56:26'),
(439, 45, 'Great Barrier Reef', '2025-05-15 11:56:26', '2025-05-15 11:56:26'),
(447, 46, 'Silver', '2025-06-17 04:38:21', '2025-06-17 04:38:21'),
(448, 46, 'Red', '2025-06-17 04:38:21', '2025-06-17 04:38:21'),
(449, 46, 'Pink', '2025-06-17 04:38:21', '2025-06-17 04:38:21'),
(450, 46, 'Brown', '2025-06-17 04:38:21', '2025-06-17 04:38:21'),
(451, 46, 'Golden', '2025-06-17 04:38:21', '2025-06-17 04:38:21'),
(452, 46, 'Green', '2025-06-17 04:38:21', '2025-06-17 04:38:21'),
(453, 46, 'Blue', '2025-06-17 04:38:21', '2025-06-17 04:38:21'),
(454, 46, 'White', '2025-06-17 04:38:21', '2025-06-17 04:38:21'),
(455, 46, 'Black', '2025-06-17 04:38:21', '2025-06-17 04:38:21'),
(456, 46, 'Spotted', '2025-06-17 04:38:21', '2025-06-17 04:38:21'),
(457, 52, 'red', '2025-06-17 04:40:36', '2025-06-17 04:40:36'),
(475, 66, '1kg', '2025-06-29 10:03:40', '2025-06-29 10:03:40'),
(476, 66, '5kg', '2025-06-29 10:03:40', '2025-06-29 10:03:40'),
(477, 66, '10kg', '2025-06-29 10:03:40', '2025-06-29 10:03:40'),
(478, 66, '15kg', '2025-06-29 10:03:40', '2025-06-29 10:03:40'),
(481, 68, 'men', '2025-08-12 04:13:38', '2025-08-12 04:13:38'),
(482, 68, 'women', '2025-08-12 04:13:38', '2025-08-12 04:13:38');

-- --------------------------------------------------------

--
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

-- --------------------------------------------------------

--
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

-- --------------------------------------------------------

--
-- Table structure for table `product_category`
--

CREATE TABLE `product_category` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `category_slug` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `category_name_paths` varchar(255) DEFAULT NULL,
  `parent_path` varchar(255) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `category_level` int(11) DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 1,
  `admin_commission_rate` double DEFAULT NULL,
  `category_thumb` varchar(255) DEFAULT NULL,
  `category_banner` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_category`
--

INSERT INTO `product_category` (`id`, `category_name`, `category_slug`, `type`, `category_name_paths`, `parent_path`, `parent_id`, `category_level`, `is_featured`, `admin_commission_rate`, `category_thumb`, `category_banner`, `meta_title`, `meta_description`, `display_order`, `created_by`, `updated_by`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Daily Needs', 'daily needs', 'grocery', NULL, NULL, NULL, 1, 1, 0, '1296', '#EAF5E5', 'Daily needs', 'Daily needs', 1, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-16 09:06:00'),
(2, 'Fruits', 'fruits', 'grocery', 'Daily Needs', '1', 1, 2, 1, 0, '1296', '#fff', 'Fruits', 'Fruits', 58, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-17 10:46:41'),
(3, 'Dairy', 'dairy', 'grocery', 'Daily Needs', '1', 1, 2, 1, 0, '1296', '#fff', 'Dairy', 'Dairy', 20, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-17 10:47:47'),
(4, 'Beverages', 'beverages', 'grocery', 'Daily Needs', '1', 1, 2, 1, 0, '1296', '#fff', 'Beverages', 'Beverages', 36, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-17 10:48:14'),
(5, 'Snacks', 'snacks', 'grocery', 'Daily Needs', '1', 1, 2, 1, 0, '1296', '#fff', 'Snacks', 'Snacks', 5, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-02 06:44:26'),
(6, 'Meat & Seafood', 'meat-&-seafood', 'grocery', 'Daily Needs', '1', 1, 2, 1, 0, '1296', '#fff', 'Meat & Seafood', 'Meat & Seafood', 48, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-17 10:49:51'),
(7, 'Canned', 'canned', 'grocery', 'Daily Needs', '1', 1, 2, 1, 0, '1296', '#fff', 'Canned', 'Canned', 32, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-03 08:26:48'),
(8, 'Spices', 'spices', 'grocery', 'Daily Needs', '1', 1, 2, 1, 0, '1296', '#fff', 'Spices', 'Spices', 18, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-03 08:19:41'),
(9, 'Personal Care', 'personal-care', 'grocery', 'Daily Needs', '1', 1, 2, 1, 0, '1296', '#fff', 'Personal Care', 'Personal Care', 16, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-03 08:40:45'),
(10, 'Cleaning Supplies', 'cleaning-supplies', 'grocery', 'Daily Needs', '1', 1, 2, 1, 0, '1296', '#fff', 'Cleaning Supplies', 'Cleaning Supplies', 23, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-03 08:41:43'),
(11, 'Fresh bakery', 'fresh bakery', 'bakery', NULL, NULL, NULL, 1, 1, 0, '1296', '#FFF4E6', 'Fresh bakery', 'Fresh bakery', 2, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-16 09:43:30'),
(12, 'Bread', 'bread', 'bakery', 'Fresh bakery', '11', 11, 2, 1, 0, '1296', '#fff', 'Bread', 'Bread', 8, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-03 08:50:56'),
(13, 'Pastries', 'pastries', 'bakery', 'Fresh bakery', '11', 11, 2, 1, 0, '1296', '#fff', 'Pastries', 'Pastries', 13, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-03 08:51:49'),
(14, 'Cakes', 'cakes', 'bakery', 'Fresh bakery', '11', 11, 2, 1, 0, '1296', '#fff', 'Cakes', 'Cakes', 32, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-03 08:55:58'),
(15, 'Cookies', 'cookies', 'bakery', 'Fresh bakery', '11', 11, 2, 1, 0, '1296', '#fff', 'Cookies', 'Cookies', 16, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-03 08:57:32'),
(16, 'Muffins', 'muffins', 'bakery', 'Fresh bakery', '11', 11, 2, 1, 0, '1296', '#fff', 'Muffins', 'Muffins', 25, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-03 08:59:10'),
(17, 'Buns', 'buns', 'bakery', 'Fresh bakery', '11', 11, 2, 1, 0, '1296', '#fff', 'Buns', 'Buns', 7, NULL, NULL, 1, '2025-03-10 01:43:04', '2025-06-03 08:59:48'),
(18, 'Pies', 'pies', 'bakery', 'Fresh bakery', '11', 11, 2, 1, 0, '1296', '#fff', 'Pies', 'Pies', 19, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:00:22'),
(19, 'Bagels', 'bagels', 'bakery', 'Fresh bakery', '11', 11, 2, 1, 0, '1296', '#fff', 'Bagels', 'Bagels', 27, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:01:09'),
(20, 'Pharmacy essentials', 'pharmacy essentials', 'medicine', NULL, NULL, NULL, 1, 1, 0, '1296', '#EEF9FF', 'Pharmacy essentials', 'Pharmacy essentials', 3, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-16 09:43:56'),
(21, 'Pain Relief', 'pain-relief', 'medicine', 'Pharmacy essentials', '20', 20, 2, 1, 0, '1296', '#fff', 'Pain Relief', 'Pain Relief', 12, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:14:29'),
(22, 'Cold & Cough', 'cold-&-cough', 'medicine', 'Pharmacy essentials', '20', 20, 2, 1, 0, '1296', '#fff', 'Cold & Cough', 'Cold & Cough', 18, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:15:17'),
(23, 'Vitamins', 'vitamins', 'medicine', 'Pharmacy essentials', '20', 20, 2, 1, 0, '1296', '#fff', 'Vitamins', 'Vitamins', 37, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:15:46'),
(24, 'Digestive', 'digestive', 'medicine', 'Pharmacy essentials', '20', 20, 2, 1, 0, '1296', '#fff', 'Digestive', 'Digestive', 43, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:16:23'),
(25, 'BP & Heart Disease', 'bp-&-heart-disease', 'medicine', 'Pharmacy essentials', '20', 20, 2, 1, 0, '1296', '#fff', 'BP & Heart Disease', 'BP & Heart Disease', 28, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:17:05'),
(26, 'Skin Care', 'skin-care', 'medicine', 'Pharmacy essentials', '20', 20, 2, 1, 0, '1296', '#fff', 'Skin Care', 'Skin Care', 53, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:17:55'),
(27, 'Eye Care', 'eye-care', 'medicine', 'Pharmacy essentials', '20', 20, 2, 1, 0, '1296', '#fff', 'Eye Care', 'Eye Care', 64, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:18:42'),
(28, 'Herbal', 'herbal', 'medicine', 'Pharmacy essentials', '20', 20, 2, 1, 0, '1296', '#fff', 'Herbal', 'Herbal', 73, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:20:24'),
(29, 'Beauty & cosmetics', 'beauty & cosmetics', 'makeup', NULL, NULL, NULL, 1, 1, 0, '1296', '#FFEAE4', 'Beauty & cosmetics', 'Beauty & cosmetics', 4, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-16 09:44:16'),
(30, 'Foundations', 'foundations', 'makeup', 'Beauty & cosmetics', '29', 29, 2, 1, 0, '1296', '#fff', 'Foundations', 'Foundations', 380, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:29:21'),
(31, 'Lipsticks', 'lipsticks', 'makeup', 'Beauty & cosmetics', '29', 29, 2, 1, 0, '1296', '#fff', 'Lipsticks', 'Lipsticks', 48, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:30:01'),
(32, 'Eyeshadows', 'eyeshadows', 'makeup', 'Beauty & cosmetics', '29', 29, 2, 1, 0, '1296', '#fff', 'Eyeshadows', 'Eyeshadows', 64, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:30:53'),
(33, 'Mascaras', 'mascaras', 'makeup', 'Beauty & cosmetics', '29', 29, 2, 1, 0, '1296', '#fff', 'Mascaras', 'Mascaras', 72, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:31:49'),
(34, 'Blushes', 'blushes', 'makeup', 'Beauty & cosmetics', '29', 29, 2, 1, 0, '1296', '#fff', 'Blushes', 'Blushes', 62, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:33:15'),
(35, 'Bag collections', 'bag collections', 'bags', NULL, NULL, NULL, 1, 1, 0, '1296', '#FEF3E3', 'Bag collections', 'Bag collections', 5, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-16 09:44:47'),
(37, 'Totes', 'totes', 'bags', 'Bag collections', '35', 35, 2, 1, 0, '1296', '#fff', 'Totes', 'Totes', 25, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:45:56'),
(38, 'Backpacks', 'backpacks', 'bags', 'Bag collections', '35', 35, 2, 1, 0, '1296', '#fff', 'Backpacks', 'Backpacks', 62, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:46:33'),
(39, 'Wallets', 'wallets', 'bags', 'Bag collections', '35', 35, 2, 1, 0, '1296', '#fff', 'Wallets', 'Wallets', 18, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:47:04'),
(40, 'Clutches', 'clutches', 'bags', 'Bag collections', '35', 35, 2, 1, 0, '1296', '#fff', 'Clutches', 'Clutches', 48, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-08-06 04:05:16'),
(41, 'Crossbody', 'crossbody', 'bags', 'Bag collections', '35', 35, 2, 1, 0, '1296', '#fff', 'Crossbody', 'Crossbody', 54, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 09:49:59'),
(42, 'Clothing & style', 'clothing & style', 'clothing', NULL, NULL, NULL, 1, 1, 0, '1296', '#FFE6E2', 'Clothing & style', 'Clothing & style', 6, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-16 09:45:09'),
(43, 'Men', 'men', 'clothing', 'Clothing & style', '42', 42, 2, 1, 0, '1296', '#fff', 'Men', 'Men', 18, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-03 10:04:02'),
(44, 'Women', 'women', 'clothing', 'Clothing & style', '42', 42, 2, 1, 0, '1296', '#f66b6b', 'Women', 'Women', 154, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-08-06 00:40:34'),
(45, 'Furniture & decor', 'furniture & decor', 'furniture', NULL, NULL, NULL, 1, 1, 0, '1296', '#E3FBFF', 'Furniture & decor', 'Furniture & decor', 7, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-16 09:45:48'),
(46, 'Sofas', 'sofas', 'furniture', 'Furniture & decor', '45', 45, 2, 1, 0, '1296', '#ff4141', 'Sofas', 'Sofas', 1, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-08-06 00:30:25'),
(47, 'Chairs', 'chairs', 'furniture', 'Furniture & decor', '45', 45, 2, 1, 0, '1296', '#ffb000', 'Chairs', 'Chairs', 0, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-08-06 00:32:35'),
(48, 'Beds', 'beds', 'furniture', 'Furniture & decor', '45', 45, 2, 1, 0, '1296', '#d52626', 'Beds', 'Beds', 0, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-08-06 00:34:36'),
(49, 'Tables', 'tables', 'furniture', 'Furniture & decor', '45', 45, 2, 1, 0, '1296', '#efa02a', 'Tables', 'Tables', -1, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-08-06 00:35:07'),
(50, 'Dressers', 'dressers', 'furniture', 'Furniture & decor', '45', 45, 2, 1, 0, '1296', '#956c5a', 'Dressers', 'Dressers', 1, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-08-06 00:35:49'),
(51, 'Bookshelves', 'bookshelves', 'furniture', 'Furniture & decor', '45', 45, 2, 1, 0, '1296', '#ffffff', 'Bookshelves', 'Bookshelves', 2, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-08-06 00:36:37'),
(52, 'Desks', 'desks', 'furniture', 'Furniture & decor', '45', 45, 2, 1, 0, '1296', '#fff', 'Desks', 'Desks', 5, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-08-06 00:37:07'),
(53, 'Book collection', 'book collection', 'books', NULL, NULL, NULL, 1, 1, 0, '1296', '#FFF4E2', 'Book collection', 'Book collection', 8, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-16 09:46:11'),
(54, 'Fiction', 'fiction', 'books', 'Book collection', '53', 53, 2, 1, 0, '1296', '#fff', 'Fiction', 'Fiction', 38, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 08:11:14'),
(55, 'Non-Fiction', 'non-fiction', 'books', 'Book collection', '53', 53, 2, 1, 0, '1296', '#fff', 'Non-Fiction', 'Non-Fiction', 53, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 08:11:48'),
(56, 'Sci-Fi', 'sci-fi', 'books', 'Book collection', '53', 53, 2, 1, 0, '1296', '#fff', 'Sci-Fi', 'Sci-Fi', 48, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 08:12:19'),
(57, 'Fantasy', 'fantasy', 'books', 'Book collection', '53', 53, 2, 1, 0, '1296', '#fff', 'Fantasy', 'Fantasy', 37, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 08:12:54'),
(58, 'Biography', 'biography', 'books', 'Book collection', '53', 53, 2, 1, 0, '1296', '#fff', 'Biography', 'Biography', 74, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 08:13:24'),
(59, 'Tech & gadgets', 'tech & gadgets', 'gadgets', NULL, NULL, NULL, 1, 1, 0, '1296', '#E9FBFF', 'Tech & gadgets', 'Tech & gadgets', 9, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-16 09:46:36'),
(60, 'Phones', 'phones', 'gadgets', 'Tech & gadgets', '59', 59, 2, 1, 0, '1296', '#fff', 'Phones', 'Phones', 48, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 08:01:36'),
(61, 'Tablets', 'tablets', 'gadgets', 'Tech & gadgets', '59', 59, 2, 1, 0, '1296', '#fff', 'Tablets', 'Tablets', 256, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 08:03:39'),
(62, 'Headphones', 'headphones', 'gadgets', 'Tech & gadgets', '59', 59, 2, 1, 0, '1296', '#fff', 'Headphones', 'Headphones', 250, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 08:04:37'),
(63, 'Smart Watches', 'smart-watches', 'gadgets', 'Tech & gadgets', '59', 59, 2, 1, 0, '1296', '#fff', 'Smart Watches', 'Smart Watches', 32, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 08:05:11'),
(64, 'Laptops', 'laptops', 'gadgets', 'Tech & gadgets', '59', 59, 2, 1, 0, '1296', '#fff', 'Laptops', 'Laptops', 520, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 08:05:55'),
(65, 'Cameras', 'cameras', 'gadgets', 'Tech & gadgets', '59', 59, 2, 1, 0, '1296', '#fff', 'Cameras', 'Cameras', 486, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 08:06:33'),
(66, 'Pets & animals essentials', 'pets & animals essentials', 'animals-pet', NULL, NULL, NULL, 1, 1, 0, '1296', '#F0F0F0', 'Pets & animals essentials', 'Pets & animals essentials', 10, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-16 09:47:02'),
(67, 'Dogs', 'dogs', 'animals-pet', 'Pets & animals essentials', '66', 66, 2, 1, 0, '1296', '#fff', 'Dogs', 'Dogs', 758, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 06:39:30'),
(68, 'Cats', 'cats', 'animals-pet', 'Pets & animals essentials', '66', 66, 2, 1, 0, '1296', '#fff', 'Cats', 'Cats', 325, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 06:50:55'),
(69, 'Pet Toys', 'pet-toys', 'animals-pet', 'Pets & animals essentials', '66', 66, 2, 1, 0, '1296', '#fff', 'Pet Toys', 'Pet Toys', 12, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 06:52:32'),
(70, 'Grooming', 'grooming', 'animals-pet', 'Pets & animals essentials', '66', 66, 2, 1, 0, '1296', '#fff', 'Grooming', 'Grooming', 28, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 06:53:48'),
(71, 'Pet Food', 'pet-food', 'animals-pet', 'Pets & animals essentials', '66', 66, 2, 1, 0, '1296', '#fff', 'Pet Food', 'Pet Food', 37, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-02 06:55:08'),
(72, 'Fresh fish', 'fresh fish', 'fish', NULL, NULL, NULL, 1, 1, 0, '1296', '#FFEFE6', 'Fresh fish', 'Fresh fish', 4, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-06-29 10:23:20'),
(73, 'Freshwater', 'freshwater', 'fish', 'Fresh fish', '72', 72, 2, 1, 0, '1296', '#fff', 'Freshwater', 'Freshwater', 45, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-05-31 09:59:27'),
(74, 'Saltwater', 'saltwater', 'fish', 'Fresh fish', '72', 72, 2, 1, 0, '1296', '#fff', 'Saltwater', 'Saltwater', 385, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-05-31 10:03:29'),
(75, 'Aquarium Plants', 'aquarium-plants', 'fish', 'Fresh fish', '72', 72, 2, 1, 0, '1296', '#fff', 'Aquarium Plants', 'Aquarium Plants', 842, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-05-31 10:10:26'),
(76, 'Fish Food', 'fish-food', 'fish', 'Fresh fish', '72', 72, 2, 1, 0, '1296', '#fff', 'Fish Food', 'Fish Food', 2, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-05-31 10:15:00'),
(77, 'Water Care', 'water-care', 'fish', 'Fresh fish', '72', 72, 2, 1, 0, '1296', '#fff', 'Water Care', 'Water Care', 1, NULL, NULL, 1, '2025-03-10 01:43:05', '2025-05-31 10:17:59'),
(78, 'TV', 'tv', 'fish', 'Tech & gadgets', '59', 59, NULL, 0, 0, '1296', '#fff', NULL, NULL, 748, NULL, NULL, 1, '2025-03-11 03:22:45', '2025-06-02 08:07:11'),
(79, 'Speaker', 'speaker', 'fish', 'Tech & gadgets', '59', 59, NULL, 0, 0, '1296', '#fff', NULL, NULL, 152, NULL, NULL, 1, '2025-03-11 03:58:49', '2025-06-02 08:07:55'),
(80, 'Vegetables', 'vegetables', 'grocery', 'Daily needs', '1', 1, NULL, 0, 0, '1296', '#fff', 'Vegetables', 'Vegetables', 28, NULL, NULL, 1, '2025-03-15 22:33:34', '2025-06-03 08:38:29'),
(81, 'Panjabi', 'panjabi', 'clothing', 'Clothing & style/Men', '42/43', 43, NULL, 1, 0, '1296', '#ffffff', 'Panjabi Panjabi', 'Panjabi', 20, NULL, NULL, 1, '2025-03-24 22:27:58', '2025-06-03 10:34:14'),
(88, 'Handbag', 'handbag', 'bags', NULL, '35', 35, NULL, 0, 0, '1296', '#fff', NULL, NULL, 30, NULL, NULL, 1, '2025-06-03 09:53:19', '2025-08-06 04:07:47'),
(89, 'Beachbag', 'beachbag', 'bags', 'Bag collections', '35', 35, NULL, 0, 0, '1296', '#fff', NULL, NULL, 38, NULL, NULL, 1, '2025-06-03 09:56:58', '2025-06-03 09:56:58'),
(99, 'dafadfasdf', 'dafadfasdf', 'grocery', 'Daily Needs/Beverages/dfadfadsf/adsfadf', '1/4/95/96', 96, NULL, 0, 0, '1296', '#fff', 'adsfadsfdasf', NULL, NULL, NULL, NULL, 1, '2025-07-13 04:10:31', '2025-07-13 04:10:31');

-- --------------------------------------------------------

--
-- Table structure for table `product_queries`
--

CREATE TABLE `product_queries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `question` text NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `reply` text DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
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
-- Table structure for table `product_tags`
--

CREATE TABLE `product_tags` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `tag_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `variant_slug` varchar(255) DEFAULT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `pack_quantity` decimal(15,2) DEFAULT NULL,
  `weight_major` decimal(15,2) DEFAULT NULL,
  `weight_gross` decimal(15,2) DEFAULT NULL,
  `weight_net` decimal(15,2) DEFAULT NULL,
  `attributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attributes`)),
  `price` decimal(15,2) DEFAULT NULL,
  `special_price` decimal(15,2) DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `length` decimal(15,2) DEFAULT NULL,
  `width` decimal(15,2) DEFAULT NULL,
  `height` decimal(15,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `order_count` int(11) NOT NULL DEFAULT 0,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `variant_slug`, `sku`, `pack_quantity`, `weight_major`, `weight_gross`, `weight_net`, `attributes`, `price`, `special_price`, `stock_quantity`, `unit_id`, `length`, `width`, `height`, `image`, `order_count`, `status`, `deleted_at`, `created_at`, `updated_at`) VALUES
(157, 53, '100mg-Company A-Tablet', 'SKU-53-1', 10.00, 246.00, 945.00, 602.00, '{\"Dosage\":\"100mg\",\"Manufacturer\":\"Company A\",\"Type\":\"Tablet\"}', 20.00, 0.00, 780, 82, 19.00, 29.00, 30.00, '1299', 92, 1, NULL, '2025-03-10 01:43:08', '2025-08-18 04:19:49'),
(271, 91, 'Blue-L', 'SKU-91-1', 5.00, 211.00, 774.00, 694.00, '{\"Color\":\"Blue\",\"Size\":\"L\"}', 530.00, 519.00, 25, 38, 31.00, 14.00, 34.00, '1299', 20, 1, NULL, '2025-03-10 01:43:08', '2025-03-11 23:04:31'),
(351, 117, 'Author A-English', 'SKU-117-1', 10.00, 204.00, 536.00, 719.00, '{\"Author\":\"Author A\",\"Language\":\"English\"}', 400.00, 350.00, 800, 85, 45.00, 46.00, 26.00, '1299', 2, 1, NULL, '2025-03-10 01:43:08', '2025-03-11 23:58:37'),
(362, 121, 'ProMax-256GB Storage', 'SKU-121-1', 9.00, 419.00, 625.00, 624.00, '{\"Model\":\"ProMax\",\"Specifications\":\"256GB Storage\"}', 1000.00, 990.00, 940, 69, 39.00, 44.00, 28.00, '1299', 43, 1, NULL, '2025-03-10 01:43:08', '2025-09-25 00:12:05'),
(551, 1, '1 Kg', 'SKU-1-1', NULL, NULL, NULL, NULL, '{\"Weight\":\"1 Kg\"}', 9.00, 7.00, 242, NULL, NULL, NULL, NULL, '1299', 97, 1, NULL, '2025-03-10 03:00:17', '2025-09-10 22:17:24'),
(608, 38, 'Wild Blueberry-450g', 'SKU-38-1', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Wild Blueberry\",\"Weight\":\"450g\"}', 20.00, 0.00, 405, NULL, NULL, NULL, NULL, '1299', 1, 1, NULL, '2025-03-10 22:37:46', '2025-07-28 23:10:24'),
(609, 38, 'Lemon Poppyseed-450g', 'SKU-38-2', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Lemon Poppyseed\",\"Weight\":\"450g\"}', 15.00, 0.00, 605, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-03-10 22:37:47', '2025-07-28 23:10:24'),
(637, 53, '50mg-Company A-Tablet', 'SKU-53-2', NULL, NULL, NULL, NULL, '{\"Dosage\":\"50mg\",\"Manufacturer\":\"Company A\",\"Type\":\"Tablet\"}', 25.00, 0.00, 739, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-03-11 02:21:54', '2025-07-28 23:09:04'),
(649, 75, 'Brown', 'SKU-75-1', NULL, NULL, NULL, NULL, '{\"Color\":\"Brown\"}', 400.00, 350.00, 462, NULL, NULL, NULL, NULL, '1299', 36, 1, NULL, '2025-03-11 02:42:48', '2025-09-22 23:33:16'),
(650, 75, 'Pink', 'SKU-75-2', NULL, NULL, NULL, NULL, '{\"Color\":\"Pink\"}', 380.00, 320.00, 500, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-03-11 02:42:48', '2025-03-11 02:44:21'),
(687, 121, 'UltraX-256GB Storage', 'SKU-121-2', NULL, NULL, NULL, NULL, '{\"Model\":\"UltraX\",\"Specifications\":\"256GB Storage\"}', 1200.00, 1150.00, 1000, NULL, NULL, NULL, NULL, '1299', 1, 1, NULL, '2025-03-11 04:19:47', '2025-07-19 05:55:21'),
(688, 74, 'Light-10g', 'SKU-74-1', NULL, NULL, NULL, NULL, '{\"Shade\":\"Light\",\"Volume\":\"10g\"}', 81.00, 0.00, 82, NULL, NULL, NULL, NULL, '1299', 1, 1, NULL, '2025-03-11 21:07:40', '2025-05-29 06:21:53'),
(689, 74, 'Deep-10g', 'SKU-74-2', NULL, NULL, NULL, NULL, '{\"Shade\":\"Deep\",\"Volume\":\"10g\"}', 74.00, 0.00, 65, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-03-11 21:07:40', '2025-03-11 21:07:40'),
(690, 97, 'rexine-94x228-Red', 'SKU-97-1', NULL, NULL, NULL, NULL, '{\"Material\":\"rexine\",\"Dimensions\":\"94x228\",\"Color\":\"Red\"}', 1200.00, 1135.00, 18, NULL, NULL, NULL, NULL, '1299', 4, 1, NULL, '2025-03-11 21:21:03', '2025-09-25 00:12:05'),
(691, 97, 'rexine-115x228-Red', 'SKU-97-2', NULL, NULL, NULL, NULL, '{\"Material\":\"rexine\",\"Dimensions\":\"115x228\",\"Color\":\"Red\"}', 1500.00, 1480.00, 83, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-03-11 21:21:03', '2025-03-11 21:22:17'),
(716, 91, 'navy blue-L', 'SKU-91-2', NULL, NULL, NULL, NULL, '{\"Color\":\"navy blue\",\"Size\":\"L\"}', 256.00, 0.00, 40, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-03-11 22:48:50', '2025-03-11 23:04:31'),
(728, 144, '500g-3kg - 4kg-Steak-Refrigerate', 'SKU-144-1', NULL, NULL, NULL, NULL, '{\"weight\":\"500g\",\"Fish Size\":\"3kg - 4kg\",\"Packaging\":\"Steak\",\"Storage Method\":\"Refrigerate\"}', 150.00, 0.00, 798, NULL, NULL, NULL, NULL, '1299', 2, 1, NULL, '2025-03-11 23:40:19', '2025-08-20 04:37:43'),
(729, 144, '1kg-3kg - 4kg-Steak-Refrigerate', 'SKU-144-2', NULL, NULL, NULL, NULL, '{\"weight\":\"1kg\",\"Fish Size\":\"3kg - 4kg\",\"Packaging\":\"Steak\",\"Storage Method\":\"Refrigerate\"}', 130.00, 0.00, 200, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-03-11 23:40:19', '2025-07-28 22:45:22'),
(736, 117, 'Author A-French', 'SKU-117-2', NULL, NULL, NULL, NULL, '{\"Author\":\"Author A\",\"Language\":\"French\"}', 400.00, 350.00, 800, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-03-11 23:58:37', '2025-03-11 23:58:37'),
(749, 137, 'Kitten-Small-Under 5kg-seal point', 'SKU-137-1', NULL, NULL, NULL, NULL, '{\"Age\":\"Kitten\",\"Size\":\"Small\",\"Weight\":\"Under 5kg\",\"Color\":\"seal point\"}', 959.00, 0.00, 6, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-03-12 02:08:42', '2025-03-12 02:08:42'),
(750, 137, 'Kitten-Small-Under 5kg-lilac point', 'SKU-137-2', NULL, NULL, NULL, NULL, '{\"Age\":\"Kitten\",\"Size\":\"Small\",\"Weight\":\"Under 5kg\",\"Color\":\"lilac point\"}', 800.00, 0.00, 2, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-03-12 02:08:42', '2025-03-12 02:08:42'),
(821, 191, 'Blue-XS', 'oJ6c63Rw', NULL, NULL, NULL, NULL, '{\"Color\":\"Blue\",\"Size\":\"XS\"}', 500.00, 300.00, 5000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-13 11:44:14', '2025-04-13 11:45:06'),
(822, 191, 'Blue-XL', 'JjCI6L99', NULL, NULL, NULL, NULL, '{\"Color\":\"Blue\",\"Size\":\"XL\"}', 500.00, 200.00, 5000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-13 11:44:14', '2025-04-13 11:45:06'),
(823, 191, 'Black-XS', 'Ogdwb1Nw', NULL, NULL, NULL, NULL, '{\"Color\":\"Black\",\"Size\":\"XS\"}', 360.00, 300.00, 5000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-13 11:44:14', '2025-04-13 11:45:06'),
(824, 191, 'Black-XL', '48kEZ8ss', NULL, NULL, NULL, NULL, '{\"Color\":\"Black\",\"Size\":\"XL\"}', 400.00, 380.00, 5000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-13 11:44:14', '2025-04-13 11:45:06'),
(827, 193, '100g', 'bLCqvDNQ', NULL, NULL, NULL, NULL, '{\"Weight\":\"100g\"}', 100.00, 50.00, 5, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-15 12:28:22', '2025-04-15 12:28:22'),
(828, 194, 'Sweet', 'DIgWTB1n', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Sweet\"}', 100.00, 0.00, 1993, NULL, NULL, NULL, NULL, '1299', 2, 1, NULL, '2025-04-17 10:21:40', '2025-05-12 11:49:07'),
(829, 195, 'Sweet', 'S10T5yLN', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Sweet\"}', 100.00, 0.00, 2000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-17 10:21:52', '2025-04-17 10:21:52'),
(830, 196, 'Sweet', 'U2xHDNtF', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Sweet\"}', 100.00, 0.00, 1993, NULL, NULL, NULL, NULL, '1299', 4, 1, NULL, '2025-04-17 10:21:54', '2025-05-13 12:04:20'),
(831, 197, 'Sweet', 'kl6AQezK', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Sweet\"}', 100.00, 0.00, 2000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-17 10:21:57', '2025-04-17 10:21:57'),
(832, 198, 'Sweet', '6gdZMIJQ', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Sweet\"}', 100.00, 0.00, 2000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-17 10:21:58', '2025-04-17 10:21:58'),
(833, 199, 'Sweet', 'M35wYUc6', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Sweet\"}', 100.00, 0.00, 2000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-17 10:22:00', '2025-04-17 10:22:00'),
(834, 200, 'Sweet', 'xMS4xTTy', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Sweet\"}', 100.00, 0.00, 2000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-17 10:22:01', '2025-04-17 10:22:01'),
(835, 201, 'Sweet', 'iBZABXcC', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Sweet\"}', 100.00, 0.00, 2000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-17 10:22:03', '2025-04-17 10:22:03'),
(836, 202, 'Sweet', 'Ot6E40vm', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Sweet\"}', 100.00, 0.00, 2000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-17 10:22:06', '2025-04-17 10:22:06'),
(837, 203, 'Sweet', 'srJH7L9y', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Sweet\"}', 100.00, 0.00, 2000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-17 10:22:07', '2025-04-17 10:22:07'),
(838, 204, 'Sweet', '9W6xAxe0', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Sweet\"}', 100.00, 0.00, 2000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-17 10:22:09', '2025-04-19 08:11:35'),
(839, 205, 'Sweet', 'HsN9ZjSn', NULL, NULL, NULL, NULL, '{\"Flavor\":\"Sweet\"}', 100.00, 0.00, 2000, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-17 10:22:11', '2025-04-19 08:13:02'),
(840, 206, '50g-Sweet', 'eEuw32eL', NULL, NULL, NULL, NULL, '{\"Weight\":\"50g\",\"Flavor\":\"Sweet\"}', 444.00, 400.00, 2222, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-17 10:28:10', '2025-04-17 10:28:10'),
(841, 207, '100g-Fresh', '7TlOHcIg', NULL, NULL, NULL, NULL, '{\"Weight\":\"100g\",\"Type\":\"Fresh\"}', 23.00, 13.00, 23, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-19 08:53:12', '2025-04-19 08:53:12'),
(842, 208, '100g', 'nOWjMpuC', NULL, NULL, NULL, NULL, '{\"Weight\":\"100g\"}', 333.00, 22.00, 3333, NULL, NULL, NULL, NULL, '1299', 0, 1, NULL, '2025-04-19 08:58:43', '2025-04-19 08:58:43');

-- --------------------------------------------------------

--
-- Table structure for table `product_views`
--

CREATE TABLE `product_views` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_views`
--

INSERT INTO `product_views` (`id`, `product_id`, `user_id`, `ip_address`, `created_at`, `updated_at`) VALUES
(1, 50, NULL, '192.168.88.126', '2025-09-23 04:00:22', '2025-09-23 04:00:22'),
(2, 121, NULL, '192.168.88.158', '2025-09-23 04:57:57', '2025-09-23 04:57:57'),
(3, 221, NULL, '192.168.88.158', '2025-09-23 05:24:35', '2025-09-23 05:24:35'),
(4, 221, 1, NULL, '2025-09-23 05:35:51', '2025-09-23 05:35:51'),
(5, 53, 1, NULL, '2025-09-23 21:46:53', '2025-09-23 21:46:53'),
(6, 98, 1, NULL, '2025-09-23 21:49:01', '2025-09-23 21:49:01'),
(7, 221, NULL, '192.168.88.126', '2025-09-23 22:19:13', '2025-09-23 22:19:13'),
(8, 225, NULL, '192.168.88.126', '2025-09-23 22:23:19', '2025-09-23 22:23:19'),
(9, 75, 1, NULL, '2025-09-24 01:57:41', '2025-09-24 01:57:41'),
(10, 225, 1, NULL, '2025-09-24 02:01:27', '2025-09-24 02:01:27'),
(11, 6, 1, NULL, '2025-09-24 02:21:30', '2025-09-24 02:21:30'),
(12, 67, NULL, '192.168.88.141', '2025-09-24 02:55:32', '2025-09-24 02:55:32'),
(13, 121, 1, NULL, '2025-09-24 02:56:34', '2025-09-24 02:56:34'),
(14, 120, 1, NULL, '2025-09-24 05:33:04', '2025-09-24 05:33:04'),
(15, 85, 1, NULL, '2025-09-24 05:58:49', '2025-09-24 05:58:49'),
(16, 73, 1, NULL, '2025-09-24 06:00:25', '2025-09-24 06:00:25'),
(17, 75, NULL, '192.168.88.77', '2025-09-24 09:45:35', '2025-09-24 09:45:35'),
(18, 66, NULL, '192.168.88.183', '2025-09-24 09:46:23', '2025-09-24 09:46:23'),
(19, 121, NULL, '192.168.88.77', '2025-09-24 10:00:42', '2025-09-24 10:00:42'),
(20, 4, NULL, '192.168.88.78', '2025-09-24 10:12:13', '2025-09-24 10:12:13'),
(21, 225, NULL, '192.168.88.183', '2025-09-24 23:31:55', '2025-09-24 23:31:55'),
(22, 3, NULL, '192.168.88.183', '2025-09-24 23:42:52', '2025-09-24 23:42:52'),
(23, 122, 1, NULL, '2025-09-24 23:58:24', '2025-09-24 23:58:24'),
(24, 37, 1, NULL, '2025-09-24 23:59:26', '2025-09-24 23:59:26'),
(25, 40, 1, NULL, '2025-09-25 00:01:43', '2025-09-25 00:01:43'),
(26, 100, 1, NULL, '2025-09-25 00:01:47', '2025-09-25 00:01:47'),
(27, 97, 1, NULL, '2025-09-25 00:09:31', '2025-09-25 00:09:31'),
(28, 64, NULL, '192.168.88.126', '2025-09-25 02:53:13', '2025-09-25 02:53:13'),
(29, 75, NULL, '192.168.88.78', '2025-09-25 03:18:51', '2025-09-25 03:18:51'),
(30, 27, NULL, '192.168.88.78', '2025-09-25 03:21:38', '2025-09-25 03:21:38'),
(31, 98, NULL, '192.168.88.78', '2025-09-25 03:23:45', '2025-09-25 03:23:45'),
(32, 225, NULL, '192.168.88.158', '2025-09-25 03:59:22', '2025-09-25 03:59:22'),
(33, 228, NULL, '192.168.88.141', '2025-09-25 04:16:36', '2025-09-25 04:16:36'),
(34, 170, 1, NULL, '2025-09-25 05:46:39', '2025-09-25 05:46:39'),
(35, 66, NULL, '192.168.88.77', '2025-09-26 23:34:19', '2025-09-26 23:34:19'),
(36, 6, NULL, '192.168.88.78', '2025-09-27 00:10:33', '2025-09-27 00:10:33'),
(37, 221, NULL, '192.168.88.77', '2025-09-27 00:12:49', '2025-09-27 00:12:49'),
(38, 53, NULL, '192.168.88.77', '2025-09-27 00:12:53', '2025-09-27 00:12:53'),
(39, 2, 1, NULL, '2025-09-27 02:12:06', '2025-09-27 02:12:06'),
(40, 62, NULL, '192.168.88.158', '2025-09-27 04:42:08', '2025-09-27 04:42:08'),
(41, 55, NULL, '192.168.88.158', '2025-09-27 04:42:33', '2025-09-27 04:42:33'),
(42, 182, NULL, '192.168.88.77', '2025-09-27 09:16:33', '2025-09-27 09:16:33'),
(43, 27, NULL, '192.168.88.158', '2025-09-27 21:31:31', '2025-09-27 21:31:31'),
(44, 78, NULL, '192.168.88.126', '2025-09-27 22:20:51', '2025-09-27 22:20:51'),
(45, 228, NULL, '192.168.88.126', '2025-09-28 00:09:25', '2025-09-28 00:09:25'),
(46, 6, NULL, '192.168.88.126', '2025-09-28 00:09:46', '2025-09-28 00:09:46'),
(47, 4, 1, NULL, '2025-09-28 01:59:41', '2025-09-28 01:59:41'),
(48, 123, 1, NULL, '2025-09-28 02:53:05', '2025-09-28 02:53:05'),
(49, 228, 1, NULL, '2025-09-28 02:55:22', '2025-09-28 02:55:22'),
(50, 27, 1, NULL, '2025-09-28 02:58:54', '2025-09-28 02:58:54'),
(51, 123, NULL, '192.168.88.158', '2025-09-28 03:18:18', '2025-09-28 03:18:18'),
(52, 131, NULL, '192.168.88.158', '2025-09-28 03:18:31', '2025-09-28 03:18:31'),
(53, 132, NULL, '192.168.88.158', '2025-09-28 03:18:41', '2025-09-28 03:18:41'),
(54, 131, NULL, '192.168.88.111', '2025-09-28 03:20:33', '2025-09-28 03:20:33'),
(55, 61, NULL, '192.168.88.126', '2025-09-28 03:56:38', '2025-09-28 03:56:38'),
(56, 182, 1, NULL, '2025-09-28 07:13:55', '2025-09-28 07:13:55'),
(57, 185, 1, NULL, '2025-09-28 07:15:12', '2025-09-28 07:15:12'),
(58, 95, NULL, '192.168.88.126', '2025-09-28 21:38:41', '2025-09-28 21:38:41'),
(59, 129, NULL, '192.168.88.126', '2025-09-28 21:46:41', '2025-09-28 21:46:41'),
(60, 225, NULL, '192.168.88.78', '2025-09-28 21:53:59', '2025-09-28 21:53:59'),
(61, 225, NULL, '192.168.88.141', '2025-09-28 21:58:34', '2025-09-28 21:58:34'),
(62, 229, NULL, '192.168.88.141', '2025-09-28 22:13:57', '2025-09-28 22:13:57'),
(63, 98, NULL, '192.168.88.126', '2025-09-29 00:58:08', '2025-09-29 00:58:08'),
(64, 40, NULL, '192.168.88.126', '2025-09-29 02:02:26', '2025-09-29 02:02:26'),
(65, 8, NULL, '192.168.88.126', '2025-09-29 03:08:58', '2025-09-29 03:08:58'),
(66, 55, NULL, '192.168.88.126', '2025-09-29 21:36:52', '2025-09-29 21:36:52'),
(67, 229, NULL, '192.168.88.126', '2025-09-30 00:00:12', '2025-09-30 00:00:12'),
(68, 225, NULL, '192.168.88.181', '2025-09-30 03:47:52', '2025-09-30 03:47:52'),
(69, 110, NULL, '192.168.88.181', '2025-09-30 03:50:03', '2025-09-30 03:50:03'),
(70, 221, NULL, '192.168.88.181', '2025-10-05 00:41:18', '2025-10-05 00:41:18'),
(71, 1, 1, NULL, '2025-10-05 23:44:52', '2025-10-05 23:44:52');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `reviewable_id` bigint(20) UNSIGNED NOT NULL,
  `reviewable_type` varchar(255) NOT NULL COMMENT 'product or delivery_man',
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `review` text NOT NULL,
  `rating` decimal(3,2) NOT NULL COMMENT '1-5 star rating',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `like_count` int(11) NOT NULL DEFAULT 0,
  `dislike_count` int(11) NOT NULL DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review_reactions`
--

CREATE TABLE `review_reactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `review_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `reaction_type` enum('like','dislike') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `available_for` varchar(255) NOT NULL DEFAULT 'system_level',
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `locked` tinyint(1) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `available_for`, `name`, `guard_name`, `locked`, `status`, `created_at`, `updated_at`) VALUES
(1, 'system_level', 'Super Admin', 'api', 1, 1, '2023-08-11 05:57:33', '2023-08-11 05:57:33'),
(2, 'store_level', 'Store Admin', 'api', 1, 1, '2023-08-11 05:57:33', '2023-08-11 05:57:33'),
(6, 'delivery_level', 'Delivery Man', 'api', 1, 1, '2023-08-11 05:57:33', '2023-08-11 05:57:33'),
(17, 'system_level', 'Admin', 'api', 0, 1, '2025-05-15 03:39:59', '2025-05-15 03:39:59'),
(21, 'store_level', 'Store Manager', 'api', 0, 1, '2025-07-09 05:52:11', '2025-07-09 05:52:11');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `view` tinyint(1) DEFAULT NULL,
  `insert` tinyint(1) DEFAULT NULL,
  `update` tinyint(1) DEFAULT NULL,
  `delete` tinyint(1) DEFAULT NULL,
  `others` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`, `view`, `insert`, `update`, `delete`, `others`) VALUES
(163, 6, 1, NULL, NULL, NULL, NULL),
(8695, 2, 1, NULL, NULL, NULL, NULL),
(8696, 2, 1, NULL, NULL, NULL, NULL),
(8697, 2, 1, NULL, NULL, NULL, NULL),
(8698, 2, 1, NULL, NULL, NULL, NULL),
(8699, 2, 1, NULL, NULL, NULL, NULL),
(8700, 2, 1, NULL, NULL, NULL, NULL),
(8701, 2, 1, NULL, NULL, NULL, NULL),
(8702, 2, 1, NULL, NULL, NULL, NULL),
(8703, 2, 1, NULL, NULL, NULL, NULL),
(8704, 2, 1, NULL, NULL, NULL, NULL),
(8705, 2, 1, NULL, NULL, NULL, NULL),
(8706, 2, 1, NULL, NULL, NULL, NULL),
(8707, 2, 1, NULL, NULL, NULL, NULL),
(8708, 2, 1, NULL, NULL, NULL, NULL),
(8709, 2, 1, NULL, NULL, NULL, NULL),
(8710, 2, 1, NULL, NULL, NULL, NULL),
(8711, 2, 1, NULL, NULL, NULL, NULL),
(8712, 2, 1, NULL, NULL, NULL, NULL),
(8713, 2, 1, NULL, NULL, NULL, NULL),
(8714, 2, 1, NULL, NULL, NULL, NULL),
(8715, 2, 1, NULL, NULL, NULL, NULL),
(8716, 2, 1, NULL, NULL, NULL, NULL),
(8717, 2, 1, NULL, NULL, NULL, NULL),
(8718, 2, 1, NULL, NULL, NULL, NULL),
(8719, 2, 1, NULL, NULL, NULL, NULL),
(8720, 2, 1, NULL, NULL, NULL, NULL),
(8721, 2, 1, NULL, NULL, NULL, NULL),
(8722, 2, 1, NULL, NULL, NULL, NULL),
(8723, 2, 1, NULL, NULL, NULL, NULL),
(8724, 2, 1, NULL, NULL, NULL, NULL),
(8725, 2, 1, NULL, NULL, NULL, NULL),
(8726, 2, 1, NULL, NULL, NULL, NULL),
(8727, 2, 1, NULL, NULL, NULL, NULL),
(8728, 2, 1, NULL, NULL, NULL, NULL),
(8729, 2, 1, NULL, NULL, NULL, NULL),
(8730, 2, 1, NULL, NULL, NULL, NULL),
(8731, 2, 1, NULL, NULL, NULL, NULL),
(8732, 2, 1, NULL, NULL, NULL, NULL),
(8733, 2, 1, NULL, NULL, NULL, NULL),
(9775, 1, 1, NULL, NULL, NULL, NULL),
(9776, 1, 1, NULL, NULL, NULL, NULL),
(9777, 1, 1, NULL, NULL, NULL, NULL),
(9778, 1, 1, NULL, NULL, NULL, NULL),
(9779, 1, 1, NULL, NULL, NULL, NULL),
(9780, 1, 1, NULL, NULL, NULL, NULL),
(9781, 1, 1, NULL, NULL, NULL, NULL),
(9782, 1, 1, NULL, NULL, NULL, NULL),
(9783, 1, 1, NULL, NULL, NULL, NULL),
(9784, 1, 1, NULL, NULL, NULL, NULL),
(9785, 1, 1, NULL, NULL, NULL, NULL),
(9786, 1, 1, NULL, NULL, NULL, NULL),
(9787, 1, 1, NULL, NULL, NULL, NULL),
(9788, 1, 1, NULL, NULL, NULL, NULL),
(9789, 1, 1, NULL, NULL, NULL, NULL),
(9790, 1, 1, NULL, NULL, NULL, NULL),
(9791, 1, 1, NULL, NULL, NULL, NULL),
(9792, 1, 1, NULL, NULL, NULL, NULL),
(9793, 1, 1, NULL, NULL, NULL, NULL),
(9794, 1, 1, NULL, NULL, NULL, NULL),
(9795, 1, 1, NULL, NULL, NULL, NULL),
(9796, 1, 1, NULL, NULL, NULL, NULL),
(9797, 1, 1, NULL, NULL, NULL, NULL),
(9798, 1, 1, NULL, NULL, NULL, NULL),
(9799, 1, 1, NULL, NULL, NULL, NULL),
(9800, 1, 1, NULL, NULL, NULL, NULL),
(9801, 1, 1, NULL, NULL, NULL, NULL),
(9802, 1, 1, NULL, NULL, NULL, NULL),
(9803, 1, 1, NULL, NULL, NULL, NULL),
(9804, 1, 1, NULL, NULL, NULL, NULL),
(9805, 1, 1, NULL, NULL, NULL, NULL),
(9806, 1, 1, NULL, NULL, NULL, NULL),
(9807, 1, 1, NULL, NULL, NULL, NULL),
(9808, 1, 1, NULL, NULL, NULL, NULL),
(9809, 1, 1, NULL, NULL, NULL, NULL),
(9810, 1, 1, NULL, NULL, NULL, NULL),
(9811, 1, 1, NULL, NULL, NULL, NULL),
(9812, 1, 1, NULL, NULL, NULL, NULL),
(9813, 1, 1, NULL, NULL, NULL, NULL),
(9814, 1, 1, NULL, NULL, NULL, NULL),
(9815, 1, 1, NULL, NULL, NULL, NULL),
(9816, 1, 1, NULL, NULL, NULL, NULL),
(9817, 1, 1, NULL, NULL, NULL, NULL),
(9818, 1, 1, NULL, NULL, NULL, NULL),
(9819, 1, 1, NULL, NULL, NULL, NULL),
(9820, 1, 1, NULL, NULL, NULL, NULL),
(9821, 1, 1, NULL, NULL, NULL, NULL),
(9822, 1, 1, NULL, NULL, NULL, NULL),
(9823, 1, 1, NULL, NULL, NULL, NULL),
(9824, 1, 1, NULL, NULL, NULL, NULL),
(9825, 1, 1, NULL, NULL, NULL, NULL),
(9826, 1, 1, NULL, NULL, NULL, NULL),
(9827, 1, 1, NULL, NULL, NULL, NULL),
(9828, 1, 1, NULL, NULL, NULL, NULL),
(9829, 1, 1, NULL, NULL, NULL, NULL),
(9830, 1, 1, NULL, NULL, NULL, NULL),
(9831, 1, 1, NULL, NULL, NULL, NULL),
(9832, 1, 1, NULL, NULL, NULL, NULL),
(9833, 1, 1, NULL, NULL, NULL, NULL),
(9834, 1, 1, NULL, NULL, NULL, NULL),
(9835, 1, 1, NULL, NULL, NULL, NULL),
(9836, 1, 1, NULL, NULL, NULL, NULL),
(9837, 1, 1, NULL, NULL, NULL, NULL),
(9838, 1, 1, NULL, NULL, NULL, NULL),
(9839, 1, 1, NULL, NULL, NULL, NULL),
(9840, 1, 1, NULL, NULL, NULL, NULL),
(9841, 1, 1, NULL, NULL, NULL, NULL),
(9842, 1, 1, NULL, NULL, NULL, NULL),
(9843, 1, 1, NULL, NULL, NULL, NULL),
(9844, 1, 1, NULL, NULL, NULL, NULL),
(9845, 1, 1, NULL, NULL, NULL, NULL),
(9846, 1, 1, NULL, NULL, NULL, NULL),
(9847, 1, 1, NULL, NULL, NULL, NULL),
(9848, 1, 1, NULL, NULL, NULL, NULL),
(9849, 1, 1, NULL, NULL, NULL, NULL),
(9850, 1, 1, NULL, NULL, NULL, NULL),
(9851, 1, 1, NULL, NULL, NULL, NULL),
(9852, 1, 1, NULL, NULL, NULL, NULL),
(9853, 1, 1, NULL, NULL, NULL, NULL),
(9854, 1, 1, NULL, NULL, NULL, NULL),
(9855, 1, 1, NULL, NULL, NULL, NULL),
(9856, 1, 1, NULL, NULL, NULL, NULL),
(9857, 1, 1, NULL, NULL, NULL, NULL),
(9858, 1, 1, NULL, NULL, NULL, NULL),
(9859, 1, 1, NULL, NULL, NULL, NULL),
(9860, 1, 1, NULL, NULL, NULL, NULL),
(9861, 1, 1, NULL, NULL, NULL, NULL),
(9862, 1, 1, NULL, NULL, NULL, NULL),
(9863, 1, 1, NULL, NULL, NULL, NULL),
(9864, 1, 1, NULL, NULL, NULL, NULL),
(9865, 1, 1, NULL, NULL, NULL, NULL),
(9866, 1, 1, NULL, NULL, NULL, NULL),
(9867, 1, 1, NULL, NULL, NULL, NULL),
(9868, 1, 1, NULL, NULL, NULL, NULL),
(9869, 1, 1, NULL, NULL, NULL, NULL),
(9870, 1, 1, NULL, NULL, NULL, NULL),
(9871, 1, 1, NULL, NULL, NULL, NULL),
(9872, 1, 1, NULL, NULL, NULL, NULL),
(9873, 1, 1, NULL, NULL, NULL, NULL),
(9874, 1, 1, NULL, NULL, NULL, NULL),
(9875, 1, 1, NULL, NULL, NULL, NULL),
(9876, 1, 1, NULL, NULL, NULL, NULL),
(9877, 1, 1, NULL, NULL, NULL, NULL),
(9878, 1, 1, NULL, NULL, NULL, NULL),
(9879, 1, 1, NULL, NULL, NULL, NULL),
(9880, 1, 1, NULL, NULL, NULL, NULL),
(9881, 1, 1, NULL, NULL, NULL, NULL),
(9882, 1, 1, NULL, NULL, NULL, NULL),
(9883, 1, 1, NULL, NULL, NULL, NULL),
(9884, 1, 1, NULL, NULL, NULL, NULL),
(9885, 1, 1, NULL, NULL, NULL, NULL),
(9886, 1, 1, NULL, NULL, NULL, NULL),
(9887, 1, 1, NULL, NULL, NULL, NULL),
(9888, 1, 1, NULL, NULL, NULL, NULL),
(9889, 1, 1, NULL, NULL, NULL, NULL),
(9890, 1, 1, NULL, NULL, NULL, NULL),
(9891, 1, 1, NULL, NULL, NULL, NULL),
(9892, 1, 1, NULL, NULL, NULL, NULL),
(9893, 1, 1, NULL, NULL, NULL, NULL),
(9894, 1, 1, NULL, NULL, NULL, NULL),
(9895, 1, 1, NULL, NULL, NULL, NULL),
(9896, 1, 1, NULL, NULL, NULL, NULL),
(9897, 1, 1, NULL, NULL, NULL, NULL),
(9898, 1, 1, NULL, NULL, NULL, NULL),
(9899, 1, 1, NULL, NULL, NULL, NULL),
(9900, 1, 1, NULL, NULL, NULL, NULL),
(9901, 1, 1, NULL, NULL, NULL, NULL),
(9902, 1, 1, NULL, NULL, NULL, NULL),
(9903, 1, 1, NULL, NULL, NULL, NULL),
(9904, 1, 1, NULL, NULL, NULL, NULL),
(9905, 1, 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `setting_options`
--

CREATE TABLE `setting_options` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `option_name` varchar(255) NOT NULL,
  `option_value` longtext DEFAULT NULL,
  `autoload` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `setting_options`
--

INSERT INTO `setting_options` (`id`, `option_name`, `option_value`, `autoload`, `created_at`, `updated_at`) VALUES
(1, 'com_site_logo', '1294', '1', '2025-03-10 02:09:43', '2025-09-27 23:30:47'),
(2, 'com_site_favicon', '1297', '1', '2025-03-10 02:09:43', '2025-09-28 02:57:21'),
(3, 'com_site_title', 'Quick Ecommerce', '1', '2025-03-10 02:09:43', '2025-09-15 06:24:50'),
(4, 'com_site_subtitle', 'Shop with confidence on Quick Ecommerce where quality, variety and trusted sellers', '1', '2025-03-10 02:09:43', '2025-09-15 06:24:50'),
(5, 'com_user_email_verification', NULL, '1', '2025-03-10 02:09:43', '2025-08-07 01:44:28'),
(6, 'com_user_login_otp', NULL, '1', '2025-03-10 02:09:43', '2025-08-03 03:57:32'),
(7, 'com_maintenance_mode', NULL, '1', '2025-03-10 02:09:43', '2025-09-16 04:34:21'),
(8, 'com_site_full_address', '789 Ocean Ave, LA', '1', '2025-03-10 02:09:44', '2025-09-15 22:17:40'),
(9, 'com_site_contact_number', '+1 (800) 555-0199', '1', '2025-03-10 02:09:44', '2025-07-09 22:16:42'),
(10, 'com_site_website_url', NULL, '1', '2025-03-10 02:09:44', '2025-09-27 23:34:19'),
(11, 'com_site_email', 'info@quickecommerce.app', '1', '2025-03-10 02:09:44', '2025-09-15 06:24:50'),
(12, 'com_site_footer_copyright', '© 2025 Quick Ecommerce. All Rights Reserved.', '1', '2025-03-10 02:09:44', '2025-09-15 06:24:50'),
(13, 'com_quick_access_enable_disable', 'on', '1', '2025-03-10 03:11:26', '2025-03-25 02:40:00'),
(14, 'com_our_info_enable_disable', 'on', '1', '2025-03-10 03:11:26', '2025-03-25 02:40:00'),
(15, 'com_quick_access_title', NULL, '1', '2025-03-10 03:11:26', '2025-05-19 04:08:25'),
(16, 'com_our_info_title', NULL, '1', '2025-03-10 03:11:26', '2025-05-19 04:08:25'),
(17, 'com_social_links_enable_disable', 'on', '1', '2025-03-10 03:11:26', '2025-03-25 02:40:00'),
(18, 'com_social_links_title', 'on', '1', '2025-03-10 03:11:26', '2025-03-25 02:40:00'),
(19, 'com_social_links_facebook_url', 'https://facebook.com/example', '1', '2025-03-10 03:11:26', '2025-05-18 11:59:40'),
(20, 'com_social_links_twitter_url', 'https://twitter.com/example', '1', '2025-03-10 03:11:26', '2025-05-18 11:59:40'),
(21, 'com_social_links_instagram_url', 'https://instagram.com/example', '1', '2025-03-10 03:11:26', '2025-05-18 11:59:40'),
(22, 'com_social_links_linkedin_url', 'https://linkedin.com/example', '1', '2025-03-10 03:11:26', '2025-05-18 11:59:40'),
(23, 'com_social_links_youtube_url', NULL, '1', '2025-03-10 03:11:26', '2025-05-19 04:08:25'),
(24, 'com_social_links_pinterest_url', NULL, '1', '2025-03-10 03:11:26', '2025-05-19 04:08:25'),
(25, 'com_social_links_snapchat_url', NULL, '1', '2025-03-10 03:11:26', '2025-05-19 04:08:25'),
(26, 'com_download_app_link_one', NULL, '1', '2025-03-10 03:11:26', '2025-05-18 11:59:40'),
(27, 'com_download_app_link_two', NULL, '1', '2025-03-10 03:11:27', '2025-05-18 11:59:40'),
(28, 'com_payment_methods_enable_disable', 'on', '1', '2025-03-10 03:11:27', '2025-04-15 11:48:47'),
(29, 'com_payment_methods_image', '734,737,732,733', '1', '2025-03-10 03:11:27', '2025-05-19 04:08:25'),
(30, 'com_site_space_between_amount_and_symbol', 'NO', '1', '2025-03-12 01:00:20', '2025-09-09 22:37:58'),
(31, 'com_site_enable_disable_decimal_point', 'YES', '1', '2025-03-12 01:00:21', '2025-09-24 23:55:00'),
(32, 'com_site_comma_form_adjustment_amount', 'YES', '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(33, 'com_site_default_currency_to_usd_exchange_rate', '125', '1', '2025-03-12 01:00:21', '2025-08-24 04:49:00'),
(34, 'com_site_default_currency_to_myr_exchange_rate', '111', '1', '2025-03-12 01:00:21', '2025-08-24 04:49:00'),
(35, 'com_site_default_currency_to_brl_exchange_rate', '222', '1', '2025-03-12 01:00:21', '2025-08-24 04:49:00'),
(36, 'com_site_default_currency_to_zar_exchange_rate', '344', '1', '2025-03-12 01:00:21', '2025-08-24 04:49:00'),
(37, 'com_site_default_currency_to_ngn_exchange_rate', '212', '1', '2025-03-12 01:00:21', '2025-08-24 04:49:00'),
(38, 'com_site_default_currency_to_inr_exchange_rate', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(39, 'com_site_default_currency_to_idr_exchange_rate', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(40, 'com_site_euro_to_ngn_exchange_rate', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(41, 'com_site_usd_to_ngn_exchange_rate', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(42, 'com_site_default_payment_gateway', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(43, 'com_site_manual_payment_description', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(44, 'com_site_manual_payment_name', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(45, 'com_site_payment_gateway', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(46, 'com_site_currency_symbol_position', 'left', '1', '2025-03-12 01:00:21', '2025-04-20 03:11:07'),
(47, 'com_site_global_currency', 'USD', '1', '2025-03-12 01:00:21', '2025-04-19 11:48:16'),
(48, 'com_register_page_title', 'Sign Up Now!', '1', '2025-03-17 22:20:27', '2025-03-18 22:18:26'),
(49, 'com_register_page_subtitle', 'Join Quick Ecommerce for an Amazing Shopping Experience', '1', '2025-03-17 22:20:27', '2025-03-18 22:18:26'),
(50, 'com_register_page_description', 'Sign up now to explore a wide range of products from multiple stores, enjoy seamless shopping, secure transactions, and exclusive discounts.', '1', '2025-03-17 22:20:27', '2025-03-18 22:18:26'),
(51, 'com_register_page_image', '1152', '1', '2025-03-17 22:20:27', '2025-08-05 23:54:58'),
(52, 'com_register_page_terms_page', NULL, '1', '2025-03-17 22:20:27', '2025-03-18 22:18:26'),
(53, 'com_register_page_terms_title', 'Terms & Conditions', '1', '2025-03-17 22:20:27', '2025-03-18 22:18:27'),
(54, 'com_register_page_social_enable_disable', 'on', '1', '2025-03-17 22:20:27', '2025-03-18 22:18:27'),
(55, 'com_login_page_title', 'Sign In', '1', '2025-03-18 00:12:53', '2025-03-18 22:22:25'),
(56, 'com_login_page_subtitle', 'Continue Shopping', '1', '2025-03-18 00:12:53', '2025-03-19 02:21:22'),
(57, 'com_login_page_image', '1169', '1', '2025-03-18 00:12:53', '2025-08-06 23:54:02'),
(58, 'com_login_page_social_enable_disable', 'on', '1', '2025-03-18 00:12:53', '2025-05-22 10:08:03'),
(59, 'com_product_details_page_delivery_title', 'Free Delivery', '1', '2025-03-18 00:42:42', '2025-03-18 22:38:07'),
(60, 'com_product_details_page_delivery_subtitle', 'Will ship to Bangladesh. Read item description.', '1', '2025-03-18 00:42:42', '2025-03-18 22:36:12'),
(61, 'com_product_details_page_delivery_url', NULL, '1', '2025-03-18 00:42:42', '2025-03-18 23:12:23'),
(62, 'com_product_details_page_delivery_enable_disable', 'on', '1', '2025-03-18 00:42:42', '2025-03-18 00:42:42'),
(63, 'com_product_details_page_return_refund_title', 'Easy Return & Refund', '1', '2025-03-18 00:42:42', '2025-03-18 22:36:12'),
(64, 'com_product_details_page_return_refund_subtitle', '30 days returns. Buyer pays for return shipping.', '1', '2025-03-18 00:42:42', '2025-03-18 22:36:13'),
(65, 'com_product_details_page_return_refund_url', NULL, '1', '2025-03-18 00:42:42', '2025-09-01 04:14:37'),
(66, 'com_product_details_page_return_refund_enable_disable', 'on', '1', '2025-03-18 00:42:42', '2025-03-18 00:42:42'),
(67, 'com_product_details_page_related_title', 'Related Product', '1', '2025-03-18 00:42:42', '2025-04-13 04:46:05'),
(68, 'com_blog_details_popular_title', 'Popular Posts', '1', '2025-03-18 20:42:56', '2025-07-07 06:40:44'),
(69, 'com_blog_details_related_title', 'Related Posts', '1', '2025-03-18 20:42:56', '2025-07-07 06:40:44'),
(70, 'com_seller_login_page_title', 'Sign in', '1', '2025-03-18 22:31:53', '2025-07-28 21:51:22'),
(71, 'com_seller_login_page_subtitle', 'Multivendor Ecosystem.', '1', '2025-03-18 22:31:53', '2025-07-28 21:51:22'),
(72, 'com_seller_login_page_image', '570', '1', '2025-03-18 22:31:53', '2025-04-06 02:27:49'),
(73, 'com_seller_login_page_social_enable_disable', NULL, '1', '2025-03-18 22:31:53', '2025-04-05 23:13:40'),
(74, 'minimum_withdrawal_limit', '10', '1', '2025-03-20 02:32:30', '2025-05-15 03:39:44'),
(75, 'maximum_withdrawal_limit', '500', '1', '2025-03-20 02:32:30', '2025-05-15 03:39:44'),
(76, 'com_quick_access', '[{\"com_quick_access_title\":\"Home\",\"com_quick_access_url\":\"https:\\/\\/example.com 666\"},{\"com_quick_access_title\":\"About Us\",\"com_quick_access_url\":\"https:\\/\\/example.com\\/contact777\"},{\"com_quick_access_title\":\"Contact Us\",\"com_quick_access_url\":\"https:\\/\\/example.com\\/contact777\"},{\"com_quick_access_title\":\"Blog\",\"com_quick_access_url\":null},{\"com_quick_access_title\":\"Coupon\",\"com_quick_access_url\":null},{\"com_quick_access_title\":\"Become A Seller\",\"com_quick_access_url\":\"http:\\/\\/192.168.88.225:3000\\/become-a-seller\"}]', '1', '2025-03-25 02:40:00', '2025-05-19 07:03:08'),
(77, 'com_our_info', '[{\"title\":\"Privacy Policy\",\"url\":\"http:\\/\\/192.168.88.225:3010\\/privacy-policy\"},{\"title\":\"Terms and conditions\",\"url\":\"http:\\/\\/192.168.88.225:3010\\/terms-conditions\"},{\"title\":\"FAQ\",\"url\":\"http:\\/\\/192.168.88.225:3010\\/faq\"}]', '1', '2025-03-25 02:45:25', '2025-05-19 05:09:50'),
(78, 'com_google_login_enabled', 'on', '1', '2025-04-06 03:15:05', '2025-09-29 03:54:23'),
(79, 'com_google_app_id', '483247466424-makrg9bs86r4vup300m3p3r63tpaa9v0.apps.googleusercontent.com', '1', '2025-04-06 03:15:05', '2025-04-06 03:15:05'),
(80, 'com_google_client_secret', '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', '1', '2025-04-06 03:15:05', '2025-04-06 03:15:05'),
(81, 'com_google_client_callback_url', NULL, '1', '2025-04-06 03:15:05', '2025-04-06 03:37:08'),
(82, 'com_facebook_login_enabled', 'on', '1', '2025-04-06 03:15:05', '2025-09-29 03:54:23'),
(83, 'com_facebook_app_id', NULL, '1', '2025-04-06 03:15:05', '2025-04-06 03:35:17'),
(84, 'com_facebook_client_secret', NULL, '1', '2025-04-06 03:15:05', '2025-04-06 03:35:17'),
(85, 'com_facebook_client_callback_url', NULL, '1', '2025-04-06 03:15:05', '2025-04-06 03:37:08'),
(86, 'com_site_white_logo', '1294', '1', '2025-04-15 06:26:53', '2025-09-27 23:30:47'),
(87, 'com_site_global_email', 'quicke_commerce@gmail.com', '1', '2025-04-16 04:54:09', '2025-09-23 02:30:23'),
(88, 'com_site_smtp_mail_mailer', 'smtp', '1', '2025-04-16 04:54:09', '2025-04-16 04:54:09'),
(89, 'com_site_smtp_mail_host', 'sandbox.smtp.mailtrap.io', '1', '2025-04-16 04:54:09', '2025-04-16 04:54:09'),
(90, 'com_site_smtp_mail_post', '587', '1', '2025-04-16 04:54:09', '2025-04-16 05:05:27'),
(91, 'com_site_smtp_mail_username', '77df523ed856b8', '1', '2025-04-16 04:54:09', '2025-06-02 09:13:45'),
(92, 'com_site_smtp_mail_password', 'de1975454a18e2', '1', '2025-04-16 04:54:09', '2025-06-02 09:13:45'),
(93, 'com_site_smtp_mail_encryption', 'tls', '1', '2025-04-16 04:54:09', '2025-04-16 05:02:55'),
(94, 'max_deposit_per_transaction', '50000', '1', '2025-04-29 09:30:49', '2025-05-06 05:04:08'),
(95, 'com_maintenance_title', 'We’ll Be Back Soon!', '1', '2025-04-30 09:08:32', '2025-05-25 08:12:26'),
(96, 'com_maintenance_description', 'Our website is currently undergoing scheduled maintenance.\r\nWe’re working hard to bring everything back online as quickly as possible.\r\nThank you for your patience and understanding.', '1', '2025-04-30 09:08:32', '2025-05-25 08:12:26'),
(97, 'com_maintenance_start_date', '2025-04-19T18:00:00.000Z', '1', '2025-04-30 09:08:32', '2025-06-18 03:12:41'),
(98, 'com_maintenance_end_date', '2025-04-19T18:00:00.000Z', '1', '2025-04-30 09:08:32', '2025-06-18 03:12:41'),
(99, 'com_maintenance_image', '832', '1', '2025-04-30 09:08:32', '2025-05-25 07:15:34'),
(100, 'com_meta_title', 'Quick Ecommerce', '1', '2025-04-30 09:44:21', '2025-09-23 00:40:59'),
(101, 'com_meta_description', 'Quick Ecommerce', '1', '2025-04-30 09:44:21', '2025-09-23 00:40:59'),
(102, 'com_meta_tags', NULL, '1', '2025-04-30 09:44:21', '2025-09-23 00:40:59'),
(103, 'com_canonical_url', NULL, '1', '2025-04-30 09:44:21', '2025-05-22 09:49:27'),
(104, 'com_og_title', 'Quick Ecommerce', '1', '2025-04-30 09:44:21', '2025-09-23 00:40:59'),
(105, 'com_og_description', 'Quick E-commerce', '1', '2025-04-30 09:44:21', '2025-09-23 00:41:00'),
(106, 'com_og_image', NULL, '1', '2025-04-30 09:44:21', '2025-09-23 00:41:00'),
(107, 'com_google_recaptcha_v3_site_key', '1x00000000000000000000AA', '1', '2025-05-12 06:06:26', '2025-05-29 03:40:55'),
(108, 'com_google_recaptcha_v3_secret_key', '6LceTzYrAAAAACtNGBaKKcgEloInr_CDci7jwzm6', '1', '2025-05-12 06:06:26', '2025-05-12 06:06:26'),
(109, 'com_google_recaptcha_enable_disable', NULL, '1', '2025-05-12 06:06:26', '2025-09-23 05:20:09'),
(110, 'com_help_center_enable_disable', NULL, '1', '2025-05-15 10:35:15', '2025-05-19 04:08:25'),
(111, 'com_help_center_title', NULL, '1', '2025-05-19 06:20:41', '2025-05-19 06:20:41'),
(112, 'com_help_center', '[{\"title\":\"Payments\",\"url\":\"fdsf\"},{\"title\":\"Shipping\",\"url\":\"ddsf\"},{\"title\":\"Return Policy\",\"url\":null}]', '1', '2025-05-19 06:20:41', '2025-05-19 07:01:42'),
(113, 'com_google_map_enable_disable', 'on', '1', '2025-05-22 09:52:16', '2025-05-25 06:05:08'),
(114, 'com_google_map_api_key', NULL, '1', '2025-05-22 09:52:16', '2025-07-26 21:30:19'),
(115, 'com_home_one_category_button_title', 'All Categories', '1', '2025-06-15 06:30:05', '2025-09-22 22:27:01'),
(116, 'com_home_one_store_button_title', 'Explore Store Types', '1', '2025-06-15 06:30:05', '2025-06-15 11:06:58'),
(117, 'com_home_one_category_section_title', 'Shop by Categories', '1', '2025-06-15 06:30:05', '2025-06-15 07:00:04'),
(118, 'com_home_one_flash_sale_section_title', 'Flash Sale', '1', '2025-06-15 06:30:05', '2025-06-15 07:00:04'),
(119, 'com_home_one_featured_section_title', 'Featured', '1', '2025-06-15 06:30:05', '2025-06-15 07:01:58'),
(120, 'com_home_one_top_selling_section_title', 'Top Selling', '1', '2025-06-15 06:30:05', '2025-06-15 07:00:04'),
(121, 'com_home_one_latest_product_section_title', 'Latest Essentials', '1', '2025-06-15 06:30:05', '2025-06-15 07:00:04'),
(122, 'com_home_one_popular_product_section_title', 'Popular Product', '1', '2025-06-15 06:30:05', '2025-06-15 07:00:04'),
(123, 'com_home_one_top_store_section_title', 'Top Stores', '1', '2025-06-15 06:30:05', '2025-07-29 04:50:57'),
(124, 'otp_login_enabled_disable', 'on', '1', '2025-06-23 04:47:50', '2025-06-24 09:21:54'),
(125, 'com_site_time_zone', 'UTC', '1', '2025-07-07 10:31:10', '2025-07-23 11:00:50'),
(126, 'gdpr_data', '{\"gdpr_basic_section\":{\"com_gdpr_title\":\"GDPR & Cookie Settings\",\"com_gdpr_message\":\"We use cookies to personalize your experience and to analyze our traffic. You can choose to accept or decline.\",\"com_gdpr_more_info_label\":\"More Information\",\"com_gdpr_more_info_link\":null,\"com_gdpr_accept_label\":\"Accept\",\"com_gdpr_decline_label\":\"Decline\",\"com_gdpr_manage_label\":\"Manage\",\"com_gdpr_manage_title\":\"Manage Cookie Preferences\",\"com_gdpr_expire_date\":\"2025-05-28\",\"com_gdpr_show_delay\":\"500\",\"com_gdpr_enable_disable\":\"on\",\"com_gdpr_can_reject_all\":\"on\"},\"gdpr_more_info_section\":{\"section_title\":\"Aut dolore laborum Dolorem fugit voluptate\",\"section_details\":\"Aut dolore laborum Dolorem fugit voluptateAut dolore laborum Dolorem fugit voluptateAut dolore laborum Dolorem fugit voluptateAut dolore laborum Dolorem fugit voluptateAut dolore laborum Dolorem fugit voluptateAut dolore laborum Dolorem fugit voluptate\",\"steps\":[{\"title\":null,\"descriptions\":null,\"req_status\":null},{\"title\":null,\"descriptions\":null,\"req_status\":null},{\"title\":null,\"descriptions\":null,\"req_status\":null}]}}', 'json', '2025-07-17 03:55:43', '2025-09-23 00:42:40'),
(127, 'footer_settings', '{\"com_social_links_facebook_url\":\"https:\\/\\/facebook.com\",\"com_social_links_twitter_url\":\"https:\\/\\/twitter.com\",\"com_social_links_instagram_url\":\"https:\\/\\/instagram.com\",\"com_social_links_linkedin_url\":\"https:\\/\\/linkedin.com\",\"com_download_app_link_one\":\"#\",\"com_download_app_link_two\":\"#\",\"com_payment_methods_enable_disable\":\"on\",\"com_quick_access_enable_disable\":\"on\",\"com_our_info_enable_disable\":\"on\",\"com_social_links_enable_disable\":\"on\",\"com_social_links_title\":\"on\",\"com_payment_methods_image\":\"737,734,733,732\",\"com_quick_access\":[{\"com_quick_access_title\":\"Home\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\"},{\"com_quick_access_title\":\"All Products\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/products\"},{\"com_quick_access_title\":\"Categories\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/product-categories\"},{\"com_quick_access_title\":\"Stores\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/stores\"},{\"com_quick_access_title\":\"Become a Seller\",\"com_quick_access_url\":\"https:\\/\\/admin.quickecommerce.app\\/become-a-seller\"}],\"com_our_info\":[{\"title\":\"About Us\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/about\"},{\"title\":\"Terms & Conditions\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/terms-conditions\"},{\"title\":\"Privacy Policy\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/privacy-policy\"},{\"title\":\"Return & Refund Policy\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/refund-policies\"},{\"title\":\"Shipping Policy\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/shipping-policy\"}]}', NULL, '2025-07-23 02:21:30', '2025-09-23 03:47:24'),
(128, 'com_pos_settings_print_invoice', 'thermal', NULL, '2025-08-23 22:57:52', '2025-08-24 00:16:46'),
(139, 'theme_one', '{\"name\":\"Premium Theme\",\"slug\":\"theme_one\",\"description\":\"Complete premium e-commerce theme\",\"version\":\"2.0\",\"theme_style\":[{\"colors\":[{\"primary\":\"#1A73E8\",\"secondary\":\"#0e5abc\"}]}],\"theme_header\":[{\"header_number\":\"01\"}],\"theme_footer\":[{\"background_color\":\"#0d166d\",\"text_color\":\"#ffffff\",\"layout_columns\":3}],\"theme_pages\":[{\"theme_home_page\":[{\"slider\":[{\"enabled_disabled\":\"on\"}],\"category\":[{\"title\":\"Categories\",\"enabled_disabled\":\"on\"}],\"flash_sale\":[{\"title\":\"Flash Sale\",\"enabled_disabled\":\"on\"}],\"product_featured\":[{\"title\":\"Featured Products\",\"enabled_disabled\":\"on\"}],\"banner_section\":[{\"enabled_disabled\":\"on\"}],\"product_top_selling\":[{\"title\":\"Top Selling\",\"enabled_disabled\":\"on\"}],\"product_latest\":[{\"title\":\"Latest Products\",\"enabled_disabled\":\"on\"}],\"popular_product_section\":[{\"title\":\"Popular Product\",\"enabled_disabled\":\"on\"}],\"top_stores_section\":[{\"title\":\"Top Stores\",\"enabled_disabled\":\"on\"}],\"newsletters_section\":[{\"title\":\"Subscribe Newsletters\",\"subtitle\":\"We provide top-quality products from trusted vendors items near you on time, all in one place.\",\"enabled_disabled\":\"on\"}]}],\"theme_login_page\":[{\"customer\":[{\"title\":\"Sign In\",\"subtitle\":\"Continue Shopping\",\"enabled_disabled\":\"on\",\"image_id\":1303,\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/login-register-page1759042140.png\",\"image_id_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/login-register-page1759042140.png\"}],\"admin\":[{\"title\":\"Sign in\",\"subtitle\":\"Multivendor Ecosystem.\",\"image_id\":570,\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/login-admin-img1743928028.png\",\"image_id_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/login-admin-img1743928028.png\"}]}],\"theme_register_page\":[{\"title\":\"Sign Up Now!\",\"subtitle\":\"Join for an Amazing Shopping Experience\",\"description\":\"Sign up now to explore a wide range of products from multiple stores, enjoy seamless shopping, secure transactions, and exclusive discounts.\",\"terms_page_title\":\"Terms & Conditions\",\"terms_page_url\":null,\"social_login_enable_disable\":\"on\",\"image_id\":1303,\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/login-register-page1759042140.png\",\"image_id_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/login-register-page1759042140.png\"}],\"theme_blog_page\":[{\"popular_title\":\"Popular Posts\",\"related_title\":\"Related Posts\"}],\"theme_product_details_page\":[{\"delivery_title\":\"Free Delivery\",\"delivery_subtitle\":\"Will ship to Bangladesh. Read item description.\",\"delivery_url\":null,\"refund_title\":\"Easy Return & Refund\",\"refund_subtitle\":\"30 days returns.\\u00a0Buyer pays for return shipping.\",\"refund_url\":null,\"related_title\":\"Related Product\",\"delivery_enabled_disabled\":\"on\",\"refund_enabled_disabled\":\"on\"}]}]}', NULL, '2025-08-31 03:59:50', '2025-10-05 05:40:42'),
(140, 'theme_two', '{\"name\":\"Fashion Theme\",\"slug\":\"theme_two\",\"description\":\"Complete Fashion e-commerce theme\",\"version\":\"2.0\",\"theme_style\":[{\"colors\":[{\"primary\":\"#000000\",\"secondary\":\"#FF6631\"}]}],\"theme_header\":[{\"header_number\":\"02\"}],\"theme_footer\":[{\"background_color\":\"#242825\",\"text_color\":\"#ffffff\",\"layout_columns\":4}],\"theme_pages\":[{\"theme_home_page\":[{\"slider\":[{\"enabled_disabled\":\"on\"}],\"category\":[{\"title\":\"Categories\",\"enabled_disabled\":\"on\"}],\"flash_sale\":[{\"title\":\"Flash Sale\",\"enabled_disabled\":\"on\"}],\"product_featured\":[{\"title\":\"Featured Products\",\"enabled_disabled\":\"on\"}],\"banner_section\":[{\"enabled_disabled\":\"on\"}],\"product_top_selling\":[{\"title\":\"Top Selling\",\"enabled_disabled\":\"on\"}],\"product_latest\":[{\"title\":\"Latest Products\",\"enabled_disabled\":\"on\"}],\"popular_product_section\":[{\"title\":\"Popular Product\",\"enabled_disabled\":\"on\"}],\"top_stores_section\":[{\"title\":\"Top Stores\",\"enabled_disabled\":\"on\"}],\"newsletters_section\":[{\"title\":\"Subscribe Newsletters\",\"subtitle\":\"We provide top-quality products from trusted vendors items near you on time, all in one place.\",\"enabled_disabled\":\"on\"}]}],\"theme_login_page\":[{\"customer\":[{\"title\":\"Signin Now!\",\"subtitle\":null,\"enabled_disabled\":\"on\",\"image_id\":1303,\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/login-register-page1759042140.png\",\"image_id_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/login-register-page1759042140.png\"}],\"admin\":[{\"title\":\"Login\",\"subtitle\":null,\"image_id\":\"1177\",\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/our-vision1752752223.png\",\"image_id_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/stripe1754548961.png\"}]}],\"theme_register_page\":[{\"title\":\"Sign Up Now!\",\"subtitle\":\"Join for an Amazing Shopping Experience\",\"description\":\"Sign up now to explore a wide range of products from multiple stores, enjoy seamless shopping, secure transactions, and exclusive discounts.\",\"terms_page_title\":\"Terms & Conditions\",\"terms_page_url\":null,\"social_login_enable_disable\":\"on\",\"image_id\":1290,\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/login-register-page1759042140.png\",\"image_id_url\":null}],\"theme_blog_page\":[{\"popular_title\":\"Popular Posts\",\"related_title\":\"Related Posts\"}],\"theme_product_details_page\":[{\"delivery_title\":\"Delivery Info\",\"delivery_subtitle\":null,\"delivery_url\":null,\"refund_title\":\"Refund Info\",\"refund_subtitle\":null,\"refund_url\":null,\"related_title\":null,\"delivery_enabled_disabled\":\"on\",\"refund_enabled_disabled\":\"on\"}]}]}', NULL, '2025-08-31 05:56:17', '2025-10-05 05:40:47'),
(141, 'com_openai_api_key', NULL, NULL, '2025-09-18 02:33:36', '2025-09-22 03:20:32'),
(142, 'com_openai_model', 'gpt-4-32k', NULL, '2025-09-18 02:33:37', '2025-09-29 03:55:38'),
(143, 'com_openai_timeout', '500', NULL, '2025-09-18 02:33:37', '2025-09-22 03:20:32'),
(144, 'com_openai_enable_disable', 'on', NULL, '2025-09-18 02:33:37', '2025-09-18 02:53:41');

-- --------------------------------------------------------

--
-- Table structure for table `sitemaps`
--

CREATE TABLE `sitemaps` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `filename` varchar(255) NOT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `size` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sliders`
--

CREATE TABLE `sliders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `platform` enum('web','mobile') NOT NULL DEFAULT 'web',
  `title` varchar(255) NOT NULL,
  `title_color` varchar(255) DEFAULT NULL,
  `sub_title` varchar(255) DEFAULT NULL,
  `sub_title_color` varchar(255) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `description_color` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `bg_image` varchar(255) DEFAULT NULL,
  `bg_color` varchar(255) DEFAULT NULL,
  `button_text` varchar(255) DEFAULT NULL,
  `button_text_color` varchar(255) DEFAULT NULL,
  `button_bg_color` varchar(255) DEFAULT NULL,
  `button_hover_color` varchar(255) DEFAULT NULL,
  `button_url` varchar(255) DEFAULT NULL,
  `redirect_url` varchar(255) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0 - Inactive, 1 - Active',
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sliders`
--

INSERT INTO `sliders` (`id`, `platform`, `title`, `title_color`, `sub_title`, `sub_title_color`, `description`, `description_color`, `image`, `bg_image`, `bg_color`, `button_text`, `button_text_color`, `button_bg_color`, `button_hover_color`, `button_url`, `redirect_url`, `order`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'web', 'Fresh & Organic Groceries', '#3bb77e', 'Your Daily Essentials Delivered', '#5d5d5d', 'Shop farm-fresh produce and pantry staples with ease.', '#5d5d5d', NULL, '1307', '#FFF8DC', 'Shop Now', '#ffff', '#3bb77e', '#038f4e', NULL, NULL, 1, 1, '8', '8', '2025-03-10 21:46:23', '2025-09-28 01:16:27'),
(2, 'web', 'Baked Fresh Daily', '#8d5c42', 'Indulge in Warm & Tasty Treats', '#4d483e', 'Savor freshly baked bread, cakes, and pastries.', '#8d5c42', NULL, '1307', '#FAEBD7', 'Get Now', '#ffff', '#8d5c42', '#833105', NULL, NULL, 2, 1, '8', '8', '2025-03-10 21:46:48', '2025-09-28 01:16:29'),
(12, 'mobile', 'Fresh & Organic Groceries', '#3bb77e', 'Your Daily Essentials Delivered', '#5d5d5d', 'Shop farm-fresh products', '#5d5d5d', NULL, '1307', '#FFF8DC', 'Shop Now', '#ffff', '#3bb77e', '#038f4e', NULL, NULL, 101, 1, '8', '8', '2025-05-27 10:37:04', '2025-09-28 01:29:36'),
(14, 'mobile', 'Baked Fresh', '#8d5c42', 'Warm & Tasty Treats', '#4d483e', 'Savor freshly baked bread, cakes, and pastries.', '#8d5c42', NULL, '1307', '#FAEBD7', 'Get Now', '#ffff', '#8d5c42', '#833105', NULL, NULL, 102, 1, '8', '8', '2025-06-28 11:35:37', '2025-09-28 01:15:01');

-- --------------------------------------------------------

--
-- Table structure for table `sms_providers`
--

CREATE TABLE `sms_providers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `expire_time` int(11) NOT NULL DEFAULT 1,
  `credentials` longtext DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0: Inactive, 1: Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sms_providers`
--

INSERT INTO `sms_providers` (`id`, `name`, `slug`, `logo`, `expire_time`, `credentials`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Nexmo', 'nexmo', NULL, 5, '{\"nexmo_api_key\":\"d008d407\",\"nexmo_api_secret\":\"HvMKGiT0CjvZqJgT\"}', 1, NULL, '2025-07-07 06:43:27'),
(2, 'Twilio', 'twilio', NULL, 5, '{\"twilio_sid\":\"ACd9b1fe3992f74b20008f7d6a5962f883\",\"twilio_auth_key\":\"fd536f87af14b0d769220b1859f9b4ff\",\"twilio_number\":\"+16206661971\"}', 1, NULL, '2025-06-24 11:58:28');

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `store_seller_id` bigint(20) UNSIGNED DEFAULT NULL,
  `store_type` enum('grocery','bakery','medicine','makeup','bags','clothing','furniture','books','gadgets','animals-pet','fish') DEFAULT NULL,
  `tax` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_number` varchar(255) DEFAULT NULL,
  `subscription_type` varchar(50) DEFAULT NULL,
  `admin_commission_type` varchar(255) DEFAULT NULL,
  `admin_commission_amount` decimal(10,2) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `delivery_charge` decimal(10,2) DEFAULT NULL,
  `delivery_time` varchar(50) DEFAULT NULL,
  `delivery_self_system` tinyint(1) DEFAULT 0,
  `delivery_take_away` tinyint(1) DEFAULT 0,
  `order_minimum` int(11) DEFAULT 0,
  `veg_status` int(11) DEFAULT 0 COMMENT '0 = Non-Vegetarian, 1 = Vegetarian',
  `off_day` varchar(50) DEFAULT NULL,
  `enable_saling` int(11) DEFAULT 0 COMMENT '0 = Sales disabled, 1 = Sales enabled',
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_image` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT 0 COMMENT '0 = Pending, 1 = Active, 2 = Inactive',
  `online_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `area_id`, `store_seller_id`, `store_type`, `tax`, `tax_number`, `subscription_type`, `admin_commission_type`, `admin_commission_amount`, `name`, `slug`, `phone`, `email`, `logo`, `banner`, `address`, `latitude`, `longitude`, `is_featured`, `opening_time`, `closing_time`, `delivery_charge`, `delivery_time`, `delivery_self_system`, `delivery_take_away`, `order_minimum`, `veg_status`, `off_day`, `enable_saling`, `meta_title`, `meta_description`, `meta_image`, `status`, `online_at`, `created_by`, `updated_by`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'grocery', 5.00, 'VAT123457', 'subscription', 'percentage', 10.00, 'Fresh Grocer', 'fresh-grocer', '1234567891', 'freshgrocer@example.com', '1297', NULL, '456 Green Lane, City', 23.7948895, 90.4051046, 1, '07:00:00', '21:00:00', 3.00, '30-45 minutes', 1, 1, 30, 1, 'Wednesday', 1, 'Fresh Grocer - Your Neighborhood Grocery Store', 'Find fresh and organic grocery items at Fresh Grocer.', 'fresh_grocer_meta_image.png', 1, '2025-09-30 00:03:38', 1, 8, NULL, '2025-03-10 01:43:00', '2025-09-30 00:03:38'),
(2, 1, 1, 'bakery', 5.00, 'VAT123458', 'commission', 'percentage', 10.00, 'Sweet Treats Bakery', 'sweet-treats-bakery', '1234567892', 'sweettreats@example.com', '1297', '592', '789 Sugar Road, City', 23.7948895, 90.4051046, 1, '06:00:00', '20:00:00', 4.00, '20-40 minutes', 1, 1, 20, 0, 'Monday', 1, 'Sweet Treats Bakery - Fresh Baked Goods', 'Delicious cakes, pastries, and more at Sweet Treats Bakery.', 'sweet_treats_meta_image.png', 1, '2025-07-15 22:21:05', 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(3, 1, 1, 'medicine', 5.00, 'VAT123459', 'commission', 'percentage', 10.00, 'Health First Pharmacy', 'health-first-pharmacy', '1234567893', 'healthfirst@example.com', '1297', '596', '101 Wellness Drive, City', 23.7948895, 90.4051046, 1, '09:00:00', '22:00:00', 5.00, '30-60 minutes', 1, 1, 50, 0, 'Sunday', 1, 'Health First Pharmacy - Trusted Medicine Store', 'Get all your prescription and health needs at Health First Pharmacy.', 'health_first_meta_image.png', 1, NULL, 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(4, 1, 1, 'makeup', 5.00, 'VAT123460', 'commission', 'percentage', 10.00, 'Glamour Beauty', 'glamour-beauty', '1234567894', 'glamourbeauty@example.com', '1297', '601', '202 Beauty Lane, City', 23.7953490, 90.4029920, 1, '10:00:00', '20:00:00', 4.00, '30-45 minutes', 1, 1, 20, 0, 'Tuesday', 1, 'Glamour Beauty - Premium Makeup Store', 'Shop the best in makeup and beauty products at Glamour Beauty.', 'glamour_beauty_meta_image.png', 1, NULL, 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(5, 1, 1, 'bags', 5.00, 'VAT123461', 'commission', 'percentage', 10.00, 'Bag World', 'bag-world', '1234567895', 'bagworld@example.com', '1297', '19', '303 Fashion Street, City', 23.7953490, 90.4029920, 1, '10:00:00', '19:00:00', 4.00, '20-30 minutes', 1, 1, 30, 0, 'Monday', 1, 'Bag World - Your Destination for Stylish Bags', 'Discover a wide range of fashionable bags at Bag World.', 'bag_world_meta_image.png', 1, '2025-09-22 22:19:16', 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(6, 1, 1, 'clothing', 5.00, 'VAT123462', 'commission', 'percentage', 10.00, 'Trendy Apparel', 'trendy-apparel', '1234567896', 'trendyapparel@example.com', '1297', NULL, '404 Fashion Avenue, City', 23.7950303, 90.4045412, 1, '09:00:00', '21:00:00', 5.00, '30-50 minutes', 1, 1, 40, 0, 'Thursday', 1, 'Trendy Apparel - Fashion for Everyone', 'Shop trendy clothing for men, women, and kids at Trendy Apparel.', 'trendy_apparel_meta_image.png', 1, NULL, 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(7, 3, 1, 'furniture', 5.00, 'VAT123463', 'commission', 'percentage', 10.00, 'Comfort Living Furniture', 'comfort-living-furniture', '1234567897', 'comfortliving@example.com', '1297', '597', '505 Home Street, City', 40.6508170, -73.9404280, 1, '10:00:00', '20:00:00', 10.00, '1-2 hours', 1, 0, 100, 0, 'Sunday', 1, 'Comfort Living Furniture - Quality Furniture for Every Home', 'Explore a wide range of furniture for your home at Comfort Living Furniture.', 'comfort_living_meta_image.png', 1, NULL, 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(8, 2, 1, 'books', 5.00, 'VAT123464', 'commission', 'percentage', 10.00, 'Readers Paradise', 'readers-paradise', '1234567898', 'readersparadise@example.com', '1297', '594', '606 Knowledge Lane, City', 23.7953490, 90.4029920, 1, '09:00:00', '18:00:00', 4.00, '30-60 minutes', 1, 1, 15, 0, 'Saturday', 1, 'Readers Paradise - Your Book Haven', 'Find the best selection of books, from bestsellers to classics at Readers Paradise.', 'readers_paradise_meta_image.png', 1, NULL, 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(9, 1, 1, 'gadgets', 5.00, 'VAT123465', 'commission', 'percentage', 10.00, 'Tech Haven', 'tech-haven', '1234567899', 'techhaven@example.com', '1297', NULL, '707 Gadget Boulevard, City', 23.7953490, 90.4029920, 1, '10:00:00', '21:00:00', 5.00, '30-60 minutes', 1, 1, 50, 0, 'Friday', 1, 'Tech Haven - Latest Gadgets & Electronics', 'Shop the latest gadgets, electronics, and accessories at Tech Haven.', 'tech_haven_meta_image.png', 1, '2025-09-29 04:12:32', 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-29 04:12:32'),
(10, 1, 1, 'animals-pet', 5.00, 'VAT123467', 'commission', 'percentage', 10.00, 'Paws & Claws', 'paws--claws', '1234567901', 'pawsandclaws@example.com', '1297', NULL, '909 Pet Haven, City', 23.7948895, 90.4051046, 1, '09:00:00', '20:00:00', 7.00, '30-60 minutes', 1, 1, 25, 0, 'Thursday', 1, 'Paws & Claws - Everything for Your Pets', 'Get pet food, accessories, and more at Paws & Claws.', 'paws_and_claws_meta_image.png', 1, NULL, 1, 1, NULL, '2025-03-10 01:43:00', '2025-09-23 04:21:46'),
(11, 1, 1, 'fish', 5.00, 'VAT123468', 'commission', 'percentage', 10.00, 'The Fish Bowl', 'the-fish-bowl', '1234567902', 'thefishbowl@example.com', '1297', NULL, '1010 Aquarium Street, City', 23.7950303, 90.4045412, 1, '10:00:00', '19:00:00', 5.00, '30-45 minutes', 1, 1, 20, 0, 'Wednesday', 1, 'The Fish Bowl - Fish & Aquatic Supplies', 'Shop for fish, tanks, and aquarium supplies at The Fish Bowl.', 'the_fish_bowl_meta_image.png', 1, NULL, 1, 8, NULL, '2025-03-10 01:43:00', '2025-09-23 23:35:00');

-- --------------------------------------------------------

--
-- Table structure for table `store_areas`
--

CREATE TABLE `store_areas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `coordinates` polygon DEFAULT NULL,
  `center_latitude` decimal(10,7) DEFAULT NULL,
  `center_longitude` decimal(10,7) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=Inactive, 1=Active',
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_areas`
--

INSERT INTO `store_areas` (`id`, `code`, `state`, `city`, `name`, `coordinates`, `center_latitude`, `center_longitude`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Dhaka', 'Gulshan', 'Gulshan', 0x000000000103000000010000000c000000d40ad8fc7c9a5640ed1b3f2752c83740da0ad824a09a5640cec517ca9cc83740dc0ad840cf9a5640a0fcac7e92c83740d90ad834db9a56406a84966789c73740ed0ad8c8bf9a5640d0c41fc43ec73740d20ad8d0c69a56403c742b85cdc63740ea0ad8f8bc9a5640a0926fd44cc63740e10ad83c889a5640854f1d4a6ec63740bd0ad84c699a5640af45cf9103c73740df0ad820599a56409c610913f8c73740d40ad8fc7c9a5640ed1b3f2752c83740d40ad8fc7c9a5640ed1b3f2752c83740, 23.7795189, 90.4159425, 1, 8, NULL, '2025-04-23 09:12:06', '2025-09-23 05:43:42'),
(2, 'NY-003', 'New York', 'Queens', 'Queens', 0x00000000010300000001000000050000006ee00ed4297352c03259dc7f645c444026ff93bf7b7352c08f6cae9ae75c4440c6db4aafcd7352c0d0251c7a8b5d44407ffacf9a1f7452c011df89592f5e44406ee00ed4297352c03259dc7f645c4440, 40.7278202, -73.8060973, 1, NULL, NULL, '2025-05-24 04:09:59', '2025-05-24 04:09:59'),
(3, 'CA-002', 'California', 'San Francisco', 'San Francisco', 0x0000000001030000000100000005000000b5c189e8d79a5ec042b115342de342406ee00ed4299b5ec0836a8313d1e342400ebdc5c37b9b5ec0c423f1f274e44240c6db4aafcd9b5ec005dd5ed218e54240b5c189e8d79a5ec042b115342de34240, 37.7823185, -122.4269285, 1, NULL, NULL, '2025-05-24 04:09:59', '2025-05-24 04:09:59');

-- --------------------------------------------------------

--
-- Table structure for table `store_area_settings`
--

CREATE TABLE `store_area_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `store_area_id` bigint(20) UNSIGNED NOT NULL,
  `delivery_time_per_km` int(11) NOT NULL,
  `min_order_delivery_fee` decimal(10,2) DEFAULT NULL,
  `delivery_charge_method` varchar(255) DEFAULT NULL COMMENT 'fixed, per_km, range_wise',
  `out_of_area_delivery_charge` decimal(10,2) DEFAULT NULL,
  `fixed_charge_amount` decimal(10,2) DEFAULT NULL,
  `per_km_charge_amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_area_settings`
--

INSERT INTO `store_area_settings` (`id`, `store_area_id`, `delivery_time_per_km`, `min_order_delivery_fee`, `delivery_charge_method`, `out_of_area_delivery_charge`, `fixed_charge_amount`, `per_km_charge_amount`, `created_at`, `updated_at`) VALUES
(1, 1, 5, 50.00, 'per_km', 100.00, NULL, 5.00, '2025-03-10 01:43:00', '2025-09-23 04:29:03'),
(2, 2, 5, 10.00, 'range_wise', 100.00, 100.00, 10.00, '2025-04-06 03:58:12', '2025-09-23 04:31:44'),
(3, 6, 100, 60.00, 'range_wise', 200.00, 20.00, 5.00, '2025-04-19 11:17:32', '2025-05-17 11:53:47'),
(4, 10, 60, 60.00, 'per_km', 100.00, 70.00, 2.00, '2025-06-18 09:09:24', '2025-06-18 09:45:55'),
(5, 3, 8, 60.00, 'fixed', 120.00, 100.00, NULL, '2025-09-23 04:33:15', '2025-09-23 04:33:46');

-- --------------------------------------------------------

--
-- Table structure for table `store_area_setting_range_charges`
--

CREATE TABLE `store_area_setting_range_charges` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `store_area_setting_id` bigint(20) UNSIGNED NOT NULL,
  `min_km` decimal(8,2) NOT NULL,
  `max_km` decimal(8,2) NOT NULL,
  `charge_amount` decimal(10,2) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '0=Inactive, 1=Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_area_setting_range_charges`
--

INSERT INTO `store_area_setting_range_charges` (`id`, `store_area_setting_id`, `min_km`, `max_km`, `charge_amount`, `status`, `created_at`, `updated_at`) VALUES
(61, 3, 5.00, 10.00, 100.00, 1, '2025-05-17 11:53:47', '2025-05-17 11:53:47'),
(64, 2, 1.00, 5.00, 5.00, 1, '2025-09-23 04:31:44', '2025-09-23 04:31:44'),
(65, 2, 5.00, 10.00, 10.00, 1, '2025-09-23 04:31:44', '2025-09-23 04:31:44');

-- --------------------------------------------------------

--
-- Table structure for table `store_area_setting_store_types`
--

CREATE TABLE `store_area_setting_store_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `store_area_setting_id` bigint(20) UNSIGNED NOT NULL,
  `store_type_id` bigint(20) UNSIGNED NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '0=Inactive, 1=Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_area_setting_store_types`
--

INSERT INTO `store_area_setting_store_types` (`id`, `store_area_setting_id`, `store_type_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2025-03-10 01:43:00', '2025-03-10 01:43:00'),
(2, 1, 2, 1, '2025-03-10 01:43:00', '2025-03-10 01:43:00'),
(4, 2, 1, 1, NULL, NULL),
(5, 2, 5, 1, NULL, NULL),
(9, 3, 1, 1, NULL, NULL),
(23, 1, 4, 1, NULL, NULL),
(24, 1, 5, 1, NULL, NULL),
(26, 3, 3, 1, NULL, NULL),
(27, 1, 3, 1, NULL, NULL),
(28, 1, 6, 1, NULL, NULL),
(29, 1, 9, 1, NULL, NULL),
(30, 1, 8, 1, NULL, NULL),
(31, 1, 7, 1, NULL, NULL),
(32, 1, 10, 1, NULL, NULL),
(33, 1, 11, 1, NULL, NULL),
(34, 4, 1, 1, NULL, NULL),
(35, 4, 2, 1, NULL, NULL),
(36, 4, 3, 1, NULL, NULL),
(37, 4, 4, 1, NULL, NULL),
(38, 4, 5, 1, NULL, NULL),
(39, 2, 2, 1, NULL, NULL),
(40, 2, 3, 1, NULL, NULL),
(41, 2, 4, 1, NULL, NULL),
(42, 2, 6, 1, NULL, NULL),
(43, 2, 11, 1, NULL, NULL),
(44, 2, 10, 1, NULL, NULL),
(45, 2, 8, 1, NULL, NULL),
(46, 2, 9, 1, NULL, NULL),
(47, 2, 7, 1, NULL, NULL),
(48, 5, 1, 1, NULL, NULL),
(49, 5, 2, 1, NULL, NULL),
(50, 5, 3, 1, NULL, NULL),
(51, 5, 4, 1, NULL, NULL),
(52, 5, 5, 1, NULL, NULL),
(53, 5, 6, 1, NULL, NULL),
(54, 5, 11, 1, NULL, NULL),
(55, 5, 10, 1, NULL, NULL),
(56, 5, 9, 1, NULL, NULL),
(57, 5, 8, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `store_notices`
--

CREATE TABLE `store_notices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` longtext DEFAULT NULL,
  `type` enum('general','specific_store','specific_seller') NOT NULL DEFAULT 'general' COMMENT 'general, specific_store, specific_seller',
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'low' COMMENT 'Priority: low, medium, high',
  `active_date` datetime DEFAULT NULL COMMENT 'Start date of the notice',
  `expire_date` datetime DEFAULT NULL COMMENT 'End date of the notice',
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '0=inactive, 1=active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_notice_recipients`
--

CREATE TABLE `store_notice_recipients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `notice_id` bigint(20) UNSIGNED NOT NULL,
  `seller_id` bigint(20) UNSIGNED DEFAULT NULL,
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_sellers`
--

CREATE TABLE `store_sellers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `num_of_reviews` int(11) DEFAULT NULL,
  `num_of_sale` int(11) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_sellers`
--

INSERT INTO `store_sellers` (`id`, `user_id`, `rating`, `num_of_reviews`, `num_of_sale`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(2, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(3, 9, NULL, NULL, NULL, 1, NULL, NULL, '2025-03-17 02:39:58', '2025-03-17 02:39:58'),
(4, 10, NULL, NULL, NULL, 1, NULL, NULL, '2025-03-17 02:54:24', '2025-03-17 02:54:24'),
(5, 11, NULL, NULL, NULL, 1, NULL, NULL, '2025-03-17 21:39:53', '2025-03-17 21:39:53'),
(6, 12, NULL, NULL, NULL, 1, NULL, NULL, '2025-03-17 21:42:39', '2025-03-17 21:42:39'),
(7, 13, NULL, NULL, NULL, 1, NULL, NULL, '2025-03-17 21:52:39', '2025-03-17 21:52:39'),
(8, 14, NULL, NULL, NULL, 1, NULL, NULL, '2025-03-17 21:56:54', '2025-03-17 21:56:54'),
(9, 15, NULL, NULL, NULL, 1, NULL, NULL, '2025-03-17 22:04:41', '2025-03-17 22:04:41'),
(10, 16, NULL, NULL, NULL, 1, NULL, NULL, '2025-03-18 04:05:05', '2025-03-18 04:05:05'),
(11, 38, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-07 21:39:50', '2025-04-07 21:39:50'),
(12, 39, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-08 03:24:15', '2025-04-08 03:24:15'),
(13, 40, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-08 03:25:25', '2025-04-08 03:25:25'),
(14, 41, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-08 03:33:45', '2025-04-08 03:33:45'),
(15, 43, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-08 03:44:50', '2025-04-08 03:44:50'),
(16, 44, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-08 03:46:08', '2025-04-08 03:46:08'),
(17, 45, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-08 06:38:12', '2025-04-08 06:38:12'),
(18, 50, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-15 03:36:16', '2025-04-15 03:36:16'),
(19, 52, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-16 08:24:20', '2025-04-16 08:24:20'),
(20, 53, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-16 11:12:27', '2025-04-16 11:12:27'),
(21, 54, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-17 09:11:52', '2025-04-17 09:11:52'),
(22, 55, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-19 05:32:06', '2025-04-19 05:32:06'),
(23, 56, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-20 04:35:03', '2025-04-20 04:35:03'),
(24, 57, NULL, NULL, NULL, 1, NULL, NULL, '2025-04-20 11:22:57', '2025-04-20 11:22:57'),
(25, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(26, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(27, 72, NULL, NULL, NULL, 1, NULL, NULL, '2025-05-04 09:51:42', '2025-05-04 09:51:42'),
(28, 73, NULL, NULL, NULL, 1, NULL, NULL, '2025-05-04 09:53:43', '2025-05-04 09:53:43'),
(29, 81, NULL, NULL, NULL, 1, NULL, NULL, '2025-05-06 06:57:44', '2025-05-06 06:57:44'),
(30, 82, NULL, NULL, NULL, 1, NULL, NULL, '2025-05-06 08:56:10', '2025-05-06 08:56:10'),
(31, 83, NULL, NULL, NULL, 1, NULL, NULL, '2025-05-06 09:00:27', '2025-05-06 09:00:27'),
(32, 86, NULL, NULL, NULL, 1, NULL, NULL, '2025-05-12 06:10:13', '2025-05-12 06:10:13'),
(33, 87, NULL, NULL, NULL, 1, NULL, NULL, '2025-05-12 07:05:51', '2025-05-12 07:05:51'),
(34, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(35, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(36, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(37, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(38, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(39, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(40, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(41, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(42, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(43, 1, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(44, 91, NULL, NULL, NULL, 1, NULL, NULL, '2025-05-24 07:16:32', '2025-05-24 07:16:32'),
(45, 92, NULL, NULL, NULL, 1, NULL, NULL, '2025-05-24 09:15:05', '2025-05-24 09:15:05'),
(46, 96, NULL, NULL, NULL, 1, NULL, NULL, '2025-05-29 05:09:25', '2025-05-29 05:09:25'),
(47, 98, NULL, NULL, NULL, 1, NULL, NULL, '2025-06-01 04:32:38', '2025-06-01 04:32:38'),
(48, 100, NULL, NULL, NULL, 1, NULL, NULL, '2025-06-04 04:13:41', '2025-06-04 04:13:41'),
(49, 101, NULL, NULL, NULL, 1, NULL, NULL, '2025-06-16 04:18:50', '2025-06-16 04:18:50'),
(50, 102, NULL, NULL, NULL, 1, NULL, NULL, '2025-06-16 06:23:52', '2025-06-16 06:23:52'),
(51, 123, NULL, NULL, NULL, 1, NULL, NULL, '2025-07-07 08:19:48', '2025-07-07 08:19:48'),
(52, 128, NULL, NULL, NULL, 1, NULL, NULL, '2025-07-12 23:07:31', '2025-07-12 23:07:31'),
(53, 129, NULL, NULL, NULL, 1, NULL, NULL, '2025-07-12 23:18:41', '2025-07-12 23:18:41'),
(54, 130, NULL, NULL, NULL, 1, NULL, NULL, '2025-07-13 00:36:00', '2025-07-13 00:36:00'),
(55, 133, NULL, NULL, NULL, 1, NULL, NULL, '2025-07-17 03:01:33', '2025-07-17 03:01:33'),
(56, 135, NULL, NULL, NULL, 1, NULL, NULL, '2025-07-23 02:40:28', '2025-07-23 02:40:28'),
(57, 136, NULL, NULL, NULL, 1, NULL, NULL, '2025-07-23 02:41:17', '2025-07-23 02:41:17'),
(58, 137, NULL, NULL, NULL, 1, NULL, NULL, '2025-07-23 02:41:21', '2025-07-23 02:41:21'),
(59, 138, NULL, NULL, NULL, 1, NULL, NULL, '2025-07-23 02:41:35', '2025-07-23 02:41:35'),
(60, 152, NULL, NULL, NULL, 1, NULL, NULL, '2025-08-03 23:45:33', '2025-08-03 23:45:33'),
(61, 153, NULL, NULL, NULL, 1, NULL, NULL, '2025-08-03 23:49:12', '2025-08-03 23:49:12'),
(62, 154, NULL, NULL, NULL, 1, NULL, NULL, '2025-08-03 23:59:48', '2025-08-03 23:59:48'),
(63, 155, NULL, NULL, NULL, 1, NULL, NULL, '2025-08-04 00:04:07', '2025-08-04 00:04:07'),
(64, 156, NULL, NULL, NULL, 1, NULL, NULL, '2025-08-04 00:04:58', '2025-08-04 00:04:58'),
(65, 157, NULL, NULL, NULL, 1, NULL, NULL, '2025-08-04 06:24:14', '2025-08-04 06:24:14'),
(66, 160, NULL, NULL, NULL, 1, NULL, NULL, '2025-08-11 21:53:28', '2025-08-11 21:53:28'),
(67, 161, NULL, NULL, NULL, 1, NULL, NULL, '2025-08-11 21:53:52', '2025-08-11 21:53:52'),
(68, 169, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-09 00:41:39', '2025-09-09 00:41:39'),
(69, 170, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-09 02:55:00', '2025-09-09 02:55:00'),
(70, 172, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-09 04:15:15', '2025-09-09 04:15:15'),
(71, 173, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-09 04:21:38', '2025-09-09 04:21:38'),
(72, 174, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-09 04:30:50', '2025-09-09 04:30:50'),
(73, 175, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-09 05:07:11', '2025-09-09 05:07:11'),
(74, 177, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-09 05:40:58', '2025-09-09 05:40:58'),
(75, 179, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-10 02:03:59', '2025-09-10 02:03:59'),
(76, 181, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-10 02:59:18', '2025-09-10 02:59:18'),
(77, 184, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-10 03:28:33', '2025-09-10 03:28:33'),
(78, 185, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-10 03:36:51', '2025-09-10 03:36:51'),
(79, 186, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-10 04:10:13', '2025-09-10 04:10:13'),
(80, 187, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-10 04:27:12', '2025-09-10 04:27:12'),
(81, 188, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-10 04:38:56', '2025-09-10 04:38:56'),
(82, 189, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-10 04:44:51', '2025-09-10 04:44:51'),
(83, 190, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-10 05:17:10', '2025-09-10 05:17:10'),
(84, 191, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-10 05:49:47', '2025-09-10 05:49:47'),
(85, 193, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-10 21:39:50', '2025-09-10 21:39:50'),
(86, 194, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-10 22:15:22', '2025-09-10 22:15:22'),
(87, 195, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-10 23:35:14', '2025-09-10 23:35:14'),
(88, 197, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-11 01:01:37', '2025-09-11 01:01:37'),
(89, 201, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-14 03:12:20', '2025-09-14 03:12:20'),
(90, 208, NULL, NULL, NULL, 1, NULL, NULL, '2025-09-28 21:59:14', '2025-09-28 21:59:14');

-- --------------------------------------------------------

--
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

INSERT INTO `store_subscriptions` (`id`, `store_id`, `subscription_id`, `name`, `type`, `validity`, `price`, `pos_system`, `self_delivery`, `mobile_app`, `live_chat`, `order_limit`, `product_limit`, `product_featured_limit`, `payment_gateway`, `payment_status`, `transaction_ref`, `manual_image`, `expire_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 4, 'Standard Package', NULL, 367, 100, 1, 1, 0, 1, 210, 310, 22, 'wallet', 'paid', NULL, NULL, '2026-09-26 05:46:55', 1, '2025-09-24 05:46:55', '2025-09-24 22:46:50');

-- --------------------------------------------------------

--
-- Table structure for table `store_types`
--

CREATE TABLE `store_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `total_stores` bigint(20) NOT NULL DEFAULT 0,
  `additional_charge_enable_disable` tinyint(1) NOT NULL DEFAULT 0,
  `additional_charge_name` varchar(255) DEFAULT NULL,
  `additional_charge_amount` decimal(8,2) DEFAULT NULL,
  `additional_charge_type` enum('fixed','percentage') DEFAULT NULL,
  `additional_charge_commission` decimal(8,2) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=Inactive, 1=Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `store_types`
--

INSERT INTO `store_types` (`id`, `name`, `type`, `image`, `description`, `total_stores`, `additional_charge_enable_disable`, `additional_charge_name`, `additional_charge_amount`, `additional_charge_type`, `additional_charge_commission`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Grocery', 'grocery', '1297', 'Grocery', 1, 1, 'Packaging Charge', 10.00, 'percentage', 5.00, 1, NULL, '2025-09-28 03:27:06'),
(2, 'Bakery', 'bakery', '1297', NULL, 1, 0, 'Packaging charge', 10.00, 'percentage', 5.00, 1, NULL, '2025-09-23 04:37:58'),
(3, 'Medicine', 'medicine', '1297', NULL, 1, 1, 'MediSafe Fee', 10.00, 'fixed', 2.00, 1, NULL, '2025-09-23 01:05:57'),
(4, 'Makeup', 'makeup', '1297', NULL, 1, 1, 'Packaging Fee', 12.00, 'percentage', 10.00, 1, NULL, '2025-09-23 01:05:48'),
(5, 'Bags', 'bags', '1297', NULL, 1, 1, 'Packaging Fee', 10.00, 'percentage', 15.00, 1, NULL, '2025-09-23 01:05:46'),
(6, 'Clothing', 'clothing', '1297', NULL, 1, 0, 'Packaging Fee', 10.00, 'percentage', 12.00, 1, NULL, '2025-09-23 01:05:57'),
(7, 'Furniture', 'furniture', '1297', NULL, 1, 0, 'Packaging Fee', 10.00, 'percentage', 10.00, 1, NULL, '2025-09-23 01:05:49'),
(8, 'Books', 'books', '1297', NULL, 1, 1, 'Packaging Fee', 5.00, 'fixed', 5.00, 1, NULL, '2025-09-23 01:05:48'),
(9, 'Gadgets', 'gadgets', '1297', NULL, 1, 1, 'Packaging Fee', 10.00, 'percentage', 10.00, 1, NULL, '2025-09-23 01:05:46'),
(10, 'Animals & Pets', 'animals-pet', '1297', NULL, 1, 1, 'Packaging Fee', 20.00, 'fixed', 30.00, 1, NULL, '2025-09-23 04:38:45'),
(11, 'Fish', 'fish', '1297', NULL, 1, 0, 'Packaging Fee', 10.00, 'percentage', 10.00, 1, NULL, '2025-10-05 22:28:19');

-- --------------------------------------------------------

--
-- Table structure for table `subscribers`
--

CREATE TABLE `subscribers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `is_subscribed` tinyint(1) NOT NULL DEFAULT 1,
  `unsubscribed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `validity` int(11) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` double NOT NULL DEFAULT 0,
  `pos_system` tinyint(1) NOT NULL DEFAULT 0,
  `self_delivery` tinyint(1) NOT NULL DEFAULT 0,
  `mobile_app` tinyint(1) NOT NULL DEFAULT 0,
  `live_chat` tinyint(1) NOT NULL DEFAULT 0,
  `order_limit` int(11) NOT NULL DEFAULT 0,
  `product_limit` int(11) NOT NULL DEFAULT 0,
  `product_featured_limit` int(11) NOT NULL DEFAULT 0,
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0=inactive, 1=active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `name`, `type`, `validity`, `image`, `description`, `price`, `pos_system`, `self_delivery`, `mobile_app`, `live_chat`, `order_limit`, `product_limit`, `product_featured_limit`, `status`, `created_at`, `updated_at`) VALUES
(2, 'Trial Package', 'Weekly', 7, '1297', 'Free Package', 0, 0, 0, 0, 0, 10, 10, 2, 1, '2025-04-17 07:05:16', '2025-09-28 03:41:37'),
(3, 'Basic Package', 'Monthly', 30, '1297', 'Basic Package', 30, 0, 0, 0, 0, 50, 50, 5, 1, '2025-04-17 07:05:16', '2025-06-18 10:23:52'),
(4, 'Standard Package', 'Half-Yearly', 180, '1297', NULL, 100, 1, 1, 0, 1, 100, 150, 10, 1, '2025-04-17 07:05:16', '2025-05-20 12:19:37'),
(5, 'Premium Package', 'Yearly', 365, '1297', NULL, 200, 1, 1, 1, 1, 500, 200, 15, 1, '2025-04-17 07:05:16', '2025-05-20 12:19:20'),
(6, 'Enterprise Package', 'Extended', 1095, '1297', NULL, 500, 1, 1, 1, 1, 1000, 500, 25, 1, '2025-04-17 07:05:16', '2025-05-20 12:22:24');

-- --------------------------------------------------------

--
-- Table structure for table `subscription_histories`
--

CREATE TABLE `subscription_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `store_subscription_id` int(10) UNSIGNED NOT NULL,
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
  `payment_status` varchar(255) DEFAULT NULL COMMENT 'pending , paid, failed',
  `transaction_ref` varchar(255) DEFAULT NULL,
  `manual_image` varchar(255) DEFAULT NULL,
  `expire_date` timestamp NULL DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0=pending, 1=active, 2=cancelled',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription_histories`
--

INSERT INTO `subscription_histories` (`id`, `store_subscription_id`, `store_id`, `subscription_id`, `name`, `type`, `validity`, `price`, `pos_system`, `self_delivery`, `mobile_app`, `live_chat`, `order_limit`, `product_limit`, `product_featured_limit`, `payment_gateway`, `payment_status`, `transaction_ref`, `manual_image`, `expire_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 'Trial Package', NULL, 7, 0, 0, 0, 0, 0, 10, 10, 2, NULL, 'paid', NULL, NULL, '2025-10-01 05:46:55', 1, '2025-09-24 05:46:55', '2025-09-24 05:46:55'),
(2, 1, 1, 4, 'Standard Package', NULL, 180, 100, 1, 1, 0, 1, 100, 150, 10, 'wallet', 'paid', NULL, NULL, '2026-03-30 05:46:55', 1, '2025-09-24 22:37:25', '2025-09-24 22:37:25'),
(3, 1, 1, 4, 'Standard Package', NULL, 180, 100, 1, 1, 0, 1, 100, 150, 10, 'wallet', 'paid', NULL, NULL, '2026-09-26 05:46:55', 1, '2025-09-24 22:46:50', '2025-09-24 22:46:50');

-- --------------------------------------------------------

--
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

INSERT INTO `system_commissions` (`id`, `subscription_enabled`, `commission_enabled`, `commission_type`, `commission_amount`, `default_order_commission_rate`, `default_delivery_commission_charge`, `order_shipping_charge`, `order_confirmation_by`, `order_include_tax_amount`, `order_additional_charge_enable_disable`, `order_additional_charge_name`, `order_additional_charge_amount`, `order_additional_charge_commission`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'percentage', 10.00, 20.00, 10.00, 1.00, 'deliveryman', 1, 1, 'Processing Fee', 0.00, 0.00, NULL, '2025-09-23 04:21:46');

-- --------------------------------------------------------

--
-- Table structure for table `system_management`
--

CREATE TABLE `system_management` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `order` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `store_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `priority` varchar(255) DEFAULT NULL COMMENT 'low,high,medium,urgent',
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '0=inactive, 1=active',
  `resolved_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_messages`
--

CREATE TABLE `ticket_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ticket_id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED DEFAULT NULL,
  `receiver_id` bigint(20) UNSIGNED DEFAULT NULL,
  `sender_role` varchar(255) DEFAULT NULL,
  `receiver_role` varchar(255) DEFAULT NULL,
  `message` longtext DEFAULT NULL,
  `file` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
















--
-- Table structure for table `translations`
--

CREATE TABLE `translations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `translatable_id` bigint(20) UNSIGNED NOT NULL,
  `translatable_type` varchar(255) NOT NULL,
  `language` varchar(255) NOT NULL DEFAULT 'en',
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `translations`
--

INSERT INTO `translations` (`id`, `translatable_id`, `translatable_type`, `language`, `key`, `value`, `created_at`, `updated_at`) VALUES
(338, 2, 'App\\Models\\BlogCategory', 'en', 'name', 'Health & Wellness', NULL, NULL),
(339, 2, 'App\\Models\\BlogCategory', 'en', 'meta_title', 'Health & Wellness', NULL, NULL),
(340, 2, 'App\\Models\\BlogCategory', 'en', 'meta_description', 'Health & Wellness', NULL, NULL),
(341, 3, 'App\\Models\\BlogCategory', 'en', 'name', 'Baking & Sweets', NULL, NULL),
(342, 3, 'App\\Models\\BlogCategory', 'en', 'meta_title', 'Baking & Sweets', NULL, NULL),
(343, 3, 'App\\Models\\BlogCategory', 'en', 'meta_description', 'Baking & Sweets', NULL, NULL),
(344, 4, 'App\\Models\\BlogCategory', 'en', 'name', 'Grocery Insights', NULL, NULL),
(345, 4, 'App\\Models\\BlogCategory', 'en', 'meta_title', 'Grocery Insights', NULL, NULL),
(346, 4, 'App\\Models\\BlogCategory', 'en', 'meta_description', 'Grocery Insights', NULL, NULL),
(347, 2, 'App\\Models\\Blog', 'en', 'title', 'Baking 101: Tips for Perfect Cakes and Pastries', NULL, NULL),
(348, 2, 'App\\Models\\Blog', 'en', 'description', 'Baking is both an art and a science, requiring precision and the right techniques. One of the most important aspects of baking is measuring ingredients correctly, as even slight variations can affect the final outcome. Using room-temperature ingredients, especially eggs and butter, helps in achieving a smooth batter consistency. Preheating the oven is crucial, as placing batter in a cold oven can lead to uneven baking. Understanding your oven is also essential—some ovens have hot spots, which means rotating your trays midway through baking can lead to even results. Additionally, mixing techniques such as folding, whisking, and beating play a key role in achieving the desired texture. For beginners, starting with simple recipes before experimenting with complex techniques can build confidence. Lastly, always allow cakes and pastries to cool before frosting to prevent melting or a messy finish. With practice and patience, anyone can master the art of baking.', NULL, NULL),
(516, 188, 'App\\Models\\Product', 'en', 'name', 'Ulric Thomas', NULL, NULL),
(517, 188, 'App\\Models\\Product', 'en', 'description', 'At ratione consequat', NULL, NULL),
(518, 188, 'App\\Models\\Product', 'en', 'meta_title', 'Dolore sed voluptas', NULL, NULL),
(519, 188, 'App\\Models\\Product', 'en', 'meta_description', 'Voluptatem est iru', NULL, NULL),
(520, 187, 'App\\Models\\Product', 'en', 'name', 'Summer Mcconnell', NULL, NULL),
(521, 187, 'App\\Models\\Product', 'en', 'description', 'In velit occaecat te', NULL, NULL),
(522, 187, 'App\\Models\\Product', 'en', 'meta_title', 'Ut pariatur Quia du', NULL, NULL),
(523, 187, 'App\\Models\\Product', 'en', 'meta_description', 'Labore officia proid', NULL, NULL),
(579, 8, 'App\\Models\\BlogCategory', 'ar', 'name', 'وصفات الطعام والمشروبات', NULL, NULL),
(584, 2, 'App\\Models\\Page', 'en', 'title', 'Terms and conditions', NULL, NULL),
(585, 2, 'App\\Models\\Page', 'en', 'content', '<h2>📄 <strong>Terms and Conditions</strong></h2><p>Welcome to Quick Ecommerce. These Terms and Conditions outline the rules and regulations for the use of our platform.</p><p>By accessing or using , you agree to comply with and be bound by these terms. If you disagree with any part of the terms, you must not use our services.</p><p></p><hr><h3>1. 🛍️ <strong>Use of Our Platform</strong></h3><ul><li><p>You must be at least <strong>18 years old</strong> or use the site under the supervision of a guardian.</p></li><li><p>You agree to use the platform only for lawful purposes.</p></li><li><p>Any fraudulent, abusive, or illegal activity is strictly prohibited.</p></li><li><p></p></li></ul><hr><h3>2. 👤 <strong>User Accounts</strong></h3><ul><li><p>You are responsible for maintaining the confidentiality of your account and password.</p></li><li><p>You agree to provide accurate and complete information during registration.</p></li><li><p><strong>Quick Ecommerce </strong>reserves the right to suspend or terminate accounts found in violation of our terms.</p></li></ul><hr><p></p><h3>3. 🛒 <strong>Orders &amp; Transactions</strong></h3><ul><li><p>All orders placed through the website are subject to product availability and confirmation of the order price.</p></li><li><p>We reserve the right to cancel or limit the quantity of any order for any reason.</p></li></ul><hr><p></p><h3>4. 📦 <strong>Vendor Responsibilities</strong></h3><ul><li><p>Sellers must ensure accurate listing information, stock availability, and timely fulfillment.</p></li><li><p>Products must meet the quality and safety standards as defined in our <strong>Seller Policy</strong>.</p></li><li><p>Misuse of the platform by vendors may lead to account suspension.</p></li></ul><hr><p></p><h3>5. 💳 <strong>Pricing &amp; Payment</strong></h3><ul><li><p>All prices are listed in <strong>$</strong> and are inclusive of applicable taxes unless stated otherwise.</p></li><li><p>We reserve the right to modify prices at any time without prior notice.</p></li></ul><hr><p></p><h3>6. 🔄 Returns, Refunds &amp; Cancellations</h3><ul><li><p>Please refer to our <strong>Return &amp; Refund Policy</strong> for information on returns, exchanges, and cancellations.</p></li></ul><hr><p></p><h3>7. 🔐 <strong>Privacy Policy</strong></h3><ul><li><p>Your use of our site is also governed by our <strong>Privacy Policy</strong>, which outlines how we collect, use, and protect your personal data.</p></li></ul><hr><p></p><h3>8. 🚫 <strong>Prohibited Activities</strong></h3><p>Users are prohibited from:</p><ul><li><p>Violating any applicable laws</p></li><li><p>Infringing on the intellectual property rights of others</p></li><li><p>Uploading or transmitting viruses or malicious code</p></li><li><p>Attempting to gain unauthorized access to other accounts</p></li></ul><hr><p></p><h3>9. 📜 <strong>Intellectual Property</strong></h3><ul><li><p>All content, design, logos, and trademarks on the platform are the property of Quick Ecommerce or its licensors.</p></li><li><p>You may not use any content without prior written consent.</p></li></ul><hr><p></p><h3>10. ⚖️ <strong>Limitation of Liability</strong></h3><ul><li><p>We shall not be held liable for any indirect, incidental, or consequential damages arising from the use of or inability to use the platform.</p></li></ul><hr><p></p><h3>11. 🛠️ <strong>Modifications</strong></h3><ul><li><p>We reserve the right to update or modify these terms at any time.</p></li><li><p>Continued use of the platform after changes implies acceptance of the revised terms.</p></li></ul><hr><p></p><h3>12. 📞 <strong>Contact Us</strong></h3><p>If you have any questions about these Terms, please contact us at:</p><p><strong>Email:</strong> example.support@gmail.com<br><strong>Phone:</strong> +2001700000000</p>', NULL, NULL),
(586, 2, 'App\\Models\\Page', 'en', 'meta_title', 'Buy Products Online - Amazing Store', NULL, NULL),
(587, 2, 'App\\Models\\Page', 'en', 'meta_description', 'Best deals on products at Amazing Store.', NULL, NULL),
(588, 2, 'App\\Models\\Page', 'en', 'meta_keywords', 'amazing store, best deals, online products', NULL, NULL),
(589, 2, 'App\\Models\\Page', 'ar', 'title', 'المتجر الرائع', NULL, NULL),
(590, 2, 'App\\Models\\Page', 'ar', 'content', 'مرحباً بكم في متجري الرائع. نقدم مجموعة متنوعة من المنتجات للاختيار من بينها.', NULL, NULL),
(591, 2, 'App\\Models\\Page', 'ar', 'meta_title', 'شراء المنتجات عبر الإنترنت - المتجر الرائع', NULL, NULL),
(592, 2, 'App\\Models\\Page', 'ar', 'meta_description', 'أفضل العروض على المنتجات في المتجر الرائع.', NULL, NULL),
(593, 2, 'App\\Models\\Page', 'ar', 'meta_keywords', 'المتجر الرائع، أفضل العروض، المنتجات عبر الإنترنت', NULL, NULL),
(610, 187, 'App\\Models\\Product', 'en', 'meta_keywords', 'asdf', NULL, NULL),
(611, 5, 'App\\Models\\Page', 'en', 'title', 'Privacy Policy', NULL, NULL),
(612, 5, 'App\\Models\\Page', 'en', 'content', '<h1><strong>Privacy Policy</strong></h1><h2>Privacy &amp; Information Security Policy</h2><p>Welcome to Quick Ecommerce. These Terms and Conditions (\"Terms\") govern your use of our multivendor e-commerce platform and apply to all users, including buyers, sellers, and visitors. By accessing or using our platform, you agree to comply with these Terms.</p><p>Our platform provides a marketplace where independent vendors can list and sell products, and buyers can browse and purchase products. While we facilitate these transactions, we are not directly involved in the sale or fulfillment of products.</p><p>Please review these Terms carefully. If you do not agree, you should discontinue use of our platform. For any questions or assistance, contact us at example.support@gmail.com</p><h2>Information We Collect</h2><p></p><h3>1. Personal Information</h3><ul><li><p><strong>Full Name:</strong> Used for identification, billing, and shipping purposes.</p></li><li><p><strong>Email Address:</strong> Required for account creation, communications, and order confirmations.</p></li><li><p><strong>Phone Number:</strong> Used for account verification, order updates, and customer support.</p></li><li><p><strong>Billing &amp; Shipping Address:</strong> Necessary for processing payments and delivering purchased items.</p></li></ul><h3>2. Account Information</h3><ul><li><p><strong>Username:</strong> Chosen by the user for logging in and account recognition.</p></li><li><p><strong>Password:</strong> Securely encrypted and stored to protect user accounts.</p></li><li><p><strong>Profile Details:</strong> Includes avatar, preferences, saved addresses, and communication settings.</p></li></ul><h3>3. Payment Information</h3><ul><li><p><strong>Transaction History:</strong> Records of payments, purchases, refunds, and disputes.</p></li><li><p><strong>Billing Information:</strong> Includes payment method (credit/debit card, digital wallets, etc.).</p></li><li><p><strong>Third-Party Payment Data:</strong> When we do not store full credit card details, our payment partners securely process transactions and store necessary details.</p></li></ul><h3>4. Device &amp; Usage Data</h3><ul><li><p><strong>IP Address:</strong> Helps detect fraud, maintain security, and personalize content based on location.</p></li><li><p><strong>Browser Type &amp; Operating System:</strong> Used for optimizing the website experience.</p></li><li><p><strong>Cookies &amp; Tracking Technologies:</strong> Enable session management, user authentication, and marketing improvements.</p></li><li><p><strong>Analytics Data:</strong> Collected through third-party tools (e.g., Google Analytics) to analyze user behavior, website traffic, and engagement metrics.</p></li></ul><h3>5. Vendor-Specific Data</h3><ul><li><p><strong>Business Details:</strong> Such as business name, registration details, and tax identification.</p></li><li><p><strong>Store Information:</strong> Includes store name, logo, policies, and contact details.</p></li><li><p><strong>Uploaded Content:</strong> Product listings, descriptions, images, and other media required for selling on the platform.</p></li></ul><h2>Data Protection, Security &amp; Tracking Technologies</h2><h3>1. Data Protection &amp; Security</h3><ul><li><p><strong>Encryption &amp; Secure Storage:</strong> All sensitive data, including passwords and payment information, is encrypted and stored securely.</p></li><li><p><strong>Secure Payment Processing:</strong> Transactions are handled through PCI-DSS-compliant payment gateways, ensuring financial data protection.</p></li><li><p><strong>Access Control:</strong> Only authorized personnel have access to sensitive data, and strict security protocols are in place.</p></li><li><p><strong>Fraud Prevention:</strong> We use automated security tools and monitoring systems to detect fraudulent activities.</p></li><li><p><strong>Regular Security Audits:</strong> We conduct periodic assessments and updates to enhance data security measures.</p></li></ul><h3>2. Cookies &amp; Tracking Technologies</h3><ul><li><p><strong>Essential Cookies:</strong> Necessary for website functionality, including login authentication and shopping cart management.</p></li><li><p><strong>Performance &amp; Analytics Cookies:</strong> Help us analyze user behavior, track website traffic, and improve user experience.</p></li><li><p><strong>Advertising &amp; Marketing Cookies:</strong> Used for personalized ads and remarketing campaigns based on browsing activity.</p></li><li><p><strong>Third-Party Tracking:</strong> Some cookies are placed by third-party services (e.g., Google Analytics, Facebook Pixel) to help us understand and optimize engagement.</p></li></ul>', NULL, NULL),
(613, 5, 'App\\Models\\Page', 'en', 'meta_title', 'Buy Products Online - Amazing Store', NULL, NULL),
(614, 5, 'App\\Models\\Page', 'en', 'meta_description', 'Find the best deals on products at My Amazing Store. Quality items at affordable prices.', NULL, NULL),
(615, 5, 'App\\Models\\Page', 'en', 'meta_keywords', 'amazing store, best deals, online products', NULL, NULL),
(616, 5, 'App\\Models\\Page', 'ar', 'title', 'المتجر الرائع', NULL, NULL),
(617, 5, 'App\\Models\\Page', 'ar', 'content', 'مرحباً بكم في متجري الرائع. نقدم مجموعة متنوعة من المنتجات للاختيار من بينها.', NULL, NULL),
(618, 5, 'App\\Models\\Page', 'ar', 'meta_title', 'شراء المنتجات عبر الإنترنت - المتجر الرائع', NULL, NULL),
(619, 5, 'App\\Models\\Page', 'ar', 'meta_description', 'أفضل العروض على المنتجات في المتجر الرائع.', NULL, NULL),
(620, 5, 'App\\Models\\Page', 'ar', 'meta_keywords', 'المتجر الرائع، أفضل العروض، المنتجات عبر الإنترنت', NULL, NULL),
(799, 10, 'App\\Models\\Store', 'en', 'name', 'Paws & Claws', NULL, NULL),
(800, 10, 'App\\Models\\Store', 'ar', 'name', 'الكفوف والمخالب', NULL, NULL),
(806, 11, 'App\\Models\\Store', 'df', 'name', 'The Fish Bowl', NULL, NULL),
(808, 11, 'App\\Models\\Store', 'df', 'address', '1010 Aquarium Street, City', NULL, NULL),
(809, 11, 'App\\Models\\Store', 'df', 'meta_title', 'The Fish Bowl - Fish & Aquatic Supplies', NULL, NULL),
(810, 11, 'App\\Models\\Store', 'df', 'meta_description', 'Shop for fish, tanks, and aquarium supplies at The Fish Bowl.', NULL, NULL),
(851, 5, 'App\\Models\\Page', 'df', 'title', 'Privacy Policy', NULL, NULL),
(852, 5, 'App\\Models\\Page', 'df', 'content', '<h1><strong>Privacy Policy</strong></h1><h2>Privacy &amp; Information Security Policy</h2><p>Welcome to Quick Ecommerce. These Terms and Conditions (\"Terms\") govern your use of our multivendor e-commerce platform and apply to all users, including buyers, sellers, and visitors. By accessing or using our platform, you agree to comply with these Terms.</p><p>Our platform provides a marketplace where independent vendors can list and sell products, and buyers can browse and purchase products. While we facilitate these transactions, we are not directly involved in the sale or fulfillment of products.</p><p>Please review these Terms carefully. If you do not agree, you should discontinue use of our platform. For any questions or assistance, contact us at example.support@gmail.com</p><h2>Information We Collect</h2><h3>1. Personal Information</h3><ul><li><p><strong>Full Name:</strong> Used for identification, billing, and shipping purposes.</p></li><li><p><strong>Email Address:</strong> Required for account creation, communications, and order confirmations.</p></li><li><p><strong>Phone Number:</strong> Used for account verification, order updates, and customer support.</p></li><li><p><strong>Billing &amp; Shipping Address:</strong> Necessary for processing payments and delivering purchased items.</p></li></ul><h3>2. Account Information</h3><ul><li><p><strong>Username:</strong> Chosen by the user for logging in and account recognition.</p></li><li><p><strong>Password:</strong> Securely encrypted and stored to protect user accounts.</p></li><li><p><strong>Profile Details:</strong> Includes avatar, preferences, saved addresses, and communication settings.</p></li></ul><h3>3. Payment Information</h3><ul><li><p><strong>Transaction History:</strong> Records of payments, purchases, refunds, and disputes.</p></li><li><p><strong>Billing Information:</strong> Includes payment method (credit/debit card, digital wallets, etc.).</p></li><li><p><strong>Third-Party Payment Data:</strong> When we do not store full credit card details, our payment partners securely process transactions and store necessary details.</p></li></ul><h3>4. Device &amp; Usage Data</h3><ul><li><p><strong>IP Address:</strong> Helps detect fraud, maintain security, and personalize content based on location.</p></li><li><p><strong>Browser Type &amp; Operating System:</strong> Used for optimizing the website experience.</p></li><li><p><strong>Cookies &amp; Tracking Technologies:</strong> Enable session management, user authentication, and marketing improvements.</p></li><li><p><strong>Analytics Data:</strong> Collected through third-party tools (e.g., Google Analytics) to analyze user behavior, website traffic, and engagement metrics.</p></li></ul><h3>5. Vendor-Specific Data</h3><ul><li><p><strong>Business Details:</strong> Such as business name, registration details, and tax identification.</p></li><li><p><strong>Store Information:</strong> Includes store name, logo, policies, and contact details.</p></li><li><p><strong>Uploaded Content:</strong> Product listings, descriptions, images, and other media required for selling on the platform.</p></li></ul><h2>Data Protection, Security &amp; Tracking Technologies</h2><h3>1. Data Protection &amp; Security</h3><ul><li><p><strong>Encryption &amp; Secure Storage:</strong> All sensitive data, including passwords and payment information, is encrypted and stored securely.</p></li><li><p><strong>Secure Payment Processing:</strong> Transactions are handled through PCI-DSS-compliant payment gateways, ensuring financial data protection.</p></li><li><p><strong>Access Control:</strong> Only authorized personnel have access to sensitive data, and strict security protocols are in place.</p></li><li><p><strong>Fraud Prevention:</strong> We use automated security tools and monitoring systems to detect fraudulent activities.</p></li><li><p><strong>Regular Security Audits:</strong> We conduct periodic assessments and updates to enhance data security measures.</p></li></ul><h3>2. Cookies &amp; Tracking Technologies</h3><ul><li><p><strong>Essential Cookies:</strong> Necessary for website functionality, including login authentication and shopping cart management.</p></li><li><p><strong>Performance &amp; Analytics Cookies:</strong> Help us analyze user behavior, track website traffic, and improve user experience.</p></li><li><p><strong>Advertising &amp; Marketing Cookies:</strong> Used for personalized ads and remarketing campaigns based on browsing activity.</p></li><li><p><strong>Third-Party Tracking:</strong> Some cookies are placed by third-party services (e.g., Google Analytics, Facebook Pixel) to help us understand and optimize engagement.</p></li></ul>', NULL, NULL),
(853, 5, 'App\\Models\\Page', 'df', 'meta_title', 'Buy Products Online - Amazing Store', NULL, NULL),
(854, 5, 'App\\Models\\Page', 'df', 'meta_description', 'Find the best deals on products at My Amazing Store. Quality items at affordable prices.', NULL, NULL),
(855, 5, 'App\\Models\\Page', 'df', 'meta_keywords', 'buy products, store, amazing deals, affordable prices', NULL, NULL),
(856, 2, 'App\\Models\\Page', 'df', 'title', 'Terms and conditions', NULL, NULL),
(857, 2, 'App\\Models\\Page', 'df', 'content', '<h2>📄 <strong>Terms and Conditions</strong></h2><p>Welcome to Quick Ecommerce. These Terms and Conditions outline the rules and regulations for the use of our platform.</p><p>By accessing or using , you agree to comply with and be bound by these terms. If you disagree with any part of the terms, you must not use our services.</p><p></p><h3>1. 🛍️ <strong>Use of Our Platform</strong></h3><ul><li><p>You must be at least <strong>18 years old</strong> or use the site under the supervision of a guardian.</p></li><li><p>You agree to use the platform only for lawful purposes.</p></li><li><p>Any fraudulent, abusive, or illegal activity is strictly prohibited.</p></li></ul><h3>2. 👤 <strong>User Accounts</strong></h3><ul><li><p>You are responsible for maintaining the confidentiality of your account and password.</p></li><li><p>You agree to provide accurate and complete information during registration.</p></li><li><p><strong>Quick Ecommerce </strong>reserves the right to suspend or terminate accounts found in violation of our terms.</p></li></ul><h3>3. 🛒 <strong>Orders &amp; Transactions</strong></h3><ul><li><p>All orders placed through the website are subject to product availability and confirmation of the order price.</p></li><li><p>We reserve the right to cancel or limit the quantity of any order for any reason.</p></li></ul><h3>4. 📦 <strong>Vendor Responsibilities</strong></h3><ul><li><p>Sellers must ensure accurate listing information, stock availability, and timely fulfillment.</p></li><li><p>Products must meet the quality and safety standards as defined in our <strong>Seller Policy</strong>.</p></li><li><p>Misuse of the platform by vendors may lead to account suspension.</p></li></ul><h3>5. 💳 <strong>Pricing &amp; Payment</strong></h3><ul><li><p>All prices are listed in <strong>$</strong> and are inclusive of applicable taxes unless stated otherwise.</p></li><li><p>We reserve the right to modify prices at any time without prior notice.</p></li></ul><h3>6. 🔄 Returns, Refunds &amp; Cancellations</h3><ul><li><p>Please refer to our <strong>Return &amp; Refund Policy</strong> for information on returns, exchanges, and cancellations.</p></li></ul><h3>7. 🔐 <strong>Privacy Policy</strong></h3><ul><li><p>Your use of our site is also governed by our <strong>Privacy Policy</strong>, which outlines how we collect, use, and protect your personal data.</p></li></ul><h3>8. 🚫 <strong>Prohibited Activities</strong></h3><p>Users are prohibited from:</p><ul><li><p>Violating any applicable laws</p></li><li><p>Infringing on the intellectual property rights of others</p></li><li><p>Uploading or transmitting viruses or malicious code</p></li><li><p>Attempting to gain unauthorized access to other accounts.</p></li></ul><h3>9. 📜 <strong>Intellectual Property</strong></h3><ul><li><p>All content, design, logos, and trademarks on the platform are the property of Quick Ecommerce or its licensors.</p></li><li><p>You may not use any content without prior written consent.</p></li></ul><h3>10. ⚖️ <strong>Limitation of Liability</strong></h3><ul><li><p>We shall not be held liable for any indirect, incidental, or consequential damages arising from the use of or inability to use the platform.</p></li></ul><h3>11. 🛠️ <strong>Modifications</strong></h3><ul><li><p>We reserve the right to update or modify these terms at any time.</p></li><li><p>Continued use of the platform after changes implies acceptance of the revised terms.</p></li></ul><h3>12. 📞 <strong>Contact Us</strong></h3><p>If you have any questions about these Terms, please contact us at:</p><p><strong>Email:</strong> example.support@gmail.com<br><strong>Phone:</strong> +2001700000000</p>', NULL, NULL),
(858, 2, 'App\\Models\\Page', 'df', 'meta_title', 'Buy Products Online - My Amazing Store', NULL, NULL),
(859, 2, 'App\\Models\\Page', 'df', 'meta_description', 'Find the best deals on products at My Amazing Store. Quality items at affordable prices.', NULL, NULL),
(860, 2, 'App\\Models\\Page', 'df', 'meta_keywords', 'buy products, store, amazing deals, affordable prices', NULL, NULL),
(861, 6, 'App\\Models\\Page', 'df', 'title', 'Refund Policies', NULL, NULL),
(862, 6, 'App\\Models\\Page', 'df', 'content', '🧾 Refund & Return Policy\nWe strive to ensure a seamless shopping experience for all our customers. Please read our Refund & Return Policy carefully to understand how returns and refunds work on our multivendor platform.\n\n🛒 General Return Policy\nCustomers can request a return within 30 days of receiving the product.\nReturns are accepted only if the item is:\n\nDamaged during transit\n\nDefective or malfunctioning\n\nIncorrect or not as described\n\nThe item must be unused, in its original packaging, and with all original tags/labels attached.\n\n🔄 Vendor-Specific Return Policies\nEach vendor may have unique return policies based on the product type. Always check the return policy mentioned on the individual store/product page.\nIf a vendor doesn\'t define a specific policy, the general return policy will apply.\n\n💸 Refund Process\nAfter the returned item is received and inspected, refunds will be processed to the original payment method within 7–10 business days.\n\nCustomers may choose store credit instead of a direct refund.\n\n🚫 Non-Returnable Items\nItems marked as non-returnable or final sale\n\nPerishable goods (e.g., food, flowers)\n\nPersonal care/hygiene items (e.g., makeup, undergarments)\n\nDownloadable or digital products\n\n📦 Return Shipping\nIf the return is due to vendor error (wrong item, defective, or damaged), return shipping is covered by the vendor.\n\nIf due to customer reasons (e.g., change of mind, wrong size), customer pays the return shipping.\n\n📦 Customer Return Policies by Store Type\n🥦 Grocery\nReturns accepted within 24 hours\n\nOnly for damaged, expired, or wrong items\n\nItems must not be opened or consumed\n\n🍞 Bakery\nReturns within 24 hours\n\nAccepted if spoiled, damaged, or incorrect\n\nMust be in original condition and packaging\n\n💊 Medicine (Health & Wellness)\nReturns within 3 days\n\nOnly if damaged, incorrect, sealed and unused\n\nPrescription medications are non-returnable\n\n💄 Makeup\nReturns within 7 days\n\nMust be sealed, unused, and in original packaging\n\nUsed products cannot be returned due to hygiene concerns\n\n👜 Bags\nReturns within 14 days\n\nItem must be unused, with tags and original packaging\n\n👗 Clothing\nReturns within 14 days\n\nTry-on allowed, but item must be unworn, unwashed, and with tags attached\n\nExchanges allowed for size issues\n\n🛋️ Furniture\nReturns within 7 days\n\nMust be unassembled, in original condition and packaging\n\nCustom-made items are non-returnable\n\n📚 Books\nReturns within 7 days\n\nMust be in new condition, no marks or damage\n\nDigital books are non-refundable\n\n📱 Gadgets (Electronics)\nReturns within 14 days\n\nMust be unused and in original packaging\n\nIf opened, only accepted if defective or non-functional\n\nWarranty claims follow vendor-specific terms\n\n🐾 Animals & Pets\nReturns within 48 hours\n\nOnly accepted for wrong or unhealthy delivery\n\nMust include photo/video proof\n\nLive animals handled case-by-case\n\n🐟 Fish\nReturns within 24 hours\n\nOnly for dead-on-arrival or wrong species\n\nMust report within 1 hour of delivery with visual proof\n\nTank conditions and water temperature may be checked', NULL, NULL),
(863, 6, 'App\\Models\\Page', 'df', 'meta_title', 'Refund Policies', NULL, NULL),
(864, 6, 'App\\Models\\Page', 'df', 'meta_description', 'Refund Policies', NULL, NULL),
(865, 6, 'App\\Models\\Page', 'df', 'meta_keywords', 'Refund Policies', NULL, NULL),
(966, 2, 'App\\Models\\Store', 'df', 'name', 'Sweet Treats Bakery', NULL, NULL),
(967, 2, 'App\\Models\\Store', 'df', 'slug', 'sweet-treats-bakery', NULL, NULL),
(968, 2, 'App\\Models\\Store', 'df', 'address', '789 Sugar Road, City', NULL, NULL),
(969, 2, 'App\\Models\\Store', 'df', 'meta_title', 'Sweet Treats Bakery - Fresh Baked Goods', NULL, NULL),
(970, 2, 'App\\Models\\Store', 'df', 'meta_description', 'Delicious cakes, pastries, and more at Sweet Treats Bakery.', NULL, NULL),
(971, 6, 'App\\Models\\Store', 'df', 'name', 'Trendy Apparel', NULL, NULL),
(973, 6, 'App\\Models\\Store', 'df', 'address', '404 Fashion Avenue, City', NULL, NULL),
(974, 6, 'App\\Models\\Store', 'df', 'meta_title', 'Trendy Apparel - Fashion for Everyone', NULL, NULL),
(975, 6, 'App\\Models\\Store', 'df', 'meta_description', 'Shop trendy clothing for men, women, and kids at Trendy Apparel.', NULL, NULL),
(976, 3, 'App\\Models\\Store', 'df', 'name', 'Health First Pharmacy', NULL, NULL),
(977, 3, 'App\\Models\\Store', 'df', 'slug', 'health-first-pharmacy', NULL, NULL),
(978, 3, 'App\\Models\\Store', 'df', 'address', '101 Wellness Drive, City', NULL, NULL),
(979, 3, 'App\\Models\\Store', 'df', 'meta_title', 'Health First Pharmacy - Trusted Medicine Store', NULL, NULL),
(980, 3, 'App\\Models\\Store', 'df', 'meta_description', 'Get all your prescription and health needs at Health First Pharmacy.', NULL, NULL),
(981, 7, 'App\\Models\\Store', 'df', 'name', 'Comfort Living Furniture', NULL, NULL),
(982, 7, 'App\\Models\\Store', 'df', 'slug', 'comfort-living-furniture', NULL, NULL),
(983, 7, 'App\\Models\\Store', 'df', 'address', '505 Home Street, City', NULL, NULL),
(984, 7, 'App\\Models\\Store', 'df', 'meta_title', 'Comfort Living Furniture - Quality Furniture for Every Home', NULL, NULL),
(985, 7, 'App\\Models\\Store', 'df', 'meta_description', 'Explore a wide range of furniture for your home at Comfort Living Furniture.', NULL, NULL),
(986, 8, 'App\\Models\\Store', 'df', 'name', 'Readers Paradise', NULL, NULL),
(987, 8, 'App\\Models\\Store', 'df', 'slug', 'readers-paradise', NULL, NULL),
(988, 8, 'App\\Models\\Store', 'df', 'address', '606 Knowledge Lane, City', NULL, NULL),
(989, 8, 'App\\Models\\Store', 'df', 'meta_title', 'Readers Paradise - Your Book Haven', NULL, NULL),
(990, 8, 'App\\Models\\Store', 'df', 'meta_description', 'Find the best selection of books, from bestsellers to classics at Readers Paradise.', NULL, NULL),
(991, 4, 'App\\Models\\Store', 'df', 'name', 'Glamour Beauty', NULL, NULL),
(992, 4, 'App\\Models\\Store', 'df', 'slug', 'glamour-beauty', NULL, NULL),
(993, 4, 'App\\Models\\Store', 'df', 'address', '202 Beauty Lane, City', NULL, NULL),
(994, 4, 'App\\Models\\Store', 'df', 'meta_title', 'Glamour Beauty - Premium Makeup Store', NULL, NULL),
(995, 4, 'App\\Models\\Store', 'df', 'meta_description', 'Shop the best in makeup and beauty products at Glamour Beauty.', NULL, NULL),
(996, 9, 'App\\Models\\Store', 'df', 'name', 'Tech Haven', NULL, NULL),
(997, 9, 'App\\Models\\Store', 'df', 'slug', 'tech-haven', NULL, NULL),
(998, 9, 'App\\Models\\Store', 'df', 'address', '707 Gadget Boulevard, City', NULL, NULL),
(999, 9, 'App\\Models\\Store', 'df', 'meta_title', 'Tech Haven - Latest Gadgets & Electronics', NULL, NULL),
(1000, 9, 'App\\Models\\Store', 'df', 'meta_description', 'Shop the latest gadgets, electronics, and accessories at Tech Haven.', NULL, NULL),
(1001, 10, 'App\\Models\\Store', 'df', 'name', 'Paws & Claws', NULL, NULL),
(1002, 10, 'App\\Models\\Store', 'df', 'slug', 'paws--claws', NULL, NULL),
(1003, 10, 'App\\Models\\Store', 'df', 'address', '909 Pet Haven, City', NULL, NULL),
(1004, 10, 'App\\Models\\Store', 'df', 'meta_title', 'Paws & Claws - Everything for Your Pets', NULL, NULL),
(1005, 10, 'App\\Models\\Store', 'df', 'meta_description', 'Get pet food, accessories, and more at Paws & Claws.', NULL, NULL),
(1006, 5, 'App\\Models\\Store', 'df', 'name', 'Bag World', NULL, NULL),
(1007, 5, 'App\\Models\\Store', 'df', 'slug', 'bag-world', NULL, NULL),
(1008, 5, 'App\\Models\\Store', 'df', 'address', '303 Fashion Street, City', NULL, NULL),
(1009, 5, 'App\\Models\\Store', 'df', 'meta_title', 'Bag World - Your Destination for Stylish Bags', NULL, NULL),
(1010, 5, 'App\\Models\\Store', 'df', 'meta_description', 'Discover a wide range of fashionable bags at Bag World.', NULL, NULL),
(1011, 191, 'App\\Models\\Product', 'df', 'name', 'Panjabi', NULL, NULL),
(1012, 191, 'App\\Models\\Product', 'df', 'description', 'Panjabi Description', NULL, NULL),
(1013, 192, 'App\\Models\\Product', 'df', 'name', 'New Product', NULL, NULL),
(1014, 192, 'App\\Models\\Product', 'df', 'description', 'New Product New Product', NULL, NULL),
(1015, 192, 'App\\Models\\Product', 'df', 'meta_title', 'New Product', NULL, NULL),
(1016, 192, 'App\\Models\\Product', 'df', 'meta_description', 'New Product New Product New Product New Product New Product New Product New Product', NULL, NULL),
(1017, 192, 'App\\Models\\Product', 'df', 'meta_keywords', 'New Product', NULL, NULL),
(1107, 1, 'App\\Models\\EmailTemplate', 'df', 'name', 'User Registration ffff', NULL, NULL),
(1108, 1, 'App\\Models\\EmailTemplate', 'df', 'subject', 'Welcome', NULL, NULL),
(1109, 1, 'App\\Models\\EmailTemplate', 'df', 'body', '<h2> Welcome @name </h2>\n<p> Thank you for joining @site_name </p>\n<ul>\n  <li>Email: @email</li>\n  <li>Phone: @phone</li>\n</ul>', NULL, NULL),
(1110, 2, 'App\\Models\\EmailTemplate', 'df', 'name', 'Password Reset', NULL, NULL),
(1111, 2, 'App\\Models\\EmailTemplate', 'df', 'subject', 'Reset Your Password for Laravel', NULL, NULL),
(1112, 2, 'App\\Models\\EmailTemplate', 'df', 'body', '<h2>Hello @name,</h2><p>We received a request to reset your password. Use this code:</p><h2>@reset_code</h2><p><i>If this wasn’t you, please ignore this email.</i></p>', NULL, NULL),
(1391, 6, 'App\\Models\\Page', 'en', 'title', 'Refund Policies', NULL, NULL),
(1392, 6, 'App\\Models\\Page', 'en', 'content', '<p>🧾 Refund &amp; Return Policy We strive to ensure a seamless shopping experience for all our customers. Please read our Refund &amp; Return Policy carefully to understand how returns and refunds work on our multivendor platform.<br><br> 🛒 General Return Policy Customers can request a return within 30 days of receiving the product. Returns are accepted only if the item is: Damaged during transit Defective or malfunctioning Incorrect or not as described The item must be unused, in its original packaging, and with all original tags/labels attached. <br><br>🔄 Vendor-Specific Return Policies Each vendor may have unique return policies based on the product type. Always check the return policy mentioned on the individual store/product page. If a vendor doesn\'t define a specific policy, the general return policy will apply.<br><br> 💸 Refund Process After the returned item is received and inspected, refunds will be processed to the original payment method within 7–10 business days. Customers may choose store credit</p>', NULL, NULL),
(1393, 6, 'App\\Models\\Page', 'en', 'meta_title', 'Refund Policies', NULL, NULL),
(1394, 6, 'App\\Models\\Page', 'en', 'meta_description', 'Refund Policies', NULL, NULL),
(1395, 6, 'App\\Models\\Page', 'en', 'meta_keywords', 'Refund Policies', NULL, NULL),
(1400, 193, 'App\\Models\\Product', 'df', 'name', 'Cow Meat', NULL, NULL),
(1401, 193, 'App\\Models\\Product', 'df', 'description', 'Meat Description', NULL, NULL),
(1402, 193, 'App\\Models\\Product', 'df', 'meta_title', 'Meat', NULL, NULL),
(1403, 193, 'App\\Models\\Product', 'df', 'meta_description', 'Meat Description', NULL, NULL),
(1404, 193, 'App\\Models\\Product', 'df', 'meta_keywords', 'meat, food', NULL, NULL),
(1710, 1, 'App\\Models\\EmailTemplate', 'en', 'name', 'User Registration', NULL, NULL),
(1711, 1, 'App\\Models\\EmailTemplate', 'en', 'subject', 'Welcome', NULL, NULL),
(2097, 205, 'App\\Models\\Product', 'en', 'meta_keywords', 'm', NULL, NULL),
(2098, 206, 'App\\Models\\Product', 'df', 'name', 'Finn Leonard', NULL, NULL),
(2099, 206, 'App\\Models\\Product', 'df', 'description', 'Possimus labore sequi aut distinctio', NULL, NULL),
(2100, 206, 'App\\Models\\Product', 'df', 'meta_title', 'Ad reprehenderit culpa quis reprehenderit elit asperiores ex consequat', NULL, NULL),
(2101, 206, 'App\\Models\\Product', 'df', 'meta_description', 'Iure quisquam ea obcaecati ex cupiditate odit culpa similique exercitationem distinctio Voluptas', NULL, NULL),
(2102, 2, 'Modules\\Subscription\\app\\Models\\Subscription', 'df', 'name', 'Trial Package', NULL, NULL),
(2111, 207, 'App\\Models\\Product', 'df', 'name', 'Demetrius Marks', NULL, NULL),
(2112, 207, 'App\\Models\\Product', 'df', 'description', 'Consectetur quidem aspernatur accusantium nisi excepteur ipsam est incidunt lorem pariatur Dolorum minima iusto omnis', NULL, NULL),
(2113, 207, 'App\\Models\\Product', 'df', 'meta_title', 'Est laboris consectetur deleniti et consectetur nesciunt modi iure molestias sunt omnis est sit quod in velit', NULL, NULL),
(2114, 207, 'App\\Models\\Product', 'df', 'meta_description', 'Officia sint sit provident id porro consectetur est rerum dolor laborum Velit irure et cupiditate nisi autem mollitia numquam', NULL, NULL),
(2115, 208, 'App\\Models\\Product', 'df', 'name', 'Matthew Robertson', NULL, NULL),
(2116, 208, 'App\\Models\\Product', 'df', 'description', 'Minima aliquip pariatur Reprehenderit perferendis perferendis est sit cupidatat reprehenderit veniam commodo quisquam aliqua Incidunt ratione magnam quod amet ipsum', NULL, NULL),
(2117, 208, 'App\\Models\\Product', 'df', 'meta_title', 'Lorem culpa suscipit natus commodo', NULL, NULL),
(2118, 208, 'App\\Models\\Product', 'df', 'meta_description', 'Velit voluptas esse provident nesciunt quia eligendi', NULL, NULL),
(2121, 1, 'App\\Models\\StoreType', 'en', 'name', 'Grocery', NULL, NULL),
(2122, 1, 'App\\Models\\StoreType', 'en', 'description', 'Grocery Info', NULL, NULL),
(2123, 1, 'App\\Models\\StoreType', 'ar', 'name', 'سيارة كهربائية', NULL, NULL),
(2124, 1, 'App\\Models\\StoreType', 'ar', 'description', 'سيارة كهربائية عالية الأداء ومدى طويل.', NULL, NULL),
(2139, 212, 'App\\Models\\Product', 'df', 'name', 'Jackfruit', NULL, NULL),
(2140, 212, 'App\\Models\\Product', 'df', 'description', 'This is the best jackfruit on earth', NULL, NULL),
(2141, 212, 'App\\Models\\Product', 'df', 'meta_title', 'Jackfruit', NULL, NULL),
(2142, 212, 'App\\Models\\Product', 'df', 'meta_description', 'This is the best jackfruit on earth', NULL, NULL),
(2143, 212, 'App\\Models\\Product', 'df', 'meta_keywords', 'fruits, healthy, fresh', NULL, NULL),
(2144, 212, 'App\\Models\\Product', 'en', 'name', 'Jackfruit E5', NULL, NULL),
(2145, 212, 'App\\Models\\Product', 'en', 'description', 'This is the best jackfruit on earth E5', NULL, NULL),
(2146, 212, 'App\\Models\\Product', 'en', 'meta_title', 'Jackfruit E5', NULL, NULL),
(2147, 212, 'App\\Models\\Product', 'en', 'meta_description', 'This is the best jackfruit on earth E5', NULL, NULL),
(2148, 212, 'App\\Models\\Product', 'ar', 'name', 'Jackfruit AR5', NULL, NULL),
(2149, 212, 'App\\Models\\Product', 'ar', 'description', 'This is the best jackfruit on earth AR5', NULL, NULL),
(2150, 212, 'App\\Models\\Product', 'ar', 'meta_title', 'Jackfruit AR5', NULL, NULL),
(2151, 212, 'App\\Models\\Product', 'ar', 'meta_description', 'This is the best jackfruit on earth AR5', NULL, NULL),
(2166, 2, 'Modules\\Subscription\\app\\Models\\Subscription', 'df', 'description', 'Free Package', NULL, NULL),
(2520, 51, 'App\\Models\\ProductAttribute', 'df', 'name', 'Weight Seller', NULL, NULL),
(2521, 51, 'App\\Models\\ProductAttribute', 'en', 'name', 'Weight Seller English', NULL, NULL),
(2527, 2, 'Modules\\Subscription\\app\\Models\\Subscription', 'ar', 'name', 'الحزمة التجريبية', NULL, NULL),
(4703, 84, 'App\\Models\\ProductCategory', 'df', 'category_name', 'adfasdf', NULL, NULL),
(4704, 84, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'adfadsf', NULL, NULL),
(4705, 84, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'adsfasdf', NULL, NULL),
(4717, 55, 'App\\Models\\ProductAttribute', 'df', 'name', 'qewrqewr', NULL, NULL),
(4839, 83, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Thane Mccullough Update', NULL, NULL),
(4840, 83, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Thane', NULL, NULL),
(4841, 83, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'ThaneThane', NULL, NULL),
(4842, 83, 'App\\Models\\ProductCategory', 'ar', 'category_name', 'Thane Mccullough Arabic', NULL, NULL),
(4843, 82, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Mango Updated', NULL, NULL),
(4844, 82, 'App\\Models\\ProductCategory', 'en', 'category_name', 'Ella Hooper', NULL, NULL),
(4875, 216, 'App\\Models\\Product', 'df', 'name', 'Meredith Hensley', NULL, NULL),
(4876, 216, 'App\\Models\\Product', 'df', 'description', 'Laborum facilis consequatur mollit ut exercitation aute', NULL, NULL),
(4877, 216, 'App\\Models\\Product', 'df', 'meta_title', 'Autem cupiditate iure in aliquid dolores debitis ipsam magni quo accusantium hic voluptatem occaecat aute veniam', NULL, NULL),
(4878, 216, 'App\\Models\\Product', 'df', 'meta_description', 'Tempor sed accusamus voluptates mollit aperiam', NULL, NULL),
(4879, 116, 'App\\Models\\Store', 'df', 'name', 'iphone store', NULL, NULL),
(4880, 117, 'App\\Models\\Store', 'df', 'name', 'Hilary Wiley', NULL, NULL),
(4881, 117, 'App\\Models\\Store', 'df', 'meta_title', 'Consectetur consequatur Voluptate blanditiis officiis duis hic adipisci aliqua Sit magna', NULL, NULL),
(4882, 117, 'App\\Models\\Store', 'df', 'meta_description', 'Id aut incididunt reprehenderit quo dolor consequat Qui sint sunt in sint magni labore anim totam pariatur Voluptatem reiciendis', NULL, NULL),
(4884, 218, 'App\\Models\\Product', 'df', 'name', 'new product test iphone', NULL, NULL),
(4886, 57, 'App\\Models\\ProductAttribute', 'df', 'name', 'Egg', NULL, NULL),
(4911, 85, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Category', NULL, NULL),
(4912, 86, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Thane Mccullough Update', NULL, NULL),
(4922, 219, 'App\\Models\\Product', 'df', 'name', 'new Product test admin', NULL, NULL),
(5300, 219, 'App\\Models\\Product', 'ar', 'name', 'مسؤول اختبار المنتج الجديد', NULL, NULL),
(5302, 58, 'App\\Models\\ProductAttribute', 'df', 'name', 'Green Chiles', NULL, NULL),
(5303, 58, 'App\\Models\\ProductAttribute', 'en', 'name', 'Green Chiles', NULL, NULL),
(5304, 58, 'App\\Models\\ProductAttribute', 'ar', 'name', 'تشيلي الخضراء', NULL, NULL),
(5307, 1, 'App\\Models\\Product', 'df', 'name', 'Fresh Apples', NULL, NULL),
(5308, 1, 'App\\Models\\Product', 'df', 'description', 'Fresh Apples are fresh and of premium quality, perfect for your daily needs. Stock up and enjoy every bite!', NULL, NULL),
(5309, 1, 'App\\Models\\Product', 'df', 'meta_title', 'Buy Fresh Apples online', NULL, NULL),
(5310, 1, 'App\\Models\\Product', 'df', 'meta_description', 'Order Fresh Apples online and get fresh groceries delivered to your door.', NULL, NULL),
(5311, 1, 'App\\Models\\Product', 'df', 'meta_keywords', 'grocery, Fresh Apples, fresh, 0', NULL, NULL),
(5312, 1, 'App\\Models\\Product', 'ar', 'name', 'التفاح الطازج', NULL, NULL),
(5441, 18, 'App\\Models\\Page', 'df', 'title', 'Shipping & Delivery Policy', NULL, NULL),
(5442, 18, 'App\\Models\\Page', 'df', 'content', '<h2>🚚 <strong>Shipping &amp; Delivery Policy</strong></h2><p></p><p>We are committed to delivering your order accurately, in good condition, and always on time.</p><h3>⏱️ Shipping Timeframes</h3><ul><li><p>Orders are usually processed and shipped within <strong>1–2 business days</strong>.</p></li><li><p>Delivery time depends on the shipping address and chosen delivery method:</p><ul><li><p><strong>Local delivery</strong>: 1–3 days</p></li><li><p><strong>National shipping</strong>: 3–7 days</p></li><li><p><strong>International</strong> (if applicable): 7–21 days</p></li><li><p></p></li></ul></li></ul><h3>💰 <strong>Shipping Charges</strong></h3><ul><li><p>Free shipping for orders above <strong>[e.g., $50]</strong></p></li><li><p>A standard shipping fee applies for smaller orders (calculated at checkout).</p></li><li><p></p></li></ul><h3>📦 <strong>Delivery Partners</strong></h3><p>We use trusted logistics partners like <strong>[Courier Names]</strong> to ensure timely and safe delivery.</p><h3>📍 Order Tracking</h3><p>Once your order is shipped, you will receive an email/SMS with a <strong>tracking number</strong> to monitor the delivery status.</p><h3>📌 <strong>Delivery Attempts</strong></h3><ul><li><p>We will attempt delivery <strong>up to 3 times</strong>.</p></li><li><p>After failed attempts, the order may be returned to the seller.</p></li><li><p></p></li></ul><h3>📦 D<strong>amaged or Missing Items</strong></h3><ul><li><p>If you receive a damaged product or find items missing, please contact us within <strong>48 hours</strong> of delivery with photos and order details.</p></li></ul>', NULL, NULL),
(5443, 18, 'App\\Models\\Page', 'df', 'meta_title', 'Test Page Meta', NULL, NULL),
(5444, 18, 'App\\Models\\Page', 'df', 'meta_description', 'Test Page Description', NULL, NULL),
(5445, 18, 'App\\Models\\Page', 'df', 'meta_keywords', 'Test Page, Description', NULL, NULL),
(5446, 18, 'App\\Models\\Page', 'en', 'title', 'Shipping & Delivery Policy', NULL, NULL),
(5447, 18, 'App\\Models\\Page', 'en', 'content', '<h2>🚚 <strong>Shipping &amp; Delivery Policy</strong></h2><p></p><p>We are committed to delivering your order accurately, in good condition, and always on time.</p><h3>⏱️ Shipping Timeframes</h3><ul><li><p>Orders are usually processed and shipped within <strong>1–2 business days</strong>.</p></li><li><p>Delivery time depends on the shipping address and chosen delivery method:</p><ul><li><p><strong>Local delivery</strong>: 1–3 days</p></li><li><p><strong>National shipping</strong>: 3–7 days</p></li><li><p><strong>International</strong> (if applicable): 7–21 days</p></li><li><p></p></li></ul></li></ul><h3>💰 <strong>Shipping Charges</strong></h3><ul><li><p>Free shipping for orders above <strong>[e.g., $50]</strong></p></li><li><p>A standard shipping fee applies for smaller orders (calculated at checkout).</p></li><li><p></p></li></ul><h3>📦 <strong>Delivery Partners</strong></h3><p>We use trusted logistics partners like <strong>[Courier Names]</strong> to ensure timely and safe delivery.</p><h3>📍 Order Tracking</h3><p>Once your order is shipped, you will receive an email/SMS with a <strong>tracking number</strong> to monitor the delivery status.</p><h3>📌 <strong>Delivery Attempts</strong></h3><ul><li><p>We will attempt delivery <strong>up to 3 times</strong>.</p></li><li><p>After failed attempts, the order may be returned to the seller.</p></li><li><p></p></li></ul><h3>📦 D<strong>amaged or Missing Items</strong></h3><ul><li><p>If you receive a damaged product or find items missing, please contact us within <strong>48 hours</strong> of delivery with photos and order details.</p></li></ul>', NULL, NULL),
(5448, 18, 'App\\Models\\Page', 'en', 'meta_title', 'Test Page English Meta', NULL, NULL),
(5449, 18, 'App\\Models\\Page', 'en', 'meta_description', 'Test Page English Descrition', NULL, NULL),
(5450, 18, 'App\\Models\\Page', 'en', 'meta_keywords', 'Test Page English', NULL, NULL),
(5473, 11, 'Modules\\Subscription\\app\\Models\\Subscription', 'df', 'name', 'New Package Test', NULL, NULL),
(6756, 1, 'App\\Models\\Slider', 'df', 'title', 'Fresh & Organic Groceries', NULL, NULL),
(6757, 1, 'App\\Models\\Slider', 'df', 'sub_title', 'Your Daily Essentials Delivered', NULL, NULL),
(6758, 1, 'App\\Models\\Slider', 'df', 'description', 'Shop farm-fresh produce and pantry staples with ease.', NULL, NULL),
(6759, 1, 'App\\Models\\Slider', 'df', 'button_text', 'Shop Now', NULL, NULL),
(6760, 2, 'App\\Models\\Slider', 'df', 'title', 'Baked Fresh Daily', NULL, NULL),
(6761, 2, 'App\\Models\\Slider', 'df', 'sub_title', 'Indulge in Warm & Tasty Treats', NULL, NULL),
(6762, 2, 'App\\Models\\Slider', 'df', 'description', 'Savor freshly baked bread, cakes, and pastries.', NULL, NULL),
(6763, 2, 'App\\Models\\Slider', 'df', 'button_text', 'Get Now', NULL, NULL),
(6764, 1, 'App\\Models\\Slider', 'en', 'title', 'Fresh & Organic Groceries', NULL, NULL),
(6765, 1, 'App\\Models\\Slider', 'en', 'sub_title', 'Your Daily Essentials Delivered', NULL, NULL),
(6766, 1, 'App\\Models\\Slider', 'en', 'description', 'Shop farm-fresh produce and pantry staples with ease.', NULL, NULL),
(6767, 1, 'App\\Models\\Slider', 'en', 'button_text', 'Shop Now', NULL, NULL),
(6768, 1, 'App\\Models\\Slider', 'ar', 'title', 'بقالة طازجة وعضوية', NULL, NULL),
(6769, 1, 'App\\Models\\Slider', 'ar', 'sub_title', 'تم توصيل احتياجاتك اليومية الأساسية', NULL, NULL),
(6770, 1, 'App\\Models\\Slider', 'ar', 'description', 'تسوق المنتجات الطازجة من المزرعة والمواد الغذائية الأساسية بسهولة.', NULL, NULL),
(6771, 1, 'App\\Models\\Slider', 'ar', 'button_text', 'تسوق الآن', NULL, NULL),
(7191, 87, 'App\\Models\\ProductCategory', 'df', 'category_name', 'new Category', NULL, NULL),
(7192, 87, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'new product test', NULL, NULL),
(7194, 1, 'App\\Models\\StoreType', 'df', 'name', 'Grocery', NULL, NULL),
(7195, 1, 'App\\Models\\StoreType', 'df', 'description', 'Grocery', NULL, NULL),
(7196, 1, 'App\\Models\\StoreType', 'df', 'additional_charge_name', 'Packaging Charge', NULL, NULL),
(7197, 1, 'App\\Models\\StoreType', 'en', 'additional_charge_name', 'Packaging Charge', NULL, NULL),
(7198, 119, 'App\\Models\\Store', 'df', 'name', 'New Store For test', NULL, NULL),
(7207, 226, 'App\\Models\\Product', 'df', 'name', 'Farm Fresh Carp Fish', NULL, NULL),
(7208, 226, 'App\\Models\\Product', 'df', 'description', '<p>test demo </p>', NULL, NULL),
(7209, 226, 'App\\Models\\Product', 'df', 'meta_title', 'test demo', NULL, NULL),
(7210, 226, 'App\\Models\\Product', 'df', 'meta_description', 'test demo', NULL, NULL),
(7212, 227, 'App\\Models\\Product', 'df', 'name', 'Camera Promax', NULL, NULL),
(7214, 2, 'App\\Models\\StoreType', 'df', 'name', 'Bakery', NULL, NULL),
(7215, 2, 'App\\Models\\StoreType', 'df', 'additional_charge_name', 'Packaging charge', NULL, NULL),
(7216, 2, 'App\\Models\\StoreType', 'en', 'name', 'Bakery', NULL, NULL),
(7217, 2, 'App\\Models\\StoreType', 'en', 'additional_charge_name', 'Packaging charge', NULL, NULL),
(7218, 3, 'App\\Models\\StoreType', 'df', 'name', 'Medicine', NULL, NULL),
(7219, 3, 'App\\Models\\StoreType', 'df', 'additional_charge_name', 'MediSafe Fee', NULL, NULL),
(7220, 3, 'App\\Models\\StoreType', 'en', 'name', 'Medicine', NULL, NULL),
(7221, 4, 'App\\Models\\StoreType', 'df', 'name', 'Makeup', NULL, NULL),
(7222, 4, 'App\\Models\\StoreType', 'df', 'additional_charge_name', 'Packaging Fee', NULL, NULL),
(7223, 5, 'App\\Models\\StoreType', 'df', 'name', 'Bags', NULL, NULL),
(7224, 5, 'App\\Models\\StoreType', 'df', 'additional_charge_name', 'Packaging Fee', NULL, NULL),
(7225, 6, 'App\\Models\\StoreType', 'df', 'name', 'Clothing', NULL, NULL),
(7226, 6, 'App\\Models\\StoreType', 'df', 'additional_charge_name', 'Packaging Fee', NULL, NULL),
(7227, 7, 'App\\Models\\StoreType', 'df', 'name', 'Furniture', NULL, NULL);
INSERT INTO `translations` (`id`, `translatable_id`, `translatable_type`, `language`, `key`, `value`, `created_at`, `updated_at`) VALUES
(7228, 7, 'App\\Models\\StoreType', 'df', 'additional_charge_name', 'Packaging Fee', NULL, NULL),
(7229, 8, 'App\\Models\\StoreType', 'df', 'name', 'Books', NULL, NULL),
(7230, 8, 'App\\Models\\StoreType', 'df', 'additional_charge_name', 'Packaging Fee', NULL, NULL),
(7231, 9, 'App\\Models\\StoreType', 'df', 'name', 'Gadgets', NULL, NULL),
(7232, 9, 'App\\Models\\StoreType', 'df', 'additional_charge_name', 'Packaging Fee', NULL, NULL),
(7233, 11, 'App\\Models\\StoreType', 'df', 'name', 'Fish', NULL, NULL),
(7234, 11, 'App\\Models\\StoreType', 'df', 'additional_charge_name', 'Packaging Fee', NULL, NULL),
(7235, 10, 'App\\Models\\StoreType', 'df', 'name', 'Animals & Pets', NULL, NULL),
(7236, 10, 'App\\Models\\StoreType', 'df', 'additional_charge_name', 'Packaging Fee', NULL, NULL),
(7237, 5, 'Modules\\Subscription\\app\\Models\\Subscription', 'df', 'name', 'Premium Package', NULL, NULL),
(7238, 4, 'Modules\\Subscription\\app\\Models\\Subscription', 'df', 'name', 'Standard Package', NULL, NULL),
(7239, 3, 'Modules\\Subscription\\app\\Models\\Subscription', 'df', 'name', 'Basic Package', NULL, NULL),
(7240, 6, 'Modules\\Subscription\\app\\Models\\Subscription', 'df', 'name', 'Enterprise Package', NULL, NULL),
(7245, 14, 'App\\Models\\Department', 'df', 'name', 'Customer Support', NULL, NULL),
(7248, 10, 'App\\Models\\Department', 'df', 'name', 'Technical Support / IT', NULL, NULL),
(7457, 3, 'App\\Models\\OrderRefundReason', 'df', 'reason', 'Item Not as Described', NULL, NULL),
(7458, 4, 'App\\Models\\OrderRefundReason', 'df', 'reason', 'Received Damaged or Defective Item', NULL, NULL),
(7459, 4, 'App\\Models\\OrderRefundReason', 'en', 'reason', 'Received Damaged or Defective Item', NULL, NULL),
(7460, 5, 'App\\Models\\OrderRefundReason', 'df', 'reason', 'Wrong Item Delivered', NULL, NULL),
(7461, 5, 'App\\Models\\OrderRefundReason', 'en', 'reason', 'Wrong Item Delivered', NULL, NULL),
(7462, 6, 'App\\Models\\OrderRefundReason', 'df', 'reason', 'Product Arrived Late', NULL, NULL),
(7463, 7, 'App\\Models\\OrderRefundReason', 'df', 'reason', 'Changed My Mind', NULL, NULL),
(7464, 7, 'App\\Models\\OrderRefundReason', 'en', 'reason', 'Changed My Mind', NULL, NULL),
(10668, 234, 'App\\Models\\Store', 'df', 'name', 'UK Fish Store', NULL, NULL),
(10713, 8, 'App\\Models\\OrderRefundReason', 'en', 'reason', 'Item Not Needed', NULL, NULL),
(10714, 8, 'App\\Models\\OrderRefundReason', 'ar', 'reason', 'العنصر غير مطلوب', NULL, NULL),
(10964, 21, 'App\\Models\\Page', 'en', 'title', '\"Amazing Store\"', NULL, NULL),
(10965, 21, 'App\\Models\\Page', 'en', 'content', '\"<h1>Privacy Policy<\\/h1><h2>Privacy &amp; Information Security Policy<\\/h2><p>Welcome to <strong>Sharpmart<\\/strong>. These Terms and Conditions (\\\"Terms\\\") govern your use of our multivendor e-commerce platform and apply to all users, including buyers, sellers, and visitors. By accessing or using our platform, you agree to comply with these Terms.<\\/p><p>Our platform provides a marketplace where independent vendors can list and sell products, and buyers can browse and purchase products. While we facilitate these transactions, we are not directly involved in the sale or fulfillment of products.<\\/p><p>Please review these Terms carefully. If you do not agree, you should discontinue use of our platform. For any questions or assistance, contact us at [Support Email].<\\/p><h2>Information We Collect<\\/h2><h3>1. Personal Information<\\/h3><ul><li><strong>Full Name:<\\/strong> Used for identification, billing, and shipping purposes.<\\/li><li><strong>Email Address:<\\/strong> Required for account creation, communications, and order confirmations.<\\/li><li><strong>Phone Number:<\\/strong> Used for account verification, order updates, and customer support.<\\/li><li><strong>Billing &amp; Shipping Address:<\\/strong> Necessary for processing payments and delivering purchased items.<\\/li><\\/ul><h3>2. Account Information<\\/h3><ul><li><strong>Username:<\\/strong> Chosen by the user for logging in and account recognition.<\\/li><li><strong>Password:<\\/strong> Securely encrypted and stored to protect user accounts.<\\/li><li><strong>Profile Details:<\\/strong> Includes avatar, preferences, saved addresses, and communication settings.<\\/li><\\/ul><h3>3. Payment Information<\\/h3><ul><li><strong>Transaction History:<\\/strong> Records of payments, purchases, refunds, and disputes.<\\/li><li><strong>Billing Information:<\\/strong> Includes payment method (credit\\/debit card, digital wallets, etc.).<\\/li><li><strong>Third-Party Payment Data:<\\/strong> When we do not store full credit card details, our payment partners securely process transactions and store necessary details.<\\/li><\\/ul><h3>4. Device &amp; Usage Data<\\/h3><ul><li><strong>IP Address:<\\/strong> Helps detect fraud, maintain security, and personalize content based on location.<\\/li><li><strong>Browser Type &amp; Operating System:<\\/strong> Used for optimizing the website experience.<\\/li><li><strong>Cookies &amp; Tracking Technologies:<\\/strong> Enable session management, user authentication, and marketing improvements.<\\/li><li><strong>Analytics Data:<\\/strong> Collected through third-party tools (e.g., Google Analytics) to analyze user behavior, website traffic, and engagement metrics.<\\/li><\\/ul><h3>5. Vendor-Specific Data<\\/h3><ul><li><strong>Business Details:<\\/strong> Such as business name, registration details, and tax identification.<\\/li><li><strong>Store Information:<\\/strong> Includes store name, logo, policies, and contact details.<\\/li><li><strong>Uploaded Content:<\\/strong> Product listings, descriptions, images, and other media required for selling on the platform.<\\/li><\\/ul><h2>Data Protection, Security &amp; Tracking Technologies<\\/h2><h3>1. Data Protection &amp; Security<\\/h3><ul><li><strong>Encryption &amp; Secure Storage:<\\/strong> All sensitive data, including passwords and payment information, is encrypted and stored securely.<\\/li><li><strong>Secure Payment Processing:<\\/strong> Transactions are handled through PCI-DSS-compliant payment gateways, ensuring financial data protection.<\\/li><li><strong>Access Control:<\\/strong> Only authorized personnel have access to sensitive data, and strict security protocols are in place.<\\/li><li><strong>Fraud Prevention:<\\/strong> We use automated security tools and monitoring systems to detect fraudulent activities.<\\/li><li><strong>Regular Security Audits:<\\/strong> We conduct periodic assessments and updates to enhance data security measures.<\\/li><\\/ul><h3>2. Cookies &amp; Tracking Technologies<\\/h3><ul><li><strong>Essential Cookies:<\\/strong> Necessary for website functionality, including login authentication and shopping cart management.<\\/li><li><strong>Performance &amp; Analytics Cookies:<\\/strong> Help us analyze user behavior, track website traffic, and improve user experience.<\\/li><li><strong>Advertising &amp; Marketing Cookies:<\\/strong> Used for personalized ads and remarketing campaigns based on browsing activity.<\\/li><li><strong>Third-Party Tracking:<\\/strong> Some cookies are placed by third-party services (e.g., Google Analytics, Facebook Pixel) to help us understand and optimize engagement.<\\/li><\\/ul>\"', NULL, NULL),
(10966, 21, 'App\\Models\\Page', 'en', 'meta_title', '\"Buy Products Online - Amazing Store\"', NULL, NULL),
(10967, 21, 'App\\Models\\Page', 'en', 'meta_description', '\"Best deals on products at Amazing Store.\"', NULL, NULL),
(10968, 21, 'App\\Models\\Page', 'en', 'meta_keywords', '\"amazing store, best deals, online products\"', NULL, NULL),
(10969, 21, 'App\\Models\\Page', 'ar', 'title', '\"\\u0627\\u0644\\u0645\\u062a\\u062c\\u0631 \\u0627\\u0644\\u0631\\u0627\\u0626\\u0639\"', NULL, NULL),
(10970, 21, 'App\\Models\\Page', 'ar', 'content', '\"\\u0645\\u0631\\u062d\\u0628\\u0627\\u064b \\u0628\\u0643\\u0645 \\u0641\\u064a \\u0645\\u062a\\u062c\\u0631\\u064a \\u0627\\u0644\\u0631\\u0627\\u0626\\u0639. \\u0646\\u0642\\u062f\\u0645 \\u0645\\u062c\\u0645\\u0648\\u0639\\u0629 \\u0645\\u062a\\u0646\\u0648\\u0639\\u0629 \\u0645\\u0646 \\u0627\\u0644\\u0645\\u0646\\u062a\\u062c\\u0627\\u062a \\u0644\\u0644\\u0627\\u062e\\u062a\\u064a\\u0627\\u0631 \\u0645\\u0646 \\u0628\\u064a\\u0646\\u0647\\u0627.\"', NULL, NULL),
(10971, 21, 'App\\Models\\Page', 'ar', 'meta_title', '\"\\u0634\\u0631\\u0627\\u0621 \\u0627\\u0644\\u0645\\u0646\\u062a\\u062c\\u0627\\u062a \\u0639\\u0628\\u0631 \\u0627\\u0644\\u0625\\u0646\\u062a\\u0631\\u0646\\u062a - \\u0627\\u0644\\u0645\\u062a\\u062c\\u0631 \\u0627\\u0644\\u0631\\u0627\\u0626\\u0639\"', NULL, NULL),
(10972, 21, 'App\\Models\\Page', 'ar', 'meta_description', '\"\\u0623\\u0641\\u0636\\u0644 \\u0627\\u0644\\u0639\\u0631\\u0648\\u0636 \\u0639\\u0644\\u0649 \\u0627\\u0644\\u0645\\u0646\\u062a\\u062c\\u0627\\u062a \\u0641\\u064a \\u0627\\u0644\\u0645\\u062a\\u062c\\u0631 \\u0627\\u0644\\u0631\\u0627\\u0626\\u0639.\"', NULL, NULL),
(10973, 21, 'App\\Models\\Page', 'ar', 'meta_keywords', '\"\\u0627\\u0644\\u0645\\u062a\\u062c\\u0631 \\u0627\\u0644\\u0631\\u0627\\u0626\\u0639\\u060c \\u0623\\u0641\\u0636\\u0644 \\u0627\\u0644\\u0639\\u0631\\u0648\\u0636\\u060c \\u0627\\u0644\\u0645\\u0646\\u062a\\u062c\\u0627\\u062a \\u0639\\u0628\\u0631 \\u0627\\u0644\\u0625\\u0646\\u062a\\u0631\\u0646\\u062a\"', NULL, NULL),
(11258, 12, 'App\\Models\\Slider', 'df', 'title', 'Fresh & Organic Groceries', NULL, NULL),
(12804, 73, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Freshwater', NULL, NULL),
(12805, 73, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Freshwater', NULL, NULL),
(12806, 73, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Freshwater', NULL, NULL),
(12807, 74, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Saltwater', NULL, NULL),
(12808, 74, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Saltwater', NULL, NULL),
(12809, 74, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Saltwater', NULL, NULL),
(12810, 75, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Aquarium Plants', NULL, NULL),
(12811, 75, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Aquarium Plants', NULL, NULL),
(12812, 75, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Aquarium Plants', NULL, NULL),
(12813, 76, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Fish Food', NULL, NULL),
(12814, 76, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Fish Food', NULL, NULL),
(12815, 76, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Fish Food', NULL, NULL),
(12816, 77, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Water Care', NULL, NULL),
(12817, 77, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Water Care', NULL, NULL),
(12818, 77, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Water Care', NULL, NULL),
(13126, 67, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Dogs', NULL, NULL),
(13127, 67, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Dogs', NULL, NULL),
(13128, 67, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Dogs', NULL, NULL),
(13135, 5, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Snacks', NULL, NULL),
(13136, 5, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Snacks', NULL, NULL),
(13137, 5, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Snacks', NULL, NULL),
(13141, 68, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Cats', NULL, NULL),
(13142, 68, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Cats', NULL, NULL),
(13143, 68, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Cats', NULL, NULL),
(13144, 69, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Pet Toys', NULL, NULL),
(13145, 69, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Pet Toys', NULL, NULL),
(13146, 69, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Pet Toys', NULL, NULL),
(13147, 70, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Grooming', NULL, NULL),
(13148, 70, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Grooming', NULL, NULL),
(13149, 70, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Grooming', NULL, NULL),
(13150, 71, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Pet Food', NULL, NULL),
(13151, 71, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Pet Food', NULL, NULL),
(13152, 71, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Pet Food', NULL, NULL),
(13153, 60, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Phones', NULL, NULL),
(13154, 60, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Phones', NULL, NULL),
(13155, 60, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Phones', NULL, NULL),
(13156, 61, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Tablets', NULL, NULL),
(13157, 61, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Tablets', NULL, NULL),
(13158, 61, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Tablets', NULL, NULL),
(13159, 62, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Headphones', NULL, NULL),
(13160, 62, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Headphones', NULL, NULL),
(13161, 62, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Headphones', NULL, NULL),
(13162, 63, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Smart Watches', NULL, NULL),
(13163, 63, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Smart Watches', NULL, NULL),
(13164, 63, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Smart Watches', NULL, NULL),
(13165, 64, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Laptops', NULL, NULL),
(13166, 64, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Laptops', NULL, NULL),
(13167, 64, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Laptops', NULL, NULL),
(13168, 65, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Cameras', NULL, NULL),
(13169, 65, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Cameras', NULL, NULL),
(13170, 65, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Cameras', NULL, NULL),
(13171, 78, 'App\\Models\\ProductCategory', 'df', 'category_name', 'TV', NULL, NULL),
(13172, 79, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Speaker', NULL, NULL),
(13173, 54, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Fiction', NULL, NULL),
(13174, 54, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Fiction', NULL, NULL),
(13175, 54, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Fiction', NULL, NULL),
(13176, 55, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Non-Fiction', NULL, NULL),
(13177, 55, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Non-Fiction', NULL, NULL),
(13178, 55, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Non-Fiction', NULL, NULL),
(13179, 56, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Sci-Fi', NULL, NULL),
(13180, 56, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Sci-Fi', NULL, NULL),
(13181, 56, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Sci-Fi', NULL, NULL),
(13182, 57, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Fantasy', NULL, NULL),
(13183, 57, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Fantasy', NULL, NULL),
(13184, 57, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Fantasy', NULL, NULL),
(13185, 58, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Biography', NULL, NULL),
(13186, 58, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Biography', NULL, NULL),
(13187, 58, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Biography', NULL, NULL),
(13192, 8, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Spices', NULL, NULL),
(13193, 8, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Spices', NULL, NULL),
(13194, 8, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Spices', NULL, NULL),
(13198, 7, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Canned', NULL, NULL),
(13199, 7, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Canned', NULL, NULL),
(13200, 7, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Canned', NULL, NULL),
(13210, 80, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Vegetables', NULL, NULL),
(13211, 80, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Vegetables', NULL, NULL),
(13212, 80, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Vegetables', NULL, NULL),
(13213, 9, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Personal Care', NULL, NULL),
(13214, 9, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Personal Care', NULL, NULL),
(13215, 9, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Personal Care', NULL, NULL),
(13216, 10, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Cleaning Supplies', NULL, NULL),
(13217, 10, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Cleaning Supplies', NULL, NULL),
(13218, 10, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Cleaning Supplies', NULL, NULL),
(13219, 12, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Bread', NULL, NULL),
(13220, 12, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Bread', NULL, NULL),
(13221, 12, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Bread', NULL, NULL),
(13222, 13, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Pastries', NULL, NULL),
(13223, 13, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Pastries', NULL, NULL),
(13224, 13, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Pastries', NULL, NULL),
(13228, 14, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Cakes', NULL, NULL),
(13229, 14, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Cakes', NULL, NULL),
(13230, 14, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Cakes', NULL, NULL),
(13231, 15, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Cookies', NULL, NULL),
(13232, 15, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Cookies', NULL, NULL),
(13233, 15, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Cookies', NULL, NULL),
(13234, 16, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Muffins', NULL, NULL),
(13235, 16, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Muffins', NULL, NULL),
(13236, 16, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Muffins', NULL, NULL),
(13237, 17, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Buns', NULL, NULL),
(13238, 17, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Buns', NULL, NULL),
(13239, 17, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Buns', NULL, NULL),
(13240, 18, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Pies', NULL, NULL),
(13241, 18, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Pies', NULL, NULL),
(13242, 18, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Pies', NULL, NULL),
(13243, 19, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Bagels', NULL, NULL),
(13244, 19, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Bagels', NULL, NULL),
(13245, 19, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Bagels', NULL, NULL),
(13246, 21, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Pain Relief', NULL, NULL),
(13247, 21, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Pain Relief', NULL, NULL),
(13248, 21, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Pain Relief', NULL, NULL),
(13249, 22, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Cold & Cough', NULL, NULL),
(13250, 22, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Cold & Cough', NULL, NULL),
(13251, 22, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Cold & Cough', NULL, NULL),
(13252, 23, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Vitamins', NULL, NULL),
(13253, 23, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Vitamins', NULL, NULL),
(13254, 23, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Vitamins', NULL, NULL),
(13255, 24, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Digestive', NULL, NULL),
(13256, 24, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Digestive', NULL, NULL),
(13257, 24, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Digestive', NULL, NULL),
(13258, 25, 'App\\Models\\ProductCategory', 'df', 'category_name', 'BP & Heart Disease', NULL, NULL),
(13259, 25, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'BP & Heart Disease', NULL, NULL),
(13260, 25, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'BP & Heart Disease', NULL, NULL),
(13261, 26, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Skin Care', NULL, NULL),
(13262, 26, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Skin Care', NULL, NULL),
(13263, 26, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Skin Care', NULL, NULL),
(13264, 27, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Eye Care', NULL, NULL),
(13265, 27, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Eye Care', NULL, NULL),
(13266, 27, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Eye Care', NULL, NULL),
(13267, 28, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Herbal', NULL, NULL),
(13268, 28, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Herbal', NULL, NULL),
(13269, 28, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Herbal', NULL, NULL),
(13270, 30, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Foundations', NULL, NULL),
(13271, 30, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Foundations', NULL, NULL),
(13272, 30, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Foundations', NULL, NULL),
(13273, 31, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Lipsticks', NULL, NULL),
(13274, 31, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Lipsticks', NULL, NULL),
(13275, 31, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Lipsticks', NULL, NULL),
(13276, 32, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Eyeshadows', NULL, NULL),
(13277, 32, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Eyeshadows', NULL, NULL),
(13278, 32, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Eyeshadows', NULL, NULL),
(13279, 33, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Mascaras', NULL, NULL),
(13280, 33, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Mascaras', NULL, NULL),
(13281, 33, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Mascaras', NULL, NULL),
(13282, 34, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Blushes', NULL, NULL),
(13283, 34, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Blushes', NULL, NULL),
(13284, 34, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Blushes', NULL, NULL),
(13285, 36, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Handbags', NULL, NULL),
(13286, 36, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Handbags', NULL, NULL),
(13287, 36, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Handbags', NULL, NULL),
(13288, 37, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Totes', NULL, NULL),
(13289, 37, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Totes', NULL, NULL),
(13290, 37, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Totes', NULL, NULL),
(13291, 38, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Backpacks', NULL, NULL),
(13292, 38, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Backpacks', NULL, NULL),
(13293, 38, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Backpacks', NULL, NULL),
(13294, 39, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Wallets', NULL, NULL),
(13295, 39, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Wallets', NULL, NULL),
(13296, 39, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Wallets', NULL, NULL),
(13303, 41, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Crossbody', NULL, NULL),
(13304, 41, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Crossbody', NULL, NULL),
(13305, 41, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Crossbody', NULL, NULL),
(13307, 89, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Beachbag', NULL, NULL),
(13314, 43, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Men', NULL, NULL),
(13315, 43, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Men', NULL, NULL),
(13316, 43, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Men', NULL, NULL),
(13317, 81, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Panjabi', NULL, NULL),
(13318, 81, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Panjabi Panjabi', NULL, NULL),
(13319, 81, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Panjabi', NULL, NULL),
(13327, 233, 'App\\Models\\Product', 'df', 'name', 'Solid T-Shirt', NULL, NULL),
(13328, 233, 'App\\Models\\Product', 'df', 'description', '<h3 style=\"text-align: left\"><strong>The standard Lorem Ipsum passage, used since the 1500s</strong></h3><p style=\"text-align: justify\">\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim </p><h3 style=\"text-align: left\"><strong>Section 1.10.32 of \"de Finibus Bonorum et Malorum\", written by Cicero in 45 BC</strong></h3><p style=\"text-align: justify\">\"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa </p><h3 style=\"text-align: left\"><strong>1914 translation by H. Rackham</strong></h3><p style=\"text-align: justify\">\"But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the</p><h3 style=\"text-align: left\"><strong>Section 1.10.33 of \"de Finibus Bonorum et Malorum\", written by Cicero in 45 BC</strong></h3>', NULL, NULL),
(13329, 233, 'App\\Models\\Product', 'df', 'meta_title', 't-shirt', NULL, NULL),
(13330, 233, 'App\\Models\\Product', 'df', 'meta_description', 'What is Lorem Ipsum?\r\nLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\r\n\r\nWhy do we use it?\r\nIt is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\r\n\r\n\r\nWhere does it come from?\r\nContrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", comes from a line in section 1.10.32.\r\n\r\nThe standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.\r\n\r\nWhere can I get some?\r\nThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn\'t anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.', NULL, NULL),
(13331, 233, 'App\\Models\\Product', 'df', 'meta_keywords', 'genzi, tshirt, cloth, men', NULL, NULL),
(13635, 237, 'App\\Models\\Product', 'df', 'name', 'Fresh Tomato', NULL, NULL),
(13636, 237, 'App\\Models\\Product', 'df', 'description', '<p><strong>Overview:</strong><br>Fresh Tomato is a vibrant, juicy, and nutrient-packed fruit (commonly used as a vegetable) that adds flavor, color, and health benefits to a wide variety of dishes. Grown under optimal conditions, our tomatoes are handpicked at peak ripeness to ensure superior taste, texture, and freshness. Whether used in salads, sauces, soups, or sandwiches, Fresh Tomato delivers a burst of natural sweetness and tanginess that enhances any meal.</p><hr><h3><strong>Key Features:</strong></h3><p>🌱 <strong>Premium Quality</strong> – Carefully selected for their rich color, firm texture, and delicious taste.<br>🍅 <strong>Naturally Juicy &amp; Flavorful</strong> – Perfect balance of sweetness and acidity for a refreshing taste.<br>🌿 <strong>Nutrient-Rich</strong> – Packed with vitamins A, C, K, potassium, and antioxidants like lycopene.<br>🚜 <strong>Farm-Fresh</strong> – Sourced from trusted local farms to ensure maximum freshness.<br>🌎 <strong>Versatile Use</strong> – Ideal for salads, sauces, grilling, roasting, snacking, and more.<br>📦 <strong>Eco-Friendly Packaging</strong> – Sustainably packed to preserve freshness and reduce environmental impact.</p><hr><h3><strong>Benefits:</strong></h3><p>✅ <strong>Supports Heart Health</strong> – Lycopene in tomatoes helps maintain cardiovascular wellness.<br>✅ <strong>Boosts Immunity</strong> – High vitamin C content strengthens the immune system.<br>✅ <strong>Promotes Skin Health</strong> – Antioxidants help protect against UV damage and aging.<br>✅ <strong>Low in Calories</strong> – A healthy, hydrating snack for weight-conscious consumers.</p><hr><h3><strong>Usage Ideas:</strong></h3><ul><li><p><strong>Fresh in salads</strong> (Caprese, Greek, or garden salads)</p></li><li><p><strong>Homemade sauces &amp; salsas</strong> (marinara, bruschetta, pico de gallo)</p></li><li><p><strong>Grilled or roasted</strong> (as a side dish or in veggie medleys)</p></li><li><p><strong>Blended in soups</strong> (tomato bisque, gazpacho)</p></li><li><p><strong>Sandwiches &amp; burgers</strong> (sliced for added juiciness)</p></li><li><p><strong>Healthy snacking</strong> (with a sprinkle of salt or hummus dip)</p></li></ul><hr><h3><strong>Storage Instructions:</strong></h3><ul><li><p><strong>Room Temperature:</strong> Keep unripe tomatoes at room temperature to ripen.</p></li><li><p><strong>Refrigerate:</strong> Store ripe tomatoes in the fridge to extend freshness (but use within a few days for best flavor).</p></li><li><p><strong>Avoid Direct Sunlight:</strong> Prevents over-ripening and texture loss.</p></li></ul><hr><p><strong>Available in:</strong></p><ul><li><p><strong>Single Units</strong> (Perfect for small households)</p></li><li><p><strong>Bulk Packs</strong> (Great for restaurants, meal preppers, and large families)</p></li></ul><p><strong>Seasonality:</strong> Year-round availability, with peak flavor in summer months.</p><hr><p><strong>Why Choose Our Fresh Tomatoes?</strong><br>We prioritize quality, sustainability, and taste, ensuring every tomato delivers farm-fresh goodness straight to your table. Whether you\'re a home cook, chef, or health enthusiast, our Fresh Tomatoes are the perfect ingredient for vibrant, delicious meals!</p><hr><p><strong>Enjoy the natural goodness of Fresh Tomato—where flavor meets nutrition!</strong> 🍅✨</p>', NULL, NULL),
(13637, 237, 'App\\Models\\Product', 'df', 'meta_title', 'Fresh tomato', NULL, NULL),
(13638, 237, 'App\\Models\\Product', 'df', 'meta_description', 'Fresh tomato', NULL, NULL),
(13639, 237, 'App\\Models\\Product', 'df', 'meta_keywords', 'tomato, vegitable, fresh, healthy', NULL, NULL),
(13640, 237, 'App\\Models\\Product', 'en', 'name', 'Fresh Tomato', NULL, NULL),
(13641, 237, 'App\\Models\\Product', 'en', 'description', '<p><strong>Overview:</strong><br>Fresh Tomato is a vibrant, juicy, and nutrient-packed fruit (commonly used as a vegetable) that adds flavor, color, and health benefits to a wide variety of dishes. Grown under optimal conditions, our tomatoes are handpicked at peak ripeness to ensure superior taste, texture, and freshness. Whether used in salads, sauces, soups, or sandwiches, Fresh Tomato delivers a burst of natural sweetness and tanginess that enhances any meal.</p><hr><h3><strong>Key Features:</strong></h3><p>🌱 <strong>Premium Quality</strong> – Carefully selected for their rich color, firm texture, and delicious taste.<br>🍅 <strong>Naturally Juicy &amp; Flavorful</strong> – Perfect balance of sweetness and acidity for a refreshing taste.<br>🌿 <strong>Nutrient-Rich</strong> – Packed with vitamins A, C, K, potassium, and antioxidants like lycopene.<br>🚜 <strong>Farm-Fresh</strong> – Sourced from trusted local farms to ensure maximum freshness.<br>🌎 <strong>Versatile Use</strong> – Ideal for salads, sauces, grilling, roasting, snacking, and more.<br>📦 <strong>Eco-Friendly Packaging</strong> – Sustainably packed to preserve freshness and reduce environmental impact.</p><hr><h3><strong>Benefits:</strong></h3><p>✅ <strong>Supports Heart Health</strong> – Lycopene in tomatoes helps maintain cardiovascular wellness.<br>✅ <strong>Boosts Immunity</strong> – High vitamin C content strengthens the immune system.<br>✅ <strong>Promotes Skin Health</strong> – Antioxidants help protect against UV damage and aging.<br>✅ <strong>Low in Calories</strong> – A healthy, hydrating snack for weight-conscious consumers.</p><hr><h3><strong>Usage Ideas:</strong></h3><ul><li><p><strong>Fresh in salads</strong> (Caprese, Greek, or garden salads)</p></li><li><p><strong>Homemade sauces &amp; salsas</strong> (marinara, bruschetta, pico de gallo)</p></li><li><p><strong>Grilled or roasted</strong> (as a side dish or in veggie medleys)</p></li><li><p><strong>Blended in soups</strong> (tomato bisque, gazpacho)</p></li><li><p><strong>Sandwiches &amp; burgers</strong> (sliced for added juiciness)</p></li><li><p><strong>Healthy snacking</strong> (with a sprinkle of salt or hummus dip)</p></li></ul><hr><h3><strong>Storage Instructions:</strong></h3><ul><li><p><strong>Room Temperature:</strong> Keep unripe tomatoes at room temperature to ripen.</p></li><li><p><strong>Refrigerate:</strong> Store ripe tomatoes in the fridge to extend freshness (but use within a few days for best flavor).</p></li><li><p><strong>Avoid Direct Sunlight:</strong> Prevents over-ripening and texture loss.</p></li></ul><hr><p><strong>Available in:</strong></p><ul><li><p><strong>Single Units</strong> (Perfect for small households)</p></li><li><p><strong>Bulk Packs</strong> (Great for restaurants, meal preppers, and large families)</p></li></ul><p><strong>Seasonality:</strong> Year-round availability, with peak flavor in summer months.</p><hr><p><strong>Why Choose Our Fresh Tomatoes?</strong><br>We prioritize quality, sustainability, and taste, ensuring every tomato delivers farm-fresh goodness straight to your table. Whether you\'re a home cook, chef, or health enthusiast, our Fresh Tomatoes are the perfect ingredient for vibrant, delicious meals!</p><hr><p><strong>Enjoy the natural goodness of Fresh Tomato—where flavor meets nutrition!</strong> 🍅✨</p>', NULL, NULL),
(13642, 237, 'App\\Models\\Product', 'en', 'meta_title', 'Fresh tomato', NULL, NULL),
(13643, 237, 'App\\Models\\Product', 'en', 'meta_description', 'Fresh tomato', NULL, NULL),
(13644, 237, 'App\\Models\\Product', 'en', 'meta_keywords', 'tomato, vegitable, fresh, healthy', NULL, NULL),
(13645, 237, 'App\\Models\\Product', 'ar', 'name', 'طماطم طازجة', NULL, NULL),
(13646, 237, 'App\\Models\\Product', 'ar', 'description', '<p><strong>وصف المنتج: طماطم طازجة</strong></p><h3><strong>نظرة عامة:</strong></h3><p>الطماطم الطازجة هي ثمار مليئة بالحيوية والعصارة والمواد المغذية (تُستخدم عادةً كخضار) تُضيف نكهةً مميزةً ولونًا جذابًا و فوائد صحية لمجموعة واسعة من الأطباق. تُزرع طماطمنا في ظروف مثالية وتُقطف يدويًا عند اكتمال نضجها لضمان مذاق فاخر وقوام ممتاز ونضارة لا مثيل لها. سواءً استُخدمت في السلطات، الصلصات، الشوربات أو السندويشات، فإن الطماطم الطازجة تمنحك مزيجًا رائعًا من الحلاوة الطبيعية والطعم المنعش الذي يثري أي وجبة.</p><hr><h3><strong>المميزات الرئيسية:</strong></h3><p>🌱 <strong>جودة فائقة</strong> – مُختارة بعناية للونها الغني، قوامها المتماسك وطعمها اللذيذ.<br>🍅 <strong>عصارية وذات نكهة طبيعية</strong> – توازن مثالي بين الحلاوة والحموضة لطعم منعش.<br>🌿 <strong>غنية بالعناصر الغذائية</strong> – تحتوي على فيتامينات أ، ج، ك، البوتاسيوم ومضادات الأكسدة مثل اللايكوبين.<br>🚜 <strong>طازجة من المزرعة</strong> – مصدرها مزارع محلية موثوقة لضمان أقصى درجات النضارة.<br>🌎 <strong>استخدامات متعددة</strong> – مثالية للسلطات، الصلصات، الشوي، التحميص، الوجبات الخفيفة والمزيد.<br>📦 <strong>عبوات صديقة للبيئة</strong> – تُعبأ بشكل مستدام للحفاظ على النضارة وتقليل التأثير البيئي.</p><hr><h3><strong>الفوائد:</strong></h3><p>✅ <strong>تدعم صحة القلب</strong> – اللايكوبين في الطماطم يساعد في الحفاظ على صحة القلب والأوعية الدموية.<br>✅ <strong>تعزز المناعة</strong> – محتواها العالي من فيتامين ج يقوي جهاز المناعة.<br>✅ <strong>تعزز صحة البشرة</strong> – مضادات الأكسدة تساعد في الحماية من أضرار الأشعة فوق البنفسجية وعلامات التقدم في السن.<br>✅ <strong>قليلة السعرات الحرارية</strong> – وجبة خفيفة صحية ومنعشة لمن يتبعون حمية غذائية.</p><hr><h3><strong>أفكار للاستخدام:</strong></h3><ul><li><p><strong>في السلطات الطازجة</strong> (سلطة كابريز، سلطة يونانية أو سلطة خضراء)</p></li><li><p><strong>في الصلصات والصلصات الطازجة</strong> (مارينارا، بروشيتا، بيكو دي جالو)</p></li><li><p><strong>مشوية أو محمصة</strong> (كطبق جانبي أو في أطباق الخضار المشوية)</p></li><li><p><strong>في الشوربات</strong> (شوربة الطماطم، غازباتشو)</p></li><li><p><strong>في السندويشات والبرغر</strong> (شرائح طازجة لإضافة عصارة ونكهة)</p></li><li><p><strong>كوجبة خفيفة صحية</strong> (مع رشة من الملح أو غمسة حمص)</p></li></ul><hr><h3><strong>تعليمات التخزين:</strong></h3><ul><li><p><strong>درجة حرارة الغرفة:</strong> احفظي الطماطم غير الناضجة في درجة حرارة الغرفة حتى تنضج.</p></li><li><p><strong>التبريد:</strong> احفظي الطماطم الناضجة في الثلاجة لإطالة فترة نضارتها (ولكن يُفضل استخدامها خلال أيام قليلة لأفضل نكهة).</p></li><li><p><strong>تجنب أشعة الشمس المباشرة:</strong> لمنع الإفراط في النضج وفقدان القوام.</p></li></ul><hr><h3><strong>متوفرة بـ:</strong></h3><ul><li><p><strong>وحدات فردية</strong> (مثالية للعائلات الصغيرة)</p></li><li><p><strong>عبوات كبيرة</strong> (مناسبة للمطاعم، تحضير الوجبات والعائلات الكبيرة)</p></li></ul><p><strong>الموسمية:</strong> متوفرة طوال العام، مع أفضل نكهة في أشهر الصيف.</p><hr><h3><strong>لماذا تختار طماطمنا الطازجة؟</strong></h3><p>نحن نحرص على الجودة، الاستدامة والطعم، لضمان وصول طماطم طازجة من المزرعة مباشرةً إلى مائدتك. سواء كنتِ ربة منزل، طاهية أو من محبي الأكل الصحي، فإن طماطمنا الطازجة هي المكون المثالي لوجبات لذيذة ومفعمة بالنضارة!</p><hr><p><strong>استمتعي بالطبيعة الطيبة للطماطم الطازجة - حيث تلتقي النكهة بالتغذية!</strong> 🍅✨</p>', NULL, NULL),
(13647, 237, 'App\\Models\\Product', 'ar', 'meta_title', 'طماطم طازجة', NULL, NULL),
(13648, 237, 'App\\Models\\Product', 'ar', 'meta_description', 'طماطم طازجة', NULL, NULL),
(13656, 11, 'App\\Models\\Menu', 'en', 'name', 'Main Menu', NULL, NULL),
(13657, 11, 'App\\Models\\Menu', 'ar', 'name', 'بيت', NULL, NULL),
(13692, 1, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Daily Needs', NULL, NULL),
(13693, 1, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Daily needs', NULL, NULL),
(13694, 1, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Daily needs', NULL, NULL),
(13695, 1, 'App\\Models\\ProductCategory', 'en', 'category_name', 'Daily Needs', NULL, NULL),
(13696, 1, 'App\\Models\\ProductCategory', 'en', 'meta_title', 'Daily Needs', NULL, NULL),
(13697, 1, 'App\\Models\\ProductCategory', 'ar', 'category_name', 'الاحتياجات اليومية', NULL, NULL),
(13698, 1, 'App\\Models\\ProductCategory', 'ar', 'meta_title', 'الاحتياجات اليومية', NULL, NULL),
(13764, 2, 'App\\Models\\Slider', 'en', 'title', 'Baked Fresh Daily', NULL, NULL),
(13765, 2, 'App\\Models\\Slider', 'en', 'sub_title', 'Indulge in Warm & Tasty Treats', NULL, NULL),
(13766, 2, 'App\\Models\\Slider', 'en', 'description', 'Savor freshly baked bread, cakes, and pastries.', NULL, NULL),
(13767, 2, 'App\\Models\\Slider', 'en', 'button_text', 'Get Now', NULL, NULL),
(13768, 2, 'App\\Models\\Slider', 'ar', 'title', 'خبز طازج يوميا', NULL, NULL),
(13769, 2, 'App\\Models\\Slider', 'ar', 'sub_title', 'استمتع بالمأكولات الدافئة واللذيذة', NULL, NULL),
(13770, 2, 'App\\Models\\Slider', 'ar', 'description', 'استمتع بالخبز الطازج والكعك والمعجنات.', NULL, NULL),
(13771, 2, 'App\\Models\\Slider', 'ar', 'button_text', 'احصل الآن', NULL, NULL),
(13836, 11, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Fresh bakery', NULL, NULL),
(13837, 11, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Fresh bakery', NULL, NULL),
(13838, 11, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Fresh bakery', NULL, NULL),
(13839, 11, 'App\\Models\\ProductCategory', 'en', 'category_name', 'Fresh bakery', NULL, NULL),
(13840, 11, 'App\\Models\\ProductCategory', 'en', 'meta_title', 'Fresh bakery', NULL, NULL),
(13841, 11, 'App\\Models\\ProductCategory', 'en', 'meta_description', 'Fresh bakery', NULL, NULL),
(13842, 11, 'App\\Models\\ProductCategory', 'ar', 'category_name', 'مخبز طازج', NULL, NULL),
(13843, 11, 'App\\Models\\ProductCategory', 'ar', 'meta_title', 'مخبز طازج', NULL, NULL),
(13844, 11, 'App\\Models\\ProductCategory', 'ar', 'meta_description', 'مخبز طازج', NULL, NULL),
(13845, 20, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Pharmacy essentials', NULL, NULL),
(13846, 20, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Pharmacy essentials', NULL, NULL),
(13847, 20, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Pharmacy essentials', NULL, NULL),
(13848, 20, 'App\\Models\\ProductCategory', 'en', 'category_name', 'Pharmacy essentials', NULL, NULL),
(13849, 20, 'App\\Models\\ProductCategory', 'en', 'meta_title', 'Pharmacy essentials', NULL, NULL),
(13850, 20, 'App\\Models\\ProductCategory', 'en', 'meta_description', 'Pharmacy essentials', NULL, NULL),
(13851, 20, 'App\\Models\\ProductCategory', 'ar', 'category_name', 'أساسيات الصيدلة', NULL, NULL),
(13852, 20, 'App\\Models\\ProductCategory', 'ar', 'meta_title', 'أساسيات الصيدلة', NULL, NULL),
(13853, 20, 'App\\Models\\ProductCategory', 'ar', 'meta_description', 'أساسيات الصيدلة', NULL, NULL),
(13854, 29, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Beauty & cosmetics', NULL, NULL),
(13855, 29, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Beauty & cosmetics', NULL, NULL),
(13856, 29, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Beauty & cosmetics', NULL, NULL),
(13857, 29, 'App\\Models\\ProductCategory', 'en', 'category_name', 'Beauty & cosmetics', NULL, NULL),
(13858, 29, 'App\\Models\\ProductCategory', 'en', 'meta_title', 'Beauty & cosmetics', NULL, NULL),
(13859, 29, 'App\\Models\\ProductCategory', 'en', 'meta_description', 'Beauty & cosmetics', NULL, NULL),
(13860, 29, 'App\\Models\\ProductCategory', 'ar', 'category_name', 'التجميل ومستحضرات التجميل', NULL, NULL),
(13861, 29, 'App\\Models\\ProductCategory', 'ar', 'meta_title', 'التجميل ومستحضرات التجميل', NULL, NULL),
(13862, 29, 'App\\Models\\ProductCategory', 'ar', 'meta_description', 'التجميل ومستحضرات التجميل', NULL, NULL),
(13863, 35, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Bag collections', NULL, NULL),
(13864, 35, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Bag collections', NULL, NULL),
(13865, 35, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Bag collections', NULL, NULL),
(13866, 35, 'App\\Models\\ProductCategory', 'en', 'category_name', 'Bag collections', NULL, NULL),
(13867, 35, 'App\\Models\\ProductCategory', 'en', 'meta_title', 'Bag collections', NULL, NULL),
(13868, 35, 'App\\Models\\ProductCategory', 'en', 'meta_description', 'Bag collections', NULL, NULL),
(13869, 35, 'App\\Models\\ProductCategory', 'ar', 'category_name', 'مجموعات الحقائب', NULL, NULL),
(13870, 35, 'App\\Models\\ProductCategory', 'ar', 'meta_title', 'مجموعات الحقائب', NULL, NULL),
(13871, 35, 'App\\Models\\ProductCategory', 'ar', 'meta_description', 'مجموعات الحقائب', NULL, NULL),
(13872, 42, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Clothing & style', NULL, NULL),
(13873, 42, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Clothing & style', NULL, NULL),
(13874, 42, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Clothing & style', NULL, NULL),
(13875, 42, 'App\\Models\\ProductCategory', 'en', 'category_name', 'Clothing & style', NULL, NULL),
(13876, 42, 'App\\Models\\ProductCategory', 'en', 'meta_title', 'Clothing & style', NULL, NULL),
(13877, 42, 'App\\Models\\ProductCategory', 'en', 'meta_description', 'Clothing & style', NULL, NULL),
(13878, 42, 'App\\Models\\ProductCategory', 'ar', 'category_name', 'الملابس والأناقة', NULL, NULL),
(13879, 42, 'App\\Models\\ProductCategory', 'ar', 'meta_title', 'الملابس والأناقة', NULL, NULL),
(13880, 42, 'App\\Models\\ProductCategory', 'ar', 'meta_description', 'الملابس والأناقة', NULL, NULL),
(13881, 45, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Furniture & decor', NULL, NULL),
(13882, 45, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Furniture & decor', NULL, NULL),
(13883, 45, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Furniture & decor', NULL, NULL),
(13884, 45, 'App\\Models\\ProductCategory', 'en', 'category_name', 'Furniture & decor', NULL, NULL),
(13885, 45, 'App\\Models\\ProductCategory', 'en', 'meta_title', 'Furniture & decor', NULL, NULL),
(13886, 45, 'App\\Models\\ProductCategory', 'en', 'meta_description', 'Furniture & decor', NULL, NULL),
(13887, 45, 'App\\Models\\ProductCategory', 'ar', 'category_name', 'الأثاث والديكور', NULL, NULL),
(13888, 45, 'App\\Models\\ProductCategory', 'ar', 'meta_title', 'الأثاث والديكور', NULL, NULL),
(13889, 45, 'App\\Models\\ProductCategory', 'ar', 'meta_description', 'الأثاث والديكور', NULL, NULL),
(13890, 53, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Book collection', NULL, NULL),
(13891, 53, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Book collection', NULL, NULL),
(13892, 53, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Book collection', NULL, NULL),
(13893, 53, 'App\\Models\\ProductCategory', 'en', 'category_name', 'Book collection', NULL, NULL),
(13894, 53, 'App\\Models\\ProductCategory', 'en', 'meta_title', 'Book collection', NULL, NULL),
(13895, 53, 'App\\Models\\ProductCategory', 'en', 'meta_description', 'Book collection', NULL, NULL),
(13896, 53, 'App\\Models\\ProductCategory', 'ar', 'category_name', 'مجموعة كتب', NULL, NULL),
(13897, 53, 'App\\Models\\ProductCategory', 'ar', 'meta_title', 'مجموعة كتب', NULL, NULL),
(13898, 53, 'App\\Models\\ProductCategory', 'ar', 'meta_description', 'مجموعة كتب', NULL, NULL),
(13899, 59, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Tech & gadgets', NULL, NULL),
(13900, 59, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Tech & gadgets', NULL, NULL),
(13901, 59, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Tech & gadgets', NULL, NULL),
(13902, 59, 'App\\Models\\ProductCategory', 'en', 'category_name', 'Tech & gadgets', NULL, NULL),
(13903, 59, 'App\\Models\\ProductCategory', 'en', 'meta_title', 'Tech & gadgets', NULL, NULL),
(13904, 59, 'App\\Models\\ProductCategory', 'en', 'meta_description', 'Tech & gadgets', NULL, NULL),
(13905, 59, 'App\\Models\\ProductCategory', 'ar', 'category_name', 'التكنولوجيا والأدوات', NULL, NULL),
(13906, 59, 'App\\Models\\ProductCategory', 'ar', 'meta_title', 'التكنولوجيا والأدوات', NULL, NULL),
(13907, 59, 'App\\Models\\ProductCategory', 'ar', 'meta_description', 'التكنولوجيا والأدوات', NULL, NULL),
(13908, 66, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Pets & animals essentials', NULL, NULL),
(13909, 66, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Pets & animals essentials', NULL, NULL),
(13910, 66, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Pets & animals essentials', NULL, NULL),
(13911, 66, 'App\\Models\\ProductCategory', 'en', 'category_name', 'Pets & animals essentials', NULL, NULL),
(13912, 66, 'App\\Models\\ProductCategory', 'en', 'meta_title', 'Pets & animals essentials', NULL, NULL),
(13913, 66, 'App\\Models\\ProductCategory', 'en', 'meta_description', 'Pets & animals essentials', NULL, NULL),
(13914, 66, 'App\\Models\\ProductCategory', 'ar', 'category_name', 'مستلزمات الحيوانات الأليفة والحيوانات', NULL, NULL),
(13915, 66, 'App\\Models\\ProductCategory', 'ar', 'meta_title', 'مستلزمات الحيوانات الأليفة والحيوانات', NULL, NULL),
(13916, 66, 'App\\Models\\ProductCategory', 'ar', 'meta_description', 'مستلزمات الحيوانات الأليفة والحيوانات', NULL, NULL),
(13955, 46, 'App\\Models\\ProductAttribute', 'df', 'name', 'Fish Color', NULL, NULL);
INSERT INTO `translations` (`id`, `translatable_id`, `translatable_type`, `language`, `key`, `value`, `created_at`, `updated_at`) VALUES
(13956, 46, 'App\\Models\\ProductAttribute', 'en', 'name', 'Fish Color', NULL, NULL),
(13957, 46, 'App\\Models\\ProductAttribute', 'ar', 'name', 'لون السمك', NULL, NULL),
(13958, 52, 'App\\Models\\ProductAttribute', 'df', 'name', 'Color', NULL, NULL),
(13959, 52, 'App\\Models\\ProductAttribute', 'en', 'name', 'Color', NULL, NULL),
(13960, 52, 'App\\Models\\ProductAttribute', 'ar', 'name', 'لون', NULL, NULL),
(13979, 14, 'App\\Models\\Department', 'en', 'name', 'Customer Support', NULL, NULL),
(13980, 14, 'App\\Models\\Department', 'ar', 'name', 'دعم العملاء', NULL, NULL),
(13985, 10, 'App\\Models\\Department', 'en', 'name', 'Technical Support / IT', NULL, NULL),
(13986, 10, 'App\\Models\\Department', 'ar', 'name', 'الدعم الفني/تكنولوجيا المعلومات', NULL, NULL),
(13989, 2, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Fruits', NULL, NULL),
(13990, 2, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Fruits', NULL, NULL),
(13991, 2, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Fruits', NULL, NULL),
(13992, 3, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Dairy', NULL, NULL),
(13993, 3, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Dairy', NULL, NULL),
(13994, 3, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Dairy', NULL, NULL),
(13995, 4, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Beverages', NULL, NULL),
(13996, 4, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Beverages', NULL, NULL),
(13997, 4, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Beverages', NULL, NULL),
(13998, 6, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Meat & Seafood', NULL, NULL),
(13999, 6, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Meat & Seafood', NULL, NULL),
(14000, 6, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Meat & Seafood', NULL, NULL),
(14001, 2, 'Modules\\Subscription\\app\\Models\\Subscription', 'en', 'name', 'Trial Package', NULL, NULL),
(14002, 2, 'Modules\\Subscription\\app\\Models\\Subscription', 'en', 'description', 'Free Package', NULL, NULL),
(14003, 2, 'Modules\\Subscription\\app\\Models\\Subscription', 'ar', 'description', 'حزمة مجانية', NULL, NULL),
(14004, 3, 'Modules\\Subscription\\app\\Models\\Subscription', 'df', 'description', 'Basic Package', NULL, NULL),
(14005, 3, 'Modules\\Subscription\\app\\Models\\Subscription', 'en', 'name', 'Basic Package', NULL, NULL),
(14006, 3, 'Modules\\Subscription\\app\\Models\\Subscription', 'en', 'description', 'Basic Package', NULL, NULL),
(14007, 3, 'Modules\\Subscription\\app\\Models\\Subscription', 'ar', 'name', 'الحزمة الأساسية', NULL, NULL),
(14008, 3, 'Modules\\Subscription\\app\\Models\\Subscription', 'ar', 'description', 'الحزمة الأساسية', NULL, NULL),
(14011, 2, 'App\\Models\\StoreType', 'ar', 'name', 'مخبز', NULL, NULL),
(14012, 3, 'App\\Models\\StoreType', 'ar', 'name', 'الدواء', NULL, NULL),
(14013, 4, 'App\\Models\\StoreType', 'ar', 'name', 'ماكياج', NULL, NULL),
(14014, 5, 'App\\Models\\StoreType', 'ar', 'name', 'أكياس', NULL, NULL),
(14015, 6, 'App\\Models\\StoreType', 'en', 'name', 'Clothing', NULL, NULL),
(14016, 6, 'App\\Models\\StoreType', 'ar', 'name', 'ملابس', NULL, NULL),
(14017, 7, 'App\\Models\\StoreType', 'en', 'name', 'Furniture', NULL, NULL),
(14018, 7, 'App\\Models\\StoreType', 'ar', 'name', 'أثاث', NULL, NULL),
(14019, 8, 'App\\Models\\StoreType', 'en', 'name', 'Books', NULL, NULL),
(14020, 8, 'App\\Models\\StoreType', 'ar', 'name', 'كتب', NULL, NULL),
(14021, 9, 'App\\Models\\StoreType', 'en', 'name', 'Gadgets', NULL, NULL),
(14022, 9, 'App\\Models\\StoreType', 'ar', 'name', 'الأدوات', NULL, NULL),
(14023, 10, 'App\\Models\\StoreType', 'en', 'name', 'Animals & Pets', NULL, NULL),
(14024, 10, 'App\\Models\\StoreType', 'ar', 'name', 'الحيوانات والأليفة', NULL, NULL),
(14025, 11, 'App\\Models\\StoreType', 'en', 'name', 'Fish', NULL, NULL),
(14026, 11, 'App\\Models\\StoreType', 'ar', 'name', 'سمكة', NULL, NULL),
(14027, 108, 'App\\Models\\Unit', 'df', 'name', 'Exabit', NULL, NULL),
(14958, 12, 'App\\Models\\Slider', 'df', 'sub_title', 'Your Daily Essentials Delivered', NULL, NULL),
(14959, 12, 'App\\Models\\Slider', 'df', 'description', 'Shop farm-fresh products', NULL, NULL),
(14960, 12, 'App\\Models\\Slider', 'df', 'button_text', 'Shop Now', NULL, NULL),
(14961, 12, 'App\\Models\\Slider', 'en', 'title', 'Fresh & Organic Groceries', NULL, NULL),
(14962, 12, 'App\\Models\\Slider', 'en', 'sub_title', 'Your Daily Essentials Delivered', NULL, NULL),
(14963, 12, 'App\\Models\\Slider', 'en', 'description', 'Shop farm-fresh products', NULL, NULL),
(14964, 12, 'App\\Models\\Slider', 'en', 'button_text', 'Shop Now', NULL, NULL),
(14965, 12, 'App\\Models\\Slider', 'ar', 'title', 'بقالة طازجة وعضوية', NULL, NULL),
(14966, 12, 'App\\Models\\Slider', 'ar', 'sub_title', 'تم توصيل احتياجاتك اليومية الأساسية', NULL, NULL),
(14967, 12, 'App\\Models\\Slider', 'ar', 'description', 'تسوق منتجات المزرعة الطازجة', NULL, NULL),
(14968, 12, 'App\\Models\\Slider', 'ar', 'button_text', 'تسوق الآن', NULL, NULL),
(14969, 14, 'App\\Models\\Slider', 'df', 'title', 'Baked Fresh', NULL, NULL),
(14970, 14, 'App\\Models\\Slider', 'df', 'sub_title', 'Warm & Tasty Treats', NULL, NULL),
(14971, 14, 'App\\Models\\Slider', 'df', 'description', 'Savor freshly baked bread, cakes, and pastries.', NULL, NULL),
(14972, 14, 'App\\Models\\Slider', 'df', 'button_text', 'Get Now', NULL, NULL),
(14980, 66, 'App\\Models\\ProductAttribute', 'df', 'name', 'Green Chiles', NULL, NULL),
(14981, 8, 'App\\Models\\BlogCategory', 'df', 'name', 'Pet Care & Wellness', NULL, NULL),
(14982, 8, 'App\\Models\\BlogCategory', 'df', 'meta_title', 'Pet Care & Wellness', NULL, NULL),
(14983, 8, 'App\\Models\\BlogCategory', 'df', 'meta_description', 'Pet Care & Wellness', NULL, NULL),
(14984, 72, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Fresh fish', NULL, NULL),
(14985, 72, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Fresh fish', NULL, NULL),
(14986, 72, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Fresh fish', NULL, NULL),
(14987, 72, 'App\\Models\\ProductCategory', 'en', 'category_name', 'Fresh fish', NULL, NULL),
(14988, 72, 'App\\Models\\ProductCategory', 'en', 'meta_title', 'Fresh fish', NULL, NULL),
(14989, 72, 'App\\Models\\ProductCategory', 'en', 'meta_description', 'Fresh fish', NULL, NULL),
(14990, 72, 'App\\Models\\ProductCategory', 'ar', 'category_name', 'أسماك طازجة', NULL, NULL),
(14991, 72, 'App\\Models\\ProductCategory', 'ar', 'meta_title', 'أسماك طازجة', NULL, NULL),
(14992, 72, 'App\\Models\\ProductCategory', 'ar', 'meta_description', 'أسماك طازجة', NULL, NULL),
(15267, 3, 'App\\Models\\VehicleType', 'df', 'name', 'Truck', NULL, NULL),
(15268, 3, 'App\\Models\\VehicleType', 'en', 'name', 'Truck', NULL, NULL),
(19034, 91, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Kellie Lopez', NULL, NULL),
(19035, 91, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Dolore eiusmod nesciunt quis ea eu consequat Ipsum neque quis minus amet', NULL, NULL),
(19036, 91, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Do rem exercitationem in libero aliqua Odit nesciunt consequatur Ex nisi eveniet quo amet eveniet sit aliqua', NULL, NULL),
(19037, 92, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Hannah Adams', NULL, NULL),
(19038, 92, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Error fuga Doloremque pariatur Sed est pariatur Excepteur hic ratione porro quo voluptate deleniti dolore do sed ea ratione', NULL, NULL),
(19039, 92, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Accusamus quod deserunt qui eu non saepe lorem perferendis eveniet earum dolore alias sit maxime aliqua Quibusdam duis', NULL, NULL),
(19040, 93, 'App\\Models\\ProductCategory', 'df', 'category_name', 'April Robles', NULL, NULL),
(19041, 93, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Id necessitatibus ut qui ut esse pariatur Anim occaecat', NULL, NULL),
(19042, 93, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Facilis officia ea dignissimos nulla ab est maiores lorem', NULL, NULL),
(19060, 100, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Doloribus esse qui voluptatibus delectus quasi laborum quidem cum temporibus obcaecati numquam quisquam iste dolor consequatur', NULL, NULL),
(19061, 100, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Laboris eveniet do eaque quod nulla aut nulla voluptate quis reprehenderit quis veritatis', NULL, NULL),
(19062, 101, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Berk Mendoza', NULL, NULL),
(19063, 101, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Dolorem recusandae Aut debitis tempore ducimus odit totam beatae eaque minus accusamus fuga Quia repudiandae dolor tempor', NULL, NULL),
(19064, 101, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Vel molestiae do modi velit possimus id in est ea culpa nemo est libero ipsum culpa nisi', NULL, NULL),
(19065, 102, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Kirby William', NULL, NULL),
(19066, 102, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Nemo ipsa sapiente expedita debitis ut in eum sed illo dolores magna dolore similique minim vero porro voluptatum', NULL, NULL),
(19067, 102, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Et omnis Nam eveniet beatae aliquip labore et dolores ab ut Nam magnam aliquam excepturi eos consectetur vitae', NULL, NULL),
(19068, 103, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Rhonda Ballard', NULL, NULL),
(19069, 103, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Consequuntur expedita odio reiciendis sint quo', NULL, NULL),
(19070, 103, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Reprehenderit duis ut veniam aliquid incidunt maxime amet dolores non voluptatem Consequat Duis tempor non voluptatum doloremque', NULL, NULL),
(19074, 23, 'App\\Models\\Page', 'df', 'content', '{\"login_register_section\":{\"register_title\":\"Create seller account.\",\"register_subtitle\":\"Enter your personal data to create your account\",\"login_title\":\"Login In\",\"login_subtitle\":\"Login in now\",\"agree_button_title\":null,\"background_image\":1205,\"background_image_url\":null},\"on_board_section\":{\"title\":\"Why Start Selling on Quick Ecommerce?\",\"subtitle\":\"The first Unified Go-to-market Platform, Disrobed has all the tools you need to effortlessly run your sales organization\",\"steps\":[{\"title\":\"Get Started\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1209},{\"title\":\"Build Your Store\",\"subtitle\":\"Customize your storefront, showcase your products, and attract customers.\",\"image\":1210},{\"title\":\"Add Your Products\",\"subtitle\":\"List, manage, and optimize your inventory with ease.\",\"image\":1211},{\"title\":\"Start Selling\",\"subtitle\":\"Connect with buyers, fulfill orders, and grow your sales.\",\"image\":1212},{\"title\":\"Earn & Grow\",\"subtitle\":\"Boost your revenue and unlock new business opportunities.\",\"image\":1213},{\"title\":\"Scale Your Business\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1214}]},\"video_section\":{\"section_title\":\"What Customers are saying\",\"section_subtitle\":\"I\'ve never come across a platform that makes onboarding, scaling, and customization so effortless\\u2014seamlessly adapting to your workflow, team, clients, and evolving needs.\",\"video_url\":\"https:\\/\\/www.youtube.com\\/watch?v=otej7WLdPh0\"},\"join_benefits_section\":{\"title\":\"Why Sell on Quick Ecommerce?\",\"subtitle\":\"Join thousands of successful sellers and grow your business with Quick Ecommerce powerful e-commerce platform.\",\"steps\":[{\"title\":\"Reach Millions of Customers\",\"subtitle\":\"Expand your business by connecting with a vast audience actively looking for products like yours.\",\"image\":1215},{\"title\":\"Hassle-Free Registration\",\"subtitle\":\"Sign up effortlessly and start selling without any hidden fees or long approval processes.\",\"image\":1216},{\"title\":\"Personalized Storefront\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1217},{\"title\":\"Product Management\",\"subtitle\":\"Easily add, update, and manage your inventory with our intuitive seller dashboard.\",\"image\":1218},{\"title\":\"Fast & Reliable Shipping\",\"subtitle\":\"Ensure smooth deliveries with SharpMart\\u2019s trusted logistics partners.\",\"image\":1219},{\"title\":\"Secure & Timely Payments\",\"subtitle\":\"Get paid directly to your bank account with a transparent and reliable payment system.\",\"image\":1220},{\"title\":\"Smart Marketing Tools\",\"subtitle\":\"Boost your sales with advertising, promotions, and data-driven marketing strategies.\",\"image\":1221},{\"title\":\"Dedicated Seller Support\",\"subtitle\":\"Get expert guidance, training resources, and 24\\/7 assistance for your business.\",\"image\":1222}]},\"faq_section\":{\"title\":\"Frequently Ask Questions\",\"subtitle\":\"Key information and answers regarding our services and policies.\",\"steps\":[{\"question\":\"How is a project delivered upon completion?\",\"answer\":\"The final delivery of a project follows a structured process to ensure quality, completeness, and client satisfaction. First, the project team conducts a thorough review and testing phase to verify that all components meet the required standards, ensuring\"},{\"question\":\"What is the payment process? Do you require upfront payment?\",\"answer\":\"Customize your storefront, showcase your products, and attract customers.\"},{\"question\":\"How is the final handover of a project carried out?\",\"answer\":\"List, manage, and optimize your inventory with ease.\"},{\"question\":\"How should the budget be divided among project categories?\",\"answer\":\"Connect with buyers, fulfill orders, and grow your sales.\"},{\"question\":\"Insights into project customization and monetization.\",\"answer\":\"Boost your revenue and unlock new business opportunities.\"}]},\"contact_section\":{\"title\":\"Need help? Our experts are here for you.\",\"subtitle\":\"Our experts are here to assist with any questions about our products, services, or more. Feel free to ask\\u2014we\'re ready to help! Let us make things easier for you.\",\"agree_button_title\":\"I agree to the terms and conditions.\",\"image\":1223,\"image_url\":null}}', NULL, NULL),
(19075, 23, 'App\\Models\\Page', 'en', 'content', '{\"login_register_section\":{\"register_title\":\"Create seller account.\",\"register_subtitle\":\"Enter your personal data to create your account\",\"login_title\":\"Login In\",\"login_subtitle\":\"Login in now\",\"agree_button_title\":null,\"background_image\":1205,\"background_image_url\":null},\"on_board_section\":{\"title\":\"Why Start Selling on Quick Ecommerce?\",\"subtitle\":\"The first Unified Go-to-market Platform, Disrobed has all the tools you need to effortlessly run your sales organization\",\"steps\":[{\"title\":\"Get Started\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1209},{\"title\":\"Build Your Store\",\"subtitle\":\"Customize your storefront, showcase your products, and attract customers.\",\"image\":1210},{\"title\":\"Add Your Products\",\"subtitle\":\"List, manage, and optimize your inventory with ease.\",\"image\":1211},{\"title\":\"Start Selling\",\"subtitle\":\"Connect with buyers, fulfill orders, and grow your sales.\",\"image\":1212},{\"title\":\"Earn & Grow\",\"subtitle\":\"Boost your revenue and unlock new business opportunities.\",\"image\":1213},{\"title\":\"Scale Your Business\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1214}]},\"video_section\":{\"section_title\":\"What Customers are saying\",\"section_subtitle\":\"I\'ve never come across a platform that makes onboarding, scaling, and customization so effortless\\u2014seamlessly adapting to your workflow, team, clients, and evolving needs.\",\"video_url\":\"https:\\/\\/www.youtube.com\\/watch?v=otej7WLdPh0\"},\"join_benefits_section\":{\"title\":\"Why Sell on Quick Ecommerce?\",\"subtitle\":\"Join thousands of successful sellers and grow your business with Quick Ecommerce powerful e-commerce platform.\",\"steps\":[{\"title\":\"Reach Millions of Customers\",\"subtitle\":\"Expand your business by connecting with a vast audience actively looking for products like yours.\",\"image\":1215},{\"title\":\"Hassle-Free Registration\",\"subtitle\":\"Sign up effortlessly and start selling without any hidden fees or long approval processes.\",\"image\":1216},{\"title\":\"Personalized Storefront\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1217},{\"title\":\"Product Management\",\"subtitle\":\"Easily add, update, and manage your inventory with our intuitive seller dashboard.\",\"image\":1218},{\"title\":\"Fast & Reliable Shipping\",\"subtitle\":\"Ensure smooth deliveries with SharpMart\\u2019s trusted logistics partners.\",\"image\":1219},{\"title\":\"Secure & Timely Payments\",\"subtitle\":\"Get paid directly to your bank account with a transparent and reliable payment system.\",\"image\":1220},{\"title\":\"Smart Marketing Tools\",\"subtitle\":\"Boost your sales with advertising, promotions, and data-driven marketing strategies.\",\"image\":1221},{\"title\":\"Dedicated Seller Support\",\"subtitle\":\"Get expert guidance, training resources, and 24\\/7 assistance for your business.\",\"image\":1222}]},\"faq_section\":{\"title\":\"Frequently Ask Questions\",\"subtitle\":\"Key information and answers regarding our services and policies.\",\"steps\":[{\"question\":\"How is a project delivered upon completion?\",\"answer\":\"The final delivery of a project follows a structured process to ensure quality, completeness, and client satisfaction. First, the project team conducts a thorough review and testing phase to verify that all components meet the required standards, ensuring\"},{\"question\":\"What is the payment process? Do you require upfront payment?\",\"answer\":\"Customize your storefront, showcase your products, and attract customers.\"},{\"question\":\"How is the final handover of a project carried out?\",\"answer\":\"List, manage, and optimize your inventory with ease.\"},{\"question\":\"How should the budget be divided among project categories?\",\"answer\":\"Connect with buyers, fulfill orders, and grow your sales.\"},{\"question\":\"Insights into project customization and monetization.\",\"answer\":\"Boost your revenue and unlock new business opportunities.\"}]},\"contact_section\":{\"title\":\"Need help? Our experts are here for you.\",\"subtitle\":\"Our experts are here to assist with any questions about our products, services, or more. Feel free to ask\\u2014we\'re ready to help! Let us make things easier for you.\",\"agree_button_title\":\"I agree to the terms and conditions.\",\"image\":1223,\"image_url\":null}}', NULL, NULL),
(19077, 23, 'App\\Models\\Page', 'ar', 'content', '{\"login_register_section\":{\"register_title\":\"\\u0625\\u0646\\u0634\\u0627\\u0621 \\u062d\\u0633\\u0627\\u0628 \\u0627\\u0644\\u0628\\u0627\\u0626\\u0639.\",\"register_subtitle\":\"\\u0623\\u062f\\u062e\\u0644 \\u0628\\u064a\\u0627\\u0646\\u0627\\u062a\\u0643 \\u0627\\u0644\\u0634\\u062e\\u0635\\u064a\\u0629 \\u0644\\u0625\\u0646\\u0634\\u0627\\u0621 \\u062d\\u0633\\u0627\\u0628\\u0643\",\"login_title\":\"\\u062a\\u0633\\u062c\\u064a\\u0644 \\u0627\\u0644\\u062f\\u062e\\u0648\\u0644\",\"login_subtitle\":\"\\u062a\\u0633\\u062c\\u064a\\u0644 \\u0627\\u0644\\u062f\\u062e\\u0648\\u0644 \\u0627\\u0644\\u0622\\u0646\",\"agree_button_title\":null,\"background_image\":1205,\"background_image_url\":null},\"on_board_section\":{\"title\":\"\\u0644\\u0645\\u0627\\u0630\\u0627 \\u062a\\u0628\\u062f\\u0623 \\u0627\\u0644\\u0628\\u064a\\u0639 \\u0639\\u0644\\u0649 \\u0628\\u0631\\u0627\\u0641\\u0648 \\u0645\\u0627\\u0631\\u062a\\u061f\",\"subtitle\":\"\\u0623\\u0648\\u0644 \\u0645\\u0646\\u0635\\u0629 \\u0645\\u0648\\u062d\\u062f\\u0629 \\u0644\\u0637\\u0631\\u062d \\u0627\\u0644\\u0645\\u0646\\u062a\\u062c\\u0627\\u062a \\u0641\\u064a \\u0627\\u0644\\u0633\\u0648\\u0642\\u060c Disrobed \\u062a\\u062d\\u062a\\u0648\\u064a \\u0639\\u0644\\u0649 \\u062c\\u0645\\u064a\\u0639 \\u0627\\u0644\\u0623\\u062f\\u0648\\u0627\\u062a \\u0627\\u0644\\u062a\\u064a \\u062a\\u062d\\u062a\\u0627\\u062c\\u0647\\u0627 \\u0644\\u0625\\u062f\\u0627\\u0631\\u0629 \\u0645\\u0624\\u0633\\u0633\\u062a\\u0643 \\u0627\\u0644\\u0645\\u0628\\u064a\\u0639\\u0627\\u062a \\u0628\\u0633\\u0647\\u0648\\u0644\\u0629\",\"steps\":[{\"title\":\"\\u0627\\u0644\\u0628\\u062f\\u0621\",\"subtitle\":\"\\u0633\\u062c\\u0644 \\u0645\\u062c\\u0627\\u0646\\u064b\\u0627 \\u0648\\u0627\\u0628\\u062f\\u0623 \\u0631\\u062d\\u0644\\u062a\\u0643 \\u0643\\u0628\\u0627\\u0626\\u0639 \\u0646\\u0627\\u062c\\u062d.\",\"image\":1209},{\"title\":\"\\u0642\\u0645 \\u0628\\u0628\\u0646\\u0627\\u0621 \\u0645\\u062a\\u062c\\u0631\\u0643\",\"subtitle\":\"\\u0642\\u0645 \\u0628\\u062a\\u062e\\u0635\\u064a\\u0635 \\u0648\\u0627\\u062c\\u0647\\u0629 \\u0645\\u062a\\u062c\\u0631\\u0643\\u060c \\u0648\\u0639\\u0631\\u0636 \\u0645\\u0646\\u062a\\u062c\\u0627\\u062a\\u0643\\u060c \\u0648\\u062c\\u0630\\u0628 \\u0627\\u0644\\u0639\\u0645\\u0644\\u0627\\u0621.\",\"image\":1210},{\"title\":\"\\u0623\\u0636\\u0641 \\u0645\\u0646\\u062a\\u062c\\u0627\\u062a\\u0643\",\"subtitle\":\"\\u0642\\u0645 \\u0628\\u0625\\u062f\\u0631\\u0627\\u062c \\u0645\\u062e\\u0632\\u0648\\u0646\\u0643 \\u0648\\u0625\\u062f\\u0627\\u0631\\u062a\\u0647 \\u0648\\u062a\\u062d\\u0633\\u064a\\u0646\\u0647 \\u0628\\u0643\\u0644 \\u0633\\u0647\\u0648\\u0644\\u0629.\",\"image\":1211},{\"title\":\"\\u0627\\u0628\\u062f\\u0623 \\u0627\\u0644\\u0628\\u064a\\u0639\",\"subtitle\":\"\\u062a\\u0648\\u0627\\u0635\\u0644 \\u0645\\u0639 \\u0627\\u0644\\u0645\\u0634\\u062a\\u0631\\u064a\\u0646\\u060c \\u0648\\u0642\\u0645 \\u0628\\u062a\\u0646\\u0641\\u064a\\u0630 \\u0627\\u0644\\u0637\\u0644\\u0628\\u0627\\u062a\\u060c \\u0648\\u0632\\u062f \\u0645\\u0628\\u064a\\u0639\\u0627\\u062a\\u0643.\",\"image\":1212},{\"title\":\"\\u0627\\u0643\\u0633\\u0628 \\u0648\\u0646\\u0645\\u0648\",\"subtitle\":\"\\u0639\\u0632\\u0632 \\u0625\\u064a\\u0631\\u0627\\u062f\\u0627\\u062a\\u0643 \\u0648\\u0627\\u0643\\u062a\\u0634\\u0641 \\u0641\\u0631\\u0635 \\u0639\\u0645\\u0644 \\u062c\\u062f\\u064a\\u062f\\u0629.\",\"image\":1213},{\"title\":\"\\u0642\\u0645 \\u0628\\u062a\\u0648\\u0633\\u064a\\u0639 \\u0646\\u0637\\u0627\\u0642 \\u0639\\u0645\\u0644\\u0643\",\"subtitle\":\"\\u0633\\u062c\\u0644 \\u0645\\u062c\\u0627\\u0646\\u064b\\u0627 \\u0648\\u0627\\u0628\\u062f\\u0623 \\u0631\\u062d\\u0644\\u062a\\u0643 \\u0643\\u0628\\u0627\\u0626\\u0639 \\u0646\\u0627\\u062c\\u062d.\",\"image\":1214}]},\"video_section\":{\"section_title\":null,\"section_subtitle\":null,\"video_url\":\"https:\\/\\/www.youtube.com\\/watch?v=otej7WLdPh0\"},\"join_benefits_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Reach Millions of Customers\",\"subtitle\":\"Expand your business by connecting with a vast audience actively looking for products like yours.\",\"image\":1215},{\"title\":\"Hassle-Free Registration\",\"subtitle\":\"Sign up effortlessly and start selling without any hidden fees or long approval processes.\",\"image\":1216},{\"title\":\"Personalized Storefront\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1217},{\"title\":\"Product Management\",\"subtitle\":\"Easily add, update, and manage your inventory with our intuitive seller dashboard.\",\"image\":1218},{\"title\":\"Fast & Reliable Shipping\",\"subtitle\":\"Ensure smooth deliveries with SharpMart\\u2019s trusted logistics partners.\",\"image\":1219},{\"title\":\"Secure & Timely Payments\",\"subtitle\":\"Get paid directly to your bank account with a transparent and reliable payment system.\",\"image\":1220},{\"title\":\"Smart Marketing Tools\",\"subtitle\":\"Boost your sales with advertising, promotions, and data-driven marketing strategies.\",\"image\":1221},{\"title\":\"Dedicated Seller Support\",\"subtitle\":\"Get expert guidance, training resources, and 24\\/7 assistance for your business.\",\"image\":1222}]},\"faq_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"question\":\"\\u0627\\u0644\\u0628\\u062f\\u0621\",\"answer\":\"Sign up for free and begin your journey as a successful seller.\"},{\"question\":\"\\u0642\\u0645 \\u0628\\u0628\\u0646\\u0627\\u0621 \\u0645\\u062a\\u062c\\u0631\\u0643\",\"answer\":\"\\u0642\\u0645 \\u0628\\u062a\\u062e\\u0635\\u064a\\u0635 \\u0648\\u0627\\u062c\\u0647\\u0629 \\u0645\\u062a\\u062c\\u0631\\u0643\\u060c \\u0648\\u0639\\u0631\\u0636 \\u0645\\u0646\\u062a\\u062c\\u0627\\u062a\\u0643\\u060c \\u0648\\u062c\\u0630\\u0628 \\u0627\\u0644\\u0639\\u0645\\u0644\\u0627\\u0621.\"},{\"question\":\"\\u0623\\u0636\\u0641 \\u0645\\u0646\\u062a\\u062c\\u0627\\u062a\\u0643\",\"answer\":\"\\u0642\\u0645 \\u0628\\u0625\\u062f\\u0631\\u0627\\u062c \\u0645\\u062e\\u0632\\u0648\\u0646\\u0643 \\u0648\\u0625\\u062f\\u0627\\u0631\\u062a\\u0647 \\u0648\\u062a\\u062d\\u0633\\u064a\\u0646\\u0647 \\u0628\\u0643\\u0644 \\u0633\\u0647\\u0648\\u0644\\u0629.\"},{\"question\":\"\\u0627\\u0628\\u062f\\u0623 \\u0627\\u0644\\u0628\\u064a\\u0639\",\"answer\":\"\\u062a\\u0648\\u0627\\u0635\\u0644 \\u0645\\u0639 \\u0627\\u0644\\u0645\\u0634\\u062a\\u0631\\u064a\\u0646\\u060c \\u0648\\u0642\\u0645 \\u0628\\u062a\\u0646\\u0641\\u064a\\u0630 \\u0627\\u0644\\u0637\\u0644\\u0628\\u0627\\u062a\\u060c \\u0648\\u0632\\u062f \\u0645\\u0628\\u064a\\u0639\\u0627\\u062a\\u0643.\"},{\"question\":\"\\u0627\\u0643\\u0633\\u0628 \\u0648\\u0646\\u0645\\u0648\",\"answer\":\"\\u0639\\u0632\\u0632 \\u0625\\u064a\\u0631\\u0627\\u062f\\u0627\\u062a\\u0643 \\u0648\\u0627\\u0643\\u062a\\u0634\\u0641 \\u0641\\u0631\\u0635 \\u0639\\u0645\\u0644 \\u062c\\u062f\\u064a\\u062f\\u0629.\"}]},\"contact_section\":{\"title\":\"\\u0639\\u0632\\u0632 \\u0625\\u064a\\u0631\\u0627\\u062f\\u0627\\u062a\\u0643 \\u0648\\u0627\\u0643\\u062a\\u0634\\u0641 \\u0641\\u0631\\u0635 \\u0639\\u0645\\u0644 \\u062c\\u062f\\u064a\\u062f\\u0629.\",\"subtitle\":\"\\u062e\\u0628\\u0631\\u0627\\u0624\\u0646\\u0627 \\u0647\\u0646\\u0627 \\u0644\\u0645\\u0633\\u0627\\u0639\\u062f\\u062a\\u0643\\u0645 \\u0641\\u064a \\u0623\\u064a \\u0627\\u0633\\u062a\\u0641\\u0633\\u0627\\u0631 \\u062d\\u0648\\u0644 \\u0645\\u0646\\u062a\\u062c\\u0627\\u062a\\u0646\\u0627 \\u0623\\u0648 \\u062e\\u062f\\u0645\\u0627\\u062a\\u0646\\u0627 \\u0623\\u0648 \\u063a\\u064a\\u0631\\u0647\\u0627. \\u0644\\u0627 \\u062a\\u062a\\u0631\\u062f\\u062f\\u0648\\u0627 \\u0641\\u064a \\u0627\\u0644\\u0633\\u0624\\u0627\\u0644\\u060c \\u0641\\u0646\\u062d\\u0646 \\u0639\\u0644\\u0649 \\u0623\\u062a\\u0645 \\u0627\\u0644\\u0627\\u0633\\u062a\\u0639\\u062f\\u0627\\u062f \\u0644\\u0645\\u0633\\u0627\\u0639\\u062f\\u062a\\u0643\\u0645! \\u062f\\u0639\\u0646\\u0627 \\u0646\\u0633\\u0647\\u0644 \\u0639\\u0644\\u064a\\u0643\\u0645 \\u0627\\u0644\\u0623\\u0645\\u0648\\u0631.\",\"agree_button_title\":\"\\u0623\\u0648\\u0627\\u0641\\u0642 \\u0639\\u0644\\u0649 \\u0627\\u0644\\u0634\\u0631\\u0648\\u0637 \\u0648\\u0627\\u0644\\u0623\\u062d\\u0643\\u0627\\u0645.\",\"image\":1223,\"image_url\":null}}', NULL, NULL),
(19078, 24, 'App\\Models\\Page', 'df', 'content', '{\"contact_form_section\":{\"title\":\"Quick Ecommerce\",\"subtitle\":\"Feel free to connect with our team and turn your ideas into reality. Our dedicated customer support team is available 24\\/7 to assist you\"},\"contact_details_section\":{\"address\":\"545 Mavis Island, IL 99191\",\"phone\":\"113434134\",\"email\":\"quick_ecommerce_contact@gmail.com\",\"website\":\"#\",\"image\":1302,\"image_url\":null,\"social\":[{\"url\":\"https:\\/\\/www.facebook.com\",\"icon\":\"Facebook\"},{\"url\":\"https:\\/\\/www.instagram.com\",\"icon\":\"Instagram\"},{\"url\":\"https:\\/\\/www.linkedin.com\",\"icon\":\"Linkedin\"}]},\"map_section\":{\"coordinates\":{\"lat\":23.8103,\"lng\":90.4125}}}', NULL, NULL),
(19079, 24, 'App\\Models\\Page', 'en', 'content', '{\"contact_form_section\":{\"title\":\"Quick Ecommerce\",\"subtitle\":\"Feel free to connect with our team and turn your ideas into reality. Our dedicated customer support team is available 24\\/7 to assist you\"},\"contact_details_section\":{\"address\":\"545 Mavis Island, IL 99191\",\"phone\":\"113434134\",\"email\":\"quick_ecommerce_contact@gmail.com\",\"website\":\"#\",\"image\":1302,\"image_url\":null,\"social\":[{\"url\":\"https:\\/\\/www.facebook.com\",\"icon\":\"Facebook\"},{\"url\":\"https:\\/\\/www.instagram.com\",\"icon\":\"Instagram\"},{\"url\":\"https:\\/\\/www.linkedin.com\",\"icon\":\"Linkedin\"}]},\"map_section\":{\"coordinates\":{\"lat\":23.8103,\"lng\":90.4125}}}', NULL, NULL),
(19081, 24, 'App\\Models\\Page', 'ar', 'content', '{\"contact_form_section\":{\"title\":null,\"subtitle\":null},\"contact_details_section\":{\"address\":\"545 Mavis Island, IL 99191\",\"phone\":\"113434134\",\"email\":\"quick_ecommerce_contact@gmail.com\",\"website\":\"#\",\"image\":1302,\"image_url\":null,\"social\":[{\"url\":\"https:\\/\\/www.facebook.com\",\"icon\":\"Facebook\"},{\"url\":\"https:\\/\\/www.instagram.com\",\"icon\":\"Instagram\"},{\"url\":\"https:\\/\\/www.linkedin.com\",\"icon\":\"Linkedin\"}]},\"map_section\":{\"coordinates\":{\"lat\":23.8103,\"lng\":90.4125}}}', NULL, NULL),
(19082, 25, 'App\\Models\\Page', 'df', 'content', '{\"about_section\":{\"title\":\"About Quick Ecommerce\",\"subtitle\":\"Where Innovation Meets Seamless Online Shopping\",\"description\":\"At Quick Ecommerce, we redefine eCommerce with a seamless, secure, and user-friendly shopping experience. As a premier online marketplace, we connect buyers and sellers through cutting-edge technology, ensuring effortless transactions and customer satisfaction.\",\"image\":1302,\"image_url\":null},\"story_section\":{\"title\":\"Our Story\",\"subtitle\":\"From a Bold Vision to a Trusted Marketplace: How Quick Ecommerce Was Built to Transform the Future of eCommerce\",\"steps\":[{\"title\":\"Our Vision and Beginning\",\"subtitle\":\"Transforming the eCommerce Landscape with a Vision to Connect Buyers and Sellers Seamlessly\",\"image\":1111},{\"title\":\"Overcoming Challenges\",\"subtitle\":\"Navigating Obstacles with Innovation to Build a Reliable and Secure Marketplace\",\"image\":1111},{\"title\":\"Our Future Vision\",\"subtitle\":\"Continuing to Innovate and Grow, Building a Sustainable eCommerce Ecosystem for the Future\",\"image\":1111}]},\"mission_and_vision_section\":{\"title\":\"Our Mission & Vision\",\"subtitle\":\"At Quick Ecommerce, we are committed to revolutionizing eCommerce by creating a seamless, secure, and customer-centric marketplace. Our mission is to empower businesses with the tools they need to succeed while providing shoppers.\",\"steps\":[{\"title\":\"Our Mission\",\"subtitle\":null,\"description\":\"Make online shopping easy, reliable, and enjoyable for customers. Enable sellers to grow by offering powerful tools and support. Deliver competitive prices, quality products, and exceptional service. Foster a trusted marketplace built on transparency and\",\"image\":1115},{\"title\":\"Our vision\",\"subtitle\":null,\"description\":\"Revolutionize digital commerce by integrating cutting-edge technology. Expand globally, connecting millions of buyers and sellers worldwide. Create a thriving community where businesses succeed and customers shop with confidence. Lead with innovation, con\",\"image\":1112}]},\"testimonial_and_success_section\":{\"title\":\"Testimonials & Success Stories\",\"subtitle\":\"From a Bold Vision to a Trusted Marketplace: How Quick Ecommerce Was Built to Transform the Future of eCommerce\",\"steps\":[{\"title\":\"Bill Gates\",\"subtitle\":\"CEO\",\"description\":\"I highly recommend them to anyone seeking professional web design services!\",\"image\":1300},{\"title\":\"John Anderson\",\"subtitle\":\"CTO\",\"description\":\"Their attention to detail and creative design approach transformed our website into a visually stunning and highly functional platform.\",\"image\":1300},{\"title\":\"Bill Gates\",\"subtitle\":\"CEO\",\"description\":\"I highly recommend them to anyone seeking professional web design services!I highly recommend them to anyone seeking professional web design services!I highly recommend them to anyone seeking professional web design services!I highly recommend them to any\",\"image\":1300},{\"title\":\"John Anderson\",\"subtitle\":\"CEO\",\"description\":\"I highly recommend them to anyone seeking professional web design services!I highly recommend them to anyone seeking professional web design services!I highly recommend them to anyone seeking professional web design services!I highly recommend them to any\",\"image\":1300}]}}', NULL, NULL),
(19085, 25, 'App\\Models\\Page', 'ar', 'content', '{\"about_section\":{\"title\":null,\"subtitle\":null,\"description\":null,\"image\":1302,\"image_url\":null},\"story_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Our Vision and Beginning\",\"subtitle\":\"Transforming the eCommerce Landscape with a Vision to Connect Buyers and Sellers Seamlessly\",\"image\":1111},{\"title\":\"Overcoming Challenges\",\"subtitle\":\"Navigating Obstacles with Innovation to Build a Reliable and Secure Marketplace\",\"image\":1111},{\"title\":\"Our Future Vision\",\"subtitle\":\"Continuing to Innovate and Grow, Building a Sustainable eCommerce Ecosystem for the Future\",\"image\":1111}]},\"mission_and_vision_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Our Mission\",\"subtitle\":null,\"description\":null,\"image\":1115},{\"title\":\"Our vision\",\"subtitle\":null,\"description\":null,\"image\":1112}]},\"testimonial_and_success_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Bill Gates\",\"subtitle\":\"CEO\",\"description\":\"CEO\",\"image\":1300},{\"title\":\"John Anderson\",\"subtitle\":\"CTO\",\"description\":\"CTO\",\"image\":1300},{\"title\":\"Bill Gates\",\"subtitle\":\"CEO\",\"description\":\"CEO\",\"image\":1300},{\"title\":\"John Anderson\",\"subtitle\":\"CEO\",\"description\":\"CEO\",\"image\":1300}]}}', NULL, NULL),
(20446, 121, 'App\\Models\\Product', 'df', 'name', 'iPhone 16 Pro Max', NULL, NULL),
(20447, 121, 'App\\Models\\Product', 'df', 'description', 'iPhone 16 Pro Max offer the latest technology and superior performance for your daily needs.', NULL, NULL),
(20448, 121, 'App\\Models\\Product', 'df', 'meta_title', 'Buy iPhone 16 Pro Max online', NULL, NULL),
(20449, 121, 'App\\Models\\Product', 'df', 'meta_description', 'Order iPhone 16 Pro Max online and enjoy the latest tech products delivered to your doorstep.', NULL, NULL),
(20450, 121, 'App\\Models\\Product', 'df', 'meta_keywords', 'gadgets, iPhone 16 Pro Max, tech, 0', NULL, NULL),
(20484, 25, 'App\\Models\\Page', 'df', 'title', 'About Page', NULL, NULL),
(20489, 25, 'App\\Models\\Page', 'df', 'meta_title', 'About', NULL, NULL),
(20490, 25, 'App\\Models\\Page', 'df', 'meta_description', 'About Page Meta Description', NULL, NULL),
(20491, 25, 'App\\Models\\Page', 'df', 'meta_keywords', 'About, About Page', NULL, NULL),
(20492, 23, 'App\\Models\\Page', 'df', 'title', 'Become A Seller  Theme Two', NULL, NULL),
(20493, 23, 'App\\Models\\Page', 'df', 'meta_title', 'Become', NULL, NULL),
(20494, 23, 'App\\Models\\Page', 'df', 'meta_description', 'Become A seller Updated Become A seller Updated', NULL, NULL),
(20495, 23, 'App\\Models\\Page', 'df', 'meta_keywords', 'Become, seller', NULL, NULL),
(20506, 24, 'App\\Models\\Page', 'df', 'title', 'Contact Page', NULL, NULL),
(20507, 24, 'App\\Models\\Page', 'df', 'meta_title', 'Contact Page', NULL, NULL),
(20508, 24, 'App\\Models\\Page', 'df', 'meta_description', 'Contact Page', NULL, NULL),
(20509, 24, 'App\\Models\\Page', 'df', 'meta_keywords', 'Conact, Conact Page', NULL, NULL),
(20510, 23, 'App\\Models\\Page', 'en', 'title', 'Become A Seller', NULL, NULL),
(20511, 24, 'App\\Models\\Page', 'en', 'title', 'Contact Page', NULL, NULL),
(21236, 25, 'App\\Models\\Page', 'en', 'title', 'About Page', NULL, NULL),
(21237, 25, 'App\\Models\\Page', 'en', 'meta_title', 'About', NULL, NULL),
(21238, 25, 'App\\Models\\Page', 'en', 'meta_description', 'About Page Meta Description', NULL, NULL),
(21239, 25, 'App\\Models\\Page', 'en', 'meta_keywords', 'About, About Page', NULL, NULL),
(21240, 10, 'App\\Models\\Banner', 'df', 'title', 'We are here for shopping lovers', NULL, NULL),
(21241, 10, 'App\\Models\\Banner', 'df', 'description', 'Get Extra 50% OFF', NULL, NULL),
(21242, 10, 'App\\Models\\Banner', 'df', 'button_text', 'Shop Now', NULL, NULL),
(21243, 10, 'App\\Models\\Banner', 'en', 'title', 'We are here for shopping lovers', NULL, NULL),
(21244, 10, 'App\\Models\\Banner', 'en', 'description', 'Get Extra 50% OFF', NULL, NULL),
(21245, 10, 'App\\Models\\Banner', 'en', 'button_text', 'Shop Now', NULL, NULL),
(21246, 10, 'App\\Models\\Banner', 'ar', 'title', 'جمال لا تشوبه شائبة', NULL, NULL),
(21247, 10, 'App\\Models\\Banner', 'ar', 'description', 'احصل على خصم ثابت بنسبة 60%', NULL, NULL),
(21248, 10, 'App\\Models\\Banner', 'ar', 'button_text', 'تسوق الآن', NULL, NULL),
(21249, 7, 'App\\Models\\Banner', 'df', 'title', 'Redefining Style for Every Season', NULL, NULL),
(21250, 7, 'App\\Models\\Banner', 'df', 'description', 'Up to 50% Sale Fashion', NULL, NULL),
(21251, 7, 'App\\Models\\Banner', 'df', 'button_text', 'Buy Now', NULL, NULL),
(21252, 7, 'App\\Models\\Banner', 'en', 'title', 'Redefining Style for Every Season', NULL, NULL),
(21253, 7, 'App\\Models\\Banner', 'en', 'description', 'Up to 50% Sale Fashion', NULL, NULL),
(21254, 7, 'App\\Models\\Banner', 'en', 'button_text', 'Buy Now', NULL, NULL),
(21258, 4, 'App\\Models\\Banner', 'df', 'title', 'Everyday Essentials, Always Fresh', NULL, NULL),
(21259, 4, 'App\\Models\\Banner', 'df', 'description', 'Get high-quality groceries delivered fast from trusted local vendors.', NULL, NULL),
(21260, 4, 'App\\Models\\Banner', 'df', 'button_text', 'Shop Now', NULL, NULL),
(21586, 1, 'App\\Models\\VehicleType', 'df', 'name', 'Motorcycle', NULL, NULL),
(21587, 1, 'App\\Models\\VehicleType', 'en', 'name', 'Motorcycle', NULL, NULL),
(21939, 8449, 'App\\Models\\Permissions', 'en', 'perm_title', 'Trash', NULL, NULL),
(21940, 8449, 'App\\Models\\Permissions', 'ar', 'perm_title', 'نفاية', NULL, NULL),
(22197, 3, 'App\\Models\\SettingOption', 'df', 'com_site_title', 'Quick Ecommerce', NULL, NULL),
(22198, 3, 'App\\Models\\SettingOption', 'df', 'com_site_subtitle', 'Shop with confidence on Quick Ecommerce where quality, variety and trusted sellers', NULL, NULL),
(22199, 3, 'App\\Models\\SettingOption', 'df', 'com_site_full_address', '789 Ocean Ave, LA', NULL, NULL),
(22200, 3, 'App\\Models\\SettingOption', 'df', 'com_site_contact_number', '+1 (800) 555-0199', NULL, NULL),
(22201, 3, 'App\\Models\\SettingOption', 'df', 'com_site_footer_copyright', '© 2025 Quick Ecommerce. All Rights Reserved.', NULL, NULL),
(22207, 3, 'App\\Models\\SettingOption', 'ar', 'com_site_title', 'برافو مارت', NULL, NULL),
(22209, 3, 'App\\Models\\SettingOption', 'ar', 'com_site_full_address', 'test', NULL, NULL),
(22210, 3, 'App\\Models\\SettingOption', 'ar', 'com_site_footer_copyright', '© ٢٠٢٥ برافو مارت. جميع الحقوق محفوظة.', NULL, NULL),
(22211, 4, 'App\\Models\\SettingOption', 'df', 'com_site_title', 'Quick Ecommerce', NULL, NULL),
(22212, 4, 'App\\Models\\SettingOption', 'df', 'com_site_subtitle', 'Shop with confidence on Quick Ecommerce where quality, variety and trusted sellers', NULL, NULL),
(22213, 4, 'App\\Models\\SettingOption', 'df', 'com_site_full_address', '789 Ocean Ave, LA', NULL, NULL),
(22214, 4, 'App\\Models\\SettingOption', 'df', 'com_site_contact_number', '+1 (800) 555-0199', NULL, NULL),
(22215, 4, 'App\\Models\\SettingOption', 'df', 'com_site_footer_copyright', '© 2025 Quick Ecommerce. All Rights Reserved.', NULL, NULL),
(22221, 4, 'App\\Models\\SettingOption', 'ar', 'com_site_title', 'برافو مارت', NULL, NULL),
(22223, 4, 'App\\Models\\SettingOption', 'ar', 'com_site_full_address', 'test', NULL, NULL),
(22224, 4, 'App\\Models\\SettingOption', 'ar', 'com_site_footer_copyright', '© ٢٠٢٥ برافو مارت. جميع الحقوق محفوظة.', NULL, NULL),
(22225, 8, 'App\\Models\\SettingOption', 'df', 'com_site_title', 'Quick Ecommerce', NULL, NULL),
(22226, 8, 'App\\Models\\SettingOption', 'df', 'com_site_subtitle', 'Shop with confidence on Quick Ecommerce where quality, variety and trusted sellers', NULL, NULL),
(22227, 8, 'App\\Models\\SettingOption', 'df', 'com_site_full_address', '789 Ocean Ave, LA', NULL, NULL),
(22228, 8, 'App\\Models\\SettingOption', 'df', 'com_site_contact_number', '+1 (800) 555-0199', NULL, NULL),
(22229, 8, 'App\\Models\\SettingOption', 'df', 'com_site_footer_copyright', '© 2025 Quick Ecommerce. All Rights Reserved.', NULL, NULL),
(22235, 8, 'App\\Models\\SettingOption', 'ar', 'com_site_title', 'برافو مارت', NULL, NULL),
(22237, 8, 'App\\Models\\SettingOption', 'ar', 'com_site_full_address', 'test', NULL, NULL),
(22238, 8, 'App\\Models\\SettingOption', 'ar', 'com_site_footer_copyright', '© ٢٠٢٥ برافو مارت. جميع الحقوق محفوظة.', NULL, NULL),
(22239, 9, 'App\\Models\\SettingOption', 'df', 'com_site_title', 'Quick Ecommerce', NULL, NULL),
(22240, 9, 'App\\Models\\SettingOption', 'df', 'com_site_subtitle', 'Shop with confidence on Quick Ecommerce where quality, variety and trusted sellers', NULL, NULL),
(22241, 9, 'App\\Models\\SettingOption', 'df', 'com_site_full_address', '789 Ocean Ave, LA', NULL, NULL),
(22242, 9, 'App\\Models\\SettingOption', 'df', 'com_site_contact_number', '+1 (800) 555-0199', NULL, NULL),
(22243, 9, 'App\\Models\\SettingOption', 'df', 'com_site_footer_copyright', '© 2025 Quick Ecommerce. All Rights Reserved.', NULL, NULL),
(22249, 9, 'App\\Models\\SettingOption', 'ar', 'com_site_title', 'برافو مارت', NULL, NULL),
(22251, 9, 'App\\Models\\SettingOption', 'ar', 'com_site_full_address', 'test', NULL, NULL),
(22252, 9, 'App\\Models\\SettingOption', 'ar', 'com_site_footer_copyright', '© ٢٠٢٥ برافو مارت. جميع الحقوق محفوظة.', NULL, NULL),
(22253, 12, 'App\\Models\\SettingOption', 'df', 'com_site_title', 'Quick Ecommerce', NULL, NULL),
(22254, 12, 'App\\Models\\SettingOption', 'df', 'com_site_subtitle', 'Shop with confidence on Quick Ecommerce where quality, variety and trusted sellers', NULL, NULL),
(22255, 12, 'App\\Models\\SettingOption', 'df', 'com_site_full_address', '789 Ocean Ave, LA', NULL, NULL),
(22256, 12, 'App\\Models\\SettingOption', 'df', 'com_site_contact_number', '+1 (800) 555-0199', NULL, NULL),
(22257, 12, 'App\\Models\\SettingOption', 'df', 'com_site_footer_copyright', '© 2025 Quick Ecommerce. All Rights Reserved.', NULL, NULL),
(22263, 12, 'App\\Models\\SettingOption', 'ar', 'com_site_title', 'برافو مارت', NULL, NULL),
(22265, 12, 'App\\Models\\SettingOption', 'ar', 'com_site_full_address', 'test', NULL, NULL),
(22266, 12, 'App\\Models\\SettingOption', 'ar', 'com_site_footer_copyright', '© ٢٠٢٥ برافو مارت. جميع الحقوق محفوظة.', NULL, NULL),
(22267, 68, 'App\\Models\\SettingOption', 'df', 'com_blog_details_popular_title', 'Popular Posts', NULL, NULL),
(22268, 68, 'App\\Models\\SettingOption', 'en', 'com_blog_details_popular_title', 'Popular Posts', NULL, NULL),
(22269, 68, 'App\\Models\\SettingOption', 'ar', 'com_blog_details_popular_title', 'المشاركات الشعبية', NULL, NULL),
(22270, 69, 'App\\Models\\SettingOption', 'df', 'com_blog_details_related_title', 'Related Posts', NULL, NULL),
(22271, 69, 'App\\Models\\SettingOption', 'en', 'com_blog_details_related_title', 'Related Posts', NULL, NULL),
(22272, 69, 'App\\Models\\SettingOption', 'ar', 'com_blog_details_related_title', 'المشاركات ذات الصلة', NULL, NULL),
(22273, 59, 'App\\Models\\SettingOption', 'df', 'com_product_details_page_delivery_title', 'Free Delivery', NULL, NULL),
(22274, 59, 'App\\Models\\SettingOption', 'en', 'com_product_details_page_delivery_title', 'Free Delivery', NULL, NULL),
(22276, 59, 'App\\Models\\SettingOption', 'ar', 'com_product_details_page_delivery_title', 'التوصيل مجاني', NULL, NULL),
(22277, 60, 'App\\Models\\SettingOption', 'df', 'com_product_details_page_delivery_subtitle', 'Will ship to Bangladesh. Read item description.', NULL, NULL),
(22278, 60, 'App\\Models\\SettingOption', 'en', 'com_product_details_page_delivery_subtitle', 'Will ship to Bangladesh. Read item description.', NULL, NULL),
(22280, 60, 'App\\Models\\SettingOption', 'ar', 'com_product_details_page_delivery_subtitle', 'سيتم الشحن إلى بنغلاديش. اقرأ وصف المنتج.', NULL, NULL),
(22281, 63, 'App\\Models\\SettingOption', 'df', 'com_product_details_page_return_refund_title', 'Easy Return & Refund', NULL, NULL),
(22282, 63, 'App\\Models\\SettingOption', 'en', 'com_product_details_page_return_refund_title', 'Easy Return & Refund', NULL, NULL),
(22284, 63, 'App\\Models\\SettingOption', 'ar', 'com_product_details_page_return_refund_title', 'سهولة الإرجاع والاسترداد', NULL, NULL),
(22285, 64, 'App\\Models\\SettingOption', 'df', 'com_product_details_page_return_refund_subtitle', '30 days returns. Buyer pays for return shipping.', NULL, NULL),
(22286, 64, 'App\\Models\\SettingOption', 'en', 'com_product_details_page_return_refund_subtitle', '30 days returns. Buyer pays for return shipping.', NULL, NULL),
(22288, 64, 'App\\Models\\SettingOption', 'ar', 'com_product_details_page_return_refund_subtitle', 'إرجاع خلال 30 يومًا. يتحمل المشتري تكاليف شحن الإرجاع.', NULL, NULL),
(22289, 67, 'App\\Models\\SettingOption', 'df', 'com_product_details_page_related_title', 'Related Product', NULL, NULL),
(22290, 67, 'App\\Models\\SettingOption', 'en', 'com_product_details_page_related_title', 'Related Product', NULL, NULL),
(22291, 67, 'App\\Models\\SettingOption', 'ar', 'com_product_details_page_related_title', 'المنتجات ذات الصلة', NULL, NULL),
(22292, 55, 'App\\Models\\SettingOption', 'df', 'com_login_page_title', 'Sign In', NULL, NULL),
(22293, 55, 'App\\Models\\SettingOption', 'en', 'com_login_page_title', 'Sign In', NULL, NULL),
(22295, 55, 'App\\Models\\SettingOption', 'ar', 'com_login_page_title', 'تسجيل الدخول', NULL, NULL),
(22296, 56, 'App\\Models\\SettingOption', 'df', 'com_login_page_subtitle', 'Continue Shopping', NULL, NULL),
(22297, 56, 'App\\Models\\SettingOption', 'en', 'com_login_page_subtitle', 'Continue Shopping', NULL, NULL),
(22299, 56, 'App\\Models\\SettingOption', 'ar', 'com_login_page_subtitle', 'متابعة التسوق', NULL, NULL),
(22300, 70, 'App\\Models\\SettingOption', 'df', 'com_seller_login_page_title', 'Sign in', NULL, NULL),
(22301, 70, 'App\\Models\\SettingOption', 'en', 'com_seller_login_page_title', 'Sign in', NULL, NULL),
(22302, 70, 'App\\Models\\SettingOption', 'ar', 'com_seller_login_page_title', 'تسجيل الدخول إلى حساب برافو مارت', NULL, NULL),
(22303, 71, 'App\\Models\\SettingOption', 'df', 'com_seller_login_page_subtitle', 'Multivendor Ecosystem.', NULL, NULL),
(22304, 71, 'App\\Models\\SettingOption', 'en', 'com_seller_login_page_subtitle', 'Multivendor Ecosystem.', NULL, NULL),
(22305, 71, 'App\\Models\\SettingOption', 'ar', 'com_seller_login_page_subtitle', 'قم بتسجيل الدخول للإشراف على نظامك البيئي متعدد البائعين.', NULL, NULL),
(22306, 48, 'App\\Models\\SettingOption', 'df', 'com_register_page_title', 'Sign Up Now!', NULL, NULL),
(22307, 48, 'App\\Models\\SettingOption', 'en', 'com_register_page_title', 'Sign Up Now!', NULL, NULL),
(22308, 48, 'App\\Models\\SettingOption', 'ar', 'com_register_page_title', 'سجل الآن!', NULL, NULL),
(22311, 49, 'App\\Models\\SettingOption', 'ar', 'com_register_page_subtitle', 'انضم إلى برافو لتجربة تسوق مذهلة', NULL, NULL),
(22312, 50, 'App\\Models\\SettingOption', 'df', 'com_register_page_description', 'Sign up now to explore a wide range of products from multiple stores, enjoy seamless shopping, secure transactions, and exclusive discounts.', NULL, NULL),
(22313, 50, 'App\\Models\\SettingOption', 'en', 'com_register_page_description', 'Sign up now to explore a wide range of products from multiple stores, enjoy seamless shopping, secure transactions, and exclusive discounts.', NULL, NULL),
(22314, 50, 'App\\Models\\SettingOption', 'ar', 'com_register_page_description', 'سجل الآن لاستكشاف مجموعة واسعة من المنتجات من متاجر متعددة، واستمتع بالتسوق السلس والمعاملات الآمنة والخصومات الحصرية.', NULL, NULL),
(22315, 53, 'App\\Models\\SettingOption', 'df', 'com_register_page_terms_title', 'Terms & Conditions', NULL, NULL),
(22316, 53, 'App\\Models\\SettingOption', 'en', 'com_register_page_terms_title', 'Terms & Conditions', NULL, NULL),
(22317, 53, 'App\\Models\\SettingOption', 'ar', 'com_register_page_terms_title', 'الشروط والأحكام', NULL, NULL),
(22318, 115, 'App\\Models\\SettingOption', 'df', 'com_home_one_category_button_title', 'All Categories', NULL, NULL),
(22319, 115, 'App\\Models\\SettingOption', 'en', 'com_home_one_category_button_title', 'All Categories', NULL, NULL),
(22320, 115, 'App\\Models\\SettingOption', 'ar', 'com_home_one_category_button_title', 'جميع الفئات', NULL, NULL),
(22321, 116, 'App\\Models\\SettingOption', 'df', 'com_home_one_store_button_title', 'Explore Store Types', NULL, NULL),
(22322, 116, 'App\\Models\\SettingOption', 'en', 'com_home_one_store_button_title', 'Explore Store Types', NULL, NULL),
(22323, 116, 'App\\Models\\SettingOption', 'ar', 'com_home_one_store_button_title', 'استكشاف أنواع المتاجر', NULL, NULL),
(22324, 117, 'App\\Models\\SettingOption', 'df', 'com_home_one_category_section_title', 'Shop by Categories', NULL, NULL),
(22325, 117, 'App\\Models\\SettingOption', 'en', 'com_home_one_category_section_title', 'Shop by Categories', NULL, NULL),
(22326, 117, 'App\\Models\\SettingOption', 'ar', 'com_home_one_category_section_title', 'تسوق حسب الفئات', NULL, NULL),
(22327, 118, 'App\\Models\\SettingOption', 'df', 'com_home_one_flash_sale_section_title', 'Flash Sale', NULL, NULL),
(22328, 118, 'App\\Models\\SettingOption', 'en', 'com_home_one_flash_sale_section_title', 'Flash Sale', NULL, NULL),
(22329, 118, 'App\\Models\\SettingOption', 'ar', 'com_home_one_flash_sale_section_title', 'عروض فلاش', NULL, NULL);
INSERT INTO `translations` (`id`, `translatable_id`, `translatable_type`, `language`, `key`, `value`, `created_at`, `updated_at`) VALUES
(22330, 119, 'App\\Models\\SettingOption', 'df', 'com_home_one_featured_section_title', 'Featured', NULL, NULL),
(22331, 119, 'App\\Models\\SettingOption', 'en', 'com_home_one_featured_section_title', 'Featured', NULL, NULL),
(22332, 119, 'App\\Models\\SettingOption', 'ar', 'com_home_one_featured_section_title', 'مميزة', NULL, NULL),
(22333, 120, 'App\\Models\\SettingOption', 'df', 'com_home_one_top_selling_section_title', 'Top Selling', NULL, NULL),
(22334, 120, 'App\\Models\\SettingOption', 'en', 'com_home_one_top_selling_section_title', 'Top Selling', NULL, NULL),
(22335, 120, 'App\\Models\\SettingOption', 'ar', 'com_home_one_top_selling_section_title', 'الأكثر مبيعًا', NULL, NULL),
(22336, 121, 'App\\Models\\SettingOption', 'df', 'com_home_one_latest_product_section_title', 'Latest Essentials', NULL, NULL),
(22337, 121, 'App\\Models\\SettingOption', 'en', 'com_home_one_latest_product_section_title', 'Latest Essentials', NULL, NULL),
(22338, 121, 'App\\Models\\SettingOption', 'ar', 'com_home_one_latest_product_section_title', 'أحدث الضروريات', NULL, NULL),
(22339, 122, 'App\\Models\\SettingOption', 'df', 'com_home_one_popular_product_section_title', 'Popular Product', NULL, NULL),
(22340, 122, 'App\\Models\\SettingOption', 'en', 'com_home_one_popular_product_section_title', 'Popular Product', NULL, NULL),
(22341, 122, 'App\\Models\\SettingOption', 'ar', 'com_home_one_popular_product_section_title', 'المنتجات الشائعة', NULL, NULL),
(22342, 123, 'App\\Models\\SettingOption', 'df', 'com_home_one_top_store_section_title', 'Top Stores', NULL, NULL),
(22343, 123, 'App\\Models\\SettingOption', 'en', 'com_home_one_top_store_section_title', 'Top Stores', NULL, NULL),
(22344, 123, 'App\\Models\\SettingOption', 'ar', 'com_home_one_top_store_section_title', 'أفضل مجموعات المتاجر', NULL, NULL),
(22345, 100, 'App\\Models\\SettingOption', 'df', 'com_meta_title', 'Quick Ecommerce', NULL, NULL),
(22346, 100, 'App\\Models\\SettingOption', 'df', 'com_meta_description', 'Quick Ecommerce', NULL, NULL),
(22348, 100, 'App\\Models\\SettingOption', 'df', 'com_og_title', 'Quick Ecommerce', NULL, NULL),
(22349, 100, 'App\\Models\\SettingOption', 'df', 'com_og_description', 'Quick E-commerce', NULL, NULL),
(22350, 101, 'App\\Models\\SettingOption', 'df', 'com_meta_title', 'Quick Ecommerce', NULL, NULL),
(22351, 101, 'App\\Models\\SettingOption', 'df', 'com_meta_description', 'Quick Ecommerce', NULL, NULL),
(22353, 101, 'App\\Models\\SettingOption', 'df', 'com_og_title', 'Quick Ecommerce', NULL, NULL),
(22354, 101, 'App\\Models\\SettingOption', 'df', 'com_og_description', 'Quick E-commerce', NULL, NULL),
(22355, 102, 'App\\Models\\SettingOption', 'df', 'com_meta_title', 'Quick Ecommerce', NULL, NULL),
(22356, 102, 'App\\Models\\SettingOption', 'df', 'com_meta_description', 'Quick Ecommerce', NULL, NULL),
(22358, 102, 'App\\Models\\SettingOption', 'df', 'com_og_title', 'Quick Ecommerce', NULL, NULL),
(22359, 102, 'App\\Models\\SettingOption', 'df', 'com_og_description', 'Quick E-commerce', NULL, NULL),
(22360, 104, 'App\\Models\\SettingOption', 'df', 'com_meta_title', 'Quick Ecommerce', NULL, NULL),
(22361, 104, 'App\\Models\\SettingOption', 'df', 'com_meta_description', 'Quick Ecommerce', NULL, NULL),
(22363, 104, 'App\\Models\\SettingOption', 'df', 'com_og_title', 'Quick Ecommerce', NULL, NULL),
(22364, 104, 'App\\Models\\SettingOption', 'df', 'com_og_description', 'Quick E-commerce', NULL, NULL),
(22365, 105, 'App\\Models\\SettingOption', 'df', 'com_meta_title', 'Quick Ecommerce', NULL, NULL),
(22366, 105, 'App\\Models\\SettingOption', 'df', 'com_meta_description', 'Quick Ecommerce', NULL, NULL),
(22368, 105, 'App\\Models\\SettingOption', 'df', 'com_og_title', 'Quick Ecommerce', NULL, NULL),
(22369, 105, 'App\\Models\\SettingOption', 'df', 'com_og_description', 'Quick E-commerce', NULL, NULL),
(22370, 100, 'App\\Models\\SettingOption', 'en', 'com_meta_title', 'Quick Ecommerce', NULL, NULL),
(22371, 101, 'App\\Models\\SettingOption', 'en', 'com_meta_title', 'Quick Ecommerce', NULL, NULL),
(22372, 102, 'App\\Models\\SettingOption', 'en', 'com_meta_title', 'Quick Ecommerce', NULL, NULL),
(22373, 104, 'App\\Models\\SettingOption', 'en', 'com_meta_title', 'Quick Ecommerce', NULL, NULL),
(22374, 105, 'App\\Models\\SettingOption', 'en', 'com_meta_title', 'Quick Ecommerce', NULL, NULL),
(22385, 127, 'App\\Models\\SettingOption', 'en', 'content', '{\"com_social_links_facebook_url\":\"https:\\/\\/facebook.com\",\"com_social_links_twitter_url\":\"https:\\/\\/twitter.com\",\"com_social_links_instagram_url\":\"https:\\/\\/instagram.com\",\"com_social_links_linkedin_url\":\"https:\\/\\/linkedin.com\",\"com_download_app_link_one\":\"#\",\"com_download_app_link_two\":\"#\",\"com_payment_methods_enable_disable\":\"on\",\"com_quick_access_enable_disable\":\"on\",\"com_our_info_enable_disable\":\"on\",\"com_social_links_enable_disable\":\"on\",\"com_social_links_title\":\"on\",\"com_payment_methods_image\":\"737,734,733,732\",\"com_quick_access\":[{\"com_quick_access_title\":\"Home\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\"},{\"com_quick_access_title\":\"All Products\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/products\"},{\"com_quick_access_title\":\"Categories\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/product-categories\"},{\"com_quick_access_title\":\"Stores\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/stores\"},{\"com_quick_access_title\":\"Become a Seller\",\"com_quick_access_url\":\"https:\\/\\/admin.quickecommerce.app\\/become-a-seller\"}],\"com_our_info\":[{\"title\":\"About Us\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/about\"},{\"title\":\"Terms & Conditions\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/terms-conditions\"},{\"title\":\"Privacy Policy\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/privacy-policy\"},{\"title\":\"Return & Refund Policy\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/refund-policies\"},{\"title\":\"Shipping Policy\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/shipping-policy\"}],\"com_help_center\":[{\"title\":\"Contact Us\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/contact\"},{\"title\":\"Customer Service\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/customer-service\"},{\"title\":\"Product Support\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/product-support\"},{\"title\":\"Track Order\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/track-order\"}]}', NULL, NULL),
(22387, 16, 'App\\Models\\EmailTemplate', 'df', 'name', 'Refund Processed for Your Store', NULL, NULL),
(22388, 16, 'App\\Models\\EmailTemplate', 'df', 'subject', 'A Refund has Been Processed for an Order in Your Store', NULL, NULL),
(22389, 16, 'App\\Models\\EmailTemplate', 'df', 'body', '<h1>Hello @store_owner_name,</h1>\n                           <p>A refund has been processed for an order in your store (Order ID: @order_id).</p>\n                           <p>Refund Amount: @refund_amount</p>\n                           <p>Please ensure your account is updated accordingly.</p>', NULL, NULL),
(22390, 24, 'App\\Models\\EmailTemplate', 'df', 'name', 'User Registration', NULL, NULL),
(22391, 24, 'App\\Models\\EmailTemplate', 'df', 'subject', 'Hello Admin, A New Seller Just Joined!', NULL, NULL),
(22392, 24, 'App\\Models\\EmailTemplate', 'df', 'body', '<ul>\n<li><strong>Name:</strong> @name</li>\n<li><strong>Email:</strong> @email</li>\n<li><strong>Phone:</strong> @phone</li>\n</ul>', NULL, NULL),
(22393, 127, 'App\\Models\\SettingOption', 'df', 'content', '{\"com_social_links_facebook_url\":\"https:\\/\\/facebook.com\",\"com_social_links_twitter_url\":\"https:\\/\\/twitter.com\",\"com_social_links_instagram_url\":\"https:\\/\\/instagram.com\",\"com_social_links_linkedin_url\":\"https:\\/\\/linkedin.com\",\"com_download_app_link_one\":\"#\",\"com_download_app_link_two\":\"#\",\"com_payment_methods_enable_disable\":\"on\",\"com_quick_access_enable_disable\":\"on\",\"com_our_info_enable_disable\":\"on\",\"com_social_links_enable_disable\":\"on\",\"com_social_links_title\":\"on\",\"com_payment_methods_image\":\"737,734,733,732\",\"com_quick_access\":[{\"com_quick_access_title\":\"Home\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\"},{\"com_quick_access_title\":\"All Products\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/products\"},{\"com_quick_access_title\":\"Categories\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/product-categories\"},{\"com_quick_access_title\":\"Stores\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/stores\"},{\"com_quick_access_title\":\"Become a Seller\",\"com_quick_access_url\":\"https:\\/\\/admin.quickecommerce.app\\/become-a-seller\"}],\"com_our_info\":[{\"title\":\"About Us\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/about\"},{\"title\":\"Terms & Conditions\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/terms-conditions\"},{\"title\":\"Privacy Policy\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/privacy-policy\"},{\"title\":\"Return & Refund Policy\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/refund-policies\"},{\"title\":\"Shipping Policy\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/shipping-policy\"}],\"com_help_center\":[{\"title\":\"Contact Us\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/contact\"},{\"title\":\"Customer Service\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/customer-service\"},{\"title\":\"Product Support\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/product-support\"},{\"title\":\"Track Order\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/track-order\"}]}', NULL, NULL),
(22395, 127, 'App\\Models\\SettingOption', 'ar', 'content', '{\"com_social_links_facebook_url\":\"https:\\/\\/facebook.com\",\"com_social_links_twitter_url\":\"https:\\/\\/twitter.com\",\"com_social_links_instagram_url\":\"https:\\/\\/instagram.com\",\"com_social_links_linkedin_url\":\"https:\\/\\/linkedin.com\",\"com_download_app_link_one\":\"#\",\"com_download_app_link_two\":\"#\",\"com_payment_methods_enable_disable\":\"on\",\"com_quick_access_enable_disable\":\"on\",\"com_our_info_enable_disable\":\"on\",\"com_social_links_enable_disable\":\"on\",\"com_social_links_title\":\"on\",\"com_payment_methods_image\":\"737,734,733,732\",\"com_quick_access\":[{\"com_quick_access_title\":\"\\u0628\\u064a\\u062a\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\"},{\"com_quick_access_title\":\"\\u062c\\u0645\\u064a\\u0639 \\u0627\\u0644\\u0645\\u0646\\u062a\\u062c\\u0627\\u062a\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/products\"},{\"com_quick_access_title\":\"\\u0641\\u0626\\u0627\\u062a\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/product-categories\"},{\"com_quick_access_title\":\"\\u0627\\u0644\\u0645\\u062a\\u0627\\u062c\\u0631\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/stores\"},{\"com_quick_access_title\":\"\\u0643\\u0646 \\u0628\\u0627\\u0626\\u0639\\u064b\\u0627\",\"com_quick_access_url\":\"https:\\/\\/admin.quickecommerce.app\\/become-a-seller\"}],\"com_our_info\":[{\"title\":\"\\u0645\\u0639\\u0644\\u0648\\u0645\\u0627\\u062a \\u0639\\u0646\\u0627\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/about\"},{\"title\":\"\\u0627\\u0644\\u0634\\u0631\\u0648\\u0637 \\u0648\\u0627\\u0644\\u0623\\u062d\\u0643\\u0627\\u0645\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/terms-conditions\"},{\"title\":\"\\u0633\\u064a\\u0627\\u0633\\u0629 \\u0627\\u0644\\u062e\\u0635\\u0648\\u0635\\u064a\\u0629\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/privacy-policy\"},{\"title\":\"\\u0633\\u064a\\u0627\\u0633\\u0629 \\u0627\\u0644\\u0625\\u0631\\u062c\\u0627\\u0639 \\u0648\\u0627\\u0644\\u0627\\u0633\\u062a\\u0631\\u062f\\u0627\\u062f\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/refund-policies\"},{\"title\":\"\\u0633\\u064a\\u0627\\u0633\\u0629 \\u0627\\u0644\\u0634\\u062d\\u0646\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/shipping-policy\"}],\"com_help_center\":[{\"title\":\"\\u062e\\u062f\\u0645\\u0629 \\u0627\\u0644\\u0639\\u0645\\u0644\\u0627\\u0621\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/contact\"},{\"title\":\"\\u062e\\u062f\\u0645\\u0629 \\u0627\\u0644\\u0639\\u0645\\u0644\\u0627\\u0621\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/customer-service\"},{\"title\":\"\\u062f\\u0639\\u0645 \\u0627\\u0644\\u0645\\u0646\\u062a\\u062c\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/product-support\"},{\"title\":\"\\u062a\\u062a\\u0628\\u0639 \\u0627\\u0644\\u0637\\u0644\\u0628\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/track-order\"}]}', NULL, NULL),
(22405, 4, 'App\\Models\\Banner', 'en', 'title', 'Everyday Essentials, Always Fresh', NULL, NULL),
(22406, 13, 'App\\Models\\Banner', 'df', 'title', 'Health Support Made Easy', NULL, NULL),
(22407, 13, 'App\\Models\\Banner', 'df', 'description', 'Safe, certified medicines with fast delivery at your convenience.', NULL, NULL),
(22408, 13, 'App\\Models\\Banner', 'en', 'title', 'Health Support Made Easy', NULL, NULL),
(22409, 13, 'App\\Models\\Banner', 'en', 'description', 'Safe, certified medicines with fast delivery at your convenience.', NULL, NULL),
(22410, 13, 'App\\Models\\Banner', 'en', 'button_text', 'Shop Now', NULL, NULL),
(22411, 14, 'App\\Models\\Banner', 'df', 'title', 'Trendy Looks, Everyday Comfort', NULL, NULL),
(22412, 14, 'App\\Models\\Banner', 'df', 'description', 'Discover a wide collection of everyday outfits crafted for Comfort and confident living.', NULL, NULL),
(22413, 14, 'App\\Models\\Banner', 'df', 'button_text', 'Shop Now', NULL, NULL),
(22414, 14, 'App\\Models\\Banner', 'en', 'title', 'Trendy Looks, Everyday Comfort', NULL, NULL),
(22415, 14, 'App\\Models\\Banner', 'en', 'description', 'Discover a wide collection of everyday outfits crafted for Comfort and confident living.', NULL, NULL),
(22416, 15, 'App\\Models\\Banner', 'df', 'title', 'Launch Your Online Store Today', NULL, NULL),
(22417, 15, 'App\\Models\\Banner', 'en', 'title', 'Launch Your Online Store Today', NULL, NULL),
(22418, 15, 'App\\Models\\Banner', 'en', 'description', 'No tech skills needed. Just your products, your brand, and our platform.', NULL, NULL),
(22429, 144, 'App\\Models\\Product', 'df', 'name', 'Fresh Salmon Fillets', NULL, NULL),
(22430, 144, 'App\\Models\\Product', 'df', 'description', 'Fresh Salmon Fillets are fresh and of premium quality, perfect for your daily seafood cravings.', NULL, NULL),
(22431, 144, 'App\\Models\\Product', 'df', 'meta_title', 'Buy Fresh Salmon Fillets online', NULL, NULL),
(22432, 144, 'App\\Models\\Product', 'df', 'meta_description', 'Order Fresh Salmon Fillets online and get the freshest fish and seafood delivered to your door.', NULL, NULL),
(22433, 144, 'App\\Models\\Product', 'df', 'meta_keywords', 'fish, seafood, Fresh Salmon Fillets, fresh, 0', NULL, NULL),
(22494, 53, 'App\\Models\\Product', 'df', 'name', 'Vitamin C Tablets', NULL, NULL),
(22495, 53, 'App\\Models\\Product', 'df', 'description', 'Vitamin C Tablets is a high-quality pharmaceutical product designed for effective treatment and relief.', NULL, NULL),
(22496, 53, 'App\\Models\\Product', 'df', 'meta_title', 'Buy Vitamin C Tablets online', NULL, NULL),
(22497, 53, 'App\\Models\\Product', 'df', 'meta_description', 'Order Vitamin C Tablets online and get quality medicines delivered safely to your home.', NULL, NULL),
(22498, 53, 'App\\Models\\Product', 'df', 'meta_keywords', 'medicine, Vitamin C Tablets, healthcare, pharmacy, 4', NULL, NULL),
(22524, 38, 'App\\Models\\Product', 'df', 'name', 'Blueberry Scones', NULL, NULL),
(22525, 38, 'App\\Models\\Product', 'df', 'description', 'Blueberry Scones is freshly baked and of premium quality, perfect for your daily needs. Stock up and enjoy every bite!', NULL, NULL),
(22526, 38, 'App\\Models\\Product', 'df', 'meta_title', 'Buy Blueberry Scones online', NULL, NULL),
(22527, 38, 'App\\Models\\Product', 'df', 'meta_description', 'Order Blueberry Scones online and get freshly baked goods delivered to your door.', NULL, NULL),
(22528, 38, 'App\\Models\\Product', 'df', 'meta_keywords', 'bakery, Blueberry Scones, fresh, 5', NULL, NULL),
(22591, 11, 'App\\Models\\Menu', 'en', 'menu_content', '[{\"id\":\"new-1753850842405-1\",\"label\":\"Home\",\"url\":\"/\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":0,\"isLast\":false,\"parent\":null},{\"id\":\"new-1753850842405-2\",\"label\":\"Product\",\"url\":\"products\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":1,\"isLast\":false,\"parent\":null},{\"id\":\"new-1753850842405-3\",\"label\":\"Category\",\"url\":\"product-categories\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":2,\"isLast\":false,\"parent\":null},{\"id\":\"new-1753850842405-4\",\"label\":\"Store\",\"url\":\"stores\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":3,\"isLast\":false,\"parent\":null},{\"id\":\"custom-1753778590299\",\"label\":\"Pages\",\"url\":\"/\",\"children\":[{\"id\":\"new-1754552096226-25\",\"label\":\"About Page\",\"url\":\"about\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":0,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552233634-24\",\"label\":\"Contact Page\",\"url\":\"contact\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":1,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552308978-6\",\"label\":\"Coupon\",\"url\":\"coupon\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":2,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552233634-2\",\"label\":\"Terms and conditions\",\"url\":\"terms-conditions\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":3,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552233634-5\",\"label\":\"Privacy Policy\",\"url\":\"privacy-policy\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":4,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552233634-18\",\"label\":\"Shipping & Delivery Policy\",\"url\":\"shipping-policy\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":5,\"isLast\":true,\"parent\":null}],\"parentId\":null,\"depth\":0,\"index\":4,\"isLast\":false,\"parent\":null,\"collapsed\":false},{\"id\":\"new-1753850842405-5\",\"label\":\"Blog\",\"url\":\"blogs\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":5,\"isLast\":true,\"parent\":null},{\"id\":\"new-1759056229190-36\",\"label\":\"Become A Seller\",\"url\":\"become-a-seller\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":0,\"isLast\":true,\"parent\":null}]', NULL, NULL),
(22593, 11, 'App\\Models\\Menu', 'ar', 'menu_content', '[{\"id\":\"new-1753850842405-1\",\"label\":\"بيت\",\"url\":\"/\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":0,\"isLast\":false,\"parent\":null},{\"id\":\"new-1753850842405-2\",\"label\":\"منتج\",\"url\":\"products\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":1,\"isLast\":false,\"parent\":null},{\"id\":\"new-1753850842405-3\",\"label\":\"فئة\",\"url\":\"product-categories\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":2,\"isLast\":false,\"parent\":null},{\"id\":\"new-1753850842405-4\",\"label\":\"محل\",\"url\":\"stores\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":3,\"isLast\":false,\"parent\":null},{\"id\":\"custom-1753778590299\",\"label\":\"صفحات\",\"url\":\"/\",\"children\":[{\"id\":\"new-1754552096226-25\",\"label\":\"صفحة \\\"نبذة عنا\\\"\",\"url\":\"about\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":0,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552233634-24\",\"label\":\"صفحة الاتصال\",\"url\":\"contact\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":1,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552308978-6\",\"label\":\"قسيمة\",\"url\":\"coupon\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":2,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552233634-2\",\"label\":\"الشروط والأحكام\",\"url\":\"terms-conditions\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":3,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552233634-5\",\"label\":\"سياسة الخصوصية\",\"url\":\"privacy-policy\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":4,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552233634-18\",\"label\":\"سياسة الشحن والتوصيل\",\"url\":\"shipping-policy\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":5,\"isLast\":true,\"parent\":null}],\"parentId\":null,\"depth\":0,\"index\":4,\"isLast\":false,\"parent\":null,\"collapsed\":false},{\"id\":\"new-1753850842405-5\",\"label\":\"مدونة\",\"url\":\"blogs\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":5,\"isLast\":true,\"parent\":null},{\"id\":\"new-1759056229190-36\",\"label\":\"Become A Seller\",\"url\":\"become-a-seller\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":0,\"isLast\":true,\"parent\":null}]', NULL, NULL),
(22597, 4, 'App\\Models\\Banner', 'en', 'description', 'Get high-quality groceries delivered fast from trusted local vendors.', NULL, NULL),
(22598, 4, 'App\\Models\\Banner', 'en', 'button_text', 'Shop Now', NULL, NULL),
(22601, 11, 'App\\Models\\Menu', 'es', 'menu_content', '[{\"id\":\"new-1753850842405-1\",\"label\":\"Home\",\"url\":\"/\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":0,\"isLast\":false,\"parent\":null},{\"id\":\"new-1753850842405-2\",\"label\":\"Product\",\"url\":\"products\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":1,\"isLast\":false,\"parent\":null},{\"id\":\"new-1753850842405-3\",\"label\":\"Category\",\"url\":\"product-categories\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":2,\"isLast\":false,\"parent\":null},{\"id\":\"new-1753850842405-4\",\"label\":\"Store\",\"url\":\"stores\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":3,\"isLast\":false,\"parent\":null},{\"id\":\"custom-1753778590299\",\"label\":\"Pages\",\"url\":\"/\",\"children\":[{\"id\":\"new-1754552096226-25\",\"label\":\"About Page\",\"url\":\"about\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":0,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552233634-24\",\"label\":\"Contact Page\",\"url\":\"contact\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":1,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552308978-6\",\"label\":\"Coupon\",\"url\":\"coupon\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":2,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552233634-2\",\"label\":\"Terms and conditions\",\"url\":\"terms-conditions\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":3,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552233634-5\",\"label\":\"Privacy Policy\",\"url\":\"privacy-policy\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":4,\"isLast\":false,\"parent\":null},{\"id\":\"new-1754552233634-18\",\"label\":\"Shipping & Delivery Policy\",\"url\":\"shipping-policy\",\"children\":[],\"parentId\":\"custom-1753778590299\",\"depth\":1,\"index\":5,\"isLast\":true,\"parent\":null}],\"parentId\":null,\"depth\":0,\"index\":4,\"isLast\":false,\"parent\":null,\"collapsed\":false},{\"id\":\"new-1753850842405-5\",\"label\":\"Blog\",\"url\":\"blogs\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":5,\"isLast\":true,\"parent\":null},{\"id\":\"new-1759056229190-36\",\"label\":\"Become A Seller\",\"url\":\"become-a-seller\",\"children\":[],\"parentId\":null,\"depth\":0,\"index\":0,\"isLast\":true,\"parent\":null}]', NULL, NULL),
(22602, 127, 'App\\Models\\SettingOption', 'es', 'content', '{\"com_social_links_facebook_url\":\"https:\\/\\/facebook.com\",\"com_social_links_twitter_url\":\"https:\\/\\/twitter.com\",\"com_social_links_instagram_url\":\"https:\\/\\/instagram.com\",\"com_social_links_linkedin_url\":\"https:\\/\\/linkedin.com\",\"com_download_app_link_one\":\"#\",\"com_download_app_link_two\":\"#\",\"com_payment_methods_enable_disable\":\"on\",\"com_quick_access_enable_disable\":\"on\",\"com_our_info_enable_disable\":\"on\",\"com_social_links_enable_disable\":\"on\",\"com_social_links_title\":\"on\",\"com_payment_methods_image\":\"737,734,733,732\",\"com_quick_access\":[{\"com_quick_access_title\":\"Home\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\"},{\"com_quick_access_title\":\"All Products\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/products\"},{\"com_quick_access_title\":\"Categories\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/product-categories\"},{\"com_quick_access_title\":\"Stores\",\"com_quick_access_url\":\"https:\\/\\/public.quickecommerce.app\\/stores\"},{\"com_quick_access_title\":\"Become a Seller\",\"com_quick_access_url\":\"https:\\/\\/admin.quickecommerce.app\\/become-a-seller\"}],\"com_our_info\":[{\"title\":\"About Us\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/about\"},{\"title\":\"Terms & Conditions\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/terms-conditions\"},{\"title\":\"Privacy Policy\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/privacy-policy\"},{\"title\":\"Return & Refund Policy\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/refund-policies\"},{\"title\":\"Shipping Policy\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/shipping-policy\"}],\"com_help_center\":[{\"title\":\"Contact Us\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/contact\"},{\"title\":\"Customer Service\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/customer-service\"},{\"title\":\"Product Support\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/product-support\"},{\"title\":\"\\u062a\\u062a\\u0628\\u0639 \\u0627\\u0644\\u0637\\u0644\\u0628\",\"url\":\"https:\\/\\/public.quickecommerce.app\\/pages\\/track-order\"}]}', NULL, NULL),
(22603, 31, 'App\\Models\\Page', 'df', 'title', 'Customer Service', NULL, NULL),
(22604, 31, 'App\\Models\\Page', 'df', 'content', '<h2>Get help with orders, payments, returns, and account issues.</h2><p></p><p>Welcome to the Customer Service Center.<br>Our goal is to ensure your experience on our platform is smooth, enjoyable, and secure. Whether you\'re a new customer or a returning shopper, our support team is always ready to help you with your concerns.</p><p>We understand that questions and issues can arise before, during, or after a purchase. From order-related questions to payment issues and account problems, we’re here to guide you every step of the way.</p><p>Here’s what we can help you with:</p><ul><li><p>Tracking and managing your orders</p></li><li><p>Solving payment or billing problems</p></li><li><p>Cancelling or modifying orders (before they ship)</p></li><li><p>Handling product returns and refund requests</p></li><li><p>Updating your account information or password</p></li><li><p>Helping you contact sellers or report issues</p></li></ul><p>We also offer assistance in resolving disputes between buyers and sellers, ensuring that both parties are treated fairly.</p><p>For quick answers, be sure to check our FAQs and policy pages. If you still need help, don’t hesitate to reach out through our support form or live chat. Our customer service is available 24/7 to ensure you get timely assistance.</p><p>Thank you for shopping with us. Your satisfaction is our priority.</p>', NULL, NULL),
(22605, 31, 'App\\Models\\Page', 'df', 'meta_title', 'Customer Service', NULL, NULL),
(22606, 32, 'App\\Models\\Page', 'df', 'title', 'Product Support', NULL, NULL),
(22607, 32, 'App\\Models\\Page', 'df', 'content', '<h2>Get help with product issues, defects, specifications, or seller communication.</h2><p></p><p>Product issues can happen — and when they do, we’re here to help you resolve them quickly. Our Product Support team focuses on making sure you’re satisfied with the items you receive and that everything works as expected.</p><p>Whether you’ve received a damaged product, have a question about specifications, or something isn’t working right, we’ll help guide you through the next steps.</p><p>Here’s what Product Support covers:</p><ul><li><p>Questions about product features, materials, or compatibility</p></li><li><p>Missing parts or items upon delivery</p></li><li><p>Faulty or defective items</p></li><li><p>Warranty-related concerns</p></li><li><p>Reaching out to the seller for technical assistance</p></li></ul><p>You can often find important product information, seller warranty policies, and support details right on the product page. However, if something’s unclear or wrong with your order, our team is ready to assist you directly.</p><p>Our platform connects you with multiple stores and sellers, so each situation may vary slightly depending on the seller’s policies. We’re happy to mediate and ensure you receive a fair resolution.</p><p>Product problems shouldn’t slow you down — let us help make it right.</p>', NULL, NULL),
(22608, 32, 'App\\Models\\Page', 'df', 'meta_title', 'Product Support', NULL, NULL),
(22609, 33, 'App\\Models\\Page', 'df', 'title', 'Track Order', NULL, NULL),
(22610, 33, 'App\\Models\\Page', 'df', 'content', '<h2>Easily check the status of your orders and monitor delivery updates in real-time.<br></h2><p>After placing your order, you’ll want to know exactly where it is and when it will arrive. Our real-time tracking system helps you stay informed from the moment your order is placed until it reaches your door.</p><p>Here’s how to track your order:</p><ol><li><p>Log in to your account</p></li><li><p>Go to the “My Orders” section</p></li><li><p>Click on the specific order you want to track</p></li><li><p>You’ll see the current status, shipping updates, and estimated delivery date</p></li></ol><p>If your order includes multiple items from different sellers or stores, you may see individual tracking details for each shipment. This helps you understand when each product will arrive, especially in a multivendor environment like ours.</p><p>Tracking statuses you may see include:</p><ul><li><p>Order Placed</p></li><li><p>Processing by Seller</p></li><li><p>Picked Up by Courier</p></li><li><p>In Transit</p></li><li><p>Out for Delivery</p></li><li><p>Delivered</p></li></ul><p>If you don’t see updates, or if the tracking information seems stuck, feel free to contact our support team for help. Delays may sometimes occur due to weather, holidays, or shipping service issues — but we’re always here to provide clarity.</p><p>Stay informed and shop with confidence knowing you can follow every step of your delivery.</p>', NULL, NULL),
(22611, 33, 'App\\Models\\Page', 'df', 'meta_title', 'Track Order', NULL, NULL),
(22612, 5, 'App\\Models\\FlashSale', 'df', 'title', 'Your Daily Needs', NULL, NULL),
(22613, 5, 'App\\Models\\FlashSale', 'df', 'description', 'Get Now open all branch', NULL, NULL),
(22614, 5, 'App\\Models\\FlashSale', 'df', 'button_text', 'Shop Now', NULL, NULL),
(22615, 23, 'App\\Models\\Page', 'es', 'title', 'Conviértete en vendedor', NULL, NULL),
(22616, 23, 'App\\Models\\Page', 'es', 'content', '{\"login_register_section\":{\"register_title\":null,\"register_subtitle\":null,\"login_title\":null,\"login_subtitle\":null,\"agree_button_title\":null,\"background_image\":1205,\"background_image_url\":null},\"on_board_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Get Started\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1209},{\"title\":\"Build Your Store\",\"subtitle\":\"Customize your storefront, showcase your products, and attract customers.\",\"image\":1210},{\"title\":\"Add Your Products\",\"subtitle\":\"List, manage, and optimize your inventory with ease.\",\"image\":1211},{\"title\":\"Start Selling\",\"subtitle\":\"Connect with buyers, fulfill orders, and grow your sales.\",\"image\":1212},{\"title\":\"Earn & Grow\",\"subtitle\":\"Boost your revenue and unlock new business opportunities.\",\"image\":1213},{\"title\":\"Scale Your Business\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1214}]},\"video_section\":{\"section_title\":null,\"section_subtitle\":null,\"video_url\":\"https:\\/\\/www.youtube.com\\/watch?v=otej7WLdPh0\"},\"join_benefits_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Reach Millions of Customers\",\"subtitle\":\"Expand your business by connecting with a vast audience actively looking for products like yours.\",\"image\":1215},{\"title\":\"Hassle-Free Registration\",\"subtitle\":\"Sign up effortlessly and start selling without any hidden fees or long approval processes.\",\"image\":1216},{\"title\":\"Personalized Storefront\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1217},{\"title\":\"Product Management\",\"subtitle\":\"Easily add, update, and manage your inventory with our intuitive seller dashboard.\",\"image\":1218},{\"title\":\"Fast & Reliable Shipping\",\"subtitle\":\"Ensure smooth deliveries with SharpMart\\u2019s trusted logistics partners.\",\"image\":1219},{\"title\":\"Secure & Timely Payments\",\"subtitle\":\"Get paid directly to your bank account with a transparent and reliable payment system.\",\"image\":1220},{\"title\":\"Smart Marketing Tools\",\"subtitle\":\"Boost your sales with advertising, promotions, and data-driven marketing strategies.\",\"image\":1221},{\"title\":\"Dedicated Seller Support\",\"subtitle\":\"Get expert guidance, training resources, and 24\\/7 assistance for your business.\",\"image\":1222}]},\"faq_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"question\":\"How is a project delivered upon completion?\",\"answer\":\"The final delivery of a project follows a structured process to ensure quality, completeness, and client satisfaction. First, the project team conducts a thorough review and testing phase to verify that all components meet the required standards, ensuring\"},{\"question\":\"What is the payment process? Do you require upfront payment?\",\"answer\":\"Customize your storefront, showcase your products, and attract customers.\"},{\"question\":\"How is the final handover of a project carried out?\",\"answer\":\"List, manage, and optimize your inventory with ease.\"},{\"question\":\"How should the budget be divided among project categories?\",\"answer\":\"Connect with buyers, fulfill orders, and grow your sales.\"},{\"question\":\"Insights into project customization and monetization.\",\"answer\":\"Boost your revenue and unlock new business opportunities.\"}]},\"contact_section\":{\"title\":null,\"subtitle\":null,\"agree_button_title\":null,\"image\":1223,\"image_url\":null}}', NULL, NULL),
(22617, 23, 'App\\Models\\Page', 'ar', 'title', 'كن بائعًا', NULL, NULL),
(22618, 46, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Sofas', NULL, NULL),
(22619, 46, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Sofas', NULL, NULL),
(22620, 46, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Sofas', NULL, NULL),
(22621, 47, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Chairs', NULL, NULL),
(22622, 47, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Chairs', NULL, NULL),
(22623, 47, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Chairs', NULL, NULL),
(22624, 48, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Beds', NULL, NULL),
(22625, 48, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Beds', NULL, NULL),
(22626, 48, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Beds', NULL, NULL),
(22627, 49, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Tables', NULL, NULL),
(22628, 49, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Tables', NULL, NULL),
(22629, 49, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Tables', NULL, NULL),
(22630, 50, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Dressers', NULL, NULL),
(22631, 50, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Dressers', NULL, NULL),
(22632, 50, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Dressers', NULL, NULL),
(22633, 51, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Bookshelves', NULL, NULL),
(22634, 51, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Bookshelves', NULL, NULL),
(22635, 51, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Bookshelves', NULL, NULL),
(22636, 52, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Desks', NULL, NULL),
(22637, 52, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Desks', NULL, NULL),
(22638, 52, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Desks', NULL, NULL),
(22639, 44, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Women', NULL, NULL),
(22640, 44, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Women', NULL, NULL),
(22641, 44, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Women', NULL, NULL),
(22642, 40, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Clutches', NULL, NULL),
(22643, 40, 'App\\Models\\ProductCategory', 'df', 'meta_title', 'Clutches', NULL, NULL),
(22644, 40, 'App\\Models\\ProductCategory', 'df', 'meta_description', 'Clutches', NULL, NULL),
(22645, 88, 'App\\Models\\ProductCategory', 'df', 'category_name', 'Handbag', NULL, NULL),
(22646, 25, 'App\\Models\\Page', 'es', 'content', '{\"about_section\":{\"title\":null,\"subtitle\":null,\"description\":null,\"image\":1302,\"image_url\":null},\"story_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Our Vision and Beginning\",\"subtitle\":\"Transforming the eCommerce Landscape with a Vision to Connect Buyers and Sellers Seamlessly\",\"image\":1111},{\"title\":\"Overcoming Challenges\",\"subtitle\":\"Navigating Obstacles with Innovation to Build a Reliable and Secure Marketplace\",\"image\":1111},{\"title\":\"Our Future Vision\",\"subtitle\":\"Continuing to Innovate and Grow, Building a Sustainable eCommerce Ecosystem for the Future\",\"image\":1111}]},\"mission_and_vision_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Our Mission\",\"subtitle\":null,\"description\":null,\"image\":1115},{\"title\":\"Our vision\",\"subtitle\":null,\"description\":null,\"image\":1112}]},\"testimonial_and_success_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Bill Gates\",\"subtitle\":\"CEO\",\"description\":\"CEO\",\"image\":1300},{\"title\":\"John Anderson\",\"subtitle\":\"CTO\",\"description\":\"CTO\",\"image\":1300},{\"title\":\"Bill Gates\",\"subtitle\":\"CEO\",\"description\":\"CEO\",\"image\":1300},{\"title\":\"John Anderson\",\"subtitle\":\"CEO\",\"description\":\"CEO\",\"image\":1300}]}}', NULL, NULL),
(22662, 68, 'App\\Models\\ProductAttribute', 'df', 'name', 'use type', NULL, NULL),
(22663, 126, 'App\\Models\\SettingOption', 'df', 'content', '{\"gdpr_basic_section\":{\"com_gdpr_title\":\"GDPR & Cookie Settings\",\"com_gdpr_message\":\"We use cookies to personalize your experience and to analyze our traffic. You can choose to accept or decline.\",\"com_gdpr_more_info_label\":\"More Information\",\"com_gdpr_accept_label\":\"Accept\",\"com_gdpr_decline_label\":\"Decline\",\"com_gdpr_manage_label\":\"Manage\",\"com_gdpr_manage_title\":\"Manage Cookie Preferences\"},\"gdpr_more_info_section\":{\"section_title\":\"Aut dolore laborum Dolorem fugit voluptate\",\"section_details\":\"Aut dolore laborum Dolorem fugit voluptateAut dolore laborum Dolorem fugit voluptateAut dolore laborum Dolorem fugit voluptateAut dolore laborum Dolorem fugit voluptateAut dolore laborum Dolorem fugit voluptateAut dolore laborum Dolorem fugit voluptate\",\"steps\":[{\"title\":null,\"descriptions\":null,\"req_status\":null},{\"title\":null,\"descriptions\":null,\"req_status\":null},{\"title\":null,\"descriptions\":null,\"req_status\":null}]}}', NULL, NULL),
(22664, 126, 'App\\Models\\SettingOption', 'en', 'content', '{\"gdpr_basic_section\":{\"com_gdpr_title\":\"GDPR & Cookie Settings\",\"com_gdpr_message\":\"We use cookies to personalize your experience and to analyze our traffic. You can choose to accept or decline.\",\"com_gdpr_more_info_label\":\"More Information\",\"com_gdpr_accept_label\":\"Accept\",\"com_gdpr_decline_label\":\"Decline\",\"com_gdpr_manage_label\":\"Manage\",\"com_gdpr_manage_title\":\"Manage Cookie Preferences\"},\"gdpr_more_info_section\":{\"section_title\":\"What Customers are saying\",\"section_details\":\"When you visit our website, we and our third-party providers use cookies and similar technologies to:\\n\\nPersonalize your experience\\n\\nConduct analytics\\n\\nDeliver targeted online advertising\\n\\nIf you do not consent, only essential and functional cookies necessary for the website\\u2019s operation will be used, and your choice will be remembered for future visits.\",\"steps\":[{\"title\":\"Necessary Cookies\",\"descriptions\":\"Purpose: These are essential for your website to function properly.\\n\\nExamples:\\n\\nCookieHub \\u2013 Manages user consent for cookies.\\n\\nCloudflare \\u2013 Security, caching, and performance.\\n\\nWindows Azure \\u2013 Cloud services and session management.\\n\\nNotes: Cannot be disabled by users; without them, core functionality may break.\",\"req_status\":\"optional\"},{\"title\":\"Analytical Cookies\",\"descriptions\":\"Purpose: Help you understand how visitors interact with your website so you can improve it.\\n\\nExamples:\\n\\nGoogle Analytics \\u2013 Tracks page views, user behavior, and sessions.\\n\\nPostHog Analytics \\u2013 Similar to Google Analytics but can be self-hosted.\\n\\nNotes: Usually anonymous; users can often opt out.\",\"req_status\":\"optional\"},{\"title\":\"Marketing Cookies\",\"descriptions\":\"Purpose: Used to deliver personalized advertisements and track visitors across websites.\\n\\nExamples:\\n\\nGoogle Ads \\u2013 Shows targeted ads based on user behavior.\\n\\nYouTube \\u2013 Tracks engagement with video ads and recommendations.\\n\\nNotes: Requires user consent in most regions (GDPR\\/CCPA).\",\"req_status\":\"optional\"}]}}', NULL, NULL),
(22665, 126, 'App\\Models\\SettingOption', 'es', 'content', '{\"gdpr_basic_section\":{\"com_gdpr_title\":null,\"com_gdpr_message\":null,\"com_gdpr_more_info_label\":null,\"com_gdpr_accept_label\":null,\"com_gdpr_decline_label\":null,\"com_gdpr_manage_label\":null,\"com_gdpr_manage_title\":null},\"gdpr_more_info_section\":{\"section_title\":null,\"section_details\":null,\"steps\":[{\"title\":null,\"descriptions\":null,\"req_status\":null},{\"title\":null,\"descriptions\":null,\"req_status\":null},{\"title\":null,\"descriptions\":null,\"req_status\":null}]}}', NULL, NULL),
(22666, 126, 'App\\Models\\SettingOption', 'ar', 'content', '{\"gdpr_basic_section\":{\"com_gdpr_title\":null,\"com_gdpr_message\":null,\"com_gdpr_more_info_label\":null,\"com_gdpr_accept_label\":null,\"com_gdpr_decline_label\":null,\"com_gdpr_manage_label\":null,\"com_gdpr_manage_title\":null},\"gdpr_more_info_section\":{\"section_title\":null,\"section_details\":null,\"steps\":[{\"title\":null,\"descriptions\":null,\"req_status\":null},{\"title\":null,\"descriptions\":null,\"req_status\":null},{\"title\":null,\"descriptions\":null,\"req_status\":null}]}}', NULL, NULL),
(23003, 8695, 'App\\Models\\Permissions', 'en', 'perm_title', 'Dashboard', NULL, NULL),
(23004, 8695, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة المناطق', NULL, NULL),
(23005, 8696, 'App\\Models\\Permissions', 'en', 'perm_title', 'POS Management', NULL, NULL),
(23006, 8696, 'App\\Models\\Permissions', 'ar', 'perm_title', 'نقاط البيع', NULL, NULL),
(23007, 8697, 'App\\Models\\Permissions', 'en', 'perm_title', 'POS', NULL, NULL),
(23008, 8697, 'App\\Models\\Permissions', 'ar', 'perm_title', 'المبيعات', NULL, NULL),
(23009, 8698, 'App\\Models\\Permissions', 'en', 'perm_title', 'POS', NULL, NULL),
(23010, 8698, 'App\\Models\\Permissions', 'ar', 'perm_title', 'المبيعات', NULL, NULL),
(23011, 8699, 'App\\Models\\Permissions', 'en', 'perm_title', 'Orders', NULL, NULL),
(23012, 8699, 'App\\Models\\Permissions', 'ar', 'perm_title', 'طلبات', NULL, NULL),
(23013, 8700, 'App\\Models\\Permissions', 'en', 'perm_title', 'Orders & Reviews', NULL, NULL),
(23014, 8700, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة المناطق', NULL, NULL),
(23015, 8701, 'App\\Models\\Permissions', 'en', 'perm_title', 'Orders', NULL, NULL),
(23016, 8701, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة المناطق', NULL, NULL),
(23017, 8702, 'App\\Models\\Permissions', 'en', 'perm_title', 'All Orders', NULL, NULL),
(23018, 8702, 'App\\Models\\Permissions', 'ar', 'perm_title', 'جميع الطلبات', NULL, NULL),
(23019, 8703, 'App\\Models\\Permissions', 'en', 'perm_title', 'Returned or Refunded', NULL, NULL),
(23020, 8703, 'App\\Models\\Permissions', 'ar', 'perm_title', 'تم إرجاعه أو استرداده', NULL, NULL),
(23021, 8704, 'App\\Models\\Permissions', 'en', 'perm_title', 'Product management', NULL, NULL),
(23022, 8704, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة المناطق', NULL, NULL),
(23023, 8705, 'App\\Models\\Permissions', 'en', 'perm_title', 'Products', NULL, NULL),
(23024, 8705, 'App\\Models\\Permissions', 'ar', 'perm_title', 'منتجات', NULL, NULL),
(23025, 8706, 'App\\Models\\Permissions', 'en', 'perm_title', 'Manage Products', NULL, NULL),
(23026, 8706, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة المنتجات', NULL, NULL),
(23027, 8707, 'App\\Models\\Permissions', 'en', 'perm_title', 'Add New Product', NULL, NULL),
(23028, 8707, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إضافة منتج جديد', NULL, NULL),
(23029, 8708, 'App\\Models\\Permissions', 'en', 'perm_title', 'Product Low & Out Stock', NULL, NULL),
(23030, 8708, 'App\\Models\\Permissions', 'ar', 'perm_title', ' المنتجات منخفضة المخزون', NULL, NULL),
(23031, 8709, 'App\\Models\\Permissions', 'en', 'perm_title', 'Inventory', NULL, NULL),
(23032, 8709, 'App\\Models\\Permissions', 'ar', 'perm_title', 'السحوبات', NULL, NULL),
(23033, 8710, 'App\\Models\\Permissions', 'en', 'perm_title', 'Bulk Import', NULL, NULL),
(23034, 8710, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الاستيراد بالجملة', NULL, NULL),
(23035, 8711, 'App\\Models\\Permissions', 'en', 'perm_title', 'Bulk Export', NULL, NULL),
(23036, 8711, 'App\\Models\\Permissions', 'ar', 'perm_title', 'التصدير بالجملة', NULL, NULL),
(23037, 8712, 'App\\Models\\Permissions', 'en', 'perm_title', 'Attribute List', NULL, NULL),
(23038, 8712, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة السمات', NULL, NULL),
(23039, 8713, 'App\\Models\\Permissions', 'en', 'perm_title', 'Author List', NULL, NULL),
(23040, 8713, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة المؤلفين', NULL, NULL),
(23041, 8714, 'App\\Models\\Permissions', 'en', 'perm_title', 'Promotional control', NULL, NULL),
(23042, 8714, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الرقابة الترويجية', NULL, NULL),
(23043, 8715, 'App\\Models\\Permissions', 'en', 'perm_title', 'Flash Sale', NULL, NULL),
(23044, 8715, 'App\\Models\\Permissions', 'ar', 'perm_title', 'بيع سريع', NULL, NULL),
(23045, 8716, 'App\\Models\\Permissions', 'en', 'perm_title', 'Active Deals', NULL, NULL),
(23046, 8716, 'App\\Models\\Permissions', 'ar', 'perm_title', 'عروض فلاش متاحة', NULL, NULL),
(23047, 8717, 'App\\Models\\Permissions', 'en', 'perm_title', 'My Deals', NULL, NULL),
(23048, 8717, 'App\\Models\\Permissions', 'ar', 'perm_title', 'منتجاتي في العروض', NULL, NULL),
(23049, 8718, 'App\\Models\\Permissions', 'en', 'perm_title', 'Communication Center', NULL, NULL),
(23050, 8718, 'App\\Models\\Permissions', 'ar', 'perm_title', 'مركز الاتصالات', NULL, NULL),
(23051, 8719, 'App\\Models\\Permissions', 'en', 'perm_title', 'Chat', NULL, NULL),
(23052, 8719, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات الدردشة', NULL, NULL),
(23053, 8720, 'App\\Models\\Permissions', 'en', 'perm_title', 'Support Ticket', NULL, NULL),
(23054, 8720, 'App\\Models\\Permissions', 'ar', 'perm_title', 'السحوبات', NULL, NULL),
(23055, 8721, 'App\\Models\\Permissions', 'en', 'perm_title', 'All Notifications', NULL, NULL),
(23056, 8721, 'App\\Models\\Permissions', 'ar', 'perm_title', 'كل الإشعارات', NULL, NULL),
(23057, 8722, 'App\\Models\\Permissions', 'en', 'perm_title', 'Feedback control', NULL, NULL),
(23058, 8722, 'App\\Models\\Permissions', 'ar', 'perm_title', 'التحكم في ردود الفعل', NULL, NULL),
(23059, 8723, 'App\\Models\\Permissions', 'en', 'perm_title', 'Reviews', NULL, NULL),
(23060, 8723, 'App\\Models\\Permissions', 'ar', 'perm_title', '/الدردشة', NULL, NULL),
(23061, 8724, 'App\\Models\\Permissions', 'en', 'perm_title', 'Questions', NULL, NULL),
(23062, 8724, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الأسئلة/الدردشة', NULL, NULL),
(23063, 8725, 'App\\Models\\Permissions', 'en', 'perm_title', 'Financial Management', NULL, NULL),
(23064, 8725, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الإدارة المالية', NULL, NULL),
(23065, 8726, 'App\\Models\\Permissions', 'en', 'perm_title', 'Withdrawals', NULL, NULL),
(23066, 8726, 'App\\Models\\Permissions', 'ar', 'perm_title', 'السحوبات', NULL, NULL),
(23067, 8727, 'App\\Models\\Permissions', 'en', 'perm_title', 'Store Wallet', NULL, NULL),
(23068, 8727, 'App\\Models\\Permissions', 'ar', 'perm_title', 'محفظتي', NULL, NULL),
(23069, 8728, 'App\\Models\\Permissions', 'en', 'perm_title', 'Staff control', NULL, NULL),
(23070, 8728, 'App\\Models\\Permissions', 'ar', 'perm_title', 'التحكم بالمستخدم', NULL, NULL),
(23071, 8729, 'App\\Models\\Permissions', 'en', 'perm_title', 'Staff List', NULL, NULL),
(23072, 8729, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة', NULL, NULL),
(23073, 8730, 'App\\Models\\Permissions', 'en', 'perm_title', 'Store Settings', NULL, NULL);
INSERT INTO `translations` (`id`, `translatable_id`, `translatable_type`, `language`, `key`, `value`, `created_at`, `updated_at`) VALUES
(23074, 8730, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات المتجر', NULL, NULL),
(23075, 8731, 'App\\Models\\Permissions', 'en', 'perm_title', 'Business Plan', NULL, NULL),
(23076, 8731, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إشعار المتجر', NULL, NULL),
(23077, 8732, 'App\\Models\\Permissions', 'en', 'perm_title', 'Store Notice', NULL, NULL),
(23078, 8732, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إشعار المتجر', NULL, NULL),
(23079, 8733, 'App\\Models\\Permissions', 'en', 'perm_title', 'My Stores', NULL, NULL),
(23080, 8733, 'App\\Models\\Permissions', 'ar', 'perm_title', 'متاجري', NULL, NULL),
(24079, 1, 'Modules\\PaymentGateways\\app\\Models\\Currency', 'en', 'name', 'BDT', NULL, NULL),
(24080, 1, 'Modules\\PaymentGateways\\app\\Models\\Currency', 'ar', 'name', 'دولار', NULL, NULL),
(24081, 2, 'Modules\\PaymentGateways\\app\\Models\\Currency', 'en', 'name', 'BDT', NULL, NULL),
(24082, 2, 'Modules\\PaymentGateways\\app\\Models\\Currency', 'ar', 'name', 'دولار', NULL, NULL),
(24083, 3, 'Modules\\PaymentGateways\\app\\Models\\Currency', 'df', 'name', 'USD', NULL, NULL),
(24084, 4, 'Modules\\PaymentGateways\\app\\Models\\Currency', 'df', 'name', 'Joan Wall', NULL, NULL),
(24085, 5, 'Modules\\PaymentGateways\\app\\Models\\Currency', 'df', 'name', 'Zeus Fox', NULL, NULL),
(24086, 6, 'Modules\\PaymentGateways\\app\\Models\\Currency', 'df', 'name', 'BDT', NULL, NULL),
(24087, 7, 'Modules\\PaymentGateways\\app\\Models\\Currency', 'df', 'name', 'EUR', NULL, NULL),
(24088, 7, 'Modules\\PaymentGateways\\app\\Models\\Currency', 'en', 'name', 'EUR', NULL, NULL),
(24089, 7, 'Modules\\PaymentGateways\\app\\Models\\Currency', 'es', 'name', 'EUR', NULL, NULL),
(24090, 7, 'Modules\\PaymentGateways\\app\\Models\\Currency', 'ar', 'name', 'EUR', NULL, NULL),
(24363, 8, 'Modules\\PaymentGateways\\app\\Models\\Currency', 'df', 'name', 'Mara Carey', NULL, NULL),
(24673, 2, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'RT', NULL, NULL),
(24674, 2, 'App\\Models\\DynamicFieldValue', 'ar', 'value', 'لون', NULL, NULL),
(24715, 26, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Molestias deserunt consequatur Quas numquam incididunt at nostrum', NULL, NULL),
(24716, 26, 'App\\Models\\DynamicFieldValue', 'ar', 'value', 'Id ea id explicabo Quae qui nihil ut laudantium', NULL, NULL),
(24717, 27, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Harum dolorem in sunt proident dignissimos culpa consectetur labore do officiis inventore ut', NULL, NULL),
(24718, 28, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Aspernatur eos voluptatibus exercitation consequat Consectetur occaecat', NULL, NULL),
(24719, 29, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Dolor ea dolorem dolorem accusantium quis voluptatum culpa quia aut', NULL, NULL),
(24720, 30, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Atque cillum ullamco vero maxime consectetur dolor est totam consequatur exercitationem et aute', NULL, NULL),
(24721, 31, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Nam id maxime porro do ea ut non officiis ex eiusmod facere consectetur quia esse at nobis aute dolor rerum', NULL, NULL),
(24722, 32, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Dolore elit autem rerum reiciendis est est at sunt sunt assumenda dolores excepteur', NULL, NULL),
(24723, 33, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Accusantium qui dicta ab maxime nemo quasi praesentium', NULL, NULL),
(24724, 34, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Culpa sequi ipsum reprehenderit excepturi laborum nihil vel consequatur Excepturi dolore beatae', NULL, NULL),
(24725, 35, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Et et quas consectetur quis at', NULL, NULL),
(24726, 36, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Consequat Ullamco numquam incidunt veniam ullam ullam culpa et et labore magni rerum est repellendus Esse rerum corporis nisi beatae', NULL, NULL),
(24727, 37, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Explicabo Anim nulla dolor dolor maiores recusandae Accusamus', NULL, NULL),
(24728, 38, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Delectus sit nihil optio aliquip consectetur non rem ad error illo et Nam vero corporis corporis quo aliquid sint quaerat', NULL, NULL),
(24731, 40, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'fdsfsd', NULL, NULL),
(24734, 42, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Select 2', NULL, NULL),
(24737, 44, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Input 2', NULL, NULL),
(24743, 46, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Synthetic', NULL, NULL),
(24744, 46, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Synthetic', NULL, NULL),
(24745, 46, 'App\\Models\\DynamicFieldValue', 'es', 'value', 'Sintético', NULL, NULL),
(24746, 46, 'App\\Models\\DynamicFieldValue', 'ar', 'value', 'اصطناعي', NULL, NULL),
(24747, 47, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Canvas', NULL, NULL),
(24748, 47, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Canvas', NULL, NULL),
(24749, 47, 'App\\Models\\DynamicFieldValue', 'es', 'value', 'Lona', NULL, NULL),
(24750, 47, 'App\\Models\\DynamicFieldValue', 'ar', 'value', 'قماش', NULL, NULL),
(24751, 14, 'App\\Models\\DynamicField', 'df', 'name', 'Dimensions', NULL, NULL),
(24752, 48, 'App\\Models\\DynamicFieldValue', 'df', 'value', '40cm x 30cm', NULL, NULL),
(24753, 48, 'App\\Models\\DynamicFieldValue', 'en', 'value', '40cm x 30cm', NULL, NULL),
(24754, 49, 'App\\Models\\DynamicFieldValue', 'df', 'value', '30cm x 20cm', NULL, NULL),
(24755, 49, 'App\\Models\\DynamicFieldValue', 'en', 'value', '30cm x 20cm', NULL, NULL),
(24756, 50, 'App\\Models\\DynamicFieldValue', 'df', 'value', '50cm x 40cm', NULL, NULL),
(24757, 50, 'App\\Models\\DynamicFieldValue', 'en', 'value', '50cm x 40cm', NULL, NULL),
(24758, 15, 'App\\Models\\DynamicField', 'df', 'name', 'Waterproof', NULL, NULL),
(24759, 51, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Yes', NULL, NULL),
(24760, 51, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Yes', NULL, NULL),
(24761, 51, 'App\\Models\\DynamicFieldValue', 'ar', 'value', 'نعم', NULL, NULL),
(24762, 52, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'No', NULL, NULL),
(24763, 52, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'No', NULL, NULL),
(24764, 52, 'App\\Models\\DynamicFieldValue', 'ar', 'value', 'لا', NULL, NULL),
(24765, 16, 'App\\Models\\DynamicField', 'df', 'name', 'Strap', NULL, NULL),
(24778, 18, 'App\\Models\\DynamicField', 'df', 'name', 'Skin Type', NULL, NULL),
(24779, 54, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Oily', NULL, NULL),
(24780, 54, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Oily', NULL, NULL),
(24781, 55, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Dry', NULL, NULL),
(24782, 55, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Dry', NULL, NULL),
(24783, 56, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Sensitive', NULL, NULL),
(24784, 56, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Sensitive', NULL, NULL),
(24785, 19, 'App\\Models\\DynamicField', 'df', 'name', 'Material', NULL, NULL),
(24786, 57, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Leather', NULL, NULL),
(24789, 20, 'App\\Models\\DynamicField', 'df', 'name', 'Dosage Form', NULL, NULL),
(24790, 58, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Syrup', NULL, NULL),
(24791, 59, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Capsule', NULL, NULL),
(24792, 60, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Tablet', NULL, NULL),
(24795, 21, 'App\\Models\\DynamicField', 'df', 'name', 'Gender', NULL, NULL),
(24796, 61, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Male', NULL, NULL),
(24797, 62, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Female', NULL, NULL),
(24798, 63, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Others', NULL, NULL),
(24869, 21, 'App\\Models\\DynamicField', 'en', 'name', 'Gender', NULL, NULL),
(24870, 60, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Tablet', NULL, NULL),
(24871, 59, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Capsule', NULL, NULL),
(24872, 58, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Syrup', NULL, NULL),
(24873, 64, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Injection', NULL, NULL),
(24874, 64, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Injection', NULL, NULL),
(24875, 65, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Ointment', NULL, NULL),
(24876, 65, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Ointment', NULL, NULL),
(24877, 20, 'App\\Models\\DynamicField', 'en', 'name', 'Dosage Form', NULL, NULL),
(24878, 57, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Leather', NULL, NULL),
(24879, 66, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Canvas', NULL, NULL),
(24880, 66, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Canvas', NULL, NULL),
(24881, 67, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Nylon', NULL, NULL),
(24882, 67, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Nylon', NULL, NULL),
(24883, 68, 'App\\Models\\DynamicFieldValue', 'df', 'value', 'Cotton', NULL, NULL),
(24884, 68, 'App\\Models\\DynamicFieldValue', 'en', 'value', 'Cotton', NULL, NULL),
(24885, 19, 'App\\Models\\DynamicField', 'en', 'name', 'Material', NULL, NULL),
(25007, 36, 'App\\Models\\Page', 'df', 'title', 'Become A Seller  Theme Two', NULL, NULL),
(25008, 36, 'App\\Models\\Page', 'df', 'content', '{\"login_register_section\":{\"register_title\":\"Create seller account.\",\"register_subtitle\":\"Enter your personal data to create your account\",\"login_title\":\"Login In\",\"login_subtitle\":\"Login in now\",\"agree_button_title\":null,\"background_image\":1098,\"background_image_url\":null},\"on_board_section\":{\"title\":\"Why Start Selling on Quick Ecommerce?\",\"subtitle\":\"The first Unified Go-to-market Platform, Disrobed has all the tools you need to effortlessly run your sales organization\",\"steps\":[{\"title\":\"Get Started\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1093},{\"title\":\"Build Your Store\",\"subtitle\":\"Customize your storefront, showcase your products, and attract customers.\",\"image\":1094},{\"title\":\"Add Your Products\",\"subtitle\":\"List, manage, and optimize your inventory with ease.\",\"image\":1095},{\"title\":\"Start Selling\",\"subtitle\":\"Connect with buyers, fulfill orders, and grow your sales.\",\"image\":1096},{\"title\":\"Earn & Grow\",\"subtitle\":\"Boost your revenue and unlock new business opportunities.\",\"image\":1097},{\"title\":\"Scale Your Business\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1098}]},\"video_section\":{\"section_title\":\"What Customers are saying\",\"section_subtitle\":\"I\'ve never come across a platform that makes onboarding, scaling, and customization so effortless\\u2014seamlessly adapting to your workflow, team, clients, and evolving needs.\",\"video_url\":null},\"join_benefits_section\":{\"title\":\"Why Sell on Quick Ecommerce?\",\"subtitle\":\"Join thousands of successful sellers and grow your business with Quick Ecommerce\'s powerful e-commerce platform.\",\"steps\":[{\"title\":\"Reach Millions of Customers\",\"subtitle\":\"Expand your business by connecting with a vast audience actively looking for products like yours.\",\"image\":1101},{\"title\":\"Hassle-Free Registration\",\"subtitle\":\"Sign up effortlessly and start selling without any hidden fees or long approval processes.\",\"image\":1100},{\"title\":\"Personalized Storefront\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1099},{\"title\":\"Product Management\",\"subtitle\":\"Easily add, update, and manage your inventory with our intuitive seller dashboard.\",\"image\":1102},{\"title\":\"Fast & Reliable Shipping\",\"subtitle\":\"Ensure smooth deliveries with SharpMart\\u2019s trusted logistics partners.\",\"image\":1103},{\"title\":\"Secure & Timely Payments\",\"subtitle\":\"Get paid directly to your bank account with a transparent and reliable payment system.\",\"image\":1104},{\"title\":\"Smart Marketing Tools\",\"subtitle\":\"Boost your sales with advertising, promotions, and data-driven marketing strategies.\",\"image\":1105},{\"title\":\"Dedicated Seller Support\",\"subtitle\":\"Get expert guidance, training resources, and 24\\/7 assistance for your business.\",\"image\":1106},{\"title\":\"Scale & Succeed\",\"subtitle\":\"Use data-driven analytics and business insights to optimize and expand your sales.\",\"image\":1107}]},\"faq_section\":{\"title\":\"Frequently Ask Questions\",\"subtitle\":\"Key information and answers regarding our services and policies.\",\"steps\":[{\"question\":\"How is a project delivered upon completion?\",\"answer\":\"The final delivery of a project follows a structured process to ensure quality, completeness, and client satisfaction. First, the project team conducts a thorough review and testing phase to verify that all components meet the required standards, ensuring\"},{\"question\":\"What is the payment process? Do you require upfront payment?\",\"answer\":\"Customize your storefront, showcase your products, and attract customers.\"},{\"question\":\"How is the final handover of a project carried out?\",\"answer\":\"List, manage, and optimize your inventory with ease.\"},{\"question\":\"How should the budget be divided among project categories?\",\"answer\":\"Connect with buyers, fulfill orders, and grow your sales.\"},{\"question\":\"Insights into project customization and monetization.\",\"answer\":\"Boost your revenue and unlock new business opportunities.\"}]},\"contact_section\":{\"title\":\"Need help? Our experts are here for you.\",\"subtitle\":\"Our experts are here to assist with any questions about our products, services, or more. Feel free to ask\\u2014we\'re ready to help! Let us make things easier for you.\",\"agree_button_title\":\"I agree to the terms and conditions.\",\"image\":1108,\"image_url\":null}}', NULL, NULL),
(25009, 36, 'App\\Models\\Page', 'df', 'meta_title', 'Become', NULL, NULL),
(25010, 36, 'App\\Models\\Page', 'df', 'meta_description', 'Become A seller Updated Become A seller Updated', NULL, NULL),
(25011, 36, 'App\\Models\\Page', 'df', 'meta_keywords', 'Become, seller', NULL, NULL),
(25012, 36, 'App\\Models\\Page', 'en', 'content', '{\"login_register_section\":{\"register_title\":\"Create seller account.\",\"register_subtitle\":\"Enter your personal data to create your account\",\"login_title\":\"Login In\",\"login_subtitle\":\"Login in now\",\"agree_button_title\":null,\"background_image\":1098,\"background_image_url\":null},\"on_board_section\":{\"title\":\"Why Start Selling on Quick Ecommerce?\",\"subtitle\":\"The first Unified Go-to-market Platform, Disrobed has all the tools you need to effortlessly run your sales organization\",\"steps\":[{\"title\":\"Get Started\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1093},{\"title\":\"Build Your Store\",\"subtitle\":\"Customize your storefront, showcase your products, and attract customers.\",\"image\":1094},{\"title\":\"Add Your Products\",\"subtitle\":\"List, manage, and optimize your inventory with ease.\",\"image\":1095},{\"title\":\"Start Selling\",\"subtitle\":\"Connect with buyers, fulfill orders, and grow your sales.\",\"image\":1096},{\"title\":\"Earn & Grow\",\"subtitle\":\"Boost your revenue and unlock new business opportunities.\",\"image\":1097},{\"title\":\"Scale Your Business\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1098}]},\"video_section\":{\"section_title\":\"What Customers are saying\",\"section_subtitle\":\"I\'ve never come across a platform that makes onboarding, scaling, and customization so effortless\\u2014seamlessly adapting to your workflow, team, clients, and evolving needs.\",\"video_url\":null},\"join_benefits_section\":{\"title\":\"Why Sell on Quick Ecommerce?\",\"subtitle\":\"Join thousands of successful sellers and grow your business with Quick Ecommerce powerful e-commerce platform.\",\"steps\":[{\"title\":\"Reach Millions of Customers\",\"subtitle\":\"Expand your business by connecting with a vast audience actively looking for products like yours.\",\"image\":1101},{\"title\":\"Hassle-Free Registration\",\"subtitle\":\"Sign up effortlessly and start selling without any hidden fees or long approval processes.\",\"image\":1100},{\"title\":\"Personalized Storefront\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1099},{\"title\":\"Product Management\",\"subtitle\":\"Easily add, update, and manage your inventory with our intuitive seller dashboard.\",\"image\":1102},{\"title\":\"Fast & Reliable Shipping\",\"subtitle\":\"Ensure smooth deliveries with SharpMart\\u2019s trusted logistics partners.\",\"image\":1103},{\"title\":\"Secure & Timely Payments\",\"subtitle\":\"Get paid directly to your bank account with a transparent and reliable payment system.\",\"image\":1104},{\"title\":\"Smart Marketing Tools\",\"subtitle\":\"Boost your sales with advertising, promotions, and data-driven marketing strategies.\",\"image\":1105},{\"title\":\"Dedicated Seller Support\",\"subtitle\":\"Get expert guidance, training resources, and 24\\/7 assistance for your business.\",\"image\":1106},{\"title\":\"Scale & Succeed\",\"subtitle\":\"Use data-driven analytics and business insights to optimize and expand your sales.\",\"image\":1107}]},\"faq_section\":{\"title\":\"Frequently Ask Questions\",\"subtitle\":\"Key information and answers regarding our services and policies.\",\"steps\":[{\"question\":\"How is a project delivered upon completion?\",\"answer\":\"The final delivery of a project follows a structured process to ensure quality, completeness, and client satisfaction. First, the project team conducts a thorough review and testing phase to verify that all components meet the required standards, ensuring\"},{\"question\":\"What is the payment process? Do you require upfront payment?\",\"answer\":\"Customize your storefront, showcase your products, and attract customers.\"},{\"question\":\"How is the final handover of a project carried out?\",\"answer\":\"List, manage, and optimize your inventory with ease.\"},{\"question\":\"How should the budget be divided among project categories?\",\"answer\":\"Connect with buyers, fulfill orders, and grow your sales.\"},{\"question\":\"Insights into project customization and monetization.\",\"answer\":\"Boost your revenue and unlock new business opportunities.\"}]},\"contact_section\":{\"title\":\"Need help? Our experts are here for you.\",\"subtitle\":\"Our experts are here to assist with any questions about our products, services, or more. Feel free to ask\\u2014we\'re ready to help! Let us make things easier for you.\",\"agree_button_title\":\"I agree to the terms and conditions.\",\"image\":1108,\"image_url\":null}}', NULL, NULL),
(25013, 36, 'App\\Models\\Page', 'es', 'content', '{\"login_register_section\":{\"register_title\":null,\"register_subtitle\":null,\"login_title\":null,\"login_subtitle\":null,\"agree_button_title\":null,\"background_image\":1098,\"background_image_url\":null},\"on_board_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Get Started\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1093},{\"title\":\"Build Your Store\",\"subtitle\":\"Customize your storefront, showcase your products, and attract customers.\",\"image\":1094},{\"title\":\"Add Your Products\",\"subtitle\":\"List, manage, and optimize your inventory with ease.\",\"image\":1095},{\"title\":\"Start Selling\",\"subtitle\":\"Connect with buyers, fulfill orders, and grow your sales.\",\"image\":1096},{\"title\":\"Earn & Grow\",\"subtitle\":\"Boost your revenue and unlock new business opportunities.\",\"image\":1097},{\"title\":\"Scale Your Business\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1098}]},\"video_section\":{\"section_title\":null,\"section_subtitle\":null,\"video_url\":null},\"join_benefits_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Reach Millions of Customers\",\"subtitle\":\"Expand your business by connecting with a vast audience actively looking for products like yours.\",\"image\":1101},{\"title\":\"Hassle-Free Registration\",\"subtitle\":\"Sign up effortlessly and start selling without any hidden fees or long approval processes.\",\"image\":1100},{\"title\":\"Personalized Storefront\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1099},{\"title\":\"Product Management\",\"subtitle\":\"Easily add, update, and manage your inventory with our intuitive seller dashboard.\",\"image\":1102},{\"title\":\"Fast & Reliable Shipping\",\"subtitle\":\"Ensure smooth deliveries with SharpMart\\u2019s trusted logistics partners.\",\"image\":1103},{\"title\":\"Secure & Timely Payments\",\"subtitle\":\"Get paid directly to your bank account with a transparent and reliable payment system.\",\"image\":1104},{\"title\":\"Smart Marketing Tools\",\"subtitle\":\"Boost your sales with advertising, promotions, and data-driven marketing strategies.\",\"image\":1105},{\"title\":\"Dedicated Seller Support\",\"subtitle\":\"Get expert guidance, training resources, and 24\\/7 assistance for your business.\",\"image\":1106},{\"title\":\"Scale & Succeed\",\"subtitle\":\"Use data-driven analytics and business insights to optimize and expand your sales.\",\"image\":1107}]},\"faq_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"question\":\"How is a project delivered upon completion?\",\"answer\":\"The final delivery of a project follows a structured process to ensure quality, completeness, and client satisfaction. First, the project team conducts a thorough review and testing phase to verify that all components meet the required standards, ensuring\"},{\"question\":\"What is the payment process? Do you require upfront payment?\",\"answer\":\"Customize your storefront, showcase your products, and attract customers.\"},{\"question\":\"How is the final handover of a project carried out?\",\"answer\":\"List, manage, and optimize your inventory with ease.\"},{\"question\":\"How should the budget be divided among project categories?\",\"answer\":\"Connect with buyers, fulfill orders, and grow your sales.\"},{\"question\":\"Insights into project customization and monetization.\",\"answer\":\"Boost your revenue and unlock new business opportunities.\"}]},\"contact_section\":{\"title\":null,\"subtitle\":null,\"agree_button_title\":null,\"image\":1108,\"image_url\":null}}', NULL, NULL),
(25014, 36, 'App\\Models\\Page', 'ar', 'content', '{\"login_register_section\":{\"register_title\":\"\\u0625\\u0646\\u0634\\u0627\\u0621 \\u062d\\u0633\\u0627\\u0628 \\u0627\\u0644\\u0628\\u0627\\u0626\\u0639.\",\"register_subtitle\":\"\\u0623\\u062f\\u062e\\u0644 \\u0628\\u064a\\u0627\\u0646\\u0627\\u062a\\u0643 \\u0627\\u0644\\u0634\\u062e\\u0635\\u064a\\u0629 \\u0644\\u0625\\u0646\\u0634\\u0627\\u0621 \\u062d\\u0633\\u0627\\u0628\\u0643\",\"login_title\":\"\\u062a\\u0633\\u062c\\u064a\\u0644 \\u0627\\u0644\\u062f\\u062e\\u0648\\u0644\",\"login_subtitle\":\"\\u062a\\u0633\\u062c\\u064a\\u0644 \\u0627\\u0644\\u062f\\u062e\\u0648\\u0644 \\u0627\\u0644\\u0622\\u0646\",\"agree_button_title\":null,\"background_image\":1098,\"background_image_url\":null},\"on_board_section\":{\"title\":\"\\u0644\\u0645\\u0627\\u0630\\u0627 \\u062a\\u0628\\u062f\\u0623 \\u0627\\u0644\\u0628\\u064a\\u0639 \\u0639\\u0644\\u0649 \\u0627\\u0644\\u062a\\u062c\\u0627\\u0631\\u0629 \\u0627\\u0644\\u0625\\u0644\\u0643\\u062a\\u0631\\u0648\\u0646\\u064a\\u0629 \\u0627\\u0644\\u0633\\u0631\\u064a\\u0639\\u0629\\u061f\",\"subtitle\":\"\\u0623\\u0648\\u0644 \\u0645\\u0646\\u0635\\u0629 \\u0645\\u0648\\u062d\\u062f\\u0629 \\u0644\\u0637\\u0631\\u062d \\u0627\\u0644\\u0645\\u0646\\u062a\\u062c\\u0627\\u062a \\u0641\\u064a \\u0627\\u0644\\u0633\\u0648\\u0642\\u060c Disrobed \\u062a\\u062d\\u062a\\u0648\\u064a \\u0639\\u0644\\u0649 \\u062c\\u0645\\u064a\\u0639 \\u0627\\u0644\\u0623\\u062f\\u0648\\u0627\\u062a \\u0627\\u0644\\u062a\\u064a \\u062a\\u062d\\u062a\\u0627\\u062c\\u0647\\u0627 \\u0644\\u0625\\u062f\\u0627\\u0631\\u0629 \\u0645\\u0624\\u0633\\u0633\\u062a\\u0643 \\u0627\\u0644\\u0645\\u0628\\u064a\\u0639\\u0627\\u062a \\u0628\\u0633\\u0647\\u0648\\u0644\\u0629\",\"steps\":[{\"title\":\"\\u0627\\u0644\\u0628\\u062f\\u0621\",\"subtitle\":\"\\u0633\\u062c\\u0644 \\u0645\\u062c\\u0627\\u0646\\u064b\\u0627 \\u0648\\u0627\\u0628\\u062f\\u0623 \\u0631\\u062d\\u0644\\u062a\\u0643 \\u0643\\u0628\\u0627\\u0626\\u0639 \\u0646\\u0627\\u062c\\u062d.\",\"image\":1093},{\"title\":\"\\u0642\\u0645 \\u0628\\u0628\\u0646\\u0627\\u0621 \\u0645\\u062a\\u062c\\u0631\\u0643\",\"subtitle\":\"\\u0642\\u0645 \\u0628\\u062a\\u062e\\u0635\\u064a\\u0635 \\u0648\\u0627\\u062c\\u0647\\u0629 \\u0645\\u062a\\u062c\\u0631\\u0643\\u060c \\u0648\\u0639\\u0631\\u0636 \\u0645\\u0646\\u062a\\u062c\\u0627\\u062a\\u0643\\u060c \\u0648\\u062c\\u0630\\u0628 \\u0627\\u0644\\u0639\\u0645\\u0644\\u0627\\u0621.\",\"image\":1094},{\"title\":\"\\u0623\\u0636\\u0641 \\u0645\\u0646\\u062a\\u062c\\u0627\\u062a\\u0643\",\"subtitle\":\"\\u0642\\u0645 \\u0628\\u0625\\u062f\\u0631\\u0627\\u062c \\u0645\\u062e\\u0632\\u0648\\u0646\\u0643 \\u0648\\u0625\\u062f\\u0627\\u0631\\u062a\\u0647 \\u0648\\u062a\\u062d\\u0633\\u064a\\u0646\\u0647 \\u0628\\u0643\\u0644 \\u0633\\u0647\\u0648\\u0644\\u0629.\",\"image\":1095},{\"title\":\"\\u0627\\u0628\\u062f\\u0623 \\u0627\\u0644\\u0628\\u064a\\u0639\",\"subtitle\":\"\\u062a\\u0648\\u0627\\u0635\\u0644 \\u0645\\u0639 \\u0627\\u0644\\u0645\\u0634\\u062a\\u0631\\u064a\\u0646\\u060c \\u0648\\u0642\\u0645 \\u0628\\u062a\\u0646\\u0641\\u064a\\u0630 \\u0627\\u0644\\u0637\\u0644\\u0628\\u0627\\u062a\\u060c \\u0648\\u0632\\u062f \\u0645\\u0628\\u064a\\u0639\\u0627\\u062a\\u0643.\",\"image\":1096},{\"title\":\"\\u0627\\u0643\\u0633\\u0628 \\u0648\\u0646\\u0645\\u0648\",\"subtitle\":\"\\u0639\\u0632\\u0632 \\u0625\\u064a\\u0631\\u0627\\u062f\\u0627\\u062a\\u0643 \\u0648\\u0627\\u0643\\u062a\\u0634\\u0641 \\u0641\\u0631\\u0635 \\u0639\\u0645\\u0644 \\u062c\\u062f\\u064a\\u062f\\u0629.\",\"image\":1097},{\"title\":\"\\u0642\\u0645 \\u0628\\u062a\\u0648\\u0633\\u064a\\u0639 \\u0646\\u0637\\u0627\\u0642 \\u0639\\u0645\\u0644\\u0643\",\"subtitle\":\"\\u0633\\u062c\\u0644 \\u0645\\u062c\\u0627\\u0646\\u064b\\u0627 \\u0648\\u0627\\u0628\\u062f\\u0623 \\u0631\\u062d\\u0644\\u062a\\u0643 \\u0643\\u0628\\u0627\\u0626\\u0639 \\u0646\\u0627\\u062c\\u062d.\",\"image\":1098}]},\"video_section\":{\"section_title\":null,\"section_subtitle\":null,\"video_url\":null},\"join_benefits_section\":{\"title\":\"\\u0644\\u0645\\u0627\\u0630\\u0627 \\u062a\\u0628\\u064a\\u0639 \\u0639\\u0644\\u0649 \\u0627\\u0644\\u062a\\u062c\\u0627\\u0631\\u0629 \\u0627\\u0644\\u0625\\u0644\\u0643\\u062a\\u0631\\u0648\\u0646\\u064a\\u0629 \\u0627\\u0644\\u0633\\u0631\\u064a\\u0639\\u0629\",\"subtitle\":null,\"steps\":[{\"title\":\"Reach Millions of Customers\",\"subtitle\":\"Expand your business by connecting with a vast audience actively looking for products like yours.\",\"image\":1101},{\"title\":\"Hassle-Free Registration\",\"subtitle\":\"Sign up effortlessly and start selling without any hidden fees or long approval processes.\",\"image\":1100},{\"title\":\"Personalized Storefront\",\"subtitle\":\"Sign up for free and begin your journey as a successful seller.\",\"image\":1099},{\"title\":\"Product Management\",\"subtitle\":\"Easily add, update, and manage your inventory with our intuitive seller dashboard.\",\"image\":1102},{\"title\":\"Fast & Reliable Shipping\",\"subtitle\":\"Ensure smooth deliveries with SharpMart\\u2019s trusted logistics partners.\",\"image\":1103},{\"title\":\"Secure & Timely Payments\",\"subtitle\":\"Get paid directly to your bank account with a transparent and reliable payment system.\",\"image\":1104},{\"title\":\"Smart Marketing Tools\",\"subtitle\":\"Boost your sales with advertising, promotions, and data-driven marketing strategies.\",\"image\":1105},{\"title\":\"Dedicated Seller Support\",\"subtitle\":\"Get expert guidance, training resources, and 24\\/7 assistance for your business.\",\"image\":1106},{\"title\":\"Scale & Succeed\",\"subtitle\":\"Use data-driven analytics and business insights to optimize and expand your sales.\",\"image\":1107}]},\"faq_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"question\":\"\\u0627\\u0644\\u0628\\u062f\\u0621\",\"answer\":\"Sign up for free and begin your journey as a successful seller.\"},{\"question\":\"\\u0642\\u0645 \\u0628\\u0628\\u0646\\u0627\\u0621 \\u0645\\u062a\\u062c\\u0631\\u0643\",\"answer\":\"\\u0642\\u0645 \\u0628\\u062a\\u062e\\u0635\\u064a\\u0635 \\u0648\\u0627\\u062c\\u0647\\u0629 \\u0645\\u062a\\u062c\\u0631\\u0643\\u060c \\u0648\\u0639\\u0631\\u0636 \\u0645\\u0646\\u062a\\u062c\\u0627\\u062a\\u0643\\u060c \\u0648\\u062c\\u0630\\u0628 \\u0627\\u0644\\u0639\\u0645\\u0644\\u0627\\u0621.\"},{\"question\":\"\\u0623\\u0636\\u0641 \\u0645\\u0646\\u062a\\u062c\\u0627\\u062a\\u0643\",\"answer\":\"\\u0642\\u0645 \\u0628\\u0625\\u062f\\u0631\\u0627\\u062c \\u0645\\u062e\\u0632\\u0648\\u0646\\u0643 \\u0648\\u0625\\u062f\\u0627\\u0631\\u062a\\u0647 \\u0648\\u062a\\u062d\\u0633\\u064a\\u0646\\u0647 \\u0628\\u0643\\u0644 \\u0633\\u0647\\u0648\\u0644\\u0629.\"},{\"question\":\"\\u0627\\u0628\\u062f\\u0623 \\u0627\\u0644\\u0628\\u064a\\u0639\",\"answer\":\"\\u062a\\u0648\\u0627\\u0635\\u0644 \\u0645\\u0639 \\u0627\\u0644\\u0645\\u0634\\u062a\\u0631\\u064a\\u0646\\u060c \\u0648\\u0642\\u0645 \\u0628\\u062a\\u0646\\u0641\\u064a\\u0630 \\u0627\\u0644\\u0637\\u0644\\u0628\\u0627\\u062a\\u060c \\u0648\\u0632\\u062f \\u0645\\u0628\\u064a\\u0639\\u0627\\u062a\\u0643.\"},{\"question\":\"\\u0627\\u0643\\u0633\\u0628 \\u0648\\u0646\\u0645\\u0648\",\"answer\":\"\\u0639\\u0632\\u0632 \\u0625\\u064a\\u0631\\u0627\\u062f\\u0627\\u062a\\u0643 \\u0648\\u0627\\u0643\\u062a\\u0634\\u0641 \\u0641\\u0631\\u0635 \\u0639\\u0645\\u0644 \\u062c\\u062f\\u064a\\u062f\\u0629.\"}]},\"contact_section\":{\"title\":\"\\u0639\\u0632\\u0632 \\u0625\\u064a\\u0631\\u0627\\u062f\\u0627\\u062a\\u0643 \\u0648\\u0627\\u0643\\u062a\\u0634\\u0641 \\u0641\\u0631\\u0635 \\u0639\\u0645\\u0644 \\u062c\\u062f\\u064a\\u062f\\u0629.\",\"subtitle\":\"\\u062e\\u0628\\u0631\\u0627\\u0624\\u0646\\u0627 \\u0647\\u0646\\u0627 \\u0644\\u0645\\u0633\\u0627\\u0639\\u062f\\u062a\\u0643\\u0645 \\u0641\\u064a \\u0623\\u064a \\u0627\\u0633\\u062a\\u0641\\u0633\\u0627\\u0631 \\u062d\\u0648\\u0644 \\u0645\\u0646\\u062a\\u062c\\u0627\\u062a\\u0646\\u0627 \\u0623\\u0648 \\u062e\\u062f\\u0645\\u0627\\u062a\\u0646\\u0627 \\u0623\\u0648 \\u063a\\u064a\\u0631\\u0647\\u0627. \\u0644\\u0627 \\u062a\\u062a\\u0631\\u062f\\u062f\\u0648\\u0627 \\u0641\\u064a \\u0627\\u0644\\u0633\\u0624\\u0627\\u0644\\u060c \\u0641\\u0646\\u062d\\u0646 \\u0639\\u0644\\u0649 \\u0623\\u062a\\u0645 \\u0627\\u0644\\u0627\\u0633\\u062a\\u0639\\u062f\\u0627\\u062f \\u0644\\u0645\\u0633\\u0627\\u0639\\u062f\\u062a\\u0643\\u0645! \\u062f\\u0639\\u0646\\u0627 \\u0646\\u0633\\u0647\\u0644 \\u0639\\u0644\\u064a\\u0643\\u0645 \\u0627\\u0644\\u0623\\u0645\\u0648\\u0631.\",\"agree_button_title\":\"\\u0623\\u0648\\u0627\\u0641\\u0642 \\u0639\\u0644\\u0649 \\u0627\\u0644\\u0634\\u0631\\u0648\\u0637 \\u0648\\u0627\\u0644\\u0623\\u062d\\u0643\\u0627\\u0645.\",\"image\":1108,\"image_url\":null}}', NULL, NULL),
(25026, 36, 'App\\Models\\Page', 'en', 'title', 'Become A Seller', NULL, NULL),
(25027, 36, 'App\\Models\\Page', 'en', 'meta_title', 'Become a seller', NULL, NULL),
(25028, 36, 'App\\Models\\Page', 'en', 'meta_description', 'Become A seller Updated Become A seller Updated', NULL, NULL),
(25029, 36, 'App\\Models\\Page', 'es', 'title', 'Conviértete en vendedor', NULL, NULL),
(25030, 36, 'App\\Models\\Page', 'ar', 'title', 'كن بائعًا', NULL, NULL),
(25038, 24, 'App\\Models\\Page', 'es', 'content', '{\"contact_form_section\":{\"title\":null,\"subtitle\":null},\"contact_details_section\":{\"address\":\"545 Mavis Island, IL 99191\",\"phone\":\"113434134\",\"email\":\"quick_ecommerce_contact@gmail.com\",\"website\":\"#\",\"image\":1302,\"image_url\":null,\"social\":[{\"url\":\"https:\\/\\/www.facebook.com\",\"icon\":\"Facebook\"},{\"url\":\"https:\\/\\/www.instagram.com\",\"icon\":\"Instagram\"},{\"url\":\"https:\\/\\/www.linkedin.com\",\"icon\":\"Linkedin\"}]},\"map_section\":{\"coordinates\":{\"lat\":23.8103,\"lng\":90.4125}}}', NULL, NULL),
(25059, 22, 'App\\Models\\DynamicField', 'df', 'name', 'Date Time', NULL, NULL),
(25060, 17, 'App\\Models\\Banner', 'df', 'title', 'Redefining Style for Every Season', NULL, NULL),
(25061, 17, 'App\\Models\\Banner', 'df', 'description', 'Up to 50% Sale Fashion', NULL, NULL),
(25062, 17, 'App\\Models\\Banner', 'df', 'button_text', 'Shop Now', NULL, NULL),
(25063, 17, 'App\\Models\\Banner', 'en', 'title', 'Redefining Style for Every Season', NULL, NULL),
(25064, 17, 'App\\Models\\Banner', 'en', 'description', 'Up to 50% Sale Fashion', NULL, NULL),
(25065, 17, 'App\\Models\\Banner', 'en', 'button_text', 'Shop Now', NULL, NULL),
(25066, 18, 'App\\Models\\Banner', 'df', 'title', 'Beauty That Speaks', NULL, NULL),
(25067, 18, 'App\\Models\\Banner', 'df', 'description', 'Discover bold colors & flawless finishes', NULL, NULL),
(25068, 18, 'App\\Models\\Banner', 'en', 'title', 'Beauty That Speaks', NULL, NULL),
(25069, 18, 'App\\Models\\Banner', 'en', 'description', 'Discover bold colors & flawless finishes', NULL, NULL),
(25070, 19, 'App\\Models\\Banner', 'df', 'title', 'End of Season Sale', NULL, NULL),
(25071, 19, 'App\\Models\\Banner', 'df', 'description', 'Limited time offers — don’t miss out', NULL, NULL),
(25072, 19, 'App\\Models\\Banner', 'en', 'title', 'End of Season Sale', NULL, NULL),
(25073, 19, 'App\\Models\\Banner', 'en', 'description', 'Limited time offers — don’t miss out', NULL, NULL),
(25074, 20, 'App\\Models\\Banner', 'df', 'title', 'Everyday Luxe', NULL, NULL),
(25075, 20, 'App\\Models\\Banner', 'df', 'description', 'Premium looks, exclusive offers inside', NULL, NULL),
(25076, 21, 'App\\Models\\Banner', 'df', 'title', 'Elegance Redefined', NULL, NULL),
(25077, 21, 'App\\Models\\Banner', 'df', 'description', 'Up to 40% Off Ladies’ Dresses – Style That Speaks', NULL, NULL),
(25078, 21, 'App\\Models\\Banner', 'en', 'title', 'Elegance Redefined', NULL, NULL),
(25079, 21, 'App\\Models\\Banner', 'en', 'description', 'Up to 40% Off Ladies’ Dresses – Style That Speaks', NULL, NULL),
(25080, 22, 'App\\Models\\Banner', 'df', 'title', 'Carry It in Style', NULL, NULL),
(25081, 22, 'App\\Models\\Banner', 'df', 'description', 'test', NULL, NULL),
(25082, 22, 'App\\Models\\Banner', 'en', 'title', 'Carry It in Style', NULL, NULL),
(25083, 22, 'App\\Models\\Banner', 'en', 'description', 'Up to 35% Off Designer & Everyday Bags', NULL, NULL),
(25084, 23, 'App\\Models\\Banner', 'df', 'title', 'Dress the Season', NULL, NULL),
(25085, 23, 'App\\Models\\Banner', 'df', 'description', 'Chic outfits now at up to 45% Off', NULL, NULL),
(25086, 23, 'App\\Models\\Banner', 'en', 'title', 'Dress the Season', NULL, NULL),
(25087, 23, 'App\\Models\\Banner', 'en', 'description', 'Chic outfits now at up to 45% Off', NULL, NULL),
(25088, 18, 'App\\Models\\Banner', 'df', 'button_text', 'Shop Now', NULL, NULL),
(25089, 18, 'App\\Models\\Banner', 'en', 'button_text', 'Shop Now', NULL, NULL),
(25090, 19, 'App\\Models\\Banner', 'df', 'button_text', 'Shop Now', NULL, NULL),
(25091, 23, 'App\\Models\\Banner', 'df', 'button_text', 'Shop Now', NULL, NULL),
(25373, 18, 'App\\Models\\Banner', 'ar', 'title', 'أسلوب حياتك… اختيارك', NULL, NULL),
(25374, 18, 'App\\Models\\Banner', 'ar', 'description', 'كل ما تحب في مكان واحد', NULL, NULL),
(25375, 18, 'App\\Models\\Banner', 'ar', 'button_text', 'اكتشف الآن', NULL, NULL),
(25376, 20, 'App\\Models\\Banner', 'df', 'button_text', 'Shop Now', NULL, NULL),
(25377, 20, 'App\\Models\\Banner', 'en', 'title', 'Everyday Luxe', NULL, NULL),
(25378, 20, 'App\\Models\\Banner', 'en', 'description', 'Premium looks, exclusive offers inside', NULL, NULL),
(25379, 19, 'App\\Models\\Banner', 'en', 'button_text', 'Shop Now', NULL, NULL),
(25380, 23, 'App\\Models\\Banner', 'en', 'button_text', 'Shop Now', NULL, NULL),
(25381, 22, 'App\\Models\\Banner', 'df', 'button_text', 'Shop Now', NULL, NULL),
(25382, 22, 'App\\Models\\Banner', 'en', 'button_text', 'Shop Now', NULL, NULL),
(25383, 21, 'App\\Models\\Banner', 'df', 'button_text', 'Shop Now', NULL, NULL),
(25384, 21, 'App\\Models\\Banner', 'en', 'button_text', 'Shop Now', NULL, NULL),
(25385, 100, 'App\\Models\\SettingOption', 'en', 'com_meta_description', 'Quick Ecommerce', NULL, NULL),
(25386, 100, 'App\\Models\\SettingOption', 'en', 'com_og_title', 'Quick Ecommerce', NULL, NULL),
(25387, 100, 'App\\Models\\SettingOption', 'en', 'com_og_description', 'Quick Ecommerce', NULL, NULL),
(25388, 101, 'App\\Models\\SettingOption', 'en', 'com_meta_description', 'Quick Ecommerce', NULL, NULL),
(25389, 101, 'App\\Models\\SettingOption', 'en', 'com_og_title', 'Quick Ecommerce', NULL, NULL),
(25390, 101, 'App\\Models\\SettingOption', 'en', 'com_og_description', 'Quick Ecommerce', NULL, NULL),
(25391, 102, 'App\\Models\\SettingOption', 'en', 'com_meta_description', 'Quick Ecommerce', NULL, NULL),
(25392, 102, 'App\\Models\\SettingOption', 'en', 'com_og_title', 'Quick Ecommerce', NULL, NULL),
(25393, 102, 'App\\Models\\SettingOption', 'en', 'com_og_description', 'Quick Ecommerce', NULL, NULL),
(25394, 104, 'App\\Models\\SettingOption', 'en', 'com_meta_description', 'Quick Ecommerce', NULL, NULL),
(25395, 104, 'App\\Models\\SettingOption', 'en', 'com_og_title', 'Quick Ecommerce', NULL, NULL),
(25396, 104, 'App\\Models\\SettingOption', 'en', 'com_og_description', 'Quick Ecommerce', NULL, NULL),
(25397, 105, 'App\\Models\\SettingOption', 'en', 'com_meta_description', 'Quick Ecommerce', NULL, NULL),
(25398, 105, 'App\\Models\\SettingOption', 'en', 'com_og_title', 'Quick Ecommerce', NULL, NULL),
(25399, 105, 'App\\Models\\SettingOption', 'en', 'com_og_description', 'Quick Ecommerce', NULL, NULL),
(25662, 9775, 'App\\Models\\Permissions', 'en', 'perm_title', 'Dashboard', NULL, NULL),
(25663, 9775, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة المناطق', NULL, NULL),
(25664, 9776, 'App\\Models\\Permissions', 'en', 'perm_title', 'POS Management', NULL, NULL),
(25665, 9776, 'App\\Models\\Permissions', 'ar', 'perm_title', 'نقاط البيع', NULL, NULL),
(25666, 9777, 'App\\Models\\Permissions', 'en', 'perm_title', 'POS', NULL, NULL),
(25667, 9777, 'App\\Models\\Permissions', 'ar', 'perm_title', 'المبيعات', NULL, NULL),
(25668, 9778, 'App\\Models\\Permissions', 'en', 'perm_title', 'POS', NULL, NULL),
(25669, 9778, 'App\\Models\\Permissions', 'ar', 'perm_title', 'المبيعات', NULL, NULL),
(25670, 9779, 'App\\Models\\Permissions', 'en', 'perm_title', 'Orders', NULL, NULL),
(25671, 9779, 'App\\Models\\Permissions', 'ar', 'perm_title', 'طلبات', NULL, NULL),
(25672, 9780, 'App\\Models\\Permissions', 'en', 'perm_title', 'Settings', NULL, NULL),
(25673, 9780, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الإعدادات', NULL, NULL),
(25674, 9781, 'App\\Models\\Permissions', 'en', 'perm_title', 'Orders & Reviews', NULL, NULL),
(25675, 9781, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة المناطق', NULL, NULL),
(25676, 9782, 'App\\Models\\Permissions', 'en', 'perm_title', 'Orders', NULL, NULL),
(25677, 9782, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة المناطق', NULL, NULL),
(25678, 9783, 'App\\Models\\Permissions', 'en', 'perm_title', 'All Orders', NULL, NULL),
(25679, 9783, 'App\\Models\\Permissions', 'ar', 'perm_title', 'جميع الطلبات', NULL, NULL),
(25680, 9784, 'App\\Models\\Permissions', 'en', 'perm_title', 'Returned or Refunded', NULL, NULL),
(25681, 9784, 'App\\Models\\Permissions', 'ar', 'perm_title', 'تم إرجاعه أو استرداده', NULL, NULL),
(25682, 9785, 'App\\Models\\Permissions', 'en', 'perm_title', 'Refund Reason', NULL, NULL),
(25683, 9785, 'App\\Models\\Permissions', 'ar', 'perm_title', 'سبب استرداد الأموال', NULL, NULL),
(25684, 9786, 'App\\Models\\Permissions', 'en', 'perm_title', 'Product management', NULL, NULL),
(25685, 9786, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة المناطق', NULL, NULL),
(25686, 9787, 'App\\Models\\Permissions', 'en', 'perm_title', 'Products', NULL, NULL),
(25687, 9787, 'App\\Models\\Permissions', 'ar', 'perm_title', 'منتجات', NULL, NULL),
(25688, 9788, 'App\\Models\\Permissions', 'en', 'perm_title', 'Manage Products', NULL, NULL),
(25689, 9788, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة المنتجات', NULL, NULL),
(25690, 9789, 'App\\Models\\Permissions', 'en', 'perm_title', 'Trash', NULL, NULL),
(25691, 9789, 'App\\Models\\Permissions', 'ar', 'perm_title', 'نفاية', NULL, NULL),
(25692, 9790, 'App\\Models\\Permissions', 'en', 'perm_title', 'Product Approval Request', NULL, NULL),
(25693, 9790, 'App\\Models\\Permissions', 'ar', 'perm_title', 'طلب الموافقة على المنتج', NULL, NULL),
(25694, 9791, 'App\\Models\\Permissions', 'en', 'perm_title', 'Product Low & Out Stock', NULL, NULL),
(25695, 9791, 'App\\Models\\Permissions', 'ar', 'perm_title', 'المنتجات منخفضة المخزون وغير المتوفرة', NULL, NULL),
(25696, 9792, 'App\\Models\\Permissions', 'en', 'perm_title', 'Bulk Import', NULL, NULL),
(25697, 9792, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الاستيراد بالجملة', NULL, NULL),
(25698, 9793, 'App\\Models\\Permissions', 'en', 'perm_title', 'Bulk Export', NULL, NULL),
(25699, 9793, 'App\\Models\\Permissions', 'ar', 'perm_title', 'التصدير بالجملة', NULL, NULL),
(25700, 9794, 'App\\Models\\Permissions', 'en', 'perm_title', 'Product Inventory', NULL, NULL),
(25701, 9794, 'App\\Models\\Permissions', 'ar', 'perm_title', 'مخزون المنتج', NULL, NULL),
(25702, 9795, 'App\\Models\\Permissions', 'en', 'perm_title', 'Categories', NULL, NULL),
(25703, 9795, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة الفئات', NULL, NULL),
(25704, 9796, 'App\\Models\\Permissions', 'en', 'perm_title', 'Attributes', NULL, NULL),
(25705, 9796, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة السمات', NULL, NULL),
(25706, 9797, 'App\\Models\\Permissions', 'en', 'perm_title', 'Units', NULL, NULL),
(25707, 9797, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة السمات', NULL, NULL),
(25708, 9798, 'App\\Models\\Permissions', 'en', 'perm_title', 'Dynamic Fields', NULL, NULL),
(25709, 9798, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الحقول الديناميكية', NULL, NULL),
(25710, 9799, 'App\\Models\\Permissions', 'en', 'perm_title', 'Brands', NULL, NULL),
(25711, 9799, 'App\\Models\\Permissions', 'ar', 'perm_title', 'المنشورات', NULL, NULL),
(25712, 9800, 'App\\Models\\Permissions', 'en', 'perm_title', 'Tags', NULL, NULL),
(25713, 9800, 'App\\Models\\Permissions', 'ar', 'perm_title', 'العلامات', NULL, NULL),
(25714, 9801, 'App\\Models\\Permissions', 'en', 'perm_title', 'Authors', NULL, NULL),
(25715, 9801, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة المؤلفين', NULL, NULL),
(25716, 9802, 'App\\Models\\Permissions', 'en', 'perm_title', 'Coupon Management', NULL, NULL),
(25717, 9802, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة التركيبات', NULL, NULL),
(25718, 9803, 'App\\Models\\Permissions', 'en', 'perm_title', 'Coupons', NULL, NULL),
(25719, 9803, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة التركيبات', NULL, NULL),
(25720, 9804, 'App\\Models\\Permissions', 'en', 'perm_title', 'Coupon Lines', NULL, NULL),
(25721, 9804, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إضافة مجموعات', NULL, NULL),
(25722, 9805, 'App\\Models\\Permissions', 'en', 'perm_title', 'Sellers & Stores', NULL, NULL),
(25723, 9805, 'App\\Models\\Permissions', 'ar', 'perm_title', 'البائع والمتجر', NULL, NULL),
(25724, 9806, 'App\\Models\\Permissions', 'en', 'perm_title', 'All Sellers', NULL, NULL),
(25725, 9806, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة العملاء', NULL, NULL),
(25726, 9807, 'App\\Models\\Permissions', 'en', 'perm_title', 'Sellers', NULL, NULL),
(25727, 9807, 'App\\Models\\Permissions', 'ar', 'perm_title', 'عملاء', NULL, NULL),
(25728, 9808, 'App\\Models\\Permissions', 'en', 'perm_title', 'Trash', NULL, NULL),
(25729, 9808, 'App\\Models\\Permissions', 'ar', 'perm_title', 'نفاية', NULL, NULL),
(25730, 9809, 'App\\Models\\Permissions', 'en', 'perm_title', 'Subscriber List', NULL, NULL),
(25731, 9809, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الاشتراك في قائمة البريد الإلكتروني', NULL, NULL),
(25732, 9810, 'App\\Models\\Permissions', 'en', 'perm_title', 'All Stores', NULL, NULL),
(25733, 9810, 'App\\Models\\Permissions', 'ar', 'perm_title', ' ميع المتاج', NULL, NULL),
(25734, 9811, 'App\\Models\\Permissions', 'en', 'perm_title', 'Store List', NULL, NULL),
(25735, 9811, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة المتاجر', NULL, NULL),
(25736, 9812, 'App\\Models\\Permissions', 'en', 'perm_title', 'Trash', NULL, NULL),
(25737, 9812, 'App\\Models\\Permissions', 'ar', 'perm_title', 'نفاية', NULL, NULL),
(25738, 9813, 'App\\Models\\Permissions', 'en', 'perm_title', 'Store Add', NULL, NULL),
(25739, 9813, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إضافة متجر', NULL, NULL),
(25740, 9814, 'App\\Models\\Permissions', 'en', 'perm_title', 'Store Approval Request', NULL, NULL),
(25741, 9814, 'App\\Models\\Permissions', 'ar', 'perm_title', 'في انتظار الموافقة/الرفض', NULL, NULL),
(25742, 9815, 'App\\Models\\Permissions', 'en', 'perm_title', 'Promotional control', NULL, NULL),
(25743, 9815, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الرقابة الترويجية', NULL, NULL),
(25744, 9816, 'App\\Models\\Permissions', 'en', 'perm_title', 'Flash Sale', NULL, NULL),
(25745, 9816, 'App\\Models\\Permissions', 'ar', 'perm_title', 'بيع سريع', NULL, NULL),
(25746, 9817, 'App\\Models\\Permissions', 'en', 'perm_title', 'List', NULL, NULL),
(25747, 9817, 'App\\Models\\Permissions', 'ar', 'perm_title', 'منتجاتي في العروض', NULL, NULL),
(25748, 9818, 'App\\Models\\Permissions', 'en', 'perm_title', 'Join Deals', NULL, NULL),
(25749, 9818, 'App\\Models\\Permissions', 'ar', 'perm_title', 'اطلب التسجيل', NULL, NULL),
(25750, 9819, 'App\\Models\\Permissions', 'en', 'perm_title', 'Banners', NULL, NULL),
(25751, 9819, 'App\\Models\\Permissions', 'ar', 'perm_title', 'راية', NULL, NULL),
(25752, 9820, 'App\\Models\\Permissions', 'en', 'perm_title', 'Slider', NULL, NULL),
(25753, 9820, 'App\\Models\\Permissions', 'ar', 'perm_title', ' قوائم الصفحات', NULL, NULL),
(25754, 9821, 'App\\Models\\Permissions', 'en', 'perm_title', 'Feedback Management', NULL, NULL),
(25755, 9821, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة المدونة', NULL, NULL),
(25756, 9822, 'App\\Models\\Permissions', 'en', 'perm_title', 'Reviews', NULL, NULL),
(25757, 9822, 'App\\Models\\Permissions', 'ar', 'perm_title', ' قوائم الصفحات', NULL, NULL),
(25758, 9823, 'App\\Models\\Permissions', 'en', 'perm_title', 'Questions', NULL, NULL),
(25759, 9823, 'App\\Models\\Permissions', 'ar', 'perm_title', ' قوائم الصفحات', NULL, NULL),
(25760, 9824, 'App\\Models\\Permissions', 'en', 'perm_title', 'Blog Management', NULL, NULL),
(25761, 9824, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة المدونة', NULL, NULL),
(25762, 9825, 'App\\Models\\Permissions', 'en', 'perm_title', 'Blogs', NULL, NULL),
(25763, 9825, 'App\\Models\\Permissions', 'ar', 'perm_title', ' الموظفين', NULL, NULL),
(25764, 9826, 'App\\Models\\Permissions', 'en', 'perm_title', 'Category', NULL, NULL),
(25765, 9826, 'App\\Models\\Permissions', 'ar', 'perm_title', ' الموظفين', NULL, NULL),
(25766, 9827, 'App\\Models\\Permissions', 'en', 'perm_title', 'Posts', NULL, NULL),
(25767, 9827, 'App\\Models\\Permissions', 'ar', 'perm_title', 'دعامات', NULL, NULL),
(25768, 9828, 'App\\Models\\Permissions', 'en', 'perm_title', 'Wallet Management', NULL, NULL),
(25769, 9828, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة الصفحات', NULL, NULL),
(25770, 9829, 'App\\Models\\Permissions', 'en', 'perm_title', 'Wallet Lists', NULL, NULL),
(25771, 9829, 'App\\Models\\Permissions', 'ar', 'perm_title', ' قوائم الصفحات', NULL, NULL),
(25772, 9830, 'App\\Models\\Permissions', 'en', 'perm_title', 'Wallet Lists', NULL, NULL),
(25773, 9830, 'App\\Models\\Permissions', 'ar', 'perm_title', ' قوائم الصفحات', NULL, NULL),
(25774, 9831, 'App\\Models\\Permissions', 'en', 'perm_title', 'Wallet Lists', NULL, NULL),
(25775, 9831, 'App\\Models\\Permissions', 'ar', 'perm_title', ' قوائم الصفحات', NULL, NULL),
(25776, 9832, 'App\\Models\\Permissions', 'en', 'perm_title', 'Deliveryman', NULL, NULL),
(25777, 9832, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة التوصيل', NULL, NULL),
(25778, 9833, 'App\\Models\\Permissions', 'en', 'perm_title', 'Vehicle Types', NULL, NULL),
(25779, 9833, 'App\\Models\\Permissions', 'ar', 'perm_title', 'فئة المركبات', NULL, NULL),
(25780, 9834, 'App\\Models\\Permissions', 'en', 'perm_title', 'Deliveryman List', NULL, NULL),
(25781, 9834, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة رجال التوصيل', NULL, NULL),
(25782, 9835, 'App\\Models\\Permissions', 'en', 'perm_title', 'Trash', NULL, NULL),
(25783, 9835, 'App\\Models\\Permissions', 'ar', 'perm_title', 'نفاية', NULL, NULL),
(25784, 9836, 'App\\Models\\Permissions', 'en', 'perm_title', 'Deliveryman Requests', NULL, NULL),
(25785, 9836, 'App\\Models\\Permissions', 'ar', 'perm_title', 'طلبات مندوب التوصيل', NULL, NULL),
(25786, 9837, 'App\\Models\\Permissions', 'en', 'perm_title', 'Customer management', NULL, NULL),
(25787, 9837, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة العملاء', NULL, NULL),
(25788, 9838, 'App\\Models\\Permissions', 'en', 'perm_title', 'All Customers', NULL, NULL),
(25789, 9838, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة العملاء', NULL, NULL),
(25790, 9839, 'App\\Models\\Permissions', 'en', 'perm_title', 'Customers', NULL, NULL),
(25791, 9839, 'App\\Models\\Permissions', 'ar', 'perm_title', 'عملاء', NULL, NULL),
(25792, 9840, 'App\\Models\\Permissions', 'en', 'perm_title', 'Trash', NULL, NULL),
(25793, 9840, 'App\\Models\\Permissions', 'ar', 'perm_title', 'نفاية', NULL, NULL),
(25794, 9841, 'App\\Models\\Permissions', 'en', 'perm_title', 'Subscriber List', NULL, NULL);
INSERT INTO `translations` (`id`, `translatable_id`, `translatable_type`, `language`, `key`, `value`, `created_at`, `updated_at`) VALUES
(25795, 9841, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الاشتراك في قائمة البريد الإلكتروني', NULL, NULL),
(25796, 9842, 'App\\Models\\Permissions', 'en', 'perm_title', 'Contact Messages', NULL, NULL),
(25797, 9842, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الاشتراك في قائمة البريد الإلكتروني', NULL, NULL),
(25798, 9843, 'App\\Models\\Permissions', 'en', 'perm_title', 'Staff & Permissions', NULL, NULL),
(25799, 9843, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الموظفين والأذونات', NULL, NULL),
(25800, 9844, 'App\\Models\\Permissions', 'en', 'perm_title', 'Staff Roles', NULL, NULL),
(25801, 9844, 'App\\Models\\Permissions', 'ar', 'perm_title', 'أدوار الموظفين', NULL, NULL),
(25802, 9845, 'App\\Models\\Permissions', 'en', 'perm_title', 'List', NULL, NULL),
(25803, 9845, 'App\\Models\\Permissions', 'ar', 'perm_title', 'علاوة', NULL, NULL),
(25804, 9846, 'App\\Models\\Permissions', 'en', 'perm_title', 'Add Role', NULL, NULL),
(25805, 9846, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إضافة دور', NULL, NULL),
(25806, 9847, 'App\\Models\\Permissions', 'en', 'perm_title', 'My Staff', NULL, NULL),
(25807, 9847, 'App\\Models\\Permissions', 'ar', 'perm_title', 'طاقمي', NULL, NULL),
(25808, 9848, 'App\\Models\\Permissions', 'en', 'perm_title', 'List', NULL, NULL),
(25809, 9848, 'App\\Models\\Permissions', 'ar', 'perm_title', 'علاوة', NULL, NULL),
(25810, 9849, 'App\\Models\\Permissions', 'en', 'perm_title', 'Add Staff', NULL, NULL),
(25811, 9849, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إضافة الموظفين', NULL, NULL),
(25812, 9850, 'App\\Models\\Permissions', 'en', 'perm_title', 'Financial Management', NULL, NULL),
(25813, 9850, 'App\\Models\\Permissions', 'ar', 'perm_title', 'النشاط المالي', NULL, NULL),
(25814, 9851, 'App\\Models\\Permissions', 'en', 'perm_title', 'Financial', NULL, NULL),
(25815, 9851, 'App\\Models\\Permissions', 'ar', 'perm_title', ' الموظفين', NULL, NULL),
(25816, 9852, 'App\\Models\\Permissions', 'en', 'perm_title', 'Withdrawal Settings', NULL, NULL),
(25817, 9852, 'App\\Models\\Permissions', 'ar', 'perm_title', 'طريقة السحب', NULL, NULL),
(25818, 9853, 'App\\Models\\Permissions', 'en', 'perm_title', 'Withdrawal Method', NULL, NULL),
(25819, 9853, 'App\\Models\\Permissions', 'ar', 'perm_title', 'طريقة السحب', NULL, NULL),
(25820, 9854, 'App\\Models\\Permissions', 'en', 'perm_title', 'Withdraw History', NULL, NULL),
(25821, 9854, 'App\\Models\\Permissions', 'ar', 'perm_title', 'طلبات السحب', NULL, NULL),
(25822, 9855, 'App\\Models\\Permissions', 'en', 'perm_title', 'Withdraw Requests', NULL, NULL),
(25823, 9855, 'App\\Models\\Permissions', 'ar', 'perm_title', 'طلبات السحب', NULL, NULL),
(25824, 9856, 'App\\Models\\Permissions', 'en', 'perm_title', 'Cash Collect', NULL, NULL),
(25825, 9856, 'App\\Models\\Permissions', 'ar', 'perm_title', 'جمع النقود', NULL, NULL),
(25826, 9857, 'App\\Models\\Permissions', 'en', 'perm_title', 'Report and analytics', NULL, NULL),
(25827, 9857, 'App\\Models\\Permissions', 'ar', 'perm_title', 'التقارير والتحليلات', NULL, NULL),
(25828, 9858, 'App\\Models\\Permissions', 'en', 'perm_title', 'Order Report', NULL, NULL),
(25829, 9858, 'App\\Models\\Permissions', 'ar', 'perm_title', 'تقرير الطلب', NULL, NULL),
(25830, 9859, 'App\\Models\\Permissions', 'en', 'perm_title', 'Transaction Report', NULL, NULL),
(25831, 9859, 'App\\Models\\Permissions', 'ar', 'perm_title', 'تقرير المعاملات', NULL, NULL),
(25832, 9860, 'App\\Models\\Permissions', 'en', 'perm_title', 'Communication Center', NULL, NULL),
(25833, 9860, 'App\\Models\\Permissions', 'ar', 'perm_title', 'مركز الاتصالات', NULL, NULL),
(25834, 9861, 'App\\Models\\Permissions', 'en', 'perm_title', 'Chat', NULL, NULL),
(25835, 9861, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات الدردشة', NULL, NULL),
(25836, 9862, 'App\\Models\\Permissions', 'en', 'perm_title', 'Chat Settings', NULL, NULL),
(25837, 9862, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات الدردشة', NULL, NULL),
(25838, 9863, 'App\\Models\\Permissions', 'en', 'perm_title', 'Chat List', NULL, NULL),
(25839, 9863, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة الدردشة', NULL, NULL),
(25840, 9864, 'App\\Models\\Permissions', 'en', 'perm_title', 'Tickets', NULL, NULL),
(25841, 9864, 'App\\Models\\Permissions', 'ar', 'perm_title', 'التذاكر', NULL, NULL),
(25842, 9865, 'App\\Models\\Permissions', 'en', 'perm_title', 'Department', NULL, NULL),
(25843, 9865, 'App\\Models\\Permissions', 'ar', 'perm_title', ' الموظفين', NULL, NULL),
(25844, 9866, 'App\\Models\\Permissions', 'en', 'perm_title', 'All Tickets', NULL, NULL),
(25845, 9866, 'App\\Models\\Permissions', 'ar', 'perm_title', 'دعامات', NULL, NULL),
(25846, 9867, 'App\\Models\\Permissions', 'en', 'perm_title', 'Notifications', NULL, NULL),
(25847, 9867, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات الأعمال', NULL, NULL),
(25848, 9868, 'App\\Models\\Permissions', 'en', 'perm_title', 'Notices', NULL, NULL),
(25849, 9868, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات الأعمال', NULL, NULL),
(25850, 9869, 'App\\Models\\Permissions', 'en', 'perm_title', 'Business Operations', NULL, NULL),
(25851, 9869, 'App\\Models\\Permissions', 'ar', 'perm_title', 'عمليات الأعمال', NULL, NULL),
(25852, 9870, 'App\\Models\\Permissions', 'en', 'perm_title', 'Store Type', NULL, NULL),
(25853, 9870, 'App\\Models\\Permissions', 'ar', 'perm_title', 'نوع المتجر', NULL, NULL),
(25854, 9871, 'App\\Models\\Permissions', 'en', 'perm_title', 'Area Setup', NULL, NULL),
(25855, 9871, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعداد المنطقة', NULL, NULL),
(25856, 9872, 'App\\Models\\Permissions', 'en', 'perm_title', 'Subscription Management', NULL, NULL),
(25857, 9872, 'App\\Models\\Permissions', 'ar', 'perm_title', 'عمليات الأعمال', NULL, NULL),
(25858, 9873, 'App\\Models\\Permissions', 'en', 'perm_title', 'Subscription Package', NULL, NULL),
(25859, 9873, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة المشتركين', NULL, NULL),
(25860, 9874, 'App\\Models\\Permissions', 'en', 'perm_title', 'Store Subscription', NULL, NULL),
(25861, 9874, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قائمة المشتركين', NULL, NULL),
(25862, 9875, 'App\\Models\\Permissions', 'en', 'perm_title', 'Commission Settings', NULL, NULL),
(25863, 9875, 'App\\Models\\Permissions', 'ar', 'perm_title', 'نظام عمولة المسؤول', NULL, NULL),
(25864, 9876, 'App\\Models\\Permissions', 'en', 'perm_title', 'Gateway Management', NULL, NULL),
(25865, 9876, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة البوابة', NULL, NULL),
(25866, 9877, 'App\\Models\\Permissions', 'en', 'perm_title', 'Payment Gateway', NULL, NULL),
(25867, 9877, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات الدفع', NULL, NULL),
(25868, 9878, 'App\\Models\\Permissions', 'en', 'perm_title', 'SMS Gateway Settings', NULL, NULL),
(25869, 9878, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات بوابة الرسائل القصيرة', NULL, NULL),
(25870, 9879, 'App\\Models\\Permissions', 'en', 'perm_title', 'System management', NULL, NULL),
(25871, 9879, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة النظام', NULL, NULL),
(25872, 9880, 'App\\Models\\Permissions', 'en', 'perm_title', 'General Settings', NULL, NULL),
(25873, 9880, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الإعدادات العامة', NULL, NULL),
(25874, 9881, 'App\\Models\\Permissions', 'en', 'perm_title', 'Currencies', NULL, NULL),
(25875, 9881, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة العملات', NULL, NULL),
(25876, 9882, 'App\\Models\\Permissions', 'en', 'perm_title', 'Settings', NULL, NULL),
(25877, 9882, 'App\\Models\\Permissions', 'ar', 'perm_title', 'الإعدادات', NULL, NULL),
(25878, 9883, 'App\\Models\\Permissions', 'en', 'perm_title', 'Manage Currencies', NULL, NULL),
(25879, 9883, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة العملات', NULL, NULL),
(25880, 9884, 'App\\Models\\Permissions', 'en', 'perm_title', 'Page Lists', NULL, NULL),
(25881, 9884, 'App\\Models\\Permissions', 'ar', 'perm_title', ' قوائم الصفحات', NULL, NULL),
(25882, 9885, 'App\\Models\\Permissions', 'en', 'perm_title', 'Appearance Settings', NULL, NULL),
(25883, 9885, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات المظهر', NULL, NULL),
(25884, 9886, 'App\\Models\\Permissions', 'en', 'perm_title', 'Themes', NULL, NULL),
(25885, 9886, 'App\\Models\\Permissions', 'ar', 'perm_title', 'المواضيع', NULL, NULL),
(25886, 9887, 'App\\Models\\Permissions', 'en', 'perm_title', 'Menu Customization', NULL, NULL),
(25887, 9887, 'App\\Models\\Permissions', 'ar', 'perm_title', 'تخصيص التذييل', NULL, NULL),
(25888, 9888, 'App\\Models\\Permissions', 'en', 'perm_title', 'Footer Customization', NULL, NULL),
(25889, 9888, 'App\\Models\\Permissions', 'ar', 'perm_title', 'تخصيص التذييل', NULL, NULL),
(25890, 9889, 'App\\Models\\Permissions', 'en', 'perm_title', 'Email Settings', NULL, NULL),
(25891, 9889, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات البريد الإلكتروني', NULL, NULL),
(25892, 9890, 'App\\Models\\Permissions', 'en', 'perm_title', 'SMTP Settings', NULL, NULL),
(25893, 9890, 'App\\Models\\Permissions', 'ar', 'perm_title', 'تخصيص التذييل', NULL, NULL),
(25894, 9891, 'App\\Models\\Permissions', 'en', 'perm_title', 'Email Templates', NULL, NULL),
(25895, 9891, 'App\\Models\\Permissions', 'ar', 'perm_title', 'قوالب البريد الإلكتروني', NULL, NULL),
(25896, 9892, 'App\\Models\\Permissions', 'en', 'perm_title', 'Media', NULL, NULL),
(25897, 9892, 'App\\Models\\Permissions', 'ar', 'perm_title', ' قوائم الصفحات', NULL, NULL),
(25898, 9893, 'App\\Models\\Permissions', 'en', 'perm_title', 'SEO Settings', NULL, NULL),
(25899, 9893, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات تحسين محركات البحث', NULL, NULL),
(25900, 9894, 'App\\Models\\Permissions', 'en', 'perm_title', 'Sitemap Settings', NULL, NULL),
(25901, 9894, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات خريطة الموقع', NULL, NULL),
(25902, 9895, 'App\\Models\\Permissions', 'en', 'perm_title', 'Cookie Settings', NULL, NULL),
(25903, 9895, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات ملفات تعريف الارتباط', NULL, NULL),
(25904, 9896, 'App\\Models\\Permissions', 'en', 'perm_title', 'Third-Party', NULL, NULL),
(25905, 9896, 'App\\Models\\Permissions', 'ar', 'perm_title', 'طرف ثالث', NULL, NULL),
(25906, 9897, 'App\\Models\\Permissions', 'en', 'perm_title', 'Open AI Settings', NULL, NULL),
(25907, 9897, 'App\\Models\\Permissions', 'ar', 'perm_title', 'افتح إعدادات الذكاء الاصطناعي', NULL, NULL),
(25908, 9898, 'App\\Models\\Permissions', 'en', 'perm_title', 'Google Map Settings', NULL, NULL),
(25909, 9898, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات خرائط جوجل', NULL, NULL),
(25910, 9899, 'App\\Models\\Permissions', 'en', 'perm_title', 'Firebase Settings', NULL, NULL),
(25911, 9899, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات Firebase', NULL, NULL),
(25912, 9900, 'App\\Models\\Permissions', 'en', 'perm_title', 'Social Login Settings', NULL, NULL),
(25913, 9900, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات تسجيل الدخول الاجتماعي', NULL, NULL),
(25914, 9901, 'App\\Models\\Permissions', 'en', 'perm_title', 'Recaptcha Settings', NULL, NULL),
(25915, 9901, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إعدادات ريكابتشا', NULL, NULL),
(25916, 9902, 'App\\Models\\Permissions', 'en', 'perm_title', 'Maintenance Tools', NULL, NULL),
(25917, 9902, 'App\\Models\\Permissions', 'ar', 'perm_title', 'أدوات الصيانة', NULL, NULL),
(25918, 9903, 'App\\Models\\Permissions', 'en', 'perm_title', 'Maintenance Mode', NULL, NULL),
(25919, 9903, 'App\\Models\\Permissions', 'ar', 'perm_title', 'وضع الصيانة', NULL, NULL),
(25920, 9904, 'App\\Models\\Permissions', 'en', 'perm_title', 'Cache Management', NULL, NULL),
(25921, 9904, 'App\\Models\\Permissions', 'ar', 'perm_title', 'إدارة ذاكرة التخزين المؤقت', NULL, NULL),
(25922, 9905, 'App\\Models\\Permissions', 'en', 'perm_title', 'Database Update', NULL, NULL),
(25923, 9905, 'App\\Models\\Permissions', 'ar', 'perm_title', 'تحديث قاعدة البيانات', NULL, NULL),
(25925, 3, 'App\\Models\\EmailTemplate', 'df', 'name', 'New Store Created', NULL, NULL),
(25926, 3, 'App\\Models\\EmailTemplate', 'df', 'subject', 'A New Store Has Been Created', NULL, NULL),
(25927, 3, 'App\\Models\\EmailTemplate', 'df', 'body', '<h1>Hello, @owner_name,</h1>\n                           <p>Your store <strong>@store_name</strong> has been successfully created!</p>', NULL, NULL),
(25928, 140, 'App\\Models\\SettingOption', 'en', 'theme_data', '{\"name\":\"Premium Theme\",\"theme_pages\":[{\"theme_home_page\":[{\"slider\":[{\"enabled_disabled\":\"on\"}],\"category\":[{\"title\":\"Test Category en\",\"enabled_disabled\":\"on\"}],\"flash_sale\":[{\"title\":\"Categories\",\"enabled_disabled\":\"on\"}],\"product_featured\":[{\"title\":\"Featured Products\",\"enabled_disabled\":\"on\"}],\"banner_section\":[{\"enabled_disabled\":\"on\"}],\"product_top_selling\":[{\"title\":\"Top Selling\",\"enabled_disabled\":\"on\"}],\"product_latest\":[{\"title\":\"Latest Products\",\"enabled_disabled\":\"on\"}],\"popular_product_section\":[{\"title\":\"Popular Product\",\"enabled_disabled\":\"on\"}],\"top_stores_section\":[{\"title\":\"Top Stores\",\"enabled_disabled\":\"on\"}],\"newsletters_section\":[{\"title\":\"Subscribe Newsletters\",\"subtitle\":\"We provide top-quality products from trusted vendors items near you on time, all in one place.\",\"enabled_disabled\":\"on\"}]}],\"theme_login_page\":[{\"customer\":[{\"title\":\"Signin Now!\",\"subtitle\":null,\"enabled_disabled\":\"on\",\"image_id\":1092,\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/group-11712788981752749346.png\",\"image_id_url\":null}],\"admin\":[{\"title\":\"login\",\"subtitle\":null,\"image_id\":\"1177\",\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/our-vision1752752223.png\",\"image_id_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/stripe1754548961.png\"}]}],\"theme_register_page\":[{\"terms_page_url\":\"http:\\/\\/localhost:3000\\/terms\",\"social_login_enable_disable\":\"on\",\"image_id\":1092,\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/group-11712788981752749346.png\",\"image_id_url\":null}],\"theme_blog_page\":[{\"popular_title\":\"Popular Posts\",\"related_title\":\"Related Posts\"}],\"theme_product_details_page\":[{\"delivery_title\":\"Delivery Info\",\"delivery_subtitle\":null,\"refund_title\":\"Refund Info\",\"refund_subtitle\":null,\"related_title\":null,\"delivery_url\":null,\"refund_url\":null,\"delivery_enabled_disabled\":\"on\",\"refund_enabled_disabled\":\"on\"}]}]}', NULL, NULL),
(25929, 140, 'App\\Models\\SettingOption', 'df', 'theme_data', '{\"name\":\"Premium-Thema\",\"theme_pages\":[{\"theme_home_page\":[{\"category\":{\"title\":\"Testkategorie\"},\"flash_sale\":[{\"title\":\"Test Category df\",\"enabled_disabled\":\"on\"}],\"product_featured\":{\"title\":\"Ausgew\\u00e4hlte Produkte\"},\"product_top_selling\":{\"title\":\"Bestseller\"},\"product_latest\":{\"title\":\"Neueste Produkte\"},\"popular_product_section\":{\"title\":\"Beliebte Produkte\"},\"top_stores_section\":{\"title\":\"Top-Gesch\\u00e4fte\"},\"newsletters_section\":{\"title\":\"Newsletter abonnieren\",\"subtitle\":\"Wir bieten hochwertige Produkte von vertrauensw\\u00fcrdigen Anbietern in Ihrer N\\u00e4he p\\u00fcnktlich an, alles an einem Ort.\"}}],\"theme_login_page\":[{\"customer\":[{\"title\":\"Test Category df\",\"subtitle\":\"Test Category subtitle\",\"enabled_disabled\":\"on\",\"image_id\":\"1177\",\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/our-vision1752752223.png\",\"image_id_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/stripe1754548961.png\"}],\"admin\":[{\"title\":\"Test Category df\",\"subtitle\":\"Test Category subtitle\",\"image_id\":\"1177\",\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/our-vision1752752223.png\",\"image_id_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/stripe1754548961.png\"}]}],\"theme_register_page\":[{\"title\":\"Sign Up Now!\",\"subtitle\":\"Join for an Amazing Shopping Experience\",\"description\":\"Sign up now to explore a wide range of products from multiple stores, enjoy seamless shopping, secure transactions, and exclusive discounts.\",\"terms_page_title\":\"Terms & Conditions\",\"terms_page_url\":\"http:\\/\\/localhost:3000\\/terms\",\"social_login_enable_disable\":\"on\",\"image_id\":1092,\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/group-11712788981752749346.png\",\"image_id_url\":null}],\"theme_blog_page\":[{\"popular_title\":\"Popular Posts\",\"related_title\":\"Related Posts\"}],\"theme_product_details_page\":[{\"delivery_title\":\"Delivery Info\",\"delivery_subtitle\":null,\"refund_title\":\"Refund Info\",\"refund_subtitle\":null,\"related_title\":null,\"delivery_url\":null,\"refund_url\":null,\"delivery_enabled_disabled\":\"on\",\"refund_enabled_disabled\":\"on\"}]}]}', NULL, NULL),
(25930, 140, 'App\\Models\\SettingOption', 'ar', 'theme_data', '{\"name\":\"\\u0627\\u0644\\u062b\\u064a\\u0645 \\u0627\\u0644\\u0645\\u0645\\u064a\\u0632\",\"theme_pages\":[{\"theme_home_page\":[{\"slider\":[{\"enabled_disabled\":\"on\"}],\"category\":[{\"title\":\"\\u0641\\u0626\\u0629 \\u062a\\u062c\\u0631\\u064a\\u0628\\u064a\\u0629\",\"enabled_disabled\":\"on\"}],\"flash_sale\":[{\"title\":\"Test Category df\",\"enabled_disabled\":\"on\"}],\"product_featured\":[{\"title\":\"\\u0627\\u0644\\u0645\\u0646\\u062a\\u062c\\u0627\\u062a \\u0627\\u0644\\u0645\\u0645\\u064a\\u0632\\u0629\",\"enabled_disabled\":\"on\"}],\"banner_section\":[{\"enabled_disabled\":\"on\"}],\"product_top_selling\":[{\"title\":\"\\u0627\\u0644\\u0623\\u0643\\u062b\\u0631 \\u0645\\u0628\\u064a\\u0639\\u064b\\u0627\",\"enabled_disabled\":\"on\"}],\"product_latest\":[{\"title\":\"\\u0623\\u062d\\u062f\\u062b \\u0627\\u0644\\u0645\\u0646\\u062a\\u062c\\u0627\\u062a\",\"enabled_disabled\":\"on\"}],\"popular_product_section\":[{\"title\":\"\\u0627\\u0644\\u0645\\u0646\\u062a\\u062c\\u0627\\u062a \\u0627\\u0644\\u0634\\u0639\\u0628\\u064a\\u0629\",\"enabled_disabled\":\"on\"}],\"top_stores_section\":[{\"title\":\"\\u0623\\u0641\\u0636\\u0644 \\u0627\\u0644\\u0645\\u062a\\u0627\\u062c\\u0631\",\"enabled_disabled\":\"on\"}],\"newsletters_section\":[{\"title\":\"\\u0627\\u0634\\u062a\\u0631\\u0643 \\u0641\\u064a \\u0627\\u0644\\u0646\\u0634\\u0631\\u0627\\u062a \\u0627\\u0644\\u0625\\u062e\\u0628\\u0627\\u0631\\u064a\\u0629\",\"subtitle\":\"\\u0646\\u0642\\u062f\\u0645 \\u0645\\u0646\\u062a\\u062c\\u0627\\u062a \\u0639\\u0627\\u0644\\u064a\\u0629 \\u0627\\u0644\\u062c\\u0648\\u062f\\u0629 \\u0645\\u0646 \\u0628\\u0627\\u0626\\u0639\\u064a\\u0646 \\u0645\\u0648\\u062b\\u0648\\u0642\\u064a\\u0646 \\u0628\\u0627\\u0644\\u0642\\u0631\\u0628 \\u0645\\u0646\\u0643 \\u0641\\u064a \\u0627\\u0644\\u0648\\u0642\\u062a \\u0627\\u0644\\u0645\\u062d\\u062f\\u062f\\u060c \\u0643\\u0644 \\u0630\\u0644\\u0643 \\u0641\\u064a \\u0645\\u0643\\u0627\\u0646 \\u0648\\u0627\\u062d\\u062f.\",\"enabled_disabled\":\"on\"}]}],\"theme_login_page\":[{\"customer\":[{\"title\":null,\"subtitle\":null,\"enabled_disabled\":\"on\",\"image_id\":1092,\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/group-11712788981752749346.png\",\"image_id_url\":null}],\"admin\":[{\"title\":null,\"subtitle\":null,\"image_id\":\"1177\",\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/our-vision1752752223.png\",\"image_id_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/stripe1754548961.png\"}]}],\"theme_register_page\":[{\"terms_page_url\":\"http:\\/\\/localhost:3000\\/terms\",\"social_login_enable_disable\":\"on\",\"image_id\":1092,\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/group-11712788981752749346.png\",\"image_id_url\":null}],\"theme_blog_page\":[{\"popular_title\":\"Popular Posts\",\"related_title\":\"Related Posts\"}],\"theme_product_details_page\":[{\"delivery_title\":null,\"delivery_subtitle\":null,\"refund_title\":null,\"refund_subtitle\":null,\"related_title\":null,\"delivery_url\":null,\"refund_url\":null,\"delivery_enabled_disabled\":\"on\",\"refund_enabled_disabled\":\"on\"}]}]}', NULL, NULL),
(25931, 140, 'App\\Models\\SettingOption', 'es', 'theme_data', '{\"name\":\"Tema Premium\",\"theme_pages\":[{\"theme_home_page\":[{\"slider\":[{\"enabled_disabled\":\"on\"}],\"category\":[{\"title\":\"Categor\\u00eda de prueba\",\"enabled_disabled\":\"on\"}],\"flash_sale\":[{\"title\":\"Test Category df\",\"enabled_disabled\":\"on\"}],\"product_featured\":[{\"title\":\"Productos destacados\",\"enabled_disabled\":\"on\"}],\"banner_section\":[{\"enabled_disabled\":\"on\"}],\"product_top_selling\":[{\"title\":\"M\\u00e1s vendidos\",\"enabled_disabled\":\"on\"}],\"product_latest\":[{\"title\":\"\\u00daltimos productos\",\"enabled_disabled\":\"on\"}],\"popular_product_section\":[{\"title\":\"Producto popular\",\"enabled_disabled\":\"on\"}],\"top_stores_section\":[{\"title\":\"Tiendas principales\",\"enabled_disabled\":\"on\"}],\"newsletters_section\":[{\"title\":\"Suscribirse al bolet\\u00edn\",\"subtitle\":\"Ofrecemos productos de alta calidad de vendedores confiables cerca de ti a tiempo, todo en un solo lugar.\",\"enabled_disabled\":\"on\"}]}],\"theme_login_page\":[{\"customer\":[{\"title\":\"Test Category df\",\"subtitle\":\"Test Category subtitle\",\"enabled_disabled\":\"on\",\"image_id\":1092,\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/group-11712788981752749346.png\",\"image_id_url\":null}],\"admin\":[{\"title\":\"Test Category df\",\"subtitle\":\"Test Category subtitle\",\"image_id\":\"1177\",\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/our-vision1752752223.png\",\"image_id_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/stripe1754548961.png\"}]}],\"theme_register_page\":[{\"terms_page_url\":\"http:\\/\\/localhost:3000\\/terms\",\"social_login_enable_disable\":\"on\",\"image_id\":1092,\"img_url\":\"http:\\/\\/192.168.88.225:8000\\/storage\\/uploads\\/media-uploader\\/default\\/group-11712788981752749346.png\",\"image_id_url\":null}],\"theme_blog_page\":[{\"popular_title\":\"Popular Posts\",\"related_title\":\"Related Posts\"}],\"theme_product_details_page\":[{\"delivery_title\":null,\"delivery_subtitle\":null,\"refund_title\":null,\"refund_subtitle\":null,\"related_title\":null,\"delivery_url\":null,\"refund_url\":null,\"delivery_enabled_disabled\":\"on\",\"refund_enabled_disabled\":\"on\"}]}]}', NULL, NULL),
(25932, 1, 'App\\Models\\Store', 'df', 'name', 'Fresh Grocer', NULL, NULL),
(25933, 1, 'App\\Models\\Store', 'df', 'meta_title', 'Fresh Grocer - Your Neighborhood Grocery Store', NULL, NULL),
(25934, 1, 'App\\Models\\Store', 'df', 'meta_description', 'Find fresh and organic grocery items at Fresh Grocer.', NULL, NULL),
(25935, 1, 'App\\Models\\Store', 'en', 'name', 'Fresh Grocer', NULL, NULL),
(25936, 1, 'App\\Models\\Store', 'en', 'meta_title', 'Fresh Grocer - Your Neighborhood Grocery Store', NULL, NULL),
(25937, 1, 'App\\Models\\StoreArea', 'en', 'name', 'Gulshan', NULL, NULL),
(25941, 3, 'Modules\\Blog\\app\\Models\\BlogCategory', 'en', 'name', 'Test Name E5', NULL, NULL),
(25942, 3, 'Modules\\Blog\\app\\Models\\BlogCategory', 'en', 'meta_title', 'Test Blog Category Meta Title Update E5', NULL, NULL),
(25943, 3, 'Modules\\Blog\\app\\Models\\BlogCategory', 'en', 'meta_description', 'Test Blog Category Meta Description Update E5', NULL, NULL),
(25944, 3, 'Modules\\Blog\\app\\Models\\BlogCategory', 'ar', 'name', 'Test Name AR5', NULL, NULL),
(25945, 3, 'Modules\\Blog\\app\\Models\\BlogCategory', 'ar', 'meta_title', 'Test Blog Category Meta Title Update AR5', NULL, NULL),
(25946, 3, 'Modules\\Blog\\app\\Models\\BlogCategory', 'ar', 'meta_description', 'Test Blog Category Meta Description Update AR5', NULL, NULL),
(25947, 25, 'App\\Models\\Page', 'en', 'content', '{\"about_section\":{\"title\":null,\"subtitle\":null,\"description\":null,\"image\":1302,\"image_url\":null},\"story_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Our Vision and Beginning\",\"subtitle\":\"Transforming the eCommerce Landscape with a Vision to Connect Buyers and Sellers Seamlessly\",\"image\":1111},{\"title\":\"Overcoming Challenges\",\"subtitle\":\"Navigating Obstacles with Innovation to Build a Reliable and Secure Marketplace\",\"image\":1111},{\"title\":\"Our Future Vision\",\"subtitle\":\"Continuing to Innovate and Grow, Building a Sustainable eCommerce Ecosystem for the Future\",\"image\":1111}]},\"mission_and_vision_section\":{\"title\":\"Our Mission & Vision\",\"subtitle\":\"At Quick Ecommerce, we are committed to revolutionizing eCommerce by creating a seamless, secure, and customer-centric marketplace. Our mission is to empower businesses with the tools they need to succeed while providing shoppers.\",\"steps\":[{\"title\":\"Our Mission\",\"subtitle\":null,\"description\":\"Make online shopping easy, reliable, and enjoyable for customers. Enable sellers to grow by offering powerful tools and support. Deliver competitive prices, quality products, and exceptional service. Foster a trusted marketplace built on transparency and\",\"image\":1115},{\"title\":\"Our vision\",\"subtitle\":null,\"description\":\"Revolutionize digital commerce by integrating cutting-edge technology. Expand globally, connecting millions of buyers and sellers worldwide. Create a thriving community where businesses succeed and customers shop with confidence. Lead with innovation, con\",\"image\":1112}]},\"testimonial_and_success_section\":{\"title\":\"Testimonials & Success Stories\",\"subtitle\":\"From a Bold Vision to a Trusted Marketplace: How Quick Ecommerce Was Built to Transform the Future of eCommerce\",\"steps\":[{\"title\":\"Bill Gates\",\"subtitle\":\"CEO\",\"description\":\"Their attention to detail and creative design approach transformed our website into a visually stunning and highly functional platform.\",\"image\":1300},{\"title\":\"John Anderson\",\"subtitle\":\"CTO\",\"description\":\"Their attention to detail and creative design approach transformed our website into a visually stunning and highly functional platform.\",\"image\":1300},{\"title\":\"Bill Gates\",\"subtitle\":\"CEO\",\"description\":\"Their attention to detail and creative design approach transformed our website into a visually stunning and highly functional platform.\",\"image\":1300},{\"title\":\"John Anderson\",\"subtitle\":\"CEO\",\"description\":\"Their attention to detail and creative design approach transformed our website into a visually stunning and highly functional platform.\",\"image\":1300}]}}', NULL, NULL),
(25951, 5, 'App\\Models\\FlashSale', 'en', 'title', 'Your Daily Needs', NULL, NULL),
(25952, 5, 'App\\Models\\FlashSale', 'en', 'description', 'Get Now open all branch', NULL, NULL),
(25953, 5, 'App\\Models\\FlashSale', 'en', 'button_text', 'Shop Now', NULL, NULL),
(25957, 38, 'App\\Models\\Page', 'df', 'title', 'Contact Page', NULL, NULL),
(25958, 38, 'App\\Models\\Page', 'df', 'content', '{\"contact_form_section\":{\"title\":\"Quick Ecommerce\",\"subtitle\":\"Feel free to connect with our team and turn your ideas into reality. Our dedicated customer support team is available 24\\/7 to assist you\"},\"contact_details_section\":{\"address\":\"545 Mavis Island, IL 99191\",\"phone\":\"113434134\",\"email\":\"quick_ecommerce_contact@gmail.com\",\"website\":\"#\",\"image\":1310,\"image_url\":null,\"social\":[]},\"map_section\":{\"coordinates\":{\"lat\":23.8103,\"lng\":90.4125}}}', NULL, NULL),
(25959, 38, 'App\\Models\\Page', 'df', 'meta_title', 'Contact Page', NULL, NULL),
(25960, 38, 'App\\Models\\Page', 'df', 'meta_description', 'Contact Page', NULL, NULL),
(25961, 38, 'App\\Models\\Page', 'df', 'meta_keywords', 'Conact, Conact Page', NULL, NULL),
(25962, 38, 'App\\Models\\Page', 'en', 'content', '{\"contact_form_section\":{\"title\":\"Quick Ecommerce\",\"subtitle\":\"Feel free to connect with our team and turn your ideas into reality. Our dedicated customer support team is available 24\\/7 to assist you\"},\"contact_details_section\":{\"address\":\"545 Mavis Island, IL 99191\",\"phone\":\"113434134\",\"email\":\"quick_ecommerce_contact@gmail.com\",\"website\":\"#\",\"image\":1310,\"image_url\":null,\"social\":[]},\"map_section\":{\"coordinates\":{\"lat\":23.8103,\"lng\":90.4125}}}', NULL, NULL),
(25963, 38, 'App\\Models\\Page', 'es', 'content', '{\"contact_form_section\":{\"title\":null,\"subtitle\":null},\"contact_details_section\":{\"address\":\"545 Mavis Island, IL 99191\",\"phone\":\"113434134\",\"email\":\"quick_ecommerce_contact@gmail.com\",\"website\":\"#\",\"image\":1310,\"image_url\":null,\"social\":[]},\"map_section\":{\"coordinates\":{\"lat\":23.8103,\"lng\":90.4125}}}', NULL, NULL),
(25964, 38, 'App\\Models\\Page', 'ar', 'content', '{\"contact_form_section\":{\"title\":null,\"subtitle\":null},\"contact_details_section\":{\"address\":\"545 Mavis Island, IL 99191\",\"phone\":\"113434134\",\"email\":\"quick_ecommerce_contact@gmail.com\",\"website\":\"#\",\"image\":1310,\"image_url\":null,\"social\":[]},\"map_section\":{\"coordinates\":{\"lat\":23.8103,\"lng\":90.4125}}}', NULL, NULL),
(25965, 38, 'App\\Models\\Page', 'en', 'title', 'Contact Page', NULL, NULL),
(25966, 38, 'App\\Models\\Page', 'en', 'meta_title', 'Contact Page', NULL, NULL),
(25967, 38, 'App\\Models\\Page', 'en', 'meta_description', 'Contact Page', NULL, NULL),
(25968, 38, 'App\\Models\\Page', 'en', 'meta_keywords', 'Contact, Contact Page', NULL, NULL),
(25969, 39, 'App\\Models\\Page', 'df', 'title', 'About Page', NULL, NULL),
(25970, 39, 'App\\Models\\Page', 'df', 'content', '{\"about_section\":{\"title\":\"About Quick Ecommerce\",\"subtitle\":\"Where Innovation Meets Seamless Online Shopping\",\"description\":\"At Quick Ecommerce, we redefine eCommerce with a seamless, secure, and user-friendly shopping experience. As a premier online marketplace, we connect buyers and sellers through cutting-edge technology, ensuring effortless transactions and customer satisfaction.\",\"image\":1306,\"image_url\":null},\"story_section\":{\"title\":\"Our Story\",\"subtitle\":\"From a Bold Vision to a Trusted Marketplace: How Quick Ecommerce Was Built to Transform the Future of eCommerce\",\"steps\":[{\"title\":\"Our Vision and Beginning\",\"subtitle\":\"Transforming the eCommerce Landscape with a Vision to Connect Buyers and Sellers Seamlessly\",\"image\":1111},{\"title\":\"Overcoming Challenges\",\"subtitle\":\"Navigating Obstacles with Innovation to Build a Reliable and Secure Marketplace\",\"image\":1111},{\"title\":\"Our Future Vision\",\"subtitle\":\"Continuing to Innovate and Grow, Building a Sustainable eCommerce Ecosystem for the Future\",\"image\":1111}]},\"mission_and_vision_section\":{\"title\":\"Our Mission & Vision\",\"subtitle\":\"At Quick Ecommerce, we are committed to revolutionizing eCommerce by creating a seamless, secure, and customer-centric marketplace. Our mission is to empower businesses with the tools they need to succeed while providing shoppers.\",\"steps\":[{\"title\":\"Our Mission\",\"subtitle\":null,\"description\":\"Make online shopping easy, reliable, and enjoyable for customers. Enable sellers to grow by offering powerful tools and support. Deliver competitive prices, quality products, and exceptional service. Foster a trusted marketplace built on transparency and\",\"image\":1115},{\"title\":\"Our vision\",\"subtitle\":null,\"description\":\"Revolutionize digital commerce by integrating cutting-edge technology. Expand globally, connecting millions of buyers and sellers worldwide. Create a thriving community where businesses succeed and customers shop with confidence. Lead with innovation, con\",\"image\":1115}]},\"testimonial_and_success_section\":{\"title\":\"Testimonials & Success Stories\",\"subtitle\":\"From a Bold Vision to a Trusted Marketplace: How Quick Ecommerce Was Built to Transform the Future of eCommerce\",\"steps\":[{\"title\":\"Bill Gates\",\"subtitle\":\"CEO\",\"description\":\"I highly recommend them to anyone seeking professional web design services!\",\"image\":1311},{\"title\":\"John Anderson\",\"subtitle\":\"CTO\",\"description\":\"Their attention to detail and creative design approach transformed our website into a visually stunning and highly functional platform.\",\"image\":1311}]}}', NULL, NULL),
(25971, 39, 'App\\Models\\Page', 'df', 'meta_title', 'About', NULL, NULL),
(25972, 39, 'App\\Models\\Page', 'df', 'meta_description', 'About Page Meta Description', NULL, NULL),
(25973, 39, 'App\\Models\\Page', 'df', 'meta_keywords', 'About, About Page', NULL, NULL),
(25974, 39, 'App\\Models\\Page', 'en', 'content', '{\"about_section\":{\"title\":\"About Quick Ecommerce\",\"subtitle\":\"Where Innovation Meets Seamless Online Shopping\",\"description\":\"At Quick Ecommerce, we redefine eCommerce with a seamless, secure, and user-friendly shopping experience. As a premier online marketplace, we connect buyers and sellers through cutting-edge technology, ensuring effortless transactions and customer satisfaction.\",\"image\":1306,\"image_url\":null},\"story_section\":{\"title\":\"Our Story\",\"subtitle\":\"From a Bold Vision to a Trusted Marketplace: How Quick Ecommerce Was Built to Transform the Future of eCommerce\",\"steps\":[{\"title\":\"Our Vision and Beginning\",\"subtitle\":\"Transforming the eCommerce Landscape with a Vision to Connect Buyers and Sellers Seamlessly\",\"image\":1111},{\"title\":\"Overcoming Challenges\",\"subtitle\":\"Navigating Obstacles with Innovation to Build a Reliable and Secure Marketplace\",\"image\":1111},{\"title\":\"Our Future Vision\",\"subtitle\":\"Continuing to Innovate and Grow, Building a Sustainable eCommerce Ecosystem for the Future\",\"image\":1111}]},\"mission_and_vision_section\":{\"title\":\"Our Mission & Vision\",\"subtitle\":\"At Quick Ecommerce, we are committed to revolutionizing eCommerce by creating a seamless, secure, and customer-centric marketplace. Our mission is to empower businesses with the tools they need to succeed while providing shoppers.\",\"steps\":[{\"title\":\"Our Mission\",\"subtitle\":null,\"description\":\"Make online shopping easy, reliable, and enjoyable for customers. Enable sellers to grow by offering powerful tools and support. Deliver competitive prices, quality products, and exceptional service. Foster a trusted marketplace built on transparency and\",\"image\":1115},{\"title\":\"Our vision\",\"subtitle\":null,\"description\":\"Revolutionize digital commerce by integrating cutting-edge technology. Expand globally, connecting millions of buyers and sellers worldwide. Create a thriving community where businesses succeed and customers shop with confidence. Lead with innovation, con\",\"image\":1115}]},\"testimonial_and_success_section\":{\"title\":\"Testimonials & Success Stories\",\"subtitle\":\"From a Bold Vision to a Trusted Marketplace: How Quick Ecommerce Was Built to Transform the Future of eCommerce\",\"steps\":[{\"title\":\"Bill Gates\",\"subtitle\":\"CEO\",\"description\":\"I highly recommend them to anyone seeking professional web design services!\",\"image\":1311},{\"title\":\"John Anderson\",\"subtitle\":\"CTO\",\"description\":\"Their attention to detail and creative design approach transformed our website into a visually stunning and highly functional platform.\",\"image\":1311}]}}', NULL, NULL),
(25975, 39, 'App\\Models\\Page', 'es', 'content', '{\"about_section\":{\"title\":null,\"subtitle\":null,\"description\":null,\"image\":1306,\"image_url\":null},\"story_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Our Vision and Beginning\",\"subtitle\":\"Transforming the eCommerce Landscape with a Vision to Connect Buyers and Sellers Seamlessly\",\"image\":1111},{\"title\":\"Overcoming Challenges\",\"subtitle\":\"Navigating Obstacles with Innovation to Build a Reliable and Secure Marketplace\",\"image\":1111},{\"title\":\"Our Future Vision\",\"subtitle\":\"Continuing to Innovate and Grow, Building a Sustainable eCommerce Ecosystem for the Future\",\"image\":1111}]},\"mission_and_vision_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Our Mission\",\"subtitle\":null,\"description\":null,\"image\":1115},{\"title\":\"Our vision\",\"subtitle\":null,\"description\":null,\"image\":1115}]},\"testimonial_and_success_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Our Mission\",\"subtitle\":\"CEO\",\"description\":\"CEO\",\"image\":1311},{\"title\":\"Our vision\",\"subtitle\":\"CTO\",\"description\":\"CTO\",\"image\":1311}]}}', NULL, NULL),
(25976, 39, 'App\\Models\\Page', 'ar', 'content', '{\"about_section\":{\"title\":null,\"subtitle\":null,\"description\":null,\"image\":1306,\"image_url\":null},\"story_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Our Vision and Beginning\",\"subtitle\":\"Transforming the eCommerce Landscape with a Vision to Connect Buyers and Sellers Seamlessly\",\"image\":1111},{\"title\":\"Overcoming Challenges\",\"subtitle\":\"Navigating Obstacles with Innovation to Build a Reliable and Secure Marketplace\",\"image\":1111},{\"title\":\"Our Future Vision\",\"subtitle\":\"Continuing to Innovate and Grow, Building a Sustainable eCommerce Ecosystem for the Future\",\"image\":1111}]},\"mission_and_vision_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Our Mission\",\"subtitle\":null,\"description\":null,\"image\":1115},{\"title\":\"Our vision\",\"subtitle\":null,\"description\":null,\"image\":1115}]},\"testimonial_and_success_section\":{\"title\":null,\"subtitle\":null,\"steps\":[{\"title\":\"Our Mission\",\"subtitle\":\"CEO\",\"description\":\"CEO\",\"image\":1311},{\"title\":\"Our vision\",\"subtitle\":\"CTO\",\"description\":\"CTO\",\"image\":1311}]}}', NULL, NULL),
(25977, 39, 'App\\Models\\Page', 'en', 'title', 'About Page', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `order` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `name`, `order`, `created_at`, `updated_at`) VALUES
(1, 'Kilogram', 1, NULL, NULL),
(2, 'Gram', 2, NULL, NULL),
(3, 'Liter', 3, NULL, NULL),
(4, 'Milliliter', 4, NULL, NULL),
(5, 'Piece', 5, NULL, NULL),
(6, 'Meter', 6, NULL, NULL),
(7, 'Centimeter', 7, NULL, NULL),
(8, 'Inch', 8, NULL, NULL),
(9, 'Foot', 9, NULL, NULL),
(10, 'Yard', 10, NULL, NULL),
(11, 'Tonne', 11, NULL, NULL),
(12, 'Ounce', 12, NULL, NULL),
(13, 'Pound', 13, NULL, NULL),
(14, 'Stone', 14, NULL, NULL),
(15, 'Mile', 15, NULL, NULL),
(16, 'Nautical Mile', 16, NULL, NULL),
(17, 'Kilometer', 17, NULL, NULL),
(18, 'Hectare', 18, NULL, NULL),
(19, 'Acre', 19, NULL, NULL),
(20, 'Decimeter', 20, NULL, NULL),
(21, 'Micrometer', 21, NULL, NULL),
(22, 'Nanometer', 22, NULL, NULL),
(23, 'Picometer', 23, NULL, NULL),
(24, 'Fathom', 24, NULL, NULL),
(25, 'Rod', 25, NULL, NULL),
(26, 'Perch', 26, NULL, NULL),
(27, 'Chain', 27, NULL, NULL),
(28, 'Light Year', 28, NULL, NULL),
(29, 'Parsec', 29, NULL, NULL),
(30, 'Furlong', 30, NULL, NULL),
(31, 'Bushel', 31, NULL, NULL),
(32, 'Gallon', 32, NULL, NULL),
(33, 'Quart', 33, NULL, NULL),
(34, 'Pint', 34, NULL, NULL),
(35, 'Cup', 35, NULL, NULL),
(36, 'Fluid Ounce', 36, NULL, NULL),
(37, 'Teaspoon', 37, NULL, NULL),
(38, 'Tablespoon', 38, NULL, NULL),
(39, 'Cubic Meter', 39, NULL, NULL),
(40, 'Cubic Centimeter', 40, NULL, NULL),
(41, 'Cubic Inch', 41, NULL, NULL),
(42, 'Cubic Foot', 42, NULL, NULL),
(43, 'Cubic Yard', 43, NULL, NULL),
(44, 'Deciliter', 44, NULL, NULL),
(45, 'Milliliter', 45, NULL, NULL),
(46, 'Barrel', 46, NULL, NULL),
(47, 'Bale', 47, NULL, NULL),
(48, 'Box', 48, NULL, NULL),
(49, 'Bundle', 49, NULL, NULL),
(50, 'Canister', 50, NULL, NULL),
(51, 'Case', 51, NULL, NULL),
(52, 'Carton', 52, NULL, NULL),
(53, 'Container', 53, NULL, NULL),
(54, 'Crate', 54, NULL, NULL),
(55, 'Drum', 55, NULL, NULL),
(56, 'Dram', 56, NULL, NULL),
(57, 'Dozen', 57, NULL, NULL),
(58, 'Envelope', 58, NULL, NULL),
(59, 'Gallon (UK)', 59, NULL, NULL),
(60, 'Gallon (US)', 60, NULL, NULL),
(61, 'Gram per cubic centimeter', 61, NULL, NULL),
(62, 'Hogshead', 62, NULL, NULL),
(63, 'Keg', 63, NULL, NULL),
(64, 'Kiloliter', 64, NULL, NULL),
(65, 'Kilogram per liter', 65, NULL, NULL),
(66, 'Liter per second', 66, NULL, NULL),
(67, 'M3', 67, NULL, NULL),
(68, 'Megaton', 68, NULL, NULL),
(69, 'Microliter', 69, NULL, NULL),
(70, 'Milligram', 70, NULL, NULL),
(71, 'Millimeter', 71, NULL, NULL),
(72, 'Newton', 72, NULL, NULL),
(73, 'Ounce (Fluid)', 73, NULL, NULL),
(74, 'Ounce (Weight)', 74, NULL, NULL),
(75, 'Packet', 75, NULL, NULL),
(76, 'Pair', 76, NULL, NULL),
(77, 'Pen', 77, NULL, NULL),
(78, 'Pound per square inch', 78, NULL, NULL),
(79, 'Quart (UK)', 79, NULL, NULL),
(80, 'Quart (US)', 80, NULL, NULL),
(81, 'Ration', 81, NULL, NULL),
(82, 'Ream', 82, NULL, NULL),
(83, 'Roll', 83, NULL, NULL),
(84, 'Set', 84, NULL, NULL),
(85, 'Sheet', 85, NULL, NULL),
(86, 'Slab', 86, NULL, NULL),
(87, 'Slice', 87, NULL, NULL),
(88, 'Teaspoon (Metric)', 88, NULL, NULL),
(89, 'Ton (UK)', 89, NULL, NULL),
(90, 'Ton (US)', 90, NULL, NULL),
(91, 'Troy ounce', 91, NULL, NULL),
(92, 'Vial', 92, NULL, NULL),
(93, 'Watt', 93, NULL, NULL),
(94, 'Watt-hour', 94, NULL, NULL),
(95, 'Yottabyte', 95, NULL, NULL),
(96, 'Zettabyte', 96, NULL, NULL),
(97, 'Kibibyte', 97, NULL, NULL),
(98, 'Mebibyte', 98, NULL, NULL),
(99, 'Gibibyte', 99, NULL, NULL),
(100, 'Tebibyte', 100, NULL, NULL),
(101, 'Petabyte', 101, NULL, NULL),
(102, 'Exabyte', 102, NULL, NULL),
(103, 'Kilobit', 103, NULL, NULL),
(104, 'Megabit', 104, NULL, NULL),
(105, 'Gigabit', 105, NULL, NULL),
(106, 'Terabit', 106, NULL, NULL),
(107, 'Petabit', 107, NULL, NULL),
(108, 'Exabit', 108, NULL, NULL),
(109, 'Zettabit', 109, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `universal_notifications`
--

CREATE TABLE `universal_notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `notifiable_type` enum('admin','store','customer','deliveryman') NOT NULL DEFAULT 'customer',
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `status` enum('unread','read') NOT NULL DEFAULT 'unread',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `activity_scope` varchar(255) DEFAULT NULL,
  `email_verify_token` text DEFAULT NULL,
  `email_verified` int(11) NOT NULL DEFAULT 0 COMMENT '0=unverified, 1=verified',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `password_changed_at` timestamp NULL DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `def_lang` varchar(255) DEFAULT NULL,
  `activity_notification` tinyint(1) NOT NULL DEFAULT 1,
  `firebase_token` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `facebook_id` varchar(255) DEFAULT NULL,
  `apple_id` varchar(255) DEFAULT NULL,
  `store_owner` bigint(20) UNSIGNED DEFAULT NULL COMMENT '1=store_owner',
  `store_seller_id` bigint(20) UNSIGNED DEFAULT NULL,
  `stores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`stores`)),
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '0=Inactive,1=Active,2=Suspended',
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `online_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `deactivated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `slug`, `phone`, `email`, `activity_scope`, `email_verify_token`, `email_verified`, `email_verified_at`, `password`, `password_changed_at`, `image`, `def_lang`, `activity_notification`, `firebase_token`, `google_id`, `facebook_id`, `apple_id`, `store_owner`, `store_seller_id`, `stores`, `status`, `is_available`, `online_at`, `remember_token`, `deactivated_at`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'Store', 'Admin', 'store-admin', '10515191941', 'seller@gmail.com', 'store_level', '242748', 1, '2025-08-07 01:44:15', '$2y$12$GLk.V7aTwFT1DIkYy.AU6uXxqJPw1D8PgPUcbEn3UMIErt82ecBpC', '2025-04-08 22:41:57', '1300', NULL, 1, NULL, NULL, NULL, NULL, 1, 1, '\"[1,3,4]\"', 1, 1, '2025-10-04 22:00:16', NULL, NULL, NULL, '2021-06-26 22:13:00', '2025-10-05 03:59:30'),
(6, 'Delivery', 'Man', 'delivery-man', '+1246358666', 'deliveryman@gmail.com', 'delivery_level', NULL, 1, '2025-08-03 23:00:38', '$2y$12$L3k0.WvFxUPwNFIvvO7Vm.gP5ZGofNn..yADnb5XoM/mo6X7wh5kq', '2025-07-07 17:08:06', '1300', NULL, 1, '554345345345', NULL, NULL, NULL, 0, 1, NULL, 1, 1, '2025-09-26 21:59:00', NULL, NULL, NULL, '2022-03-17 10:25:39', '2025-09-26 21:59:00');

-- --------------------------------------------------------

--
-- Table structure for table `user_otps`
--

CREATE TABLE `user_otps` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `user_type` varchar(255) NOT NULL,
  `otp_code` varchar(255) NOT NULL,
  `expired_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_types`
--

CREATE TABLE `vehicle_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `capacity` int(11) DEFAULT NULL COMMENT 'Load capacity in kilograms.',
  `speed_range` varchar(255) DEFAULT NULL COMMENT 'Average speed range, e.g., 20-40 km/h.',
  `fuel_type` enum('petrol','diesel','electric','hybrid') DEFAULT NULL,
  `max_distance` int(11) DEFAULT NULL COMMENT 'Maximum distance per trip in kilometers.',
  `extra_charge` decimal(8,2) DEFAULT NULL COMMENT 'Applicable if exceed max distance limit',
  `average_fuel_cost` decimal(8,2) DEFAULT NULL COMMENT 'Fuel cost per trip.',
  `description` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicle_types`
--

INSERT INTO `vehicle_types` (`id`, `name`, `capacity`, `speed_range`, `fuel_type`, `max_distance`, `extra_charge`, `average_fuel_cost`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Motorcycle', 120, '50', 'electric', 10, 0.00, 120.00, NULL, 1, '2025-03-20 01:32:01', '2025-07-20 05:54:49'),
(2, 'Electric Car', 130, '30', 'electric', 10, 0.00, 20.00, NULL, 1, '2025-03-20 01:32:36', '2025-05-14 10:05:00'),
(3, 'Truck', 500, '30', 'petrol', 120, 10.00, 100.00, NULL, 1, '2025-03-20 01:34:46', '2025-07-07 08:36:19');

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `owner_type` varchar(255) NOT NULL COMMENT 'store or deliveryman or customer',
  `balance` double NOT NULL DEFAULT 0,
  `earnings` decimal(15,2) NOT NULL DEFAULT 0.00,
  `withdrawn` decimal(15,2) NOT NULL DEFAULT 0.00,
  `refunds` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '0=inactive, 1=active',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`id`, `owner_id`, `owner_type`, `balance`, `earnings`, `withdrawn`, `refunds`, `status`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'App\\Models\\Customer', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:01', '2025-09-29 02:38:56'),
(2, 1, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-09-29 06:00:00'),
(4, 6, 'App\\Models\\User', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:10', '2025-09-24 03:33:18'),
(257, 2, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-09-13 03:40:39'),
(258, 3, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-09-11 03:17:54'),
(259, 4, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-09-15 00:17:07'),
(260, 5, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-09-16 05:35:12'),
(261, 6, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-08-07 04:09:50'),
(262, 7, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-08-07 04:08:07'),
(263, 8, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-07-21 06:41:01'),
(264, 9, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-09-29 04:27:16'),
(265, 10, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-07-21 06:41:01'),
(266, 11, 'App\\Models\\Store', 0, 0.00, 0.00, 0.00, 1, NULL, '2025-03-10 01:43:09', '2025-07-21 06:41:01');

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `wallet_id` bigint(20) UNSIGNED NOT NULL,
  `transaction_ref` varchar(255) DEFAULT NULL,
  `transaction_details` text DEFAULT NULL,
  `amount` double NOT NULL DEFAULT 0,
  `type` varchar(255) NOT NULL COMMENT 'credit or debit',
  `purpose` varchar(255) DEFAULT NULL,
  `payment_gateway` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL COMMENT 'pending , paid, failed',
  `status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '0=pending, 1=success',
  `currency_code` varchar(10) DEFAULT NULL,
  `exchange_rate` decimal(15,2) NOT NULL DEFAULT 1.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallet_withdrawals_transactions`
--

CREATE TABLE `wallet_withdrawals_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `wallet_id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `owner_type` varchar(255) DEFAULT NULL COMMENT 'store or deliveryman or customer',
  `withdraw_gateway_id` bigint(20) UNSIGNED NOT NULL,
  `gateway_name` varchar(255) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `fee` decimal(15,2) NOT NULL DEFAULT 0.00,
  `gateways_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gateways_options`)),
  `details` longtext DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending' COMMENT 'pending, approved, rejected',
  `reject_reason` text DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`id`, `customer_id`, `product_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2025-10-05 23:44:25', '2025-10-05 23:44:25');

-- --------------------------------------------------------

--
-- Table structure for table `withdraw_gateways`
--

CREATE TABLE `withdraw_gateways` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'stored as JSON' CHECK (json_valid(`fields`)),
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1=active, 0=inactive',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `withdraw_gateways`
--

INSERT INTO `withdraw_gateways` (`id`, `name`, `fields`, `status`, `created_at`, `updated_at`) VALUES
(1, 'PayPal', '[\"Account Name:\",\"Account Holder Name:\",\"Account Number:\"]', 1, '2025-03-10 01:50:38', '2025-05-15 10:41:06'),
(2, 'Stripe', '[\"Account Name\",\"Account Number\",\"Branch Name\"]', 1, '2025-03-20 02:33:34', '2025-05-14 10:54:46'),
(3, 'Paytm', '[\"Account Name\",\"Account Number\",\"Account Type\"]', 1, '2025-03-20 02:34:25', '2025-03-20 02:34:34');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `blogs_slug_unique` (`slug`);

--
-- Indexes for table `blog_categories`
--
ALTER TABLE `blog_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `blog_categories_name_unique` (`name`),
  ADD UNIQUE KEY `blog_categories_slug_unique` (`slug`);

--
-- Indexes for table `blog_comments`
--
ALTER TABLE `blog_comments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blog_comment_reactions`
--
ALTER TABLE `blog_comment_reactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blog_views`
--
ALTER TABLE `blog_views`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chat_messages_chat_id_foreign` (`chat_id`);

--
-- Indexes for table `contact_us_messages`
--
ALTER TABLE `contact_us_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `coupon_lines`
--
ALTER TABLE `coupon_lines`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `coupon_lines_coupon_code_unique` (`coupon_code`);

--
-- Indexes for table `currencies`
--
ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `currencies_code_unique` (`code`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customers_email_unique` (`email`),
  ADD UNIQUE KEY `customers_phone_unique` (`phone`);

--
-- Indexes for table `customer_addresses`
--
ALTER TABLE `customer_addresses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_deactivation_reasons`
--
ALTER TABLE `customer_deactivation_reasons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deliveryman_deactivation_reasons`
--
ALTER TABLE `deliveryman_deactivation_reasons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `delivery_man_reviews`
--
ALTER TABLE `delivery_man_reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `delivery_men`
--
ALTER TABLE `delivery_men`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `delivery_men_identification_number_unique` (`identification_number`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dynamic_fields`
--
ALTER TABLE `dynamic_fields`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dynamic_field_values`
--
ALTER TABLE `dynamic_field_values`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `email_templates`
--
ALTER TABLE `email_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_templates_type_unique` (`type`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `flash_sales`
--
ALTER TABLE `flash_sales`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `flash_sale_products`
--
ALTER TABLE `flash_sale_products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `linked_social_accounts`
--
ALTER TABLE `linked_social_accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `linked_social_accounts_user_id_foreign` (`user_id`);

--
-- Indexes for table `live_locations`
--
ALTER TABLE `live_locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `live_locations_trackable_type_trackable_id_index` (`trackable_type`,`trackable_id`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `media_user_id_index` (`user_id`),
  ADD KEY `media_name_index` (`name`),
  ADD KEY `media_path_index` (`path`),
  ADD KEY `media_dimensions_index` (`dimensions`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_invoice_number_unique` (`invoice_number`);

--
-- Indexes for table `order_activities`
--
ALTER TABLE `order_activities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_addresses`
--
ALTER TABLE `order_addresses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_delivery_histories`
--
ALTER TABLE `order_delivery_histories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_masters`
--
ALTER TABLE `order_masters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_refunds`
--
ALTER TABLE `order_refunds`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_refund_reasons`
--
ALTER TABLE `order_refund_reasons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payment_gateways`
--
ALTER TABLE `payment_gateways`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_available_for_unique` (`name`,`guard_name`,`available_for`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `pos_store_customers`
--
ALTER TABLE `pos_store_customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pos_store_customers_customer_id_index` (`customer_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`);

--
-- Indexes for table `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_attribute_values`
--
ALTER TABLE `product_attribute_values`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_authors`
--
ALTER TABLE `product_authors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_brand`
--
ALTER TABLE `product_brand`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_category`
--
ALTER TABLE `product_category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_queries`
--
ALTER TABLE `product_queries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_specifications`
--
ALTER TABLE `product_specifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_tags`
--
ALTER TABLE `product_tags`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_variants_product_id_index` (`product_id`),
  ADD KEY `product_variants_sku_index` (`sku`);

--
-- Indexes for table `product_views`
--
ALTER TABLE `product_views`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `review_reactions`
--
ALTER TABLE `review_reactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `setting_options`
--
ALTER TABLE `setting_options`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sitemaps`
--
ALTER TABLE `sitemaps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sliders`
--
ALTER TABLE `sliders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sms_providers`
--
ALTER TABLE `sms_providers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sms_providers_slug_unique` (`slug`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stores_slug_unique` (`slug`);

--
-- Indexes for table `store_areas`
--
ALTER TABLE `store_areas`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `store_area_settings`
--
ALTER TABLE `store_area_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `store_area_setting_range_charges`
--
ALTER TABLE `store_area_setting_range_charges`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `store_area_setting_store_types`
--
ALTER TABLE `store_area_setting_store_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `store_notices`
--
ALTER TABLE `store_notices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `store_notice_recipients`
--
ALTER TABLE `store_notice_recipients`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `store_sellers`
--
ALTER TABLE `store_sellers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `store_subscriptions`
--
ALTER TABLE `store_subscriptions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `store_types`
--
ALTER TABLE `store_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscribers`
--
ALTER TABLE `subscribers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subscribers_email_unique` (`email`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscription_histories`
--
ALTER TABLE `subscription_histories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_commissions`
--
ALTER TABLE `system_commissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_management`
--
ALTER TABLE `system_management`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tickets_department_id_index` (`department_id`),
  ADD KEY `tickets_customer_id_index` (`customer_id`),
  ADD KEY `tickets_store_id_index` (`store_id`);

--
-- Indexes for table `ticket_messages`
--
ALTER TABLE `ticket_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_messages_ticket_id_index` (`ticket_id`),
  ADD KEY `ticket_messages_sender_id_index` (`sender_id`),
  ADD KEY `ticket_messages_receiver_id_index` (`receiver_id`);

--
-- Indexes for table `translations`
--
ALTER TABLE `translations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `translations_translatable_id_translatable_type_index` (`translatable_id`,`translatable_type`),
  ADD KEY `translations_language_key_index` (`language`,`key`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `universal_notifications`
--
ALTER TABLE `universal_notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_slug_unique` (`slug`);

--
-- Indexes for table `user_otps`
--
ALTER TABLE `user_otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_otps_user_id_user_type_index` (`user_id`,`user_type`);

--
-- Indexes for table `vehicle_types`
--
ALTER TABLE `vehicle_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vehicle_types_name_unique` (`name`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallets_owner_id_owner_type_index` (`owner_id`,`owner_type`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallet_id` (`wallet_id`);

--
-- Indexes for table `wallet_withdrawals_transactions`
--
ALTER TABLE `wallet_withdrawals_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallet_withdrawals_transactions_owner_id_owner_type_status_index` (`owner_id`,`owner_type`,`status`),
  ADD KEY `wallet_withdrawals_transactions_wallet_id_index` (`wallet_id`),
  ADD KEY `wallet_withdrawals_transactions_owner_id_index` (`owner_id`),
  ADD KEY `wallet_withdrawals_transactions_withdraw_gateway_id_index` (`withdraw_gateway_id`),
  ADD KEY `wallet_withdrawals_transactions_approved_by_index` (`approved_by`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `withdraw_gateways`
--
ALTER TABLE `withdraw_gateways`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `blogs`
--
ALTER TABLE `blogs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `blog_categories`
--
ALTER TABLE `blog_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `blog_comments`
--
ALTER TABLE `blog_comments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_comment_reactions`
--
ALTER TABLE `blog_comment_reactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_views`
--
ALTER TABLE `blog_views`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `chats`
--
ALTER TABLE `chats`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=334;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_us_messages`
--
ALTER TABLE `contact_us_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `coupon_lines`
--
ALTER TABLE `coupon_lines`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `currencies`
--
ALTER TABLE `currencies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- AUTO_INCREMENT for table `customer_addresses`
--
ALTER TABLE `customer_addresses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `customer_deactivation_reasons`
--
ALTER TABLE `customer_deactivation_reasons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deliveryman_deactivation_reasons`
--
ALTER TABLE `deliveryman_deactivation_reasons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `delivery_man_reviews`
--
ALTER TABLE `delivery_man_reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `delivery_men`
--
ALTER TABLE `delivery_men`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `dynamic_fields`
--
ALTER TABLE `dynamic_fields`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `dynamic_field_values`
--
ALTER TABLE `dynamic_field_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `email_templates`
--
ALTER TABLE `email_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `flash_sales`
--
ALTER TABLE `flash_sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `flash_sale_products`
--
ALTER TABLE `flash_sale_products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=326;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `linked_social_accounts`
--
ALTER TABLE `linked_social_accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `live_locations`
--
ALTER TABLE `live_locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `media`
--
ALTER TABLE `media`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1314;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=161;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_activities`
--
ALTER TABLE `order_activities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_addresses`
--
ALTER TABLE `order_addresses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_delivery_histories`
--
ALTER TABLE `order_delivery_histories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_details`
--
ALTER TABLE `order_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_masters`
--
ALTER TABLE `order_masters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_refunds`
--
ALTER TABLE `order_refunds`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_refund_reasons`
--
ALTER TABLE `order_refund_reasons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `payment_gateways`
--
ALTER TABLE `payment_gateways`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9906;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pos_store_customers`
--
ALTER TABLE `pos_store_customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=274;

--
-- AUTO_INCREMENT for table `product_attributes`
--
ALTER TABLE `product_attributes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `product_attribute_values`
--
ALTER TABLE `product_attribute_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=483;

--
-- AUTO_INCREMENT for table `product_authors`
--
ALTER TABLE `product_authors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `product_brand`
--
ALTER TABLE `product_brand`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `product_category`
--
ALTER TABLE `product_category`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `product_queries`
--
ALTER TABLE `product_queries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_specifications`
--
ALTER TABLE `product_specifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT for table `product_tags`
--
ALTER TABLE `product_tags`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=952;

--
-- AUTO_INCREMENT for table `product_views`
--
ALTER TABLE `product_views`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `review_reactions`
--
ALTER TABLE `review_reactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `setting_options`
--
ALTER TABLE `setting_options`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=145;

--
-- AUTO_INCREMENT for table `sitemaps`
--
ALTER TABLE `sitemaps`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sliders`
--
ALTER TABLE `sliders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `sms_providers`
--
ALTER TABLE `sms_providers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=317;

--
-- AUTO_INCREMENT for table `store_areas`
--
ALTER TABLE `store_areas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `store_area_settings`
--
ALTER TABLE `store_area_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `store_area_setting_range_charges`
--
ALTER TABLE `store_area_setting_range_charges`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `store_area_setting_store_types`
--
ALTER TABLE `store_area_setting_store_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `store_notices`
--
ALTER TABLE `store_notices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_notice_recipients`
--
ALTER TABLE `store_notice_recipients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_sellers`
--
ALTER TABLE `store_sellers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `store_subscriptions`
--
ALTER TABLE `store_subscriptions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `store_types`
--
ALTER TABLE `store_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `subscribers`
--
ALTER TABLE `subscribers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `subscription_histories`
--
ALTER TABLE `subscription_histories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `system_commissions`
--
ALTER TABLE `system_commissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `system_management`
--
ALTER TABLE `system_management`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_messages`
--
ALTER TABLE `ticket_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `translations`
--
ALTER TABLE `translations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25978;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT for table `universal_notifications`
--
ALTER TABLE `universal_notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=209;

--
-- AUTO_INCREMENT for table `user_otps`
--
ALTER TABLE `user_otps`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `vehicle_types`
--
ALTER TABLE `vehicle_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=367;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wallet_withdrawals_transactions`
--
ALTER TABLE `wallet_withdrawals_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `withdraw_gateways`
--
ALTER TABLE `withdraw_gateways`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_chat_id_foreign` FOREIGN KEY (`chat_id`) REFERENCES `chats` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
