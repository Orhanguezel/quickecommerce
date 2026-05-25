<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('search_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('term', 191)->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('locale', 5)->default('tr');
            $table->unsignedInteger('results_count')->default(0);
            $table->unsignedBigInteger('clicked_product_id')->nullable();
            $table->string('ip_hash', 64)->nullable(); // sha256 + salt — KVKK uyumlu
            $table->timestamp('created_at')->useCurrent();

            // popular query icin: WHERE created_at > NOW() - INTERVAL 7 DAY GROUP BY term ORDER BY COUNT(*)
            $table->index(['created_at', 'term']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_logs');
    }
};
