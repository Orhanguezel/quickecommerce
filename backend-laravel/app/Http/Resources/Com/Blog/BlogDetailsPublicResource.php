<?php

namespace App\Http\Resources\Com\Blog;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogDetailsPublicResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        // Get the requested language from the query parameter
        $language = strtolower((string)$request->input('language', 'en'));
        $dateLocale = str_starts_with($language, 'tr') ? 'tr' : 'en';
        // Get the translation for the requested language
        $translation = $this->related_translations->where('language', $language);
        return [
            "id" => $this->id,
            "category" => $this->category?->name,
            "title" => !empty($translation) && $translation->where('key', 'title')->first()
                ? $translation->where('key', 'title')->first()->value
                : $this->title,
            "slug" => $this->slug,
            "description" => !empty($translation) && $translation->where('key', 'description')->first()
                ? $translation->where('key', 'description')->first()->value
                : $this->description,
            "image_url" => ImageModifier::generateImageUrl($this->image),
            "views" => $this->views,
            "tag_name" => $this->tag_name,
            "meta_title" => !empty($translation) && $translation->where('key', 'meta_title')->first()
                ? $translation->where('key', 'meta_title')->first()->value
                : $this->meta_title,
            "meta_description" => !empty($translation) && $translation->where('key', 'meta_description')->first()
                ? $translation->where('key', 'meta_description')->first()->value
                : $this->meta_description,
            "meta_keywords" => !empty($translation) && $translation->where('key', 'meta_keywords')->first()
                ? $translation->where('key', 'meta_keywords')->first()->value
                : $this->meta_keywords,
            "meta_image" => ImageModifier::generateImageUrl($this->meta_image),
            "created_at" => optional($this->created_at)?->locale($dateLocale)->translatedFormat('d F Y')
        ];
    }
}
