

INSERT INTO `customer_addresses`
(`id`, `customer_id`, `title`, `type`, `email`, `contact_number`, `address`, `latitude`, `longitude`, `area_id`, `road`, `house`, `floor`, `postal_code`, `is_default`, `status`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'Ev', 'home', 'customer@gmail.com', '8801702111111', 'Gülşan 1, Dakka 1212, Bangladeş', '23.7820624', '90.4160527', NULL, '120', NULL, '5', '1200', 0, 1, NULL, '2025-08-07 01:04:06', '2025-09-23 05:32:45'),
(20, 1, 'Adres', 'home', 'customer@gmail.com', '+8801555555655', 'Dinajpur, Bangladeş', '25.61750487588113', '88.64475921303635', NULL, '23', '23', '33', '5240', 0, 1, NULL, '2025-09-29 02:42:24', '2025-10-04 09:04:24'),

(21, 2, 'Ev', 'home', 'ahmet.yilmaz@example.com', '+905301111111', 'Barbaros Mah., Beşiktaş, İstanbul, Türkiye', '41.0439', '29.0094', NULL, 'Barbaros', '12', '3', '34353', 1, 1, NULL, '2025-04-01 12:10:00', '2025-10-10 09:12:03'),
(22, 3, 'Ev', 'home', 'ayse.kaya@example.com', '+905302222222', 'Konak Mah., Konak, İzmir, Türkiye', '38.4192', '27.1287', NULL, 'Atatürk', '8', '2', '35250', 1, 1, NULL, '2025-04-02 12:10:00', '2025-10-11 18:22:10'),
(23, 4, 'İş', 'office', 'mehmet.demir@example.com', '+905303333333', 'Çankaya Mah., Çankaya, Ankara, Türkiye', '39.9208', '32.8541', NULL, 'Kızılay', '15', '7', '06420', 1, 1, NULL, '2025-04-03 12:10:00', '2025-09-22 08:45:00'),
(24, 5, 'Ev', 'home', 'elif.sahin@example.com', '+905304444444', 'Nilüfer Mah., Nilüfer, Bursa, Türkiye', '40.2073', '28.9986', NULL, 'FSM', '22', '5', '16120', 1, 1, NULL, '2025-04-04 12:10:00', '2025-10-09 13:05:55'),
(25, 6, 'Ev', 'home', 'can.arslan@example.com', '+905305555555', 'Muratpaşa Mah., Muratpaşa, Antalya, Türkiye', '36.8841', '30.7056', NULL, 'Atatürk', '5', '1', '07010', 1, 1, NULL, '2025-04-05 12:10:00', '2025-10-12 21:44:01'),
(26, 7, 'Ev', 'home', 'zeynep.aydin@example.com', '+905306666666', 'Tepebaşı Mah., Tepebaşı, Eskişehir, Türkiye', '39.7767', '30.5206', NULL, 'İsmet İnönü', '19', '4', '26130', 1, 1, NULL, '2025-04-06 12:10:00', '2025-09-25 11:55:00'),
(27, 8, 'Ev', 'home', 'murat.koc@example.com', '+905307777777', 'Atakum Mah., Atakum, Samsun, Türkiye', '41.3349', '36.2810', NULL, 'Sahil', '10', '6', '55200', 1, 1, NULL, '2025-04-07 12:10:00', '2025-10-08 07:31:19'),
(28, 9, 'Ev', 'home', 'selin.celik@example.com', '+905308888888', 'Şahinbey Mah., Şahinbey, Gaziantep, Türkiye', '37.0662', '37.3833', NULL, 'İstasyon', '3', '2', '27010', 1, 1, NULL, '2025-04-08 12:10:00', '2025-10-13 10:02:44'),
(29, 10, 'İş', 'office', 'hakan.yildiz@example.com', '+905309999999', 'Selçuklu Mah., Selçuklu, Konya, Türkiye', '37.8746', '32.4932', NULL, 'Yeni İstanbul', '7', '9', '42060', 1, 1, NULL, '2025-04-09 12:10:00', '2025-09-28 07:25:00'),
(30, 11, 'Ev', 'home', 'derya.ozdemir@example.com', '+905300000001', 'Ortahisar Mah., Ortahisar, Trabzon, Türkiye', '41.0015', '39.7178', NULL, 'Maraş', '11', '3', '61030', 1, 1, NULL, '2025-04-10 12:10:00', '2025-10-14 16:19:33')
ON DUPLICATE KEY UPDATE
  `customer_id`    = VALUES(`customer_id`),
  `title`          = VALUES(`title`),
  `type`           = VALUES(`type`),
  `email`          = VALUES(`email`),
  `contact_number` = VALUES(`contact_number`),
  `address`        = VALUES(`address`),
  `latitude`       = VALUES(`latitude`),
  `longitude`      = VALUES(`longitude`),
  `area_id`        = VALUES(`area_id`),
  `road`           = VALUES(`road`),
  `house`          = VALUES(`house`),
  `floor`          = VALUES(`floor`),
  `postal_code`    = VALUES(`postal_code`),
  `is_default`     = VALUES(`is_default`),
  `status`         = VALUES(`status`),
  `deleted_at`     = VALUES(`deleted_at`),
  `created_at`     = VALUES(`created_at`),
  `updated_at`     = VALUES(`updated_at`);

-- --------------------------------------------------------
