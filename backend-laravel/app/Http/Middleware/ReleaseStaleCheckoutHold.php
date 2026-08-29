<?php

namespace App\Http\Middleware;

use App\Services\Order\UnpaidOrderReleaseService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Checkout'a girmeden once, musterinin kendi terk ettigi odenmemis siparisin
 * tuttugu stok rezervini geri verir.
 *
 * Neden burada: stok kontrolu PlaceOrderRequest'in dogrulama kurallarinda
 * yapiliyor ve FormRequest controller'dan ONCE calisiyor. Rezerv controller'a
 * birakilirsa dogrulama zaten 422 ile donmus olur.
 */
class ReleaseStaleCheckoutHold
{
    public function __construct(private UnpaidOrderReleaseService $releaseService) {}

    public function handle(Request $request, Closure $next): Response
    {
        $customer = auth()->guard('api_customer')->user();

        if ($customer) {
            try {
                $this->releaseService->releaseForCustomer((int) $customer->id);
            } catch (\Throwable $e) {
                // Rezerv temizligi checkout'u bloklamaz: basarisiz olursa
                // musteri en fazla eski davranisi (422) gorur, siparis akisi
                // bu yuzden hic durmamali.
                Log::error('[unpaid-order-release] middleware hatasi', [
                    'customer_id' => $customer->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $next($request);
    }
}
