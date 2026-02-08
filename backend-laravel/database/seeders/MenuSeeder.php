<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate tables
        DB::table('menus')->truncate();
        DB::table('translations')->where('translatable_type', 'App\\Models\\Menu')->delete();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Insert menus
        $menus = [
            // Level 0 - Main menus
            [
                'id' => 1,
                'name' => 'Home',
                'url' => '/',
                'icon' => null,
                'position' => 1,
                'parent_id' => null,
                'parent_path' => null,
                'menu_level' => 0,
                'menu_path' => null,
                'is_visible' => true,
                'status' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Product',
                'url' => 'product',
                'icon' => null,
                'position' => 2,
                'parent_id' => null,
                'parent_path' => null,
                'menu_level' => 0,
                'menu_path' => null,
                'is_visible' => true,
                'status' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Category',
                'url' => 'product-category/list',
                'icon' => null,
                'position' => 3,
                'parent_id' => null,
                'parent_path' => null,
                'menu_level' => 0,
                'menu_path' => null,
                'is_visible' => true,
                'status' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'name' => 'Store',
                'url' => 'store/list',
                'icon' => null,
                'position' => 4,
                'parent_id' => null,
                'parent_path' => null,
                'menu_level' => 0,
                'menu_path' => null,
                'is_visible' => true,
                'status' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'name' => 'Pages',
                'url' => null,
                'icon' => null,
                'position' => 5,
                'parent_id' => null,
                'parent_path' => null,
                'menu_level' => 0,
                'menu_path' => null,
                'is_visible' => true,
                'status' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'name' => 'Blog',
                'url' => 'blogs',
                'icon' => null,
                'position' => 6,
                'parent_id' => null,
                'parent_path' => null,
                'menu_level' => 0,
                'menu_path' => null,
                'is_visible' => true,
                'status' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Level 1 - Sub menus under "Pages"
            [
                'id' => 7,
                'name' => 'About Page',
                'url' => 'about-us',
                'icon' => null,
                'position' => 1,
                'parent_id' => 5,
                'parent_path' => '5',
                'menu_level' => 1,
                'menu_path' => 'Pages',
                'is_visible' => true,
                'status' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 8,
                'name' => 'Contact Page',
                'url' => 'contact-us',
                'icon' => null,
                'position' => 2,
                'parent_id' => 5,
                'parent_path' => '5',
                'menu_level' => 1,
                'menu_path' => 'Pages',
                'is_visible' => true,
                'status' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 9,
                'name' => 'Coupon',
                'url' => 'coupon',
                'icon' => null,
                'position' => 3,
                'parent_id' => 5,
                'parent_path' => '5',
                'menu_level' => 1,
                'menu_path' => 'Pages',
                'is_visible' => true,
                'status' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 10,
                'name' => 'Terms and conditions',
                'url' => 'terms-conditions',
                'icon' => null,
                'position' => 4,
                'parent_id' => 5,
                'parent_path' => '5',
                'menu_level' => 1,
                'menu_path' => 'Pages',
                'is_visible' => true,
                'status' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 11,
                'name' => 'Privacy Policy',
                'url' => 'privacy-policy',
                'icon' => null,
                'position' => 5,
                'parent_id' => 5,
                'parent_path' => '5',
                'menu_level' => 1,
                'menu_path' => 'Pages',
                'is_visible' => true,
                'status' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 12,
                'name' => 'Shipping & Delivery Policy',
                'url' => 'shipping-delivery-policy',
                'icon' => null,
                'position' => 6,
                'parent_id' => 5,
                'parent_path' => '5',
                'menu_level' => 1,
                'menu_path' => 'Pages',
                'is_visible' => true,
                'status' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('menus')->insert($menus);

        // Insert translations
        $translations = [
            // Menu ID 1 - Home
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 1, 'language' => 'tr', 'key' => 'name', 'value' => 'Ana Sayfa'],
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 1, 'language' => 'en', 'key' => 'name', 'value' => 'Home'],

            // Menu ID 2 - Product
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 2, 'language' => 'tr', 'key' => 'name', 'value' => 'Ürün'],
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 2, 'language' => 'en', 'key' => 'name', 'value' => 'Product'],

            // Menu ID 3 - Category
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 3, 'language' => 'tr', 'key' => 'name', 'value' => 'Kategori'],
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 3, 'language' => 'en', 'key' => 'name', 'value' => 'Category'],

            // Menu ID 4 - Store
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 4, 'language' => 'tr', 'key' => 'name', 'value' => 'Mağaza'],
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 4, 'language' => 'en', 'key' => 'name', 'value' => 'Store'],

            // Menu ID 5 - Pages
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 5, 'language' => 'tr', 'key' => 'name', 'value' => 'Sayfalar'],
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 5, 'language' => 'en', 'key' => 'name', 'value' => 'Pages'],

            // Menu ID 6 - Blog
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 6, 'language' => 'tr', 'key' => 'name', 'value' => 'Blog'],
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 6, 'language' => 'en', 'key' => 'name', 'value' => 'Blog'],

            // Menu ID 7 - About Page
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 7, 'language' => 'tr', 'key' => 'name', 'value' => 'Hakkımızda'],
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 7, 'language' => 'en', 'key' => 'name', 'value' => 'About Page'],

            // Menu ID 8 - Contact Page
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 8, 'language' => 'tr', 'key' => 'name', 'value' => 'İletişim'],
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 8, 'language' => 'en', 'key' => 'name', 'value' => 'Contact Page'],

            // Menu ID 9 - Coupon
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 9, 'language' => 'tr', 'key' => 'name', 'value' => 'Kupon'],
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 9, 'language' => 'en', 'key' => 'name', 'value' => 'Coupon'],

            // Menu ID 10 - Terms and conditions
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 10, 'language' => 'tr', 'key' => 'name', 'value' => 'Şartlar ve Koşullar'],
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 10, 'language' => 'en', 'key' => 'name', 'value' => 'Terms and conditions'],

            // Menu ID 11 - Privacy Policy
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 11, 'language' => 'tr', 'key' => 'name', 'value' => 'Gizlilik Politikası'],
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 11, 'language' => 'en', 'key' => 'name', 'value' => 'Privacy Policy'],

            // Menu ID 12 - Shipping & Delivery Policy
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 12, 'language' => 'tr', 'key' => 'name', 'value' => 'Kargo ve Teslimat Politikası'],
            ['translatable_type' => 'App\\Models\\Menu', 'translatable_id' => 12, 'language' => 'en', 'key' => 'name', 'value' => 'Shipping & Delivery Policy'],
        ];

        DB::table('translations')->insert($translations);
    }
}
