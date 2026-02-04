INSERT INTO `permissions`
(`id`, `available_for`, `name`, `guard_name`, `module_title`, `perm_title`, `icon`, `parent_id`, `options`, `created_at`, `updated_at`, `module`) VALUES
(163, 'delivery_level', '/deliveryman/withdraw-manage', 'api', NULL, 'Para Çekme İşlemleri', '', NULL, '[\"view\",\"insert\",\"others\"]', '2025-03-10 01:42:59', '2025-03-10 01:42:59', NULL),

(8695, 'store_level', 'dashboard', 'api', NULL, 'Gösterge Paneli', 'LayoutDashboard', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),

(8696, 'store_level', 'POS Management', 'api', NULL, 'POS Yönetimi', 'CircleDollarSign', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8697, 'store_level', 'POS', 'api', NULL, 'POS', 'ListOrdered', '8696', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8698, 'store_level', '/seller/store/pos', 'api', NULL, 'POS', 'ListOrdered', '8697', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8699, 'store_level', '/seller/store/pos/orders', 'api', NULL, 'Siparişler', 'ListOrdered', '8697', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),

(8700, 'store_level', 'Order Management', 'api', NULL, 'Sipariş Yönetimi', '', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8701, 'store_level', 'Orders', 'api', NULL, 'Siparişler', 'Boxes', '8700', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8702, 'store_level', '/seller/store/orders', 'api', NULL, 'Tüm Siparişler', '', '8701', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8703, 'store_level', '/seller/store/orders/refund-request', 'api', NULL, 'İade / Geri Ödeme Talepleri', '', '8701', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),

