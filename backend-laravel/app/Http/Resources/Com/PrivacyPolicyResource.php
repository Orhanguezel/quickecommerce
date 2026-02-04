<?php

namespace App\Http\Resources\Com;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrivacyPolicyResource extends JsonResource
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
            "content" => !empty($translation) && $translation->where('key', 'content')->first()
                ? safeJsonDecode($translation->where('key', 'content')->first()->value) : $this->content,
            'meta_title' => !empty($translation) && $translation->where('key', 'meta_title')->first()
                ? safeJsonDecode($translation->where('key', 'meta_title')->first()->value)
                : $this->meta_title, // If language is empty or not provided attribute
            'meta_description' => !empty($translation) && $translation->where('key', 'meta_description')->first()
                ? safeJsonDecode($translation->where('key', 'meta_description')->first()->value)
                : $this->meta_description, // If language is empty or not provided attribute
            'meta_keywords' => !empty($translation) && $translation->where('key', 'meta_keywords')->first()
                ? safeJsonDecode($translation->where('key', 'meta_keywords')->first()->value)
                : $this->meta_keywords, // If language is empty or not provided attribute
        ];
    }
}
