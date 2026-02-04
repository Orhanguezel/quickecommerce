<?php

namespace App\Models;

use App\Traits\DeleteTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Support\Facades\Auth;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ProductBrand extends Model
{
    use HasFactory,DeleteTranslations;

    protected $table = 'product_brand';
    protected $fillable = [
        'brand_name',
        'brand_slug',
        'brand_logo',
        'meta_title',
        'meta_description',
        'display_order',
        'seller_relation_with_brand',
        'authorization_valid_from',
        'authorization_valid_to',
        'status'
    ];
    public $translationKeys = [
        'brand_name',
        'meta_title',
        'meta_description'
    ];

    public function translations()
    {
        return $this->morphMany(Translation::class, 'translatable');
    }
    public function getTranslation(string $key, string $language)
    {
        return $this->translations()->where('language', $language)->where('key', $key)->first()->value ?? null;
    }
    public function related_translations()
    {
        return $this->hasMany(Translation::class, 'translatable_id')
            ->where('translatable_type', self::class);
    }
}
