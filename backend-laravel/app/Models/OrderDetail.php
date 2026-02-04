<?php

namespace App\Models;

use App\Traits\RoundNumericFields;
use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    use RoundNumericFields;

    protected $fillable = [
        'order_id',
        'store_id',
        'area_id',
        'product_id',
        'behaviour',
        'product_sku',
        'variant_details',
        'base_price',
        'product_campaign_id',
        'admin_discount_type',
        'admin_discount_rate',
        'admin_discount_amount',
        'price',
        'quantity',
        'line_total_price_with_qty',
        'line_total_excluding_tax',
        'tax_rate',
        'tax_amount',
        'total_tax_amount',
        'line_total_price',
        'admin_commission_type',
        'admin_commission_rate',
        'admin_commission_amount',
        'coupon_discount_amount',
    ];
    protected array $excludedFieldsFromRounding = ['coupon_discount_amount', 'line_total_excluding_tax', 'line_total_price'];


    protected $casts = [
        'quantity' => 'integer'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class, 'store_id');
    }

    public function area()
    {
        return $this->belongsTo(StoreArea::class, 'area_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function productVariant()
    {
        return $this->hasOne(ProductVariant::class, 'sku', 'product_sku');
    }


}
