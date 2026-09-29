// =====================================================================
// 06 — Maraton Sportswear magazasini pasife al (stores.id=47)
// Derin analiz 2026-09-29 §9. Tedarikci sitesi kapali (maraton.com.tr ->
// memlekethosting), scraper registry'de STATUS_PASSIVE, cron'u yorumda.
// Olculdu: status=1, 317 urunun tamami status=inactive, stoklu varyant 0.
//
//   DRY-RUN : php artisan tinker --execute="$(cat 06_maraton_store_passive.php)"
//   UYGULA  : DRY=0 php artisan tinker --execute="$(cat 06_maraton_store_passive.php)"
//   GERI AL : 00_rollback.php (status tekrar 1)
//
// Otomatik geri acilma yok: commerce:enforce-store-readiness yalniz status=1
// magazalari isler ve status'a dokunmaz (sales_suspended_at kullanir).
// Urunlere dokunulmaz (zaten inactive).
// =====================================================================
(function () {
    $dry = getenv('DRY') !== '0';
    $storeId = 47;
    $s = DB::table('stores')->where('id', $storeId)->first();
    if (!$s) { echo "stores#{$storeId} yok\n"; return; }
    $products = DB::table('products')->where('store_id', $storeId)->whereNull('deleted_at')->selectRaw('status, count(*) c')->groupBy('status')->pluck('c', 'status');
    $inStock = DB::table('product_variants as v')->join('products as p', 'p.id', '=', 'v.product_id')
        ->where('p.store_id', $storeId)->whereNull('p.deleted_at')->whereNull('v.deleted_at')->where('v.stock_quantity', '>', 0)->count();
    echo "=== FIX 06 Maraton magazasi (" . ($dry ? 'DRY-RUN' : 'APPLY') . ") ===\n";
    echo "stores#{$s->id} {$s->name} slug={$s->slug} status={$s->status}\n";
    echo "urunler: " . json_encode($products) . " stoklu varyant={$inStock}\n";
    if ((int) $s->status === 0) { echo "Zaten pasif, islem yok.\n"; return; }
    if (($products['approved'] ?? 0) > 0 || $inStock > 0) { echo "DURDU: onayli/stoklu urun var, beklenmeyen durum.\n"; return; }
    if ($dry) { echo "DRY-RUN: status 1 -> 0 yapilacak. Uygulamak icin DRY=0.\n"; return; }

    $file = '/root/fix06-maraton-store-' . now()->format('Ymd-His') . '.json';
    file_put_contents($file, json_encode(['fix' => '06_maraton_store_passive', 'created_at' => now()->toIso8601String(),
        'rows' => [['table' => 'stores', 'id' => $storeId, 'before' => ['status' => (int) $s->status], 'after' => ['status' => 0]]]], JSON_PRETTY_PRINT));
    echo "Rollback dosyasi: {$file}\n";
    $store = \App\Models\Store::query()->findOrFail($storeId);
    $store->status = 0;
    $store->save(); // PublicCatalogCacheObserver cache surumunu yeniler
    echo "UYGULANDI: stores#{$storeId} status=0\n";
})();
