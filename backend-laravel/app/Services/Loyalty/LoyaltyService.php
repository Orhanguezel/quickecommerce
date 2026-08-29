<?php

namespace App\Services\Loyalty;

use App\Models\Coupon;
use App\Models\CouponLine;
use App\Models\Customer;
use App\Models\LoyaltyPointTransaction;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\UniversalNotification;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Sadakat puani sistemi.
 *
 * Kazanma : teslim edilen sipariste 1 TL = 1 puan (ODENEN degil, TESLIM EDILEN
 *           -- iptal/iade hayalet puan birakmasin), onaylanan yoruma bonus.
 * Bekleme : kazanilan puan hemen kullanilamaz, BEKLEME SURESI kadar (varsayilan
 *           14 gun, tuketicinin cayma hakki penceresi) beklemede kalir. Iade
 *           bu pencerede geldiginde puan henuz harcanamadigi icin temiz sekilde
 *           geri alinir; bekleme olmasa musteri puani ayni gun bozdurur ve
 *           iadede geri alinacak puan kalmazdi.
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

    /**
     * KULLANILABILIR bakiye. Bekleme suresi dolmamis puanlar dahil DEGILDIR;
     * bozdurma, yetersiz bakiye kontrolu ve arayuzdeki "Puan Bakiyeniz" hep
     * bu degeri kullanir.
     */
    public function balance(int $customerId): int
    {
        return (int) LoyaltyPointTransaction::where('customer_id', $customerId)
            ->available()
            ->sum('points');
    }

    /** Henuz kullanima acilmamis puan toplami. */
    public function pendingBalance(int $customerId): int
    {
        return (int) LoyaltyPointTransaction::where('customer_id', $customerId)
            ->pending()
            ->sum('points');
    }

    /** Bekleyen puanlardan en yakin kullanima acilma tarihi. */
    public function nextAvailableAt(int $customerId): ?\Illuminate\Support\Carbon
    {
        $value = LoyaltyPointTransaction::where('customer_id', $customerId)
            ->pending()
            ->where('points', '>', 0)
            ->min('available_at');

        return $value ? \Illuminate\Support\Carbon::parse($value) : null;
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

    /**
     * Kazanilan puanin kullanima acilmasi icin beklenecek gun sayisi.
     *
     * Varsayilan 14: mesafeli satislarda cayma hakki teslimattan itibaren 14
     * gundur. Bu sure boyunca puan beklemede tutulur ki iade geldiginde geri
     * alinacak puan mutlaka bulunsun.
     *
     * 0 girilirse bekleme kapanir -- ama o zaman iade sonrasi bakiye eksiye
     * dusebilir; ayar arayuzu bu riski yazar.
     */
    public function holdDays(): int
    {
        $value = com_option_get('com_loyalty_hold_days');

        // Hic yazilmamissa (NULL / bos) varsayilan 14. Acikca "0" yazilmissa
        // yoneticinin bilincli tercihidir, 14'e cevrilmez.
        if ($value === null || $value === '') {
            return 14;
        }

        return max(0, (int) $value);
    }

    /** Yeni kazanimin kullanima acilacagi an. Bekleme 0 ise NULL (aninda). */
    private function availableAt(): ?\Illuminate\Support\Carbon
    {
        $days = $this->holdDays();

        return $days > 0 ? now()->addDays($days) : null;
    }

    /**
     * Kazanimin son kullanma tarihi.
     *
     * Gecerlilik suresi BEKLEME BITTIKTEN SONRA baslar; aksi halde 14 gunluk
     * bekleme, musterinin puani kullanabilecegi sureden kesilirdi.
     */
    private function expiresAt(): \Illuminate\Support\Carbon
    {
        return now()->addDays($this->holdDays() + $this->pointsExpireDays());
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

        $transaction = $this->record(
            $customerId,
            $points,
            LoyaltyPointTransaction::TYPE_ORDER,
            Order::class,
            $order->id,
            "Sipariş #{$order->id} teslim edildi",
            $this->expiresAt(),
            $this->availableAt()
        );

        if ($transaction) {
            $this->notifyEarned(
                $customerId,
                $points,
                "Sipariş #{$order->id} teslim edildi",
                ['type' => 'loyalty_earned', 'order_id' => $order->id],
                $transaction->available_at
            );
        }

        return $transaction;
    }

    /**
     * Onaylanan URUN degerlendirmesi icin bonus yazar.
     *
     * Kurallar:
     * - Puan YILDIZ SAYISINDAN BAGIMSIZ. Olumlu yoruma sart kosmak hem Ticari
     *   Reklam Yonetmeligi acisindan riskli hem de yorumlarin guvenilirligini
     *   bitirir.
     * - URUN BASINA BIR KEZ. Defter kaydinin referansi Review degil PRODUCT;
     *   boylece (customer_id, type, reference_type, reference_id) benzersiz
     *   indeksi "ayni musteri ayni urunden ikinci kez puan alamaz" kuralini
     *   VERITABANI seviyesinde uygular. Musteri urunu tekrar satin alip yeni
     *   bir yorum yazsa bile ikinci bonus olusmaz.
     * - SIPARIS BASINA TAVAN. Cok kalemli sepetlerde bonusun marji yemesini
     *   engeller (com_loyalty_review_max_per_order).
     * - Sadece urun yorumlari; kurye degerlendirmesi puan kazandirmaz.
     */
    public function awardForApprovedReview(Review $review): ?LoyaltyPointTransaction
    {
        if (! $this->enabled() || ! $review->customer_id) {
            return null;
        }

        // Kurye/diger degerlendirmeler bonus kapsaminda degil.
        if ($review->reviewable_type !== Product::class) {
            return null;
        }

        $productId = (int) $review->reviewable_id;
        if ($productId <= 0) {
            return null;
        }

        $hasImage = filled($review->images);
        $points = $hasImage
            ? (int) (com_option_get('com_loyalty_review_bonus_with_image') ?: 2000)
            : (int) (com_option_get('com_loyalty_review_bonus_no_image') ?: 1000);

        if ($points <= 0) {
            return null;
        }

        if ($this->orderReviewBonusCapReached($review)) {
            Log::info('[loyalty] siparis basina yorum bonusu tavani doldu', [
                'review_id' => $review->id,
                'order_id' => $review->order_id,
                'customer_id' => $review->customer_id,
            ]);

            return null;
        }

        $transaction = $this->record(
            (int) $review->customer_id,
            $points,
            LoyaltyPointTransaction::TYPE_REVIEW,
            Product::class,
            $productId,
            ($hasImage ? 'Görselli değerlendirme bonusu' : 'Değerlendirme bonusu')
                . ($review->order_id ? " (Sipariş #{$review->order_id})" : ''),
            $this->expiresAt(),
            $this->availableAt()
        );

        if ($transaction) {
            $this->notifyEarned(
                (int) $review->customer_id,
                $points,
                'Değerlendirmeniz yayınlandı',
                [
                    'type' => 'loyalty_earned',
                    'review_id' => $review->id,
                    'product_id' => $productId,
                ],
                $transaction->available_at
            );
        }

        return $transaction;
    }

    /** Siparis basina odullendirilecek yorum sayisi tavani. */
    public function reviewMaxPerOrder(): int
    {
        return max(1, (int) (com_option_get('com_loyalty_review_max_per_order') ?: 3));
    }

    /**
     * Bu siparis icin tavan doldu mu?
     *
     * Ayni siparisin urunlerinden kac tanesi zaten bonus almis, ona bakar.
     */
    private function orderReviewBonusCapReached(Review $review): bool
    {
        if (! $review->order_id) {
            return false;
        }

        $orderProductIds = Review::where('order_id', $review->order_id)
            ->where('customer_id', $review->customer_id)
            ->where('reviewable_type', Product::class)
            ->pluck('reviewable_id')
            ->map(fn ($id) => (int) $id)
            ->unique();

        if ($orderProductIds->isEmpty()) {
            return false;
        }

        $alreadyRewarded = LoyaltyPointTransaction::where('customer_id', $review->customer_id)
            ->where('type', LoyaltyPointTransaction::TYPE_REVIEW)
            ->where('reference_type', Product::class)
            ->whereIn('reference_id', $orderProductIds)
            ->count();

        return $alreadyRewarded >= $this->reviewMaxPerOrder();
    }

    /** Musteri bu urun icin daha once yorum bonusu aldi mi? */
    public function hasReviewBonusForProduct(int $customerId, int $productId): bool
    {
        return LoyaltyPointTransaction::where('customer_id', $customerId)
            ->where('type', LoyaltyPointTransaction::TYPE_REVIEW)
            ->where('reference_type', Product::class)
            ->where('reference_id', $productId)
            ->exists();
    }

    /**
     * Siparis iptal/iade edildiginde o siparisin puanini geri alir.
     *
     * Kazanim anahtari kapali olsa bile calisir: verilmis puani geri almak
     * programin acik olmasina bagli olmamali.
     *
     * IKI DURUM VAR:
     *
     * 1) Puan hala BEKLEMEDE (normal hal — iade penceresi 14 gun, bekleme de
     *    14 gun). Geri alma kaydi, kazanimin `available_at` degerini AYNEN
     *    kopyalar. Boylece iki kayit ayni havuzda (bekleyen) toplanip sifirlanir;
     *    musterinin kullanilabilir bakiyesine hic dokunulmaz. Geri alma kaydini
     *    "aninda" yazmak, bekleyen +1000'e karsi kullanilabilir -1000 demek
     *    olurdu ve bakiye sebepsiz eksiye duserdi.
     *
     * 2) Puan KULLANIMA ACILMIS (iade bekleme suresinden sonra gelmis). O zaman
     *    puan harcanmis olabilir. Geri alma, kullanilabilir bakiye kadar
     *    kirpilir -- musteriye borc cikarilmaz. Kirpilan fark loglanir; admin
     *    gerekirse "Sadakat Puanlari" ekranindan elle duzeltir.
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

        $customerId = (int) $awarded->customer_id;
        $full = abs((int) $awarded->points);
        $amount = $full;

        if (! $awarded->isPending()) {
            // Kullanima acilmis puanin bir kismi harcanmis olabilir.
            $amount = max(0, min($full, $this->balance($customerId)));

            if ($amount < $full) {
                Log::warning('[loyalty] iade puani tam geri alinamadi (puan harcanmis)', [
                    'order_id' => $order->id,
                    'customer_id' => $customerId,
                    'awarded' => $full,
                    'revoked' => $amount,
                    'shortfall' => $full - $amount,
                ]);
            }
        }

        if ($amount <= 0) {
            return null;
        }

        return $this->record(
            $customerId,
            -$amount,
            LoyaltyPointTransaction::TYPE_REVOKE,
            Order::class,
            $order->id,
            "Sipariş #{$order->id} iptal/iade edildi",
            null,
            // Bekleyen kazanimin geri alinmasi da BEKLEYEN kayittir; ikisi ayni
            // havuzda birbirini goturur.
            $awarded->available_at
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
                // baska bir istek harcamis olabilir. Yalnizca KULLANILABILIR
                // kayitlar sayilir; bekleme suresi dolmamis puan bozdurulamaz.
                $balance = (int) LoyaltyPointTransaction::where('customer_id', $customer->id)
                    ->available()
                    ->lockForUpdate()
                    ->sum('points');

                if ($balance < $points) {
                    $pending = $this->pendingBalance((int) $customer->id);

                    if ($pending > 0) {
                        $next = $this->nextAvailableAt((int) $customer->id);

                        throw new \RuntimeException(__(
                            'Yetersiz puan. Kullanılabilir bakiyeniz: :balance. :pending puanınız hâlâ beklemede:next',
                            [
                                'balance' => $balance,
                                'pending' => $pending,
                                'next' => $next ? ' (' . $next->format('d.m.Y') . ' tarihinde kullanıma açılır)' : '',
                            ]
                        ));
                    }

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
     * Puan kazanildiginda musteriye bildirim. Bildirim yazilamazsa puan
     * islemini asla bozmaz.
     */
    private function notifyEarned(
        int $customerId,
        int $points,
        string $reason,
        array $data,
        $availableAt = null
    ): void {
        try {
            $value = $this->pointsToCurrency($points);
            $formatted = number_format($points, 0, ',', '.');

            // Bekleme suresi varsa musteriye ILK ANDA soylenir; puani gorup
            // kullanamamak, hic gormemekten daha kotu bir deneyimdir.
            $availability = $availableAt
                ? ' Puanlarınız ' . $availableAt->format('d.m.Y') . ' tarihinde kullanıma açılacak'
                    . ' (iade süresi dolduktan sonra); o tarihten itibaren Hesabım > Puanlarım'
                    . ' sayfasından indirim çekine dönüştürebilirsiniz.'
                : ' Puanlarınızı Hesabım > Puanlarım sayfasından indirim çekine dönüştürebilirsiniz.';

            UniversalNotification::create([
                'notifiable_id' => $customerId,
                'notifiable_type' => 'customer',
                'title' => $formatted . ' puan kazandınız',
                'message' => "{$reason}. Hesabınıza {$formatted} puan eklendi"
                    . " (yaklaşık {$value} TL değerinde)." . $availability,
                'data' => $data + [
                    'points' => $points,
                    'available_at' => $availableAt?->toIso8601String(),
                ],
                'status' => 'unread',
            ]);
        } catch (\Throwable $e) {
            Log::warning('[loyalty] puan bildirimi olusturulamadi', [
                'customer_id' => $customerId,
                'error' => $e->getMessage(),
            ]);
        }
    }

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
        $expiresAt,
        $availableAt = null
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
                'available_at' => $availableAt,
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
