<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('wishlists', function (Blueprint $table) {
            $table->boolean('price_alert_enabled')->default(true);
            $table->boolean('price_alert_email')->default(false);
            $table->boolean('price_alert_push')->default(false);
            $table->json('price_alert_snapshot')->nullable();
            $table->json('price_alert_notified')->nullable();
            $table->timestamp('last_price_alert_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('wishlists', fn (Blueprint $table) => $table->dropColumn([
            'price_alert_enabled', 'price_alert_email', 'price_alert_push',
            'price_alert_snapshot', 'price_alert_notified', 'last_price_alert_at',
        ]));
    }
};
