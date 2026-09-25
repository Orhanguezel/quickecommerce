<?php
// Anasayfaya puan kampanyasi banner'i ekler.
//
// IKI PARCA GEREKIYOR, biri olmadan digeri ise yaramaz:
//   1) banners tablosunda bir kayit
//   2) theme_one JSON'undaki theme_home_page.layout_blocks icinde, o banner'i
//      POZISYONUYLA (instance) gosteren bir banner_section blogu
// Frontend banner'i instance = siralanmis listedeki 1-tabanli sira ile
// buluyor (home-client resolveByInstance). Yani kayit eklemek TEK BASINA
// hicbir sey gostermez.

use App\Services\Loyalty\LoyaltyService;

$loyalty = app(LoyaltyService::class);
$imgTL   = $loyalty->pointsToCurrency((int) (com_option_get('com_loyalty_review_bonus_with_image') ?: 0));
$noImgTL = $loyalty->pointsToCurrency((int) (com_option_get('com_loyalty_review_bonus_no_image') ?: 0));

$BLOCK_ID = 'banner_section__loyalty';
$TITLE    = "Yorum Yaz, {$imgTL} TL Kazan";

// --- 1) Banner kaydi (tekrar calistirilabilir) ---
$existing = DB::table('banners')->where('title', $TITLE)->where('location', 'home_page')->first();

$payload = [
    'theme_name' => 'theme_one',
    'user_id' => 1,
    'title' => $TITLE,
    'title_color' => '#7F1D1D',
    'description' => "Satın aldığınız ürünü fotoğraflı değerlendirin {$imgTL} TL, fotoğrafsız {$noImgTL} TL değerinde puan kazanın. Her ürün için bir kez geçerli.",
    'description_color' => '#475569',
    'background_color' => '#FEF2F2',
    'button_text' => 'Nasıl Çalışır?',
    'button_text_color' => '#FFFFFF',
    'button_color' => '#E11D48',
    'button_hover_color' => '#BE123C',
    'redirect_url' => 'https://sportoonline.com/tr/puan-programi',
    'location' => 'home_page',
    'display_order' => 0,
    'desktop_row' => 1,
    'desktop_columns' => 3,
    'status' => 1,
    'updated_at' => now(),
];

if ($existing) {
    DB::table('banners')->where('id', $existing->id)->update($payload);
    $bannerId = $existing->id;
    echo "banner guncellendi: #{$bannerId}\n";
} else {
    $payload['created_at'] = now();
    $bannerId = DB::table('banners')->insertGetId($payload);
    echo "banner eklendi: #{$bannerId}\n";
}

// --- 2) instance hesabi: frontend siralamasinin AYNISI (row, order, id) ---
$sorted = DB::table('banners')->where('location', 'home_page')
    ->orderBy('desktop_row')->orderBy('display_order')->orderBy('id')->pluck('id')->toArray();
$instance = array_search($bannerId, $sorted, true) + 1;
echo "siralama: " . implode(',', $sorted) . " -> instance = {$instance}\n";

// --- 3) layout blogu ---
$row = DB::table('setting_options')->where('option_name', 'theme_one')->first();
$backup = storage_path('app/theme_one_backup_' . date('Ymd_His') . '.json');
file_put_contents($backup, $row->option_value);
echo "yedek: {$backup}\n";

$theme = json_decode($row->option_value, true);
$hp = &$theme['theme_pages'][0]['theme_home_page'];
$hpRef = &$hp[0];
$blocks = $hpRef['layout_blocks'];

$block = [
    'id' => $BLOCK_ID,
    'type' => 'banner_section',
    'instance' => $instance,
    'enabled_disabled' => 'on',
    // 12 = tam genislik. Yanindaki bloklar FARKLI tipte olmali, yoksa ardisik
    // ayni tip bloklar tek gruba toplanip yan yana diziliyor.
    'config' => ['banner_span' => 12],
];

$blocks = array_values(array_filter($blocks, fn ($b) => ($b['id'] ?? null) !== $BLOCK_ID));

// slider'dan HEMEN SONRA: onunde slider, arkasinda flash_sale var; ikisi de
// farkli tip oldugu icin blogumuz kendi basina, tam genislikte render olur.
$out = [];
$placed = false;
foreach ($blocks as $b) {
    $out[] = $b;
    if (! $placed && ($b['type'] ?? '') === 'slider') { $out[] = $block; $placed = true; }
}
if (! $placed) { array_unshift($out, $block); }

$hpRef['layout_blocks'] = $out;
$encoded = json_encode($theme, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if (! $encoded || ! json_decode($encoded)) { echo "encode HATALI, yazilmadi\n"; return; }

DB::table('setting_options')->where('option_name', 'theme_one')->update(['option_value' => $encoded]);
Cache::flush();

echo "layout blogu yerlestirildi. Yeni sira:\n";
foreach ($out as $b) {
    if (in_array($b['type'], ['slider','banner_section','flash_sale'], true)) {
        printf("  %-32s %-16s instance=%-2s span=%s\n", $b['id'], $b['type'], $b['instance'] ?? '-', $b['config']['banner_span'] ?? $b['config']['flash_sale_span'] ?? '-');
    }
}
