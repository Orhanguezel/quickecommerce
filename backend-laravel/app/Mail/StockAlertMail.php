<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class StockAlertMail extends Mailable
{
    public function __construct(
        public string $kind,
        public string $productName,
        public string $primaryUrl,
        public ?string $unsubscribeUrl = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->kind === 'confirm'
            ? 'Stok bildirimi talebinizi doğrulayın'
            : 'Beklediğiniz ürün yeniden stokta');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.stock-alert');
    }
}
