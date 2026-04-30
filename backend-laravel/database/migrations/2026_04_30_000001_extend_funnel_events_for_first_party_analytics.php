<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('funnel_events', function (Blueprint $table) {
            $table->string('visitor_id', 64)->nullable()->after('subject')->index();
            $table->string('session_id', 64)->nullable()->after('visitor_id')->index();

            $table->string('ip_address', 45)->nullable()->after('customer_id')->index();
            $table->text('user_agent')->nullable()->after('ip_address');
            $table->text('referer')->nullable()->after('user_agent');
            $table->text('url')->nullable()->after('referer');
            $table->string('path', 512)->nullable()->after('url')->index();
            $table->string('locale', 8)->nullable()->after('path')->index();

            $table->string('device_type', 32)->nullable()->after('locale')->index();
            $table->string('browser', 64)->nullable()->after('device_type');
            $table->string('os', 64)->nullable()->after('browser');
            $table->boolean('is_bot')->default(false)->after('os')->index();

            $table->string('utm_source', 128)->nullable()->after('is_bot')->index();
            $table->string('utm_medium', 128)->nullable()->after('utm_source')->index();
            $table->string('utm_campaign', 255)->nullable()->after('utm_medium')->index();
            $table->string('utm_term', 255)->nullable()->after('utm_campaign');
            $table->string('utm_content', 255)->nullable()->after('utm_term');

            $table->unsignedBigInteger('category_id')->nullable()->after('product_id')->index();
            $table->unsignedBigInteger('order_id')->nullable()->after('category_id')->index();

            $table->index(['event', 'created_at'], 'funnel_events_event_created_idx');
            $table->index(['session_id', 'created_at'], 'funnel_events_session_created_idx');
            $table->index(['visitor_id', 'created_at'], 'funnel_events_visitor_created_idx');
        });
    }

    public function down(): void
    {
        Schema::table('funnel_events', function (Blueprint $table) {
            $table->dropIndex('funnel_events_event_created_idx');
            $table->dropIndex('funnel_events_session_created_idx');
            $table->dropIndex('funnel_events_visitor_created_idx');

            $table->dropColumn([
                'visitor_id',
                'session_id',
                'ip_address',
                'user_agent',
                'referer',
                'url',
                'path',
                'locale',
                'device_type',
                'browser',
                'os',
                'is_bot',
                'utm_source',
                'utm_medium',
                'utm_campaign',
                'utm_term',
                'utm_content',
                'category_id',
                'order_id',
            ]);
        });
    }
};
