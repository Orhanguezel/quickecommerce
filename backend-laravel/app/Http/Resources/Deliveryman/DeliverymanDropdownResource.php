<?php

namespace App\Http\Resources\Deliveryman;

use App\Actions\ImageModifier;
use App\Http\Resources\Com\ComAreaListForDropdownResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliverymanDropdownResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'value' => $this->id,
            'label' => $this->full_name,
            'image_url' => ImageModifier::generateImageUrl($this->image),
            'area' => new ComAreaListForDropdownResource($this->deliveryman?->area),
        ];
    }
}
