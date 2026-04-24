<?php

namespace App\Services\Recommendation\Strategies;

use App\Models\Product;
use App\Services\Recommendation\Contracts\RecommendationStrategy;
use App\Services\Recommendation\Support\CartContext;
use App\Services\Recommendation\Support\RecommendationBlock;
use Illuminate\Support\Collection;

/**
 * "Bu kategoride popüler" — fallback strategy that works even with zero
 * order history (cold-start safe). Finds the dominant category in the
 * cart and returns its most-ordered products.
 */
class CategoryPopularStrategy implements RecommendationStrategy
{
    public function type(): string
    {
        return 'category_popular';
    }

    public function titleKey(): string
    {
        return 'recommendations.category_popular';
    }

    public function priority(CartContext $ctx): int
    {
        return 50;
    }

    public function isApplicable(CartContext $ctx): bool
    {
        return !$ctx->isEmpty() && $ctx->dominantCategoryId() !== null;
    }

    public function recommend(CartContext $ctx, int $limit = 6): RecommendationBlock
    {
        $categoryId = $ctx->dominantCategoryId();
        $excludeIds = $ctx->productIds();

        $products = Product::with(['variants', 'store'])
            ->where('category_id', $categoryId)
            ->where('status', 'approved')
            ->whereNotIn('id', $excludeIds)
            ->orderByDesc('order_count')
            ->orderByDesc('id')
            ->limit($limit)
            ->get();

        return new RecommendationBlock(
            type: $this->type(),
            titleKey: $this->titleKey(),
            products: $products,
            priority: $this->priority($ctx),
            meta: ['category_id' => $categoryId],
        );
    }
}
