<?php

namespace Database\Seeders;

use App\Models\StoreType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StoreTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('store_types')) {
            $this->command->warn('StoreTypeSeeder: store_types table does not exist. Skipping...');
            return;
        }

        $storeTypes = [
            [
                'name_tr' => 'Genel Mağaza',
                'name_en' => 'General Store',
                'description_tr' => 'Her türlü ürün satılabilen, kendi kategorilerini oluşturabilen esnek mağaza türü.',
                'description_en' => 'Flexible store type where any kind of product can be sold with custom categories.',
                'additional_charge_name_tr' => 'Paketleme Ücreti',
                'additional_charge_name_en' => 'Packaging Fee',
                'type' => \App\Enums\StoreType::GENERAL->value,
                'image' => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
            ],
            [
                'name_tr' => 'Market',
                'name_en' => 'Grocery',
                'description_tr' => 'Günlük ihtiyaçlarınız için taze gıda ve market ürünleri.',
                'description_en' => 'Fresh food and grocery products for your daily needs.',
                'additional_charge_name_tr' => 'Paketleme Ücreti',
                'additional_charge_name_en' => 'Packaging Fee',
                'type' => \App\Enums\StoreType::GROCERY->value,
                'image' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
            ],
            [
                'name_tr' => 'Fırın & Pastane',
                'name_en' => 'Bakery',
                'description_tr' => 'Taze ekmek, pasta ve unlu mamüller.',
                'description_en' => 'Fresh bread, cakes and bakery products.',
                'additional_charge_name_tr' => 'Paketleme Ücreti',
                'additional_charge_name_en' => 'Packaging Fee',
                'type' => \App\Enums\StoreType::BAKERY->value,
                'image' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
            ],
            [
                'name_tr' => 'Eczane',
                'name_en' => 'Pharmacy',
                'description_tr' => 'İlaç, sağlık ve kişisel bakım ürünleri.',
                'description_en' => 'Medicine, health and personal care products.',
                'additional_charge_name_tr' => 'Güvenli Paketleme Ücreti',
                'additional_charge_name_en' => 'Safe Packaging Fee',
                'type' => \App\Enums\StoreType::MEDICINE->value,
                'image' => 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
            ],
            [
                'name_tr' => 'Kozmetik',
                'name_en' => 'Cosmetics',
                'description_tr' => 'Makyaj, cilt bakımı ve güzellik ürünleri.',
                'description_en' => 'Makeup, skincare and beauty products.',
                'additional_charge_name_tr' => 'Koruyucu Paketleme Ücreti',
                'additional_charge_name_en' => 'Protective Packaging Fee',
                'type' => \App\Enums\StoreType::MAKEUP->value,
                'image' => 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
            ],
            [
                'name_tr' => 'Çanta & Aksesuar',
                'name_en' => 'Bags & Accessories',
                'description_tr' => 'Çanta, cüzdan ve moda aksesuarları.',
                'description_en' => 'Bags, wallets and fashion accessories.',
                'additional_charge_name_tr' => 'Paketleme Ücreti',
                'additional_charge_name_en' => 'Packaging Fee',
                'type' => \App\Enums\StoreType::BAGS->value,
                'image' => 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
            ],
            [
                'name_tr' => 'Giyim',
                'name_en' => 'Clothing',
                'description_tr' => 'Kadın, erkek ve çocuk giyim ürünleri.',
                'description_en' => 'Women, men and kids clothing products.',
                'additional_charge_name_tr' => 'Paketleme Ücreti',
                'additional_charge_name_en' => 'Packaging Fee',
                'type' => \App\Enums\StoreType::CLOTHING->value,
                'image' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
            ],
            [
                'name_tr' => 'Mobilya',
                'name_en' => 'Furniture',
                'description_tr' => 'Ev ve ofis mobilyaları, dekorasyon ürünleri.',
                'description_en' => 'Home and office furniture, decoration products.',
                'additional_charge_name_tr' => 'Hacimli Ürün Ücreti',
                'additional_charge_name_en' => 'Bulky Item Fee',
                'type' => \App\Enums\StoreType::FURNITURE->value,
                'image' => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
            ],
            [
                'name_tr' => 'Kitap & Kırtasiye',
                'name_en' => 'Books & Stationery',
                'description_tr' => 'Kitap, dergi ve kırtasiye malzemeleri.',
                'description_en' => 'Books, magazines and stationery supplies.',
                'additional_charge_name_tr' => 'Paketleme Ücreti',
                'additional_charge_name_en' => 'Packaging Fee',
                'type' => \App\Enums\StoreType::BOOKS->value,
                'image' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
            ],
            [
                'name_tr' => 'Elektronik',
                'name_en' => 'Electronics',
                'description_tr' => 'Telefon, bilgisayar ve elektronik cihazlar.',
                'description_en' => 'Phones, computers and electronic devices.',
                'additional_charge_name_tr' => 'Elektronik Güvence Ücreti',
                'additional_charge_name_en' => 'Electronics Protection Fee',
                'type' => \App\Enums\StoreType::GADGET->value,
                'image' => 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
            ],
            [
                'name_tr' => 'Pet Shop',
                'name_en' => 'Pet Shop',
                'description_tr' => 'Evcil hayvan maması ve aksesuarları.',
                'description_en' => 'Pet food and accessories.',
                'additional_charge_name_tr' => 'Paketleme Ücreti',
                'additional_charge_name_en' => 'Packaging Fee',
                'type' => \App\Enums\StoreType::ANIMALS_PET->value,
                'image' => 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
            ],
            [
                'name_tr' => 'Balıkçı',
                'name_en' => 'Fish Market',
                'description_tr' => 'Taze balık ve deniz ürünleri.',
                'description_en' => 'Fresh fish and seafood products.',
                'additional_charge_name_tr' => 'Soğuk Zincir Ücreti',
                'additional_charge_name_en' => 'Cold Chain Fee',
                'type' => \App\Enums\StoreType::FISH->value,
                'image' => 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=400',
            ],
            [
                'name_tr' => 'Restoran',
                'name_en' => 'Restaurant',
                'description_tr' => 'Sıcak yemekler, özel tarifler ve lezzetli menüler.',
                'description_en' => 'Hot meals, special recipes and delicious menus.',
                'additional_charge_name_tr' => 'Ambalaj Ücreti',
                'additional_charge_name_en' => 'Packaging Fee',
                'type' => \App\Enums\StoreType::RESTAURANT->value,
                'image' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
            ],
            [
                'name_tr' => 'Kafe',
                'name_en' => 'Café',
                'description_tr' => 'Kahve, çay, soğuk içecekler ve hafif atıştırmalıklar.',
                'description_en' => 'Coffee, tea, cold drinks and light snacks.',
                'additional_charge_name_tr' => 'Ambalaj Ücreti',
                'additional_charge_name_en' => 'Packaging Fee',
                'type' => \App\Enums\StoreType::CAFE->value,
                'image' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
            ],
            [
                'name_tr' => 'Hazır Yemek & Fast Food',
                'name_en' => 'Fast Food',
                'description_tr' => 'Hızlı servis, burger, pizza ve hazır yemek seçenekleri.',
                'description_en' => 'Quick service, burgers, pizza and ready meal options.',
                'additional_charge_name_tr' => 'Ambalaj Ücreti',
                'additional_charge_name_en' => 'Packaging Fee',
                'type' => \App\Enums\StoreType::FAST_FOOD->value,
                'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
            ],
            [
                'name_tr' => 'Çiçekçi',
                'name_en' => 'Florist',
                'description_tr' => 'Taze çiçek buketleri, çiçek aranjmanları ve saksı bitkileri.',
                'description_en' => 'Fresh flower bouquets, floral arrangements and potted plants.',
                'additional_charge_name_tr' => 'Soğuk Paketleme Ücreti',
                'additional_charge_name_en' => 'Cold Packaging Fee',
                'type' => \App\Enums\StoreType::FLORIST->value,
                'image' => 'https://images.unsplash.com/photo-1487530811015-780f5e1df0e8?w=400',
            ],
            [
                'name_tr' => 'Spor & Fitness',
                'name_en' => 'Sports & Fitness',
                'description_tr' => 'Spor malzemeleri, ekipmanlar ve fitness ürünleri.',
                'description_en' => 'Sports equipment, gear and fitness products.',
                'additional_charge_name_tr' => 'Ağır Ürün Ücreti',
                'additional_charge_name_en' => 'Heavy Item Fee',
                'type' => \App\Enums\StoreType::SPORTS->value,
                'image' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
            ],
            [
                'name_tr' => 'Oyuncak',
                'name_en' => 'Toys',
                'description_tr' => 'Çocuklar için eğitici oyuncaklar, oyun setleri ve hobiler.',
                'description_en' => 'Educational toys, game sets and hobbies for children.',
                'additional_charge_name_tr' => 'Paketleme Ücreti',
                'additional_charge_name_en' => 'Packaging Fee',
                'type' => \App\Enums\StoreType::TOY->value,
                'image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
            ],
            [
                'name_tr' => 'Kuyumcu & Mücevher',
                'name_en' => 'Jewelry',
                'description_tr' => 'Altın, gümüş, mücevher ve takı ürünleri.',
                'description_en' => 'Gold, silver, gemstones and jewelry products.',
                'additional_charge_name_tr' => 'Güvenli Teslimat Ücreti',
                'additional_charge_name_en' => 'Secure Delivery Fee',
                'type' => \App\Enums\StoreType::JEWELRY->value,
                'image' => 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
            ],
            [
                'name_tr' => 'Ev Dekorasyonu',
                'name_en' => 'Home Decor',
                'description_tr' => 'Ev aksesuarları, dekoratif ürünler ve iç mimari öğeleri.',
                'description_en' => 'Home accessories, decorative products and interior design items.',
                'additional_charge_name_tr' => 'Hacimli Ürün Ücreti',
                'additional_charge_name_en' => 'Bulky Item Fee',
                'type' => \App\Enums\StoreType::HOME_DECOR->value,
                'image' => 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400',
            ],
            [
                'name_tr' => 'Oto & Yedek Parça',
                'name_en' => 'Auto Parts',
                'description_tr' => 'Araç aksesuarları, yedek parçalar ve oto bakım ürünleri.',
                'description_en' => 'Vehicle accessories, spare parts and auto care products.',
                'additional_charge_name_tr' => 'Ağır Ürün Ücreti',
                'additional_charge_name_en' => 'Heavy Item Fee',
                'type' => \App\Enums\StoreType::AUTO_PARTS->value,
                'image' => 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
            ],
            [
                'name_tr' => 'Organik Market',
                'name_en' => 'Organic Store',
                'description_tr' => 'Doğal, organik ve sağlıklı gıda ürünleri.',
                'description_en' => 'Natural, organic and healthy food products.',
                'additional_charge_name_tr' => 'Ekolojik Paketleme Ücreti',
                'additional_charge_name_en' => 'Eco Packaging Fee',
                'type' => \App\Enums\StoreType::ORGANIC->value,
                'image' => 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
            ],
            [
                'name_tr' => 'Kasap',
                'name_en' => 'Butcher',
                'description_tr' => 'Taze et, tavuk, şarküteri ve et ürünleri.',
                'description_en' => 'Fresh meat, chicken, delicatessen and meat products.',
                'additional_charge_name_tr' => 'Soğuk Zincir Ücreti',
                'additional_charge_name_en' => 'Cold Chain Fee',
                'type' => \App\Enums\StoreType::BUTCHER->value,
                'image' => 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
            ],
            [
                'name_tr' => 'Manav',
                'name_en' => 'Fruit & Vegetable',
                'description_tr' => 'Taze meyve, sebze ve mevsim ürünleri.',
                'description_en' => 'Fresh fruits, vegetables and seasonal products.',
                'additional_charge_name_tr' => 'Soğuk Paketleme Ücreti',
                'additional_charge_name_en' => 'Cold Packaging Fee',
                'type' => \App\Enums\StoreType::FRUIT_VEGETABLE->value,
                'image' => 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400',
            ],
            [
                'name_tr' => 'Dondurma & Tatlı',
                'name_en' => 'Ice Cream & Dessert',
                'description_tr' => 'Dondurma, tatlı, pasta ve şekerleme ürünleri.',
                'description_en' => 'Ice cream, sweets, cakes and confectionery.',
                'additional_charge_name_tr' => 'Soğuk Teslimat Ücreti',
                'additional_charge_name_en' => 'Cold Delivery Fee',
                'type' => \App\Enums\StoreType::ICE_CREAM->value,
                'image' => 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
            ],
            [
                'name_tr' => 'Hırdavat & Yapı Market',
                'name_en' => 'Hardware & DIY',
                'description_tr' => 'El aletleri, yapı malzemeleri ve kendin yap ürünleri.',
                'description_en' => 'Hand tools, building materials and DIY products.',
                'additional_charge_name_tr' => 'Ağır Ürün Ücreti',
                'additional_charge_name_en' => 'Heavy Item Fee',
                'type' => \App\Enums\StoreType::HARDWARE->value,
                'image' => 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
            ],
            [
                'name_tr' => 'Anne & Bebek',
                'name_en' => 'Baby & Kids',
                'description_tr' => 'Bebek bakım ürünleri, giyim, bezi ve anne-bebek aksesuarları.',
                'description_en' => 'Baby care products, clothing, diapers and mother-baby accessories.',
                'additional_charge_name_tr' => 'Hassas Paketleme Ücreti',
                'additional_charge_name_en' => 'Sensitive Packaging Fee',
                'type' => \App\Enums\StoreType::BABY_KIDS->value,
                'image' => 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400',
            ],
        ];

        $now = now();

        foreach ($storeTypes as $storeType) {
            $nameTr = $storeType['name_tr'];
            $nameEn = $storeType['name_en'];
            $descTr = $storeType['description_tr'];
            $descEn = $storeType['description_en'];
            $additionalChargeNameTr = $storeType['additional_charge_name_tr'];
            $additionalChargeNameEn = $storeType['additional_charge_name_en'];

            // Check if exists by type
            $existing = DB::table('store_types')->where('type', $storeType['type'])->first();

            if ($existing) {
                $storeTypeId = $existing->id;
                DB::table('store_types')->where('id', $storeTypeId)->update([
                    'name' => $nameTr,
                    'image' => $storeType['image'],
                    'description' => $descTr,
                    'total_stores' => 0,
                    'additional_charge_enable_disable' => 0,
                    'additional_charge_name' => $additionalChargeNameTr,
                    'additional_charge_amount' => 0,
                    'additional_charge_type' => 'fixed',
                    'additional_charge_commission' => 0,
                    'status' => 1,
                    'updated_at' => $now,
                ]);
            } else {
                $storeTypeId = DB::table('store_types')->insertGetId([
                    'name' => $nameTr,
                    'type' => $storeType['type'],
                    'image' => $storeType['image'],
                    'description' => $descTr,
                    'total_stores' => 0,
                    'additional_charge_enable_disable' => 0,
                    'additional_charge_name' => $additionalChargeNameTr,
                    'additional_charge_amount' => 0,
                    'additional_charge_type' => 'fixed',
                    'additional_charge_commission' => 0,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            // Add translations if translations table exists
            if (Schema::hasTable('translations')) {
                // Name translations
                $this->addTranslation($storeTypeId, 'App\\Models\\StoreType', 'df', 'name', $nameTr);
                $this->addTranslation($storeTypeId, 'App\\Models\\StoreType', 'tr', 'name', $nameTr);
                $this->addTranslation($storeTypeId, 'App\\Models\\StoreType', 'en', 'name', $nameEn);

                // Description translations
                $this->addTranslation($storeTypeId, 'App\\Models\\StoreType', 'df', 'description', $descTr);
                $this->addTranslation($storeTypeId, 'App\\Models\\StoreType', 'tr', 'description', $descTr);
                $this->addTranslation($storeTypeId, 'App\\Models\\StoreType', 'en', 'description', $descEn);

                // Additional charge name translations
                $this->addTranslation(
                    $storeTypeId,
                    'App\\Models\\StoreType',
                    'df',
                    'additional_charge_name',
                    $additionalChargeNameTr
                );
                $this->addTranslation(
                    $storeTypeId,
                    'App\\Models\\StoreType',
                    'tr',
                    'additional_charge_name',
                    $additionalChargeNameTr
                );
                $this->addTranslation(
                    $storeTypeId,
                    'App\\Models\\StoreType',
                    'en',
                    'additional_charge_name',
                    $additionalChargeNameEn
                );
            }
        }

        $this->command->info('StoreTypeSeeder: 27 store types seeded with TR/EN translations and images.');
    }

    private function addTranslation($id, $type, $lang, $key, $value): void
    {
        DB::table('translations')->updateOrInsert(
            [
                'translatable_id' => $id,
                'translatable_type' => $type,
                'language' => $lang,
                'key' => $key,
            ],
            [
                'value' => $value,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}
