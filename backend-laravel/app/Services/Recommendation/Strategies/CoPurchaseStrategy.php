<?php

namespace App\Services\Recommendation\Strategies;

use App\Models\Product;
use App\Services\Recommendation\Contracts\RecommendationStrategy;
use App\Services\Recommendation\Repositories\CoPurchaseRepository;
use App\Services\Recommendation\Support\CartContext;
use App\Services\Recommendation\Support\RecommendationBlock;
use Illuminate\Support\Collection;

/**
 * "Sıkça birlikte alınanlar" — uses the co-purchase matrix built nightly.
 *
 * Highest priority strategy: when it has data it's usually the most
 * relevant, so we show it first.
 */
class CoPurchaseStrategy implements RecommendationStrategy
{
    public function __construct(protected CoPurchaseRepository $repo) {}

    public function type(): string
    {
        return 'frequently_bought_together';
    }

    public function titleKey(): string
    {
        return 'recommendations.frequently_bought_together';
    }

    public function priority(CartContext $ctx): int
    {
        return 100;
    }

    public function isApplicable(CartContext $ctx): bool
    {
        return !$ctx->isEmpty();
    }

    public function recommend(CartContext $ctx, int $limit = 6): RecommendationBlock
    {
        $relatedIds = $this->repo->relatedForCart($ctx->productIds(), $limit * 2);

        if (empty($relatedIds)) {
            return new RecommendationBlock(
                type: $this->type(),
                titleKey: $this->titleKey(),
                products: new Collection(),
                priority: $this->priority($ctx),
            );
        }

        // Preserve ordering from the repository (by co-purchase score)
        $products = Product::with(['variants', 'store'])
            ->whereIn('id', $relatedIds)
            ->where('status', 'approved')
            ->get()
            ->sortBy(fn ($p) => array_search((int) $p->id, $relatedIds, true))
            ->take($limit)
            ->values();

        return new RecommendationBlock(
            type: $this->type(),
            titleKey: $this->titleKey(),
            products: $products,
            priority: $this->priority($ctx),
        );
    }
}
