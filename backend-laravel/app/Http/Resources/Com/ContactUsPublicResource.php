<?php

namespace App\Http\Resources\Com;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactUsPublicResource extends JsonResource
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
        $translation = $this->related_translations->where('language', $language);
        return [
            "slug" => $this->slug,
            "content" => !empty($translation) && $translation->where('key', 'content')->first()
                ? jsonImageModifierFormatter(json_decode($translation->where('key', 'content')->first()->value, true))
                : jsonImageModifierFormatter($this->content),
        ];
    }
}
