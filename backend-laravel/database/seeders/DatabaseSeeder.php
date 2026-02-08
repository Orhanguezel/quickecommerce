<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
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
        // pages
        $this->call(PageSeeder::class);
        // general settings
        $this->call(GeneralSettingsSeeder::class);
        // theme settings
        $this->call(ThemeSeeder::class);
        // seo settings
        $this->call(SeoSettingsSeeder::class);
        // gdpr cookie settings
        $this->call(GdprCookieSettingsSeeder::class);
    }
}
