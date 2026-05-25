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
     * Type-ahead autocomplete: products + categories + brands.
     */
    public function suggest(Request $request): JsonResponse
    {
        $q = trim((string) $request->input('q', ''));
        $limit = (int) $request->input('limit', 10);
        $limit = max(1, min($limit, 20));

        if (mb_strlen($q) < 2) {
            return response()->json([
                'products' => [],
                'categories' => [],
                'brands' => [],
            ]);
        }

        $cacheKey = 'search_suggest:' . md5("{$q}|{$limit}");
        $payload = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($q, $limit) {
            $like = '%' . $q . '%';

            $products = Product::publiclySellable()
                ->where('name', 'like', $like)
                ->select('id', 'name', 'slug', 'image')
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
                ->limit(5)
                ->get();

            $brands = ProductBrand::where('brand_name', 'like', $like)
                // Bos marka onerilmez: en az 1 publicly sellable urun olmali
                ->whereExists(function ($exists) {
                    $exists->select(DB::raw(1))
                        ->from('products')
                        ->whereColumn('products.brand_id', 'product_brand.id')
                        ->whereNull('products.deleted_at')
                        ->where('products.status', 'approved')
                        ->whereNotNull('products.image')
                        ->where('products.image', '!=', '');
                })
                ->select('id', 'brand_name as name', 'brand_slug as slug')
                ->limit(5)
                ->get();

            return [
                'products' => $products,
                'categories' => $categories,
                'brands' => $brands,
            ];
        });

        return response()->json($payload);
    }
}
