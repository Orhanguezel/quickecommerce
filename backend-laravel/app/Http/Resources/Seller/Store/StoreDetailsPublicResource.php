<?php

namespace App\Http\Resources\Seller\Store;

use App\Actions\ImageModifier;
use App\Http\Resources\Com\Seller\SellerDetailsPublicResource;
use App\Http\Resources\Product\NewArrivalPublicResource;
use App\Models\StoreType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreDetailsPublicResource extends JsonResource
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
        $store_type_info = StoreType::where('type', $this->store_type)->first();
        return [
            'id' => $this->id,
            'area' => $this->area->name ?? null,
            'area_id' => $this->area_id,
            'seller' => new SellerDetailsPublicResource($this->seller),
            'store_type' => $this->store_type,
            'name' => $translation->isNotEmpty()
                ? $translation->where('key', 'name')->first()?->value
                : $this->name,
            'slug' => $translation->isNotEmpty()
                ? $translation->where('key', 'slug')->first()?->value
                : $this->slug,
            'phone' => $this->phone,
            'email' => $this->email,
            'description' => $this->meta_description,
            'logo' => $this->logo,
            'tax' => $this->tax,
            'tax_number' => $this->tax_number,
            'business_plan' => $this->subscription_type,
            'delivery_time' => $this->delivery_time,
            'logo_url' => ImageModifier::generateImageUrl($this->logo),
            'banner' => $this->banner,
            'banner_url' => ImageModifier::generateImageUrl($this->banner),
            'address' => $translation->isNotEmpty()
                ? $translation->where('key', 'address')->first()?->value
                : $this->address,
            'is_featured' => $this->is_featured,
            'opening_time' => $this->opening_time,
            'closing_time' => $this->closing_time,
            'started_from' => $this->created_at->format('M d, Y'),
            'veg_status' => $this->veg_status,
            'off_day' => $this->off_day,
            'rating' => $this->rating,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'meta_image_url' => ImageModifier::generateImageUrl($this->meta_image),
            "additional_charge_name" => $store_type_info->additional_charge_enable_disable ? $store_type_info->additional_charge_name : null,
            "additional_charge_amount" => $store_type_info->additional_charge_enable_disable ? $store_type_info->additional_charge_amount : 0,
            "additional_charge_type" => $store_type_info->additional_charge_enable_disable ? $store_type_info->additional_charge_type : 'fixed',
            'total_product' => $this->products()->where('deleted_at', null)->where('status', 'approved')->count(),
            'all_products' => StoreProductListPublicResource::collection($this->products()
                ->where('deleted_at', null)
                ->where('status', 'approved')
                ->with([
                    'variants' => function ($query) {
                        $query->withoutTrashed()->take(1);
                    }
                ])
                ->latest()
                ->get()),
            'featured_products' => StoreProductListPublicResource::collection($this->products()
                ->where('deleted_at', null)
                ->where('status', 'approved')
                ->where('is_featured', 1)
                ->with(['variants' => function ($query) {
                    $query->withoutTrashed()->take(1);
                }])
                ->get()),
        ];
    }
}
