<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Modules\PaymentGateways\app\Models\Currency;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('currencies')) {
            $this->command->warn('CurrencySeeder: currencies table does not exist. Skipping...');
            return;
        }

        $currencies = [
            [
                "name_tr" => "Türk Lirası",
                "name_en" => "Turkish Lira",
                "code" => "TRY",
                "symbol" => "₺",
                "exchange_rate" => 1.00,
                "is_default" => true,
                "status" => true,
            ],
            [
                "name_tr" => "Amerikan Doları",
                "name_en" => "US Dollar",
                "code" => "USD",
                "symbol" => "$",
                "exchange_rate" => 0.031,
                "is_default" => false,
                "status" => true,
            ],
            [
                "name_tr" => "Euro",
                "name_en" => "Euro",
                "code" => "EUR",
                "symbol" => "€",
                "exchange_rate" => 0.029,
                "is_default" => false,
                "status" => true,
            ],
        ];

        foreach ($currencies as $currency) {
            $nameTr = $currency['name_tr'];
            $nameEn = $currency['name_en'];
            unset($currency['name_tr'], $currency['name_en']);

            $currencyModel = Currency::updateOrCreate(
                ['code' => $currency['code']],
                array_merge($currency, ['name' => $nameTr])
            );

            // Add translations (df = Turkish default, en = English)
            if (Schema::hasTable('translations')) {
                $type = 'Modules\\PaymentGateways\\app\\Models\\Currency';
                // Turkish (df = default)
                $this->addTranslation($currencyModel->id, $type, 'df', 'name', $nameTr);
                // English
                $this->addTranslation($currencyModel->id, $type, 'en', 'name', $nameEn);
            }
        }

        $this->command->info('CurrencySeeder: 3 currencies seeded (TRY default, USD, EUR) with TR(df)/EN translations.');
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
