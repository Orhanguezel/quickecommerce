<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappMessage extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $attributes = ['attempts' => 0, 'direction' => 'outbound'];

    protected $hidden = ['payload', 'recipient'];

    protected $casts = ['connection_version' => 'integer', 'payload' => 'encrypted:array', 'expires_at' => 'datetime', 'next_attempt_at' => 'datetime', 'lease_until' => 'datetime', 'provider_at' => 'datetime', 'delivered_at' => 'datetime', 'read_at' => 'datetime'];
}
