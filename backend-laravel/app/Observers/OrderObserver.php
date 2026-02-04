<?php

namespace App\Observers;

use App\Jobs\DispatchOrderEmails;
use App\Models\Order;
use App\Models\OrderActivity;
use Illuminate\Support\Facades\DB;

class OrderObserver
{
    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        // Dispatch the job to send emails when the order is created
        dispatch(new DispatchOrderEmails($order->id, 'new-order'));
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Check if the order status has changed
        if ($order->isDirty('status')) {
            // check which guard is being used
            if (auth()->guard('api_customer')->check()) {
                $user = auth()->guard('api_customer')->user();
                dispatch(new DispatchOrderEmails($order->id, 'order-status-change-deliveryman'));
            } elseif (auth()->guard('api')->check()) {
                $user = auth()->guard('api')->user();
            }

            // Check if the user is a seller, admin, customer, or deliveryman
            if ($user->activity_scope === 'store_level') {
                dispatch(new DispatchOrderEmails($order->id, 'order-status-change-store'));
            } elseif ($user->activity_scope === 'system_level') {
                dispatch(new DispatchOrderEmails($order->id, 'order-status-change-admin'));
            } elseif ($user->activity_scope === 'delivery_level') {
                dispatch(new DispatchOrderEmails($order->id, 'order-status-change-customer'));
            }
        }
        // If the order is refunded or cancelled then restore the product quantity
        if ($order->isDirty('refund_status') && $order->refund_status === 'refunded' ||
            $order->isDirty('status') && $order->status === 'cancelled') {
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
            $activity_from = 'guest'; // Or 'undefined' / 'system' depending on use case
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
