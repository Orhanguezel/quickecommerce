<?php

namespace App\Http\Resources\Admin;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminAuthorRequestResource extends JsonResource
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
            "name" => $this->name,
            "slug" => $this->slug,
            "status" => $this->status,
            "created_by" => $this->creator->first_name,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
        ];
    }
}
