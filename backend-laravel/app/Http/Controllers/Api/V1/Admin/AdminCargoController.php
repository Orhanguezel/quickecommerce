<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\CargoShipment;
use App\Models\Order;
use App\Services\GdeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCargoController extends Controller
{
    public function __construct(private GdeliveryService $gdelivery) {}

    /**
     * Sipariş için kargo oluştur.
     * POST /admin/orders/{orderId}/cargo
     */
    public function createShipment(int $orderId): JsonResponse
    {
        $order = Order::findOrFail($orderId);

        try {
            $cargo = $this->gdelivery->createShipment(
                order: $order,
                createdByType: 'admin',
                createdById: auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Kargo başarıyla oluşturuldu.',
                'data'    => $this->formatCargo($cargo),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Siparişin kargo bilgisini getir.
     * GET /admin/orders/{orderId}/cargo
     */
    public function show(int $orderId): JsonResponse
    {
        $cargo = CargoShipment::where('order_id', $orderId)
            ->whereNotIn('status', ['cancelled'])
            ->latest()
            ->first();

        if (! $cargo) {
            return response()->json(['success' => false, 'message' => 'Kargo kaydı bulunamadı.'], 404);
        }

        return response()->json(['success' => true, 'data' => $this->formatCargo($cargo)]);
    }

    /**
     * Kargo iptal et.
     * DELETE /admin/orders/{orderId}/cargo
     */
    public function cancel(int $orderId): JsonResponse
    {
        $cargo = CargoShipment::where('order_id', $orderId)
            ->whereNotIn('status', ['cancelled'])
            ->latest()
            ->firstOrFail();

        try {
            $this->gdelivery->cancelShipment($cargo);
            return response()->json(['success' => true, 'message' => 'Kargo iptal edildi.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    /**
     * Geliver'da gönderici adresi oluştur (mağaza için).
     * POST /admin/cargo/sender-address
     */
    public function createSenderAddress(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email',
            'phone'    => 'required|string',
            'address'  => 'required|string',
            'city_code' => 'required|string',
            'district' => 'nullable|string',
            'zip'      => 'nullable|string',
        ]);

        try {
            $address = $this->gdelivery->createSenderAddress($validated);
            return response()->json([
                'success' => true,
                'message' => 'Gönderici adresi oluşturuldu.',
                'data'    => $address,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    /**
     * Şehir listesi.
     * GET /admin/cargo/cities
     */
    public function cities(): JsonResponse
    {
        try {
            $cities = $this->gdelivery->listCities();
            return response()->json(['success' => true, 'data' => $cities]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    /**
     * Tüm kargo listesi.
     * GET /admin/cargo
     */
    public function index(Request $request): JsonResponse
    {
        $cargos = CargoShipment::with('order')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $cargos]);
    }

    private function formatCargo(CargoShipment $cargo): array
    {
        return [
            'id'               => $cargo->id,
            'order_id'         => $cargo->order_id,
            'carrier_name'     => $cargo->carrier_name,
            'barcode'          => $cargo->barcode,
            'tracking_number'  => $cargo->tracking_number,
            'label_url'        => $cargo->label_url,
            'status'           => $cargo->status,
            'created_by_type'  => $cargo->created_by_type,
            'created_at'       => $cargo->created_at,
        ];
    }
}
