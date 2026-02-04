<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderPlaced implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;

    public function __construct(Order $order)
    {
        $this->order = $order->loadMissing(['store', 'orderMaster.customer', 'orderMaster.orderAddress']);
    }

    public function broadcastOn()
    {
        $channels = [];

        // Send to customer if available
        $customerId = optional($this->order->orderMaster)->customer_id;
        if ($customerId) {
            $channels[] = new Channel("customer.$customerId");
        }

        // Send to seller if available
        $sellerId = optional($this->order->store)->seller_id;
        if ($sellerId) {
            $channels[] = new Channel("seller.$sellerId");
        }

        // Always notify admin
        $channels[] = new Channel('admin');

        return $channels;
    }

    public function broadcastWith()
    {
        return [
            'order_id' => $this->order->id,
            'store_id' => $this->order?->store_id,
            'seller_id' => optional($this->order->store)->seller_id ?? 0,
            'customer_id' => optional($this->order->orderMaster)->customer_id ?? 0,
            'order_details' => $this->order,
            'message' => 'Order ID #' . $this->order->id . ' placed successfully.',
        ];
    }

    public function broadcastAs()
    {
        return 'order.placed';
    }

}
