<?php

namespace App\Services\Recommendation\Contracts;

use App\Services\Recommendation\Support\CartContext;
use App\Services\Recommendation\Support\RecommendationBlock;

/**
 * Contract all cart recommendation strategies must implement.
 *
 * A strategy is *one* block of products the user sees in the cart —
 * e.g. "Frequently Bought Together", "Popular in Outdoor", etc.
 *
 * Strategies are orchestrated by CartRecommendationOrchestrator which
 * calls isApplicable() first (cheap check) before recommend() (expensive
 * DB query). Priority decides display order when multiple are applicable.
 */
interface RecommendationStrategy
{
    /** Unique block type identifier sent to the frontend. */
    public function type(): string;

    /** Translation key the frontend uses for the section title. */
    public function titleKey(): string;

    /** Higher = shown first. Used by the orchestrator to sort blocks. */
    public function priority(CartContext $ctx): int;

    /**
     * Quick applicability check. Must be cheap (no DB query).
     * Return false to skip calling recommend() entirely.
     */
    public function isApplicable(CartContext $ctx): bool;

    /** Build the recommendation block. Can return an empty block. */
    public function recommend(CartContext $ctx, int $limit = 6): RecommendationBlock;
}
