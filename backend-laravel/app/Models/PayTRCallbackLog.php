<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayTRCallbackLog extends Model
{
    protected $table = 'paytr_callback_logs';

    protected $fillable = [
        'merchant_oid',
        'status',
        'total_amount',
        'source_ip',
        'outcome',
        'detail',
        'payload',
        'received_at',
    ];

    protected $casts = [
        'payload'       => 'array',
        'total_amount'  => 'decimal:2',
        'received_at'   => 'datetime',
    ];
}
