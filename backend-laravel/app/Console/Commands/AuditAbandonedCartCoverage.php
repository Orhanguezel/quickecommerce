<?php

namespace App\Console\Commands;

use App\Models\AbandonedCart;
use App\Services\AdminNotifier;
use Illuminate\Console\Command;

class AuditAbandonedCartCoverage extends Command
{
    protected $signature = 'abandoned-cart:audit-coverage {--days=30} {--notify}';
    protected $description = 'Explain why abandoned carts cannot receive a legally permitted recovery reminder';

    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));
        $carts = AbandonedCart::with('customer')->where('created_at', '>=', now()->subDays($days))
            ->whereNotNull('abandoned_at')->whereNull('recovered_at')->get();
        $reasons = $carts->groupBy(function ($cart) {
            if (! $cart->email) return 'missing_email';
            if (! $cart->customer) return 'guest_without_marketing_identity';
            if (! $cart->customer->marketing_email) return 'marketing_consent_missing';
            if ($cart->unsubscribed_at) return 'unsubscribed';
            if ($cart->first_reminded_at) return 'already_contacted';
            return 'eligible_pending';
        })->map->count()->sortDesc();

        $this->table(['Reason', 'Carts'], $reasons->map(fn ($count, $reason) => [$reason, $count])->values()->all());
        if ($this->option('notify') && ($reasons['eligible_pending'] ?? 0) > 0) {
            AdminNotifier::notifyPrimarySiteAdmin(
                'Terk edilmiş sepet gönderim kuyruğu',
                "Gönderime uygun fakat bekleyen {$reasons['eligible_pending']} sepet var.",
                ['type' => 'abandoned_cart_coverage', 'reasons' => $reasons->all()]
            );
        }
        return self::SUCCESS;
    }
}
