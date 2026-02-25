<?php

namespace App\Http\Resources\Product;

use App\Actions\ImageModifier;
use App\Http\Resources\ProductCategoryByIdPublicResource;
use App\Http\Resources\Store\StoreDetailsForOrderResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FlashSaleAllProductPublicResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Filter variants by price range in the resource
        $filteredVariants = $this->product?->variants->filter(function ($variant) use ($request) {
            // Apply the price range filter
            return (!$request->min_price || $variant->price >= $request->min_price) &&
                (!$request->max_price || $variant->price <= $request->max_price);
        });

        // Get the first filtered variant, or null if no variants match the price range
        $firstVariant = $filteredVariants->first();
        // Get the requested language from the query parameter
        $language = $request->input('language', 'en');
        // Get the translation for the requested language
        $translation = $this->product?->related_translations->where('language', $language);
        return [
            "id" => $this->product?->id,
            "name" => !empty($translation) && $translation->where('key', 'name')->first()
                ? $translation->where('key', 'name')->first()->value
                : $this->product?->name, // If language is empty or not provided attribute
            'store' => new StoreDetailsForOrderResource($this->product?->store),
            "slug" => $this->product?->slug,
            "description" => !empty($translation) && $translation->where('key', 'name')->first()
                ? $translation->where('key', 'name')->first()->value
                : $this->product?->description,// If language is empty or not provided attribute
            'image' => $this->product?->image,
            'image_url' => ImageModifier::generateImageUrl($this->product?->image),
            'stock' => $this->product?->variants->isNotEmpty() ? $this->product?->variants->sum('stock_quantity') : null,
            'wishlist' => auth('api_customer')->check() ? $this->product?->wishlist : false, // Check if the customer is logged in,
            'rating' => number_format((float)$this->product?->rating, 2, '.', ''),
            'review_count' => $this->product?->review_count,
            'discount_type' => $this->flashSale?->discount_type,
            'discount_amount' => $this->flashSale?->discount_amount,
            'purchase_limit' => $this->flashSale?->purchase_limit,
            'flash_sale_id' => $this->flashSale?->id,
            'price' => optional($firstVariant)->price,
            'special_price' => optional($firstVariant)->special_price,
            'singleVariant' => $filteredVariants->count() === 1 ? [$firstVariant] : [],
            'default_variant_id' => optional($firstVariant)->id,
            'discount_percentage' => $firstVariant && $firstVariant->price > 0 && $firstVariant->special_price > 0
                ? round((($firstVariant->price - $firstVariant->special_price) / $firstVariant->price) * 100, 2)
                : 0,
            'flash_sale' => $this->product?->isInFlashDeal(),
        ];
    }
}
