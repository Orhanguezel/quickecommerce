<?php

declare(strict_types=1);

use App\Models\Page;
use App\Models\SettingOption;
use App\Models\Translation;

require __DIR__ . '/../backend-laravel/vendor/autoload.php';

$app = require __DIR__ . '/../backend-laravel/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$dryRun = in_array('--dry-run', $argv, true);
$verify = in_array('--verify', $argv, true);

const PLACEHOLDER_PHONE = '+90 212 555 0 123';

$meta = [
    'about' => [
        'tr' => [
            'title' => 'Hakkımızda',
            'description' => "Sportoonline'in çok satıcılı spor pazaryeri yaklaşımını, spor ürünleri odağını, satıcı yapısını ve güvenli alışveriş ilkelerini keşfedin.",
        ],
        'en' => [
            'title' => 'About Sportoonline',
            'description' => 'Learn about Sportoonline, a multi-seller sports marketplace focused on sports products, seller visibility, transparent product information and secure shopping.',
        ],
    ],
    'contact' => [
        'tr' => [
            'title' => 'İletişim',
            'description' => 'Sportoonline müşteri desteğine ulaşın; spor ürünleri, sipariş, satıcı başvurusu ve pazaryeri süreçleri için iletişim bilgilerini inceleyin.',
        ],
        'en' => [
            'title' => 'Contact',
            'description' => 'Contact Sportoonline customer support for sports products, orders, seller applications and marketplace support processes.',
        ],
    ],
];

function isPlaceholderPhone(?string $value): bool
{
    if ($value === null || trim($value) === '') {
        return false;
    }

    $digits = preg_replace('/\D+/', '', $value) ?? '';
    return str_contains($digits, '212555') || preg_match('/(^|\D)555(\D|$)/', $value) === 1;
}

function cleanString(?string $value): ?string
{
    if ($value === null) {
        return null;
    }

    $value = str_replace(
        [
            ' adresi, +90 212 555 0 123 telefonu ve info@sportoonline.com e-postası',
            ' adresi, +90 212 555 0 123 telefonu ve info@sportoonline.com e-postasi',
            ', +90 212 555 0 123 telefonu',
            '+90 212 555 0 123 telefonu ve ',
            '+90 212 555 0 123',
            ' ve Twitter (@sportoonlinecom)',
            ', Facebook ve Twitter (@sportoonlinecom)',
        ],
        [
            ' adresi ve info@sportoonline.com e-postası',
            ' adresi ve info@sportoonline.com e-postasi',
            '',
            '',
            '',
            '',
            ' ve Facebook',
        ],
        $value
    );

    return preg_replace('/\s{2,}/u', ' ', trim($value));
}

function cleanContent(mixed $value): mixed
{
    if (is_string($value)) {
        return cleanString($value);
    }

    if (is_array($value)) {
        foreach ($value as $key => $item) {
            if ($key === 'phone' && is_string($item) && isPlaceholderPhone($item)) {
                $value[$key] = null;
                continue;
            }

            if ($key === 'social' && is_array($item)) {
                $value[$key] = array_values(array_filter($item, static function ($social): bool {
                    $url = is_array($social) ? (string) ($social['url'] ?? '') : '';
                    return !preg_match('~https?://(www\.)?(twitter|x)\.com/sportoonline/?$~i', $url);
                }));
                continue;
            }

            $value[$key] = cleanContent($item);
        }
    }

    return $value;
}

function upsertPageTranslation(Page $page, string $language, string $key, string $value): void
{
    Translation::query()->updateOrCreate(
        [
            'translatable_type' => Page::class,
            'translatable_id' => $page->id,
            'language' => $language,
            'key' => $key,
        ],
        ['value' => $value]
    );
}

function upsertSettingTranslation(SettingOption $setting, string $language, string $key, string $value): void
{
    Translation::query()->updateOrCreate(
        [
            'translatable_type' => SettingOption::class,
            'translatable_id' => $setting->id,
            'language' => $language,
            'key' => $key,
        ],
        ['value' => $value]
    );
}

function backupState(): string
{
    $backupDir = __DIR__ . '/../backend-laravel/storage/app/meta-nap-backups';
    if (!is_dir($backupDir) && !mkdir($backupDir, 0755, true) && !is_dir($backupDir)) {
        throw new RuntimeException("Backup directory could not be created: {$backupDir}");
    }

    $payload = [
        'settings' => SettingOption::query()
            ->whereIn('option_name', [
                'com_site_contact_number',
                'com_site_full_address',
                'com_site_email',
                'footer_settings',
            ])
            ->get(['id', 'option_name', 'option_value'])
            ->toArray(),
        'pages' => Page::query()
            ->whereIn('slug', ['about', 'contact'])
            ->with('related_translations')
            ->get()
            ->toArray(),
    ];

    $path = $backupDir . '/sportoonline-meta-nap-' . date('Ymd-His') . '.json';
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false || file_put_contents($path, $json) === false) {
        throw new RuntimeException("Backup file could not be written: {$path}");
    }

    return $path;
}

