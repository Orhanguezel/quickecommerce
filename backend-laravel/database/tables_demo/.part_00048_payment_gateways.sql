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
-- Dumping data for table `payment_gateways` (TR Expanded)
--

INSERT INTO `payment_gateways`
(`id`, `name`, `slug`, `image`, `description`, `auth_credentials`, `is_test_mode`, `status`, `created_at`, `updated_at`) VALUES

-- Kart ile ödeme (TR’de PayTR / iyzico gibi sağlayıcılar yaygın; burada “Kredi/Banka Kartı” üst isim)
(1, 'Kredi / Banka Kartı', 'card', '1176',
 'Visa/Mastercard ile güvenli ödeme. 3D Secure desteği ile hızlı ve güvenilir tahsilat.',
 '{\"provider\":\"generic\",\"card_3d_secure\":true,\"public_key\":null,\"secret_key\":null}',
 1, 1, '2025-03-10 01:43:09', '2026-01-19 00:00:00'),

-- iyzico (TR)
(2, 'iyzico', 'iyzico', '1177',
 'iyzico ile güvenli kart ödemesi. Taksit ve 3D Secure desteklenebilir.',
 '{\"iyzico_api_key\":null,\"iyzico_secret_key\":null,\"iyzico_base_url\":null}',
 1, 1, '2025-03-10 01:43:09', '2026-01-19 00:00:00'),

-- PayTR (TR)
(3, 'PayTR', 'paytr', '1177',
 'PayTR ile güvenli kart ödemesi. 3D Secure ve fraud koruma seçenekleri.',
 '{\"paytr_merchant_id\":null,\"paytr_merchant_key\":null,\"paytr_merchant_salt\":null,\"paytr_test_mode\":true}',
 1, 1, '2025-03-10 01:43:09', '2026-01-19 00:00:00'),

-- Havale / EFT (TR)
(4, 'Havale / EFT', 'bank_transfer', '1179',
 'Banka havalesi/EFT ile ödeme. Sipariş onayı, ödeme doğrulandıktan sonra yapılır.',
 '{\"bank_accounts\":[{\"bank_name\":null,\"account_name\":null,\"iban\":null,\"branch\":null}],\"note_required\":true}',
 1, 1, '2025-03-10 01:43:09', '2026-01-19 00:00:00'),

-- Kapıda Ödeme
(5, 'Kapıda Ödeme', 'cash_on_delivery', '1178',
 'Siparişinizi teslim alırken ödeme yapın. Bazı bölgelerde ek hizmet bedeli uygulanabilir.',
 '{\"cod_fee\":0,\"allowed_areas\":[],\"min_order_amount\":0}',
 1, 1, '2025-03-10 01:43:09', '2026-01-19 00:00:00'),

-- Papara (TR)
(6, 'Papara', 'papara', '1180',
 'Papara ile hızlı ödeme. QR/hesap ile ödeme senaryoları desteklenebilir.',
 '{\"papara_merchant_id\":null,\"papara_api_key\":null,\"papara_environment\":\"sandbox\"}',
 1, 1, '2025-03-10 01:43:09', '2026-01-19 00:00:00');


 ---  ziraat bankasi  havale  bilgileri ziraatpaya.com
 --- mokopos  isbankasi  havale  bilgileri isbankasipay.com
