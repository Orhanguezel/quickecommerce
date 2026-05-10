<?php

declare(strict_types=1);

use App\Models\SettingOption;
use App\Models\Translation;

require __DIR__ . '/../backend-laravel/vendor/autoload.php';

$app = require __DIR__ . '/../backend-laravel/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$dryRun = in_array('--dry-run', $argv, true);
$verify = in_array('--verify', $argv, true);

$helpCenterTr = [
    ['title' => 'İletişim', 'url' => '/iletisim'],
    ['title' => 'Müşteri Hizmetleri', 'url' => '/destek'],
    ['title' => 'Ürün Desteği', 'url' => '/destek'],
    ['title' => 'Sipariş Takip', 'url' => '/siparislerim'],
];

$helpCenterEn = [
    ['title' => 'Contact Us', 'url' => '/iletisim'],
    ['title' => 'Customer Service', 'url' => '/destek'],
    ['title' => 'Product Support', 'url' => '/destek'],
    ['title' => 'Track Order', 'url' => '/siparislerim'],
];

function backupFooter(SettingOption $footer): string
{
    $backupDir = __DIR__ . '/../backend-laravel/storage/app/footer-backups';
    if (!is_dir($backupDir) && !mkdir($backupDir, 0755, true) && !is_dir($backupDir)) {
        throw new RuntimeException("Backup directory could not be created: {$backupDir}");
    }

    $payload = [
        'footer_settings' => $footer->toArray(),
        'translations' => Translation::query()
            ->where('translatable_type', SettingOption::class)
            ->where('translatable_id', $footer->id)
            ->where('key', 'content')
            ->get()
            ->toArray(),
    ];

    $path = $backupDir . '/sportoonline-footer-' . date('Ymd-His') . '.json';
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false || file_put_contents($path, $json) === false) {
        throw new RuntimeException("Backup file could not be written: {$path}");
    }

    return $path;
}

function normalizedFooterContent(?string $json, array $helpCenter): array
{
    $content = json_decode((string) $json, true) ?: [];

    $content['com_help_center'] = $helpCenter;
    $content['com_download_app_link_one'] = '';
    $content['com_download_app_link_two'] = '';
    $content['com_social_links_facebook_url'] = 'https://facebook.com/sportoonline';
    $content['com_social_links_instagram_url'] = 'https://instagram.com/sportoonline';
    $content['com_social_links_linkedin_url'] = 'https://linkedin.com/company/sportoonline';
    $content['com_social_links_twitter_url'] = '';

    return $content;
}

function upsertFooterTranslation(SettingOption $footer, string $language, array $content): void
{
    Translation::query()->updateOrCreate(
        [
            'translatable_type' => SettingOption::class,
            'translatable_id' => $footer->id,
            'language' => $language,
            'key' => 'content',
        ],
        ['value' => json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]
    );
}

$footer = SettingOption::query()->where('option_name', 'footer_settings')->first();
if (!$footer) {
    throw new RuntimeException('footer_settings not found');
}

if ($verify) {
    $content = json_decode((string) $footer->option_value, true) ?: [];
    $dfTranslation = Translation::query()
        ->where('translatable_type', SettingOption::class)
        ->where('translatable_id', $footer->id)
        ->where('language', 'df')
        ->where('key', 'content')
        ->first();
    $dfContent = json_decode((string) ($dfTranslation?->value ?? ''), true) ?: [];

    echo 'root_help_count=' . count($content['com_help_center'] ?? []) . "\n";
    echo 'df_help_count=' . count($dfContent['com_help_center'] ?? []) . "\n";
    echo 'app_links=' . (($dfContent['com_download_app_link_one'] ?? '') ?: '[empty]')
        . ',' . (($dfContent['com_download_app_link_two'] ?? '') ?: '[empty]') . "\n";
    echo 'twitter=' . (($dfContent['com_social_links_twitter_url'] ?? '') ?: '[empty]') . "\n";
    exit(0);
}

$rootContent = normalizedFooterContent($footer->option_value, $helpCenterTr);
$dfContent = $rootContent;
$enContent = normalizedFooterContent($footer->option_value, $helpCenterEn);

if ($dryRun) {
    echo 'dry_run_root_help_count=' . count($rootContent['com_help_center']) . "\n";
    echo "dry_run_app_links_cleared=yes\n";
    exit(0);
}

echo "backup\t" . backupFooter($footer) . "\n";

$footer->option_value = json_encode($rootContent, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
$footer->save();

upsertFooterTranslation($footer, 'df', $dfContent);
upsertFooterTranslation($footer, 'tr', $dfContent);
upsertFooterTranslation($footer, 'en', $enContent);

echo 'updated_footer_links' . "\n";
