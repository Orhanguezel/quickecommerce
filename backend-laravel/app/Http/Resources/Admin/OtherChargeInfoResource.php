<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OtherChargeInfoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'order_include_tax_amount' => $this->order_include_tax_amount ? true : false,
            'order_additional_charge_enable_disable' => $this->order_additional_charge_enable_disable,
            'order_additional_charge_name' => $this->order_additional_charge_name,
            'order_additional_charge_amount' => $this->order_additional_charge_amount,
        ];
    }
}
