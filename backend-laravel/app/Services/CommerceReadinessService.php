<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Store;

class CommerceReadinessService
{
    public function refreshStore(Store $store, bool $persist = true): array
    {
        $model = $store->fulfillment_model ?: 'seller';
        $checks = match ($model) {
            // Supplier brands are operated centrally. Their stock/source
            // freshness is enforced separately; a duplicated storefront
            // address or Geliver sender ID is neither truthful nor required.
            'dropship' => [
                'operator_account' => filled($store->store_seller_id),
                'source_identity' => filled($store->name) && filled($store->slug),
            ],
            // Digital services do not require a physical pickup/sender address.
            'digital' => [
                'owner_account' => filled($store->store_seller_id),
                'store_identity' => filled($store->name) && filled($store->slug),
            ],
            default => [
                'logo' => filled($store->logo),
                'address' => filled($store->address),
                'email' => filled($store->email),
                'phone' => filled($store->phone),
                'tax_identity' => filled($store->tax_number),
                'geliver_sender' => filled($store->geliver_sender_address_id),
            ],
        };
        $score = (int) round((collect($checks)->filter()->count() / count($checks)) * 100);

        if ($persist) {
            $store->forceFill(['profile_completion_score' => $score])->saveQuietly();
        }

        return ['score' => $score, 'checks' => $checks, 'fulfillment_model' => $model];
    }

    public function refreshProduct(Product $product, bool $persist = true): array
    {
        $product->loadMissing(['variants', 'store']);
        $descriptionLength = mb_strlen(trim(strip_tags((string) $product->description)));
        $hasGallery = collect(preg_split('/[,|]/', (string) $product->gallery_images))
            ->filter(fn ($value) => filled(trim((string) $value)))
            ->isNotEmpty();
        $hasSellableVariant = $product->variants->contains(fn ($variant) => $variant->isPubliclySellable());

        $checks = [
            'brand' => ['passed' => filled($product->brand_id), 'points' => 15],
            'category' => ['passed' => filled($product->category_id), 'points' => 15],
            'meta_title' => ['passed' => mb_strlen(trim((string) $product->meta_title)) >= 20, 'points' => 10],
            'description' => [
                'passed' => $descriptionLength >= 200,
                'points' => 15,
                'awarded' => $descriptionLength >= 200 ? 15 : ($descriptionLength >= 100 ? 8 : 0),
            ],
            'image' => ['passed' => filled($product->image) && !str_starts_with((string) $product->image, 'http'), 'points' => 15],
            'gallery' => ['passed' => $hasGallery, 'points' => 5],
            'delivery' => [
                'passed' => filled($product->delivery_time_text)
                    || (filled($product->delivery_time_min) && filled($product->delivery_time_max)),
                'points' => 10,
            ],
            'returns' => [
                'passed' => filled($product->return_in_days) || filled($product->return_text),
                'points' => 5,
            ],
            'sellable_variant' => ['passed' => $hasSellableVariant, 'points' => 10],
        ];

        $score = collect($checks)->sum(fn ($check) => $check['awarded'] ?? ($check['passed'] ? $check['points'] : 0));
        $effectivePrice = $product->variants
            ->filter(fn ($variant) => $variant->isPubliclySellable())
            ->map(fn ($variant) => $product->variantEffectivePrice($variant))
            ->filter(fn ($price) => $price > 0)
            ->min();
        $priceIndex = $effectivePrice && (float) $product->market_min_price > 0
            ? round($effectivePrice / (float) $product->market_min_price, 4)
            : null;

        $reason = $this->adsIneligibilityReason($product, $score, $hasSellableVariant, $priceIndex);
        $attributes = [
            'catalog_quality_score' => min(100, (int) $score),
            'price_index' => $priceIndex,
            'ads_eligible' => $reason === null,
            'ads_ineligibility_reason' => $reason,
        ];

        if ($persist) {
            $product->forceFill($attributes)->saveQuietly();
        }

        return $attributes + ['checks' => $checks, 'effective_price' => $effectivePrice];
    }

    private function adsIneligibilityReason(
        Product $product,
        int $score,
        bool $hasSellableVariant,
        ?float $priceIndex
    ): ?string {
        if (! $product->is_hero) return 'not_hero_product';
        if ($product->status !== 'approved') return 'product_not_approved';
        if (! $hasSellableVariant) return 'out_of_stock_or_invalid_price';
        if ($score < 80) return 'catalog_quality_below_80';
        if (! $product->store || $product->store->sales_suspended_at) return 'store_suspended';
        if ((int) $product->store->profile_completion_score < 80) return 'store_profile_incomplete';
        if (! $product->market_price_checked_at || $product->market_price_checked_at->lt(
            now()->subHours((int) config('commerce.market_price_max_age_hours', 48))
        )) {
            return 'market_price_missing_or_stale';
        }
        if ($priceIndex === null) return 'market_price_missing';
        if ($priceIndex > (float) config('commerce.max_ad_price_index', 1.15)) {
            return 'price_more_than_15_percent_above_market';
        }

        return null;
    }
}
