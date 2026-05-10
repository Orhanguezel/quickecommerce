<?php

namespace App\Http\Resources\Com;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AboutUsPublicResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $language = $request->input('language')
            ?: $request->header('X-localization')
            ?: app()->getLocale();

        // Get the translation for the requested language
        $translation = $this->related_translations->where('language', $language);
        $translationValue = static fn (string $key) => $translation->where('key', $key)->first()?->value;

        return [
            "slug" => $this->slug,
            "meta_title" => safeJsonDecode($translationValue('meta_title')) ?: $this->meta_title,
            "meta_description" => safeJsonDecode($translationValue('meta_description')) ?: $this->meta_description,
            "meta_keywords" => safeJsonDecode($translationValue('meta_keywords')) ?: $this->meta_keywords,
            "content" => !empty($translation) && $translation->where('key', 'content')->first()
                ? jsonImageModifierFormatter(json_decode((string) $translationValue('content'), true))
                : jsonImageModifierFormatter($this->content),
        ];
    }
}
