<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Product;
use App\Models\ProductBrand;
use App\Models\Store;
use App\Models\StoreBrandAuthorization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

/**
 * Magaza duzenleme ekranindaki "Yetkili Satici" paneli. Kayit = admin onayi;
 * saticinin kendi beyaniyla rozet acilmaz.
 */
class StoreBrandAuthorizationController extends Controller
{
    public function index(int $id): JsonResponse
    {
        $store = Store::findOrFail($id);

        // Secim listesi: magazanin gercekten sattigi markalar (509 markanin tamami degil).
        $brandIds = Product::query()->where('store_id', $store->id)->whereNotNull('brand_id')
            ->distinct()->pluck('brand_id');

        return response()->json([
            'success' => true,
            'data' => [
                'authorizations' => StoreBrandAuthorization::query()
                    ->with('brand:id,brand_name')
                    ->where('store_id', $store->id)
                    ->latest('id')
                    ->get()
                    ->map(fn (StoreBrandAuthorization $a) => [
                        'id' => $a->id,
                        'brand_id' => $a->brand_id,
                        'brand_name' => $a->brand?->brand_name,
                        'evidence' => $a->evidence,
                        'valid_from' => $a->valid_from?->toDateString(),
                        'valid_to' => $a->valid_to?->toDateString(),
                        'active' => $a->isActive(),
                    ]),
                'brands' => ProductBrand::query()->whereIn('id', $brandIds)->orderBy('brand_name')
                    ->get(['id', 'brand_name']),
            ],
        ]);
    }

    public function store(Request $request, int $id): JsonResponse
    {
        $store = Store::findOrFail($id);
        $validated = $request->validate([
            'brand_id' => ['nullable', 'integer', Rule::exists('product_brands', 'id')],
            'evidence' => ['required', 'string', 'max:500'],
            'valid_from' => ['nullable', 'date'],
            'valid_to' => ['nullable', 'date', 'after_or_equal:valid_from'],
        ]);

        $authorization = StoreBrandAuthorization::updateOrCreate(
            ['store_id' => $store->id, 'brand_id' => $validated['brand_id'] ?? null],
            [
                'evidence' => $validated['evidence'],
                'valid_from' => $validated['valid_from'] ?? null,
                'valid_to' => $validated['valid_to'] ?? null,
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ],
        );
        $this->bustPublicCache();

        return response()->json([
            'success' => true,
            'message' => 'Yetkili satıcı kaydı kaydedildi.',
            'data' => ['id' => $authorization->id],
        ]);
    }

    public function destroy(int $id, int $authorizationId): JsonResponse
    {
        StoreBrandAuthorization::query()->where('store_id', $id)->whereKey($authorizationId)->delete();
        $this->bustPublicCache();

        return response()->json(['success' => true, 'message' => 'Yetkili satıcı kaydı kaldırıldı.']);
    }

    private function bustPublicCache(): void
    {
        Cache::forever('public-catalog:version', (string) hrtime(true));
    }
}
