<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            if (!Schema::hasColumn('product_variants', 'price_input_currency_code')) {
                $table->string('price_input_currency_code', 3)->nullable()->after('price');
            }
            if (!Schema::hasColumn('product_variants', 'price_input_amount')) {
                $table->decimal('price_input_amount', 15, 6)->nullable()->after('price_input_currency_code');
            }
            if (!Schema::hasColumn('product_variants', 'special_price_input_currency_code')) {
                $table->string('special_price_input_currency_code', 3)->nullable()->after('special_price');
            }
            if (!Schema::hasColumn('product_variants', 'special_price_input_amount')) {
                $table->decimal('special_price_input_amount', 15, 6)->nullable()->after('special_price_input_currency_code');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            if (Schema::hasColumn('product_variants', 'price_input_currency_code')) {
                $table->dropColumn('price_input_currency_code');
            }
            if (Schema::hasColumn('product_variants', 'price_input_amount')) {
                $table->dropColumn('price_input_amount');
            }
            if (Schema::hasColumn('product_variants', 'special_price_input_currency_code')) {
                $table->dropColumn('special_price_input_currency_code');
            }
            if (Schema::hasColumn('product_variants', 'special_price_input_amount')) {
                $table->dropColumn('special_price_input_amount');
            }
        });
    }
};

