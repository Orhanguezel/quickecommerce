<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;

/**
 * Tracks the approximate number of distinct users currently viewing a
 * product, using a Redis sorted set per product where:
 *   - member : subject id (cart_session_id or customer id — same scheme as experiments)
 *   - score  : UNIX timestamp when the viewer should be considered gone
 *
 * On every heartbeat/read we:
 *   1. ZREMRANGEBYSCORE key -inf <now>          (evict stale viewers)
 *   2. ZADD key <now + TTL> <subject>           (refresh presence on heartbeat)
 *   3. ZCARD key                                (count remaining viewers)
 *
 * TTL is intentionally short (45s) so the count reflects actual active
 * presence and not "people who visited an hour ago".
 */
class LiveViewerService
{
    /** How long a single heartbeat keeps a viewer "alive" (seconds). */
    private const TTL_SECONDS = 45;

    /** Noisy cap to avoid leaking business signals to competitors. */
    private const DISPLAY_CAP = 99;

    public function key(int $productId): string
    {
        return "viewers:product:{$productId}";
    }

    /**
     * Record that `subject` is viewing `productId` right now and return the
     * current viewer count. Call this every ~20s from the frontend.
     */
    public function heartbeat(int $productId, string $subject): int
    {
        $key = $this->key($productId);
        $now = time();

        Redis::zremrangebyscore($key, '-inf', (string) $now);
        Redis::zadd($key, $now + self::TTL_SECONDS, $subject);
        // Key expires on its own if no one viewed for a while.
        Redis::expire($key, self::TTL_SECONDS * 2);

        return min(self::DISPLAY_CAP, (int) Redis::zcard($key));
    }

    public function count(int $productId): int
    {
        $key = $this->key($productId);
        Redis::zremrangebyscore($key, '-inf', (string) time());
        return min(self::DISPLAY_CAP, (int) Redis::zcard($key));
    }
}
