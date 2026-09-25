<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\Store;
use App\Services\CommerceReadinessService;
use Illuminate\Console\Command;

class RefreshCommerceReadiness extends Command
{
    protected $signature = 'commerce:refresh-readiness
        {--product_id= : Only one product}
        {--store_id= : Only one store and its products}
        {--apply : Persist calculated values}';

    protected $description = 'Calculate store profile, catalogue quality, price index and ads eligibility';

    public function handle(CommerceReadinessService $service): int
    {
        $apply = (bool) $this->option('apply');
        $storeQuery = Store::query()->when($this->option('store_id'), fn ($q, $id) => $q->whereKey($id));
        $productQuery = Product::query()
            ->withoutGlobalScopes()
            ->when($this->option('product_id'), fn ($q, $id) => $q->whereKey($id))
            ->when($this->option('store_id'), fn ($q, $id) => $q->where('store_id', $id));

        $stores = 0;
        $storeQuery->chunkById(200, function ($rows) use ($service, $apply, &$stores) {
            foreach ($rows as $store) {
                $service->refreshStore($store, $apply);
                $stores++;
            }
        });

        $products = 0;
        $eligible = 0;
        $productQuery->with(['variants', 'store'])->chunkById(200, function ($rows) use ($service, $apply, &$products, &$eligible) {
            foreach ($rows as $product) {
                $result = $service->refreshProduct($product, $apply);
                $products++;
                $eligible += $result['ads_eligible'] ? 1 : 0;
            }
        });

        $mode = $apply ? 'APPLIED' : 'DRY-RUN';
        $this->info("{$mode}: {$stores} store, {$products} product checked; {$eligible} ads eligible.");

        return self::SUCCESS;
    }
}
