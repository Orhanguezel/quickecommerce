<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\OrderActivity;
use App\Services\Loyalty\LoyaltyService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderObserver
{
    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        // Mail gonderimi burada YAPILMAZ. DispatchOrderEmails order_master_id
        // bekliyor, buraya order id veriliyordu -> yanlis musteriye mail.
        // Siparis olusturma maili OrderService::... icinde dogru id ile atiliyor.
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Check if the order status has changed
        if ($order->isDirty('status')) {
            if ($order->status === 'shipped' && ! $order->shipped_at) {
                $shippedAt = now();
                $order->forceFill([
                    'shipped_at' => $shippedAt,
                    'sla_breached_at' => $order->promised_ship_at && $shippedAt->gt($order->promised_ship_at)
                        ? ($order->sla_breached_at ?? $shippedAt)
                        : $order->sla_breached_at,
                ])->saveQuietly();
            }

            // check which guard is being used
            $user = null;
            if (auth()->guard('api_customer')->check()) {
                $user = auth()->guard('api_customer')->user();
            } elseif (auth()->guard('api')->check()) {
                $user = auth()->guard('api')->user();
            }

            // Durum degisikligi e-postalari BURADAN gonderilmez.
            // Eskiden buradaki 3 dispatch DispatchOrderEmails'e order id
            // veriyordu (order_master_id bekleniyor) -> canli veride 35
            // siparisin 13'unde iki id cakisiyor ve BASKA bir musteriye
            // "Siparisiniz Alindi!" maili gidiyordu. Ustelik durum
            // degisiminde order-created sablonu yanlis icerik demekti.
            // Dogru durum maili: AdminOrderManageController /
            // SellerStoreOrderController -> order-status-{status}.
        }
        // If the order is refunded or cancelled then restore the product quantity
        if ($order->isDirty('refund_status') && $order->refund_status === 'refunded' ||
            $order->isDirty('status') && $order->status === 'cancelled') {
            // Teslimatta verilmis sadakat puanini geri al. Idempotent:
            // benzersiz indeks ayni siparis icin ikinci revoke'u engeller.
            try {
                app(LoyaltyService::class)->revokeForOrder($order);
            } catch (\Throwable $e) {
                Log::error('[loyalty] iptal/iade puani geri alinamadi', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                ]);
            }

            DB::transaction(function () use ($order) {
                foreach ($order->orderDetail as $detail) {
                    if ($detail->productVariant) {
                        $detail->productVariant->increment('stock_quantity', $detail->quantity);
                    }
                }
            });
        }

        $adminOrStoreUser = auth('api')->user();
        $customerUser = auth('api_customer')->user();

        if ($adminOrStoreUser) {
            $activity_from = match ($adminOrStoreUser->activity_scope ?? '') {
                'system_level'   => 'admin',
                'store_level'    => 'store',
                'delivery_level' => 'deliveryman',
                default          => 'unknown',
            };
            $ref_id = $adminOrStoreUser->id;
        } elseif ($customerUser) {
            $activity_from = 'customer';
            $ref_id = $customerUser->id;
        } else {
            $activity_from = 'guest';
            $ref_id = null;
        }
        // Check if status changed
        if ($order->isDirty('status')) {
            OrderActivity::create([
                'order_id' => $order->id,
                'store_id' => $order->store_id,
                'ref_id' => $ref_id,
                'activity_from' => $activity_from ?? 'null',
                'activity_type' => 'order_status',
                'activity_value' => $order->status,
            ]);
        }
        // Check if refund status changed
        if ($order->isDirty('refund_status')) {
            OrderActivity::create([
                'order_id' => $order->id,
                'store_id' => $order->store_id,
                'ref_id' => $ref_id,
                'activity_from' => $activity_from ?? 'null',
                'activity_type' => 'refund_status',
                'activity_value' => $order->refund_status,
            ]);
        }
        // Check if payment status changed
        if ($order->isDirty('payment_status')) {
            OrderActivity::create([
                'order_id' => $order->id,
                'store_id' => $order->store_id,
                'ref_id' => $ref_id,
                'activity_from' => $activity_from ?? 'null',
                'activity_type' => 'payment_status',
                'activity_value' => $order->payment_status,
            ]);
        }
    }

    /**
     * Handle the Order "deleted" event.
     */
    public
    function deleted(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "restored" event.
     */
    public
    function restored(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "force deleted" event.
     */
    public
    function forceDeleted(Order $order): void
    {
        //
    }
}
