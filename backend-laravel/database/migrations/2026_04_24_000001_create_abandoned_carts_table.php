<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('abandoned_carts', function (Blueprint $table) {
            $table->id();

            // Customer link — nullable because guests have carts too.
            $table->unsignedBigInteger('customer_id')->nullable()->index();
            // Email captured at snapshot time (may be guest's marketing-consent email).
            $table->string('email')->nullable()->index();
            // Stable identifier for guest carts (localStorage UUID set by frontend).
            $table->string('session_id', 64)->nullable()->index();

            // Full snapshot of cart contents so reminder emails can render even
            // if prices/products change between snapshot and send.
            $table->json('items_snapshot');
            $table->unsignedInteger('item_count')->default(0);
            $table->decimal('cart_total', 15, 2)->default(0);
            $table->string('currency_code', 8)->default('TRY');
            $table->string('locale', 8)->default('tr');

            // Lifecycle timestamps — all nullable, set by cron/pipeline.
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamp('abandoned_at')->nullable()->index();
            $table->timestamp('first_reminded_at')->nullable();
            $table->timestamp('second_reminded_at')->nullable();
            $table->timestamp('third_reminded_at')->nullable();
            $table->timestamp('recovered_at')->nullable();
            $table->timestamp('unsubscribed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('abandoned_carts');
    }
};
