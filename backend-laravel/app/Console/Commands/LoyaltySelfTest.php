<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Models\LoyaltyPointTransaction;
use App\Models\Order;
use App\Models\Review;
use App\Services\Loyalty\LoyaltyService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Sadakat sisteminin uctan uca kendi kendini testi.
 *
 * HER SEY TEK BIR TRANSACTION ICINDE CALISIR VE SONUNDA ROLLBACK EDILIR —
 * canli veriye kalici hicbir sey yazilmaz. Bu yuzden canlida da guvenle
 * calistirilabilir.
 *
 *   php artisan loyalty:selftest
 */
class LoyaltySelfTest extends Command
{
    protected $signature = 'loyalty:selftest {--order= : Test icin kullanilacak teslim edilmis siparis id}';
    protected $description = 'Sadakat puani sistemini uctan uca test eder (transaction + rollback, kalici degisiklik yapmaz).';

    private int $passed = 0;
    private int $failed = 0;

    public function handle(): int
    {
        DB::beginTransaction();

        try {
            $this->runChecks();
        } catch (\Throwable $e) {
            $this->failed++;
            $this->error('  [HATA] ' . $e->getMessage());
            $this->line('         ' . $e->getFile() . ':' . $e->getLine());
        } finally {
            DB::rollBack();
            $this->forgetOptionCache();
        }

        $this->newLine();
        $this->line("==== SONUC: {$this->passed} gecti, {$this->failed} kaldi ====");
        $this->line('Kalici degisiklik yok (rollback yapildi).');
        $this->line('Kazanim anahtari: ' . (com_option_get('com_loyalty_enabled') ?: 'off'));

        return $this->failed === 0 ? self::SUCCESS : self::FAILURE;
    }

