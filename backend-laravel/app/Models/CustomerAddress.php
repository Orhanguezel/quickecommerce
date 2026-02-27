<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerAddress extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'customer_id',
        'title',
        'type',
        'email',
        'contact_number',
        'address',
        'latitude',
        'longitude',
        'area_id',
        'city_name',
        'district_name',
        'road',
        'house',
        'floor',
        'postal_code',
        'is_default',
        'status',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function area()
    {
        return $this->belongsTo(StoreArea::class, 'area_id');
    }
}
