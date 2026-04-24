<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVelocityStat extends Model
{
    protected $fillable = [
        'product_id',
        'daily_sales_avg',
        'window_sales',
        'current_stock',
        'days_of_supply',
        'window_days',
        'computed_at',
    ];

    protected $casts = [
        'daily_sales_avg' => 'decimal:2',
        'days_of_supply'  => 'decimal:1',
        'computed_at'     => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
