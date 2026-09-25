<?php
// Puan kampanyasi ust seridini theme_one JSON'una ekler.
// Tekrar calistirilabilir: ayni id varsa gunceller, yoksa ekler.
//
// METIN CANLI AYARLARDAN OKUNUR ama JSON'a SABIT yazilir -- tema popup
// sistemi metin icinde degisken desteklemiyor. Oranlar degisirse bu script
// yeniden calistirilmali.

use App\Services\Loyalty\LoyaltyService;

$loyalty = app(LoyaltyService::class);
$withImage = (int) (com_option_get('com_loyalty_review_bonus_with_image') ?: 0);
$noImage   = (int) (com_option_get('com_loyalty_review_bonus_no_image') ?: 0);
$imgTL     = $loyalty->pointsToCurrency($withImage);
$noImgTL   = $loyalty->pointsToCurrency($noImage);
$holdDays  = $loyalty->holdDays();

$row = DB::table('setting_options')->where('option_name', 'theme_one')->first();
if (! $row) { echo "theme_one YOK\n"; return; }

// YEDEK: buyuk bir canli JSON'a dokunuyoruz.
$backup = storage_path('app/theme_one_backup_' . date('Ymd_His') . '.json');
file_put_contents($backup, $row->option_value);
echo "yedek: {$backup}\n";

$theme = json_decode($row->option_value, true);
if (! is_array($theme) || ! isset($theme['theme_pages'][0]['theme_popup_settings'])) {
    echo "JSON yapisi beklenenden farkli, DOKUNULMADI\n";
    return;
}

$entry = [
    'id' => 'popup_top_yorum_puan',
    'enabled_disabled' => 'on',
    'title' => "Yorum Yaz, {$imgTL} TL Kazan",
    'subtitle' => "Satın aldığınız ürünü fotoğraflı değerlendirin {$imgTL} TL, fotoğrafsız {$noImgTL} TL değerinde puan kazanın. Her ürün için bir kez.",
    'button_text' => 'Nasıl Çalışır?',
    'button_url' => 'https://sportoonline.com/tr/puan-programi',
    'image_id' => null,
    'image_id_url' => null,
    'img_url' => null,
    'image_url' => null,
    'coupon_code' => null,
    // Mevcut "Ucretsiz Kargo" seridinden SONRA. Ust serit ayni anda tek
    // gorunuyor, siradaki ancak oncekinin kapatilmasiyla geliyor; anonim
    // ziyaretci icin kargo mesaji daha guclu oldugundan onde birakildi.
    'sort_order' => 2,
    'delay_seconds' => 1,
    'frequency_days' => 1,
    'page_target' => 'all',
    'display_type' => 'top_bar',
    'text_behavior' => 'marquee',
    'popup_bg_color' => '#FEF6F6',
    'popup_text_color' => '#1E293B',
    'popup_button_bg_color' => '#E11D48',
    'popup_button_text_color' => '#FFFFFF',
];

$list = $theme['theme_pages'][0]['theme_popup_settings'];
$found = false;
foreach ($list as $i => $item) {
    if (($item['id'] ?? null) === $entry['id']) { $list[$i] = $entry; $found = true; break; }
}
if (! $found) {
    // Kargo seridi 1'de kalsin, digerlerinin sirasi 1 kaydirilsin.
    foreach ($list as $i => $item) {
        if ((int) ($item['sort_order'] ?? 0) >= 2) $list[$i]['sort_order'] = (int) $item['sort_order'] + 1;
    }
    $list[] = $entry;
}
usort($list, fn ($a, $b) => (int) ($a['sort_order'] ?? 0) <=> (int) ($b['sort_order'] ?? 0));

$theme['theme_pages'][0]['theme_popup_settings'] = $list;
$encoded = json_encode($theme, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if (! $encoded || ! json_decode($encoded)) { echo "encode HATALI, yazilmadi\n"; return; }

DB::table('setting_options')->where('option_name', 'theme_one')->update(['option_value' => $encoded]);
Cache::flush();

echo ($found ? 'guncellendi' : 'eklendi') . ": {$entry['id']}\n";
echo "popup sayisi: " . count($list) . "\n";
foreach ($list as $p) {
    printf("  %-28s %-13s %-4s sira=%d  %s\n", $p['id'], $p['display_type'], $p['enabled_disabled'], $p['sort_order'], $p['title']);
}
