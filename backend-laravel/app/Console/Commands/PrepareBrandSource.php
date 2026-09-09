<?php

namespace App\Console\Commands;

use App\Models\ProductBrand;
use App\Models\Store;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PrepareBrandSource extends Command
{
    protected $signature = 'catalog:prepare-brand-source {source : heynut or raketspor_yonex} {--apply}';
    protected $description = 'Prepare an inactive HeynuT store or the existing Multiprice destination and brand; dry-run by default.';

    public function handle(): int
    {
        $source = $this->argument('source');
        if (!in_array($source, ['heynut', 'raketspor_yonex'], true)) {
            $this->error('Unsupported source.');
            return self::FAILURE;
        }
        $multiprice = Store::where('slug', 'multiprice')->where('status', 1)->firstOrFail();
        $brandName = $source === 'heynut' ? 'HeynuT' : 'Yonex';
        $brandSlug = strtolower($brandName);
        $store = $source === 'heynut' ? Store::withTrashed()->where('slug', 'heynut')->first() : $multiprice;
        if ($store?->trashed()) {
            $this->error('HeynuT store is deleted; review before restoring.');
            return self::FAILURE;
        }
        if (!$multiprice->store_seller_id) {
            $this->error('Multiprice owner is missing.');
            return self::FAILURE;
        }
        if (!$this->option('apply')) {
            $this->line(json_encode(['source' => $source, 'store_id' => $store?->id,
                'new_store' => !$store, 'brand' => $brandName, 'dry_run' => true], JSON_UNESCAPED_UNICODE));
            return self::SUCCESS;
        }
        [$store, $brand] = DB::transaction(function () use ($store, $multiprice, $brandSlug, $brandName) {
            $store ??= Store::create([
                'name' => 'HeynuT', 'slug' => 'heynut', 'store_seller_id' => $multiprice->store_seller_id,
                'store_type' => $multiprice->store_type, 'fulfillment_model' => 'dropship',
                'subscription_type' => 'commission', 'status' => 0, 'enable_saling' => 0,
                'created_by' => $multiprice->created_by,
            ]);
            $brand = ProductBrand::firstOrCreate(['brand_slug' => $brandSlug], [
                'brand_name' => $brandName, 'status' => 1,
            ]);
            return [$store, $brand];
        });
        $this->line(json_encode(['source' => $source, 'store_id' => $store->id, 'brand_id' => $brand->id,
            'store_status' => $store->status], JSON_UNESCAPED_UNICODE));
        return self::SUCCESS;
    }
}
