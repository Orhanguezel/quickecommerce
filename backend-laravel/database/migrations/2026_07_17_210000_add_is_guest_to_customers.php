<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Misafir (guest) checkout: uyeliksiz siparis veren musteriler is_guest=1 ile
 * isaretlenir. Kayitli (sifre belirlemis) hesaplardan ayrilir; guest hesap
 * guest-checkout ile tekrar kullanilabilir, kayitli hesap giris ister.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'is_guest')) {
                $table->boolean('is_guest')->default(false)->after('verified');
            }
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (Schema::hasColumn('customers', 'is_guest')) {
                $table->dropColumn('is_guest');
            }
        });
    }
};
