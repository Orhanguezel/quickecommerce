<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AbandonedCart extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'email',
        'session_id',
        'items_snapshot',
        'item_count',
        'cart_total',
        'currency_code',
        'recovery_variant',
        'recovered_order_master_id',
        'incentive_cost',
        'reminder_count_30d',
        'reminder_window_started_at',
        'last_reminded_at',
        'locale',
        'last_activity_at',
        'abandoned_at',
        'first_reminded_at',
        'second_reminded_at',
        'third_reminded_at',
        'recovered_at',
        'unsubscribed_at',
    ];

    protected $casts = [
        'items_snapshot'       => 'array',
        'cart_total'           => 'decimal:2',
        'incentive_cost'       => 'decimal:2',
        'item_count'           => 'integer',
        'reminder_count_30d'   => 'integer',
        'reminder_window_started_at' => 'datetime',
        'last_reminded_at'     => 'datetime',
        'last_activity_at'     => 'datetime',
        'abandoned_at'         => 'datetime',
        'first_reminded_at'    => 'datetime',
        'second_reminded_at'   => 'datetime',
        'third_reminded_at'    => 'datetime',
        'recovered_at'         => 'datetime',
        'unsubscribed_at'      => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /** Human-readable stage for admin UI / logging. */
    public function stage(): string
    {
        return match (true) {
            !is_null($this->recovered_at)         => 'recovered',
            !is_null($this->unsubscribed_at)      => 'unsubscribed',
            !is_null($this->third_reminded_at)    => 'reminded_3',
            !is_null($this->second_reminded_at)   => 'reminded_2',
            !is_null($this->first_reminded_at)    => 'reminded_1',
            !is_null($this->abandoned_at)         => 'abandoned',
            default                               => 'active',
        };
    }
}
