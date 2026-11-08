<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappConnection extends Model
{
    protected $guarded = [];

    protected $attributes = ['version' => 1];

    protected $hidden = ['credentials', 'pilot_numbers'];

    protected $casts = ['version' => 'integer', 'credentials' => 'encrypted:array', 'pilot_numbers' => 'array', 'enabled_events' => 'array', 'health' => 'array', 'enabled' => 'boolean', 'subscribed' => 'boolean', 'pilot_mode' => 'boolean', 'out_of_hours_enabled' => 'boolean', 'checked_at' => 'datetime', 'activated_at' => 'datetime'];

    public static function current(): ?self
    {
        return static::where('environment', app()->environment())->first();
    }
}
