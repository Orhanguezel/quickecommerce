<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\CheckoutStockVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Checkout-oncesi canli stok dogrulama endpoint'i. Musteri "Odemeye Gec"e
 * basinca, siparis olusturulmadan once sepet tedarikci kaynaginda kontrol
 * edilir; tukenmis veya kaynaktan dogrulanamayan urun varsa frontend
 * odeme akisini durdurur.
 */
class CheckoutStockController extends Controller
{
    public function __construct(private readonly CheckoutStockVerifier $verifier) {}

    public function verify(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.variant_id' => 'nullable|integer',
            'items.*.name' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $lines = array_map(fn ($it) => [
            'product_id' => (int) ($it['product_id'] ?? 0),
            'variant_id' => isset($it['variant_id']) ? (int) $it['variant_id'] : null,
            'name' => $it['name'] ?? null,
        ], $request->input('items', []));

        return response()->json([
            'success' => true,
            'data' => $this->verifier->verify($lines),
        ]);
    }
}
