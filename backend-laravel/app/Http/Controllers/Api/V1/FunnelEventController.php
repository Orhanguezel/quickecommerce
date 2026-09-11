<?php

namespace App\Http\Controllers\Api\V1;


use App\Models\FunnelEvent;
use App\Models\OrderMaster;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Collects lightweight funnel events from the frontend. Fire-and-forget —
 * the frontend never blocks the UX on these. Batch endpoint accepts
 * multiple events in one round-trip to keep network load low.
 */
class FunnelEventController extends Controller
{
    private const ALLOWED_EVENTS = [
        'page_view',
        'product_view',
        'category_view',
        'search',
        'store_view',
        'product_click',
        'add_to_cart',
        'remove_from_cart',
        'cart_view',
        'checkout_start',
        'shipping_selected',
        'payment_selected',
        'order_created',
        'payment_success',
        'payment_failed',
        'banner_click',
        'coupon_view',
        'coupon_apply',
        'recommendation_view',
        'recommendation_click',
        'recommendation_add',
        'shipping_threshold_crossed',
        'coupon_threshold_crossed',
        'exit_intent_shown',
        'exit_intent_converted',
    ];

    private const LEGACY_EVENT_MAP = [
        'product_viewed' => 'product_view',
        'cart_viewed' => 'cart_view',
        'checkout_started' => 'checkout_start',
        'order_placed' => 'order_created',
        'recommendation_shown' => 'recommendation_view',
        'recommendation_clicked' => 'recommendation_click',
        'recommendation_added' => 'recommendation_add',
    ];

    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'events'                   => 'required|array|min:1|max:50',
            'events.*.event'           => 'required|string|max:64',
            'events.*.subject'         => 'nullable|string|max:64',
            'events.*.visitor_id'      => 'nullable|string|max:64',
            'events.*.session_id'      => 'nullable|string|max:64',
            'events.*.product_id'      => 'nullable|integer',
            'events.*.category_id'     => 'nullable|integer',
            'events.*.order_id'        => 'nullable|integer',
            'events.*.block_type'      => 'nullable|string|max:64',
            'events.*.amount'          => 'nullable|numeric|min:0',
            'events.*.referer'         => 'nullable|string|max:2048',
            'events.*.url'             => 'nullable|string|max:2048',
            'events.*.path'            => 'nullable|string|max:512',
            'events.*.locale'          => 'nullable|string|max:8',
            'events.*.utm_source'      => 'nullable|string|max:128',
            'events.*.utm_medium'      => 'nullable|string|max:128',
            'events.*.utm_campaign'    => 'nullable|string|max:255',
            'events.*.utm_term'        => 'nullable|string|max:255',
            'events.*.utm_content'     => 'nullable|string|max:255',
            'events.*.meta'            => 'nullable|array',
            'events.*.occurred_at'     => 'nullable|date',
        ]);

        $customerId = auth('api_customer')->check()
            ? (int) auth('api_customer')->user()->id
            : null;

        $ipAddress = $request->ip();
        $userAgent = (string) $request->userAgent();
        $device = $this->parseUserAgent($userAgent);
        $requestReferer = $request->headers->get('referer');
        $paymentOrderIds = collect($validated['events'])
            ->filter(fn ($event) => $this->normalizeEvent($event['event']) === 'payment_success')
            ->pluck('order_id')->filter()->map(fn ($id) => (int) $id)->unique();
        $paidOrders = OrderMaster::query()
            ->whereIn('id', $paymentOrderIds)
            ->where('payment_status', 'paid')
            ->where('is_test', false)
            ->get(['id', 'customer_id', 'session_id'])
            ->keyBy('id');

        $rows = [];
        foreach ($validated['events'] as $e) {
            $event = $this->normalizeEvent($e['event']);
            if (!in_array($event, self::ALLOWED_EVENTS, true)) continue;

            $visitorId = $e['visitor_id'] ?? null;
            $sessionId = $e['session_id'] ?? null;
            $subject = $e['subject']
                ?? $visitorId
                ?? $sessionId
                ?? ('ip:' . substr(hash('sha256', $ipAddress . '|' . $userAgent), 0, 32));

            if ($event === 'payment_success') {
                $order = $paidOrders->get((int) ($e['order_id'] ?? 0));
                $ownedByCustomer = $order && $customerId !== null && (int) $order->customer_id === $customerId;
                $ownedByGuestSession = $order && $customerId === null && $order->customer_id === null
                    && filled($order->session_id) && hash_equals((string) $order->session_id, (string) ($e['session_id'] ?? ''));
                if (! $ownedByCustomer && ! $ownedByGuestSession) continue;
            }

            $rows[] = [
                'event'        => $event,
                'subject'      => $subject,
                'visitor_id'   => $visitorId,
                'session_id'   => $sessionId,
                'customer_id'  => $customerId,
                'ip_address'   => $ipAddress,
                'user_agent'   => $userAgent ?: null,
                'referer'      => $e['referer'] ?? $requestReferer,
                'url'          => $e['url'] ?? null,
                'path'         => $e['path'] ?? null,
                'locale'       => $e['locale'] ?? null,
                'device_type'  => $device['device_type'],
                'browser'      => $device['browser'],
                'os'           => $device['os'],
                'is_bot'       => $device['is_bot'],
                'utm_source'   => $e['utm_source'] ?? null,
                'utm_medium'   => $e['utm_medium'] ?? null,
                'utm_campaign' => $e['utm_campaign'] ?? null,
                'utm_term'     => $e['utm_term'] ?? null,
                'utm_content'  => $e['utm_content'] ?? null,
                'product_id'   => $e['product_id'] ?? null,
                'category_id'  => $e['category_id'] ?? null,
                'order_id'     => $e['order_id'] ?? null,
                'dedupe_key'   => in_array($event, ['order_created', 'payment_success'], true) && ! empty($e['order_id'])
                    ? "{$event}:{$e['order_id']}"
                    : null,
                'block_type'   => $e['block_type'] ?? null,
                'amount'       => $e['amount'] ?? null,
                'meta'         => isset($e['meta']) ? json_encode($e['meta']) : null,
                'occurred_at'  => $this->normalizeOccurredAt($e['occurred_at'] ?? null),
                'created_at'   => now(),
                'updated_at'   => now(),
            ];
        }

        $accepted = ! empty($rows) ? FunnelEvent::insertOrIgnore($rows) : 0;

        return response()->json([
            'status'   => true,
            'accepted' => $accepted,
        ]);
    }

    private function normalizeEvent(string $event): string
    {
        return self::LEGACY_EVENT_MAP[$event] ?? $event;
    }

    private function normalizeOccurredAt(?string $occurredAt): string
    {
        if (!$occurredAt) {
            return now()->toDateTimeString();
        }

        try {
            return Carbon::parse($occurredAt)->toDateTimeString();
        } catch (\Throwable) {
            return now()->toDateTimeString();
        }
    }

    /**
     * Lightweight parser for reporting dimensions. It intentionally avoids a
     * heavy dependency; precise user-agent analytics can be refined later.
     *
     * @return array{device_type:string,browser:?string,os:?string,is_bot:bool}
     */
    private function parseUserAgent(string $userAgent): array
    {
        $ua = strtolower($userAgent);
        $isBot = (bool) preg_match('/bot|crawl|spider|slurp|semrush|ahrefs|uptime|monitor|facebookexternalhit|preview/i', $userAgent);

        $deviceType = 'desktop';
        if (preg_match('/tablet|ipad/i', $userAgent)) {
            $deviceType = 'tablet';
        } elseif (preg_match('/mobile|android|iphone|ipod/i', $userAgent)) {
            $deviceType = 'mobile';
        } elseif ($isBot) {
            $deviceType = 'bot';
        }

        $browser = null;
        if (str_contains($ua, 'edg/')) {
            $browser = 'Edge';
        } elseif (str_contains($ua, 'opr/') || str_contains($ua, 'opera')) {
            $browser = 'Opera';
        } elseif (str_contains($ua, 'firefox/')) {
            $browser = 'Firefox';
        } elseif (str_contains($ua, 'chrome/') || str_contains($ua, 'crios/')) {
            $browser = 'Chrome';
        } elseif (str_contains($ua, 'safari/')) {
            $browser = 'Safari';
        }

        $os = null;
        if (str_contains($ua, 'windows')) {
            $os = 'Windows';
        } elseif (str_contains($ua, 'android')) {
            $os = 'Android';
        } elseif (str_contains($ua, 'iphone') || str_contains($ua, 'ipad') || str_contains($ua, 'ios')) {
            $os = 'iOS';
        } elseif (str_contains($ua, 'mac os') || str_contains($ua, 'macintosh')) {
            $os = 'macOS';
        } elseif (str_contains($ua, 'linux')) {
            $os = 'Linux';
        }

        return [
            'device_type' => $deviceType,
            'browser' => $browser,
            'os' => $os,
            'is_bot' => $isBot,
        ];
    }
}
