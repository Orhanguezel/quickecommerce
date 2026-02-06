<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('reviews')) {
            $this->command->warn('ReviewSeeder: reviews table does not exist. Skipping...');
            return;
        }

        // Clear existing data
        DB::table('reviews')->delete();

        $reviewTexts = [
            'tr' => [
                'Harika bir ürün, çok memnunum!',
                'Kaliteli ve hızlı teslimat.',
                'Fiyat/performans oranı çok iyi.',
                'Beklediğimden daha iyi çıktı.',
                'Tavsiye ederim, kesinlikle alınmalı.',
                'Ürün tam olarak açıklamadaki gibi.',
                'Çok beğendim, tekrar alırım.',
                'Güzel paketlenmiş, hasarsız geldi.',
                'Müşteri hizmetleri çok yardımcı oldu.',
                'Kaliteden ödün vermeden uygun fiyat.',
            ],
            'en' => [
                'Great product, very satisfied!',
                'Quality item and fast delivery.',
                'Excellent value for money.',
                'Better than I expected.',
                'Highly recommend, must buy.',
                'Product is exactly as described.',
                'Love it, will buy again.',
                'Well packaged, arrived intact.',
                'Customer service was very helpful.',
                'Affordable without compromising quality.',
            ],
        ];

        $reviews = [];

        for ($i = 0; $i < 100; $i++) {
            $isProduct = rand(0, 1); // 50% chance for product or user
            $textIndex = $i % 10; // Cycle through 10 texts

            $reviews[] = [
                'order_id' => rand(1, 50),
                'store_id' => rand(1, 8),
                'reviewable_id' => $isProduct ? rand(1, 45) : rand(1, 8),
                'reviewable_type' => $isProduct ? 'App\\Models\\Product' : 'App\\Models\\User',
                'customer_id' => 1,
                'review' => $reviewTexts['tr'][$textIndex],
                'rating' => rand(30, 50) / 10, // Random rating between 3.0 and 5.0
                'status' => ['pending', 'approved', 'approved', 'approved'][rand(0, 3)], // More approved
                'like_count' => rand(0, 100),
                'dislike_count' => rand(0, 20),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('reviews')->insert($reviews);

        $this->command->info('ReviewSeeder: 100 reviews seeded.');
    }
}