(8704, 'store_level', 'Product management', 'api', NULL, 'Ürün Yönetimi', '', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8705, 'store_level', 'Products', 'api', NULL, 'Ürünler', 'Codesandbox', '8704', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8706, 'store_level', '/seller/store/product/list', 'api', NULL, 'Ürünleri Yönet', '', '8705', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8707, 'store_level', '/seller/store/product/add', 'api', NULL, 'Yeni Ürün Ekle', '', '8705', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8708, 'store_level', '/seller/store/product/stock-report', 'api', NULL, 'Azalan / Tükenen Stok', '', '8705', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8709, 'store_level', '/seller/store/product/inventory', 'api', NULL, 'Envanter', 'PackageOpen', '8705', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8710, 'store_level', '/seller/store/product/import', 'api', NULL, 'Toplu İçe Aktarma', '', '8705', '[\"view\",\"insert\",\"update\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8711, 'store_level', '/seller/store/product/export', 'api', NULL, 'Toplu Dışa Aktarma', '', '8705', '[\"view\",\"insert\",\"update\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8712, 'store_level', '/seller/store/attribute/list', 'api', NULL, 'Öznitelikler', 'Layers2', '8704', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8713, 'store_level', '/seller/store/product/author/list', 'api', NULL, 'Yazarlar', 'BookOpenCheck', '8704', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),

(8714, 'store_level', 'Promotional control', 'api', NULL, 'Kampanya Yönetimi', 'Proportions', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8715, 'store_level', 'Flash Sale', 'api', NULL, 'Flash Kampanya', 'Zap', '8714', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8716, 'store_level', '/seller/store/promotional/flash-deals/active-deals', 'api', NULL, 'Aktif Kampanyalar', '', '8715', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8717, 'store_level', '/seller/store/promotional/flash-deals/my-deals', 'api', NULL, 'Kampanyalarım', '', '8715', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),

(8718, 'store_level', 'Communication Center', 'api', NULL, 'İletişim Merkezi', 'Headphones', NULL, '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8719, 'store_level', '/seller/store/chat/list', 'api', NULL, 'Sohbet Listesi', 'MessageSquareMore', '8718', '[\"view\",\"insert\",\"update\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8720, 'store_level', '/seller/store/support-ticket/list', 'api', NULL, 'Destek Talepleri', 'Headset', '8718', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8721, 'store_level', '/seller/store/notifications', 'api', NULL, 'Tüm Bildirimler', 'Bell', '8718', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),

(8722, 'store_level', 'Feedback control', 'api', NULL, 'Geri Bildirim Yönetimi', 'MessageSquareReply', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8723, 'store_level', '/seller/store/feedback-control/review', 'api', NULL, 'Yorumlar', 'Star', '8722', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8724, 'store_level', '/seller/store/feedback-control/questions', 'api', NULL, 'Sorular', 'CircleHelp', '8722', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),

(8725, 'store_level', 'Financial Management', 'api', NULL, 'Finans Yönetimi', '', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),

(8726, 'store_level', '/seller/store/financial/withdraw', 'api', NULL, 'Para Çekme İşlemleri', 'BadgeDollarSign', '8725', '[\"view\",\"insert\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8727, 'store_level', '/seller/store/financial/wallet', 'api', NULL, 'Mağaza Cüzdanı', 'Wallet', '8725', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),

(8728, 'store_level', 'Staff control', 'api', NULL, 'Personel Yönetimi', 'UserRoundPen', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8729, 'store_level', '/seller/store/staff/list', 'api', NULL, 'Personel Listesi', 'Users', '8728', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),

(8730, 'store_level', 'Store Settings', 'api', NULL, 'Mağaza Ayarları', 'Store', NULL, '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8731, 'store_level', '/seller/store/settings/business-plan', 'api', NULL, 'İş Planı', 'BriefcaseBusiness', '8730', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8732, 'store_level', '/seller/store/settings/notices', 'api', NULL, 'Duyurular', 'BadgeAlert', '8730', '[\"view\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),
(8733, 'store_level', '/seller/store/list', 'api', NULL, 'Mağazalarım', 'Store', '8730', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-08-18 23:01:48', '2025-08-18 23:01:48', NULL),

(9775, 'system_level', '/admin/dashboard', 'api', NULL, 'Gösterge Paneli', 'LayoutDashboard', NULL, '[\"view\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),

(9776, 'system_level', 'POS Management', 'api', NULL, 'POS Yönetimi', 'CircleDollarSign', NULL, '[\"view\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9777, 'system_level', 'POS', 'api', NULL, 'POS', 'ListOrdered', '9776', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9778, 'system_level', '/admin/pos', 'api', NULL, 'POS', 'ListOrdered', '9777', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9779, 'system_level', '/admin/pos/orders', 'api', NULL, 'Siparişler', 'ListOrdered', '9777', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9780, 'system_level', '/admin/pos/settings', 'api', NULL, 'Ayarlar', 'ListOrdered', '9777', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),

(9781, 'system_level', 'Order Management', 'api', NULL, 'Sipariş Yönetimi', '', NULL, '[\"view\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9782, 'system_level', 'Orders', 'api', NULL, 'Siparişler', 'ListOrdered', '9781', '[\"view\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9783, 'system_level', '/admin/orders', 'api', NULL, 'Tüm Siparişler', 'ListOrdered', '9782', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9784, 'system_level', '/admin/orders/refund-request', 'api', NULL, 'İade / Geri Ödeme Talepleri', 'RotateCcw', '9782', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),
(9785, 'system_level', '/admin/orders/refund-reason/list', 'api', NULL, 'İade Nedeni', '', '9782', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:45', '2025-09-23 00:46:45', NULL),

(9786, 'system_level', 'Product management', 'api', NULL, 'Ürün Yönetimi', '', NULL, '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9787, 'system_level', 'Products', 'api', NULL, 'Ürünler', 'Codesandbox', '9786', '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9788, 'system_level', '/admin/product/list', 'api', NULL, 'Tüm Ürünler', 'PackageSearch', '9787', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9789, 'system_level', '/admin/product/trash-list', 'api', NULL, 'Çöp Kutusu', 'Trash', '9787', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9790, 'system_level', '/admin/product/request', 'api', NULL, 'Ürün Onay Talepleri', 'Signature', '9787', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9791, 'system_level', '/admin/product/stock-report', 'api', NULL, 'Azalan / Tükenen Stok', 'Layers', '9787', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9792, 'system_level', '/admin/product/import', 'api', NULL, 'Toplu İçe Aktarma', 'FileUp', '9787', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9793, 'system_level', '/admin/product/export', 'api', NULL, 'Toplu Dışa Aktarma', 'Download', '9787', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9794, 'system_level', '/admin/product/inventory', 'api', NULL, 'Ürün Envanteri', 'SquareChartGantt', '9787', '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),

(9795, 'system_level', '/admin/categories', 'api', NULL, 'Kategoriler', 'List', '9786', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9796, 'system_level', '/admin/attribute/list', 'api', NULL, 'Öznitelikler', 'AttributeIcon', '9786', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9797, 'system_level', '/admin/unit/list', 'api', NULL, 'Birimler', 'Boxes', '9786', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9798, 'system_level', '/admin/dynamic-fields', 'api', NULL, 'Dinamik Alanlar', 'Boxes', '9786', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9799, 'system_level', '/admin/brand/list', 'api', NULL, 'Markalar', 'LayoutList', '9786', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9800, 'system_level', '/admin/tag/list', 'api', NULL, 'Etiketler', 'Tags', '9786', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9801, 'system_level', '/admin/product/author/list', 'api', NULL, 'Yazarlar', '', '9786', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),

(9802, 'system_level', 'Coupon Management', 'api', NULL, 'Kupon Yönetimi', 'SquarePercent', '9786', '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9803, 'system_level', '/admin/coupon/list', 'api', NULL, 'Kuponlar', '', '9802', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),




(9804, 'system_level', '/admin/coupon-line/list', 'api', NULL, 'Kupon Satırları', '', '9802', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),

(9805, 'system_level', 'Sellers & Stores', 'api', NULL, 'Satıcılar ve Mağazalar', '', NULL, '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9806, 'system_level', 'All Sellers', 'api', NULL, 'Tüm Satıcılar', 'UsersRound', '9805', '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9807, 'system_level', '/admin/seller/list', 'api', NULL, 'Satıcılar', '', '9806', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9808, 'system_level', '/admin/seller/trash-list', 'api', NULL, 'Çöp Kutusu', 'Trash', '9806', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9809, 'system_level', '/admin/seller/registration', 'api', NULL, 'Satıcı Kaydı Oluştur', '', '9806', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),

(9810, 'system_level', 'All Stores', 'api', NULL, 'Tüm Mağazalar', 'Store', '9805', '[\"view\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9811, 'system_level', '/admin/store/list', 'api', NULL, 'Mağaza Listesi', 'Store', '9810', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:46', '2025-09-23 00:46:46', NULL),
(9812, 'system_level', '/admin/store/trash-list', 'api', NULL, 'Çöp Kutusu', 'Trash', '9810', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9813, 'system_level', '/admin/store/add', 'api', NULL, 'Mağaza Ekle', '', '9810', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9814, 'system_level', '/admin/store/approval', 'api', NULL, 'Mağaza Onay Talepleri', '', '9810', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),

(9815, 'system_level', 'Promotional control', 'api', NULL, 'Promosyon Yönetimi', 'Proportions', NULL, '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9816, 'system_level', 'Flash Sale', 'api', NULL, 'Flash Satış', 'Zap', '9815', '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9817, 'system_level', '/admin/promotional/flash-deals/list', 'api', NULL, 'Tüm Kampanyalar', '', '9816', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9818, 'system_level', '/admin/promotional/flash-deals/join-request', 'api', NULL, 'Kampanyaya Katılım Talepleri', '', '9816', '[\"view\",\"insert\",\"delete\",\"update\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9819, 'system_level', '/admin/promotional/banner/list', 'api', NULL, 'Bannerlar', 'AlignJustify', '9815', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9820, 'system_level', '/admin/slider/list', 'api', NULL, 'Slider', 'SlidersHorizontal', '9815', '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),

(9821, 'system_level', 'Feedback Management', 'api', NULL, 'Geri Bildirim Yönetimi', 'MessageSquareReply', NULL, '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9822, 'system_level', '/admin/feedback-control/review', 'api', NULL, 'Yorumlar', 'Star', '9821', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9823, 'system_level', '/admin/feedback-control/questions', 'api', NULL, 'Sorular', 'CircleHelp', '9821', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),

(9824, 'system_level', 'Blog Management', 'api', NULL, 'Blog Yönetimi', '', NULL, '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9825, 'system_level', 'Blogs', 'api', NULL, 'Bloglar', 'Rss', '9824', '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9826, 'system_level', '/admin/blog/category', 'api', NULL, 'Kategori', '', '9825', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9827, 'system_level', '/admin/blog/posts', 'api', NULL, 'Yazılar', '', '9825', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),

(9828, 'system_level', 'Wallet Management', 'api', NULL, 'Cüzdan Yönetimi', '', NULL, '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9829, 'system_level', '/admin/wallet/list', 'api', NULL, 'Cüzdan Listesi', 'Wallet', '9828', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9830, 'system_level', '/admin/wallet/transactions', 'api', NULL, 'İşlem Geçmişi', 'History', '9828', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9831, 'system_level', '/admin/wallet/settings', 'api', NULL, 'Cüzdan Ayarları', 'Settings', '9828', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),

(9832, 'system_level', 'Deliveryman', 'api', NULL, 'Kurye', 'UserRoundPen', NULL, '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9833, 'system_level', '/admin/deliveryman/vehicle-types/list', 'api', NULL, 'Araç Tipleri', 'Car', '9832', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9834, 'system_level', '/admin/deliveryman/list', 'api', NULL, 'Kurye Listesi', 'UserRoundPen', '9832', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9835, 'system_level', '/admin/deliveryman/trash-list', 'api', NULL, 'Çöp Kutusu', 'Trash', '9832', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9836, 'system_level', '/admin/deliveryman/request', 'api', NULL, 'Kurye Başvuruları', 'ListPlus', '9832', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),

(9837, 'system_level', 'Customer management', 'api', NULL, 'Müşteri Yönetimi', '', NULL, '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9838, 'system_level', 'All Customers', 'api', NULL, 'Tüm Müşteriler', 'UsersRound', '9837', '[\"view\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),




(9839, 'system_level', '/admin/customer/list', 'api', NULL, 'Müşteriler', '', '9838', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9840, 'system_level', '/admin/customer/trash-list', 'api', NULL, 'Çöp Kutusu', 'Trash', '9838', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9841, 'system_level', '/admin/customer/subscriber-list', 'api', NULL, 'Abone Listesi', '', '9838', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:47', '2025-09-23 00:46:47', NULL),
(9842, 'system_level', '/admin/customer/contact-messages', 'api', NULL, 'İletişim Mesajları', '', '9838', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),

(9843, 'system_level', 'Staff & Permissions', 'api', NULL, 'Personel ve Yetkiler', '', NULL, '[\"view\",\"insert\",\"update\",\"delete\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9844, 'system_level', 'Staff Roles', 'api', NULL, 'Personel Rolleri', 'LockKeyholeOpen', '9843', '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9845, 'system_level', '/admin/roles/list', 'api', NULL, 'Liste', '', '9844', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9846, 'system_level', '/admin/roles/add', 'api', NULL, 'Rol Ekle', '', '9844', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),

(9847, 'system_level', 'My Staff', 'api', NULL, 'Personelim', 'Users', '9843', '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9848, 'system_level', '/admin/staff/list', 'api', NULL, 'Liste', '', '9847', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9849, 'system_level', '/admin/staff/add', 'api', NULL, 'Personel Ekle', '', '9847', '[\"view\",\"insert\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),

(9850, 'system_level', 'Financial Management', 'api', NULL, 'Finans Yönetimi', '', NULL, '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9851, 'system_level', 'Financial', 'api', NULL, 'Finans', 'BadgeDollarSign', '9850', '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9852, 'system_level', '/admin/financial/withdraw/settings', 'api', NULL, 'Çekim Ayarları', '', '9851', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9853, 'system_level', '/admin/financial/withdraw/method/list', 'api', NULL, 'Çekim Yöntemi', '', '9851', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9854, 'system_level', '/admin/financial/withdraw/history', 'api', NULL, 'Çekim Geçmişi', '', '9851', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9855, 'system_level', '/admin/financial/withdraw/request', 'api', NULL, 'Çekim Talepleri', '', '9851', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9856, 'system_level', '/admin/financial/cash-collect', 'api', NULL, 'Nakit Tahsilat', '', '9851', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),

(9857, 'system_level', 'Report and analytics', 'api', NULL, 'Raporlar ve Analitik', 'Logs', NULL, '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9858, 'system_level', '/admin/report-analytics/order', 'api', NULL, 'Sipariş Raporu', 'FileChartColumnIncreasing', '9857', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9859, 'system_level', '/admin/report-analytics/transaction', 'api', NULL, 'İşlem Raporu', 'ChartNoAxesCombined', '9857', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),

(9860, 'system_level', 'Communication Center', 'api', NULL, 'İletişim Merkezi', '', NULL, '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9861, 'system_level', 'Chat', 'api', NULL, 'Sohbet', 'MessageSquareMore', '9860', '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9862, 'system_level', '/admin/chat/settings', 'api', NULL, 'Sohbet Ayarları', '', '9861', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9863, 'system_level', '/admin/chat/manage', 'api', NULL, 'Sohbet Listesi', '', '9861', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),

(9864, 'system_level', 'Tickets', 'api', NULL, 'Destek Talepleri', 'Headphones', '9860', '[\"view\"]', '2025-09-23 00:46:48', '2025-09-23 00:46:48', NULL),
(9865, 'system_level', '/admin/ticket/department', 'api', NULL, 'Departman', '', '9864', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9866, 'system_level', '/admin/support-ticket/list', 'api', NULL, 'Tüm Talepler', '', '9864', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9867, 'system_level', '/admin/notifications', 'api', NULL, 'Bildirimler', 'Bell', '9860', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9868, 'system_level', '/admin/store-notices', 'api', NULL, 'Duyurular', 'MessageSquareWarning', '9860', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),

(9869, 'system_level', 'Business Operations', 'api', NULL, 'İş Operasyonları', '', NULL, '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9870, 'system_level', '/admin/business-operations/store-type', 'api', NULL, 'Mağaza Tipi', 'Store', '9869', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9871, 'system_level', '/admin/business-operations/area/list', 'api', NULL, 'Bölge Tanımlama', 'Locate', '9869', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),

(9872, 'system_level', 'Subscription', 'api', NULL, 'Abonelik', 'PackageCheck', '9869', '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9873, 'system_level', '/admin/business-operations/subscription/package/list', 'api', NULL, 'Abonelik Paketi', '', '9872', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9874, 'system_level', '/admin/business-operations/subscription/store/list', 'api', NULL, 'Mağaza Aboneliği', '', '9872', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9875, 'system_level', '/admin/business-operations/commission/settings', 'api', NULL, 'Komisyon Ayarları', 'BadgePercent', '9869', '[\"view\",\"update\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),

(9876, 'system_level', 'Gateway Management', 'api', NULL, 'Ödeme Altyapısı Yönetimi', '', NULL, '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9877, 'system_level', '/admin/payment-gateways/settings', 'api', NULL, 'Ödeme Yöntemleri', 'CreditCard', '9876', '[\"view\",\"update\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9878, 'system_level', '/admin/sms-provider/settings', 'api', NULL, 'SMS Ayarları', 'CreditCard', '9876', '[\"view\",\"update\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),

(9879, 'system_level', 'System management', 'api', NULL, 'Sistem Yönetimi', '', NULL, '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),





(9880, 'system_level', '/admin/system-management/general-settings', 'api', NULL, 'Genel Ayarlar', 'Settings', '9879', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9881, 'system_level', 'Currencies', 'api', NULL, 'Para Birimleri', 'FileSliders', '9879', '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9882, 'system_level', '/admin/system-management/currencies/settings', 'api', NULL, 'Ayarlar', '', '9881', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9883, 'system_level', '/admin/system-management/currencies/manage', 'api', NULL, 'Para Birimlerini Yönet', '', '9881', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),

(9884, 'system_level', '/admin/pages/list', 'api', NULL, 'Sayfa Listesi', 'List', '9879', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),

(9885, 'system_level', 'appearance_settings', 'api', NULL, 'Görünüm Ayarları', 'MonitorCog', '9879', '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9886, 'system_level', '/admin/system-management/themes', 'api', NULL, 'Temalar', 'Palette', '9885', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9887, 'system_level', '/admin/system-management/menu-customization', 'api', NULL, 'Menü Özelleştirme', '', '9885', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9888, 'system_level', '/admin/system-management/footer-customization', 'api', NULL, 'Alt Bilgi (Footer) Özelleştirme', '', '9885', '[\"view\",\"update\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),

(9889, 'system_level', 'Email Settings', 'api', NULL, 'E-posta Ayarları', 'Mails', '9879', '[\"view\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9890, 'system_level', '/admin/system-management/email-settings/smtp', 'api', NULL, 'SMTP Ayarları', '', '9889', '[\"view\",\"update\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9891, 'system_level', '/admin/system-management/email-settings/email-template/list', 'api', NULL, 'E-posta Şablonları', '', '9889', '[\"view\",\"update\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),

(9892, 'system_level', '/admin/media-manage', 'api', NULL, 'Medya', 'Images', '9879', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9893, 'system_level', '/admin/system-management/seo-settings', 'api', NULL, 'SEO Ayarları', 'SearchCheck', '9879', '[\"view\",\"update\"]', '2025-09-23 00:46:49', '2025-09-23 00:46:49', NULL),
(9894, 'system_level', '/admin/system-management/sitemap-settings', 'api', NULL, 'Site Haritası (Sitemap) Ayarları', 'Network', '9879', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9895, 'system_level', '/admin/system-management/gdpr-cookie-settings', 'api', NULL, 'Çerez Ayarları', 'Cookie', '9879', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),

(9896, 'system_level', 'Third-Party', 'api', NULL, 'Üçüncü Taraf', 'Blocks', '9879', '[\"view\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9897, 'system_level', '/admin/system-management/openai-settings', 'api', NULL, 'OpenAI Ayarları', '', '9896', '[\"view\",\"insert\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9898, 'system_level', '/admin/system-management/google-map-settings', 'api', NULL, 'Google Harita Ayarları', '', '9896', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9899, 'system_level', '/admin/system-management/firebase-settings', 'api', NULL, 'Firebase Ayarları', '', '9896', '[\"view\",\"insert\",\"update\",\"delete\",\"others\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9900, 'system_level', '/admin/system-management/social-login-settings', 'api', NULL, 'Sosyal Giriş Ayarları', '', '9896', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9901, 'system_level', '/admin/system-management/recaptcha-settings', 'api', NULL, 'reCAPTCHA Ayarları', '', '9896', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),

(9902, 'system_level', 'Maintenance Tools', 'api', NULL, 'Bakım Araçları', 'Wrench', '9879', '[\"view\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9903, 'system_level', '/admin/system-management/maintenance-settings', 'api', NULL, 'Bakım Modu', '', '9902', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9904, 'system_level', '/admin/system-management/cache-management', 'api', NULL, 'Önbellek Yönetimi', 'DatabaseZap', '9902', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL),
(9905, 'system_level', '/admin/system-management/database-update-controls', 'api', NULL, 'Veritabanı Güncelleme', 'Database', '9902', '[\"view\",\"update\"]', '2025-09-23 00:46:50', '2025-09-23 00:46:50', NULL)
ON DUPLICATE KEY UPDATE id=VALUES(id);
