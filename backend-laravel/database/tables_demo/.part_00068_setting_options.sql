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
-- SPORTOONLINE (TR) — İlk seed (UPDATE YOK)
--

INSERT INTO `setting_options` (`id`, `option_name`, `option_value`, `autoload`, `created_at`, `updated_at`) VALUES
(1, 'com_site_logo', '1294', '1', '2025-03-10 02:09:43', '2025-09-27 23:30:47'),
(2, 'com_site_favicon', '1297', '1', '2025-03-10 02:09:43', '2025-09-28 02:57:21'),

(3, 'com_site_title', 'Sportoonline', '1', '2025-03-10 02:09:43', '2025-09-15 06:24:50'),
(4, 'com_site_subtitle', 'Sportoonline’da güvenle alışveriş yapın: geniş ürün yelpazesi, avantajlı fiyatlar ve güvenilir satıcılar.', '1', '2025-03-10 02:09:43', '2025-09-15 06:24:50'),

(5, 'com_user_email_verification', NULL, '1', '2025-03-10 02:09:43', '2025-08-07 01:44:28'),
(6, 'com_user_login_otp', NULL, '1', '2025-03-10 02:09:43', '2025-08-03 03:57:32'),
(7, 'com_maintenance_mode', NULL, '1', '2025-03-10 02:09:43', '2025-09-16 04:34:21'),

(8, 'com_site_full_address', 'Sportoonline Merkez Ofis, (Adresinizi buraya girin), Türkiye', '1', '2025-03-10 02:09:44', '2025-09-15 22:17:40'),
(9, 'com_site_contact_number', '+90 (000) 000 00 00', '1', '2025-03-10 02:09:44', '2025-07-09 22:16:42'),

(10, 'com_site_website_url', 'https://sportoonline.com', '1', '2025-03-10 02:09:44', '2025-09-27 23:34:19'),
(11, 'com_site_email', 'info@sportoonline.com', '1', '2025-03-10 02:09:44', '2025-09-15 06:24:50'),

(12, 'com_site_footer_copyright', '© 2026 Sportoonline. Tüm hakları saklıdır.', '1', '2025-03-10 02:09:44', '2025-09-15 06:24:50'),

(13, 'com_quick_access_enable_disable', 'on', '1', '2025-03-10 03:11:26', '2025-03-25 02:40:00'),
(14, 'com_our_info_enable_disable', 'on', '1', '2025-03-10 03:11:26', '2025-03-25 02:40:00'),

(15, 'com_quick_access_title', 'Hızlı Erişim', '1', '2025-03-10 03:11:26', '2025-05-19 04:08:25'),
(16, 'com_our_info_title', 'Kurumsal', '1', '2025-03-10 03:11:26', '2025-05-19 04:08:25'),

(17, 'com_social_links_enable_disable', 'on', '1', '2025-03-10 03:11:26', '2025-03-25 02:40:00'),
(18, 'com_social_links_title', 'Bizi Takip Edin', '1', '2025-03-10 03:11:26', '2025-03-25 02:40:00'),

-- Gerçek hesaplar net değilse yanlış link vermemek için NULL bırakıldı
(19, 'com_social_links_facebook_url', NULL, '1', '2025-03-10 03:11:26', '2025-05-18 11:59:40'),
(20, 'com_social_links_twitter_url', NULL, '1', '2025-03-10 03:11:26', '2025-05-18 11:59:40'),
(21, 'com_social_links_instagram_url', NULL, '1', '2025-03-10 03:11:26', '2025-05-18 11:59:40'),
(22, 'com_social_links_linkedin_url', NULL, '1', '2025-03-10 03:11:26', '2025-05-18 11:59:40'),
(23, 'com_social_links_youtube_url', NULL, '1', '2025-03-10 03:11:26', '2025-05-19 04:08:25'),
(24, 'com_social_links_pinterest_url', NULL, '1', '2025-03-10 03:11:26', '2025-05-19 04:08:25'),
(25, 'com_social_links_snapchat_url', NULL, '1', '2025-03-10 03:11:26', '2025-05-19 04:08:25'),

