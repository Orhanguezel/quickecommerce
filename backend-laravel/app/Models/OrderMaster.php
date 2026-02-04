<?php

namespace App\Models;

use App\Traits\RoundNumericFields;
use Illuminate\Database\Eloquent\Model;

class OrderMaster extends Model
{
    use RoundNumericFields;

    protected $fillable = [
        'customer_id',
        'area_id',
        'shipping_address_id',
        'coupon_code',
        'coupon_title',
        'coupon_discount_amount_admin',
        'product_discount_amount',
        'flash_discount_amount_admin',
        'shipping_charge',
        'additional_charge_name',
        'additional_charge_amount',
        'additional_charge_commission',
        'order_amount',
        'paid_amount',
        'payment_gateway',
        'payment_status',
        'transaction_ref',
        'transaction_details',
        'order_notes',
        'default_currency_code',
        'currency_code',
        'exchange_rate',
    ];

    public function orderAddress()
    {
        return $this->hasOne(OrderAddress::class, 'order_master_id', 'id');
    }

    public function shippingAddress()
    {
        return $this->belongsTo(CustomerAddress::class, 'shipping_address_id', 'id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'order_master_id', 'id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    // Add the missing relationship
    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class, 'order_id', 'id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class, 'store_id', 'id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }


}
