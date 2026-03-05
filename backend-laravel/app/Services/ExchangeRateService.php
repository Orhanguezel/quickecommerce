<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\ProductVariant;
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

            $sync = $this->syncVariantBasePricesFromInputCurrency();

            return [
                'success' => true,
                'base_currency' => $baseCurrency,
                'updated_count' => $updated,
                'total_count' => $currencies->count(),
                'variant_price_synced' => $sync['updated_count'] ?? 0,
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

    /**
     * Rebuild base product variant prices from anchored input currency amounts.
     * This keeps "input currency" values fixed while exchange rates change.
     */
    public function syncVariantBasePricesFromInputCurrency(): array
    {
        try {
            $defaultCurrency = Currency::where('is_default', true)
                ->where('status', true)
                ->first();
            if (!$defaultCurrency) {
                $defaultCurrency = Currency::where('status', true)->first();
            }
            if (!$defaultCurrency || (float) $defaultCurrency->exchange_rate <= 0) {
                return ['success' => false, 'updated_count' => 0, 'message' => 'Default currency missing'];
            }

            $currenciesByCode = Currency::where('status', true)
                ->get()
                ->keyBy(fn ($c) => strtoupper((string) $c->code));

            $updatedCount = 0;
            ProductVariant::query()
                ->whereNotNull('price_input_currency_code')
                ->whereNotNull('price_input_amount')
                ->chunkById(500, function ($variants) use (&$updatedCount, $currenciesByCode, $defaultCurrency) {
                    foreach ($variants as $variant) {
                        $inputCode = strtoupper((string) $variant->price_input_currency_code);
                        $inputCurrency = $currenciesByCode->get($inputCode);
                        if (!$inputCurrency || (float) $inputCurrency->exchange_rate <= 0) {
                            continue;
                        }

                        $nextPrice = round(
                            ((float) $variant->price_input_amount) *
                                ((float) $defaultCurrency->exchange_rate / (float) $inputCurrency->exchange_rate),
                            2
                        );

                        $nextSpecialPrice = $variant->special_price;
                        if (
                            !empty($variant->special_price_input_currency_code) &&
                            $variant->special_price_input_amount !== null
                        ) {
                            $specialCode = strtoupper((string) $variant->special_price_input_currency_code);
                            $specialCurrency = $currenciesByCode->get($specialCode) ?? $inputCurrency;
                            if ($specialCurrency && (float) $specialCurrency->exchange_rate > 0) {
                                $nextSpecialPrice = round(
                                    ((float) $variant->special_price_input_amount) *
                                        ((float) $defaultCurrency->exchange_rate / (float) $specialCurrency->exchange_rate),
                                    2
                                );
                            }
                        }

                        $variant->price = $nextPrice;
                        $variant->special_price = $nextSpecialPrice;
                        $variant->save();
                        $updatedCount++;
                    }
                });

            return ['success' => true, 'updated_count' => $updatedCount];
        } catch (\Exception $e) {
            Log::error('ExchangeRateService: Variant price sync failed', [
                'error' => $e->getMessage(),
            ]);

            return ['success' => false, 'updated_count' => 0, 'message' => $e->getMessage()];
        }
    }
}
