<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * config/preorder.php "bool_sources" listesindeki tedarikci kaynaklarindan
 * (product_source_mappings.source_name) gelen urunleri products.is_preorder=1
 * yapar; digerlerini 0'a ceker (idempotent). Frontend bu flag ile "Stokta"
 * yerine "On Siparis / Tedarik Sureli" gosterir.
 *
 * Gunluk scraper sync sonrasi calismali (yeni urunler de kapsansin).
 */
class FlagPreorderProducts extends Command
{
    protected $signature = 'products:flag-preorder {--apply : Degisiklikleri uygula (yoksa sadece rapor)}';
    protected $description = 'Bool-only tedarikci kaynak urunlerini on-siparis (is_preorder) olarak isaretle.';

    public function handle(): int
    {
        $boolSources = config('preorder.bool_sources', []);
        if (empty($boolSources)) {
            $this->error('config/preorder.php bool_sources bos. Iptal.');
            return self::FAILURE;
        }

        // Bool-only kaynaga mapping'i olan urun id'leri
        $preorderProductIds = DB::table('product_source_mappings')
            ->whereIn('source_name', $boolSources)
            ->whereNotNull('product_id')
            ->distinct()
            ->pluck('product_id')
            ->all();

        $currentPreorder = DB::table('products')->where('is_preorder', 1)->count();
        $targetCount = count($preorderProductIds);

        $this->info("Bool-only kaynak: " . count($boolSources) . " kaynak");
        $this->info("On-siparis olacak urun: {$targetCount}");
        $this->info("Su an is_preorder=1 olan: {$currentPreorder}");

        if (!$this->option('apply')) {
            $this->warn('DRY-RUN: --apply verilmedi, DB degismedi.');
            return self::SUCCESS;
        }

        $toSet = 0;
        $toUnset = 0;
        DB::transaction(function () use ($preorderProductIds, &$toSet, &$toUnset) {
            // 1'e cek (bool kaynakli)
            foreach (array_chunk($preorderProductIds, 2000) as $chunk) {
                $toSet += DB::table('products')
                    ->whereIn('id', $chunk)
                    ->where('is_preorder', '!=', 1)
                    ->update(['is_preorder' => 1, 'updated_at' => now()]);
            }
            // 0'a cek (artik bool kaynakli olmayanlar — config'ten cikarilmis olabilir)
            $unsetQuery = DB::table('products')->where('is_preorder', 1);
            if (!empty($preorderProductIds)) {
                $unsetQuery->whereNotIn('id', $preorderProductIds);
            }
            $toUnset = $unsetQuery->update(['is_preorder' => 0, 'updated_at' => now()]);
        });

        $this->info("Uygulandi -> on-siparis yapilan: {$toSet}, geri alinan: {$toUnset}");
        $this->info("Toplam is_preorder=1: " . DB::table('products')->where('is_preorder', 1)->count());

        return self::SUCCESS;
    }
}
