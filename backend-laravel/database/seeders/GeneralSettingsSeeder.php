<?php

namespace Database\Seeders;

use App\Models\Media;
use App\Models\SettingOption;
use App\Models\Translation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class GeneralSettingsSeeder extends Seeder
{
    /**
     * Seed general settings for Sportoonline — TR (root) + EN (translation).
     */
    public function run(): void
    {
        if (!Schema::hasTable('setting_options')) {
            $this->command->warn('GeneralSettingsSeeder: setting_options table does not exist. Skipping...');
            return;
        }

        // ── Root values (Turkish — default language) ──────────────────────
        $settings = [
            // Translatable
            'com_site_title'            => 'Sportoonline',
            'com_site_subtitle'         => 'Spor Giyim & Ekipman Mağazası',
            'com_site_contact_number'   => '+90 212 555 0 123',
            'com_site_full_address'     => 'Levent Mah. Büyükdere Cad. No:185, Şişli, İstanbul, Türkiye',
            'com_site_footer_copyright' => '© 2025 Sportoonline. Tüm hakları saklıdır.',

            // Global (non-translatable)
            'com_site_website_url'      => 'https://sportoonline.com',
            'com_site_email'            => 'info@sportoonline.com',
            'com_site_time_zone'        => 'Europe/Istanbul',

            // Toggles
            'com_user_email_verification' => '',
            'com_user_login_otp'          => '',
            'com_maintenance_mode'        => '',

            // Maintenance page
            'com_maintenance_title'       => 'Bakımdayız',
            'com_maintenance_description' => 'Sitemiz şu anda bakım çalışması nedeniyle geçici olarak hizmet dışıdır. En kısa sürede tekrar yayında olacağız.',
            'com_maintenance_start_date'  => '',
            'com_maintenance_end_date'    => '',
            'com_maintenance_image'       => '',
        ];

        foreach ($settings as $key => $value) {
            SettingOption::updateOrCreate(
                ['option_name' => $key],
                ['option_value' => $value],
            );
        }

        $this->command->info('GeneralSettingsSeeder: Root settings (TR) seeded.');

        // ── Logo & Favicon (Media records + setting_options) ────────────
        if (Schema::hasTable('media')) {
            $mediaFiles = [
                'favicon' => [
                    'path'     => 'favicon-512x5121770358150.png',
                    'name'     => 'favicon-512x512',
                    'format'   => 'png',
                    'alt_text' => 'Sportoonline Favicon',
                ],
                'logo' => [
                    'path'     => 'logo-dark1770358220.png',
                    'name'     => 'logo-dark',
                    'format'   => 'png',
                    'alt_text' => 'Sportoonline Logo',
                ],
                'logo_light' => [
                    'path'     => 'logo_light.png',
                    'name'     => 'logo-light',
                    'format'   => 'png',
                    'alt_text' => 'Sportoonline Logo Light',
                ],
            ];

            $mediaIds = [];
            foreach ($mediaFiles as $key => $attrs) {
                $media = Media::updateOrCreate(
                    ['path' => $attrs['path']],
                    collect($attrs)->except('path')->toArray(),
                );
                $mediaIds[$key] = (string) $media->id;
            }

            $logoSettings = [
                'com_site_logo'       => $mediaIds['logo'],
                'com_site_white_logo' => $mediaIds['logo_light'],
                'com_site_favicon'    => $mediaIds['favicon'],
            ];

            foreach ($logoSettings as $key => $value) {
                SettingOption::updateOrCreate(
                    ['option_name' => $key],
                    ['option_value' => $value],
                );
            }

            $this->command->info('GeneralSettingsSeeder: Logo & favicon media records seeded.');
        }

        // ── English translations ──────────────────────────────────────────
        if (!Schema::hasTable('translations')) {
            $this->command->warn('GeneralSettingsSeeder: translations table does not exist. Skipping translations...');
            return;
        }

        // EN values for all translatable keys
        $enValues = [
            'com_site_title'              => 'Sportoonline',
            'com_site_subtitle'           => 'Sports Apparel & Equipment Store',
            'com_site_contact_number'     => '+90 212 555 0 123',
            'com_site_full_address'       => 'Levent Mah. Buyukdere Cad. No:185, Sisli, Istanbul, Turkey',
            'com_site_footer_copyright'   => '© 2025 Sportoonline. All rights reserved.',
            'com_maintenance_title'       => 'Under Maintenance',
            'com_maintenance_description' => 'Our site is temporarily unavailable due to scheduled maintenance. We will be back online shortly.',
        ];

        // The GET endpoint loads translations from rows:
        //   option_name IN ('com_site_title', 'com_site_subtitle')
        // and reads ALL translationKeys from each row.
        // So we must seed ALL keys on EACH of those rows.
        $anchorOptions = SettingOption::whereIn('option_name', [
            'com_site_title',
            'com_site_subtitle',
            'com_site_full_address',
            'com_site_contact_number',
            'com_site_footer_copyright',
            'com_maintenance_title',
            'com_maintenance_description',
        ])->get();

        foreach ($anchorOptions as $option) {
            foreach ($enValues as $key => $enValue) {
                Translation::updateOrCreate(
                    [
                        'translatable_type' => 'App\\Models\\SettingOption',
                        'translatable_id'   => $option->id,
                        'language'          => 'en',
                        'key'               => $key,
                    ],
                    [
                        'value' => $enValue,
                    ],
                );
            }
        }

        $this->command->info('GeneralSettingsSeeder: EN translations seeded.');
    }
}
