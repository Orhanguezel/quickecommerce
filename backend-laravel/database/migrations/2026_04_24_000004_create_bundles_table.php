<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bundles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            // Media id for the hero image (same pattern as products.image)
            $table->string('image')->nullable();
            // Computed at save-time from sum of item prices. Kept denormalized
            // so the listing queries don't need a join → product_variants.
            $table->decimal('original_price', 15, 2)->default(0);
            // What the customer actually pays when they click "Add bundle to cart"
            $table->decimal('bundle_price', 15, 2)->default(0);
            $table->string('currency_code', 8)->default('TRY');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->tinyInteger('status')->default(1)->index(); // 1=active, 0=inactive
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('bundle_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('bundle_id')->index();
            $table->unsignedBigInteger('product_id')->index();
            // Optional — null means "any variant" (fallback to first variant on add-to-cart)
            $table->unsignedBigInteger('variant_id')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();

            // Same product can't be added twice to the same bundle
            $table->unique(['bundle_id', 'product_id', 'variant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bundle_items');
        Schema::dropIfExists('bundles');
    }
};
