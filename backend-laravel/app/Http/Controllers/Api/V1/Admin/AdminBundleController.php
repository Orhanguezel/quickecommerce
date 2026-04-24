<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Bundle\BundlePublicResource;
use App\Models\Bundle;
use App\Models\BundleItem;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminBundleController extends Controller
{
    /** GET /v1/admin/bundles */
    public function index(Request $request): JsonResponse
    {
        $q = Bundle::query()->with('items.product');

        if ($search = $request->query('search')) {
            $q->where('name', 'like', "%{$search}%");
        }
        if (($status = $request->query('status')) !== null && $status !== '') {
            $q->where('status', (int) $status);
        }

        $rows = $q->orderByDesc('id')->paginate(min(100, max(10, (int) $request->query('per_page', 25))));

        return response()->json([
            'status' => true,
            'data'   => BundlePublicResource::collection($rows)->response()->getData(true),
        ]);
    }

    /** GET /v1/admin/bundles/{id} */
    public function show(int $id): JsonResponse
    {
        $bundle = Bundle::with(['items.product', 'items.variant'])->findOrFail($id);
        return response()->json(['status' => true, 'data' => new BundlePublicResource($bundle)]);
    }

    /** POST /v1/admin/bundles */
    public function store(Request $request): JsonResponse
    {
        $validated = $this->validated($request);
        $bundle = DB::transaction(fn () => $this->persist(null, $validated, $request));
        return response()->json(['status' => true, 'data' => new BundlePublicResource($bundle->fresh(['items.product', 'items.variant']))], 201);
    }

    /** PUT /v1/admin/bundles/{id} */
    public function update(int $id, Request $request): JsonResponse
    {
        $validated = $this->validated($request, $id);
        $bundle = Bundle::findOrFail($id);
        $bundle = DB::transaction(fn () => $this->persist($bundle, $validated, $request));
        return response()->json(['status' => true, 'data' => new BundlePublicResource($bundle->fresh(['items.product', 'items.variant']))]);
    }

    /** DELETE /v1/admin/bundles/{id} */
    public function destroy(int $id): JsonResponse
    {
        $bundle = Bundle::findOrFail($id);
        $bundle->delete();
        return response()->json(['status' => true]);
    }

    private function validated(Request $request, ?int $id = null): array
    {
        $slugRule = 'nullable|string|max:255|unique:bundles,slug';
        if ($id) $slugRule .= ",{$id}";

        return $request->validate([
            'name'                 => 'required|string|max:255',
            'slug'                 => $slugRule,
            'description'          => 'nullable|string',
            'image'                => 'nullable|string|max:255',
            'bundle_price'         => 'required|numeric|min:0',
            'currency_code'        => 'nullable|string|max:8',
            'status'               => 'nullable|integer|in:0,1',
            'sort_order'           => 'nullable|integer',
            'starts_at'            => 'nullable|date',
            'ends_at'              => 'nullable|date|after_or_equal:starts_at',
            'items'                => 'required|array|min:2',
            'items.*.product_id'   => 'required|integer|exists:products,id',
            'items.*.variant_id'   => 'nullable|integer|exists:product_variants,id',
            'items.*.quantity'     => 'nullable|integer|min:1',
        ]);
    }

    private function persist(?Bundle $bundle, array $data, Request $request): Bundle
    {
        $slug = $data['slug'] ?? Str::slug($data['name']);

        // Derive original_price from the sum of the items' current variant price
        $original = 0.0;
        foreach ($data['items'] as $it) {
            $variant = !empty($it['variant_id'])
                ? ProductVariant::find($it['variant_id'])
                : ProductVariant::where('product_id', $it['product_id'])->orderBy('id')->first();
            $price = $variant ? (float) ($variant->special_price ?? $variant->price) : 0.0;
            $original += $price * (int) ($it['quantity'] ?? 1);
        }

        $payload = [
            'name'             => $data['name'],
            'slug'             => $slug,
            'description'      => $data['description'] ?? null,
            'image'            => $data['image'] ?? null,
            'original_price'   => $original,
            'bundle_price'     => $data['bundle_price'],
            'currency_code'    => $data['currency_code'] ?? 'TRY',
            'status'           => $data['status'] ?? 1,
            'sort_order'       => $data['sort_order'] ?? 0,
            'starts_at'        => $data['starts_at'] ?? null,
            'ends_at'          => $data['ends_at'] ?? null,
            'created_by'       => auth()->id(),
        ];

        if ($bundle) {
            $bundle->update($payload);
        } else {
            $bundle = Bundle::create($payload);
        }

        // Replace items wholesale — simpler than diff on edit
        $bundle->items()->delete();
        foreach ($data['items'] as $it) {
            BundleItem::create([
                'bundle_id'  => $bundle->id,
                'product_id' => $it['product_id'],
                'variant_id' => $it['variant_id'] ?? null,
                'quantity'   => $it['quantity'] ?? 1,
            ]);
        }

        return $bundle;
    }
}
