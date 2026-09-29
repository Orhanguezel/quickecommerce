// =====================================================================
// 04 — Ana sayfa banner/slider linkleri: /tr/ara?q=... -> kalici sayfa
// Derin analiz 2026-09-29 §10
//
//   DRY-RUN : php artisan tinker --execute="$(cat 04_home_links_permanent.php)"
//   UYGULA  : DRY=0 php artisan tinker --execute="$(cat 04_home_links_permanent.php)"
//   01 ve 02'den SONRA calistir (whey-protein ve spor-aletleri hedefleri o
//   tasimalarla dolar). Hedef kategori alt agacinda < MIN_PRODUCTS (vars. 3)
//   satilabilir urun varsa o satir ATLANIR.
//
// Kaynak (olculdu): /ara?q= linkleri tamamen DB'de — banners.redirect_url
// (#32 biotech, #33 whey, #35 yonex) ve sliders.button_url + redirect_url
// (#40 tatami, #45 sigg, #46 pilates yoga). translations tablosunda kopya yok.
//
// flash_sale_id= linkleri DB'de DEGIL, kodda uretilir:
//   customer-web-nextjs/src/app/[locale]/home-client.tsx:197-229
//   getFlashDealProductsHref(): button_url bos ise fallback
//   `/urunler?flash_sale_id=<id>`; button_url "/urunler" ise appendFlashSaleId()
//   parametreyi ekler. flash_sales.button_url (hepsi "/urunler" veya
//   "https://sportoonline.com/tr/urunler") ayni fonksiyonla /kampanyalar
//   sayfasindaki kartlara da gidiyor (campaigns-client.tsx:42) — DB'de
//   "/kampanyalar" yapmak kampanya sayfasinda kendine donen link uretir.
//   Bu nedenle bu betik flash_sales'e DOKUNMAZ; duzeltme kodda yapilmali
//   (ana sayfa kartinda href="/kampanyalar").
// Rollback: /root/fix04-home-links-<ts>.json -> 00_rollback.php
// =====================================================================
(function () {
    $dry = getenv('DRY') !== '0';
    $minProducts = getenv('MIN_PRODUCTS') !== false && getenv('MIN_PRODUCTS') !== '' ? (int) getenv('MIN_PRODUCTS') : 3;
    $site = 'https://sportoonline.com';

    // [tablo, id, beklenen eski deger, hedef tipi, hedef slug]
    $plan = [
        ['banners', 33, "{$site}/tr/ara?q=whey", 'category', 'whey-protein'],
        ['banners', 35, "{$site}/tr/ara?q=yonex", 'brand', 'yonex'],
        ['sliders', 40, "{$site}/tr/ara?q=tatami", 'category', 'spor-aletleri'],
        ['sliders', 45, "{$site}/tr/ara?q=sigg", 'brand', 'sigg'],
        ['sliders', 46, "{$site}/tr/ara?q=pilates%20yoga", 'category', 'yoga-pilates'],
        // banners #32 (q=biotech): Biotech markasi/kategorisi yok (adinda biotech
        // gecen 3 onayli urun) -> net kalici hedef yok, DOKUNULMADI.
    ];
    $columns = ['banners' => ['redirect_url'], 'sliders' => ['button_url', 'redirect_url']];

    $cats = DB::table('product_category')->where('status', 1)->get(['id', 'parent_id', 'category_slug']);
    $children = $cats->groupBy('parent_id');
    $direct = DB::table('products')
        ->join('product_variants', 'product_variants.product_id', '=', 'products.id')
        ->join('stores', 'stores.id', '=', 'products.store_id')
        ->whereNull('products.deleted_at')->where('products.status', 'approved')
        ->whereNotNull('products.image')->where('products.image', '!=', '')
        ->whereNull('product_variants.deleted_at')->where('product_variants.status', 1)
        ->where('product_variants.stock_quantity', '>', 0)
        ->where(fn ($q) => $q->where('product_variants.price', '>', 0)->orWhere('product_variants.special_price', '>', 0))
        ->where('stores.status', 1)->whereNull('stores.deleted_at')
        ->groupBy('products.category_id')->selectRaw('products.category_id, COUNT(DISTINCT products.id) c')->pluck('c', 'category_id');
    $subtree = function (int $id) use (&$subtree, $children, $direct): int {
        $n = (int) ($direct[$id] ?? 0);
        foreach ($children[$id] ?? [] as $ch) $n += $subtree((int) $ch->id);
        return $n;
    };

    echo "=== FIX 04 ana sayfa linkleri (" . ($dry ? 'DRY-RUN' : 'APPLY') . ") ===\n";
    $changes = [];
    foreach ($plan as [$table, $rowId, $expected, $type, $slug]) {
        $row = DB::table($table)->where('id', $rowId)->first();
        if (!$row) { echo "  {$table}#{$rowId}: YOK, atlandi\n"; continue; }
        if ($type === 'category') {
            $c = $cats->firstWhere('category_slug', $slug);
            $n = $c ? $subtree((int) $c->id) : 0;
            if ($n < $minProducts) { echo "  {$table}#{$rowId}: /kategori/{$slug} satilabilir urun={$n} < {$minProducts}, ATLANDI\n"; continue; }
            $target = "{$site}/tr/kategori/{$slug}";
        } else {
            $brand = DB::table('product_brand')->where('brand_slug', $slug)->where('status', 1)->orderBy('id')->first();
            $n = $brand ? DB::table('products')->whereNull('deleted_at')->where('status', 'approved')->where('brand_id', $brand->id)->count() : 0;
            if ($n < $minProducts) { echo "  {$table}#{$rowId}: /marka/{$slug} onayli urun={$n} < {$minProducts}, ATLANDI\n"; continue; }
            $target = "{$site}/tr/marka/{$slug}";
        }
        $before = [];
        $after = [];
        foreach ($columns[$table] as $col) {
            $cur = (string) ($row->$col ?? '');
            if ($cur === '') continue;
            if ($cur !== $expected) { echo "  {$table}#{$rowId}.{$col}: beklenmeyen deger '{$cur}', bu kolon atlandi\n"; continue; }
            $before[$col] = $cur;
            $after[$col] = $target;
        }
        if (!$after) continue;
        echo "  {$table}#{$rowId} \"{$row->title}\": " . implode(',', array_keys($after)) . " {$expected} -> {$target} (urun={$n})\n";
        $changes[] = ['table' => $table, 'id' => $rowId, 'before' => $before, 'after' => $after];
    }
    echo "  banners#32 (q=biotech): net kalici hedef yok, dokunulmadi.\n";
    echo "Degisecek kayit: " . count($changes) . "\n";
    if ($dry) { echo "DRY-RUN: DB degismedi. Uygulamak icin DRY=0.\n"; return; }

    $file = '/root/fix04-home-links-' . now()->format('Ymd-His') . '.json';
    file_put_contents($file, json_encode(['fix' => '04_home_links_permanent', 'created_at' => now()->toIso8601String(), 'rows' => $changes], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    echo "Rollback dosyasi: {$file}\n";
    // Eloquent ile kaydet: Banner/Slider PublicCatalogCacheObserver'i tetiklenir.
    DB::transaction(function () use ($changes) {
        foreach ($changes as $c) {
            $model = $c['table'] === 'banners' ? \App\Models\Banner::class : \App\Models\Slider::class;
            $m = $model::query()->findOrFail($c['id']);
            foreach ($c['after'] as $col => $v) $m->{$col} = $v;
            $m->save();
        }
    });
    Cache::forever('public-catalog:version', (string) hrtime(true));
    echo "UYGULANDI: " . count($changes) . " kayit.\n";
})();
