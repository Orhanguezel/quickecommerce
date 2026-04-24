<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Product\PopularProductPublicResource;
use App\Models\Product;
use App\Services\Recommendation\CartRecommendationOrchestrator;
use App\Services\Recommendation\Repositories\CoPurchaseRepository;
use App\Services\Recommendation\Strategies\CategoryPopularStrategy;
use App\Services\Recommendation\Strategies\CoPurchaseStrategy;
use App\Services\Recommendation\Strategies\WishlistTriggeredStrategy;
use App\Services\Recommendation\Support\CartContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

/**
 * Public endpoint that returns contextual product recommendations for
 * the current cart.
 *
 * Route: POST /api/v1/cart/recommendations
 * Auth:  optional (guest carts are first-class)
 */
class CartRecommendationController extends Controller
{
    public function __construct(
        protected CoPurchaseRepository $coPurchaseRepo
    ) {}

    public function recommendations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cart_items'                => 'required|array|min:1',
            'cart_items.*.product_id'   => 'required|integer|exists:products,id',
            'cart_items.*.variant_id'   => 'nullable|integer',
            'cart_items.*.quantity'     => 'nullable|integer|min:1',
            'cart_items.*.price'        => 'nullable|numeric|min:0',
            'max_blocks'                => 'nullable|integer|min:1|max:5',
            'products_per_block'        => 'nullable|integer|min:1|max:12',
        ]);

        $items = $validated['cart_items'];
        $productIds = array_values(array_unique(array_map(
            static fn ($i) => (int) $i['product_id'],
            $items
        )));

        // Build category/store context from the actual products
        $productMeta = Product::whereIn('id', $productIds)
            ->get(['id', 'category_id', 'store_id'])
            ->keyBy('id');

        $categoryIds = $productMeta->pluck('category_id')
            ->filter()->map(fn ($v) => (int) $v)->values()->all();
        $storeIds = $productMeta->pluck('store_id')
            ->filter()->map(fn ($v) => (int) $v)->values()->all();

        $subtotal = array_sum(array_map(
            static fn ($i) => (float) ($i['price'] ?? 0) * (int) ($i['quantity'] ?? 1),
            $items
        ));

        $ctx = new CartContext(
            items: array_map(
                static fn ($i) => [
                    'product_id' => (int) $i['product_id'],
                    'variant_id' => isset($i['variant_id']) ? (int) $i['variant_id'] : null,
                    'quantity'   => (int) ($i['quantity'] ?? 1),
                    'price'      => (float) ($i['price'] ?? 0),
                ],
                $items
            ),
            subtotal: $subtotal,
            userId: auth('api_customer')->check() ? (int) auth('api_customer')->user()->id : null,
            categoryIds: $categoryIds,
            storeIds: $storeIds,
            locale: App::getLocale(),
        );

        $orchestrator = (new CartRecommendationOrchestrator())
            ->register(new CoPurchaseStrategy($this->coPurchaseRepo))
            ->register(new WishlistTriggeredStrategy())
            ->register(new CategoryPopularStrategy())
            ->setMaxBlocks((int) ($validated['max_blocks'] ?? 3))
            ->setProductsPerBlock((int) ($validated['products_per_block'] ?? 6));

        $blocks = $orchestrator->build($ctx);

        $payload = array_map(
            fn ($block) => [
                'type'      => $block->type,
                'title_key' => $block->titleKey,
                'priority'  => $block->priority,
                'meta'      => (object) $block->meta,
                'products'  => PopularProductPublicResource::collection($block->products),
            ],
            $blocks
        );

        return response()->json([
            'status'   => true,
            'message'  => __('messages.data_found'),
            'blocks'   => $payload,
            'subtotal' => $subtotal,
        ]);
    }
}
