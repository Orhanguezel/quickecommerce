<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Ürün adından extract edilen ağırlık (gram veya ml normalize).
            // Filter için index. Nullable — extract edilemeyenler (örn. "60 Adet")
            // NULL kalır, weight filter sonuçlarında gözükmez.
            $table->unsignedInteger('extracted_weight_gr')->nullable()->after('image');
            $table->index('extracted_weight_gr');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['extracted_weight_gr']);
            $table->dropColumn('extracted_weight_gr');
        });
    }
};
