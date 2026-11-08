<?php

namespace Tests\Feature;

use App\Models\WhatsappConnection;
use App\Models\WhatsappMessage;
use App\Models\WhatsappWebhookEvent;
use App\Services\Whatsapp\WhatsappConnectionService;
use App\Services\Whatsapp\WhatsappConsentService;
use App\Services\Whatsapp\WhatsappMessageRecorder;
use App\Services\Whatsapp\WhatsappSender;
use App\Services\Whatsapp\WhatsappWebhookProcessor;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Tests\TestCase;

class WhatsappTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:', 'app.key' => 'base64:'.base64_encode(str_repeat('t', 32)), 'whatsapp.enabled' => true]);
        DB::purge('sqlite');
        (require database_path('migrations/2026_11_08_170000_create_whatsapp_tables.php'))->up();
        Queue::fake();
        Http::preventStrayRequests();
    }

    private function connection(): WhatsappConnection
    {
        return WhatsappConnection::create(['environment' => app()->environment(), 'business_account_id' => '123', 'phone_number_id' => '456', 'graph_version' => 'v23.0', 'credentials' => ['access_token' => 'test-token', 'app_secret' => 'test-secret', 'verify_token' => 'test-verify'], 'enabled' => true, 'subscribed' => true, 'pilot_mode' => true, 'pilot_numbers' => ['+905321234567'], 'enabled_events' => ['payment_confirmed'], 'health' => ['connected' => true, 'messaging_status' => 'AVAILABLE'], 'checked_at' => now()]);
    }

    private function message(WhatsappConnection $c): WhatsappMessage
    {
        return WhatsappMessage::create(['id' => (string) Str::uuid(), 'connection_id' => $c->id, 'connection_version' => $c->version, 'event_key' => (string) Str::uuid(), 'event_type' => 'reply', 'recipient' => '+905321234567', 'payload' => ['body' => 'Test'], 'status' => 'pending', 'expires_at' => now()->addHour(), 'next_attempt_at' => now()]);
    }

    private function incoming(WhatsappConnection $c): WhatsappMessage
    {
        $m = $this->message($c);
        $m->update(['direction' => 'inbound', 'status' => 'received', 'provider_at' => now(), 'event_type' => 'inbound']);

        return $m;
    }

    public function test_secrets_and_bodies_are_encrypted_and_hidden(): void
    {
        $c = $this->connection();
        $m = $this->message($c);
        $this->assertStringNotContainsString('test-token', DB::table('whatsapp_connections')->value('credentials'));
        $this->assertArrayNotHasKey('credentials', $c->toArray());
        $this->assertStringNotContainsString('Test', DB::table('whatsapp_messages')->value('payload'));
        $this->assertSame('Test', $m->fresh()->payload['body']);
    }

    public function test_duplicate_business_event_is_recorded_once(): void
    {
        $this->connection();
        $recorder = app(WhatsappMessageRecorder::class);
        $a = $recorder->record('payment_confirmed', 'master:1', 1, null, ['A', '1', '10 TRY']);
        $b = $recorder->record('payment_confirmed', 'master:1', 1, null, ['A', '1', '10 TRY']);
        $this->assertSame($a->id, $b->id);
        $this->assertSame(1, WhatsappMessage::count());
        $this->assertSame('consent_missing', $a->reason);
        Queue::assertNothingPushed();
    }

    public function test_optout_suppresses_queued_messages(): void
    {
        $c = $this->connection();
        $m = $this->message($c);
        $service = app(WhatsappConsentService::class);
        $service->save(1, 'account:1', '+905321234567', true, 'test');
        $service->optOut('+905321234567');
        $this->assertNull($service->resolve(1, null));
        $this->assertSame('suppressed', $m->fresh()->status);
    }

    public function test_timeout_becomes_unknown_and_is_not_retried(): void
    {
        $c = $this->connection();
        $this->incoming($c);
        $m = $this->message($c);
        Http::fake(fn () => throw new \Illuminate\Http\Client\ConnectionException('timeout'));
        app(WhatsappSender::class)->send($m->id);
        $this->assertSame('unknown', $m->fresh()->status);
        app(WhatsappSender::class)->send($m->id);
        $this->assertSame(1, $m->fresh()->attempts);
    }

    public function test_success_sends_once(): void
    {
        $c = $this->connection();
        $this->incoming($c);
        $m = $this->message($c);
        Http::fake(['*' => Http::response(['messages' => [['id' => 'wamid.test']]])]);
        app(WhatsappSender::class)->send($m->id);
        app(WhatsappSender::class)->send($m->id);
        $this->assertSame('accepted', $m->fresh()->status);
        Http::assertSentCount(1);
    }

    public function test_early_and_out_of_order_statuses_reconcile_monotonically(): void
    {
        $c = $this->connection();
        $m = $this->message($c);
        $event = WhatsappWebhookEvent::create(['connection_id' => $c->id, 'event_hash' => hash('sha256', 'read'), 'payload' => ['entry' => [['id' => '123', 'changes' => [['value' => ['metadata' => ['phone_number_id' => '456'], 'statuses' => [['id' => 'wamid.test', 'status' => 'read', 'timestamp' => time()]]]]]]]]]);
        $processor = app(WhatsappWebhookProcessor::class);
        $processor->process($event->id);
        $this->assertSame('unmatched', $event->fresh()->status);
        $m->update(['provider_message_id' => 'wamid.test', 'status' => 'accepted']);
        $processor->reconcile($c->id, 'wamid.test');
        $this->assertSame('read', $m->fresh()->status);
        $payload = $event->payload;
        $payload['entry'][0]['changes'][0]['value']['statuses'][0]['status'] = 'sent';
        $event->update(['payload' => $payload, 'status' => 'pending']);
        $processor->process($event->id);
        $this->assertSame('read', $m->fresh()->status);
    }

    public function test_pilot_and_kill_switch_prevent_network_requests(): void
    {
        $c = $this->connection();
        $this->incoming($c);
        $m = $this->message($c);
        $c->update(['pilot_numbers' => []]);
        app(WhatsappSender::class)->send($m->id);
        $this->assertSame('outside_pilot', $m->fresh()->reason);
        Http::assertNothingSent();
        $m2 = $this->message($c);
        config(['whatsapp.enabled' => false]);
        app(WhatsappSender::class)->send($m2->id);
        $this->assertSame('channel_disabled', $m2->fresh()->reason);
    }

    public function test_rolled_back_event_does_not_dispatch(): void
    {
        $this->connection();
        DB::beginTransaction();
        app(WhatsappMessageRecorder::class)->record('payment_confirmed', 'master:1', 1, null, ['A', '1', '10 TRY']);
        DB::rollBack();
        $this->assertSame(0, WhatsappMessage::count());
        Queue::assertNothingPushed();
    }

    public function test_webhook_signature_and_account_isolation(): void
    {
        $this->connection();
        $controller = app(\App\Http\Controllers\Api\V1\Whatsapp\WebhookController::class);
        $payload = json_encode(['object' => 'whatsapp_business_account', 'entry' => [['id' => 'OTHER', 'changes' => [['value' => ['metadata' => ['phone_number_id' => '456']]]]]]]);
        $request = \Illuminate\Http\Request::create('/api/v1/webhooks/whatsapp', 'POST', [], [], [], ['HTTP_X_HUB_SIGNATURE_256' => 'sha256='.hash_hmac('sha256', $payload, 'test-secret')], $payload);
        $this->assertSame(200, $controller->receive($request)->getStatusCode());
        $controller->receive($request);
        $this->assertSame(1, WhatsappWebhookEvent::count());
        $this->assertSame('quarantined', WhatsappWebhookEvent::first()->status);
        $request->headers->set('X-Hub-Signature-256', 'sha256=invalid');
        try {
            $controller->receive($request);
            $this->fail('Invalid signature accepted');
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertSame(403, $e->getStatusCode());
        }
    }

    public function test_reconnect_invalidates_old_messages_and_preserves_secret_encryption(): void
    {
        $c = $this->connection();
        $m = $this->message($c);
        Http::fake(fn ($r) => Http::response(str_contains($r->url(), '/phone_numbers') ? ['data' => [['id' => '456']]] : (str_contains($r->url(), '/456') ? ['id' => '456', 'status' => 'CONNECTED', 'platform_type' => 'CLOUD_API'] : ['health_status' => ['can_send_message' => 'AVAILABLE']])));
        $updated = app(WhatsappConnectionService::class)->connect(['business_account_id' => '123', 'phone_number_id' => '456', 'access_token' => 'new-test-token', 'app_secret' => 'new-test-secret']);
        $this->assertSame(2, $updated->version);
        $this->assertFalse($updated->enabled);
        $this->assertSame('new-test-token', $updated->fresh()->credentials['access_token']);
        $updated->update(['enabled' => true]);
        app(WhatsappSender::class)->send($m->id);
        $this->assertSame('connection_changed', $m->fresh()->reason);
    }

    public function test_shared_waba_is_rejected_without_subscription_write(): void
    {
        Http::fake(['*' => Http::response(['data' => [['id' => '456'], ['id' => '789']]])]);
        try {
            app(WhatsappConnectionService::class)->connect(['business_account_id' => '123', 'phone_number_id' => '456', 'access_token' => 'test', 'app_secret' => 'test']);
            $this->fail('Shared account accepted');
        } catch (\Illuminate\Validation\ValidationException) {
            $this->assertSame(0, WhatsappConnection::count());
        }
        Http::assertSentCount(1);
    }

    public function test_inbound_optout_is_idempotent(): void
    {
        $c = $this->connection();
        $m = $this->message($c);
        app(WhatsappConsentService::class)->save(1, 'account:1', '+905321234567', true, 'test');
        $event = WhatsappWebhookEvent::create(['connection_id' => $c->id, 'event_hash' => hash('sha256', 'stop'), 'payload' => ['entry' => [['id' => '123', 'changes' => [['value' => ['metadata' => ['phone_number_id' => '456'], 'messages' => [['id' => 'wamid.stop', 'from' => '905321234567', 'timestamp' => time(), 'type' => 'text', 'text' => ['body' => 'DUR']]]]]]]]]]);
        $processor = app(WhatsappWebhookProcessor::class);
        $processor->process($event->id);
        $processor->process($event->id);
        $this->assertSame(1, WhatsappMessage::where('direction', 'inbound')->count());
        $this->assertSame('suppressed', $m->fresh()->status);
        $this->assertNull(app(WhatsappConsentService::class)->resolve(1, null));
    }

    public function test_expired_lease_becomes_unknown_without_send_retry(): void
    {
        $c = $this->connection();
        $m = $this->message($c);
        $m->update(['status' => 'sending', 'lease_until' => now()->subMinute()]);
        $this->artisan('whatsapp:dispatch')->assertSuccessful();
        $this->assertSame('unknown', $m->fresh()->status);
        Queue::assertNothingPushed();
        Http::assertNothingSent();
    }

    public function test_order_consent_overrides_account_and_phone_change_blocks_old_snapshot(): void
    {
        $this->connection();
        $service = app(WhatsappConsentService::class);
        $service->save(1, 'account:1', '+905321234567', true, 'test');
        $service->save(1, 'order:7', '+905321234567', false, 'test');
        $this->assertNull($service->resolve(1, 7));
        $this->assertNotNull($service->resolve(1, 8));
        $service->save(1, 'account:1', '+905331234567', true, 'test');
        $this->assertSame('+905331234567', $service->resolve(1, null)->phone);
    }

    private function template(WhatsappConnection $c, string $status = 'APPROVED'): void
    {
        DB::table('whatsapp_templates')->insert(['connection_id' => $c->id, 'name' => 'sportoonline_payment_confirmed_v1', 'language' => 'tr', 'status' => $status, 'category' => 'UTILITY', 'components' => json_encode([['type' => 'BODY', 'text' => 'Merhaba {{1}}, sipariş {{2}}, tutar {{3}}.']]), 'content_hash' => hash('sha256', 'test'), 'checked_at' => now()]);
    }

    public function test_pending_template_and_wrong_parameter_schema_cannot_send(): void
    {
        $c = $this->connection();
        $this->template($c, 'PENDING');
        $templates = app(\App\Services\Whatsapp\WhatsappTemplateService::class);
        $this->assertNull($templates->approved($c->id, 'sportoonline_payment_confirmed_v1', 3));
        DB::table('whatsapp_templates')->update(['status' => 'APPROVED']);
        $this->assertNotNull($templates->approved($c->id, 'sportoonline_payment_confirmed_v1', 3));
        $this->assertNull($templates->approved($c->id, 'sportoonline_payment_confirmed_v1', 2));
        $this->assertNull($templates->approved($c->id, 'sportoonline_payment_confirmed_v1', 3, 'changed'));
        Http::assertNothingSent();
    }

    public function test_ready_outbox_is_only_dispatched_after_commit(): void
    {
        $c = $this->connection();
        $this->template($c);
        app(WhatsappConsentService::class)->save(1, 'account:1', '+905321234567', true, 'test');
        DB::beginTransaction();
        $m = app(WhatsappMessageRecorder::class)->record('payment_confirmed', 'master:7', 1, null, ['A', '7', '10 TRY']);
        $this->assertSame('pending', $m->status);
        Queue::assertNothingPushed();
        DB::commit();
        Queue::assertPushed(\App\Jobs\SendWhatsappMessageJob::class, 1);
        Http::assertNothingSent();
    }

    public function test_ready_outbox_rolls_back_without_queue_side_effect(): void
    {
        $c = $this->connection();
        $this->template($c);
        app(WhatsappConsentService::class)->save(1, 'account:1', '+905321234567', true, 'test');
        DB::beginTransaction();
        app(WhatsappMessageRecorder::class)->record('payment_confirmed', 'master:7', 1, null, ['A', '7', '10 TRY']);
        DB::rollBack();
        $this->assertSame(0, WhatsappMessage::count());
        Queue::assertNothingPushed();
    }

    public function test_definite_rate_limit_rejection_is_retryable_but_server_error_is_unknown(): void
    {
        $c = $this->connection();
        $this->incoming($c);
        $m = $this->message($c);
        Http::fake(['*' => Http::sequence()->push(['error' => ['code' => 130429]], 429)->push(['error' => ['code' => 1]], 500)]);
        app(WhatsappSender::class)->send($m->id);
        $this->assertSame('retry_wait', $m->fresh()->status);
        $this->assertTrue($m->fresh()->next_attempt_at->isFuture());
        $this->travel(11)->seconds();
        $n = $this->message($c);
        app(WhatsappSender::class)->send($n->id);
        $this->assertSame('unknown', $n->fresh()->status);
    }

    public function test_expired_window_and_stale_health_block_network(): void
    {
        $c = $this->connection();
        $in = $this->incoming($c);
        $in->update(['provider_at' => now()->subHours(25)]);
        $m = $this->message($c);
        app(WhatsappSender::class)->send($m->id);
        $this->assertSame('conversation_window_closed', $m->fresh()->reason);
        $c->update(['checked_at' => now()->subHour()]);
        $n = $this->message($c);
        app(WhatsappSender::class)->send($n->id);
        $this->assertSame('connection_not_ready', $n->fresh()->reason);
        Http::assertNothingSent();
    }

    public function test_unpaid_payment_and_label_only_shipment_create_no_event(): void
    {
        $this->connection();
        $master = new \App\Models\OrderMaster(['payment_status' => 'pending']);
        app(\App\Services\Whatsapp\WhatsappEventService::class)->payment($master);
        app(\App\Services\Whatsapp\WhatsappEventService::class)->shipment(new \App\Models\CargoShipment(['status' => 'created', 'barcode' => 'label']));
        $this->assertSame(0, WhatsappMessage::count());
        Http::assertNothingSent();
    }

    public function test_duplicate_payment_and_two_shipments_use_business_identity(): void
    {
        $c = $this->connection();
        $c->update(['enabled_events' => array_keys(config('whatsapp.events'))]);
        $master = new \App\Models\OrderMaster(['payment_status' => 'paid', 'customer_id' => 1, 'order_amount' => 100, 'currency_code' => 'TRY']);
        $master->id = 7;
        $master->setRelation('customer', new \App\Models\Customer(['first_name' => 'Test']));
        $events = app(\App\Services\Whatsapp\WhatsappEventService::class);
        for ($i = 0; $i < 10; $i++) {
            $events->payment($master);
        }
        foreach ([1, 2] as $id) {
            $order = new \App\Models\Order;
            $order->id = $id;
            $order->setRelation('orderMaster', $master);
            $shipment = new \App\Models\CargoShipment(['status' => 'in_transit', 'tracking_number' => 'track'.$id]);
            $shipment->id = $id;
            $shipment->setRelation('order', $order);
            $events->shipment($shipment);
        }
        $this->assertSame(1, WhatsappMessage::where('event_type', 'payment_confirmed')->count());
        $this->assertSame(2, WhatsappMessage::where('event_type', 'shipment_dispatched')->count());
    }

    public function test_unknown_inbound_identity_is_quarantined_without_fabricated_phone(): void
    {
        $c = $this->connection();
        $event = WhatsappWebhookEvent::create(['connection_id' => $c->id, 'event_hash' => hash('sha256', 'opaque'), 'payload' => ['entry' => [['id' => '123', 'changes' => [['value' => ['metadata' => ['phone_number_id' => '456'], 'messages' => [['id' => 'opaque', 'from' => 'opaque-identity', 'type' => 'text']]]]]]]]]);
        app(WhatsappWebhookProcessor::class)->process($event->id);
        $this->assertSame('quarantined', $event->fresh()->status);
        $this->assertSame(0, WhatsappMessage::count());
        $this->assertNotEmpty($event->fresh()->payload);
    }

    public function test_seller_cannot_access_whatsapp_admin_middleware(): void
    {
        $r = \Illuminate\Http\Request::create('/api/v1/admin/whatsapp');
        $r->setUserResolver(fn () => new \App\Models\User(['activity_scope' => 'store_level']));
        try {
            app(\App\Http\Middleware\WhatsappAdmin::class)->handle($r,fn () => response('unsafe'));
            $this->fail('Seller allowed');
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertSame(403,$e->getStatusCode());
        }
    }

    public function test_migration_rolls_back_only_whatsapp_tables(): void
    {
        $migration = require database_path('migrations/2026_11_08_170000_create_whatsapp_tables.php');
        $migration->down();
        $this->assertFalse(\Illuminate\Support\Facades\Schema::hasTable('whatsapp_messages'));
        $migration->up();
        $this->assertTrue(\Illuminate\Support\Facades\Schema::hasTable('whatsapp_messages'));
    }
    public function test_legacy_checkout_does_not_inherit_account_consent(): void
    {
        $this->connection();
        app(WhatsappConsentService::class)->save(1, 'account:1', '+905321234567', true, 'test');
        $master = new \App\Models\OrderMaster(['customer_id' => 1, 'payment_gateway' => 'iyzico']);
        $master->id = 7;
        app(\App\Services\Whatsapp\WhatsappEventService::class)->created($master, []);
        $this->assertNull(app(WhatsappConsentService::class)->resolve(1, 7));
        $this->assertNotNull(app(WhatsappConsentService::class)->resolve(1, null));
    }
    public function test_readonly_admin_mutation_is_rejected(): void
    {
        $roleQuery = \Mockery::mock(\Illuminate\Database\Eloquent\Relations\BelongsToMany::class);
        $roleQuery->shouldReceive('where')->with('read_only', true)->andReturnSelf();
        $roleQuery->shouldReceive('exists')->andReturnTrue();
        $user = \Mockery::mock(\App\Models\User::class)->makePartial();
        $user->shouldReceive('roles')->andReturn($roleQuery);
        $guard = \Mockery::mock(); $guard->shouldReceive('user')->andReturn($user);
        \Illuminate\Support\Facades\Auth::shouldReceive('guard')->with('sanctum')->andReturn($guard);
        $request = \Illuminate\Http\Request::create('/api/v1/admin/whatsapp/connect', 'POST');
        $response = app(\App\Http\Middleware\RestrictReadOnlyAdmin::class)->handle($request, fn () => response('unsafe'));
        $this->assertSame(403, $response->getStatusCode());
    }
}
