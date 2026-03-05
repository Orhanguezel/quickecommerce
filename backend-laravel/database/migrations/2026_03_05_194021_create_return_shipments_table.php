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
        Schema::create('return_shipments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_refund_id');
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('store_id');
            $table->string('geliver_shipment_id')->nullable();
            $table->string('geliver_transaction_id')->nullable();
            $table->string('carrier_name')->nullable();
            $table->string('barcode')->nullable();
            $table->string('tracking_number')->nullable();
            $table->text('label_url')->nullable();
            $table->enum('status', ['pending', 'label_created', 'in_transit', 'delivered', 'cancelled'])->default('pending');
            $table->json('raw_response')->nullable();
            $table->timestamps();

            $table->foreign('order_refund_id')->references('id')->on('order_refunds')->onDelete('cascade');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->index('order_id');
            $table->index('order_refund_id');
            $table->index('tracking_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_shipments');
    }
};
