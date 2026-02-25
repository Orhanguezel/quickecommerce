<?php

namespace Database\Seeders;

use App\Enums\PermissionKey;
use App\Models\Translation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
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
        $permissionIds = DB::table('permissions')
            ->where('available_for', 'system_level')
            ->pluck('id')
            ->toArray();

        if (!empty($permissionIds)) {
            // Delete permissions
            DB::table('permissions')->whereIn('id', $permissionIds)->delete();

            // Delete related translations
            DB::table('translations')->whereIn('translatable_id', $permissionIds)
                ->where('translatable_type', 'App\\Models\\Permissions')
                ->delete();
        }
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
                    ]
                ],

                // Pos manage
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'POS Management',
                    'activity_scope' => 'system_level',
                    'icon' => 'CircleDollarSign',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'POS Management',
                        'tr' => 'Yönetim POS'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'POS',
                            'activity_scope' => 'system_level',
                            'icon' => 'ListOrdered',
                            'options' => ['view',  'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'POS',
                                'tr' => 'POS'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_POS_SALES->value,
                                    'PermissionTitle' => 'POS',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'ListOrdered',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'POS',
                                        'tr' => 'POS'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_POS_ORDERS->value,
                                    'PermissionTitle' => 'Orders',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'ListOrdered',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Orders',
                                        'tr' => 'Siparişler'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_POS_SETTINGS->value,
                                    'PermissionTitle' => 'Settings',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'ListOrdered',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Settings',
                                        'tr' => 'Ayarlar'
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],

                // Orders & Refunds
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Order Management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Orders & Reviews',
                        'tr' => 'Siparişler ve İncelemeler'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Orders',
                            'activity_scope' => 'system_level',
                            'icon' => 'ListOrdered',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Orders',
                                'tr' => 'Siparişler'
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
                                        'tr' => 'Tüm Siparişler'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_ORDERS_RETURNED_OR_REFUND_REQUEST->value,
                                    'PermissionTitle' => 'Returned or Refunded',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'RotateCcw',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Returned or Refunded',
                                        'tr' => 'İade Edildi veya Geri Ödendi'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_ORDERS_RETURNED_OR_REFUND_REASON->value,
                                    'PermissionTitle' => 'Refund Reason',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Refund Reason',
                                        'tr' => 'İade Nedeni'
                                    ]
                                ]
                            ]
                        ]
                    ]
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
                        'tr' => 'Ürün Yönetimi'
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
                                'tr' => 'Ürünler'
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
                                        'tr' => 'Ürünleri Yönet'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PRODUCTS_TRASH_MANAGEMENT->value,
                                    'PermissionTitle' => 'Trash',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Trash',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Trash',
                                        'tr' => 'Çöp Kutusu'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PRODUCT_PRODUCT_APPROVAL_REQ->value,
                                    'PermissionTitle' => 'Product Approval Request',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Signature',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Product Approval Request',
                                        'tr' => 'Ürün Onay Talebi'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PRODUCT_STOCK_REPORT->value,
                                    'PermissionTitle' => 'Product Low & Out Stock',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Layers',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Product Low & Out Stock',
                                        'tr' => 'Düşük ve Tükenen Ürün Stoku'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PRODUCT_PRODUCT_BULK_IMPORT->value,
                                    'PermissionTitle' => 'Bulk Import',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'FileUp',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Bulk Import',
                                        'tr' => 'Toplu İçe Aktarma'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PRODUCT_PRODUCT_BULK_EXPORT->value,
                                    'PermissionTitle' => 'Bulk Export',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Download',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Bulk Export',
                                        'tr' => 'Toplu Dışa Aktarma'
                                    ]
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
                                        'tr' => 'Ürün Envanteri'
                                    ]
                                ]
                            ]
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
                                'tr' => 'Kategoriler'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::PRODUCT_ATTRIBUTE_LIST->value,
                            'PermissionTitle' => 'Attributes',
                            'activity_scope' => 'system_level',
                            'icon' => 'AttributeIcon',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Attributes',
                                'tr' => 'Özellikler'
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
                                'tr' => 'Birimler'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_DYNAMIC_FIELDS->value,
                            'PermissionTitle' => 'Dynamic Fields',
                            'activity_scope' => 'system_level',
                            'icon' => 'Boxes',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Dynamic Fields',
                                'tr' => 'Dinamik Alanlar'
                            ]
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
                                'tr' => 'Markalar'
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
                                'tr' => 'Etiketler'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_PRODUCT_AUTHORS_MANAGE->value,
                            'PermissionTitle' => 'Authors',
                            'activity_scope' => 'system_level',
                            'icon' => '',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Authors',
                                'tr' => 'Yazarlar'
                            ]
                        ],
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Coupon Management',
                            'activity_scope' => 'system_level',
                            'icon' => 'SquarePercent',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Coupon Management',
                                'tr' => 'Kupon Yönetimi'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_COUPON_MANAGE->value,
                                    'PermissionTitle' => 'Coupons',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Coupons',
                                        'tr' => 'Kuponlar'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_COUPON_LINE_MANAGE->value,
                                    'PermissionTitle' => 'Coupon Lines',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Coupon Lines',
                                        'tr' => 'Kupon Satırları'
                                    ]
                                ]
                            ],


                        ]
                    ]
                ],

                //Seller & Store
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Sellers & Stores',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Sellers & Stores',
                        'tr' => 'Satıcılar ve Mağazalar'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'All Sellers',
                            'activity_scope' => 'system_level',
                            'icon' => 'UsersRound',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'All Sellers',
                                'tr' => 'Tüm Satıcılar'
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
                                        'tr' => 'Satıcılar'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_SELLER_TRASH_MANAGEMENT->value,
                                    'PermissionTitle' => 'Trash',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Trash',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Trash',
                                        'tr' => 'Çöp'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_SELLER_REGISTRATION->value,
                                    'PermissionTitle' => 'Register A Seller',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Subscriber List',
                                        'tr' => 'Abone Listesi'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'All Stores',
                            'activity_scope' => 'system_level',
                            'icon' => 'Store',
                            'translations' => [
                                'en' => 'All Stores',
                                'tr' => 'Tüm Mağazalar'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_STORE_LIST->value,
                                    'PermissionTitle' => 'Store List',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Store',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Store List',
                                        'tr' => 'Mağaza Listesi'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_STORE_TRASH_MANAGEMENT->value,
                                    'PermissionTitle' => 'Trash',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Trash',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Trash',
                                        'tr' => 'Çöp'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_STORE_ADD->value,
                                    'PermissionTitle' => 'Store Add',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Store Add',
                                        'tr' => 'Mağaza Ekle'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_STORE_APPROVAL->value,
                                    'PermissionTitle' => 'Store Approval Request',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Store Approval Request',
                                        'tr' => 'Onay Bekleyen Mağazalar'
                                    ]
                                ],
                            ]
                        ]
                    ]
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
                        'tr' => 'Promosyon Kontrolü'
                    ],
                    'submenu' => [
                        // flash sale
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Flash Sale',
                            'activity_scope' => 'system_level',
                            'icon' => 'Zap',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Flash Sale',
                                'tr' => 'Hızlı Satış'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PROMOTIONAL_FLASH_SALE_MANAGE->value,
                                    'PermissionTitle' => 'All Campaigns',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'List',
                                        'tr' => 'Kampanyalar'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_PROMOTIONAL_FLASH_SALE_JOIN_DEALS->value,
                                    'PermissionTitle' => 'Join Campaign Requests',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'delete', 'update', 'others'],
                                    'translations' => [
                                        'en' => 'Join Deals',
                                        'tr' => 'Kampanyaya Katılma Talepleri'
                                    ]
                                ],
                            ]
                        ],

                        // Shipping Campaign Management
                        [
                            'PermissionName' => PermissionKey::ADMIN_PROMOTIONAL_SHIPPING_CAMPAIGN->value,
                            'PermissionTitle' => 'Shipping Campaigns',
                            'activity_scope' => 'system_level',
                            'icon' => 'Truck',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Shipping Campaigns',
                                'tr' => 'Kargo Kampanyaları'
                            ]
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
                                'tr' => 'Afişler'
                            ],
                        ],
                        // Slider
                        [
                            'PermissionName' => PermissionKey::ADMIN_SLIDER_MANAGE_LIST->value,
                            'PermissionTitle' => 'Slider',
                            'activity_scope' => 'system_level',
                            'icon' => 'SlidersHorizontal',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Slider',
                                'tr' => 'Slider'
                            ]
                        ],
                    ]
                ],

                // Feedback  Management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Feedback Management',
                    'activity_scope' => 'system_level',
                    'icon' => 'MessageSquareReply',
                    'options' => ['view', 'insert', 'update', 'delete'],
                    'translations' => [
                        'en' => 'Feedback Management',
                        'tr' => 'Geri Bildirim Yönetimi'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::ADMIN_FEEDBACK_REVIEWS->value,
                            'PermissionTitle' => 'Reviews',
                            'activity_scope' => 'system_level',
                            'icon' => 'Star',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Reviews',
                                'tr' => 'İncelemeler'
                            ]
                        ],

                        [
                            'PermissionName' => PermissionKey::ADMIN_FEEDBACK_QUESTIONS->value,
                            'PermissionTitle' => 'Questions',
                            'activity_scope' => 'system_level',
                            'icon' => 'CircleHelp',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Questions',
                                'tr' => 'Sorular'
                            ]
                        ]
                    ]
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
                        'tr' => 'Blog Yönetimi'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Blogs',
                            'activity_scope' => 'system_level',
                            'icon' => 'Rss',
                            'translations' => [
                                'en' => 'Blogs',
                                'tr' => 'Bloglar'
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
                                        'tr' => 'Kategori'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_BLOG_MANAGE->value,
                                    'PermissionTitle' => 'Posts',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Posts',
                                        'tr' => 'Gönderiler'
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],


                // wallet manage
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Wallet Management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Wallet Management',
                        'tr' => 'Cüzdan Yönetimi'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::ADMIN_WALLET_MANAGE->value,
                            'PermissionTitle' => 'Wallet Lists',
                            'activity_scope' => 'system_level',
                            'icon' => 'Wallet',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Wallet Lists',
                                'tr' => 'Cüzdan Listeleri'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_WALLET_TRANSACTION->value,
                            'PermissionTitle' => 'Transaction History',
                            'activity_scope' => 'system_level',
                            'icon' => 'History',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Transaction History',
                                'tr' => 'İşlem Geçmişi'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_WALLET_SETTINGS->value,
                            'PermissionTitle' => 'Wallet Settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'Settings',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Wallet Settings',
                                'tr' => 'Cüzdan Ayarları'
                            ]
                        ]
                    ]
                ]

            ]
        ];

        // Deliveryman, Customer,Employee
        $admin_user_related_menu = [
            [
                // Deliveryman management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Deliveryman',
                    'activity_scope' => 'system_level',
                    'icon' => 'UserRoundPen',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Deliveryman',
                        'tr' => 'Teslimat Yönetimi'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::ADMIN_DELIVERYMAN_VEHICLE_TYPE->value,
                            'PermissionTitle' => 'Vehicle Types',
                            'activity_scope' => 'system_level',
                            'icon' => 'Car',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Vehicle Types',
                                'tr' => 'Araç Türleri'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_DELIVERYMAN_MANAGE_LIST->value,
                            'PermissionTitle' => 'Deliveryman List',
                            'activity_scope' => 'system_level',
                            'icon' => 'UserRoundPen',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Deliveryman List',
                                'tr' => 'Teslimat Listesi'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_DELIVERYMAN_TRASH_MANAGEMENT->value,
                            'PermissionTitle' => 'Trash',
                            'activity_scope' => 'system_level',
                            'icon' => 'Trash',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Trash',
                                'tr' => 'Çöp'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_DELIVERYMAN_REQUEST->value,
                            'PermissionTitle' => 'Deliveryman Requests',
                            'activity_scope' => 'system_level',
                            'icon' => 'ListPlus',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Deliveryman Requests',
                                'tr' => 'Teslimat Talepleri'
                            ]
                        ],
                    ]
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
                        'tr' => 'Müşteri Yönetimi'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'All Customers',
                            'activity_scope' => 'system_level',
                            'icon' => 'UsersRound',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'All Customers',
                                'tr' => 'Tüm Müşteriler'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_CUSTOMER_MANAGEMENT_LIST->value,
                                    'PermissionTitle' => 'Customers',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Customers',
                                        'tr' => 'Müşteriler'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_CUSTOMER_TRASH_MANAGEMENT->value,
                                    'PermissionTitle' => 'Trash',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Trash',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Trash',
                                        'tr' => 'Çöp'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_CUSTOMER_SUBSCRIBED_MAIL_LIST->value,
                                    'PermissionTitle' => 'Subscriber List',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Subscriber List',
                                        'tr' => 'Abone Listesi'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_CUSTOMER_CONTACT_MESSAGES->value,
                                    'PermissionTitle' => 'Contact Messages',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Contact Messages',
                                        'tr' => 'İletişim Mesajları'
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],

                // Staff & Permissions
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Staff & Permissions',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view', 'insert', 'update', 'delete'],
                    'translations' => [
                        'en' => 'Staff & Permissions',
                        'tr' => 'Personel ve İzinler'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Staff Roles',
                            'activity_scope' => 'system_level',
                            'options' => ['view'],
                            'icon' => 'LockKeyholeOpen',
                            'translations' => [
                                'en' => 'Staff Roles',
                                'tr' => 'Personel Rolleri'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::USERS_ROLE_LIST->value,
                                    'PermissionTitle' => 'List',
                                    'activity_scope' => 'system_level',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'icon' => '',
                                    'translations' => [
                                        'en' => 'List',
                                        'tr' => 'Liste'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::USERS_ROLE_ADD->value,
                                    'PermissionTitle' => 'Add Role',
                                    'activity_scope' => 'system_level',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'icon' => '',
                                    'translations' => [
                                        'en' => 'Add Role',
                                        'tr' => 'Rol Ekle'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'My Staff',
                            'activity_scope' => 'system_level',
                            'options' => ['view'],
                            'icon' => 'Users',
                            'translations' => [
                                'en' => 'My Staff',
                                'tr' => 'Personelim'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_STAFF_LIST->value,
                                    'PermissionTitle' => 'List',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'List',
                                        'tr' => 'Liste'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_STAFF_MANAGE->value,
                                    'PermissionTitle' => 'Add Staff',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert'],
                                    'translations' => [
                                        'en' => 'Add Staff',
                                        'tr' => 'Personel Ekle'
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
                            'options' => ['view'],
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
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'icon' => '',
                                    'translations' => [
                                        'en' => 'Withdrawal Settings',
                                        'tr' => 'Para Çekme Ayarları'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_WITHDRAW_METHOD_MANAGEMENT->value,
                                    'PermissionTitle' => 'Withdrawal Method',
                                    'activity_scope' => 'system_level',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'icon' => '',
                                    'translations' => [
                                        'en' => 'Withdrawal Method',
                                        'tr' => 'Para Çekme Yöntemi'
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
                                        'tr' => 'Para Çekme Geçmişi'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_FINANCIAL_WITHDRAW_MANAGE_REQUEST->value,
                                    'PermissionTitle' => 'Withdraw Requests',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Withdraw Requests',
                                        'tr' => 'Para Çekme Talepleri'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_FINANCIAL_COLLECT_CASH->value,
                                    'PermissionTitle' => 'Cash Collect',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
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
                    'icon' => 'Logs',
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
                            'icon' => 'FileChartColumnIncreasing',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Order Report',
                                'tr' => 'Sipariş Raporu'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_REPORT_ANALYTICS_TRANSACTION->value,
                            'PermissionTitle' => 'Transaction Report',
                            'activity_scope' => 'system_level',
                            'icon' => 'ChartNoAxesCombined',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Transaction Report',
                                'tr' => 'İşlem Raporu'
                            ]
                        ]
                    ]
                ],
            ]
        ];

        $admin_settings_related_menu = [
            [


                // Communication Center
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Communication Center',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Communication Center',
                        'tr' => 'İletişim Merkezi'
                    ],
                    'submenu' => [
                        // chat
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Chat',
                            'activity_scope' => 'system_level',
                            'icon' => 'MessageSquareMore',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Chat',
                                'tr' => 'Sohbet'
                            ],

                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::ADMIN_CHAT_SETTINGS->value,
                                    'PermissionTitle' => 'Chat Settings',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Chat Settings',
                                        'tr' => 'Sohbet Ayarları'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::ADMIN_CHAT_MANAGE->value,
                                    'PermissionTitle' => 'Chat List',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Chat List',
                                        'tr' => 'Sohbet Listesi'
                                    ]
                                ]
                            ]
                        ],
                        //Tickets
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
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
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
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'All Tickets',
                                        'tr' => 'Tüm Biletler'
                                    ]
                                ]
                            ]
                        ],
                        //Notifications
                        [
                            'PermissionName' => PermissionKey::ADMIN_NOTIFICATION_MANAGEMENT->value,
                            'PermissionTitle' => 'Notifications',
                            'activity_scope' => 'system_level',
                            'icon' => 'Bell',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Notifications',
                                'tr' => 'Bildirimler'
                            ]
                        ],
                        //Notices
                        [
                            'PermissionName' => PermissionKey::ADMIN_NOTICE_MANAGEMENT->value,
                            'PermissionTitle' => 'Notices',
                            'activity_scope' => 'system_level',
                            'icon' => 'MessageSquareWarning',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Notices',
                                'tr' => 'Duyurular'
                            ]
                        ],
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
                        'tr' => 'İşletme Operasyonları'
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
                                'tr' => 'Alan Kurulumu'
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
                                'tr' => 'Komisyon Ayarları'
                            ],
                        ]
                    ]
                ],


                //Gateway Management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Gateway Management',
                    'activity_scope' => 'system_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Gateway Management',
                        'tr' => 'Geçit Yönetimi'
                    ],
                    'submenu' => [
                        //Payment settings management
                        [
                            'PermissionName' => PermissionKey::ADMIN_PAYMENT_SETTINGS->value,
                            'PermissionTitle' => 'Payment Gateway',
                            'activity_scope' => 'system_level',
                            'icon' => 'CreditCard',
                            'options' => ['view', 'update'],
                            'translations' => [
                                'en' => 'Payment Gateway',
                                'tr' => 'Ödeme Geçidi'
                            ]
                        ],
                        //SMS settings management
                        [
                            'PermissionName' => PermissionKey::ADMIN_SMS_GATEWAY_SETTINGS->value,
                            'PermissionTitle' => 'SMS Settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'CreditCard',
                            'options' => ['view', 'update'],
                            'translations' => [
                                'en' => 'SMS Gateway Settings',
                                'tr' => 'SMS Geçidi Ayarları'
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
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'icon' => 'Settings',
                            'translations' => [
                                'en' => 'General Settings',
                                'tr' => 'Genel Ayarlar'
                            ]
                        ],
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Currencies',
                            'activity_scope' => 'system_level',
                            'icon' => 'FileSliders',
                            'translations' => [
                                'en' => 'Currencies',
                                'tr' => 'Para Birimleri'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::CURRENCIES_SETTINGS->value,
                                    'PermissionTitle' => 'Settings',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Settings',
                                        'tr' => 'Ayarlar'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::CURRENCIES_MANAGE->value,
                                    'PermissionTitle' => 'Manage Currencies',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Manage Currencies',
                                        'tr' => 'Para Birimlerini Yönet'
                                    ]
                                ],

                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::ADMIN_PAGES_LIST->value,
                            'PermissionTitle' => 'Page Lists',
                            'activity_scope' => 'system_level',
                            'icon' => 'List',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Page Lists',
                                'tr' => 'Sayfa Listeleri'
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
                                    'PermissionName' => PermissionKey::THEMES_SETTINGS->value,
                                    'PermissionTitle' => 'Themes',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Palette',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Themes',
                                        'tr' => 'Temalar'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::MENU_CUSTOMIZATION->value,
                                    'PermissionTitle' => 'Menu Customization',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Menu Customization',
                                        'tr' => 'Menü Özelleştirme'
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
                            'PermissionName' => PermissionKey::ADMIN_MEDIA_MANAGE->value,
                            'PermissionTitle' => 'Media',
                            'activity_scope' => 'system_level',
                            'icon' => 'Images',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Media',
                                'tr' => 'Medya'
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
                            'PermissionName' => PermissionKey::SITEMAP_SETTINGS->value,
                            'PermissionTitle' => 'Sitemap Settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'Network',
                            'options' => ['view', 'update'],
                            'translations' => [
                                'en' => 'Sitemap Settings',
                                'tr' => 'Site Haritası Ayarları'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::GDPR_COOKIE_SETTINGS->value,
                            'PermissionTitle' => 'Cookie Settings',
                            'activity_scope' => 'system_level',
                            'icon' => 'Cookie',
                            'options' => ['view', 'update'],
                            'translations' => [
                                'en' => 'Cookie Settings',
                                'tr' => 'Çerez Ayarları'
                            ]
                        ],
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Third-Party',
                            'activity_scope' => 'system_level',
                            'icon' => 'Blocks',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Third-Party',
                                'tr' => 'Üçüncü Taraf'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::OPEN_AI_SETTINGS->value,
                                    'PermissionTitle' => 'Open AI Settings',
                                    'activity_scope' => 'system_level',
                                    'options' => ['view', 'insert', 'update'],
                                    'icon' => '',
                                    'translations' => [
                                        'en' => 'Open AI Settings',
                                        'tr' => 'Open AI Ayarları'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::GOOGLE_MAP_SETTINGS->value,
                                    'PermissionTitle' => 'Google Map Settings',
                                    'activity_scope' => 'system_level',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
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
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
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
                                ],
                                [
                                    'PermissionName' => PermissionKey::CARGO_SETTINGS->value,
                                    'PermissionTitle' => 'Cargo Settings',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Cargo Settings (Geliver)',
                                        'tr' => 'Kurye Ayarları (Geliver)'
                                    ]
                                ]
                            ]
                        ],

                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Maintenance Tools',
                            'activity_scope' => 'system_level',
                            'icon' => 'Wrench',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Maintenance Tools',
                                'tr' => 'Bakım Araçları'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::MAINTENANCE_SETTINGS->value,
                                    'PermissionTitle' => 'Maintenance Mode',
                                    'activity_scope' => 'system_level',
                                    'icon' => '',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Maintenance Mode',
                                        'tr' => 'Bakım Modu'
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
                                    'PermissionTitle' => 'Database Update',
                                    'activity_scope' => 'system_level',
                                    'icon' => 'Database',
                                    'options' => ['view', 'update'],
                                    'translations' => [
                                        'en' => 'Database Update',
                                        'tr' => 'Veritabanı Güncelleme'
                                    ]
                                ]
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

        $user = User::where('activity_scope', 'system_level')->first();

        if ($user && $user->activity_scope == 'system_level') {
            $role = Role::where('available_for', 'system_level')->first();

            if ($role) {
                $permissions = Permission::whereIn('available_for', ['system_level', 'COMMON'])->get();
                $role->givePermissionTo($permissions);
                $user->assignRole($role);

                // Super admin gets ALL permission flags (view, insert, update, delete, others)
                DB::table('role_has_permissions')
                    ->where('role_id', $role->id)
                    ->update([
                        'view'   => true,
                        'insert' => true,
                        'update' => true,
                        'delete' => true,
                        'others' => true,
                    ]);
            }
        }
    }
}
