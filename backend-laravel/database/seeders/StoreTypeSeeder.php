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

        $this->command->info('StoreTypeSeeder: 11 store types seeded with TR/EN translations and images.');
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
