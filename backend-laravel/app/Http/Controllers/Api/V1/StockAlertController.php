<?php

namespace App\Http\Controllers\Api\V1;

use App\Mail\StockAlertMail;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockAlertSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class StockAlertController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'variant_id' => 'required|integer|exists:product_variants,id',
            'email' => 'required|email:rfc|max:255',
            'consent' => 'accepted',
        ]);

        $product = Product::with('store')->find($data['product_id']);
        $variant = ProductVariant::where('product_id', $data['product_id'])->find($data['variant_id']);
        if (!$product || !in_array($product->status, ['approved', 'inactive'], true)
            || !$product->store || (int) $product->store->status !== 1
            || !$variant || ($product->status === 'approved' && (int) $variant->stock_quantity > 0)) {
            return response()->json(['message' => 'Bu ürün için stok bildirimi alınamıyor.'], 422);
        }

        $email = mb_strtolower(trim($data['email']));
        $subscription = StockAlertSubscription::firstOrNew([
            'product_variant_id' => $variant->id,
            'email' => $email,
        ]);
        if ($subscription->confirmed_at && !$subscription->notified_at && $subscription->expires_at?->isFuture()) {
            return response()->json(['message' => 'Bu ürün için bildirim talebiniz zaten kayıtlı.']);
        }
        if ($subscription->exists && !$subscription->confirmed_at
            && $subscription->updated_at?->gt(now()->subMinutes(10))) {
            return response()->json(['message' => 'Doğrulama bağlantısı e-posta adresinize gönderildi.']);
        }

        $token = Str::random(64);
        $subscription->fill([
            'product_id' => $product->id,
            'email' => $email,
            'confirmation_token_hash' => hash('sha256', $token),
            'confirmation_expires_at' => now()->addDay(),
            'confirmed_at' => null,
            'notified_at' => null,
            'expires_at' => now()->addDays(90),
        ]);
        $subscription->save();

        $link = route('stock-alerts.confirm', ['token' => $token]);
        Mail::to($email)->send(new StockAlertMail('confirm', $product->name, $link));

        return response()->json(['message' => 'Doğrulama bağlantısı e-posta adresinize gönderildi.'], 202);
    }

    public function confirm(string $token): RedirectResponse
    {
        $subscription = StockAlertSubscription::with('product')
            ->where('confirmation_token_hash', hash('sha256', $token))->first();
        $result = 'expired';
        if ($subscription && $subscription->confirmation_expires_at?->isFuture()
            && $subscription->expires_at->isFuture() && !$subscription->notified_at) {
            $subscription->forceFill([
                'confirmed_at' => now(), 'confirmation_token_hash' => null,
                'confirmation_expires_at' => null,
            ])->save();
            $result = 'confirmed';
        }
        $base = rtrim(config('app.frontend_url'), '/');
        $path = $subscription?->product?->slug
            ? '/tr/urun/' . rawurlencode($subscription->product->slug)
            : '/tr';
        return redirect()->away($base . $path . '?stock_alert=' . $result);
    }

    public function unsubscribe(Request $request, StockAlertSubscription $subscription): RedirectResponse
    {
        abort_unless($request->hasValidSignature(), 403);
        $subscription->delete();
        return redirect()->away(rtrim(config('app.frontend_url'), '/') . '/tr?stock_alert=unsubscribed');
    }
}
