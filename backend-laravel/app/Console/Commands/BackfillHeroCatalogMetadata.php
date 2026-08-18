<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductBrand;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BackfillHeroCatalogMetadata extends Command
{
    protected $signature = 'commerce:backfill-hero-metadata {--apply}';
    protected $description = 'Backfill deterministic hero product brands/meta and remove products below the content gate.';

    /** @var array<string,string> */
    private const BRAND_PREFIXES = [
        'XTR Fitness' => 'XTR Fitness',
        'Bona ' => 'Bona',
        'Avec ' => 'Avec',
        'Boodun ' => 'Boodun',
        'JOINFIT PRO' => 'Joinfit',
        'Newvit ' => 'Newvit',
        'Ligone ' => 'Ligone',
        'Vemax ' => 'Vemax',
        'Kartix ' => 'Kartix',
        'Nutrever ' => 'Nutrever',
        'Olimp ' => 'Olimp',
        'Trec Nutrition ' => 'Trec Nutrition',
        'Trec Multi ' => 'Trec Nutrition',
        'Nutrend ' => 'Nutrend',
        'Animal' => 'Animal',
        'ANIMAL ' => 'Animal',
        'Universal ' => 'Universal Nutrition',
        'Applied ' => 'Applied Nutrition',
        'LEBEPUR ' => 'Lebepur',
        'Z Konsetp ' => 'Z Konsept',
        'Bodyfuel' => 'Bodyfuel',
        'Stanley ' => 'Stanley',
        'Esbit ' => 'Esbit',
        'Esbit yemek' => 'Esbit',
        'CAMPOUT ' => 'Orcamp',
    ];

    public function handle(): int
    {
        $products = Product::withoutGlobalScopes()
            ->whereNull('deleted_at')
            ->where('status', 'approved')
            ->where('is_hero', true)
            ->orderBy('id')
            ->get();

        $stats = [
            'hero_checked' => $products->count(),
            'below_content_gate' => 0,
            'brand_assignments' => 0,
            'new_brands' => 0,
            'meta_titles' => 0,
            'meta_descriptions' => 0,
            'delivery_texts' => 0,
            'return_texts' => 0,
            'brand_unresolved' => 0,
        ];
        $plan = [];
        $brandNames = [];

        foreach ($products as $product) {
            $plain = trim(preg_replace('/\s+/u', ' ', strip_tags(html_entity_decode((string) $product->description))) ?? '');
            $changes = [];
            if (mb_strlen($plain) < 180) {
                $changes['is_hero'] = false;
                $changes['homepage_featured_rank'] = null;
                $changes['ads_eligible'] = false;
                $changes['ads_ineligibility_reason'] = 'hero_content_below_180_chars';
                $stats['below_content_gate']++;
            }

            if (! $product->brand_id) {
                $brand = $this->brandFor((string) $product->name);
                if ($brand) {
                    $brandNames[$brand] = true;
                    $changes['_brand_name'] = $brand;
                    $stats['brand_assignments']++;
                } else {
                    $stats['brand_unresolved']++;
                }
            }
            if (trim((string) $product->meta_title) === '') {
                $changes['meta_title'] = Str::limit(trim((string) $product->name), 60, '');
                $stats['meta_titles']++;
            }
            if (trim((string) $product->meta_description) === '' && $plain !== '') {
                $changes['meta_description'] = Str::limit($plain, 160, '…');
                $stats['meta_descriptions']++;
            }
            if (trim((string) $product->delivery_time_text) === '') {
                $changes['delivery_time_text'] = 'Siparişiniz, tedarikçi stok doğrulaması tamamlandıktan sonra kargoya hazırlanır. Güncel teslimat tahmini sipariş ekranında gösterilir.';
                $stats['delivery_texts']++;
            }
            if (trim((string) $product->return_text) === '') {
                $changes['return_text'] = 'İade ve değişim uygunluğu; ürünün ambalajı, hijyen koşulları ve kullanım durumuna göre Sportoonline iade politikası kapsamında değerlendirilir.';
                $stats['return_texts']++;
            }
            if ($changes !== []) {
                $plan[(int) $product->id] = $changes;
            }
        }

        $existing = ProductBrand::query()
            ->whereIn('brand_name', array_keys($brandNames))
            ->orderByDesc('status')
            ->orderBy('id')
            ->get()
            ->unique(fn (ProductBrand $brand) => mb_strtolower($brand->brand_name, 'UTF-8'));
        foreach (array_keys($brandNames) as $name) {
            if (! $existing->contains(fn (ProductBrand $brand) => mb_strtolower($brand->brand_name, 'UTF-8') === mb_strtolower($name, 'UTF-8'))) {
                $stats['new_brands']++;
            }
        }

        $this->table(['Metric', 'Count'], collect($stats)->map(fn ($value, $key) => [$key, $value])->values()->all());
        if (! $this->option('apply')) {
            $this->warn('DRY-RUN: use --apply after reviewing the deterministic mappings.');
            return self::SUCCESS;
        }

        DB::transaction(function () use ($plan): void {
            $brands = [];
            foreach (collect($plan)->pluck('_brand_name')->filter()->unique() as $name) {
                $brand = ProductBrand::query()
                    ->whereRaw('LOWER(brand_name) = ?', [mb_strtolower($name, 'UTF-8')])
                    ->orderByDesc('status')
                    ->orderBy('id')
                    ->first();
                if (! $brand) {
                    $brand = ProductBrand::query()->create([
                        'brand_name' => $name,
                        'brand_slug' => Str::slug($name),
                        'meta_title' => $name,
                        'meta_description' => $name . ' ürünlerini Sportoonline üzerinde inceleyin.',
                        'status' => 1,
                    ]);
                }
                $brands[$name] = $brand->id;
            }

            foreach ($plan as $productId => $changes) {
                $brandName = $changes['_brand_name'] ?? null;
                unset($changes['_brand_name']);
                if ($brandName && isset($brands[$brandName])) {
                    $changes['brand_id'] = $brands[$brandName];
                }
                Product::withoutGlobalScopes()->whereKey($productId)->update($changes + ['updated_at' => now()]);
            }
        });
        Cache::forever('public-catalog:version', (string) hrtime(true));
        $this->info('Hero catalogue metadata backfill completed. Unresolved brands were intentionally left blank.');

        return self::SUCCESS;
    }

    private function brandFor(string $name): ?string
    {
        foreach (self::BRAND_PREFIXES as $prefix => $brand) {
            if (Str::startsWith($name, $prefix)) {
                return $brand;
            }
        }
        return null;
    }
}
