<?php

namespace Modules\Subscription\app\Transformers;

use App\Actions\ImageModifier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminSubscriptionPackageDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        // Transform translations to object keyed by language
        $translations = [];
        if ($this->related_translations) {
            foreach ($this->related_translations->groupBy('language') as $lang => $items) {
                // Skip 'df' as it's the default language stored in main columns
                if ($lang === 'df') {
                    continue;
                }
                $translations[$lang] = [
                    'name' => $items->where('key', 'name')->first()?->value,
                    'description' => $items->where('key', 'description')->first()?->value,
                ];
            }
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'validity' => $this->validity,
            'price' => $this->price,
            'pos_system' => $this->pos_system,
            'self_delivery' => $this->self_delivery,
            'mobile_app' => $this->mobile_app,
            'live_chat' => $this->live_chat,
            'order_limit' => $this->order_limit,
            'product_limit' => $this->product_limit,
            'product_featured_limit' => $this->product_featured_limit,
            'description' => $this->description,
            'image' => $this->image,
            'image_url' => ImageModifier::generateImageUrl($this->image),
            'payment_gateway' => $this->payment_gateway,
            'payment_status' => $this->payment_status,
            'expire_date' => $this->expire_date,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'translations' => $translations,
        ];
    }
}
