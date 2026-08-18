<?php

namespace App\Mail;

use App\Http\Controllers\Api\V1\AbandonedCartController;
use App\Models\AbandonedCart;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Reminder email for a cart the user left without checking out.
 *
 * One Mailable class handles all 3 stages — subject, urgency copy and
 * optional incentive (coupon) change depending on $stage.
 *
 * Stage rules:
 *   1 → sent 1 hour after abandonment, no coupon, gentle reminder.
 *   2 → 24 hours after, includes a %10 coupon.
 *   3 → 48 hours after, last reminder, larger %15 coupon + urgency language.
 */
class AbandonedCartReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public AbandonedCart $cart;
    public int $stage;
    public ?string $couponCode;
    public ?int $couponDiscountPercent;
    public string $unsubscribeUrl;
    public string $cartUrl;

    public function __construct(
        AbandonedCart $cart,
        int $stage,
        string $siteUrl,
        ?string $couponCode = null,
        ?int $couponDiscountPercent = null
    ) {
        $this->cart = $cart;
        $this->stage = max(1, min(3, $stage));
        $this->couponCode = $couponCode;
        $this->couponDiscountPercent = $couponDiscountPercent;

        $locale = $cart->locale ?: 'tr';
        $token = AbandonedCartController::unsubscribeToken($cart->id);
        $baseUrl = rtrim($siteUrl, '/');

        $variant = $cart->recovery_variant ?: 'message_a';
        $this->cartUrl = "{$baseUrl}/{$locale}/sepet?utm_source=recovery&utm_medium=email&utm_campaign=abandoned_cart_{$this->stage}&utm_content={$variant}";
        $this->unsubscribeUrl = "{$baseUrl}/{$locale}/sepet/unsubscribe?token=" . urlencode($token);
    }

    public function build()
    {
        $subject = match ($this->stage) {
            1 => __('Sepetinizde ürünler sizi bekliyor'),
            2 => $this->couponCode
                ? __('Sepetiniz için özel bir indirim kazandınız!')
                : __('Sepetinizdeki ürünlere tekrar göz atın'),
            3 => $this->couponCode
                ? __('Son hatırlatma: sepet avantajınızı kaçırmayın')
                : __('Son hatırlatma: ürünleriniz hâlâ sepetinizde'),
            default => __('Sepetinizde ürünler sizi bekliyor'),
        };

        return $this->subject($subject)
            ->view('emails.abandoned-cart-reminder')
            ->with([
                'cart'                   => $this->cart,
                'items'                  => $this->cart->items_snapshot ?? [],
                'stage'                  => $this->stage,
                'couponCode'             => $this->couponCode,
                'couponDiscountPercent'  => $this->couponDiscountPercent,
                'cartUrl'                => $this->cartUrl,
                'unsubscribeUrl'         => $this->unsubscribeUrl,
                'variant'               => $this->cart->recovery_variant ?: 'message_a',
            ]);
    }
}
