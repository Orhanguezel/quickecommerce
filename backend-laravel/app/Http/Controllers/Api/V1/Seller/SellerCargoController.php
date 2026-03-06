<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\CargoShipment;
use App\Models\Order;
use App\Models\Store;
use App\Services\GdeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerCargoController extends Controller
{
    public function __construct(private GdeliveryService $gdelivery) {}

    /**
     * Satıcının mağaza ID'lerini döndür.
     */
    private function getSellerStoreIds(): \Illuminate\Support\Collection
    {
        return Store::where('store_seller_id', auth()->id())->pluck('id');
    }

    /**
     * Satıcının siparişini bul (mağaza kontrolü ile).
     */
    private function findSellerOrder(int $orderId): Order
    {
        return Order::where('id', $orderId)
            ->whereIn('store_id', $this->getSellerStoreIds())
            ->firstOrFail();
    }

    /**
     * Sipariş için kargo oluştur (sadece kendi siparişi).
     * POST /seller/orders/{orderId}/cargo
     */
    public function createShipment(Request $request, int $orderId): JsonResponse
    {
        $order = $this->findSellerOrder($orderId);

        $validated = $request->validate([
            'offer_id' => 'nullable|string',
        ]);

        try {
            $cargo = $this->gdelivery->createShipment(
                order: $order,
                offerId: $validated['offer_id'] ?? null,
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
        $order = $this->findSellerOrder($orderId);

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
        $order = $this->findSellerOrder($orderId);

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

    /**
     * Sipariş için Geliver tekliflerini getir (sadece kendi siparişi).
     * GET /seller/orders/{orderId}/cargo/offers
     */
    public function offers(int $orderId): JsonResponse
    {
        $order = $this->findSellerOrder($orderId);

        try {
            $offers = $this->gdelivery->getShipmentOffers($order);
            return response()->json([
                'success' => true,
                'data' => $offers,
            ]);
        } catch (\Exception $e) {
            \Log::error('Geliver offers fetch failed (seller)', [
                'order_id' => $orderId,
                'error'    => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
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
