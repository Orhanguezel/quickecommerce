<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductSourceMapping;
use App\Models\ProductVariant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SyncSourceVariants extends Command
{
    protected $signature = 'source:sync-variants
                            {source : product_source_mappings source_name}
                            {json_file : Canonical scraper JSON}
                            {--name-contains= : Restrict products by case-insensitive name fragment}
                            {--apply : Persist changes; default is dry-run}';

    protected $description = 'Safely align existing sourced products with structural variants from scraper JSON';

    public function handle(): int
    {
        $source = Str::lower(trim((string) $this->argument('source')));
        $path = (string) $this->argument('json_file');
        $apply = (bool) $this->option('apply');
        $nameFilter = Str::lower(trim((string) $this->option('name-contains')));

        if (! is_file($path)) {
            $this->error("JSON bulunamadı: {$path}");
            return self::FAILURE;
        }
        $rows = json_decode((string) file_get_contents($path), true);
        if (! is_array($rows)) {
            $this->error('JSON ürün listesi geçersiz.');
            return self::FAILURE;
        }

        $bySlug = [];
        foreach ($rows as $row) {
            if (! is_array($row) || empty($row['slug'])) {
                continue;
            }
            if ($nameFilter !== '' && ! str_contains(Str::lower((string) ($row['name'] ?? '')), $nameFilter)) {
                continue;
            }
            $variants = $row['variants'] ?? [];
            if (! is_array($variants) || count($variants) === 0) {
                continue;
            }
            $bySlug[(string) $row['slug']] = $row;
        }

        $productIds = ProductSourceMapping::query()
            ->where('source_name', $source)
            ->whereIn('source_product_slug', array_keys($bySlug))
            ->pluck('product_id')
            ->unique()
            ->values();

        $stats = ['products' => 0, 'create' => 0, 'update' => 0, 'disable' => 0, 'unchanged' => 0, 'errors' => 0];
        foreach (Product::withoutGlobalScopes()->whereIn('id', $productIds)->orderBy('id')->get() as $product) {
            $mapping = ProductSourceMapping::where('source_name', $source)
                ->where('product_id', $product->id)
                ->first();
            $incomingProduct = $mapping ? ($bySlug[$mapping->source_product_slug] ?? null) : null;
            if (! $incomingProduct) {
                continue;
            }

            try {
                $plan = $this->plan($product, $source, $incomingProduct);
                $stats['products']++;
                foreach (['create', 'update', 'disable', 'unchanged'] as $key) {
                    $stats[$key] += count($plan[$key]);
                }
                $this->line(sprintf(
                    '#%d %s: create=%d update=%d disable=%d unchanged=%d',
                    $product->id,
                    $product->name,
                    count($plan['create']),
                    count($plan['update']),
                    count($plan['disable']),
                    count($plan['unchanged'])
                ));
                if ($apply) {
                    DB::transaction(fn () => $this->applyPlan($product, $source, $incomingProduct, $plan));
                }
            } catch (\Throwable $e) {
                $stats['errors']++;
                $this->error("#{$product->id} {$product->name}: {$e->getMessage()}");
            }
        }

        $this->table(['mode', 'products', 'create', 'update', 'disable', 'unchanged', 'errors'], [[
            $apply ? 'APPLY' : 'DRY-RUN',
            $stats['products'], $stats['create'], $stats['update'], $stats['disable'], $stats['unchanged'], $stats['errors'],
        ]]);

        return $stats['errors'] === 0 ? self::SUCCESS : self::FAILURE;
    }

    /** @return array{create: array, update: array, disable: array, unchanged: array} */
    private function plan(Product $product, string $source, array $incomingProduct): array
    {
        $existingVariants = ProductVariant::withoutGlobalScopes()
            ->where('product_id', $product->id)
            ->get()
            ->keyBy(fn (ProductVariant $variant) => Str::lower((string) $variant->sku));
        $sourceMappings = ProductSourceMapping::where('source_name', $source)
            ->where('product_id', $product->id)
            ->get();
        $mappingBySourceId = $sourceMappings
            ->filter(fn ($mapping) => filled($mapping->source_variant_id))
            ->keyBy(fn ($mapping) => (string) $mapping->source_variant_id);

        $matchedVariantIds = [];
        $plan = ['create' => [], 'update' => [], 'disable' => [], 'unchanged' => []];
        foreach ($incomingProduct['variants'] as $incoming) {
            $sourceId = trim((string) ($incoming['source_variant_id'] ?? ''));
            $sku = trim((string) ($incoming['sku'] ?? ''));
            if ($sku === '') {
                throw new \RuntimeException('Kaynak varyant SKU boş.');
            }
            $mapped = $sourceId !== '' ? $mappingBySourceId->get($sourceId) : null;
            $variant = $mapped ? $existingVariants->firstWhere('id', $mapped->product_variant_id) : null;
            $variant ??= $existingVariants->get(Str::lower($sku));
            $payload = $this->variantPayload($incomingProduct, $incoming);
            if ($variant) {
                $matchedVariantIds[] = $variant->id;
                $item = ['variant' => $variant, 'incoming' => $incoming, 'payload' => $payload];
                $sourceMapping = $sourceMappings->firstWhere('product_variant_id', $variant->id);
                if ($this->variantNeedsUpdate($variant, $payload)
                    || $this->mappingNeedsUpdate($sourceMapping, $source, $product, $incomingProduct, $incoming)) {
                    $plan['update'][] = $item;
                } else {
                    $plan['unchanged'][] = $item;
                }
            } else {
                $foreign = ProductVariant::withoutGlobalScopes()->where('sku', $sku)->where('product_id', '!=', $product->id)->exists();
                if ($foreign) {
                    throw new \RuntimeException("SKU başka üründe kullanılıyor: {$sku}");
                }
                $plan['create'][] = ['incoming' => $incoming, 'payload' => $payload];
            }
        }

        $plan['disable'] = $existingVariants
            ->reject(fn ($variant) => in_array($variant->id, $matchedVariantIds, true))
            ->filter(fn ($variant) => (int) $variant->status !== 0
                || (int) $variant->stock_quantity !== 0
                || $sourceMappings->contains('product_variant_id', $variant->id))
            ->values()
            ->all();
        return $plan;
    }

    private function variantNeedsUpdate(ProductVariant $variant, array $payload): bool
    {
        foreach (['variant_slug', 'sku'] as $key) {
            if ((string) ($variant->{$key} ?? '') !== (string) ($payload[$key] ?? '')) {
                return true;
            }
        }
        $currentAttributes = json_decode((string) ($variant->attributes ?? ''), true);
        $expectedAttributes = json_decode((string) ($payload['attributes'] ?? ''), true);
        if (($currentAttributes ?: null) !== ($expectedAttributes ?: null)) {
            return true;
        }
        foreach (['price', 'special_price'] as $key) {
            if (round((float) ($variant->{$key} ?? 0), 2) !== round((float) ($payload[$key] ?? 0), 2)) {
                return true;
            }
        }
        foreach (['stock_quantity', 'status'] as $key) {
            if ((int) ($variant->{$key} ?? 0) !== (int) ($payload[$key] ?? 0)) {
                return true;
            }
        }
        return false;
    }

    private function mappingNeedsUpdate(
        ?ProductSourceMapping $mapping,
        string $source,
        Product $product,
        array $incomingProduct,
        array $incoming
    ): bool {
        if (! $mapping) {
            return true;
        }
        $expected = [
            'source_name' => $source,
            'store_id' => $product->store_id,
            'product_id' => $product->id,
            'source_product_url' => $incomingProduct['url'] ?? null,
            'source_product_id' => $incomingProduct['source_product_id'] ?? null,
            'source_product_slug' => $incomingProduct['slug'],
            'source_variant_id' => $incoming['source_variant_id'] ?? null,
            'source_variant_sku' => $incoming['sku'],
            'source_variant_barcode' => $incoming['barcode'] ?? null,
            'source_variant_title' => $incoming['title'] ?? null,
        ];
        foreach ($expected as $key => $value) {
            if ((string) ($mapping->{$key} ?? '') !== (string) ($value ?? '')) {
                return true;
            }
        }
        return false;
    }

    private function variantPayload(array $product, array $variant): array
    {
        $price = (float) ($variant['price'] ?? 0);
        $compare = (float) ($variant['compare_at_price'] ?? 0);
        if ($price <= 0) {
            throw new \RuntimeException('Varyant fiyatı geçersiz.');
        }
        $attributes = [];
        foreach (array_values((array) ($product['options'] ?? [])) as $index => $option) {
            $value = trim((string) ($variant['option' . ($index + 1)] ?? ''));
            $name = trim((string) ($option['name'] ?? ''));
            if ($name !== '' && $value !== '') {
                $attributes[$name] = $value;
            }
        }
        return [
            'variant_slug' => (string) ($variant['title'] ?? $variant['sku']),
            'sku' => (string) $variant['sku'],
            'price' => $compare > $price ? $compare : $price,
            'special_price' => $compare > $price ? $price : null,
            'stock_quantity' => max(0, (int) ($variant['stock_quantity'] ?? 0)),
            'attributes' => $attributes !== [] ? json_encode($attributes, JSON_UNESCAPED_UNICODE) : null,
            'status' => 1,
        ];
    }

    private function applyPlan(Product $product, string $source, array $incomingProduct, array $plan): void
    {
        foreach ($plan['disable'] as $variant) {
            $variant->update(['stock_quantity' => 0, 'status' => 0]);
            ProductSourceMapping::where('source_name', $source)
                ->where('product_variant_id', $variant->id)
                ->delete();
        }
        foreach (array_merge($plan['update'], $plan['create']) as $item) {
            $variant = $item['variant'] ?? ProductVariant::create([
                'product_id' => $product->id,
                'image' => $product->image,
            ] + $item['payload']);
            if (isset($item['variant'])) {
                $variant->update($item['payload']);
            }
            $incoming = $item['incoming'];
            ProductSourceMapping::updateOrCreate(
                ['product_variant_id' => $variant->id],
                [
                    'source_name' => $source,
                    'store_id' => $product->store_id,
                    'product_id' => $product->id,
                    'source_product_url' => $incomingProduct['url'] ?? null,
                    'source_product_id' => $incomingProduct['source_product_id'] ?? null,
                    'source_product_slug' => $incomingProduct['slug'],
                    'source_variant_id' => $incoming['source_variant_id'] ?? null,
                    'source_variant_sku' => $incoming['sku'],
                    'source_variant_barcode' => $incoming['barcode'] ?? null,
                    'source_variant_title' => $incoming['title'] ?? null,
                    'last_synced_price' => $variant->price,
                    'last_synced_special_price' => $variant->special_price,
                    'last_synced_stock' => $variant->stock_quantity,
                    'last_sync_status' => 'variant_structure_synced',
                    'last_sync_note' => 'Structural source variant sync.',
                    'last_sync_at' => now(),
                ]
            );
        }
    }
}
