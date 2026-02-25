<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('background_color', 20)->default('#1B4B8B');
            $table->string('title_color', 20)->default('#FFFFFF');
            $table->string('description_color', 20)->default('#E8F0FE');
            $table->string('button_text')->nullable();
            $table->string('button_text_color', 20)->default('#FFFFFF');
            $table->string('button_bg_color', 20)->default('#FF6B35');
            $table->string('button_url')->nullable();
            $table->decimal('min_order_value', 12, 2)->default(1000.00);
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_campaigns');
    }
};
