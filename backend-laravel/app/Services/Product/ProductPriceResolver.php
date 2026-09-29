<?php

namespace App\Services\Product;

use App\Models\FlashSale;
use Carbon\CarbonInterface;

/**
 * Musterinin odedigi birim fiyatin tek tanimi: varyant special_price (yoksa
 * price), ustune aktif flash sale indirimi. OrderService siparis toplamini ayni
 * formulle hesaplar; vitrin (resolveProductPricing) ve Merchant/Cimri feed'i
 * bu sinifi kullanir (derin analiz 2026-09-29: Argivit 765 gorunur / 850 feed).
 */
class ProductPriceResolver
{
    public static function basePrice(float|string|null $price, float|string|null $specialPrice): float
    {
        return (float) $specialPrice > 0 ? (float) $specialPrice : (float) $price;
    }

    public static function activeFlashSale(?FlashSale $flashSale, ?CarbonInterface $now = null): ?FlashSale
    {
        $now ??= now();
        if (!$flashSale || (int) $flashSale->status !== 1) {
            return null;
        }
        if ($flashSale->start_time && $now->lt($flashSale->start_time)) {
            return null;
        }
        if (!$flashSale->end_time || $now->gt($flashSale->end_time)) {
            return null;
        }
        if ($flashSale->purchase_limit !== null && (int) $flashSale->purchase_limit <= 0) {
            return null;
        }

        return $flashSale;
    }

    public static function flashSaleDiscount(?FlashSale $flashSale, float $basePrice): float
    {
        if (!$flashSale || (float) $flashSale->discount_amount <= 0 || $basePrice <= 0) {
            return 0.0;
        }

        $discount = $flashSale->discount_type === 'percentage'
            ? $basePrice * (float) $flashSale->discount_amount / 100
            : (float) $flashSale->discount_amount;

        return min($discount, $basePrice);
    }

    /**
     * Varyantin musteriye gosterilen/tahsil edilen birim fiyati.
     */
    public static function finalPrice(
        float|string|null $price,
        float|string|null $specialPrice,
        ?FlashSale $flashSale,
        ?CarbonInterface $now = null
    ): float {
        $base = self::basePrice($price, $specialPrice);

        return round($base - self::flashSaleDiscount(self::activeFlashSale($flashSale, $now), $base), 2);
    }
}
