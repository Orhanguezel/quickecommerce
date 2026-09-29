<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * GA4 Measurement Protocol (sunucu tarafi purchase/refund) icin iz kolonlari.
 *
 * - order_masters.ga_client_id: checkout aninda, YALNIZ analitik cerez izni
 *   varsa frontend'in `_ga` cerezinden okudugu "<a>.<b>" degeri.
 * - order_masters.ga4_purchase_sent_at / ga4_refund_sent_at: idempotency.
 * - orders.ga4_refund_sent_at: cok saticili odemede her alt siparisin kismi
 *   iadesi ayri gonderilir; master tek damgasi ikinci alt siparisi bloklamasin.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_masters', function (Blueprint $table) {
            if (! Schema::hasColumn('order_masters', 'ga_client_id')) {
                $table->string('ga_client_id', 64)->nullable()->after('referrer');
            }
            if (! Schema::hasColumn('order_masters', 'ga4_purchase_sent_at')) {
                $table->timestamp('ga4_purchase_sent_at')->nullable();
            }
            if (! Schema::hasColumn('order_masters', 'ga4_refund_sent_at')) {
                $table->timestamp('ga4_refund_sent_at')->nullable();
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'ga4_refund_sent_at')) {
                $table->timestamp('ga4_refund_sent_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'ga4_refund_sent_at')) {
                $table->dropColumn('ga4_refund_sent_at');
            }
        });

        Schema::table('order_masters', function (Blueprint $table) {
            $columns = array_values(array_filter(
                ['ga_client_id', 'ga4_purchase_sent_at', 'ga4_refund_sent_at'],
                fn (string $column) => Schema::hasColumn('order_masters', $column)
            ));
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
