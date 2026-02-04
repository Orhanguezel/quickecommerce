<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreNoticeRecipient extends Model
{
    protected $fillable = [
        "notice_id",
        "seller_id",
        "store_id",
    ];

    public function notice()
    {
        return $this->belongsTo(StoreNotice::class, 'notice_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class, 'store_id');
    }
}
