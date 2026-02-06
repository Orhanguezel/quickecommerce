<?php

namespace Database\Seeders;

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
        if (!Schema::hasTable('store_area_settings')) {
            $this->command->warn('StoreAreaSettingsSeeder: store_area_settings table does not exist. Skipping...');
            return;
        }

        StoreAreaSetting::updateOrCreate(
            ['store_area_id' => 1],
            [
            "delivery_time_per_km" => 2,
            "min_order_delivery_fee" => 10,
            "out_of_area_delivery_charge" => 500,
            "delivery_charge_method" => 'fixed',
            "fixed_charge_amount" => 100,
            "per_km_charge_amount" => 10
        ]);

    }
}
