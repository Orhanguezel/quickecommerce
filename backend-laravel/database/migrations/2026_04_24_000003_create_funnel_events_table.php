<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('funnel_events', function (Blueprint $table) {
            $table->id();

            // Event taxonomy — a small closed set is easier to aggregate than free-form.
            //   product_viewed, add_to_cart, cart_viewed, checkout_started,
            //   order_placed, recommendation_shown, recommendation_clicked,
            //   recommendation_added, shipping_threshold_crossed, coupon_threshold_crossed,
            //   exit_intent_shown, exit_intent_converted
            $table->string('event', 64)->index();

            // Subject identity — same convention as experiments: "u:{id}" or "s:{uuid}"
            $table->string('subject', 64)->index();
            $table->unsignedBigInteger('customer_id')->nullable()->index();

            // Optional context: product_id, block_type, coupon_code, …
            $table->unsignedBigInteger('product_id')->nullable()->index();
            $table->string('block_type', 64)->nullable()->index();
            $table->decimal('amount', 15, 2)->nullable();
            $table->json('meta')->nullable();

            $table->timestamp('occurred_at')->useCurrent()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funnel_events');
    }
};
