<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * InitialSetupSeeder
 *
 * ⚠️ DANGER: This seeder DELETES data!
 *
 * Only run ONCE during initial setup or when resetting database.
 * DO NOT run on production after initial deployment!
 *
 * Contains all UNSAFE seeders that use delete()/truncate():
 * - MenuSeeder
 * - StoreSeeder
 * - ProductSeeder
 * - BannerSeeder
 * - SliderSeeder
 * - BlogSeeder
 * - FlashSaleSeeder
 *
 * Usage:
 *   Local: php artisan db:seed --class=InitialSetupSeeder
 *   Prod (first time only): php artisan db:seed --class=InitialSetupSeeder --force
 */
class InitialSetupSeeder extends Seeder
{
    /**
     * Run the initial setup seeders.
     *
     * WARNING: This will DELETE existing data!
     */
    public function run(): void
    {
        $this->command->warn('⚠️  WARNING: This seeder will DELETE existing data!');
        $this->command->warn('⚠️  Only run this on initial setup or fresh database.');

        if ($this->command->confirm('Are you sure you want to continue?', false)) {
            // Content Seeders (DELETE existing data!)
            $this->command->info('🔄 Running content seeders (will delete existing data)...');

            $this->call(SliderSeeder::class);
            $this->call(BannerSeeder::class);
            $this->call(BrandSeeder::class);
            $this->call(ProductSeeder::class);
            $this->call(StoreSeeder::class);
            $this->call(FlashSaleSeeder::class);
            $this->call(FlashSaleProductSeeder::class);
            $this->call(BlogCategorySeeder::class);
            $this->call(BlogSeeder::class);

            $this->command->info('✅ Initial setup completed!');
            $this->command->warn('⚠️  Do NOT run this seeder again on production!');
        } else {
            $this->command->info('❌ Seeder cancelled.');
        }
    }
}
