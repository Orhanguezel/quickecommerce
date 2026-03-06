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
                    'title' => __('messages.dashboard.total_stores'),
                    'count' => $this->total_stores
                ],
                'product' => [
                    'icon' => 'product-icon',
                    'title' => __('messages.dashboard.total_product'),
                    'count' => $this->total_product
                ],
                'order' => [
                    'icon' => 'order-icon',
                    'title' => __('messages.dashboard.total_order'),
                    'count' => $this->total_order
                ],
                'pos_order_amount' => [
                    'icon' => 'pos-icon',
                    'title' => __('messages.dashboard.pos_sales'),
                    'count' => $this->total_pos_order_amount
                ],
                'earnings' => [
                    'icon' => 'earning-icon',
                    'title' => __('messages.dashboard.total_earnings'),
                    'count' => $this->total_earnings
                ],
                'refunds' => [
                    'icon' => 'refund-icon',
                    'title' => __('messages.dashboard.total_refunds'),
                    'count' => $this->total_refunds
                ],
                'revenue' => [
                    'icon' => 'revenue-icon',
                    'title' => __('messages.dashboard.total_revenue'),
                    'count' => ($this->total_earnings ?? 0) - ($this->total_refunds ?? 0)
                ],
            ],
            'order_summary' => [
                'pos_orders' => [
                    'icon' => 'pos-icon',
                    'title' => __('messages.dashboard.pos_orders'),
                    'count' => $this->pos_orders
                ],
                'confirmed_orders' => [
                    'icon' => 'confirmed-icon',
                    'title' => __('messages.dashboard.confirmed_orders'),
                    'count' => $this->confirmed_orders
                ],
                'pending_orders' => [
                    'icon' => 'pending-icon',
                    'title' => __('messages.dashboard.pending_orders'),
                    'count' => $this->pending_orders
                ],
                'processing_orders' => [
                    'icon' => 'processing-icon',
                    'title' => __('messages.dashboard.processing_orders'),
                    'count' => $this->processing_orders
                ],
                'shipped_orders' => [
                    'icon' => 'shipped-icon',
                    'title' => __('messages.dashboard.shipped_orders'),
                    'count' => $this->shipped_orders
                ],
                'completed_orders' => [
                    'icon' => 'completed-icon',
                    'title' => __('messages.dashboard.completed_orders'),
                    'count' => $this->completed_orders
                ],
                'cancelled_orders' => [
                    'icon' => 'cancelled-icon',
                    'title' => __('messages.dashboard.cancelled_orders'),
                    'count' => $this->cancelled_orders
                ],
                'deliveryman_not_assigned_orders' => [
                    'icon' => 'unassigned-icon',
                    'title' => __('messages.dashboard.unassigned_orders'),
                    'count' => $this->deliveryman_not_assigned_orders
                ],
                'refunded_orders' => [
                    'icon' => 'refunded-icon',
                    'title' => __('messages.dashboard.refunded_orders'),
                    'count' => $this->refunded_orders
                ],
            ]
        ];
    }
}
