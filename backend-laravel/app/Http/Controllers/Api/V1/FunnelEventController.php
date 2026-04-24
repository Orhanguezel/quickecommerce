<?php

namespace App\Http\Controllers\Api\V1;


use App\Models\FunnelEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Collects lightweight funnel events from the frontend. Fire-and-forget —
 * the frontend never blocks the UX on these. Batch endpoint accepts
 * multiple events in one round-trip to keep network load low.
 */
class FunnelEventController extends Controller
{
    private const ALLOWED_EVENTS = [
        'product_viewed',
        'add_to_cart',
        'cart_viewed',
        'checkout_started',
        'order_placed',
        'recommendation_shown',
        'recommendation_clicked',
        'recommendation_added',
        'shipping_threshold_crossed',
        'coupon_threshold_crossed',
        'exit_intent_shown',
        'exit_intent_converted',
    ];

    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'events'                   => 'required|array|min:1|max:50',
            'events.*.event'           => 'required|string|max:64',
            'events.*.subject'         => 'required|string|max:64',
            'events.*.product_id'      => 'nullable|integer',
            'events.*.block_type'      => 'nullable|string|max:64',
            'events.*.amount'          => 'nullable|numeric|min:0',
            'events.*.meta'            => 'nullable|array',
            'events.*.occurred_at'     => 'nullable|date',
        ]);

        $customerId = auth('api_customer')->check()
            ? (int) auth('api_customer')->user()->id
            : null;

        $rows = [];
        foreach ($validated['events'] as $e) {
            if (!in_array($e['event'], self::ALLOWED_EVENTS, true)) continue;

            $rows[] = [
                'event'       => $e['event'],
                'subject'     => $e['subject'],
                'customer_id' => $customerId,
                'product_id'  => $e['product_id'] ?? null,
                'block_type'  => $e['block_type'] ?? null,
                'amount'      => $e['amount'] ?? null,
                'meta'        => isset($e['meta']) ? json_encode($e['meta']) : null,
                'occurred_at' => $e['occurred_at'] ?? now(),
                'created_at'  => now(),
                'updated_at'  => now(),
            ];
        }

        if (!empty($rows)) {
            FunnelEvent::insert($rows);
        }

        return response()->json([
            'status'   => true,
            'accepted' => count($rows),
        ]);
    }
}
