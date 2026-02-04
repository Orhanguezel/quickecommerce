<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreAreaSettingRangeCharge extends Model
{
    protected $fillable = [
        'store_area_setting_id',
        'min_km',
        'max_km',
        'charge_amount',
        'status'
    ];

    public function storeAreaSetting()
    {
        return $this->belongsTo(StoreAreaSetting::class);
    }

}
