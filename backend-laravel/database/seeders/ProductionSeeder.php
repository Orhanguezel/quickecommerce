<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * ProductionSeeder
 *
 * ✅ SAFE: This seeder is IDEMPOTENT (can run multiple times safely)
 *
 * Contains only SAFE seeders that use updateOrCreate()/firstOrCreate():
 * - SafeProductAttributeSeeder
 * - ThemeSeeder
 * - GeneralSettingsSeeder
 * - SeoSettingsSeeder
 * - GdprCookieSettingsSeeder
 * - PageSeeder
 *
 * Safe to run on every deployment without data loss.
 *
 * Usage:
 *   Local: php artisan db:seed --class=ProductionSeeder
 *   Prod (every deploy): php artisan db:seed --class=ProductionSeeder --force
 */
class ProductionSeeder extends Seeder
{
    /**
     * Run the production-safe seeders.
     *
     * These seeders use updateOrCreate() and won't delete existing data.
     */
    public function run(): void
    {
        $this->command->info('🔄 Running production-safe seeders...');

        // Product Attributes (SAFE - firstOrCreate)
        $this->call(SafeProductAttributeSeeder::class);

        // Permissions & Roles (SAFE - updateOrCreate + super admin full access)
        $this->call(RolesSeeder::class);
        $this->call(PermissionAdminSeeder::class);
        $this->call(PermissionStoreSeeder::class);

        // System Settings (SAFE - updateOrCreate)
        $this->call(GeneralSettingsSeeder::class);
        $this->call(ThemeSeeder::class);
        $this->call(SeoSettingsSeeder::class);
        $this->call(GdprCookieSettingsSeeder::class);
        $this->call(PageSeeder::class);
        $this->call(FooterSettingsSeeder::class);
        $this->call(PaymentGatewaySeeder::class);
        $this->call(UnitSeeder::class);
        $this->call(LocationSeeder::class);
        $this->call(AiChatSeeder::class);
        $this->call(StoreLoginAccountSeeder::class);
        $this->call(StoreTypeSeeder::class);       // SAFE - updateOrInsert by type
        $this->call(StoreAreaSeeder::class);
        $this->call(StoreAreaSettingsSeeder::class);
        $this->call(StoreAreaSettingStoreTypeSeeder::class);
        $this->call(StoreAreaSettingRangeChargeSeeder::class);
        $this->call(SubscriptionPackageSeeder::class);
        $this->call(StoreSubscriptionSeeder::class);
        $this->call(UniversalNotificationSeeder::class);
        $this->call(OrderRefundReasonSeeder::class);
        $this->call(WithdrawGatewaySeeder::class);

        $this->command->info('✅ Production seeders completed successfully!');
        $this->command->info('ℹ️  Safe to run on every deployment.');
    }
}
