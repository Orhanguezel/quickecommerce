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
            ['name' => 'Grocery', 'type' => \App\Enums\StoreType::GROCERY->value],
            ['name' => 'Bakery', 'type' => \App\Enums\StoreType::BAKERY->value],
            ['name' => 'Medicine', 'type' => \App\Enums\StoreType::MEDICINE->value],
            ['name' => 'Makeup', 'type' => \App\Enums\StoreType::MAKEUP->value],
            ['name' => 'Bags', 'type' => \App\Enums\StoreType::BAGS->value],
            ['name' => 'Clothing', 'type' => \App\Enums\StoreType::CLOTHING->value],
            ['name' => 'Furniture', 'type' => \App\Enums\StoreType::FURNITURE->value],
            ['name' => 'Books', 'type' => \App\Enums\StoreType::BOOKS->value],
            ['name' => 'Gadgets', 'type' => \App\Enums\StoreType::GADGET->value],
            ['name' => 'Animals & Pets', 'type' => \App\Enums\StoreType::ANIMALS_PET->value],
            ['name' => 'Fish', 'type' => \App\Enums\StoreType::FISH->value],
        ];

        foreach ($storeTypes as $storeType) {
            StoreType::updateOrInsert(
                ['type' => $storeType['type']],
                [
                    'name' => $storeType['name'],
                    'status' => 1
                ]
            );
        }
    }
}
