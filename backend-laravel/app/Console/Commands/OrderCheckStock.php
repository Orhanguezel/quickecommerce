<?php

namespace App\Console\Commands;

use App\Jobs\PostOrderStockCheckJob;
use App\Models\OrderMaster;
use App\Services\IyzicoRefundService;
use App\Services\ScraperAlerter;
use App\Services\SourceStockProbe;
use Illuminate\Console\Command;

class OrderCheckStock extends Command
{
    protected $signature = 'order:check-stock {order_master_id} {--dry-run : DB ve iyzico iade akisini calistirma, sadece probe sonucunu raporla}';
    protected $description = 'Bir siparişin satirlarini canli stok kontrolune sok (manuel veya post-order check job calismadan once test).';

    public function handle(SourceStockProbe $probe, IyzicoRefundService $refund, ScraperAlerter $alerter): int
    {
        $id = (int) $this->argument('order_master_id');
        $master = OrderMaster::with(['orders.orderDetail'])->find($id);
        if (!$master) {
            $this->error("OrderMaster #{$id} bulunamadi");
            return self::FAILURE;
        }

        $this->info("Siparis #{$id} payment_status={$master->payment_status} approved_at=" . ($master->iyzico_approved_at ?? 'NULL'));

        if ($this->option('dry-run')) {
            $this->warn('DRY-RUN modu: sadece probe sonuclari raporlanir, DB/iyzico degismez.');
            $outOfStock = $uncertain = [];
            foreach ($master->orders as $sub) {
                foreach ($sub->orderDetail as $line) {
                    $variantId = $line->variant_id ?? null;
                    $productId = $line->product_id ?? null;
                    $row = \DB::table('product_source_mappings')
                        ->where('product_variant_id', $variantId ?: 0)
                        ->orWhere('product_id', $productId ?: 0)
                        ->first(['source_product_url', 'source_name']);
                    if (!$row || !$row->source_product_url) {
                        $this->line("  - line product_id={$productId} variant_id={$variantId}: mapping yok, SKIP");
                        continue;
                    }
                    $r = $probe->probe($row->source_product_url);
                    $tag = $r->isDefinitelyOutOfStock() ? '<fg=red>OUT</>' : ($r->isUncertain() ? '<fg=yellow>?</>' : '<fg=green>IN</>');
                    $this->line(sprintf("  - %s %s | %s (%dms)", $tag, $row->source_name, $r->signal, $r->durationMs));
                    if ($r->isDefinitelyOutOfStock()) $outOfStock[] = $row->source_product_url;
                    elseif ($r->isUncertain()) $uncertain[] = $row->source_product_url;
                }
            }
            $this->info("Sonuc: " . count($outOfStock) . " out-of-stock, " . count($uncertain) . " belirsiz");
            if (count($outOfStock) > 0) {
                $this->warn('Dry-run olmasa: iyzico cancel + DB refunded mark + alert');
            }
            return self::SUCCESS;
        }

        $this->warn('LIVE modu: probe + iyzico cancel + DB refunded mark calisacak. 5 sn icinde Ctrl+C ile iptal et.');
        sleep(5);
        (new PostOrderStockCheckJob($id))->handle($probe, $refund, $alerter);
        $this->info('Bitti. Detay icin storage/logs/laravel.log');
        return self::SUCCESS;
    }
}
