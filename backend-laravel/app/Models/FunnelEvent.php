<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FunnelEvent extends Model
{
    protected $fillable = [
        'event',
        'subject',
        'customer_id',
        'product_id',
        'block_type',
        'amount',
        'meta',
        'occurred_at',
    ];

    protected $casts = [
        'meta'        => 'array',
        'amount'      => 'decimal:2',
        'occurred_at' => 'datetime',
    ];
}
