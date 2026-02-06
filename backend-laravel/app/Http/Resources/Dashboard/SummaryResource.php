<?php

namespace App\Http\Resources\Dashboard;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SummaryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'summary' => [
                'store' => $this->buildItem('store-icon', __('messages.dashboard.total_store'), $this->total_stores),
                'store_owner' => $this->buildItem('user-icon', __('messages.dashboard.total_seller'), $this->total_sellers),
                'product' => $this->buildItem('product-icon', __('messages.dashboard.total_product'), $this->total_products),
                'order' => $this->buildItem('order-icon', __('messages.dashboard.total_order'), $this->total_orders),
                'customer' => $this->buildItem('customer-icon', __('messages.dashboard.total_customer'), $this->total_customers),
                'staff' => $this->buildItem('staff-icon', __('messages.dashboard.total_staff'), $this->total_staff),
                'deliveryman' => $this->buildItem('deliveryman-icon', __('messages.dashboard.total_deliverymen'), $this->total_deliverymen),
                'area' => $this->buildItem('area-icon', __('messages.dashboard.total_areas'), $this->total_areas),
                'category' => $this->buildItem('category-icon', __('messages.dashboard.total_categories'), $this->total_categories),
                'brand' => $this->buildItem('brand-icon', __('messages.dashboard.total_brands'), $this->total_brands),
                'slider' => $this->buildItem('slider-icon', __('messages.dashboard.total_sliders'), $this->total_sliders),
                'coupon' => $this->buildItem('coupon-icon', __('messages.dashboard.total_coupons'), $this->total_coupons),
                'page' => $this->buildItem('page-icon', __('messages.dashboard.total_pages'), $this->total_pages),
                'blog' => $this->buildItem('blog-icon', __('messages.dashboard.total_blogs'), $this->total_blogs),
                'ticket' => $this->buildItem('ticket-icon', __('messages.dashboard.total_tickets'), $this->total_tickets),
            ],
            'order_summary' => [
                'pending_orders' => $this->buildItem('pending-icon', __('messages.dashboard.pending_orders'), $this->total_pending_orders),
                'completed_orders' => $this->buildItem('completed-icon', __('messages.dashboard.completed_orders'), $this->total_delivered_orders),
                'cancelled_orders' => $this->buildItem('cancelled-icon', __('messages.dashboard.cancelled_orders'), $this->total_cancelled_orders),
                'unassigned_orders' => $this->buildItem('unassigned-icon', __('messages.dashboard.unassigned_orders'), $this->deliveryman_not_assigned_orders),
                'refunded_orders' => $this->buildItem('refunded-icon', __('messages.dashboard.refunded_orders'), $this->total_refunded_orders),
            ],
            'financial_summary' => [
                'total_order_amount' => $this->buildItem('earnings-icon', __('messages.dashboard.total_order_amount'), $this->total_earnings),
                'total_order_commission' => $this->buildItem('earnings-icon', __('messages.dashboard.total_order_commission'), $this->total_order_commission),
                'total_refunds' => $this->buildItem('refunds-icon', __('messages.dashboard.total_refunds'), $this->total_refunds),
                'total_tax' => $this->buildItem('tax-icon', __('messages.dashboard.total_tax'), $this->total_tax),
                'total_withdrawals' => $this->buildItem('withdrawal-icon', __('messages.dashboard.total_withdrawals'), $this->total_withdrawals),
                'subscription_earnings' => $this->buildItem('subscription-icon', __('messages.dashboard.subscription_earnings'), $this->total_subscription_earnings),
                'total_revenue' => $this->buildItem('revenue-icon', __('messages.dashboard.total_revenue'), $this->total_revenue),
                'total_pos_order_earnings' => $this->buildItem('pos_earnings-icon', __('messages.dashboard.total_pos_sales'), $this->total_pos_order_earnings)
            ],
        ];
    }

    /**
     * Helper method to build summary items.
     */
    private function buildItem(string $icon, string $title, $count): array
    {
        return [
            'icon' => $icon,
            'title' => $title,
            'count' => $count
        ];
    }
}
