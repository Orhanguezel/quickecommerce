<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturnShipment extends Model
{
    const STATUS_PENDING = 'pending';
    const STATUS_LABEL_CREATED = 'label_created';
    const STATUS_IN_TRANSIT = 'in_transit';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'order_refund_id',
        'order_id',
        'store_id',
        'geliver_shipment_id',
        'geliver_transaction_id',
        'carrier_name',
        'barcode',
        'tracking_number',
        'label_url',
        'status',
        'raw_response',
    ];

    protected $casts = [
        'raw_response' => 'array',
    ];

    public function orderRefund()
    {
        return $this->belongsTo(OrderRefund::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
