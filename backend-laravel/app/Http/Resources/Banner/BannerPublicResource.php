<?php

namespace App\Http\Resources\Banner;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BannerPublicResource extends JsonResource
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
            "title" => $translation->isNotEmpty()
                ? $translation->where('key', 'title')->first()?->value
                : $this->title,
            "title_color" => $this->title_color,
            "description" => $translation->isNotEmpty()
                ? $translation->where('key', 'description')->first()?->value
                : $this->description,
            "description_color" => $this->description_color,
            "button_text" => $translation->isNotEmpty()
                ? $translation->where('key', 'button_text')->first()?->value
                : $this->button_text,
            "button_text_color" => $this->button_text_color,
            "button_hover_color" => $this->button_hover_color,
            "background_image" => ImageModifier::generateImageUrl($this->background_image),
            "background_color" => $this->background_color,
            "thumbnail_image" => ImageModifier::generateImageUrl($this->thumbnail_image),
            "button_color" => $this->button_color,
            "redirect_url" => $this->redirect_url,
            "location" => $this->location,
            "type" => $this->type,
            "order" => $this->display_order,
            "desktop_row" => $this->desktop_row,
            "desktop_columns" => $this->desktop_columns,
            "status" => $this->status,
        ];
    }
}
