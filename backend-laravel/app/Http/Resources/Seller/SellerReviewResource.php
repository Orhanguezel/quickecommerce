<?php

namespace App\Http\Resources\Seller;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerReviewResource extends JsonResource
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
            "reviewable_type" => $this->reviewable_type,
            "reviewer" => $this->customer ? $this->customer->first_name . ' ' . $this->customer->last_name : null,
            "review" => $this->review,
            "rating" => $this->rating,
            "status" => $this->status,
            "like_count" => $this->like_count,
            "dislike_count" => $this->dislike_count,
            "reviewed" => $this->reviewable ?
                ($this->reviewable_type == 'App\Models\User' ?
                    $this->reviewable->first_name . ' ' . $this->reviewable->last_name :
                    ($this->reviewable_type == 'App\Models\Product' ?
                        $this->reviewable->name : null)) : null,
            "slug" => $this->reviewable_type == 'App\Models\Product' && $this->reviewable
                ? $this->reviewable->slug
                : null,
            "store" => $this->store?->name,
            "store_slug" => $this->store?->slug,
        ];
    }
}
