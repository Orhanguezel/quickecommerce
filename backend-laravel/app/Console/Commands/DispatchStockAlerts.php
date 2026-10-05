<?php

namespace App\Console\Commands;

use App\Mail\StockAlertMail;
use App\Models\StockAlertSubscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

class DispatchStockAlerts extends Command
{
    protected $signature = 'products:dispatch-stock-alerts {--limit=200} {--dry-run}';
    protected $description = 'Send a one-time email when a confirmed product variant is back in stock';

    public function handle(): int
    {
        if (!$this->option('dry-run')) {
            StockAlertSubscription::where('expires_at', '<', now()->subDays(30))->delete();
        }
        $limit = max(1, min(1000, (int) $this->option('limit')));
        $subscriptions = StockAlertSubscription::query()
            ->whereNotNull('confirmed_at')
            ->whereNull('notified_at')
            ->where('expires_at', '>', now())
            ->whereHas('product', fn ($q) => $q->where('status', 'approved')
                ->whereHas('store', fn ($store) => $store->where('status', 1)->whereNull('sales_suspended_at')))
            ->whereHas('variant', fn ($q) => $q->where('status', 1)->where('stock_quantity', '>', 0))
            ->with(['product', 'variant'])
            ->orderBy('id')
            ->limit($limit)
            ->get();

        if ($this->option('dry-run')) {
            $this->info("DRY-RUN ready={$subscriptions->count()}");
            return self::SUCCESS;
        }

        $sent = 0;
        foreach ($subscriptions as $subscription) {
            $lock = Cache::lock('stock-alert:' . $subscription->id, 120);
            if (!$lock->get()) continue;
            try {
                $subscription->refresh();
                if ($subscription->notified_at || !$subscription->confirmed_at
                    || !$subscription->expires_at->isFuture()
                    || !$subscription->variant?->isPubliclySellable()) continue;

                $productUrl = rtrim(config('app.frontend_url'), '/') . '/tr/urun/'
                    . rawurlencode($subscription->product->slug);
                $unsubscribeUrl = URL::temporarySignedRoute('stock-alerts.unsubscribe', now()->addDays(90), [
                    'subscription' => $subscription->id,
                ]);
                Mail::to($subscription->email)->send(new StockAlertMail(
                    'restocked', $subscription->product->name, $productUrl, $unsubscribeUrl
                ));
                $subscription->forceFill(['notified_at' => now()])->save();
                $sent++;
            } catch (\Throwable $error) {
                Log::warning('Stock alert delivery failed', [
                    'subscription_id' => $subscription->id, 'error' => $error->getMessage(),
                ]);
            } finally {
                $lock->release();
            }
        }

        $this->info("ready={$subscriptions->count()} sent={$sent}");
        return self::SUCCESS;
    }

}
