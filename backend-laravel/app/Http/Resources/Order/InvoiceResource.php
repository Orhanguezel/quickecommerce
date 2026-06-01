<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class InvoiceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // round(null) PHP 8.x'te DEPRECATED — sum() bos koleksiyonda 0 doner
        // ama orderDetail bazen yuklenmemis/null gelebiliyor; (float) cast guvenli.
        $subtotal = round((float) $this->orderDetail?->sum('line_total_price_with_qty'), 2);
        $coupon_discount = round((float) $this->orderDetail?->sum('coupon_discount_amount'), 2);
        $total_tax_amount = round((float) $this->orderDetail?->sum('total_tax_amount'), 2);
        $product_discount_amount = round(abs((float) ($this->product_discount_amount ?? 0)), 2);
        $shipping_charge = round((float) ($this->shipping_charge ?? 0), 2);
        $additional_charge = round((float) ($this->order_additional_charge_amount ?? 0), 2);

        // Total Amount Calculation
        // Use line_total_price (already includes tax and coupon adjustments) for consistency
        $total_amount = round((float) $this->orderDetail?->sum('line_total_price'), 2) + $shipping_charge + $additional_charge;

        // Teslimat adresi siparişin orderAddress'idir (order_master_id ile bağlı).
        // shippingAddress (FK customer_addresses) çoğu siparişte boş olduğundan
        // önce orderAddress, yoksa shippingAddress kullanılır.
        $addr = $this->orderMaster?->orderAddress ?: $this->orderMaster?->shippingAddress;

        $customerName = trim(
            ($this->orderMaster?->customer?->first_name . ' ' . $this->orderMaster?->customer?->last_name)
        );
        if ($customerName === '') {
            $customerName = $this->orderMaster?->customer?->full_name
                ?: ($this->orderMaster?->customer?->name
                ?: ($addr?->name ?: '-'));
        }

        return [
            'customer' => $this->orderMaster?->customer ? [
                'name' => $customerName,
                'email' => $this->orderMaster?->customer?->email,
                'phone' => $this->orderMaster?->customer?->phone ?: $addr?->contact_number,
                'shipping_address' => $addr ? [
                    'house' => $addr->house,
                    'road' => $addr->road,
                    'floor' => $addr->floor,
                    'address' => $addr->address,
                    'district_name' => $addr->district_name ?? null,
                    'city_name' => $addr->city_name ?? null,
                    'postal_code' => $addr->postal_code,
                    'contact' => $addr->contact_number,
                ] : null,
            ] : null,
            'invoice_number' => '#' . $this->invoice_number,
            'invoice_date' => $this->invoice_date ? Carbon::parse($this->invoice_date)->format('d-M-Y') : null,
            'payment_status' => $this->payment_status,
            'items' => $this->orderDetail?->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->product?->name,
                    'description' => $item->product?->description,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'variant' => json_decode($item->variant_details),
                    'amount' => $item->line_total_price_with_qty,
                    'tax_rate' => $item->tax_rate,
                    'tax_amount' => $item->tax_amount,
                    'total_tax_amount' => $item->total_tax_amount,
                ];
            }),
            'subtotal' => $subtotal,
            'coupon_discount' => $coupon_discount,
            'tax_rate_sum' => round((float) $this->orderDetail?->sum('tax_rate'), 2),
            'total_tax_amount' => $total_tax_amount,
            'product_discount_amount' => $product_discount_amount,
            'shipping_charge' => $shipping_charge,
            'additional_charge_name' => $this->order_additional_charge_name,
            'additional_charge' => $additional_charge,
            'total_amount' => round($total_amount, 2), // Final total amount
        ];
    }
}