    private function runChecks(): void
    {
        // Kazanimi test suresince ac.
        DB::table('setting_options')->where('option_name', 'com_loyalty_enabled')->update(['option_value' => 'on']);
        $this->forgetOptionCache();

        $loyalty = app(LoyaltyService::class);
        $this->check('kazanim acildi', $loyalty->enabled());

        $order = $this->pickOrder();
        if (! $order) {
            $this->warn('  [ATLANDI] teslim edilmis, musterisi olan siparis bulunamadi');
            return;
        }

        $customerId = (int) $order->orderMaster->customer_id;
        $expected = (int) floor(((float) $order->order_amount) * $loyalty->earnPerCurrency());

        // 1) Teslimat puani
        $before = $loyalty->balance($customerId);
        $tx = $loyalty->awardForDeliveredOrder($order);
        $this->check("siparis #{$order->id} puani yazildi ({$expected})", $tx !== null && $tx->points === $expected);
        $this->check('bakiye artti', $loyalty->balance($customerId) === $before + $expected);

        // 2) Ayni kaynak icin cift puan yazilamaz (benzersiz indeks)
        $this->check('cift puan engellendi', $loyalty->awardForDeliveredOrder($order) === null);
        $this->check('bakiye degismedi', $loyalty->balance($customerId) === $before + $expected);

        // 3) Yorum bonusu
        $review = Review::whereNotNull('customer_id')
            ->where('reviewable_type', \App\Models\Product::class)
            ->first();

        if ($review) {
            $reviewCustomerId = (int) $review->customer_id;
            $productId = (int) $review->reviewable_id;
            $balBefore = $loyalty->balance($reviewCustomerId);
            $wantBonus = filled($review->images)
                ? (int) (com_option_get('com_loyalty_review_bonus_with_image') ?: 2000)
                : (int) (com_option_get('com_loyalty_review_bonus_no_image') ?: 1000);

            $rtx = $loyalty->awardForApprovedReview($review);
            $this->check("yorum bonusu yazildi ({$wantBonus} puan)", $rtx !== null && $rtx->points === $wantBonus);
            $this->check('bonus referansi PRODUCT (urun basina teklik icin)',
                $rtx?->reference_type === \App\Models\Product::class && (int) $rtx?->reference_id === $productId);
            $this->check('ayni yorum tekrar puan yazmadi', $loyalty->awardForApprovedReview($review) === null);
            $this->check('yorum bonusu bakiyeye eklendi', $loyalty->balance($reviewCustomerId) === $balBefore + $wantBonus);
            $this->check('hasReviewBonusForProduct true doner',
                $loyalty->hasReviewBonusForProduct($reviewCustomerId, $productId));

            // Puan yildiz sayisindan BAGIMSIZ olmali.
            $lowStar = $review->replicate();
            $lowStar->rating = 1;
            $lowStar->save();
            $this->check('1 yildiz da ayni kurala tabi (urun basina teklik)',
                $loyalty->awardForApprovedReview($lowStar) === null);

            // AYNI URUN, BASKA SIPARIS -> ikinci bonus OLMAMALI.
            $secondPurchase = $review->replicate();
            $secondPurchase->order_id = ($review->order_id ?? 0) + 999999;
            $secondPurchase->save();
            $balBeforeSecond = $loyalty->balance($reviewCustomerId);
            $this->check('ayni urun ikinci siparişte de puan vermedi',
                $loyalty->awardForApprovedReview($secondPurchase) === null);
            $this->check('bakiye degismedi', $loyalty->balance($reviewCustomerId) === $balBeforeSecond);

            // BASKA URUN -> bonus verilmeli.
            $otherProduct = \App\Models\Product::where('id', '!=', $productId)->first();
            if ($otherProduct) {
                $otherReview = $review->replicate();
                $otherReview->reviewable_id = $otherProduct->id;
                $otherReview->order_id = ($review->order_id ?? 0) + 888888;
                $otherReview->save();
                $this->check('farkli urun icin bonus verildi',
                    $loyalty->awardForApprovedReview($otherReview) !== null);
            }

            // Kurye degerlendirmesi bonus kapsaminda OLMAMALI.
            $deliveryReview = $review->replicate();
            $deliveryReview->reviewable_type = \App\Models\User::class;
            $deliveryReview->order_id = ($review->order_id ?? 0) + 777777;
            $deliveryReview->save();
            $this->check('kurye degerlendirmesi puan vermedi',
                $loyalty->awardForApprovedReview($deliveryReview) === null);
        } else {
            $this->warn('  [ATLANDI] sistemde urun yorumu yok');
        }

        // Bozdurma testleri icin bakiyeyi yeterli seviyeye cikar.
        $topUp = max(0, $loyalty->minRedeemPoints() * 2 - $loyalty->balance($customerId));
        if ($topUp > 0) {
            LoyaltyPointTransaction::create([
                'customer_id' => $customerId,
                'points' => $topUp,
                'type' => LoyaltyPointTransaction::TYPE_MANUAL,
                'description' => 'selftest',
            ]);
        }

        $customer = Customer::find($customerId);

        // 4) Minimum altinda bozdurma reddedilmeli
        $this->check('minimum alti bozdurma reddedildi', $this->throws(
            fn () => $loyalty->redeem($customer, max(1, $loyalty->minRedeemPoints() - 1))
        ));

        // 5) Bakiyeden fazla bozdurma reddedilmeli
        $this->check('yetersiz bakiye reddedildi', $this->throws(
            fn () => $loyalty->redeem($customer, $loyalty->balance($customerId) + 10000)
        ));

        // 6) Gecerli bozdurma
        $redeemPoints = $loyalty->minRedeemPoints();
        $expectedValue = $loyalty->pointsToCurrency($redeemPoints);
        $balBefore = $loyalty->balance($customerId);
        $voucher = $loyalty->redeem($customer, $redeemPoints);

        $this->check('cek uretildi', str_starts_with($voucher->coupon_code, 'PUAN-'));
        $this->check("cek tutari {$expectedValue} TL", (float) $voucher->discount === $expectedValue);
        $this->check('max_discount DOLU (NULL olsa indirim 0 TL olurdu)', (float) $voucher->max_discount === $expectedValue);
        $this->check('coupon_id DOLU (NULL olsa checkCoupon patlardi)', ! empty($voucher->coupon_id));
        $this->check('tek kullanimlik', (int) $voucher->usage_limit === 1);
        $this->check('min sepet ayardan geldi', (float) $voucher->min_order_value === $loyalty->voucherMinOrder());
        $this->check('musteriye ozel', (int) $voucher->customer_id === $customerId);
        $this->check('puan dusuldu', $loyalty->balance($customerId) === $balBefore - $redeemPoints);

        // 7) GERCEK kupon motoru cheki kabul ediyor mu
        auth('api_customer')->setUser($customer);
        $minOrder = $loyalty->voucherMinOrder();

        $applied = checkCoupon($voucher->coupon_code, $minOrder * 2);
        $this->check('kupon motoru cheki kabul etti', ! empty($applied));
        $this->check('indirim dogru uygulandi', ! empty($applied) && (float) $applied['discounted_amount'] === $expectedValue);
        $this->check('min sepet altinda reddedildi', empty(checkCoupon($voucher->coupon_code, $minOrder - 1)));

        // 8) Baska musteri bu cheki kullanamamali
        $other = Customer::where('id', '!=', $customerId)->first();
        if ($other) {
            auth('api_customer')->setUser($other);
            $this->check('baska musteri cheki kullanamadi', empty(checkCoupon($voucher->coupon_code, $minOrder * 2)));
            auth('api_customer')->setUser($customer);
        }

        // 9) Iptal/iade puani geri almali
        $balBefore = $loyalty->balance($customerId);
        $revoked = $loyalty->revokeForOrder($order);
        $this->check('iptal puani geri aldi', $revoked !== null && $revoked->points === -$expected);
        $this->check('bakiye dustu', $loyalty->balance($customerId) === $balBefore - $expected);
        $this->check('ikinci revoke engellendi', $loyalty->revokeForOrder($order) === null);

        // 10) Bakiye her zaman defterin toplami olmali
        $ledger = (int) LoyaltyPointTransaction::where('customer_id', $customerId)->sum('points');
        $this->check('bakiye = defter toplami', $ledger === $loyalty->balance($customerId));
    }

    private function pickOrder(): ?Order
    {
        $query = Order::with('orderMaster')->whereHas('orderMaster', fn ($q) => $q->whereNotNull('customer_id'));

        if ($id = $this->option('order')) {
            return $query->find($id);
        }

        return $query->where('status', 'delivered')->orderByDesc('order_amount')->first();
    }

    private function throws(callable $fn): bool
    {
        try {
            $fn();
            return false;
        } catch (\RuntimeException $e) {
            return true;
        }
    }

    private function check(string $name, bool $ok): void
    {
        if ($ok) {
            $this->passed++;
            $this->line("  <fg=green>[GECTI]</> {$name}");
        } else {
            $this->failed++;
            $this->line("  <fg=red>[KALDI]</> {$name}");
        }
    }

    /**
     * com_option_get 10 dakika cache'liyor; test icinde degistirilen ayarin
     * okunabilmesi ve test sonrasi eski degere donulebilmesi icin temizlenir.
     */
    private function forgetOptionCache(): void
    {
        foreach (['com_loyalty_enabled', 'com_loyalty_redeem_enabled'] as $key) {
            foreach (array_unique(['tr', 'en', app()->getLocale()]) as $locale) {
                Cache::forget("{$key}_{$locale}");
            }
        }
    }
}
