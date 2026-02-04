<?php

namespace App\Http\Resources\Store;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerStoreCommissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subscription_type' => $this->subscription_type,
            'admin_commission_type' => $this->admin_commission_type,
            'admin_commission_amount' => $this->admin_commission_amount,
        ];
    }
}
