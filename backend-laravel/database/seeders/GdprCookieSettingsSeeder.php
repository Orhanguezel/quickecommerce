<?php

namespace Database\Seeders;

use App\Models\SettingOption;
use App\Models\Translation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class GdprCookieSettingsSeeder extends Seeder
{
    /**
     * Seed GDPR Cookie Settings for Sportoonline — TR (root) + EN (translation).
     */
    public function run(): void
    {
        if (!Schema::hasTable('setting_options')) {
            $this->command->warn('GdprCookieSettingsSeeder: setting_options table does not exist. Skipping...');
            return;
        }

        // ── Turkish content (root / default) ─────────────────────────────
        $trContent = [
            'gdpr_basic_section' => [
                'com_gdpr_title'          => 'KVKK & Çerez Ayarları',
                'com_gdpr_message'        => 'Sportoonline olarak deneyiminizi kişiselleştirmek ve site trafiğimizi analiz etmek için çerezler kullanıyoruz. Çerezleri kabul edebilir veya reddedebilirsiniz.',
                'com_gdpr_more_info_label' => 'Daha Fazla Bilgi',
                'com_gdpr_more_info_link' => 'https://sportoonline.com/kvkk-aydinlatma-metni',
                'com_gdpr_accept_label'   => 'Kabul Et',
                'com_gdpr_decline_label'  => 'Reddet',
                'com_gdpr_manage_label'   => 'Yönet',
                'com_gdpr_manage_title'   => 'Çerez Tercihlerini Yönet',
                'com_gdpr_expire_date'    => '2027-01-01',
                'com_gdpr_show_delay'     => '500',
                'com_gdpr_enable_disable' => 'on',
                'com_gdpr_can_reject_all' => 'on',
            ],
            'gdpr_more_info_section' => [
                'section_title'   => 'Veri Koruma ve Gizlilik',
                'section_details' => 'Sportoonline, kişisel verilerinizin korunmasını ciddiye alır. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuat kapsamında verileriniz güvenle işlenmektedir. Aşağıda sitemizde kullanılan çerez türlerini ve amaçlarını inceleyebilirsiniz.',
                'steps' => [
                    [
                        'title'        => 'Zorunlu Çerezler',
                        'descriptions' => 'Web sitesinin temel işlevlerinin çalışması için gereklidir. Sepet, oturum yönetimi ve güvenlik gibi temel özellikleri sağlar. Bu çerezler devre dışı bırakılamaz.',
                        'req_status'   => 'required',
                    ],
                    [
                        'title'        => 'Analitik Çerezler',
                        'descriptions' => 'Ziyaretçilerin siteyi nasıl kullandığını anlamamıza yardımcı olur. Sayfa görüntülemeleri, trafik kaynakları ve kullanıcı davranışları hakkında anonim veri toplar.',
                        'req_status'   => 'optional',
                    ],
                    [
                        'title'        => 'Pazarlama Çerezleri',
                        'descriptions' => 'İlgi alanlarınıza göre size özel reklamlar göstermek için kullanılır. Spor giyim ve ekipman tercihlerinize uygun kampanya bildirimlerini sunar.',
                        'req_status'   => 'optional',
                    ],
                ],
            ],
        ];

        // ── English content ──────────────────────────────────────────────
        $enContent = [
            'gdpr_basic_section' => [
                'com_gdpr_title'          => 'GDPR & Cookie Settings',
                'com_gdpr_message'        => 'At Sportoonline, we use cookies to personalize your experience and analyze our site traffic. You can choose to accept or decline cookies.',
                'com_gdpr_more_info_label' => 'More Information',
                'com_gdpr_more_info_link' => 'https://sportoonline.com/privacy-policy',
                'com_gdpr_accept_label'   => 'Accept',
                'com_gdpr_decline_label'  => 'Decline',
                'com_gdpr_manage_label'   => 'Manage',
                'com_gdpr_manage_title'   => 'Manage Cookie Preferences',
                'com_gdpr_expire_date'    => '2027-01-01',
                'com_gdpr_show_delay'     => '500',
                'com_gdpr_enable_disable' => 'on',
                'com_gdpr_can_reject_all' => 'on',
            ],
            'gdpr_more_info_section' => [
                'section_title'   => 'Data Protection & Privacy',
                'section_details' => 'Sportoonline takes the protection of your personal data seriously. Your data is processed securely in accordance with GDPR and applicable regulations. Below you can review the types and purposes of cookies used on our site.',
                'steps' => [
                    [
                        'title'        => 'Essential Cookies',
                        'descriptions' => 'Required for the basic functions of the website. Provides essential features such as cart, session management, and security. These cookies cannot be disabled.',
                        'req_status'   => 'required',
                    ],
                    [
                        'title'        => 'Analytics Cookies',
                        'descriptions' => 'Helps us understand how visitors use the site. Collects anonymous data about page views, traffic sources, and user behavior.',
                        'req_status'   => 'optional',
                    ],
                    [
                        'title'        => 'Marketing Cookies',
                        'descriptions' => 'Used to show you personalized ads based on your interests. Delivers campaign notifications tailored to your sports apparel and equipment preferences.',
                        'req_status'   => 'optional',
                    ],
                ],
            ],
        ];

        // ── Upsert root record (TR content) ─────────────────────────────
        $settings = SettingOption::updateOrCreate(
            ['option_name' => 'gdpr_data'],
            [
                'option_value' => json_encode($trContent, JSON_UNESCAPED_UNICODE),
                'autoload'     => 'json',
            ],
        );

        $this->command->info('GdprCookieSettingsSeeder: Root settings (TR) seeded.');

        // ── Translations ─────────────────────────────────────────────────
        if (!Schema::hasTable('translations')) {
            $this->command->warn('GdprCookieSettingsSeeder: translations table does not exist. Skipping translations...');
            return;
        }

        // Clean up old translations
        Translation::where('translatable_type', 'App\\Models\\SettingOption')
            ->where('translatable_id', $settings->id)
            ->where('key', 'content')
            ->delete();

        // Seed df (Turkish) + en (English) translations
        $langMap = [
            'df' => $trContent,
            'en' => $enContent,
        ];

        foreach ($langMap as $lang => $content) {
            Translation::create([
                'translatable_type' => 'App\\Models\\SettingOption',
                'translatable_id'   => $settings->id,
                'language'           => $lang,
                'key'                => 'content',
                'value'              => json_encode($content, JSON_UNESCAPED_UNICODE),
            ]);
        }

        $this->command->info('GdprCookieSettingsSeeder: DF + EN translations seeded.');
    }
}
