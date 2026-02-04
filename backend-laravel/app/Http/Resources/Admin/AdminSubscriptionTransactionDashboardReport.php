<?php

namespace App\Http\Resources\Admin;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminSubscriptionTransactionDashboardReport extends JsonResource
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
        $admin_earnings = (clone $this->query)->where('payment_status', 'paid')->sum('price');
        return [
            'admin_earnings' => $this->buildItem('pending-icon', 'Admin Earnings', $admin_earnings),
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
