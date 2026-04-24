<?php

namespace App\Jobs;

use App\Mail\AbandonedCartReminderMail;
use App\Models\AbandonedCart;
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
}
