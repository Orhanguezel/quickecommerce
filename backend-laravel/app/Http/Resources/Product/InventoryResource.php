<?php

namespace App\Http\Resources\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $language = $request->input('language', 'en');
        $translation = $this->related_translations->where('language', $language);
        $store_translation = $this->store->related_translations->where('language', $language);
        return [
            "id" => $this->id,
            'product_name' => !empty($translation) && $translation->where('key', 'name')->first()
                ? $translation->where('key', 'name')->first()->value
                : $this->name,
            'store_name' => !empty($store_translation) && $store_translation->where('key', 'name')->first()
                ? $store_translation->where('key', 'name')->first()->value
                : $this->store->name,
            'type' => $this->type,
            'order_count' => $this->order_count,
            'slug' => $this->slug,
            "variants" => ProductVariantDetailsForStock::collection($this->variants)
        ];
    }
}
