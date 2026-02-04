<?php

namespace App\Traits;

use App\Models\Media;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasMedia
{

    protected static function bootHasMedia()
    {
        static::forceDeleted(function ($model) {
            $mediaItems = Media::where('user_id', $model->id)->where('user_type', $model::class)->get();

            foreach ($mediaItems as $media) {
                if ($media->path && \Storage::disk('public')->exists($media->path)) {
                    \Storage::disk('public')->delete($media->path);
                }

                $media->delete(); // delete from database
            }
        });
    }
}
