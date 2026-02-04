<?php

use App\Enums\Behaviour;
use App\Enums\StatusType;
use App\Enums\StoreType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('store_id');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('brand_id')->nullable();
            $table->unsignedBigInteger('unit_id')->nullable();
            $table->enum('type', array_map(fn($enum) => $enum->value, StoreType::cases()))->nullable();
            $table->enum('behaviour', array_map(fn($enum) => $enum->value, Behaviour::cases()))->nullable(); //1. product 2. consu 3. combo 4. service
            $table->string('name');
            $table->string('slug')->unique();
            $table->longText('description')->nullable();
            $table->string('image')->nullable();
            $table->string('video_url')->nullable();
            $table->string('gallery_images')->nullable();
            $table->string('warranty')->nullable();
            $table->string('class')->nullable(); //This will control product attribute, different attribute for food/medicine/cloth
            $table->string('return_in_days')->nullable();
            $table->string('return_text')->nullable(); // Ex:  Days return Policy, Box Required
            $table->string('allow_change_in_mind')->nullable(); // if product change (any additional requirements)
            $table->integer('cash_on_delivery')->nullable();
            $table->string('delivery_time_min')->nullable();
            $table->string('delivery_time_max')->nullable();
            $table->string('delivery_time_text')->nullable();
            $table->integer('max_cart_qty')->nullable();
            $table->integer('order_count')->nullable();
            $table->integer('views')->default(0);
            $table->enum('status', array_map(fn($enum) => $enum->value, StatusType::cases()))->default('pending'); //pending, approved, inactive, suspended
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            $table->text('meta_image')->nullable();
            $table->timestamp('available_time_starts')->nullable(); // Only for Food Item
            $table->timestamp('available_time_ends')->nullable(); // Only for Food Item
            $table->date('manufacture_date')->nullable(); // Items like medicine
            $table->date('expiry_date')->nullable(); // Items like medicine
            $table->boolean('is_featured')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
