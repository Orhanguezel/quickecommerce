<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasColumn('stores', 'geliver_sender_address_id')) {
            return;
        }

        Schema::table('stores', function (Blueprint $table) {
            $table->string('geliver_sender_address_id')->nullable()->after('address');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('stores', 'geliver_sender_address_id')) {
            return;
        }

        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn('geliver_sender_address_id');
        });
    }
};
