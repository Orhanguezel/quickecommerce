<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * CargoSettingsSeeder
 *
 * ✅ SAFE: updateOrCreate ile çalışır — idempotent.
 *
 * Geliver gönderici adresi ve kargo temel ayarları.
 * API token admin panelden girilmeli (hassas veri — seeder'a eklenmez).
 */
class CargoSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Geliver — Sportoonline Gönderici Adresi
            // Aksoy Mahallesi, 1671 Sokak No:151C — Karşıyaka / İzmir
            'geliver_sender_address_id' => '15ad56d4-3a18-4869-8a3d-4de10e3193bb',

            // Test modu varsayılan olarak kapalı (canlı mod)
            'geliver_test_mode' => '',
        ];

        foreach ($settings as $key => $value) {
            \App\Models\SettingOption::updateOrCreate(
                ['option_name' => $key],
                ['option_value' => $value]
            );
        }
    }
}
