<?php

namespace Database\Seeders;

use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use App\Models\ProductCategory;
use App\Models\Translation;
use Illuminate\Database\Seeder;

class CategoryProductAttributeSeeder extends Seeder
{
    public function run(): void
    {
        $categoriesData = $this->getCategoriesData();

        foreach ($categoriesData as $slug => $attributes) {
            $cat = ProductCategory::where('category_slug', $slug)->whereNull('parent_id')->first();
            if (!$cat) {
                $this->command->warn("Category not found: {$slug}");
                continue;
            }

            foreach ($attributes as $attrData) {
                $attr = ProductAttribute::firstOrCreate(
                    ['name' => $attrData['name_df'], 'category_id' => $cat->id],
                    ['product_type' => $cat->type, 'status' => 1]
                );

                // Attribute name translations
                $this->addTranslation($attr->id, ProductAttribute::class, 'name', [
                    'tr' => $attrData['name_tr'],
                    'en' => $attrData['name_en'],
                ]);

                // Values
                foreach ($attrData['values'] as $valData) {
                    $val = ProductAttributeValue::firstOrCreate(
                        ['attribute_id' => $attr->id, 'value' => $valData['df']]
                    );

                    // Value translations
                    $this->addTranslation($val->id, ProductAttributeValue::class, 'value', [
                        'tr' => $valData['tr'] ?? $valData['df'],
                        'en' => $valData['en'] ?? $valData['df'],
                    ]);
                }
            }
        }

        $this->command->info('CategoryProductAttributeSeeder: Done!');
    }

    private function addTranslation(int $id, string $type, string $key, array $langs): void
    {
        foreach ($langs as $lang => $value) {
            if (!$value) continue;
            Translation::firstOrCreate(
                ['translatable_id' => $id, 'translatable_type' => $type, 'language' => $lang, 'key' => $key],
                ['value' => $value]
            );
        }
    }

