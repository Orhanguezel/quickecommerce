<?php

namespace App\Models;

use App\Traits\DeleteTranslations;
use Illuminate\Database\Eloquent\Model;

class StoreNotice extends Model
{
    use DeleteTranslations;
    protected $fillable = [
        'type',
        'title',
        'message',
        'active_date',
        'expire_date',
        'priority',
        'status',
    ];
    public $translationKeys = [
        'title',
        'message',
    ];

    public function translations()
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    public function recipients()
    {
        return $this->belongsTo(StoreNoticeRecipient::class,'id','notice_id');
    }

    public function related_translations()
    {
        return $this->hasMany(Translation::class, 'translatable_id')
            ->where('translatable_type', self::class);
    }
}
