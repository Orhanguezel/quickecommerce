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
        // Kazanimi test suresince ac. setOption kullanilir cunku ayar satiri
        // hic yaratilmamis olabilir; duz UPDATE o durumda sessizce hicbir sey
        // yapmaz ve test "kazanim acilmadi" diye kalirdi.
        $this->setOption('com_loyalty_enabled', 'on');
        // Bekleme suresini testte SABITLE. Yoneticinin o anki ayari ne olursa
        // olsun testin bekleyen/kullanilabilir ayrimini olcebilmesi gerekir.
        $this->setOption('com_loyalty_hold_days', '14');
        $this->forgetOptionCache();

        $loyalty = app(LoyaltyService::class);
        $this->check('kazanim acildi', $loyalty->enabled());
        $this->check('bekleme suresi 14 gun', $loyalty->holdDays() === 14);

        $order = $this->pickOrder();
        if (! $order) {
            $this->warn('  [ATLANDI] teslim edilmis, musterisi olan siparis bulunamadi');
            return;
        }

        $customerId = (int) $order->orderMaster->customer_id;
        $expected = (int) floor(((float) $order->order_amount) * $loyalty->earnPerCurrency());

        // 1) Teslimat puani BEKLEMEDE yazilir
        $before = $loyalty->balance($customerId);
        $pendingBefore = $loyalty->pendingBalance($customerId);
        $tx = $loyalty->awardForDeliveredOrder($order);
        $this->check("siparis #{$order->id} puani yazildi ({$expected})", $tx !== null && $tx->points === $expected);
        $this->check('puan BEKLEMEDE yazildi', $tx !== null && $tx->isPending());
        $this->check('kullanima acilma tarihi 14 gun sonra',
            $tx?->available_at !== null && (int) round(now()->diffInDays($tx->available_at)) === 14);
        $this->check('KULLANILABILIR bakiye degismedi (bekleme)', $loyalty->balance($customerId) === $before);
        $this->check('bekleyen bakiye artti', $loyalty->pendingBalance($customerId) === $pendingBefore + $expected);
        $this->check('son kullanma tarihi bekleme SONRASI baslar',
            $tx?->expires_at !== null && $tx->expires_at->gt(now()->addDays($loyalty->pointsExpireDays())));

        // 2) Ayni kaynak icin cift puan yazilamaz (benzersiz indeks)
        $this->check('cift puan engellendi', $loyalty->awardForDeliveredOrder($order) === null);
        $this->check('bekleyen bakiye degismedi', $loyalty->pendingBalance($customerId) === $pendingBefore + $expected);

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

            $pendBefore = $loyalty->pendingBalance($reviewCustomerId);
            $rtx = $loyalty->awardForApprovedReview($review);
            $this->check("yorum bonusu yazildi ({$wantBonus} puan)", $rtx !== null && $rtx->points === $wantBonus);
            $this->check('yorum bonusu da beklemede', $rtx !== null && $rtx->isPending());
            $this->check('bonus referansi PRODUCT (urun basina teklik icin)',
                $rtx?->reference_type === \App\Models\Product::class && (int) $rtx?->reference_id === $productId);
            $this->check('ayni yorum tekrar puan yazmadi', $loyalty->awardForApprovedReview($review) === null);
            $this->check('yorum bonusu bekleyen bakiyeye eklendi',
                $loyalty->pendingBalance($reviewCustomerId) === $pendBefore + $wantBonus);
            $this->check('yorum bonusu kullanilabilir bakiyeye EKLENMEDI',
                $loyalty->balance($reviewCustomerId) === $balBefore);
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
            $balBeforeSecond = $loyalty->pendingBalance($reviewCustomerId);
            $this->check('ayni urun ikinci siparişte de puan vermedi',
                $loyalty->awardForApprovedReview($secondPurchase) === null);
            $this->check('bakiye degismedi', $loyalty->pendingBalance($reviewCustomerId) === $balBeforeSecond);

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

        // Bozdurma testleri icin KULLANILABILIR bakiyeyi yeterli seviyeye cikar.
        // Manuel kayitlarda available_at NULL'dir, yani aninda kullanilabilir --
        // admin telafisi bekleme suresine takilmamali.
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
        $this->check('manuel puan aninda kullanilabilir (beklemeye takilmaz)',
            $loyalty->balance($customerId) >= $loyalty->minRedeemPoints() * 2);

        // 3a) BOZDURMA ANAHTARI KAPALIYKEN hicbir cek uretilemez.
        //
        // Bu kontrol ayni zamanda testin kendi KURULUMUDUR: anahtar canlida
        // kapali olabilir (yonetici programi kapatmis olabilir) ve o zaman
        // asagidaki butun bozdurma testleri "kapali" hatasiyla patlar --
        // ya da daha kotusu, minimum/yetersiz-bakiye kontrolleri YANLIS
        // SEBEPLE gecmis gorunur. Once kapali halini dogrula, sonra ac.
        $this->setOption('com_loyalty_redeem_enabled', 'off');
        $this->forgetOptionCache();
        $this->check('bozdurma kapaliyken cek uretilemedi', $this->throws(
            fn () => $loyalty->redeem($customer, $loyalty->minRedeemPoints())
        ));

        $this->setOption('com_loyalty_redeem_enabled', 'on');
        $this->forgetOptionCache();
        $this->check('bozdurma acildi', $loyalty->redeemEnabled());

        // 3b) BEKLEYEN puan bozdurulamaz: kullanilabilir + bekleyen kadar
        //     istenirse reddedilmeli. Bekleme suresinin tek isi bu.
        $pendingNow = $loyalty->pendingBalance($customerId);
        if ($pendingNow > 0) {
            $this->check('bekleyen puan bozdurulamadi', $this->throws(
                fn () => $loyalty->redeem($customer, $loyalty->balance($customerId) + $pendingNow)
            ));
        }

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

        // 9) IADE, puan HALA BEKLEMEDEYKEN (asil senaryo: iade penceresi 14
        //    gun, bekleme de 14 gun). Geri alma kaydi ayni havuzda yazilir,
        //    musterinin kullanilabilir bakiyesine hic dokunulmaz.
        $balBefore = $loyalty->balance($customerId);
        $pendBefore = $loyalty->pendingBalance($customerId);
        $revoked = $loyalty->revokeForOrder($order);
        $this->check('iade bekleyen puani geri aldi', $revoked !== null && $revoked->points === -$expected);
        $this->check('geri alma kaydi da BEKLEMEDE (ayni havuzda netlesir)', $revoked !== null && $revoked->isPending());
        $this->check('bekleyen bakiye dustu', $loyalty->pendingBalance($customerId) === $pendBefore - $expected);
        $this->check('KULLANILABILIR bakiyeye DOKUNULMADI', $loyalty->balance($customerId) === $balBefore);
        $this->check('ikinci revoke engellendi', $loyalty->revokeForOrder($order) === null);

        // 10) IADE, puan KULLANIMA ACILDIKTAN sonra: kullanilabilir bakiyeden
        //     dusulmeli.
        $matured = $this->pickAnotherOrder([$order->id]);
        if ($matured) {
            $mCustomer = (int) $matured->orderMaster->customer_id;
            $mTx = $loyalty->awardForDeliveredOrder($matured);

            if ($mTx) {
                // Zamani ileri sarmak yerine kaydi olgunlastiriyoruz.
                LoyaltyPointTransaction::where('id', $mTx->id)->update(['available_at' => now()->subDay()]);

                $mPoints = (int) $mTx->points;
                $balAfterMature = $loyalty->balance($mCustomer);
                $this->check('bekleme dolunca puan kullanilabilir oldu (cron gerekmeden)',
                    $balAfterMature >= $mPoints);

                $mRevoked = $loyalty->revokeForOrder($matured);
                $this->check('acilmis puan iadede kullanilabilir bakiyeden dusuldu',
                    $mRevoked !== null && $loyalty->balance($mCustomer) === $balAfterMature - $mPoints);
                $this->check('acilmis puanin geri alinmasi aninda gecerli',
                    $mRevoked !== null && ! $mRevoked->isPending());
            }
        } else {
            $this->warn('  [ATLANDI] olgunlasmis iade testi icin ikinci siparis yok');
        }

        // 11) Puan harcandiktan SONRA gelen iade: musteriye borc cikarilmaz,
        //     geri alma kalan bakiye kadar kirpilir.
        $spent = $this->pickAnotherOrder([$order->id, $matured?->id]);
        if ($spent) {
            $sCustomer = (int) $spent->orderMaster->customer_id;
            $sTx = $loyalty->awardForDeliveredOrder($spent);

            if ($sTx && (int) $sTx->points >= 2) {
                LoyaltyPointTransaction::where('id', $sTx->id)->update(['available_at' => now()->subDay()]);

                // Bakiyeyi, kazanilan puanin yarisina indir (kalanini harcamis say).
                $keep = intdiv((int) $sTx->points, 2);
                $drain = $loyalty->balance($sCustomer) - $keep;
                if ($drain > 0) {
                    $loyalty->adjustManually($sCustomer, -$drain, 'selftest: puan harcandi varsayimi');
                }

                $sRevoked = $loyalty->revokeForOrder($spent);
                $this->check('harcanmis puanin iadesi kalan bakiye kadar kirpildi',
                    $sRevoked !== null && $sRevoked->points === -$keep);
                $this->check('bakiye eksiye DUSMEDI', $loyalty->balance($sCustomer) === 0);
            }
        }

        // 12) Defter butunlugu: kullanilabilir + bekleyen = defterin toplami
        $ledger = (int) LoyaltyPointTransaction::where('customer_id', $customerId)->sum('points');
        $this->check('kullanilabilir + bekleyen = defter toplami',
            $ledger === $loyalty->balance($customerId) + $loyalty->pendingBalance($customerId));
    }

    /** Testte kullanilmamis, teslim edilmis baska bir siparis. */
    private function pickAnotherOrder(array $excludeIds): ?Order
    {
        return Order::with('orderMaster')
            ->whereHas('orderMaster', fn ($q) => $q->whereNotNull('customer_id'))
            ->whereNotIn('id', array_filter($excludeIds))
            ->where('status', 'delivered')
            ->where('order_amount', '>', 0)
            ->orderByDesc('order_amount')
            ->first();
    }

    /**
     * Ayar yaz; kayit yoksa olusturur. DB yazimi transaction icinde oldugu
     * icin rollback ile geri alinir, cache ise finally'deki forgetOptionCache
     * ile temizlenir.
     */
    private function setOption(string $name, string $value): void
    {
        com_option_update($name, $value);
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
        foreach (['com_loyalty_enabled', 'com_loyalty_redeem_enabled', 'com_loyalty_hold_days'] as $key) {
            foreach (array_unique(['tr', 'en', app()->getLocale()]) as $locale) {
                Cache::forget("{$key}_{$locale}");
            }
        }
    }
}
