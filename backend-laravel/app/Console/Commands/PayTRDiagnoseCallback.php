<?php

namespace App\Console\Commands;

use App\Models\OrderMaster;
use App\Services\PayTRService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Modules\PaymentGateways\app\Models\PaymentGateway;

class PayTRDiagnoseCallback extends Command
{
    protected $signature = 'paytr:diagnose-callback
                            {--merchant-oid= : Existing merchant_oid, e.g. SP123T1710000000}
                            {--status=success : PayTR callback status}
                            {--total-amount= : Callback total_amount in kurus}
                            {--endpoint= : Callback endpoint URL}
                            {--post : POST the generated payload to the callback endpoint}';

    protected $description = 'Generate and optionally POST a PayTR callback payload for diagnostics.';

    public function handle(PayTRService $payTRService): int
    {
        $gateway = PaymentGateway::where('slug', 'paytr')->first();
        if (!$gateway) {
            $this->error('PayTR gateway record not found.');
            return self::FAILURE;
        }

        $credentials = json_decode($gateway->auth_credentials ?? '{}', true);
        if (!is_array($credentials)) {
            $credentials = [];
        }

        try {
            $config = $payTRService->getCredentials();
        } catch (\Throwable) {
            $this->error('PayTR credentials are missing or invalid.');
            return self::FAILURE;
        }

        $merchantOid = (string) ($this->option('merchant-oid') ?: '');
        if ($merchantOid === '') {
            $merchantOid = $this->latestMerchantOid() ?? ('SP0T' . now()->timestamp);
        }

        $status = (string) $this->option('status');
        $totalAmount = (string) ($this->option('total-amount') ?: $this->guessTotalAmount($merchantOid));
        $endpoint = (string) ($this->option('endpoint')
            ?: ($credentials['paytr_callback_url'] ?? (rtrim(config('app.url'), '/') . '/api/v1/paytr/callback')));

        $hash = base64_encode(
            hash_hmac(
                'sha256',
                $merchantOid . $config['merchant_salt'] . $status . $totalAmount,
                $config['merchant_key'],
                true
            )
        );

        $payload = [
            'merchant_oid' => $merchantOid,
            'status' => $status,
            'total_amount' => $totalAmount,
            'hash' => $hash,
        ];

        $verification = $payTRService->verifyCallback($payload);

        $this->info('PayTR callback diagnostics');
        $this->table(
            ['Field', 'Value'],
            [
                ['gateway_status', (string) $gateway->status],
                ['is_test_mode', $gateway->is_test_mode ? 'true' : 'false'],
                ['merchant_id', $config['merchant_id']],
                ['merchant_oid', $merchantOid],
                ['status', $status],
                ['total_amount', $totalAmount],
                ['endpoint', $endpoint],
                ['local_hash_verified', $verification['verified'] ? 'true' : 'false'],
            ]
        );

        $this->line('Payload:');
        $this->line(json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        $this->line('Curl:');
        $this->line(sprintf(
            "curl -X POST %s -H 'Accept: text/plain' -d merchant_oid=%s -d status=%s -d total_amount=%s -d hash=%s",
            escapeshellarg($endpoint),
            escapeshellarg($merchantOid),
            escapeshellarg($status),
            escapeshellarg($totalAmount),
            escapeshellarg($hash)
        ));

        if (!$this->option('post')) {
            return $verification['verified'] ? self::SUCCESS : self::FAILURE;
        }

        try {
            $response = Http::asForm()
                ->timeout(15)
                ->post($endpoint, $payload);
        } catch (\Throwable $e) {
            $this->error('Callback POST failed: ' . $e->getMessage());
            return self::FAILURE;
        }

        $this->table(
            ['Response', 'Value'],
            [
                ['http_status', (string) $response->status()],
                ['body', trim($response->body())],
            ]
        );

        return $response->successful() && trim($response->body()) === 'OK'
            ? self::SUCCESS
            : self::FAILURE;
    }

    private function latestMerchantOid(): ?string
    {
        $orderMaster = OrderMaster::query()
            ->where('payment_gateway', 'paytr')
            ->whereNotNull('transaction_ref')
            ->latest('id')
            ->first();

        return $orderMaster?->transaction_ref;
    }

    private function guessTotalAmount(string $merchantOid): string
    {
        if (preg_match('/^SP(\d+)T/', $merchantOid, $matches)) {
            $orderMaster = OrderMaster::find((int) $matches[1]);
            if ($orderMaster) {
                return (string) ((int) round((float) $orderMaster->order_amount * 100));
            }
        }

        return '100';
    }
}
