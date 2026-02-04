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
        parent::__construct(null); // We don’t need to call parent with a model
        $this->query = $query;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $total_transactions_amount = (clone $this->query)
            ->where('status', 'delivered')
            ->whereNull('refund_status')
            ->whereHas('orderMaster', function ($query) {
                $query->where('payment_status', 'paid');
            })
            ->sum('order_amount');
        $total_refund_amount = (clone $this->query)->where('refund_status', 'refunded')->sum('order_amount');
        $admin_order_earnings = (clone $this->query)
            ->where('status', 'delivered')
            ->whereNull('refund_status')
            ->whereHas('orderMaster', function ($query) {
                $query->where('payment_status', 'paid');
            })->sum('order_amount_admin_commission');
        $admin_delivery_earnings = (clone $this->query)
            ->where('status', 'delivered')
            ->whereNull('refund_status')
            ->whereHas('orderMaster', function ($query) {
                $query->where('payment_status', 'paid');
            })->sum('delivery_charge_admin_commission');
        $admin_additional_charge_earnings = (clone $this->query)
            ->where('status', 'delivered')
            ->whereNull('refund_status')
            ->whereHas('orderMaster', function ($query) {
                $query->where('payment_status', 'paid');
            })->sum('order_admin_additional_charge_commission');
        $admin_earnings = round($admin_order_earnings + $admin_delivery_earnings + $admin_additional_charge_earnings, 2);

        $store_order_earnings = (clone $this->query)
            ->where('status', 'delivered')
            ->whereNull('refund_status')
            ->whereHas('orderMaster', function ($query) {
                $query->where('payment_status', 'paid');
            })->sum('order_amount_store_value');
        $store_additional_charge_earnings = (clone $this->query)
            ->where('status', 'delivered')
            ->whereNull('refund_status')
            ->whereHas('orderMaster', function ($query) {
                $query->where('payment_status', 'paid');
            })->sum('order_additional_charge_store_amount');
        $store_earnings = round($store_order_earnings + $store_additional_charge_earnings, 2);

        $deliveryman_earnings = (clone $this->query)
            ->where('status', 'delivered')
            ->whereNull('refund_status')
            ->whereHas('orderMaster', function ($query) {
                $query->where('payment_status', 'paid');
            })->sum('delivery_charge_admin');
        return [
            'total_transactions_amount' => $this->buildItem('pending-icon', 'Total Transaction Amount', round($total_transactions_amount)),
            'total_refund_amount' => $this->buildItem('pending-icon', 'Total Refund Amount', $total_refund_amount),
            'admin_earnings' => $this->buildItem('pending-icon', 'Admin Earnings', $admin_earnings),
            'store_earnings' => $this->buildItem('pending-icon', 'Store Earnings', $store_earnings),
            'deliveryman_earnings' => $this->buildItem('pending-icon', 'Deliveryman Earnings', round($deliveryman_earnings)),
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
