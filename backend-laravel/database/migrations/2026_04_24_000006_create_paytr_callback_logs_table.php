<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('paytr_callback_logs', function (Blueprint $table) {
            $table->id();

            // Payload fields we care about for debugging
            $table->string('merchant_oid', 128)->nullable()->index();
            $table->string('status', 32)->nullable()->index();
            $table->decimal('total_amount', 15, 2)->nullable();
            $table->string('source_ip', 64)->nullable();

            // Outcome categories, set by controller as it processes the callback:
            //   received | hash_mismatch | unknown_oid | processed | exception
            $table->string('outcome', 32)->default('received')->index();

            // Free-text detail (error message, matched order id, etc.)
            $table->string('detail', 500)->nullable();

            // Full raw payload so later replays / audit are possible
            $table->json('payload')->nullable();

            $table->timestamp('received_at')->useCurrent()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paytr_callback_logs');
    }
};
