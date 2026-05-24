<?php
// Translations tablosunda da description (ve diğer) alanlarinda relatif
// img src/a href var. API ?language=tr ile bunlari donuyor — products tablosu
// duzeltilse bile translations eski kaliyor.

$total = 0;
$bystore = [];

$rows = DB::table('translations')
    ->where('key', 'description')
    ->where('value', 'REGEXP', '<img[^>]+src="/[^"]')
    ->orWhere(function ($q) {
        $q->where('key', 'description')
          ->where('value', 'REGEXP', '<a[^>]+href="/[^"]');
    })
    ->select('id', 'translatable_id', 'translatable_type', 'language', 'key', 'value')
    ->get();

echo "=== Etkilenen translation row: " . $rows->count() . " ===\n";

$noMap = 0;
foreach ($rows as $r) {
    // Product translation mi?
    if (!str_ends_with($r->translatable_type, 'Product')) continue;

    $mapping = App\Models\ProductSourceMapping::where('product_id', $r->translatable_id)->first();
    if (!$mapping || empty($mapping->source_product_url)) { $noMap++; continue; }

    $parts = parse_url($mapping->source_product_url);
    if (empty($parts['scheme']) || empty($parts['host'])) { $noMap++; continue; }
    $base = $parts['scheme'] . '://' . $parts['host'];

    $newVal = preg_replace_callback(
        '/(<img[^>]+src=)(["\'])(\/(?!\/)[^"\']+)(["\'])/i',
        fn ($m) => $m[1] . $m[2] . $base . $m[3] . $m[4],
        $r->value
    );
    $newVal = preg_replace_callback(
        '/(<a[^>]+href=)(["\'])(\/(?!\/)[^"\']+)(["\'])/i',
        fn ($m) => $m[1] . $m[2] . $base . $m[3] . $m[4],
        $newVal
    );

    if ($newVal !== $r->value) {
        DB::table('translations')->where('id', $r->id)->update([
            'value' => $newVal,
            'updated_at' => now(),
        ]);
        $total++;
        // Magaza bilgisi
        $p = App\Models\Product::find($r->translatable_id);
        if ($p) {
            $bystore[$p->store_id] = ($bystore[$p->store_id] ?? 0) + 1;
        }
    }
}

echo "\n=== Sonuc ===\n";
echo "  Guncellenen translation: $total\n";
echo "  Mapping yok: $noMap\n";
echo "\n=== Magaza bazli ===\n";
foreach ($bystore as $sid => $n) {
    $s = App\Models\Store::find($sid);
    echo "  #{$sid} " . ($s ? $s->name : '?') . ": $n translation\n";
}
