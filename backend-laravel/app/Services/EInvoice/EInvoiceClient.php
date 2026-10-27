<?php

namespace App\Services\EInvoice;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class EInvoiceClient
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly string $apiKey
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            rtrim((string) config('services.einvoice.base_url'), '/'),
            (string) config('services.einvoice.api_key')
        );
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array<string, mixed>
     */
    public function create(array $body, string $idempotencyKey): array
    {
        return $this->request('post', '/v1/invoices', $body, [
            'Idempotency-Key' => $idempotencyKey,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function getStatus(int $serviceInvoiceId): array
    {
        return $this->request('get', "/v1/invoices/{$serviceInvoiceId}");
    }

    public function getPdfUrl(int $serviceInvoiceId): string
    {
        return "{$this->baseUrl}/v1/invoices/{$serviceInvoiceId}/pdf";
    }

    /**
     * Fatura PDF'ini sunucu tarafında (X-Api-Key ile) indirir.
     *
     * Servis PDF endpoint'i kimlik doğrulama ister ve gerçek dosyaya 302
     * yönlendirir; müşteri tarayıcısı bu anahtarı taşıyamayacağı için
     * baytlar burada alınıp controller üzerinden stream edilir.
     *
     * @return array{contents: string, contentType: string}
     */
    public function fetchPdf(int $serviceInvoiceId): array
    {
        if ($this->baseUrl === '' || $this->apiKey === '') {
            throw new EInvoiceClientException('E-invoice service is not configured');
        }

        try {
            $response = Http::timeout((int) config('services.einvoice.timeout', 30))
                ->withHeaders(['X-Api-Key' => $this->apiKey])
                ->withOptions(['allow_redirects' => true])
                ->get("{$this->baseUrl}/v1/invoices/{$serviceInvoiceId}/pdf");
        } catch (RequestException $exception) {
            throw new EInvoiceClientException(
                $exception->getMessage(),
                $exception->response?->status() ?? 0,
                $exception
            );
        }

        if ($response->failed()) {
            throw new EInvoiceClientException(
                $response->json('error.message') ?? 'E-invoice PDF request failed',
                $response->status()
            );
        }

        return [
            'contents' => $response->body(),
            'contentType' => $response->header('Content-Type') ?: 'application/pdf',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function cancel(int $serviceInvoiceId, string $reason): array
    {
        return $this->request('post', "/v1/invoices/{$serviceInvoiceId}/cancel", [
            'reason' => $reason,
        ]);
    }

    /**
     * @param  array<string, mixed>|null  $body
     * @param  array<string, string>  $extraHeaders
     * @return array<string, mixed>
     */
    private function request(
        string $method,
        string $path,
        ?array $body = null,
        array $extraHeaders = []
    ): array {
        if ($this->baseUrl === '' || $this->apiKey === '') {
            throw new EInvoiceClientException('E-invoice service is not configured');
        }

        $pending = Http::timeout((int) config('services.einvoice.timeout', 30))
            ->acceptJson()
            ->withHeaders(array_merge([
                'X-Api-Key' => $this->apiKey,
            ], $extraHeaders));

        try {
            $response = match ($method) {
                'get' => $pending->get("{$this->baseUrl}{$path}"),
                'post' => $pending->post("{$this->baseUrl}{$path}", $body ?? []),
                default => throw new EInvoiceClientException("Unsupported method {$method}"),
            };
        } catch (RequestException $exception) {
            $message = $exception->response?->json('error.message')
                ?? $exception->getMessage();
            throw new EInvoiceClientException($message, $exception->response?->status() ?? 0, $exception);
        }

        if ($response->failed()) {
            throw new EInvoiceClientException(
                $response->json('error.message') ?? 'E-invoice request failed',
                $response->status()
            );
        }

        return $response->json() ?? [];
    }
}
