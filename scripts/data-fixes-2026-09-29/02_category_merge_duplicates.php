// =====================================================================
// 02 — Kopya/cop kategori birlestirme + acik id'li yanlis yerlesimler
// Derin analiz 2026-09-29 §6
//
//   DRY-RUN : php artisan tinker --execute="$(cat 02_category_merge_duplicates.php)"
//   Ayrinti : VERBOSE=1 php artisan tinker --execute="$(cat 02_category_merge_duplicates.php)"
//   UYGULA  : DRY=0 php artisan tinker --execute="$(cat 02_category_merge_duplicates.php)"
//
// ONKOSUL (kod, bu betik YAPMAZ):
//   1) customer-web-nextjs/next.config.ts redirects() icine README'deki 301
//      satirlari eklenip deploy edilmeli. status=0 kategori /product-category/list
//      (all=true) cevabindan duser; findLegacyCategory() yalniz slug
//      normalizasyonu yaptigi icin "tek-kullanim" -> baska slug eslemesi YAPAMAZ,
//      eski URL 404 olur.
//   2) backend-laravel/config/source_category_mappings.php: 'eprotein'
//      fallback_category_id 1088 -> 367 yapilmali. Yapilmazsa sonraki
//      eprotein import'u "pasif hedef" hatasiyla durur (SourceCategoryMapper).
//
// Karar ozeti:
//   - tek-kullanim(732) + tek-kullanimliklar(734): ikisi de nav disi kok, toplam
//     6 Muscle Pump tek-servis urun. Hayatta kalan secmek yerine urunler gercek
//     yapraklara (whey/sivi karnitin/guc-ve-performans) tasinir, IKISI de kapanir.
//   - spor-outdoor(1088): icerigi outdoor DEGIL fitness (dambil, yoga mati, direnc
//     bandi). outdoor-kamp'a birlestirmek yanlis olurdu; urunler fitness-egzersiz
//     alt agacina dagitilir, 1088 kapanir, 301 -> /kategori/fitness-egzersiz.
//   - spor-aletleri(801) KALIR (fitness-egzersiz cocugu, display_order=2, 697
//     Ceysport urunu). Asil kopyalari: diger-ekipmanlar(686) + spor-ekipmani(697),
//     12 Everlast boks urunu -> boks yapraklari; 686/697 kapanir.
//   - yoga-pilates(375) icindeki 4 tatami + 1 duvar minderi -> spor-aletleri
//     (diger 17 tatami orada), 1 uyku tulumu -> uyku-tulumlari.
// Rollback: /root/fix02-category-merge-<ts>.json -> 00_rollback.php
// =====================================================================
(function () {
    $dry = getenv('DRY') !== '0';
    $verbose = getenv('VERBOSE') === '1';

    $cats = DB::table('product_category')->get(['id', 'category_slug', 'status', 'parent_id'])->keyBy('category_slug');
    $id = function (string $slug) use ($cats): int {
        $c = $cats[$slug] ?? null;
        if (!$c || (int) $c->status !== 1) throw new RuntimeException("Hedef kategori yok/pasif: {$slug}");
        return (int) $c->id;
    };

    // --- A) Acik id -> hedef slug ---
    $explicit = [
        // tek-kullanim (732)
        3292 => 'whey-protein', 3406 => 'whey-protein',
        // tek-kullanimliklar (734)
        3302 => 'sivi-karnitin-l-carnitine', 3303 => 'sivi-karnitin-l-carnitine',
        3330 => 'guc-ve-performans', 3333 => 'guc-ve-performans',
        // diger-ekipmanlar (686) / spor-ekipmani (697)
        1773 => 'spor-aletleri',            // el yayi
        1830 => 'dovus-sporlari', 1831 => 'dovus-sporlari', 1875 => 'dovus-sporlari',
        1876 => 'dovus-sporlari', 1877 => 'dovus-sporlari', 1878 => 'dovus-sporlari', // dislik
        1879 => 'lapa', 2015 => 'lapa',     // lapa / core paddle
        2026 => 'bandaj',                   // el sargisi
        1833 => 'boks-torbasi',
        2033 => 'okul-dostu-urunler-atlama-ipleri',
        // yoga-pilates (375) yanlis yerlesim
        6404 => 'spor-aletleri', 6405 => 'spor-aletleri', 6406 => 'spor-aletleri',
        15505 => 'spor-aletleri', 15507 => 'spor-aletleri',
        195 => 'uyku-tulumlari',
    ];
    // Beklenen kaynak kategori (baska yere tasinmis/degismisse atla)
    $expectedFrom = [3292 => 732, 3406 => 732, 3302 => 734, 3303 => 734, 3330 => 734, 3333 => 734,
        1773 => 686, 1830 => 686, 1831 => 686, 1875 => 686, 1876 => 686, 1877 => 686, 1878 => 686,
        1879 => 686, 2015 => 686, 2026 => 686, 2033 => 686, 1833 => 697,
        6404 => 375, 6405 => 375, 6406 => 375, 15505 => 375, 15507 => 375, 195 => 375];

    // --- B) spor-outdoor (1088) kural tabanli dagitim ---
    $norm = fn (string $s): string => strtolower(strtr($s, ['İ' => 'i', 'I' => 'i', 'ı' => 'i', 'Ş' => 's', 'ş' => 's',
        'Ğ' => 'g', 'ğ' => 'g', 'Ü' => 'u', 'ü' => 'u', 'Ö' => 'o', 'ö' => 'o', 'Ç' => 'c', 'ç' => 'c']));
    $rules1088 = [
        ['cardio', 'kardiyo-ekipmanlari', '/spin bike|kosu bandi|eliptik|kondisyon bisiklet/'],
        ['bike_glove', 'bisiklet', '/bisiklet eldiven/'],
        ['yoga_pilates', 'yoga-pilates', '/yoga|pilates|aerobik/'],
        ['weights', 'agirliklar-dambillar', '/dambil|barbell|halter|plaka|z bar|olimpik bar|bilek agirligi|agirlik seti/'],
        ['crossfit', 'crossfit', '/crossfit|crosfit|bungee|hurdle/'],
        ['bottle', 'mataralar-termoslar', '/\bsuluk\b|matara/'],
        ['towel', 'havlu', '/havlu/'],
        ['apparel', 'giyim', '/tisort|t-shirt|atlet|esofman|sweat|rag ?top/'],
    ];
    $fallback1088 = 'fitness-egzersiz';

    $losers = ['tek-kullanim', 'tek-kullanimliklar', 'diger-ekipmanlar', 'spor-ekipmani', 'spor-outdoor'];

    $moves = [];
    $skipped = [];
    $rows = DB::table('products')->whereIn('id', array_keys($explicit))->whereNull('deleted_at')->get(['id', 'category_id', 'name'])->keyBy('id');
    foreach ($explicit as $pid => $slug) {
        $p = $rows[$pid] ?? null;
        if (!$p) { $skipped[] = "{$pid}: bulunamadi/silinmis"; continue; }
        if ((int) $p->category_id !== $expectedFrom[$pid]) { $skipped[] = "{$pid}: kategori {$p->category_id} (beklenen {$expectedFrom[$pid]}) — atlandi"; continue; }
        $moves[] = ['id' => $pid, 'from' => (int) $p->category_id, 'to' => $id($slug), 'rule' => 'explicit', 'slug' => $slug, 'name' => $p->name];
    }
    $outdoorId = (int) ($cats['spor-outdoor']->id ?? 0);
    foreach (DB::table('products')->where('category_id', $outdoorId)->whereNull('deleted_at')->orderBy('id')->get(['id', 'category_id', 'name']) as $p) {
        $n = $norm((string) $p->name);
        $slug = $fallback1088;
        $rule = 'fallback';
        foreach ($rules1088 as [$r, $s, $re]) {
            if (preg_match($re, $n)) { $slug = $s; $rule = $r; break; }
        }
        $moves[] = ['id' => (int) $p->id, 'from' => $outdoorId, 'to' => $id($slug), 'rule' => "1088:{$rule}", 'slug' => $slug, 'name' => $p->name];
    }

    // Kapanacak kategorilerde tasima sonrasi urun/cocuk kalmamali
    $movedIds = array_column($moves, 'id');
    $catChanges = [];
    foreach ($losers as $slug) {
        $c = $cats[$slug] ?? null;
        if (!$c) { echo "UYARI: {$slug} yok\n"; continue; }
        $left = DB::table('products')->where('category_id', $c->id)->whereNull('deleted_at')->whereNotIn('id', $movedIds ?: [0])->count();
        $kids = DB::table('product_category')->where('parent_id', $c->id)->where('status', 1)->count();
        $catChanges[] = ['id' => (int) $c->id, 'slug' => $slug, 'status_before' => (int) $c->status, 'left' => $left, 'kids' => $kids];
    }

    echo "=== FIX 02 kategori birlestirme (" . ($dry ? 'DRY-RUN' : 'APPLY') . ") ===\n";
    echo "Tasinacak urun: " . count($moves) . "\n";
    foreach (collect($moves)->groupBy(fn ($m) => $m['rule'] . ' -> ' . $m['slug'])->sortKeys() as $k => $g) echo '  ' . str_pad($k, 55) . ' ' . $g->count() . "\n";
    echo "Kapanacak kategoriler:\n";
    foreach ($catChanges as $c) echo "  [{$c['id']}] {$c['slug']} status={$c['status_before']} -> 0 | tasima sonrasi kalan urun={$c['left']} aktif cocuk={$c['kids']}\n";
    if ($skipped) { echo "Atlanan:\n"; foreach ($skipped as $s) echo "  {$s}\n"; }
    if ($verbose) foreach ($moves as $m) echo "MOVE\t{$m['id']}\t{$m['from']}\t{$m['to']}\t{$m['rule']}\t{$m['name']}\n";

    $blocking = array_filter($catChanges, fn ($c) => $c['left'] > 0 || $c['kids'] > 0);
    if ($blocking) {
        echo "DURDU: kapanacak kategoride urun/cocuk kaliyor. Once incele.\n";
        return;
    }
    if ($dry) { echo "DRY-RUN: DB degismedi. Uygulamak icin DRY=0.\n"; return; }

    $rollback = ['fix' => '02_category_merge_duplicates', 'created_at' => now()->toIso8601String(), 'rows' => []];
    foreach ($moves as $m) $rollback['rows'][] = ['table' => 'products', 'id' => $m['id'], 'before' => ['category_id' => $m['from']], 'after' => ['category_id' => $m['to']]];
    foreach ($catChanges as $c) $rollback['rows'][] = ['table' => 'product_category', 'id' => $c['id'], 'before' => ['status' => $c['status_before']], 'after' => ['status' => 0]];
    $file = '/root/fix02-category-merge-' . now()->format('Ymd-His') . '.json';
    file_put_contents($file, json_encode($rollback, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    echo "Rollback dosyasi: {$file}\n";

    DB::transaction(function () use ($moves, $catChanges) {
        foreach (collect($moves)->groupBy('to') as $to => $items) {
            DB::table('products')->whereIn('id', $items->pluck('id')->all())->update(['category_id' => (int) $to, 'updated_at' => now()]);
        }
        DB::table('product_category')->whereIn('id', array_column($catChanges, 'id'))->update(['status' => 0, 'updated_at' => now()]);
    });
    Cache::forever('public-catalog:version', (string) hrtime(true));
    echo "UYGULANDI: " . count($moves) . " urun tasindi, " . count($catChanges) . " kategori status=0.\n";
})();
