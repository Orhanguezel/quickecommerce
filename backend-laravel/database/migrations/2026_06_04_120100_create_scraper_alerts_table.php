<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scraper_alerts', function (Blueprint $table) {
            $table->id();
            $table->enum('level', ['info', 'warning', 'critical'])->default('warning');
            $table->string('title', 255);
            $table->text('body')->nullable();
            $table->string('source_name', 80)->nullable()->comment('Spesifik kaynak; null = genel saglik raporu');
            $table->foreignId('scraper_run_id')->nullable()->constrained('scraper_runs')->nullOnDelete();
            $table->boolean('telegram_sent')->default(false);
            $table->string('telegram_message_id', 40)->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['level', 'created_at'], 'sa_level_created_idx');
            $table->index(['source_name', 'created_at'], 'sa_source_created_idx');
            $table->index('created_at', 'sa_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scraper_alerts');
    }
};
