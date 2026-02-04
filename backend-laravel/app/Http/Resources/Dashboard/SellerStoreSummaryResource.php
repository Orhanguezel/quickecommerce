<?php

namespace App\Http\Resources\Dashboard;

use App\Http\Resources\Seller\Store\StoreDetailsPublicResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SellerStoreSummaryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'store_details' => StoreDetailsPublicResource::collection($this->store_details),
            'summary' => [
                'store' => [
                    'icon' => 'store-icon',
                    'title' => 'Total Stores',
                    'count' => $this->total_stores
                ],
                'product' => [
                    'icon' => 'product-icon',
                    'title' => 'Total Product',
                    'count' => $this->total_product
                ],
                'order' => [
                    'icon' => 'order-icon',
                    'title' => 'Total Order',
                    'count' => $this->total_order
                ],
                'pos_order_amount' => [
                    'icon' => 'pos-icon',
                    'title' => 'POS Sales',
                    'count' => $this->total_pos_order_amount
                ],
                'earnings' => [
                    'icon' => 'earning-icon',
                    'title' => 'Total Earnings',
                    'count' => $this->total_earnings
                ],
                'refunds' => [
                    'icon' => 'refund-icon',
                    'title' => 'Total Refunds',
                    'count' => $this->total_refunds
                ],
                'revenue' => [
                    'icon' => 'revenue-icon',
                    'title' => 'Total Revenue',
                    'count' => ($this->total_earnings ?? 0) - ($this->total_refunds ?? 0)
                ],
            ],
            'order_summary' => [
                'pos_orders' => [
                    'icon' => 'pos-icon',
                    'title' => 'POS Orders',
                    'count' => $this->pos_orders
                ],
                'confirmed_orders' => [
                    'icon' => 'confirmed-icon',
                    'title' => 'Confirmed Orders',
                    'count' => $this->confirmed_orders
                ],
                'pending_orders' => [
                    'icon' => 'pending-icon',
                    'title' => 'Pending Orders',
                    'count' => $this->pending_orders
                ],
                'processing_orders' => [
                    'icon' => 'processing-icon',
                    'title' => 'Processing Orders',
                    'count' => $this->processing_orders
                ],
                'shipped_orders' => [
                    'icon' => 'shipped-icon',
                    'title' => 'Shipped Orders',
                    'count' => $this->shipped_orders
                ],
                'completed_orders' => [
                    'icon' => 'completed-icon',
                    'title' => 'Completed Orders',
                    'count' => $this->completed_orders
                ],
                'cancelled_orders' => [
                    'icon' => 'cancelled-icon',
                    'title' => 'Cancelled Orders',
                    'count' => $this->cancelled_orders
                ],
                'deliveryman_not_assigned_orders' => [
                    'icon' => 'unassigned-icon',
                    'title' => 'Unassigned Orders',
                    'count' => $this->deliveryman_not_assigned_orders
                ],
                'refunded_orders' => [
                    'icon' => 'refunded-icon',
                    'title' => 'Refunded Orders',
                    'count' => $this->refunded_orders
                ],
            ]
        ];
    }
}
