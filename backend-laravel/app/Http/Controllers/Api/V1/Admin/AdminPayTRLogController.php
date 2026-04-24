<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\PayTRCallbackLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Admin read-only access to recent PayTR callbacks. Solves the open
 * checklist item: "PayTR test ödemesinde callback düştüğünü görmek
 * için sunucu log'una SSH gerekiyor."
 */
class AdminPayTRLogController extends Controller
{
    /** GET /v1/admin/paytr/callback-logs */
    public function index(Request $request): JsonResponse
    {
        $q = PayTRCallbackLog::query();

        if ($outcome = $request->query('outcome')) {
            $q->where('outcome', $outcome);
        }
        if ($search = $request->query('search')) {
            $q->where('merchant_oid', 'like', "%{$search}%");
        }

        $rows = $q->orderByDesc('received_at')
            ->paginate(min(100, max(10, (int) $request->query('per_page', 25))));

        return response()->json([
            'status' => true,
            'data'   => $rows,
        ]);
    }

    /** GET /v1/admin/paytr/callback-logs/stats */
    public function stats(): JsonResponse
    {
        $last24h = Carbon::now()->subDay();

        $recent = PayTRCallbackLog::where('received_at', '>=', $last24h)
            ->selectRaw('outcome, COUNT(*) as c')
            ->groupBy('outcome')
            ->pluck('c', 'outcome');

        $latest = PayTRCallbackLog::orderByDesc('received_at')->first();

        return response()->json([
            'status' => true,
            'data' => [
                'counts_24h' => [
                    'received'      => (int) ($recent['received'] ?? 0),
                    'processed'     => (int) ($recent['processed'] ?? 0),
                    'hash_mismatch' => (int) ($recent['hash_mismatch'] ?? 0),
                    'unknown_oid'   => (int) ($recent['unknown_oid'] ?? 0),
                    'exception'     => (int) ($recent['exception'] ?? 0),
                ],
                'latest_at' => $latest?->received_at,
                'latest_merchant_oid' => $latest?->merchant_oid,
                'latest_outcome' => $latest?->outcome,
            ],
        ]);
    }
}
