<?php

namespace App\Http\Resources\Seller;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerAuthorResource extends JsonResource
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
            "profile_image" => $this->profile_image,
            "profile_image_url" => ImageModifier::generateImageUrl($this->profile_image),
            "cover_image" => $this->cover_image,
            "cover_image_url" => ImageModifier::generateImageUrl($this->cover_image),
            "name" => !empty($translation) && $translation->where('key', 'name')->first()
                ? $translation->where('key', 'name')->first()->value
                : $this->name, // If language is empty or not provided attribute
            "slug" => $this->slug,
            "bio" => !empty($translation) && $translation->where('key', 'bio')->first()
                ? $translation->where('key', 'bio')->first()->value
                : $this->bio, // If language is empty or not provided attribute
            "born_date" => $this->born_date,
            "death_date" => $this->death_date,
            "status" => $this->status,
        ];
    }
}
