<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('e_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained('orders')->cascadeOnDelete();
            $table->unsignedBigInteger('service_invoice_id')->nullable();
            $table->string('status', 20)->default('pending');
            $table->string('type', 10)->default('earsiv');
            $table->string('ettn', 36)->nullable();
            $table->string('invoice_number', 64)->nullable();
            $table->string('pdf_url', 500)->nullable();
            $table->text('error_message')->nullable();
            $table->json('last_webhook_payload')->nullable();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('service_invoice_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('e_invoices');
    }
};
