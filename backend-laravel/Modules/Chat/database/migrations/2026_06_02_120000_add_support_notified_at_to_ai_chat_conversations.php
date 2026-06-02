<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_chat_conversations', function (Blueprint $table) {
            // Canli destek talebi admine bildirildiginde isaretlenir;
            // ayni konusmada tekrar tekrar bildirim gonderilmesini engeller.
            $table->timestamp('support_notified_at')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('ai_chat_conversations', function (Blueprint $table) {
            $table->dropColumn('support_notified_at');
        });
    }
};
