<?php

namespace App\Console\Commands;

use App\Jobs\SendAbandonedCartReminder;
use App\Models\AbandonedCart;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * Scans abandoned_carts and fires email jobs for each stage whose
 * cooldown has elapsed. Idempotent — reruns are cheap.
 *
 * Scheduled every 15 minutes.
 *
 * Timings (in hours since previous event):
 *   inactive → abandoned:        30 minutes
 *   inactivity → reminder 1:     30 or 60 minutes (deterministic A/B)
 *   reminder 1 → reminder 2:    23 hours  (≈24h after abandonment)
 *   reminder 2 → reminder 3:    24 hours  (≈48h after abandonment)
 */
class DispatchAbandonedCartReminders extends Command
{
    protected $signature = 'abandoned-cart:dispatch-reminders
                            {--dry-run : List actions without dispatching jobs}';

    protected $description = 'Mark abandoned carts and dispatch staged recovery emails';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $now = Carbon::now();

        // 1) Promote inactive carts to "abandoned"
        $toMark = AbandonedCart::query()
            ->whereNull('abandoned_at')
            ->whereNull('recovered_at')
            ->whereNotNull('last_activity_at')
            ->where('last_activity_at', '<=', $now->copy()->subMinutes(30));
        $marked = (clone $toMark)->count();
        if (! $dryRun) {
            $toMark->update(['abandoned_at' => $now]);
        }

        $this->info("Marked {$marked} carts as abandoned.");

        // 2) Select carts ready for each stage
        $stage1 = $this->readyForStage1($now);
        $stage2 = $this->readyForStage2($now);
        $stage3 = $this->readyForStage3($now);

        $this->info(sprintf(
            'Ready — stage1: %d, stage2: %d, stage3: %d',
            $stage1->count(), $stage2->count(), $stage3->count()
        ));

        if ($dryRun) {
            $this->warn('dry-run: no jobs dispatched.');
            return self::SUCCESS;
        }

        foreach ($stage1 as $cart) {
            $this->assignVariant($cart);
            SendAbandonedCartReminder::dispatch($cart->id, 1);
        }
        foreach ($stage2 as $cart) {
            $this->assignVariant($cart);
            SendAbandonedCartReminder::dispatch(
                $cart->id,
                2,
                config('commerce.abandoned_cart_stage_2_coupon'),
                (int) config('commerce.abandoned_cart_stage_2_discount') ?: null,
            );
        }
        foreach ($stage3 as $cart) {
            $this->assignVariant($cart);
            SendAbandonedCartReminder::dispatch(
                $cart->id,
                3,
                config('commerce.abandoned_cart_stage_3_coupon'),
                (int) config('commerce.abandoned_cart_stage_3_discount') ?: null,
            );
        }

        $this->info('Dispatched all pending stages.');
        return self::SUCCESS;
    }

    private function assignVariant(AbandonedCart $cart): void
    {
        if ($cart->recovery_variant) return;
        $cart->forceFill(['recovery_variant' => $cart->id % 2 === 0 ? 'message_a' : 'message_b'])->saveQuietly();
    }

    private function baseQuery()
    {
        return AbandonedCart::query()
            ->whereNotNull('email')
            ->whereHas('customer', fn ($query) => $query->where('marketing_email', true))
            ->whereNull('recovered_at')
            ->whereNull('unsubscribed_at')
            ->where(function ($query) {
                $max = max(1, (int) config('commerce.abandoned_cart_max_reminders_30d', 3));
                $query->whereNull('reminder_window_started_at')
                    ->orWhere('reminder_window_started_at', '<', now()->subDays(30))
                    ->orWhere('reminder_count_30d', '<', $max);
            });
    }

    private function readyForStage1(Carbon $now)
    {
        return $this->baseQuery()
            ->whereNotNull('abandoned_at')
            ->whereNull('first_reminded_at')
            ->where(function ($query) use ($now) {
                // Even IDs: message_a at 30 minutes of inactivity (as soon as
                // the cart is marked abandoned). Odd IDs: message_b at 60.
                $query->where(fn ($a) => $a->whereRaw('MOD(id, 2) = 0')
                    ->where('abandoned_at', '<=', $now))
                    ->orWhere(fn ($b) => $b->whereRaw('MOD(id, 2) = 1')
                        ->where('abandoned_at', '<=', $now->copy()->subMinutes(30)));
            })
            ->get();
    }

    private function readyForStage2(Carbon $now)
    {
        return $this->baseQuery()
            ->whereNotNull('first_reminded_at')
            ->whereNull('second_reminded_at')
            ->where('first_reminded_at', '<=', $now->copy()->subHours(23))
            ->get();
    }

    private function readyForStage3(Carbon $now)
    {
        return $this->baseQuery()
            ->where('cart_total', '>=', max(0, (float) config('commerce.abandoned_cart_stage_3_min_total', 2500)))
            ->whereNotNull('second_reminded_at')
            ->whereNull('third_reminded_at')
            ->where('second_reminded_at', '<=', $now->copy()->subHours(24))
            ->get();
    }
}
