<?php

namespace App\Http\Controllers\Api\V1\Webhooks;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\EInvoice;
use App\Services\EInvoice\EInvoiceWebhookVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EinvoiceWebhookController extends Controller
{
    /**
     * POST /api/v1/webhooks/einvoice
     */
    public function handle(Request $request): JsonResponse
    {
        $rawBody = $request->getContent();
        $signature = $request->header('X-Efatura-Signature');
        $timestamp = $request->header('X-Efatura-Timestamp');

        if (! EInvoiceWebhookVerifier::verify($rawBody, $signature, $timestamp)) {
            Log::warning('E-invoice webhook signature rejected', ['ip' => $request->ip()]);

            return response()->json(['message' => 'Invalid signature'], 401);
        }

        /** @var array<string, mixed> $payload */
        $payload = json_decode($rawBody, true) ?? [];

        $orderId = $this->resolveOrderId($payload);
        if ($orderId === null) {
            return response()->json(['message' => 'Unknown order'], 404);
        }

        $einvoice = EInvoice::where('order_id', $orderId)->first();
        if (! $einvoice) {
            return response()->json(['message' => 'E-invoice record not found'], 404);
        }

        $status = (string) ($payload['status'] ?? $einvoice->status);
        $updates = [
            'status' => $status,
            'last_webhook_payload' => $payload,
        ];

        if (! empty($payload['ettn'])) {
            $updates['ettn'] = (string) $payload['ettn'];
        }
        if (! empty($payload['invoice_number'])) {
            $updates['invoice_number'] = (string) $payload['invoice_number'];
        }
        if (array_key_exists('pdf_url', $payload) && $payload['pdf_url'] !== null) {
            $updates['pdf_url'] = (string) $payload['pdf_url'];
        }
        if (isset($payload['invoice_id'])) {
            $updates['service_invoice_id'] = (int) $payload['invoice_id'];
        }

        if ($status === 'approved' && ! $einvoice->sent_at) {
            $updates['sent_at'] = now();
        }
        if (in_array($status, ['cancelled', 'refunded'], true) && ! $einvoice->cancelled_at) {
            $updates['cancelled_at'] = now();
        }

        $einvoice->update($updates);

        return response()->json(['ok' => true]);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function resolveOrderId(array $payload): ?int
    {
        $key = (string) ($payload['idempotency_key'] ?? '');
        if ($key === '') {
            return null;
        }

        if (ctype_digit($key)) {
            return (int) $key;
        }

        if (preg_match('/(\d+)$/', $key, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }
}
