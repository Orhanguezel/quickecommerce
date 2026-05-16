<?php

namespace App\Jobs;

use App\Models\EInvoice;
use App\Models\Order;
use App\Services\EInvoice\EInvoiceClient;
use App\Services\EInvoice\EInvoiceClientException;
use App\Services\EInvoice\EInvoicePayloadBuilder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CreateEInvoiceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public readonly int $orderId) {}

    public function handle(EInvoicePayloadBuilder $builder): void
    {
        if (! config('services.einvoice.enabled')) {
            return;
        }

        $client = EInvoiceClient::fromConfig();

        $order = Order::with([
            'orderDetail',
            'orderMaster.orderAddress',
            'orderMaster.customer',
        ])->find($this->orderId);

        if (! $order) {
            return;
        }

        $einvoice = EInvoice::firstOrCreate(
            ['order_id' => $order->id],
            ['status' => 'pending', 'type' => 'earsiv']
        );

        if ($einvoice->service_invoice_id !== null) {
            return;
        }

        $einvoice->increment('attempts');

        try {
            $payload = $builder->fromOrder($order);
            $result = $client->create($payload, (string) $order->id);

            $einvoice->update([
                'service_invoice_id' => (int) ($result['invoice_id'] ?? 0) ?: null,
                'status' => (string) ($result['status'] ?? 'pending'),
                'error_message' => null,
            ]);

            PollEInvoiceStatusJob::dispatch($order->id)->delay(now()->addSeconds(3));
        } catch (EInvoiceClientException $exception) {
            if ($exception->getCode() === 409) {
                PollEInvoiceStatusJob::dispatch($order->id)->delay(now()->addSeconds(2));

                return;
            }

            $einvoice->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
            ]);

            Log::channel('single')->error('E-invoice create failed', [
                'order_id' => $order->id,
                'message' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }
}
