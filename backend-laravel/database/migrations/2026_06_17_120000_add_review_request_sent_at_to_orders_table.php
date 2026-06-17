<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Teslimat sonrasi "deneyiminizi paylasin" davet e-postasinin gonderildigi an.
            // NULL = henuz gonderilmedi. Tekrar gonderimi engeller.
            $table->timestamp('review_request_sent_at')->nullable()->after('delivery_completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('review_request_sent_at');
        });
    }
};
