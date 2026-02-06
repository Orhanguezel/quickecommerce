<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // ============ GİYİM & AYAKKABI ============
            [
                'slug' => 'giyim-ve-ayakkabi',
                'type' => 'clothing',
                'parent_id' => null,
                'level' => 1,
                'order' => 1,
                'tr' => ['name' => 'Giyim ve Ayakkabı', 'meta_title' => 'Giyim ve Ayakkabı', 'meta_description' => 'Kadın, erkek ve çocuklar için spor giyim ve ayakkabı ürünleri'],
                'en' => ['name' => 'Clothing and Footwear', 'meta_title' => 'Clothing and Footwear', 'meta_description' => 'Sports clothing and footwear for women, men and children'],
                'children' => [
                    ['slug' => 'kadin-giyim', 'tr' => ['name' => 'Kadın Giyim'], 'en' => ['name' => 'Women Clothing']],
                    ['slug' => 'erkek-giyim', 'tr' => ['name' => 'Erkek Giyim'], 'en' => ['name' => 'Men Clothing']],
                    ['slug' => 'cocuk-giyim', 'tr' => ['name' => 'Çocuk Giyim'], 'en' => ['name' => 'Kids Clothing']],
                    ['slug' => 'spor-ayakkabi', 'tr' => ['name' => 'Spor Ayakkabı'], 'en' => ['name' => 'Sports Shoes']],
                    ['slug' => 'kosu-ayakkabisi', 'tr' => ['name' => 'Koşu Ayakkabısı'], 'en' => ['name' => 'Running Shoes']],
                    ['slug' => 'outdoor-bot', 'tr' => ['name' => 'Outdoor Bot'], 'en' => ['name' => 'Outdoor Boots']],
                ],
            ],

            // ============ KAMP & OUTDOOR ============
            [
                'slug' => 'kamp-ve-outdoor',
                'type' => 'outdoor',
                'parent_id' => null,
                'level' => 1,
                'order' => 2,
                'tr' => ['name' => 'Kamp ve Outdoor', 'meta_title' => 'Kamp ve Outdoor Ürünleri', 'meta_description' => 'Kamp, doğa ve outdoor ekipmanları'],
                'en' => ['name' => 'Camping and Outdoor', 'meta_title' => 'Camping and Outdoor Products', 'meta_description' => 'Camping, nature and outdoor equipment'],
                'children' => [
                    ['slug' => 'cadirlar', 'tr' => ['name' => 'Çadırlar'], 'en' => ['name' => 'Tents']],
                    ['slug' => 'uyku-tulumlari', 'tr' => ['name' => 'Uyku Tulumları'], 'en' => ['name' => 'Sleeping Bags']],
                    ['slug' => 'kamp-aksesuarlari', 'tr' => ['name' => 'Kamp Aksesuarları'], 'en' => ['name' => 'Camping Accessories']],
                    ['slug' => 'mataralar-termoslar', 'tr' => ['name' => 'Mataralar ve Termoslar'], 'en' => ['name' => 'Bottles and Thermoses']],
                    ['slug' => 'trekking-malzemeleri', 'tr' => ['name' => 'Trekking Malzemeleri'], 'en' => ['name' => 'Trekking Gear']],
                    ['slug' => 'outdoor-giyim', 'tr' => ['name' => 'Outdoor Giyim'], 'en' => ['name' => 'Outdoor Clothing']],
                ],
            ],

            // ============ BESİN TAKVİYELERİ ============
            [
                'slug' => 'besin-takviyeleri',
                'type' => 'supplements',
                'parent_id' => null,
                'level' => 1,
                'order' => 3,
                'tr' => ['name' => 'Besin Takviyeleri', 'meta_title' => 'Besin Takviyeleri', 'meta_description' => 'Vitamin, mineral ve sporcu takviyeleri'],
                'en' => ['name' => 'Supplements', 'meta_title' => 'Supplements', 'meta_description' => 'Vitamins, minerals and sports supplements'],
                'children' => [
                    ['slug' => 'proteinler', 'tr' => ['name' => 'Proteinler'], 'en' => ['name' => 'Proteins']],
                    ['slug' => 'bcaa-aminoasitler', 'tr' => ['name' => 'BCAA ve Aminoasitler'], 'en' => ['name' => 'BCAA and Amino Acids']],
                    ['slug' => 'kreatin', 'tr' => ['name' => 'Kreatin'], 'en' => ['name' => 'Creatine']],
                    ['slug' => 'vitamin-mineraller', 'tr' => ['name' => 'Vitamin ve Mineraller'], 'en' => ['name' => 'Vitamins and Minerals']],
                    ['slug' => 'kilo-alma', 'tr' => ['name' => 'Kilo Alma'], 'en' => ['name' => 'Weight Gain']],
                    ['slug' => 'kilo-verme', 'tr' => ['name' => 'Kilo Verme'], 'en' => ['name' => 'Weight Loss']],
                    ['slug' => 'pre-workout', 'tr' => ['name' => 'Pre-Workout'], 'en' => ['name' => 'Pre-Workout']],
                    ['slug' => 'sporcu-gidalari', 'tr' => ['name' => 'Sporcu Gıdaları'], 'en' => ['name' => 'Sports Nutrition']],
                ],
            ],

            // ============ FİTNESS EKİPMANLARI ============
            [
                'slug' => 'fitness-ekipmanlari',
                'type' => 'fitness',
                'parent_id' => null,
                'level' => 1,
                'order' => 4,
                'tr' => ['name' => 'Fitness Ekipmanları', 'meta_title' => 'Fitness Ekipmanları', 'meta_description' => 'Ev ve profesyonel fitness ekipmanları'],
                'en' => ['name' => 'Fitness Equipment', 'meta_title' => 'Fitness Equipment', 'meta_description' => 'Home and professional fitness equipment'],
                'children' => [
                    ['slug' => 'agirliklar-dambillar', 'tr' => ['name' => 'Ağırlıklar ve Dambıllar'], 'en' => ['name' => 'Weights and Dumbbells']],
                    ['slug' => 'kardiyo-ekipmanlari', 'tr' => ['name' => 'Kardiyo Ekipmanları'], 'en' => ['name' => 'Cardio Equipment']],
                    ['slug' => 'yoga-pilates', 'tr' => ['name' => 'Yoga ve Pilates'], 'en' => ['name' => 'Yoga and Pilates']],
                    ['slug' => 'fitness-aksesuarlari', 'tr' => ['name' => 'Fitness Aksesuarları'], 'en' => ['name' => 'Fitness Accessories']],
                    ['slug' => 'kettlebell', 'tr' => ['name' => 'Kettlebell'], 'en' => ['name' => 'Kettlebell']],
                    ['slug' => 'direnc-bantlari', 'tr' => ['name' => 'Direnç Bantları'], 'en' => ['name' => 'Resistance Bands']],
                ],
            ],

            // ============ TAKIM SPORLARI ============
            [
                'slug' => 'takim-sporlari',
                'type' => 'team-sports',
                'parent_id' => null,
                'level' => 1,
                'order' => 5,
                'tr' => ['name' => 'Takım Sporları', 'meta_title' => 'Takım Sporları Ekipmanları', 'meta_description' => 'Futbol, basketbol, voleybol ekipmanları'],
                'en' => ['name' => 'Team Sports', 'meta_title' => 'Team Sports Equipment', 'meta_description' => 'Football, basketball, volleyball equipment'],
                'children' => [
                    ['slug' => 'futbol', 'tr' => ['name' => 'Futbol'], 'en' => ['name' => 'Football']],
                    ['slug' => 'basketbol', 'tr' => ['name' => 'Basketbol'], 'en' => ['name' => 'Basketball']],
                    ['slug' => 'voleybol', 'tr' => ['name' => 'Voleybol'], 'en' => ['name' => 'Volleyball']],
                    ['slug' => 'hentbol', 'tr' => ['name' => 'Hentbol'], 'en' => ['name' => 'Handball']],
                ],
            ],

            // ============ RAKET SPORLARI ============
            [
                'slug' => 'raket-sporlari',
                'type' => 'racket-sports',
                'parent_id' => null,
                'level' => 1,
                'order' => 6,
                'tr' => ['name' => 'Raket Sporları', 'meta_title' => 'Raket Sporları Ekipmanları', 'meta_description' => 'Tenis, badminton, squash ekipmanları'],
                'en' => ['name' => 'Racket Sports', 'meta_title' => 'Racket Sports Equipment', 'meta_description' => 'Tennis, badminton, squash equipment'],
                'children' => [
                    ['slug' => 'tenis', 'tr' => ['name' => 'Tenis'], 'en' => ['name' => 'Tennis']],
                    ['slug' => 'badminton', 'tr' => ['name' => 'Badminton'], 'en' => ['name' => 'Badminton']],
                    ['slug' => 'masa-tenisi', 'tr' => ['name' => 'Masa Tenisi'], 'en' => ['name' => 'Table Tennis']],
                    ['slug' => 'squash', 'tr' => ['name' => 'Squash'], 'en' => ['name' => 'Squash']],
                ],
            ],

            // ============ YÜZME ============
            [
                'slug' => 'yuzme',
                'type' => 'swimming',
                'parent_id' => null,
                'level' => 1,
                'order' => 7,
                'tr' => ['name' => 'Yüzme', 'meta_title' => 'Yüzme Ekipmanları', 'meta_description' => 'Yüzme kıyafetleri, gözlükler ve ekipmanları'],
                'en' => ['name' => 'Swimming', 'meta_title' => 'Swimming Equipment', 'meta_description' => 'Swimwear, goggles and swimming equipment'],
                'children' => [
                    ['slug' => 'mayo-bikini', 'tr' => ['name' => 'Mayo ve Bikini'], 'en' => ['name' => 'Swimsuits and Bikinis']],
                    ['slug' => 'yuzucu-gozlugu', 'tr' => ['name' => 'Yüzücü Gözlüğü'], 'en' => ['name' => 'Swimming Goggles']],
                    ['slug' => 'bone-kulaklik', 'tr' => ['name' => 'Bone ve Kulaklık'], 'en' => ['name' => 'Caps and Ear Plugs']],
                    ['slug' => 'palet-el-paleti', 'tr' => ['name' => 'Palet ve El Paleti'], 'en' => ['name' => 'Fins and Hand Paddles']],
                ],
            ],

            // ============ KOŞU & MARATON ============
            [
                'slug' => 'kosu-maraton',
                'type' => 'running',
                'parent_id' => null,
                'level' => 1,
                'order' => 8,
                'tr' => ['name' => 'Koşu ve Maraton', 'meta_title' => 'Koşu ve Maraton Ekipmanları', 'meta_description' => 'Koşu ayakkabıları, kıyafetleri ve aksesuarları'],
                'en' => ['name' => 'Running and Marathon', 'meta_title' => 'Running and Marathon Equipment', 'meta_description' => 'Running shoes, apparel and accessories'],
                'children' => [
                    ['slug' => 'kosu-ayakkabilari', 'tr' => ['name' => 'Koşu Ayakkabıları'], 'en' => ['name' => 'Running Shoes']],
                    ['slug' => 'kosu-kiyafetleri', 'tr' => ['name' => 'Koşu Kıyafetleri'], 'en' => ['name' => 'Running Apparel']],
                    ['slug' => 'kosu-aksesuarlari', 'tr' => ['name' => 'Koşu Aksesuarları'], 'en' => ['name' => 'Running Accessories']],
                ],
            ],

            // ============ BİSİKLET ============
            [
                'slug' => 'bisiklet',
                'type' => 'cycling',
                'parent_id' => null,
                'level' => 1,
                'order' => 9,
                'tr' => ['name' => 'Bisiklet', 'meta_title' => 'Bisiklet ve Aksesuarları', 'meta_description' => 'Bisikletler, bisiklet aksesuarları ve yedek parçalar'],
                'en' => ['name' => 'Cycling', 'meta_title' => 'Bicycles and Accessories', 'meta_description' => 'Bicycles, cycling accessories and spare parts'],
                'children' => [
                    ['slug' => 'bisikletler', 'tr' => ['name' => 'Bisikletler'], 'en' => ['name' => 'Bicycles']],
                    ['slug' => 'bisiklet-aksesuarlari', 'tr' => ['name' => 'Bisiklet Aksesuarları'], 'en' => ['name' => 'Cycling Accessories']],
                    ['slug' => 'bisiklet-giyim', 'tr' => ['name' => 'Bisiklet Giyim'], 'en' => ['name' => 'Cycling Apparel']],
                    ['slug' => 'bisiklet-kask', 'tr' => ['name' => 'Bisiklet Kaskları'], 'en' => ['name' => 'Cycling Helmets']],
                ],
            ],

            // ============ DÖVÜŞ SPORLARI ============
            [
                'slug' => 'dovus-sporlari',
                'type' => 'combat-sports',
                'parent_id' => null,
                'level' => 1,
                'order' => 10,
                'tr' => ['name' => 'Dövüş Sporları', 'meta_title' => 'Dövüş Sporları Ekipmanları', 'meta_description' => 'Boks, kickboks, MMA ekipmanları'],
                'en' => ['name' => 'Combat Sports', 'meta_title' => 'Combat Sports Equipment', 'meta_description' => 'Boxing, kickboxing, MMA equipment'],
                'children' => [
                    ['slug' => 'boks', 'tr' => ['name' => 'Boks'], 'en' => ['name' => 'Boxing']],
                    ['slug' => 'kickboks', 'tr' => ['name' => 'Kickboks'], 'en' => ['name' => 'Kickboxing']],
                    ['slug' => 'mma', 'tr' => ['name' => 'MMA'], 'en' => ['name' => 'MMA']],
                    ['slug' => 'judo-karate', 'tr' => ['name' => 'Judo ve Karate'], 'en' => ['name' => 'Judo and Karate']],
                ],
            ],

            // ============ KIŞ SPORLARI ============
            [
                'slug' => 'kis-sporlari',
                'type' => 'winter-sports',
                'parent_id' => null,
                'level' => 1,
                'order' => 11,
                'tr' => ['name' => 'Kış Sporları', 'meta_title' => 'Kış Sporları Ekipmanları', 'meta_description' => 'Kayak, snowboard ve kış sporları ekipmanları'],
                'en' => ['name' => 'Winter Sports', 'meta_title' => 'Winter Sports Equipment', 'meta_description' => 'Ski, snowboard and winter sports equipment'],
                'children' => [
                    ['slug' => 'kayak', 'tr' => ['name' => 'Kayak'], 'en' => ['name' => 'Skiing']],
                    ['slug' => 'snowboard', 'tr' => ['name' => 'Snowboard'], 'en' => ['name' => 'Snowboard']],
                    ['slug' => 'kis-giyim', 'tr' => ['name' => 'Kış Giyim'], 'en' => ['name' => 'Winter Clothing']],
                    ['slug' => 'kis-aksesuarlari', 'tr' => ['name' => 'Kış Aksesuarları'], 'en' => ['name' => 'Winter Accessories']],
                ],
            ],

            // ============ SPOR ELEKTRONİĞİ ============
            [
                'slug' => 'spor-elektronigi',
                'type' => 'electronics',
                'parent_id' => null,
                'level' => 1,
                'order' => 12,
                'tr' => ['name' => 'Spor Elektroniği', 'meta_title' => 'Spor Elektroniği', 'meta_description' => 'Akıllı saatler, fitness bileklikleri ve spor elektronik cihazları'],
                'en' => ['name' => 'Sports Electronics', 'meta_title' => 'Sports Electronics', 'meta_description' => 'Smart watches, fitness bands and sports electronic devices'],
                'children' => [
                    ['slug' => 'akilli-saatler', 'tr' => ['name' => 'Akıllı Saatler'], 'en' => ['name' => 'Smart Watches']],
                    ['slug' => 'fitness-bileklikleri', 'tr' => ['name' => 'Fitness Bileklikleri'], 'en' => ['name' => 'Fitness Bands']],
                    ['slug' => 'spor-kulakliklari', 'tr' => ['name' => 'Spor Kulaklıkları'], 'en' => ['name' => 'Sports Headphones']],
                    ['slug' => 'aksiyon-kameralari', 'tr' => ['name' => 'Aksiyon Kameraları'], 'en' => ['name' => 'Action Cameras']],
                    ['slug' => 'bisiklet-bilgisayarlari', 'tr' => ['name' => 'Bisiklet Bilgisayarları'], 'en' => ['name' => 'Bike Computers']],
                    ['slug' => 'gps-cihazlari', 'tr' => ['name' => 'GPS Cihazları'], 'en' => ['name' => 'GPS Devices']],
                ],
            ],

            // ============ ÇANTA & AKSESUAR ============
            [
                'slug' => 'canta-aksesuar',
                'type' => 'bags',
                'parent_id' => null,
                'level' => 1,
                'order' => 13,
                'tr' => ['name' => 'Çanta ve Aksesuar', 'meta_title' => 'Çanta ve Aksesuar', 'meta_description' => 'Spor çantaları, sırt çantaları ve aksesuarlar'],
                'en' => ['name' => 'Bags and Accessories', 'meta_title' => 'Bags and Accessories', 'meta_description' => 'Sports bags, backpacks and accessories'],
                'children' => [
                    ['slug' => 'spor-cantalari', 'tr' => ['name' => 'Spor Çantaları'], 'en' => ['name' => 'Sports Bags']],
                    ['slug' => 'sirt-cantalari', 'tr' => ['name' => 'Sırt Çantaları'], 'en' => ['name' => 'Backpacks']],
                    ['slug' => 'gozlukler', 'tr' => ['name' => 'Gözlükler'], 'en' => ['name' => 'Sunglasses']],
                    ['slug' => 'saatler', 'tr' => ['name' => 'Saatler'], 'en' => ['name' => 'Watches']],
                    ['slug' => 'kaslar', 'tr' => ['name' => 'Kasklar'], 'en' => ['name' => 'Helmets']],
                ],
            ],

            // ============ KİŞİSEL BAKIM ============
            [
                'slug' => 'kisisel-bakim',
                'type' => 'cosmetics',
                'parent_id' => null,
                'level' => 1,
                'order' => 14,
                'tr' => ['name' => 'Kişisel Bakım', 'meta_title' => 'Kişisel Bakım', 'meta_description' => 'Cilt, saç ve kişisel bakım ürünleri'],
                'en' => ['name' => 'Personal Care', 'meta_title' => 'Personal Care', 'meta_description' => 'Skin, hair and personal care products'],
                'children' => [
                    ['slug' => 'cilt-bakimi', 'tr' => ['name' => 'Cilt Bakımı'], 'en' => ['name' => 'Skin Care']],
                    ['slug' => 'sac-bakimi', 'tr' => ['name' => 'Saç Bakımı'], 'en' => ['name' => 'Hair Care']],
                    ['slug' => 'vucut-bakimi', 'tr' => ['name' => 'Vücut Bakımı'], 'en' => ['name' => 'Body Care']],
                    ['slug' => 'spor-hijyen', 'tr' => ['name' => 'Spor Hijyen'], 'en' => ['name' => 'Sports Hygiene']],
                ],
            ],

            // ============ DOĞAL & ORGANİK ============
            [
                'slug' => 'dogal-organik',
                'type' => 'organic',
                'parent_id' => null,
                'level' => 1,
                'order' => 15,
                'tr' => ['name' => 'Doğal ve Organik', 'meta_title' => 'Doğal ve Organik Ürünler', 'meta_description' => 'Organik gıda ve doğal ürünler'],
                'en' => ['name' => 'Natural and Organic', 'meta_title' => 'Natural and Organic Products', 'meta_description' => 'Organic food and natural products'],
                'children' => [
                    ['slug' => 'organik-gida', 'tr' => ['name' => 'Organik Gıda'], 'en' => ['name' => 'Organic Food']],
                    ['slug' => 'dogal-takviyeler', 'tr' => ['name' => 'Doğal Takviyeler'], 'en' => ['name' => 'Natural Supplements']],
                    ['slug' => 'aktariye', 'tr' => ['name' => 'Aktariye'], 'en' => ['name' => 'Herbal Products']],
                ],
            ],

            // ============ KİTAPLAR ============
            [
                'slug' => 'kitaplar',
                'type' => 'books',
                'parent_id' => null,
                'level' => 1,
                'order' => 16,
                'tr' => ['name' => 'Kitaplar', 'meta_title' => 'Spor ve Outdoor Kitapları', 'meta_description' => 'Spor, fitness, outdoor ve macera kitapları'],
                'en' => ['name' => 'Books', 'meta_title' => 'Sports and Outdoor Books', 'meta_description' => 'Sports, fitness, outdoor and adventure books'],
                'children' => [
                    ['slug' => 'spor-fitness-kitaplari', 'tr' => ['name' => 'Spor ve Fitness Kitapları'], 'en' => ['name' => 'Sports and Fitness Books']],
                    ['slug' => 'outdoor-macera-kitaplari', 'tr' => ['name' => 'Outdoor ve Macera Kitapları'], 'en' => ['name' => 'Outdoor and Adventure Books']],
                    ['slug' => 'dagcilik-tirmanis-kitaplari', 'tr' => ['name' => 'Dağcılık ve Tırmanış Kitapları'], 'en' => ['name' => 'Mountaineering and Climbing Books']],
                    ['slug' => 'beslenme-saglik-kitaplari', 'tr' => ['name' => 'Beslenme ve Sağlık Kitapları'], 'en' => ['name' => 'Nutrition and Health Books']],
                ],
            ],
        ];

        DB::transaction(function () use ($categories) {
            // Clean existing data
            DB::table('translations')
                ->where('translatable_type', 'App\\Models\\ProductCategory')
                ->delete();
            DB::table('product_category')->delete();

            foreach ($categories as $index => $category) {
                $parentId = $this->createCategory($category, null, null, null, $index + 1);

                if (isset($category['children'])) {
                    // Get parent category name for paths
                    $parentName = $category['tr']['name'];

                    foreach ($category['children'] as $childIndex => $child) {
                        $child['type'] = $category['type'];
                        $child['parent_id'] = $parentId;
                        $child['level'] = 2;
                        $child['order'] = $childIndex + 1;
                        $this->createCategory($child, $parentId, $parentName, (string)$parentId, $childIndex + 1);
                    }
                }
            }
        });

        echo "Categories seeded successfully!\n";
    }

    private function createCategory(array $data, ?int $parentId, ?string $parentName, ?string $parentPath, int $order): int
    {
        $trData = $data['tr'];
        $enData = $data['en'] ?? $data['tr'];

        // Build category_name_paths and parent_path for children
        $categoryNamePaths = $parentName ?? null;
        $categoryParentPath = $parentPath ?? null;

        $categoryId = DB::table('product_category')->insertGetId([
            'category_name' => $trData['name'],
            'category_slug' => $data['slug'],
            'type' => $data['type'] ?? 'ecommerce',
            'category_name_paths' => $categoryNamePaths,
            'parent_path' => $categoryParentPath,
            'parent_id' => $parentId,
            'category_level' => $data['level'] ?? ($parentId ? 2 : 1),
            'display_order' => $order,
            'is_featured' => 1,
            'status' => 1,
            'meta_title' => $trData['meta_title'] ?? $trData['name'],
            'meta_description' => $trData['meta_description'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // TR translations (default)
        $this->addTranslation($categoryId, 'df', 'category_name', $trData['name']);
        $this->addTranslation($categoryId, 'df', 'meta_title', $trData['meta_title'] ?? $trData['name']);
        if (isset($trData['meta_description'])) {
            $this->addTranslation($categoryId, 'df', 'meta_description', $trData['meta_description']);
        }

        // TR translations
        $this->addTranslation($categoryId, 'tr', 'category_name', $trData['name']);
        $this->addTranslation($categoryId, 'tr', 'meta_title', $trData['meta_title'] ?? $trData['name']);
        if (isset($trData['meta_description'])) {
            $this->addTranslation($categoryId, 'tr', 'meta_description', $trData['meta_description']);
        }

        // EN translations
        $this->addTranslation($categoryId, 'en', 'category_name', $enData['name']);
        $this->addTranslation($categoryId, 'en', 'meta_title', $enData['meta_title'] ?? $enData['name']);
        if (isset($enData['meta_description'])) {
            $this->addTranslation($categoryId, 'en', 'meta_description', $enData['meta_description']);
        }

        return $categoryId;
    }

    private function addTranslation(int $id, string $lang, string $key, string $value): void
    {
        DB::table('translations')->insert([
            'translatable_id' => $id,
            'translatable_type' => 'App\\Models\\ProductCategory',
            'language' => $lang,
            'key' => $key,
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
