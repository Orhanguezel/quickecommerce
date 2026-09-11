<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductSlugRedirect;
use App\Services\ProductSeoQuality;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Scans the products table for rows whose `slug` has no semantic overlap
 * with `name` — a leftover of earlier imports that cross-wired data.
 *
 * Detection uses ProductSeoQuality, the same tokenizer/rule as import and SEO
 * audit. This prevents short but unrelated source labels ("p", "category",
 * "300") from escaping the repair command.
 *
 * Fix: regenerate slug from name with Str::slug, append -2/-3/... if a
 * collision exists. The old slug is preserved in product_slug_redirects so
 * existing links and Googlebot receive a permanent canonical redirect.
 *
 * Always run with --dry-run first.
 */
class FixProductSlugMismatches extends Command
{
    protected $signature = 'products:fix-slug-mismatches
                            {--dry-run : Show planned changes without writing}
                            {--limit=0 : Max products to fix (0 = no limit)}';

    protected $description = 'Detect products whose slug has no overlap with their name and regenerate the slug from the name';

    public function handle(ProductSeoQuality $quality): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $limit = (int) $this->option('limit');

        $this->info('Scanning products table for slug/name mismatches...');

        $mismatches = [];
        Product::withoutGlobalScopes()
            ->whereNull('deleted_at')
            ->where('status', 'approved')
            ->select('id', 'name', 'slug')
            ->chunk(500, function ($chunk) use (&$mismatches, $quality) {
                foreach ($chunk as $p) {
                    $name = trim((string) $p->name);
                    $slug = trim((string) $p->slug);
                    if ($name !== '' && $slug !== '' && ! $quality->slugMatchesName($name, $slug)) {
                        $mismatches[] = $p;
                    }
                }
            });

        if (empty($mismatches)) {
            $this->info('No mismatches found. DB is consistent.');
            return self::SUCCESS;
        }

        $this->warn(count($mismatches) . ' products have name/slug mismatches.');
        $this->newLine();

        $taken = Product::withTrashed()->pluck('slug')->all();
        try {
            $taken = array_merge($taken, ProductSlugRedirect::pluck('old_slug')->all());
        } catch (\Illuminate\Database\QueryException) {
            $this->error('product_slug_redirects tablosu bulunamadı. Önce migration çalıştırılmalı; slug değişikliği yapılmadı.');
            return self::FAILURE;
        }
        $takenSet = array_flip(array_filter($taken));

        $rows = [];
        $planned = [];
        $count = 0;

        foreach ($mismatches as $p) {
            if ($limit > 0 && $count >= $limit) break;

            $newSlug = $this->uniqueSlug((string) $p->name, $takenSet, (int) $p->id);
            if ($newSlug === $p->slug) continue;

            $planned[] = ['id' => $p->id, 'old' => $p->slug, 'new' => $newSlug, 'name' => $p->name];
            $rows[] = [
                $p->id,
                mb_substr($p->name, 0, 40),
                mb_substr((string) $p->slug, 0, 40),
                mb_substr($newSlug, 0, 40),
            ];
            $takenSet[$newSlug] = true;
            $count++;
        }

        if (empty($planned)) {
            $this->info('All mismatches would regenerate the same slug. Nothing to do.');
            return self::SUCCESS;
        }

        $this->table(['ID', 'Name', 'Old slug', 'New slug'], $rows);
        $this->newLine();

        if ($dryRun) {
            $this->comment('--dry-run: no database writes performed.');
            return self::SUCCESS;
        }

        $this->info('Applying ' . count($planned) . ' slug updates...');
        $bar = $this->output->createProgressBar(count($planned));
        $bar->start();

        foreach ($planned as $p) {
            DB::transaction(function () use ($p) {
                ProductSlugRedirect::updateOrCreate(
                    ['old_slug' => $p['old']],
                    ['product_id' => $p['id']]
                );
                Product::withTrashed()->where('id', $p['id'])->update(['slug' => $p['new']]);
            });
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info('Done.');
        return self::SUCCESS;
    }

    /**
     * Generate a unique slug derived from $name. Appends -2/-3/... until free.
     * The product's own current slug is fine to reuse (but we wouldn't call
     * this for that case since the mismatch check rejected it first).
     */
    private function uniqueSlug(string $name, array &$takenSet, int $ownId): string
    {
        $base = Str::slug($name);
        if ($base === '') $base = 'product-' . $ownId;

        $candidate = $base;
        $i = 2;
        while (isset($takenSet[$candidate])) {
            $candidate = $base . '-' . $i;
            $i++;
            if ($i > 999) break;
        }
        return $candidate;
    }
}
