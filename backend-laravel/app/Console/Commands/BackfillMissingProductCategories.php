<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\SourceCategoryMapper;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class BackfillMissingProductCategories extends Command
{
    protected $signature = 'products:backfill-missing-categories
        {--source= : Limit to one source name}
        {--apply : Write category IDs after creating a recovery backup}';

    protected $description = 'Assign category-less sourced products using the mandatory source category policy';

    public function handle(SourceCategoryMapper $mapper): int
    {
        $rows = DB::table('products as p')
            ->join('product_source_mappings as psm', 'psm.product_id', '=', 'p.id')
            ->whereNull('p.deleted_at')
            ->whereNull('p.category_id')
            ->when($this->option('source'), fn ($query) => $query->where('psm.source_name', (string) $this->option('source')))
            ->select('p.id', 'p.name', 'psm.source_name')
            ->orderBy('p.id')
            ->get()
            ->unique('id')
            ->values();

        $assignments = [];
        $failures = [];
        foreach ($rows as $row) {
            try {
                $resolved = $mapper->resolve((string) $row->source_name, null);
                $assignments[] = [
                    'product_id' => (int) $row->id,
                    'source_name' => (string) $row->source_name,
                    'category_id' => (int) $resolved['category_id'],
                    'category_name' => (string) $resolved['category_name'],
                ];
            } catch (\Throwable $exception) {
                $failures[] = [(int) $row->id, (string) $row->source_name, $exception->getMessage()];
            }
        }

        $summary = collect($assignments)
            ->groupBy(fn (array $item) => $item['source_name'] . '|' . $item['category_id'])
            ->map(function ($items) {
                $first = $items->first();
                return [$first['source_name'], $first['category_id'], $first['category_name'], $items->count()];
            })
            ->values()
            ->all();
        $this->table(['Source', 'Category ID', 'Category', 'Products'], $summary);
        $this->info(sprintf(
            'Candidates: %d; resolvable: %d; failures: %d; mode: %s',
            $rows->count(),
            count($assignments),
            count($failures),
            $this->option('apply') ? 'APPLY' : 'DRY-RUN'
        ));

        if ($failures !== []) {
            $this->table(['Product', 'Source', 'Error'], array_slice($failures, 0, 20));
            $this->error('No changes written because at least one source policy could not be resolved.');
            return self::FAILURE;
        }

        if (! $this->option('apply') || $assignments === []) {
            $this->comment('No database rows changed. Add --apply after reviewing the source/category summary.');
            return self::SUCCESS;
        }

        $directory = storage_path('app/category-taxonomy-backups');
        File::ensureDirectoryExists($directory);
        $backupPath = $directory . '/missing-product-categories-' . now()->format('Ymd-His') . '.json';
        File::put($backupPath, json_encode([
            'created_at' => now()->toIso8601String(),
            'reason' => 'source_category_policy_backfill',
            'products' => $assignments,
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        DB::transaction(function () use ($assignments): void {
            foreach (array_chunk($assignments, 500) as $chunk) {
                foreach (collect($chunk)->groupBy('category_id') as $categoryId => $items) {
                    Product::withoutGlobalScopes()
                        ->whereNull('category_id')
                        ->whereIn('id', $items->pluck('product_id'))
                        ->update(['category_id' => (int) $categoryId]);
                }
            }
        });

        Cache::forget('public_product_category_list');
        Cache::forever('public-catalog:version', (string) hrtime(true));
        $this->info('Applied ' . count($assignments) . " category assignments. Backup: {$backupPath}");

        return self::SUCCESS;
    }
}
