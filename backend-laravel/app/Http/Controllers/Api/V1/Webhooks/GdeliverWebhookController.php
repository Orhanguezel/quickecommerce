<?php

namespace App\Http\Controllers\Api\V1\Webhooks;

use App\Enums\OrderActivityType;
use App\Enums\WalletOwnerType;
use App\Http\Controllers\Api\V1\Controller;
use App\Mail\DynamicEmail;
use App\Models\CargoShipment;
use App\Models\EmailTemplate;
use App\Models\Order;
use App\Models\OrderActivity;
use App\Models\OrderDeliveryHistory;
use App\Services\Order\OrderManageNotificationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Modules\Wallet\app\Models\Wallet;
use Modules\Wallet\app\Models\WalletTransaction;

class GdeliverWebhookController extends Controller
{
    public function __construct(
        private OrderManageNotificationService $notificationService
    ) {}

    /**
     * Geliver TRACK_UPDATED webhook handler.
     * POST /api/v1/webhooks/geliver
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        Log::channel('geliver_webhook')->info('Geliver webhook received', [
            'headers' => $request->headers->all(),
            'body'    => $request->all(),
            'ip'      => $request->ip(),
        ]);

        if (! $this->verifyWebhook($request)) {
            Log::channel('geliver_webhook')->warning('Webhook verification failed', ['ip' => $request->ip()]);
            return response()->json(['status' => 'unauthorized'], 401);
        }

        $payload = $request->all();
        $event = $payload['event'] ?? null;

        if ($event !== 'TRACK_UPDATED') {
            Log::channel('geliver_webhook')->info('Ignoring event', ['event' => $event]);
            return response()->json(['status' => 'ok']);
        }

        $shipmentData = $payload['data'] ?? [];
        $geliverShipmentId = $shipmentData['id'] ?? null;
        $trackingNumber = $shipmentData['trackingNumber'] ?? null;
        $trackingUrl = $shipmentData['trackingUrl'] ?? null;
        $trackingStatus = $shipmentData['trackingStatus'] ?? [];
        $trackingStatusCode = $trackingStatus['trackingStatusCode'] ?? null;
        $trackingSubStatusCode = $trackingStatus['trackingSubStatusCode'] ?? null;

        if (! $geliverShipmentId) {
            Log::channel('geliver_webhook')->warning('Missing shipment ID in payload');
            return response()->json(['status' => 'error', 'message' => 'Missing shipment ID'], 400);
        }

        // CargoShipment bul
        $cargoShipment = CargoShipment::where('geliver_shipment_id', $geliverShipmentId)->first();
        if (! $cargoShipment && $trackingNumber) {
            $cargoShipment = CargoShipment::where('tracking_number', $trackingNumber)->first();
        }
        if (! $cargoShipment) {
            Log::channel('geliver_webhook')->warning('CargoShipment not found', [
                'geliver_shipment_id' => $geliverShipmentId,
                'tracking_number'     => $trackingNumber,
            ]);
            return response()->json(['status' => 'ok']); // 200 döndür, Geliver retry yapmasın
        }

        $oldStatus = $cargoShipment->status;
        $newStatus = $this->mapGeliverStatus($trackingStatusCode, $trackingSubStatusCode);

        // CargoShipment güncelle
        $updateData = ['status' => $newStatus];
        if ($trackingNumber && ! $cargoShipment->tracking_number) {
            $updateData['tracking_number'] = $trackingNumber;
        }
        $rawResponse = $cargoShipment->raw_response ?? [];
        $rawResponse['latest_webhook'] = [
            'received_at'          => now()->toIso8601String(),
            'tracking_status_code' => $trackingStatusCode,
            'tracking_sub_status'  => $trackingSubStatusCode,
            'tracking_url'         => $trackingUrl,
            'full_payload'         => $payload,
        ];
        $updateData['raw_response'] = $rawResponse;
        $cargoShipment->update($updateData);

        Log::channel('geliver_webhook')->info('CargoShipment updated', [
            'cargo_shipment_id' => $cargoShipment->id,
            'order_id'          => $cargoShipment->order_id,
            'old_status'        => $oldStatus,
            'new_status'        => $newStatus,
            'tracking_code'     => $trackingStatusCode,
        ]);

        // Status değiştiyse yan etkileri tetikle
        if ($oldStatus !== $newStatus) {
            $this->handleStatusChange($cargoShipment, $oldStatus, $newStatus);
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * Webhook doğrulama: Geliver dashboard'da ayarlanan header name/value ile.
     */
    private function verifyWebhook(Request $request): bool
    {
        $expectedHeaderName = trim((string) com_option_get('geliver_webhook_header_name'));
        $expectedHeaderValue = trim((string) com_option_get('geliver_webhook_header_secret'));

        if (! $expectedHeaderName) {
            // Doğrulama ayarlanmamışsa kabul et ama uyar
            Log::channel('geliver_webhook')->warning('No webhook verification configured - accepting request');
            return true;
        }

        // Header varlığını kontrol et
        if (! $request->hasHeader($expectedHeaderName)) {
            Log::channel('geliver_webhook')->warning('Expected header missing', [
                'expected_header' => $expectedHeaderName,
            ]);
            return false;
        }

        // Secret ayarlanmışsa değeri de kontrol et
        if ($expectedHeaderValue !== '') {
            $actualValue = (string) $request->header($expectedHeaderName);
            return hash_equals($expectedHeaderValue, $actualValue);
        }

        // Secret yoksa sadece header varlığı yeterli
        return true;
    }

