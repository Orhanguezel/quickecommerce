<?php

namespace App\Services\Loyalty;

use App\Models\Coupon;
use App\Models\CouponLine;
use App\Models\Customer;
use App\Models\LoyaltyPointTransaction;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Sadakat puani sistemi.
 *
 * Kazanma : teslim edilen sipariste 1 TL = 1 puan (ODENEN degil, TESLIM EDILEN
 *           -- iptal/iade hayalet puan birakmasin), onaylanan yoruma bonus.
 * Harcama : puan -> kisiye ozel indirim cheki (coupon_lines).
 *
 * Neden kupon, cuzdan degil: kupon motoru canlida calisiyor ve musteri kisiti,
 * minimum sepet, son kullanma ve tek kullanimlik sayaci zaten var. Cuzdan
 * tarafinda ise hic musteri cuzdani yok ve PlaceOrderController::updateWallet()
 * basarisizlikta JsonResponse donduruyor -- cagiran `if ($success)` yaptigi ve
 * JsonResponse her zaman truthy oldugu icin bakiye yetmese bile siparis
 * "odendi" isaretleniyor.
 */
class LoyaltyService
{
    private const PARENT_COUPON_TITLE = 'Sadakat Puanı Çeki';

    /** Yeni puan KAZANIMI acik mi. */
    public function enabled(): bool
    {
        return com_option_get('com_loyalty_enabled') === 'on';
    }

    /**
     * Bozdurma acik mi.
     *
     * Kazanimdan AYRI bir anahtar: program kapatilirken once kazanim durur,
     * birikmis puanlar duyurulan tarihe kadar bozdurulabilir kalir. Anahtari
     * kapatip puanlari ayni anda iptal etmek musteriye verilmis sozu bozar.
     */
    public function redeemEnabled(): bool
    {
        return com_option_get('com_loyalty_redeem_enabled') !== 'off';
    }

    public function balance(int $customerId): int
    {
        return (int) LoyaltyPointTransaction::where('customer_id', $customerId)->sum('points');
    }

    // ----------------------------------------------------------------- ayarlar

    public function earnPerCurrency(): float
    {
        return (float) (com_option_get('com_loyalty_earn_per_currency') ?: 1);
    }

    public function redeemPointsPerUnit(): int
    {
        return max(1, (int) (com_option_get('com_loyalty_redeem_points_per_unit') ?: 1000));
    }

    public function redeemValue(): float
    {
        return (float) (com_option_get('com_loyalty_redeem_value') ?: 10);
    }

    public function minRedeemPoints(): int
    {
        return max(1, (int) (com_option_get('com_loyalty_min_redeem_points') ?: 2500));
    }

    public function voucherMinOrder(): float
    {
        return (float) (com_option_get('com_loyalty_voucher_min_order') ?: 500);
    }

    public function voucherValidDays(): int
    {
        return max(1, (int) (com_option_get('com_loyalty_voucher_valid_days') ?: 90));
    }

    public function pointsExpireDays(): int
    {
        return max(1, (int) (com_option_get('com_loyalty_points_expire_days') ?: 365));
    }

    /** Verilen puanin TL karsiligi. */
    public function pointsToCurrency(int $points): float
    {
        return round($points / $this->redeemPointsPerUnit() * $this->redeemValue(), 2);
    }

    // ---------------------------------------------------------------- kazanma

    /**
     * Teslim edilen siparis icin puan yazar.
     *
     * ODEME degil TESLIMAT tetikler: canlida odenmis siparislerin bir kismi hic
     * teslim edilmiyor, odeme uzerinden puan verilirse iptal edilenler hayalet
     * puan birakir.
     */
    public function awardForDeliveredOrder(Order $order): ?LoyaltyPointTransaction
    {
        if (! $this->enabled()) {
            return null;
        }

        $customerId = $order->orderMaster?->customer_id;
        if (! $customerId) {
            return null;
        }

        $points = (int) floor(((float) $order->order_amount) * $this->earnPerCurrency());
        if ($points <= 0) {
            return null;
        }

        return $this->record(
            $customerId,
            $points,
            LoyaltyPointTransaction::TYPE_ORDER,
            Order::class,
            $order->id,
            "Sipariş #{$order->id} teslim edildi",
            now()->addDays($this->pointsExpireDays())
        );
    }

