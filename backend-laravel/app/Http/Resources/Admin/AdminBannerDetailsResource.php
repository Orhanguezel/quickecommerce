<?php

namespace App\Http\Resources\Admin;

use App\Actions\ImageModifier;
use App\Http\Resources\Translation\BannerTranslationResource;
use App\Http\Resources\Translation\VehicleTypeTranslationResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminBannerDetailsResource extends JsonResource
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
            "theme_name" => $this->theme_name,
            "creator" => $this->creator->first_name . '' . $this->creator->last_name,
            "store_id" => $this->store ? $this->store->name : null,
            "title" => $this->title,
            "title_color" => $this->title_color,
            "description" => $this->description,
            "description_color" => $this->description_color,
            "button_text" => $this->button_text,
            "background_image" => $this->background_image,
            "background_image_url" => ImageModifier::generateImageUrl($this->background_image),
            "background_color" => $this->background_color,
            "thumbnail_image" => $this->thumbnail_image,
            "thumbnail_image_url" => ImageModifier::generateImageUrl($this->thumbnail_image),
            "button_color" => $this->button_color,
            "button_text_color" => $this->button_text_color,
            "button_hover_color" => $this->button_hover_color,
            "redirect_url" => $this->redirect_url,
            "location" => $this->location,
            "type" => $this->type,
            "status" => $this->status,
            "translations" => BannerTranslationResource::collection($this->related_translations->groupBy('language')),
        ];
    }
}
