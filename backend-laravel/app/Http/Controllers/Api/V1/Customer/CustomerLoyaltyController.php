<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Models\CouponLine;
use App\Models\LoyaltyPointTransaction;
use App\Services\Loyalty\LoyaltyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerLoyaltyController extends Controller
{
    public function __construct(private LoyaltyService $loyalty) {}

    /**
     * Puan bakiyesi, program kurallari ve hareket gecmisi.
     */
    public function index(Request $request): JsonResponse
    {
        $customer = auth('api_customer')->user();
        $balance = $this->loyalty->balance((int) $customer->id);

        $history = LoyaltyPointTransaction::where('customer_id', $customer->id)
            ->orderByDesc('id')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'status' => true,
            'data' => [
                'balance' => $balance,
                'balance_value' => $this->loyalty->pointsToCurrency($balance),
                'earning_enabled' => $this->loyalty->enabled(),
                'redeem_enabled' => $this->loyalty->redeemEnabled(),
                'rules' => [
                    'earn_per_currency' => $this->loyalty->earnPerCurrency(),
                    'redeem_points_per_unit' => $this->loyalty->redeemPointsPerUnit(),
                    'redeem_value' => $this->loyalty->redeemValue(),
                    'min_redeem_points' => $this->loyalty->minRedeemPoints(),
                    'voucher_min_order' => $this->loyalty->voucherMinOrder(),
                    'voucher_valid_days' => $this->loyalty->voucherValidDays(),
                ],
                'transactions' => $history->getCollection()->map(fn ($t) => [
                    'id' => $t->id,
                    'points' => $t->points,
                    'type' => $t->type,
                    'description' => $t->description,
                    'expires_at' => $t->expires_at,
                    'created_at' => $t->created_at,
                ]),
            ],
            'meta' => new PaginationResource($history),
        ]);
    }

    /**
     * Puani kisiye ozel indirim chekine cevirir.
     */
    public function redeem(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'points' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer = auth('api_customer')->user();

        try {
            $voucher = $this->loyalty->redeem($customer, (int) $request->points);
        } catch (\RuntimeException $e) {
            // Kullaniciya gosterilebilir is kurali hatasi (yetersiz puan, kapali program...)
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'status' => true,
            'message' => __('İndirim çekiniz oluşturuldu.'),
            'data' => $this->voucherPayload($voucher),
        ]);
    }

    /**
     * Musterinin puanla aldigi, henuz kullanilmamis ve suresi gecmemis cekleri.
     */
    public function vouchers(): JsonResponse
    {
        $customer = auth('api_customer')->user();

        $vouchers = CouponLine::where('customer_id', $customer->id)
            ->where('coupon_code', 'like', 'PUAN-%')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $vouchers->map(fn ($v) => $this->voucherPayload($v)),
        ]);
    }

    private function voucherPayload(CouponLine $voucher): array
    {
        return [
            'coupon_code' => $voucher->coupon_code,
            'discount' => (float) $voucher->discount,
            'min_order_value' => (float) $voucher->min_order_value,
            'end_date' => $voucher->end_date,
            'is_used' => (int) $voucher->usage_limit <= 0,
            'is_expired' => $voucher->end_date && $voucher->end_date->isPast(),
        ];
    }
}
