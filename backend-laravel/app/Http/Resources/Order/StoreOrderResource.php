<?php

namespace App\Http\Resources\Order;

use App\Http\Resources\Deliveryman\DeliverymanResource;
use App\Http\Resources\Store\StoreDetailsForOrderResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreOrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $language = $request->input('language', 'en');
        $translation = $this->store?->related_translations->where('language', $language);
        return [
            'order_id' => $this->id,
            'store' => !empty($translation) && $translation->where('key', 'name')->first()
                ? $translation->where('key', 'name')->first()->value
                : $this->store?->name, // If language is empty or not provided attribute
            'customer_name' => $this->orderMaster?->customer?->full_name,
            'invoice_number' => $this->invoice_number,
            'order_date' => $this->created_at,
            'invoice_date' => $this->invoice_date,
            'order_type' => $this->order_type,
            'delivery_option' => $this->delivery_option,
            'delivery_type' => $this->delivery_type,
            'delivery_time' => $this->delivery_time,
            'order_amount' => $this->order_amount,
            'product_discount_amount' => $this->product_discount_amount,
            'shipping_charge' => $this->shipping_charge,
            'additional_charge_amount' => $this->order_additional_charge_amount,
            'additional_charge_store_amount' => $this->order_additional_charge_store_amount,
            'admin_additional_charge_commission' => $this->order_admin_additional_charge_commission,
            'is_reviewed' => $this->is_reviewed,
            'confirmed_by' => $this->confirmed_by,
            'confirmed_at' => $this->confirmed_at,
            'cancel_request_at' => $this->cancel_request_at,
            'cancelled_at' => $this->cancelled_at,
            'delivery_completed_at' => $this->delivery_completed_at,
            'payment_status' => $this->payment_status,
            'status' => $this->status,
            'refund_status' => $this->refund_status,
            'store_details' => new StoreDetailsForOrderResource($this->whenLoaded('store')),
            'deliveryman' => new DeliverymanResource($this->whenLoaded('deliveryman')),
            'order_master' => new OrderMasterResource($this->whenLoaded('orderMaster')),
            'order_details' => OrderDetailsResource::collection($this->whenLoaded('orderDetail')),
            'admin_commission' => $this->order_amount_admin_commission,
            'store_amount' => $this->order_amount_store_value,
        ];
    }
}
