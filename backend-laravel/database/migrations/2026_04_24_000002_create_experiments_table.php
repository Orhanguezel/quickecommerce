<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('experiments', function (Blueprint $table) {
            $table->id();
            // Stable identifier used by app code: "cart_recommendation_layout"
            $table->string('key', 128)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            // draft | running | paused | ended
            $table->string('status', 16)->default('draft')->index();
            // [{"key":"control","weight":50},{"key":"variant_a","weight":50}]
            $table->json('variants');
            // 0-100 — fraction of eligible traffic that should be enrolled
            $table->unsignedTinyInteger('traffic_allocation')->default(100);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
        });

        Schema::create('experiment_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('experiment_id')->index();
            // Can be a customer_id (authenticated) or session UUID (guest). String
            // so both fit uniformly.
            $table->string('subject', 64)->index();
            $table->string('variant_key', 64);
            $table->timestamp('exposed_at')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->timestamps();

            // One assignment per (experiment, subject)
            $table->unique(['experiment_id', 'subject']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experiment_assignments');
        Schema::dropIfExists('experiments');
    }
};
