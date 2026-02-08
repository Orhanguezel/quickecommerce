<?php

namespace Database\Seeders;

use App\Models\SettingOption;
use App\Models\Translation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class FooterSettingsSeeder extends Seeder
{
    /**
     * Seed footer customization settings — TR (df) + EN translations.
     */
    public function run(): void
    {
        if (!Schema::hasTable('setting_options')) {
            $this->command->warn('FooterSettingsSeeder: setting_options table does not exist. Skipping...');
            return;
        }

        // ── TR (default) content ────────────────────────────────────
        $trContent = [
            'com_social_links_facebook_url'       => 'https://facebook.com/quickecommerce',
            'com_social_links_twitter_url'        => 'https://twitter.com/quickecommerce',
            'com_social_links_instagram_url'      => 'https://instagram.com/quickecommerce',
            'com_social_links_linkedin_url'       => 'https://linkedin.com/company/quickecommerce',
            'com_download_app_link_one'           => 'https://play.google.com/store',
            'com_download_app_link_two'           => 'https://apps.apple.com',
            'com_payment_methods_enable_disable'  => 'on',
            'com_quick_access_enable_disable'     => 'on',
            'com_our_info_enable_disable'         => 'on',
            'com_social_links_enable_disable'     => 'on',
            'com_social_links_title'              => 'on',
            'com_payment_methods_image'           => '',
            'com_payment_methods_image_urls'      => '',
            'com_quick_access' => [
                ['com_quick_access_title' => 'Ana Sayfa',     'com_quick_access_url' => '/'],
                ['com_quick_access_title' => 'Tüm Ürünler',  'com_quick_access_url' => '/ara'],
                ['com_quick_access_title' => 'Kategoriler',   'com_quick_access_url' => '/kategori'],
                ['com_quick_access_title' => 'Mağazalar',     'com_quick_access_url' => '/magazalar'],
                ['com_quick_access_title' => 'Satıcı Ol',     'com_quick_access_url' => '/satici-ol'],
            ],
            'com_our_info' => [
                ['title' => 'Hakkımızda',                   'url' => '/hakkimizda'],
                ['title' => 'Kullanım Koşulları',           'url' => '/kullanim-kosullari'],
                ['title' => 'Gizlilik Politikası',          'url' => '/gizlilik-politikasi'],
                ['title' => 'İade ve Değişim Politikası',   'url' => '/iade-degisim'],
                ['title' => 'Kargo Politikası',             'url' => '/kargo-politikasi'],
            ],
            'com_help_center' => [
                ['title' => 'İletişim',           'url' => '/iletisim'],
                ['title' => 'Müşteri Hizmetleri', 'url' => '/destek'],
                ['title' => 'Ürün Desteği',       'url' => '/destek'],
                ['title' => 'Sipariş Takip',      'url' => '/siparislerim'],
            ],
        ];

        // ── EN content ──────────────────────────────────────────────
        $enContent = [
            'com_social_links_facebook_url'       => 'https://facebook.com/quickecommerce',
            'com_social_links_twitter_url'        => 'https://twitter.com/quickecommerce',
            'com_social_links_instagram_url'      => 'https://instagram.com/quickecommerce',
            'com_social_links_linkedin_url'       => 'https://linkedin.com/company/quickecommerce',
            'com_download_app_link_one'           => 'https://play.google.com/store',
            'com_download_app_link_two'           => 'https://apps.apple.com',
            'com_payment_methods_enable_disable'  => 'on',
            'com_quick_access_enable_disable'     => 'on',
            'com_our_info_enable_disable'         => 'on',
            'com_social_links_enable_disable'     => 'on',
            'com_social_links_title'              => 'on',
            'com_payment_methods_image'           => '',
            'com_payment_methods_image_urls'      => '',
            'com_quick_access' => [
                ['com_quick_access_title' => 'Home',           'com_quick_access_url' => '/'],
                ['com_quick_access_title' => 'All Products',   'com_quick_access_url' => '/ara'],
                ['com_quick_access_title' => 'Categories',     'com_quick_access_url' => '/kategori'],
                ['com_quick_access_title' => 'Stores',         'com_quick_access_url' => '/magazalar'],
                ['com_quick_access_title' => 'Become a Seller','com_quick_access_url' => '/satici-ol'],
            ],
            'com_our_info' => [
                ['title' => 'About Us',               'url' => '/hakkimizda'],
                ['title' => 'Terms & Conditions',     'url' => '/kullanim-kosullari'],
                ['title' => 'Privacy Policy',         'url' => '/gizlilik-politikasi'],
                ['title' => 'Return & Refund Policy', 'url' => '/iade-degisim'],
                ['title' => 'Shipping Policy',        'url' => '/kargo-politikasi'],
            ],
            'com_help_center' => [
                ['title' => 'Contact Us',        'url' => '/iletisim'],
                ['title' => 'Customer Service',  'url' => '/destek'],
                ['title' => 'Product Support',   'url' => '/destek'],
                ['title' => 'Track Order',       'url' => '/siparislerim'],
            ],
        ];

        // ── Upsert root setting ─────────────────────────────────────
        $footerSettings = SettingOption::updateOrCreate(
            ['option_name' => 'footer_settings'],
            ['option_value' => json_encode($trContent)],
        );

        $this->command->info('FooterSettingsSeeder: Root footer settings (TR) seeded.');

        // ── Translations ────────────────────────────────────────────
        if (!Schema::hasTable('translations')) {
            $this->command->warn('FooterSettingsSeeder: translations table does not exist. Skipping translations...');
            return;
        }

        $translations = [
            ['language_code' => 'df', 'content' => $trContent],
            ['language_code' => 'en', 'content' => $enContent],
        ];

        foreach ($translations as $translation) {
            Translation::updateOrCreate(
                [
                    'translatable_type' => 'App\\Models\\SettingOption',
                    'translatable_id'   => $footerSettings->id,
                    'language'          => $translation['language_code'],
                    'key'               => 'content',
                ],
                [
                    'value' => json_encode($translation['content']),
                ],
            );
        }

        $this->command->info('FooterSettingsSeeder: TR + EN translations seeded.');
    }
}
