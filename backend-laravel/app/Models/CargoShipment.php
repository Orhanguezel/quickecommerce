<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CargoShipment extends Model
{
    protected $fillable = [
        'order_id',
        'store_id',
        'geliver_shipment_id',
        'geliver_transaction_id',
        'carrier_name',
        'barcode',
        'tracking_number',
        'label_url',
        'status',
        'created_by_type',
        'created_by_id',
        'raw_response',
    ];

    protected $casts = [
        'raw_response' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class, 'store_id');
    }
}
