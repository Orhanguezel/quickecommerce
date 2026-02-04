<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('order_masters', function (Blueprint $table) {
            if (!Schema::hasColumn('order_masters', 'default_currency_code')) {
                $table->string('default_currency_code', 10)->nullable()->after('order_notes');
            }
            if (!Schema::hasColumn('order_masters', 'currency_code')) {
                $table->string('currency_code', 10)->nullable()->after('default_currency_code');
            }

            if (!Schema::hasColumn('order_masters', 'exchange_rate')) {
                $table->decimal('exchange_rate', 15, 2)->default(1)->after('currency_code');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_masters', function (Blueprint $table) {
            if (Schema::hasColumn('order_masters', 'default_currency_code')) {
                $table->dropColumn('default_currency_code');
            }
            if (Schema::hasColumn('order_masters', 'currency_code')) {
                $table->dropColumn('currency_code');
            }
            if (Schema::hasColumn('order_masters', 'exchange_rate')) {
                $table->dropColumn('exchange_rate');
            }
        });
    }
};

