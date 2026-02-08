<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ProductCategorySeedSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // Spor & Fitness kategorileri (ProductSeeder ile uyumlu)
        $categories = [
            // Ana Kategori: Supplement & Nutrition
            ['name' => 'Proteinler', 'slug' => 'proteinler', 'type' => 'supplement', 'parent' => null, 'featured' => 1],
            ['name' => 'BCAA & Aminoasitler', 'slug' => 'bcaa-aminoasitler', 'type' => 'supplement', 'parent' => null, 'featured' => 1],
            ['name' => 'Kreatin', 'slug' => 'kreatin', 'type' => 'supplement', 'parent' => null, 'featured' => 0],
            ['name' => 'Pre-Workout', 'slug' => 'pre-workout', 'type' => 'supplement', 'parent' => null, 'featured' => 1],
            ['name' => 'Vitamin & Mineraller', 'slug' => 'vitamin-mineraller', 'type' => 'supplement', 'parent' => null, 'featured' => 0],

            // Ana Kategori: Fitness Ekipmanları
            ['name' => 'Ağırlıklar & Dambıllar', 'slug' => 'agirliklar-dambillar', 'type' => 'equipment', 'parent' => null, 'featured' => 1],
            ['name' => 'Yoga & Pilates', 'slug' => 'yoga-pilates', 'type' => 'equipment', 'parent' => null, 'featured' => 1],
            ['name' => 'Fitness Aksesuarları', 'slug' => 'fitness-aksesuarlari', 'type' => 'equipment', 'parent' => null, 'featured' => 1],

            // Ana Kategori: Kamp & Outdoor
            ['name' => 'Çadırlar', 'slug' => 'cadirlar', 'type' => 'outdoor', 'parent' => null, 'featured' => 1],
            ['name' => 'Uyku Tulumları', 'slug' => 'uyku-tulumlari', 'type' => 'outdoor', 'parent' => null, 'featured' => 0],
            ['name' => 'Mataralar & Termoslar', 'slug' => 'mataralar-termoslar', 'type' => 'outdoor', 'parent' => null, 'featured' => 0],
            ['name' => 'Sırt Çantaları', 'slug' => 'sirt-cantalari', 'type' => 'outdoor', 'parent' => null, 'featured' => 1],
            ['name' => 'Kamp Aksesuarları', 'slug' => 'kamp-aksesuarlari', 'type' => 'outdoor', 'parent' => null, 'featured' => 0],

            // Ana Kategori: Takım Sporları
            ['name' => 'Futbol', 'slug' => 'futbol', 'type' => 'sports', 'parent' => null, 'featured' => 1],
            ['name' => 'Basketbol', 'slug' => 'basketbol', 'type' => 'sports', 'parent' => null, 'featured' => 1],
            ['name' => 'Tenis', 'slug' => 'tenis', 'type' => 'sports', 'parent' => null, 'featured' => 0],
            ['name' => 'Yüzücü Gözlüğü', 'slug' => 'yuzucu-gozlugu', 'type' => 'sports', 'parent' => null, 'featured' => 0],
            ['name' => 'Boks', 'slug' => 'boks', 'type' => 'sports', 'parent' => null, 'featured' => 1],

            // Ana Kategori: Giyim & Ayakkabı
            ['name' => 'Spor Ayakkabı', 'slug' => 'spor-ayakkabi', 'type' => 'apparel', 'parent' => null, 'featured' => 1],
            ['name' => 'Erkek Giyim', 'slug' => 'erkek-giyim', 'type' => 'apparel', 'parent' => null, 'featured' => 1],
            ['name' => 'Kadın Giyim', 'slug' => 'kadin-giyim', 'type' => 'apparel', 'parent' => null, 'featured' => 1],

            // Ana Kategori: Teknoloji & Aksesuar
            ['name' => 'Akıllı Saatler', 'slug' => 'akilli-saatler', 'type' => 'tech', 'parent' => null, 'featured' => 1],
            ['name' => 'Aksiyon Kameraları', 'slug' => 'aksiyon-kameralari', 'type' => 'tech', 'parent' => null, 'featured' => 0],
            ['name' => 'Spor Kulaklıkları', 'slug' => 'spor-kulakliklari', 'type' => 'tech', 'parent' => null, 'featured' => 0],
            ['name' => 'Spor Çantaları', 'slug' => 'spor-cantalari', 'type' => 'apparel', 'parent' => null, 'featured' => 0],
            ['name' => 'Gözlükler', 'slug' => 'gozlukler', 'type' => 'apparel', 'parent' => null, 'featured' => 0],

            // Ana Kategori: Kitaplar
            ['name' => 'Spor & Fitness Kitapları', 'slug' => 'spor-fitness-kitaplari', 'type' => 'books', 'parent' => null, 'featured' => 0],
            ['name' => 'Outdoor & Macera Kitapları', 'slug' => 'outdoor-macera-kitaplari', 'type' => 'books', 'parent' => null, 'featured' => 0],
            ['name' => 'Dağcılık & Tırmanış Kitapları', 'slug' => 'dagcilik-tirmanis-kitaplari', 'type' => 'books', 'parent' => null, 'featured' => 0],
        ];

        $rows = [];
        foreach ($categories as $cat) {
            $rows[] = [
                'category_name' => $cat['name'],
                'category_slug' => $cat['slug'],
                'type' => $cat['type'],
                'category_name_paths' => null,
                'parent_path' => null,
                'parent_id' => null,
                'category_level' => 1,
                'is_featured' => $cat['featured'],
                'admin_commission_rate' => 0,
                'category_thumb' => null,
                'category_banner' => '#fff',
                'meta_title' => $cat['name'],
                'meta_description' => $cat['name'],
                'display_order' => 100,
                'created_by' => null,
                'updated_by' => null,
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Upsert: varsa update, yoksa insert
        DB::table('product_category')->upsert(
            $rows,
            ['category_slug', 'type'], // Unique key
            [
                'category_name',
                'is_featured',
                'meta_title',
                'meta_description',
                'status',
                'updated_at',
            ]
        );

        echo "ProductCategorySeedSeeder: " . count($rows) . " categories seeded.\n";
    }
}
