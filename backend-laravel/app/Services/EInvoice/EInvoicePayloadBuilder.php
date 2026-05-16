<?php

namespace App\Services\EInvoice;

use App\Models\Order;
use Carbon\Carbon;

class EInvoicePayloadBuilder
{
    public function fromOrder(Order $order): array
    {
        $order->loadMissing([
            'orderDetail',
            'orderMaster.orderAddress',
            'orderMaster.customer',
        ]);

        $master = $order->orderMaster;
        $address = $master?->orderAddress;
        $customer = $master?->customer;

        $buyerName = trim((string) ($address?->name
            ?? ($customer ? "{$customer->first_name} {$customer->last_name}" : 'Müşteri')));

        $currency = strtoupper((string) ($master?->currency_code ?? 'TRY'));
        $exchangeRate = $currency !== 'TRY' && $master?->exchange_rate
            ? number_format((float) $master->exchange_rate, 6, '.', '')
            : null;

        $lines = [];
        foreach ($order->orderDetail as $detail) {
            $unitPrice = (float) $detail->price;
            $lines[] = [
                'name' => $this->lineName($detail->variant_details),
                'quantity' => (int) $detail->quantity,
                'unit' => 'Adet',
                'unit_price' => number_format($unitPrice, 2, '.', ''),
                'vat_rate' => (int) round((float) ($detail->tax_rate ?? 20)),
                'discount' => '0.00',
            ];
        }

        $shippingAmount = (float) ($order->shipping_charge ?? $master?->shipping_charge ?? 0);
        $globalDiscount = (float) ($master?->coupon_discount_amount_admin
            ?? $master?->product_discount_amount
            ?? 0);

        $payload = [
            'buyer' => [
                'type' => 'person',
                'name' => $buyerName,
                'tckn_vkn' => (string) config('services.einvoice.default_tckn', '11111111111'),
                'email' => $address?->email ?? $customer?->email,
                'address' => (string) ($address?->address ?? 'Adres belirtilmedi'),
                'city' => (string) ($address?->city_name ?? 'İstanbul'),
                'district' => (string) ($address?->district_name ?? ''),
                'country' => 'Türkiye',
            ],
            'lines' => $lines,
            'global_discount' => number_format(max(0, $globalDiscount), 2, '.', ''),
            'currency' => $currency,
            'exchange_rate' => $exchangeRate,
            'issue_date' => Carbon::now('UTC')->format('Y-m-d\TH:i:s.v\Z'),
            'note' => "Sipariş #{$order->id}",
        ];

        if ($shippingAmount > 0) {
            $payload['shipping'] = [
                'amount' => number_format($shippingAmount, 2, '.', ''),
                'vat_rate' => 20,
            ];
        }

        return $payload;
    }

    private function lineName(mixed $variantDetails): string
    {
        if ($variantDetails === null || $variantDetails === '') {
            return 'Ürün';
        }

        if (is_string($variantDetails)) {
            $decoded = json_decode($variantDetails, true);
            if (is_array($decoded) && isset($decoded['name'])) {
                return (string) $decoded['name'];
            }

            return strlen($variantDetails) > 120
                ? substr($variantDetails, 0, 117).'...'
                : $variantDetails;
        }

        return 'Ürün';
    }
}
