<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('market_median_price', 15, 4)->nullable()->after('market_min_price');
            $table->unsignedSmallInteger('market_price_source_count')->default(0)->after('market_median_price');
        });

        Schema::create('product_market_price_observations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('source_name', 100);
            $table->string('source_key', 64);
            $table->string('source_url', 1000)->nullable();
            $table->decimal('price', 15, 4);
            $table->char('currency_code', 3)->default('TRY');
            $table->boolean('is_available')->default(true);
            $table->timestamp('observed_at');
            $table->string('observation_key', 64)->unique();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'observed_at'], 'pm_price_product_observed_idx');
            $table->index(['product_id', 'source_key', 'observed_at'], 'pm_price_product_source_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_market_price_observations');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['market_median_price', 'market_price_source_count']);
        });
    }
};
