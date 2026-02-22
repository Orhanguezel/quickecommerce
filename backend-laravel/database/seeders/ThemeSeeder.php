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

        $themeOnePopupTokens = [
            'surface' => '#F6F9FE',
            'text' => '#1E293B',
            'button_bg' => '#0E5ABC',
            'button_text' => '#FFFFFF',
        ];

        // ── English theme pages data (shared by both themes) ──────────────
        $enThemePages = [
            [
                'theme_home_page' => [
                    [
                        'section_order'           => ['slider', 'category', 'flash_sale', 'product_featured', 'banner_section', 'product_latest', 'product_top_selling', 'popular_product_section', 'blog_section', 'top_stores_section', 'newsletters_section', 'all_products_section'],
                        'layout_blocks'          => [
                            ['id' => 'slider__1', 'type' => 'slider', 'instance' => 1],
                            ['id' => 'flash_sale__1', 'type' => 'flash_sale', 'instance' => 1, 'config' => ['flash_sale_span' => 6]],
                            ['id' => 'flash_sale__2', 'type' => 'flash_sale', 'instance' => 2, 'config' => ['flash_sale_span' => 6]],
                            ['id' => 'category__1', 'type' => 'category', 'instance' => 1],
                            ['id' => 'product_featured__1', 'type' => 'product_featured', 'instance' => 1],
                            ['id' => 'banner_section__1', 'type' => 'banner_section', 'instance' => 1, 'config' => ['banner_span' => 4]],
                            ['id' => 'banner_section__2', 'type' => 'banner_section', 'instance' => 2, 'config' => ['banner_span' => 4]],
                            ['id' => 'banner_section__3', 'type' => 'banner_section', 'instance' => 3, 'config' => ['banner_span' => 4]],
                            ['id' => 'product_latest__1', 'type' => 'product_latest', 'instance' => 1],
                            ['id' => 'product_top_selling__1', 'type' => 'product_top_selling', 'instance' => 1],
                            ['id' => 'popular_product_section__1', 'type' => 'popular_product_section', 'instance' => 1],
                            ['id' => 'blog_section__1', 'type' => 'blog_section', 'instance' => 1, 'config' => ['blog_span' => 4]],
                            ['id' => 'top_stores_section__1', 'type' => 'top_stores_section', 'instance' => 1, 'config' => ['top_stores_span' => 12]],
                            ['id' => 'newsletters_section__1', 'type' => 'newsletters_section', 'instance' => 1],
                            ['id' => 'all_products_section__1', 'type' => 'all_products_section', 'instance' => 1],
                        ],
                        'slider'                  => [['enabled_disabled' => 'on']],
                        'category'                => [['title' => 'Categories', 'enabled_disabled' => 'on']],
                        'flash_sale'              => [['title' => 'Flash Sale', 'subtitle' => 'Limited time deals — don\'t miss out!', 'enabled_disabled' => 'on']],
                        'flash_sale_products'     => [['title' => 'Flash Sale Products', 'enabled_disabled' => 'on']],
                        'product_featured'        => [['title' => 'Featured Products', 'enabled_disabled' => 'on']],
                        'banner_section'          => [['enabled_disabled' => 'on']],
                        'product_top_selling'     => [['title' => 'Top Selling', 'enabled_disabled' => 'on']],
                        'product_latest'          => [['title' => 'New Products', 'enabled_disabled' => 'on']],
                        'popular_product_section' => [['title' => 'Popular Products', 'enabled_disabled' => 'on']],
                        'blog_section'            => [['title' => 'Blog', 'enabled_disabled' => 'on']],
                        'top_stores_section'      => [['title' => 'Popular Stores', 'enabled_disabled' => 'on']],
                        'newsletters_section'     => [
                            [
                                'title'            => 'Subscribe to Newsletter',
                                'subtitle'         => 'Stay updated with the latest products and promotions.',
                                'enabled_disabled' => 'on',
                            ],
                        ],
                        'all_products_section'    => [
                            [
                                'title'            => 'All Products',
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
                        'popular_posts_section' => [
                            ['enabled_disabled' => 'on', 'column_span' => 4],
                        ],
                        'related_posts_section' => [
                            ['enabled_disabled' => 'on', 'column_span' => 4],
                        ],
                        'list_toolbar_section' => [
                            ['enabled_disabled' => 'on'],
                        ],
                        'posts_grid_section' => [
                            ['enabled_disabled' => 'on', 'column_span' => 4],
                        ],
                    ],
                ],
                'theme_popup_settings' => [
                    [
                        'id' => 'popup_top_free_shipping',
                        'enabled_disabled' => 'on',
                        'title' => 'Free Shipping',
                        'subtitle' => 'Free shipping on orders over 1000 TL',
                        'button_text' => 'Shop Now',
                        'button_url' => '/en/urunler',
                        'image_id' => null,
                        'img_url' => '',
                        'image_url' => '',
                        'coupon_code' => '',
                        'sort_order' => 1,
                        'delay_seconds' => 1,
                        'frequency_days' => 1,
                        'page_target' => 'all',
                        'display_type' => 'top_bar',
                        'text_behavior' => 'marquee',
                        'popup_bg_color' => $themeOnePopupTokens['surface'],
                        'popup_text_color' => $themeOnePopupTokens['text'],
                        'popup_button_bg_color' => $themeOnePopupTokens['button_bg'],
                        'popup_button_text_color' => $themeOnePopupTokens['button_text'],
                    ],
                    [
                        'id' => 'popup_modal_welcome',
                        'enabled_disabled' => 'on',
                        'title' => 'Welcome Offer',
                        'subtitle' => 'Get 10% discount on your first order.',
                        'button_text' => 'View Campaigns',
                        'button_url' => '/en/kategoriler',
                        'image_id' => null,
                        'img_url' => 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80',
                        'image_url' => 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80',
                        'coupon_code' => 'WELCOME10',
                        'sort_order' => 2,
                        'delay_seconds' => 3,
                        'frequency_days' => 3,
                        'page_target' => 'home',
                        'display_type' => 'modal_center',
                        'text_behavior' => 'static',
                        'popup_bg_color' => '#1E3A8A',
                        'popup_text_color' => '#E0E7FF',
                        'popup_button_bg_color' => '#F59E0B',
                        'popup_button_text_color' => '#111827',
                    ],
                    [
                        'id' => 'popup_bottom_coupon',
                        'enabled_disabled' => 'on',
                        'title' => 'Limited Coupon',
                        'subtitle' => 'Use coupon code at checkout.',
                        'button_text' => 'Go to Cart',
                        'button_url' => '/en/sepet',
                        'image_id' => null,
                        'img_url' => '',
                        'image_url' => '',
                        'coupon_code' => 'SAVE75',
                        'sort_order' => 3,
                        'delay_seconds' => 2,
                        'frequency_days' => 1,
                        'page_target' => 'all',
                        'display_type' => 'bottom_bar',
                        'text_behavior' => 'static',
                        'popup_bg_color' => $themeOnePopupTokens['surface'],
                        'popup_text_color' => $themeOnePopupTokens['text'],
                        'popup_button_bg_color' => $themeOnePopupTokens['button_bg'],
                        'popup_button_text_color' => $themeOnePopupTokens['button_text'],
                    ],
                    [
                        'id' => 'popup_top_weekend_sale',
                        'enabled_disabled' => 'off',
                        'title' => 'Weekend Opportunity',
                        'subtitle' => 'Extra 15% off selected products.',
                        'button_text' => 'See Products',
                        'button_url' => '/en/kategori/kamp-outdoor',
                        'image_id' => null,
                        'img_url' => '',
                        'image_url' => '',
                        'coupon_code' => '',
                        'sort_order' => 4,
                        'delay_seconds' => 4,
                        'frequency_days' => 1,
                        'page_target' => 'all',
                        'display_type' => 'top_bar',
                        'text_behavior' => 'marquee',
                        'popup_bg_color' => $themeOnePopupTokens['surface'],
                        'popup_text_color' => $themeOnePopupTokens['text'],
                        'popup_button_bg_color' => $themeOnePopupTokens['button_bg'],
                        'popup_button_text_color' => $themeOnePopupTokens['button_text'],
                    ],
                    [
                        'id' => 'popup_modal_member_club',
                        'enabled_disabled' => 'off',
                        'title' => 'Join Member Club',
                        'subtitle' => 'Collect points and get exclusive discounts.',
                        'button_text' => 'Join Now',
                        'button_url' => '/en/kayit',
                        'image_id' => null,
                        'img_url' => 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80',
                        'image_url' => 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80',
                        'coupon_code' => '',
                        'sort_order' => 5,
                        'delay_seconds' => 6,
                        'frequency_days' => 7,
                        'page_target' => 'home',
                        'display_type' => 'modal_center',
                        'text_behavior' => 'static',
                        'popup_bg_color' => '#0F172A',
                        'popup_text_color' => '#E2E8F0',
                        'popup_button_bg_color' => '#FFFFFF',
                        'popup_button_text_color' => '#0F172A',
                    ],
                    [
                        'id' => 'popup_bottom_app_download',
                        'enabled_disabled' => 'off',
                        'title' => 'Download Mobile App',
                        'subtitle' => 'Track orders and catch app-only campaigns.',
                        'button_text' => 'Install App',
                        'button_url' => '/en/urunler',
                        'image_id' => null,
                        'img_url' => '',
                        'image_url' => '',
                        'coupon_code' => '',
                        'sort_order' => 6,
                        'delay_seconds' => 5,
                        'frequency_days' => 3,
                        'page_target' => 'all',
                        'display_type' => 'bottom_bar',
                        'text_behavior' => 'static',
                        'popup_bg_color' => $themeOnePopupTokens['surface'],
                        'popup_text_color' => $themeOnePopupTokens['text'],
                        'popup_button_bg_color' => $themeOnePopupTokens['button_bg'],
                        'popup_button_text_color' => $themeOnePopupTokens['button_text'],
                    ],
                ],
                'theme_side_banner_settings' => [
                    [
                        'id' => 'left_sticky_banner_1',
                        'enabled_disabled' => 'on',
                        'title' => 'Left Sticky Banner',
                        'link_url' => '',
                        'open_in_new_tab' => 'off',
                        'page_target' => 'all',
                        'width_px' => 240,
                        'top_offset_px' => 200,
                        'banner_order' => 1,
                        'dismissible' => 'on',
                        'dismiss_policy' => 'days',
                        'dismiss_days' => 1,
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
                            'primary'   => '#0E5ABC',
                            'secondary' => '#0e5abc',
                        ],
                    ],
                ],
            ],

            'theme_header' => [
                [
                    'header_number'         => '01',
                    // Light mode
                    'row1_bg'               => '#0E5ABC',
                    'row1_text'             => '#FFFFFF',
                    'row2_bg'               => '#FFFFFF',
                    'row3_bg'               => '#F4F8FE',
                    'row3_text'             => '#1E293B',
                    'row3_button_bg'        => '#0E5ABC',
                    'row3_button_text'      => '#FFFFFF',
                    // Dark mode
                    'dark_row1_bg'          => '#0A121C',
                    'dark_row1_text'        => '#FFFFFF',
                    'dark_row2_bg'          => '#152841',
                    'dark_row3_bg'          => '#152841',
                    'dark_row3_text'        => '#E2E8F0',
                    'dark_row3_button_bg'   => '#1E3A5F',
                    'dark_row3_button_text' => '#FFFFFF',
                ],
            ],

            'theme_footer' => [
                [
                    'background_color'      => '#0D166D',
                    'text_color'            => '#ffffff',
                    'dark_background_color' => '#11253C',
                    'dark_text_color'       => '#ffffff',
                    'layout_columns'        => 4,
                ],
            ],

            'theme_pages' => [
                [
                    'theme_home_page' => [
                    [
                        'section_order'           => ['slider', 'category', 'flash_sale', 'product_featured', 'banner_section', 'product_latest', 'product_top_selling', 'popular_product_section', 'blog_section', 'top_stores_section', 'newsletters_section', 'all_products_section'],
                        'layout_blocks'          => [
                            ['id' => 'slider__1', 'type' => 'slider', 'instance' => 1],
                            ['id' => 'flash_sale__1', 'type' => 'flash_sale', 'instance' => 1, 'config' => ['flash_sale_span' => 6]],
                            ['id' => 'flash_sale__2', 'type' => 'flash_sale', 'instance' => 2, 'config' => ['flash_sale_span' => 6]],
                            ['id' => 'category__1', 'type' => 'category', 'instance' => 1],
                            ['id' => 'product_featured__1', 'type' => 'product_featured', 'instance' => 1],
                            ['id' => 'banner_section__1', 'type' => 'banner_section', 'instance' => 1, 'config' => ['banner_span' => 4]],
                            ['id' => 'banner_section__2', 'type' => 'banner_section', 'instance' => 2, 'config' => ['banner_span' => 4]],
                            ['id' => 'banner_section__3', 'type' => 'banner_section', 'instance' => 3, 'config' => ['banner_span' => 4]],
                            ['id' => 'product_latest__1', 'type' => 'product_latest', 'instance' => 1],
                            ['id' => 'product_top_selling__1', 'type' => 'product_top_selling', 'instance' => 1],
                            ['id' => 'popular_product_section__1', 'type' => 'popular_product_section', 'instance' => 1],
                            ['id' => 'blog_section__1', 'type' => 'blog_section', 'instance' => 1, 'config' => ['blog_span' => 4]],
                            ['id' => 'top_stores_section__1', 'type' => 'top_stores_section', 'instance' => 1, 'config' => ['top_stores_span' => 12]],
                            ['id' => 'newsletters_section__1', 'type' => 'newsletters_section', 'instance' => 1],
                            ['id' => 'all_products_section__1', 'type' => 'all_products_section', 'instance' => 1],
                        ],
                        'slider'                  => [['enabled_disabled' => 'on', 'slider_number' => '01']],
                            'category'                => [['title' => 'Kategoriler', 'enabled_disabled' => 'on']],
                            'flash_sale'              => [['title' => 'Fırsat Ürünleri', 'subtitle' => 'Sınırlı süre fırsatlarını kaçırmayın!', 'enabled_disabled' => 'on']],
                            'flash_sale_products'     => [['title' => 'Flash Satış Ürünleri', 'enabled_disabled' => 'on']],
                            'product_featured'        => [['title' => 'Öne Çıkan Ürünler', 'enabled_disabled' => 'on']],
                            'banner_section'          => [['enabled_disabled' => 'on']],
                            'product_top_selling'     => [['title' => 'En Çok Satanlar', 'enabled_disabled' => 'on']],
                            'product_latest'          => [['title' => 'Yeni Ürünler', 'enabled_disabled' => 'on']],
                            'popular_product_section' => [['title' => 'Popüler Ürünler', 'enabled_disabled' => 'on']],
                            'blog_section'            => [['title' => 'Blog', 'enabled_disabled' => 'on']],
                            'top_stores_section'      => [['title' => 'Popüler Mağazalar', 'enabled_disabled' => 'on']],
                            'newsletters_section'     => [
                                [
                                    'title'            => 'Bültene Abone Olun',
                                    'subtitle'         => 'En yeni ürünler ve kampanyalardan haberdar olun.',
                                    'enabled_disabled' => 'on',
                                ],
                            ],
                            'all_products_section'    => [
                                [
                                    'title'            => 'Tüm Ürünler',
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
                            'popular_posts_section' => [
                                ['enabled_disabled' => 'on', 'column_span' => 4],
                            ],
                            'related_posts_section' => [
                                ['enabled_disabled' => 'on', 'column_span' => 4],
                            ],
                            'list_toolbar_section' => [
                                ['enabled_disabled' => 'on'],
                            ],
                            'posts_grid_section' => [
                                ['enabled_disabled' => 'on', 'column_span' => 4],
                            ],
                        ],
                    ],
                    'theme_popup_settings' => [
                        [
                            'id' => 'popup_top_ucretsiz_kargo',
                            'enabled_disabled' => 'on',
                            'title' => 'Ücretsiz Kargo',
                            'subtitle' => '1000 TL ve üzeri siparişlerde ücretsiz teslimat.',
                            'button_text' => 'Alışverişe Başla',
                            'button_url' => 'http://localhost:3003/tr/urunler',
                            'image_id' => null,
                            'img_url' => '',
                            'image_url' => '',
                            'coupon_code' => '',
                            'sort_order' => 1,
                            'delay_seconds' => 1,
                            'frequency_days' => 1,
                            'page_target' => 'all',
                            'display_type' => 'top_bar',
                            'text_behavior' => 'marquee',
                            'popup_bg_color' => $themeOnePopupTokens['surface'],
                            'popup_text_color' => $themeOnePopupTokens['text'],
                            'popup_button_bg_color' => $themeOnePopupTokens['button_bg'],
                            'popup_button_text_color' => $themeOnePopupTokens['button_text'],
                        ],
                        [
                            'id' => 'popup_modal_hosgeldin',
                            'enabled_disabled' => 'on',
                            'title' => 'Hoş Geldin Fırsatı',
                            'subtitle' => 'İlk siparişine özel %10 indirim fırsatını kaçırma.',
                            'button_text' => 'Kampanyaları Gör',
                            'button_url' => 'http://localhost:3003/tr/kategoriler',
                            'image_id' => null,
                            'img_url' => 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80',
                            'image_url' => 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80',
                            'coupon_code' => 'HOSGELDIN10',
                            'sort_order' => 2,
                            'delay_seconds' => 3,
                            'frequency_days' => 3,
                            'page_target' => 'home',
                            'display_type' => 'modal_center',
                            'text_behavior' => 'static',
                            'popup_bg_color' => '#1E3A8A',
                            'popup_text_color' => '#E0E7FF',
                            'popup_button_bg_color' => '#F59E0B',
                            'popup_button_text_color' => '#111827',
                        ],
                        [
                            'id' => 'popup_bottom_kupon',
                            'enabled_disabled' => 'on',
                            'title' => 'Sınırlı Süreli Kupon',
                            'subtitle' => 'Ödeme adımında kupon kodunu uygulamayı unutma.',
                            'button_text' => 'Sepete Git',
                            'button_url' => '/tr/sepet',
                            'image_id' => null,
                            'img_url' => '',
                            'image_url' => '',
                            'coupon_code' => 'SEPET75',
                            'sort_order' => 3,
                            'delay_seconds' => 2,
                            'frequency_days' => 1,
                            'page_target' => 'all',
                            'display_type' => 'bottom_bar',
                            'text_behavior' => 'static',
                            'popup_bg_color' => $themeOnePopupTokens['surface'],
                            'popup_text_color' => $themeOnePopupTokens['text'],
                            'popup_button_bg_color' => $themeOnePopupTokens['button_bg'],
                            'popup_button_text_color' => $themeOnePopupTokens['button_text'],
                        ],
                        [
                            'id' => 'popup_top_haftasonu',
                            'enabled_disabled' => 'off',
                            'title' => 'Hafta Sonu Fırsatı',
                            'subtitle' => 'Seçili ürünlerde ekstra %15 indirim seni bekliyor.',
                            'button_text' => 'Ürünleri İncele',
                            'button_url' => 'http://localhost:3003/tr/kategori/kamp-outdoor',
                            'image_id' => null,
                            'img_url' => '',
                            'image_url' => '',
                            'coupon_code' => '',
                            'sort_order' => 4,
                            'delay_seconds' => 4,
                            'frequency_days' => 1,
                            'page_target' => 'all',
                            'display_type' => 'top_bar',
                            'text_behavior' => 'marquee',
                            'popup_bg_color' => $themeOnePopupTokens['surface'],
                            'popup_text_color' => $themeOnePopupTokens['text'],
                            'popup_button_bg_color' => $themeOnePopupTokens['button_bg'],
                            'popup_button_text_color' => $themeOnePopupTokens['button_text'],
                        ],
                        [
                            'id' => 'popup_modal_uyelik',
                            'enabled_disabled' => 'off',
                            'title' => 'Üyelik Kulübüne Katıl',
                            'subtitle' => 'Puan topla, özel kampanyalara erken erişim kazan.',
                            'button_text' => 'Üye Ol',
                            'button_url' => '/tr/kayit',
                            'image_id' => null,
                            'img_url' => 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80',
                            'image_url' => 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80',
                            'coupon_code' => '',
                            'sort_order' => 5,
                            'delay_seconds' => 6,
                            'frequency_days' => 7,
                            'page_target' => 'home',
                            'display_type' => 'modal_center',
                            'text_behavior' => 'static',
                            'popup_bg_color' => '#0F172A',
                            'popup_text_color' => '#E2E8F0',
                            'popup_button_bg_color' => '#FFFFFF',
                            'popup_button_text_color' => '#0F172A',
                        ],
                        [
                            'id' => 'popup_bottom_mobiluygulama',
                            'enabled_disabled' => 'off',
                            'title' => 'Mobil Uygulamayı İndir',
                            'subtitle' => 'Siparişlerini kolay takip et, uygulamaya özel fırsatları yakala.',
                            'button_text' => 'Uygulamayı Gör',
                            'button_url' => 'http://localhost:3003/tr/urunler',
                            'image_id' => null,
                            'img_url' => '',
                            'image_url' => '',
                            'coupon_code' => '',
                            'sort_order' => 6,
                            'delay_seconds' => 5,
                            'frequency_days' => 3,
                            'page_target' => 'all',
                            'display_type' => 'bottom_bar',
                            'text_behavior' => 'static',
                            'popup_bg_color' => $themeOnePopupTokens['surface'],
                            'popup_text_color' => $themeOnePopupTokens['text'],
                            'popup_button_bg_color' => $themeOnePopupTokens['button_bg'],
                            'popup_button_text_color' => $themeOnePopupTokens['button_text'],
                        ],
                    ],
                    'theme_side_banner_settings' => [
                        [
                            'id' => 'left_sticky_banner_1',
                            'enabled_disabled' => 'on',
                            'title' => 'Sol Sticky Banner',
                            'link_url' => '',
                            'open_in_new_tab' => 'off',
                            'page_target' => 'all',
                            'width_px' => 240,
                            'top_offset_px' => 200,
                            'banner_order' => 1,
                        'dismissible' => 'on',
                        'dismiss_policy' => 'days',
                        'dismiss_days' => 1,
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
                    'header_number'         => '02',
                    // Light mode
                    'row1_bg'               => '#FFFFFF',
                    'row1_text'             => '#1E293B',
                    'row2_bg'               => '#FFFFFF',
                    'row3_bg'               => '#FFFFFF',
                    'row3_text'             => '#1E293B',
                    'row3_button_bg'        => '#10B981',
                    'row3_button_text'      => '#FFFFFF',
                    // Dark mode
                    'dark_row1_bg'          => '#0A121C',
                    'dark_row1_text'        => '#E2E8F0',
                    'dark_row2_bg'          => '#152841',
                    'dark_row3_bg'          => '#152841',
                    'dark_row3_text'        => '#E2E8F0',
                    'dark_row3_button_bg'   => '#059669',
                    'dark_row3_button_text' => '#FFFFFF',
                ],
            ],

            'theme_footer' => [
                [
                    'background_color'      => '#1E293B',
                    'text_color'            => '#ffffff',
                    'dark_background_color' => '#11253C',
                    'dark_text_color'       => '#ffffff',
                    'layout_columns'        => 4,
                ],
            ],

            'theme_pages' => [
                [
                    'theme_home_page' => [
                    [
                        'section_order'           => ['slider', 'category', 'flash_sale', 'product_featured', 'banner_section', 'product_latest', 'product_top_selling', 'popular_product_section', 'blog_section', 'top_stores_section', 'newsletters_section', 'all_products_section'],
                        'layout_blocks'          => [
                            ['id' => 'slider__1', 'type' => 'slider', 'instance' => 1],
                            ['id' => 'flash_sale__1', 'type' => 'flash_sale', 'instance' => 1, 'config' => ['flash_sale_span' => 6]],
                            ['id' => 'flash_sale__2', 'type' => 'flash_sale', 'instance' => 2, 'config' => ['flash_sale_span' => 6]],
                            ['id' => 'category__1', 'type' => 'category', 'instance' => 1],
                            ['id' => 'product_featured__1', 'type' => 'product_featured', 'instance' => 1],
                            ['id' => 'banner_section__1', 'type' => 'banner_section', 'instance' => 1, 'config' => ['banner_span' => 4]],
                            ['id' => 'banner_section__2', 'type' => 'banner_section', 'instance' => 2, 'config' => ['banner_span' => 4]],
                            ['id' => 'banner_section__3', 'type' => 'banner_section', 'instance' => 3, 'config' => ['banner_span' => 4]],
                            ['id' => 'product_latest__1', 'type' => 'product_latest', 'instance' => 1],
                            ['id' => 'product_top_selling__1', 'type' => 'product_top_selling', 'instance' => 1],
                            ['id' => 'popular_product_section__1', 'type' => 'popular_product_section', 'instance' => 1],
                            ['id' => 'blog_section__1', 'type' => 'blog_section', 'instance' => 1, 'config' => ['blog_span' => 4]],
                            ['id' => 'top_stores_section__1', 'type' => 'top_stores_section', 'instance' => 1, 'config' => ['top_stores_span' => 12]],
                            ['id' => 'newsletters_section__1', 'type' => 'newsletters_section', 'instance' => 1],
                            ['id' => 'all_products_section__1', 'type' => 'all_products_section', 'instance' => 1],
                        ],
                        'slider'                  => [['enabled_disabled' => 'on', 'slider_number' => '02']],
                            'category'                => [['title' => 'Kategoriler', 'enabled_disabled' => 'on']],
                            'flash_sale'              => [['title' => 'Fırsat Ürünleri', 'subtitle' => 'Sınırlı süre fırsatlarını kaçırmayın!', 'enabled_disabled' => 'on']],
                            'flash_sale_products'     => [['title' => 'Flash Satış Ürünleri', 'enabled_disabled' => 'on']],
                            'product_featured'        => [['title' => 'Öne Çıkan Ürünler', 'enabled_disabled' => 'on']],
                            'banner_section'          => [['enabled_disabled' => 'on']],
                            'product_top_selling'     => [['title' => 'En Çok Satanlar', 'enabled_disabled' => 'on']],
                            'product_latest'          => [['title' => 'Yeni Ürünler', 'enabled_disabled' => 'on']],
                            'popular_product_section' => [['title' => 'Popüler Ürünler', 'enabled_disabled' => 'on']],
                            'blog_section'            => [['title' => 'Blog', 'enabled_disabled' => 'on']],
                            'top_stores_section'      => [['title' => 'Popüler Mağazalar', 'enabled_disabled' => 'on']],
                            'newsletters_section'     => [
                                [
                                    'title'            => 'Bültene Abone Olun',
                                    'subtitle'         => 'En yeni ürünler ve kampanyalardan haberdar olun.',
                                    'enabled_disabled' => 'on',
                                ],
                            ],
                            'all_products_section'    => [
                                [
                                    'title'            => 'Tüm Ürünler',
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
                            'popular_posts_section' => [
                                ['enabled_disabled' => 'on', 'column_span' => 4],
                            ],
                            'related_posts_section' => [
                                ['enabled_disabled' => 'on', 'column_span' => 4],
                            ],
                            'list_toolbar_section' => [
                                ['enabled_disabled' => 'on'],
                            ],
                            'posts_grid_section' => [
                                ['enabled_disabled' => 'on', 'column_span' => 4],
                            ],
                        ],
                    ],
                    'theme_popup_settings' => [
                        [
                            'id' => 'popup_top_ucretsiz_kargo',
                            'enabled_disabled' => 'on',
                            'title' => 'Ücretsiz Kargo',
                            'subtitle' => '1000 TL ve üzeri siparişlerde ücretsiz teslimat.',
                            'button_text' => 'Alışverişe Başla',
                            'button_url' => 'http://localhost:3003/tr/urunler',
                            'image_id' => null,
                            'img_url' => '',
                            'image_url' => '',
                            'coupon_code' => '',
                            'sort_order' => 1,
                            'delay_seconds' => 1,
                            'frequency_days' => 1,
                            'page_target' => 'all',
                            'display_type' => 'top_bar',
                            'text_behavior' => 'marquee',
                            'popup_bg_color' => $themeOnePopupTokens['surface'],
                            'popup_text_color' => $themeOnePopupTokens['text'],
                            'popup_button_bg_color' => $themeOnePopupTokens['button_bg'],
                            'popup_button_text_color' => $themeOnePopupTokens['button_text'],
                        ],
                        [
                            'id' => 'popup_modal_hosgeldin',
                            'enabled_disabled' => 'on',
                            'title' => 'Hoş Geldin Fırsatı',
                            'subtitle' => 'İlk siparişine özel %10 indirim fırsatını kaçırma.',
                            'button_text' => 'Kampanyaları Gör',
                            'button_url' => 'http://localhost:3003/tr/kategoriler',
                            'image_id' => null,
                            'img_url' => 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80',
                            'image_url' => 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80',
                            'coupon_code' => 'HOSGELDIN10',
                            'sort_order' => 2,
                            'delay_seconds' => 3,
                            'frequency_days' => 3,
                            'page_target' => 'home',
                            'display_type' => 'modal_center',
                            'text_behavior' => 'static',
                            'popup_bg_color' => '#1E3A8A',
                            'popup_text_color' => '#E0E7FF',
                            'popup_button_bg_color' => '#F59E0B',
                            'popup_button_text_color' => '#111827',
                        ],
                        [
                            'id' => 'popup_bottom_kupon',
                            'enabled_disabled' => 'on',
                            'title' => 'Sınırlı Süreli Kupon',
                            'subtitle' => 'Ödeme adımında kupon kodunu uygulamayı unutma.',
                            'button_text' => 'Sepete Git',
                            'button_url' => '/tr/sepet',
                            'image_id' => null,
                            'img_url' => '',
                            'image_url' => '',
                            'coupon_code' => 'SEPET75',
                            'sort_order' => 3,
                            'delay_seconds' => 2,
                            'frequency_days' => 1,
                            'page_target' => 'all',
                            'display_type' => 'bottom_bar',
                            'text_behavior' => 'static',
                            'popup_bg_color' => $themeOnePopupTokens['surface'],
                            'popup_text_color' => $themeOnePopupTokens['text'],
                            'popup_button_bg_color' => $themeOnePopupTokens['button_bg'],
                            'popup_button_text_color' => $themeOnePopupTokens['button_text'],
                        ],
                        [
                            'id' => 'popup_top_haftasonu',
                            'enabled_disabled' => 'off',
                            'title' => 'Hafta Sonu Fırsatı',
                            'subtitle' => 'Seçili ürünlerde ekstra %15 indirim seni bekliyor.',
                            'button_text' => 'Ürünleri İncele',
                            'button_url' => 'http://localhost:3003/tr/kategori/kamp-outdoor',
                            'image_id' => null,
                            'img_url' => '',
                            'image_url' => '',
                            'coupon_code' => '',
                            'sort_order' => 4,
                            'delay_seconds' => 4,
                            'frequency_days' => 1,
                            'page_target' => 'all',
                            'display_type' => 'top_bar',
                            'text_behavior' => 'marquee',
                            'popup_bg_color' => $themeOnePopupTokens['surface'],
                            'popup_text_color' => $themeOnePopupTokens['text'],
                            'popup_button_bg_color' => $themeOnePopupTokens['button_bg'],
                            'popup_button_text_color' => $themeOnePopupTokens['button_text'],
                        ],
                        [
                            'id' => 'popup_modal_uyelik',
                            'enabled_disabled' => 'off',
                            'title' => 'Üyelik Kulübüne Katıl',
                            'subtitle' => 'Puan topla, özel kampanyalara erken erişim kazan.',
                            'button_text' => 'Üye Ol',
                            'button_url' => '/tr/kayit',
                            'image_id' => null,
                            'img_url' => 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80',
                            'image_url' => 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80',
                            'coupon_code' => '',
                            'sort_order' => 5,
                            'delay_seconds' => 6,
                            'frequency_days' => 7,
                            'page_target' => 'home',
                            'display_type' => 'modal_center',
                            'text_behavior' => 'static',
                            'popup_bg_color' => '#0F172A',
                            'popup_text_color' => '#E2E8F0',
                            'popup_button_bg_color' => '#FFFFFF',
                            'popup_button_text_color' => '#0F172A',
                        ],
                        [
                            'id' => 'popup_bottom_mobiluygulama',
                            'enabled_disabled' => 'off',
                            'title' => 'Mobil Uygulamayı İndir',
                            'subtitle' => 'Siparişlerini kolay takip et, uygulamaya özel fırsatları yakala.',
                            'button_text' => 'Uygulamayı Gör',
                            'button_url' => 'http://localhost:3003/tr/urunler',
                            'image_id' => null,
                            'img_url' => '',
                            'image_url' => '',
                            'coupon_code' => '',
                            'sort_order' => 6,
                            'delay_seconds' => 5,
                            'frequency_days' => 3,
                            'page_target' => 'all',
                            'display_type' => 'bottom_bar',
                            'text_behavior' => 'static',
                            'popup_bg_color' => $themeOnePopupTokens['surface'],
                            'popup_text_color' => $themeOnePopupTokens['text'],
                            'popup_button_bg_color' => $themeOnePopupTokens['button_bg'],
                            'popup_button_text_color' => $themeOnePopupTokens['button_text'],
                        ],
                    ],
                    'theme_side_banner_settings' => [
                        [
                            'id' => 'left_sticky_banner_1',
                            'enabled_disabled' => 'on',
                            'title' => 'Sol Sticky Banner',
                            'link_url' => '',
                            'open_in_new_tab' => 'off',
                            'page_target' => 'all',
                            'width_px' => 240,
                            'top_offset_px' => 200,
                            'banner_order' => 1,
                        'dismissible' => 'on',
                        'dismiss_policy' => 'days',
                        'dismiss_days' => 1,
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
