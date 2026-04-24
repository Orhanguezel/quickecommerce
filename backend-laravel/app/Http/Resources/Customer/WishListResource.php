<?php

namespace App\Http\Resources\Customer;

use App\Actions\ImageModifier;
use App\Http\Resources\Store\StoreDetailsForOrderResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WishListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $displayVariant = $this->product?->displayVariant();
        $price = (float) optional($displayVariant)->price;
        $specialPrice = (float) optional($displayVariant)->special_price;

        return [
            'id' => $this->product->id,
            'store' => new StoreDetailsForOrderResource($this->product->store),
            'store_id' => $this->product->store->id ?? null,
            'name' => $this->product->name,
            'slug' => $this->product->slug,
            'description' => $this->product->description,
            'image_url' => ImageModifier::generateImageUrl($this->product->image),
            'stock' => $this->product->totalStock(),
            'price' => optional($displayVariant)->price,
            'special_price' => optional($displayVariant)->special_price,
            'singleVariant' => $this->product->variants->count() === 1 ? [$this->product->variants->first()] : [],
            'default_variant_id' => optional($displayVariant)->id,
            'discount_percentage' => $price > 0 && $specialPrice > 0 && $specialPrice < $price
                ? round((($price - $specialPrice) / $price) * 100, 2)
                : 0,
            'wishlist' => auth('api_customer')->check() ? $this->product->wishlist : false, // Check if the customer is logged in,
            'rating' => number_format((float)$this->product->rating, 2, '.', ''),
            'review_count' => $this->product->review_count,
        ];
    }
}
