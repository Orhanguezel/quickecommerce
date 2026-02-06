<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StoreTypesSeeder extends Seeder
{
    public function run(): void
    {
        $storeTypes = [
            // ============ ANA TÜRLER ============
            [
                'id' => 1,
                'type' => 'ecommerce',
                'tr' => [
                    'name' => 'E-Ticaret',
                    'description' => 'Genel e-ticaret mağazası. Her türlü ürün satışı.',
                ],
                'en' => [
                    'name' => 'E-Commerce',
                    'description' => 'General e-commerce store. All types of products.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 2,
                'type' => 'sports',
                'tr' => [
                    'name' => 'Spor Mağazası',
                    'description' => 'Spor giyim, ayakkabı, ekipman ve aksesuarlar.',
                ],
                'en' => [
                    'name' => 'Sports Store',
                    'description' => 'Sports clothing, footwear, equipment and accessories.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 3,
                'type' => 'supplements',
                'tr' => [
                    'name' => 'Besin Takviyesi',
                    'description' => 'Protein, vitamin, mineral ve sporcu takviyeleri.',
                ],
                'en' => [
                    'name' => 'Supplements',
                    'description' => 'Protein, vitamins, minerals and sports supplements.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 4,
                'type' => 'fitness',
                'tr' => [
                    'name' => 'Fitness Ekipmanları',
                    'description' => 'Ev ve profesyonel fitness ekipmanları, ağırlıklar.',
                ],
                'en' => [
                    'name' => 'Fitness Equipment',
                    'description' => 'Home and professional fitness equipment, weights.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 5,
                'type' => 'outdoor',
                'tr' => [
                    'name' => 'Outdoor & Kamp',
                    'description' => 'Kamp, doğa yürüyüşü ve outdoor ekipmanları.',
                ],
                'en' => [
                    'name' => 'Outdoor & Camping',
                    'description' => 'Camping, hiking and outdoor equipment.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 6,
                'type' => 'clothing',
                'tr' => [
                    'name' => 'Giyim',
                    'description' => 'Kadın, erkek, çocuk giyim ve sezon ürünleri.',
                ],
                'en' => [
                    'name' => 'Clothing',
                    'description' => 'Women, men, children clothing and seasonal products.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 7,
                'type' => 'footwear',
                'tr' => [
                    'name' => 'Ayakkabı',
                    'description' => 'Spor ayakkabı, koşu ayakkabısı, outdoor bot ve terlik.',
                ],
                'en' => [
                    'name' => 'Footwear',
                    'description' => 'Sports shoes, running shoes, outdoor boots and slippers.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 8,
                'type' => 'electronics',
                'tr' => [
                    'name' => 'Spor Elektroniği',
                    'description' => 'Akıllı saatler, fitness bileklikleri, spor kulaklıkları.',
                ],
                'en' => [
                    'name' => 'Sports Electronics',
                    'description' => 'Smart watches, fitness bands, sports headphones.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 9,
                'type' => 'bags',
                'tr' => [
                    'name' => 'Çanta & Aksesuar',
                    'description' => 'Spor çantaları, sırt çantaları, gözlükler ve aksesuarlar.',
                ],
                'en' => [
                    'name' => 'Bags & Accessories',
                    'description' => 'Sports bags, backpacks, sunglasses and accessories.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 10,
                'type' => 'organic',
                'tr' => [
                    'name' => 'Doğal & Organik',
                    'description' => 'Organik gıda, doğal ürünler ve aktariye.',
                ],
                'en' => [
                    'name' => 'Natural & Organic',
                    'description' => 'Organic food, natural products and herbal items.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 11,
                'type' => 'cosmetics',
                'tr' => [
                    'name' => 'Kişisel Bakım',
                    'description' => 'Cilt bakımı, saç bakımı, makyaj ve kişisel bakım ürünleri.',
                ],
                'en' => [
                    'name' => 'Personal Care',
                    'description' => 'Skin care, hair care, makeup and personal care products.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 12,
                'type' => 'cycling',
                'tr' => [
                    'name' => 'Bisiklet',
                    'description' => 'Bisikletler, bisiklet aksesuarları ve yedek parçalar.',
                ],
                'en' => [
                    'name' => 'Cycling',
                    'description' => 'Bicycles, cycling accessories and spare parts.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 13,
                'type' => 'swimming',
                'tr' => [
                    'name' => 'Yüzme',
                    'description' => 'Yüzme kıyafetleri, gözlükler, boneler ve yüzme ekipmanları.',
                ],
                'en' => [
                    'name' => 'Swimming',
                    'description' => 'Swimwear, goggles, caps and swimming equipment.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 14,
                'type' => 'team-sports',
                'tr' => [
                    'name' => 'Takım Sporları',
                    'description' => 'Futbol, basketbol, voleybol ve takım sporu ekipmanları.',
                ],
                'en' => [
                    'name' => 'Team Sports',
                    'description' => 'Football, basketball, volleyball and team sports equipment.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 15,
                'type' => 'racket-sports',
                'tr' => [
                    'name' => 'Raket Sporları',
                    'description' => 'Tenis, badminton, squash raketleri ve ekipmanları.',
                ],
                'en' => [
                    'name' => 'Racket Sports',
                    'description' => 'Tennis, badminton, squash rackets and equipment.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 16,
                'type' => 'combat-sports',
                'tr' => [
                    'name' => 'Dövüş Sporları',
                    'description' => 'Boks, kickboks, MMA ve dövüş sporları ekipmanları.',
                ],
                'en' => [
                    'name' => 'Combat Sports',
                    'description' => 'Boxing, kickboxing, MMA and combat sports equipment.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 17,
                'type' => 'winter-sports',
                'tr' => [
                    'name' => 'Kış Sporları',
                    'description' => 'Kayak, snowboard ve kış sporları ekipmanları.',
                ],
                'en' => [
                    'name' => 'Winter Sports',
                    'description' => 'Ski, snowboard and winter sports equipment.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
            [
                'id' => 18,
                'type' => 'running',
                'tr' => [
                    'name' => 'Koşu & Maraton',
                    'description' => 'Koşu ayakkabıları, koşu kıyafetleri ve aksesuarları.',
                ],
                'en' => [
                    'name' => 'Running & Marathon',
                    'description' => 'Running shoes, running apparel and accessories.',
                ],
                'image' => '1297',
                'status' => 1,
            ],
        ];

        DB::transaction(function () use ($storeTypes) {
            foreach ($storeTypes as $storeType) {
                $trData = $storeType['tr'];
                $enData = $storeType['en'];

                // Upsert store type
                DB::table('store_types')->upsert(
                    [[
                        'id' => $storeType['id'],
                        'name' => $trData['name'],
                        'type' => $storeType['type'],
                        'image' => $storeType['image'],
                        'description' => $trData['description'],
                        'total_stores' => 0,
                        'additional_charge_enable_disable' => 0,
                        'additional_charge_name' => 'Paketleme Ücreti',
                        'additional_charge_amount' => 0,
                        'additional_charge_type' => 'fixed',
                        'additional_charge_commission' => 0,
                        'status' => $storeType['status'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]],
                    ['id'],
                    ['name', 'type', 'image', 'description', 'status', 'updated_at']
                );

                // Delete existing translations
                DB::table('translations')
                    ->where('translatable_id', $storeType['id'])
                    ->where('translatable_type', 'App\\Models\\StoreType')
                    ->delete();

                // Add translations
                $translations = [];

                // DF (default) - Turkish
                $translations[] = [
                    'translatable_id' => $storeType['id'],
                    'translatable_type' => 'App\\Models\\StoreType',
                    'language' => 'df',
                    'key' => 'name',
                    'value' => $trData['name'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $translations[] = [
                    'translatable_id' => $storeType['id'],
                    'translatable_type' => 'App\\Models\\StoreType',
                    'language' => 'df',
                    'key' => 'description',
                    'value' => $trData['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // TR
                $translations[] = [
                    'translatable_id' => $storeType['id'],
                    'translatable_type' => 'App\\Models\\StoreType',
                    'language' => 'tr',
                    'key' => 'name',
                    'value' => $trData['name'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $translations[] = [
                    'translatable_id' => $storeType['id'],
                    'translatable_type' => 'App\\Models\\StoreType',
                    'language' => 'tr',
                    'key' => 'description',
                    'value' => $trData['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // EN
                $translations[] = [
                    'translatable_id' => $storeType['id'],
                    'translatable_type' => 'App\\Models\\StoreType',
                    'language' => 'en',
                    'key' => 'name',
                    'value' => $enData['name'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $translations[] = [
                    'translatable_id' => $storeType['id'],
                    'translatable_type' => 'App\\Models\\StoreType',
                    'language' => 'en',
                    'key' => 'description',
                    'value' => $enData['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                DB::table('translations')->insert($translations);
            }
        });

        echo "Store types seeded successfully! Total: " . count($storeTypes) . "\n";
    }
}
