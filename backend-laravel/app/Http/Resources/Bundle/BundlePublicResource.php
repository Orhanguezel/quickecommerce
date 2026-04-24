<?php

namespace App\Http\Resources\Bundle;

use App\Actions\ImageModifier;
use App\Http\Resources\Product\PopularProductPublicResource;
use Illuminate\Http\Resources\Json\JsonResource;

class BundlePublicResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'slug'             => $this->slug,
            'description'      => $this->description,
            'image'            => $this->image,
            'image_url'        => ImageModifier::generateImageUrl($this->image),
            'original_price'   => (float) $this->original_price,
            'bundle_price'     => (float) $this->bundle_price,
            'discount_percent' => $this->discountPercent(),
            'savings'          => max(0, (float) $this->original_price - (float) $this->bundle_price),
            'currency_code'    => $this->currency_code,
            'starts_at'        => $this->starts_at,
            'ends_at'          => $this->ends_at,
            'items'            => BundleItemPublicResource::collection($this->whenLoaded('items')),
            'products'         => PopularProductPublicResource::collection($this->whenLoaded('productsCollection')),
        ];
    }
}
