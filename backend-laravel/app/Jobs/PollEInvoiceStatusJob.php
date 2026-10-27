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

/**
 * Webhook ulaşmazsa durumu e-fatura-service'ten poll eder (local dev fallback).
 */
class PollEInvoiceStatusJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public function __construct(
        public readonly int $orderId,
        public readonly int $attempt = 0
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
            $result = $client->getStatus($einvoice->service_invoice_id);
        } catch (EInvoiceClientException) {
            $this->reschedule();

            return;
        }

        $status = (string) ($result['status'] ?? $einvoice->status);
        $updates = ['status' => $status];

        if (! empty($result['ettn'])) {
            $updates['ettn'] = (string) $result['ettn'];
        }
        if (! empty($result['invoice_number'])) {
            $updates['invoice_number'] = (string) $result['invoice_number'];
        }
        if (! empty($result['pdf_url'])) {
            $updates['pdf_url'] = (string) $result['pdf_url'];
        }
        if ($status === 'approved' && ! $einvoice->sent_at) {
            $updates['sent_at'] = now();
        }

        $einvoice->update($updates);

        if (! $einvoice->fresh()?->isTerminal()) {
            $this->reschedule();
        }
    }

    private function reschedule(): void
    {
        if ($this->attempt >= 12) {
            return;
        }

        self::dispatch($this->orderId, $this->attempt + 1)
            ->delay(now()->addSeconds(2));
    }
}
