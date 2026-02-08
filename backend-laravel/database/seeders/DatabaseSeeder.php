<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * DatabaseSeeder
 *
 * ⚠️ WARNING: This seeder includes UNSAFE seeders that DELETE data!
 *
 * Use this ONLY for:
 * 1. Local development (fresh database)
 * 2. Initial production setup (first time only)
 *
 * For production updates, use instead:
 * - ProductionSeeder (safe, idempotent)
 * - InitialSetupSeeder (dangerous, only once)
 *
 * @see ProductionSeeder For safe production deployments
 * @see InitialSetupSeeder For initial setup with data deletion
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * ⚠️ WARNING: Contains UNSAFE seeders that delete existing data!
     */
    public function run(): void
    {
        $this->command->warn('⚠️  WARNING: This seeder will DELETE existing data!');
        $this->command->warn('⚠️  Use ProductionSeeder for production deployments instead.');

        // ── SYSTEM SEEDERS (Required) ──────────────────────────────
        $this->call(UserSeeder::class);

        // role & permission
        $this->call(RolesSeeder::class);
        $this->call(ModelHasRolesSeeder::class);
        $this->call(PermissionAdminSeeder::class);
        $this->call(PermissionStoreSeeder::class);
        $this->call(PermissionDeliverymanSeeder::class);

        // system commission
        $this->call(SystemCommissionSeeder::class);
        $this->call(MenuSeeder::class);
        $this->call(ProductCategorySeedSeeder::class);

        $this->call(StoreTypeSeeder::class);
        $this->call(VehicleTypeSeeder::class);
        $this->call(StoreAreaSeeder::class);

        // currencies
        $this->call(CurrencySeeder::class);

        // ── SAFE SEEDERS (updateOrCreate - Idempotent) ─────────────
        $this->call(PageSeeder::class);
        $this->call(GeneralSettingsSeeder::class);
        $this->call(ThemeSeeder::class);
        $this->call(SeoSettingsSeeder::class);
        $this->call(GdprCookieSettingsSeeder::class);
        $this->call(FooterSettingsSeeder::class);
        $this->call(PaymentGatewaySeeder::class);
        $this->call(UnitSeeder::class);
        $this->call(LocationSeeder::class);

        // ── CONTENT SEEDERS (⚠️ UNSAFE - DELETE existing data!) ────
        // CRITICAL: These seeders use delete()/truncate()!
        // Only run on initial setup or local development!
        $this->call(EmailTemplateSeeder::class);
        $this->call(TagSeeder::class);
        $this->call(DepartmentSeeder::class);
        $this->call(ProductAttributeSeeder::class);
        $this->call(SliderSeeder::class);
        $this->call(BannerSeeder::class);
        $this->call(BrandSeeder::class);
        $this->call(ProductSeeder::class);
        $this->call(StoreSeeder::class);
        $this->call(CouponSeeder::class);
        $this->call(FlashSaleSeeder::class);
        $this->call(FlashSaleProductSeeder::class);
        $this->call(BlogCategorySeeder::class);
        $this->call(BlogSeeder::class);

        // ── ADDITIONAL SEEDERS ──────────────────────────────────────
        $this->call(CustomerSeeder::class);
        $this->call(DynamicFieldSeeder::class);
        $this->call(ProductAuthorSeeder::class);
        $this->call(ProductBrandSeeder::class);
        $this->call(ProductCategorySeeder::class);
        $this->call(ReviewSeeder::class);
        $this->call(SettingOptionsSeeder::class);
        $this->call(StoreAreaSettingRangeChargeSeeder::class);
        $this->call(StoreAreaSettingsSeeder::class);
        $this->call(StoreAreaSettingStoreTypeSeeder::class);
        $this->call(StoreSellerSeeder::class);
        $this->call(SubscriptionPackageSeeder::class);
        $this->call(WalletSeeder::class);
    }
}

