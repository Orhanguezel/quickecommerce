<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('seller_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Company info
            $table->string('company_name');
            $table->string('brand_name')->nullable();
            $table->string('sector');
            $table->string('tax_office')->nullable();
            $table->string('tax_number');
            $table->string('mersis_number')->nullable();
            $table->string('website_url')->nullable();

            // Address
            $table->string('address_country')->default('Türkiye');
            $table->string('address_city');
            $table->string('address_district');
            $table->string('address_postal_code')->nullable();
            $table->text('address_line1');
            $table->string('address_line2')->nullable();

            // Bank info
            $table->string('bank_name');
            $table->string('bank_account_holder');
            $table->string('bank_iban');
            $table->string('bank_account_number')->nullable();
            $table->string('bank_branch_code')->nullable();
            $table->string('bank_swift_code')->nullable();

            // Application
            $table->text('note')->nullable();
            $table->tinyInteger('status')->default(0); // 0=pending, 1=approved, 2=rejected
            $table->text('admin_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_applications');
    }
};
