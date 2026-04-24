<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\FunnelEvent;
use App\Models\ExperimentAssignment;
use App\Models\Experiment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Admin-facing aggregation endpoints for the funnel & recommendation
 * analytics dashboard. All queries scoped by a rolling window (default 30d).
 */
class AdminFunnelAnalyticsController extends Controller
{
    /** GET /v1/admin/analytics/funnel?days=30 */
    public function funnel(Request $request): JsonResponse
    {
        $days = $this->windowDays($request);
        $since = Carbon::now()->subDays($days);

        $countsByEvent = FunnelEvent::query()
            ->where('occurred_at', '>=', $since)
            ->select('event', DB::raw('COUNT(DISTINCT subject) as unique_subjects'), DB::raw('COUNT(*) as total'))
            ->groupBy('event')
            ->pluck('unique_subjects', 'event');

        $funnel = [
            'product_viewed'     => (int) ($countsByEvent['product_viewed'] ?? 0),
            'add_to_cart'        => (int) ($countsByEvent['add_to_cart'] ?? 0),
            'cart_viewed'        => (int) ($countsByEvent['cart_viewed'] ?? 0),
            'checkout_started'   => (int) ($countsByEvent['checkout_started'] ?? 0),
            'order_placed'       => (int) ($countsByEvent['order_placed'] ?? 0),
        ];

        // Conversion between sequential stages
        $rate = fn ($num, $den) => $den > 0 ? round(($num / $den) * 100, 2) : 0.0;

        return response()->json([
            'status' => true,
            'data' => [
                'window_days' => $days,
                'funnel'      => $funnel,
                'rates'       => [
                    'view_to_cart'       => $rate($funnel['add_to_cart'],      $funnel['product_viewed']),
                    'cart_to_checkout'   => $rate($funnel['checkout_started'], $funnel['cart_viewed']),
                    'checkout_to_order'  => $rate($funnel['order_placed'],     $funnel['checkout_started']),
                    'end_to_end'         => $rate($funnel['order_placed'],     $funnel['product_viewed']),
                ],
            ],
        ]);
    }

    /** GET /v1/admin/analytics/recommendation-ctr?days=30 */
    public function recommendationCtr(Request $request): JsonResponse
    {
        $days = $this->windowDays($request);
        $since = Carbon::now()->subDays($days);

        $rows = FunnelEvent::query()
            ->where('occurred_at', '>=', $since)
            ->whereIn('event', [
                'recommendation_shown',
                'recommendation_clicked',
                'recommendation_added',
            ])
            ->whereNotNull('block_type')
            ->select('block_type', 'event', DB::raw('COUNT(*) as count'))
            ->groupBy('block_type', 'event')
            ->get();

        $byBlock = [];
        foreach ($rows as $row) {
            $byBlock[$row->block_type] ??= ['shown' => 0, 'clicked' => 0, 'added' => 0];
            $key = str_replace('recommendation_', '', $row->event);
            $byBlock[$row->block_type][$key] = (int) $row->count;
        }

        $out = [];
        foreach ($byBlock as $type => $counts) {
            $shown = (int) ($counts['shown'] ?? 0);
            $clicked = (int) ($counts['clicked'] ?? 0);
            $added = (int) ($counts['added'] ?? 0);
            $out[] = [
                'block_type' => $type,
                'shown'      => $shown,
                'clicked'    => $clicked,
                'added'      => $added,
                'ctr_pct'    => $shown > 0 ? round(($clicked / $shown) * 100, 2) : 0.0,
                'atc_pct'    => $clicked > 0 ? round(($added / $clicked) * 100, 2) : 0.0,
            ];
        }

        // Sort by total impressions desc so busy blocks appear first.
        usort($out, fn ($a, $b) => $b['shown'] <=> $a['shown']);

        return response()->json([
            'status' => true,
            'data'   => [
                'window_days' => $days,
                'blocks'      => $out,
            ],
        ]);
    }

    /** GET /v1/admin/analytics/experiments?days=30 */
    public function experiments(Request $request): JsonResponse
    {
        $days = $this->windowDays($request);
        $since = Carbon::now()->subDays($days);

        $experiments = Experiment::query()
            ->where('status', 'running')
            ->orWhere(function ($q) use ($since) {
                $q->where('status', 'ended')->where('ended_at', '>=', $since);
            })
            ->get();

        $out = [];
        foreach ($experiments as $exp) {
            $variantStats = ExperimentAssignment::query()
                ->where('experiment_id', $exp->id)
                ->where('created_at', '>=', $since)
                ->select(
                    'variant_key',
                    DB::raw('COUNT(*) as assigned'),
                    DB::raw('COUNT(exposed_at) as exposed'),
                    DB::raw('COUNT(converted_at) as converted')
                )
                ->groupBy('variant_key')
                ->get()
                ->map(fn ($r) => [
                    'variant_key'     => $r->variant_key,
                    'assigned'        => (int) $r->assigned,
                    'exposed'         => (int) $r->exposed,
                    'converted'       => (int) $r->converted,
                    'conversion_rate' => $r->exposed > 0
                        ? round(($r->converted / $r->exposed) * 100, 2)
                        : 0.0,
                ]);

            $out[] = [
                'key'      => $exp->key,
                'name'     => $exp->name,
                'status'   => $exp->status,
                'variants' => $variantStats,
            ];
        }

        return response()->json([
            'status' => true,
            'data'   => [
                'window_days' => $days,
                'experiments' => $out,
            ],
        ]);
    }

    private function windowDays(Request $request): int
    {
        return max(1, min(90, (int) $request->query('days', 30)));
    }
}
