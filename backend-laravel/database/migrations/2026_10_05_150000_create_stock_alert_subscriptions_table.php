<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('stock_alert_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->string('email');
            $table->string('confirmation_token_hash', 64)->nullable()->unique();
            $table->timestamp('confirmation_expires_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('notified_at')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->unique(['product_variant_id', 'email']);
            $table->index(['confirmed_at', 'notified_at', 'expires_at'], 'stock_alert_pending_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_alert_subscriptions');
    }
};
