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
        $customerId = (int) $customer->id;
        $balance = $this->loyalty->balance($customerId);

        // Bekleyen puan ayri gosterilir: musteri toplami gorup bozduramayinca
        // "puanim kayboldu" diye destek acar. Ne zaman acilacagi da soylenir.
        $pending = $this->loyalty->pendingBalance($customerId);
        $nextAvailable = $this->loyalty->nextAvailableAt($customerId);

        $history = LoyaltyPointTransaction::where('customer_id', $customer->id)
            ->orderByDesc('id')
            ->paginate((int) ($request->per_page ?? 20));

        return response()->json([
            'status' => true,
            'data' => [
                'balance' => $balance,
                'balance_value' => $this->loyalty->pointsToCurrency($balance),
                'pending_balance' => $pending,
                'pending_value' => $this->loyalty->pointsToCurrency($pending),
                'next_available_at' => $nextAvailable?->toIso8601String(),
                'earning_enabled' => $this->loyalty->enabled(),
                'redeem_enabled' => $this->loyalty->redeemEnabled(),
                // Misafir checkout hafif bir hesap aciyor (is_guest=1). Puan
                // biriktirebilir ama hesabini tamamlamasi icin uyarilir.
                'is_guest' => (bool) ($customer->is_guest ?? false),
                'rules' => [
                    'earn_per_currency' => $this->loyalty->earnPerCurrency(),
                    'redeem_points_per_unit' => $this->loyalty->redeemPointsPerUnit(),
                    'redeem_value' => $this->loyalty->redeemValue(),
                    'min_redeem_points' => $this->loyalty->minRedeemPoints(),
                    'voucher_min_order' => $this->loyalty->voucherMinOrder(),
                    'voucher_valid_days' => $this->loyalty->voucherValidDays(),
                    'hold_days' => $this->loyalty->holdDays(),
                ],
                'transactions' => $history->getCollection()->map(fn ($t) => [
                    'id' => $t->id,
                    'points' => $t->points,
                    'type' => $t->type,
                    'description' => $t->description,
                    'expires_at' => $t->expires_at,
                    'available_at' => $t->available_at,
                    'is_pending' => $t->isPending(),
                    'created_at' => $t->created_at,
                ]),
            ],
            'meta' => new PaginationResource($history),
        ]);
    }

    /**
     * HERKESE ACIK kampanya bilgisi.
     *
     * Giris yapmamis ziyaretcinin de banner'i gorebilmesi icin auth
     * gerektirmez. Yalnizca program kurallarini doner, kisisel veri icermez.
     */
    public function campaign(): JsonResponse
    {
        $withImage = (int) (com_option_get('com_loyalty_review_bonus_with_image') ?: 2000);
        $noImage = (int) (com_option_get('com_loyalty_review_bonus_no_image') ?: 1000);

        return response()->json([
            'status' => true,
            'data' => [
                // Kampanya yalnizca puan KAZANIMI acikken duyurulur.
                'active' => $this->loyalty->enabled(),
                'review_bonus_with_image' => $withImage,
                'review_bonus_with_image_value' => $this->loyalty->pointsToCurrency($withImage),
                'review_bonus_no_image' => $noImage,
                'review_bonus_no_image_value' => $this->loyalty->pointsToCurrency($noImage),
                'earn_per_currency' => $this->loyalty->earnPerCurrency(),
                'min_redeem_points' => $this->loyalty->minRedeemPoints(),
                'min_redeem_value' => $this->loyalty->pointsToCurrency($this->loyalty->minRedeemPoints()),
                'voucher_min_order' => $this->loyalty->voucherMinOrder(),
                'voucher_valid_days' => $this->loyalty->voucherValidDays(),
                'max_per_order' => $this->loyalty->reviewMaxPerOrder(),
                'hold_days' => $this->loyalty->holdDays(),
                // Yasal aciklama metni tek yerden gelsin ki arayuzler
                // birbirinden ayrismasin.
                'disclosure' => 'Puan, verdiğiniz yıldız sayısından bağımsız olarak '
                    . 'satın aldığınız ürünler için verilir. Her ürün için bir kez geçerlidir.'
                    . ($this->loyalty->holdDays() > 0
                        ? ' Kazanılan puanlar, iade süresi dolduktan sonra ('
                            . $this->loyalty->holdDays() . ' gün) kullanıma açılır.'
                        : ''),
                // Kosullar sayfasi TASLAK ise link verilmez -- yayinlanmamis
                // sayfa 404 doner ve banner'daki "Kampanya kosullari" baglantisi
                // kirik cikardi. Arayuz null gelince baglantiyi hic basmaz.
                'terms_url' => $this->publishedTermsUrl(),
            ],
        ]);
    }

    /** Kosullar sayfasi yayindaysa adresi, degilse null. */
    private function publishedTermsUrl(): ?string
    {
        // DIKKAT: pages.status degeri 'publish' (sonda 'ed' YOK). 'published'
        // yazmak sessizce hicbir zaman eslesmez ve link hep gizli kalirdi.
        $published = \App\Models\Page::where('slug', 'sadakat-programi')
            ->where('status', 'publish')
            ->exists();

        // Frontend'de jenerik /sayfa/{slug} rotasi YOK; her sayfanin kendi
        // Turkce rotasi var. Karsiligi: app/[locale]/puan-programi
        return $published ? '/puan-programi' : null;
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
