<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DynamicFieldSeeder extends Seeder
{
    public function run(): void
    {
        $dynamicFields = [
            // ============ CLOTHING - GİYİM ============
            [
                'tr' => 'Yıkama Talimatı',
                'en' => 'Washing Instructions',
                'store_type' => 'clothing',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['tr' => '30°C Makine Yıkama', 'en' => '30°C Machine Wash'],
                    ['tr' => '40°C Makine Yıkama', 'en' => '40°C Machine Wash'],
                    ['tr' => 'Elde Yıkama', 'en' => 'Hand Wash Only'],
                    ['tr' => 'Kuru Temizleme', 'en' => 'Dry Clean Only'],
                ],
            ],
            [
                'tr' => 'Kumaş İçeriği',
                'en' => 'Fabric Content',
                'store_type' => 'clothing',
                'type' => 'text',
                'is_required' => false,
                'values' => [],
            ],
            [
                'tr' => 'Spor Türü',
                'en' => 'Sport Type',
                'store_type' => 'clothing',
                'type' => 'multiselect',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Koşu', 'en' => 'Running'],
                    ['tr' => 'Fitness', 'en' => 'Fitness'],
                    ['tr' => 'Futbol', 'en' => 'Football'],
                    ['tr' => 'Basketbol', 'en' => 'Basketball'],
                    ['tr' => 'Tenis', 'en' => 'Tennis'],
                    ['tr' => 'Yüzme', 'en' => 'Swimming'],
                    ['tr' => 'Yoga', 'en' => 'Yoga'],
                ],
            ],
            [
                'tr' => 'Sezon',
                'en' => 'Season',
                'store_type' => 'clothing',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['tr' => 'İlkbahar/Yaz', 'en' => 'Spring/Summer'],
                    ['tr' => 'Sonbahar/Kış', 'en' => 'Autumn/Winter'],
                    ['tr' => 'Tüm Sezonlar', 'en' => 'All Seasons'],
                ],
            ],

            // ============ FOOTWEAR - AYAKKABI ============
            [
                'tr' => 'Taban Tipi',
                'en' => 'Sole Type',
                'store_type' => 'footwear',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Kauçuk', 'en' => 'Rubber'],
                    ['tr' => 'EVA Köpük', 'en' => 'EVA Foam'],
                    ['tr' => 'Phylon', 'en' => 'Phylon'],
                    ['tr' => 'TPU', 'en' => 'TPU'],
                    ['tr' => 'Karbon Fiber', 'en' => 'Carbon Fiber'],
                ],
            ],
            [
                'tr' => 'Kapama Tipi',
                'en' => 'Closure Type',
                'store_type' => 'footwear',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Bağcıklı', 'en' => 'Lace-Up'],
                    ['tr' => 'Cırt Cırtlı', 'en' => 'Velcro'],
                    ['tr' => 'Slip-On', 'en' => 'Slip-On'],
                    ['tr' => 'BOA Sistemi', 'en' => 'BOA System'],
                ],
            ],
            [
                'tr' => 'Zemin Tipi',
                'en' => 'Surface Type',
                'store_type' => 'footwear',
                'type' => 'multiselect',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Çim', 'en' => 'Grass'],
                    ['tr' => 'Suni Çim', 'en' => 'Artificial Turf'],
                    ['tr' => 'Halı Saha', 'en' => 'Indoor Court'],
                    ['tr' => 'Asfalt', 'en' => 'Asphalt'],
                    ['tr' => 'Arazi', 'en' => 'Trail'],
                ],
            ],

            // ============ SUPPLEMENTS - TAKVİYE ============
            [
                'tr' => 'Alerjen Bilgisi',
                'en' => 'Allergen Information',
                'store_type' => 'supplements',
                'type' => 'multiselect',
                'is_required' => true,
                'values' => [
                    ['tr' => 'Süt İçerir', 'en' => 'Contains Milk'],
                    ['tr' => 'Soya İçerir', 'en' => 'Contains Soy'],
                    ['tr' => 'Gluten İçerir', 'en' => 'Contains Gluten'],
                    ['tr' => 'Yumurta İçerir', 'en' => 'Contains Eggs'],
                    ['tr' => 'Fındık/Fıstık İçerir', 'en' => 'Contains Nuts'],
                    ['tr' => 'Alerjen İçermez', 'en' => 'Allergen Free'],
                ],
            ],
            [
                'tr' => 'Porsiyon Başına',
                'en' => 'Per Serving',
                'store_type' => 'supplements',
                'type' => 'text',
                'is_required' => true,
                'values' => [],
            ],
            [
                'tr' => 'Kullanım Zamanı',
                'en' => 'Usage Time',
                'store_type' => 'supplements',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Antrenman Öncesi', 'en' => 'Pre-Workout'],
                    ['tr' => 'Antrenman Sonrası', 'en' => 'Post-Workout'],
                    ['tr' => 'Sabah', 'en' => 'Morning'],
                    ['tr' => 'Gece', 'en' => 'Night'],
                    ['tr' => 'Herhangi Bir Zaman', 'en' => 'Any Time'],
                ],
            ],
            [
                'tr' => 'Sertifikalar',
                'en' => 'Certifications',
                'store_type' => 'supplements',
                'type' => 'multiselect',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Helal Sertifikalı', 'en' => 'Halal Certified'],
                    ['tr' => 'GMP Sertifikalı', 'en' => 'GMP Certified'],
                    ['tr' => 'Informed Sport', 'en' => 'Informed Sport'],
                    ['tr' => 'Vegan', 'en' => 'Vegan'],
                    ['tr' => 'Organik', 'en' => 'Organic'],
                ],
            ],

            // ============ FITNESS - FITNESS EKİPMANI ============
            [
                'tr' => 'Maksimum Kullanıcı Ağırlığı',
                'en' => 'Maximum User Weight',
                'store_type' => 'fitness',
                'type' => 'select',
                'is_required' => true,
                'values' => [
                    ['tr' => '100 kg', 'en' => '100 kg / 220 lbs'],
                    ['tr' => '120 kg', 'en' => '120 kg / 265 lbs'],
                    ['tr' => '150 kg', 'en' => '150 kg / 330 lbs'],
                    ['tr' => '180 kg', 'en' => '180 kg / 400 lbs'],
                    ['tr' => '200+ kg', 'en' => '200+ kg / 440+ lbs'],
                ],
            ],
            [
                'tr' => 'Montaj Gerekli',
                'en' => 'Assembly Required',
                'store_type' => 'fitness',
                'type' => 'boolean',
                'is_required' => true,
                'values' => [
                    ['tr' => 'Evet', 'en' => 'Yes'],
                    ['tr' => 'Hayır', 'en' => 'No'],
                ],
            ],
            [
                'tr' => 'Garanti Süresi',
                'en' => 'Warranty Period',
                'store_type' => 'fitness',
                'type' => 'select',
                'is_required' => true,
                'values' => [
                    ['tr' => '1 Yıl', 'en' => '1 Year'],
                    ['tr' => '2 Yıl', 'en' => '2 Years'],
                    ['tr' => '3 Yıl', 'en' => '3 Years'],
                    ['tr' => '5 Yıl', 'en' => '5 Years'],
                    ['tr' => 'Ömür Boyu', 'en' => 'Lifetime'],
                ],
            ],
            [
                'tr' => 'Ürün Boyutları',
                'en' => 'Product Dimensions',
                'store_type' => 'fitness',
                'type' => 'text',
                'is_required' => false,
                'values' => [],
            ],

            // ============ OUTDOOR - OUTDOOR ============
            [
                'tr' => 'Su Geçirmezlik Seviyesi',
                'en' => 'Waterproof Rating',
                'store_type' => 'outdoor',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Su İtici', 'en' => 'Water Resistant'],
                    ['tr' => '3000mm', 'en' => '3000mm'],
                    ['tr' => '5000mm', 'en' => '5000mm'],
                    ['tr' => '10000mm', 'en' => '10000mm'],
                    ['tr' => '20000mm+', 'en' => '20000mm+'],
                ],
            ],
            [
                'tr' => 'Kullanım Alanı',
                'en' => 'Intended Use',
                'store_type' => 'outdoor',
                'type' => 'multiselect',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Kamp', 'en' => 'Camping'],
                    ['tr' => 'Trekking', 'en' => 'Trekking'],
                    ['tr' => 'Dağcılık', 'en' => 'Mountaineering'],
                    ['tr' => 'Balıkçılık', 'en' => 'Fishing'],
                    ['tr' => 'Avcılık', 'en' => 'Hunting'],
                ],
            ],
            [
                'tr' => 'Paket İçeriği',
                'en' => 'Package Contents',
                'store_type' => 'outdoor',
                'type' => 'textarea',
                'is_required' => false,
                'values' => [],
            ],

            // ============ ELECTRONICS - ELEKTRONİK ============
            [
                'tr' => 'Bağlantı Tipi',
                'en' => 'Connectivity',
                'store_type' => 'electronics',
                'type' => 'multiselect',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Bluetooth', 'en' => 'Bluetooth'],
                    ['tr' => 'WiFi', 'en' => 'WiFi'],
                    ['tr' => 'ANT+', 'en' => 'ANT+'],
                    ['tr' => 'USB', 'en' => 'USB'],
                    ['tr' => 'NFC', 'en' => 'NFC'],
                ],
            ],
            [
                'tr' => 'Şarj Süresi',
                'en' => 'Charging Time',
                'store_type' => 'electronics',
                'type' => 'text',
                'is_required' => false,
                'values' => [],
            ],
            [
                'tr' => 'Su/Toz Dayanıklılığı',
                'en' => 'Water/Dust Resistance',
                'store_type' => 'electronics',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['tr' => 'IP54', 'en' => 'IP54'],
                    ['tr' => 'IP65', 'en' => 'IP65'],
                    ['tr' => 'IP67', 'en' => 'IP67'],
                    ['tr' => 'IP68', 'en' => 'IP68'],
                    ['tr' => '5ATM', 'en' => '5ATM'],
                    ['tr' => '10ATM', 'en' => '10ATM'],
                ],
            ],

            // ============ TEAM SPORTS - TAKIM SPORLARI ============
            [
                'tr' => 'Oyuncu Pozisyonu',
                'en' => 'Player Position',
                'store_type' => 'team-sports',
                'type' => 'multiselect',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Kaleci', 'en' => 'Goalkeeper'],
                    ['tr' => 'Defans', 'en' => 'Defender'],
                    ['tr' => 'Orta Saha', 'en' => 'Midfielder'],
                    ['tr' => 'Forvet', 'en' => 'Forward'],
                    ['tr' => 'Tüm Pozisyonlar', 'en' => 'All Positions'],
                ],
            ],
            [
                'tr' => 'Lig Onayı',
                'en' => 'League Approval',
                'store_type' => 'team-sports',
                'type' => 'multiselect',
                'is_required' => false,
                'values' => [
                    ['tr' => 'FIFA Onaylı', 'en' => 'FIFA Approved'],
                    ['tr' => 'UEFA Onaylı', 'en' => 'UEFA Approved'],
                    ['tr' => 'TFF Onaylı', 'en' => 'TFF Approved'],
                    ['tr' => 'NBA Onaylı', 'en' => 'NBA Approved'],
                    ['tr' => 'FIBA Onaylı', 'en' => 'FIBA Approved'],
                ],
            ],

            // ============ CYCLING - BİSİKLET ============
            [
                'tr' => 'Vites Sayısı',
                'en' => 'Number of Gears',
                'store_type' => 'cycling',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Tek Vites', 'en' => 'Single Speed'],
                    ['tr' => '7 Vites', 'en' => '7 Speed'],
                    ['tr' => '21 Vites', 'en' => '21 Speed'],
                    ['tr' => '24 Vites', 'en' => '24 Speed'],
                    ['tr' => '27 Vites', 'en' => '27 Speed'],
                ],
            ],
            [
                'tr' => 'Fren Tipi',
                'en' => 'Brake Type',
                'store_type' => 'cycling',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['tr' => 'V-Brake', 'en' => 'V-Brake'],
                    ['tr' => 'Mekanik Disk', 'en' => 'Mechanical Disc'],
                    ['tr' => 'Hidrolik Disk', 'en' => 'Hydraulic Disc'],
                    ['tr' => 'Coaster Brake', 'en' => 'Coaster Brake'],
                ],
            ],

            // ============ SWIMMING - YÜZME ============
            [
                'tr' => 'Klor Dayanıklılığı',
                'en' => 'Chlorine Resistance',
                'store_type' => 'swimming',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Standart', 'en' => 'Standard'],
                    ['tr' => 'Yüksek Dayanıklılık', 'en' => 'High Resistance'],
                    ['tr' => 'Profesyonel', 'en' => 'Professional Grade'],
                ],
            ],
            [
                'tr' => 'UV Koruma',
                'en' => 'UV Protection',
                'store_type' => 'swimming',
                'type' => 'boolean',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Evet', 'en' => 'Yes'],
                    ['tr' => 'Hayır', 'en' => 'No'],
                ],
            ],

            // ============ WINTER SPORTS - KIŞ SPORLARI ============
            [
                'tr' => 'Sıcaklık Dayanımı',
                'en' => 'Temperature Rating',
                'store_type' => 'winter-sports',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['tr' => '0°C / -5°C', 'en' => '32°F / 23°F'],
                    ['tr' => '-5°C / -15°C', 'en' => '23°F / 5°F'],
                    ['tr' => '-15°C / -25°C', 'en' => '5°F / -13°F'],
                    ['tr' => '-25°C ve altı', 'en' => '-13°F and below'],
                ],
            ],
            [
                'tr' => 'Yetenek Seviyesi',
                'en' => 'Skill Level',
                'store_type' => 'winter-sports',
                'type' => 'select',
                'is_required' => false,
                'values' => [
                    ['tr' => 'Başlangıç', 'en' => 'Beginner'],
                    ['tr' => 'Orta Seviye', 'en' => 'Intermediate'],
                    ['tr' => 'İleri Seviye', 'en' => 'Advanced'],
                    ['tr' => 'Uzman', 'en' => 'Expert'],
                ],
            ],
        ];

        DB::transaction(function () use ($dynamicFields) {
            // Mevcut verileri temizle
            DB::table('translations')
                ->where('translatable_type', 'App\\Models\\DynamicFieldValue')
                ->delete();
            DB::table('translations')
                ->where('translatable_type', 'App\\Models\\DynamicField')
                ->delete();
            DB::table('dynamic_field_values')->delete();
            DB::table('dynamic_fields')->delete();

            foreach ($dynamicFields as $field) {
                $slug = Str::slug($field['en']);

                $fieldId = DB::table('dynamic_fields')->insertGetId([
                    'name' => $field['tr'],
                    'slug' => $slug,
                    'store_type' => $field['store_type'],
                    'type' => $field['type'],
                    'is_required' => $field['is_required'],
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Field translations
                $this->addTranslation($fieldId, 'App\\Models\\DynamicField', 'df', 'name', $field['tr']);
                $this->addTranslation($fieldId, 'App\\Models\\DynamicField', 'tr', 'name', $field['tr']);
                $this->addTranslation($fieldId, 'App\\Models\\DynamicField', 'en', 'name', $field['en']);

                // Values
                foreach ($field['values'] as $value) {
                    $valueId = DB::table('dynamic_field_values')->insertGetId([
                        'dynamic_field_id' => $fieldId,
                        'value' => $value['tr'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Value translations
                    $this->addTranslation($valueId, 'App\\Models\\DynamicFieldValue', 'df', 'value', $value['tr']);
                    $this->addTranslation($valueId, 'App\\Models\\DynamicFieldValue', 'tr', 'value', $value['tr']);
                    $this->addTranslation($valueId, 'App\\Models\\DynamicFieldValue', 'en', 'value', $value['en']);
                }
            }
        });

        $totalFields = count($dynamicFields);
        $totalValues = array_sum(array_map(fn($f) => count($f['values']), $dynamicFields));
        echo "Dynamic Fields seeded successfully! Fields: {$totalFields}, Values: {$totalValues}\n";
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
