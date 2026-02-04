<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderPackageResource extends JsonResource
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
            'order_id' => $this->order_id,
            'store_id' => $this->store_id,
            'area_id' => $this->area_id,
            'order_type' => $this->order_type,
            'delivery_option' => $this->delivery_option,
            'delivery_type' => $this->delivery_type,
            'order_amount' => $this->order_amount,
            'order_amount_store_value' => $this->order_amount_store_value,
            'order_amount_admin_commission' => $this->order_amount_admin_commission,
            'product_discount_amount' => $this->product_discount_amount,
            'flash_discount_amount_admin' => $this->flash_discount_amount_admin,
            'coupon_discount_amount_admin' => $this->coupon_discount_amount_admin,
            'shipping_charge' => $this->shipping_charge,
            'delivery_charge_admin' => $this->delivery_charge_admin,
            'delivery_charge_admin_commission' => $this->delivery_charge_admin_commission,
            'additional_charge_name' => $this->additional_charge_name,
            'additional_charge' => $this->additional_charge,
            'additional_charge_commission' => $this->additional_charge_commission,
            'is_reviewed' => $this->is_reviewed,
            'status' => $this->status,
            'orderDetails' => OrderDetailsResource::collection($this->whenLoaded('orderDetails')),
            'store' => $this->whenLoaded('store'),
        ];
    }
}
