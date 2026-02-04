<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderMaster;
use App\Models\UniversalNotification;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Laravel\Firebase\Facades\Firebase;

class FirebaseNotificationService
{
    // This method will handle sending notifications for all order-related notifications (for customers, sellers, and admins)
    public function sendOrderNotifications(OrderMaster $orderMaster)
    {
        // Get all orders related to the order master
        $all_orders = Order::with('store.seller')->where('order_master_id', $orderMaster->id)->get();

        // Extract customer token
        $customerToken = optional($orderMaster->customer)->fcm_token;

        // Loop over all orders and send notifications
        foreach ($all_orders as $order) {
            // Extract seller token for each order
            $sellerToken = optional($order->store->seller)->fcm_token;

            // Send notification to customer and seller
            $this->sendOrderPlacedNotification($order, $customerToken, $sellerToken);
        }

        // Send notification to admin
        $this->sendAdminNotification($orderMaster);
    }

    // This method sends a notification to the customer and the seller for a single order
    public function sendOrderPlacedNotification($order, $customerToken, $sellerToken): void
    {
        $title = "Order #{$order->id} Placed";
        $body = "Order placed successfully.";

        $data = [
            'order_id' => $order->id,
            'click_action' => url("/order/{$order->id}"),
        ];

        // Send notification to the customer
        $this->sendToTokens([$customerToken], $title, "Your order has been placed.", $data);

        // Send notification to the seller
        $this->sendToTokens([$sellerToken], $title, "You have received a new order.", $data);
    }

    // This method sends a notification to the admin
    public function sendAdminNotification($orderMaster): void
    {
        // Admin token is typically saved in a config or from a database
        $adminToken = config('app.admin_fcm_token');

        if (!$adminToken) return; // Ensure admin token is available

        // Send notification to admin
        $this->sendToTokens(
            [$adminToken],
            "New Order Placed",
            "OrderMaster ID #{$orderMaster->id} has new orders.",
            ['click_action' => url("/admin/orders/{$orderMaster->id}")]
        );
    }

    // Helper method to send push notifications to a list of tokens
    public function sendToTokens(array $tokens, string $title, string $body, array $data = []): void
    {
        $messaging = Firebase::messaging();

        $notification = UniversalNotification::create($title, $body);

        foreach ($tokens as $token) {
            if (!$token) continue;

            $message = CloudMessage::withTarget('token', $token)
                ->withNotification($notification)
                ->withData($data);

            $messaging->send($message);
        }
    }
}
