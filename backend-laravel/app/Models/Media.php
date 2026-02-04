<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    protected $table = 'media';
    protected $fillable = [
        'user_id',
        'user_type',
        'format',
        'name',
        'file_size',
        'alt_text',
        'path',
        'dimensions'
    ];

    public function fileable(): MorphTo
    {
        return $this->morphTo(null, 'user_type', 'user_id');
    }

}
