<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreAreaSetting extends Model
{
    protected $fillable = [
        'store_area_id',
        'delivery_time_per_km',
        'min_order_delivery_fee',
        'delivery_charge_method',
        'out_of_area_delivery_charge',
        'fixed_charge_amount',
        'per_km_charge_amount'
    ];

    public function storeArea()
    {
        return $this->belongsTo(StoreArea::class, 'store_area_id');
    }

    public function storeTypes()
    {
        return $this->belongsToMany(StoreType::class, 'store_area_setting_store_types', 'store_area_setting_id', 'store_type_id');
    }

    public function rangeCharges()
    {
        return $this->hasMany(StoreAreaSettingRangeCharge::class, 'store_area_setting_id');
    }
}
