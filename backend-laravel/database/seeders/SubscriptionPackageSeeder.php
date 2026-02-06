<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Modules\Subscription\app\Models\Subscription;

class SubscriptionPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('subscriptions')) {
            $this->command->warn('SubscriptionPackageSeeder: subscriptions table does not exist. Skipping...');
            return;
        }

        $packages = [
            [
                "name_tr" => "Deneme Paketi",
                "name_en" => "Trial Package",
                "type" => 'Weekly',
                "validity" => 30,
                "price" => 0,
                "pos_system" => false,
                "self_delivery" => false,
                "mobile_app" => false,
                "live_chat" => false,
                "order_limit" => 10,
                "product_limit" => 10,
                "product_featured_limit" => 2
            ],
            [
                "name_tr" => "Temel Paket",
                "name_en" => "Basic Package",
                "type" => 'Monthly',
                "validity" => 30,
                "price" => 30,
                "pos_system" => true,
                "self_delivery" => false,
                "mobile_app" => false,
                "live_chat" => false,
                "order_limit" => 50,
                "product_limit" => 50,
                "product_featured_limit" => 5
            ],
            [
                "name_tr" => "Standart Paket",
                "name_en" => "Standard Package",
                "type" => 'Half-Yearly',
                "validity" => 180,
                "price" => 100,
                "pos_system" => true,
                "self_delivery" => true,
                "mobile_app" => false,
                "live_chat" => true,
                "order_limit" => 100,
                "product_limit" => 150,
                "product_featured_limit" => 10
            ],
            [
                "name_tr" => "Premium Paket",
                "name_en" => "Premium Package",
                "type" => 'Yearly',
                "validity" => 365,
                "price" => 200,
                "pos_system" => true,
                "self_delivery" => true,
                "mobile_app" => true,
                "live_chat" => true,
                "order_limit" => 500,
                "product_limit" => 200,
                "product_featured_limit" => 15
            ],
            [
                "name_tr" => "Kurumsal Paket",
                "name_en" => "Enterprise Package",
                "type" => 'Extended',
                "validity" => 1095,
                "price" => 500,
                "pos_system" => true,
                "self_delivery" => true,
                "mobile_app" => true,
                "live_chat" => true,
                "order_limit" => 1000,
                "product_limit" => 500,
                "product_featured_limit" => 25
            ]
        ];

        foreach ($packages as $package) {
            $nameTr = $package['name_tr'];
            $nameEn = $package['name_en'];
            unset($package['name_tr'], $package['name_en']);

            $subscription = Subscription::updateOrCreate(
                ['name' => $nameTr],
                array_merge($package, ['name' => $nameTr])
            );

            // Add translations if table exists
            if (Schema::hasTable('translations')) {
                $this->addTranslation($subscription->id, 'Modules\\Subscription\\app\\Models\\Subscription', 'df', 'name', $nameTr);
                $this->addTranslation($subscription->id, 'Modules\\Subscription\\app\\Models\\Subscription', 'tr', 'name', $nameTr);
                $this->addTranslation($subscription->id, 'Modules\\Subscription\\app\\Models\\Subscription', 'en', 'name', $nameEn);
            }
        }

        $this->command->info('SubscriptionPackageSeeder: 5 packages seeded with TR/EN translations.');
    }

    private function addTranslation($id, $type, $lang, $key, $value): void
    {
        DB::table('translations')->updateOrInsert(
            [
                'translatable_id' => $id,
                'translatable_type' => $type,
                'language' => $lang,
                'key' => $key,
            ],
            [
                'value' => $value,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}
