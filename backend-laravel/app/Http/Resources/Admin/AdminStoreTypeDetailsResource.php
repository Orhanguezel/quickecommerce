<?php

namespace App\Http\Resources\Admin;

use App\Actions\ImageModifier;
use App\Http\Resources\Translation\StoreTypeTranslationResource;
use App\Http\Resources\Translation\VehicleTypeTranslationResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminStoreTypeDetailsResource extends JsonResource
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
            "name" => $this->name,
            "type" => $this->type,
            "image" => $this->image,
            "image_url" => ImageModifier::generateImageUrl($this->image),
            "description" => $this->description,
            "total_stores" => $this->total_stores,
            "additional_charge_enable_disable" => (int)$this->additional_charge_enable_disable,
            "additional_charge_name" =>  $this->additional_charge_name,
            "additional_charge_amount" => $this->additional_charge_amount,
            "additional_charge_type" => $this->additional_charge_type,
            "additional_charge_commission" => $this->additional_charge_commission,
            "status" => (int)$this->status,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
            "translations" => StoreTypeTranslationResource::collection($this->related_translations->groupBy('language')),
        ];
    }
}
