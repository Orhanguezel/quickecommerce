<?php

namespace App\Http\Resources\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductReviewPublicResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "review_id" => $this->id,
            "reviewed_by" => new ReviewerPublicResource($this->customer),
            "review" => $this->review,
            "images" => $this->images
                ? array_values(array_filter(array_map(
                    fn ($id) => com_option_get_id_wise_url(trim($id)),
                    explode(',', $this->images)
                )))
                : [],
            "rating" => $this->rating,
            // Tesvikli degerlendirme aciklamasi: puan kazanilmis bir yorumun
            // bu sekilde isaretlenmesi Ticari Reklam ve Haksiz Ticari
            // Uygulamalar Yonetmeligi ile Google Merchant urun yorumu
            // politikasinin gerektirdigi aciklamadir.
            // Bonus URUN basina verilir (defter referansi Product), bu yuzden
            // musteri + urun uzerinden bakilir.
            "is_incentivized" => $this->customer_id
                ? \App\Models\LoyaltyPointTransaction::where('customer_id', $this->customer_id)
                    ->where('type', 'review')
                    ->where('reference_type', \App\Models\Product::class)
                    ->where('reference_id', $this->reviewable_id)
                    ->exists()
                : false,
            "like_count" => $this->like_count,
            "dislike_count" => $this->dislike_count,
            "reviewed_at" => $this->created_at->diffForHumans(),
            "liked" => $this->reviewReactions()
                ->where('user_id', auth('api_customer')->id())
                ->where('review_id', $this->id)
                ->where('reaction_type', 'like')
                ->exists(),
            "disliked" => $this->reviewReactions()
                ->where('user_id', auth('api_customer')->id())
                ->where('review_id', $this->id)
                ->where('reaction_type', 'dislike')
                ->exists(),

        ];
    }
}
