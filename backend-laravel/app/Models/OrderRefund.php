<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderRefund extends Model
{
    protected $fillable = [
        "order_id",
        "customer_id",
        "store_id",
        "order_refund_reason_id",
        "customer_note",
        "file",
        "status",
        "amount",
        "reject_reason"
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function orderRefundReason()
    {
        return $this->belongsTo(OrderRefundReason::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
