<?php

namespace Database\Seeders;

use App\Models\StoreArea;
use App\Models\StoreAreaSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class StoreAreaSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('store_areas') || !Schema::hasTable('store_area_settings')) {
            $this->command->warn('StoreAreaSettingsSeeder: store_area_settings table does not exist. Skipping...');
            return;
        }

        $defaults = [
            'delivery_time_per_km' => 2,
            'min_order_delivery_fee' => 10,
            'out_of_area_delivery_charge' => 500,
            'delivery_charge_method' => 'fixed',
            'fixed_charge_amount' => 100,
            'per_km_charge_amount' => 10,
        ];

        $areas = StoreArea::query()->select('id')->get();

        foreach ($areas as $area) {
            $setting = StoreAreaSetting::firstOrCreate(
                ['store_area_id' => $area->id],
                $defaults
            );

            $updates = [];
            foreach ($defaults as $key => $value) {
                if ($setting->{$key} === null || $setting->{$key} === '') {
                    $updates[$key] = $value;
                }
            }

            if (!empty($updates)) {
                $setting->fill($updates)->save();
            }
        }

        $this->command->info('StoreAreaSettingsSeeder: area settings ensured for all store areas.');
    }
}
