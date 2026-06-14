<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Urun stok meta bayraklarini config/preorder.php listelerine gore set eder
 * (idempotent). Gunluk scraper sync sonrasi calismali (yeni urunler de kapsansin).
 *
 *   - is_preorder    : bool_sources urunleri 1. 2026-06-14'te bool_sources
 *                      BOSALTILDI -> tum urunler 0 (on siparis etiketi kaldirildi).
 *   - stock_is_exact : exact_stock_sources (gercek int miktar veren: provitanya,
 *                      swan) urunleri 1 -> frontend "Stokta (N)" gosterir.
 *                      Diger kaynaklar bool oldugu icin 0 -> sadece "Stokta".
 *
 * Komut adi geriye donuk uyumluluk icin korundu (cron: products:flag-preorder).
 */
class FlagPreorderProducts extends Command
{
    protected $signature = 'products:flag-preorder {--apply : Degisiklikleri uygula (yoksa sadece rapor)}';
    protected $description = 'Urun stok meta bayraklarini (is_preorder, stock_is_exact) kaynak listelerine gore isaretle.';

    public function handle(): int
    {
        $boolSources = config('preorder.bool_sources', []);
        $exactSources = config('preorder.exact_stock_sources', []);

        $preorderIds = $this->productIdsForSources($boolSources);
        $exactIds = $this->productIdsForSources($exactSources);

        $this->info('On siparis kaynak: ' . count($boolSources) . ' -> ' . count($preorderIds) . ' urun');
        $this->info('Gercek-stok kaynak: ' . count($exactSources) . ' -> ' . count($exactIds) . ' urun');
        $this->info('Su an is_preorder=1: ' . DB::table('products')->where('is_preorder', 1)->count());
        $this->info('Su an stock_is_exact=1: ' . DB::table('products')->where('stock_is_exact', 1)->count());

        if (!$this->option('apply')) {
            $this->warn('DRY-RUN: --apply verilmedi, DB degismedi.');
            return self::SUCCESS;
        }

        DB::transaction(function () use ($preorderIds, $exactIds) {
            $this->syncFlag('is_preorder', $preorderIds);
            $this->syncFlag('stock_is_exact', $exactIds);
        });

        $this->info('Uygulandi.');
        $this->info('Toplam is_preorder=1: ' . DB::table('products')->where('is_preorder', 1)->count());
        $this->info('Toplam stock_is_exact=1: ' . DB::table('products')->where('stock_is_exact', 1)->count());

        return self::SUCCESS;
    }

    /** Verilen kaynaklara mapping'i olan distinct product_id'ler. */
    private function productIdsForSources(array $sources): array
    {
        if (empty($sources)) {
            return [];
        }
        return DB::table('product_source_mappings')
            ->whereIn('source_name', $sources)
            ->whereNotNull('product_id')
            ->distinct()
            ->pluck('product_id')
            ->all();
    }

    /** Verilen id'lerde flag=1, digerlerinde 0 (idempotent). */
    private function syncFlag(string $column, array $ids): void
    {
        foreach (array_chunk($ids, 2000) as $chunk) {
            DB::table('products')
                ->whereIn('id', $chunk)
                ->where($column, '!=', 1)
                ->update([$column => 1, 'updated_at' => now()]);
        }

        $unset = DB::table('products')->where($column, 1);
        if (!empty($ids)) {
            $unset->whereNotIn('id', $ids);
        }
        $unset->update([$column => 0, 'updated_at' => now()]);
    }
}
