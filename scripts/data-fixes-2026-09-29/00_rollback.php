// =====================================================================
// 00 — Genel geri alma. 01-06 betiklerinin /root/fixNN-*.json dosyasini okur,
// her satirin "before" degerlerini geri yazar.
//
//   DRY-RUN : FILE=/root/fix01-category-remap-YYYYmmdd-HHMMSS.json php artisan tinker --execute="$(cat 00_rollback.php)"
//   UYGULA  : DRY=0 FILE=/root/fix01-... php artisan tinker --execute="$(cat 00_rollback.php)"
//
// Guvenlik: satirin simdiki degeri "after" ile ayni degilse (arada baska biri
// degistirdiyse) o satir ATLANIR ve raporlanir; FORCE=1 ile yine de yazilir.
// Izinli tablolar: products, product_category, blogs, translations, banners, sliders, stores.
// =====================================================================
(function () {
    $dry = getenv('DRY') !== '0';
    $force = getenv('FORCE') === '1';
    $file = getenv('FILE');
    if (!$file || !is_file($file)) { echo "FILE=<rollback json> verilmeli\n"; return; }
    $data = json_decode(file_get_contents($file), true);
    $allowed = ['products', 'product_category', 'blogs', 'translations', 'banners', 'sliders', 'stores'];
    $ok = 0; $conflict = 0;
    $apply = [];
    foreach ($data['rows'] ?? [] as $r) {
        if (!in_array($r['table'], $allowed, true)) throw new RuntimeException("Izin disi tablo: {$r['table']}");
        $cur = DB::table($r['table'])->where('id', $r['id'])->first();
        if (!$cur) { echo "YOK {$r['table']}#{$r['id']}\n"; $conflict++; continue; }
        $same = true;
        foreach (($r['after'] ?? []) as $col => $v) if ((string) $cur->$col !== (string) $v) $same = false;
        if (!$same && !$force) { echo "CAKISMA {$r['table']}#{$r['id']} (simdiki deger 'after' degil) — atlandi\n"; $conflict++; continue; }
        $apply[] = $r;
        $ok++;
    }
    echo "=== ROLLBACK {$data['fix']} ({$file}) " . ($dry ? 'DRY-RUN' : 'APPLY') . " === geri yazilacak={$ok} cakisma/yok={$conflict}\n";
    if ($dry) { echo "DRY-RUN: DB degismedi.\n"; return; }
    DB::transaction(function () use ($apply) {
        foreach ($apply as $r) DB::table($r['table'])->where('id', $r['id'])->update($r['before'] + ['updated_at' => now()]);
    });
    Cache::forever('public-catalog:version', (string) hrtime(true));
    echo "GERI ALINDI: {$ok} satir.\n";
})();
