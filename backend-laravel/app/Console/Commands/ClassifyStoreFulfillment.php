<?php

namespace App\Console\Commands;

use App\Models\Store;
use App\Models\UniversalNotification;
use App\Models\User;
use App\Services\CommerceReadinessService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ClassifyStoreFulfillment extends Command
{
    protected $signature = 'commerce:classify-store-fulfillment
        {owner_email : Exact store-level owner email for dropshipping stores}
        {--digital-slug=gzl-teknoloji : Store slug that sells digital services}
        {--apply : Persist changes; default is dry run}';

    protected $description = 'Classify owner-operated dropshipping and digital stores without applying physical seller profile rules';

    public function handle(CommerceReadinessService $readiness): int
    {
        $email = mb_strtolower(trim((string) $this->argument('owner_email')));
        $owner = User::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->where('activity_scope', 'store_level')
            ->where('store_owner', 1)
            ->where('status', 1)
            ->first();

        if (! $owner) {
            $this->error("Active store owner not found for exact email: {$email}");
            return self::FAILURE;
        }

        $digitalSlug = trim((string) $this->option('digital-slug'));
        $digitalStore = Store::query()->where('slug', $digitalSlug)->first();
        if (! $digitalStore) {
            $this->error("Digital store not found: {$digitalSlug}");
            return self::FAILURE;
        }

        $dropshipStores = Store::query()
            ->where('status', 1)
            ->where('id', '!=', $digitalStore->id)
            ->orderBy('id')
            ->get();

        $this->table(['Model', 'Count', 'Owner', 'Store IDs'], [
            ['dropship', $dropshipStores->count(), "#{$owner->id} {$owner->email}", $dropshipStores->pluck('id')->join(', ')],
            ['digital', 1, "#{$digitalStore->store_seller_id}", (string) $digitalStore->id],
        ]);

        if (! $this->option('apply')) {
            $this->warn('DRY-RUN: no ownership or fulfillment data changed.');
            return self::SUCCESS;
        }

        $affectedIds = $dropshipStores->pluck('id')->push($digitalStore->id)->values();
        DB::transaction(function () use ($dropshipStores, $digitalStore, $owner): void {
            Store::query()->whereIn('id', $dropshipStores->pluck('id'))->update([
                'store_seller_id' => $owner->id,
                'fulfillment_model' => 'dropship',
                'sales_suspended_at' => null,
                'sales_suspension_reason' => null,
            ]);
            Store::query()->whereKey($digitalStore->id)->update([
                'fulfillment_model' => 'digital',
                'sales_suspended_at' => null,
                'sales_suspension_reason' => null,
            ]);

            // Preserve the audit trail but close warnings produced by the old,
            // independent-physical-seller assumption.
            UniversalNotification::query()
                ->where(function ($query) {
                    $query->where('data', 'like', '%store_readiness_warning%')
                        ->orWhere('data', 'like', '%store_readiness_missing_seller%');
                })
                ->update(['status' => 'read']);
        });

        Store::query()->whereIn('id', $affectedIds)->get()
            ->each(fn (Store $store) => $readiness->refreshStore($store, true));
        Cache::forever('public-catalog:version', (string) hrtime(true));

        $this->info('Store ownership and fulfillment models classified successfully.');
        return self::SUCCESS;
    }
}
