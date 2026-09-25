<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class QuarantineMissingImageProducts extends Command
{
    protected $signature = 'commerce:quarantine-missing-images
        {--store_id= : Limit to one store}
        {--apply : Mark approved rows as inactive (dry-run by default)}';

    protected $description = 'Reversibly quarantine approved products without a main image.';

    public function handle(): int
    {
        $query = Product::withoutGlobalScopes()
            ->whereNull('deleted_at')
            ->where('status', 'approved')
            ->where(function ($missing): void {
                $missing->whereNull('image')->orWhere('image', '');
            })
            ->when($this->option('store_id'), fn ($builder) => $builder->where('store_id', (int) $this->option('store_id')));

        $rows = (clone $query)
            ->selectRaw('store_id, COUNT(*) total')
            ->groupBy('store_id')
            ->with('store:id,name')
            ->get()
            ->map(fn ($row) => [
                $row->store_id,
                $row->store?->name ?: '-',
                (int) $row->total,
            ]);

        $this->table(['Store ID', 'Store', 'Missing approved products'], $rows->all());
        $count = (clone $query)->count();
        if (! $this->option('apply')) {
            $this->warn("DRY-RUN: {$count} product(s) would be quarantined. Use --apply.");
            return self::SUCCESS;
        }

        DB::transaction(function () use ($query): void {
            (clone $query)->update([
                'status' => 'inactive',
                'homepage_featured_rank' => null,
                'is_featured' => false,
                'ads_eligible' => false,
                'ads_ineligibility_reason' => 'missing_main_image_quarantine',
                'updated_at' => now(),
            ]);
        });
        Cache::forever('public-catalog:version', (string) hrtime(true));
        $this->info("Quarantined {$count} product(s). Restore only after a valid local image is attached.");

        return self::SUCCESS;
    }
}
