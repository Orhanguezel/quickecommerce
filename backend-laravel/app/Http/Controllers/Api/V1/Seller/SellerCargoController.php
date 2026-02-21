<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\CargoShipment;
use App\Models\Order;
use App\Services\GdeliveryService;
use Illuminate\Http\JsonResponse;

class SellerCargoController extends Controller
{
    public function __construct(private GdeliveryService $gdelivery) {}

    /**
     * Sipariş için kargo oluştur (sadece kendi siparişi).
     * POST /seller/orders/{orderId}/cargo
     */
    public function createShipment(int $orderId): JsonResponse
    {
        $storeId = auth()->user()->store?->id;

        $order = Order::where('id', $orderId)
            ->where('store_id', $storeId)
            ->firstOrFail();

        try {
            $cargo = $this->gdelivery->createShipment(
                order: $order,
                createdByType: 'seller',
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
     * Siparişin kargo bilgisini getir (sadece kendi siparişi).
     * GET /seller/orders/{orderId}/cargo
     */
    public function show(int $orderId): JsonResponse
    {
        $storeId = auth()->user()->store?->id;

        $order = Order::where('id', $orderId)
            ->where('store_id', $storeId)
            ->firstOrFail();

        $cargo = CargoShipment::where('order_id', $order->id)
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
     * DELETE /seller/orders/{orderId}/cargo
     */
    public function cancel(int $orderId): JsonResponse
    {
        $storeId = auth()->user()->store?->id;

        $order = Order::where('id', $orderId)
            ->where('store_id', $storeId)
            ->firstOrFail();

        $cargo = CargoShipment::where('order_id', $order->id)
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

    private function formatCargo(CargoShipment $cargo): array
    {
        return [
            'id'              => $cargo->id,
            'order_id'        => $cargo->order_id,
            'carrier_name'    => $cargo->carrier_name,
            'barcode'         => $cargo->barcode,
            'tracking_number' => $cargo->tracking_number,
            'label_url'       => $cargo->label_url,
            'status'          => $cargo->status,
            'created_at'      => $cargo->created_at,
        ];
    }
}
