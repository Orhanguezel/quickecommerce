<?php

namespace App\Services;

use App\Jobs\DeliverWishlistPriceAlert;
use App\Models\Product;
use App\Models\UniversalNotification;
use App\Models\Wishlist;
use Illuminate\Support\Facades\DB;

class WishlistPriceAlertService
{
    /** Prices are integer kuruş, keyed by stable variant ID. */
    public function snapshot(Product $product): array
    {
        $flash = Product::withoutEvents(fn () => $product->isInFlashDeal());
        $prices = [];
        foreach ($product->variants as $variant) {
            if (!$variant->isPubliclySellable()) {
                continue;
            }
            $price = $variant->effectivePrice();
            if ($flash && (float) $flash['discount_amount'] > 0) {
                $price -= $flash['discount_type'] === 'percentage'
                    ? $price * (float) $flash['discount_amount'] / 100
                    : (float) $flash['discount_amount'];
            }
            $minor = (int) round($price * 100);
            if ($minor > 0) {
                $prices[(string) $variant->id] = $minor;
            }
        }
        return $prices;
    }

    /** Keep comparisons within one variant; notify each reduced price once. */
    public function drops(array $previous, array $current, array $notified): array
    {
        $drops = [];
        foreach ($current as $variantId => $price) {
            $old = $previous[$variantId] ?? null;
            $key = $variantId . ':' . $price;
            if (is_numeric($old) && $old > $price && $price > 0 && !isset($notified[$key])) {
                $drops[] = ['variant_id' => (int) $variantId, 'old_price' => (int) $old, 'new_price' => $price];
            }
        }
        usort($drops, fn ($a, $b) => ($b['old_price'] - $b['new_price']) <=> ($a['old_price'] - $a['new_price']));
        return $drops;
    }

    public function check(int $wishlistId, bool $apply = false): bool
    {
        return DB::transaction(function () use ($wishlistId, $apply) {
            $wishlist = Wishlist::withoutGlobalScopes()->whereKey($wishlistId)->lockForUpdate()->first();
            if (!$wishlist || !$wishlist->price_alert_enabled) {
                return false;
            }
            $product = Product::with('variants')->publiclySellable()->whereKey($wishlist->product_id)->first();
            $customer = $wishlist->customer;
            if (!$product || !$customer || !$customer->isActive() || $customer->is_guest) {
                return false;
            }
            $prices = $this->snapshot($product);
            $notified = $wishlist->price_alert_notified ?? [];
            $drops = $this->drops($wishlist->price_alert_snapshot ?? [], $prices, $notified);
            // Keep pending drops until the daily per-product limit expires.
            if ($drops && $wishlist->last_price_alert_at?->gt(now()->subDay())) {
                return false;
            }
            if (!$apply) {
                return $drops !== [];
            }
            $wishlist->price_alert_snapshot = $prices;
            if ($drops) {
                $drop = $drops[0];
                foreach ($drops as $entry) {
                    $notified[$entry['variant_id'] . ':' . $entry['new_price']] = true;
                }
                $wishlist->price_alert_notified = $notified;
                $wishlist->last_price_alert_at = now();
                $variant = $product->variants->firstWhere('id', $drop['variant_id']);
                $variantLabel = in_array($variant?->variant_slug, ['default', 'Default Title', null], true)
                    ? '' : ' (' . $variant->variant_slug . ')';
                $message = $product->name . $variantLabel . ': '
                    . number_format($drop['old_price'] / 100, 2, ',', '.') . ' TL → '
                    . number_format($drop['new_price'] / 100, 2, ',', '.') . ' TL';
                $notification = UniversalNotification::create([
                    'notifiable_id' => $customer->id, 'notifiable_type' => 'customer',
                    'title' => 'Favorinizin fiyatı düştü', 'message' => $message, 'status' => 'unread',
                    'data' => ['type' => 'wishlist_price_drop', 'wishlist_id' => $wishlist->id,
                        'product_id' => $product->id, 'product_slug' => $product->slug,
                        'variant_id' => $drop['variant_id'], 'currency' => 'TRY',
                        'old_price' => $drop['old_price'] / 100, 'new_price' => $drop['new_price'] / 100],
                ]);
                if ($wishlist->price_alert_email || $wishlist->price_alert_push) {
                    DeliverWishlistPriceAlert::dispatch($notification->id)->afterCommit();
                }
            }
            $wishlist->save();
            return $drops !== [];
        });
    }
}
