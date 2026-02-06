<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        if (!Schema::hasTable('departments')) {
            $this->command->warn('DepartmentSeeder: departments table does not exist. Skipping...');
            return;
        }

        // Clear existing data
        DB::table('departments')->delete();

        $departments = [
            ['tr' => 'Satış', 'en' => 'Sales'],
            ['tr' => 'Pazarlama', 'en' => 'Marketing'],
            ['tr' => 'Müşteri Hizmetleri', 'en' => 'Customer Service'],
            ['tr' => 'Teknik Destek', 'en' => 'Technical Support'],
            ['tr' => 'İnsan Kaynakları', 'en' => 'Human Resources'],
            ['tr' => 'Finans', 'en' => 'Finance'],
            ['tr' => 'Lojistik', 'en' => 'Logistics'],
            ['tr' => 'Bilgi Teknolojileri', 'en' => 'Information Technology'],
            ['tr' => 'Ürün Yönetimi', 'en' => 'Product Management'],
            ['tr' => 'Kalite Kontrol', 'en' => 'Quality Control'],
        ];

        $now = now();

        foreach ($departments as $dept) {
            $deptId = DB::table('departments')->insertGetId([
                'name' => $dept['tr'],
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Add translations if translations table exists
            if (Schema::hasTable('translations')) {
                $this->addTranslation($deptId, 'App\\Models\\Department', 'df', 'name', $dept['tr']);
                $this->addTranslation($deptId, 'App\\Models\\Department', 'tr', 'name', $dept['tr']);
                $this->addTranslation($deptId, 'App\\Models\\Department', 'en', 'name', $dept['en']);
            }
        }

        $this->command->info('DepartmentSeeder: 10 departments seeded with TR/EN translations.');
    }

    private function addTranslation($id, $type, $lang, $key, $value): void
    {
        DB::table('translations')->insert([
            'translatable_id' => $id,
            'translatable_type' => $type,
            'language' => $lang,
            'key' => $key,
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
