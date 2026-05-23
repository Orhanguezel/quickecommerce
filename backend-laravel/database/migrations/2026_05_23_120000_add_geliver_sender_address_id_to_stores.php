<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            // GdeliveryService::buildShipmentData zaten bu alani okuyordu,
            // ama kolon yoktu -> her zaman global fallback kullaniyordu.
            // Codex'in Gorev 1 (per-seller sender) implementasyonu icin kolon eklenir.
            $table->string('geliver_sender_address_id', 64)
                ->nullable()
                ->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn('geliver_sender_address_id');
        });
    }
};
