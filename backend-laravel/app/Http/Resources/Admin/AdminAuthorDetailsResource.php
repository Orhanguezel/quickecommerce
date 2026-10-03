<?php

namespace App\Http\Resources\Admin;

use App\Actions\ImageModifier;
use App\Http\Resources\Translation\AuthorTranslationResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminAuthorDetailsResource extends JsonResource
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
            "title" => $this->title,
            "email" => $this->email,
            "linkedin_url" => $this->linkedin_url,
            "twitter_url" => $this->twitter_url,
            "facebook_url" => $this->facebook_url,
            "instagram_url" => $this->instagram_url,
            "website_url" => $this->website_url,
            "born_date" => $this->born_date,
            "death_date" => $this->death_date,
            "status" => $this->status,
            "created_by" => $this->creator,
            "translations" => AuthorTranslationResource::collection($this->related_translations->groupBy("language")),
        ];
    }
}