    /**
     * Onaylanan yorum icin bonus yazar. Gorselli yorum daha yuksek.
     *
     * Puan YILDIZ SAYISINDAN BAGIMSIZ verilir. Olumlu yoruma sart kosmak hem
     * Ticari Reklam Yonetmeligi acisindan riskli hem de yorumlarin
     * guvenilirligini bitirir.
     */
    public function awardForApprovedReview(Review $review): ?LoyaltyPointTransaction
    {
        if (! $this->enabled()) {
            return null;
        }

        if (! $review->customer_id) {
            return null;
        }

        $hasImage = filled($review->images);
        $points = $hasImage
            ? (int) (com_option_get('com_loyalty_review_bonus_with_image') ?: 250)
            : (int) (com_option_get('com_loyalty_review_bonus_no_image') ?: 100);

        if ($points <= 0) {
            return null;
        }

        return $this->record(
            (int) $review->customer_id,
            $points,
            LoyaltyPointTransaction::TYPE_REVIEW,
            Review::class,
            $review->id,
            $hasImage ? 'Görselli değerlendirme bonusu' : 'Değerlendirme bonusu',
            now()->addDays($this->pointsExpireDays())
        );
    }

    /**
     * Siparis iptal/iade edildiginde o siparisin puanini geri alir.
     *
     * Kazanim anahtari kapali olsa bile calisir: verilmis puani geri almak
     * programin acik olmasina bagli olmamali.
     */
    public function revokeForOrder(Order $order): ?LoyaltyPointTransaction
    {
        $awarded = LoyaltyPointTransaction::where('type', LoyaltyPointTransaction::TYPE_ORDER)
            ->where('reference_type', Order::class)
            ->where('reference_id', $order->id)
            ->first();

        if (! $awarded) {
            return null;
        }

        return $this->record(
            (int) $awarded->customer_id,
            -abs($awarded->points),
            LoyaltyPointTransaction::TYPE_REVOKE,
            Order::class,
            $order->id,
            "Sipariş #{$order->id} iptal/iade edildi",
            null
        );
    }

    // --------------------------------------------------------------- harcama

    /**
     * Puani kisiye ozel indirim chekine cevirir.
     *
     * @throws \RuntimeException kullaniciya gosterilebilir hata mesajlariyla
     */
    public function redeem(Customer $customer, int $points): CouponLine
    {
        if (! $this->redeemEnabled()) {
            throw new \RuntimeException(__('Puan kullanımı şu anda kapalı.'));
        }

        if ($points < $this->minRedeemPoints()) {
            throw new \RuntimeException(__('En az :points puan bozdurabilirsiniz.', [
                'points' => $this->minRedeemPoints(),
            ]));
        }

        // Tam birim katina YUVARLANMAZ. Onaylanan semada minimum cek 25 TL,
        // yani 2.500 puan = 2,5 birim; birim katina yuvarlamak minimumu
        // bozdurani 2.000 puana (20 TL) dusurur ve arta kalan 500 puan
        // sessizce bakiyede kalirdi. Deger zaten kurusa yuvarlaniyor.

        // Es zamanli iki bozdurma istegi ayni puani iki kez harcamasin.
        $lock = Cache::lock("loyalty-redeem:{$customer->id}", 15);

        if (! $lock->get()) {
            throw new \RuntimeException(__('Puan işleminiz sürüyor, lütfen birkaç saniye sonra tekrar deneyin.'));
        }

        try {
            return DB::transaction(function () use ($customer, $points) {
                // Bakiye kilit altinda tekrar okunur: kilit alinmadan once
                // baska bir istek harcamis olabilir.
                $balance = (int) LoyaltyPointTransaction::where('customer_id', $customer->id)
                    ->lockForUpdate()
                    ->sum('points');

                if ($balance < $points) {
                    throw new \RuntimeException(__('Yetersiz puan. Bakiyeniz: :balance', ['balance' => $balance]));
                }

                $amount = $this->pointsToCurrency($points);
                $couponLine = $this->createVoucher($customer, $amount);

                $this->record(
                    (int) $customer->id,
                    -$points,
                    LoyaltyPointTransaction::TYPE_REDEEM,
                    CouponLine::class,
                    $couponLine->id,
                    "{$points} puan → {$amount} TL indirim çeki ({$couponLine->coupon_code})",
                    null
                );

                return $couponLine;
            });
        } finally {
            $lock->release();
        }
    }

