<?php

namespace App\Http\Resources\Admin;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminFlashSaleProductResource extends JsonResource
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
        $flash_sale_translation = $this->flashSale->related_translations->where('language', $language);
        $product_translation = $this->product->related_translations->where('language', $language);
        $store_translation = $this->store->related_translations->where('language', $language);
        return [
            "id" => $this->id,
            "flash_sale_title" => !empty($flash_sale_translation) && $flash_sale_translation->where('key', 'title')->first()
                ? $flash_sale_translation->where('key', 'title')->first()->value
                : $this->flashSale?->title, // If language is empty or not provided attribute
            "product_name" => !empty($product_translation) && $product_translation->where('key', 'name')->first()
                ? $product_translation->where('key', 'name')->first()->value
                : $this->product?->name,
            "product_image" => ImageModifier::generateImageUrl($this->product?->image),
            "store" => !empty($store_translation) && $store_translation->where('key', 'name')->first()
                ? $store_translation->where('key', 'name')->first()->value
                : $this->store?->name,
            "status" => $this->status,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
        ];
    }
}
