<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Product\ProductAttributeValueResource;
use App\Http\Resources\Translation\AttributeTranslationResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminAttributeDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'value' => $this->id,
            'label' => $this->name,
            'product_type' => $this->product_type,
            'category_id' => $this->category_id,
            'category_name' => $this->category?->category_name,
            'attribute_values' => ProductAttributeValueResource::collection($this->attribute_values),
            "translations" => AttributeTranslationResource::collection($this->related_translations->groupBy('language')),
        ];
    }
}
