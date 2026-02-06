<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductBrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            // Spor Giyim & Ayakkabı
            ['name' => 'Nike', 'category' => 'Spor'],
            ['name' => 'Adidas', 'category' => 'Spor'],
            ['name' => 'Puma', 'category' => 'Spor'],
            ['name' => 'Reebok', 'category' => 'Spor'],
            ['name' => 'New Balance', 'category' => 'Spor'],
            ['name' => 'Under Armour', 'category' => 'Spor'],
            ['name' => 'Hummel', 'category' => 'Spor'],
            ['name' => 'Joma', 'category' => 'Spor'],
            ['name' => 'Kappa', 'category' => 'Spor'],
            ['name' => 'FILA', 'category' => 'Spor'],
            ['name' => 'Jordan Brand', 'category' => 'Spor'],
            ['name' => 'Mizuno', 'category' => 'Spor'],
            ['name' => 'Asics', 'category' => 'Spor'],
            ['name' => 'Skechers', 'category' => 'Spor'],
            ['name' => 'Speedo', 'category' => 'Spor'],
            ['name' => 'Wilson', 'category' => 'Spor'],
            ['name' => 'Decathlon', 'category' => 'Spor'],
            ['name' => 'Everlast', 'category' => 'Spor'],
            ['name' => 'Bilcee', 'category' => 'Spor'],
            ['name' => 'Exuma', 'category' => 'Spor'],
            ['name' => 'Maraton', 'category' => 'Spor'],

            // Koşu & Maraton
            ['name' => 'Hoka', 'category' => 'Koşu'],
            ['name' => 'Brooks', 'category' => 'Koşu'],
            ['name' => 'Saucony', 'category' => 'Koşu'],
            ['name' => 'On Running', 'category' => 'Koşu'],

            // Outdoor
            ['name' => 'The North Face', 'category' => 'Outdoor'],
            ['name' => 'Columbia', 'category' => 'Outdoor'],
            ['name' => 'Salomon', 'category' => 'Outdoor'],
            ['name' => 'Merrell', 'category' => 'Outdoor'],
            ['name' => 'Jack Wolfskin', 'category' => 'Outdoor'],
            ['name' => 'Mammut', 'category' => 'Outdoor'],
            ['name' => 'Helly Hansen', 'category' => 'Outdoor'],
            ['name' => 'Quechua', 'category' => 'Outdoor'],
            ['name' => 'Marmot', 'category' => 'Outdoor'],
            ['name' => 'Osprey', 'category' => 'Outdoor'],
            ['name' => 'Deuter', 'category' => 'Outdoor'],
            ['name' => 'MSR', 'category' => 'Outdoor'],
            ['name' => 'Coleman', 'category' => 'Outdoor'],
            ['name' => 'Black Diamond', 'category' => 'Outdoor'],
            ['name' => 'Orcamp', 'category' => 'Outdoor'],
            ['name' => 'Stanley', 'category' => 'Outdoor'],
            ['name' => 'Thermos', 'category' => 'Outdoor'],
            ['name' => 'Contigo', 'category' => 'Outdoor'],
            ['name' => 'Buff', 'category' => 'Outdoor'],

            // Supplement - Yerli Markalar
            ['name' => 'Hardline Nutrition', 'category' => 'Supplement'],
            ['name' => 'BigJoy', 'category' => 'Supplement'],
            ['name' => 'Kingsize Nutrition', 'category' => 'Supplement'],
            ['name' => 'Nutrever', 'category' => 'Supplement'],
            ['name' => 'Torq Nutrition', 'category' => 'Supplement'],
            ['name' => 'Prime Nutrition', 'category' => 'Supplement'],
            ['name' => 'Supplementler', 'category' => 'Supplement'],
            // Supplement - Global Markalar
            ['name' => 'Olimp', 'category' => 'Supplement'],
            ['name' => 'Nutrend', 'category' => 'Supplement'],
            ['name' => 'Multipower', 'category' => 'Supplement'],
            ['name' => 'Optimum Nutrition', 'category' => 'Supplement'],
            ['name' => 'MyProtein', 'category' => 'Supplement'],
            ['name' => 'Scitec Nutrition', 'category' => 'Supplement'],
            ['name' => 'Muscletech', 'category' => 'Supplement'],
            ['name' => 'Weider', 'category' => 'Supplement'],
            ['name' => 'BSN', 'category' => 'Supplement'],
            ['name' => 'Dymatize', 'category' => 'Supplement'],
            ['name' => 'Grenade', 'category' => 'Supplement'],
            ['name' => 'Solgar', 'category' => 'Supplement'],
            ['name' => 'Voonka', 'category' => 'Supplement'],
            ['name' => 'Now Foods', 'category' => 'Supplement'],

            // Fitness Ekipman
            ['name' => 'Technogym', 'category' => 'Fitness'],
            ['name' => 'Life Fitness', 'category' => 'Fitness'],
            ['name' => 'Hammer Strength', 'category' => 'Fitness'],
            ['name' => 'Body Solid', 'category' => 'Fitness'],
            ['name' => 'NordicTrack', 'category' => 'Fitness'],
            ['name' => 'ProForm', 'category' => 'Fitness'],
            ['name' => 'Bowflex', 'category' => 'Fitness'],

            // Spor Elektroniği
            ['name' => 'Garmin', 'category' => 'Elektronik'],
            ['name' => 'Polar', 'category' => 'Elektronik'],
            ['name' => 'Fitbit', 'category' => 'Elektronik'],
            ['name' => 'Suunto', 'category' => 'Elektronik'],
            ['name' => 'Coros', 'category' => 'Elektronik'],
            ['name' => 'Amazfit', 'category' => 'Elektronik'],
            ['name' => 'Apple', 'category' => 'Elektronik'],
            ['name' => 'Samsung', 'category' => 'Elektronik'],
            ['name' => 'Xiaomi', 'category' => 'Elektronik'],
            ['name' => 'JBL', 'category' => 'Elektronik'],
            ['name' => 'Bose', 'category' => 'Elektronik'],
            ['name' => 'Sony', 'category' => 'Elektronik'],
            ['name' => 'Jabra', 'category' => 'Elektronik'],
            ['name' => 'GoPro', 'category' => 'Elektronik'],
            ['name' => 'Wahoo', 'category' => 'Elektronik'],

            // Raket Sporları
            ['name' => 'Yonex', 'category' => 'Raket'],
            ['name' => 'Head', 'category' => 'Raket'],
            ['name' => 'Babolat', 'category' => 'Raket'],
            ['name' => 'Dunlop', 'category' => 'Raket'],

            // Top Sporları
            ['name' => 'Spalding', 'category' => 'Top'],
            ['name' => 'Molten', 'category' => 'Top'],
            ['name' => 'Mikasa', 'category' => 'Top'],
            ['name' => 'AND1', 'category' => 'Top'],

            // Bisiklet
            ['name' => 'Trek', 'category' => 'Bisiklet'],
            ['name' => 'Giant', 'category' => 'Bisiklet'],
            ['name' => 'Specialized', 'category' => 'Bisiklet'],
            ['name' => 'Carraro', 'category' => 'Bisiklet'],
            ['name' => 'Bianchi', 'category' => 'Bisiklet'],

            // Gözlük & Aksesuar
            ['name' => 'Oakley', 'category' => 'Aksesuar'],
            ['name' => 'Ray-Ban', 'category' => 'Aksesuar'],
            ['name' => 'Carrera', 'category' => 'Aksesuar'],

            // Doğal & Organik
            ['name' => 'Wefood', 'category' => 'Organik'],
            ['name' => 'Mecitefendi', 'category' => 'Organik'],
            ['name' => 'Arifoğlu', 'category' => 'Organik'],

            // Giyim Markaları
            ['name' => 'Tommy Hilfiger', 'category' => 'Giyim'],
            ['name' => 'Calvin Klein', 'category' => 'Giyim'],
            ['name' => 'Levi\'s', 'category' => 'Giyim'],
            ['name' => 'Diesel', 'category' => 'Giyim'],
            ['name' => 'Guess', 'category' => 'Giyim'],
        ];

        foreach ($brands as $index => $brand) {
            $brandId = DB::table('product_brand')->insertGetId([
                'brand_name' => $brand['name'],
                'brand_slug' => Str::slug($brand['name']),
                'display_order' => $index + 1,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Translations
            foreach (['df', 'tr', 'en'] as $lang) {
                DB::table('translations')->insert([
                    'translatable_id' => $brandId,
                    'translatable_type' => 'App\\Models\\ProductBrand',
                    'language' => $lang,
                    'key' => 'brand_name',
                    'value' => $brand['name'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        echo "Brands seeded successfully! Total: " . count($brands) . "\n";
    }
}
