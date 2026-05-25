<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchLog extends Model
{
    protected $table = 'search_logs';

    public $timestamps = false; // sadece created_at, manuel set

    protected $fillable = [
        'term',
        'user_id',
        'locale',
        'results_count',
        'clicked_product_id',
        'ip_hash',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'results_count' => 'integer',
    ];
}
