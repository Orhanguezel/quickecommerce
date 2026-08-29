<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Sadakat puani defter kaydi. Bakiye bu tablonun toplamidir; musteri uzerinde
 * ayri bir bakiye alani yoktur.
 */
class LoyaltyPointTransaction extends Model
{
    use HasFactory;

    public const TYPE_ORDER = 'order';
    public const TYPE_REVIEW = 'review';
    public const TYPE_REDEEM = 'redeem';
    public const TYPE_REVOKE = 'revoke';
    public const TYPE_EXPIRE = 'expire';
    public const TYPE_MANUAL = 'manual';

    protected $fillable = [
        'customer_id',
        'points',
        'type',
        'reference_type',
        'reference_id',
        'description',
        'expires_at',
        'available_at',
    ];

    protected $casts = [
        'points' => 'integer',
        'expires_at' => 'datetime',
        'available_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function scopeEarnings($query)
    {
        return $query->where('points', '>', 0);
    }

    public function scopeSpendings($query)
    {
        return $query->where('points', '<', 0);
    }

    /**
     * Kullanilabilir kayitlar: bekleme suresi dolmus ya da hic olmayanlar.
     * Bakiye HER ZAMAN bu kume uzerinden hesaplanir.
     */
    public function scopeAvailable($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('available_at')->orWhere('available_at', '<=', now());
        });
    }

    /** Henuz kullanima acilmamis (bekleyen) kayitlar. */
    public function scopePending($query)
    {
        return $query->whereNotNull('available_at')->where('available_at', '>', now());
    }

    public function isPending(): bool
    {
        return $this->available_at !== null && $this->available_at->isFuture();
    }
}
