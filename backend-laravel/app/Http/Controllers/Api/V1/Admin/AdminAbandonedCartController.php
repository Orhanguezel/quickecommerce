<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\AbandonedCart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Read-only admin endpoints for the abandoned-cart dashboard.
 *
 * - GET /v1/admin/abandoned-carts         : paginated list with filters
 * - GET /v1/admin/abandoned-carts/stats   : aggregate counters + recovery rate
 */
class AdminAbandonedCartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = AbandonedCart::query()->with('customer:id,first_name,last_name,email');

        if ($stage = $request->query('stage')) {
            match ($stage) {
                'active'       => $q->whereNull('abandoned_at')->whereNull('recovered_at'),
                'abandoned'    => $q->whereNotNull('abandoned_at')->whereNull('first_reminded_at')->whereNull('recovered_at'),
                'reminded_1'   => $q->whereNotNull('first_reminded_at')->whereNull('second_reminded_at')->whereNull('recovered_at'),
                'reminded_2'   => $q->whereNotNull('second_reminded_at')->whereNull('third_reminded_at')->whereNull('recovered_at'),
                'reminded_3'   => $q->whereNotNull('third_reminded_at')->whereNull('recovered_at'),
                'recovered'    => $q->whereNotNull('recovered_at'),
                'unsubscribed' => $q->whereNotNull('unsubscribed_at'),
                default        => null,
            };
        }

        if ($search = $request->query('search')) {
            $q->where(function ($sub) use ($search) {
                $sub->where('email', 'like', "%{$search}%")
                    ->orWhere('session_id', 'like', "%{$search}%");
            });
        }

        if ($from = $request->query('from')) {
            $q->where('created_at', '>=', Carbon::parse($from));
        }
        if ($to = $request->query('to')) {
            $q->where('created_at', '<=', Carbon::parse($to)->endOfDay());
        }

        $perPage = min(100, max(10, (int) $request->query('per_page', 25)));

        $rows = $q->orderByDesc('updated_at')->paginate($perPage);

        $rows->getCollection()->transform(fn (AbandonedCart $c) => [
            'id'                 => $c->id,
            'customer_id'        => $c->customer_id,
            'customer_name'      => optional($c->customer)->first_name
                ? trim(optional($c->customer)->first_name . ' ' . optional($c->customer)->last_name)
                : null,
            'email'              => $c->email,
            'item_count'         => $c->item_count,
            'items'              => collect(is_array($c->items_snapshot) ? $c->items_snapshot : (json_decode((string) $c->items_snapshot, true) ?: []))
                ->map(fn ($i) => [
                    'name'     => $i['name'] ?? '—',
                    'quantity' => $i['quantity'] ?? 1,
                    'price'    => $i['price'] ?? 0,
                    'image'    => $i['image'] ?? null,
                ])->values(),
            'cart_total'         => $c->cart_total,
            'currency_code'      => $c->currency_code,
            'stage'              => $c->stage(),
            'last_activity_at'   => $c->last_activity_at,
            'abandoned_at'       => $c->abandoned_at,
            'first_reminded_at'  => $c->first_reminded_at,
            'second_reminded_at' => $c->second_reminded_at,
            'third_reminded_at'  => $c->third_reminded_at,
            'recovered_at'       => $c->recovered_at,
            'created_at'         => $c->created_at,
        ]);

        return response()->json([
            'status' => true,
            'data'   => $rows,
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $days = max(1, min(90, (int) $request->query('days', 30)));
        $since = Carbon::now()->subDays($days);

        $scope = AbandonedCart::query()->where('created_at', '>=', $since);

        $total = (clone $scope)->count();
        $abandoned = (clone $scope)->whereNotNull('abandoned_at')->count();
        $reminded1 = (clone $scope)->whereNotNull('first_reminded_at')->count();
        $reminded2 = (clone $scope)->whereNotNull('second_reminded_at')->count();
        $reminded3 = (clone $scope)->whereNotNull('third_reminded_at')->count();
        $recovered = (clone $scope)->whereNotNull('recovered_at')->count();
        $unsubscribed = (clone $scope)->whereNotNull('unsubscribed_at')->count();

        $abandonedValue = (float) (clone $scope)->whereNotNull('abandoned_at')->sum('cart_total');
        $recoveredValue = (float) (clone $scope)->whereNotNull('recovered_at')->sum('cart_total');
        $recoveredAfterReminder = (clone $scope)
            ->whereNotNull('recovered_at')
            ->whereNotNull('first_reminded_at')
            ->count();
        $recoveredAfterReminderValue = (float) (clone $scope)
            ->whereNotNull('recovered_at')
            ->whereNotNull('first_reminded_at')
            ->sum('cart_total');
        $incentiveCost = (float) (clone $scope)->whereNotNull('recovered_at')->sum('incentive_cost');
        $variants = (clone $scope)
            ->whereNotNull('recovery_variant')
            ->select('recovery_variant')
            ->selectRaw('COUNT(*) as assigned')
            ->selectRaw('SUM(first_reminded_at IS NOT NULL) as reminded')
            ->selectRaw('SUM(recovered_at IS NOT NULL AND first_reminded_at IS NOT NULL) as recovered')
            ->selectRaw('SUM(CASE WHEN recovered_at IS NOT NULL AND first_reminded_at IS NOT NULL THEN cart_total ELSE 0 END) as recovered_value')
            ->groupBy('recovery_variant')
            ->get()
            ->map(fn ($row) => [
                'variant' => $row->recovery_variant,
                'assigned' => (int) $row->assigned,
                'reminded' => (int) $row->reminded,
                'recovered' => (int) $row->recovered,
                'recovery_rate_pct' => (int) $row->reminded > 0
                    ? round(((int) $row->recovered / (int) $row->reminded) * 100, 2)
                    : 0,
                'recovered_value' => (float) $row->recovered_value,
            ]);

        $recoveryRate = $abandoned > 0
            ? round(($recovered / $abandoned) * 100, 2)
            : 0.0;
        $reminderRecoveryRate = $reminded1 > 0
            ? round(($recoveredAfterReminder / $reminded1) * 100, 2)
            : 0.0;

        return response()->json([
            'status' => true,
            'data'   => [
                'window_days'       => $days,
                'total_snapshots'   => $total,
                'abandoned'         => $abandoned,
                'reminded_1'        => $reminded1,
                'reminded_2'        => $reminded2,
                'reminded_3'        => $reminded3,
                'recovered'         => $recovered,
                'unsubscribed'      => $unsubscribed,
                'recovery_rate_pct' => $recoveryRate,
                'reminder_recovery_rate_pct' => $reminderRecoveryRate,
                'abandoned_value'   => $abandonedValue,
                'recovered_value'   => $recoveredValue,
                'recovered_after_reminder' => $recoveredAfterReminder,
                'recovered_after_reminder_value' => $recoveredAfterReminderValue,
                'incentive_cost' => $incentiveCost,
                'net_recovered_value' => max(0, $recoveredAfterReminderValue - $incentiveCost),
                'variants' => $variants,
            ],
        ]);
    }
}
