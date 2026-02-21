<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SliderSeeder extends Seeder
{
    public function run(): void
    {
        $sliders = [
            // ============ WEB SLIDERS ============
            [
                'tr' => [
                    'title' => 'Spor Tutkunlarına Özel',
                    'sub_title' => 'Yeni Sezon Koleksiyonu',
                    'description' => 'Nike, Adidas, Puma ve daha fazlası. En yeni spor giyim ve ayakkabı modelleri şimdi stoklarımızda!',
                    'button_text' => 'Alışverişe Başla',
                ],
                'en' => [
                    'title' => 'For Sports Enthusiasts',
                    'sub_title' => 'New Season Collection',
                    'description' => 'Nike, Adidas, Puma and more. The newest sportswear and shoe models now in stock!',
                    'button_text' => 'Start Shopping',
                ],
                'platform' => 'web',
                'title_color' => '#ffffff',
                'sub_title_color' => '#ffd54f',
                'description_color' => '#f5f5f5',
                'bg_color' => '#1565c0',
                'image' => 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600',
                'bg_image' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920',
                'button_text_color' => '#1565c0',
                'button_bg_color' => '#ffffff',
                'button_hover_color' => '#e3f2fd',
                'redirect_url' => '/urunler',
                'order' => 1,
            ],
            [
                'tr' => [
                    'title' => 'Güçlen, Büyü, Başar',
                    'sub_title' => 'Supplement & Protein',
                    'description' => 'Hardline, Optimum Nutrition, MyProtein - Antrenman öncesi ve sonrası ihtiyacın olan tüm takviyeler.',
                    'button_text' => 'Ürünleri Keşfet',
                ],
                'en' => [
                    'title' => 'Get Strong, Grow, Succeed',
                    'sub_title' => 'Supplement & Protein',
                    'description' => 'Hardline, Optimum Nutrition, MyProtein - All the supplements you need before and after your workout.',
                    'button_text' => 'Explore Products',
                ],
                'platform' => 'web',
                'title_color' => '#ffffff',
                'sub_title_color' => '#81c784',
                'description_color' => '#e8f5e9',
                'bg_color' => '#2e7d32',
                'image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600',
                'bg_image' => 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=1920',
                'button_text_color' => '#2e7d32',
                'button_bg_color' => '#ffffff',
                'button_hover_color' => '#c8e6c9',
                'redirect_url' => '/urunler?category=supplements',
                'order' => 2,
            ],
            [
                'tr' => [
                    'title' => 'Doğayla Buluş',
                    'sub_title' => 'Outdoor & Kamp Ekipmanları',
                    'description' => 'Çadır, uyku tulumu, trekking ayakkabısı - Maceraya hazır mısın? En kaliteli outdoor ürünleri burada.',
                    'button_text' => 'Ekipmanları Gör',
                ],
                'en' => [
                    'title' => 'Meet Nature',
                    'sub_title' => 'Outdoor & Camping Equipment',
                    'description' => 'Tents, sleeping bags, trekking shoes - Ready for adventure? The highest quality outdoor products here.',
                    'button_text' => 'View Equipment',
                ],
                'platform' => 'web',
                'title_color' => '#ffffff',
                'sub_title_color' => '#ffcc80',
                'description_color' => '#fff3e0',
                'bg_color' => '#e65100',
                'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600',
                'bg_image' => 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1920',
                'button_text_color' => '#e65100',
                'button_bg_color' => '#ffffff',
                'button_hover_color' => '#ffe0b2',
                'redirect_url' => '/urunler?category=outdoor',
                'order' => 3,
            ],
            [
                'tr' => [
                    'title' => 'Koşuya Başla',
                    'sub_title' => 'Profesyonel Koşu Ayakkabıları',
                    'description' => 'Hoka, Brooks, Asics, Nike - Maraton koşucusundan hobi koşucusuna, herkes için mükemmel ayakkabı.',
                    'button_text' => 'Ayakkabıları İncele',
                ],
                'en' => [
                    'title' => 'Start Running',
                    'sub_title' => 'Professional Running Shoes',
                    'description' => 'Hoka, Brooks, Asics, Nike - Perfect shoes for everyone from marathon runners to hobby joggers.',
                    'button_text' => 'Browse Shoes',
                ],
                'platform' => 'web',
                'title_color' => '#212121',
                'sub_title_color' => '#f57c00',
                'description_color' => '#424242',
                'bg_color' => '#ffc107',
                'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
                'bg_image' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1920',
                'button_text_color' => '#ffffff',
                'button_bg_color' => '#212121',
                'button_hover_color' => '#424242',
                'redirect_url' => '/urunler?category=running-shoes',
                'order' => 4,
            ],
            [
                'tr' => [
                    'title' => 'Fitness Giyimde Yeni Trend',
                    'sub_title' => 'Şıklık ve Konfor Bir Arada',
                    'description' => 'Spor taytlar, crop toplar, eşofmanlar - Antrenmanda da günlük hayatta da şık ol.',
                    'button_text' => 'Koleksiyonu Gör',
                ],
                'en' => [
                    'title' => 'New Trend in Fitness Wear',
                    'sub_title' => 'Style and Comfort Together',
                    'description' => 'Sports leggings, crop tops, tracksuits - Look stylish in training and everyday life.',
                    'button_text' => 'View Collection',
                ],
                'platform' => 'web',
                'title_color' => '#ffffff',
                'sub_title_color' => '#f8bbd9',
                'description_color' => '#fce4ec',
                'bg_color' => '#ad1457',
                'image' => 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600',
                'bg_image' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920',
                'button_text_color' => '#ad1457',
                'button_bg_color' => '#ffffff',
                'button_hover_color' => '#fce4ec',
                'redirect_url' => '/urunler?category=fitness-apparel',
                'order' => 5,
            ],

            // ============ MOBILE SLIDERS ============
            [
                'tr' => [
                    'title' => 'Mobilde Özel Fırsatlar',
                    'sub_title' => 'Uygulama İndirimleri',
                    'description' => 'Mobil uygulamamızı indir, özel kampanyalardan yararlan!',
                    'button_text' => 'İndir',
                ],
                'en' => [
                    'title' => 'Mobile Exclusive Deals',
                    'sub_title' => 'App Discounts',
                    'description' => 'Download our mobile app and enjoy exclusive campaigns!',
                    'button_text' => 'Download',
                ],
                'platform' => 'mobile',
                'title_color' => '#ffffff',
                'sub_title_color' => '#90caf9',
                'description_color' => '#e3f2fd',
                'bg_color' => '#0d47a1',
                'image' => 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600',
                'bg_image' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920',
                'button_text_color' => '#0d47a1',
                'button_bg_color' => '#ffffff',
                'button_hover_color' => '#bbdefb',
                'redirect_url' => '/app-download',
                'order' => 1,
            ],
            [
                'tr' => [
                    'title' => 'Akıllı Saat & Tracker',
                    'sub_title' => 'Sağlığını Takip Et',
                    'description' => 'Garmin, Polar, Fitbit - Antrenmanlarını izle, hedeflerine ulaş.',
                    'button_text' => 'Keşfet',
                ],
                'en' => [
                    'title' => 'Smart Watch & Tracker',
                    'sub_title' => 'Track Your Health',
                    'description' => 'Garmin, Polar, Fitbit - Monitor your workouts, reach your goals.',
                    'button_text' => 'Explore',
                ],
                'platform' => 'mobile',
                'title_color' => '#212121',
                'sub_title_color' => '#1565c0',
                'description_color' => '#424242',
                'bg_color' => '#f5f5f5',
                'image' => 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600',
                'bg_image' => 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=1920',
                'button_text_color' => '#ffffff',
                'button_bg_color' => '#1565c0',
                'button_hover_color' => '#0d47a1',
                'redirect_url' => '/urunler?category=smart-watches',
                'order' => 2,
            ],
            [
                'tr' => [
                    'title' => 'Bisiklet Sezonu Açıldı',
                    'sub_title' => 'Yol & Dağ Bisikletleri',
                    'description' => 'Trek, Giant, Bianchi - Şehir içi ve off-road için en iyi bisikletler.',
                    'button_text' => 'Bisikletleri Gör',
                ],
                'en' => [
                    'title' => 'Cycling Season is Open',
                    'sub_title' => 'Road & Mountain Bikes',
                    'description' => 'Trek, Giant, Bianchi - The best bikes for urban and off-road riding.',
                    'button_text' => 'View Bikes',
                ],
                'platform' => 'mobile',
                'title_color' => '#ffffff',
                'sub_title_color' => '#80cbc4',
                'description_color' => '#b2dfdb',
                'bg_color' => '#00695c',
                'image' => 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600',
                'bg_image' => 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=1920',
                'button_text_color' => '#00695c',
                'button_bg_color' => '#ffffff',
                'button_hover_color' => '#e0f2f1',
                'redirect_url' => '/urunler?category=bicycles',
                'order' => 3,
            ],
        ];

        DB::transaction(function () use ($sliders) {
            // Mevcut slider ve translationları temizle
            DB::table('translations')
                ->where('translatable_type', 'App\\Models\\Slider')
                ->delete();
            DB::table('sliders')->delete();

            foreach ($sliders as $slider) {
                $sliderId = DB::table('sliders')->insertGetId([
                    'platform' => $slider['platform'],
                    'title' => $slider['tr']['title'],
                    'title_color' => $slider['title_color'],
                    'sub_title' => $slider['tr']['sub_title'],
                    'sub_title_color' => $slider['sub_title_color'],
                    'description' => $slider['tr']['description'],
                    'description_color' => $slider['description_color'],
                    'image' => $slider['image'],
                    'bg_image' => $slider['bg_image'],
                    'bg_color' => $slider['bg_color'],
                    'button_text' => $slider['tr']['button_text'],
                    'button_text_color' => $slider['button_text_color'],
                    'button_bg_color' => $slider['button_bg_color'],
                    'button_hover_color' => $slider['button_hover_color'],
                    'button_url' => $slider['redirect_url'],
                    'redirect_url' => $slider['redirect_url'],
                    'order' => $slider['order'],
                    'status' => 1,
                    'created_by' => 1,
                    'updated_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // TR, EN ve DF translations
                foreach (['df', 'tr', 'en'] as $lang) {
                    $source = $lang === 'df' ? 'tr' : $lang;
                    $this->insertTranslation($sliderId, $lang, 'title', $slider[$source]['title']);
                    $this->insertTranslation($sliderId, $lang, 'sub_title', $slider[$source]['sub_title']);
                    $this->insertTranslation($sliderId, $lang, 'description', $slider[$source]['description']);
                    $this->insertTranslation($sliderId, $lang, 'button_text', $slider[$source]['button_text']);
                }
            }
        });

        echo "Sliders seeded successfully! Total: " . count($sliders) . "\n";
    }

    private function insertTranslation(int $sliderId, string $lang, string $key, string $value): void
    {
        DB::table('translations')->insert([
            'translatable_id' => $sliderId,
            'translatable_type' => 'App\\Models\\Slider',
            'language' => $lang,
            'key' => $key,
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
