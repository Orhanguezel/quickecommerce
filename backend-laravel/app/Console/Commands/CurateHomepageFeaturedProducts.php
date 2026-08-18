<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CurateHomepageFeaturedProducts extends Command
{
    protected $signature = 'commerce:curate-homepage-featured
        {product_ids* : Ordered product IDs; first ID is rank 1}
        {--apply : Persist the curated homepage showcase}';

    protected $description = 'Validate and rank the products that represent the Sportoonline homepage showcase';

    public function handle(): int
    {
        $ids = collect($this->argument('product_ids'))
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values();

        if ($ids->count() < 6 || $ids->count() > 20) {
            $this->error('Homepage showcase must contain between 6 and 20 unique products.');
            return self::FAILURE;
        }

        $products = Product::query()
            ->withoutGlobalScopes()
            ->with(['store', 'variants', 'sourceMappings'])
            ->whereIn('id', $ids)
            ->get()
            ->keyBy('id');

        $invalid = $ids->mapWithKeys(function (int $id) use ($products) {
            $product = $products->get($id);
            return $product ? [$id => $this->validationErrors($product)] : [$id => ['product_not_found']];
        })->filter(fn (array $errors) => $errors !== []);

        if ($invalid->isNotEmpty()) {
            $this->table(['Product', 'Blocking reasons'], $invalid->map(
                fn (array $errors, int $id) => [$id, implode(', ', $errors)]
            )->values()->all());
            return self::FAILURE;
        }

        $this->table(
            ['Rank', 'ID', 'Product', 'Store'],
            $ids->map(fn (int $id, int $index) => [
                $index + 1,
                $id,
                $products->get($id)->name,
                $products->get($id)->store?->name,
            ])->all()
        );

        if (! $this->option('apply')) {
            $this->warn('DRY-RUN: use --apply to publish this showcase.');
            return self::SUCCESS;
        }

        DB::transaction(function () use ($ids) {
            Product::query()->withoutGlobalScopes()->whereNotNull('homepage_featured_rank')
                ->update(['homepage_featured_rank' => null]);

            foreach ($ids as $index => $id) {
                Product::query()->withoutGlobalScopes()->whereKey($id)->update([
                    'is_featured' => true,
                    'homepage_featured_rank' => $index + 1,
                ]);
            }
        });

        Cache::forever('public-catalog:version', (string) hrtime(true));
        $this->info("Published {$ids->count()} curated homepage products.");

        return self::SUCCESS;
    }

    private function validationErrors(Product $product): array
    {
        $errors = [];
        $descriptionLength = mb_strlen(trim(strip_tags((string) $product->description)));
        $hasSellableVariant = $product->variants->contains(
            fn ($variant) => $variant->isPubliclySellable()
        );
        $latestSourceSync = $product->sourceMappings
            ->pluck('last_sync_at')
            ->filter()
            ->max();

        if ($product->trashed()) $errors[] = 'product_deleted';
        if ($product->status !== 'approved') $errors[] = 'product_not_approved';
        if (! $product->store || ! $product->store->status) $errors[] = 'store_inactive';
        if ($product->store?->sales_suspended_at) $errors[] = 'store_suspended';
        if (! $hasSellableVariant) $errors[] = 'out_of_stock_or_invalid_price';
        if (! filled($product->image)) $errors[] = 'image_missing';
        if (str_starts_with((string) $product->image, 'http')) $errors[] = 'remote_image_not_allowed';
        if ($descriptionLength < 180) $errors[] = 'description_too_short';
        if ($product->sourceMappings->isNotEmpty() && (! $latestSourceSync || $latestSourceSync->lt(now()->subHours(36)))) {
            $errors[] = 'source_stock_is_stale';
        }

        return $errors;
    }
}