    /**
     * Geliver trackingStatusCode → CargoShipment status
     */
    private function mapGeliverStatus(?string $statusCode, ?string $subStatusCode): string
    {
        $code = mb_strtolower($statusCode ?? '', 'UTF-8');

        // Delivered
        if (str_contains($code, 'delivered') || $code === 'delivery') {
            return 'delivered';
        }

        // Cancelled / returned
        if (str_contains($code, 'cancel') || str_contains($code, 'return') || str_contains($code, 'exception')) {
            return 'cancelled';
        }

        // In transit
        if (str_contains($code, 'transit') || str_contains($code, 'in_transit')
            || str_contains($code, 'out_for_delivery') || str_contains($code, 'hub')
            || str_contains($code, 'transfer') || str_contains($code, 'on_the_way')) {
            return 'in_transit';
        }

        // Shipped / picked up
        if (str_contains($code, 'picked_up') || str_contains($code, 'pickup')
            || str_contains($code, 'shipped') || str_contains($code, 'accepted')) {
            return 'shipped';
        }

        // Pending
        if (str_contains($code, 'pending') || str_contains($code, 'info')
            || str_contains($code, 'created') || str_contains($code, 'label')) {
            return 'pending';
        }

        Log::channel('geliver_webhook')->info('Unknown tracking status', [
            'code' => $statusCode,
            'sub'  => $subStatusCode,
        ]);
        return 'in_transit';
    }

    /**
     * Status değişikliğine göre sipariş güncelle ve bildirim gönder.
     */
    private function handleStatusChange(CargoShipment $cargoShipment, string $oldStatus, string $newStatus): void
    {
        $order = Order::with(['orderMaster.customer', 'store', 'deliveryman', 'orderAddress'])
            ->find($cargoShipment->order_id);

        if (! $order) {
            Log::channel('geliver_webhook')->error('Order not found', [
                'order_id' => $cargoShipment->order_id,
            ]);
            return;
        }

        // Delivered → tam teslimat akışı
        if ($newStatus === 'delivered' && $order->status !== 'delivered') {
            $this->handleDelivered($order, $cargoShipment);
            return;
        }

        // In transit → sipariş durumunu shipped yap
        if ($newStatus === 'in_transit' && ! in_array($order->status, ['shipped', 'delivered'])) {
            Order::withoutEvents(fn () => $order->update(['status' => 'shipped']));

            OrderActivity::create([
                'order_id'       => $order->id,
                'store_id'       => $order->store_id,
                'activity_from'  => 'system',
                'activity_type'  => 'order_status',
                'activity_value' => 'shipped',
                'reference'      => 'geliver_webhook',
            ]);

            try {
                $this->notificationService->createOrderNotification($order->id, 'admin_order_status_cpps');
            } catch (\Exception $e) {
                Log::channel('geliver_webhook')->error('Notification failed', ['error' => $e->getMessage()]);
            }
        }

        // Cancelled → sadece log + bildirim (siparişi otomatik iptal etme)
        if ($newStatus === 'cancelled') {
            Log::channel('geliver_webhook')->warning('Cargo cancelled by carrier', [
                'order_id' => $order->id,
            ]);
            try {
                $this->notificationService->createOrderNotification($order->id, 'admin_order_status_cpps');
            } catch (\Exception $e) {
                Log::channel('geliver_webhook')->error('Notification failed', ['error' => $e->getMessage()]);
            }
        }
    }

