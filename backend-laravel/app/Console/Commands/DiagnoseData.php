<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DiagnoseData extends Command
{
    protected $signature = 'diagnose:data';
    protected $description = 'Diagnose why seeded data is not appearing in API responses';

    public function handle()
    {
        $this->info('=== DATA DIAGNOSTIC REPORT ===');
        $this->newLine();

        // 1. Products
        $this->info('--- PRODUCTS ---');
        $totalProducts = DB::table('products')->count();
        $approvedProducts = DB::table('products')->where('status', 'approved')->whereNull('deleted_at')->count();
        $deletedProducts = DB::table('products')->whereNotNull('deleted_at')->count();
        $this->line("Total products: {$totalProducts}");
        $this->line("Approved (not deleted): {$approvedProducts}");
        $this->line("Soft-deleted: {$deletedProducts}");

        // Products by status
        $statuses = DB::table('products')->select('status', DB::raw('count(*) as cnt'))->groupBy('status')->get();
        foreach ($statuses as $s) {
            $this->line("  status='{$s->status}': {$s->cnt}");
        }

        // 2. Stores
        $this->newLine();
        $this->info('--- STORES ---');
        $totalStores = DB::table('stores')->count();
        $activeStores = DB::table('stores')->where('status', 1)->whereNull('deleted_at')->count();
        $commissionStores = DB::table('stores')->where('subscription_type', 'commission')->whereNull('deleted_at')->count();
        $deletedStores = DB::table('stores')->whereNotNull('deleted_at')->count();
        $this->line("Total stores: {$totalStores}");
        $this->line("Active (status=1, not deleted): {$activeStores}");
        $this->line("Commission type (not deleted): {$commissionStores}");
        $this->line("Soft-deleted: {$deletedStores}");

        // Store subscription types
        $subTypes = DB::table('stores')->whereNull('deleted_at')
            ->select('subscription_type', DB::raw('count(*) as cnt'))
            ->groupBy('subscription_type')->get();
        foreach ($subTypes as $st) {
            $this->line("  subscription_type='{$st->subscription_type}': {$st->cnt}");
        }

        // 3. Product-Store relationship integrity
        $this->newLine();
        $this->info('--- PRODUCT-STORE INTEGRITY ---');
        $orphanProducts = DB::table('products')
            ->leftJoin('stores', 'products.store_id', '=', 'stores.id')
            ->whereNull('stores.id')
            ->where('products.status', 'approved')
            ->whereNull('products.deleted_at')
            ->count();
        $this->line("Products with missing/invalid store_id: {$orphanProducts}");

        $orphanSoftDeleted = DB::table('products')
            ->join('stores', 'products.store_id', '=', 'stores.id')
            ->whereNotNull('stores.deleted_at')
            ->where('products.status', 'approved')
            ->whereNull('products.deleted_at')
            ->count();
        $this->line("Products whose store is soft-deleted: {$orphanSoftDeleted}");

        $validProducts = DB::table('products')
            ->join('stores', 'products.store_id', '=', 'stores.id')
            ->where('products.status', 'approved')
            ->whereNull('products.deleted_at')
            ->whereNull('stores.deleted_at')
            ->where('stores.subscription_type', 'commission')
            ->count();
        $this->line("Products passing global scope (commission store, not deleted): {$validProducts}");

        // Sample products
        $this->newLine();
        $this->info('--- SAMPLE PRODUCTS (first 5) ---');
        $samples = DB::table('products')
            ->select('products.id', 'products.name', 'products.status', 'products.store_id', 'products.deleted_at',
                'stores.name as store_name', 'stores.subscription_type', 'stores.status as store_status', 'stores.deleted_at as store_deleted_at')
            ->leftJoin('stores', 'products.store_id', '=', 'stores.id')
            ->limit(5)->get();
        foreach ($samples as $p) {
            $this->line("  Product #{$p->id} '{$p->name}' | status={$p->status} | deleted_at={$p->deleted_at} | store_id={$p->store_id} | store='{$p->store_name}' | sub_type={$p->subscription_type} | store_status={$p->store_status} | store_deleted={$p->store_deleted_at}");
        }

        // 4. Product variants
        $this->newLine();
        $this->info('--- PRODUCT VARIANTS ---');
        $totalVariants = DB::table('product_variants')->count();
        $productsWithVariants = DB::table('product_variants')->distinct('product_id')->count('product_id');
        $productsWithoutVariants = $approvedProducts - $productsWithVariants;
        $this->line("Total variants: {$totalVariants}");
        $this->line("Products with variants: {$productsWithVariants}");
        $this->line("Approved products WITHOUT variants: {$productsWithoutVariants}");

        // 5. Categories
        $this->newLine();
        $this->info('--- CATEGORIES ---');
        $totalCats = DB::table('product_category')->count();
        $activeCats = DB::table('product_category')->where('status', 1)->count();
        $parentCats = DB::table('product_category')->where('status', 1)->whereNull('parent_id')->count();
        $this->line("Total: {$totalCats} | Active: {$activeCats} | Active parents: {$parentCats}");

        // 6. Sliders
        $this->newLine();
        $this->info('--- SLIDERS ---');
        $totalSliders = DB::table('sliders')->count();
        $activeWebSliders = DB::table('sliders')->where('status', 1)->where('platform', 'web')->count();
        $this->line("Total: {$totalSliders} | Active web: {$activeWebSliders}");

        // 7. Banners
        $this->newLine();
        $this->info('--- BANNERS ---');
        $totalBanners = DB::table('banners')->count();
        $homePageBanners = DB::table('banners')->where('status', 1)->where('location', 'home_page')->count();
        $this->line("Total: {$totalBanners} | Active home_page: {$homePageBanners}");
        $bannersByTheme = DB::table('banners')->where('status', 1)->where('location', 'home_page')
            ->select('theme_name', DB::raw('count(*) as cnt'))->groupBy('theme_name')->get();
        foreach ($bannersByTheme as $b) {
            $this->line("  theme='{$b->theme_name}': {$b->cnt}");
        }

        // 8. Flash Sales
        $this->newLine();
        $this->info('--- FLASH SALES ---');
        $totalFlash = DB::table('flash_sales')->count();
        $activeFlash = DB::table('flash_sales')->where('status', 1)->count();
        $flashProducts = DB::table('flash_sale_products')->count();
        $this->line("Total flash sales: {$totalFlash} | Active: {$activeFlash}");
        $this->line("Flash sale products (pivot): {$flashProducts}");

        // 9. Store types
        $this->newLine();
        $this->info('--- STORE TYPES ---');
        $storeTypes = DB::table('store_types')->count();
        $this->line("Total store types: {$storeTypes}");

        // 10. Simulate API query
        $this->newLine();
        $this->info('--- SIMULATE PRODUCT API QUERY ---');
        try {
            $apiResult = \App\Models\Product::where('products.status', 'approved')
                ->whereNull('products.deleted_at')
                ->count();
            $this->line("Product::where(status=approved)->whereNull(deleted_at)->count() = {$apiResult}");
        } catch (\Exception $e) {
            $this->error("Query failed: " . $e->getMessage());
        }

        // Without global scope
        try {
            $noScopeResult = \App\Models\Product::withoutGlobalScope('storeOrderLimit')
                ->where('products.status', 'approved')
                ->whereNull('products.deleted_at')
                ->count();
            $this->line("Same WITHOUT global scope = {$noScopeResult}");
        } catch (\Exception $e) {
            $this->error("Query failed: " . $e->getMessage());
        }

        $this->newLine();
        $this->info('=== DIAGNOSIS COMPLETE ===');

        return 0;
    }
}
