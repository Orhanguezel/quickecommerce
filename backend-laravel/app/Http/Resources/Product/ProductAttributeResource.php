<?php

namespace App\Http\Resources\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductAttributeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get the requested language from the query parameter
        $language = $request->input('language', 'en');
        // Get the translation for the requested language
        $translation = $this->related_translations->where('language', $language);
        return [
            'id' => $this->id,
            'value' => $this->id,
            'label' => $translation?->where('key', 'name')->first()?->value ?? $this->name,
            'product_type' => $this->product_type,
            'attribute_values' => ProductAttributeValueResource::collection($this->attribute_values)
        ];
    }
}