    private function getCategoriesData(): array
    {
        return [
            // ── SPORTS NUTRITION ─────────────────────────────────────
            'spor-beslenmesi' => [
                [
                    'name_df' => 'Tat / Aroma',
                    'name_tr' => 'Tat / Aroma',
                    'name_en' => 'Flavor / Aroma',
                    'values' => [
                        ['df' => 'Çikolata',      'tr' => 'Çikolata',      'en' => 'Chocolate'],
                        ['df' => 'Vanilya',        'tr' => 'Vanilya',        'en' => 'Vanilla'],
                        ['df' => 'Çilek',          'tr' => 'Çilek',          'en' => 'Strawberry'],
                        ['df' => 'Muz',            'tr' => 'Muz',            'en' => 'Banana'],
                        ['df' => 'Fıstık Ezmesi',  'tr' => 'Fıstık Ezmesi',  'en' => 'Peanut Butter'],
                        ['df' => 'Elma',           'tr' => 'Elma',           'en' => 'Apple'],
                        ['df' => 'Limon',          'tr' => 'Limon',          'en' => 'Lemon'],
                        ['df' => 'Portakal',       'tr' => 'Portakal',       'en' => 'Orange'],
                        ['df' => 'Kavun',          'tr' => 'Kavun',          'en' => 'Melon'],
                        ['df' => 'Tuzlu Karamel',  'tr' => 'Tuzlu Karamel',  'en' => 'Salted Caramel'],
                    ],
                ],
                [
                    'name_df' => 'Ağırlık',
                    'name_tr' => 'Ağırlık',
                    'name_en' => 'Weight',
                    'values' => [
                        ['df' => '250g',  'tr' => '250g',  'en' => '250g'],
                        ['df' => '500g',  'tr' => '500g',  'en' => '500g'],
                        ['df' => '750g',  'tr' => '750g',  'en' => '750g'],
                        ['df' => '1kg',   'tr' => '1kg',   'en' => '1kg'],
                        ['df' => '1.5kg', 'tr' => '1.5kg', 'en' => '1.5kg'],
                        ['df' => '2kg',   'tr' => '2kg',   'en' => '2kg'],
                        ['df' => '3kg',   'tr' => '3kg',   'en' => '3kg'],
                        ['df' => '5kg',   'tr' => '5kg',   'en' => '5kg'],
                    ],
                ],
                [
                    'name_df' => 'Form',
                    'name_tr' => 'Form',
                    'name_en' => 'Form',
                    'values' => [
                        ['df' => 'Toz',    'tr' => 'Toz',    'en' => 'Powder'],
                        ['df' => 'Kapsül', 'tr' => 'Kapsül', 'en' => 'Capsule'],
                        ['df' => 'Tablet', 'tr' => 'Tablet', 'en' => 'Tablet'],
                        ['df' => 'Jel',    'tr' => 'Jel',    'en' => 'Gel'],
                        ['df' => 'Bar',    'tr' => 'Bar',    'en' => 'Bar'],
                    ],
                ],
                [
                    'name_df' => 'Kapsül Sayısı',
                    'name_tr' => 'Kapsül Sayısı',
                    'name_en' => 'Capsule Count',
                    'values' => [
                        ['df' => '30 Kapsül',  'tr' => '30 Kapsül',  'en' => '30 Capsules'],
                        ['df' => '60 Kapsül',  'tr' => '60 Kapsül',  'en' => '60 Capsules'],
                        ['df' => '90 Kapsül',  'tr' => '90 Kapsül',  'en' => '90 Capsules'],
                        ['df' => '120 Kapsül', 'tr' => '120 Kapsül', 'en' => '120 Capsules'],
                        ['df' => '180 Kapsül', 'tr' => '180 Kapsül', 'en' => '180 Capsules'],
                        ['df' => '240 Kapsül', 'tr' => '240 Kapsül', 'en' => '240 Capsules'],
                    ],
                ],
                [
                    'name_df' => 'Hacim',
                    'name_tr' => 'Hacim',
                    'name_en' => 'Volume',
                    'values' => [
                        ['df' => '250ml', 'tr' => '250ml', 'en' => '250ml'],
                        ['df' => '500ml', 'tr' => '500ml', 'en' => '500ml'],
                        ['df' => '750ml', 'tr' => '750ml', 'en' => '750ml'],
                        ['df' => '1L',    'tr' => '1L',    'en' => '1L'],
                        ['df' => '2L',    'tr' => '2L',    'en' => '2L'],
                    ],
                ],
            ],

            // ── FITNESS & EXERCISE ────────────────────────────────────
            'fitness-egzersiz' => [
                [
                    'name_df' => 'Ağırlık (kg)',
                    'name_tr' => 'Ağırlık (kg)',
                    'name_en' => 'Weight (kg)',
                    'values' => [
                        ['df'=>'1kg','tr'=>'1kg','en'=>'1kg'],
                        ['df'=>'2kg','tr'=>'2kg','en'=>'2kg'],
                        ['df'=>'3kg','tr'=>'3kg','en'=>'3kg'],
                        ['df'=>'4kg','tr'=>'4kg','en'=>'4kg'],
                        ['df'=>'5kg','tr'=>'5kg','en'=>'5kg'],
                        ['df'=>'6kg','tr'=>'6kg','en'=>'6kg'],
                        ['df'=>'8kg','tr'=>'8kg','en'=>'8kg'],
                        ['df'=>'10kg','tr'=>'10kg','en'=>'10kg'],
                        ['df'=>'12kg','tr'=>'12kg','en'=>'12kg'],
                        ['df'=>'16kg','tr'=>'16kg','en'=>'16kg'],
                        ['df'=>'20kg','tr'=>'20kg','en'=>'20kg'],
                        ['df'=>'24kg','tr'=>'24kg','en'=>'24kg'],
                        ['df'=>'32kg','tr'=>'32kg','en'=>'32kg'],
                    ],
                ],
                [
                    'name_df' => 'Direnç Seviyesi',
                    'name_tr' => 'Direnç Seviyesi',
                    'name_en' => 'Resistance Level',
                    'values' => [
                        ['df'=>'Çok Hafif (5 lb)', 'tr'=>'Çok Hafif (5 lb)', 'en'=>'Extra Light (5 lb)'],
                        ['df'=>'Hafif (10 lb)',     'tr'=>'Hafif (10 lb)',     'en'=>'Light (10 lb)'],
                        ['df'=>'Orta (20 lb)',      'tr'=>'Orta (20 lb)',      'en'=>'Medium (20 lb)'],
                        ['df'=>'Sert (30 lb)',      'tr'=>'Sert (30 lb)',      'en'=>'Heavy (30 lb)'],
                        ['df'=>'Çok Sert (40 lb)', 'tr'=>'Çok Sert (40 lb)', 'en'=>'Extra Heavy (40 lb)'],
                    ],
                ],
                [
                    'name_df' => 'Malzeme',
                    'name_tr' => 'Malzeme',
                    'name_en' => 'Material',
                    'values' => [
                        ['df'=>'Neopren',  'tr'=>'Neopren',  'en'=>'Neoprene'],
                        ['df'=>'Kauçuk',   'tr'=>'Kauçuk',   'en'=>'Rubber'],
                        ['df'=>'Metal',    'tr'=>'Metal',    'en'=>'Metal'],
                        ['df'=>'Plastik',  'tr'=>'Plastik',  'en'=>'Plastic'],
                        ['df'=>'Köpük',    'tr'=>'Köpük',    'en'=>'Foam'],
                    ],
                ],
            ],

            // ── OUTDOOR & CAMPING ─────────────────────────────────────
            'outdoor-kamp' => [
                [
                    'name_df' => 'Kapasite',
                    'name_tr' => 'Kapasite',
                    'name_en' => 'Capacity',
                    'values' => [
                        ['df'=>'1 Kişilik','tr'=>'1 Kişilik','en'=>'1 Person'],
                        ['df'=>'2 Kişilik','tr'=>'2 Kişilik','en'=>'2 Person'],
                        ['df'=>'3 Kişilik','tr'=>'3 Kişilik','en'=>'3 Person'],
                        ['df'=>'4 Kişilik','tr'=>'4 Kişilik','en'=>'4 Person'],
                        ['df'=>'6 Kişilik','tr'=>'6 Kişilik','en'=>'6 Person'],
                        ['df'=>'8 Kişilik','tr'=>'8 Kişilik','en'=>'8 Person'],
                    ],
                ],
                [
                    'name_df' => 'Sıcaklık Dayanımı',
                    'name_tr' => 'Sıcaklık Dayanımı',
                    'name_en' => 'Temperature Rating',
                    'values' => [
                        ['df'=>'-20°C','tr'=>'-20°C','en'=>'-20°C'],
                        ['df'=>'-15°C','tr'=>'-15°C','en'=>'-15°C'],
                        ['df'=>'-10°C','tr'=>'-10°C','en'=>'-10°C'],
                        ['df'=>'-5°C', 'tr'=>'-5°C', 'en'=>'-5°C'],
                        ['df'=>'0°C',  'tr'=>'0°C',  'en'=>'0°C'],
                        ['df'=>'+5°C', 'tr'=>'+5°C', 'en'=>'+5°C'],
                        ['df'=>'+10°C','tr'=>'+10°C','en'=>'+10°C'],
                    ],
                ],
                [
                    'name_df' => 'Hacim (L)',
                    'name_tr' => 'Hacim (L)',
                    'name_en' => 'Volume (L)',
                    'values' => [
                        ['df'=>'10L','tr'=>'10L','en'=>'10L'],
                        ['df'=>'20L','tr'=>'20L','en'=>'20L'],
                        ['df'=>'30L','tr'=>'30L','en'=>'30L'],
                        ['df'=>'40L','tr'=>'40L','en'=>'40L'],
                        ['df'=>'50L','tr'=>'50L','en'=>'50L'],
                        ['df'=>'60L','tr'=>'60L','en'=>'60L'],
                        ['df'=>'70L','tr'=>'70L','en'=>'70L'],
                    ],
                ],
            ],

            // ── TEAM & INDIVIDUAL SPORTS ──────────────────────────────
            'takim-bireysel-sporlar' => [
                [
                    'name_df' => 'Top Numarası',
                    'name_tr' => 'Top Numarası',
                    'name_en' => 'Ball Size',
                    'values' => [
                        ['df'=>'No.3','tr'=>'No.3','en'=>'Size 3'],
                        ['df'=>'No.4','tr'=>'No.4','en'=>'Size 4'],
                        ['df'=>'No.5','tr'=>'No.5','en'=>'Size 5'],
                        ['df'=>'No.6','tr'=>'No.6','en'=>'Size 6'],
                        ['df'=>'No.7','tr'=>'No.7','en'=>'Size 7'],
                    ],
                ],
                [
                    'name_df' => 'Sap Kalınlığı',
                    'name_tr' => 'Sap Kalınlığı',
                    'name_en' => 'Grip Size',
                    'values' => [
                        ['df'=>'L0','tr'=>'L0','en'=>'L0'],
                        ['df'=>'L1','tr'=>'L1','en'=>'L1'],
                        ['df'=>'L2','tr'=>'L2','en'=>'L2'],
                        ['df'=>'L3','tr'=>'L3','en'=>'L3'],
                        ['df'=>'L4','tr'=>'L4','en'=>'L4'],
                        ['df'=>'L5','tr'=>'L5','en'=>'L5'],
                    ],
                ],
                [
                    'name_df' => 'Raket Ağırlığı',
                    'name_tr' => 'Raket Ağırlığı',
                    'name_en' => 'Racket Weight',
                    'values' => [
                        ['df'=>'260g','tr'=>'260g','en'=>'260g'],
                        ['df'=>'270g','tr'=>'270g','en'=>'270g'],
                        ['df'=>'280g','tr'=>'280g','en'=>'280g'],
                        ['df'=>'290g','tr'=>'290g','en'=>'290g'],
                        ['df'=>'300g','tr'=>'300g','en'=>'300g'],
                        ['df'=>'310g','tr'=>'310g','en'=>'310g'],
                        ['df'=>'320g','tr'=>'320g','en'=>'320g'],
                    ],
                ],
            ],

            // ── SPORTS CLOTHING & SHOES ───────────────────────────────
            'spor-giyim-ayakkabi' => [
                [
                    'name_df' => 'Beden',
                    'name_tr' => 'Beden',
                    'name_en' => 'Size',
                    'values' => [
                        ['df'=>'XS','tr'=>'XS','en'=>'XS'],
                        ['df'=>'S','tr'=>'S','en'=>'S'],
                        ['df'=>'M','tr'=>'M','en'=>'M'],
                        ['df'=>'L','tr'=>'L','en'=>'L'],
                        ['df'=>'XL','tr'=>'XL','en'=>'XL'],
                        ['df'=>'XXL','tr'=>'XXL','en'=>'XXL'],
                        ['df'=>'3XL','tr'=>'3XL','en'=>'3XL'],
                    ],
                ],
                [
                    'name_df' => 'Numara',
                    'name_tr' => 'Numara',
                    'name_en' => 'Shoe Size',
                    'values' => [
                        ['df'=>'36','tr'=>'36','en'=>'36'],
                        ['df'=>'37','tr'=>'37','en'=>'37'],
                        ['df'=>'38','tr'=>'38','en'=>'38'],
                        ['df'=>'39','tr'=>'39','en'=>'39'],
                        ['df'=>'40','tr'=>'40','en'=>'40'],
                        ['df'=>'41','tr'=>'41','en'=>'41'],
                        ['df'=>'42','tr'=>'42','en'=>'42'],
                        ['df'=>'43','tr'=>'43','en'=>'43'],
                        ['df'=>'44','tr'=>'44','en'=>'44'],
                        ['df'=>'45','tr'=>'45','en'=>'45'],
                        ['df'=>'46','tr'=>'46','en'=>'46'],
                    ],
                ],
                [
                    'name_df' => 'Malzeme',
                    'name_tr' => 'Malzeme',
                    'name_en' => 'Material',
                    'values' => [
                        ['df'=>'Pamuk',     'tr'=>'Pamuk',     'en'=>'Cotton'],
                        ['df'=>'Polyester', 'tr'=>'Polyester', 'en'=>'Polyester'],
                        ['df'=>'Naylon',    'tr'=>'Naylon',    'en'=>'Nylon'],
                        ['df'=>'Elastan',   'tr'=>'Elastan',   'en'=>'Elastane'],
                        ['df'=>'Spandex',   'tr'=>'Spandex',   'en'=>'Spandex'],
                        ['df'=>'Gore-Tex',  'tr'=>'Gore-Tex',  'en'=>'Gore-Tex'],
                    ],
                ],
            ],

            // ── SPORTS TECHNOLOGY ─────────────────────────────────────
            'spor-teknoloji' => [
                [
                    'name_df' => 'Ekran Boyutu',
                    'name_tr' => 'Ekran Boyutu',
                    'name_en' => 'Screen Size',
                    'values' => [
                        ['df'=>'1.1"','tr'=>'1.1"','en'=>'1.1"'],
                        ['df'=>'1.2"','tr'=>'1.2"','en'=>'1.2"'],
                        ['df'=>'1.3"','tr'=>'1.3"','en'=>'1.3"'],
                        ['df'=>'1.4"','tr'=>'1.4"','en'=>'1.4"'],
                        ['df'=>'1.5"','tr'=>'1.5"','en'=>'1.5"'],
                        ['df'=>'1.6"','tr'=>'1.6"','en'=>'1.6"'],
                    ],
                ],
                [
                    'name_df' => 'Pil Ömrü',
                    'name_tr' => 'Pil Ömrü',
                    'name_en' => 'Battery Life',
                    'values' => [
                        ['df'=>'5 Gün','tr'=>'5 Gün','en'=>'5 Days'],
                        ['df'=>'7 Gün','tr'=>'7 Gün','en'=>'7 Days'],
                        ['df'=>'10 Gün','tr'=>'10 Gün','en'=>'10 Days'],
                        ['df'=>'14 Gün','tr'=>'14 Gün','en'=>'14 Days'],
                        ['df'=>'21 Gün','tr'=>'21 Gün','en'=>'21 Days'],
                        ['df'=>'30 Gün','tr'=>'30 Gün','en'=>'30 Days'],
                    ],
                ],
                [
                    'name_df' => 'Bağlantı',
                    'name_tr' => 'Bağlantı',
                    'name_en' => 'Connectivity',
                    'values' => [
                        ['df'=>'Bluetooth 4.0','tr'=>'Bluetooth 4.0','en'=>'Bluetooth 4.0'],
                        ['df'=>'Bluetooth 5.0','tr'=>'Bluetooth 5.0','en'=>'Bluetooth 5.0'],
                        ['df'=>'GPS','tr'=>'GPS','en'=>'GPS'],
                        ['df'=>'Wi-Fi','tr'=>'Wi-Fi','en'=>'Wi-Fi'],
                        ['df'=>'NFC','tr'=>'NFC','en'=>'NFC'],
                    ],
                ],
            ],

            // ── BAGS & ACCESSORIES ────────────────────────────────────
            'canta-aksesuar' => [
                [
                    'name_df' => 'Hacim',
                    'name_tr' => 'Hacim',
                    'name_en' => 'Capacity',
                    'values' => [
                        ['df'=>'10L','tr'=>'10L','en'=>'10L'],
                        ['df'=>'20L','tr'=>'20L','en'=>'20L'],
                        ['df'=>'30L','tr'=>'30L','en'=>'30L'],
                        ['df'=>'40L','tr'=>'40L','en'=>'40L'],
                        ['df'=>'50L','tr'=>'50L','en'=>'50L'],
                        ['df'=>'60L','tr'=>'60L','en'=>'60L'],
                        ['df'=>'70L','tr'=>'70L','en'=>'70L'],
                    ],
                ],
                [
                    'name_df' => 'Malzeme',
                    'name_tr' => 'Malzeme',
                    'name_en' => 'Material',
                    'values' => [
                        ['df'=>'Naylon',    'tr'=>'Naylon',    'en'=>'Nylon'],
                        ['df'=>'Polyester', 'tr'=>'Polyester', 'en'=>'Polyester'],
                        ['df'=>'Deri',      'tr'=>'Deri',      'en'=>'Leather'],
                        ['df'=>'Kanvas',    'tr'=>'Kanvas',    'en'=>'Canvas'],
                    ],
                ],
                [
                    'name_df' => 'Renk',
                    'name_tr' => 'Renk',
                    'name_en' => 'Color',
                    'values' => [
                        ['df'=>'Siyah',    'tr'=>'Siyah',    'en'=>'Black'],
                        ['df'=>'Lacivert', 'tr'=>'Lacivert', 'en'=>'Navy'],
                        ['df'=>'Gri',      'tr'=>'Gri',      'en'=>'Grey'],
                        ['df'=>'Kahverengi','tr'=>'Kahverengi','en'=>'Brown'],
                        ['df'=>'Kırmızı',  'tr'=>'Kırmızı',  'en'=>'Red'],
                        ['df'=>'Yeşil',    'tr'=>'Yeşil',    'en'=>'Green'],
                    ],
                ],
            ],

            // ── SPORTS BOOKS ──────────────────────────────────────────
            'spor-kitaplari' => [
                [
                    'name_df' => 'Tür',
                    'name_tr' => 'Tür',
                    'name_en' => 'Genre',
                    'values' => [
                        ['df'=>'Roman',          'tr'=>'Roman',          'en'=>'Novel'],
                        ['df'=>'Tarih',           'tr'=>'Tarih',           'en'=>'History'],
                        ['df'=>'Teknik',          'tr'=>'Teknik',          'en'=>'Technical'],
                        ['df'=>'Egzersiz Rehberi','tr'=>'Egzersiz Rehberi','en'=>'Exercise Guide'],
                        ['df'=>'Beslenme',        'tr'=>'Beslenme',        'en'=>'Nutrition'],
                        ['df'=>'Biyografi',       'tr'=>'Biyografi',       'en'=>'Biography'],
                        ['df'=>'Motivasyon',      'tr'=>'Motivasyon',      'en'=>'Motivation'],
                    ],
                ],
                [
                    'name_df' => 'Dil',
                    'name_tr' => 'Dil',
                    'name_en' => 'Language',
                    'values' => [
                        ['df'=>'Türkçe',    'tr'=>'Türkçe',    'en'=>'Turkish'],
                        ['df'=>'İngilizce', 'tr'=>'İngilizce', 'en'=>'English'],
                        ['df'=>'Almanca',   'tr'=>'Almanca',   'en'=>'German'],
                        ['df'=>'Fransızca', 'tr'=>'Fransızca', 'en'=>'French'],
                        ['df'=>'İspanyolca','tr'=>'İspanyolca','en'=>'Spanish'],
                    ],
                ],
                [
                    'name_df' => 'Kapak Türü',
                    'name_tr' => 'Kapak Türü',
                    'name_en' => 'Cover Type',
                    'values' => [
                        ['df'=>'Ciltsiz', 'tr'=>'Ciltsiz', 'en'=>'Paperback'],
                        ['df'=>'Ciltli',  'tr'=>'Ciltli',  'en'=>'Hardcover'],
                        ['df'=>'Spiral',  'tr'=>'Spiral',  'en'=>'Spiral'],
                    ],
                ],
            ],

            // ── GROCERY ───────────────────────────────────────────────
            'market' => [
                [
                    'name_df' => 'Ağırlık',
                    'name_tr' => 'Ağırlık',
                    'name_en' => 'Weight',
                    'values' => [
                        ['df'=>'100g','tr'=>'100g','en'=>'100g'],
                        ['df'=>'250g','tr'=>'250g','en'=>'250g'],
                        ['df'=>'500g','tr'=>'500g','en'=>'500g'],
                        ['df'=>'750g','tr'=>'750g','en'=>'750g'],
                        ['df'=>'1kg', 'tr'=>'1kg', 'en'=>'1kg'],
                        ['df'=>'2kg', 'tr'=>'2kg', 'en'=>'2kg'],
                        ['df'=>'5kg', 'tr'=>'5kg', 'en'=>'5kg'],
                    ],
                ],
                [
                    'name_df' => 'Ambalaj',
                    'name_tr' => 'Ambalaj',
                    'name_en' => 'Packaging',
                    'values' => [
                        ['df'=>'Şişe',        'tr'=>'Şişe',        'en'=>'Bottle'],
                        ['df'=>'Kutu',        'tr'=>'Kutu',        'en'=>'Box'],
                        ['df'=>'Torba',       'tr'=>'Torba',       'en'=>'Bag'],
                        ['df'=>'Pet',         'tr'=>'Pet',         'en'=>'PET'],
                        ['df'=>'Teneke',      'tr'=>'Teneke',      'en'=>'Can'],
                        ['df'=>'Cam Kavanoz', 'tr'=>'Cam Kavanoz', 'en'=>'Glass Jar'],
                    ],
                ],
            ],

            // ── BAKERY ────────────────────────────────────────────────
            'firin-pastane' => [
                [
                    'name_df' => 'Boyut',
                    'name_tr' => 'Boyut',
                    'name_en' => 'Size',
                    'values' => [
                        ['df'=>'Mini',  'tr'=>'Mini',  'en'=>'Mini'],
                        ['df'=>'Küçük', 'tr'=>'Küçük', 'en'=>'Small'],
                        ['df'=>'Orta',  'tr'=>'Orta',  'en'=>'Medium'],
                        ['df'=>'Büyük', 'tr'=>'Büyük', 'en'=>'Large'],
                    ],
                ],
                [
                    'name_df' => 'Porsiyon',
                    'name_tr' => 'Porsiyon',
                    'name_en' => 'Portion',
                    'values' => [
                        ['df'=>'6 Adet', 'tr'=>'6 Adet', 'en'=>'6 Pieces'],
                        ['df'=>'8 Adet', 'tr'=>'8 Adet', 'en'=>'8 Pieces'],
                        ['df'=>'12 Adet','tr'=>'12 Adet','en'=>'12 Pieces'],
                        ['df'=>'16 Adet','tr'=>'16 Adet','en'=>'16 Pieces'],
                    ],
                ],
                [
                    'name_df' => 'Tat',
                    'name_tr' => 'Tat',
                    'name_en' => 'Flavor',
                    'values' => [
                        ['df'=>'Sade',       'tr'=>'Sade',       'en'=>'Plain'],
                        ['df'=>'Çikolatalı', 'tr'=>'Çikolatalı', 'en'=>'Chocolate'],
                        ['df'=>'Meyveli',    'tr'=>'Meyveli',    'en'=>'Fruity'],
                        ['df'=>'Ballı',      'tr'=>'Ballı',      'en'=>'Honey'],
                        ['df'=>'Peynirli',   'tr'=>'Peynirli',   'en'=>'Cheese'],
                    ],
                ],
            ],

            // ── PHARMACY & HEALTH ─────────────────────────────────────
            'eczane-saglik' => [
                [
                    'name_df' => 'Doz',
                    'name_tr' => 'Doz',
                    'name_en' => 'Dosage',
                    'values' => [
                        ['df'=>'10mg',   'tr'=>'10mg',   'en'=>'10mg'],
                        ['df'=>'25mg',   'tr'=>'25mg',   'en'=>'25mg'],
                        ['df'=>'50mg',   'tr'=>'50mg',   'en'=>'50mg'],
                        ['df'=>'100mg',  'tr'=>'100mg',  'en'=>'100mg'],
                        ['df'=>'200mg',  'tr'=>'200mg',  'en'=>'200mg'],
                        ['df'=>'500mg',  'tr'=>'500mg',  'en'=>'500mg'],
                        ['df'=>'1000mg', 'tr'=>'1000mg', 'en'=>'1000mg'],
                    ],
                ],
                [
                    'name_df' => 'Form',
                    'name_tr' => 'Form',
                    'name_en' => 'Form',
                    'values' => [
                        ['df'=>'Tablet', 'tr'=>'Tablet', 'en'=>'Tablet'],
                        ['df'=>'Kapsül', 'tr'=>'Kapsül', 'en'=>'Capsule'],
                        ['df'=>'Şurup',  'tr'=>'Şurup',  'en'=>'Syrup'],
                        ['df'=>'Krem',   'tr'=>'Krem',   'en'=>'Cream'],
                        ['df'=>'Damla',  'tr'=>'Damla',  'en'=>'Drops'],
                        ['df'=>'Jel',    'tr'=>'Jel',    'en'=>'Gel'],
                        ['df'=>'Toz',    'tr'=>'Toz',    'en'=>'Powder'],
                    ],
                ],
                [
                    'name_df' => 'Paket Miktarı',
                    'name_tr' => 'Paket Miktarı',
                    'name_en' => 'Package Quantity',
                    'values' => [
                        ['df'=>'10','tr'=>'10','en'=>'10'],
                        ['df'=>'20','tr'=>'20','en'=>'20'],
                        ['df'=>'30','tr'=>'30','en'=>'30'],
                        ['df'=>'50','tr'=>'50','en'=>'50'],
                        ['df'=>'100','tr'=>'100','en'=>'100'],
                    ],
                ],
            ],

            // ── MAKEUP & BEAUTY ───────────────────────────────────────
            'makyaj-guzellik' => [
                [
                    'name_df' => 'Renk / Ton',
                    'name_tr' => 'Renk / Ton',
                    'name_en' => 'Color / Shade',
                    'values' => [
                        ['df'=>'Nude',       'tr'=>'Nude',       'en'=>'Nude'],
                        ['df'=>'Pembe',      'tr'=>'Pembe',      'en'=>'Pink'],
                        ['df'=>'Kırmızı',    'tr'=>'Kırmızı',    'en'=>'Red'],
                        ['df'=>'Kahverengi', 'tr'=>'Kahverengi', 'en'=>'Brown'],
                        ['df'=>'Koyu Kahve', 'tr'=>'Koyu Kahve', 'en'=>'Dark Brown'],
                        ['df'=>'Siyah',      'tr'=>'Siyah',      'en'=>'Black'],
                        ['df'=>'Bej',        'tr'=>'Bej',        'en'=>'Beige'],
                    ],
                ],
                [
                    'name_df' => 'Boyut (ml)',
                    'name_tr' => 'Boyut (ml)',
                    'name_en' => 'Size (ml)',
                    'values' => [
                        ['df'=>'5ml',  'tr'=>'5ml',  'en'=>'5ml'],
                        ['df'=>'15ml', 'tr'=>'15ml', 'en'=>'15ml'],
                        ['df'=>'30ml', 'tr'=>'30ml', 'en'=>'30ml'],
                        ['df'=>'50ml', 'tr'=>'50ml', 'en'=>'50ml'],
                        ['df'=>'100ml','tr'=>'100ml','en'=>'100ml'],
                    ],
                ],
                [
                    'name_df' => 'Cilt Tipi',
                    'name_tr' => 'Cilt Tipi',
                    'name_en' => 'Skin Type',
                    'values' => [
                        ['df'=>'Normal',  'tr'=>'Normal',  'en'=>'Normal'],
                        ['df'=>'Kuru',    'tr'=>'Kuru',    'en'=>'Dry'],
                        ['df'=>'Yağlı',   'tr'=>'Yağlı',   'en'=>'Oily'],
                        ['df'=>'Karma',   'tr'=>'Karma',   'en'=>'Combination'],
                        ['df'=>'Hassas',  'tr'=>'Hassas',  'en'=>'Sensitive'],
                    ],
                ],
            ],

            // ── FURNITURE ─────────────────────────────────────────────
            'mobilya' => [
                [
                    'name_df' => 'Malzeme',
                    'name_tr' => 'Malzeme',
                    'name_en' => 'Material',
                    'values' => [
                        ['df'=>'Ahşap',  'tr'=>'Ahşap',  'en'=>'Wood'],
                        ['df'=>'Metal',  'tr'=>'Metal',  'en'=>'Metal'],
                        ['df'=>'MDF',    'tr'=>'MDF',    'en'=>'MDF'],
                        ['df'=>'Cam',    'tr'=>'Cam',    'en'=>'Glass'],
                        ['df'=>'Plastik','tr'=>'Plastik','en'=>'Plastic'],
                        ['df'=>'Rattan', 'tr'=>'Rattan', 'en'=>'Rattan'],
                    ],
                ],
                [
                    'name_df' => 'Renk',
                    'name_tr' => 'Renk',
                    'name_en' => 'Color',
                    'values' => [
                        ['df'=>'Beyaz',    'tr'=>'Beyaz',    'en'=>'White'],
                        ['df'=>'Siyah',    'tr'=>'Siyah',    'en'=>'Black'],
                        ['df'=>'Kahverengi','tr'=>'Kahverengi','en'=>'Brown'],
                        ['df'=>'Meşe',     'tr'=>'Meşe',     'en'=>'Oak'],
                        ['df'=>'Ceviz',    'tr'=>'Ceviz',    'en'=>'Walnut'],
                        ['df'=>'Gri',      'tr'=>'Gri',      'en'=>'Grey'],
                    ],
                ],
                [
                    'name_df' => 'Boyut',
                    'name_tr' => 'Boyut',
                    'name_en' => 'Size',
                    'values' => [
                        ['df'=>'Küçük','tr'=>'Küçük','en'=>'Small'],
                        ['df'=>'Orta', 'tr'=>'Orta', 'en'=>'Medium'],
                        ['df'=>'Büyük','tr'=>'Büyük','en'=>'Large'],
                        ['df'=>'XL',   'tr'=>'XL',   'en'=>'XL'],
                    ],
                ],
            ],

            // ── HOME DECOR ────────────────────────────────────────────
            'ev-dekorasyon' => [
                [
                    'name_df' => 'Malzeme',
                    'name_tr' => 'Malzeme',
                    'name_en' => 'Material',
                    'values' => [
                        ['df'=>'Seramik',  'tr'=>'Seramik',  'en'=>'Ceramic'],
                        ['df'=>'Porselen', 'tr'=>'Porselen', 'en'=>'Porcelain'],
                        ['df'=>'Cam',      'tr'=>'Cam',      'en'=>'Glass'],
                        ['df'=>'Metal',    'tr'=>'Metal',    'en'=>'Metal'],
                        ['df'=>'Ahşap',    'tr'=>'Ahşap',    'en'=>'Wood'],
                        ['df'=>'Kumaş',    'tr'=>'Kumaş',    'en'=>'Fabric'],
                    ],
                ],
                [
                    'name_df' => 'Renk',
                    'name_tr' => 'Renk',
                    'name_en' => 'Color',
                    'values' => [
                        ['df'=>'Beyaz', 'tr'=>'Beyaz', 'en'=>'White'],
                        ['df'=>'Krem',  'tr'=>'Krem',  'en'=>'Cream'],
                        ['df'=>'Gri',   'tr'=>'Gri',   'en'=>'Grey'],
                        ['df'=>'Siyah', 'tr'=>'Siyah', 'en'=>'Black'],
                        ['df'=>'Altın', 'tr'=>'Altın', 'en'=>'Gold'],
                        ['df'=>'Gümüş', 'tr'=>'Gümüş', 'en'=>'Silver'],
                        ['df'=>'Renkli','tr'=>'Renkli', 'en'=>'Colorful'],
                        ['df'=>'Kahverengi','tr'=>'Kahverengi','en'=>'Brown'],
                    ],
                ],
                [
                    'name_df' => 'Boyut',
                    'name_tr' => 'Boyut',
                    'name_en' => 'Size',
                    'values' => [
                        ['df'=>'Küçük','tr'=>'Küçük','en'=>'Small'],
                        ['df'=>'Orta', 'tr'=>'Orta', 'en'=>'Medium'],
                        ['df'=>'Büyük','tr'=>'Büyük','en'=>'Large'],
                    ],
                ],
            ],

            // ── PET SHOP ──────────────────────────────────────────────
            'evcil-hayvan' => [
                [
                    'name_df' => 'Hayvan Türü',
                    'name_tr' => 'Hayvan Türü',
                    'name_en' => 'Animal Type',
                    'values' => [
                        ['df'=>'Kedi',    'tr'=>'Kedi',    'en'=>'Cat'],
                        ['df'=>'Köpek',   'tr'=>'Köpek',   'en'=>'Dog'],
                        ['df'=>'Kuş',     'tr'=>'Kuş',     'en'=>'Bird'],
                        ['df'=>'Balık',   'tr'=>'Balık',   'en'=>'Fish'],
                        ['df'=>'Kemirgen','tr'=>'Kemirgen','en'=>'Rodent'],
                    ],
                ],
                [
                    'name_df' => 'Boyut (Kilo)',
                    'name_tr' => 'Boyut (Kilo)',
                    'name_en' => 'Size (Weight)',
                    'values' => [
                        ['df'=>'XS (0-3kg)',  'tr'=>'XS (0-3kg)',  'en'=>'XS (0-3kg)'],
                        ['df'=>'S (3-7kg)',   'tr'=>'S (3-7kg)',   'en'=>'S (3-7kg)'],
                        ['df'=>'M (7-15kg)',  'tr'=>'M (7-15kg)',  'en'=>'M (7-15kg)'],
                        ['df'=>'L (15-25kg)', 'tr'=>'L (15-25kg)', 'en'=>'L (15-25kg)'],
                        ['df'=>'XL (25kg+)',  'tr'=>'XL (25kg+)',  'en'=>'XL (25kg+)'],
                    ],
                ],
                [
                    'name_df' => 'Tat / Koku',
                    'name_tr' => 'Tat / Koku',
                    'name_en' => 'Flavor / Scent',
                    'values' => [
                        ['df'=>'Tavuk', 'tr'=>'Tavuk', 'en'=>'Chicken'],
                        ['df'=>'Dana',  'tr'=>'Dana',  'en'=>'Beef'],
                        ['df'=>'Balık', 'tr'=>'Balık', 'en'=>'Fish'],
                        ['df'=>'Kuzu',  'tr'=>'Kuzu',  'en'=>'Lamb'],
                        ['df'=>'Sebze', 'tr'=>'Sebze', 'en'=>'Vegetable'],
                    ],
                ],
            ],

            // ── FISHING ───────────────────────────────────────────────
            'balikcililik' => [
                [
                    'name_df' => 'Uzunluk',
                    'name_tr' => 'Uzunluk',
                    'name_en' => 'Length',
                    'values' => [
                        ['df'=>'1.5m','tr'=>'1.5m','en'=>'1.5m'],
                        ['df'=>'1.8m','tr'=>'1.8m','en'=>'1.8m'],
                        ['df'=>'2.1m','tr'=>'2.1m','en'=>'2.1m'],
                        ['df'=>'2.4m','tr'=>'2.4m','en'=>'2.4m'],
                        ['df'=>'2.7m','tr'=>'2.7m','en'=>'2.7m'],
                        ['df'=>'3.0m','tr'=>'3.0m','en'=>'3.0m'],
                        ['df'=>'3.6m','tr'=>'3.6m','en'=>'3.6m'],
                        ['df'=>'4.2m','tr'=>'4.2m','en'=>'4.2m'],
                    ],
                ],
                [
                    'name_df' => 'İğne Numarası',
                    'name_tr' => 'İğne Numarası',
                    'name_en' => 'Hook Size',
                    'values' => [
                        ['df'=>'No.1','tr'=>'No.1','en'=>'No.1'],
                        ['df'=>'No.2','tr'=>'No.2','en'=>'No.2'],
                        ['df'=>'No.4','tr'=>'No.4','en'=>'No.4'],
                        ['df'=>'No.6','tr'=>'No.6','en'=>'No.6'],
                        ['df'=>'No.8','tr'=>'No.8','en'=>'No.8'],
                        ['df'=>'No.10','tr'=>'No.10','en'=>'No.10'],
                    ],
                ],
                [
                    'name_df' => 'Misina Kalınlığı',
                    'name_tr' => 'Misina Kalınlığı',
                    'name_en' => 'Line Thickness',
                    'values' => [
                        ['df'=>'0.1mm','tr'=>'0.1mm','en'=>'0.1mm'],
                        ['df'=>'0.2mm','tr'=>'0.2mm','en'=>'0.2mm'],
                        ['df'=>'0.3mm','tr'=>'0.3mm','en'=>'0.3mm'],
                        ['df'=>'0.4mm','tr'=>'0.4mm','en'=>'0.4mm'],
                        ['df'=>'0.5mm','tr'=>'0.5mm','en'=>'0.5mm'],
                    ],
                ],
            ],

            // ── RESTAURANT ────────────────────────────────────────────
            'restoran' => [
                [
                    'name_df' => 'Porsiyon',
                    'name_tr' => 'Porsiyon',
                    'name_en' => 'Portion',
                    'values' => [
                        ['df'=>'Küçük', 'tr'=>'Küçük', 'en'=>'Small'],
                        ['df'=>'Normal','tr'=>'Normal','en'=>'Regular'],
                        ['df'=>'Büyük', 'tr'=>'Büyük', 'en'=>'Large'],
                        ['df'=>'Ekstra','tr'=>'Ekstra','en'=>'Extra'],
                    ],
                ],
                [
                    'name_df' => 'Acılık Seviyesi',
                    'name_tr' => 'Acılık Seviyesi',
                    'name_en' => 'Spice Level',
                    'values' => [
                        ['df'=>'Az Acı',    'tr'=>'Az Acı',    'en'=>'Mild'],
                        ['df'=>'Orta Acı',  'tr'=>'Orta Acı',  'en'=>'Medium'],
                        ['df'=>'Acılı',     'tr'=>'Acılı',     'en'=>'Hot'],
                        ['df'=>'Çok Acılı', 'tr'=>'Çok Acılı', 'en'=>'Extra Hot'],
                    ],
                ],
                [
                    'name_df' => 'Ekstralar',
                    'name_tr' => 'Ekstralar',
                    'name_en' => 'Extras',
                    'values' => [
                        ['df'=>'Ekstra Peynir','tr'=>'Ekstra Peynir','en'=>'Extra Cheese'],
                        ['df'=>'Ekstra Et',    'tr'=>'Ekstra Et',    'en'=>'Extra Meat'],
                        ['df'=>'Avokado',      'tr'=>'Avokado',      'en'=>'Avocado'],
                        ['df'=>'Yumurta',      'tr'=>'Yumurta',      'en'=>'Egg'],
                        ['df'=>'Özel Sos',     'tr'=>'Özel Sos',     'en'=>'Special Sauce'],
                    ],
                ],
            ],

            // ── CAFE ──────────────────────────────────────────────────
            'kafe' => [
                [
                    'name_df' => 'Boyut',
                    'name_tr' => 'Boyut',
                    'name_en' => 'Size',
                    'values' => [
                        ['df'=>'S (Small)',      'tr'=>'S (Küçük)',       'en'=>'S (Small)'],
                        ['df'=>'M (Medium)',     'tr'=>'M (Orta)',        'en'=>'M (Medium)'],
                        ['df'=>'L (Large)',      'tr'=>'L (Büyük)',       'en'=>'L (Large)'],
                        ['df'=>'XL (Extra Large)','tr'=>'XL (Ekstra Büyük)','en'=>'XL (Extra Large)'],
                    ],
                ],
                [
                    'name_df' => 'Süt Tipi',
                    'name_tr' => 'Süt Tipi',
                    'name_en' => 'Milk Type',
                    'values' => [
                        ['df'=>'Normal',    'tr'=>'Normal',    'en'=>'Regular'],
                        ['df'=>'Soya',      'tr'=>'Soya',      'en'=>'Soy'],
                        ['df'=>'Badem',     'tr'=>'Badem',     'en'=>'Almond'],
                        ['df'=>'Yulaf',     'tr'=>'Yulaf',     'en'=>'Oat'],
                        ['df'=>'Laktozsuz', 'tr'=>'Laktozsuz', 'en'=>'Lactose-Free'],
                    ],
                ],
                [
                    'name_df' => 'Sıcaklık',
                    'name_tr' => 'Sıcaklık',
                    'name_en' => 'Temperature',
                    'values' => [
                        ['df'=>'Sıcak', 'tr'=>'Sıcak', 'en'=>'Hot'],
                        ['df'=>'Soğuk', 'tr'=>'Soğuk', 'en'=>'Cold'],
                        ['df'=>'Buzlu', 'tr'=>'Buzlu', 'en'=>'Iced'],
                    ],
                ],
            ],

            // ── FAST FOOD ─────────────────────────────────────────────
            'fast-food' => [
                [
                    'name_df' => 'Boyut',
                    'name_tr' => 'Boyut',
                    'name_en' => 'Size',
                    'values' => [
                        ['df'=>'Küçük','tr'=>'Küçük','en'=>'Small'],
                        ['df'=>'Orta', 'tr'=>'Orta', 'en'=>'Medium'],
                        ['df'=>'Büyük','tr'=>'Büyük','en'=>'Large'],
                        ['df'=>'Mega', 'tr'=>'Mega', 'en'=>'Mega'],
                    ],
                ],
                [
                    'name_df' => 'Ekstralar',
                    'name_tr' => 'Ekstralar',
                    'name_en' => 'Extras',
                    'values' => [
                        ['df'=>'Çift Et',      'tr'=>'Çift Et',      'en'=>'Double Meat'],
                        ['df'=>'Ekstra Peynir','tr'=>'Ekstra Peynir','en'=>'Extra Cheese'],
                        ['df'=>'Özel Sos',     'tr'=>'Özel Sos',     'en'=>'Special Sauce'],
                        ['df'=>'Acı Sos',      'tr'=>'Acı Sos',      'en'=>'Hot Sauce'],
                    ],
                ],
                [
                    'name_df' => 'Set Menü',
                    'name_tr' => 'Set Menü',
                    'name_en' => 'Meal Option',
                    'values' => [
                        ['df'=>'Sadece Ürün',            'tr'=>'Sadece Ürün',            'en'=>'Item Only'],
                        ['df'=>'Menü (Patates + İçecek)', 'tr'=>'Menü (Patates + İçecek)', 'en'=>'Meal (Fries + Drink)'],
                        ['df'=>'Büyük Menü',             'tr'=>'Büyük Menü',             'en'=>'Large Meal'],
                    ],
                ],
            ],

            // ── FLORIST ───────────────────────────────────────────────
            'cicekci' => [
                [
                    'name_df' => 'Çiçek Türü',
                    'name_tr' => 'Çiçek Türü',
                    'name_en' => 'Flower Type',
                    'values' => [
                        ['df'=>'Gül',       'tr'=>'Gül',       'en'=>'Rose'],
                        ['df'=>'Lale',      'tr'=>'Lale',      'en'=>'Tulip'],
                        ['df'=>'Papatya',   'tr'=>'Papatya',   'en'=>'Daisy'],
                        ['df'=>'Orkide',    'tr'=>'Orkide',    'en'=>'Orchid'],
                        ['df'=>'Kasımpatı', 'tr'=>'Kasımpatı', 'en'=>'Chrysanthemum'],
                        ['df'=>'Ayçiçeği',  'tr'=>'Ayçiçeği',  'en'=>'Sunflower'],
                        ['df'=>'Zambak',    'tr'=>'Zambak',    'en'=>'Lily'],
                    ],
                ],
                [
                    'name_df' => 'Renk',
                    'name_tr' => 'Renk',
                    'name_en' => 'Color',
                    'values' => [
                        ['df'=>'Kırmızı', 'tr'=>'Kırmızı', 'en'=>'Red'],
                        ['df'=>'Pembe',   'tr'=>'Pembe',   'en'=>'Pink'],
                        ['df'=>'Sarı',    'tr'=>'Sarı',    'en'=>'Yellow'],
                        ['df'=>'Beyaz',   'tr'=>'Beyaz',   'en'=>'White'],
                        ['df'=>'Turuncu', 'tr'=>'Turuncu', 'en'=>'Orange'],
                        ['df'=>'Mor',     'tr'=>'Mor',     'en'=>'Purple'],
                        ['df'=>'Karışık', 'tr'=>'Karışık', 'en'=>'Mixed'],
                    ],
                ],
                [
                    'name_df' => 'Adet',
                    'name_tr' => 'Adet',
                    'name_en' => 'Quantity',
                    'values' => [
                        ['df'=>'5 Adet',  'tr'=>'5 Adet',  'en'=>'5 Stems'],
                        ['df'=>'11 Adet', 'tr'=>'11 Adet', 'en'=>'11 Stems'],
                        ['df'=>'21 Adet', 'tr'=>'21 Adet', 'en'=>'21 Stems'],
                        ['df'=>'31 Adet', 'tr'=>'31 Adet', 'en'=>'31 Stems'],
                        ['df'=>'51 Adet', 'tr'=>'51 Adet', 'en'=>'51 Stems'],
                        ['df'=>'101 Adet','tr'=>'101 Adet','en'=>'101 Stems'],
                    ],
                ],
            ],

            // ── TOY ───────────────────────────────────────────────────
            'oyuncak' => [
                [
                    'name_df' => 'Yaş Aralığı',
                    'name_tr' => 'Yaş Aralığı',
                    'name_en' => 'Age Range',
                    'values' => [
                        ['df'=>'0-12 Ay',  'tr'=>'0-12 Ay',  'en'=>'0-12 Months'],
                        ['df'=>'1-3 Yaş',  'tr'=>'1-3 Yaş',  'en'=>'1-3 Years'],
                        ['df'=>'3-6 Yaş',  'tr'=>'3-6 Yaş',  'en'=>'3-6 Years'],
                        ['df'=>'6-9 Yaş',  'tr'=>'6-9 Yaş',  'en'=>'6-9 Years'],
                        ['df'=>'9-12 Yaş', 'tr'=>'9-12 Yaş', 'en'=>'9-12 Years'],
                        ['df'=>'12+ Yaş',  'tr'=>'12+ Yaş',  'en'=>'12+ Years'],
                    ],
                ],
                [
                    'name_df' => 'Renk',
                    'name_tr' => 'Renk',
                    'name_en' => 'Color',
                    'values' => [
                        ['df'=>'Kırmızı',   'tr'=>'Kırmızı',   'en'=>'Red'],
                        ['df'=>'Mavi',      'tr'=>'Mavi',      'en'=>'Blue'],
                        ['df'=>'Sarı',      'tr'=>'Sarı',      'en'=>'Yellow'],
                        ['df'=>'Yeşil',     'tr'=>'Yeşil',     'en'=>'Green'],
                        ['df'=>'Pembe',     'tr'=>'Pembe',     'en'=>'Pink'],
                        ['df'=>'Çok Renkli','tr'=>'Çok Renkli','en'=>'Multicolor'],
                    ],
                ],
                [
                    'name_df' => 'Boyut',
                    'name_tr' => 'Boyut',
                    'name_en' => 'Size',
                    'values' => [
                        ['df'=>'Küçük','tr'=>'Küçük','en'=>'Small'],
                        ['df'=>'Orta', 'tr'=>'Orta', 'en'=>'Medium'],
                        ['df'=>'Büyük','tr'=>'Büyük','en'=>'Large'],
                    ],
                ],
            ],

            // ── JEWELRY ───────────────────────────────────────────────
            'taki-mucevher' => [
                [
                    'name_df' => 'Malzeme',
                    'name_tr' => 'Malzeme',
                    'name_en' => 'Material',
                    'values' => [
                        ['df'=>'14 Ayar Altın',    'tr'=>'14 Ayar Altın',    'en'=>'14K Gold'],
                        ['df'=>'18 Ayar Altın',    'tr'=>'18 Ayar Altın',    'en'=>'18K Gold'],
                        ['df'=>'Gümüş',            'tr'=>'Gümüş',            'en'=>'Silver'],
                        ['df'=>'Platin',           'tr'=>'Platin',           'en'=>'Platinum'],
                        ['df'=>'Paslanmaz Çelik',  'tr'=>'Paslanmaz Çelik',  'en'=>'Stainless Steel'],
                    ],
                ],
                [
                    'name_df' => 'Yüzük Beden',
                    'name_tr' => 'Yüzük Beden',
                    'name_en' => 'Ring Size',
                    'values' => [
                        ['df'=>'12','tr'=>'12','en'=>'12'],
                        ['df'=>'13','tr'=>'13','en'=>'13'],
                        ['df'=>'14','tr'=>'14','en'=>'14'],
                        ['df'=>'15','tr'=>'15','en'=>'15'],
                        ['df'=>'16','tr'=>'16','en'=>'16'],
                        ['df'=>'17','tr'=>'17','en'=>'17'],
                        ['df'=>'18','tr'=>'18','en'=>'18'],
                        ['df'=>'19','tr'=>'19','en'=>'19'],
                        ['df'=>'20','tr'=>'20','en'=>'20'],
                    ],
                ],
                [
                    'name_df' => 'Taş Tipi',
                    'name_tr' => 'Taş Tipi',
                    'name_en' => 'Stone Type',
                    'values' => [
                        ['df'=>'Elmas',   'tr'=>'Elmas',   'en'=>'Diamond'],
                        ['df'=>'Zümrüt',  'tr'=>'Zümrüt',  'en'=>'Emerald'],
                        ['df'=>'Yakut',   'tr'=>'Yakut',   'en'=>'Ruby'],
                        ['df'=>'Safir',   'tr'=>'Safir',   'en'=>'Sapphire'],
                        ['df'=>'İnci',    'tr'=>'İnci',    'en'=>'Pearl'],
                        ['df'=>'Ametist', 'tr'=>'Ametist', 'en'=>'Amethyst'],
                        ['df'=>'Taşsız',  'tr'=>'Taşsız',  'en'=>'No Stone'],
                    ],
                ],
            ],

            // ── AUTO PARTS ────────────────────────────────────────────
            'oto-yedek-parca' => [
                [
                    'name_df' => 'Marka Uyumluluğu',
                    'name_tr' => 'Marka Uyumluluğu',
                    'name_en' => 'Brand Compatibility',
                    'values' => [
                        ['df'=>'Volkswagen','tr'=>'Volkswagen','en'=>'Volkswagen'],
                        ['df'=>'Toyota',    'tr'=>'Toyota',    'en'=>'Toyota'],
                        ['df'=>'Honda',     'tr'=>'Honda',     'en'=>'Honda'],
                        ['df'=>'Ford',      'tr'=>'Ford',      'en'=>'Ford'],
                        ['df'=>'Renault',   'tr'=>'Renault',   'en'=>'Renault'],
                        ['df'=>'Opel',      'tr'=>'Opel',      'en'=>'Opel'],
                        ['df'=>'BMW',       'tr'=>'BMW',       'en'=>'BMW'],
                    ],
                ],
                [
                    'name_df' => 'Tip',
                    'name_tr' => 'Tip',
                    'name_en' => 'Type',
                    'values' => [
                        ['df'=>'Orijinal (OEM)',    'tr'=>'Orijinal (OEM)',    'en'=>'Original (OEM)'],
                        ['df'=>'Muadil (Aftermarket)','tr'=>'Muadil (Aftermarket)','en'=>'Aftermarket'],
                        ['df'=>'Yenileme',          'tr'=>'Yenileme',          'en'=>'Remanufactured'],
                    ],
                ],
                [
                    'name_df' => 'Yıl',
                    'name_tr' => 'Yıl',
                    'name_en' => 'Year',
                    'values' => [
                        ['df'=>'2015','tr'=>'2015','en'=>'2015'],
                        ['df'=>'2016','tr'=>'2016','en'=>'2016'],
                        ['df'=>'2017','tr'=>'2017','en'=>'2017'],
                        ['df'=>'2018','tr'=>'2018','en'=>'2018'],
                        ['df'=>'2019','tr'=>'2019','en'=>'2019'],
                        ['df'=>'2020','tr'=>'2020','en'=>'2020'],
                        ['df'=>'2021','tr'=>'2021','en'=>'2021'],
                        ['df'=>'2022','tr'=>'2022','en'=>'2022'],
                        ['df'=>'2023','tr'=>'2023','en'=>'2023'],
                        ['df'=>'2024','tr'=>'2024','en'=>'2024'],
                    ],
                ],
            ],

            // ── ORGANIC ───────────────────────────────────────────────
            'organik' => [
                [
                    'name_df' => 'Ağırlık',
                    'name_tr' => 'Ağırlık',
                    'name_en' => 'Weight',
                    'values' => [
                        ['df'=>'250g','tr'=>'250g','en'=>'250g'],
                        ['df'=>'500g','tr'=>'500g','en'=>'500g'],
                        ['df'=>'1kg', 'tr'=>'1kg', 'en'=>'1kg'],
                        ['df'=>'2kg', 'tr'=>'2kg', 'en'=>'2kg'],
                        ['df'=>'5kg', 'tr'=>'5kg', 'en'=>'5kg'],
                    ],
                ],
                [
                    'name_df' => 'Sertifika',
                    'name_tr' => 'Sertifika',
                    'name_en' => 'Certification',
                    'values' => [
                        ['df'=>'EU Organik',             'tr'=>'EU Organik',             'en'=>'EU Organic'],
                        ['df'=>'USDA Organik',           'tr'=>'USDA Organik',           'en'=>'USDA Organic'],
                        ['df'=>'Türk Organik Belgeli',   'tr'=>'Türk Organik Belgeli',   'en'=>'Turkish Organic Certified'],
                    ],
                ],
                [
                    'name_df' => 'Menşei',
                    'name_tr' => 'Menşei',
                    'name_en' => 'Origin',
                    'values' => [
                        ['df'=>'Türkiye', 'tr'=>'Türkiye', 'en'=>'Turkey'],
                        ['df'=>'Avrupa',  'tr'=>'Avrupa',  'en'=>'Europe'],
                        ['df'=>'Amerika', 'tr'=>'Amerika', 'en'=>'America'],
                        ['df'=>'Asya',    'tr'=>'Asya',    'en'=>'Asia'],
                    ],
                ],
            ],

            // ── BUTCHER ───────────────────────────────────────────────
            'kasap' => [
                [
                    'name_df' => 'Ağırlık',
                    'name_tr' => 'Ağırlık',
                    'name_en' => 'Weight',
                    'values' => [
                        ['df'=>'250g','tr'=>'250g','en'=>'250g'],
                        ['df'=>'500g','tr'=>'500g','en'=>'500g'],
                        ['df'=>'750g','tr'=>'750g','en'=>'750g'],
                        ['df'=>'1kg', 'tr'=>'1kg', 'en'=>'1kg'],
                        ['df'=>'1.5kg','tr'=>'1.5kg','en'=>'1.5kg'],
                        ['df'=>'2kg', 'tr'=>'2kg', 'en'=>'2kg'],
                    ],
                ],
                [
                    'name_df' => 'Kesim Türü',
                    'name_tr' => 'Kesim Türü',
                    'name_en' => 'Cut Type',
                    'values' => [
                        ['df'=>'Dana',  'tr'=>'Dana',  'en'=>'Beef'],
                        ['df'=>'Kuzu',  'tr'=>'Kuzu',  'en'=>'Lamb'],
                        ['df'=>'Tavuk', 'tr'=>'Tavuk', 'en'=>'Chicken'],
                        ['df'=>'Hindi', 'tr'=>'Hindi', 'en'=>'Turkey'],
                        ['df'=>'Balık', 'tr'=>'Balık', 'en'=>'Fish'],
                    ],
                ],
                [
                    'name_df' => 'Hazırlık',
                    'name_tr' => 'Hazırlık',
                    'name_en' => 'Preparation',
                    'values' => [
                        ['df'=>'Kıyma', 'tr'=>'Kıyma', 'en'=>'Minced'],
                        ['df'=>'Parça', 'tr'=>'Parça', 'en'=>'Chunk'],
                        ['df'=>'Dilim', 'tr'=>'Dilim', 'en'=>'Sliced'],
                        ['df'=>'Bütün', 'tr'=>'Bütün', 'en'=>'Whole'],
                    ],
                ],
            ],

            // ── FRUIT & VEG ───────────────────────────────────────────
            'meyve-sebze' => [
                [
                    'name_df' => 'Ağırlık',
                    'name_tr' => 'Ağırlık',
                    'name_en' => 'Weight',
                    'values' => [
                        ['df'=>'250g','tr'=>'250g','en'=>'250g'],
                        ['df'=>'500g','tr'=>'500g','en'=>'500g'],
                        ['df'=>'1kg', 'tr'=>'1kg', 'en'=>'1kg'],
                        ['df'=>'2kg', 'tr'=>'2kg', 'en'=>'2kg'],
                        ['df'=>'5kg', 'tr'=>'5kg', 'en'=>'5kg'],
                    ],
                ],
                [
                    'name_df' => 'Menşei',
                    'name_tr' => 'Menşei',
                    'name_en' => 'Origin',
                    'values' => [
                        ['df'=>'Yerli',     'tr'=>'Yerli',     'en'=>'Local'],
                        ['df'=>'İtalyan',   'tr'=>'İtalyan',   'en'=>'Italian'],
                        ['df'=>'İspanyol',  'tr'=>'İspanyol',  'en'=>'Spanish'],
                        ['df'=>'Hollanda',  'tr'=>'Hollanda',  'en'=>'Dutch'],
                        ['df'=>'Mısır',     'tr'=>'Mısır',     'en'=>'Egyptian'],
                    ],
                ],
            ],

            // ── ICE CREAM ─────────────────────────────────────────────
            'dondurma' => [
                [
                    'name_df' => 'Tat',
                    'name_tr' => 'Tat',
                    'name_en' => 'Flavor',
                    'values' => [
                        ['df'=>'Çikolata',  'tr'=>'Çikolata',  'en'=>'Chocolate'],
                        ['df'=>'Vanilya',   'tr'=>'Vanilya',   'en'=>'Vanilla'],
                        ['df'=>'Çilek',     'tr'=>'Çilek',     'en'=>'Strawberry'],
                        ['df'=>'Fıstık',    'tr'=>'Fıstık',    'en'=>'Pistachio'],
                        ['df'=>'Karamel',   'tr'=>'Karamel',   'en'=>'Caramel'],
                        ['df'=>'Limon',     'tr'=>'Limon',     'en'=>'Lemon'],
                        ['df'=>'Kavun',     'tr'=>'Kavun',     'en'=>'Melon'],
                        ['df'=>'Böğürtlen', 'tr'=>'Böğürtlen', 'en'=>'Blackberry'],
                    ],
                ],
                [
                    'name_df' => 'Boyut (ml)',
                    'name_tr' => 'Boyut (ml)',
                    'name_en' => 'Size (ml)',
                    'values' => [
                        ['df'=>'50ml (Mini)',   'tr'=>'50ml (Mini)',   'en'=>'50ml (Mini)'],
                        ['df'=>'120ml (Küçük)', 'tr'=>'120ml (Küçük)', 'en'=>'120ml (Small)'],
                        ['df'=>'250ml (Orta)',  'tr'=>'250ml (Orta)',  'en'=>'250ml (Medium)'],
                        ['df'=>'500ml (Büyük)', 'tr'=>'500ml (Büyük)', 'en'=>'500ml (Large)'],
                        ['df'=>'1L (Aile)',     'tr'=>'1L (Aile)',     'en'=>'1L (Family)'],
                    ],
                ],
                [
                    'name_df' => 'Sunum',
                    'name_tr' => 'Sunum',
                    'name_en' => 'Presentation',
                    'values' => [
                        ['df'=>'Külah (Cone)', 'tr'=>'Külah (Cone)', 'en'=>'Cone'],
                        ['df'=>'Kap (Cup)',    'tr'=>'Kap (Cup)',    'en'=>'Cup'],
                        ['df'=>'Bar',          'tr'=>'Bar',          'en'=>'Bar'],
                    ],
                ],
            ],

            // ── HARDWARE ──────────────────────────────────────────────
            'hirdavat' => [
                [
                    'name_df' => 'Boyut / Çap',
                    'name_tr' => 'Boyut / Çap',
                    'name_en' => 'Size / Diameter',
                    'values' => [
                        ['df'=>'M3', 'tr'=>'M3', 'en'=>'M3'],
                        ['df'=>'M4', 'tr'=>'M4', 'en'=>'M4'],
                        ['df'=>'M5', 'tr'=>'M5', 'en'=>'M5'],
                        ['df'=>'M6', 'tr'=>'M6', 'en'=>'M6'],
                        ['df'=>'M8', 'tr'=>'M8', 'en'=>'M8'],
                        ['df'=>'M10','tr'=>'M10','en'=>'M10'],
                        ['df'=>'M12','tr'=>'M12','en'=>'M12'],
                    ],
                ],
                [
                    'name_df' => 'Malzeme',
                    'name_tr' => 'Malzeme',
                    'name_en' => 'Material',
                    'values' => [
                        ['df'=>'Çelik',            'tr'=>'Çelik',            'en'=>'Steel'],
                        ['df'=>'Paslanmaz Çelik',  'tr'=>'Paslanmaz Çelik',  'en'=>'Stainless Steel'],
                        ['df'=>'Alüminyum',        'tr'=>'Alüminyum',        'en'=>'Aluminum'],
                        ['df'=>'Pirinç',           'tr'=>'Pirinç',           'en'=>'Brass'],
                        ['df'=>'Plastik',          'tr'=>'Plastik',          'en'=>'Plastic'],
                    ],
                ],
                [
                    'name_df' => 'Paket Miktarı',
                    'name_tr' => 'Paket Miktarı',
                    'name_en' => 'Package Quantity',
                    'values' => [
                        ['df'=>'10 Adet', 'tr'=>'10 Adet', 'en'=>'10 pcs'],
                        ['df'=>'25 Adet', 'tr'=>'25 Adet', 'en'=>'25 pcs'],
                        ['df'=>'50 Adet', 'tr'=>'50 Adet', 'en'=>'50 pcs'],
                        ['df'=>'100 Adet','tr'=>'100 Adet','en'=>'100 pcs'],
                        ['df'=>'200 Adet','tr'=>'200 Adet','en'=>'200 pcs'],
                        ['df'=>'500 Adet','tr'=>'500 Adet','en'=>'500 pcs'],
                    ],
                ],
            ],

            // ── BABY & KIDS ───────────────────────────────────────────
            'bebek-cocuk' => [
                [
                    'name_df' => 'Yaş',
                    'name_tr' => 'Yaş',
                    'name_en' => 'Age',
                    'values' => [
                        ['df'=>'0-3 Ay',  'tr'=>'0-3 Ay',  'en'=>'0-3 Months'],
                        ['df'=>'3-6 Ay',  'tr'=>'3-6 Ay',  'en'=>'3-6 Months'],
                        ['df'=>'6-12 Ay', 'tr'=>'6-12 Ay', 'en'=>'6-12 Months'],
                        ['df'=>'1-2 Yaş', 'tr'=>'1-2 Yaş', 'en'=>'1-2 Years'],
                        ['df'=>'2-3 Yaş', 'tr'=>'2-3 Yaş', 'en'=>'2-3 Years'],
                        ['df'=>'3-4 Yaş', 'tr'=>'3-4 Yaş', 'en'=>'3-4 Years'],
                        ['df'=>'4-6 Yaş', 'tr'=>'4-6 Yaş', 'en'=>'4-6 Years'],
                    ],
                ],
                [
                    'name_df' => 'Beden',
                    'name_tr' => 'Beden',
                    'name_en' => 'Clothing Size',
                    'values' => [
                        ['df'=>'50','tr'=>'50','en'=>'50'],
                        ['df'=>'56','tr'=>'56','en'=>'56'],
                        ['df'=>'62','tr'=>'62','en'=>'62'],
                        ['df'=>'68','tr'=>'68','en'=>'68'],
                        ['df'=>'74','tr'=>'74','en'=>'74'],
                        ['df'=>'80','tr'=>'80','en'=>'80'],
                        ['df'=>'86','tr'=>'86','en'=>'86'],
                        ['df'=>'92','tr'=>'92','en'=>'92'],
                        ['df'=>'98','tr'=>'98','en'=>'98'],
                        ['df'=>'104','tr'=>'104','en'=>'104'],
                        ['df'=>'110','tr'=>'110','en'=>'110'],
                        ['df'=>'116','tr'=>'116','en'=>'116'],
                    ],
                ],
                [
                    'name_df' => 'Cinsiyet',
                    'name_tr' => 'Cinsiyet',
                    'name_en' => 'Gender',
                    'values' => [
                        ['df'=>'Erkek',  'tr'=>'Erkek',  'en'=>'Boy'],
                        ['df'=>'Kız',    'tr'=>'Kız',    'en'=>'Girl'],
                        ['df'=>'Unisex', 'tr'=>'Unisex', 'en'=>'Unisex'],
                    ],
                ],
                [
                    'name_df' => 'Malzeme',
                    'name_tr' => 'Malzeme',
                    'name_en' => 'Material',
                    'values' => [
                        ['df'=>'Pamuk',         'tr'=>'Pamuk',         'en'=>'Cotton'],
                        ['df'=>'Polyester',     'tr'=>'Polyester',     'en'=>'Polyester'],
                        ['df'=>'Organik Pamuk', 'tr'=>'Organik Pamuk', 'en'=>'Organic Cotton'],
                        ['df'=>'Bambu',         'tr'=>'Bambu',         'en'=>'Bamboo'],
                    ],
                ],
            ],
        ];
    }
}
