<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderCreatedToCustomer extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    public function __construct(Order $order)
    {
        $this->order = $order->loadMissing([
            'orderMaster.customer',
            'orderMaster.orderAddress',
            'orderDetail.product',
            'orderDetail.productVariant',
            'store',
        ]);
    }

    public function envelope(): Envelope
    {
        $siteName = com_option_get('com_site_title') ?: config('app.name');
        $fromEmail = config('mail.from.address') ?: com_option_get('com_site_email');

        return new Envelope(
            from: $fromEmail ? new Address($fromEmail, $siteName) : null,
            subject: "Siparişiniz Alındı — #{$this->order->id}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-created-customer',
            with: [
                'order' => $this->order,
                'siteName' => com_option_get('com_site_title') ?: config('app.name'),
                'frontendUrl' => env('FRONTEND_URL', config('app.url')),
            ],
        );
    }
}
