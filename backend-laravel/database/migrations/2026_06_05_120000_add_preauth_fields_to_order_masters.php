<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_masters', function (Blueprint $table) {
            // 2026-06-05: iyzico PreAuth + Capture akisi
            //   - iyzico_payment_id: PreAuth basarili oldugunda iyzico'nun
            //     paymentId'si — sonradan capture (postauth) icin gerek
            //   - preauth_expires_at: iyzico PreAuth genelde 7 gun geçerli;
            //     bu suredeki son tarih (hatirlatma cron'u icin)
            //   - payment_status enum'u ek 'authorized' degeri kazanir
            //     (mevcut: pending/paid/failed). Migration enum'u
            //     degistirmiyor cunku Laravel/MySQL'de enum mig kompleks —
            //     uygulamada string olarak set ederiz.
            $table->string('iyzico_payment_id', 64)->nullable()->after('payment_status');
            $table->timestamp('preauth_expires_at')->nullable()->after('iyzico_payment_id');

            $table->index('preauth_expires_at', 'om_preauth_expires_idx');
            $table->index(['payment_status', 'preauth_expires_at'], 'om_status_expires_idx');
        });
    }

    public function down(): void
    {
        Schema::table('order_masters', function (Blueprint $table) {
            $table->dropIndex('om_preauth_expires_idx');
            $table->dropIndex('om_status_expires_idx');
            $table->dropColumn(['iyzico_payment_id', 'preauth_expires_at']);
        });
    }
};
