<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappWebhookEvent extends Model
{
    protected $guarded = [];

    protected $hidden = ['payload'];

    protected $casts = ['payload' => 'encrypted:array', 'processed_at' => 'datetime'];
}
