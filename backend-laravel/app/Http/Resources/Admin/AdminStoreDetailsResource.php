<?php

namespace App\Http\Resources\Admin;

use App\Actions\ImageModifier;
use App\Http\Resources\Com\ComAreaListForDropdownResource;
use App\Http\Resources\Translation\StoreTranslationResource;
use App\Http\Resources\Translation\VehicleTypeTranslationResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminStoreDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "area" => new ComAreaListForDropdownResource($this->area),
            'seller' => $this->seller ? [
                'id' => $this->seller->id,
                'first_name' => $this->seller->first_name,
                'last_name' => $this->seller->last_name,
                'phone' => $this->seller->phone,
                'email' => $this->seller->email,
                'image' => ImageModifier::generateImageUrl($this->seller->image),
                'email_verified' => (bool)$this->seller->email_verified,
                'def_lang' => $this->seller->def_lang,
                'store_owner' => (bool)$this->seller->store_owner,
                'status' => $this->seller->status,
            ] : null,
            "store_type" => $this->store_type,
            "tax" => $this->tax,
            "tax_number" => $this->tax_number,
            "subscription_type" => $this->subscription_type,
            "subscription" => $this->subscription_type == 'subscription' && $this->activeSubscription
                ? $this->activeSubscription->name
                : null,

            "admin_commission_type" => $this->admin_commission_type,
            "admin_commission_amount" => $this->admin_commission_amount,
            "name" =>  $this->name,
            "slug" => $this->slug,
            "phone" => $this->phone,
            "email" => $this->email,
            "logo" => $this->logo,
            "logo_url" => ImageModifier::generateImageUrl($this->logo),
            "banner" => $this->banner,
            "banner_url" => ImageModifier::generateImageUrl($this->banner),
            "address" =>  $this->address,
            "latitude" => $this->latitude,
            "longitude" => $this->longitude,
            "is_featured" => $this->is_featured,
            "opening_time" => $this->opening_time,
            "closing_time" => $this->closing_time,
            "delivery_charge" => $this->delivery_charge,
            "delivery_time" => $this->delivery_time,
            "delivery_self_system" => $this->delivery_self_system,
            "delivery_take_away" => $this->delivery_take_away,
            "order_minimum" => $this->order_minimum,
            "veg_status" => $this->veg_status,
            "off_day" => $this->off_day,
            "enable_saling" => $this->enable_saling,
            "meta_title" =>  $this->meta_title,
            "meta_description" => $this->meta_description,
            "meta_image" => $this->meta_image,
            "meta_image_url" => ImageModifier::generateImageUrl($this->meta_image),
            "status" => $this->status,
            "created_by" => $this->created_by,
            "updated_by" => $this->updated_by,
            "deleted_at" => $this->deleted_at,
            "translations" => StoreTranslationResource::collection($this->related_translations->groupBy('language')),
        ];
    }
}
