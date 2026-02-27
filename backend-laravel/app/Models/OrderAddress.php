<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderAddress extends Model
{
    protected $fillable = [
        'order_master_id',
        'area_id',
        'city_name',
        'district_name',
        'type',
        'name',
        'email',
        'contact_number',
        'address',
        'latitude',
        'longitude',
        'road',
        'house',
        'floor',
        'postal_code',
    ];

    public function orderMaster()
    {
        return $this->belongsTo(OrderMaster::class, 'order_master_id', 'id');
    }
}
