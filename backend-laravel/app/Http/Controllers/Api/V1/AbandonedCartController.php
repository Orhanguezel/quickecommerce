<?php

namespace App\Http\Controllers\Api\V1;


use App\Models\AbandonedCart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

/**
 * Endpoints the frontend uses to keep the abandoned_carts table in sync.
 *
 * - POST /cart/snapshot      : upsert the current cart snapshot (called on cart edits)
 * - POST /cart/recover       : mark snapshot as recovered (called on order placement)
 * - POST /cart/unsubscribe   : respect user's "stop sending me reminder emails"
 */
class AbandonedCartController extends Controller
{
    /**
     * Upsert a snapshot. The frontend calls this debounced (~5s) whenever
     * the cart changes, so at any moment we have a fresh copy of the cart
     * for users who later abandon it.
     */
    public function snapshot(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id'             => 'nullable|string|max:64',
            'email'                  => 'nullable|email|max:255',
            'cart_items'             => 'required|array|min:1',
            'cart_items.*.product_id' => 'required|integer',
            'cart_items.*.variant_id' => 'nullable|integer',
            'cart_items.*.quantity'  => 'required|integer|min:1',
            'cart_items.*.price'     => 'nullable|numeric|min:0',
            'cart_items.*.name'      => 'nullable|string|max:500',
            'cart_items.*.image'     => 'nullable|string|max:1000',
            'cart_items.*.slug'      => 'nullable|string|max:255',
            'currency_code'          => 'nullable|string|max:8',
        ]);

        $customerId = auth('api_customer')->check()
            ? (int) auth('api_customer')->user()->id
            : null;
        $email = $validated['email']
            ?? (auth('api_customer')->check() ? auth('api_customer')->user()->email : null);
        $sessionId = $validated['session_id'] ?? null;

        // Without *some* way to identify the cart we can't do recovery emails.
        if ($customerId === null && empty($email) && empty($sessionId)) {
            return response()->json([
                'status'  => false,
                'message' => 'missing identifier',
            ], 422);
        }

        $itemCount = array_sum(array_map(
            static fn ($i) => (int) ($i['quantity'] ?? 1),
            $validated['cart_items']
        ));
        $cartTotal = array_sum(array_map(
            static fn ($i) => (float) ($i['price'] ?? 0) * (int) ($i['quantity'] ?? 1),
            $validated['cart_items']
        ));

        $match = $this->identifyQuery($customerId, $email, $sessionId);

        $data = [
            'customer_id'       => $customerId,
            'email'             => $email,
            'session_id'        => $sessionId,
            'items_snapshot'    => $validated['cart_items'],
            'item_count'        => $itemCount,
            'cart_total'        => $cartTotal,
            'currency_code'     => $validated['currency_code'] ?? 'TRY',
            'locale'            => App::getLocale(),
            'last_activity_at'  => now(),
            // Every edit clears the "abandoned" flag — we'll re-mark via cron.
            'abandoned_at'      => null,
            // A fresh interaction resets the reminder pipeline if they come back.
            'first_reminded_at' => null,
            'second_reminded_at'=> null,
            'third_reminded_at' => null,
            'recovered_at'      => null,
        ];

        /** @var AbandonedCart|null $existing */
        $existing = $match->first();
        if ($existing) {
            $existing->fill($data)->save();
            $cart = $existing;
        } else {
            $cart = AbandonedCart::create($data);
        }

        return response()->json([
            'status' => true,
            'id'     => $cart->id,
        ]);
    }

    /**
     * Frontend calls this after successful checkout so the abandoned-cart
     * worker doesn't send a recovery email to someone who just bought.
     */
    public function recover(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'nullable|string|max:64',
        ]);

        $customerId = auth('api_customer')->check()
            ? (int) auth('api_customer')->user()->id
            : null;
        $email = auth('api_customer')->check()
            ? auth('api_customer')->user()->email
            : null;

        $q = $this->identifyQuery($customerId, $email, $validated['session_id'] ?? null);
        $q->whereNull('recovered_at')->update(['recovered_at' => now()]);

        return response()->json(['status' => true]);
    }

    /** One-click unsubscribe from recovery emails. */
    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $id = $this->decodeUnsubscribeToken($validated['token']);
        if ($id === null) {
            return response()->json(['status' => false, 'message' => 'invalid token'], 400);
        }

        AbandonedCart::where('id', $id)
            ->whereNull('unsubscribed_at')
            ->update(['unsubscribed_at' => now()]);

        return response()->json(['status' => true]);
    }

    /**
     * Signed token so unsubscribe links in emails can't be trivially
     * spoofed to unsubscribe random users.
     */
    public static function unsubscribeToken(int $id): string
    {
        $secret = config('app.key');
        $sig = hash_hmac('sha256', (string) $id, $secret);
        return base64_encode("{$id}:{$sig}");
    }

    private function decodeUnsubscribeToken(string $token): ?int
    {
        $decoded = base64_decode($token, true);
        if ($decoded === false) return null;
        $parts = explode(':', $decoded, 2);
        if (count($parts) !== 2) return null;
        [$id, $sig] = $parts;

        $expected = hash_hmac('sha256', $id, config('app.key'));
        if (!hash_equals($expected, $sig)) return null;

        return (int) $id;
    }

    /** Build a query that matches the same cart across snapshots. */
    private function identifyQuery(?int $customerId, ?string $email, ?string $sessionId)
    {
        return AbandonedCart::query()->where(function ($q) use ($customerId, $email, $sessionId) {
            if ($customerId !== null) {
                $q->orWhere('customer_id', $customerId);
            }
            if (!empty($email)) {
                $q->orWhere('email', $email);
            }
            if (!empty($sessionId)) {
                $q->orWhere('session_id', $sessionId);
            }
        });
    }
}
