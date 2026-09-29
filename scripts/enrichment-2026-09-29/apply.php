// Urun zenginlestirme uygulama betigi (2026-09-29).
// Calistirma (VPS, backend-laravel):
//   APPLY_JSON=/root/enrichment-apply.json php artisan tinker --execute="$(cat apply.php)"          # dry-run
//   DRY=0 APPLY_JSON=/root/enrichment-apply.json php artisan tinker --execute="$(cat apply.php)"    # uygula
// Geri alma: ROLLBACK=/root/enrichment-rollback-<ts>.json php artisan tinker --execute="$(cat apply.php)"
//
// Yaptigi: products.description + (varsa) tr ceviri satiri guncellenir; ozellikler ayni ad yoksa eklenir;
// urunun markasi bossa ve onerilen marka product_brand'de VARSA brand_id atanir (yeni marka acilmaz).

$dry = getenv('DRY') !== '0';
$rollbackFile = getenv('ROLLBACK') ?: null;
$productType = App\Models\Product::class;

if ($rollbackFile) {
    $rb = json_decode(file_get_contents($rollbackFile), true);
    DB::transaction(function () use ($rb, $productType) {
        foreach ($rb['products'] as $row) {
            DB::table('products')->where('id', $row['id'])->update(['description' => $row['old_description'], 'brand_id' => $row['old_brand_id']]);
            if ($row['tr_translation_id']) {
                DB::table('translations')->where('id', $row['tr_translation_id'])->update(['value' => $row['old_tr_description']]);
            }
            DB::table('product_specifications')->whereIn('id', $row['created_spec_ids'])->delete();
            foreach ($row['changed_specs'] ?? [] as $c) {
                DB::table('product_specifications')->where('id', $c['id'])->update(['custom_value' => $c['old']]);
            }
        }
        DB::table('product_brand')->whereIn('id', $rb['created_brand_ids'] ?? [])->delete();
    });
    Cache::forever('public-catalog:version', (string) hrtime(true));
    echo "GERI ALINDI: " . count($rb['products']) . " urun\n";
    return;
}

$items = json_decode(file_get_contents(getenv('APPLY_JSON')), true);
// Yeni marka yalniz bu listede ve urun eslesmesi dogrulanmissa acilir (tedarikci adi marka yapilmaz).
$createBrands = array_filter(array_map('trim', explode(',', getenv('CREATE_BRANDS') ?: '')));
$brands = [];
foreach (App\Models\ProductBrand::orderBy('id')->get(['id', 'brand_name']) as $b) {
    $brands[mb_strtolower(trim($b->brand_name))] ??= $b->id; // tekrarli markalarda en eski id
}

$plan = [];
foreach ($items as $it) {
    $p = App\Models\Product::with('specifications')->find($it['id']);
    if (!$p || $p->deleted_at) { echo "ATLA {$it['id']}: urun yok\n"; continue; }
    $tr = DB::table('translations')->where('translatable_type', $productType)->where('translatable_id', $p->id)
        ->where('language', 'tr')->where('key', 'description')->first();
    $existing = $p->specifications->map(fn ($s) => mb_strtolower(trim($s->name)))->all();
    $byName = $p->specifications->keyBy(fn ($s) => mb_strtolower(trim($s->name)));
    $newSpecs = []; $changedSpecs = [];
    foreach ($it['specifications'] as $s) {
        $old = $byName[mb_strtolower(trim($s['name']))] ?? null;
        if (!$old) { $newSpecs[] = $s; }
        elseif (trim((string) $old->custom_value) !== trim($s['value']) && !$old->dynamic_field_id) {
            $changedSpecs[] = ['id' => $old->id, 'old' => $old->custom_value, 'new' => $s['value'], 'name' => $old->name];
        }
    }
    $brandId = null; $brandToCreate = null;
    $sbRaw = trim($it['suggested_brand'] ?? ''); $sb = mb_strtolower($sbRaw);
    if (!$p->brand_id && $sb !== '') {
        if (isset($brands[$sb])) { $brandId = $brands[$sb]; }
        elseif (in_array($sbRaw, $createBrands, true)) { $brandToCreate = $sbRaw; }
    }
    $plan[] = compact('p', 'tr', 'newSpecs', 'changedSpecs', 'brandId', 'brandToCreate', 'it');
    echo sprintf("%-6d %-50s desc:%s specs:+%d ~%d brand:%s\n", $p->id, mb_substr($p->name, 0, 50),
        $it['description_html'] ? 'yeni(' . mb_strlen(strip_tags($it['description_html'])) . ')' : '-',
        count($newSpecs), count($changedSpecs), $brandId ?: ($brandToCreate ? "YENI:$brandToCreate" : '-'));
    foreach ($changedSpecs as $c) { echo "         ~ {$c['name']}: '{$c['old']}' -> '{$c['new']}'\n"; }
}

if ($dry) { echo "DRY-RUN: " . count($plan) . " urun, yazilmadi. Uygulamak icin DRY=0.\n"; return; }

$rollback = ['products' => [], 'created_brand_ids' => []];
DB::transaction(function () use ($plan, &$rollback, &$brands) {
    foreach ($plan as $x) {
        $p = $x['p'];
        if ($x['brandToCreate']) {
            $key = mb_strtolower($x['brandToCreate']);
            if (!isset($brands[$key])) {
                $brands[$key] = DB::table('product_brand')->insertGetId([
                    'brand_name' => $x['brandToCreate'], 'brand_slug' => Illuminate\Support\Str::slug($x['brandToCreate']),
                    'status' => 1, 'created_at' => now(), 'updated_at' => now(),
                ]);
                $rollback['created_brand_ids'][] = $brands[$key];
            }
            $x['brandId'] = $brands[$key];
        }
        $row = ['id' => $p->id, 'old_description' => $p->description, 'old_brand_id' => $p->brand_id,
            'tr_translation_id' => $x['tr']->id ?? null, 'old_tr_description' => $x['tr']->value ?? null, 'created_spec_ids' => [],
            'changed_specs' => $x['changedSpecs']];
        foreach ($x['changedSpecs'] as $c) {
            DB::table('product_specifications')->where('id', $c['id'])->update(['custom_value' => $c['new'], 'updated_at' => now()]);
        }
        $update = ['updated_at' => now()];
        if ($x['it']['description_html']) { $update['description'] = $x['it']['description_html']; }
        if ($x['brandId']) { $update['brand_id'] = $x['brandId']; }
        DB::table('products')->where('id', $p->id)->update($update);
        if ($x['it']['description_html'] && $x['tr']) {
            DB::table('translations')->where('id', $x['tr']->id)->update(['value' => $x['it']['description_html'], 'updated_at' => now()]);
        }
        foreach ($x['newSpecs'] as $s) {
            $row['created_spec_ids'][] = DB::table('product_specifications')->insertGetId([
                'product_id' => $p->id, 'name' => $s['name'], 'type' => 'text', 'custom_value' => $s['value'],
                'status' => 1, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
        $rollback['products'][] = $row;
    }
});
$file = '/root/enrichment-rollback-' . date('Ymd-His') . '.json';
file_put_contents($file, json_encode($rollback, JSON_UNESCAPED_UNICODE));
Cache::forever('public-catalog:version', (string) hrtime(true));
echo "UYGULANDI: " . count($rollback['products']) . " urun. Geri alma: ROLLBACK={$file}\n";
