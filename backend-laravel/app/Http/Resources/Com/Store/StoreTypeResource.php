<?php

namespace App\Http\Resources\Com\Store;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreTypeResource extends JsonResource
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
            "id" => $this->id,
            "name" => !empty($translation) && $translation->where('key', 'name')->first()
                ? $translation->where('key', 'name')->first()->value
                : $this->name,
            "type" => $this->type,
            "image" => $this->image,
            "image_url" => ImageModifier::generateImageUrl($this->image),
            "description" => !empty($translation) && $translation->where('key', 'description')->first()
                ? $translation->where('key', 'description')->first()->value
                : $this->description,
            "additional_charge_enable_disable" => $this->additional_charge_enable_disable,
            "additional_charge_name" => !empty($translation) && $translation->where('key', 'additional_charge_name')->first()
                ? $translation->where('key', 'additional_charge_name')->first()->value
                : $this->additional_charge_name,
            "additional_charge_amount" => $this->additional_charge_amount,
            "additional_charge_type" => $this->additional_charge_type,
            "additional_charge_commission" => $this->additional_charge_commission,
            "total_stores" => $this->total_stores,
            "status" => (int)$this->status,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
        ];
    }
}
