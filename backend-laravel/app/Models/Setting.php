<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    public $guarded = [];

    protected $casts = [
        'options'   => 'json',
    ];

    public static function getData($language = DEFAULT_LANGUAGE)
    {
        $data = static::where('language', $language)->first();

        if(!$data) {
            $data = static::where('language', DEFAULT_LANGUAGE)->first();
        }

        return $data;
    }
}
