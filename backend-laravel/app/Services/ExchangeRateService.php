<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Modules\PaymentGateways\app\Models\Currency;

class ExchangeRateService
{
    private string $apiUrl = 'https://api.exchangerate-api.com/v4/latest/';

    /**
     * Fetch latest exchange rates from API and update currencies
     *
     * @param string $baseCurrency Base currency code (default: USD)
     * @return array
     */
    public function updateExchangeRates(string $baseCurrency = 'USD'): array
    {
        try {
            // Fetch rates from API
            $response = Http::timeout(10)->get($this->apiUrl . $baseCurrency);

            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->status());
            }

            $data = $response->json();

            if (!isset($data['rates'])) {
                throw new \Exception('Invalid API response structure');
            }

            $rates = $data['rates'];
            $updated = 0;
            $errors = [];

            // Update each currency in database
            $currencies = Currency::where('status', true)->get();

            foreach ($currencies as $currency) {
                try {
                    if (isset($rates[$currency->code])) {
                        // If base is USD, rate is direct
                        // If base is different, need to calculate
                        $exchangeRate = $rates[$currency->code];

                        // Update currency
                        $currency->update([
                            'exchange_rate' => $exchangeRate
                        ]);

                        $updated++;
                    } else {
                        $errors[] = "Currency {$currency->code} not found in API response";
                    }
                } catch (\Exception $e) {
                    $errors[] = "Failed to update {$currency->code}: " . $e->getMessage();
                    Log::error("ExchangeRateService: Failed to update {$currency->code}", [
                        'error' => $e->getMessage()
                    ]);
                }
            }

            Log::info('ExchangeRateService: Exchange rates updated', [
                'base_currency' => $baseCurrency,
                'updated_count' => $updated,
                'errors_count' => count($errors)
            ]);

            return [
                'success' => true,
                'base_currency' => $baseCurrency,
                'updated_count' => $updated,
                'total_count' => $currencies->count(),
                'errors' => $errors,
                'timestamp' => now()->toDateTimeString()
            ];

        } catch (\Exception $e) {
            Log::error('ExchangeRateService: Failed to fetch exchange rates', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'timestamp' => now()->toDateTimeString()
            ];
        }
    }

    /**
     * Convert amount from one currency to another
     *
     * @param float $amount
     * @param string $fromCurrency
     * @param string $toCurrency
     * @return float|null
     */
    public function convert(float $amount, string $fromCurrency, string $toCurrency): ?float
    {
        try {
            $from = Currency::where('code', $fromCurrency)->where('status', true)->first();
            $to = Currency::where('code', $toCurrency)->where('status', true)->first();

            if (!$from || !$to) {
                return null;
            }

            // Convert: amount in FROM → USD → TO
            // If rates are based on USD=1
            $amountInUsd = $amount / $from->exchange_rate;
            $convertedAmount = $amountInUsd * $to->exchange_rate;

            return round($convertedAmount, 2);

        } catch (\Exception $e) {
            Log::error('ExchangeRateService: Conversion failed', [
                'amount' => $amount,
                'from' => $fromCurrency,
                'to' => $toCurrency,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get current exchange rate between two currencies
     *
     * @param string $fromCurrency
     * @param string $toCurrency
     * @return float|null
     */
    public function getRate(string $fromCurrency, string $toCurrency): ?float
    {
        try {
            $from = Currency::where('code', $fromCurrency)->where('status', true)->first();
            $to = Currency::where('code', $toCurrency)->where('status', true)->first();

            if (!$from || !$to) {
                return null;
            }

            // Rate = TO / FROM
            return round($to->exchange_rate / $from->exchange_rate, 6);

        } catch (\Exception $e) {
            Log::error('ExchangeRateService: Failed to get rate', [
                'from' => $fromCurrency,
                'to' => $toCurrency,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}
