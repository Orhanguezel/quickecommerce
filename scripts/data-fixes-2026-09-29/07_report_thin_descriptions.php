// =====================================================================
// 07 — RAPOR (yalniz okur): onayli urunlerde bos / <100 karakter aciklama, magaza bazinda
// Derin analiz 2026-09-29 §7
//
//   php artisan tinker --execute="$(cat 07_report_thin_descriptions.php)"
//   CSV hedefi: OUT=/root/thin-descriptions-by-store.csv (varsayilan bu)
//   Urun listesi de istenirse: DETAIL_OUT=/root/thin-descriptions-products.csv
//
// Aciklama = tr ceviri (translations, key=description) doluysa o, degilse
// products.description. HTML etiketleri ve entity'ler temizlenip bosluklar
// sikistirildiktan sonra mb_strlen ile olculur.
// "gorunur" = approved + magaza aktif + stoklu, fiyatli, aktif varyant.
// =====================================================================
(function () {
    $out = getenv('OUT') ?: '/root/thin-descriptions-by-store.csv';
    $detailOut = getenv('DETAIL_OUT') ?: null;
    $productType = 'App\Models\Product';

    $trDesc = DB::table('translations')->where('translatable_type', $productType)->where('language', 'tr')->where('key', 'description')
        ->whereNotNull('value')->where('value', '!=', '')->pluck('value', 'translatable_id');
    $visibleIds = DB::table('products')
        ->join('product_variants', 'product_variants.product_id', '=', 'products.id')
        ->join('stores', 'stores.id', '=', 'products.store_id')
        ->whereNull('products.deleted_at')->where('products.status', 'approved')
        ->whereNull('product_variants.deleted_at')->where('product_variants.status', 1)
        ->where('product_variants.stock_quantity', '>', 0)
        ->where(fn ($q) => $q->where('product_variants.price', '>', 0)->orWhere('product_variants.special_price', '>', 0))
        ->where('stores.status', 1)->whereNull('stores.deleted_at')
        ->distinct()->pluck('products.id')->flip();

    $clean = function (?string $html): string {
        $t = html_entity_decode(strip_tags((string) $html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return trim(preg_replace('/\s+/u', ' ', $t));
    };

    $put = fn ($fh, array $row) => fputcsv($fh, $row, ',', '"', '');
    $stores = DB::table('stores')->get(['id', 'name', 'status'])->keyBy('id');
    $agg = [];
    $detail = [];
    DB::table('products')->whereNull('deleted_at')->where('status', 'approved')
        ->orderBy('id')->select(['id', 'store_id', 'name', 'slug', 'description'])
        ->chunk(2000, function ($rows) use (&$agg, &$detail, $trDesc, $visibleIds, $clean, $detailOut) {
            foreach ($rows as $p) {
                $len = mb_strlen($clean($trDesc[$p->id] ?? $p->description));
                $vis = isset($visibleIds[$p->id]);
                $a = &$agg[$p->store_id];
                $a ??= ['approved' => 0, 'empty' => 0, 'lt100' => 0, 'visible' => 0, 'visible_empty' => 0, 'visible_lt100' => 0];
                $a['approved']++;
                if ($vis) $a['visible']++;
                if ($len === 0) { $a['empty']++; if ($vis) $a['visible_empty']++; }
                elseif ($len < 100) { $a['lt100']++; if ($vis) $a['visible_lt100']++; }
                if ($detailOut && $len < 100) $detail[] = [$p->id, $p->store_id, $p->slug, $p->name, $len, $vis ? 1 : 0];
                unset($a);
            }
        });

    $fh = fopen($out, 'w');
    $put($fh, ['store_id', 'store_name', 'store_status', 'approved', 'empty_desc', 'desc_1_99_chars', 'thin_total', 'thin_pct',
        'visible', 'visible_empty', 'visible_1_99', 'visible_thin_total']);
    $tot = ['approved' => 0, 'empty' => 0, 'lt100' => 0, 'visible' => 0, 'visible_empty' => 0, 'visible_lt100' => 0];
    uasort($agg, fn ($x, $y) => ($y['empty'] + $y['lt100']) <=> ($x['empty'] + $x['lt100']));
    foreach ($agg as $sid => $a) {
        $s = $stores[$sid] ?? null;
        $thin = $a['empty'] + $a['lt100'];
        $put($fh, [$sid, $s->name ?? '?', $s->status ?? '?', $a['approved'], $a['empty'], $a['lt100'], $thin,
            $a['approved'] ? round(100 * $thin / $a['approved'], 1) : 0,
            $a['visible'], $a['visible_empty'], $a['visible_lt100'], $a['visible_empty'] + $a['visible_lt100']]);
        foreach ($tot as $k => $_) $tot[$k] += $a[$k];
    }
    $tt = $tot['empty'] + $tot['lt100'];
    $put($fh, ['TOTAL', '', '', $tot['approved'], $tot['empty'], $tot['lt100'], $tt, $tot['approved'] ? round(100 * $tt / $tot['approved'], 1) : 0,
        $tot['visible'], $tot['visible_empty'], $tot['visible_lt100'], $tot['visible_empty'] + $tot['visible_lt100']]);
    fclose($fh);
    echo "Yazildi: {$out}\n" . json_encode($tot) . "\n";

    if ($detailOut) {
        $fh = fopen($detailOut, 'w');
        $put($fh, ['product_id', 'store_id', 'slug', 'name', 'desc_len', 'visible']);
        foreach ($detail as $d) $put($fh, $d);
        fclose($fh);
        echo "Yazildi: {$detailOut} (" . count($detail) . " satir)\n";
    }
})();
