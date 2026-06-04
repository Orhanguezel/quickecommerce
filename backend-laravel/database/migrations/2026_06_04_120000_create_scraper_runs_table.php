<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scraper_runs', function (Blueprint $table) {
            $table->id();
            $table->string('source_name', 80);
            $table->enum('triggered_by', ['cron', 'manual', 'health-check'])->default('cron');
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('finished_at')->nullable();
            $table->integer('exit_code')->nullable()->comment('0 = success, !=0 = fail');
            $table->integer('products_scraped')->nullable();
            $table->bigInteger('json_size_bytes')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->text('error_log_excerpt')->nullable()->comment('Son 2-3 satir log fail durumunda');
            $table->timestamps();

            $table->index(['source_name', 'started_at'], 'sr_source_started_idx');
            $table->index('started_at', 'sr_started_idx');
            $table->index(['source_name', 'exit_code'], 'sr_source_exit_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scraper_runs');
    }
};
