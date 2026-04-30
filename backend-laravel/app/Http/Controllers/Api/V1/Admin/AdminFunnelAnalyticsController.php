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
    /** GET /v1/admin/analytics/overview?days=30 */
    public function overview(Request $request): JsonResponse
    {
        $days = $this->windowDays($request);
        $since = Carbon::now()->subDays($days);

        $base = FunnelEvent::query()->where('created_at', '>=', $since);
        $human = (clone $base)->where('is_bot', false);

        $eventCounts = (clone $human)
            ->select('event', DB::raw('COUNT(*) as total'))
            ->groupBy('event')
            ->pluck('total', 'event');

        $topPages = (clone $human)
            ->where('event', 'page_view')
            ->whereNotNull('path')
            ->select(
                'path',
                DB::raw('COUNT(*) as views'),
                DB::raw('COUNT(DISTINCT COALESCE(session_id, subject)) as sessions')
            )
            ->groupBy('path')
            ->orderByDesc('views')
            ->limit(10)
            ->get();

        $topProducts = (clone $human)
            ->whereIn('funnel_events.event', ['product_view', 'product_click', 'add_to_cart'])
            ->whereNotNull('funnel_events.product_id')
            ->leftJoin('products', 'products.id', '=', 'funnel_events.product_id')
            ->select(
                'funnel_events.product_id',
                DB::raw('MAX(products.name) as product_name'),
                DB::raw("SUM(CASE WHEN funnel_events.event = 'product_view' THEN 1 ELSE 0 END) as views"),
                DB::raw("SUM(CASE WHEN funnel_events.event = 'product_click' THEN 1 ELSE 0 END) as clicks"),
                DB::raw("SUM(CASE WHEN funnel_events.event = 'add_to_cart' THEN 1 ELSE 0 END) as add_to_carts")
            )
            ->groupBy('funnel_events.product_id')
            ->orderByDesc('views')
            ->limit(10)
            ->get();

        $topSearches = (clone $human)
            ->where('event', 'search')
            ->select(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(meta, '$.query')) as query"), DB::raw('COUNT(*) as searches'))
            ->groupBy('query')
            ->havingRaw('query IS NOT NULL AND query != ""')
            ->orderByDesc('searches')
            ->limit(10)
            ->get();

        $utmCampaigns = (clone $human)
            ->where(function ($q) {
                $q->whereNotNull('utm_source')->orWhereNotNull('utm_campaign');
            })
            ->select('utm_source', 'utm_medium', 'utm_campaign', DB::raw('COUNT(*) as events'))
            ->groupBy('utm_source', 'utm_medium', 'utm_campaign')
            ->orderByDesc('events')
            ->limit(10)
            ->get();

        $devices = (clone $human)
            ->select('device_type', DB::raw('COUNT(DISTINCT COALESCE(session_id, subject)) as sessions'))
            ->groupBy('device_type')
            ->orderByDesc('sessions')
            ->get();

        $recentEvents = (clone $base)
            ->select('event', 'subject', 'visitor_id', 'session_id', 'ip_address', 'path', 'product_id', 'amount', 'is_bot', 'device_type', 'browser', 'os', 'created_at')
            ->latest('created_at')
            ->limit(25)
            ->get();

        return response()->json([
            'status' => true,
            'data' => [
                'window_days' => $days,
                'summary' => [
                    'events' => (int) (clone $base)->count(),
                    'human_events' => (int) (clone $human)->count(),
                    'bot_events' => (int) (clone $base)->where('is_bot', true)->count(),
                    'visitors' => (int) (clone $human)->distinct('visitor_id')->whereNotNull('visitor_id')->count('visitor_id'),
                    'sessions' => (int) (clone $human)->distinct('session_id')->whereNotNull('session_id')->count('session_id'),
                    'page_views' => (int) ($eventCounts['page_view'] ?? 0),
                    'product_views' => (int) ($eventCounts['product_view'] ?? 0),
                    'product_clicks' => (int) ($eventCounts['product_click'] ?? 0),
                    'add_to_carts' => (int) ($eventCounts['add_to_cart'] ?? 0),
                    'checkout_starts' => (int) ($eventCounts['checkout_start'] ?? 0),
                    'orders' => (int) ($eventCounts['order_created'] ?? 0),
                    'payments' => (int) ($eventCounts['payment_success'] ?? 0),
                ],
                'top_pages' => $topPages,
                'top_products' => $topProducts,
                'top_searches' => $topSearches,
                'utm_campaigns' => $utmCampaigns,
                'devices' => $devices,
                'recent_events' => $recentEvents,
            ],
        ]);
    }

    /** GET /v1/admin/analytics/funnel?days=30 */
    public function funnel(Request $request): JsonResponse
    {
        $days = $this->windowDays($request);
        $since = Carbon::now()->subDays($days);

        $countsByEvent = FunnelEvent::query()
            ->where('occurred_at', '>=', $since)
            ->where('is_bot', false)
            ->select('event', DB::raw('COUNT(DISTINCT subject) as unique_subjects'), DB::raw('COUNT(*) as total'))
            ->groupBy('event')
            ->pluck('unique_subjects', 'event');

        $funnel = [
            'page_view'          => (int) ($countsByEvent['page_view'] ?? 0),
            'product_view'       => (int) ($countsByEvent['product_view'] ?? 0),
            'product_click'      => (int) ($countsByEvent['product_click'] ?? 0),
            'add_to_cart'        => (int) ($countsByEvent['add_to_cart'] ?? 0),
            'cart_view'          => (int) ($countsByEvent['cart_view'] ?? 0),
            'checkout_start'     => (int) ($countsByEvent['checkout_start'] ?? 0),
            'order_created'      => (int) ($countsByEvent['order_created'] ?? 0),
            'payment_success'    => (int) ($countsByEvent['payment_success'] ?? 0),
        ];

        // Conversion between sequential stages
        $rate = fn ($num, $den) => $den > 0 ? round(($num / $den) * 100, 2) : 0.0;

        return response()->json([
            'status' => true,
            'data' => [
                'window_days' => $days,
                'funnel'      => $funnel,
                'rates'       => [
                    'view_to_cart'       => $rate($funnel['add_to_cart'],      $funnel['product_view']),
                    'cart_to_checkout'   => $rate($funnel['checkout_start'],   $funnel['cart_view']),
                    'checkout_to_order'  => $rate($funnel['payment_success'],  $funnel['checkout_start']),
                    'end_to_end'         => $rate($funnel['payment_success'],  $funnel['product_view']),
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
            ->where('is_bot', false)
            ->whereIn('event', [
                'recommendation_view',
                'recommendation_click',
                'recommendation_add',
            ])
            ->whereNotNull('block_type')
            ->select('block_type', 'event', DB::raw('COUNT(*) as count'))
            ->groupBy('block_type', 'event')
            ->get();

        $byBlock = [];
        foreach ($rows as $row) {
            $byBlock[$row->block_type] ??= ['shown' => 0, 'clicked' => 0, 'added' => 0];
            $key = match ($row->event) {
                'recommendation_view' => 'shown',
                'recommendation_click' => 'clicked',
                'recommendation_add' => 'added',
                default => str_replace('recommendation_', '', $row->event),
            };
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
