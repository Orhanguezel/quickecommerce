<?php

namespace App\Http\Resources\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantDetailsForStock extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'product_id' => $this->product_id,
            'id' => $this->id,
            'sku' => $this->sku,
            'variant_slug' => $this->variant_slug,
            'attributes' => $this->attributes ? json_decode($this->attributes, true) : [], // Decode the JSON column
            'stock_quantity' => $this->stock_quantity,
            'stock_status'=> $this->stockStatus(),
            'price' => $this->price,
        ];
    }
}
