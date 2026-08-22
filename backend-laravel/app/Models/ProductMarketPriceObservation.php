<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductMarketPriceObservation extends Model
{
    protected $fillable = [
        'product_id',
        'source_name',
        'source_key',
        'source_url',
        'price',
        'currency_code',
        'is_available',
        'observed_at',
        'observation_key',
        'metadata',
    ];

    protected $casts = [
        'price' => 'decimal:4',
        'is_available' => 'boolean',
        'observed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
