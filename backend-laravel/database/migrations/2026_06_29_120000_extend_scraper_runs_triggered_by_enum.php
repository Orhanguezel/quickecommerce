<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * scraper_runs.triggered_by enum'una 'cron-intraday' + 'cron-evening' ekler.
 *
 * run-intraday-stock.sh / run-evening-stock.sh bu degerleri yaziyordu ama enum
 * sadece ('cron','manual','health-check') idi -> her intraday/evening run'da
 * "SQLSTATE[01000] 1265 Data truncated for column 'triggered_by'" hatasi (gunde
 * ~232 kez log kirletiyordu, deger '' olarak kayit ediliyordu).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE scraper_runs MODIFY COLUMN triggered_by ENUM('cron','manual','health-check','cron-intraday','cron-evening') NOT NULL DEFAULT 'cron'");
    }

    public function down(): void
    {
        // Geri alirken yeni degerleri 'cron'a indir (truncate engelle).
        DB::statement("UPDATE scraper_runs SET triggered_by = 'cron' WHERE triggered_by IN ('cron-intraday','cron-evening')");
        DB::statement("ALTER TABLE scraper_runs MODIFY COLUMN triggered_by ENUM('cron','manual','health-check') NOT NULL DEFAULT 'cron'");
    }
};
