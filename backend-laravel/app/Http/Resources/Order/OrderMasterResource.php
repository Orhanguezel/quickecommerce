<?php

namespace App\Http\Resources\Order;

use App\Http\Resources\Customer\CustomerResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderMasterResource extends JsonResource
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
            'customer_id' => $this->customer_id,
            'shipping_address_id' => $this->shipping_address_id,
            'shipping_address' => $this->orderAddress ?? null,
            'delivery_charge' => round($this->shipping_charge, 2) ?? 0,
            'product_discount_amount' => round($this->product_discount_amount, 2) ?? 0,
            'order_amount' => $this->order_amount,
            'shipping_charge' => $this->shipping_charge,
            'paid_amount' => $this->paid_amount,
            'payment_gateway' => $this->payment_gateway,
            'payment_status' => $this->payment_status,
            'transaction_ref' => $this->transaction_ref,
            'transaction_details' => $this->transaction_details,
            'order_notes' => $this->order_notes,
            'currency_code' => $this->currency_code,
            'exchange_rate' => $this->exchange_rate,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
        ];
    }
}
