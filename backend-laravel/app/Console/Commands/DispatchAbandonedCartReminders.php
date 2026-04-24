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
 *   abandoned → reminder 1:      1 hour
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
        $marked = AbandonedCart::query()
            ->whereNull('abandoned_at')
            ->whereNull('recovered_at')
            ->whereNotNull('last_activity_at')
            ->where('last_activity_at', '<=', $now->copy()->subMinutes(30))
            ->update(['abandoned_at' => $now]);

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
            SendAbandonedCartReminder::dispatch($cart->id, 1);
        }
        foreach ($stage2 as $cart) {
            SendAbandonedCartReminder::dispatch($cart->id, 2, 'GERI10', 10);
        }
        foreach ($stage3 as $cart) {
            SendAbandonedCartReminder::dispatch($cart->id, 3, 'SONSANS15', 15);
        }

        $this->info('Dispatched all pending stages.');
        return self::SUCCESS;
    }

    private function baseQuery()
    {
        return AbandonedCart::query()
            ->whereNotNull('email')
            ->whereNull('recovered_at')
            ->whereNull('unsubscribed_at');
    }

    private function readyForStage1(Carbon $now)
    {
        return $this->baseQuery()
            ->whereNotNull('abandoned_at')
            ->whereNull('first_reminded_at')
            ->where('abandoned_at', '<=', $now->copy()->subHour())
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
            ->whereNotNull('second_reminded_at')
            ->whereNull('third_reminded_at')
            ->where('second_reminded_at', '<=', $now->copy()->subHours(24))
            ->get();
    }
}
