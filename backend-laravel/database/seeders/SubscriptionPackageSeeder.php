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
                "description_tr" => "Ücretsiz deneme paketi",
                "description_en" => "Free trial package",
                "type" => 'Weekly',
                "validity" => 7,
                "price" => 0,
                "pos_system" => false,
                "self_delivery" => false,
                "mobile_app" => false,
                "live_chat" => false,
                "order_limit" => 10,
                "product_limit" => 10,
                "product_featured_limit" => 2,
                "status" => 1
            ],
            [
                "name_tr" => "Temel Paket",
                "name_en" => "Basic Package",
                "description_tr" => "Küçük işletmeler için temel paket",
                "description_en" => "Basic package for small businesses",
                "type" => 'Monthly',
                "validity" => 30,
                "price" => 30,
                "pos_system" => true,
                "self_delivery" => false,
                "mobile_app" => false,
                "live_chat" => false,
                "order_limit" => 50,
                "product_limit" => 50,
                "product_featured_limit" => 5,
                "status" => 1
            ],
            [
                "name_tr" => "Standart Paket",
                "name_en" => "Standard Package",
                "description_tr" => "Orta ölçekli işletmeler için standart paket",
                "description_en" => "Standard package for medium businesses",
                "type" => 'Half-Yearly',
                "validity" => 180,
                "price" => 100,
                "pos_system" => true,
                "self_delivery" => true,
                "mobile_app" => false,
                "live_chat" => true,
                "order_limit" => 100,
                "product_limit" => 150,
                "product_featured_limit" => 10,
                "status" => 1
            ],
            [
                "name_tr" => "Premium Paket",
                "name_en" => "Premium Package",
                "description_tr" => "Büyük işletmeler için premium paket",
                "description_en" => "Premium package for large businesses",
                "type" => 'Yearly',
                "validity" => 365,
                "price" => 200,
                "pos_system" => true,
                "self_delivery" => true,
                "mobile_app" => true,
                "live_chat" => true,
                "order_limit" => 500,
                "product_limit" => 200,
                "product_featured_limit" => 15,
                "status" => 1
            ],
            [
                "name_tr" => "Kurumsal Paket",
                "name_en" => "Enterprise Package",
                "description_tr" => "Kurumsal firmalar için özel paket",
                "description_en" => "Enterprise package for corporate companies",
                "type" => 'Extended',
                "validity" => 1095,
                "price" => 500,
                "pos_system" => true,
                "self_delivery" => true,
                "mobile_app" => true,
                "live_chat" => true,
                "order_limit" => 1000,
                "product_limit" => 500,
                "product_featured_limit" => 25,
                "status" => 1
            ]
        ];

        foreach ($packages as $package) {
            $nameTr = $package['name_tr'];
            $nameEn = $package['name_en'];
            $descTr = $package['description_tr'];
            $descEn = $package['description_en'];
            unset($package['name_tr'], $package['name_en'], $package['description_tr'], $package['description_en']);

            $subscription = Subscription::updateOrCreate(
                ['name' => $nameTr],
                array_merge($package, ['name' => $nameTr, 'description' => $descTr])
            );

            // Add translations (df = Turkish default, en = English)
            if (Schema::hasTable('translations')) {
                $type = 'Modules\\Subscription\\app\\Models\\Subscription';
                // Turkish (df = default)
                $this->addTranslation($subscription->id, $type, 'df', 'name', $nameTr);
                $this->addTranslation($subscription->id, $type, 'df', 'description', $descTr);
                // English
                $this->addTranslation($subscription->id, $type, 'en', 'name', $nameEn);
                $this->addTranslation($subscription->id, $type, 'en', 'description', $descEn);
            }
        }

        $this->command->info('SubscriptionPackageSeeder: 5 packages seeded with TR(df)/EN translations.');
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
