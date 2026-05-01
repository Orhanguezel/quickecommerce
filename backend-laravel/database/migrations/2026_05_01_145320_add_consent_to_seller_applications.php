<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('seller_applications', function (Blueprint $table) {
            // KVKK / Aydınlatma Metni / Üye Sözleşmesi onaylarının verildiği an.
            // Tek timestamp tutuyoruz; başvuru ekranında üç checkbox ayrı ayrı
            // zorunlu, ama yasal olarak hepsi tek anda işaretlenip submit edildiği
            // için ayrı sütunlara bölmek gereksiz.
            $table->timestamp('consent_at')->nullable()->after('admin_note');
        });
    }

    public function down(): void
    {
        Schema::table('seller_applications', function (Blueprint $table) {
            $table->dropColumn('consent_at');
        });
    }
};
