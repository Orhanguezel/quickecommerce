<?php

namespace App\Http\Resources\Dashboard;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderGrowthSummaryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        $orderData = collect($this->resource); // Convert to Collection for easier manipulation

        // Initialize result array
        $growthData = [];
        $previousMonthOrders = 0;

        // Loop through months (1 to 12)
        for ($month = 1; $month <= 12; $month++) {
            $currentMonthOrders = $orderData->get($month, 0); // Get orders for the current month

            // Handle growth calculation
            $growthPercentage = 0;
            if ($previousMonthOrders == 0 && $currentMonthOrders > 0) {
                // First month with orders after previous month having 0 orders
                $growthPercentage = 100; // Treat as 100% growth
            } elseif ($previousMonthOrders > 0) {
                // Regular growth calculation
                $growthPercentage = round((($currentMonthOrders - $previousMonthOrders) / $previousMonthOrders) * 100, 2);
            }

            $growthData[] = [
                'month' => date("F", mktime(0, 0, 0, $month, 1)), // Convert month number to name
                'orders' => $currentMonthOrders,
                'growth' => $growthPercentage
            ];

            // Update previous month orders for next iteration
            $previousMonthOrders = $currentMonthOrders;
        }

        return $growthData;
    }
}
