<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kargo entegrasyonu için il (city_name) ve ilçe (district_name) alanları eklendi.
 * SURAT ve diğer taşıyıcılar bu alanları zorunlu tutar.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_addresses', function (Blueprint $table) {
            $table->string('city_name', 100)->nullable()->after('area_id')->comment('İl adı (örn: İzmir)');
            $table->string('district_name', 100)->nullable()->after('city_name')->comment('İlçe adı (örn: Karşıyaka)');
        });

        Schema::table('order_addresses', function (Blueprint $table) {
            $table->string('city_name', 100)->nullable()->after('area_id')->comment('İl adı (örn: İzmir)');
            $table->string('district_name', 100)->nullable()->after('city_name')->comment('İlçe adı (örn: Karşıyaka)');
        });
    }

    public function down(): void
    {
        Schema::table('customer_addresses', function (Blueprint $table) {
            $table->dropColumn(['city_name', 'district_name']);
        });

        Schema::table('order_addresses', function (Blueprint $table) {
            $table->dropColumn(['city_name', 'district_name']);
        });
    }
};
