<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product_velocity_stats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->unique();
            // Average units sold per day over the lookback window (usually 30d)
            $table->decimal('daily_sales_avg', 10, 2)->default(0);
            // Total units sold in the lookback window
            $table->unsignedInteger('window_sales')->default(0);
            // Current stock at the time of the last snapshot (proxy for stock_quantity)
            $table->unsignedInteger('current_stock')->default(0);
            // Days of supply — lower = more urgent
            $table->decimal('days_of_supply', 8, 1)->nullable();
            // Days of lookback used for the avg — 30 by default
            $table->unsignedSmallInteger('window_days')->default(30);
            $table->timestamp('computed_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_velocity_stats');
    }
};
