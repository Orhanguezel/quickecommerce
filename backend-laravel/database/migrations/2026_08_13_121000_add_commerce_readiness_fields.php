<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('funnel_events', function (Blueprint $table) {
            // Nullable key avoids touching historical analytics rows while
            // enforcing exactly-once semantics for new order conversion events.
            $table->string('dedupe_key', 190)->nullable()->after('order_id')->unique();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_hero')->default(false)->after('is_featured')->index();
            $table->unsignedTinyInteger('catalog_quality_score')->default(0)->after('is_hero')->index();
            $table->boolean('ads_eligible')->default(false)->after('catalog_quality_score')->index();
            $table->string('ads_ineligibility_reason')->nullable()->after('ads_eligible');
            $table->decimal('market_min_price', 15, 4)->nullable()->after('ads_ineligibility_reason');
            $table->decimal('price_index', 8, 4)->nullable()->after('market_min_price')->index();
            $table->timestamp('market_price_checked_at')->nullable()->after('price_index')->index();
            $table->timestamp('commercial_reviewed_at')->nullable()->after('market_price_checked_at');
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->unsignedSmallInteger('shipping_sla_hours')->default(48)->after('delivery_time');
            $table->unsignedTinyInteger('profile_completion_score')->default(0)->after('shipping_sla_hours')->index();
            $table->timestamp('sales_suspended_at')->nullable()->after('profile_completion_score')->index();
            $table->string('sales_suspension_reason')->nullable()->after('sales_suspended_at');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('promised_ship_at')->nullable()->after('delivery_time')->index();
            $table->timestamp('shipped_at')->nullable()->after('promised_ship_at')->index();
            $table->timestamp('sla_breached_at')->nullable()->after('shipped_at')->index();
        });

        Schema::table('order_details', function (Blueprint $table) {
            $table->timestamp('replenishment_reminder_sent_at')->nullable()->index();
        });

        Schema::table('abandoned_carts', function (Blueprint $table) {
            $table->string('recovery_variant', 50)->nullable()->after('currency_code')->index();
            $table->unsignedBigInteger('recovered_order_master_id')->nullable()->after('recovery_variant')->index();
            $table->decimal('incentive_cost', 12, 2)->default(0)->after('recovered_order_master_id');
            $table->unsignedSmallInteger('reminder_count_30d')->default(0)->after('incentive_cost');
            $table->timestamp('reminder_window_started_at')->nullable()->after('reminder_count_30d');
            $table->timestamp('last_reminded_at')->nullable()->after('reminder_window_started_at')->index();
        });
    }

    public function down(): void
    {
        Schema::table('funnel_events', function (Blueprint $table) {
            $table->dropUnique(['dedupe_key']);
            $table->dropColumn('dedupe_key');
        });

        Schema::table('abandoned_carts', function (Blueprint $table) {
            $table->dropIndex(['recovery_variant']);
            $table->dropIndex(['recovered_order_master_id']);
            $table->dropIndex(['last_reminded_at']);
            $table->dropColumn([
                'recovery_variant', 'recovered_order_master_id', 'incentive_cost',
                'reminder_count_30d', 'reminder_window_started_at', 'last_reminded_at',
            ]);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['promised_ship_at']);
            $table->dropIndex(['shipped_at']);
            $table->dropIndex(['sla_breached_at']);
            $table->dropColumn(['promised_ship_at', 'shipped_at', 'sla_breached_at']);
        });

        Schema::table('order_details', function (Blueprint $table) {
            $table->dropIndex(['replenishment_reminder_sent_at']);
            $table->dropColumn('replenishment_reminder_sent_at');
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->dropIndex(['profile_completion_score']);
            $table->dropIndex(['sales_suspended_at']);
            $table->dropColumn([
                'shipping_sla_hours', 'profile_completion_score',
                'sales_suspended_at', 'sales_suspension_reason',
            ]);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_hero']);
            $table->dropIndex(['catalog_quality_score']);
            $table->dropIndex(['ads_eligible']);
            $table->dropIndex(['price_index']);
            $table->dropIndex(['market_price_checked_at']);
            $table->dropColumn([
                'is_hero', 'catalog_quality_score', 'ads_eligible',
                'ads_ineligibility_reason', 'market_min_price', 'price_index',
                'market_price_checked_at', 'commercial_reviewed_at',
            ]);
        });
    }
};
