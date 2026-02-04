<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreAreaSettingStoreType extends Model
{
    protected $fillable = [
        'store_area_setting_id',
        'store_type_id',
        'status'
    ];

    public function storeAreaSetting()
    {
        return $this->belongsTo(StoreAreaSetting::class, 'store_area_setting_id');
    }

    public function storeType()
    {
        return $this->belongsTo(StoreType::class, 'store_type_id');
    }

}
