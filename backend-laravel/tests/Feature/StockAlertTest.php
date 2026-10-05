<?php

namespace Tests\Feature;

use App\Models\StockAlertSubscription;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class StockAlertTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config()->set('database.default', 'sqlite');
        config()->set('database.connections.sqlite.database', ':memory:');
        config()->set('app.url', 'http://localhost');
        config()->set('app.frontend_url', 'http://localhost:3003');
        DB::purge('sqlite');
        Mail::fake();

        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->string('subscription_type');
            $table->integer('status');
            $table->timestamp('sales_suspended_at')->nullable();
            $table->softDeletes();
        });
        Schema::create('store_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id');
            $table->integer('status');
            $table->date('expire_date');
            $table->integer('order_limit');
        });
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id');
            $table->string('name');
            $table->string('slug');
            $table->string('status');
            $table->softDeletes();
        });
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id');
            $table->integer('status');
            $table->integer('stock_quantity');
            $table->decimal('price', 10, 2);
            $table->decimal('special_price', 10, 2)->nullable();
            $table->softDeletes();
        });
        (require database_path('migrations/2026_10_05_150000_create_stock_alert_subscriptions_table.php'))->up();
        DB::table('stores')->insert(['id' => 1, 'subscription_type' => 'commission', 'status' => 1]);
        DB::table('products')->insert(['id' => 1, 'store_id' => 1, 'name' => 'Test ürünü', 'slug' => 'test-urunu', 'status' => 'approved']);
        DB::table('product_variants')->insert(['id' => 1, 'product_id' => 1, 'status' => 1, 'stock_quantity' => 0, 'price' => 100]);
    }

    public function test_subscription_requires_consent_and_out_of_stock_variant(): void
    {
        $payload = ['product_id' => 1, 'variant_id' => 1, 'email' => 'test@example.com'];
        $this->postJson('/api/v1/stock-alerts', $payload)->assertUnprocessable();
        DB::table('product_variants')->where('id', 1)->update(['stock_quantity' => 3]);
        $this->postJson('/api/v1/stock-alerts', $payload + ['consent' => true])->assertUnprocessable();
        $this->assertDatabaseCount('stock_alert_subscriptions', 0);
    }

    public function test_confirmed_subscription_receives_only_one_restored_stock_email(): void
    {
        $this->postJson('/api/v1/stock-alerts', [
            'product_id' => 1, 'variant_id' => 1, 'email' => 'TEST@example.com', 'consent' => true,
        ])->assertAccepted();
        $subscription = StockAlertSubscription::firstOrFail();
        $this->assertSame('test@example.com', $subscription->email);
        $this->assertNull($subscription->confirmed_at);

        $subscription->forceFill(['confirmation_token_hash' => hash('sha256', 'known-token')])->save();
        $this->get('/api/v1/stock-alerts/confirm/known-token')->assertRedirect('http://localhost:3003/tr/urun/test-urunu?stock_alert=confirmed');
        $this->assertNotNull($subscription->fresh()->confirmed_at);

        $this->artisan('products:dispatch-stock-alerts', ['--dry-run' => true])->assertSuccessful();
        $this->assertNull($subscription->fresh()->notified_at);
        DB::table('product_variants')->where('id', 1)->update(['stock_quantity' => 3]);
        $this->artisan('products:dispatch-stock-alerts')->assertSuccessful();
        $this->assertNotNull($subscription->fresh()->notified_at);
        $notifiedAt = $subscription->fresh()->notified_at;
        $this->artisan('products:dispatch-stock-alerts')->assertSuccessful();
        $this->assertEquals($notifiedAt, $subscription->fresh()->notified_at);
        Mail::assertSentCount(2); // confirmation and one stock return email

        $unsubscribeUrl = URL::temporarySignedRoute('stock-alerts.unsubscribe', now()->addHour(), [
            'subscription' => $subscription->id,
        ]);
        $this->get($unsubscribeUrl . 'x')->assertForbidden();
        $this->get($unsubscribeUrl)->assertRedirect('http://localhost:3003/tr?stock_alert=unsubscribed');
        $this->assertDatabaseCount('stock_alert_subscriptions', 0);
    }
}
