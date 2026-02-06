<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProductAttributeSeeder extends Seeder
{
    public function run(): void
    {
        $attributes = [
            // ============ GENEL (TÜM MAĞAZA TÜRLERİ) ============
            [
                'tr' => 'Renk',
                'en' => 'Color',
                'type' => 'select',
                'store_type' => null, // tüm türler için geçerli
                'values' => [
                    ['tr' => 'Siyah', 'en' => 'Black'],
                    ['tr' => 'Beyaz', 'en' => 'White'],
                    ['tr' => 'Kırmızı', 'en' => 'Red'],
                    ['tr' => 'Mavi', 'en' => 'Blue'],
                    ['tr' => 'Yeşil', 'en' => 'Green'],
                    ['tr' => 'Sarı', 'en' => 'Yellow'],
                    ['tr' => 'Turuncu', 'en' => 'Orange'],
                    ['tr' => 'Mor', 'en' => 'Purple'],
                    ['tr' => 'Pembe', 'en' => 'Pink'],
                    ['tr' => 'Gri', 'en' => 'Gray'],
                    ['tr' => 'Lacivert', 'en' => 'Navy Blue'],
                    ['tr' => 'Kahverengi', 'en' => 'Brown'],
                    ['tr' => 'Bej', 'en' => 'Beige'],
                ],
            ],
            [
                'tr' => 'Cinsiyet',
                'en' => 'Gender',
                'type' => 'select',
                'store_type' => null,
                'values' => [
                    ['tr' => 'Erkek', 'en' => 'Men'],
                    ['tr' => 'Kadın', 'en' => 'Women'],
                    ['tr' => 'Unisex', 'en' => 'Unisex'],
                    ['tr' => 'Çocuk', 'en' => 'Kids'],
                ],
            ],
            [
                'tr' => 'Yaş Grubu',
                'en' => 'Age Group',
                'type' => 'select',
                'store_type' => null,
                'values' => [
                    ['tr' => 'Yetişkin', 'en' => 'Adult'],
                    ['tr' => 'Genç', 'en' => 'Teen'],
                    ['tr' => 'Çocuk', 'en' => 'Kids'],
                    ['tr' => 'Bebek', 'en' => 'Baby'],
                ],
            ],

            // ============ GİYİM (clothing) ============
            [
                'tr' => 'Beden',
                'en' => 'Size',
                'type' => 'select',
                'store_type' => 'clothing',
                'values' => [
                    ['tr' => 'XS', 'en' => 'XS'],
                    ['tr' => 'S', 'en' => 'S'],
                    ['tr' => 'M', 'en' => 'M'],
                    ['tr' => 'L', 'en' => 'L'],
                    ['tr' => 'XL', 'en' => 'XL'],
                    ['tr' => 'XXL', 'en' => 'XXL'],
                    ['tr' => '3XL', 'en' => '3XL'],
                ],
            ],
            [
                'tr' => 'Malzeme',
                'en' => 'Material',
                'type' => 'select',
                'store_type' => 'clothing',
                'values' => [
                    ['tr' => 'Pamuk', 'en' => 'Cotton'],
                    ['tr' => 'Polyester', 'en' => 'Polyester'],
                    ['tr' => 'Naylon', 'en' => 'Nylon'],
                    ['tr' => 'Yün', 'en' => 'Wool'],
                    ['tr' => 'Deri', 'en' => 'Leather'],
                    ['tr' => 'Keten', 'en' => 'Linen'],
                    ['tr' => 'İpek', 'en' => 'Silk'],
                    ['tr' => 'Kadife', 'en' => 'Velvet'],
                    ['tr' => 'Polar', 'en' => 'Fleece'],
                    ['tr' => 'Gore-Tex', 'en' => 'Gore-Tex'],
                ],
            ],

            // ============ AYAKKABI (footwear) ============
            [
                'tr' => 'Numara',
                'en' => 'Shoe Size',
                'type' => 'select',
                'store_type' => 'footwear',
                'values' => [
                    ['tr' => '36', 'en' => '36'],
                    ['tr' => '37', 'en' => '37'],
                    ['tr' => '38', 'en' => '38'],
                    ['tr' => '39', 'en' => '39'],
                    ['tr' => '40', 'en' => '40'],
                    ['tr' => '41', 'en' => '41'],
                    ['tr' => '42', 'en' => '42'],
                    ['tr' => '43', 'en' => '43'],
                    ['tr' => '44', 'en' => '44'],
                    ['tr' => '45', 'en' => '45'],
                    ['tr' => '46', 'en' => '46'],
                ],
            ],

            // ============ BESİN TAKVİYELERİ (supplements) ============
            [
                'tr' => 'Tat/Aroma',
                'en' => 'Flavor',
                'type' => 'select',
                'store_type' => 'supplements',
                'values' => [
                    ['tr' => 'Çikolata', 'en' => 'Chocolate'],
                    ['tr' => 'Vanilya', 'en' => 'Vanilla'],
                    ['tr' => 'Çilek', 'en' => 'Strawberry'],
                    ['tr' => 'Muz', 'en' => 'Banana'],
                    ['tr' => 'Karamel', 'en' => 'Caramel'],
                    ['tr' => 'Fındık', 'en' => 'Hazelnut'],
                    ['tr' => 'Hindistan Cevizi', 'en' => 'Coconut'],
                    ['tr' => 'Kurabiye', 'en' => 'Cookies'],
                    ['tr' => 'Limon', 'en' => 'Lemon'],
                    ['tr' => 'Portakal', 'en' => 'Orange'],
                    ['tr' => 'Ananas', 'en' => 'Pineapple'],
                    ['tr' => 'Karpuz', 'en' => 'Watermelon'],
                    ['tr' => 'Aromasız', 'en' => 'Unflavored'],
                ],
            ],
            [
                'tr' => 'Ağırlık',
                'en' => 'Weight',
                'type' => 'select',
                'store_type' => 'supplements',
                'values' => [
                    ['tr' => '300g', 'en' => '300g'],
                    ['tr' => '500g', 'en' => '500g'],
                    ['tr' => '750g', 'en' => '750g'],
                    ['tr' => '1kg', 'en' => '1kg'],
                    ['tr' => '1.5kg', 'en' => '1.5kg'],
                    ['tr' => '2kg', 'en' => '2kg'],
                    ['tr' => '2.27kg', 'en' => '2.27kg'],
                    ['tr' => '2.5kg', 'en' => '2.5kg'],
                    ['tr' => '3kg', 'en' => '3kg'],
                    ['tr' => '4kg', 'en' => '4kg'],
                    ['tr' => '5kg', 'en' => '5kg'],
                ],
            ],
            [
                'tr' => 'Kapsül/Tablet Sayısı',
                'en' => 'Capsule/Tablet Count',
                'type' => 'select',
                'store_type' => 'supplements',
                'values' => [
                    ['tr' => '30 Tablet', 'en' => '30 Tablets'],
                    ['tr' => '60 Tablet', 'en' => '60 Tablets'],
                    ['tr' => '90 Tablet', 'en' => '90 Tablets'],
                    ['tr' => '100 Tablet', 'en' => '100 Tablets'],
                    ['tr' => '120 Tablet', 'en' => '120 Tablets'],
                    ['tr' => '180 Tablet', 'en' => '180 Tablets'],
                    ['tr' => '200 Tablet', 'en' => '200 Tablets'],
                    ['tr' => '30 Kapsül', 'en' => '30 Capsules'],
                    ['tr' => '60 Kapsül', 'en' => '60 Capsules'],
                    ['tr' => '90 Kapsül', 'en' => '90 Capsules'],
                    ['tr' => '100 Kapsül', 'en' => '100 Capsules'],
                    ['tr' => '120 Kapsül', 'en' => '120 Capsules'],
                ],
            ],
            [
                'tr' => 'Hacim',
                'en' => 'Volume',
                'type' => 'select',
                'store_type' => 'supplements',
                'values' => [
                    ['tr' => '250ml', 'en' => '250ml'],
                    ['tr' => '500ml', 'en' => '500ml'],
                    ['tr' => '750ml', 'en' => '750ml'],
                    ['tr' => '1L', 'en' => '1L'],
                    ['tr' => '1.5L', 'en' => '1.5L'],
                    ['tr' => '2L', 'en' => '2L'],
                ],
            ],

            // ============ FİTNESS EKİPMANLARI (fitness) ============
            [
                'tr' => 'Ağırlık (kg)',
                'en' => 'Weight (kg)',
                'type' => 'select',
                'store_type' => 'fitness',
                'values' => [
                    ['tr' => '2kg', 'en' => '2kg'],
                    ['tr' => '4kg', 'en' => '4kg'],
                    ['tr' => '6kg', 'en' => '6kg'],
                    ['tr' => '8kg', 'en' => '8kg'],
                    ['tr' => '10kg', 'en' => '10kg'],
                    ['tr' => '12kg', 'en' => '12kg'],
                    ['tr' => '14kg', 'en' => '14kg'],
                    ['tr' => '16kg', 'en' => '16kg'],
                    ['tr' => '20kg', 'en' => '20kg'],
                    ['tr' => '24kg', 'en' => '24kg'],
                    ['tr' => '32kg', 'en' => '32kg'],
                ],
            ],
            [
                'tr' => 'Direnç Seviyesi',
                'en' => 'Resistance Level',
                'type' => 'select',
                'store_type' => 'fitness',
                'values' => [
                    ['tr' => 'Çok Hafif', 'en' => 'Extra Light'],
                    ['tr' => 'Hafif', 'en' => 'Light'],
                    ['tr' => 'Orta', 'en' => 'Medium'],
                    ['tr' => 'Ağır', 'en' => 'Heavy'],
                    ['tr' => 'Çok Ağır', 'en' => 'Extra Heavy'],
                ],
            ],

            // ============ OUTDOOR & KAMP (outdoor) ============
            [
                'tr' => 'Kapasite (Kişi)',
                'en' => 'Capacity (Person)',
                'type' => 'select',
                'store_type' => 'outdoor',
                'values' => [
                    ['tr' => '1 Kişilik', 'en' => '1 Person'],
                    ['tr' => '2 Kişilik', 'en' => '2 Person'],
                    ['tr' => '3 Kişilik', 'en' => '3 Person'],
                    ['tr' => '4 Kişilik', 'en' => '4 Person'],
                    ['tr' => '6 Kişilik', 'en' => '6 Person'],
                    ['tr' => '8 Kişilik', 'en' => '8 Person'],
                ],
            ],
            [
                'tr' => 'Sıcaklık Dayanımı',
                'en' => 'Temperature Rating',
                'type' => 'select',
                'store_type' => 'outdoor',
                'values' => [
                    ['tr' => '+10°C', 'en' => '+10°C'],
                    ['tr' => '+5°C', 'en' => '+5°C'],
                    ['tr' => '0°C', 'en' => '0°C'],
                    ['tr' => '-5°C', 'en' => '-5°C'],
                    ['tr' => '-10°C', 'en' => '-10°C'],
                    ['tr' => '-15°C', 'en' => '-15°C'],
                    ['tr' => '-20°C', 'en' => '-20°C'],
                ],
            ],
            [
                'tr' => 'Termos Hacmi',
                'en' => 'Thermos Volume',
                'type' => 'select',
                'store_type' => 'outdoor',
                'values' => [
                    ['tr' => '350ml', 'en' => '350ml'],
                    ['tr' => '500ml', 'en' => '500ml'],
                    ['tr' => '750ml', 'en' => '750ml'],
                    ['tr' => '1L', 'en' => '1L'],
                    ['tr' => '1.4L', 'en' => '1.4L'],
                    ['tr' => '1.9L', 'en' => '1.9L'],
                ],
            ],

            // ============ SPOR ELEKTRONİĞİ (electronics) ============
            [
                'tr' => 'Ekran Boyutu',
                'en' => 'Screen Size',
                'type' => 'select',
                'store_type' => 'electronics',
                'values' => [
                    ['tr' => '1.1"', 'en' => '1.1"'],
                    ['tr' => '1.2"', 'en' => '1.2"'],
                    ['tr' => '1.3"', 'en' => '1.3"'],
                    ['tr' => '1.4"', 'en' => '1.4"'],
                    ['tr' => '1.5"', 'en' => '1.5"'],
                    ['tr' => '1.6"', 'en' => '1.6"'],
                ],
            ],
            [
                'tr' => 'Pil Ömrü',
                'en' => 'Battery Life',
                'type' => 'select',
                'store_type' => 'electronics',
                'values' => [
                    ['tr' => '5 Gün', 'en' => '5 Days'],
                    ['tr' => '7 Gün', 'en' => '7 Days'],
                    ['tr' => '10 Gün', 'en' => '10 Days'],
                    ['tr' => '14 Gün', 'en' => '14 Days'],
                    ['tr' => '21 Gün', 'en' => '21 Days'],
                    ['tr' => '30 Gün', 'en' => '30 Days'],
                ],
            ],
            [
                'tr' => 'Güç/Watt',
                'en' => 'Power/Watt',
                'type' => 'select',
                'store_type' => 'electronics',
                'values' => [
                    ['tr' => '5W', 'en' => '5W'],
                    ['tr' => '10W', 'en' => '10W'],
                    ['tr' => '20W', 'en' => '20W'],
                    ['tr' => '50W', 'en' => '50W'],
                    ['tr' => '100W', 'en' => '100W'],
                ],
            ],

            // ============ ÇANTA & AKSESUAR (bags) ============
            [
                'tr' => 'Boyut (Litre)',
                'en' => 'Size (Liter)',
                'type' => 'select',
                'store_type' => 'bags',
                'values' => [
                    ['tr' => '10L', 'en' => '10L'],
                    ['tr' => '15L', 'en' => '15L'],
                    ['tr' => '20L', 'en' => '20L'],
                    ['tr' => '25L', 'en' => '25L'],
                    ['tr' => '30L', 'en' => '30L'],
                    ['tr' => '35L', 'en' => '35L'],
                    ['tr' => '40L', 'en' => '40L'],
                    ['tr' => '50L', 'en' => '50L'],
                    ['tr' => '60L', 'en' => '60L'],
                    ['tr' => '70L', 'en' => '70L'],
                ],
            ],

            // ============ TAKIM SPORLARI (team-sports) ============
            [
                'tr' => 'Top Numarası',
                'en' => 'Ball Size',
                'type' => 'select',
                'store_type' => 'team-sports',
                'values' => [
                    ['tr' => '3 Numara', 'en' => 'Size 3'],
                    ['tr' => '4 Numara', 'en' => 'Size 4'],
                    ['tr' => '5 Numara', 'en' => 'Size 5'],
                    ['tr' => '6 Numara', 'en' => 'Size 6'],
                    ['tr' => '7 Numara', 'en' => 'Size 7'],
                ],
            ],

            // ============ RAKET SPORLARI (racket-sports) ============
            [
                'tr' => 'Sap Kalınlığı',
                'en' => 'Grip Size',
                'type' => 'select',
                'store_type' => 'racket-sports',
                'values' => [
                    ['tr' => 'L0', 'en' => 'L0'],
                    ['tr' => 'L1', 'en' => 'L1'],
                    ['tr' => 'L2', 'en' => 'L2'],
                    ['tr' => 'L3', 'en' => 'L3'],
                    ['tr' => 'L4', 'en' => 'L4'],
                    ['tr' => 'L5', 'en' => 'L5'],
                ],
            ],
            [
                'tr' => 'Raket Ağırlığı',
                'en' => 'Racket Weight',
                'type' => 'select',
                'store_type' => 'racket-sports',
                'values' => [
                    ['tr' => '260g', 'en' => '260g'],
                    ['tr' => '270g', 'en' => '270g'],
                    ['tr' => '280g', 'en' => '280g'],
                    ['tr' => '290g', 'en' => '290g'],
                    ['tr' => '300g', 'en' => '300g'],
                    ['tr' => '310g', 'en' => '310g'],
                    ['tr' => '320g', 'en' => '320g'],
                ],
            ],

            // ============ YÜZME (swimming) ============
            [
                'tr' => 'Mayo Bedeni',
                'en' => 'Swimwear Size',
                'type' => 'select',
                'store_type' => 'swimming',
                'values' => [
                    ['tr' => '32', 'en' => '32'],
                    ['tr' => '34', 'en' => '34'],
                    ['tr' => '36', 'en' => '36'],
                    ['tr' => '38', 'en' => '38'],
                    ['tr' => '40', 'en' => '40'],
                    ['tr' => '42', 'en' => '42'],
                    ['tr' => '44', 'en' => '44'],
                ],
            ],

            // ============ DÖVÜŞ SPORLARI (combat-sports) ============
            [
                'tr' => 'Eldiven Ağırlığı',
                'en' => 'Glove Weight',
                'type' => 'select',
                'store_type' => 'combat-sports',
                'values' => [
                    ['tr' => '8oz', 'en' => '8oz'],
                    ['tr' => '10oz', 'en' => '10oz'],
                    ['tr' => '12oz', 'en' => '12oz'],
                    ['tr' => '14oz', 'en' => '14oz'],
                    ['tr' => '16oz', 'en' => '16oz'],
                ],
            ],

            // ============ BİSİKLET (cycling) ============
            [
                'tr' => 'Kadro Boyu',
                'en' => 'Frame Size',
                'type' => 'select',
                'store_type' => 'cycling',
                'values' => [
                    ['tr' => 'XS (13")', 'en' => 'XS (13")'],
                    ['tr' => 'S (15")', 'en' => 'S (15")'],
                    ['tr' => 'M (17")', 'en' => 'M (17")'],
                    ['tr' => 'L (19")', 'en' => 'L (19")'],
                    ['tr' => 'XL (21")', 'en' => 'XL (21")'],
                ],
            ],
            [
                'tr' => 'Tekerlek Boyu',
                'en' => 'Wheel Size',
                'type' => 'select',
                'store_type' => 'cycling',
                'values' => [
                    ['tr' => '20"', 'en' => '20"'],
                    ['tr' => '24"', 'en' => '24"'],
                    ['tr' => '26"', 'en' => '26"'],
                    ['tr' => '27.5"', 'en' => '27.5"'],
                    ['tr' => '29"', 'en' => '29"'],
                    ['tr' => '700c', 'en' => '700c'],
                ],
            ],

            // ============ KIŞ SPORLARI (winter-sports) ============
            [
                'tr' => 'Kayak Boyu',
                'en' => 'Ski Length',
                'type' => 'select',
                'store_type' => 'winter-sports',
                'values' => [
                    ['tr' => '140cm', 'en' => '140cm'],
                    ['tr' => '150cm', 'en' => '150cm'],
                    ['tr' => '160cm', 'en' => '160cm'],
                    ['tr' => '165cm', 'en' => '165cm'],
                    ['tr' => '170cm', 'en' => '170cm'],
                    ['tr' => '175cm', 'en' => '175cm'],
                    ['tr' => '180cm', 'en' => '180cm'],
                ],
            ],
            [
                'tr' => 'Bot Numarası',
                'en' => 'Boot Size',
                'type' => 'select',
                'store_type' => 'winter-sports',
                'values' => [
                    ['tr' => '24', 'en' => '24'],
                    ['tr' => '25', 'en' => '25'],
                    ['tr' => '26', 'en' => '26'],
                    ['tr' => '27', 'en' => '27'],
                    ['tr' => '28', 'en' => '28'],
                    ['tr' => '29', 'en' => '29'],
                    ['tr' => '30', 'en' => '30'],
                    ['tr' => '31', 'en' => '31'],
                ],
            ],
        ];

        DB::transaction(function () use ($attributes) {
            // Mevcut verileri temizle
            DB::table('translations')
                ->where('translatable_type', 'App\\Models\\ProductAttributeValue')
                ->delete();
            DB::table('translations')
                ->where('translatable_type', 'App\\Models\\ProductAttribute')
                ->delete();
            DB::table('product_attribute_values')->delete();
            DB::table('product_attributes')->delete();

            // Check if store_type column exists
            $hasStoreTypeColumn = Schema::hasColumn('product_attributes', 'store_type');

            $totalValues = 0;

            foreach ($attributes as $attr) {
                // Insert attribute
                $insertData = [
                    'name' => $attr['tr'],
                    'product_type' => $attr['type'],
                    'status' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Only add store_type if column exists
                if ($hasStoreTypeColumn) {
                    $insertData['store_type'] = $attr['store_type'];
                }

                $attrId = DB::table('product_attributes')->insertGetId($insertData);

                // Attribute translations
                $this->addTranslation($attrId, 'App\\Models\\ProductAttribute', 'df', 'name', $attr['tr']);
                $this->addTranslation($attrId, 'App\\Models\\ProductAttribute', 'tr', 'name', $attr['tr']);
                $this->addTranslation($attrId, 'App\\Models\\ProductAttribute', 'en', 'name', $attr['en']);

                // Insert attribute values with translations
                if (isset($attr['values'])) {
                    foreach ($attr['values'] as $value) {
                        $valueId = DB::table('product_attribute_values')->insertGetId([
                            'attribute_id' => $attrId,
                            'value' => $value['tr'],
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        // Value translations
                        $this->addTranslation($valueId, 'App\\Models\\ProductAttributeValue', 'df', 'value', $value['tr']);
                        $this->addTranslation($valueId, 'App\\Models\\ProductAttributeValue', 'tr', 'value', $value['tr']);
                        $this->addTranslation($valueId, 'App\\Models\\ProductAttributeValue', 'en', 'value', $value['en']);

                        $totalValues++;
                    }
                }
            }

            echo "Attributes: " . count($attributes) . ", Values: {$totalValues}\n";
        });

        echo "Product Attributes seeded successfully!\n";
    }

    private function addTranslation(int $id, string $type, string $lang, string $key, string $value): void
    {
        DB::table('translations')->insert([
            'translatable_id' => $id,
            'translatable_type' => $type,
            'language' => $lang,
            'key' => $key,
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
