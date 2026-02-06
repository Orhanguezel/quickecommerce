<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FlashSaleSeeder extends Seeder
{
    public function run(): void
    {
        $flashSales = [
            [
                'tr' => [
                    'title' => 'Yaz Spor Festivali',
                    'description' => 'Yaz sezonuna özel spor giyim ve ekipmanlarında büyük indirimler!',
                    'button_text' => 'Alışverişe Başla',
                ],
                'en' => [
                    'title' => 'Summer Sports Festival',
                    'description' => 'Big discounts on sportswear and equipment for the summer season!',
                    'button_text' => 'Start Shopping',
                ],
                'title_color' => '#ffffff',
                'description_color' => '#f0f0f0',
                'background_color' => '#1a73e8',
                'button_text_color' => '#1a73e8',
                'button_hover_color' => '#0d5bba',
                'button_bg_color' => '#ffffff',
                'button_url' => '/products?category=sports',
                'timer_bg_color' => '#ff5722',
                'timer_text_color' => '#ffffff',
                'image' => 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
                'cover_image' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200',
                'discount_type' => 'percentage',
                'discount_amount' => 30,
                'purchase_limit' => 500,
                'days_ahead' => 30,
            ],
            [
                'tr' => [
                    'title' => 'Protein & Supplement Haftası',
                    'description' => 'En popüler supplement markaları şimdi %40\'a varan indirimlerle!',
                    'button_text' => 'İndirimleri Gör',
                ],
                'en' => [
                    'title' => 'Protein & Supplement Week',
                    'description' => 'Most popular supplement brands now with up to 40% off!',
                    'button_text' => 'View Deals',
                ],
                'title_color' => '#ffffff',
                'description_color' => '#e8f5e9',
                'background_color' => '#2e7d32',
                'button_text_color' => '#2e7d32',
                'button_hover_color' => '#1b5e20',
                'button_bg_color' => '#ffffff',
                'button_url' => '/products?category=supplements',
                'timer_bg_color' => '#c62828',
                'timer_text_color' => '#ffffff',
                'image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800',
                'cover_image' => 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=1200',
                'discount_type' => 'percentage',
                'discount_amount' => 40,
                'purchase_limit' => 300,
                'days_ahead' => 14,
            ],
            [
                'tr' => [
                    'title' => 'Outdoor Kampanyası',
                    'description' => 'Kamp, trekking ve outdoor ekipmanlarında kaçırılmayacak fırsatlar!',
                    'button_text' => 'Keşfet',
                ],
                'en' => [
                    'title' => 'Outdoor Campaign',
                    'description' => 'Unmissable deals on camping, trekking and outdoor equipment!',
                    'button_text' => 'Explore',
                ],
                'title_color' => '#ffffff',
                'description_color' => '#fff3e0',
                'background_color' => '#e65100',
                'button_text_color' => '#e65100',
                'button_hover_color' => '#bf360c',
                'button_bg_color' => '#ffffff',
                'button_url' => '/products?category=outdoor',
                'timer_bg_color' => '#1565c0',
                'timer_text_color' => '#ffffff',
                'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
                'cover_image' => 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200',
                'discount_type' => 'percentage',
                'discount_amount' => 25,
                'purchase_limit' => 200,
                'days_ahead' => 21,
            ],
            [
                'tr' => [
                    'title' => 'Fitness Giyim Şenliği',
                    'description' => 'Spor taytlar, t-shirtler ve aksesuarlarda %50\'ye varan indirim!',
                    'button_text' => 'Hemen Al',
                ],
                'en' => [
                    'title' => 'Fitness Apparel Fest',
                    'description' => 'Up to 50% off on sports leggings, t-shirts and accessories!',
                    'button_text' => 'Shop Now',
                ],
                'title_color' => '#ffffff',
                'description_color' => '#fce4ec',
                'background_color' => '#ad1457',
                'button_text_color' => '#ad1457',
                'button_hover_color' => '#880e4f',
                'button_bg_color' => '#ffffff',
                'button_url' => '/products?category=fitness-apparel',
                'timer_bg_color' => '#6a1b9a',
                'timer_text_color' => '#ffffff',
                'image' => 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800',
                'cover_image' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200',
                'discount_type' => 'percentage',
                'discount_amount' => 50,
                'purchase_limit' => 400,
                'days_ahead' => 10,
            ],
            [
                'tr' => [
                    'title' => 'Koşu Ayakkabısı Günleri',
                    'description' => 'Nike, Adidas, Hoka ve daha fazlası! Koşu ayakkabılarında özel fiyatlar.',
                    'button_text' => 'Koşuya Başla',
                ],
                'en' => [
                    'title' => 'Running Shoes Days',
                    'description' => 'Nike, Adidas, Hoka and more! Special prices on running shoes.',
                    'button_text' => 'Start Running',
                ],
                'title_color' => '#212121',
                'description_color' => '#424242',
                'background_color' => '#ffc107',
                'button_text_color' => '#ffffff',
                'button_hover_color' => '#333333',
                'button_bg_color' => '#212121',
                'button_url' => '/products?category=running-shoes',
                'timer_bg_color' => '#d32f2f',
                'timer_text_color' => '#ffffff',
                'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
                'cover_image' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200',
                'discount_type' => 'amount',
                'discount_amount' => 200,
                'purchase_limit' => 150,
                'days_ahead' => 7,
            ],
            [
                'tr' => [
                    'title' => 'Akıllı Saat & Fitness Tracker',
                    'description' => 'Garmin, Polar, Fitbit - antrenmanlarını takip et, hedeflerine ulaş!',
                    'button_text' => 'İncele',
                ],
                'en' => [
                    'title' => 'Smart Watch & Fitness Tracker',
                    'description' => 'Garmin, Polar, Fitbit - track your workouts, reach your goals!',
                    'button_text' => 'Browse',
                ],
                'title_color' => '#ffffff',
                'description_color' => '#e3f2fd',
                'background_color' => '#0d47a1',
                'button_text_color' => '#0d47a1',
                'button_hover_color' => '#1565c0',
                'button_bg_color' => '#ffffff',
                'button_url' => '/products?category=smart-watches',
                'timer_bg_color' => '#00897b',
                'timer_text_color' => '#ffffff',
                'image' => 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
                'cover_image' => 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=1200',
                'discount_type' => 'percentage',
                'discount_amount' => 20,
                'purchase_limit' => 100,
                'days_ahead' => 14,
            ],
        ];

        DB::transaction(function () use ($flashSales) {
            // Mevcut flash sales ve translationları temizle
            DB::table('translations')
                ->where('translatable_type', 'App\\Models\\FlashSale')
                ->delete();
            DB::table('flash_sale_products')->delete();
            DB::table('flash_sales')->delete();

            foreach ($flashSales as $sale) {
                $flashSaleId = DB::table('flash_sales')->insertGetId([
                    'title' => $sale['tr']['title'],
                    'title_color' => $sale['title_color'],
                    'description' => $sale['tr']['description'],
                    'description_color' => $sale['description_color'],
                    'background_color' => $sale['background_color'],
                    'button_text' => $sale['tr']['button_text'],
                    'button_text_color' => $sale['button_text_color'],
                    'button_hover_color' => $sale['button_hover_color'],
                    'button_bg_color' => $sale['button_bg_color'],
                    'button_url' => $sale['button_url'],
                    'timer_bg_color' => $sale['timer_bg_color'],
                    'timer_text_color' => $sale['timer_text_color'],
                    'image' => $sale['image'],
                    'cover_image' => $sale['cover_image'],
                    'discount_type' => $sale['discount_type'],
                    'discount_amount' => $sale['discount_amount'],
                    'purchase_limit' => $sale['purchase_limit'],
                    'start_time' => now(),
                    'end_time' => now()->addDays($sale['days_ahead']),
                    'status' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // TR, EN ve DF translations
                foreach (['df', 'tr', 'en'] as $lang) {
                    $source = $lang === 'df' ? 'tr' : $lang;
                    $this->insertTranslation($flashSaleId, $lang, 'title', $sale[$source]['title']);
                    $this->insertTranslation($flashSaleId, $lang, 'description', $sale[$source]['description']);
                    $this->insertTranslation($flashSaleId, $lang, 'button_text', $sale[$source]['button_text']);
                }
            }
        });

        echo "Flash Sales seeded successfully! Total: " . count($flashSales) . "\n";
    }

    private function insertTranslation(int $flashSaleId, string $lang, string $key, string $value): void
    {
        DB::table('translations')->insert([
            'translatable_id' => $flashSaleId,
            'translatable_type' => 'App\\Models\\FlashSale',
            'language' => $lang,
            'key' => $key,
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
