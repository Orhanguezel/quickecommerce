<?php

namespace App\Services\EInvoice;

class EInvoiceWebhookVerifier
{
    public static function verify(string $rawBody, ?string $signature, ?string $timestamp): bool
    {
        $secret = (string) config('services.einvoice.webhook_secret');

        if ($secret === '' || $signature === null || $timestamp === null) {
            return false;
        }

        try {
            $ts = \Carbon\Carbon::parse($timestamp);
            if (abs($ts->diffInSeconds(now('UTC'), false)) > 300) {
                return false;
            }
        } catch (\Exception) {
            return false;
        }

        $expected = 'sha256='.hash_hmac('sha256', "{$timestamp}.{$rawBody}", $secret);

        return hash_equals($expected, $signature);
    }
}
