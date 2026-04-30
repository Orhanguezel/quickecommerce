<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_source_mappings', function (Blueprint $table) {
            $table->id();
            $table->string('source_name', 80);
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->string('source_product_url', 1000)->nullable();
            $table->string('source_product_id', 180)->nullable();
            $table->string('source_product_slug', 220)->nullable();
            $table->string('source_variant_id', 180)->nullable();
            $table->string('source_variant_sku', 180)->nullable();
            $table->string('source_variant_barcode', 180)->nullable();
            $table->string('source_variant_title', 220)->nullable();
            $table->decimal('last_synced_price', 15, 2)->nullable();
            $table->decimal('last_synced_special_price', 15, 2)->nullable();
            $table->integer('last_synced_stock')->nullable();
            $table->string('last_sync_status', 40)->default('pending');
            $table->text('last_sync_note')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();

            $table->unique('product_variant_id', 'psm_variant_unique');
            $table->index(['source_name', 'store_id'], 'psm_source_store_idx');
            $table->index(['source_name', 'source_product_slug'], 'psm_source_slug_idx');
            $table->index(['source_name', 'source_variant_sku'], 'psm_source_sku_idx');
            $table->index(['source_name', 'source_variant_barcode'], 'psm_source_barcode_idx');
            $table->index('last_sync_status', 'psm_sync_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_source_mappings');
    }
};
