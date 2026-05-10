<?php

namespace App\Console\Commands;

use App\Models\FunnelEvent;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class PruneFunnelEvents extends Command
{
    protected $signature = 'analytics:prune-funnel-events {--days=180 : Number of days to retain raw funnel events}';

    protected $description = 'Delete raw funnel analytics events older than the configured retention window.';

    public function handle(): int
    {
        $days = max(30, (int) $this->option('days'));
        $cutoff = Carbon::now()->subDays($days);

        $deleted = FunnelEvent::query()
            ->where('occurred_at', '<', $cutoff)
            ->delete();

        $this->info("Deleted {$deleted} funnel event(s) older than {$days} days.");

        return self::SUCCESS;
    }
}
