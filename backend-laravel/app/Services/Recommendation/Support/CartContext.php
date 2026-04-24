<?php

namespace App\Services\Recommendation\Support;

/**
 * Immutable snapshot of the cart at the moment a recommendation request arrives.
 *
 * Strategies read from this — they never touch the HTTP request or cart store
 * directly, which keeps them composable and easy to unit-test.
 */
class CartContext
{
    /**
     * @param  array<int, array{product_id:int, variant_id?:int|null, quantity:int, price:float}>  $items
     * @param  array<int>  $categoryIds  Distinct category IDs present in the cart
     * @param  array<int>  $storeIds     Distinct store IDs present in the cart
     */
    public function __construct(
        public readonly array $items,
        public readonly float $subtotal,
        public readonly ?int $userId,
        public readonly array $categoryIds = [],
        public readonly array $storeIds = [],
        public readonly string $locale = 'tr',
    ) {}

    /** @return array<int> */
    public function productIds(): array
    {
        return array_values(array_unique(array_map(
            static fn ($i) => (int) $i['product_id'],
            $this->items
        )));
    }

    public function isEmpty(): bool
    {
        return empty($this->items);
    }

    public function dominantCategoryId(): ?int
    {
        if (empty($this->categoryIds)) {
            return null;
        }
        $counts = array_count_values($this->categoryIds);
        arsort($counts);
        return (int) array_key_first($counts);
    }
}
