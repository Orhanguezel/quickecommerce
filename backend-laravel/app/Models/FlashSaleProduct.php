<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlashSaleProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'flash_sale_id', 'product_id', 'store_id', 'created_by', 'updated_by',
    ];
    protected static function booted(): void
    {
        if (!request()->is('api/v1/admin/*') && !request()->is('api/v1/seller/*')) {
            static::addGlobalScope('validFlashSaleProduct', function ($builder) {
                $builder->whereHas('store', function ($storeQuery) {
                    $storeQuery->where(function ($q) {
                        // Allow all products for commission-based stores
                        $q->where('subscription_type', 'commission')
                            ->orWhere(function ($q2) {
                                // For subscription-based stores, apply subscription conditions
                                $q2->where('subscription_type', 'subscription')
                                    ->whereHas('subscriptions', function ($subQuery) {
                                        $subQuery->where('status', 1)
                                            ->whereDate('expire_date', '>=', now())
                                            ->where('order_limit', '>', 0);
                                    });
                            });
                    });
                });
            });
        }
    }

    public function flashSale()
    {
        return $this->belongsTo(FlashSale::class, 'flash_sale_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id'); // Assumes a Product model exists
    }

    public function store()
    {
        return $this->belongsTo(Store::class, 'store_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function related_translations()
    {
        return $this->hasMany(Translation::class, 'translatable_id')
            ->where('translatable_type', self::class);
    }
}
