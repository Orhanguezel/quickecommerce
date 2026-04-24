<?php

namespace App\Services\Recommendation\Support;

use Illuminate\Support\Collection;

/**
 * A single UI block returned to the frontend — e.g.
 * "Frequently Bought Together" or "Popular in Outdoor".
 */
class RecommendationBlock
{
    /**
     * @param  Collection  $products  Eloquent Product models (variants loaded)
     */
    public function __construct(
        public readonly string $type,
        public readonly string $titleKey,
        public readonly Collection $products,
        public readonly int $priority = 0,
        public readonly array $meta = [],
    ) {}

    public function isEmpty(): bool
    {
        return $this->products->isEmpty();
    }
}
