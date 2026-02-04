<?php

namespace App\Models;

use App\Traits\DeleteTranslations;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use DeleteTranslations;
    protected $fillable = [
        'theme_name',
        'user_id',
        'store_id',
        'title',
        'description',
        'background_image',
        'thumbnail_image',
        'button_text',
        'button_color',
        'redirect_url',
        'location',
        'type',
        'status',
        'title_color',
        'description_color',
        'background_color',
        'button_text_color',
        'button_hover_color',
    ];
    public $translationKeys = [
        'title',
        'description',
        'button_text'
    ];

    public function translations()
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    public function store()
    {
        return $this->belongsTo(Store::class, 'store_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function related_translations()
    {
        return $this->hasMany(Translation::class, 'translatable_id')
            ->where('translatable_type', self::class);
    }
}
