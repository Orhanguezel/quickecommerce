<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    protected $fillable = [
        'customer_id',
        'product_id'
    ];

    protected static function booted(): void
    {
        if (!request()->is('api/v1/admin/*') && !request()->is('api/v1/seller/*')) {
            static::addGlobalScope('validWishlistProduct', function ($builder) {
                $builder->whereHas('product.store', function ($storeQuery) {
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

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
