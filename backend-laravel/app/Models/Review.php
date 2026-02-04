<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use SoftDeletes;
    protected $fillable = [
        "order_id",
        "store_id",
        "reviewable_id",
        "reviewable_type",
        "customer_id",
        "review",
        "rating",
        "status",
        "like_count",
        "dislike_count",
    ];


    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function reviewable()
    {
        return $this->morphTo();
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class, 'store_id');
    }

    public function reviewReactions()
    {
        return $this->hasMany(ReviewReaction::class, 'review_id');
    }

}
