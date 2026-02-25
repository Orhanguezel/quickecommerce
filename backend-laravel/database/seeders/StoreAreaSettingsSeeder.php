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
            'delivery_time_per_km'       => 2,
            'min_order_delivery_fee'     => 0,    // No forced minimum — let fixed_charge_amount take effect
            'out_of_area_delivery_charge' => 0,   // No extra charge for out-of-area (national shipping via cargo)
            'delivery_charge_method'     => 'fixed',
            'fixed_charge_amount'        => 49,   // 49 TL flat shipping fee
            'per_km_charge_amount'       => 5,    // Per-km rate (used only if method=per_km)
        ];

        $areas = StoreArea::query()->select('id')->get();

        foreach ($areas as $area) {
            StoreAreaSetting::updateOrCreate(
                ['store_area_id' => $area->id],
                $defaults
            );
        }

        $this->command->info('StoreAreaSettingsSeeder: area settings ensured for all store areas.');
    }
}
