<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            // ============ AĞIRLIK / WEIGHT ============
            ['tr' => 'Kilogram', 'en' => 'Kilogram', 'short' => 'kg'],
            ['tr' => 'Gram', 'en' => 'Gram', 'short' => 'g'],
            ['tr' => 'Miligram', 'en' => 'Milligram', 'short' => 'mg'],
            ['tr' => 'Ons', 'en' => 'Ounce', 'short' => 'oz'],
            ['tr' => 'Libre', 'en' => 'Pound', 'short' => 'lb'],
            ['tr' => 'Ton', 'en' => 'Ton', 'short' => 't'],

            // ============ HACİM / VOLUME ============
            ['tr' => 'Litre', 'en' => 'Liter', 'short' => 'L'],
            ['tr' => 'Mililitre', 'en' => 'Milliliter', 'short' => 'ml'],
            ['tr' => 'Desilitre', 'en' => 'Deciliter', 'short' => 'dl'],
            ['tr' => 'Galon', 'en' => 'Gallon', 'short' => 'gal'],

            // ============ UZUNLUK / LENGTH ============
            ['tr' => 'Metre', 'en' => 'Meter', 'short' => 'm'],
            ['tr' => 'Santimetre', 'en' => 'Centimeter', 'short' => 'cm'],
            ['tr' => 'Milimetre', 'en' => 'Millimeter', 'short' => 'mm'],
            ['tr' => 'Kilometre', 'en' => 'Kilometer', 'short' => 'km'],
            ['tr' => 'İnç', 'en' => 'Inch', 'short' => 'in'],
            ['tr' => 'Fit', 'en' => 'Foot', 'short' => 'ft'],

            // ============ ADET / QUANTITY ============
            ['tr' => 'Adet', 'en' => 'Piece', 'short' => 'pcs'],
            ['tr' => 'Paket', 'en' => 'Package', 'short' => 'pkg'],
            ['tr' => 'Kutu', 'en' => 'Box', 'short' => 'box'],
            ['tr' => 'Çift', 'en' => 'Pair', 'short' => 'pr'],
            ['tr' => 'Set', 'en' => 'Set', 'short' => 'set'],
            ['tr' => 'Düzine', 'en' => 'Dozen', 'short' => 'dz'],
            ['tr' => 'Koli', 'en' => 'Carton', 'short' => 'ctn'],
            ['tr' => 'Palet', 'en' => 'Pallet', 'short' => 'plt'],

            // ============ KAPSÜL / TABLET ============
            ['tr' => 'Tablet', 'en' => 'Tablet', 'short' => 'tab'],
            ['tr' => 'Kapsül', 'en' => 'Capsule', 'short' => 'cap'],
            ['tr' => 'Saşe', 'en' => 'Sachet', 'short' => 'sac'],
            ['tr' => 'Şişe', 'en' => 'Bottle', 'short' => 'btl'],
            ['tr' => 'Tüp', 'en' => 'Tube', 'short' => 'tube'],
            ['tr' => 'Kavanoz', 'en' => 'Jar', 'short' => 'jar'],

            // ============ SERVİS / SERVING ============
            ['tr' => 'Porsiyon', 'en' => 'Serving', 'short' => 'srv'],
            ['tr' => 'Ölçek', 'en' => 'Scoop', 'short' => 'scp'],
            ['tr' => 'Bardak', 'en' => 'Cup', 'short' => 'cup'],
            ['tr' => 'Kaşık', 'en' => 'Spoon', 'short' => 'spn'],

            // ============ AMBALAJ / PACKAGING ============
            ['tr' => 'Rulo', 'en' => 'Roll', 'short' => 'roll'],
            ['tr' => 'Torba', 'en' => 'Bag', 'short' => 'bag'],
            ['tr' => 'Poşet', 'en' => 'Pouch', 'short' => 'pch'],
            ['tr' => 'Bidon', 'en' => 'Can', 'short' => 'can'],
            ['tr' => 'Varil', 'en' => 'Barrel', 'short' => 'brl'],

            // ============ ALAN / AREA ============
            ['tr' => 'Metrekare', 'en' => 'Square Meter', 'short' => 'm²'],
            ['tr' => 'Santimetrekare', 'en' => 'Square Centimeter', 'short' => 'cm²'],
        ];

        DB::transaction(function () use ($units) {
            foreach ($units as $index => $unit) {
                $unitId = DB::table('units')->insertGetId([
                    'name' => $unit['tr'],
                    'order' => $index + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // TR translation (default)
                $this->addTranslation($unitId, 'df', $unit['tr']);
                $this->addTranslation($unitId, 'tr', $unit['tr']);
                $this->addTranslation($unitId, 'en', $unit['en']);
            }
        });

        echo "Units seeded successfully! Total: " . count($units) . "\n";
    }

    private function addTranslation(int $unitId, string $lang, string $value): void
    {
        DB::table('translations')->insert([
            'translatable_id' => $unitId,
            'translatable_type' => 'App\\Models\\Unit',
            'language' => $lang,
            'key' => 'name',
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
