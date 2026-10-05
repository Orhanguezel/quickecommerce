<?php

namespace App\Services\Order;

use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/** Order coupons cannot stack with product discounts unless explicitly exempted. */
class CouponCombinationPolicy
{
    public function allowsProductDiscountCombination(?string $couponCode): bool
    {
        $code = strtoupper(trim((string) $couponCode));
        return $code !== '' && in_array($code, (array) config('coupon.combine_with_product_discounts_codes', []), true);
    }

    public function blocksCoupon(?string $couponCode, array $packages): bool
    {
        return !$this->allowsProductDiscountCombination($couponCode)
            && $this->hasExistingDiscount($packages);
    }

    public function hasExistingDiscount(array $packages): bool
    {
        $items = collect($packages)
            ->flatMap(fn ($package) => $package['items'] ?? [])
            ->filter(fn ($item) => !empty($item['product_id']));
        $productIds = $items
            ->pluck('product_id')
            ->filter()
            ->unique()
            ->all();

        if (!$productIds) {
            return false;
        }

        $hasFlashSale = DB::table('flash_sale_products')
            ->join('flash_sales', 'flash_sales.id', '=', 'flash_sale_products.flash_sale_id')
            ->whereIn('flash_sale_products.product_id', $productIds)
            ->where('flash_sales.status', 1)
            ->where('flash_sales.start_time', '<=', now())
            ->where('flash_sales.end_time', '>=', now())
            ->where('flash_sales.purchase_limit', '!=', 0)
            ->exists();

        if ($hasFlashSale) {
            return true;
        }

        $variantIds = $items->pluck('variant_id')->filter()->unique()->all();
        return (bool) $variantIds && ProductVariant::query()
            ->whereIn('id', $variantIds)
            ->whereNotNull('special_price')
            ->where('special_price', '>', 0)
            ->whereColumn('special_price', '<', 'price')
            ->exists();
    }

    public function message(): string
    {
        return 'İndirimli ürünlerle kupon birlikte kullanılamaz. Kuponu kullanmak için indirimli ürünleri sepetten çıkarın.';
    }

    public function cartSubtotal(array $packages): float
    {
        $total = 0.0;
        foreach ($packages as $package) {
            foreach ($package['items'] ?? [] as $item) {
                $variant = ProductVariant::query()
                    ->where('product_id', $item['product_id'])
                    ->find($item['variant_id']);
                if (!$variant || !$variant->isPubliclySellable()) {
                    throw ValidationException::withMessages(['items' => 'Sepetteki ürün artık satışa uygun değil.']);
                }

                $regular = (float) $variant->price;
                $special = (float) $variant->special_price;
                $unitPrice = $special > 0 ? $special : $regular;
                $flashSale = DB::table('flash_sale_products')
                    ->join('flash_sales', 'flash_sales.id', '=', 'flash_sale_products.flash_sale_id')
                    ->where('flash_sale_products.product_id', $item['product_id'])
                    ->where('flash_sales.status', 1)
                    ->where('flash_sales.start_time', '<=', now())
                    ->where('flash_sales.end_time', '>=', now())
                    ->where('flash_sales.purchase_limit', '!=', 0)
                    ->orderByDesc('flash_sales.end_time')
                    ->first(['flash_sales.discount_type', 'flash_sales.discount_amount']);
                if ($flashSale) {
                    $discount = $flashSale->discount_type === 'percentage'
                        ? $unitPrice * (float) $flashSale->discount_amount / 100
                        : (float) $flashSale->discount_amount;
                    $unitPrice -= $discount;
                }
                $total += $unitPrice * (int) $item['quantity'];
            }
        }

        return round($total, 2);
    }
}
