<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StoreAreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Check if table exists
        if (!Schema::hasTable('store_areas')) {
            $this->command->warn('StoreAreaSeeder: store_areas table does not exist. Skipping...');
            return;
        }

        $areas = [
            // Istanbul - European Side
            [
                'code' => 'TR-IST-01',
                'state_tr' => 'İstanbul',
                'state_en' => 'Istanbul',
                'city_tr' => 'Beyoğlu',
                'city_en' => 'Beyoglu',
                'name_tr' => 'Taksim Merkez',
                'name_en' => 'Taksim Center',
                'coordinates' => "POLYGON((28.9760 41.0370, 28.9820 41.0390, 28.9880 41.0350, 28.9850 41.0310, 28.9780 41.0320, 28.9760 41.0370))",
            ],
            [
                'code' => 'TR-IST-02',
                'state_tr' => 'İstanbul',
                'state_en' => 'Istanbul',
                'city_tr' => 'Beşiktaş',
                'city_en' => 'Besiktas',
                'name_tr' => 'Beşiktaş Merkez',
                'name_en' => 'Besiktas Center',
                'coordinates' => "POLYGON((29.0020 41.0420, 29.0100 41.0450, 29.0150 41.0400, 29.0120 41.0360, 29.0050 41.0380, 29.0020 41.0420))",
            ],
            [
                'code' => 'TR-IST-03',
                'state_tr' => 'İstanbul',
                'state_en' => 'Istanbul',
                'city_tr' => 'Şişli',
                'city_en' => 'Sisli',
                'name_tr' => 'Şişli Merkez',
                'name_en' => 'Sisli Center',
                'coordinates' => "POLYGON((28.9870 41.0600, 28.9950 41.0630, 29.0020 41.0580, 28.9980 41.0540, 28.9900 41.0560, 28.9870 41.0600))",
            ],
            // Istanbul - Asian Side
            [
                'code' => 'TR-IST-04',
                'state_tr' => 'İstanbul',
                'state_en' => 'Istanbul',
                'city_tr' => 'Kadıköy',
                'city_en' => 'Kadikoy',
                'name_tr' => 'Kadıköy Merkez',
                'name_en' => 'Kadikoy Center',
                'coordinates' => "POLYGON((29.0220 40.9900, 29.0300 40.9930, 29.0360 40.9880, 29.0320 40.9840, 29.0250 40.9860, 29.0220 40.9900))",
            ],
            [
                'code' => 'TR-IST-05',
                'state_tr' => 'İstanbul',
                'state_en' => 'Istanbul',
                'city_tr' => 'Üsküdar',
                'city_en' => 'Uskudar',
                'name_tr' => 'Üsküdar Merkez',
                'name_en' => 'Uskudar Center',
                'coordinates' => "POLYGON((29.0150 41.0250, 29.0230 41.0280, 29.0290 41.0230, 29.0250 41.0190, 29.0180 41.0210, 29.0150 41.0250))",
            ],
            // Ankara
            [
                'code' => 'TR-ANK-01',
                'state_tr' => 'Ankara',
                'state_en' => 'Ankara',
                'city_tr' => 'Çankaya',
                'city_en' => 'Cankaya',
                'name_tr' => 'Kızılay Merkez',
                'name_en' => 'Kizilay Center',
                'coordinates' => "POLYGON((32.8540 39.9200, 32.8620 39.9230, 32.8680 39.9180, 32.8640 39.9140, 32.8570 39.9160, 32.8540 39.9200))",
            ],
            [
                'code' => 'TR-ANK-02',
                'state_tr' => 'Ankara',
                'state_en' => 'Ankara',
                'city_tr' => 'Keçiören',
                'city_en' => 'Kecioren',
                'name_tr' => 'Keçiören Merkez',
                'name_en' => 'Kecioren Center',
                'coordinates' => "POLYGON((32.8600 39.9800, 32.8680 39.9830, 32.8740 39.9780, 32.8700 39.9740, 32.8630 39.9760, 32.8600 39.9800))",
            ],
            // Izmir
            [
                'code' => 'TR-IZM-01',
                'state_tr' => 'İzmir',
                'state_en' => 'Izmir',
                'city_tr' => 'Konak',
                'city_en' => 'Konak',
                'name_tr' => 'Alsancak',
                'name_en' => 'Alsancak',
                'coordinates' => "POLYGON((27.1380 38.4350, 27.1460 38.4380, 27.1520 38.4330, 27.1480 38.4290, 27.1410 38.4310, 27.1380 38.4350))",
            ],
            [
                'code' => 'TR-IZM-02',
                'state_tr' => 'İzmir',
                'state_en' => 'Izmir',
                'city_tr' => 'Karşıyaka',
                'city_en' => 'Karsiyaka',
                'name_tr' => 'Karşıyaka Merkez',
                'name_en' => 'Karsiyaka Center',
                'coordinates' => "POLYGON((27.1100 38.4550, 27.1180 38.4580, 27.1240 38.4530, 27.1200 38.4490, 27.1130 38.4510, 27.1100 38.4550))",
            ],
            // Bursa
            [
                'code' => 'TR-BRS-01',
                'state_tr' => 'Bursa',
                'state_en' => 'Bursa',
                'city_tr' => 'Osmangazi',
                'city_en' => 'Osmangazi',
                'name_tr' => 'Bursa Merkez',
                'name_en' => 'Bursa Center',
                'coordinates' => "POLYGON((29.0540 40.1950, 29.0620 40.1980, 29.0680 40.1930, 29.0640 40.1890, 29.0570 40.1910, 29.0540 40.1950))",
            ],
            // Antalya
            [
                'code' => 'TR-ANT-01',
                'state_tr' => 'Antalya',
                'state_en' => 'Antalya',
                'city_tr' => 'Muratpaşa',
                'city_en' => 'Muratpasa',
                'name_tr' => 'Antalya Merkez',
                'name_en' => 'Antalya Center',
                'coordinates' => "POLYGON((30.6950 36.8850, 30.7030 36.8880, 30.7090 36.8830, 30.7050 36.8790, 30.6980 36.8810, 30.6950 36.8850))",
            ],
            // Adana
            [
                'code' => 'TR-ADA-01',
                'state_tr' => 'Adana',
                'state_en' => 'Adana',
                'city_tr' => 'Seyhan',
                'city_en' => 'Seyhan',
                'name_tr' => 'Adana Merkez',
                'name_en' => 'Adana Center',
                'coordinates' => "POLYGON((35.3200 36.9900, 35.3280 36.9930, 35.3340 36.9880, 35.3300 36.9840, 35.3230 36.9860, 35.3200 36.9900))",
            ],
            // Gaziantep
            [
                'code' => 'TR-GAZ-01',
                'state_tr' => 'Gaziantep',
                'state_en' => 'Gaziantep',
                'city_tr' => 'Şahinbey',
                'city_en' => 'Sahinbey',
                'name_tr' => 'Gaziantep Merkez',
                'name_en' => 'Gaziantep Center',
                'coordinates' => "POLYGON((37.3780 37.0660, 37.3860 37.0690, 37.3920 37.0640, 37.3880 37.0600, 37.3810 37.0620, 37.3780 37.0660))",
            ],
            // Konya
            [
                'code' => 'TR-KNY-01',
                'state_tr' => 'Konya',
                'state_en' => 'Konya',
                'city_tr' => 'Selçuklu',
                'city_en' => 'Selcuklu',
                'name_tr' => 'Konya Merkez',
                'name_en' => 'Konya Center',
                'coordinates' => "POLYGON((32.4800 37.8700, 32.4880 37.8730, 32.4940 37.8680, 32.4900 37.8640, 32.4830 37.8660, 32.4800 37.8700))",
            ],
            // Trabzon
            [
                'code' => 'TR-TRB-01',
                'state_tr' => 'Trabzon',
                'state_en' => 'Trabzon',
                'city_tr' => 'Ortahisar',
                'city_en' => 'Ortahisar',
                'name_tr' => 'Trabzon Merkez',
                'name_en' => 'Trabzon Center',
                'coordinates' => "POLYGON((39.7200 41.0050, 39.7280 41.0080, 39.7340 41.0030, 39.7300 40.9990, 39.7230 41.0010, 39.7200 41.0050))",
            ],
        ];

        $now = now();

        foreach ($areas as $area) {
            // Check if exists by code
            $existing = DB::table('store_areas')->where('code', $area['code'])->first();

            if ($existing) {
                $areaId = $existing->id;
                DB::table('store_areas')->where('id', $areaId)->update([
                    'state' => $area['state_tr'],
                    'city' => $area['city_tr'],
                    'name' => $area['name_tr'],
                    'coordinates' => DB::raw("ST_GeomFromText('{$area['coordinates']}')"),
                    'center_latitude' => DB::raw("ST_Y(ST_Centroid(ST_GeomFromText('{$area['coordinates']}')))"),
                    'center_longitude' => DB::raw("ST_X(ST_Centroid(ST_GeomFromText('{$area['coordinates']}')))"),
                    'status' => 1,
                    'updated_at' => $now,
                ]);
            } else {
                $areaId = DB::table('store_areas')->insertGetId([
                    'code' => $area['code'],
                    'state' => $area['state_tr'],
                    'city' => $area['city_tr'],
                    'name' => $area['name_tr'],
                    'coordinates' => DB::raw("ST_GeomFromText('{$area['coordinates']}')"),
                    'center_latitude' => DB::raw("ST_Y(ST_Centroid(ST_GeomFromText('{$area['coordinates']}')))"),
                    'center_longitude' => DB::raw("ST_X(ST_Centroid(ST_GeomFromText('{$area['coordinates']}')))"),
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            // Add translations if translations table exists
            if (Schema::hasTable('translations')) {
                // Name translations
                $this->addTranslation($areaId, 'App\\Models\\StoreArea', 'df', 'name', $area['name_tr']);
                $this->addTranslation($areaId, 'App\\Models\\StoreArea', 'tr', 'name', $area['name_tr']);
                $this->addTranslation($areaId, 'App\\Models\\StoreArea', 'en', 'name', $area['name_en']);

                // State translations
                $this->addTranslation($areaId, 'App\\Models\\StoreArea', 'df', 'state', $area['state_tr']);
                $this->addTranslation($areaId, 'App\\Models\\StoreArea', 'tr', 'state', $area['state_tr']);
                $this->addTranslation($areaId, 'App\\Models\\StoreArea', 'en', 'state', $area['state_en']);

                // City translations
                $this->addTranslation($areaId, 'App\\Models\\StoreArea', 'df', 'city', $area['city_tr']);
                $this->addTranslation($areaId, 'App\\Models\\StoreArea', 'tr', 'city', $area['city_tr']);
                $this->addTranslation($areaId, 'App\\Models\\StoreArea', 'en', 'city', $area['city_en']);
            }
        }

        $this->command->info('StoreAreaSeeder: 15 Turkish areas seeded with TR/EN translations.');
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
