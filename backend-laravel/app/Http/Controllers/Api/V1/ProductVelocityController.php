<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ProductVelocityStat;
use Illuminate\Http\JsonResponse;

class ProductVelocityController extends Controller
{
    /** GET /v1/products/{id}/velocity */
    public function show(int $id): JsonResponse
    {
        $stat = ProductVelocityStat::where('product_id', $id)->first();
        if (!$stat) {
            return response()->json([
                'status' => true,
                'data'   => null,
            ]);
        }

        // Urgency classification — the frontend uses this to pick the colour
        $urgency = match (true) {
            $stat->days_of_supply === null                => 'unknown',
            $stat->days_of_supply <= 2                    => 'critical',   // red
            $stat->days_of_supply <= 7                    => 'high',       // orange
            $stat->days_of_supply <= 14                   => 'medium',     // amber
            default                                       => 'low',        // skip display
        };

        return response()->json([
            'status' => true,
            'data' => [
                'daily_sales_avg' => (float) $stat->daily_sales_avg,
                'current_stock'   => (int) $stat->current_stock,
                'days_of_supply'  => $stat->days_of_supply !== null ? (float) $stat->days_of_supply : null,
                'window_sales'    => (int) $stat->window_sales,
                'window_days'     => (int) $stat->window_days,
                'urgency'         => $urgency,
                'computed_at'     => $stat->computed_at,
            ],
        ]);
    }
}
