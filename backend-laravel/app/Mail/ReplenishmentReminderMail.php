<?php

namespace App\Mail;

use App\Actions\ImageModifier;
use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class ReplenishmentReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Customer $customer, public Collection $details) {}

    public function envelope(): Envelope
    {
        $siteName = com_option_get('com_site_title') ?: config('app.name');
        $fromEmail = config('mail.from.address') ?: com_option_get('com_site_email');

        return new Envelope(
            from: $fromEmail ? new Address($fromEmail, $siteName) : null,
            subject: 'Kullandığınız ürünleri yenileme zamanı gelmiş olabilir',
        );
    }

    public function content(): Content
    {
        $frontendUrl = rtrim(config('app.frontend_url') ?: env('FRONTEND_URL', config('app.url')), '/');
        $items = $this->details->map(fn ($detail) => [
            'name' => $detail->product->name,
            'image' => ImageModifier::generateImageUrl($detail->product->image),
            'url' => "{$frontendUrl}/tr/urun/{$detail->product->slug}?utm_source=lifecycle&utm_medium=email&utm_campaign=replenishment",
        ]);

        return new Content(view: 'emails.replenishment-reminder', with: [
            'customerName' => $this->customer->first_name ?: 'Değerli müşterimiz',
            'items' => $items,
            'accountUrl' => "{$frontendUrl}/tr/hesabim",
            'siteName' => com_option_get('com_site_title') ?: config('app.name'),
        ]);
    }
}
