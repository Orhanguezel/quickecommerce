<?php

namespace App\Http\Resources\Seller;

use App\Actions\ImageModifier;
use App\Http\Resources\Translation\BannerTranslationResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerBannerDetailsResource extends JsonResource
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
            "id" => $this->id,
            "creator" => $this->creator->first_name . '' . $this->creator->last_name,
            "store_id" => $this->store ? $this->store->name : null,
            "title" => $translation->isNotEmpty()
                ? $translation->where('key', 'title')->first()?->value
                : $this->title,
            "description" => $translation->isNotEmpty()
                ? $translation->where('key', 'description')->first()?->value
                : $this->description,
            "button_text" => $translation->isNotEmpty()
                ? $translation->where('key', 'button_text')->first()?->value
                : $this->button_text,
            "background_image" => ImageModifier::generateImageUrl($this->background_image),
            "thumbnail_image" => ImageModifier::generateImageUrl($this->thumbnail_image),
            "button_color" => $this->button_color,
            "redirect_url" => $this->redirect_url,
            "location" => $this->location,
            "type" => $this->type,
            "status" => $this->status,
            "translations" => BannerTranslationResource::collection($this->related_translations->groupBy('language')),
        ];
    }
}
