<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Alarm yasam dongusu: alarmlar artik "cozulebilir".
     *  - resolved_at: cozulme zamani (null = ACIK alarm)
     *  - resolved_by: 'auto' (kaynak basarili scrape edince) veya admin adi/email
     * Feed varsayilan olarak sadece ACIK alarmlari gosterir -> bayat gurultu biter.
     */
    public function up(): void
    {
        Schema::table('scraper_alerts', function (Blueprint $table) {
            if (!Schema::hasColumn('scraper_alerts', 'resolved_at')) {
                $table->timestamp('resolved_at')->nullable()->after('sent_at');
            }
            if (!Schema::hasColumn('scraper_alerts', 'resolved_by')) {
                $table->string('resolved_by', 120)->nullable()->after('resolved_at');
            }
            $table->index(['source_name', 'resolved_at'], 'sa_source_resolved_idx');
        });
    }

    public function down(): void
    {
        Schema::table('scraper_alerts', function (Blueprint $table) {
            $table->dropIndex('sa_source_resolved_idx');
            $table->dropColumn(['resolved_at', 'resolved_by']);
        });
    }
};
