<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockAlertSubscription extends Model
{
    protected $fillable = [
        'product_id', 'product_variant_id', 'email', 'confirmation_token_hash',
        'confirmation_expires_at', 'confirmed_at',
        'notified_at', 'expires_at',
    ];

    protected $casts = [
        'confirmation_expires_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'notified_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
