<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Urunun ne zamandan beri satilamaz oldugu. products:track-sellability doldurur;
 * urun detay API'si onayli + acik magazali ama stoksuz urunu 30 gun sonra
 * noindex'e alir (GSC 2026-09-25 indeks raporu, S1).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('products', 'unsellable_since')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            $table->timestamp('unsellable_since')->nullable()->index();
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('products', 'unsellable_since')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['unsellable_since']);
            $table->dropColumn('unsellable_since');
        });
    }
};