    /**
     * Kisiye ozel, tek kullanimlik indirim cheki uretir.
     *
     * IKI ZORUNLU ALAN:
     * - max_discount: Helpers::checkCoupon() `$discount_amount > $coupon->max_discount`
     *   karsilastirmasi yapiyor. NULL karsilastirmada 0'a doner, kosul her zaman
     *   dogru olur ve indirim 0 TL'ye kirpilir -> cek ise yaramaz.
     * - coupon_id: ayni fonksiyon `$coupon->coupon->status` diyor; ust kupon
     *   kaydi olmadan null erisimi olur.
     */
    private function createVoucher(Customer $customer, float $amount): CouponLine
    {
        $parent = Coupon::firstOrCreate(
            ['title' => self::PARENT_COUPON_TITLE],
            [
                'description' => 'Sadakat puanlarının bozdurulmasıyla otomatik üretilen kişiye özel çekler.',
                'status' => 1,
            ]
        );

        return CouponLine::create([
            'coupon_id' => $parent->id,
            'customer_id' => $customer->id,
            'coupon_code' => 'PUAN-' . generateRandomCouponCode(),
            'discount_type' => 'amount',
            'discount' => $amount,
            'max_discount' => $amount,
            'min_order_value' => $this->voucherMinOrder(),
            'usage_limit' => 1,
            'usage_count' => 0,
            'start_date' => now(),
            'end_date' => now()->addDays($this->voucherValidDays()),
            'status' => 1,
        ]);
    }

    /**
     * Admin tarafindan elle puan ekleme/silme.
     *
     * Bakiyeyi eksiye dusurmez. reference bos birakilir; benzersiz indekste
     * NULL'lar cakismadigi icin ayni musteriye birden fazla manuel kayit
     * yazilabilir.
     *
     * @throws \RuntimeException
     */
    public function adjustManually(int $customerId, int $points, ?string $note = null): LoyaltyPointTransaction
    {
        if ($points === 0) {
            throw new \RuntimeException(__('Puan sıfır olamaz.'));
        }

        if ($points < 0 && $this->balance($customerId) + $points < 0) {
            throw new \RuntimeException(__('Bakiye eksiye düşemez. Mevcut bakiye: :balance', [
                'balance' => $this->balance($customerId),
            ]));
        }

        $transaction = LoyaltyPointTransaction::create([
            'customer_id' => $customerId,
            'points' => $points,
            'type' => LoyaltyPointTransaction::TYPE_MANUAL,
            'description' => $note ?: ($points > 0 ? 'Yönetici tarafından eklendi' : 'Yönetici tarafından düşüldü'),
            'expires_at' => $points > 0 ? now()->addDays($this->pointsExpireDays()) : null,
        ]);

        Log::info('[loyalty] manuel puan islemi', [
            'customer_id' => $customerId,
            'points' => $points,
            'admin_id' => auth('api')->id(),
            'note' => $note,
        ]);

        return $transaction;
    }

    // ---------------------------------------------------------------- yardimci

    /**
     * Defter kaydi yazar. Ayni kaynak icin ikinci kayit denemesi benzersiz
     * indekse takilir ve sessizce yok sayilir -- iki kez tetiklenen bir job
     * cift puan yazamaz.
     */
    private function record(
        int $customerId,
        int $points,
        string $type,
        ?string $referenceType,
        ?int $referenceId,
        ?string $description,
        $expiresAt
    ): ?LoyaltyPointTransaction {
        try {
            return LoyaltyPointTransaction::create([
                'customer_id' => $customerId,
                'points' => $points,
                'type' => $type,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'description' => $description,
                'expires_at' => $expiresAt,
            ]);
        } catch (QueryException $e) {
            // 23000 = integrity constraint violation (benzersiz indeks)
            if ((string) $e->getCode() === '23000') {
                Log::info('[loyalty] ayni kaynak icin puan zaten yazilmis, atlandi', [
                    'customer_id' => $customerId,
                    'type' => $type,
                    'reference_type' => $referenceType,
                    'reference_id' => $referenceId,
                ]);

                return null;
            }

            throw $e;
        }
    }
}
