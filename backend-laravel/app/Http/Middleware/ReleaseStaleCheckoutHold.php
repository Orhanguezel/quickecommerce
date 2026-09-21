<?php

namespace App\Http\Middleware;

use App\Services\Order\UnpaidOrderReleaseService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
            // Release + order creation must be one critical section. Without
            // this lock, rapid/concurrent checkout requests can delete the
            // order that another request created milliseconds earlier.
            $checkoutLock = Cache::lock("checkout-order:{$customer->id}", 60);
            if (! $checkoutLock->get()) {
                return response()->json([
                    'success' => false,
                    'code' => 'checkout_in_progress',
                    'message' => 'Siparişiniz işleniyor. Lütfen ödeme sayfasının açılmasını bekleyin.',
                ], 409);
            }

            try {
                try {
                    $this->releaseService->releaseForCustomer((int) $customer->id);
                } catch (\Throwable $e) {
                    Log::error('[unpaid-order-release] middleware hatasi', [
                        'customer_id' => $customer->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                return $next($request);
            } finally {
                $checkoutLock->release();
            }
        }

        return $next($request);
    }
}
