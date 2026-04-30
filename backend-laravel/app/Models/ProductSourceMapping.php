<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductSourceMapping extends Model
{
    protected $fillable = [
        'source_name',
        'store_id',
        'product_id',
        'product_variant_id',
        'source_product_url',
        'source_product_id',
        'source_product_slug',
        'source_variant_id',
        'source_variant_sku',
        'source_variant_barcode',
        'source_variant_title',
        'last_synced_price',
        'last_synced_special_price',
        'last_synced_stock',
        'last_sync_status',
        'last_sync_note',
        'last_sync_at',
    ];

    protected $casts = [
        'last_synced_price' => 'decimal:2',
        'last_synced_special_price' => 'decimal:2',
        'last_synced_stock' => 'integer',
        'last_sync_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
