<?php

namespace App\Console\Commands;

use App\Models\Wishlist;
use App\Services\WishlistPriceAlertService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class CheckWishlistPriceAlerts extends Command
{
    protected $signature = 'wishlist:check-price-drops {--apply : Store snapshots and send alerts}';
    protected $description = 'Compare favourite variant prices; dry-run by default.';

    public function handle(WishlistPriceAlertService $service): int
    {
        if (!Schema::hasColumn('wishlists', 'price_alert_snapshot')) {
            $this->warn('Wishlist price alert migration is not installed.');
            return self::FAILURE;
        }
        $count = 0;
        Wishlist::withoutGlobalScopes()->where('price_alert_enabled', true)
            ->select('id')->chunkById(100, function ($rows) use ($service, &$count) {
                foreach ($rows as $row) {
                    $count += (int) $service->check($row->id, (bool) $this->option('apply'));
                }
            });
        $this->info(($this->option('apply') ? 'Created' : 'Would create') . ": {$count} price-drop notifications.");
        return self::SUCCESS;
    }
}
