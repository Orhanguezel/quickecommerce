<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_masters', function (Blueprint $table) {
            // 2026-06-05: iyzico "Onay bazli tahsilat" mode'u icin Approval API
            // entegrasyonu. preauth_expires_at (önceki yanlis teshis) — onay
            // suresi diye bir kavram yok burada, kaldirilabilir ama mevcut
            // siparişleri kirmamak icin nullable kalir.
            $table->text('iyzico_payment_items_json')->nullable()->after('iyzico_payment_id')
                ->comment('JSON array: paymentItems[].paymentTransactionId — Approval API icin gerek');
            $table->timestamp('iyzico_approved_at')->nullable()->after('iyzico_payment_items_json')
                ->comment('Admin Approval gondereildi tarihi (null = bekliyor)');

            $table->index(['payment_gateway', 'payment_status', 'iyzico_approved_at'], 'om_iyzico_approval_idx');
        });
    }

    public function down(): void
    {
        Schema::table('order_masters', function (Blueprint $table) {
            $table->dropIndex('om_iyzico_approval_idx');
            $table->dropColumn(['iyzico_payment_items_json', 'iyzico_approved_at']);
        });
    }
};
