<?php

namespace App\Http\Resources\Admin;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminBannerResource extends JsonResource
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
            'id' => $this->id,
            'theme_name' => $this->theme_name,
            "title" => $translation->isNotEmpty()
                ? $translation->where('key', 'title')->first()?->value
                : $this->title,
            "background_image_url" => ImageModifier::generateImageUrl($this->background_image),
            "thumbnail_image_url" => ImageModifier::generateImageUrl($this->thumbnail_image),
            "button_text" => $translation->isNotEmpty()
                ? $translation->where('key', 'button_text')->first()?->value
                : $this->button_text,
            "type" => $this->type,
            "status" => $this->status,
        ];
    }
}
