<?php

namespace App\Http\Resources\Com;

use App\Http\Resources\Translation\SettingsTranslationResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GdprPublicResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get the requested language from the query parameter
        $language = $request->input('language', 'en');
        // Get the translation for the requested language
        $translation = $this->translations->where('language', $language);
        return [
            "content" => !empty($translation) && $translation->where('key', 'content')->first()
                ? jsonImageModifierFormatter(json_decode($translation->where('key', 'content')->first()->value, true))
                : $this->option_value,
        ];

    }
}
