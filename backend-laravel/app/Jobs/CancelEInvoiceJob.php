<?php

namespace App\Jobs;

use App\Models\EInvoice;
use App\Services\EInvoice\EInvoiceClient;
use App\Services\EInvoice\EInvoiceClientException;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CancelEInvoiceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public readonly int $orderId,
        public readonly string $reason = 'Sipariş iptal/iade'
    ) {}

    public function handle(): void
    {
        if (! config('services.einvoice.enabled')) {
            return;
        }

        $einvoice = EInvoice::where('order_id', $this->orderId)->first();

        if (! $einvoice?->service_invoice_id || $einvoice->isTerminal()) {
            return;
        }

        $client = EInvoiceClient::fromConfig();

        try {
            $result = $client->cancel($einvoice->service_invoice_id, $this->reason);

            $einvoice->update([
                'status' => (string) ($result['status'] ?? $einvoice->status),
            ]);
        } catch (EInvoiceClientException $exception) {
            Log::channel('single')->error('E-invoice cancel failed', [
                'order_id' => $this->orderId,
                'service_invoice_id' => $einvoice->service_invoice_id,
                'message' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }
}
