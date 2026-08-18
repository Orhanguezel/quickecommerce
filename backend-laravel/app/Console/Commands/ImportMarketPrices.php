<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\CommerceReadinessService;
use Illuminate\Console\Command;

class ImportMarketPrices extends Command
{
    protected $signature = 'commerce:import-market-prices {file} {--apply}';
    protected $description = 'Import product_id or slug based market minimum prices from CSV';

    public function handle(CommerceReadinessService $service): int
    {
        $path = (string) $this->argument('file');
        if (! is_file($path) || ! is_readable($path)) {
            $this->error("CSV okunamıyor: {$path}");
            return self::FAILURE;
        }

        $handle = fopen($path, 'rb');
        $headers = fgetcsv($handle) ?: [];
        $headers = array_map(fn ($value) => trim(mb_strtolower((string) $value)), $headers);
        if (! in_array('market_min_price', $headers, true)
            || (! in_array('product_id', $headers, true) && ! in_array('slug', $headers, true))) {
            fclose($handle);
            $this->error('CSV kolonları: product_id veya slug; ayrıca market_min_price zorunlu.');
            return self::FAILURE;
        }

        $updated = 0;
        $skipped = 0;
        while (($values = fgetcsv($handle)) !== false) {
            $row = array_combine($headers, array_pad($values, count($headers), null));
            $price = filter_var($row['market_min_price'] ?? null, FILTER_VALIDATE_FLOAT);
            $product = filled($row['product_id'] ?? null)
                ? Product::query()->withoutGlobalScopes()->find((int) $row['product_id'])
                : Product::query()->withoutGlobalScopes()->where('slug', $row['slug'] ?? '')->first();

            if (! $product || $price === false || $price <= 0) {
                $skipped++;
                continue;
            }
            if ($this->option('apply')) {
                $product->forceFill([
                    'market_min_price' => $price,
                    'market_price_checked_at' => now(),
                ])->save();
                $service->refreshProduct($product->fresh(['variants', 'store']));
            }
            $updated++;
        }
        fclose($handle);

        $mode = $this->option('apply') ? 'APPLIED' : 'DRY-RUN';
        $this->info("{$mode}: {$updated} geçerli, {$skipped} atlanan satır.");
        return self::SUCCESS;
    }
}