(26, 'com_download_app_link_one', NULL, '1', '2025-03-10 03:11:26', '2025-05-18 11:59:40'),
(27, 'com_download_app_link_two', NULL, '1', '2025-03-10 03:11:27', '2025-05-18 11:59:40'),

(28, 'com_payment_methods_enable_disable', 'on', '1', '2025-03-10 03:11:27', '2025-04-15 11:48:47'),
(29, 'com_payment_methods_image', '734,737,732,733', '1', '2025-03-10 03:11:27', '2025-05-19 04:08:25'),

-- Format ayarları: TR için genelde "₺" sembolü bitişik (boşluk yok) ve ondalık kullanılabilir
(30, 'com_site_space_between_amount_and_symbol', 'NO', '1', '2025-03-12 01:00:20', '2025-09-09 22:37:58'),
(31, 'com_site_enable_disable_decimal_point', 'YES', '1', '2025-03-12 01:00:21', '2025-09-24 23:55:00'),
(32, 'com_site_comma_form_adjustment_amount', 'YES', '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),

-- Kur değerleri çevrilecek metin değil: sayısal seed korunur
(33, 'com_site_default_currency_to_usd_exchange_rate', '125', '1', '2025-03-12 01:00:21', '2025-08-24 04:49:00'),
(34, 'com_site_default_currency_to_myr_exchange_rate', '111', '1', '2025-03-12 01:00:21', '2025-08-24 04:49:00');

(35, 'com_site_default_currency_to_brl_exchange_rate', '222', '1', '2025-03-12 01:00:21', '2025-08-24 04:49:00'),
(36, 'com_site_default_currency_to_zar_exchange_rate', '344', '1', '2025-03-12 01:00:21', '2025-08-24 04:49:00'),
(37, 'com_site_default_currency_to_ngn_exchange_rate', '212', '1', '2025-03-12 01:00:21', '2025-08-24 04:49:00'),
(38, 'com_site_default_currency_to_inr_exchange_rate', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(39, 'com_site_default_currency_to_idr_exchange_rate', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(40, 'com_site_euro_to_ngn_exchange_rate', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(41, 'com_site_usd_to_ngn_exchange_rate', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),

-- Ödeme ayarları (değer yoksa aynı bırakıldı)
(42, 'com_site_default_payment_gateway', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(43, 'com_site_manual_payment_description', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(44, 'com_site_manual_payment_name', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),
(45, 'com_site_payment_gateway', NULL, '1', '2025-03-12 01:00:21', '2025-03-12 01:00:21'),

-- Para birimi ayarları (TR için daha uygun varsayılanlar)
(46, 'com_site_currency_symbol_position', 'right', '1', '2025-03-12 01:00:21', '2025-04-20 03:11:07'),
(47, 'com_site_global_currency', 'TRY', '1', '2025-03-12 01:00:21', '2025-04-19 11:48:16'),

-- Kayıt sayfası
(48, 'com_register_page_title', 'Hemen Üye Ol!', '1', '2025-03-17 22:20:27', '2025-03-18 22:18:26'),
(49, 'com_register_page_subtitle', 'Sportoonline ile kolay ve güvenli alışverişe başlayın', '1', '2025-03-17 22:20:27', '2025-03-18 22:18:26'),
(50, 'com_register_page_description', 'Üye olarak çok sayıda mağazadan ürünleri keşfedin, hızlı ve güvenli alışveriş yapın, avantajlı kampanya ve indirimlerden yararlanın.', '1', '2025-03-17 22:20:27', '2025-03-18 22:18:26'),
(51, 'com_register_page_image', '1152', '1', '2025-03-17 22:20:27', '2025-08-05 23:54:58'),
(52, 'com_register_page_terms_page', NULL, '1', '2025-03-17 22:20:27', '2025-03-18 22:18:26'),
(53, 'com_register_page_terms_title', 'Kullanım Şartları', '1', '2025-03-17 22:20:27', '2025-03-18 22:18:27'),
(54, 'com_register_page_social_enable_disable', 'on', '1', '2025-03-17 22:20:27', '2025-03-18 22:18:27'),

-- Giriş sayfası
(55, 'com_login_page_title', 'Giriş Yap', '1', '2025-03-18 00:12:53', '2025-03-18 22:22:25'),
(56, 'com_login_page_subtitle', 'Alışverişe devam edin', '1', '2025-03-18 00:12:53', '2025-03-19 02:21:22'),
(57, 'com_login_page_image', '1169', '1', '2025-03-18 00:12:53', '2025-08-06 23:54:02'),
(58, 'com_login_page_social_enable_disable', 'on', '1', '2025-03-18 00:12:53', '2025-05-22 10:08:03'),

-- Ürün detay sayfası: teslimat
(59, 'com_product_details_page_delivery_title', 'Ücretsiz Teslimat', '1', '2025-03-18 00:42:42', '2025-03-18 22:38:07'),
(60, 'com_product_details_page_delivery_subtitle', 'Türkiye geneline gönderim. Detaylar için ürün açıklamasını inceleyin.', '1', '2025-03-18 00:42:42', '2025-03-18 22:36:12'),
(61, 'com_product_details_page_delivery_url', NULL, '1', '2025-03-18 00:42:42', '2025-03-18 23:12:23'),
(62, 'com_product_details_page_delivery_enable_disable', 'on', '1', '2025-03-18 00:42:42', '2025-03-18 00:42:42'),

-- Ürün detay sayfası: iade & geri ödeme
(63, 'com_product_details_page_return_refund_title', 'Kolay İade ve Geri Ödeme', '1', '2025-03-18 00:42:42', '2025-03-18 22:36:12'),
(64, 'com_product_details_page_return_refund_subtitle', '30 gün içinde iade. İade kargo bedeli alıcıya aittir.', '1', '2025-03-18 00:42:42', '2025-03-18 22:36:13'),
(65, 'com_product_details_page_return_refund_url', NULL, '1', '2025-03-18 00:42:42', '2025-09-01 04:14:37'),
(66, 'com_product_details_page_return_refund_enable_disable', 'on', '1', '2025-03-18 00:42:42', '2025-03-18 00:42:42')

(67, 'com_product_details_page_related_title', 'İlgili Ürünler', '1', '2025-03-18 00:42:42', '2025-04-13 04:46:05'),
(68, 'com_blog_details_popular_title', 'Popüler Yazılar', '1', '2025-03-18 20:42:56', '2025-07-07 06:40:44'),
(69, 'com_blog_details_related_title', 'İlgili Yazılar', '1', '2025-03-18 20:42:56', '2025-07-07 06:40:44'),

-- Satıcı giriş sayfası
(70, 'com_seller_login_page_title', 'Giriş Yap', '1', '2025-03-18 22:31:53', '2025-07-28 21:51:22'),
(71, 'com_seller_login_page_subtitle', 'Çok Satıcılı Pazaryeri Ekosistemi', '1', '2025-03-18 22:31:53', '2025-07-28 21:51:22'),
(72, 'com_seller_login_page_image', '570', '1', '2025-03-18 22:31:53', '2025-04-06 02:27:49'),
(73, 'com_seller_login_page_social_enable_disable', NULL, '1', '2025-03-18 22:31:53', '2025-04-05 23:13:40'),

-- Para çekme limitleri
(74, 'minimum_withdrawal_limit', '10', '1', '2025-03-20 02:32:30', '2025-05-15 03:39:44'),
(75, 'maximum_withdrawal_limit', '500', '1', '2025-03-20 02:32:30', '2025-05-15 03:39:44'),

-- Footer hızlı erişim (JSON içerik Türkçeleştirildi)
(76, 'com_quick_access', '[{"com_quick_access_title":"Ana Sayfa","com_quick_access_url":"https://example.com"},{"com_quick_access_title":"Hakkımızda","com_quick_access_url":"https://example.com/hakkimizda"},{"com_quick_access_title":"İletişim","com_quick_access_url":"https://example.com/iletisim"},{"com_quick_access_title":"Blog","com_quick_access_url":null},{"com_quick_access_title":"Kuponlar","com_quick_access_url":null},{"com_quick_access_title":"Satıcı Ol","com_quick_access_url":"https://sportoonline.com/become-a-seller"}]', '1', '2025-03-25 02:40:00', '2025-05-19 07:03:08'),

-- Footer bilgi alanı
(77, 'com_our_info', '[{"title":"Gizlilik Politikası","url":"https://sportoonline.com/privacy-policy"},{"title":"Kullanım Şartları","url":"https://sportoonline.com/terms-conditions"},{"title":"Sıkça Sorulan Sorular","url":"https://sportoonline.com/faq"}]', '1', '2025-03-25 02:45:25', '2025-05-19 05:09:50'),

-- Sosyal giriş ayarları (değerler aynı)
(78, 'com_google_login_enabled', 'on', '1', '2025-04-06 03:15:05', '2025-09-29 03:54:23'),
(79, 'com_google_app_id', '483247466424-makrg9bs86r4vup300m3p3r63tpaa9v0.apps.googleusercontent.com', '1', '2025-04-06 03:15:05', '2025-04-06 03:15:05'),
(80, 'com_google_client_secret', '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', '1', '2025-04-06 03:15:05', '2025-04-06 03:15:05'),
(81, 'com_google_client_callback_url', NULL, '1', '2025-04-06 03:15:05', '2025-04-06 03:37:08'),

(82, 'com_facebook_login_enabled', 'on', '1', '2025-04-06 03:15:05', '2025-09-29 03:54:23'),
(83, 'com_facebook_app_id', NULL, '1', '2025-04-06 03:15:05', '2025-04-06 03:35:17'),
(84, 'com_facebook_client_secret', NULL, '1', '2025-04-06 03:15:05', '2025-04-06 03:35:17'),
(85, 'com_facebook_client_callback_url', NULL, '1', '2025-04-06 03:15:05', '2025-04-06 03:37:08'),

-- Site ve mail
(86, 'com_site_white_logo', '1294', '1', '2025-04-15 06:26:53', '2025-09-27 23:30:47'),
(87, 'com_site_global_email', 'info@sportoonline.com', '1', '2025-04-16 04:54:09', '2025-09-23 02:30:23'),

-- SMTP (dokunulmadı)
(88, 'com_site_smtp_mail_mailer', 'smtp', '1', '2025-04-16 04:54:09', '2025-04-16 04:54:09'),
(89, 'com_site_smtp_mail_host', 'sandbox.smtp.mailtrap.io', '1', '2025-04-16 04:54:09', '2025-04-16 04:54:09'),
(90, 'com_site_smtp_mail_post', '587', '1', '2025-04-16 04:54:09', '2025-04-16 05:05:27'),
(91, 'com_site_smtp_mail_username', '77df523ed856b8', '1', '2025-04-16 04:54:09', '2025-06-02 09:13:45'),
(92, 'com_site_smtp_mail_password', 'de1975454a18e2', '1', '2025-04-16 04:54:09', '2025-06-02 09:13:45'),
(93, 'com_site_smtp_mail_encryption', 'tls', '1', '2025-04-16 04:54:09', '2025-04-16 05:02:55'),

-- Finans
(94, 'max_deposit_per_transaction', '50000', '1', '2025-04-29 09:30:49', '2025-05-06 05:04:08'),

-- Bakım modu
(95, 'com_maintenance_title', 'Yakında Tekrar Yayındayız!', '1', '2025-04-30 09:08:32', '2025-05-25 08:12:26'),
(96, 'com_maintenance_description', 'Web sitemiz şu anda planlı bakım çalışmasındadır.\nEn kısa sürede tekrar hizmet vermeye başlayacağız.\nAnlayışınız için teşekkür ederiz.', '1', '2025-04-30 09:08:32', '2025-05-25 08:12:26'),
(97, 'com_maintenance_start_date', '2025-04-19T18:00:00.000Z', '1', '2025-04-30 09:08:32', '2025-06-18 03:12:41');


(98, 'com_maintenance_end_date', '2025-04-19T18:00:00.000Z', '1', '2025-04-30 09:08:32', '2025-06-18 03:12:41'),
(99, 'com_maintenance_image', '832', '1', '2025-04-30 09:08:32', '2025-05-25 07:15:34'),

-- SEO (Sportoonline'a uygun TR)
(100, 'com_meta_title', 'Sportoonline | Güvenli Alışveriş ve Çok Satıcılı Pazaryeri', '1', '2025-04-30 09:44:21', '2025-09-23 00:40:59'),
(101, 'com_meta_description', 'Sportoonline’da mağazaları keşfedin, binlerce ürünü güvenle karşılaştırın ve kolayca satın alın. Hızlı teslimat, güvenli ödeme ve destek.', '1', '2025-04-30 09:44:21', '2025-09-23 00:40:59'),
(102, 'com_meta_tags', 'sportoonline,pazaryeri,çok satıcılı,e-ticaret,online alışveriş,mağazalar,kategoriler,indirim,kupon,güvenli ödeme', '1', '2025-04-30 09:44:21', '2025-09-23 00:40:59'),
(103, 'com_canonical_url', 'https://sportoonline.com', '1', '2025-04-30 09:44:21', '2025-05-22 09:49:27'),

-- OpenGraph (TR)
(104, 'com_og_title', 'Sportoonline | Çok Satıcılı Pazaryeri', '1', '2025-04-30 09:44:21', '2025-09-23 00:40:59'),
(105, 'com_og_description', 'Sportoonline’da kategorilere göre alışveriş yapın, mağazaları keşfedin ve güvenli ödeme ile siparişinizi tamamlayın.', '1', '2025-04-30 09:44:21', '2025-09-23 00:41:00'),
(106, 'com_og_image', NULL, '1', '2025-04-30 09:44:21', '2025-09-23 00:41:00'),

-- Recaptcha (dokunma)
(107, 'com_google_recaptcha_v3_site_key', '1x00000000000000000000AA', '1', '2025-05-12 06:06:26', '2025-05-29 03:40:55'),
(108, 'com_google_recaptcha_v3_secret_key', '6LceTzYrAAAAACtNGBaKKcgEloInr_CDci7jwzm6', '1', '2025-05-12 06:06:26', '2025-05-12 06:06:26'),
(109, 'com_google_recaptcha_enable_disable', NULL, '1', '2025-05-12 06:06:26', '2025-09-23 05:20:09'),

-- Help center (başlıklar TR + JSON düzenli)
(110, 'com_help_center_enable_disable', NULL, '1', '2025-05-15 10:35:15', '2025-05-19 04:08:25'),
(111, 'com_help_center_title', 'Yardım Merkezi', '1', '2025-05-19 06:20:41', '2025-05-19 06:20:41'),
(112, 'com_help_center', '[{"title":"Ödemeler","url":"fdsf"},{"title":"Kargo & Teslimat","url":"ddsf"},{"title":"İade Politikası","url":null}]', '1', '2025-05-19 06:20:41', '2025-05-19 07:01:42'),

-- Google map (dokunma)
(113, 'com_google_map_enable_disable', 'on', '1', '2025-05-22 09:52:16', '2025-05-25 06:05:08'),
(114, 'com_google_map_api_key', 'AIzaSyAk2gEiUh9upTE5apNlom_PzI75Ixl-nrs', '1', '2025-05-22 09:52:16', '2025-07-26 21:30:19'),

-- Ana sayfa buton/section başlıkları (TR)
(115, 'com_home_one_category_button_title', 'Tüm Kategoriler', '1', '2025-06-15 06:30:05', '2025-09-22 22:27:01'),
(116, 'com_home_one_store_button_title', 'Mağaza Türlerini Keşfet', '1', '2025-06-15 06:30:05', '2025-06-15 11:06:58'),
(117, 'com_home_one_category_section_title', 'Kategorilere Göre Alışveriş', '1', '2025-06-15 06:30:05', '2025-06-15 07:00:04'),
(118, 'com_home_one_flash_sale_section_title', 'Flaş İndirim', '1', '2025-06-15 06:30:05', '2025-06-15 07:00:04'),
(119, 'com_home_one_featured_section_title', 'Öne Çıkanlar', '1', '2025-06-15 06:30:05', '2025-06-15 07:01:58'),
(120, 'com_home_one_top_selling_section_title', 'Çok Satanlar', '1', '2025-06-15 06:30:05', '2025-06-15 07:00:04'),
(121, 'com_home_one_latest_product_section_title', 'Yeni Gelenler', '1', '2025-06-15 06:30:05', '2025-06-15 07:00:04'),
(122, 'com_home_one_popular_product_section_title', 'Popüler Ürünler', '1', '2025-06-15 06:30:05', '2025-06-15 07:00:04'),
(123, 'com_home_one_top_store_section_title', 'Öne Çıkan Mağazalar', '1', '2025-06-15 06:30:05', '2025-07-29 04:50:57'),

-- OTP (dokunma)
(124, 'otp_login_enabled_disable', 'on', '1', '2025-06-23 04:47:50', '2025-06-24 09:21:54'),

-- Saat dilimi (Türkiye için uygun)
(125, 'com_site_time_zone', 'Europe/Istanbul', '1', '2025-07-07 10:31:10', '2025-07-23 11:00:50'),

-- GDPR/Cookie (TR + içerik temiz)
(126, 'gdpr_data', '{"gdpr_basic_section":{"com_gdpr_title":"Çerez ve Gizlilik Ayarları","com_gdpr_message":"Deneyiminizi kişiselleştirmek ve trafiğimizi analiz etmek için çerezler kullanıyoruz. Kabul edebilir veya reddedebilirsiniz.","com_gdpr_more_info_label":"Daha Fazla Bilgi","com_gdpr_more_info_link":null,"com_gdpr_accept_label":"Kabul Et","com_gdpr_decline_label":"Reddet","com_gdpr_manage_label":"Yönet","com_gdpr_manage_title":"Çerez Tercihlerini Yönet","com_gdpr_expire_date":"2025-05-28","com_gdpr_show_delay":"500","com_gdpr_enable_disable":"on","com_gdpr_can_reject_all":"on"},"gdpr_more_info_section":{"section_title":"Çerezler Hakkında","section_details":"Sportoonline, hizmet kalitesini artırmak ve site performansını ölçmek için çerezler kullanır. İsterseniz tercihlerinizi dilediğiniz zaman yönetebilirsiniz.","steps":[{"title":null,"descriptions":null,"req_status":null},{"title":null,"descriptions":null,"req_status":null},{"title":null,"descriptions":null,"req_status":null}]}}', 'json', '2025-07-17 03:55:43', '2025-09-23 00:42:40'),

-- Footer settings (TR + domain uyumlu)
(127, 'footer_settings', '{"com_social_links_facebook_url":"https://facebook.com","com_social_links_twitter_url":"https://twitter.com","com_social_links_instagram_url":"https://instagram.com","com_social_links_linkedin_url":"https://linkedin.com","com_download_app_link_one":"#","com_download_app_link_two":"#","com_payment_methods_enable_disable":"on","com_quick_access_enable_disable":"on","com_our_info_enable_disable":"on","com_social_links_enable_disable":"on","com_social_links_title":"on","com_payment_methods_image":"737,734,733,732","com_quick_access":[{"com_quick_access_title":"Ana Sayfa","com_quick_access_url":"https://sportoonline.com"},{"com_quick_access_title":"Tüm Ürünler","com_quick_access_url":"https://sportoonline.com/products"},{"com_quick_access_title":"Kategoriler","com_quick_access_url":"https://sportoonline.com/product-categories"},{"com_quick_access_title":"Mağazalar","com_quick_access_url":"https://sportoonline.com/stores"},{"com_quick_access_title":"Satıcı Ol","com_quick_access_url":"https://sportoonline.com/become-a-seller"}],"com_our_info":[{"title":"Hakkımızda","url":"https://sportoonline.com/pages/about"},{"title":"Kullanım Şartları","url":"https://sportoonline.com/pages/terms-conditions"},{"title":"Gizlilik Politikası","url":"https://sportoonline.com/pages/privacy-policy"},{"title":"İade ve Geri Ödeme Politikası","url":"https://sportoonline.com/pages/refund-policies"},{"title":"Kargo Politikası","url":"https://sportoonline.com/pages/shipping-policy"}]}', NULL, '2025-07-23 02:21:30', '2025-09-23 03:47:24'),

-- POS (dokunma)
(128, 'com_pos_settings_print_invoice', 'thermal', NULL, '2025-08-23 22:57:52', '2025-08-24 00:16:46'),

-- Theme One (TR çeviri)
(139, 'theme_one', '{"name":"Premium Tema","slug":"theme_one","description":"Tam kapsamlı premium e-ticaret teması","version":"2.0","theme_style":[{"colors":[{"primary":"#1A73E8","secondary":"#0e5abc"}]}],"theme_header":[{"header_number":"01"}],"theme_footer":[{"background_color":"#0d166d","text_color":"#ffffff","layout_columns":3}],"theme_pages":[{"theme_home_page":[{"slider":[{"enabled_disabled":"on"}],"category":[{"title":"Kategoriler","enabled_disabled":"on"}],"flash_sale":[{"title":"Flaş İndirim","enabled_disabled":"on"}],"product_featured":[{"title":"Öne Çıkan Ürünler","enabled_disabled":"on"}],"banner_section":[{"enabled_disabled":"on"}],"product_top_selling":[{"title":"Çok Satanlar","enabled_disabled":"on"}],"product_latest":[{"title":"Yeni Gelenler","enabled_disabled":"on"}],"popular_product_section":[{"title":"Popüler Ürünler","enabled_disabled":"on"}],"top_stores_section":[{"title":"Öne Çıkan Mağazalar","enabled_disabled":"on"}],"newsletters_section":[{"title":"Bültene Abone Ol","subtitle":"Sportoonline’da güvenilir satıcılardan kaliteli ürünleri keşfedin. Fırsatlar ve duyurular için bültene abone olun.","enabled_disabled":"on"}]}],"theme_login_page":[{"customer":[{"title":"Giriş Yap","subtitle":"Alışverişe Devam Et","enabled_disabled":"on","image_id":1303,"img_url":"http://192.168.88.225:8000/storage/uploads/media-uploader/default/login-register-page1759042140.png","image_id_url":"http://192.168.88.225:8000/storage/uploads/media-uploader/default/login-register-page1759042140.png"}],"admin":[{"title":"Giriş Yap","subtitle":"Çok Satıcılı Ekosistem","image_id":570,"img_url":"http://192.168.88.225:8000/storage/uploads/media-uploader/default/login-admin-img1743928028.png","image_id_url":"http://192.168.88.225:8000/storage/uploads/media-uploader/default/login-admin-img1743928028.png"}]}],"theme_register_page":[{"title":"Hemen Üye Ol!","subtitle":"Sportoonline ile Güvenli Alışveriş Deneyimi","description":"Hemen üye olun; mağazaları keşfedin, ürünleri karşılaştırın, güvenli ödeme ile siparişinizi tamamlayın ve kampanyalardan yararlanın.","terms_page_title":"Kullanım Şartları","terms_page_url":null,"social_login_enable_disable":"on","image_id":1303,"img_url":"http://192.168.88.225:8000/storage/uploads/media-uploader/default/login-register-page1759042140.png","image_id_url":"http://192.168.88.225:8000/storage/uploads/media-uploader/default/login-register-page1759042140.png"}],"theme_blog_page":[{"popular_title":"Popüler Yazılar","related_title":"İlgili Yazılar"}],"theme_product_details_page":[{"delivery_title":"Ücretsiz Teslimat","delivery_subtitle":"Teslimat detayları için ürün açıklamasını inceleyin.","delivery_url":null,"refund_title":"Kolay İade ve Geri Ödeme","refund_subtitle":"30 gün içinde iade. İade kargo ücreti alıcıya ait olabilir.","refund_url":null,"related_title":"İlgili Ürünler","delivery_enabled_disabled":"on","refund_enabled_disabled":"on"}]}]}', NULL, '2025-08-31 03:59:50', '2025-10-05 05:40:42'),

-- Theme Two (TR çeviri)
(140, 'theme_two', '{"name":"Moda Tema","slug":"theme_two","description":"Tam kapsamlı moda e-ticaret teması","version":"2.0","theme_style":[{"colors":[{"primary":"#000000","secondary":"#FF6631"}]}],"theme_header":[{"header_number":"02"}],"theme_footer":[{"background_color":"#242825","text_color":"#ffffff","layout_columns":4}],"theme_pages":[{"theme_home_page":[{"slider":[{"enabled_disabled":"on"}],"category":[{"title":"Kategoriler","enabled_disabled":"on"}],"flash_sale":[{"title":"Flaş İndirim","enabled_disabled":"on"}],"product_featured":[{"title":"Öne Çıkan Ürünler","enabled_disabled":"on"}],"banner_section":[{"enabled_disabled":"on"}],"product_top_selling":[{"title":"Çok Satanlar","enabled_disabled":"on"}],"product_latest":[{"title":"Yeni Gelenler","enabled_disabled":"on"}],"popular_product_section":[{"title":"Popüler Ürünler","enabled_disabled":"on"}],"top_stores_section":[{"title":"Öne Çıkan Mağazalar","enabled_disabled":"on"}],"newsletters_section":[{"title":"Bültene Abone Ol","subtitle":"Sportoonline’da güvenilir satıcılardan kaliteli ürünleri keşfedin. Fırsatlar ve duyurular için bültene abone olun.","enabled_disabled":"on"}]}],"theme_login_page":[{"customer":[{"title":"Giriş Yap","subtitle":null,"enabled_disabled":"on","image_id":1303,"img_url":"http://192.168.88.225:8000/storage/uploads/media-uploader/default/login-register-page1759042140.png","image_id_url":"http://192.168.88.225:8000/storage/uploads/media-uploader/default/login-register-page1759042140.png"}],"admin":[{"title":"Giriş","subtitle":null,"image_id":"1177","img_url":"http://192.168.88.225:8000/storage/uploads/media-uploader/default/login-admin-img1743928028.png","image_id_url":"http://192.168.88.225:8000/storage/uploads/media-uploader/default/stripe1754548961.png"}]}],"theme_register_page":[{"title":"Hemen Üye Ol!","subtitle":"Sportoonline ile Güvenli Alışveriş Deneyimi","description":"Hemen üye olun; mağazaları keşfedin, ürünleri karşılaştırın, güvenli ödeme ile siparişinizi tamamlayın ve kampanyalardan yararlanın.","terms_page_title":"Kullanım Şartları","terms_page_url":null,"social_login_enable_disable":"on","image_id":1290,"img_url":"http://192.168.88.225:8000/storage/uploads/media-uploader/default/login-register-page1759042140.png","image_id_url":null}],"theme_blog_page":[{"popular_title":"Popüler Yazılar","related_title":"İlgili Yazılar"}],"theme_product_details_page":[{"delivery_title":"Teslimat Bilgisi","delivery_subtitle":null,"delivery_url":null,"refund_title":"İade Bilgisi","refund_subtitle":null,"refund_url":null,"related_title":null,"delivery_enabled_disabled":"on","refund_enabled_disabled":"on"}]}]}', NULL, '2025-08-31 05:56:17', '2025-10-05 05:40:47'),

-- OpenAI (dokunma; model adı opsiyonel ama güvenli bırakıyorum)
(141, 'com_openai_api_key', NULL, NULL, '2025-09-18 02:33:36', '2025-09-22 03:20:32'),
(142, 'com_openai_model', 'gpt-4-32k', NULL, '2025-09-18 02:33:37', '2025-09-29 03:55:38'),
(143, 'com_openai_timeout', '500', NULL, '2025-09-18 02:33:37', '2025-09-22 03:20:32'),
(144, 'com_openai_enable_disable', 'on', NULL, '2025-09-18 02:33:37', '2025-09-18 02:53:41');

-- --------------------------------------------------------

--
