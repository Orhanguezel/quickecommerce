<?php

namespace App\Http\Resources\Com\Store;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreListResource extends JsonResource
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
            'seller' => $this->seller ? $this->seller->first_name . '' . $this->seller->last_name : null,
            'store_type' => $this->store_type,
            'name' => !empty($translation) && $translation->where('key', 'name')->first()
                ? $translation->where('key', 'name')->first()->value
                : $this->name, // If language is empty or not provided attribute
            'slug' => $this->slug,
            'phone' => $this->phone,
            'email' => $this->email,
            'logo' => $this->logo,
            'logo_url' => ImageModifier::generateImageUrl($this->logo),
            'banner' => $this->banner,
            'banner_url' => ImageModifier::generateImageUrl($this->banner),
            'address' => !empty($translation) && $translation->where('key', 'address')->first()
                ? $translation->where('key', 'address')->first()->value
                : $this->address, // If language is empty or not provided attribute
            'tax' => $this->tax,
            'tax_number' => $this->tax_number,
            'is_featured' => $this->is_featured,
            'opening_time' => $this->opening_time,
            'closing_time' => $this->closing_time,
            'subscription_type' => $this->subscription_type,
            'admin_commission_type' => $this->admin_commission_type,
            'admin_commission_amount' => $this->admin_commission_amount,
            'delivery_charge' => $this->delivery_charge,
            'delivery_time' => $this->delivery_time,
            'delivery_self_system' => $this->delivery_self_system,
            'delivery_take_away' => $this->delivery_take_away,
            'order_minimum' => $this->order_minimum,
            'veg_status' => $this->veg_status,
            'off_day' => $this->off_day,
            'enable_saling' => $this->enable_saling,
            'meta_title' => !empty($translation) && $translation->where('key', 'meta_title')->first()
                ? $translation->where('key', 'meta_title')->first()->value
                : $this->meta_title, // If language is empty or not provided attribute
            'meta_description' => !empty($translation) && $translation->where('key', 'meta_description')->first()
                ? $translation->where('key', 'meta_description')->first()->value
                : $this->meta_description, // If language is empty or not provided attribute
            'meta_image' => ImageModifier::generateImageUrl($this->meta_image),
            'status' => $this->status,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'deleted_at' => $this->deleted_at,
            'created_at' => $this->created_at, // Handles null
            'updated_at' => $this->updated_at, // Handles null
        ];
    }
}
