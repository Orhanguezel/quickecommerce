<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminTransactionReportResource extends JsonResource
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
            "invoice" => $this->invoice_number,
            "store" => $this->store?->name,
            "area" => $this->area?->name,
            "customer" => $this->orderMaster?->customer?->full_name,

            "total_product_amount" => $this->orderDetail?->sum('line_total_price_with_qty') + $this->orderDetail?->sum('admin_discount_amount'),
            "product_discount_amount" => $this->product_discount_amount,
            "flash_discount_amount_admin" => $this->flash_discount_amount_admin,
            "coupon_discount_amount_admin" => $this->orderdetail?->sum('coupon_discount_amount'),
            "total_tax_amount" => $this->orderDetail?->sum('total_tax_amount'),

            "shipping_charge" => $this->shipping_charge,
            "delivery_charge_admin" => $this->delivery_charge_admin,
            "delivery_charge_admin_commission" => $this->delivery_charge_admin_commission,

            "order_amount" => $this->order_amount,
            "order_amount_store" => $this->order_amount_store_value,
            "order_amount_admin_commission" => $this->order_amount_admin_commission,

            "additional_charge_amount" => $this->order_additional_charge_amount,
            "additional_charge_store_amount" => $this->order_additional_charge_store_amount,
            "admin_additional_charge_commission" => $this->order_admin_additional_charge_commission,

            "payment_gateway" => $this->orderMaster?->payment_gateway,
            "payment_status" => $this->orderMaster?->payment_status,
            "refund_status" => $this->refund_status,
            "status" => $this->status,
        ];
    }
}
