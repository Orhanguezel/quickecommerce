<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Teslim edilen siparis sonrasi musteriye gonderilen "deneyiminizi paylasin"
 * davet e-postasi. Her urunu kendi sayfasina ?review={orderId} ile linkler;
 * musteri orada yildiz + yorum birakir.
 */
class OrderReviewRequest extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    public function __construct(Order $order)
    {
        $this->order = $order->loadMissing([
            'orderMaster.customer',
            'orderDetail.product',
        ]);
    }

    public function envelope(): Envelope
    {
        $siteName = com_option_get('com_site_title') ?: config('app.name');
        $fromEmail = config('mail.from.address') ?: com_option_get('com_site_email');

        return new Envelope(
            from: $fromEmail ? new Address($fromEmail, $siteName) : null,
            subject: 'Ürününüz nasıldı? Deneyiminizi paylaşır mısınız? 🌟',
        );
    }

    public function content(): Content
    {
        $frontendUrl = rtrim(config('app.frontend_url') ?: env('FRONTEND_URL', config('app.url')), '/');

        // Her urun icin: ad, gorsel, urun sayfasi + yorum linki (?review=orderId)
        $items = collect($this->order->orderDetail)
            ->map(function ($d) use ($frontendUrl) {
                $p = $d->product;
                if (!$p) {
                    return null;
                }
                return [
                    'name'  => $p->name,
                    'image' => \App\Actions\ImageModifier::generateImageUrl($p->image),
                    'url'   => "{$frontendUrl}/tr/urun/{$p->slug}?review={$this->order->id}",
                ];
            })
            ->filter()
            ->values();

        $customerName = trim((string) ($this->order->orderMaster?->customer?->first_name ?? ''));

        return new Content(
            view: 'emails.order-review-request',
            with: [
                'order'        => $this->order,
                'items'        => $items,
                'customerName' => $customerName !== '' ? $customerName : 'Değerli müşterimiz',
                'siteName'     => com_option_get('com_site_title') ?: config('app.name'),
            ],
        );
    }
}
