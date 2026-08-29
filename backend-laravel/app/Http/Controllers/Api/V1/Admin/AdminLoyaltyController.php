<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Models\Customer;
use App\Models\LoyaltyPointTransaction;
use App\Services\Loyalty\LoyaltyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminLoyaltyController extends Controller
{
    public function __construct(private LoyaltyService $loyalty) {}

    /**
     * Puani olan musterilerin listesi (bakiyeye gore).
     */
    public function customers(Request $request): JsonResponse
    {
        $query = DB::table('loyalty_point_transactions as lpt')
            ->join('customers as c', 'c.id', '=', 'lpt.customer_id')
            ->groupBy('c.id', 'c.first_name', 'c.last_name', 'c.email')
            ->select([
                'c.id',
                'c.first_name',
                'c.last_name',
                'c.email',
                // Kullanilabilir bakiye ile bekleyen puan AYRI toplanir:
                // bekleyen puan henuz musterinin degil, iade gelirse geri
                // alinacak. Ikisini toplamak yoneticiye yanlis rakam gosterir.
                DB::raw('SUM(CASE WHEN lpt.available_at IS NULL OR lpt.available_at <= NOW() THEN lpt.points ELSE 0 END) as balance'),
                DB::raw('SUM(CASE WHEN lpt.available_at IS NOT NULL AND lpt.available_at > NOW() THEN lpt.points ELSE 0 END) as pending'),
                DB::raw('MAX(lpt.created_at) as last_activity'),
            ]);

        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('c.first_name', 'like', "%{$search}%")
                    ->orWhere('c.last_name', 'like', "%{$search}%")
                    ->orWhere('c.email', 'like', "%{$search}%");
            });
        }

        $rows = $query->orderByDesc('balance')->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'success' => true,
            'data' => collect($rows->items())->map(fn ($r) => [
                'customer_id' => (int) $r->id,
                'name' => trim($r->first_name . ' ' . $r->last_name),
                'email' => $r->email,
                'balance' => (int) $r->balance,
                'balance_value' => $this->loyalty->pointsToCurrency((int) $r->balance),
                'pending' => (int) $r->pending,
                'last_activity' => $r->last_activity,
            ]),
            'meta' => new PaginationResource($rows),
        ]);
    }

    /**
     * Tek musterinin puan gecmisi.
     */
    public function history(Request $request, int $customerId): JsonResponse
    {
        $customer = Customer::find($customerId);

        if (! $customer) {
            return response()->json(['success' => false, 'message' => __('messages.data_not_found')], 404);
        }

        $transactions = LoyaltyPointTransaction::where('customer_id', $customerId)
            ->orderByDesc('id')
            ->paginate((int) ($request->per_page ?? 30));

        return response()->json([
            'success' => true,
            'data' => [
                'customer' => [
                    'id' => $customer->id,
                    'name' => trim($customer->first_name . ' ' . $customer->last_name),
                    'email' => $customer->email,
                ],
                'balance' => $this->loyalty->balance($customerId),
                'balance_value' => $this->loyalty->pointsToCurrency($this->loyalty->balance($customerId)),
                'pending' => $this->loyalty->pendingBalance($customerId),
                'next_available_at' => $this->loyalty->nextAvailableAt($customerId)?->toIso8601String(),
                'transactions' => collect($transactions->items())->map(fn ($t) => [
                    'id' => $t->id,
                    'points' => $t->points,
                    'type' => $t->type,
                    'description' => $t->description,
                    'reference_type' => $t->reference_type ? class_basename($t->reference_type) : null,
                    'reference_id' => $t->reference_id,
                    'expires_at' => $t->expires_at,
                    'available_at' => $t->available_at,
                    'is_pending' => $t->isPending(),
                    'created_at' => $t->created_at,
                ]),
            ],
            'meta' => new PaginationResource($transactions),
        ]);
    }

    /**
     * Elle puan ekleme/silme. Negatif deger dusurur.
     */
    public function adjust(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|integer|exists:customers,id',
            'points' => 'required|integer|not_in:0',
            'note' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $transaction = $this->loyalty->adjustManually(
                (int) $request->customer_id,
                (int) $request->points,
                $request->note
            );
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'message' => __('messages.update_success', ['name' => 'Loyalty points']),
            'data' => [
                'transaction_id' => $transaction->id,
                'balance' => $this->loyalty->balance((int) $request->customer_id),
            ],
        ]);
    }

    /**
     * Program ozeti: dagitilan/harcanan puan, acik yukumluluk, uretilen cekler.
     */
    public function summary(): JsonResponse
    {
        $earned = (int) LoyaltyPointTransaction::where('points', '>', 0)->sum('points');
        $spent = (int) abs(LoyaltyPointTransaction::where('points', '<', 0)->sum('points'));
        $outstanding = $earned - $spent;

        // Acik yukumlulugun ne kadari hala BEKLEMEDE, yani iade halinde geri
        // alinabilir durumda.
        $pending = (int) LoyaltyPointTransaction::pending()->sum('points');

        $vouchers = DB::table('coupon_lines')->where('coupon_code', 'like', 'PUAN-%');

        return response()->json([
            'success' => true,
            'data' => [
                'earning_enabled' => $this->loyalty->enabled(),
                'redeem_enabled' => $this->loyalty->redeemEnabled(),
                'points_earned' => $earned,
                'points_spent' => $spent,
                'points_outstanding' => $outstanding,
                // Acik yukumluluk: bugun herkes bozdursa ne kadar indirim verilir.
                'outstanding_liability' => $this->loyalty->pointsToCurrency($outstanding),
                'points_pending' => $pending,
                'pending_liability' => $this->loyalty->pointsToCurrency($pending),
                'hold_days' => $this->loyalty->holdDays(),
                'vouchers_created' => (clone $vouchers)->count(),
                'vouchers_used' => (clone $vouchers)->where('usage_limit', '<=', 0)->count(),
                'customers_with_points' => LoyaltyPointTransaction::distinct('customer_id')->count('customer_id'),
            ],
        ]);
    }
}
