<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            // ============ HOME PAGE BANNERS (6 banners: 1 hero + 3 grid + 2 grid) ============

            // 1) Hero — full-width CTA
            [
                'tr' => [
                    'title' => 'Online Mağazanı Bugün Aç',
                    'description' => 'Teknik bilgi gerektirmez. Sadece ürünlerin, markan ve platformumuz yeterli.',
                    'button_text' => 'Hemen Başla',
                ],
                'en' => [
                    'title' => 'Launch Your Online Store Today',
                    'description' => 'No tech skills needed. Just your products, your brand, and our platform.',
                    'button_text' => 'Shop Now',
                ],
                'theme_name' => 'theme_one',
                'title_color' => '#1E293B',
                'description_color' => '#64748B',
                'background_color' => '#EEF2F7',
                'background_image' => '',
                'thumbnail_image' => '/images/banner-illustration.png',
                'button_text_color' => '#ffffff',
                'button_hover_color' => '#303F9F',
                'button_color' => '#3F51B5',
                'redirect_url' => '/satici-basvuru',
                'location' => 'home_page',
                'type' => 'banner_one',
            ],

            // 2) 3-grid — Günlük İhtiyaçlar (green)
            [
                'tr' => [
                    'title' => 'Günlük İhtiyaçlar, Her Zaman Taze',
                    'description' => 'Güvenilir yerel satıcılardan kaliteli ürünler kapınıza gelsin.',
                    'button_text' => 'Hemen Al',
                ],
                'en' => [
                    'title' => 'Everyday Essentials, Always Fresh',
                    'description' => 'Get high-quality groceries delivered fast from trusted local vendors.',
                    'button_text' => 'Shop Now',
                ],
                'theme_name' => 'theme_one',
                'title_color' => '#2E7D32',
                'description_color' => '#558B2F',
                'background_color' => '#E8F5E9',
                'background_image' => '',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
                'button_text_color' => '#ffffff',
                'button_hover_color' => '#2E7D32',
                'button_color' => '#43A047',
                'redirect_url' => '/ara?sort=popular',
                'location' => 'home_page',
                'type' => 'banner_one',
            ],

            // 3) 3-grid — Sağlık Desteği (orange)
            [
                'tr' => [
                    'title' => 'Sağlık Desteği Artık Çok Kolay',
                    'description' => 'Güvenli, sertifikalı ürünlerle sağlığınızı koruyun.',
                    'button_text' => 'Hemen Al',
                ],
                'en' => [
                    'title' => 'Health Support Made Easy',
                    'description' => 'Safe, certified medicines with fast delivery at your convenience.',
                    'button_text' => 'Shop Now',
                ],
                'theme_name' => 'theme_one',
                'title_color' => '#E65100',
                'description_color' => '#BF360C',
                'background_color' => '#FFF3E0',
                'background_image' => '',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
                'button_text_color' => '#ffffff',
                'button_hover_color' => '#E65100',
                'button_color' => '#FB8C00',
                'redirect_url' => '/ara?sort=popular',
                'location' => 'home_page',
                'type' => 'banner_one',
            ],

            // 4) 3-grid — Moda (pink)
            [
                'tr' => [
                    'title' => 'Şık Görünüm, Günlük Konfor',
                    'description' => 'Konfor ve şıklığı bir arada sunan geniş giyim koleksiyonunu keşfedin.',
                    'button_text' => 'Hemen Al',
                ],
                'en' => [
                    'title' => 'Trendy Looks, Everyday Comfort',
                    'description' => 'Discover a wide collection of everyday outfits crafted for comfort and style.',
                    'button_text' => 'Shop Now',
                ],
                'theme_name' => 'theme_one',
                'title_color' => '#AD1457',
                'description_color' => '#C2185B',
                'background_color' => '#FCE4EC',
                'background_image' => '',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400',
                'button_text_color' => '#ffffff',
                'button_hover_color' => '#AD1457',
                'button_color' => '#E91E63',
                'redirect_url' => '/ara?sort=newest',
                'location' => 'home_page',
                'type' => 'banner_one',
            ],

            // 5) 2-grid — Sezon Stili (green)
            [
                'tr' => [
                    'title' => 'Her Sezon İçin Yeni Stil',
                    'description' => 'Modada %50\'ye varan indirimler',
                    'button_text' => 'Hemen Al',
                ],
                'en' => [
                    'title' => 'Redefining Style for Every Season',
                    'description' => 'Up to 50% Sale Fashion',
                    'button_text' => 'Buy Now',
                ],
                'theme_name' => 'theme_one',
                'title_color' => '#33691E',
                'description_color' => '#558B2F',
                'background_color' => '#E8F5E9',
                'background_image' => '',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400',
                'button_text_color' => '#ffffff',
                'button_hover_color' => '#33691E',
                'button_color' => '#2E7D32',
                'redirect_url' => '/ara?sort=best_selling',
                'location' => 'home_page',
                'type' => 'banner_one',
            ],

            // 6) 2-grid — Alışveriş Tutkunları (beige)
            [
                'tr' => [
                    'title' => 'Alışveriş Tutkunları İçin Buradayız',
                    'description' => 'Ekstra %50 İndirim Fırsatı',
                    'button_text' => 'Hemen Al',
                ],
                'en' => [
                    'title' => 'We Are Here for Shopping Lovers',
                    'description' => 'Get Extra 50% OFF',
                    'button_text' => 'Shop Now',
                ],
                'theme_name' => 'theme_one',
                'title_color' => '#4E342E',
                'description_color' => '#6D4C41',
                'background_color' => '#FFF8E1',
                'background_image' => '',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
                'button_text_color' => '#ffffff',
                'button_hover_color' => '#4E342E',
                'button_color' => '#6D4C41',
                'redirect_url' => '/ara?sort=featured',
                'location' => 'home_page',
                'type' => 'banner_one',
            ],
        ];

        DB::transaction(function () use ($banners) {
            // Mevcut banner ve translationları temizle
            DB::table('translations')
                ->where('translatable_type', 'App\\Models\\Banner')
                ->delete();
            DB::table('banners')->delete();

            foreach ($banners as $banner) {
                $bannerId = DB::table('banners')->insertGetId([
                    'theme_name' => $banner['theme_name'],
                    'user_id' => 1,
                    'store_id' => null,
                    'title' => $banner['tr']['title'],
                    'title_color' => $banner['title_color'],
                    'description' => $banner['tr']['description'],
                    'description_color' => $banner['description_color'],
                    'background_image' => $banner['background_image'],
                    'background_color' => $banner['background_color'],
                    'thumbnail_image' => $banner['thumbnail_image'],
                    'button_text' => $banner['tr']['button_text'],
                    'button_text_color' => $banner['button_text_color'],
                    'button_hover_color' => $banner['button_hover_color'],
                    'button_color' => $banner['button_color'],
                    'redirect_url' => $banner['redirect_url'],
                    'location' => $banner['location'],
                    'type' => $banner['type'],
                    'status' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // TR, EN ve DF translations
                foreach (['df', 'tr', 'en'] as $lang) {
                    $source = $lang === 'df' ? 'tr' : $lang;
                    $this->insertTranslation($bannerId, $lang, 'title', $banner[$source]['title']);
                    $this->insertTranslation($bannerId, $lang, 'description', $banner[$source]['description']);
                    $this->insertTranslation($bannerId, $lang, 'button_text', $banner[$source]['button_text']);
                }
            }
        });

        echo "Banners seeded successfully! Total: " . count($banners) . "\n";
    }

    private function insertTranslation(int $bannerId, string $lang, string $key, string $value): void
    {
        DB::table('translations')->insert([
            'translatable_id' => $bannerId,
            'translatable_type' => 'App\\Models\\Banner',
            'language' => $lang,
            'key' => $key,
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
