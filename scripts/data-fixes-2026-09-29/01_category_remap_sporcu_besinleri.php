// =====================================================================
// 01 — Sporcu Besinleri (711) -> dogru yaprak kategori + bariz yanlis yerlesimler
// Derin analiz 2026-09-29 §6
//
// Calistirma (VPS, /var/www/quikecommerce/backend-laravel):
//   DRY-RUN (varsayilan, DB'ye yazmaz):
//     php artisan tinker < 01_category_remap_sporcu_besinleri.php
//   Ayrintili liste (her urun satiri):
//     VERBOSE=1 php artisan tinker < 01_category_remap_sporcu_besinleri.php
//   UYGULA:
//     DRY=0 php artisan tinker < 01_category_remap_sporcu_besinleri.php
//   Ek kaynak kategori (ops.): SOURCES=711,790
//
// Urun-kategori baglantisi: products.category_id (tek kolon, pivot YOK).
// Scraper'lar bu tasimayi GERI ALMAZ: sync:source-prices category_id'ye
// dokunmaz; import:products yalniz YENI urun olusturur (slug varsa atlar);
// products:backfill-missing-categories yalniz category_id IS NULL satirlara yazar.
// Rollback: /root/fix01-category-remap-<ts>.json  ->  00_rollback.php
// =====================================================================
(function () {
    $dry = getenv('DRY') !== '0';
    $verbose = getenv('VERBOSE') === '1';
    $sources = array_map('intval', array_filter(explode(',', getenv('SOURCES') ?: '711')));

    $norm = function (string $s): string {
        $s = strtr($s, ['İ' => 'i', 'I' => 'i', 'ı' => 'i', 'Ş' => 's', 'ş' => 's', 'Ğ' => 'g', 'ğ' => 'g',
            'Ü' => 'u', 'ü' => 'u', 'Ö' => 'o', 'ö' => 'o', 'Ç' => 'c', 'ç' => 'c', 'Â' => 'a', 'â' => 'a', '’' => "'"]);
        $s = strtolower($s);
        return preg_replace('/\s+/', ' ', $s);
    };
    // Marka adinda "protein"/"pump" gecen ureticiler kural eslesmesini bozmasin.
    $stripBrands = fn (string $n): string => preg_replace('/\b(protein ?oc(ea)?n|proteinmax|protein7|muscle ?pump|bigjoy vitamins)\b/', ' ', $n);
    $maxGrams = function (string $n): int {
        $max = 0;
        if (preg_match_all('/(\d+(?:[.,]\d+)?)\s*(kg|gr|gram|g)\b/', $n, $m, PREG_SET_ORDER)) {
            foreach ($m as $x) {
                $v = (float) str_replace(',', '.', $x[1]);
                $g = $x[2] === 'kg' ? $v * 1000 : $v;
                $max = max($max, (int) $g);
            }
        }
        return $max;
    };

    // --- 1) Bariz yanlis yerlesimler (ilk eslesen kazanir, aile kontrolu yok) ---
    $misplaced = [
        ['water_bottle', 'mataralar-termoslar', '/\b(matara|suluk|su sisesi|termos|water bottle)\b/', '/shaker|karistirici/'],
        ['yoga_pilates', 'yoga-pilates', '/\b(yoga|pilates)\b|egzersiz minderi/', null],
        ['kids_vitamin', 'vitaminler', '/\b(kids|cocuk|cocuklar|junior)\b/', null, '/vitamin|gummies|omega|d3|surup|multivit|magnez/'],
        ['diaper_rash', 'bebek-bakimi-kk', '/pisik|bebek bezi|biberon|emzik/', null],
        ['personal_care', 'kisisel-bakim', '/\bsac (yagi|serumu|bakim|kremi|fircasi|tonigi|maskesi)|sampuan|deodorant|roll ?on|\bparfum|\bsabun|losyon|lip balm|dudak koruyucu|epilasyon|\bagda\b|\btiras\b|cimbiz|prezervatif|\bkese\b|peeling|cilt bakim|tup krem|el kremi|dis macunu|\blip\b|\bspf ?\d|\bkremi?\b|\bserumu?\b|\bmaske(si)?\b/', null],
    ];

    // --- 2) Takviye aileleri (hepsi degerlendirilir; >1 aile = belirsiz, atlanir) ---
    // [kural, hedef slug, aile, include regex, exclude regex|null, ekstra kosul closure|null]
    $rules = [
        ['protein_bar', 'protein-bar', 'bar', '/\bbar\b/', null, fn ($n) => (bool) preg_match('/protein/', $n)],
        ['protein_snack', 'proteinli-atistirmaliklar', 'snack', '/\bprotein(li)? (cookie|pancake|pankek|puding|cips|chips|gofret|wafer|waffle|crisp)/', null, null],
        ['gainer', 'kilo', 'gainer', '/gainer|\bmass\b|kilo aldirici/', null, null],
        ['casein', 'kazein-sut-proteini', 'protein', '/kazein|casein/', null, null],
        ['isolate', 'izole-protein', 'protein', '/\b(izole|isolate|iso whey|isowhey)\b/', null, null],
        ['egg_white', 'yumurta-aki-proteini', 'protein', '/egg white|yumurta aki/', null, null],
        ['plant_protein', 'bitkisel-protein', 'protein', '/(vegan|bitkisel|plant|bezelye|pea|soya|soy)\W{0,3}protein/', null, null],
        ['beef_protein', 'et-proteini', 'protein', '/beef protein|et proteini/', null, null],
        ['whey', 'whey-protein', 'protein', '/\bwhey\b/', '/whey amino/', null],
        ['protein_powder', 'protein-tozu', 'protein', '/protein (tozu|powder)/', null, null],
        ['protein_generic_400g', 'proteinler', 'protein', '/\bprotein\b/', '/\b(tablet|kapsul|capsule|shot|ampul)\b/', fn ($n, $g) => $g >= 400],
        ['creatine_micronized', 'mikronize', 'kreatin', '/(kreatin|creatin).*mikroni[sz]|mikroni[sz].*(kreatin|creatin)/', null, null],
        ['creatine_mono', 'kreatin-monohidrat', 'kreatin', '/(kreatin|creatin).*monohi?dra|creapure/', null, null],
        ['creatine', 'kreatin', 'kreatin', '/kreatin|creatin|kre-?alkalyn/', null, null],
        ['bcaa', 'bcaa', 'bcaa', '/\bbcaa/', null, null],
        ['glutamine', 'glutamin', 'glutamin', '/glutamin/', null, null],
        ['eaa', 'eaa-esansiyel-amino-asit', 'eaa', '/\beaa\b/', null, null],
        ['arginine', 'arjinin', 'arjinin', '/arjinin|arginin|\baakg\b/', null, null],
        ['amino_complex', 'kompleks-amino-asit', 'amino', '/whey amino|amino (tablet|kapsul|asit)|amino 2222|amino 1900/', null, null],
        ['citrulline', 'sitrulin', 'sitrulin', '/citrullin|sitrulin/', null, null],
        ['beta_alanine', 'beta-alanin', 'betaalanin', '/beta[- ]?alanin/', null, null],
        ['tribulus', 'tribulus', 'tribulus', '/tribulus/', null, null],
        ['preworkout', 'guc-ve-performans', 'preworkout', '/pre[- ]?workout|preworkout/', null, null],
        ['carnitine_liquid', 'sivi-karnitin-l-carnitine', 'karnitin', '/karnitin|carnitin|carnitime/', null, fn ($n) => (bool) preg_match('/\b(shot|ampul|ml|likit|liquid|sivi|tup)\b/', $n)],
        ['carnitine', 'karnitin-l-carnitine', 'karnitin', '/karnitin|carnitin|carnitime/', null, null],
        ['cla', 'cla', 'cla', '/\bcla\b/', null, null],
        ['thermogenic', 'termojenik', 'termo', '/thermo|termojenik|fat burner|yag yakici/', null, null],
        ['zma', 'zma-mineraller', 'zma', '/\bzma\b/', null, null],
        ['magnesium', 'magnezyum', 'magnezyum', '/magnez|magnesium/', null, null],
        ['omega3', 'omega-3-balik-yaglari', 'omega', '/omega|balik yagi|fish oil|krill/', null, null],
        ['joint', 'glukozamin-eklem', 'eklem', '/glukozamin|glucosamine|kondroitin|chondroitin|\bmsm\b|artroflex/', null, null],
        ['collagen', 'kolajen', 'kolajen', '/kolajen|collagen/', null, null],
        ['multivitamin', 'kompleks-vitaminler', 'vitamin', '/multi ?-?vitamin|opti-?men|opti-?women|multivit/', null, null],
        ['vitamin', 'vitaminler', 'vitamin', '/vitamin|\bd3\b|\bb12\b|\bk2\b|biotin|folik|\bb complex|\bester c\b/', null, null],
        ['mineral', 'zma-mineraller', 'mineral', '/\b(cinko|zinc|selenyum|selenium|kalsiyum|calcium|potasyum|potassium|krom|chromium)\b/', null, null],
        ['probiotic', 'probiyotik-sindirim', 'probiyotik', '/probiyotik|probiotic/', null, null],
        ['q10', 'antioksidan', 'q10', '/q10|koenzim|coenzyme/', null, null],
        ['energy_gel', 'karbonhidrat-ve-jel', 'jel', '/\b(jel|gel)\b/', '/dus|sac|yuz|temizle|el jeli|masaj|kas jeli|isitici|soguk|kapsul|softjel|jel kapsul/', null],
        ['carb_powder', 'kompleks-karbonhidrat-tozu', 'karb', '/maltodekstrin|maltodextrin|vitargo|cluster dextrin|karbonhidrat tozu|cream of rice|dekstroz|dextrose|\bcarbo/', null, null],
        ['electrolyte', 'elektrolitler', 'elektrolit', '/elektrolit|electrolyte|izotonik|isotonic/', null, null],
        ['nut_butter', 'fistik-ezmesi', 'ezme', '/(fistik|badem|findik|kaju) ezmesi|peanut butter/', null, null],
        ['rice_cake', 'karabugday-ve-pirinc-patlagi', 'patlak', '/(pirinc|karabugday|misir) patlagi|rice cake/', null, null],
    ];
    // Birlikte gorulmesi normal olan aile ciftleri -> kazanan aile
    $allowedCombos = [
        'bcaa+glutamin' => 'bcaa',
        'karnitin+termo' => 'karnitin',
        'bar+protein' => 'bar',
        'magnezyum+mineral' => 'magnezyum',
        'mineral+zma' => 'zma',
        'mineral+vitamin' => 'vitamin',
        'elektrolit+jel' => 'jel',
        'gainer+karb' => 'gainer',
        'elektrolit+karb' => 'elektrolit',
    ];
    // Takviye olmayan aksesuar/giyim: takviye kurallarina hic girmez (raporlanir)
    $accessory = '/shaker|karistirici|tisort|t-shirt|esofman|havlu|canta|bileklik|eldiven|straps|kemer|bandana|\bsort\b|atlet|sweatshirt|corap|sapka|bardak|anahtarlik|hap kutusu|pill box|funnel|huni/';

    // Hedef slug -> id (aktif olmali)
    $cats = DB::table('product_category')->get(['id', 'category_slug', 'category_name', 'status'])->keyBy('category_slug');
    $catNames = DB::table('product_category')->pluck('category_name')->map(fn ($x) => $norm((string) $x))->flip();
    $targets = [];
    foreach (array_merge(array_column($misplaced, 1), array_column($rules, 1)) as $slug) {
        $c = $cats[$slug] ?? null;
        if (!$c || (int) $c->status !== 1) {
            throw new RuntimeException("Hedef kategori yok/pasif: {$slug}");
        }
        $targets[$slug] = (int) $c->id;
    }

    $products = DB::table('products as p')
        ->leftJoin('stores as s', 's.id', '=', 'p.store_id')
        ->whereNull('p.deleted_at')
        ->whereIn('p.category_id', $sources)
        ->selectRaw('p.id, p.category_id, p.name, p.status, s.name as store, s.status as store_status,
            (select count(*) from product_variants v where v.product_id = p.id and v.deleted_at is null
              and v.status = 1 and v.stock_quantity > 0) as instock')
        ->orderBy('p.id')->get();

    $moves = [];
    $stats = ['total' => $products->count(), 'moved' => 0, 'moved_visible' => 0, 'ambiguous' => 0,
        'accessory_skipped' => 0, 'placeholder_skipped' => 0, 'no_match' => 0];
    $byRule = [];
    $ambiguous = [];
    $accessories = [];
    $placeholders = [];
    $noMatch = [];

    foreach ($products as $p) {
        $n = $norm((string) $p->name);
        $visible = $p->status === 'approved' && (int) $p->store_status === 1 && (int) $p->instock > 0;

        // Kategori adiyla birebir ayni "urun" adlari (ornek: "Kazein Protein",
        // "Glukozamin ve Eklem") kaynak sitenin kategori sayfasindan uretilmis
        // sahte kayitlardir; tasinmaz, ayri raporlanir.
        // Ayni tur: rakamsiz, stoksuz, en fazla 4 kelimelik ad ("Termojenik Urunler",
        // "EPILASYON, AGDA, TRAS"). Gorunmez oldugu icin tasimanin faydasi yok.
        $looksPlaceholder = isset($catNames[$n])
            || (!preg_match('/\d/', $n) && (int) $p->instock === 0 && str_word_count($n) <= 4);
        if ($looksPlaceholder) {
            $stats['placeholder_skipped']++;
            $placeholders[] = $p;
            continue;
        }

        $hit = null;
        foreach ($misplaced as $m) {
            [$rule, $slug, $inc, $exc] = $m;
            $extra = $m[4] ?? null;
            if (preg_match($inc, $n) && (!$exc || !preg_match($exc, $n)) && (!$extra || preg_match($extra, $n))) {
                $hit = [$rule, $slug];
                break;
            }
        }

        if (!$hit) {
            if (preg_match($accessory, $n)) {
                $stats['accessory_skipped']++;
                $accessories[] = $p;
                continue;
            }
            $s = $stripBrands($n);
            $g = $maxGrams($s);
            $matched = [];
            foreach ($rules as [$rule, $slug, $family, $inc, $exc, $extra]) {
                if (!preg_match($inc, $s)) continue;
                if ($exc && preg_match($exc, $s)) continue;
                if ($extra && !$extra($s, $g)) continue;
                $matched[$family] ??= [$rule, $slug];
            }
            if (count($matched) === 1) {
                $hit = reset($matched);
            } elseif (count($matched) > 1) {
                $fams = array_keys($matched);
                sort($fams);
                $key = implode('+', $fams);
                if (isset($allowedCombos[$key])) {
                    $hit = $matched[$allowedCombos[$key]];
                } else {
                    $stats['ambiguous']++;
                    $ambiguous[] = [$p, $key];
                    continue;
                }
            }
        }

        if (!$hit) {
            $stats['no_match']++;
            $noMatch[] = $p;
            continue;
        }

        [$rule, $slug] = $hit;
        $to = $targets[$slug];
        if ($to === (int) $p->category_id) continue;
        $moves[] = ['id' => (int) $p->id, 'from' => (int) $p->category_id, 'to' => $to, 'rule' => $rule, 'slug' => $slug, 'name' => $p->name, 'visible' => $visible];
        $stats['moved']++;
        if ($visible) $stats['moved_visible']++;
        $byRule[$rule . ' -> ' . $slug] ??= [0, 0];
        $byRule[$rule . ' -> ' . $slug][0]++;
        if ($visible) $byRule[$rule . ' -> ' . $slug][1]++;
    }

    echo "=== FIX 01 kategori yeniden eslestirme (" . ($dry ? 'DRY-RUN' : 'APPLY') . ") kaynak=" . implode(',', $sources) . " ===\n";
    foreach ($stats as $k => $v) echo str_pad($k, 22) . ": {$v}\n";
    echo "\n-- kural -> hedef : tasinacak (gorunur/stoklu) --\n";
    ksort($byRule);
    foreach ($byRule as $k => [$a, $b]) echo str_pad($k, 60) . " {$a} ({$b})\n";

    if ($verbose) {
        echo "\n-- MOVE satirlari --\n";
        foreach ($moves as $m) echo "MOVE\t{$m['id']}\t{$m['from']}\t{$m['to']}\t{$m['rule']}\t" . ($m['visible'] ? 'V' : '-') . "\t{$m['name']}\n";
        echo "\n-- BELIRSIZ (birden fazla aile, tasinmadi) --\n";
        foreach ($ambiguous as [$p, $k]) echo "AMBIG\t{$p->id}\t{$k}\t{$p->name}\n";
        echo "\n-- AKSESUAR/GIYIM (tasinmadi) --\n";
        foreach ($accessories as $p) echo "ACC\t{$p->id}\t{$p->name}\n";
        echo "\n-- KATEGORI ADI TASIYAN SAHTE URUN (tasinmadi) --\n";
        foreach ($placeholders as $p) echo "PLACEHOLDER\t{$p->id}\t{$p->status}\tinstock={$p->instock}\t{$p->name}\n";
        echo "\n-- ESLESMEYEN (711'de kalir) --\n";
        foreach ($noMatch as $p) echo "NOMATCH\t{$p->id}\t{$p->name}\n";
    }

    if ($dry) {
        echo "\nDRY-RUN: DB degismedi. Uygulamak icin DRY=0.\n";
        return;
    }

    $rollback = ['fix' => '01_category_remap_sporcu_besinleri', 'created_at' => now()->toIso8601String(), 'rows' => []];
    foreach ($moves as $m) {
        $rollback['rows'][] = ['table' => 'products', 'id' => $m['id'], 'before' => ['category_id' => $m['from']], 'after' => ['category_id' => $m['to']]];
    }
    $file = '/root/fix01-category-remap-' . now()->format('Ymd-His') . '.json';
    file_put_contents($file, json_encode($rollback, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    echo "Rollback dosyasi: {$file}\n";

    DB::transaction(function () use ($moves) {
        foreach (collect($moves)->groupBy('to') as $to => $items) {
            foreach ($items->pluck('id')->chunk(500) as $chunk) {
                DB::table('products')->whereIn('id', $chunk->all())->update(['category_id' => (int) $to, 'updated_at' => now()]);
            }
        }
    });
    Cache::forever('public-catalog:version', (string) hrtime(true));
    echo "UYGULANDI: " . count($moves) . " urun tasindi, public-catalog cache surumu yenilendi.\n";
})();
