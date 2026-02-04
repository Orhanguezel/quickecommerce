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

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `chat_id`, `receiver_chat_id`, `sender_id`, `sender_type`, `receiver_id`, `receiver_type`, `message`, `file`, `is_seen`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 62, 62, 1, 'customer', 1, 'store', 'Hey', NULL, 0, NULL, '2025-09-23 06:11:22', '2025-09-23 06:11:22'),
(2, 7, 62, 8, 'admin', 1, 'store', 'Hey', NULL, 0, NULL, '2025-09-23 06:14:17', '2025-09-23 06:14:17'),
(3, 62, 7, 1, 'store', 8, 'admin', 'Hey', NULL, 0, NULL, '2025-09-23 06:14:29', '2025-09-23 06:14:29'),
(4, 62, 7, 1, 'store', 8, 'admin', 'Hello', NULL, 0, NULL, '2025-09-23 06:14:42', '2025-09-23 06:14:42'),
(7, 62, 101, 1, 'store', 1, 'customer', 'hi', NULL, 0, NULL, '2025-09-23 06:35:51', '2025-09-23 06:35:51'),
(10, 101, 5, 1, 'customer', 6, 'deliveryman', 'hi', NULL, 0, NULL, '2025-09-23 22:33:41', '2025-09-23 22:33:41'),
(11, 5, 62, 6, 'deliveryman', 1, 'store', 'your location', NULL, 0, NULL, '2025-09-23 22:33:56', '2025-09-23 22:33:56'),
(12, 101, 5, 1, 'customer', 6, 'deliveryman', 'your location', NULL, 0, NULL, '2025-09-23 22:34:50', '2025-09-23 22:34:50'),
(13, 5, 101, 6, 'deliveryman', 1, 'customer', 'hi', NULL, 0, NULL, '2025-09-23 22:35:00', '2025-09-23 22:35:00'),
(15, 5, 101, 6, 'deliveryman', 1, 'customer', 'hi', NULL, 0, NULL, '2025-09-23 22:35:18', '2025-09-23 22:35:18'),
(16, 5, 101, 6, 'deliveryman', 1, 'customer', 'hi', NULL, 0, NULL, '2025-09-23 22:35:37', '2025-09-23 22:35:37'),
(17, 101, 5, 1, 'customer', 6, 'deliveryman', 'ko', NULL, 0, NULL, '2025-09-23 22:35:46', '2025-09-23 22:35:46'),
(18, 5, 101, 6, 'deliveryman', 1, 'customer', 'uhi', NULL, 0, NULL, '2025-09-23 22:35:54', '2025-09-23 22:35:54'),
(20, 5, 101, 6, 'deliveryman', 1, 'customer', 'hi', NULL, 0, NULL, '2025-09-23 22:37:04', '2025-09-23 22:37:04'),
(21, 5, 101, 6, 'deliveryman', 1, 'customer', 'hi', NULL, 0, NULL, '2025-09-23 22:37:12', '2025-09-23 22:37:12'),
(22, 62, 101, 1, 'store', 1, 'customer', 'hey', NULL, 0, NULL, '2025-09-23 22:37:46', '2025-09-23 22:37:46'),
(23, 101, 62, 1, 'customer', 1, 'store', 'ok', NULL, 0, NULL, '2025-09-23 22:37:54', '2025-09-23 22:37:54'),
(30, 101, 223, 1, 'customer', 9, 'store', 'Hi , i m customer nafiz', NULL, 0, NULL, '2025-09-27 05:31:42', '2025-09-27 05:31:42'),
(31, 101, 5, 1, 'customer', 6, 'deliveryman', 'whats up', NULL, 0, NULL, '2025-09-28 03:18:33', '2025-09-28 03:18:33'),
(32, 101, 62, 1, 'customer', 1, 'store', 'Testing with you', NULL, 0, NULL, '2025-09-29 02:39:31', '2025-09-29 02:39:31'),
(33, 101, 62, 1, 'customer', 1, 'store', '🙂', NULL, 0, NULL, '2025-09-29 02:39:56', '2025-09-29 02:39:56');

-- --------------------------------------------------------

--
