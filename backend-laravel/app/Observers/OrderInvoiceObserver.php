<?php

namespace App\Observers;

use App\Jobs\CancelEInvoiceJob;
use App\Jobs\CreateEInvoiceJob;
use App\Models\EInvoice;
use App\Models\Order;

class OrderInvoiceObserver
{
    public function updated(Order $order): void
    {
        if (! config('services.einvoice.enabled')) {
            return;
        }

        if ($order->wasChanged('payment_status') && $order->payment_status === 'paid') {
            $this->dispatchCreate($order);

            return;
        }

        if (
            ($order->wasChanged('status') && $order->status === 'cancelled')
            || ($order->wasChanged('refund_status') && in_array($order->refund_status, ['refunded', 'approved'], true))
        ) {
            $this->dispatchCancel($order);
        }
    }

    private function dispatchCreate(Order $order): void
    {
        if (EInvoice::where('order_id', $order->id)->whereNotNull('service_invoice_id')->exists()) {
            return;
        }

        EInvoice::firstOrCreate(
            ['order_id' => $order->id],
            ['status' => 'pending', 'type' => 'earsiv']
        );

        CreateEInvoiceJob::dispatch($order->id);
    }

    private function dispatchCancel(Order $order): void
    {
        $einvoice = EInvoice::where('order_id', $order->id)->first();

        if (! $einvoice?->service_invoice_id || $einvoice->isTerminal()) {
            return;
        }

        CancelEInvoiceJob::dispatch($order->id);
    }
}
