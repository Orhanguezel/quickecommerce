<?php

namespace App\Mail;

use App\Models\OrderMaster;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Tedarikci stogu tukendigi icin otomatik iade yapilan siparislerde
 * musteriye gonderilen bilgilendirme e-postasi.
 * IyzicoRefundService::markOrdersRefunded icinden, iade DB'ye yazildiktan
 * sonra (yalnizca yeni iade edilen sub-order'lar icin) queue'lanir.
 */
class OrderRefundedStockOut extends Mailable
{
    use Queueable, SerializesModels;

    public OrderMaster $master;
    public array $refundedOrderIds;
    public bool $isPartial;
    public int $primaryOrderId;

    public function __construct(OrderMaster $master, array $refundedOrderIds, bool $isPartial)
    {
        $this->refundedOrderIds = array_values(array_map('intval', $refundedOrderIds));
        $this->isPartial = $isPartial;
        $this->primaryOrderId = $this->refundedOrderIds[0] ?? (int) $master->id;
        $this->master = $master->loadMissing([
            'customer',
            'orders.orderDetail.product',
            'orders.orderDetail.productVariant',
            'orders.store',
        ]);
    }

    public function envelope(): Envelope
    {
        $siteName = com_option_get('com_site_title') ?: config('app.name');
        $fromEmail = config('mail.from.address') ?: com_option_get('com_site_email');

        return new Envelope(
            from: $fromEmail ? new Address($fromEmail, $siteName) : null,
            subject: "Siparişiniz İade Edildi — #{$this->primaryOrderId}",
        );
    }

    public function content(): Content
    {
        $refundedOrders = $this->master->orders
            ->whereIn('id', $this->refundedOrderIds)
            ->values();

        $refundAmount = (float) $refundedOrders->sum(fn ($o) => (float) ($o->order_amount ?? 0));

        return new Content(
            view: 'emails.order-refunded-stockout',
            with: [
                'master' => $this->master,
                'refundedOrders' => $refundedOrders,
                'refundAmount' => $refundAmount,
                'isPartial' => $this->isPartial,
                'siteName' => com_option_get('com_site_title') ?: config('app.name'),
                'frontendUrl' => env('FRONTEND_URL', config('app.url')),
            ],
        );
    }
}
