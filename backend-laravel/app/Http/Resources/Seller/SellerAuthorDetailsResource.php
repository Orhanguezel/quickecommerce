<?php

namespace App\Http\Resources\Seller;

use App\Actions\ImageModifier;
use App\Http\Resources\Translation\AuthorTranslationResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerAuthorDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "profile_image" => $this->profile_image,
            "profile_image_url" => ImageModifier::generateImageUrl($this->profile_image),
            "cover_image" => $this->cover_image,
            "cover_image_url" => ImageModifier::generateImageUrl($this->cover_image),
            "name" => $this->name,
            "slug" => $this->slug,
            "bio" => $this->bio,
            "born_date" => $this->born_date,
            "death_date" => $this->death_date,
            "status" => $this->status,
            "translations" => AuthorTranslationResource::collection($this->related_translations->groupBy("language")),
        ];

    }
}