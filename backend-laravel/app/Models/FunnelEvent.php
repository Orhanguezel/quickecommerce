<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FunnelEvent extends Model
{
    protected $fillable = [
        'event',
        'subject',
        'visitor_id',
        'session_id',
        'customer_id',
        'ip_address',
        'user_agent',
        'referer',
        'url',
        'path',
        'locale',
        'device_type',
        'browser',
        'os',
        'is_bot',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'product_id',
        'category_id',
        'order_id',
        'dedupe_key',
        'block_type',
        'amount',
        'meta',
        'occurred_at',
    ];

    protected $casts = [
        'meta'        => 'array',
        'is_bot'      => 'boolean',
        'amount'      => 'decimal:2',
        'occurred_at' => 'datetime',
    ];
}
