<?php

namespace App\Http\Resources\Seller;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerBannerResource extends JsonResource
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
            "description" => $translation->isNotEmpty()
                ? $translation->where('key', 'description')->first()?->value
                : $this->description,
            "button_text" => $translation->isNotEmpty()
                ? $translation->where('key', 'button_text')->first()?->value
                : $this->button_text,
            "type" => $this->type,
            "status" => $this->status,
        ];
    }
}
