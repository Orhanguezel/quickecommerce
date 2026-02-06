<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            // ============ HOME PAGE BANNERS ============
            [
                'tr' => [
                    'title' => 'Spor Hayatına Güç Kat',
                    'description' => 'En kaliteli spor ekipmanları ve giyim ürünleri burada. Performansını artır, hedeflerine ulaş!',
                    'button_text' => 'Alışverişe Başla',
                ],
                'en' => [
                    'title' => 'Power Up Your Sports Life',
                    'description' => 'The highest quality sports equipment and apparel here. Boost your performance, reach your goals!',
                    'button_text' => 'Start Shopping',
                ],
                'theme_name' => 'theme_one',
                'title_color' => '#ffffff',
                'description_color' => '#f5f5f5',
                'background_color' => '#1565c0',
                'background_image' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600',
                'button_text_color' => '#1565c0',
                'button_hover_color' => '#0d47a1',
                'button_color' => '#ffffff',
                'redirect_url' => '/products',
                'location' => 'home_page',
                'type' => 'banner_one',
            ],
            [
                'tr' => [
                    'title' => 'Yeni Sezon Koleksiyonu',
                    'description' => 'Nike, Adidas, Puma ve daha fazlası. 2024 yaz koleksiyonu şimdi mağazalarda!',
                    'button_text' => 'Keşfet',
                ],
                'en' => [
                    'title' => 'New Season Collection',
                    'description' => 'Nike, Adidas, Puma and more. 2024 summer collection now in stores!',
                    'button_text' => 'Explore',
                ],
                'theme_name' => 'theme_one',
                'title_color' => '#212121',
                'description_color' => '#424242',
                'background_color' => '#ffc107',
                'background_image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600',
                'button_text_color' => '#ffffff',
                'button_hover_color' => '#333333',
                'button_color' => '#212121',
                'redirect_url' => '/products?category=new-arrivals',
                'location' => 'home_page',
                'type' => 'banner_two',
            ],
            [
                'tr' => [
                    'title' => 'Outdoor Macerası Başlıyor',
                    'description' => 'Kamp, trekking, doğa yürüyüşü için ihtiyacın olan her şey. Doğaya hazır mısın?',
                    'button_text' => 'Ekipmanları Gör',
                ],
                'en' => [
                    'title' => 'Outdoor Adventure Begins',
                    'description' => 'Everything you need for camping, trekking, hiking. Are you ready for nature?',
                    'button_text' => 'View Equipment',
                ],
                'theme_name' => 'theme_two',
                'title_color' => '#ffffff',
                'description_color' => '#e8f5e9',
                'background_color' => '#2e7d32',
                'background_image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1400',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600',
                'button_text_color' => '#2e7d32',
                'button_hover_color' => '#1b5e20',
                'button_color' => '#ffffff',
                'redirect_url' => '/products?category=outdoor',
                'location' => 'home_page',
                'type' => 'banner_one',
            ],

            // ============ CATEGORY BANNERS ============
            [
                'tr' => [
                    'title' => 'Supplement & Protein',
                    'description' => 'Antrenman öncesi, sonrası ve günlük takviyeler. Vücudunu besle, gücüne güç kat!',
                    'button_text' => 'Ürünleri İncele',
                ],
                'en' => [
                    'title' => 'Supplement & Protein',
                    'description' => 'Pre-workout, post-workout and daily supplements. Fuel your body, boost your power!',
                    'button_text' => 'Browse Products',
                ],
                'theme_name' => 'theme_one',
                'title_color' => '#ffffff',
                'description_color' => '#fff3e0',
                'background_color' => '#e65100',
                'background_image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=1400',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600',
                'button_text_color' => '#e65100',
                'button_hover_color' => '#bf360c',
                'button_color' => '#ffffff',
                'redirect_url' => '/products?category=supplements',
                'location' => 'category_page',
                'type' => 'banner_one',
            ],
            [
                'tr' => [
                    'title' => 'Fitness Giyim',
                    'description' => 'Rahat, şık ve performans odaklı spor giyim. Her antrenman için mükemmel uyum.',
                    'button_text' => 'Koleksiyonu Gör',
                ],
                'en' => [
                    'title' => 'Fitness Apparel',
                    'description' => 'Comfortable, stylish and performance-focused sportswear. Perfect fit for every workout.',
                    'button_text' => 'View Collection',
                ],
                'theme_name' => 'theme_two',
                'title_color' => '#ffffff',
                'description_color' => '#fce4ec',
                'background_color' => '#ad1457',
                'background_image' => 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=1400',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
                'button_text_color' => '#ad1457',
                'button_hover_color' => '#880e4f',
                'button_color' => '#ffffff',
                'redirect_url' => '/products?category=fitness-apparel',
                'location' => 'category_page',
                'type' => 'banner_two',
            ],

            // ============ PROMOTIONAL BANNERS ============
            [
                'tr' => [
                    'title' => 'Ücretsiz Kargo',
                    'description' => '500₺ ve üzeri alışverişlerde Türkiye geneli ücretsiz kargo fırsatı!',
                    'button_text' => 'Detaylar',
                ],
                'en' => [
                    'title' => 'Free Shipping',
                    'description' => 'Free shipping across Turkey on orders over 500₺!',
                    'button_text' => 'Details',
                ],
                'theme_name' => 'theme_one',
                'title_color' => '#ffffff',
                'description_color' => '#e3f2fd',
                'background_color' => '#0d47a1',
                'background_image' => 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1400',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?w=600',
                'button_text_color' => '#0d47a1',
                'button_hover_color' => '#1565c0',
                'button_color' => '#ffffff',
                'redirect_url' => '/shipping-info',
                'location' => 'promotional',
                'type' => 'banner_one',
            ],
            [
                'tr' => [
                    'title' => 'Akıllı Saatler',
                    'description' => 'Garmin, Polar, Apple Watch - Antrenmanlarını takip et, sağlığını kontrol altında tut.',
                    'button_text' => 'Saatleri Keşfet',
                ],
                'en' => [
                    'title' => 'Smart Watches',
                    'description' => 'Garmin, Polar, Apple Watch - Track your workouts, keep your health in check.',
                    'button_text' => 'Discover Watches',
                ],
                'theme_name' => 'theme_two',
                'title_color' => '#212121',
                'description_color' => '#616161',
                'background_color' => '#f5f5f5',
                'background_image' => 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1400',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600',
                'button_text_color' => '#ffffff',
                'button_hover_color' => '#1565c0',
                'button_color' => '#0d47a1',
                'redirect_url' => '/products?category=smart-watches',
                'location' => 'promotional',
                'type' => 'banner_two',
            ],
            [
                'tr' => [
                    'title' => 'Bisiklet Dünyası',
                    'description' => 'Yol, dağ ve şehir bisikletleri. Pedal çevir, özgürlüğü hisset!',
                    'button_text' => 'Bisikletleri Gör',
                ],
                'en' => [
                    'title' => 'Bicycle World',
                    'description' => 'Road, mountain and city bikes. Pedal on, feel the freedom!',
                    'button_text' => 'View Bikes',
                ],
                'theme_name' => 'theme_one',
                'title_color' => '#ffffff',
                'description_color' => '#b2dfdb',
                'background_color' => '#00695c',
                'background_image' => 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1400',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600',
                'button_text_color' => '#00695c',
                'button_hover_color' => '#004d40',
                'button_color' => '#ffffff',
                'redirect_url' => '/products?category=bicycles',
                'location' => 'home_page',
                'type' => 'banner_two',
            ],

            // ============ FOOTER/SIDE BANNERS ============
            [
                'tr' => [
                    'title' => 'Spor Ayakkabıları',
                    'description' => 'Koşu, basketbol, futbol - Her spora özel ayakkabılar.',
                    'button_text' => 'Hemen Al',
                ],
                'en' => [
                    'title' => 'Sports Shoes',
                    'description' => 'Running, basketball, football - Shoes for every sport.',
                    'button_text' => 'Buy Now',
                ],
                'theme_name' => 'theme_two',
                'title_color' => '#ffffff',
                'description_color' => '#ffcdd2',
                'background_color' => '#c62828',
                'background_image' => 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1400',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600',
                'button_text_color' => '#c62828',
                'button_hover_color' => '#b71c1c',
                'button_color' => '#ffffff',
                'redirect_url' => '/products?category=sports-shoes',
                'location' => 'sidebar',
                'type' => 'banner_one',
            ],
            [
                'tr' => [
                    'title' => 'Yoga & Pilates',
                    'description' => 'Mat, blok, kemer ve daha fazlası. İç huzurunuzu bulun.',
                    'button_text' => 'Ürünleri Gör',
                ],
                'en' => [
                    'title' => 'Yoga & Pilates',
                    'description' => 'Mats, blocks, straps and more. Find your inner peace.',
                    'button_text' => 'View Products',
                ],
                'theme_name' => 'theme_one',
                'title_color' => '#ffffff',
                'description_color' => '#e1bee7',
                'background_color' => '#7b1fa2',
                'background_image' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
                'button_text_color' => '#7b1fa2',
                'button_hover_color' => '#6a1b9a',
                'button_color' => '#ffffff',
                'redirect_url' => '/products?category=yoga-pilates',
                'location' => 'sidebar',
                'type' => 'banner_two',
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
