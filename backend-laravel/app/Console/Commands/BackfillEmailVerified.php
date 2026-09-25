<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Console\Command;

/**
 * E-posta dogrulamasi ACILMADAN ONCE bir kez calistirilir.
 *
 * Neden: com_user_email_verification acildiginda dogrulanmamis TUM mevcut
 * hesaplar hesap panelinden 403 yer. Bu hesaplar dogrulama diye bir sey
 * yokken acildi; onlari cezalandirmak yerine "muktesep hak" olarak
 * dogrulanmis sayiyoruz. Kural yalnizca komut calistiktan SONRA acilan
 * hesaplara uygulanir.
 */
class BackfillEmailVerified extends Command
{
    protected $signature = 'customers:backfill-email-verified
                            {--dry-run : Sadece kac kayit etkilenecegini goster}
                            {--customers-only : Sadece musterileri isaretle}';

    protected $description = 'Mevcut (eski) musteri ve satici hesaplarini dogrulanmis olarak isaretler';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $customerQuery = Customer::withTrashed()->where('email_verified', '!=', 1)->whereNotNull('email');
        $customerCount = (clone $customerQuery)->count();

        $this->line("Musteri (email_verified != 1): {$customerCount}");

        $userCount = 0;
        if (!$this->option('customers-only')) {
            $userQuery = User::where('email_verified', '!=', 1)->whereNotNull('email');
            $userCount = (clone $userQuery)->count();
            $this->line("Satici/yonetici (email_verified != 1): {$userCount}");
        }

        if ($dryRun) {
            $this->info('dry-run: hicbir kayit degistirilmedi.');
            return self::SUCCESS;
        }

        $now = now();

        $customerQuery->update([
            'email_verified' => 1,
            'email_verified_at' => $now,
        ]);

        if (!$this->option('customers-only')) {
            User::where('email_verified', '!=', 1)->whereNotNull('email')->update([
                'email_verified' => 1,
                'email_verified_at' => $now,
            ]);
        }

        $this->info("Tamam: {$customerCount} musteri, {$userCount} satici/yonetici dogrulanmis olarak isaretlendi.");

        return self::SUCCESS;
    }
}
