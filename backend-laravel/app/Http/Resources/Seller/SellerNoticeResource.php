<?php

namespace App\Http\Resources\Seller;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerNoticeResource extends JsonResource
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
        $translation = $this->notice?->related_translations->where('language', $language);
        return [
            "notice_id" => $this->notice?->id,
            "title" => !empty($translation) && $translation->where('key', 'title')->first()
                ? $translation->where('key', 'title')->first()->value
                : $this->notice?->title, // If language is empty or not provided attribute
            "type" => $this->notice?->type,
            "priority" => $this->notice?->priority,
            "status" => $this->notice?->status,
            "created_at" => $this->notice?->created_at->diffForHumans(),
        ];
    }
}
