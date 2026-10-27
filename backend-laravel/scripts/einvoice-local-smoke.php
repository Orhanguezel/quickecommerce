<?php

/**
 * Lokal e-fatura entegrasyon smoke (CLI).
 * Kullanım: php scripts/einvoice-local-smoke.php
 */

use App\Jobs\CreateEInvoiceJob;
use App\Jobs\PollEInvoiceStatusJob;
use App\Models\EInvoice;
use App\Models\Order;

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

if (! config('services.einvoice.enabled')) {
    fwrite(STDERR, "EINVOICE_ENABLED=false — .env kontrol et\n");
    exit(1);
}

$order = Order::query()
    ->where('payment_status', 'paid')
    ->whereHas('orderDetail')
    ->with(['orderDetail', 'orderMaster.orderAddress', 'orderMaster.customer'])
    ->latest('id')
    ->first();

if (! $order) {
    fwrite(STDERR, "paid sipariş bulunamadı — önce test siparişi oluştur\n");
    exit(1);
}

$einvoice = EInvoice::firstOrCreate(
    ['order_id' => $order->id],
    ['status' => 'pending', 'type' => 'earsiv']
);

if ($einvoice->service_invoice_id) {
    echo "Mevcut servis faturası #{$einvoice->service_invoice_id} — poll...\n";
} else {
    echo "Sipariş #{$order->id} — CreateEInvoiceJob senkron çalıştırılıyor...\n";
    CreateEInvoiceJob::dispatchSync($order->id);
    $einvoice->refresh();
}

$einvoice = EInvoice::where('order_id', $order->id)->first();

if (! $einvoice) {
    fwrite(STDERR, "e_invoices kaydı oluşmadı\n");
    exit(1);
}

echo json_encode($einvoice->only([
    'order_id',
    'service_invoice_id',
    'status',
    'ettn',
    'invoice_number',
    'pdf_url',
    'error_message',
]), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)."\n";

if ($einvoice->service_invoice_id && ! $einvoice->isTerminal()) {
    echo "Poll bekleniyor...\n";
    for ($i = 0; $i < 15; $i++) {
        PollEInvoiceStatusJob::dispatchSync($order->id);
        $einvoice->refresh();
        if ($einvoice->isTerminal()) {
            break;
        }
        sleep(1);
    }
    echo json_encode($einvoice->fresh()->only([
        'status', 'ettn', 'invoice_number', 'pdf_url',
    ]), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)."\n";
}

exit($einvoice->status === 'approved' || $einvoice->status === 'sent' ? 0 : 1);
