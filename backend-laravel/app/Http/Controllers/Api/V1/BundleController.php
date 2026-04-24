<?php

namespace App\Http\Controllers\Api\V1;


use App\Http\Resources\Bundle\BundlePublicResource;
use App\Models\Bundle;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BundleController extends Controller
{
    /** GET /v1/bundles — paginated list of currently-active bundles. */
    public function index(Request $request): JsonResponse
    {
        $now = now();
        $perPage = min(50, max(5, (int) $request->query('per_page', 12)));

        $bundles = Bundle::query()
            ->with(['items.product', 'items.variant'])
            ->where('status', 1)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->paginate($perPage);

        return response()->json([
            'status' => true,
            'data'   => BundlePublicResource::collection($bundles)->response()->getData(true),
        ]);
    }

    /** GET /v1/bundles/{slug} — single bundle detail. */
    public function show(string $slug): JsonResponse
    {
        $bundle = Bundle::query()
            ->with(['items.product', 'items.variant'])
            ->where('slug', $slug)
            ->first();

        if (!$bundle || !$bundle->isActiveNow()) {
            return response()->json([
                'status'  => false,
                'message' => __('messages.not_found'),
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data'   => new BundlePublicResource($bundle),
        ]);
    }

    /**
     * POST /v1/cart/validate-bundles
     *
     * Authoritative recomputation of the cart total for bundles. The frontend
     * sends its cart items (optionally tagged with bundle_id) and receives
     * back the subtotal the server will honour at order time. Used as a
     * trust-but-verify gate right before /odeme so the customer doesn't get
     * surprise charges at checkout.
     *
     * Request body:
     *   { items: [{ product_id, variant_id?, quantity, bundle_id? }] }
     *
     * Response:
     *   {
     *     computed_subtotal: 1234.50,
     *     bundles: [
     *       { id, name, expected_total, actual_item_count, complete: bool }
     *     ],
     *     line_items: [...]
     *   }
     */
    public function validateBundles(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items'                 => 'required|array|min:1',
            'items.*.product_id'    => 'required|integer',
            'items.*.variant_id'    => 'nullable|integer',
            'items.*.quantity'      => 'required|integer|min:1',
            'items.*.bundle_id'     => 'nullable|integer',
        ]);

        // Lookup variants once in bulk to avoid N+1 on typical cart sizes
        $variantIds = collect($validated['items'])->pluck('variant_id')->filter()->unique();
        $variants = ProductVariant::whereIn('id', $variantIds)->get()->keyBy('id');

        $bundleIds = collect($validated['items'])->pluck('bundle_id')->filter()->unique();
        $bundles = Bundle::with('items')->whereIn('id', $bundleIds)->get()->keyBy('id');

        $subtotal = 0.0;
        $lineItems = [];
        $bundleSums = []; // bundle_id → [count, expected_total]

        foreach ($validated['items'] as $item) {
            $variant = isset($item['variant_id']) ? ($variants[$item['variant_id']] ?? null) : null;
            $unitStandalone = $variant
                ? (float) ($variant->special_price ?? $variant->price)
                : 0.0;

            $lineStandaloneTotal = $unitStandalone * (int) $item['quantity'];

            if (!empty($item['bundle_id']) && $bundles->has($item['bundle_id'])) {
                $bundleSums[$item['bundle_id']] ??= [
                    'count'          => 0,
                    'expected_total' => 0.0,
                ];
                $bundleSums[$item['bundle_id']]['count']++;
                $bundleSums[$item['bundle_id']]['expected_total'] += $lineStandaloneTotal;
            } else {
                $subtotal += $lineStandaloneTotal;
            }

            $lineItems[] = [
                'product_id' => (int) $item['product_id'],
                'variant_id' => $item['variant_id'] ?? null,
                'quantity'   => (int) $item['quantity'],
                'bundle_id'  => $item['bundle_id'] ?? null,
                'standalone_unit_price' => $unitStandalone,
                'standalone_line_total' => $lineStandaloneTotal,
            ];
        }

        // Apply bundle pricing — if the cart has *all* items of a bundle we
        // honour bundle_price; otherwise fall back to standalone totals for
        // that bundle's items (customer removed some).
        $bundleSummary = [];
        foreach ($bundleSums as $bundleId => $agg) {
            $bundle = $bundles[$bundleId];
            $complete = $agg['count'] >= $bundle->items->count();

            if ($complete) {
                $subtotal += (float) $bundle->bundle_price;
            } else {
                $subtotal += $agg['expected_total']; // fallback
            }

            $bundleSummary[] = [
                'id'                => (int) $bundle->id,
                'name'              => $bundle->name,
                'bundle_price'      => (float) $bundle->bundle_price,
                'standalone_total'  => $agg['expected_total'],
                'items_in_cart'     => $agg['count'],
                'items_required'    => $bundle->items->count(),
                'complete'          => $complete,
                'savings'           => $complete
                    ? max(0, $agg['expected_total'] - (float) $bundle->bundle_price)
                    : 0.0,
            ];
        }

        return response()->json([
            'status'            => true,
            'computed_subtotal' => round($subtotal, 2),
            'bundles'           => $bundleSummary,
            'line_items'        => $lineItems,
        ]);
    }
}