if ($verify) {
    $settings = SettingOption::query()
        ->whereIn('option_name', ['com_site_contact_number', 'footer_settings'])
        ->get()
        ->keyBy('option_name');
    $settingValues = $settings->map(static fn (SettingOption $setting): ?string => $setting->option_value);
    $phoneSetting = $settings->get('com_site_contact_number');
    $phoneTranslations = $phoneSetting
        ? Translation::query()
            ->where('translatable_type', SettingOption::class)
            ->where('translatable_id', $phoneSetting->id)
            ->where('key', 'com_site_contact_number')
            ->pluck('value', 'language')
            ->toArray()
        : [];
    $footer = json_decode((string) ($settingValues['footer_settings'] ?? '{}'), true) ?: [];
    $footerContent = $footer['content'] ?? $footer;

    echo 'site_phone=' . (($settingValues['com_site_contact_number'] ?? '') ?: '[empty]') . "\n";
    echo 'phone_translations=' . (json_encode($phoneTranslations, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '[]') . "\n";
    echo 'phone_placeholder=' . (isPlaceholderPhone($settingValues['com_site_contact_number'] ?? null) || array_filter($phoneTranslations, 'isPlaceholderPhone') ? 'yes' : 'no') . "\n";
    echo 'footer_twitter=' . (($footerContent['com_social_links_twitter_url'] ?? '') ?: '[empty]') . "\n";

    foreach (Page::query()->whereIn('slug', ['about', 'contact'])->with('related_translations')->get() as $page) {
        $content = json_encode($page->content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '';
        echo "page={$page->slug}\tmeta_len=" . mb_strlen((string) $page->meta_description)
            . "\tcontains_placeholder=" . (str_contains($content, PLACEHOLDER_PHONE) ? 'yes' : 'no') . "\n";
    }
    exit(0);
}

if (!$dryRun) {
    echo "backup\t" . backupState() . "\n";
}

$sitePhone = SettingOption::query()->where('option_name', 'com_site_contact_number')->first();
if ($sitePhone && isPlaceholderPhone((string) $sitePhone->option_value)) {
    echo "clear_setting\tcom_site_contact_number\t{$sitePhone->option_value}\n";
    if (!$dryRun) {
        $sitePhone->option_value = '';
        $sitePhone->save();
    }
}
if ($sitePhone) {
    $phoneTranslations = Translation::query()
        ->where('translatable_type', SettingOption::class)
        ->where('translatable_id', $sitePhone->id)
        ->where('key', 'com_site_contact_number')
        ->get();
    foreach ($phoneTranslations as $translation) {
        if (isPlaceholderPhone((string) $translation->value)) {
            echo "clear_setting_translation\tcom_site_contact_number\t{$translation->language}\t{$translation->value}\n";
            if (!$dryRun) {
                $translation->value = '';
                $translation->save();
            }
        }
    }
}

$footer = SettingOption::query()->where('option_name', 'footer_settings')->first();
if ($footer) {
    $data = json_decode((string) $footer->option_value, true) ?: [];
    $contentPath = array_key_exists('content', $data) && is_array($data['content']) ? ['content'] : [];
    $content = $contentPath ? $data['content'] : $data;
    $twitterUrl = (string) ($content['com_social_links_twitter_url'] ?? '');

    if (preg_match('~https?://(www\.)?(twitter|x)\.com/sportoonline/?$~i', $twitterUrl)) {
        $content['com_social_links_twitter_url'] = '';
        echo "clear_footer_twitter\t{$twitterUrl}\n";
    }

    if ($contentPath) {
        $data['content'] = $content;
    } else {
        $data = $content;
    }

    if (!$dryRun) {
        $footer->option_value = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $footer->save();
        foreach (['df', 'tr', 'en'] as $language) {
            upsertSettingTranslation($footer, $language, 'content', $footer->option_value);
        }
    }
}

foreach (['about', 'contact'] as $slug) {
    $page = Page::query()->with('related_translations')->where('slug', $slug)->first();
    if (!$page) {
        echo "missing_page\t{$slug}\n";
        continue;
    }

    $content = cleanContent($page->content);
    $page->meta_title = $meta[$slug]['tr']['title'];
    $page->meta_description = $meta[$slug]['tr']['description'];

    if (!$dryRun) {
        $page->content = json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $page->save();
        upsertPageTranslation($page, 'tr', 'meta_title', $meta[$slug]['tr']['title']);
        upsertPageTranslation($page, 'tr', 'meta_description', $meta[$slug]['tr']['description']);
        upsertPageTranslation($page, 'en', 'meta_title', $meta[$slug]['en']['title']);
        upsertPageTranslation($page, 'en', 'meta_description', $meta[$slug]['en']['description']);

        foreach (['tr', 'en'] as $language) {
            $translation = $page->related_translations
                ->where('language', $language)
                ->where('key', 'content')
                ->first();
            if (!$translation) {
                continue;
            }

            $translatedContent = json_decode((string) $translation->value, true);
            if (is_array($translatedContent)) {
                upsertPageTranslation(
                    $page,
                    $language,
                    'content',
                    json_encode(cleanContent($translatedContent), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
                );
            }
        }
    }

    echo "updated_page\t{$slug}\n";
}
