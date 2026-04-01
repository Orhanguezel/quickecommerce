<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('seller_applications', function (Blueprint $table) {
            $table->string('iyzico_sub_merchant_key')->nullable()->after('status');
            $table->timestamp('iyzico_registered_at')->nullable()->after('iyzico_sub_merchant_key');
        });
    }

    public function down(): void
    {
        Schema::table('seller_applications', function (Blueprint $table) {
            $table->dropColumn(['iyzico_sub_merchant_key', 'iyzico_registered_at']);
        });
    }
};
