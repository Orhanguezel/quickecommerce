<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\EInvoice;
use App\Models\Order;
use App\Services\EInvoice\EInvoiceClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EInvoiceDownloadController extends Controller
{
    /**
     * GET /api/v1/customer/orders/{order}/e-invoice/pdf
     */
    public function download(Request $request, int $orderId): RedirectResponse|Response
    {
        $customer = $request->user('customer') ?? $request->user();

        $order = Order::where('id', $orderId)
            ->where('customer_id', $customer?->id)
            ->firstOrFail();

        $einvoice = EInvoice::where('order_id', $order->id)->firstOrFail();

        if (! $einvoice->service_invoice_id) {
            abort(409, 'Fatura henüz hazır değil');
        }

        // Servis ileride herkese açık (imzalı) bir PDF linki verirse doğrudan yönlendir.
        if ($einvoice->pdf_url && str_starts_with($einvoice->pdf_url, 'http')) {
            return redirect()->away($einvoice->pdf_url);
        }

        // Aksi halde servis PDF'i kimlik doğrulamalı; baytları sunucu tarafında
        // çekip müşteriye stream et (tarayıcı X-Api-Key taşıyamaz).
        $pdf = EInvoiceClient::fromConfig()->fetchPdf($einvoice->service_invoice_id);

        return response($pdf['contents'], 200, [
            'Content-Type' => $pdf['contentType'],
            'Content-Disposition' => 'inline; filename="fatura-'.$order->id.'.pdf"',
        ]);
    }
}
