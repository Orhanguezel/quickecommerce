<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Store;
use App\Services\Geliver\GeliverSenderAddressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreGeliverSenderAddressController extends Controller
{
    public function __construct(private GeliverSenderAddressService $service) {}

    public function show(int $id): JsonResponse
    {
        $store = Store::with('seller')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $this->service->status($store),
        ]);
    }

    public function store(Request $request, int $id): JsonResponse
    {
        $store = Store::with('seller')->findOrFail($id);
        $validated = $request->validate($this->rules());

        try {
            return response()->json([
                'success' => true,
                'message' => 'Geliver gönderici adresi mağazaya bağlandı.',
                'data' => $this->service->createAndAttach($store, $validated),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    private function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'district' => ['required', 'string', 'max:100'],
            'zip' => ['nullable', 'string', 'max:20'],
        ];
    }
}
