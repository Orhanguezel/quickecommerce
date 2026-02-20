<?php

namespace Database\Seeders;

use App\Models\StoreAreaSetting;
use App\Models\StoreAreaSettingStoreType;
use App\Models\StoreType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class StoreAreaSettingStoreTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (
            !Schema::hasTable('store_area_settings') ||
            !Schema::hasTable('store_types') ||
            !Schema::hasTable('store_area_setting_store_types')
        ) {
            $this->command->warn('StoreAreaSettingStoreTypeSeeder: store_area_setting_store_types table does not exist. Skipping...');
            return;
        }

        $defaultStoreTypeIds = StoreType::query()->orderBy('id')->pluck('id')->take(4)->all();
        if (empty($defaultStoreTypeIds)) {
            $this->command->warn('StoreAreaSettingStoreTypeSeeder: no store types found. Skipping...');
            return;
        }

        $settings = StoreAreaSetting::query()->select('id')->get();
        foreach ($settings as $setting) {
            $existingCount = StoreAreaSettingStoreType::query()
                ->where('store_area_setting_id', $setting->id)
                ->count();

            if ($existingCount > 0) {
                continue;
            }

            foreach ($defaultStoreTypeIds as $storeTypeId) {
                StoreAreaSettingStoreType::updateOrCreate(
                    ['store_area_setting_id' => $setting->id, 'store_type_id' => $storeTypeId],
                    ['status' => 1]
                );
            }
        }

        $this->command->info('StoreAreaSettingStoreTypeSeeder: default store types ensured for area settings.');
    }
}
