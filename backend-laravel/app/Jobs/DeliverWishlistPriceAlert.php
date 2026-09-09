<?php

namespace App\Jobs;

use App\Models\Product;
use App\Models\UniversalNotification;
use App\Models\Wishlist;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Laravel\Firebase\Facades\Firebase;

class DeliverWishlistPriceAlert implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 60;

    public function __construct(public int $notificationId) {}

    public function handle(): void
    {
        $notification = UniversalNotification::forCustomers()->find($this->notificationId);
        if (!$notification || ($notification->data['type'] ?? null) !== 'wishlist_price_drop') return;
        $wishlist = Wishlist::withoutGlobalScopes()->with('customer')->find($notification->data['wishlist_id']);
        $customer = $wishlist?->customer;
        if (!$wishlist?->price_alert_enabled || !$customer?->isActive() || $customer->is_guest
            || (int) $customer->id !== (int) $notification->notifiable_id) return;
        if (!Product::publiclySellable()->whereKey($wishlist->product_id)->exists()) return;
        $link = rtrim(config('app.url'), '/') . '/tr/urun/' . rawurlencode($notification->data['product_slug']);
        $channels = [
            'email' => $wishlist->price_alert_email && $customer->marketing_email && $customer->email_verified && $customer->email,
            'push' => $wishlist->price_alert_push && ($customer->firebase_token || $customer->fcm_token),
        ];
        foreach ($channels as $channel => $enabled) {
            if (!$enabled) continue;
            $lock = Cache::lock("wishlist-alert:{$notification->id}", 120);
            if (!$lock->get()) continue;
            try {
                $notification->refresh();
                $data = $notification->data;
                if (!empty($data['delivery_attempted'][$channel])) continue;
                // Persist before the external call: a retried job must not send twice.
                $data['delivery_attempted'][$channel] = now()->toIso8601String();
                $notification->data = $data;
                $notification->save();
                if ($channel === 'email') {
                    $text = $notification->message . "\n\nÜrünü incele: " . $link
                        . "\n\nBildirim tercihlerinizi Favorilerim sayfasından değiştirebilirsiniz.";
                    Mail::raw($text, fn ($message) => $message->to($customer->email)->subject($notification->title));
                } else {
                    $token = $customer->firebase_token ?: $customer->fcm_token;
                    Firebase::messaging()->send(CloudMessage::withTarget('token', $token)
                        ->withNotification(Notification::create($notification->title, $notification->message))
                        ->withData(['type' => 'wishlist_price_drop', 'product_id' => (string) $wishlist->product_id,
                            'click_action' => $link]));
                }
            } catch (\Throwable $e) {
                Log::warning('Wishlist price alert delivery failed', ['notification_id' => $notification->id,
                    'channel' => $channel, 'error' => $e->getMessage()]);
            } finally {
                $lock->release();
            }
        }
    }
}
