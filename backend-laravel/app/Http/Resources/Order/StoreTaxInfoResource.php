<?php

namespace App\Http\Resources\Order;

use App\Models\StoreType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreTaxInfoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $store_type_info = StoreType::where('type', $this->store_type)->first();
        return [
            'store_id' => $this->id,
            'tax' => $this->tax,
            'additional_charge_name' => $store_type_info ? $store_type_info->additional_charge_name : null,
            'additional_charge_amount' => $store_type_info ? $store_type_info->additional_charge_amount : null,
            'additional_charge_type' => $store_type_info ? $store_type_info->additional_charge_type : null,
        ];
    }
}
