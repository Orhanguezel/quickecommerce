<?php

namespace Modules\PaymentGateways\app\Transformers;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentGatewaysListPublicResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'value' => $this->slug,
            'label' => $this->name,
            'name' => $this->name,
            'slug' => $this->slug,
            'image' => $this->image,
            'image_url' => $this->resolveImageUrl(),
            'description' => $this->description,
        ];
    }

    private function resolveImageUrl(): ?string
    {
        if (empty($this->image)) {
            return null;
        }

        // External URL — return as-is
        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }

        // Numeric media ID — resolve via media table
        if (is_numeric($this->image)) {
            return ImageModifier::generateImageUrl($this->image);
        }

        // Relative public path (e.g. 'payment-logos/paytr.svg')
        return url($this->image);
    }
}
