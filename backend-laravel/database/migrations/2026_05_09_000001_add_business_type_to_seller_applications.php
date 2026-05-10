<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seller_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('seller_applications', 'business_type')) {
                $table->string('business_type', 20)
                    ->default('company')
                    ->after('user_id')
                    ->comment('individual or company');
            }
        });
    }

    public function down(): void
    {
        Schema::table('seller_applications', function (Blueprint $table) {
            if (Schema::hasColumn('seller_applications', 'business_type')) {
                $table->dropColumn('business_type');
            }
        });
    }
};
