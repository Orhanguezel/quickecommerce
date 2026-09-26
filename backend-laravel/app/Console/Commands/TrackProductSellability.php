<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * products.unsellable_since alanini guncel tutar (idempotent):
 *   - satilabilir olmaktan cikan urun -> unsellable_since = simdi
 *   - tekrar satilabilir olan urun   -> unsellable_since = NULL
 *
 * "Satilabilir" tanimi sitemap ile ayni: Product::publiclySellable().
 * updated_at'e BILEREK dokunulmaz — sitemap lastmod'u ve products:prune-stale
 * o alana dayaniyor; burada urun icerigi degismiyor.
 */
class TrackProductSellability extends Command
{
    protected $signature = 'products:track-sellability {--apply : Degisiklikleri uygula (yoksa sadece rapor)}';
    protected $description = 'Satilamaz hale gelen urunlerin baslangic zamanini (unsellable_since) isaretle.';

    public function handle(): int
    {
        $sellableIds = Product::query()->publiclySellable()->pluck('products.id')->all();
        $sellable = array_flip($sellableIds);

        $toMark = [];
        $toClear = [];
        DB::table('products')
            ->whereNull('deleted_at')
            ->select(['id', 'unsellable_since'])
            ->orderBy('id')
            ->chunk(5000, function ($rows) use ($sellable, &$toMark, &$toClear) {
                foreach ($rows as $row) {
                    $isSellable = isset($sellable[$row->id]);
                    if (!$isSellable && $row->unsellable_since === null) {
                        $toMark[] = $row->id;
                    } elseif ($isSellable && $row->unsellable_since !== null) {
                        $toClear[] = $row->id;
                    }
                }
            });

        $this->info('Satilabilir: ' . count($sellableIds));
        $this->info('Yeni satilamaz (isaretlenecek): ' . count($toMark));
        $this->info('Tekrar satilabilir (temizlenecek): ' . count($toClear));

        if (!$this->option('apply')) {
            $this->warn('DRY-RUN: --apply verilmedi, DB degismedi.');
            return self::SUCCESS;
        }

        $now = now();
        DB::transaction(function () use ($toMark, $toClear, $now) {
            foreach (array_chunk($toMark, 2000) as $chunk) {
                DB::table('products')->whereIn('id', $chunk)->whereNull('unsellable_since')
                    ->update(['unsellable_since' => $now]);
            }
            foreach (array_chunk($toClear, 2000) as $chunk) {
                DB::table('products')->whereIn('id', $chunk)
                    ->update(['unsellable_since' => null]);
            }
        });

        $this->info('Uygulandi.');

        return self::SUCCESS;
    }
}
