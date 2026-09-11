<?php

namespace App\Http\Resources\Com\Product;

use App\Actions\ImageModifier;
use App\Models\StoreType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductStorePublicResource extends JsonResource
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
            "id" => $this->id,
            "store_type" => $this->store_type,
            "name" => !empty($translation) && $translation->where('key', 'name')->first()
                ? $translation->where('key', 'name')->first()->value
                : $this->name, // If language is empty or not provided attribute
            "slug" => $this->slug,
            "area_id" => $this->area_id,
            "phone" => $this->phone,
            // 2026-09-11: "email" ve "tax_number" bu resource'tan kaldirildi.
            // Urun detay sayfasi bu iki alani hic kullanmiyordu ama degerler
            // her urun sayfasinin HTML kaynagina dusuyordu; Tanitio SEO
            // katalogu bunu "Acik e-posta adresi 2 (spam botlari toplar)"
            // olarak raporladi ve saticinin sahsi adresi ile vergi
            // numarasi herkese acik hale geliyordu. Satici iletisimi
            // magaza sayfasinda kendi endpoint'inden sunulmaya devam ediyor.
            "logo" => ImageModifier::generateImageUrl($this->logo),
            "banner" => ImageModifier::generateImageUrl($this->banner),
            "address" => $this->address,
            "latitude" => $this->latitude,
            "longitude" => $this->longitude,
            "tax" => $this->tax,
            "delivery_time" => $this->delivery_time,
            "meta_title" => $this->meta_title,
            "meta_description" => $this->meta_description,
            "meta_image" => ImageModifier::generateImageUrl($this->meta_image),
            "total_product" => $this->products_count ?? 0,
            "rating" => $this->rating,
            "additional_charge_name" => $store_type_info?->additional_charge_enable_disable ? $store_type_info->additional_charge_name : null,
            "additional_charge_amount" => $store_type_info?->additional_charge_enable_disable ? round($store_type_info->additional_charge_amount) : 0,
            "additional_charge_type" => $store_type_info?->additional_charge_enable_disable ? $store_type_info->additional_charge_type : 'fixed',
        ];
    }
}
