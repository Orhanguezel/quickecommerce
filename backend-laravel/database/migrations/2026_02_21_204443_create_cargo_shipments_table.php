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
        Schema::create('cargo_shipments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('store_id');
            $table->string('geliver_shipment_id')->nullable();
            $table->string('geliver_transaction_id')->nullable();
            $table->string('carrier_name')->nullable();       // Aras, Yurtiçi, vb.
            $table->string('barcode')->nullable();
            $table->string('tracking_number')->nullable();
            $table->text('label_url')->nullable();
            $table->enum('status', ['pending', 'shipped', 'in_transit', 'delivered', 'cancelled'])->default('pending');
            $table->enum('created_by_type', ['admin', 'seller'])->default('admin');
            $table->unsignedBigInteger('created_by_id')->nullable();
            $table->json('raw_response')->nullable();         // Geliver'dan gelen ham JSON
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->index('order_id');
            $table->index('tracking_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cargo_shipments');
    }
};
