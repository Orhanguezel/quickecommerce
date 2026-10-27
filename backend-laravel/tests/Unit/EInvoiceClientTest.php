<?php

namespace Tests\Unit;

use App\Services\EInvoice\EInvoiceClient;
use App\Services\EInvoice\EInvoiceClientException;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EInvoiceClientTest extends TestCase
{
    private function client(): EInvoiceClient
    {
        config([
            'services.einvoice.base_url' => 'http://efatura.test',
            'services.einvoice.api_key' => 'tenant-key',
            'services.einvoice.timeout' => 5,
        ]);

        return EInvoiceClient::fromConfig();
    }

    #[Test]
    public function create_sends_api_key_and_idempotency_key(): void
    {
        Http::fake([
            'efatura.test/v1/invoices' => Http::response(
                ['invoice_id' => 99, 'status' => 'pending'],
                202
            ),
        ]);

        $result = $this->client()->create(['buyer' => []], '12345');

        $this->assertSame(99, $result['invoice_id']);
        Http::assertSent(function ($request) {
            return $request->hasHeader('X-Api-Key', 'tenant-key')
                && $request->hasHeader('Idempotency-Key', '12345')
                && $request->method() === 'POST';
        });
    }

    #[Test]
    public function repeat_returns_existing_record_on_200(): void
    {
        Http::fake([
            'efatura.test/v1/invoices' => Http::response(
                ['invoice_id' => 7, 'status' => 'approved'],
                200
            ),
        ]);

        $result = $this->client()->create(['buyer' => []], '7');

        $this->assertSame('approved', $result['status']);
    }

    #[Test]
    public function maps_contract_error_envelope_to_exception(): void
    {
        Http::fake([
            'efatura.test/v1/invoices' => Http::response(
                ['error' => ['code' => 'idempotency_conflict', 'message' => 'Conflict']],
                409
            ),
        ]);

        try {
            $this->client()->create(['buyer' => []], '7');
            $this->fail('Expected EInvoiceClientException');
        } catch (EInvoiceClientException $e) {
            $this->assertSame('Conflict', $e->getMessage());
            $this->assertSame(409, $e->getCode());
        }
    }

    #[Test]
    public function server_error_raises_exception(): void
    {
        Http::fake([
            'efatura.test/v1/invoices/5' => Http::response(null, 500),
        ]);

        $this->expectException(EInvoiceClientException::class);
        $this->client()->getStatus(5);
    }

    #[Test]
    public function throws_when_not_configured(): void
    {
        config([
            'services.einvoice.base_url' => '',
            'services.einvoice.api_key' => '',
        ]);

        $this->expectException(EInvoiceClientException::class);
        EInvoiceClient::fromConfig()->getStatus(1);
    }
}
