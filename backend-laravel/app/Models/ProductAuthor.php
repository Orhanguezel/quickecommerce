<?php

namespace App\Models;

use App\Traits\DeleteTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductAuthor extends Model
{
    use HasFactory,DeleteTranslations;

    protected $table = 'product_authors';
    protected $fillable = [
        "profile_image",
        "cover_image",
        "name",
        "slug",
        "bio",
        "born_date",
        "death_date",
        "status",
        "created_by"
    ];
    public $translationKeys = [
        'name',
        'bio'
    ];

    public function translations()
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function related_translations()
    {
        return $this->hasMany(Translation::class, 'translatable_id')
            ->where('translatable_type', self::class);
    }

}
