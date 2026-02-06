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

        // Remove currencies that are not in our list
        $validCodes = array_column($currencies, 'code');
        $type = 'Modules\\PaymentGateways\\app\\Models\\Currency';
        $oldCurrencyIds = Currency::whereNotIn('code', $validCodes)->pluck('id');
        if ($oldCurrencyIds->isNotEmpty()) {
            DB::table('translations')
                ->where('translatable_type', $type)
                ->whereIn('translatable_id', $oldCurrencyIds)
                ->delete();
            Currency::whereIn('id', $oldCurrencyIds)->delete();
        }

        // Clean up orphaned translations (currencies that no longer exist)
        $existingCurrencyIds = Currency::pluck('id');
        DB::table('translations')
            ->where('translatable_type', $type)
            ->whereNotIn('translatable_id', $existingCurrencyIds)
            ->delete();

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

                // Remove non-df/en translations for this currency
                DB::table('translations')
                    ->where('translatable_type', $type)
                    ->where('translatable_id', $currencyModel->id)
                    ->whereNotIn('language', ['df', 'en'])
                    ->delete();

                // Turkish (df = default)
                $this->addTranslation($currencyModel->id, $type, 'df', 'name', $nameTr);
                // English
                $this->addTranslation($currencyModel->id, $type, 'en', 'name', $nameEn);
            }
        }

        // Set default currency settings
        if (Schema::hasTable('setting_options')) {
            $settings = [
                'com_site_global_currency' => 'TRY',
                'com_site_currency_symbol_position' => 'left',
                'com_site_enable_disable_decimal_point' => 'YES',
                'com_site_space_between_amount_and_symbol' => 'YES',
                'com_site_comma_form_adjustment_amount' => 'YES',
            ];

            foreach ($settings as $key => $value) {
                DB::table('setting_options')->updateOrInsert(
                    ['option_name' => $key],
                    [
                        'option_value' => $value,
                        'autoload' => '1',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        $this->command->info('CurrencySeeder: 3 currencies seeded (TRY default, USD, EUR) with TR(df)/EN translations and default settings.');
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
