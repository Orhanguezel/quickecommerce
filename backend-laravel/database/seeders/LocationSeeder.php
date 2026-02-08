<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if required tables exist
        if (!Schema::hasTable('countries')) {
            $this->command->warn('LocationSeeder: countries table does not exist. Skipping...');
            return;
        }
        if (!Schema::hasTable('states')) {
            $this->command->warn('LocationSeeder: states table does not exist. Skipping...');
            return;
        }
        if (!Schema::hasTable('cities')) {
            $this->command->warn('LocationSeeder: cities table does not exist. Skipping...');
            return;
        }
        if (!Schema::hasTable('areas')) {
            $this->command->warn('LocationSeeder: areas table does not exist. Skipping...');
            return;
        }

        // Static data - no Faker dependency needed
        $countryData = [
            ['name' => 'United States', 'code' => 'US', 'dial_code' => '+1', 'timezone' => 'America/New_York', 'region' => 'Americas', 'languages' => 'English'],
            ['name' => 'Turkey', 'code' => 'TR', 'dial_code' => '+90', 'timezone' => 'Europe/Istanbul', 'region' => 'Europe', 'languages' => 'Turkish'],
            ['name' => 'United Kingdom', 'code' => 'GB', 'dial_code' => '+44', 'timezone' => 'Europe/London', 'region' => 'Europe', 'languages' => 'English'],
            ['name' => 'Germany', 'code' => 'DE', 'dial_code' => '+49', 'timezone' => 'Europe/Berlin', 'region' => 'Europe', 'languages' => 'German'],
            ['name' => 'France', 'code' => 'FR', 'dial_code' => '+33', 'timezone' => 'Europe/Paris', 'region' => 'Europe', 'languages' => 'French'],
            ['name' => 'Italy', 'code' => 'IT', 'dial_code' => '+39', 'timezone' => 'Europe/Rome', 'region' => 'Europe', 'languages' => 'Italian'],
            ['name' => 'Spain', 'code' => 'ES', 'dial_code' => '+34', 'timezone' => 'Europe/Madrid', 'region' => 'Europe', 'languages' => 'Spanish'],
            ['name' => 'Canada', 'code' => 'CA', 'dial_code' => '+1', 'timezone' => 'America/Toronto', 'region' => 'Americas', 'languages' => 'English, French'],
            ['name' => 'Australia', 'code' => 'AU', 'dial_code' => '+61', 'timezone' => 'Australia/Sydney', 'region' => 'Oceania', 'languages' => 'English'],
            ['name' => 'Japan', 'code' => 'JP', 'dial_code' => '+81', 'timezone' => 'Asia/Tokyo', 'region' => 'Asia', 'languages' => 'Japanese'],
        ];

        $statesByCountry = [
            'United States' => ['California', 'Texas', 'New York', 'Florida', 'Illinois'],
            'Turkey' => ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa'],
            'United Kingdom' => ['England', 'Scotland', 'Wales', 'Northern Ireland'],
            'Germany' => ['Bavaria', 'Berlin', 'Hamburg', 'Saxony', 'Hesse'],
            'France' => ['Île-de-France', 'Provence', 'Brittany', 'Normandy', 'Occitanie'],
        ];

        $cities = [
            'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
            'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa',
            'London', 'Manchester', 'Birmingham', 'Glasgow', 'Edinburgh',
            'Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne',
            'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'
        ];

        $areas = [
            'Downtown', 'Uptown', 'Midtown', 'Old Town', 'City Center',
            'East Side', 'West Side', 'North End', 'South District', 'Waterfront'
        ];

        $timezones = [
            'America/New_York', 'Europe/Istanbul', 'Europe/London',
            'Europe/Berlin', 'Europe/Paris', 'Asia/Tokyo'
        ];

        // Seed Countries
        $countries = [];
        foreach ($countryData as $i => $country) {
            $countries[] = array_merge($country, [
                'latitude' => round(-90 + ($i * 18), 6),
                'longitude' => round(-180 + ($i * 36), 6),
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        DB::table('countries')->insert($countries);

        // Fetch inserted country IDs
        $countryIds = DB::table('countries')->pluck('id', 'name')->toArray();

        // Seed States
        $statesData = [];
        foreach ($statesByCountry as $countryName => $stateNames) {
            if (isset($countryIds[$countryName])) {
                foreach ($stateNames as $stateName) {
                    $statesData[] = [
                        'name' => $stateName,
                        'country_id' => $countryIds[$countryName],
                        'timezone' => $timezones[array_rand($timezones)],
                        'status' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }
        DB::table('states')->insert($statesData);

        // Fetch inserted state IDs
        $stateIds = DB::table('states')->pluck('id')->toArray();

        // Seed Cities
        $citiesData = [];
        foreach ($cities as $cityName) {
            $citiesData[] = [
                'name' => $cityName,
                'state_id' => $stateIds[array_rand($stateIds)],
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('cities')->insert($citiesData);

        // Fetch inserted city IDs
        $cityIds = DB::table('cities')->pluck('id')->toArray();

        // Seed Areas
        $areasData = [];
        foreach ($areas as $areaName) {
            $areasData[] = [
                'name' => $areaName,
                'city_id' => $cityIds[array_rand($cityIds)],
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('areas')->insert($areasData);

        $this->command->info('Country, State, City, and Area tables seeded successfully!');
    }
}
