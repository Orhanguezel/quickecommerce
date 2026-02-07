<?php

namespace Database\Seeders;

use App\Models\SettingOption;
use App\Models\Translation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class SeoSettingsSeeder extends Seeder
{
    /**
     * Seed SEO settings for Sportoonline — TR (root) + EN (translation).
     */
    public function run(): void
    {
        if (!Schema::hasTable('setting_options')) {
            $this->command->warn('SeoSettingsSeeder: setting_options table does not exist. Skipping...');
            return;
        }

        // ── Root values (Turkish — default language) ──────────────────────
        $settings = [
            'com_meta_title'       => 'Sportoonline | Spor Giyim & Ekipman Online Mağaza',
            'com_meta_description' => 'Sportoonline\'da en kaliteli spor giyim, ayakkabı ve ekipmanları keşfedin. Nike, Adidas, Puma ve daha birçok marka. Hızlı kargo, kolay iade.',
            'com_meta_tags'        => 'spor giyim,spor ayakkabı,spor ekipmanları,online spor mağazası,Nike,Adidas,Puma,futbol,basketbol,koşu,fitness',
            'com_canonical_url'    => 'https://sportoonline.com',
            'com_og_title'         => 'Sportoonline — Spor Giyim & Ekipman',
            'com_og_description'   => 'Türkiye\'nin en geniş spor ürünleri mağazasında binlerce ürün arasından seçiminizi yapın. Ücretsiz kargo fırsatları!',
            'com_og_image'         => '',
        ];

        foreach ($settings as $key => $value) {
            SettingOption::updateOrCreate(
                ['option_name' => $key],
                ['option_value' => $value],
            );
        }

        $this->command->info('SeoSettingsSeeder: Root settings (TR) seeded.');

        // ── Translations ─────────────────────────────────────────────────
        if (!Schema::hasTable('translations')) {
            $this->command->warn('SeoSettingsSeeder: translations table does not exist. Skipping translations...');
            return;
        }

        $anchorOptions = SettingOption::whereIn('option_name', [
            'com_meta_title',
            'com_meta_description',
            'com_meta_tags',
            'com_og_title',
            'com_og_description',
        ])->get();

        // ── Clean up ALL old translations for these anchor rows ──────────
        Translation::where('translatable_type', 'App\\Models\\SettingOption')
            ->whereIn('translatable_id', $anchorOptions->pluck('id'))
            ->delete();

        $this->command->info('SeoSettingsSeeder: Old translations cleaned.');

        // TR (df) values — same as root
        $trValues = [
            'com_meta_title'       => 'Sportoonline | Spor Giyim & Ekipman Online Mağaza',
            'com_meta_description' => 'Sportoonline\'da en kaliteli spor giyim, ayakkabı ve ekipmanları keşfedin. Nike, Adidas, Puma ve daha birçok marka. Hızlı kargo, kolay iade.',
            'com_meta_tags'        => 'spor giyim,spor ayakkabı,spor ekipmanları,online spor mağazası,Nike,Adidas,Puma,futbol,basketbol,koşu,fitness',
            'com_og_title'         => 'Sportoonline — Spor Giyim & Ekipman',
            'com_og_description'   => 'Türkiye\'nin en geniş spor ürünleri mağazasında binlerce ürün arasından seçiminizi yapın. Ücretsiz kargo fırsatları!',
        ];

        // EN values
        $enValues = [
            'com_meta_title'       => 'Sportoonline | Sports Apparel & Equipment Online Store',
            'com_meta_description' => 'Discover top-quality sports apparel, footwear, and equipment at Sportoonline. Nike, Adidas, Puma and more. Fast shipping, easy returns.',
            'com_meta_tags'        => 'sports apparel,sports shoes,sports equipment,online sports store,Nike,Adidas,Puma,football,basketball,running,fitness',
            'com_og_title'         => 'Sportoonline — Sports Apparel & Equipment',
            'com_og_description'   => 'Shop thousands of sports products at Turkey\'s largest sports store. Free shipping offers!',
        ];

        // Seed ALL keys on EACH anchor row for both languages (df + en)
        $langMap = [
            'df' => $trValues,
            'en' => $enValues,
        ];

        foreach ($anchorOptions as $option) {
            foreach ($langMap as $lang => $values) {
                foreach ($values as $key => $val) {
                    Translation::create([
                        'translatable_type' => 'App\\Models\\SettingOption',
                        'translatable_id'   => $option->id,
                        'language'           => $lang,
                        'key'                => $key,
                        'value'              => $val,
                    ]);
                }
            }
        }

        $this->command->info('SeoSettingsSeeder: DF + EN translations seeded.');
    }
}
