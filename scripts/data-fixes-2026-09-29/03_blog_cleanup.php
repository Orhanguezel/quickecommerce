// =====================================================================
// 03 — Blog govde temizligi (derin analiz 2026-09-29 §10)
//
//   DRY-RUN : php artisan tinker --execute="$(cat 03_blog_cleanup.php)"
//   Onizleme: OUT_DIR=/root/blogfix-preview php artisan tinker --execute="$(cat 03_blog_cleanup.php)"
//             (her yazi icin <id>-<slug>.<alan>.before.html / .after.html yazar; DB'ye dokunmaz)
//   UYGULA  : DRY=0 php artisan tinker --execute="$(cat 03_blog_cleanup.php)"
//   MIN_PRODUCTS (vars. 3): hedef kategori alt agacinda en az bu kadar satilabilir
//             urun yoksa arama linki DEGISTIRILMEZ. 01/02 uygulandiktan SONRA calistir.
//
// Govde nerede: blogs.description + translations (translatable_type =
// Modules\Blog\app\Models\Blog, key=description, language tr/df/en). tr ceviri
// base ile birebir ayni; ikisi de guncellenir.
//
// Yapilanlar:
//  a) /tr/urunler?search=<terim> ve /urunler?search=<terim> -> /tr/kategori/<slug>
//     yalniz $termMap'te acik eslesmesi olan ve MIN_PRODUCTS kosulunu gecen terimler.
//  b) Sablon bolumler: ayni H2 basligi >=3 yazida geciyor VE cumle kumesi Jaccard
//     >=0.5 ile en az 2 baska yazidaki ayni baslikli bolume benziyorsa bolum silinir
//     (baslik + bir sonraki H2/geo isaretine kadar). Beyaz liste: ic linkler ve kaynaklar.
//     Ayrica 6 yazida geo kutusundan hemen sonra gelen ikinci "Kisa cevap" paragrafi silinir.
//  c) 100-kilo-veren-adam-ahmetin-hikayesi: en uste "ornek anlatim" notu.
//  d) kosucu-dizi-nedenleri-ve-tedavisi: en uste tibbi uyari; tedavi iddiasi
//     iceren cumleler insan incelemesi icin listelenir (degistirilmez).
// Rollback: /root/fix03-blog-<ts>.json -> 00_rollback.php
// =====================================================================
(function () {
    $dry = getenv('DRY') !== '0';
    $outDir = getenv('OUT_DIR') ?: null;
    $minProducts = getenv('MIN_PRODUCTS') !== false && getenv('MIN_PRODUCTS') !== '' ? (int) getenv('MIN_PRODUCTS') : 3;
    $blogType = 'Modules\Blog\app\Models\Blog';

    // ---- a) arama terimi -> kalici kategori (yalniz net olanlar) ----
    $termMap = [
        'whey protein' => 'whey-protein',
        'isolate' => 'izole-protein',
        'kreatin' => 'kreatin',
        'protein bar' => 'protein-bar',
        'enerji jeli' => 'karbonhidrat-ve-jel',
        'egzersiz matı' => 'yoga-pilates',
        'yoga matı' => 'yoga-pilates',
        'pilates topu' => 'yoga-pilates',
        'dumbbell' => 'agirliklar-dambillar',
        'atlama ipi' => 'okul-dostu-urunler-atlama-ipleri',
        'koşu çorabı' => 'spor-corabi',
        'termos' => 'mataralar-termoslar',
        'uyku tulumu' => 'uyku-tulumlari',
        'kamp çadırı' => 'cadirlar',
        'trekking çantası' => 'sirt-cantalari',
        'fitness ekipmanı' => 'fitness-egzersiz',
        'bisiklet eldiveni' => 'bisiklet',
        'yüzücü gözlüğü' => 'yuzucu-gozlugu',
        'yüzme bonesi' => 'yuzucu-gozlugu',
        'yüzme tahtası' => 'yuzucu-gozlugu',
        'diz desteği' => 'bileklik-dizlik-koruyucular',
    ];
    // Bilincli olarak eslenmeyenler (net kategori yok): shaker, direnç bandı,
    // esneme bandı, foam roller, kafa lambası, mat, kamp ocağı, bisiklet kaskı,
    // bisiklet aydınlatma, koşu ekipmanı, spor saat, akıllı saat, koşu/yürüyüş/
    // trail/outdoor ayakkabı (spor-ayakkabi agaci kosu ayakkabisi degil).

    $boilerplateWhitelist = ['Sportoonline İç Linkleri', 'Sportoonline İç Link Önerileri', 'Güvenilir Kaynaklar', 'Kaynaklar ve Ek Okuma'];

    $noteStory = '<p><em>Not: Bu yazıdaki hikâye, genel bilgilendirme amaçlı örnek bir anlatımdır.</em></p>' . "\n";
    $noteStoryEn = '<p><em>Note: The story in this article is an illustrative example for general information.</em></p>' . "\n";
    $noteMedical = '<p><strong>Önemli not:</strong> Bu yazı yalnızca genel bilgilendirme amaçlıdır; tıbbi tanı veya tedavi yerine geçmez ve kişisel tedavi önerisi içermez. Dizinizde ağrı, şişlik ya da hareket kısıtlılığı varsa bir hekime veya fizyoterapiste başvurun.</p>' . "\n";
    $noteMedicalEn = '<p><strong>Important:</strong> This article is for general information only; it is not a medical diagnosis or treatment and does not give personal treatment advice. If you have knee pain, swelling or limited movement, consult a physician or physiotherapist.</p>' . "\n";

    // ---- satilabilir urun sayisi (API products_count ile ayni olcut) ----
    $cats = DB::table('product_category')->where('status', 1)->get(['id', 'parent_id', 'category_slug']);
    $bySlug = $cats->keyBy('category_slug');
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
        ->groupBy('products.category_id')
        ->selectRaw('products.category_id, COUNT(DISTINCT products.id) c')->pluck('c', 'category_id');
    $subtree = function (int $id) use (&$subtree, $children, $direct): int {
        $n = (int) ($direct[$id] ?? 0);
        foreach ($children[$id] ?? [] as $ch) $n += $subtree((int) $ch->id);
        return $n;
    };
    $linkTarget = [];
    echo "=== FIX 03 blog temizligi (" . ($dry ? 'DRY-RUN' : 'APPLY') . ") MIN_PRODUCTS={$minProducts} ===\n-- terim -> kategori (alt agac satilabilir urun) --\n";
    foreach ($termMap as $term => $slug) {
        $c = $bySlug[$slug] ?? null;
        $n = $c ? $subtree((int) $c->id) : 0;
        $ok = $c && $n >= $minProducts;
        if ($ok) $linkTarget[$term] = "/tr/kategori/{$slug}";
        echo '  ' . str_pad($term, 20) . ' -> ' . str_pad($slug, 34) . " {$n} " . ($ok ? 'DEGISTIR' : 'ATLA') . "\n";
    }

    // ---- b) sablon bolum tespiti ----
    $splitSections = function (string $html): array {
        $parts = preg_split('/(?=<h2[\s>])|(?=<!-- geo-)/u', $html);
        $out = [];
        foreach ($parts as $p) {
            $h = preg_match('/^<h2[^>]*>(.*?)<\/h2>/su', $p, $m) ? trim(html_entity_decode(strip_tags($m[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8')) : null;
            $out[] = ['heading' => $h, 'html' => $p];
        }
        return $out;
    };
    $sentences = function (string $html, string $title): array {
        $t = mb_strtolower(html_entity_decode(strip_tags(str_replace(['</li>', '</p>', '</td>'], ['. ', '. ', '. '], $html)), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        $t = str_replace(mb_strtolower($title), ' ', $t);
        $set = [];
        foreach (preg_split('/[.!?\n]+/u', $t) as $s) {
            $s = trim(preg_replace('/\s+/u', ' ', $s));
            if (mb_strlen($s) > 15) $set[$s] = true;
        }
        return $set;
    };
    $jaccard = function (array $a, array $b): float {
        if (!$a || !$b) return 0.0;
        $i = count(array_intersect_key($a, $b));
        return $i / (count($a) + count($b) - $i);
    };

    $blogs = DB::table('blogs')->orderBy('id')->get(['id', 'slug', 'title', 'description']);
    $index = []; // heading => [ [blogId, sentences], ... ]
    foreach ($blogs as $b) {
        foreach ($splitSections((string) $b->description) as $s) {
            if ($s['heading'] === null || in_array($s['heading'], $boilerplateWhitelist, true)) continue;
            $index[$s['heading']][] = [$b->id, $sentences($s['html'], (string) $b->title), $s['html']];
        }
    }
    $boiler = []; // blogId => [section html => heading]
    $boilerHeadings = [];
    foreach ($index as $heading => $list) {
        if (count(array_unique(array_column($list, 0))) < 3) continue;
        foreach ($list as $i => [$bid, $set, $html]) {
            $similar = 0;
            foreach ($list as $j => [$bid2, $set2]) {
                if ($i !== $j && $bid2 !== $bid && $jaccard($set, $set2) >= 0.5) $similar++;
            }
            if ($similar >= 2) {
                $boiler[$bid][$html] = $heading;
                $boilerHeadings[$heading] = ($boilerHeadings[$heading] ?? 0) + 1;
            }
        }
    }
    echo "-- sablon basliklar (kac yazidan silinecek) --\n";
    foreach ($boilerHeadings as $h => $n) echo '  ' . str_pad($h, 40) . " {$n}\n";

    // ---- donusum ----
    $transform = function (string $html, int $blogId, string $slug, string $lang, bool $isMain) use ($linkTarget, $boiler, $splitSections, $noteStory, $noteStoryEn, $noteMedical, $noteMedicalEn): array {
        $log = [];
        $new = $html;
        if ($isMain) {
            // ikinci "Kisa cevap" paragrafi
            $new = preg_replace_callback('/(<!-- geo-short-answer-end -->)\s*<p><strong>Kısa cevap:<\/strong>.*?<\/p>/su', function ($m) use (&$log) {
                $log[] = 'ikinci Kisa cevap paragrafi silindi';
                return $m[1];
            }, $new, 1);
            // sablon bolumler
            if (!empty($boiler[$blogId])) {
                $kept = [];
                foreach ($splitSections($new) as $s) {
                    if ($s['heading'] !== null && isset($boiler[$blogId][$s['html']])) { $log[] = 'sablon bolum silindi: ' . $s['heading']; continue; }
                    $kept[] = $s['html'];
                }
                $new = implode('', $kept);
            }
        }
        // arama linkleri
        $new = preg_replace_callback('/href="(?:https?:\/\/(?:www\.)?sportoonline\.com)?(?:\/tr)?\/urunler\?search=([^"&#]+)"/u', function ($m) use ($linkTarget, &$log) {
            $term = mb_strtolower(trim(rawurldecode(str_replace('+', ' ', $m[1]))));
            if (isset($linkTarget[$term])) { $log[] = "link: {$term} -> {$linkTarget[$term]}"; return 'href="' . $linkTarget[$term] . '"'; }
            $log[] = "link KORUNDU (eslesme yok/yetersiz urun): {$term}";
            return $m[0];
        }, $new);
        // notlar (idempotent)
        if ($slug === '100-kilo-veren-adam-ahmetin-hikayesi') {
            $note = $lang === 'en' ? $noteStoryEn : $noteStory;
            if (!str_contains($new, strip_tags($note))) { $new = $note . $new; $log[] = 'ornek anlatim notu eklendi'; }
        }
        if ($slug === 'kosucu-dizi-nedenleri-ve-tedavisi') {
            $note = $lang === 'en' ? $noteMedicalEn : $noteMedical;
            if (!str_contains($new, $lang === 'en' ? 'Important:</strong> This article' : 'Önemli not:</strong> Bu yazı')) { $new = $note . $new; $log[] = 'tibbi uyari eklendi'; }
        }
        return [$new, $log];
    };

    $changes = [];
    foreach ($blogs as $b) {
        $targets = [['table' => 'blogs', 'id' => (int) $b->id, 'col' => 'description', 'lang' => 'base', 'html' => (string) $b->description]];
        foreach (DB::table('translations')->where('translatable_type', $blogType)->where('translatable_id', $b->id)->where('key', 'description')->get(['id', 'language', 'value']) as $t) {
            $targets[] = ['table' => 'translations', 'id' => (int) $t->id, 'col' => 'value', 'lang' => $t->language, 'html' => (string) $t->value];
        }
        foreach ($targets as $t) {
            $isMain = in_array($t['lang'], ['base', 'tr'], true);
            [$new, $log] = $transform($t['html'], (int) $b->id, (string) $b->slug, $t['lang'], $isMain);
            $real = array_filter($log, fn ($l) => !str_starts_with($l, 'link KORUNDU'));
            echo "\n[{$b->id}] {$b->slug} ({$t['table']}#{$t['id']} {$t['lang']}) " . strlen($t['html']) . ' -> ' . strlen($new) . " bayt\n";
            foreach (array_count_values($log) as $l => $n) echo "   - {$l}" . ($n > 1 ? " x{$n}" : '') . "\n";
            if ($outDir) {
                @mkdir($outDir, 0700, true);
                $base = "{$outDir}/{$b->id}-{$b->slug}.{$t['lang']}";
                file_put_contents("{$base}.before.html", $t['html']);
                file_put_contents("{$base}.after.html", $new);
            }
            if ($new !== $t['html']) $changes[] = $t + ['new' => $new];
        }
    }

    // ---- d) tedavi iddiasi iceren cumleler (insan incelemesi) ----
    $knee = $blogs->firstWhere('slug', 'kosucu-dizi-nedenleri-ve-tedavisi');
    if ($knee) {
        echo "\n-- kosucu-dizi: tedavi/iddia iceren cumleler (DEGISTIRILMEDI, incele) --\n";
        [$kneeHtml] = $transform((string) $knee->description, (int) $knee->id, (string) $knee->slug, 'base', true);
        $kneeHtml = str_replace($noteMedical, '', $kneeHtml);
        $kneeHtml = preg_replace('/<!-- geo-priority-start -->.*$/su', '', $kneeHtml); // ic link/kaynak listesi haric
        $txt = html_entity_decode(strip_tags(str_replace(['</p>', '</li>', '</h2>', '</h3>', '</td>'], "\n", $kneeHtml)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        foreach (preg_split('/(?<=[.!?])\s+|\n+/u', $txt) as $s) {
            $s = trim(preg_replace('/\s+/u', ' ', $s));
            if (mb_strlen($s) > 20 && preg_match('/tedavi|protokol|RICE|iyileş|geçer|güçlendir|önle|azalt|hızlandır|fizyoterapi|fizik tedavi|buz|kompresyon|doktor/iu', $s)) echo "   * {$s}\n";
        }
    }

    echo "\nDegisecek kayit: " . count($changes) . "\n";
    if ($dry) { echo "DRY-RUN: DB degismedi. Uygulamak icin DRY=0.\n"; return; }

    $rollback = ['fix' => '03_blog_cleanup', 'created_at' => now()->toIso8601String(), 'rows' => []];
    foreach ($changes as $c) $rollback['rows'][] = ['table' => $c['table'], 'id' => $c['id'], 'before' => [$c['col'] => $c['html']], 'after' => [$c['col'] => $c['new']]];
    $file = '/root/fix03-blog-' . now()->format('Ymd-His') . '.json';
    file_put_contents($file, json_encode($rollback, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    echo "Rollback dosyasi: {$file}\n";
    DB::transaction(function () use ($changes) {
        foreach ($changes as $c) DB::table($c['table'])->where('id', $c['id'])->update([$c['col'] => $c['new'], 'updated_at' => now()]);
    });
    Cache::forever('public-catalog:version', (string) hrtime(true));
    echo "UYGULANDI: " . count($changes) . " kayit guncellendi. Blog sayfalari ISR/cache suresi sonunda yenilenir.\n";
})();
