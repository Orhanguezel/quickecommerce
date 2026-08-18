<?php

namespace App\Console\Commands;

use App\Models\Store;
use App\Models\UniversalNotification;
use App\Services\AdminNotifier;
use App\Services\CommerceReadinessService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class EnforceStoreReadiness extends Command
{
    private const AUTO_REASON = 'automatic_profile_readiness_below_80';

    protected $signature = 'commerce:enforce-store-readiness
        {--grace-days=7 : Minimum store age before suspension}
        {--apply : Persist suspensions/restorations; default is dry run}';
    protected $description = 'Suspend incomplete stores after a grace period and restore only automatically suspended stores when fixed';

    public function handle(CommerceReadinessService $service): int
    {
        $graceDays = max(1, min(90, (int) $this->option('grace-days')));
        $stores = Store::query()->where('status', 1)->get();
        $notifyIds = collect();
        $suspendIds = collect();
        $restoreIds = collect();
        $waitingIds = collect();

        foreach ($stores as $store) {
            $score = $service->refreshStore($store, (bool) $this->option('apply'))['score'];
            $physicalSeller = ($store->fulfillment_model ?: 'seller') === 'seller';
            if ($physicalSeller && $score < 80 && ! $store->sales_suspended_at) {
                $warning = $store->store_seller_id
                    ? UniversalNotification::query()
                        ->where('notifiable_type', 'store')
                        ->where('notifiable_id', $store->store_seller_id)
                        ->where('data->type', 'store_readiness_warning')
                        ->where('data->store_id', $store->id)
                        ->latest()->first()
                    : null;

                if (! $warning) {
                    $notifyIds->push($store->id);
                } elseif ($warning->created_at->lte(now()->subDays($graceDays))) {
                    $suspendIds->push($store->id);
                } else {
                    $waitingIds->push($store->id);
                }
            }
            if (($score >= 80 || ! $physicalSeller) && $store->sales_suspended_at && $store->sales_suspension_reason === self::AUTO_REASON) {
                $restoreIds->push($store->id);
            }
        }

        $this->table(['Action', 'Count', 'Store IDs'], [
            ['notify', $notifyIds->count(), $notifyIds->take(30)->join(', ')],
            ['grace period', $waitingIds->count(), $waitingIds->take(30)->join(', ')],
            ['suspend', $suspendIds->count(), $suspendIds->take(30)->join(', ')],
            ['restore', $restoreIds->count(), $restoreIds->take(30)->join(', ')],
        ]);
        if (! $this->option('apply')) {
            $this->warn('DRY-RUN: no store visibility changed. Review the IDs and rerun with --apply.');
            return self::SUCCESS;
        }

        $missingSeller = collect();
        DB::transaction(function () use ($stores, $notifyIds, $suspendIds, $restoreIds, $graceDays, &$missingSeller): void {
            foreach ($stores->whereIn('id', $notifyIds) as $store) {
                if (! $store->store_seller_id) {
                    $missingSeller->push($store->id);
                    continue;
                }
                UniversalNotification::create([
                    'notifiable_id' => $store->store_seller_id,
                    'notifiable_type' => 'store',
                    'title' => 'Mağaza profilinizi tamamlayın',
                    'message' => "{$store->name} profil skoru %{$store->profile_completion_score}. Eksik alanları {$graceDays} gün içinde tamamlayın; aksi halde yeni sipariş alımı geçici olarak durdurulur.",
                    'data' => [
                        'type' => 'store_readiness_warning',
                        'store_id' => $store->id,
                        'score' => (int) $store->profile_completion_score,
                        'grace_days' => $graceDays,
                    ],
                    'status' => 'unread',
                ]);
            }
            Store::query()->whereIn('id', $suspendIds)->update([
                'sales_suspended_at' => now(),
                'sales_suspension_reason' => self::AUTO_REASON,
            ]);
            Store::query()->whereIn('id', $restoreIds)->update([
                'sales_suspended_at' => null,
                'sales_suspension_reason' => null,
            ]);
        });
        if ($missingSeller->isNotEmpty()) {
            $recentAdminWarning = UniversalNotification::query()
                ->where('notifiable_type', 'admin')
                ->where('data->type', 'store_readiness_missing_seller')
                ->where('created_at', '>=', now()->subDays(7))
                ->exists();
            if (! $recentAdminWarning) {
                AdminNotifier::notifyPrimarySiteAdmin(
                    'Satıcısı olmayan eksik mağazalar',
                    'Profil uyarısı gönderilemeyen mağaza ID’leri: ' . $missingSeller->join(', '),
                    ['type' => 'store_readiness_missing_seller', 'store_ids' => $missingSeller->all()],
                );
            }
        }
        Cache::forever('public-catalog:version', (string) hrtime(true));
        return self::SUCCESS;
    }
}
