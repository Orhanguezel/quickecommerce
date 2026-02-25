<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('system_commissions', function (Blueprint $table) {
            if (!Schema::hasColumn('system_commissions', 'free_shipping_min_order_value')) {
                $table->decimal('free_shipping_min_order_value', 12, 2)
                    ->nullable()
                    ->after('order_shipping_charge');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('system_commissions', function (Blueprint $table) {
            if (Schema::hasColumn('system_commissions', 'free_shipping_min_order_value')) {
                $table->dropColumn('free_shipping_min_order_value');
            }
        });
    }
};

