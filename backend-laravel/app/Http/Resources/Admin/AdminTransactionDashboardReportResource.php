<?php

namespace App\Http\Resources\Admin;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminTransactionDashboardReportResource extends JsonResource
{
    protected $query;

    public function __construct(Builder $query)
    {
        parent::__construct(null); // We don't need to call parent with a model
        $this->query = $query;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Total transaction amount: all orders matching current filters (excluding refunded)
        $total_transactions_amount = (clone $this->query)
            ->whereNull('refund_status')
            ->sum('order_amount');

        // Total refund amount: only refunded orders
        $total_refund_amount = (clone $this->query)
            ->where('refund_status', 'refunded')
            ->sum('order_amount');

        // Admin earnings: commission from all non-refunded orders
        $admin_order_earnings = (clone $this->query)
            ->whereNull('refund_status')
            ->sum('order_amount_admin_commission');
        $admin_delivery_earnings = (clone $this->query)
            ->whereNull('refund_status')
            ->sum('delivery_charge_admin_commission');
        $admin_additional_charge_earnings = (clone $this->query)
            ->whereNull('refund_status')
            ->sum('order_admin_additional_charge_commission');
        $admin_earnings = round($admin_order_earnings + $admin_delivery_earnings + $admin_additional_charge_earnings, 2);

        // Store earnings: store value from all non-refunded orders
        $store_order_earnings = (clone $this->query)
            ->whereNull('refund_status')
            ->sum('order_amount_store_value');
        $store_additional_charge_earnings = (clone $this->query)
            ->whereNull('refund_status')
            ->sum('order_additional_charge_store_amount');
        $store_earnings = round($store_order_earnings + $store_additional_charge_earnings, 2);

        // Deliveryman earnings: delivery charges from all non-refunded orders
        $deliveryman_earnings = (clone $this->query)
            ->whereNull('refund_status')
            ->sum('delivery_charge_admin');

        return [
            'total_transactions_amount' => $this->buildItem('pending-icon', 'Total Transaction Amount', round($total_transactions_amount, 2)),
            'total_refund_amount' => $this->buildItem('pending-icon', 'Total Refund Amount', round($total_refund_amount, 2)),
            'admin_earnings' => $this->buildItem('pending-icon', 'Admin Earnings', $admin_earnings),
            'store_earnings' => $this->buildItem('pending-icon', 'Store Earnings', $store_earnings),
            'deliveryman_earnings' => $this->buildItem('pending-icon', 'Deliveryman Earnings', round($deliveryman_earnings, 2)),
        ];
    }

    private function buildItem(string $icon, string $title, $count): array
    {
        return [
            'icon' => $icon,
            'title' => $title,
            'count' => $count
        ];
    }
}
