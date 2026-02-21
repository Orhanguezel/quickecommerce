<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\CargoShipment;
use App\Models\Order;
use App\Models\OrderMaster;
use Illuminate\Http\JsonResponse;

class CustomerCargoController extends Controller
{
    /**
     * Müşterinin siparişinin kargo takip bilgisini getir.
     * GET /customer/orders/{orderId}/cargo
     */
    public function show(int $orderId): JsonResponse
    {
        // Müşterinin kendi siparişi mi kontrol et
        $customerId = auth()->id();

        $orderMaster = OrderMaster::where('customer_id', $customerId)->pluck('id');
        $order = Order::where('id', $orderId)
            ->whereIn('order_master_id', $orderMaster)
            ->first();

        if (! $order) {
            return response()->json(['success' => false, 'message' => 'Sipariş bulunamadı.'], 404);
        }

        $cargo = CargoShipment::where('order_id', $order->id)
            ->whereNotIn('status', ['cancelled'])
            ->latest()
            ->first();

        if (! $cargo) {
            return response()->json([
                'success' => true,
                'data'    => null,
                'message' => 'Kargo henüz oluşturulmadı.',
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'carrier_name'    => $cargo->carrier_name,
                'tracking_number' => $cargo->tracking_number,
                'barcode'         => $cargo->barcode,
                'status'          => $cargo->status,
                'label_url'       => null, // Müşteriye label gösterme
                'created_at'      => $cargo->created_at,
            ],
        ]);
    }
}
