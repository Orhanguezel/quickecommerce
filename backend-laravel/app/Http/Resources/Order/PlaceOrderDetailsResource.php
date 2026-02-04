<?php

namespace App\Http\Resources\Order;

use App\Enums\OrderStatusType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceOrderDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'order_id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'order_amount' => $this->order_amount,
            'status' => $this->status instanceof OrderStatusType ? $this->status->value : $this->status,
        ];
    }
}