    /**
     * Teslim edildi akışı: wallet güncellemesi + sipariş durumu + email.
     * AdminOrderManageController::changeOrderStatus (delivered) mantığı ile aynı.
     */
    private function handleDelivered(Order $order, CargoShipment $cargoShipment): void
    {
        DB::transaction(function () use ($order) {
            $deliveryHistory = OrderDeliveryHistory::where('order_id', $order->id)
                ->where('status', 'accepted')
                ->whereNotIn('order_id', function ($query) {
                    $query->select('order_id')
                        ->from('order_delivery_histories')
                        ->where('status', 'cancelled');
                })->first();

            // Store wallet
            $storeWallet = Wallet::where('owner_id', $order->store_id)
                ->where('owner_type', WalletOwnerType::STORE->value)
                ->first();

            if ($storeWallet) {
                $storeWallet->increment('balance', $order->order_amount_store_value);
                $storeWallet->increment('earnings', $order->order_amount_store_value);
                WalletTransaction::create([
                    'wallet_id' => $storeWallet->id,
                    'amount'    => $order->order_amount_store_value,
                    'type'      => 'credit',
                    'purpose'   => 'Order Earnings',
                    'status'    => 1,
                ]);
            }

            // Deliveryman wallet
            if ($deliveryHistory) {
                $deliverymanWallet = Wallet::where('owner_id', $deliveryHistory->deliveryman_id)
                    ->where('owner_type', WalletOwnerType::DELIVERYMAN->value)
                    ->first();

                if ($deliverymanWallet) {
                    $deliverymanWallet->increment('balance', $order->delivery_charge_admin);
                    $deliverymanWallet->increment('earnings', $order->delivery_charge_admin);
                    WalletTransaction::create([
                        'wallet_id' => $deliverymanWallet->id,
                        'amount'    => $order->delivery_charge_admin,
                        'type'      => 'credit',
                        'purpose'   => 'Delivery Earnings',
                        'status'    => 1,
                    ]);
                }
            }

            // Delivery history kaydı
            OrderDeliveryHistory::create([
                'order_id'       => $order->id,
                'deliveryman_id' => $deliveryHistory?->deliveryman_id ?? 0,
                'status'         => 'delivered',
            ]);

            // Cash on delivery ise ödeme durumunu güncelle
            if ($order->orderMaster?->payment_gateway === 'cash_on_delivery') {
                $order->orderMaster->update(['payment_status' => 'paid']);

                OrderActivity::create([
                    'order_id'       => $order->id,
                    'activity_from'  => 'system',
                    'activity_type'  => OrderActivityType::CASH_COLLECTION->value,
                    'ref_id'         => $deliveryHistory?->deliveryman_id ?? 0,
                    'activity_value' => $order->order_amount,
                ]);
            }

            // Sipariş durumunu güncelle (OrderObserver bypass — auth user yok)
            Order::withoutEvents(function () use ($order) {
                $order->delivery_completed_at = Carbon::now();
                $order->status = 'delivered';
                $order->save();
            });

            OrderActivity::create([
                'order_id'       => $order->id,
                'store_id'       => $order->store_id,
                'activity_from'  => 'system',
                'activity_type'  => 'order_status',
                'activity_value' => 'delivered',
                'reference'      => 'geliver_webhook',
            ]);
        });

        // Bildirimler (transaction dışında)
        try {
            $this->notificationService->createOrderNotification($order->id, 'admin_order_status_delivery');
        } catch (\Exception $e) {
            Log::channel('geliver_webhook')->error('Delivery notification failed', ['error' => $e->getMessage()]);
        }

        // Email gönder
        try {
            $this->sendDeliveryEmails($order);
        } catch (\Exception $e) {
            Log::channel('geliver_webhook')->error('Delivery email failed', ['error' => $e->getMessage()]);
        }

        Log::channel('geliver_webhook')->info('Order delivered via webhook', [
            'order_id'          => $order->id,
            'cargo_shipment_id' => $cargoShipment->id,
        ]);
    }

    /**
     * Teslimat email'leri — AdminOrderManageController::sendOrderDeliveredNotifications ile aynı mantık.
     */
    private function sendDeliveryEmails(Order $order): void
    {
        $emailTemplates = EmailTemplate::whereIn('type', [
            'order-status-delivered',
            'order-status-delivered-store',
            'order-status-delivered-admin',
        ])->where('status', 1)->get()->keyBy('type');

        $orderAmount = amount_with_symbol_format($order->order_amount);

        // Customer
        $customerTemplate = $emailTemplates['order-status-delivered'] ?? null;
        if ($customerTemplate) {
            $customerMessage = str_replace(
                ['@customer_name', '@order_id', '@order_amount'],
                [$order->orderMaster?->customer?->full_name, $order->id, $orderAmount],
                $customerTemplate->body ?? ''
            );
            $customerEmail = $order->orderAddress?->email ?? $order->orderMaster?->customer?->email;
            if ($customerEmail) {
                Mail::to($customerEmail)->send(new DynamicEmail($customerTemplate->subject ?? 'Order Delivered', $customerMessage));
            }
        }

        // Store
        $storeTemplate = $emailTemplates['order-status-delivered-store'] ?? null;
        if ($storeTemplate && $order->store?->email) {
            $storeMessage = str_replace(
                ['@store_name', '@order_id', '@order_amount_for_store'],
                [$order->store->name, $order->id, amount_with_symbol_format($order->order_amount_store_value)],
                $storeTemplate->body ?? ''
            );
            Mail::to($order->store->email)->send(new DynamicEmail($storeTemplate->subject ?? 'Order Delivered', $storeMessage));
        }

        // Admin
        $adminTemplate = $emailTemplates['order-status-delivered-admin'] ?? null;
        $adminEmail = com_option_get('com_site_email');
        if ($adminTemplate && $adminEmail) {
            $adminMessage = str_replace(
                ['@order_id', '@order_amount_admin_commission', '@delivery_charge_commission_amount'],
                [$order->id, amount_with_symbol_format($order->order_amount_admin_commission), amount_with_symbol_format($order->delivery_charge_admin_commission)],
                $adminTemplate->body ?? ''
            );
            Mail::to($adminEmail)->send(new DynamicEmail($adminTemplate->subject ?? 'Order Delivered', $adminMessage));
        }
    }
}
