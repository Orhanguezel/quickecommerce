<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StoreSubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (
            !Schema::hasTable('stores') ||
            !Schema::hasTable('subscriptions') ||
            !Schema::hasTable('store_subscriptions') ||
            !Schema::hasTable('subscription_histories')
        ) {
            $this->command->warn('StoreSubscriptionSeeder: required tables do not exist. Skipping...');
            return;
        }

        $stores = DB::table('stores')
            ->whereNull('deleted_at')
            ->where('status', 1)
            ->orderBy('id')
            ->limit(5)
            ->get();

        if ($stores->isEmpty()) {
            $this->command->warn('StoreSubscriptionSeeder: no active stores found. Skipping...');
            return;
        }

        $packages = DB::table('subscriptions')
            ->where('status', 1)
            ->orderBy('id')
            ->get();

        if ($packages->isEmpty()) {
            $this->command->warn('StoreSubscriptionSeeder: no active subscription packages found. Skipping...');
            return;
        }

        $createdSubscriptions = 0;
        $createdHistories = 0;

        foreach ($stores as $index => $store) {
            $package = $packages[$index % $packages->count()];
            $expireDate = now()->addDays((int) ($package->validity ?? 30));

            $storeSub = DB::table('store_subscriptions')
                ->where('store_id', $store->id)
                ->orderByDesc('id')
                ->first();

            if (!$storeSub) {
                $storeSubscriptionId = DB::table('store_subscriptions')->insertGetId([
                    'store_id' => $store->id,
                    'subscription_id' => $package->id,
                    'name' => $package->name,
                    'type' => $package->type,
                    'validity' => (int) $package->validity,
                    'price' => (float) $package->price,
                    'pos_system' => (int) ($package->pos_system ?? 0),
                    'self_delivery' => (int) ($package->self_delivery ?? 0),
                    'mobile_app' => (int) ($package->mobile_app ?? 0),
                    'live_chat' => (int) ($package->live_chat ?? 0),
                    'order_limit' => (int) ($package->order_limit ?? 0),
                    'product_limit' => (int) ($package->product_limit ?? 0),
                    'product_featured_limit' => (int) ($package->product_featured_limit ?? 0),
                    'payment_gateway' => 'cash',
                    'payment_status' => 'paid',
                    'transaction_ref' => 'SEED-SUB-' . $store->id . '-' . now()->timestamp,
                    'manual_image' => null,
                    'expire_date' => $expireDate,
                    'status' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $createdSubscriptions++;

                DB::table('stores')
                    ->where('id', $store->id)
                    ->update([
                        'subscription_type' => 'subscription',
                        'updated_at' => now(),
                    ]);
            } else {
                $storeSubscriptionId = $storeSub->id;
            }

            $historyExists = DB::table('subscription_histories')
                ->where('store_subscription_id', $storeSubscriptionId)
                ->exists();

            if (!$historyExists) {
                DB::table('subscription_histories')->insert([
                    'store_subscription_id' => $storeSubscriptionId,
                    'store_id' => $store->id,
                    'subscription_id' => $package->id,
                    'name' => $package->name,
                    'type' => $package->type,
                    'validity' => (int) $package->validity,
                    'price' => (float) $package->price,
                    'pos_system' => (int) ($package->pos_system ?? 0),
                    'self_delivery' => (int) ($package->self_delivery ?? 0),
                    'mobile_app' => (int) ($package->mobile_app ?? 0),
                    'live_chat' => (int) ($package->live_chat ?? 0),
                    'order_limit' => (int) ($package->order_limit ?? 0),
                    'product_limit' => (int) ($package->product_limit ?? 0),
                    'product_featured_limit' => (int) ($package->product_featured_limit ?? 0),
                    'payment_gateway' => 'cash',
                    'payment_status' => 'paid',
                    'transaction_ref' => 'SEED-HIST-' . $store->id . '-' . now()->timestamp,
                    'manual_image' => null,
                    'expire_date' => $expireDate,
                    'status' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $createdHistories++;
            }
        }

        $this->command->info(
            "StoreSubscriptionSeeder: {$createdSubscriptions} store subscriptions and {$createdHistories} histories ensured."
        );
    }
}
