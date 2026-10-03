<?php

namespace App\Http\Resources\Com\Blog;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthorPublicResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $language = strtolower((string) $request->input('language', 'tr'));
        $translations = $this->related_translations->where('language', $language);

        return [
            'name' => $translations->firstWhere('key', 'name')?->value ?: $this->name,
            'slug' => $this->slug,
            'title' => $this->title,
            'bio' => $translations->firstWhere('key', 'bio')?->value ?: $this->bio,
            'image_url' => ImageModifier::generateImageUrl($this->profile_image),
            'email' => $this->email,
            'linkedin_url' => $this->linkedin_url,
            'twitter_url' => $this->twitter_url,
            'facebook_url' => $this->facebook_url,
            'instagram_url' => $this->instagram_url,
            'website_url' => $this->website_url,
        ];
    }
}
