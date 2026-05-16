<?php

namespace Tests\Unit;

use App\Services\EInvoice\EInvoiceWebhookVerifier;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EInvoiceWebhookVerifierTest extends TestCase
{
    #[Test]
    public function it_accepts_valid_hmac_signature(): void
    {
        config(['services.einvoice.webhook_secret' => 'test-secret']);

        $body = json_encode([
            'event' => 'invoice.approved',
            'invoice_id' => 1,
            'idempotency_key' => '42',
            'status' => 'approved',
            'occurred_at' => '2026-05-16T10:00:00.000Z',
        ], JSON_THROW_ON_ERROR);

        $timestamp = now('UTC')->toIso8601String();
        $signature = 'sha256='.hash_hmac('sha256', "{$timestamp}.{$body}", 'test-secret');

        $this->assertTrue(
            EInvoiceWebhookVerifier::verify($body, $signature, $timestamp)
        );
    }

    #[Test]
    public function it_rejects_tampered_body(): void
    {
        config(['services.einvoice.webhook_secret' => 'test-secret']);

        $body = '{"event":"invoice.approved"}';
        $timestamp = now('UTC')->toIso8601String();
        $signature = 'sha256='.hash_hmac('sha256', "{$timestamp}.other", 'test-secret');

        $this->assertFalse(
            EInvoiceWebhookVerifier::verify($body, $signature, $timestamp)
        );
    }
}
