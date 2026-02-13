<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Services\ExchangeRateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\PaymentGateways\app\Models\Currency;

class CurrencyController extends Controller
{
    public function __construct(private ExchangeRateService $exchangeRateService)
    {
    }

    /**
     * Get all currencies
     */
    public function index(): JsonResponse
    {
        $currencies = Currency::orderBy('is_default', 'desc')
            ->orderBy('code')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $currencies
        ]);
    }

    /**
     * Update exchange rates from API
     */
    public function updateRates(Request $request): JsonResponse
    {
        $request->validate([
            'base_currency' => 'nullable|string|size:3'
        ]);

        $baseCurrency = $request->input('base_currency', 'USD');

        $result = $this->exchangeRateService->updateExchangeRates($baseCurrency);

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Update single currency
     */
    public function update(Request $request, Currency $currency): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'symbol' => 'sometimes|string|max:10',
            'exchange_rate' => 'sometimes|numeric|min:0',
            'is_default' => 'sometimes|boolean',
            'status' => 'sometimes|boolean',
        ]);

        // If setting as default, remove default from others
        if (isset($validated['is_default']) && $validated['is_default']) {
            Currency::where('id', '!=', $currency->id)->update(['is_default' => false]);
        }

        $currency->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Currency updated successfully',
            'data' => $currency
        ]);
    }

    /**
     * Convert amount between currencies
     */
    public function convert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'from' => 'required|string|size:3',
            'to' => 'required|string|size:3',
        ]);

        $converted = $this->exchangeRateService->convert(
            $validated['amount'],
            $validated['from'],
            $validated['to']
        );

        if ($converted === null) {
            return response()->json([
                'success' => false,
                'message' => 'Conversion failed. Check currency codes.'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'amount' => $validated['amount'],
                'from' => $validated['from'],
                'to' => $validated['to'],
                'converted_amount' => $converted,
                'rate' => $this->exchangeRateService->getRate($validated['from'], $validated['to'])
            ]
        ]);
    }

    /**
     * Get exchange rate between two currencies
     */
    public function getRate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'required|string|size:3',
            'to' => 'required|string|size:3',
        ]);

        $rate = $this->exchangeRateService->getRate($validated['from'], $validated['to']);

        if ($rate === null) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get rate. Check currency codes.'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'from' => $validated['from'],
                'to' => $validated['to'],
                'rate' => $rate
            ]
        ]);
    }
}
