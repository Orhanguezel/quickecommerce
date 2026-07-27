<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Product;
use App\Models\ProductBrand;
use App\Models\ProductCategory;
use App\Models\SearchLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * GET /api/v1/search/popular?limit=10
     * Son 7 gunun en sik aranan term'leri. Cache::remember 1 saat TTL.
     */
    public function popular(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 10);
        $limit = max(1, min($limit, 50));

        $cacheKey = "search_popular:limit={$limit}";
        $terms = Cache::remember($cacheKey, now()->addHour(), function () use ($limit) {
            return DB::table('search_logs')
                ->select('term', DB::raw('COUNT(*) as cnt'))
                ->where('created_at', '>=', now()->subDays(7))
                ->where('results_count', '>', 0) // 0 sonuçlu aramaları populer'a alma
                ->groupBy('term')
                ->orderByDesc('cnt')
                ->limit($limit)
                ->pluck('term')
                ->all();
        });

        return response()->json([
            'data' => $terms,
            'cached_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * POST /api/v1/search/track
     * Body: {term, results_count, clicked_product_id?}
     * KVKK: ip sha256+salt ile hash, raw IP saklanmaz.
     */
    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'term' => 'required|string|min:1|max:191',
            'results_count' => 'nullable|integer|min:0',
            'clicked_product_id' => 'nullable|integer|exists:products,id',
        ]);

        $term = trim($validated['term']);
        if ($term === '') {
            return response()->json(['ok' => false], 400);
        }

        $ip = $request->ip();
        $salt = config('app.key', 'fallback-salt');
        $ipHash = hash('sha256', $ip . '|' . $salt);

        SearchLog::create([
            'term' => mb_strtolower($term, 'UTF-8'),
            'user_id' => $request->user()?->id,
            'locale' => $request->header('X-localization', 'tr'),
            'results_count' => $validated['results_count'] ?? 0,
            'clicked_product_id' => $validated['clicked_product_id'] ?? null,
            'ip_hash' => $ipHash,
            'created_at' => now(),
        ]);

        return response()->json(['ok' => true]);
    }

    /**
     * GET /api/v1/search/suggest?q={term}&limit=10
     * Type-ahead autocomplete: terms (kelime tamamlama) + products + categories + brands.
     */
    public function suggest(Request $request): JsonResponse
    {
        $q = trim((string) $request->input('q', ''));
        $limit = (int) $request->input('limit', 10);
        $limit = max(1, min($limit, 20));

        if (mb_strlen($q) < 2) {
            return response()->json([
                'terms' => [],
                'products' => [],
                'categories' => [],
                'brands' => [],
            ]);
        }

        $cacheKey = 'search_suggest:v2:' . md5(mb_strtolower($q, 'UTF-8') . "|{$limit}");
        $payload = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($q, $limit) {
            $like = '%' . $q . '%';
            // Cok kelimeli sorgu: "whey izole cikolata" -> her token AND'lenir.
            // Tek LIKE '%whole query%' bitisik olmayan eslesmeleri kaciriyordu.
            $tokens = collect(preg_split('/\s+/u', $q, -1, PREG_SPLIT_NO_EMPTY))
                ->filter(fn ($t) => mb_strlen($t) >= 2)
                ->take(5)
                ->values()
                ->all();
            if (empty($tokens)) {
                $tokens = [$q];
            }

            $applyTokens = function ($query, string $column) use ($tokens) {
                foreach ($tokens as $token) {
                    $query->where($column, 'like', '%' . $token . '%');
                }

                return $query;
            };

            // Prefix eslesmesi > kelime basi eslesmesi > govdede eslesme
            $prefixOrder = "CASE WHEN name LIKE ? THEN 0 WHEN name LIKE ? THEN 1 ELSE 2 END";
            $prefixBindings = [$q . '%', '% ' . $q . '%'];

            $products = $applyTokens(Product::publiclySellable(), 'name')
                ->select('id', 'name', 'slug', 'image')
                ->orderByRaw($prefixOrder, $prefixBindings)
                ->orderBy('order_count', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'name' => $p->name,
                        'slug' => $p->slug,
                        'image_url' => $p->image ? \App\Actions\ImageModifier::generateImageUrl($p->image) : null,
                    ];
                });

            // Kelime tamamlama havuzu: eslesen urun adlarindan n-gram cikarilir.
            $namePool = $applyTokens(Product::publiclySellable(), 'name')
                ->orderByRaw($prefixOrder, $prefixBindings)
                ->orderBy('order_count', 'desc')
                ->limit(150)
                ->pluck('name')
                ->all();
            $terms = $this->buildTermSuggestions($namePool, $q, 8);

            $categories = ProductCategory::where('category_name', 'like', $like)
                ->whereNotIn('id', function ($q) {
                    // 'Diger (Arsiv)' altindaki kategoriler harict
                    $q->select('id')->from('product_category')->where('category_slug', 'diger-arsiv');
                })
                // Bos kategori onerilmez: en az 1 publicly sellable urun olmali
                // (frontend isDisplayableProductCategory ile uyumlu)
                ->whereExists(function ($exists) {
                    $exists->select(DB::raw(1))
                        ->from('products')
                        ->whereColumn('products.category_id', 'product_category.id')
                        ->whereNull('products.deleted_at')
                        ->where('products.status', 'approved')
                        ->whereNotNull('products.image')
                        ->where('products.image', '!=', '')
                        ->whereExists(function ($variant) {
                            $variant->select(DB::raw(1))
                                ->from('product_variants')
                                ->whereColumn('product_variants.product_id', 'products.id')
                                ->where('product_variants.status', 1)
                                ->where('product_variants.stock_quantity', '>', 0)
                                ->whereNull('product_variants.deleted_at')
                                ->where(function ($price) {
                                    $price->where('product_variants.price', '>', 0)
                                        ->orWhere('product_variants.special_price', '>', 0);
                                });
                        });
                })
                ->select('id', 'category_name', 'category_slug')
                ->limit(3)
                ->get();

            // NOT: products.brand_id tabloda hic doldurulmuyor (2026-07: 0 kayit).
            // brand_id join'i marka onerilerini her zaman bos donduruyordu; marka adi
            // urun adinin basinda geciyor mu diye bakiyoruz (isim bazli eslesme).
            $brands = ProductBrand::where('brand_name', 'like', $like)
                ->where('status', 1)
                ->whereExists(function ($exists) {
                    $exists->select(DB::raw(1))
                        ->from('products')
                        ->whereRaw("products.name LIKE CONCAT(product_brand.brand_name, '%')")
                        ->whereNull('products.deleted_at')
                        ->where('products.status', 'approved')
                        ->whereNotNull('products.image')
                        ->where('products.image', '!=', '');
                })
                ->select('id', 'brand_name as name', 'brand_slug as slug')
                ->orderByRaw('CHAR_LENGTH(brand_name) asc')
                ->limit(12)
                ->get()
                // Ayni marka adi birden fazla kayitta olabiliyor (or. 4x "Multipower")
                ->unique(fn ($b) => mb_strtolower($b->name, 'UTF-8'))
                ->take(3)
                ->values();

            return [
                'terms' => $terms,
                'products' => $products,
                'categories' => $categories,
                'brands' => $brands,
            ];
        });

        return response()->json($payload);
    }

    /**
     * Urun adlarindan "kelime tamamlama" onerileri uretir.
     * "prot" -> "protein tozu", "protein bar" gibi arama terimleri.
     * Sorgunun son kelimesi ile baslayan kelimeyi bulur, ardindan 1-2 kelime daha alir.
     */
    private function buildTermSuggestions(array $names, string $q, int $limit): array
    {
        $qFolded = $this->foldTr($q);
        $qTokens = preg_split('/\s+/u', $qFolded, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        if (empty($qTokens)) {
            return [];
        }
        $lastToken = (string) end($qTokens);
        // Sorgunun son kelimesinden onceki kelimeler ("kosu ban" -> ["kosu"])
        $headTokens = array_slice($qTokens, 0, count($qTokens) - 1);

        // Tek basina anlamsiz kuyruklar (birim/miktar) oneriye girmesin
        $stop = ['gr', 'gram', 'kg', 'ml', 'lt', 'adet', 'ad', 'cm', 'mm', 'x', 've', 'ile'];

        $counts = [];
        $display = [];
        $selfContained = [];

        foreach ($names as $index => $name) {
            // Havuz zaten alaka sirali geliyor (prefix eslesme > order_count).
            // Bastaki isimler oneriye daha cok agirlik katsin.
            $weight = 1 / (1 + intdiv((int) $index, 25));

            $words = preg_split('/\s+/u', (string) $name, -1, PREG_SPLIT_NO_EMPTY) ?: [];
            $folded = array_map(fn ($w) => $this->foldTr($w), $words);

            foreach ($folded as $i => $word) {
                // "dips-barfiks" gibi tireli kelimelerde alt parcalari da dene
                $starts = str_starts_with($word, $lastToken)
                    || collect(explode('-', $word))->contains(fn ($part) => $part !== '' && str_starts_with($part, $lastToken));
                if (!$starts) {
                    continue;
                }

                // Sorgunun onceki kelimeleri urun adinda da hemen once geciyorsa,
                // oneriyi oradan baslat — "kosu ban" icin urunun kendi yazimi
                // ("Koşu Bandı") kullanilir, kullanicinin eksik yazimi degil.
                $start = $i;
                $headMatched = false;
                $headCount = count($headTokens);
                if ($headCount > 0 && $i >= $headCount) {
                    $before = array_slice($folded, $i - $headCount, $headCount);
                    if ($before === $headTokens) {
                        $start = $i - $headCount;
                        $headMatched = true;
                    }
                }

                // 1 ve 2 kelimelik tamamlamalar (head eslestiyse onun kadar uzar)
                for ($len = 1; $len <= 2; $len++) {
                    $take = $len + ($headMatched ? $headCount : 0);
                    $phraseWords = array_slice($words, $start, $take);
                    if (count($phraseWords) < $take) {
                        continue;
                    }
                    $phraseFolded = array_slice($folded, $start, $take);

                    // Sayi/birim ile biten oneri gosterme ("protein 900", "whey gr", "kreatin 300gr")
                    $tail = (string) end($phraseFolded);
                    if ($tail === '' || preg_match('/^\d/', $tail) === 1 || in_array($tail, $stop, true)) {
                        continue;
                    }

                    $phrase = trim(implode(' ', $phraseWords), " \t\n\r\0\x0B-–—,.:;");
                    if (mb_strlen($phrase) < 3 || mb_strlen($phrase) > 40) {
                        continue;
                    }

                    $key = $this->foldTr($phrase);
                    // Kullanicinin zaten yazdigi seyi tekrar onerme
                    if ($key === $qFolded) {
                        continue;
                    }
                    // Tek kelimelik oneri daha genel — hafif oncelik alsin
                    $counts[$key] = ($counts[$key] ?? 0) + $weight * ($len === 1 ? 1.25 : 1);
                    $display[$key] = $display[$key] ?? $this->lowerTr($phrase);
                    if ($headMatched) {
                        // Ifade sorgunun tamamini zaten iceriyor, basa bir sey eklenmez
                        $selfContained[$key] = true;
                    }
                }

                break; // ayni isimde ilk eslesme yeter
            }
        }

        arsort($counts);

        $head = trim(mb_substr($q, 0, max(0, mb_strlen($q) - mb_strlen($lastToken))));
        $out = [];
        foreach (array_keys($counts) as $key) {
            $phrase = $display[$key];
            // Ifade sorgunun onceki kelimelerini icermiyorsa basa ekle:
            // "whey izo" -> "whey izolat"
            // Istisna: head, ifadenin ilk kelimesinin bir parcasiysa ekleme
            // ("dip" + "dips-barfiks" -> "dip dips-barfiks" olmasin)
            $firstWord = strtok($this->foldTr($phrase), ' ') ?: '';
            $headSwallowed = $head !== '' && str_starts_with($firstWord, $this->foldTr($head));
            $full = (!isset($selfContained[$key]) && $head !== '' && !$headSwallowed)
                ? $this->lowerTr($head) . ' ' . $phrase
                : $phrase;
            $full = trim($full);

            // Ayni kelime iki kez gecen oneri gosterme ("whey izole whey")
            $fullWords = preg_split('/\s+/u', $this->foldTr($full), -1, PREG_SPLIT_NO_EMPTY) ?: [];
            if (count($fullWords) !== count(array_unique($fullWords))) {
                continue;
            }

            if ($this->foldTr($full) === $qFolded || in_array($full, $out, true)) {
                continue;
            }
            $out[] = $full;
            if (count($out) >= $limit) {
                break;
            }
        }

        return $out;
    }

    /**
     * Turkce kurallariyla kucuk harfe cevirir.
     * mb_strtolower("KREATİN") "kreati̇n" (birlesik nokta) uretiyordu — once I/İ katlanir.
     */
    private function lowerTr(string $value): string
    {
        return mb_strtolower(str_replace(['İ', 'I'], ['i', 'ı'], $value), 'UTF-8');
    }

    /**
     * Turkce karakterleri ASCII'ye katlar (karsilastirma icin; gorunen metin degismez).
     */
    private function foldTr(string $value): string
    {
        $value = str_replace(
            ['ç', 'Ç', 'ğ', 'Ğ', 'ı', 'I', 'İ', 'i', 'ö', 'Ö', 'ş', 'Ş', 'ü', 'Ü'],
            ['c', 'c', 'g', 'g', 'i', 'i', 'i', 'i', 'o', 'o', 's', 's', 'u', 'u'],
            $value
        );

        return mb_strtolower(trim($value), 'UTF-8');
    }
}
