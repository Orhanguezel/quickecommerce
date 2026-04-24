<?php

namespace App\Services\Recommendation;

use App\Services\Recommendation\Contracts\RecommendationStrategy;
use App\Services\Recommendation\Support\CartContext;
use App\Services\Recommendation\Support\RecommendationBlock;

/**
 * Central orchestrator. Receives a cart context, asks each registered
 * strategy whether it's applicable, runs the applicable ones, and returns
 * a sorted list of blocks ready for API serialization.
 *
 * Registration order is irrelevant — the orchestrator sorts by priority().
 *
 * Usage:
 *   $orchestrator->register(new CategoryPopularStrategy(...));
 *   $orchestrator->register(new CoPurchaseStrategy(...));
 *   $blocks = $orchestrator->build($ctx);
 */
class CartRecommendationOrchestrator
{
    /** @var RecommendationStrategy[] */
    protected array $strategies = [];

    /** Maximum blocks returned to avoid clutter. */
    protected int $maxBlocks = 3;

    /** Products per block. */
    protected int $productsPerBlock = 6;

    public function register(RecommendationStrategy $strategy): self
    {
        $this->strategies[] = $strategy;
        return $this;
    }

    public function setMaxBlocks(int $n): self
    {
        $this->maxBlocks = max(1, $n);
        return $this;
    }

    public function setProductsPerBlock(int $n): self
    {
        $this->productsPerBlock = max(1, $n);
        return $this;
    }

    /**
     * @return RecommendationBlock[]
     */
    public function build(CartContext $ctx): array
    {
        if ($ctx->isEmpty()) {
            return [];
        }

        $applicable = array_filter(
            $this->strategies,
            static fn (RecommendationStrategy $s) => $s->isApplicable($ctx)
        );

        // Sort by priority descending
        usort(
            $applicable,
            static fn (RecommendationStrategy $a, RecommendationStrategy $b)
                => $b->priority($ctx) <=> $a->priority($ctx)
        );

        $blocks = [];
        $seenProductIds = $ctx->productIds();

        foreach ($applicable as $strategy) {
            if (count($blocks) >= $this->maxBlocks) {
                break;
            }

            $block = $strategy->recommend($ctx, $this->productsPerBlock);

            // Filter out products the user has already placed in the cart
            // or already seen in a previous (higher-priority) block.
            $filtered = $block->products->reject(
                fn ($p) => in_array((int) $p->id, $seenProductIds, true)
            )->values();

            if ($filtered->isEmpty()) {
                continue;
            }

            $seenProductIds = array_merge(
                $seenProductIds,
                $filtered->pluck('id')->map(fn ($id) => (int) $id)->all()
            );

            $blocks[] = new RecommendationBlock(
                type: $block->type,
                titleKey: $block->titleKey,
                products: $filtered,
                priority: $block->priority,
                meta: $block->meta,
            );
        }

        return $blocks;
    }
}
