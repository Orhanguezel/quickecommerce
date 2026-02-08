<?php

namespace Database\Seeders;

use App\Models\SettingOption;
use App\Models\Translation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ThemeSeeder extends Seeder
{
    /**
     * Seed theme configuration for theme_one (Premium Theme) and theme_two (Classic Theme).
     * Default language: Turkish (tr), Translation: English (en)
     */
    public function run(): void
    {
        if (!Schema::hasTable('setting_options')) {
            $this->command->warn('ThemeSeeder: setting_options table does not exist. Skipping...');
            return;
        }

        // ── English theme pages data (shared by both themes) ──────────────
        $enThemePages = [
            [
                'theme_home_page' => [
                    [
                        'slider'                  => [['enabled_disabled' => 'on']],
                        'category'                => [['title' => 'Categories', 'enabled_disabled' => 'on']],
                        'flash_sale'              => [['title' => 'Flash Sale', 'enabled_disabled' => 'on']],
                        'product_featured'        => [['title' => 'Featured Products', 'enabled_disabled' => 'on']],
                        'banner_section'          => [['enabled_disabled' => 'on']],
                        'product_top_selling'     => [['title' => 'Top Selling', 'enabled_disabled' => 'on']],
                        'product_latest'          => [['title' => 'New Products', 'enabled_disabled' => 'on']],
                        'popular_product_section' => [['title' => 'Popular Products', 'enabled_disabled' => 'on']],
                        'top_stores_section'      => [['title' => 'Popular Stores', 'enabled_disabled' => 'on']],
                        'newsletters_section'     => [
                            [
                                'title'            => 'Subscribe to Newsletter',
                                'subtitle'         => 'Stay updated with the latest products and promotions.',
                                'enabled_disabled' => 'on',
                            ],
                        ],
                    ],
                ],
                'theme_login_page' => [
                    [
                        'customer' => [
                            [
                                'title'            => 'Welcome!',
                                'subtitle'         => 'Sign in to continue shopping.',
                                'enabled_disabled' => 'on',
                                'image_id'         => null,
                                'img_url'          => '',
                            ],
                        ],
                        'admin' => [
                            [
                                'title'    => 'Admin Login',
                                'subtitle' => 'Control Panel',
                                'image_id' => null,
                                'img_url'  => '',
                            ],
                        ],
                    ],
                ],
                'theme_register_page' => [
                    [
                        'title'                        => 'Register Now!',
                        'subtitle'                     => 'Join for a Great Shopping Experience',
                        'description'                  => 'Explore a wide range of products from multiple stores, shop securely and never miss the best deals.',
                        'terms_page_title'             => 'Terms of Use',
                        'terms_page_url'               => '/terms-of-use',
                        'social_login_enable_disable'  => 'on',
                        'image_id'                     => null,
                        'img_url'                      => '',
                    ],
                ],
                'theme_product_details_page' => [
                    [
                        'delivery_title'              => 'Free Shipping',
                        'delivery_subtitle'           => 'Free shipping across Turkey.',
                        'delivery_url'                => '/shipping-and-delivery',
                        'delivery_enabled_disabled'   => 'on',
                        'refund_title'                => 'Easy Return & Exchange',
                        'refund_subtitle'             => 'Right to return within 30 days.',
                        'refund_url'                  => '/return-and-exchange',
                        'refund_enabled_disabled'     => 'on',
                        'related_title'               => 'Related Products',
                    ],
                ],
                'theme_blog_page' => [
                    [
                        'popular_title' => 'Popular Posts',
                        'related_title' => 'Related Posts',
                    ],
                ],
            ],
        ];

        // ── Theme One — Premium Theme ──────────────────────────────────────
        $themeOneData = [
            'name'        => 'Premium Theme',
            'slug'        => 'theme_one',
            'description' => 'Complete premium e-commerce theme',
            'version'     => '2.0',

            'theme_style' => [
                [
                    'colors' => [
                        [
                            'primary'   => '#1A73E8',
                            'secondary' => '#0e5abc',
                        ],
                    ],
                ],
            ],

            'theme_header' => [
                [
                    'header_number' => '01',
                ],
            ],

            'theme_footer' => [
                [
                    'background_color' => '#0d166d',
                    'text_color'       => '#ffffff',
                    'layout_columns'   => 3,
                ],
            ],

            'theme_pages' => [
                [
                    'theme_home_page' => [
                        [
                            'slider'                  => [['enabled_disabled' => 'on']],
                            'category'                => [['title' => 'Kategoriler', 'enabled_disabled' => 'on']],
                            'flash_sale'              => [['title' => 'Fırsat Ürünleri', 'enabled_disabled' => 'on']],
                            'product_featured'        => [['title' => 'Öne Çıkan Ürünler', 'enabled_disabled' => 'on']],
                            'banner_section'          => [['enabled_disabled' => 'on']],
                            'product_top_selling'     => [['title' => 'En Çok Satanlar', 'enabled_disabled' => 'on']],
                            'product_latest'          => [['title' => 'Yeni Ürünler', 'enabled_disabled' => 'on']],
                            'popular_product_section' => [['title' => 'Popüler Ürünler', 'enabled_disabled' => 'on']],
                            'top_stores_section'      => [['title' => 'Popüler Mağazalar', 'enabled_disabled' => 'on']],
                            'newsletters_section'     => [
                                [
                                    'title'            => 'Bültene Abone Olun',
                                    'subtitle'         => 'En yeni ürünler ve kampanyalardan haberdar olun.',
                                    'enabled_disabled' => 'on',
                                ],
                            ],
                        ],
                    ],

                    'theme_login_page' => [
                        [
                            'customer' => [
                                [
                                    'title'            => 'Hoş Geldiniz!',
                                    'subtitle'         => 'Alışverişe devam etmek için giriş yapın.',
                                    'enabled_disabled' => 'on',
                                    'image_id'         => null,
                                    'img_url'          => '',
                                ],
                            ],
                            'admin' => [
                                [
                                    'title'    => 'Yönetici Girişi',
                                    'subtitle' => 'Kontrol Paneli',
                                    'image_id' => null,
                                    'img_url'  => '',
                                ],
                            ],
                        ],
                    ],

                    'theme_register_page' => [
                        [
                            'title'                        => 'Hemen Kayıt Olun!',
                            'subtitle'                     => 'Harika Bir Alışveriş Deneyimi İçin Katılın',
                            'description'                  => 'Birçok mağazadan geniş ürün yelpazesini keşfedin, güvenli alışveriş yapın ve en iyi fırsatları kaçırmayın.',
                            'terms_page_title'             => 'Kullanım Koşulları',
                            'terms_page_url'               => '/kullanim-kosullari',
                            'social_login_enable_disable'  => 'on',
                            'image_id'                     => null,
                            'img_url'                      => '',
                        ],
                    ],

                    'theme_product_details_page' => [
                        [
                            'delivery_title'              => 'Ücretsiz Kargo',
                            'delivery_subtitle'           => 'Türkiye genelinde ücretsiz kargo.',
                            'delivery_url'                => '/kargo-ve-teslimat',
                            'delivery_enabled_disabled'   => 'on',
                            'refund_title'                => 'Kolay İade & Değişim',
                            'refund_subtitle'             => '30 gün içinde iade hakkı.',
                            'refund_url'                  => '/iade-ve-degisim',
                            'refund_enabled_disabled'     => 'on',
                            'related_title'               => 'Benzer Ürünler',
                        ],
                    ],

                    'theme_blog_page' => [
                        [
                            'popular_title' => 'Popüler Yazılar',
                            'related_title' => 'İlgili Yazılar',
                        ],
                    ],
                ],
            ],
        ];

        $themeOne = SettingOption::updateOrCreate(
            ['option_name' => 'theme_one'],
            [
                'option_value' => json_encode($themeOneData),
                'autoload'     => true,
            ],
        );

        // ── Theme One — English Translation (via Translation model) ──────
        $this->seedTranslation($themeOne->id, 'en', $enThemePages);

        $this->command->info('ThemeSeeder: theme_one (Premium Theme) seeded with EN translation.');

        // ── Theme Two — Classic Theme ──────────────────────────────────────
        $themeTwoData = [
            'name'        => 'Classic Theme',
            'slug'        => 'theme_two',
            'description' => 'Clean and minimal e-commerce theme',
            'version'     => '1.0',

            'theme_style' => [
                [
                    'colors' => [
                        [
                            'primary'   => '#10B981',
                            'secondary' => '#059669',
                        ],
                    ],
                ],
            ],

            'theme_header' => [
                [
                    'header_number' => '02',
                ],
            ],

            'theme_footer' => [
                [
                    'background_color' => '#1e293b',
                    'text_color'       => '#ffffff',
                    'layout_columns'   => 4,
                ],
            ],

            'theme_pages' => [
                [
                    'theme_home_page' => [
                        [
                            'slider'                  => [['enabled_disabled' => 'on']],
                            'category'                => [['title' => 'Kategoriler', 'enabled_disabled' => 'on']],
                            'flash_sale'              => [['title' => 'Fırsat Ürünleri', 'enabled_disabled' => 'on']],
                            'product_featured'        => [['title' => 'Öne Çıkan Ürünler', 'enabled_disabled' => 'on']],
                            'banner_section'          => [['enabled_disabled' => 'on']],
                            'product_top_selling'     => [['title' => 'En Çok Satanlar', 'enabled_disabled' => 'on']],
                            'product_latest'          => [['title' => 'Yeni Ürünler', 'enabled_disabled' => 'on']],
                            'popular_product_section' => [['title' => 'Popüler Ürünler', 'enabled_disabled' => 'on']],
                            'top_stores_section'      => [['title' => 'Popüler Mağazalar', 'enabled_disabled' => 'on']],
                            'newsletters_section'     => [
                                [
                                    'title'            => 'Bültene Abone Olun',
                                    'subtitle'         => 'En yeni ürünler ve kampanyalardan haberdar olun.',
                                    'enabled_disabled' => 'on',
                                ],
                            ],
                        ],
                    ],

                    'theme_login_page' => [
                        [
                            'customer' => [
                                [
                                    'title'            => 'Hoş Geldiniz!',
                                    'subtitle'         => 'Alışverişe devam etmek için giriş yapın.',
                                    'enabled_disabled' => 'on',
                                    'image_id'         => null,
                                    'img_url'          => '',
                                ],
                            ],
                            'admin' => [
                                [
                                    'title'    => 'Yönetici Girişi',
                                    'subtitle' => 'Kontrol Paneli',
                                    'image_id' => null,
                                    'img_url'  => '',
                                ],
                            ],
                        ],
                    ],

                    'theme_register_page' => [
                        [
                            'title'                        => 'Hemen Kayıt Olun!',
                            'subtitle'                     => 'Harika Bir Alışveriş Deneyimi İçin Katılın',
                            'description'                  => 'Birçok mağazadan geniş ürün yelpazesini keşfedin, güvenli alışveriş yapın ve en iyi fırsatları kaçırmayın.',
                            'terms_page_title'             => 'Kullanım Koşulları',
                            'terms_page_url'               => '/kullanim-kosullari',
                            'social_login_enable_disable'  => 'on',
                            'image_id'                     => null,
                            'img_url'                      => '',
                        ],
                    ],

                    'theme_product_details_page' => [
                        [
                            'delivery_title'              => 'Ücretsiz Kargo',
                            'delivery_subtitle'           => 'Türkiye genelinde ücretsiz kargo.',
                            'delivery_url'                => '/kargo-ve-teslimat',
                            'delivery_enabled_disabled'   => 'on',
                            'refund_title'                => 'Kolay İade & Değişim',
                            'refund_subtitle'             => '30 gün içinde iade hakkı.',
                            'refund_url'                  => '/iade-ve-degisim',
                            'refund_enabled_disabled'     => 'on',
                            'related_title'               => 'Benzer Ürünler',
                        ],
                    ],

                    'theme_blog_page' => [
                        [
                            'popular_title' => 'Popüler Yazılar',
                            'related_title' => 'İlgili Yazılar',
                        ],
                    ],
                ],
            ],
        ];

        $themeTwo = SettingOption::updateOrCreate(
            ['option_name' => 'theme_two'],
            [
                'option_value' => json_encode($themeTwoData),
                'autoload'     => true,
            ],
        );

        // ── Theme Two — English Translation (via Translation model) ──────
        $this->seedTranslation($themeTwo->id, 'en', $enThemePages);

        $this->command->info('ThemeSeeder: theme_two (Classic Theme) seeded with EN translation.');
    }

    /**
     * Create or update a Translation record for the given SettingOption.
     */
    private function seedTranslation(int $settingOptionId, string $language, array $themePages): void
    {
        if (!Schema::hasTable('translations')) {
            $this->command->warn('ThemeSeeder: translations table does not exist. Skipping translations...');
            return;
        }

        $translationValue = [
            'theme_pages' => $themePages,
        ];

        Translation::updateOrCreate(
            [
                'translatable_type' => 'App\Models\SettingOption',
                'translatable_id'   => $settingOptionId,
                'language'          => $language,
                'key'               => 'theme_data',
            ],
            [
                'value' => json_encode($translationValue),
            ],
        );
    }
}
