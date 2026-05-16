<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EInvoice extends Model
{
    protected $fillable = [
        'order_id',
        'service_invoice_id',
        'status',
        'type',
        'ettn',
        'invoice_number',
        'pdf_url',
        'error_message',
        'last_webhook_payload',
        'attempts',
        'sent_at',
        'cancelled_at',
    ];

    protected $casts = [
        'last_webhook_payload' => 'array',
        'sent_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, ['approved', 'cancelled', 'refunded'], true);
    }
}
