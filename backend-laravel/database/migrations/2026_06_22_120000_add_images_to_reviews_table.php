<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Müşterilerin yorumlarına eklediği görsellerin media ID'lerini
     * virgülle ayrılmış olarak tutar (products.gallery_images konvansiyonu).
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('reviews', 'images')) {
                $table->text('images')->nullable()->after('review');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (Schema::hasColumn('reviews', 'images')) {
                $table->dropColumn('images');
            }
        });
    }
};
