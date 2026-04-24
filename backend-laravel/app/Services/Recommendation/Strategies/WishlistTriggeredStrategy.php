<?php

namespace App\Services\Recommendation\Strategies;

use App\Models\Product;
use App\Models\Wishlist;
use App\Services\Recommendation\Contracts\RecommendationStrategy;
use App\Services\Recommendation\Support\CartContext;
use App\Services\Recommendation\Support\RecommendationBlock;
use Illuminate\Support\Collection;

/**
 * "Favorilerinden seni bekleyenler" — pulls items the user has saved to
 * wishlist but not yet bought. Flash-sale and low-stock items are
 * prioritized to create urgency.
 *
 * Only runs for authenticated users (no guest wishlist on the backend).
 * Priority between CoPurchase (100) and CategoryPopular (50) because when
 * it fires it's a strong signal — user already said they want these items.
 */
class WishlistTriggeredStrategy implements RecommendationStrategy
{
    public function type(): string
    {
        return 'wishlist_triggered';
    }

    public function titleKey(): string
    {
        return 'recommendations.wishlist_triggered';
    }

    public function priority(CartContext $ctx): int
    {
        return 75;
    }

    public function isApplicable(CartContext $ctx): bool
    {
        return $ctx->userId !== null && !$ctx->isEmpty();
    }

    public function recommend(CartContext $ctx, int $limit = 6): RecommendationBlock
    {
        $wishlistProductIds = Wishlist::query()
            ->where('customer_id', $ctx->userId)
            ->whereNotIn('product_id', $ctx->productIds())
            ->pluck('product_id')
            ->map(fn ($v) => (int) $v)
            ->all();

        if (empty($wishlistProductIds)) {
            return $this->emptyBlock($ctx);
        }

        // Fetch with variants so we can sort by flash-sale / low-stock urgency
        $products = Product::with(['variants', 'store'])
            ->whereIn('id', $wishlistProductIds)
            ->where('status', 'approved')
            ->get();

        // Custom ordering: flash-sale first, then low stock, then the rest
        $ranked = $products->sortBy(function (Product $p) {
            $firstVariant = $p->variants->first();
            $stock = optional($firstVariant)->stock_quantity ?? 0;
            $onSale = optional($firstVariant)->special_price
                && optional($firstVariant)->special_price < optional($firstVariant)->price
                ? 0 : 1; // lower = first
            $lowStockBucket = $stock > 0 && $stock <= 5 ? 0 : 1;

            // Compose sort key: [onSale, lowStock, id]
            return sprintf('%d%d%010d', $onSale, $lowStockBucket, $p->id);
        })->values()->take($limit);

        return new RecommendationBlock(
            type: $this->type(),
            titleKey: $this->titleKey(),
            products: $ranked,
            priority: $this->priority($ctx),
            meta: ['total_wishlist' => count($wishlistProductIds)],
        );
    }

    private function emptyBlock(CartContext $ctx): RecommendationBlock
    {
        return new RecommendationBlock(
            type: $this->type(),
            titleKey: $this->titleKey(),
            products: new Collection(),
            priority: $this->priority($ctx),
        );
    }
}
