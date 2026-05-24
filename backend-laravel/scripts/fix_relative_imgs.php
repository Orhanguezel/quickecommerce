<?php
// Description'da <img src="/path"> seklinde RELATIF URL'ler 404 veriyor
// (browser sportoonline.com koku diye yorumluyor, asli kaynak site).
// Her urunun ProductSourceMapping'inden source domain'i parse edip
// absolute URL'e cevir.

$count = 0;
$skipped = 0;
$noMapping = 0;
$bystore = [];

// REGEXP ile tum etkilenen urunleri bul (src="/ ile baslayan img)
$rows = DB::table('products')
    ->where('description', 'REGEXP', '<img[^>]+src="/[^"]')
    ->select('id', 'store_id', 'slug', 'description')
    ->get();

echo "=== Bulunan etkilenen urun: " . $rows->count() . " ===\n\n";

foreach ($rows as $r) {
    $mapping = App\Models\ProductSourceMapping::where('product_id', $r->id)->first();
    if (!$mapping || empty($mapping->source_product_url)) {
        $noMapping++;
        continue;
    }
    $parts = parse_url($mapping->source_product_url);
    if (empty($parts['scheme']) || empty($parts['host'])) {
        $noMapping++;
        continue;
    }
    $base = $parts['scheme'] . '://' . $parts['host'];

    // src="/path" -> src="BASE/path" (sadece / ile baslayanlar; // veya http(s) zaten absolute)
    $newDesc = preg_replace_callback(
        '/(<img[^>]+src=)(["\'])(\/(?!\/)[^"\']+)(["\'])/i',
        function ($m) use ($base) {
            return $m[1] . $m[2] . $base . $m[3] . $m[4];
        },
        $r->description
    );

    // href de duzelt (cogu zaman <a><img></a> ile sarmali; broken link olmasin)
    $newDesc = preg_replace_callback(
        '/(<a[^>]+href=)(["\'])(\/(?!\/)[^"\']+)(["\'])/i',
        function ($m) use ($base) {
            return $m[1] . $m[2] . $base . $m[3] . $m[4];
        },
        $newDesc
    );

    if ($newDesc !== $r->description) {
        DB::table('products')->where('id', $r->id)->update([
            'description' => $newDesc,
            'updated_at' => now(),
        ]);
        $count++;
        $bystore[$r->store_id] = ($bystore[$r->store_id] ?? 0) + 1;
    } else {
        $skipped++;
    }
}

echo "=== Sonuc ===\n";
echo "  Guncellenen: $count urun\n";
echo "  Degismeyen:  $skipped urun\n";
echo "  Mapping yok: $noMapping urun\n";
echo "\n=== Magaza bazli ===\n";
foreach ($bystore as $sid => $n) {
    $s = App\Models\Store::find($sid);
    $name = $s ? $s->name : '?';
    echo "  #{$sid} {$name}: $n urun\n";
}
