<?php

namespace App\Http\Resources\Com;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FooterSettingsPublicResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $locale = app()->getLocale();

        // Try the exact locale first, then fall back to 'df' (default/Turkish)
        $translation = $this->translations->where('language', $locale);
        if ($translation->isEmpty() || !$translation->where('key', 'content')->first()) {
            $translation = $this->translations->where('language', 'df');
        }

        $translated = $translation->where('key', 'content')->first();

        return [
            "content" => $translated
                ? jsonImageModifierFormatter(json_decode($translated->value, true))
                : $this->option_value,
        ];
    }
}
