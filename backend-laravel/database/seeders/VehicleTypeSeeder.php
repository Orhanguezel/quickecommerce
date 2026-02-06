<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VehicleTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('vehicle_types')) {
            $this->command->warn('VehicleTypeSeeder: vehicle_types table does not exist. Skipping...');
            return;
        }

        $vehicleTypes = [
            [
                'name_tr' => 'Bisiklet',
                'name_en' => 'Bicycle',
                'description_tr' => 'Çevre dostu, kısa mesafe teslimatlar için ideal.',
                'description_en' => 'Eco-friendly, ideal for short distance deliveries.',
                'capacity' => 10,
                'speed_range' => '15-25 km/h',
                'fuel_type' => 'electric',
                'max_distance' => 15,
                'extra_charge' => 2.00,
                'average_fuel_cost' => 0.50,
            ],
            [
                'name_tr' => 'Motosiklet',
                'name_en' => 'Motorcycle',
                'description_tr' => 'Hızlı ve çevik, trafikte kolay hareket.',
                'description_en' => 'Fast and agile, easy movement in traffic.',
                'capacity' => 30,
                'speed_range' => '40-80 km/h',
                'fuel_type' => 'petrol',
                'max_distance' => 50,
                'extra_charge' => 3.50,
                'average_fuel_cost' => 5.00,
            ],
            [
                'name_tr' => 'Elektrikli Scooter',
                'name_en' => 'Electric Scooter',
                'description_tr' => 'Sessiz ve ekonomik, şehir içi teslimatlar için mükemmel.',
                'description_en' => 'Quiet and economical, perfect for urban deliveries.',
                'capacity' => 15,
                'speed_range' => '20-35 km/h',
                'fuel_type' => 'electric',
                'max_distance' => 30,
                'extra_charge' => 2.50,
                'average_fuel_cost' => 1.00,
            ],
            [
                'name_tr' => 'Sedan Araba',
                'name_en' => 'Sedan Car',
                'description_tr' => 'Konforlu ve güvenli, orta büyüklükte paketler için uygun.',
                'description_en' => 'Comfortable and safe, suitable for medium-sized packages.',
                'capacity' => 100,
                'speed_range' => '50-100 km/h',
                'fuel_type' => 'petrol',
                'max_distance' => 100,
                'extra_charge' => 5.00,
                'average_fuel_cost' => 15.00,
            ],
            [
                'name_tr' => 'SUV',
                'name_en' => 'SUV',
                'description_tr' => 'Geniş bagaj hacmi, zorlu yol koşullarına dayanıklı.',
                'description_en' => 'Large trunk capacity, resistant to tough road conditions.',
                'capacity' => 200,
                'speed_range' => '50-100 km/h',
                'fuel_type' => 'diesel',
                'max_distance' => 150,
                'extra_charge' => 6.00,
                'average_fuel_cost' => 20.00,
            ],
            [
                'name_tr' => 'Minivan',
                'name_en' => 'Minivan',
                'description_tr' => 'Büyük hacimli teslimatlar için ideal aile tipi araç.',
                'description_en' => 'Family-type vehicle ideal for large volume deliveries.',
                'capacity' => 300,
                'speed_range' => '40-80 km/h',
                'fuel_type' => 'diesel',
                'max_distance' => 100,
                'extra_charge' => 7.00,
                'average_fuel_cost' => 18.00,
            ],
            [
                'name_tr' => 'Panelvan',
                'name_en' => 'Panel Van',
                'description_tr' => 'Ticari teslimatlar için kapalı kasa araç.',
                'description_en' => 'Closed body vehicle for commercial deliveries.',
                'capacity' => 500,
                'speed_range' => '40-80 km/h',
                'fuel_type' => 'diesel',
                'max_distance' => 150,
                'extra_charge' => 8.00,
                'average_fuel_cost' => 25.00,
            ],
            [
                'name_tr' => 'Kamyonet',
                'name_en' => 'Pickup Truck',
                'description_tr' => 'Ağır yükler için açık kasa taşıma aracı.',
                'description_en' => 'Open bed transport vehicle for heavy loads.',
                'capacity' => 800,
                'speed_range' => '40-70 km/h',
                'fuel_type' => 'diesel',
                'max_distance' => 200,
                'extra_charge' => 10.00,
                'average_fuel_cost' => 35.00,
            ],
            [
                'name_tr' => 'Kamyon',
                'name_en' => 'Truck',
                'description_tr' => 'Büyük ölçekli lojistik ve toplu teslimatlar için.',
                'description_en' => 'For large-scale logistics and bulk deliveries.',
                'capacity' => 2000,
                'speed_range' => '30-60 km/h',
                'fuel_type' => 'diesel',
                'max_distance' => 300,
                'extra_charge' => 15.00,
                'average_fuel_cost' => 60.00,
            ],
            [
                'name_tr' => 'Drone',
                'name_en' => 'Drone',
                'description_tr' => 'Gelecek nesil teslimat, küçük paketler için hava yolu.',
                'description_en' => 'Next generation delivery, airway for small packages.',
                'capacity' => 2,
                'speed_range' => '30-50 km/h',
                'fuel_type' => 'electric',
                'max_distance' => 10,
                'extra_charge' => 5.00,
                'average_fuel_cost' => 2.00,
            ],
        ];

        $now = now();

        foreach ($vehicleTypes as $vehicle) {
            $nameTr = $vehicle['name_tr'];
            $nameEn = $vehicle['name_en'];
            $descTr = $vehicle['description_tr'];
            $descEn = $vehicle['description_en'];

            // Check if exists by name
            $existing = DB::table('vehicle_types')->where('name', $nameTr)->first();

            if ($existing) {
                $vehicleId = $existing->id;
                DB::table('vehicle_types')->where('id', $vehicleId)->update([
                    'capacity' => $vehicle['capacity'],
                    'speed_range' => $vehicle['speed_range'],
                    'fuel_type' => $vehicle['fuel_type'],
                    'max_distance' => $vehicle['max_distance'],
                    'extra_charge' => $vehicle['extra_charge'],
                    'average_fuel_cost' => $vehicle['average_fuel_cost'],
                    'status' => 1,
                    'updated_at' => $now,
                ]);
            } else {
                $vehicleId = DB::table('vehicle_types')->insertGetId([
                    'name' => $nameTr,
                    'capacity' => $vehicle['capacity'],
                    'speed_range' => $vehicle['speed_range'],
                    'fuel_type' => $vehicle['fuel_type'],
                    'max_distance' => $vehicle['max_distance'],
                    'extra_charge' => $vehicle['extra_charge'],
                    'average_fuel_cost' => $vehicle['average_fuel_cost'],
                    'description' => $descTr,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            // Add translations if translations table exists
            if (Schema::hasTable('translations')) {
                // Name translations
                $this->addTranslation($vehicleId, 'App\\Models\\VehicleType', 'df', 'name', $nameTr);
                $this->addTranslation($vehicleId, 'App\\Models\\VehicleType', 'tr', 'name', $nameTr);
                $this->addTranslation($vehicleId, 'App\\Models\\VehicleType', 'en', 'name', $nameEn);

                // Description translations
                $this->addTranslation($vehicleId, 'App\\Models\\VehicleType', 'df', 'description', $descTr);
                $this->addTranslation($vehicleId, 'App\\Models\\VehicleType', 'tr', 'description', $descTr);
                $this->addTranslation($vehicleId, 'App\\Models\\VehicleType', 'en', 'description', $descEn);
            }
        }

        $this->command->info('VehicleTypeSeeder: 10 vehicle types seeded with TR/EN translations.');
    }

    private function addTranslation($id, $type, $lang, $key, $value): void
    {
        DB::table('translations')->updateOrInsert(
            [
                'translatable_id' => $id,
                'translatable_type' => $type,
                'language' => $lang,
                'key' => $key,
            ],
            [
                'value' => $value,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}
