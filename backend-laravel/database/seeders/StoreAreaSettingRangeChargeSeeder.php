<?php

namespace Database\Seeders;

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
        if (!Schema::hasTable('store_area_setting_range_charges')) {
            $this->command->warn('StoreAreaSettingRangeChargeSeeder: store_area_setting_range_charges table does not exist. Skipping...');
            return;
        }

        $rangeCharges = [
            [
                "store_area_setting_id" => 1,
                "min_km" => 0,
                "max_km" => 5,
                "charge_amount" => 5,
                "status" => 1
            ],
            [
                "store_area_setting_id" => 1,
                "min_km" => 5,
                "max_km" => 10,
                "charge_amount" => 10,
                "status" => 1
            ],
            [
                "store_area_setting_id" => 1,
                "min_km" => 10,
                "max_km" => 20,
                "charge_amount" => 20,
                "status" => 1
            ],
            [
                "store_area_setting_id" => 1,
                "min_km" => 20,
                "max_km" => 50,
                "charge_amount" => 30,
                "status" => 1
            ]
        ];

        foreach ($rangeCharges as $charge) {
            StoreAreaSettingRangeCharge::updateOrCreate(
                [
                    'store_area_setting_id' => $charge['store_area_setting_id'],
                    'min_km' => $charge['min_km'],
                    'max_km' => $charge['max_km'],
                ],
                [
                    'charge_amount' => $charge['charge_amount'],
                    'status' => $charge['status'],
                ]
            );
        }

        $this->command->info('StoreAreaSettingRangeChargeSeeder: 4 range charges seeded.');
    }
}
