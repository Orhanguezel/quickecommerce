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
 * Teslimattan sonra kac gun icinde davet gonderilecegi ayarlanabilir
 * (com_review_invite_window_days, varsayilan 14). Pencere eskiden 2 gundu;
 * siparisler haftalarca "confirmed"de takili kaldigi ve teslim isareti gec
 * konuldugu icin pencere kapaniyor, siparis BIR DAHA HIC davet alamiyordu.
 *
 * Not: pencere `delivery_completed_at` uzerinden hesaplanir; bu alan siparisin
 * teslim EDILDIGI an degil, teslim olarak ISARETLENDIGI an yazilir. Yani eski
 * bir siparis bugun teslim isaretlenirse davet bugun gider — istenen davranis.
 */
class DispatchReviewRequests extends Command
{
    protected $signature = 'orders:dispatch-review-requests
        {--dry-run : Mail gondermeden kimlere gidecegini raporla}
        {--limit=200 : Tek calismada en fazla kac mail}
        {--days= : Teslimattan sonra kac gun icinde davet gonderilsin (varsayilan: com_review_invite_window_days, o da yoksa 14)}
        {--since= : Bu tarihten (YYYY-MM-DD) once teslim isareti konmus siparislere davet gonderme}';

    private const DEFAULT_WINDOW_DAYS = 14;
    protected $description = 'Teslim edilen siparisler icin urun degerlendirme davet e-postasi gonderir.';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $limit = (int) $this->option('limit');
        $windowDays = $this->windowDays();

        $query = Order::query()
            ->where('status', 'delivered')
            ->whereNull('review_request_sent_at')
            ->whereNotNull('delivery_completed_at')
            ->where('delivery_completed_at', '>=', now()->subDays($windowDays));

        // Toplu gecmis gonderimi engellemek icin opsiyonel alt sinir.
        if ($since = $this->sinceDate()) {
            $query->where('delivery_completed_at', '>=', $since);
        }

        $orders = $query
            ->with(['orderMaster.customer', 'orderDetail.product'])
            ->orderBy('delivery_completed_at')
            ->limit($limit)
            ->get();

        $this->line(sprintf(
            'Pencere: son %d gun%s',
            $windowDays,
            $since ? ', alt sinir: ' . $since->toDateString() : ''
        ));

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

    /**
     * Davet penceresi: --days > com_review_invite_window_days > 14.
     * 1-90 gun araligina sikistirilir.
     */
    private function windowDays(): int
    {
        $days = $this->option('days') ?? com_option_get('com_review_invite_window_days');

        if (!is_numeric($days) || (int) $days <= 0) {
            $days = self::DEFAULT_WINDOW_DAYS;
        }

        return max(1, min(90, (int) $days));
    }

    private function sinceDate(): ?\Illuminate\Support\Carbon
    {
        $since = $this->option('since') ?: com_option_get('com_review_invite_not_before');

        if (blank($since)) {
            return null;
        }

        try {
            return \Illuminate\Support\Carbon::parse((string) $since)->startOfDay();
        } catch (\Throwable $e) {
            $this->warn("Gecersiz --since degeri yok sayildi: {$since}");
            return null;
        }
    }
}
