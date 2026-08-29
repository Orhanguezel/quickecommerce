<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Sadakat puani ayarlarini ekler.
 *
 * Mevcut degerleri EZMEZ (updateOrInsert degil, yoksa-ekle) — canlida elle
 * degistirilen bir oran seeder tekrar kosunca eski haline donmesin.
 *
 * Calistirma:  php artisan db:seed --class=LoyaltySettingsSeeder
 * (CLAUDE.md: canlida --class'siz genel db:seed ASLA calistirilmaz.)
 */
class LoyaltySettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            // Ana anahtar. Kapaliyken yeni puan KAZANILMAZ.
            'com_loyalty_enabled' => 'off',

            // Bozdurma ayri anahtar: program kapatilirken once kazanim durur,
            // birikmis puanlar bir sure daha bozdurulabilir kalir.
            'com_loyalty_redeem_enabled' => 'on',

            // Kazanma: teslim edilen sipariste 1 TL = 1 puan
            'com_loyalty_earn_per_currency' => '1',

            // Harcama: 1000 puan = 10 TL
            'com_loyalty_redeem_points_per_unit' => '1000',
            'com_loyalty_redeem_value' => '10',

            // Minimum bozdurma 2500 puan = 25 TL
            'com_loyalty_min_redeem_points' => '2500',

            // Cek kurallari
            'com_loyalty_voucher_min_order' => '500',
            'com_loyalty_voucher_valid_days' => '90',

            // Yorum bonusu (yildiz sayisindan BAGIMSIZ verilir)
            'com_loyalty_review_bonus_with_image' => '250',
            'com_loyalty_review_bonus_no_image' => '100',

            // Puan omru
            'com_loyalty_points_expire_days' => '365',

            // Yorum daveti penceresi (gun)
            'com_review_invite_window_days' => '14',
        ];

        $added = 0;

        foreach ($defaults as $name => $value) {
            $exists = DB::table('setting_options')->where('option_name', $name)->exists();

            if ($exists) {
                continue;
            }

            DB::table('setting_options')->insert([
                'option_name' => $name,
                'option_value' => $value,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $added++;
        }

        $this->command?->info("Sadakat ayarlari: {$added} yeni kayit eklendi, " . (count($defaults) - $added) . ' zaten vardi.');
    }
}
