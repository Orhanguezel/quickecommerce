<?php

namespace App\Http\Resources\Com\Store;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StorePublicListResource extends JsonResource
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
            'area' => $this->area->name ?? null,
            'seller' => $this->seller ? $this->seller->first_name . ' ' . $this->seller->last_name : null,
            'store_type' => $this->store_type,
            'name' => $translation->isNotEmpty()
                ? $translation->where('key', 'name')->first()?->value
                : $this->name,
            'slug' => $this->slug,
            'description' => $this->meta_description,
            'phone' => $this->phone,
            'email' => $this->email,
            'logo' => $this->logo,
            'logo_url' => ImageModifier::generateImageUrl($this->logo),
            'banner' => $this->banner,
            'banner_url' => ImageModifier::generateImageUrl($this->banner),
            'address' => $translation->isNotEmpty()
                ? $translation->where('key', 'address')->first()?->value
                : $this->address,
            'is_featured' => $this->is_featured,
            'opening_time' => $this->opening_time,
            'closing_time' => $this->closing_time,
            'veg_status' => $this->veg_status,
            'off_day' => $this->off_day,
            'rating' => $this->rating
        ];
    }
}
