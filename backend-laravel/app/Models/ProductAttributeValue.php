<?php

namespace App\Models;

use App\Traits\DeleteTranslations;
use Illuminate\Database\Eloquent\Model;

class ProductAttributeValue extends Model
{
    use DeleteTranslations;

    protected $fillable = [
        'attribute_id',
        'value'
    ];

    public $translationKeys = [
        'value'
    ];

    public function attribute()
    {
        return $this->belongsTo(ProductAttribute::class, 'attribute_id');
    }

    public function translations()
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    public function related_translations()
    {
        return $this->hasMany(Translation::class, 'translatable_id')
            ->where('translatable_type', self::class);
    }
}
