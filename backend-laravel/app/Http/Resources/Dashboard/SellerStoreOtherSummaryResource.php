<?php

namespace App\Http\Resources\Dashboard;

use App\Http\Resources\Order\AdminOrderResource;
use App\Http\Resources\Product\TopRatedProductPublicResource;
use App\Http\Resources\Store\StoreDetailsForOrderResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerStoreOtherSummaryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        return [
            'top_rated_products' => TopRatedProductPublicResource::collection($this->top_rated_products),
            'recent_completed_orders' => AdminOrderResource::collection($this->recent_completed_orders),
        ];

    }
}
