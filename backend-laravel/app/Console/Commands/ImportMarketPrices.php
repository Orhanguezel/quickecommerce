<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\MarketPriceService;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

class ImportMarketPrices extends Command
{
    protected $signature = 'commerce:import-market-prices {file} {--apply}';

    protected $description = 'Import source-backed market price observations from CSV and refresh product aggregates';

    public function handle(MarketPriceService $service): int
    {
        $path = (string) $this->argument('file');
        if (! is_file($path) || ! is_readable($path)) {
            $this->error("CSV okunamıyor: {$path}");

            return self::FAILURE;
        }

        $handle = fopen($path, 'rb');
        $headers = fgetcsv($handle) ?: [];
        $headers = array_map(fn ($value) => trim(mb_strtolower((string) $value)), $headers);
        $hasPriceColumn = in_array('market_min_price', $headers, true) || in_array('price', $headers, true);
        $hasProductColumn = in_array('product_id', $headers, true) || in_array('slug', $headers, true);
        if (! $hasPriceColumn || ! $hasProductColumn) {
            fclose($handle);
            $this->error('CSV kolonları: product_id veya slug; ayrıca price veya market_min_price zorunlu.');

            return self::FAILURE;
        }

        $observedAtFallback = CarbonImmutable::createFromTimestamp((int) filemtime($path));
        $valid = 0;
        $skipped = 0;
        $affectedProducts = [];
        $candidateProductIds = [];
        while (($values = fgetcsv($handle)) !== false) {
            $row = array_combine($headers, array_slice(array_pad($values, count($headers), null), 0, count($headers)));
            if ($row === false) {
                $skipped++;

                continue;
            }

            $price = filter_var($row['price'] ?? $row['market_min_price'] ?? null, FILTER_VALIDATE_FLOAT);
            $product = filled($row['product_id'] ?? null)
                ? Product::query()->withoutGlobalScopes()->find((int) $row['product_id'])
                : Product::query()->withoutGlobalScopes()->where('slug', $row['slug'] ?? '')->first();

            if (! $product || $price === false || $price <= 0) {
                $skipped++;

                continue;
            }

            try {
                $observedAt = filled($row['observed_at'] ?? null)
                    ? CarbonImmutable::parse((string) $row['observed_at'])
                    : $observedAtFallback;
            } catch (\Throwable) {
                $skipped++;

                continue;
            }

            $currencyCode = strtoupper(trim((string) ($row['currency_code'] ?? 'TRY')));
            if ($currencyCode !== 'TRY') {
                $skipped++;

                continue;
            }

            $candidateProductIds[$product->getKey()] = true;
            if ($this->option('apply')) {
                $service->recordObservation(
                    product: $product,
                    sourceName: (string) ($row['source_name'] ?? 'manual_csv'),
                    price: (float) $price,
                    observedAt: $observedAt,
                    sourceUrl: $row['source_url'] ?? null,
                    currencyCode: $currencyCode,
                    metadata: ['import_file' => basename($path)],
                );
                $affectedProducts[$product->getKey()] = $product;
            }
            $valid++;
        }
        fclose($handle);

        if ($this->option('apply')) {
            foreach ($affectedProducts as $product) {
                $service->refreshProductAggregate($product);
            }
        }

        $mode = $this->option('apply') ? 'APPLIED' : 'DRY-RUN';
        $productLabel = $this->option('apply') ? 'güncellenen ürün' : 'aday ürün';
        $this->info("{$mode}: {$valid} geçerli gözlem, {$skipped} atlanan satır, ".count($candidateProductIds)." {$productLabel}.");

        return self::SUCCESS;
    }
}
