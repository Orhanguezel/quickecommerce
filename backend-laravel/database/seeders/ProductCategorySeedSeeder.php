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
            ['name' => 'Proteinler', 'slug' => 'proteinler', 'type' => 'supplement', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400', 'color' => '#FF6B6B'],
            ['name' => 'BCAA & Aminoasitler', 'slug' => 'bcaa-aminoasitler', 'type' => 'supplement', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400', 'color' => '#4ECDC4'],
            ['name' => 'Kreatin', 'slug' => 'kreatin', 'type' => 'supplement', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400', 'color' => '#95E1D3'],
            ['name' => 'Pre-Workout', 'slug' => 'pre-workout', 'type' => 'supplement', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=400', 'color' => '#F38181'],
            ['name' => 'Vitamin & Mineraller', 'slug' => 'vitamin-mineraller', 'type' => 'supplement', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400', 'color' => '#FFA07A'],

            // Ana Kategori: Fitness Ekipmanları
            ['name' => 'Ağırlıklar & Dambıllar', 'slug' => 'agirliklar-dambillar', 'type' => 'equipment', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 'color' => '#667EEA'],
            ['name' => 'Yoga & Pilates', 'slug' => 'yoga-pilates', 'type' => 'equipment', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', 'color' => '#9F7AEA'],
            ['name' => 'Fitness Aksesuarları', 'slug' => 'fitness-aksesuarlari', 'type' => 'equipment', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', 'color' => '#F687B3'],

            // Ana Kategori: Kamp & Outdoor
            ['name' => 'Çadırlar', 'slug' => 'cadirlar', 'type' => 'outdoor', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400', 'color' => '#48BB78'],
            ['name' => 'Uyku Tulumları', 'slug' => 'uyku-tulumlari', 'type' => 'outdoor', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400', 'color' => '#38B2AC'],
            ['name' => 'Mataralar & Termoslar', 'slug' => 'mataralar-termoslar', 'type' => 'outdoor', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 'color' => '#4299E1'],
            ['name' => 'Sırt Çantaları', 'slug' => 'sirt-cantalari', 'type' => 'outdoor', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'color' => '#ED8936'],
            ['name' => 'Kamp Aksesuarları', 'slug' => 'kamp-aksesuarlari', 'type' => 'outdoor', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=400', 'color' => '#ECC94B'],

            // Ana Kategori: Takım Sporları
            ['name' => 'Futbol', 'slug' => 'futbol', 'type' => 'sports', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=400', 'color' => '#10B981'],
            ['name' => 'Basketbol', 'slug' => 'basketbol', 'type' => 'sports', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400', 'color' => '#F59E0B'],
            ['name' => 'Tenis', 'slug' => 'tenis', 'type' => 'sports', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400', 'color' => '#84CC16'],
            ['name' => 'Yüzücü Gözlüğü', 'slug' => 'yuzucu-gozlugu', 'type' => 'sports', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400', 'color' => '#06B6D4'],
            ['name' => 'Boks', 'slug' => 'boks', 'type' => 'sports', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400', 'color' => '#EF4444'],

            // Ana Kategori: Giyim & Ayakkabı
            ['name' => 'Spor Ayakkabı', 'slug' => 'spor-ayakkabi', 'type' => 'apparel', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'color' => '#8B5CF6'],
            ['name' => 'Erkek Giyim', 'slug' => 'erkek-giyim', 'type' => 'apparel', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 'color' => '#3B82F6'],
            ['name' => 'Kadın Giyim', 'slug' => 'kadin-giyim', 'type' => 'apparel', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400', 'color' => '#EC4899'],

            // Ana Kategori: Teknoloji & Aksesuar
            ['name' => 'Akıllı Saatler', 'slug' => 'akilli-saatler', 'type' => 'tech', 'featured' => 1, 'image' => 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400', 'color' => '#6366F1'],
            ['name' => 'Aksiyon Kameraları', 'slug' => 'aksiyon-kameralari', 'type' => 'tech', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400', 'color' => '#10B981'],
            ['name' => 'Spor Kulaklıkları', 'slug' => 'spor-kulakliklari', 'type' => 'tech', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'color' => '#8B5CF6'],
            ['name' => 'Spor Çantaları', 'slug' => 'spor-cantalari', 'type' => 'apparel', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=400', 'color' => '#14B8A6'],
            ['name' => 'Gözlükler', 'slug' => 'gozlukler', 'type' => 'apparel', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', 'color' => '#F59E0B'],

            // Ana Kategori: Kitaplar
            ['name' => 'Spor & Fitness Kitapları', 'slug' => 'spor-fitness-kitaplari', 'type' => 'books', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'color' => '#78716C'],
            ['name' => 'Outdoor & Macera Kitapları', 'slug' => 'outdoor-macera-kitaplari', 'type' => 'books', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', 'color' => '#059669'],
            ['name' => 'Dağcılık & Tırmanış Kitapları', 'slug' => 'dagcilik-tirmanis-kitaplari', 'type' => 'books', 'featured' => 0, 'image' => 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400', 'color' => '#DC2626'],
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
                'category_thumb' => $cat['image'],
                'category_banner' => $cat['color'],
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
