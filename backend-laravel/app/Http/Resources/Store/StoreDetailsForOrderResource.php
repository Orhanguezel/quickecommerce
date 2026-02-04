<?php

namespace App\Http\Resources\Store;

use App\Actions\ImageModifier;
use App\Models\StoreType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreDetailsForOrderResource extends JsonResource
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
        $translation = $this->related_translations?->where('language', $language) ?? collect();
        $store_type_info = StoreType::where('type', $this->store_type)->first() ?? new StoreType();
        return [
            "id" => $this->id,
            "name" => !empty($translation) && $translation->where('key', 'name')->first()
                ? $translation->where('key', 'name')->first()->value
                : $this->name, // If language is empty or not provided attribute
            "area_id" => $this->area_id,
            "slug" => $this->slug,
            "phone" => $this->phone,
            "email" => $this->email,
            "store_type" => $this->store_type,
            "logo" => ImageModifier::generateImageUrl($this->logo),
            "tax" => $this->tax,
            "delivery_time" => $this->delivery_time,
            "address" => $this->address,
            "latitude" => $this->area?->center_latitude,
            "longitude" => $this->area?->center_longitude,
            "rating" => $this->rating,
            "additional_charge_name" => $store_type_info->additional_charge_enable_disable ? $store_type_info->additional_charge_name : null,
            "additional_charge_amount" => $store_type_info->additional_charge_enable_disable ? round($store_type_info->additional_charge_amount) : 0,
            "additional_charge_type" => $store_type_info->additional_charge_enable_disable ? $store_type_info->additional_charge_type : 'fixed',
            "type" => "store",
            "live_chat" => checkSubscription($this->id, 'live_chat'),
        ];
    }
}
