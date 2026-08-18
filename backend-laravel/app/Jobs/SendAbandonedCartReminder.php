<?php

namespace App\Jobs;

use App\Mail\AbandonedCartReminderMail;
use App\Models\AbandonedCart;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Sends a single abandoned-cart reminder email and marks the stage timestamp
 * on the row so the dispatcher doesn't re-send.
 */
class SendAbandonedCartReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public int $abandonedCartId,
        public int $stage,
        public ?string $couponCode = null,
        public ?int $couponDiscountPercent = null
    ) {}

    public function handle(): void
    {
        $cart = AbandonedCart::find($this->abandonedCartId);
        if (!$cart) return;
        if (!empty($cart->recovered_at)) return;      // already purchased
        if (!empty($cart->unsubscribed_at)) return;   // user opted out
        if (empty($cart->email)) return;              // no delivery address
        if (! $cart->customer || ! $cart->customer->marketing_email) return;
        if (! $this->cartIsStillSellable($cart)) return;

        $windowExpired = ! $cart->reminder_window_started_at
            || $cart->reminder_window_started_at->lt(now()->subDays(30));
        if ($windowExpired) {
            $cart->reminder_window_started_at = now();
            $cart->reminder_count_30d = 0;
        }
        if ($cart->reminder_count_30d >= max(1, (int) config('commerce.abandoned_cart_max_reminders_30d', 3))) {
            return;
        }

        // Idempotence guard — skip if this stage has already been sent
        $stageColumn = match ($this->stage) {
            1 => 'first_reminded_at',
            2 => 'second_reminded_at',
            3 => 'third_reminded_at',
            default => null,
        };
        if ($stageColumn === null || !empty($cart->{$stageColumn})) {
            return;
        }

        $siteUrl = rtrim(config('app.url') ?: env('APP_URL', ''), '/');

        try {
            Mail::to($cart->email)->send(new AbandonedCartReminderMail(
                cart: $cart,
                stage: $this->stage,
                siteUrl: $siteUrl,
                couponCode: $this->couponCode,
                couponDiscountPercent: $this->couponDiscountPercent,
            ));

            $cart->{$stageColumn} = now();
            $cart->last_reminded_at = now();
            $cart->reminder_count_30d++;
            $cart->save();
        } catch (\Throwable $e) {
            Log::warning('Abandoned cart reminder send failed', [
                'cart_id' => $cart->id,
                'stage'   => $this->stage,
                'error'   => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function cartIsStillSellable(AbandonedCart $cart): bool
    {
        foreach ($cart->items_snapshot ?? [] as $item) {
            $quantity = max(1, (int) ($item['quantity'] ?? 1));
            $variantId = (int) ($item['variant_id'] ?? 0);
            if ($variantId > 0) {
                $variant = ProductVariant::query()->publiclySellable()->find($variantId);
                if (! $variant || (int) $variant->stock_quantity < $quantity) return false;
                continue;
            }

            if (! Product::query()->publiclySellable()->whereKey((int) ($item['product_id'] ?? 0))->exists()) {
                return false;
            }
        }

        return ! empty($cart->items_snapshot);
    }
}
