<?php

namespace Database\Seeders;

use App\Models\StoreAreaSettingStoreType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class StoreAreaSettingStoreTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('store_area_setting_store_types')) {
            $this->command->warn('StoreAreaSettingStoreTypeSeeder: store_area_setting_store_types table does not exist. Skipping...');
            return;
        }

        $types = [
            ['store_area_setting_id' => 1, 'store_type_id' => 1, 'status' => 1],
            ['store_area_setting_id' => 1, 'store_type_id' => 2, 'status' => 1],
            ['store_area_setting_id' => 1, 'store_type_id' => 3, 'status' => 1],
        ];

        foreach ($types as $type) {
            StoreAreaSettingStoreType::updateOrCreate(
                ['store_area_setting_id' => $type['store_area_setting_id'], 'store_type_id' => $type['store_type_id']],
                ['status' => $type['status']]
            );
        }
    }
}
