<?php

namespace App\Services\Recommendation\Repositories;

use App\Models\OrderDetail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Provides "customers who bought X also bought Y" data.
 *
 * The underlying matrix is computed nightly by
 * {@see \App\Console\Commands\BuildCoPurchaseMatrix} and cached in Redis.
 * On a cache miss we fall back to an on-the-fly query so the feature is
 * never broken, just slower until the cron runs once.
 */
class CoPurchaseRepository
{
    /** Cache TTL for materialized top-related lists (2 days). */
    public const CACHE_TTL_SECONDS = 172800;

    /** Minimum co-occurrence count to be considered meaningful. */
    public const MIN_CO_OCCURRENCE = 2;

    public function cacheKey(int $productId): string
    {
        return "co_purchase:{$productId}";
    }

    /**
     * Top related product IDs, ordered by co-occurrence frequency desc.
     *
     * @return int[]
     */
    public function relatedProductIds(int $productId, int $limit = 10): array
    {
        $cached = Cache::get($this->cacheKey($productId));
        if (is_array($cached) && !empty($cached)) {
            return array_slice($cached, 0, $limit);
        }

        // Cache miss → compute on the fly (slow path)
        return $this->computeForProduct($productId, $limit);
    }

    /**
     * Ad-hoc computation for a single product. Not cached here — writing
     * to cache is the scheduler's job.
     *
     * @return int[]
     */
    public function computeForProduct(int $productId, int $limit = 10): array
    {
        return OrderDetail::query()
            ->from('order_details as oi1')
            ->join('order_details as oi2', function ($join) {
                $join->on('oi1.order_id', '=', 'oi2.order_id')
                    ->whereColumn('oi1.product_id', '!=', 'oi2.product_id');
            })
            ->where('oi1.product_id', $productId)
            ->select('oi2.product_id', DB::raw('COUNT(*) as freq'))
            ->groupBy('oi2.product_id')
            ->having('freq', '>=', self::MIN_CO_OCCURRENCE)
            ->orderByDesc('freq')
            ->limit($limit)
            ->pluck('product_id')
            ->map(fn ($v) => (int) $v)
            ->all();
    }

    /**
     * Write the computed list for one product to cache. Called by the cron.
     *
     * @param  int[]  $relatedIds
     */
    public function putCache(int $productId, array $relatedIds): void
    {
        Cache::put(
            $this->cacheKey($productId),
            array_values($relatedIds),
            self::CACHE_TTL_SECONDS
        );
    }

    /**
     * Union of related products for *any* of the input product IDs, dedup'd
     * and re-ranked by total frequency. This is what the cart recommender
     * actually wants: "given these N items in the cart, what's next?"
     *
     * @param  int[]  $productIds
     * @return int[]
     */
    public function relatedForCart(array $productIds, int $limit = 10): array
    {
        if (empty($productIds)) {
            return [];
        }

        $scores = [];
        foreach ($productIds as $pid) {
            $related = $this->relatedProductIds((int) $pid, $limit * 2);
            // Earlier items in the list = higher weight
            foreach ($related as $rank => $relatedId) {
                if (in_array($relatedId, $productIds, true)) {
                    continue; // skip products already in cart
                }
                $weight = max(1, $limit - $rank);
                $scores[$relatedId] = ($scores[$relatedId] ?? 0) + $weight;
            }
        }

        arsort($scores);
        return array_slice(array_keys($scores), 0, $limit);
    }
}
