<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StoreSeeder extends Seeder
{
    public function run(): void
    {
        $stores = [
            // ============ SUPPLEMENT MAĞAZALARI ============
            [
                'tr' => [
                    'name' => 'Supplementler',
                    'address' => 'Maslak, Büyükdere Caddesi No: 255, Sarıyer, İstanbul',
                    'meta_title' => 'Supplementler - Türkiye\'nin En Büyük Sporcu Gıdası Mağazası',
                    'meta_description' => 'Whey protein, kreatin, BCAA ve tüm sporcu takviyeleri. Hardline, BigJoy, Olimp, Weider ve daha fazlası.',
                ],
                'en' => [
                    'name' => 'Supplementler',
                    'address' => 'Maslak, Buyukdere Avenue No: 255, Sariyer, Istanbul',
                    'meta_title' => 'Supplementler - Turkey\'s Largest Sports Nutrition Store',
                    'meta_description' => 'Whey protein, creatine, BCAA and all sports supplements. Hardline, BigJoy, Olimp, Weider and more.',
                ],
                'store_type' => null,
                'phone' => '2122800000',
                'email' => 'info@supplementler.com',
                'latitude' => '41.1082',
                'longitude' => '29.0260',
                'opening_time' => '09:00:00',
                'closing_time' => '21:00:00',
                'off_day' => null,
            ],
            [
                'tr' => [
                    'name' => 'Protein34',
                    'address' => 'Kadıköy, Moda Caddesi No: 45, İstanbul',
                    'meta_title' => 'Protein34 - Sporcu Besinleri ve Takviyeler',
                    'meta_description' => 'BigJoy, Hardline, Kingsize ve yerli üretim sporcu gıdaları. Güvenilir alışveriş.',
                ],
                'en' => [
                    'name' => 'Protein34',
                    'address' => 'Kadikoy, Moda Avenue No: 45, Istanbul',
                    'meta_title' => 'Protein34 - Sports Nutrition and Supplements',
                    'meta_description' => 'BigJoy, Hardline, Kingsize and domestic sports nutrition products. Reliable shopping.',
                ],
                'store_type' => null,
                'phone' => '2164500034',
                'email' => 'info@protein34.com',
                'latitude' => '40.9833',
                'longitude' => '29.0333',
                'opening_time' => '09:00:00',
                'closing_time' => '20:00:00',
                'off_day' => 'Pazar',
            ],

            // ============ FITNESS GİYİM ============
            [
                'tr' => [
                    'name' => 'Superstacy',
                    'address' => 'Nişantaşı, Abdi İpekçi Caddesi No: 78, Şişli, İstanbul',
                    'meta_title' => 'Superstacy - Kadın Fitness ve Spor Giyim',
                    'meta_description' => 'Spor taytları, büstiyerler, crop toplar. Hareket özgürlüğü için tasarlandı.',
                ],
                'en' => [
                    'name' => 'Superstacy',
                    'address' => 'Nisantasi, Abdi Ipekci Avenue No: 78, Sisli, Istanbul',
                    'meta_title' => 'Superstacy - Women\'s Fitness and Sports Wear',
                    'meta_description' => 'Sports leggings, sports bras, crop tops. Designed for freedom of movement.',
                ],
                'store_type' => null,
                'phone' => '2122300000',
                'email' => 'info@superstacy.com.tr',
                'latitude' => '41.0500',
                'longitude' => '28.9900',
                'opening_time' => '10:00:00',
                'closing_time' => '21:00:00',
                'off_day' => null,
            ],

            // ============ KAMP & OUTDOOR ============
            [
                'tr' => [
                    'name' => 'Orcamp',
                    'address' => 'Pendik, Organize Sanayi Bölgesi No: 123, İstanbul',
                    'meta_title' => 'Orcamp - Türkiye\'nin Kamp Malzemeleri Markası',
                    'meta_description' => '25 yıllık tecrübe ile kamp çadırları, uyku tulumları ve outdoor ekipmanları. Yerli üretim.',
                ],
                'en' => [
                    'name' => 'Orcamp',
                    'address' => 'Pendik, Organized Industrial Zone No: 123, Istanbul',
                    'meta_title' => 'Orcamp - Turkey\'s Camping Equipment Brand',
                    'meta_description' => 'Camping tents, sleeping bags and outdoor equipment with 25 years of experience. Domestic production.',
                ],
                'store_type' => null,
                'phone' => '2163800000',
                'email' => 'info@orcamp.com.tr',
                'latitude' => '40.9167',
                'longitude' => '29.2500',
                'opening_time' => '09:00:00',
                'closing_time' => '18:00:00',
                'off_day' => 'Cumartesi,Pazar',
            ],
            [
                'tr' => [
                    'name' => 'Kutupayısı',
                    'address' => 'Beşiktaş, Barbaros Bulvarı No: 156, İstanbul',
                    'meta_title' => 'Kutupayısı - Outdoor Ekipmanları ve Doğa Sporları',
                    'meta_description' => 'Stanley termos, trekking ayakkabı, kamp malzemeleri. Premium outdoor markalar.',
                ],
                'en' => [
                    'name' => 'Kutupayisi',
                    'address' => 'Besiktas, Barbaros Boulevard No: 156, Istanbul',
                    'meta_title' => 'Kutupayisi - Outdoor Equipment and Nature Sports',
                    'meta_description' => 'Stanley thermos, trekking shoes, camping equipment. Premium outdoor brands.',
                ],
                'store_type' => null,
                'phone' => '2122600000',
                'email' => 'info@kutupayisi.com',
                'latitude' => '41.0433',
                'longitude' => '29.0067',
                'opening_time' => '10:00:00',
                'closing_time' => '20:00:00',
                'off_day' => 'Pazar',
            ],

            // ============ SPOR MAĞAZALARI ============
            [
                'tr' => [
                    'name' => 'Decathlon',
                    'address' => 'Forum İstanbul AVM, Bayrampaşa, İstanbul',
                    'meta_title' => 'Decathlon - Her Seviye İçin Spor Malzemeleri',
                    'meta_description' => '80\'den fazla spor dalı için ekipman ve giyim. Uygun fiyatlı kaliteli ürünler.',
                ],
                'en' => [
                    'name' => 'Decathlon',
                    'address' => 'Forum Istanbul Mall, Bayrampasa, Istanbul',
                    'meta_title' => 'Decathlon - Sports Equipment for All Levels',
                    'meta_description' => 'Equipment and clothing for over 80 sports. Quality products at affordable prices.',
                ],
                'store_type' => null,
                'phone' => '2125000000',
                'email' => 'info@decathlon.com.tr',
                'latitude' => '41.0400',
                'longitude' => '28.9100',
                'opening_time' => '10:00:00',
                'closing_time' => '22:00:00',
                'off_day' => null,
            ],
            [
                'tr' => [
                    'name' => 'Intersport',
                    'address' => 'Cevahir AVM, Şişli, İstanbul',
                    'meta_title' => 'Intersport - Dünya Markalarıyla Spor',
                    'meta_description' => 'Nike, Adidas, Puma ve daha fazlası. Profesyonel spor ekipmanları.',
                ],
                'en' => [
                    'name' => 'Intersport',
                    'address' => 'Cevahir Mall, Sisli, Istanbul',
                    'meta_title' => 'Intersport - Sports with World Brands',
                    'meta_description' => 'Nike, Adidas, Puma and more. Professional sports equipment.',
                ],
                'store_type' => null,
                'phone' => '2123800000',
                'email' => 'info@intersport.com.tr',
                'latitude' => '41.0600',
                'longitude' => '28.9900',
                'opening_time' => '10:00:00',
                'closing_time' => '22:00:00',
                'off_day' => null,
            ],

            // ============ KİTAP ============
            [
                'tr' => [
                    'name' => 'Spor Kitaplığı',
                    'address' => 'Beyoğlu, İstiklal Caddesi No: 123, İstanbul',
                    'meta_title' => 'Spor Kitaplığı - Spor ve Outdoor Kitapları',
                    'meta_description' => 'Spor, fitness, outdoor, macera ve dağcılık kitapları. Motivasyon ve kişisel gelişim eserleri.',
                ],
                'en' => [
                    'name' => 'Sports Bookstore',
                    'address' => 'Beyoglu, Istiklal Avenue No: 123, Istanbul',
                    'meta_title' => 'Sports Bookstore - Sports and Outdoor Books',
                    'meta_description' => 'Sports, fitness, outdoor, adventure and mountaineering books. Motivation and self-improvement works.',
                ],
                'store_type' => null,
                'phone' => '2122450000',
                'email' => 'info@sporkitapligi.com',
                'latitude' => '41.0331',
                'longitude' => '28.9778',
                'opening_time' => '10:00:00',
                'closing_time' => '21:00:00',
                'off_day' => 'Pazar',
            ],
        ];

        DB::transaction(function () use ($stores) {
            // Mevcut store ve translationları temizle
            DB::table('translations')
                ->where('translatable_type', 'App\\Models\\Store')
                ->delete();
            DB::table('stores')->delete();

            foreach ($stores as $index => $store) {
                $slug = Str::slug($store['tr']['name']);

                $storeId = DB::table('stores')->insertGetId([
                    'area_id' => 1,
                    'store_seller_id' => 1,
                    'store_type' => $store['store_type'],
                    'name' => $store['tr']['name'],
                    'slug' => $slug,
                    'phone' => $store['phone'],
                    'email' => $store['email'],
                    'logo' => null,
                    'banner' => null,
                    'address' => $store['tr']['address'],
                    'latitude' => $store['latitude'],
                    'longitude' => $store['longitude'],
                    'is_featured' => true,
                    'opening_time' => $store['opening_time'],
                    'closing_time' => $store['closing_time'],
                    'tax' => 20,
                    'tax_number' => 'TR' . rand(1000000000, 9999999999),
                    'subscription_type' => 'commission',
                    'admin_commission_type' => 'percent',
                    'admin_commission_amount' => 10.00,
                    'delivery_charge' => 29.90,
                    'delivery_time' => '1-3 gün',
                    'delivery_self_system' => true,
                    'delivery_take_away' => true,
                    'order_minimum' => 100,
                    'veg_status' => 0,
                    'off_day' => $store['off_day'],
                    'enable_saling' => 1,
                    'meta_title' => $store['tr']['meta_title'],
                    'meta_description' => $store['tr']['meta_description'],
                    'meta_image' => null,
                    'status' => 1,
                    'created_by' => 1,
                    'updated_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Translations
                $translationKeys = ['name', 'address', 'meta_title', 'meta_description'];

                foreach ($translationKeys as $key) {
                    // Default (TR)
                    $this->addTranslation($storeId, 'df', $key, $store['tr'][$key]);
                    // Turkish
                    $this->addTranslation($storeId, 'tr', $key, $store['tr'][$key]);
                    // English
                    $this->addTranslation($storeId, 'en', $key, $store['en'][$key]);
                }

                // Slug translation
                $this->addTranslation($storeId, 'df', 'slug', $slug);
                $this->addTranslation($storeId, 'tr', 'slug', $slug);
                $this->addTranslation($storeId, 'en', 'slug', Str::slug($store['en']['name']));
            }
        });

        echo "Stores seeded successfully! Total: " . count($stores) . "\n";
    }

    private function addTranslation(int $storeId, string $lang, string $key, string $value): void
    {
        DB::table('translations')->insert([
            'translatable_id' => $storeId,
            'translatable_type' => 'App\\Models\\Store',
            'language' => $lang,
            'key' => $key,
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
