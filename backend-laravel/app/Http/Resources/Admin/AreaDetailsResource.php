<?php

namespace App\Http\Resources\Admin;

use App\Helpers\ComHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AreaDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Transform related_translations array into grouped object by language
        $translations = [];
        if ($this->related_translations) {
            foreach ($this->related_translations as $translation) {
                $lang = $translation->language;
                // Skip 'df' as it's the default language stored in main columns
                if ($lang === 'df') {
                    continue;
                }
                if (!isset($translations[$lang])) {
                    $translations[$lang] = [];
                }
                $translations[$lang][$translation->key] = $translation->value;
            }
        }

        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'state' => $this->state,
            'city' => $this->city,
            'coordinates' => $this->coordinates['coordinates'][0] ?? [],
            'center_latitude' => $this->center_latitude,
            'center_longitude' => $this->center_longitude,
            'status' => $this->status,
            'translations' => $translations,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
