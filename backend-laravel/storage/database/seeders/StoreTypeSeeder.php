<?php

namespace Database\Seeders;

use App\Models\StoreType;
use Illuminate\Database\Seeder;

class StoreTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $storeTypes = [
            ['name' => 'Grocery', 'type' => \App\Enums\StoreType::BAKKAL->value],
            ['name' => 'Bakery', 'type' => \App\Enums\StoreType::FIRIN->value],
            ['name' => 'Medicine', 'type' => \App\Enums\StoreType::ECZANE->value],
            ['name' => 'Makeup', 'type' => \App\Enums\StoreType::MAKYAJ->value],
            ['name' => 'Bags', 'type' => \App\Enums\StoreType::CANTA->value],
            ['name' => 'Clothing', 'type' => \App\Enums\StoreType::GIYIM->value],
            ['name' => 'Furniture', 'type' => \App\Enums\StoreType::ESYA->value],
            ['name' => 'Books', 'type' => \App\Enums\StoreType::KITAP->value],
            ['name' => 'Gadgets', 'type' => \App\Enums\StoreType::CIHAZ->value],
            ['name' => 'Animals & Pets', 'type' => \App\Enums\StoreType::HAYVANLAR->value],
            ['name' => 'Fish', 'type' => \App\Enums\StoreType::BALIK->value],
        ];

        foreach ($storeTypes as $storeType) {
            StoreType::updateOrInsert(
                ['type' => $storeType['type']], // Unique column to check
                [
                    'name' => $storeType['name'],
                    'status' => 1
                ]
            );
        }

    }
}
