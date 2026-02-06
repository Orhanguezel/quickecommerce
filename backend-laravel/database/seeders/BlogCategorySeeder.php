<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BlogCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'tr' => [
                    'name' => 'Fitness & Antrenman',
                    'meta_title' => 'Fitness ve Antrenman Rehberi | Spor Blog',
                    'meta_description' => 'Fitness programları, antrenman teknikleri, egzersiz rehberleri ve spor ipuçları. Formda kalmak için ihtiyacın olan tüm bilgiler.',
                ],
                'en' => [
                    'name' => 'Fitness & Training',
                    'meta_title' => 'Fitness and Training Guide | Sports Blog',
                    'meta_description' => 'Fitness programs, training techniques, exercise guides and sports tips. All the information you need to stay in shape.',
                ],
                'slug' => 'fitness-antrenman',
            ],
            [
                'tr' => [
                    'name' => 'Beslenme & Diyet',
                    'meta_title' => 'Sporcu Beslenmesi ve Diyet | Spor Blog',
                    'meta_description' => 'Sporcu beslenmesi, diyet programları, protein ve supplement rehberleri. Performansını artıracak beslenme önerileri.',
                ],
                'en' => [
                    'name' => 'Nutrition & Diet',
                    'meta_title' => 'Sports Nutrition and Diet | Sports Blog',
                    'meta_description' => 'Sports nutrition, diet programs, protein and supplement guides. Nutrition tips to boost your performance.',
                ],
                'slug' => 'beslenme-diyet',
            ],
            [
                'tr' => [
                    'name' => 'Koşu & Maraton',
                    'meta_title' => 'Koşu ve Maraton Rehberi | Spor Blog',
                    'meta_description' => 'Koşu teknikleri, maraton hazırlığı, koşu ayakkabısı seçimi ve koşucu hikayeleri. Koşuya başla, hedeflerine ulaş!',
                ],
                'en' => [
                    'name' => 'Running & Marathon',
                    'meta_title' => 'Running and Marathon Guide | Sports Blog',
                    'meta_description' => 'Running techniques, marathon preparation, running shoe selection and runner stories. Start running, reach your goals!',
                ],
                'slug' => 'kosu-maraton',
            ],
            [
                'tr' => [
                    'name' => 'Outdoor & Doğa Sporları',
                    'meta_title' => 'Outdoor ve Doğa Sporları | Spor Blog',
                    'meta_description' => 'Trekking, kamp, dağcılık ve doğa yürüyüşü rehberleri. Doğayla buluş, maceraya atıl!',
                ],
                'en' => [
                    'name' => 'Outdoor & Nature Sports',
                    'meta_title' => 'Outdoor and Nature Sports | Sports Blog',
                    'meta_description' => 'Trekking, camping, mountaineering and hiking guides. Meet nature, embark on adventure!',
                ],
                'slug' => 'outdoor-doga-sporlari',
            ],
            [
                'tr' => [
                    'name' => 'Bisiklet',
                    'meta_title' => 'Bisiklet Rehberi | Spor Blog',
                    'meta_description' => 'Yol bisikleti, dağ bisikleti, bisiklet bakımı ve rota önerileri. Pedal çevir, özgürlüğü hisset!',
                ],
                'en' => [
                    'name' => 'Cycling',
                    'meta_title' => 'Cycling Guide | Sports Blog',
                    'meta_description' => 'Road bike, mountain bike, bike maintenance and route suggestions. Pedal on, feel the freedom!',
                ],
                'slug' => 'bisiklet',
            ],
            [
                'tr' => [
                    'name' => 'Yoga & Pilates',
                    'meta_title' => 'Yoga ve Pilates Rehberi | Spor Blog',
                    'meta_description' => 'Yoga pozları, pilates egzersizleri, meditasyon teknikleri ve iç huzur. Zihin ve beden sağlığı için.',
                ],
                'en' => [
                    'name' => 'Yoga & Pilates',
                    'meta_title' => 'Yoga and Pilates Guide | Sports Blog',
                    'meta_description' => 'Yoga poses, pilates exercises, meditation techniques and inner peace. For mind and body health.',
                ],
                'slug' => 'yoga-pilates',
            ],
            [
                'tr' => [
                    'name' => 'Ekipman & Ürün İncelemeleri',
                    'meta_title' => 'Spor Ekipmanları ve Ürün İncelemeleri | Spor Blog',
                    'meta_description' => 'Spor ekipmanları, ayakkabı incelemeleri, akıllı saat karşılaştırmaları ve ürün tavsiyeleri.',
                ],
                'en' => [
                    'name' => 'Equipment & Product Reviews',
                    'meta_title' => 'Sports Equipment and Product Reviews | Sports Blog',
                    'meta_description' => 'Sports equipment, shoe reviews, smart watch comparisons and product recommendations.',
                ],
                'slug' => 'ekipman-urun-incelemeleri',
            ],
            [
                'tr' => [
                    'name' => 'Motivasyon & Başarı Hikayeleri',
                    'meta_title' => 'Motivasyon ve Başarı Hikayeleri | Spor Blog',
                    'meta_description' => 'İlham veren sporcu hikayeleri, motivasyon yazıları ve başarı sırları. Hedeflerine ulaşmak için güç al!',
                ],
                'en' => [
                    'name' => 'Motivation & Success Stories',
                    'meta_title' => 'Motivation and Success Stories | Sports Blog',
                    'meta_description' => 'Inspiring athlete stories, motivational articles and secrets of success. Get powered to reach your goals!',
                ],
                'slug' => 'motivasyon-basari-hikayeleri',
            ],
            [
                'tr' => [
                    'name' => 'Sağlık & Sakatlıklar',
                    'meta_title' => 'Spor Sağlığı ve Sakatlık Önleme | Spor Blog',
                    'meta_description' => 'Spor sakatlıkları, iyileşme süreçleri, sakatlık önleme yöntemleri ve sağlıklı spor yapma rehberi.',
                ],
                'en' => [
                    'name' => 'Health & Injuries',
                    'meta_title' => 'Sports Health and Injury Prevention | Sports Blog',
                    'meta_description' => 'Sports injuries, recovery processes, injury prevention methods and healthy sports guide.',
                ],
                'slug' => 'saglik-sakatliklar',
            ],
            [
                'tr' => [
                    'name' => 'Yüzme & Su Sporları',
                    'meta_title' => 'Yüzme ve Su Sporları Rehberi | Spor Blog',
                    'meta_description' => 'Yüzme teknikleri, su sporları, havuz antrenmanları ve yüzme ekipmanları hakkında her şey.',
                ],
                'en' => [
                    'name' => 'Swimming & Water Sports',
                    'meta_title' => 'Swimming and Water Sports Guide | Sports Blog',
                    'meta_description' => 'Swimming techniques, water sports, pool workouts and everything about swimming equipment.',
                ],
                'slug' => 'yuzme-su-sporlari',
            ],
        ];

        DB::transaction(function () use ($categories) {
            // Mevcut blog category ve translationları temizle
            DB::table('translations')
                ->where('translatable_type', 'Modules\\Blog\\app\\Models\\BlogCategory')
                ->delete();
            DB::table('blog_categories')->delete();

            foreach ($categories as $category) {
                $categoryId = DB::table('blog_categories')->insertGetId([
                    'name' => $category['tr']['name'],
                    'slug' => $category['slug'],
                    'meta_title' => $category['tr']['meta_title'],
                    'meta_description' => $category['tr']['meta_description'],
                    'status' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // TR, EN ve DF translations
                foreach (['df', 'tr', 'en'] as $lang) {
                    $source = $lang === 'df' ? 'tr' : $lang;
                    $this->insertTranslation($categoryId, $lang, 'name', $category[$source]['name']);
                    $this->insertTranslation($categoryId, $lang, 'meta_title', $category[$source]['meta_title']);
                    $this->insertTranslation($categoryId, $lang, 'meta_description', $category[$source]['meta_description']);
                }
            }
        });

        echo "Blog Categories seeded successfully! Total: " . count($categories) . "\n";
    }

    private function insertTranslation(int $categoryId, string $lang, string $key, string $value): void
    {
        DB::table('translations')->insert([
            'translatable_id' => $categoryId,
            'translatable_type' => 'Modules\\Blog\\app\\Models\\BlogCategory',
            'language' => $lang,
            'key' => $key,
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
