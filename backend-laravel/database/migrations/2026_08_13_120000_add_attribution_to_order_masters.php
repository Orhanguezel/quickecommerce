<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_masters', function (Blueprint $table) {
            $table->boolean('is_test')->default(false)->after('customer_id')->index();
            $table->string('visitor_id', 100)->nullable()->after('is_test')->index();
            $table->string('session_id', 100)->nullable()->after('visitor_id')->index();
            $table->string('cart_session_id', 100)->nullable()->after('session_id')->index();
            $table->string('utm_source', 100)->nullable()->after('cart_session_id')->index();
            $table->string('utm_medium', 100)->nullable()->after('utm_source');
            $table->string('utm_campaign', 190)->nullable()->after('utm_medium')->index();
            $table->string('utm_term', 190)->nullable()->after('utm_campaign');
            $table->string('utm_content', 190)->nullable()->after('utm_term');
            $table->text('landing_page')->nullable()->after('utm_content');
            $table->text('referrer')->nullable()->after('landing_page');
        });
    }

    public function down(): void
    {
        Schema::table('order_masters', function (Blueprint $table) {
            $table->dropIndex(['visitor_id']);
            $table->dropIndex(['is_test']);
            $table->dropIndex(['session_id']);
            $table->dropIndex(['cart_session_id']);
            $table->dropIndex(['utm_source']);
            $table->dropIndex(['utm_campaign']);
            $table->dropColumn([
                'is_test', 'visitor_id', 'session_id', 'cart_session_id', 'utm_source',
                'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                'landing_page', 'referrer',
            ]);
        });
    }
};
