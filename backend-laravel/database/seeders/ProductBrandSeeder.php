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
            ['name' => 'Nike', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'],
            ['name' => 'Adidas', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=200'],
            ['name' => 'Puma', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200'],
            ['name' => 'Reebok', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=200'],
            ['name' => 'New Balance', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=200'],
            ['name' => 'Under Armour', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=200'],
            ['name' => 'Hummel', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200'],
            ['name' => 'Joma', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=200'],
            ['name' => 'Kappa', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200'],
            ['name' => 'FILA', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=200'],
            ['name' => 'Jordan Brand', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=200'],
            ['name' => 'Mizuno', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=200'],
            ['name' => 'Asics', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=200'],
            ['name' => 'Skechers', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=200'],
            ['name' => 'Speedo', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=200'],
            ['name' => 'Wilson', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1617083934555-ac7d4c10cd50?w=200'],
            ['name' => 'Decathlon', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200'],
            ['name' => 'Everlast', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=200'],
            ['name' => 'Bilcee', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=200'],
            ['name' => 'Exuma', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200'],
            ['name' => 'Maraton', 'category' => 'Spor', 'image' => 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=200'],

            // Koşu & Maraton
            ['name' => 'Hoka', 'category' => 'Koşu', 'image' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200'],
            ['name' => 'Brooks', 'category' => 'Koşu', 'image' => 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=200'],
            ['name' => 'Saucony', 'category' => 'Koşu', 'image' => 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=200'],
            ['name' => 'On Running', 'category' => 'Koşu', 'image' => 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=200'],

            // Outdoor
            ['name' => 'The North Face', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200'],
            ['name' => 'Columbia', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=200'],
            ['name' => 'Salomon', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=200'],
            ['name' => 'Merrell', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=200'],
            ['name' => 'Jack Wolfskin', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=200'],
            ['name' => 'Mammut', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=200'],
            ['name' => 'Helly Hansen', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=200'],
            ['name' => 'Quechua', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200'],
            ['name' => 'Marmot', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=200'],
            ['name' => 'Osprey', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200'],
            ['name' => 'Deuter', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=200'],
            ['name' => 'MSR', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=200'],
            ['name' => 'Coleman', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=200'],
            ['name' => 'Black Diamond', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=200'],
            ['name' => 'Orcamp', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=200'],
            ['name' => 'Stanley', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200'],
            ['name' => 'Thermos', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200'],
            ['name' => 'Contigo', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200'],
            ['name' => 'Buff', 'category' => 'Outdoor', 'image' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200'],

            // Supplement - Yerli Markalar
            ['name' => 'Hardline Nutrition', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200'],
            ['name' => 'BigJoy', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=200'],
            ['name' => 'Kingsize Nutrition', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200'],
            ['name' => 'Nutrever', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=200'],
            ['name' => 'Torq Nutrition', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200'],
            ['name' => 'Prime Nutrition', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200'],
            ['name' => 'Supplementler', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200'],
            // Supplement - Global Markalar
            ['name' => 'Olimp', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200'],
            ['name' => 'Nutrend', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=200'],
            ['name' => 'Multipower', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200'],
            ['name' => 'Optimum Nutrition', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200'],
            ['name' => 'MyProtein', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=200'],
            ['name' => 'Scitec Nutrition', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200'],
            ['name' => 'Muscletech', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=200'],
            ['name' => 'Weider', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200'],
            ['name' => 'BSN', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200'],
            ['name' => 'Dymatize', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200'],
            ['name' => 'Grenade', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=200'],
            ['name' => 'Solgar', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200'],
            ['name' => 'Voonka', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200'],
            ['name' => 'Now Foods', 'category' => 'Supplement', 'image' => 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200'],

            // Fitness Ekipman
            ['name' => 'Technogym', 'category' => 'Fitness', 'image' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200'],
            ['name' => 'Life Fitness', 'category' => 'Fitness', 'image' => 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=200'],
            ['name' => 'Hammer Strength', 'category' => 'Fitness', 'image' => 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=200'],
            ['name' => 'Body Solid', 'category' => 'Fitness', 'image' => 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=200'],
            ['name' => 'NordicTrack', 'category' => 'Fitness', 'image' => 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=200'],
            ['name' => 'ProForm', 'category' => 'Fitness', 'image' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200'],
            ['name' => 'Bowflex', 'category' => 'Fitness', 'image' => 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=200'],

            // Spor Elektroniği
            ['name' => 'Garmin', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200'],
            ['name' => 'Polar', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=200'],
            ['name' => 'Fitbit', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=200'],
            ['name' => 'Suunto', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200'],
            ['name' => 'Coros', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=200'],
            ['name' => 'Amazfit', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=200'],
            ['name' => 'Apple', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200'],
            ['name' => 'Samsung', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=200'],
            ['name' => 'Xiaomi', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=200'],
            ['name' => 'JBL', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200'],
            ['name' => 'Bose', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200'],
            ['name' => 'Sony', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200'],
            ['name' => 'Jabra', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200'],
            ['name' => 'GoPro', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=200'],
            ['name' => 'Wahoo', 'category' => 'Elektronik', 'image' => 'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=200'],

            // Raket Sporları
            ['name' => 'Yonex', 'category' => 'Raket', 'image' => 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=200'],
            ['name' => 'Head', 'category' => 'Raket', 'image' => 'https://images.unsplash.com/photo-1617083934555-ac7d4c10cd50?w=200'],
            ['name' => 'Babolat', 'category' => 'Raket', 'image' => 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=200'],
            ['name' => 'Dunlop', 'category' => 'Raket', 'image' => 'https://images.unsplash.com/photo-1558287906-c20471dcc32b?w=200'],

            // Top Sporları
            ['name' => 'Spalding', 'category' => 'Top', 'image' => 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=200'],
            ['name' => 'Molten', 'category' => 'Top', 'image' => 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=200'],
            ['name' => 'Mikasa', 'category' => 'Top', 'image' => 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=200'],
            ['name' => 'AND1', 'category' => 'Top', 'image' => 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=200'],

            // Bisiklet
            ['name' => 'Trek', 'category' => 'Bisiklet', 'image' => 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200'],
            ['name' => 'Giant', 'category' => 'Bisiklet', 'image' => 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=200'],
            ['name' => 'Specialized', 'category' => 'Bisiklet', 'image' => 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200'],
            ['name' => 'Carraro', 'category' => 'Bisiklet', 'image' => 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=200'],
            ['name' => 'Bianchi', 'category' => 'Bisiklet', 'image' => 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=200'],

            // Gözlük & Aksesuar
            ['name' => 'Oakley', 'category' => 'Aksesuar', 'image' => 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200'],
            ['name' => 'Ray-Ban', 'category' => 'Aksesuar', 'image' => 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200'],
            ['name' => 'Carrera', 'category' => 'Aksesuar', 'image' => 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200'],

            // Doğal & Organik
            ['name' => 'Wefood', 'category' => 'Organik', 'image' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200'],
            ['name' => 'Mecitefendi', 'category' => 'Organik', 'image' => 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200'],
            ['name' => 'Arifoğlu', 'category' => 'Organik', 'image' => 'https://images.unsplash.com/photo-1550831107-1553da8c8464?w=200'],

            // Giyim Markaları
            ['name' => 'Tommy Hilfiger', 'category' => 'Giyim', 'image' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200'],
            ['name' => 'Calvin Klein', 'category' => 'Giyim', 'image' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=200'],
            ['name' => 'Levi\'s', 'category' => 'Giyim', 'image' => 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200'],
            ['name' => 'Diesel', 'category' => 'Giyim', 'image' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200'],
            ['name' => 'Guess', 'category' => 'Giyim', 'image' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=200'],
        ];

        foreach ($brands as $index => $brand) {
            $brandId = DB::table('product_brand')->insertGetId([
                'brand_name' => $brand['name'],
                'brand_slug' => Str::slug($brand['name']),
                'brand_logo' => $brand['image'] ?? null,
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
