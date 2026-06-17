<?php

namespace App\Console\Commands;

use App\Mail\OrderReviewRequest;
use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Teslim edilen siparisler icin musteriye "deneyiminizi paylasin / urunu
 * degerlendirin" davet e-postasi gonderir. Gunde icinde (11:00-19:00 arasi)
 * scheduler tarafindan calistirilir; her siparis icin yalnizca BIR KEZ gonderir
 * (review_request_sent_at).
 *
 * Sadece SON 2 GUN icinde teslim edilen siparisler hedeflenir — boylece ozellik
 * ilk devreye girdiginde eski tum siparislere toplu mail GITMEZ.
 */
class DispatchReviewRequests extends Command
{
    protected $signature = 'orders:dispatch-review-requests {--dry-run : Mail gondermeden kimlere gidecegini raporla} {--limit=200 : Tek calismada en fazla kac mail}';
    protected $description = 'Teslim edilen siparisler icin urun degerlendirme davet e-postasi gonderir.';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $limit = (int) $this->option('limit');

        $orders = Order::query()
            ->where('status', 'delivered')
            ->whereNull('review_request_sent_at')
            ->whereNotNull('delivery_completed_at')
            ->where('delivery_completed_at', '>=', now()->subDays(2))
            ->with(['orderMaster.customer', 'orderDetail.product'])
            ->orderBy('delivery_completed_at')
            ->limit($limit)
            ->get();

        if ($orders->isEmpty()) {
            $this->info('Gonderilecek degerlendirme daveti yok.');
            return self::SUCCESS;
        }

        $sent = 0;
        $skipped = 0;

        foreach ($orders as $order) {
            $email = $order->orderMaster?->customer?->email;
            $hasProduct = collect($order->orderDetail)->contains(fn ($d) => $d->product !== null);

            if (!$email || !$hasProduct) {
                // Email yoksa veya urun cozulemiyorsa tekrar denememek icin isaretle
                if (!$dryRun) {
                    $order->forceFill(['review_request_sent_at' => now()])->saveQuietly();
                }
                $skipped++;
                continue;
            }

            if ($dryRun) {
                $this->line("  [DRY] #{$order->id} -> {$email}");
                $sent++;
                continue;
            }

            try {
                Mail::to($email)->send(new OrderReviewRequest($order));
                $order->forceFill(['review_request_sent_at' => now()])->saveQuietly();
                $sent++;
                Log::info('ReviewRequest sent', ['order_id' => $order->id, 'email' => $email]);
            } catch (\Throwable $e) {
                Log::error('ReviewRequest failed', ['order_id' => $order->id, 'error' => $e->getMessage()]);
                $skipped++;
                // review_request_sent_at NULL kalir -> sonraki calismada tekrar denenir
            }
        }

        $this->info(($dryRun ? '[DRY-RUN] ' : '') . "Gonderilen: {$sent}, atlanan: {$skipped}");
        return self::SUCCESS;
    }
}
