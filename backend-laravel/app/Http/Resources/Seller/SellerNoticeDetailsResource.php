<?php

namespace App\Http\Resources\Seller;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerNoticeDetailsResource extends JsonResource
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
            "title" => !empty($translation) && $translation->where('key', 'title')->first()
                ? $translation->where('key', 'title')->first()->value
                : $this->title, // If language is empty or not provided attribute
            "message" => !empty($translation) && $translation->where('key', 'message')->first()
                ? $translation->where('key', 'message')->first()->value
                : $this->message, // If language is empty or not provided attribute
            "type" => $this->type,
            "priority" => $this->priority,
            "active_date" => $this->active_date,
            "expire_date" => $this->expire_date,
            "status" => $this->status,
        ];
    }
}
