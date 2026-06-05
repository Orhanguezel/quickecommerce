<?php

namespace App\Console\Commands;

use App\Models\OrderMaster;
use App\Services\AdminNotifier;
use App\Services\ScraperAlerter;
use Illuminate\Console\Command;

/**
 * PreAuth (authorized) sipariş ödemeleri 7 gün içinde tahsil edilmezse
 * iyzico otomatik iptal eder ve para kazançtan düşer. Bu cron her gün
 * çalışıp 5. günü geçmiş (ya da 2 gün içinde dolacak) siparişleri
 * tarayıp admin'i uyarır.
 *
 * Schedule: routes/console.php dailyAt('09:00')
 */
class PreAuthExpiryReminder extends Command
{
    protected $signature = 'iyzico:preauth-reminder
                            {--days-before=2 : Tahsil etme bitiş tarihinden N gün önce uyar}';

    protected $description = 'PreAuth süresi dolmak üzere olan siparişler için admin\'i uyarır.';

    public function handle(): int
    {
        $daysBefore = (int) $this->option('days-before');
        $cutoff = now()->addDays($daysBefore);

        $orders = OrderMaster::where('payment_status', 'authorized')
            ->whereNotNull('preauth_expires_at')
            ->where('preauth_expires_at', '<=', $cutoff)
            ->where('preauth_expires_at', '>=', now())
            ->orderBy('preauth_expires_at')
            ->get();

        if ($orders->isEmpty()) {
            $this->info('Süresi dolmak üzere PreAuth sipariş yok.');
            return self::SUCCESS;
        }

        $items = [];
        foreach ($orders as $om) {
            $hoursLeft = max(0, (int) now()->diffInHours($om->preauth_expires_at, false));
            $items[] = sprintf(
                '#%d  ₺%.2f  kalan %d saat (son: %s)',
                $om->id,
                (float) ($om->paid_amount ?: $om->order_amount),
                $hoursLeft,
                $om->preauth_expires_at->format('d.m H:i')
            );
        }

        // Telegram
        ScraperAlerter::digest(
            'iyzico PreAuth Tahsilat Hatırlatması',
            array_merge(
                ["{$orders->count()} sipariş yakında iptal olur (≤{$daysBefore} gün kaldı). Admin panelden 'Ödemeyi Tahsil Et' yap."],
                $items
            ),
            ScraperAlerter::LEVEL_WARN
        );

        // Admin panel in-app bildirim + email
        AdminNotifier::notify(
            "PreAuth tahsil hatırlatması — {$orders->count()} sipariş",
            "iyzico'da bloke tuttuğunuz ödemeler için tahsilat süresi dolmak üzere. " .
            "5+ gün önce yetkilendirilmiş, henüz tahsil edilmemiş " .
            "{$orders->count()} sipariş bulundu. Admin panelden 'Ödemeyi Tahsil Et' " .
            "butonu ile bu siparişlerin tahsilatını tamamlayın.",
            ['type' => 'preauth_expiry', 'count' => $orders->count(), 'order_ids' => $orders->pluck('id')->all()],
            true // sendEmail
        );

        $this->warn("{$orders->count()} sipariş için hatırlatma gönderildi.");
        return self::SUCCESS;
    }
}
