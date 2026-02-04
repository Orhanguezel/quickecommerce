<?php

namespace Database\Seeders;

use App\Enums\PermissionKey;
use App\Models\Translation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Modules\Chat\app\Traits\ChatSeederMenu;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Permission as ModelsPermission;
use Spatie\Permission\Models\Role;
use function Laravel\Prompts\error;
use function Laravel\Prompts\info;

class PermissionAdminSeeder extends Seeder
{
    /**
     * Create Admin Menu Automatically
     *
     * @return void
     */

    public function run()
    {
        DB::table('permissions')->where('available_for', 'system_level')->delete();

        $admin_main_menu = [
            [
                // Dashboard
                [
                    'PermissionName' => PermissionKey::ADMIN_DASHBOARD->value,
                    'PermissionTitle' => 'Dashboard',
                    'activity_scope' => 'system_level',
                    'icon' => 'LayoutDashboard',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Dashboard',
                        'tr' => 'Kontrol Paneli',
                    ],
                ],

                // Orders & Refunds
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Orders & Refunds',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Orders & Refunds',
                        'tr' => 'Siparişler & İadeler',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Orders',
                            'activity_scope' => 'system_level',
                            'icon' => 'BringToFront',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Orders',
                                'tr' => 'Siparişler',
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_ORDERS_ALL->value,
                                    'PermissionTitle' => 'All Orders',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'ListOrdered',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'All Orders',
                                        'tr' => 'Tüm Siparişler',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_ORDERS_RETURNED_OR_REFUND_REQUEST->value,
                                    'PermissionTitle' => 'Returned or Refunded',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'RotateCcw',
                                    'options' => ['view', 'update', 'others'],
                                    'translations' => [
                                        'en' => 'Returned or Refunded',
                                        'tr' => 'İade / Geri Ödeme',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_ORDERS_RETURNED_OR_REFUND_REASON->value,
                                    'PermissionTitle' => 'Refund Reason',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Refund Reason',
                                        'tr' => 'İade Nedeni',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],

                // Product Manage
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Product management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Product management',
                        'tr' => 'Ürün Yönetimi',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Products',
                            'activity_scope' => 'system_level',
                            'icon' => 'Codesandbox',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Products',
                                'tr' => 'Ürünler',
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PRODUCTS_MANAGE->value,
                                    'PermissionTitle' => 'All Products',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'PackageSearch',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Manage Products',
                                        'tr' => 'Ürünleri Yönet',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PRODUCT_PRODUCT_APPROVAL_REQ->value,
                                    'PermissionTitle' => 'Product Approval Request',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Signature',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Product Approval Request',
                                        'tr' => 'Ürün Onay Talepleri',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PRODUCT_STOCK_REPORT->value,
                                    'PermissionTitle' => 'Product Low & Out Stock',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Layers',
                                    'options' => ['view'],
                                    'translations' => [
                                        'en' => 'Product Low & Out Stock',
                                        'tr' => 'Düşük / Tükenen Stok',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PRODUCT_PRODUCT_BULK_IMPORT->value,
                                    'PermissionTitle' => 'Bulk Import',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'FileUp',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Bulk Import',
                                        'tr' => 'Toplu İçe Aktarma',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PRODUCT_PRODUCT_BULK_EXPORT->value,
                                    'PermissionTitle' => 'Bulk Export',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Download',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Bulk Export',
                                        'tr' => 'Toplu Dışa Aktarma',
                                    ],
                                ],
                            ],
                        ],

                        // Product Inventory report
                        [
                            'PermissionName' => PermissionKey::ADMIN_PRODUCT_INVENTORY->value,
                            'PermissionTitle' => 'Product Inventory',
                            'activity_scope' => 'system_level',
                            'icon' => 'SquareChartGantt',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Product Inventory',
                                'tr' => 'Ürün Envanteri',
                            ],
                        ],

                        // category manage
                        [
                            'PermissionName' => PermissionKey::ADMIN_PRODUCT_CATEGORY_LIST->value,
                            'PermissionTitle' => 'Categories',
                            'activity_scope' => 'system_level',
                            'icon' => 'List',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Categories',
                                'tr' => 'Kategoriler',
                            ],
                        ],
                        [
                            'PermissionName' => PermissionKey::PRODUCT_ATTRIBUTE_LIST->value,
                            'PermissionTitle' => 'Attributes',
                            'activity_scope' => 'system_level',
                            'icon' => 'AttributeIcon',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Attributes',
                                'tr' => 'Özellikler',
                            ],
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_PRODUCT_UNIT_LIST->value,
                            'PermissionTitle' => 'Units',
                            'activity_scope' => 'system_level',
                            'icon' => 'Boxes',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Units',
                                'tr' => 'Birimler',
                            ],
                        ],

                        // Product Brand
                        [
                            'PermissionName' => PermissionKey::ADMIN_PRODUCT_BRAND_LIST->value,
                            'PermissionTitle' => 'Brands',
                            'activity_scope' => 'system_level',
                            'icon' => 'LayoutList',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Brands',
                                'tr' => 'Markalar',
                            ],
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_PRODUCT_TAG_LIST->value,
                            'PermissionTitle' => 'Tags',
                            'activity_scope' => 'system_level',
                            'icon' => 'Tags',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Tags',
                                'tr' => 'Etiketler',
                            ],
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_PRODUCT_AUTHORS_MANAGE->value,
                            'PermissionTitle' => 'Authors',
                            'activity_scope' => 'system_level',
                            'icon' => '',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Authors',
                                'tr' => 'Yazarlar',
                            ],
                        ],

                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Coupon Management',
                            'activity_scope' => 'system_level',
                            'icon' => 'SquarePercent',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Coupon Management',
                                'tr' => 'Kupon Yönetimi',
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_COUPON_MANAGE->value,
                                    'PermissionTitle' => 'Coupons',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete'],
                                    'translations' => [
                                        'en' => 'Coupons',
                                        'tr' => 'Kuponlar',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_COUPON_LINE_MANAGE->value,
                                    'PermissionTitle' => 'Coupon Lines',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete'],
                                    'translations' => [
                                        'en' => 'Coupon Lines',
                                        'tr' => 'Kupon Satırları',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],

                // Store management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Store management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Store management',
                        'tr' => 'Mağaza Yönetimi',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Store',
                            'activity_scope' => 'system_level',
                            'icon' => 'Store',
                            'translations' => [
                                'en' => 'Store',
                                'tr' => 'Mağaza',
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_STORE_LIST->value,
                                    'PermissionTitle' => 'Store List',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Store',
                                    'options' => ['view'],
                                    'translations' => [
                                        'en' => 'Store List',
                                        'tr' => 'Mağaza Listesi',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_STORE_ADD->value,
                                    'PermissionTitle' => 'Store Add',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete'],
                                    'translations' => [
                                        'en' => 'Store Add',
                                        'tr' => 'Mağaza Ekle',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_STORE_APPROVAL->value,
                                    'PermissionTitle' => 'Store Approval Request',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Store Approval Request',
                                        'tr' => 'Mağaza Onay Talepleri',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],

                // Slider management start
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Slider Management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Slider Management',
                        'tr' => 'Slider Yönetimi',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::ADMIN_SLIDER_MANAGE_LIST->value,
                            'PermissionTitle' => 'Slider',
                            'activity_scope' => 'system_level',
                            'icon' => 'SlidersHorizontal',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Slider',
                                'tr' => 'Slider',
                            ],
                        ],
                    ],
                ], // slider management end

                // Media management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Media Management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Media Management',
                        'tr' => 'Medya Yönetimi',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::ADMIN_MEDIA_MANAGE->value,
                            'PermissionTitle' => 'Media',
                            'activity_scope' => 'system_level',
                            'icon' => 'SlidersHorizontal',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Media',
                                'tr' => 'Medya',
                            ],
                        ],
                    ],
                ],

                // Promotional control
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Promotional control',
                    'activity_scope' => 'system_level',
                    'icon' => 'Proportions',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Promotional control',
                        'tr' => 'Promosyon Yönetimi',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Flash Sale',
                            'activity_scope' => 'system_level',
                            'icon' => 'Zap',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Flash Sale',
                                'tr' => 'Flaş Satış',
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PROMOTIONAL_FLASH_SALE_MANAGE->value,
                                    'PermissionTitle' => 'All Campaigns',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'All Campaigns',
                                        'tr' => 'Tüm Kampanyalar',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PROMOTIONAL_FLASH_SALE_JOIN_DEALS->value,
                                    'PermissionTitle' => 'Join Campaign Requests',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'delete', 'update', 'others'],
                                    'translations' => [
                                        'en' => 'Join Campaign Requests',
                                        'tr' => 'Kampanyaya Katılım Talepleri',
                                    ],
                                ],
                            ],
                        ],

                        // Banner Management
                        [
                            'PermissionName' => PermissionKey::ADMIN_PROMOTIONAL_BANNER_MANAGE->value,
                            'PermissionTitle' => 'Banners',
                            'activity_scope' => 'system_level',
                            'icon' => 'AlignJustify',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Banners',
                                'tr' => 'Bannerlar',
                            ],
                        ],
                    ],
                ],

                // Feedback Management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Feedback Management',
                    'activity_scope' => 'system_level',
                    'icon' => 'MessageSquareReply',
                    'options' => ['view', 'insert', 'update', 'delete'],
                    'translations' => [
                        'en' => 'Feedback Management',
                        'tr' => 'Geri Bildirim Yönetimi',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::ADMIN_FEEDBACK_REVIEWS->value,
                            'PermissionTitle' => 'Reviews',
                            'activity_scope' => 'system_level',
                            'icon' => 'Star',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Reviews',
                                'tr' => 'Yorumlar',
                            ],
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_FEEDBACK_QUESTIONS->value,
                            'PermissionTitle' => 'Questions',
                            'activity_scope' => 'system_level',
                            'icon' => 'CircleHelp',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Questions',
                                'tr' => 'Sorular',
                            ],
                        ],
                    ],
                ],

                // Blog Management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Blog Management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view', 'insert', 'update', 'delete'],
                    'translations' => [
                        'en' => 'Blog Management',
                        'tr' => 'Blog Yönetimi',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Blogs',
                            'activity_scope' => 'system_level',
                            'icon' => 'Rss',
                            'translations' => [
                                'en' => 'Blogs',
                                'tr' => 'Bloglar',
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_BLOG_CATEGORY_MANAGE->value,
                                    'PermissionTitle' => 'Category',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Category',
                                        'tr' => 'Kategori',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_BLOG_MANAGE->value,
                                    'PermissionTitle' => 'Posts',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Posts',
                                        'tr' => 'Yazılar',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],

                // Pages management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Pages Management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Pages Management',
                        'tr' => 'Sayfa Yönetimi',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::ADMIN_PAGES_LIST->value,
                            'PermissionTitle' => 'Page Lists',
                            'activity_scope' => 'system_level',
                            'icon' => 'List',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Page Lists',
                                'tr' => 'Sayfa Listesi',
                            ],
                        ],
                    ],
                ],

                // Wallet management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Wallet Management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Wallet Management',
                        'tr' => 'Cüzdan Yönetimi',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::ADMIN_WALLET_MANAGE->value,
                            'PermissionTitle' => 'Wallet Lists',
                            'activity_scope' => 'system_level',
                            'icon' => 'Wallet',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Wallet Lists',
                                'tr' => 'Cüzdan Listesi',
                            ],
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_WALLET_TRANSACTION->value,
                            'PermissionTitle' => 'Transaction History',
                            'activity_scope' => 'system_level',
                            'icon' => 'History',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Transaction History',
                                'tr' => 'İşlem Geçmişi',
                            ],
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_WALLET_SETTINGS->value,
                            'PermissionTitle' => 'Wallet Settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'Settings',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Wallet Settings',
                                'tr' => 'Cüzdan Ayarları',
                            ],
                        ],
                    ],
                ],

            ],
        ];

        // Deliveryman, Customer, Employee
        $admin_user_related_menu = [
            [
                // Deliveryman management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Deliveryman management',
                    'activity_scope' => 'system_level',
                    'icon' => 'UserRoundPen',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Deliveryman management',
                        'tr' => 'Kurye Yönetimi',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::ADMIN_DELIVERYMAN_VEHICLE_TYPE->value,
                            'PermissionTitle' => 'Vehicle Types',
                            'activity_scope' => 'system_level',
                            'icon' => 'Car',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Vehicle Types',
                                'tr' => 'Araç Tipleri',
                            ],
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_DELIVERYMAN_MANAGE_LIST->value,
                            'PermissionTitle' => 'Deliveryman List',
                            'activity_scope' => 'system_level',
                            'icon' => 'UserRoundPen',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Deliveryman List',
                                'tr' => 'Kurye Listesi',
                            ],
                        ],
                    ],
                ],

                // Customer management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Customer management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Customer management',
                        'tr' => 'Müşteri Yönetimi',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'All Customers',
                            'activity_scope' => 'system_level',
                            'icon' => '',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'All Customers',
                                'tr' => 'Tüm Müşteriler',
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_CUSTOMER_MANAGEMENT_LIST->value,
                                    'PermissionTitle' => 'Customers',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete'],
                                    'translations' => [
                                        'en' => 'Customers',
                                        'tr' => 'Müşteriler',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_CUSTOMER_SUBSCRIBED_MAIL_LIST->value,
                                    'PermissionTitle' => 'Subscriber List',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Subscriber List',
                                        'tr' => 'Abone Listesi',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_CUSTOMER_CONTACT_MESSAGES->value,
                                    'PermissionTitle' => 'Contact Messages',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Contact Messages',
                                        'tr' => 'İletişim Mesajları',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],

                // Seller Management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Seller management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Seller management',
                        'tr' => 'Satıcı Yönetimi',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'All Sellers',
                            'activity_scope' => 'system_level',
                            'icon' => '',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'All Sellers',
                                'tr' => 'Tüm Satıcılar',
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_SELLER_MANAGEMENT->value,
                                    'PermissionTitle' => 'Sellers',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Sellers',
                                        'tr' => 'Satıcılar',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_SELLER_REGISTRATION->value,
                                    'PermissionTitle' => 'Register A Seller',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Register A Seller',
                                        'tr' => 'Satıcı Kaydı',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],

                // Employee Management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Employee Management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view', 'insert', 'update', 'delete'],
                    'translations' => [
                        'en' => 'Employee Management',
                        'tr' => 'Personel Yönetimi',
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Staff Roles',
                            'activity_scope' => 'system_level',
                            'icon' => 'LockKeyholeOpen',
                            'translations' => [
                                'en' => 'Staff Roles',
                                'tr' => 'Personel Rolleri',
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::USERS_ROLE_LIST->value,
                                    'PermissionTitle' => 'List',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'translations' => [
                                        'en' => 'List',
                                        'tr' => 'Liste',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::USERS_ROLE_ADD->value,
                                    'PermissionTitle' => 'Add Role',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'translations' => [
                                        'en' => 'Add Role',
                                        'tr' => 'Rol Ekle',
                                    ],
                                ],
                            ],
                        ],
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'My Staff',
                            'activity_scope' => 'system_level',
                            'icon' => 'Users',
                            'translations' => [
                                'en' => 'My Staff',
                                'tr' => 'Personelim',
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_STAFF_LIST->value,
                                    'PermissionTitle' => 'List',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete'],
                                    'translations' => [
                                        'en' => 'List',
                                        'tr' => 'Liste',
                                    ],
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_STAFF_MANAGE->value,
                                    'PermissionTitle' => 'Add Staff',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete'],
                                    'translations' => [
                                        'en' => 'Add Staff',
                                        'tr' => 'Personel Ekle',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],


                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Chat Management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Chat Management',
                        'tr' => 'İletişim Yönetimi'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Chat',
                            'activity_scope' => 'system_level',
                            'icon' => 'MessageSquareMore',
                            'options' => ['view', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Chat',
                                'tr' => 'İletişim'
                            ],

                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_CHAT_SETTINGS->value,
                                    'PermissionTitle' => 'Chat Settings',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Chat Settings',
                                        'tr' => 'İletişim Ayarları'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_CHAT_MANAGE->value,
                                    'PermissionTitle' => 'Chat List',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Chat List',
                                        'tr' => 'İletişim Listesi'
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],


                // Support Ticket Management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Support Ticket',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Support Ticket',
                        'tr' => 'Destek Talebi'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Tickets',
                            'activity_scope' => 'system_level',
                            'icon' => 'Headphones',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Tickets',
                                'tr' => 'Biletler'
                            ],

                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_TICKETS_DEPARTMENT->value,
                                    'PermissionTitle' => 'Department',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete'],
                                    'translations' => [
                                        'en' => 'Department',
                                        'tr' => 'Departman'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_SUPPORT_TICKETS_MANAGE->value,
                                    'PermissionTitle' => 'All Tickets',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete'],
                                    'translations' => [
                                        'en' => 'All Tickets',
                                        'tr' => 'Tüm Biletler'
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],


                // Support Ticket Management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Support Ticket',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Support Ticket',
                        'tr' => 'Destek Talebi'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Tickets',
                            'activity_scope' => 'system_level',
                            'icon' => 'Headphones',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Tickets',
                                'tr' => 'Biletler'
                            ],

                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_TICKETS_DEPARTMENT->value,
                                    'PermissionTitle' => 'Department',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete'],
                                    'translations' => [
                                        'en' => 'Department',
                                        'tr' => 'Departman'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_SUPPORT_TICKETS_MANAGE->value,
                                    'PermissionTitle' => 'All Tickets',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete'],
                                    'translations' => [
                                        'en' => 'All Tickets',
                                        'tr' => 'Tüm Biletler'
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],

            ]
        ];


        $admin_transaction_related_menu = [
            [
                // Financial Management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Financial Management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Financial Management',
                        'tr' => 'Finansal Yönetim'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Financial',
                            'activity_scope' => 'system_level',
                            'icon' => 'BadgeDollarSign',
                            'translations' => [
                                'en' => 'Financial',
                                'tr' => 'Finansal'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_FINANCIAL_WITHDRAW_MANAGE_SETTINGS->value,
                                    'PermissionTitle' => 'Withdrawal Settings',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'translations' => [
                                        'en' => 'Withdrawal Settings',
                                        'tr' => 'Çekilme Ayarları'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_WITHDRAW_METHOD_MANAGEMENT->value,
                                    'PermissionTitle' => 'Withdrawal Method',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'translations' => [
                                        'en' => 'Withdrawal Method',
                                        'tr' => 'Çekilme Yöntemi'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_FINANCIAL_WITHDRAW_MANAGE_HISTORY->value,
                                    'PermissionTitle' => 'Withdraw History',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Withdraw History',
                                        'tr' => 'Çekilme Geçmişi'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_FINANCIAL_WITHDRAW_MANAGE_REQUEST->value,
                                    'PermissionTitle' => 'Withdraw Requests',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Withdraw Requests',
                                        'tr' => 'Çekilme Talepleri'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_FINANCIAL_COLLECT_CASH->value,
                                    'PermissionTitle' => 'Cash Collect',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Cash Collect',
                                        'tr' => 'Nakit Tahsilatı'
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],

                // Report and analytics
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Report and analytics',
                    'activity_scope' => 'system_level',
                    'icon' => 'ChartNetwork',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Report and analytics',
                        'tr' => 'Raporlar ve Analitik'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::ADMIN_REPORT_ANALYTICS_ORDER->value,
                            'PermissionTitle' => 'Order Report',
                            'activity_scope' => 'system_level',
                            'icon' => '',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Order Report',
                                'tr' => 'Sipariş Raporu'
                            ]
                        ]
                    ]
                ],
            ]
        ];

        $admin_settings_related_menu = [
            [

                // Notifications Management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Notifications',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Notifications',
                        'tr' => 'Bildirimler'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::ADMIN_NOTIFICATION_MANAGEMENT->value,
                            'PermissionTitle' => 'Notifications',
                            'activity_scope' => 'system_level',
                            'icon' => '',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Notifications',
                                'tr' => 'Bildirim Ayarları'
                            ]
                        ]
                    ]
                ],

                // Notice Management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Notice Management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Notice Management',
                        'tr' => 'Bildirim Yönetimi'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::ADMIN_NOTICE_MANAGEMENT->value,
                            'PermissionTitle' => 'Notices',
                            'activity_scope' => 'system_level',
                            'icon' => '',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Notices',
                                'tr' => 'Bildirim Ayarları'
                            ]
                        ]
                    ]
                ],


                // Business Operations
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Business Operations',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Business Operations',
                        'tr' => 'İşlemler'
                    ],
                    'submenu' => [
                        // Store Type
                        [
                            'PermissionName' => PermissionKey::ADMIN_STORE_TYPE_MANAGE->value,
                            'PermissionTitle' => 'Store Type',
                            'activity_scope' => 'system_level',
                            'icon' => 'Store',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Store Type',
                                'tr' => 'Mağaza Türü'
                            ]
                        ],
                        // Area Setup
                        [
                            'PermissionName' => PermissionKey::ADMIN_GEO_AREA_MANAGE->value,
                            'PermissionTitle' => 'Area Setup',
                            'activity_scope' => 'system_level',
                            'icon' => 'Locate',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Area Setup',
                                'tr' => 'Bölge Ayarları'
                            ]
                        ],

                        // Subscription Management
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Subscription',
                            'activity_scope' => 'system_level',
                            'icon' => 'PackageCheck',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Subscription Management',
                                'tr' => 'Abonelik Yönetimi'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_SUBSCRIPTION_PACKAGE_MANAGE->value,
                                    'PermissionTitle' => 'Subscription Package',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Subscription Package',
                                        'tr' => 'Abonelik Paketi'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_SUBSCRIPTION_STORE_PACKAGE_MANAGE->value,
                                    'PermissionTitle' => 'Store Subscription',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Store Subscription',
                                        'tr' => 'Mağaza Aboneliği'
                                    ]
                                ]
                            ]
                        ],

                        // Admin Commission System
                        [
                            'PermissionName' => PermissionKey::ADMIN_COMMISSION_SETTINGS->value,
                            'PermissionTitle' => 'Commission Settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'BadgePercent',
                            'options' => ['view', 'update', 'others'],
                            'translations' => [
                                'en' => 'Commission Settings',
                                'tr' => 'Yönetici Komisyon Sistemi'
                            ],
                        ]
                    ]
                ],

                //Payment settings management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Payment Gateways',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Payment Gateways',
                        'tr' => 'Ödeme Ağ Geçitleri'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::ADMIN_PAYMENT_SETTINGS->value,
                            'PermissionTitle' => 'Payment Settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'CreditCard',
                            'options' => ['view', 'update'],
                            'translations' => [
                                'en' => 'Payment Settings',
                                'tr' => 'Ödeme Ayarları'
                            ]
                        ]

                    ]
                ],

                //System management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'System management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'System management',
                        'tr' => 'Sistem Yönetimi'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::GENERAL_SETTINGS->value,
                            'PermissionTitle' => 'General Settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'Settings',
                            'translations' => [
                                'en' => 'General Settings',
                                'tr' => 'Genel Ayarlar'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::PAGE_SETTINGS->value,
                            'PermissionTitle' => 'Page Settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'FileSliders',
                            'translations' => [
                                'en' => 'Page Settings',
                                'tr' => 'Sayfa Ayarları'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::REGISTER_PAGE_SETTINGS->value,
                                    'PermissionTitle' => 'Register Page',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Register Page',
                                        'tr' => 'Kayıt Sayfası'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::LOGIN_PAGE_SETTINGS->value,
                                    'PermissionTitle' => 'Login Page',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Login Settings',
                                        'tr' => 'Giriş Ayarları'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::PRODUCT_DETAILS_PAGE_SETTINGS->value,
                                    'PermissionTitle' => 'Product Details Page',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Product Details Page',
                                        'tr' => 'Ürün Detay Sayfası'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::BLOG_PAGE_SETTINGS->value,
                                    'PermissionTitle' => 'Blog Page',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Blog Page',
                                        'tr' => 'Blog Sayfası'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ABOUT_PAGE_SETTINGS->value,
                                    'PermissionTitle' => 'About Page',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'About Page',
                                        'tr' => 'Hakkında Sayfası'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::CONTACT_PAGE_SETTINGS->value,
                                    'PermissionTitle' => 'Contact Page',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Contact Page',
                                        'tr' => 'İletişim Sayfası'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::BECOME_SELLER_PAGE_SETTINGS->value,
                                    'PermissionTitle' => 'Become A Seller Page',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Become A Seller Page',
                                        'tr' => 'Satıcı Ol Sayfası'
                                    ]
                                ]
                            ]
                        ],

                        [
                            'PermissionName' => PermissionKey::APPEARANCE_SETTINGS->value,
                            'PermissionTitle' => 'Appearance Settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'MonitorCog',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Appearance Settings',
                                'tr' => 'Görünüm Ayarları'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::MENU_CUSTOMIZATION->value,
                                    'PermissionTitle' => 'Menu Customization',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Menu Manage',
                                        'tr' => 'Menü Yönetimi'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::FOOTER_CUSTOMIZATION->value,
                                    'PermissionTitle' => 'Footer Customization',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Footer Customization',
                                        'tr' => 'Altbilgi Özelleştirme'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::MAINTENANCE_SETTINGS->value,
                                    'PermissionTitle' => 'Maintenance Settings',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Maintenance Settings',
                                        'tr' => 'Bakım Ayarları'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Email Settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'Mails',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Email Settings',
                                'tr' => 'E-posta Ayarları'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::SMTP_SETTINGS->value,
                                    'PermissionTitle' => 'SMTP Settings',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'SMTP Settings',
                                        'tr' => 'SMTP Ayarları'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::EMAIL_TEMPLATES->value,
                                    'PermissionTitle' => 'Email Templates',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Email Templates',
                                        'tr' => 'E-posta Şablonları'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::SEO_SETTINGS->value,
                            'PermissionTitle' => 'SEO Settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'SearchCheck',
                            'options' => ['view', 'update'],
                            'translations' => [
                                'en' => 'SEO Settings',
                                'tr' => 'SEO Ayarları'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::GDPR_COOKIE_SETTINGS->value,
                            'PermissionTitle' => 'GDPR & Cookie Settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'SearchCheck',
                            'options' => ['view', 'update'],
                            'translations' => [
                                'en' => 'GDPR & Cookie Settings',
                                'tr' => 'GDPR & Çerez Ayarları'
                            ]
                        ],
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Third-Party Integrations',
                            'activity_scope' => 'system_level',
                            'icon' => 'Blocks',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Third-Party Integrations',
                                'tr' => 'Üçüncü Taraf Entegrasyonları'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::GOOGLE_MAP_SETTINGS->value,
                                    'PermissionTitle' => 'Google Map Settings',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'translations' => [
                                        'en' => 'Google Map Settings',
                                        'tr' => 'Google Harita Ayarları'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::FIREBASE_SETTINGS->value,
                                    'PermissionTitle' => 'Firebase Settings',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Firebase Settings',
                                        'tr' => 'Firebase Ayarları'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::SOCIAL_LOGIN_SETTINGS->value,
                                    'PermissionTitle' => 'Social Login Settings',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Social Login Settings',
                                        'tr' => 'Sosyal Giriş Ayarları'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::RECAPTCHA_SETTINGS->value,
                                    'PermissionTitle' => 'Recaptcha Settings',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Recaptcha Settings',
                                        'tr' => 'Recaptcha Ayarları'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::CACHE_MANAGEMENT->value,
                            'PermissionTitle' => 'Cache Management',
                            'activity_scope' => 'system_level',
                            'icon' => 'DatabaseZap',
                            'options' => ['view', 'update'],
                            'translations' => [
                                'en' => 'Cache Management',
                                'tr' => 'Önbellek Yönetimi'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::DATABASE_UPDATE_CONTROLS->value,
                            'PermissionTitle' => 'Database Update Controls',
                            'activity_scope' => 'system_level',
                            'icon' => 'Database',
                            'options' => ['view', 'update'],
                            'translations' => [
                                'en' => 'Database Update Controls',
                                'tr' => 'Veritabanı Güncelleme Kontrolleri'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::APP_SETTINGS->value,
                            'PermissionTitle' => 'App settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'Smartphone',
                            'options' => ['view', 'update'],
                            'translations' => [
                                'en' => 'App settings',
                                'tr' => 'Uygulama Ayarları'
                            ]
                        ]
                    ]
                ]
            ]
        ];


        $page_list = array_merge($admin_main_menu, $admin_user_related_menu, $admin_transaction_related_menu, $admin_settings_related_menu);


        foreach ($page_list as $x_mod) {
            foreach ($x_mod as $level_1) {

                $trans_level_1 = [];
                $options_l1 = isset($level_1['options']) && is_array($level_1['options']) ? $level_1['options'] : ['view'];

                $permission_l1 = ModelsPermission::updateOrCreate(
                    [
                        'name' => $level_1['PermissionName'] != '' ? $level_1['PermissionName'] : $level_1['PermissionTitle'],
                        'perm_title' => $level_1['PermissionTitle'],
                        'guard_name' => 'api',
                        'icon' => $level_1['icon'],
                        'available_for' => $level_1['activity_scope'],
                        'options' => json_encode($options_l1)
                    ]
                );
                foreach ($level_1['translations'] as $key => $value) {
                    $trans_level_1[] = [
                        'translatable_type' => 'App\Models\Permissions',
                        'translatable_id' => $permission_l1->id,
                        'language' => $key,
                        'key' => 'perm_title',
                        'value' => $value,
                    ];
                }
                Translation::insert($trans_level_1);

                // Level 2 Menu Insert
                if (isset($level_1['submenu']) && is_array($level_1['submenu'])) {
                    foreach ($level_1['submenu'] as $level_2) {

                        $trans_level_2 = [];
                        $options_l2 = isset($level_2['options']) && is_array($level_2['options']) ? $level_2['options'] : ['view'];

                        $permission_l2 = ModelsPermission::updateOrCreate(
                            [
                                'name' => $level_2['PermissionName'] != '' ? $level_2['PermissionName'] : $level_2['PermissionTitle'],
                                'perm_title' => $level_2['PermissionTitle'],
                                'guard_name' => 'api',
                                'icon' => $level_2['icon'],
                                'available_for' => $level_2['activity_scope'],
                                'options' => json_encode($options_l2),
                                'parent_id' => $permission_l1->id
                            ]
                        );
                        foreach ($level_2['translations'] as $key_2 => $value_2) {
                            $trans_level_2[] = [
                                'translatable_type' => 'App\Models\Permissions',
                                'translatable_id' => $permission_l2->id,
                                'language' => $key_2,
                                'key' => 'perm_title',
                                'value' => $value_2,
                            ];
                        }
                        Translation::insert($trans_level_2);

                        // Level 3 Menu Insert
                        if (isset($level_2['submenu']) && is_array($level_2['submenu'])) {
                            foreach ($level_2['submenu'] as $level_3) {

                                $trans_level_3 = [];
                                $options_l3 = isset($level_3['options']) && is_array($level_3['options']) ? $level_3['options'] : ['view'];

                                $permission_l3 = ModelsPermission::updateOrCreate(
                                    [
                                        'name' => $level_3['PermissionName'],
                                        'perm_title' => $level_3['PermissionTitle'],
                                        'guard_name' => 'api',
                                        'icon' => $level_3['icon'],
                                        'available_for' => $level_3['activity_scope'],
                                        'options' => json_encode($options_l3),
                                        'parent_id' => $permission_l2->id
                                    ]
                                );
                                foreach ($level_3['translations'] as $key_3 => $value_3) {
                                    $trans_level_3[] = [
                                        'translatable_type' => 'App\Models\Permissions',
                                        'translatable_id' => $permission_l3->id,
                                        'language' => $key_3,
                                        'key' => 'perm_title',
                                        'value' => $value_3,
                                    ];
                                }
                                Translation::insert($trans_level_3);

                            }
                        }
                    }
                }
            }

        }

        $user = auth('api')->user();
        if ($user && $user->activity_scope == 'system_level') {
            //Assign PermissionKey to Super Admin Role
            $role = Role::where(['available_for'  => 'system_level'])->first();
            //PermissionKey::firstOrCreate(['name'  => 'all'], ['name'  => 'all', 'guard_name' => 'api']);
            $role->givePermissionTo(Permission::whereIn('available_for',['system_level','COMMON'])->get());
            $user->assignRole($role);

            // Update View Option For All permission
            DB::table('role_has_permissions')->update(['view' => true]);
        }
    }
}
