<?php

namespace App\Http\Resources\Bundle;

use App\Actions\ImageModifier;
use Illuminate\Http\Resources\Json\JsonResource;

class BundleItemPublicResource extends JsonResource
{
    public function toArray($request): array
    {
        $product = $this->whenLoaded('product');
        $variant = $this->whenLoaded('variant');

        return [
            'id'          => $this->id,
            'product_id'  => $this->product_id,
            'variant_id'  => $this->variant_id,
            'quantity'    => $this->quantity,
            'product'     => $product ? [
                'id'        => $product->id,
                'name'      => $product->name,
                'slug'      => $product->slug,
                'image'     => $product->image,
                'image_url' => ImageModifier::generateImageUrl($product->image),
            ] : null,
            'variant'     => $variant ? [
                'id'            => $variant->id,
                'variant_slug'  => $variant->variant_slug,
                'price'         => (float) $variant->price,
                'special_price' => $variant->special_price !== null
                    ? (float) $variant->special_price
                    : null,
                'stock_quantity' => $variant->stock_quantity,
            ] : null,
        ];
    }
}
