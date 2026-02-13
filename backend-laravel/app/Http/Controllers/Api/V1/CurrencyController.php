<?php

namespace App\Http\Controllers\Api\V1;

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
     * Get all active currencies (Public)
     */
    public function index(): JsonResponse
    {
        $currencies = Currency::where('status', true)
            ->orderBy('is_default', 'desc')
            ->orderBy('code')
            ->select('id', 'name', 'code', 'symbol', 'exchange_rate', 'is_default')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $currencies
        ]);
    }

    /**
     * Get default currency (Public)
     */
    public function default(): JsonResponse
    {
        $currency = Currency::where('is_default', true)
            ->where('status', true)
            ->first();

        if (!$currency) {
            $currency = Currency::where('status', true)->first();
        }

        return response()->json([
            'success' => true,
            'data' => $currency
        ]);
    }

    /**
     * Convert amount (Public)
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
                'message' => 'Conversion failed'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'amount' => $validated['amount'],
                'from' => $validated['from'],
                'to' => $validated['to'],
                'converted_amount' => $converted
            ]
        ]);
    }
}
