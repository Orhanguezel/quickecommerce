<?php

namespace Database\Seeders;

use App\Models\StoreAreaSetting;
use App\Models\StoreAreaSettingRangeCharge;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class StoreAreaSettingRangeChargeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (
            !Schema::hasTable('store_area_settings') ||
            !Schema::hasTable('store_area_setting_range_charges')
        ) {
            $this->command->warn('StoreAreaSettingRangeChargeSeeder: store_area_setting_range_charges table does not exist. Skipping...');
            return;
        }

        $defaultRangeTemplate = [
            ['min_km' => 0, 'max_km' => 5, 'charge_amount' => 5, 'status' => 1],
            ['min_km' => 5, 'max_km' => 10, 'charge_amount' => 10, 'status' => 1],
            ['min_km' => 10, 'max_km' => 20, 'charge_amount' => 20, 'status' => 1],
            ['min_km' => 20, 'max_km' => 50, 'charge_amount' => 30, 'status' => 1],
        ];

        $settings = StoreAreaSetting::query()
            ->select(['id', 'delivery_charge_method'])
            ->get();

        foreach ($settings as $setting) {
            $method = (string) $setting->delivery_charge_method;
            $isRangeMethod = in_array($method, ['range-wise', 'range_wise'], true);
            if (!$isRangeMethod) {
                continue;
            }

            $hasRanges = StoreAreaSettingRangeCharge::query()
                ->where('store_area_setting_id', $setting->id)
                ->exists();

            if ($hasRanges) {
                continue;
            }

            foreach ($defaultRangeTemplate as $range) {
                StoreAreaSettingRangeCharge::create([
                    'store_area_setting_id' => $setting->id,
                    'min_km' => $range['min_km'],
                    'max_km' => $range['max_km'],
                    'charge_amount' => $range['charge_amount'],
                    'status' => $range['status'],
                ]);
            }
        }

        $this->command->info('StoreAreaSettingRangeChargeSeeder: range charges ensured for range-wise settings.');
    }
}
