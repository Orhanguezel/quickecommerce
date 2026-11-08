<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_connections', function (Blueprint $t) {
            $t->id();
            $t->string('environment')->unique();
            $t->string('business_account_id');
            $t->string('phone_number_id');
            $t->string('graph_version');
            $t->text('credentials');
            $t->unsignedInteger('version')->default(1);
            $t->boolean('subscribed')->default(false);
            $t->boolean('enabled')->default(false);
            $t->boolean('pilot_mode')->default(true);
            $t->json('pilot_numbers')->nullable();
            $t->json('enabled_events')->nullable();
            $t->json('health')->nullable();
            $t->timestamp('checked_at')->nullable();
            $t->timestamp('activated_at')->nullable();
            $t->boolean('out_of_hours_enabled')->default(false);
            $t->text('out_of_hours_text')->nullable();
            $t->unsignedTinyInteger('office_start')->default(9);
            $t->unsignedTinyInteger('office_end')->default(18);
            $t->timestamps();
        });
        Schema::create('whatsapp_templates', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('connection_id');
            $t->string('name');
            $t->string('language', 15);
            $t->string('provider_id')->nullable();
            $t->string('status');
            $t->string('category');
            $t->json('components');
            $t->string('content_hash', 64);
            $t->timestamp('checked_at');
            $t->unique(['connection_id', 'name', 'language'], 'wa_template_identity');
        });
        Schema::create('whatsapp_consents', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('customer_id');
            $t->string('scope_key');
            $t->string('phone', 20);
            $t->boolean('enabled')->default(false);
            $t->string('text_version');
            $t->string('source');
            $t->timestamps();
            $t->unique(['customer_id', 'scope_key'], 'wa_consent_scope');
            $t->index('phone');
        });
        Schema::create('whatsapp_consent_events', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('customer_id')->nullable();
            $t->string('phone', 20);
            $t->string('scope_key');
            $t->boolean('enabled');
            $t->string('text_version');
            $t->string('source');
            $t->timestamp('created_at');
        });
        Schema::create('whatsapp_opt_outs', function (Blueprint $t) {
            $t->string('phone', 20)->primary();
            $t->timestamp('created_at');
        });
        Schema::create('whatsapp_messages', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->unsignedBigInteger('connection_id');
            $t->unsignedInteger('connection_version');
            $t->string('event_key', 191)->unique();
            $t->string('event_type');
            $t->string('direction', 10)->default('outbound');
            $t->unsignedBigInteger('customer_id')->nullable();
            $t->unsignedBigInteger('order_master_id')->nullable();
            $t->unsignedBigInteger('order_id')->nullable();
            $t->unsignedBigInteger('shipment_id')->nullable();
            $t->string('recipient', 191);
            $t->string('template_name')->nullable();
            $t->string('language', 15)->default('tr');
            $t->longText('payload');
            $t->string('status')->default('pending');
            $t->string('reason')->nullable();
            $t->string('provider_message_id', 191)->nullable()->unique();
            $t->unsignedInteger('attempts')->default(0);
            $t->timestamp('expires_at')->nullable();
            $t->timestamp('next_attempt_at')->nullable();
            $t->timestamp('lease_until')->nullable();
            $t->timestamp('provider_at')->nullable();
            $t->timestamp('delivered_at')->nullable();
            $t->timestamp('read_at')->nullable();
            $t->unsignedBigInteger('actor_id')->nullable();
            $t->timestamps();
            $t->index(['status', 'next_attempt_at']);
            $t->index(['customer_id', 'created_at']);
            $t->index(['order_master_id', 'created_at']);
            $t->index(['connection_id', 'recipient', 'created_at'], 'wa_conversation');
        });
        Schema::create('whatsapp_message_attempts', function (Blueprint $t) {
            $t->id();
            $t->uuid('message_id');
            $t->unsignedInteger('number');
            $t->string('status');
            $t->string('provider_message_id', 191)->nullable()->unique();
            $t->unsignedSmallInteger('http_status')->nullable();
            $t->string('error_code')->nullable();
            $t->string('request_hash', 64);
            $t->timestamp('started_at');
            $t->timestamp('finished_at')->nullable();
            $t->unique(['message_id', 'number']);
        });
        Schema::create('whatsapp_webhook_events', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('connection_id');
            $t->string('event_hash', 64)->unique();
            $t->longText('payload');
            $t->string('status')->default('pending');
            $t->string('reason')->nullable();
            $t->timestamp('processed_at')->nullable();
            $t->timestamps();
            $t->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        foreach (['whatsapp_webhook_events', 'whatsapp_message_attempts', 'whatsapp_messages', 'whatsapp_opt_outs', 'whatsapp_consent_events', 'whatsapp_consents', 'whatsapp_templates', 'whatsapp_connections'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
