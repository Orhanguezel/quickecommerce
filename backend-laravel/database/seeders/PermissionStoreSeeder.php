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

class PermissionStoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $permissionIds = DB::table('permissions')
            ->where('available_for', 'store_level')
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
        $admin_main_menu = [];
        $shop_menu = [
            [
                // Dashboard
                [
                    'PermissionName' => 'dashboard',
                    'PermissionTitle' => 'Dashboard',
                    'activity_scope' => 'store_level',
                    'icon' => 'LayoutDashboard',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Dashboard',
                        'tr' => 'Kontrol Paneli'
                    ]
                ],

                // Pos
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'POS Management',
                    'activity_scope' => 'store_level',
                    'icon' => 'CircleDollarSign',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'POS Management',
                        'tr' => 'POS Yönetimi'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'POS',
                            'activity_scope' => 'store_level',
                            'icon' => 'ListOrdered',
                            'options' => ['view',  'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'POS',
                                'tr' => 'POS'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::SELLER_STORE_POS_SALES->value,
                                    'PermissionTitle' => 'POS',
                                    'activity_scope' => 'store_level',
                                    'icon' => 'ListOrdered',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'POS',
                                        'tr' => 'POS'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::SELLER_STORE_POS_ORDERS->value,
                                    'PermissionTitle' => 'Orders',
                                    'activity_scope' => 'store_level',
                                    'icon' => 'ListOrdered',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Orders',
                                        'tr' => 'Siparişler'
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],


                // order manage
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Order Management',
                    'activity_scope' => 'store_level',
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
                            'activity_scope' => 'store_level',
                            'icon' => 'Boxes',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Orders',
                                'tr' => 'Siparişler'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::SELLER_STORE_ORDER_MANAGE->value,
                                    'PermissionTitle' => 'All Orders',
                                    'activity_scope' => 'store_level',
                                    'icon' => '',
                                    'translations' => [
                                        'en' => 'All Orders',
                                        'tr' => 'Tüm Siparişler'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::SELLER_ORDERS_RETURNED_OR_REFUND_REQUEST->value,
                                    'PermissionTitle' => 'Returned or Refunded',
                                    'activity_scope' => 'store_level',
                                    'icon' => '',
                                    'options' => ['view'],
                                    'translations' => [
                                        'en' => 'Returned or Refunded',
                                        'tr' => 'İade Edildi veya Geri Ödendi'
                                    ]
                                ],
                            ]
                        ]
                    ]
                ],

                // product manage
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Product management',
                    'activity_scope' => 'store_level',
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
                            'activity_scope' => 'store_level',
                            'icon' => 'Codesandbox',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Products',
                                'tr' => 'Ürünler'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::SELLER_STORE_PRODUCT_LIST->value,
                                    'PermissionTitle' => 'Manage Products',
                                    'activity_scope' => 'store_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                                    'translations' => [
                                        'en' => 'Manage Products',
                                        'tr' => 'Ürünleri Yönet'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::SELLER_STORE_PRODUCT_ADD->value,
                                    'PermissionTitle' => 'Add New Product',
                                    'activity_scope' => 'store_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update', 'delete'],
                                    'translations' => [
                                        'en' => 'Add New Product',
                                        'tr' => 'Yeni Ürün Ekle'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::SELLER_STORE_PRODUCT_STOCK_REPORT->value,
                                    'PermissionTitle' => 'Product Low & Out Stock',
                                    'activity_scope' => 'store_level',
                                    'icon' => '',
                                    'options' => ['view'],
                                    'translations' => [
                                        'en' => 'Product Low & Out Stock',
                                        'tr' => 'Düşük ve Tükenen Stoklu Ürünler'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::SELLER_STORE_PRODUCT_INVENTORY->value,
                                    'PermissionTitle' => 'Inventory',
                                    'activity_scope' => 'store_level',
                                    'icon' => 'PackageOpen',
                                    'options' => ['view'],
                                    'translations' => [
                                        'en' => 'Inventory',
                                        'tr' => 'Envanter'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::SELLER_STORE_PRODUCT_BULK_IMPORT->value,
                                    'PermissionTitle' => 'Bulk Import',
                                    'activity_scope' => 'store_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update'],
                                    'translations' => [
                                        'en' => 'Bulk Import',
                                        'tr' => 'Toplu İçe Aktarma'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::SELLER_STORE_PRODUCT_BULK_EXPORT->value,
                                    'PermissionTitle' => 'Bulk Export',
                                    'activity_scope' => 'store_level',
                                    'icon' => '',
                                    'options' => ['view', 'insert', 'update'],
                                    'translations' => [
                                        'en' => 'Bulk Export',
                                        'tr' => 'Toplu Dışa Aktarma'
                                    ]
                                ]
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::SELLER_STORE_CATEGORY_MANAGE->value,
                            'PermissionTitle' => 'Categories',
                            'activity_scope' => 'store_level',
                            'icon' => 'LayoutGrid',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Category List',
                                'tr' => 'Kategori Listesi'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::SELLER_PRODUCT_ATTRIBUTE_ADD->value,
                            'PermissionTitle' => 'Attributes',
                            'activity_scope' => 'store_level',
                            'icon' => 'Layers2',
                            'translations' => [
                                'en' => 'Attribute List',
                                'tr' => 'Özellik Listesi'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::SELLER_STORE_PRODUCT_AUTHORS_MANAGE->value,
                            'PermissionTitle' => 'Authors',
                            'activity_scope' => 'store_level',
                            'icon' => 'BookOpenCheck',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Author List',
                                'tr' => 'Yazar Listesi'
                            ]
                        ],
                    ]
                ],


                // Promotional control
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Promotional control',
                    'activity_scope' => 'store_level',
                    'icon' => 'Proportions',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Promotional control',
                        'tr' => 'Promosyon Kontrolü'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => '',
                            'PermissionTitle' => 'Flash Sale',
                            'activity_scope' => 'store_level',
                            'icon' => 'Zap',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Flash Sale',
                                'tr' => 'Hızlı Satış'
                            ],
                            'submenu' => [
                                [
                                    'PermissionName' => PermissionKey::SELLER_STORE_PROMOTIONAL_FLASH_SALE_ACTIVE_DEALS->value,
                                    'PermissionTitle' => 'Active Deals',
                                    'activity_scope' => 'store_level',
                                    'icon' => '',
                                    'options' => ['view'],
                                    'translations' => [
                                        'en' => 'Active Deals',
                                        'tr' => 'Aktif Fırsatlar'
                                    ]
                                ],
                                [
                                    'PermissionName' => PermissionKey::SELLER_STORE_PROMOTIONAL_FLASH_SALE_MY_DEALS->value,
                                    'PermissionTitle' => 'My Deals',
                                    'activity_scope' => 'store_level',
                                    'icon' => '',
                                    'options' => ['view'],
                                    'translations' => [
                                        'en' => 'My Deals',
                                        'tr' => 'Tekliflerim'
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],

                // Communication Center
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Communication Center',
                    'activity_scope' => 'store_level',
                    'icon' => 'Headphones',
                    'options' => ['view', 'insert', 'update', 'delete', 'others'],
                    'translations' => [
                        'en' => 'Communication Center',
                        'tr' => 'İletişim Merkezi'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::SELLER_CHAT_MANAGE->value,
                            'PermissionTitle' => 'Chat List',
                            'activity_scope' => 'store_level',
                            'icon' => 'MessageSquareMore',
                            'options' => ['view', 'insert', 'update'],
                            'translations' => [
                                'en' => 'Chat',
                                'tr' => 'Sohbet Ayarları'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::SELLER_STORE_SUPPORT_TICKETS_MANAGE->value,
                            'PermissionTitle' => 'Tickets',
                            'activity_scope' => 'store_level',
                            'icon' => 'Headset',
                            'options' => ['view', 'insert', 'update', 'delete', 'others'],
                            'translations' => [
                                'en' => 'Support Ticket',
                                'tr' => 'Destek Bileti'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::SELLER_NOTIFICATION_MANAGEMENT->value,
                            'PermissionTitle' => 'All Notifications',
                            'activity_scope' => 'store_level',
                            'icon' => 'Bell',
                            'translations' => [
                                'en' => 'All Notifications',
                                'tr' => 'Tüm Bildirimler'
                            ]
                        ]
                    ]
                ],

                //Feedback control
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Feedback control',
                    'activity_scope' => 'store_level',
                    'icon' => 'MessageSquareReply',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Feedback control',
                        'tr' => 'Geri Bildirim Kontrolü'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::SELLER_STORE_FEEDBACK_CONTROL_REVIEWS->value,
                            'PermissionTitle' => 'Reviews',
                            'activity_scope' => 'store_level',
                            'icon' => 'Star',
                            'translations' => [
                                'en' => 'Reviews',
                                'tr' => 'İncelemeler'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::SELLER_STORE_FEEDBACK_CONTROL_QUESTIONS->value,
                            'PermissionTitle' => 'Questions',
                            'activity_scope' => 'store_level',
                            'icon' => 'CircleHelp',
                            'translations' => [
                                'en' => 'Questions',
                                'tr' => 'Sorular'
                            ]
                        ]
                    ]
                ],


                // Financial Management
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Financial Management',
                    'activity_scope' => 'store_level',
                    'icon' => '',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Financial Management',
                        'tr' => 'Finans Yönetimi'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::SELLER_STORE_FINANCIAL_WITHDRAWALS->value,
                            'PermissionTitle' => 'Withdrawals',
                            'activity_scope' => 'store_level',
                            'icon' => 'BadgeDollarSign',
                            'options' => ['view', 'insert'],
                            'translations' => [
                                'en' => 'Withdrawals',
                                'tr' => 'Para Çekme'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::SELLER_STORE_FINANCIAL_WALLET->value,
                            'PermissionTitle' => 'Store Wallet',
                            'activity_scope' => 'store_level',
                            'icon' => 'Wallet',
                            'translations' => [
                                'en' => 'Store Wallet',
                                'tr' => 'Mağaza Cüzdanı'
                            ]
                        ]
                    ]
                ],

                // Staff control
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Staff control',
                    'activity_scope' => 'store_level',
                    'icon' => 'UserRoundPen',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Staff control',
                        'tr' => 'Personel Kontrolü'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::SELLER_STORE_STAFF_MANAGE->value,
                            'PermissionTitle' => 'Staff List',
                            'activity_scope' => 'store_level',
                            'icon' => 'Users',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'Staff List',
                                'tr' => 'Personel Listesi'
                            ]
                        ],

                    ]
                ],


                // Store Settings
                [
                    'PermissionName' => '',
                    'PermissionTitle' => 'Store Settings',
                    'activity_scope' => 'store_level',
                    'icon' => 'Store',
                    'options' => ['view'],
                    'translations' => [
                        'en' => 'Store Settings',
                        'tr' => 'Mağaza Ayarları'
                    ],
                    'submenu' => [
                        [
                            'PermissionName' => PermissionKey::SELLER_STORE_BUSINESS_PLAN->value,
                            'PermissionTitle' => 'Business Plan',
                            'activity_scope' => 'store_level',
                            'icon' => 'BriefcaseBusiness',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Business Plan',
                                'tr' => 'İş Planı'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::SELLER_STORE_STORE_NOTICE->value,
                            'PermissionTitle' => 'Notice',
                            'activity_scope' => 'store_level',
                            'icon' => 'BadgeAlert',
                            'options' => ['view'],
                            'translations' => [
                                'en' => 'Store Notice',
                                'tr' => 'Mağaza Bildirimi'
                            ]
                        ],
                        [
                            'PermissionName' => PermissionKey::SELLER_STORE_MY_SHOP->value,
                            'PermissionTitle' => 'My Stores',
                            'activity_scope' => 'store_level',
                            'icon' => 'Store',
                            'options' => ['view', 'insert', 'update', 'delete'],
                            'translations' => [
                                'en' => 'My Stores',
                                'tr' => 'Mağazalarım'
                            ]
                        ]
                    ]
                ]
            ]
        ];


        $page_list = array_merge($admin_main_menu, $shop_menu);

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


        //Assign PermissionKey to Store Admin Role
        $role = Role::where('id', 2)->first();
        $role->givePermissionTo(Permission::whereIn('available_for', ['store_level', 'COMMON'])->get());
        $user = User::whereEmail('seller@gmail.com')->first();
        if (!$user) {
            return;
        }
        // Assign default Store User to a Specific Role
        $user->assignRole($role);
    }
}
