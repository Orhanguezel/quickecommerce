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
            $table->string('company_name', 255)->nullable()->change();
            $table->string('sector', 255)->nullable()->change();
            $table->string('tax_number', 100)->nullable()->change();
            $table->string('address_city', 100)->nullable()->change();
            $table->string('address_district', 100)->nullable()->change();
            $table->string('address_line1', 500)->nullable()->change();
            $table->string('bank_name', 255)->nullable()->change();
            $table->string('bank_account_holder', 255)->nullable()->change();
            $table->string('bank_iban', 50)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('seller_applications', function (Blueprint $table) {
            $table->string('company_name', 255)->nullable(false)->change();
            $table->string('sector', 255)->nullable(false)->change();
            $table->string('tax_number', 100)->nullable(false)->change();
            $table->string('address_city', 100)->nullable(false)->change();
            $table->string('address_district', 100)->nullable(false)->change();
            $table->string('address_line1', 500)->nullable(false)->change();
            $table->string('bank_name', 255)->nullable(false)->change();
            $table->string('bank_account_holder', 255)->nullable(false)->change();
            $table->string('bank_iban', 50)->nullable(false)->change();
        });
    }
};
