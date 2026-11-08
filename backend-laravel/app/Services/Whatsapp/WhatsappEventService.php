<?php

namespace App\Services\Whatsapp;

use App\Models\CargoShipment;
use App\Models\Order;
use App\Models\OrderMaster;

final class WhatsappEventService
{
    public function __construct(private WhatsappMessageRecorder $recorder) {}

    private function money($amount, ?string $currency): string
    {
        return number_format((float) $amount, 2, ',', '.').' '.($currency ?: 'TRY');
    }

    public function payment(OrderMaster $master): void
    {
        if (! config('whatsapp.enabled') || $master->payment_status !== 'paid') {
            return;
        }
        $this->recorder->record('payment_confirmed', 'master:'.$master->id, $master->customer_id, $master->id,
            [$master->customer?->first_name ?: 'Müşterimiz', (string) $master->id, $this->money($master->paid_amount ?: $master->order_amount, $master->currency_code)]);
    }

    public function created(OrderMaster $master, array $input): void
    {
        if (! config('whatsapp.enabled')) {
            return;
        }
        $enabled = (bool) ($input['whatsapp_updates'] ?? false);
        $phone = $enabled ? ($input['whatsapp_phone'] ?? '') : '';
        app(WhatsappConsentService::class)->save($master->customer_id, 'order:'.$master->id, $phone, $enabled, 'checkout');
        if ($master->payment_gateway === 'cash_on_delivery') {
            $this->recorder->record('cod_order_accepted', 'master:'.$master->id, $master->customer_id, $master->id,
                [$master->customer?->first_name ?: 'Müşterimiz', (string) $master->id, $this->money($master->order_amount, $master->currency_code)]);
        }
    }

    public function shipment(CargoShipment $shipment): void
    {
        if (! config('whatsapp.enabled') || ! in_array($shipment->status, ['in_transit', 'delivered'])) {
            return;
        }
        $order = $shipment->order;
        $master = $order?->orderMaster;
        if (! $master) {
            return;
        }
        $event = $shipment->status === 'delivered' ? 'shipment_delivered' : 'shipment_dispatched';
        $parameters = [(string) $master->id, (string) $order->id];
        if ($event === 'shipment_dispatched') {
            if (! $shipment->tracking_number && ! $shipment->barcode) {
                return;
            }
            $parameters = [...$parameters, $shipment->carrier_name ?: 'Kargo', $shipment->tracking_number ?: $shipment->barcode];
        }
        $this->recorder->record($event, 'shipment:'.$shipment->id, $master->customer_id, $master->id, $parameters, ['order_id' => $order->id, 'shipment_id' => $shipment->id]);
    }

    public function cancelled(Order $order): void
    {
        if (! config('whatsapp.enabled') || $order->status !== 'cancelled' || $order->refund_status === 'refunded' || ! ($master = $order->orderMaster)) {
            return;
        }
        $this->recorder->record('order_cancelled', 'order:'.$order->id, $master->customer_id, $master->id, [(string) $master->id, (string) $order->id], ['order_id' => $order->id]);
    }

    /** Called only after the payment provider confirmed an actual refund. */
    public function refund(Order $order, string $reference, float $amount): void
    {
        if (! config('whatsapp.enabled') || ! ($master = $order->orderMaster) || $amount <= 0 || $reference === '') {
            return;
        }
        $this->recorder->record('refund_confirmed', $reference, $master->customer_id, $master->id,
            [(string) $master->id, $this->money($amount, $master->currency_code)], ['order_id' => $order->id]);
    }
}
