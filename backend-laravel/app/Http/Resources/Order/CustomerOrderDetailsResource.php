<?php

namespace App\Http\Resources\Order;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerOrderDetailsResource extends JsonResource
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
            'product_id' => $this->product_id,
            'product_image_url' => ImageModifier::generateImageUrl($this->product_id),
            'behaviour' => $this->behaviour, // service, digital, consumable, combo
            'product_sku' => $this->product_sku,
            'variant_details' => json_decode($this->variant_details),
            'product_campaign_id' => $this->product_campaign_id,
            'base_price' => $this->base_price,
            'admin_discount_type' => $this->admin_discount_type,
            'admin_discount_rate' => $this->admin_discount_rate,
            'admin_discount_amount' => $this->admin_discount_amount,
            'price' => $this->price,
            'quantity' => $this->quantity,
            'line_total_price_with_qty' => $this->line_total_price_with_qty,
            'coupon_discount_amount' => $this->coupon_discount_amount,
            'line_total_excluding_tax' => $this->line_total_excluding_tax,
            'tax_rate' => $this->tax_rate,
            'tax_amount' => $this->tax_amount,
            'total_tax_amount' => $this->total_tax_amount,
            'line_total_price' => $this->line_total_price,
            'admin_commission_type' => $this->admin_commission_type,
            'admin_commission_rate' => $this->admin_commission_rate,
            'admin_commission_amount' => $this->admin_commission_amount,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
