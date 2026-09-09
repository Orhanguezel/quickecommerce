<?php

namespace Tests\Unit;

use App\Http\Controllers\Api\V1\Customer\WishListManageController;
use App\Models\Customer;
use App\Models\UniversalNotification;
use App\Models\Wishlist;
use App\Services\WishlistPriceAlertService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class WishlistPriceAlertTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'wishlist_testing', 'database.connections.wishlist_testing' => [
            'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true,
        ]]);
        DB::purge('wishlist_testing');
        Queue::fake();
        Schema::create('stores', function (Blueprint $t) {
            $t->id(); $t->integer('status'); $t->string('subscription_type'); $t->timestamp('sales_suspended_at')->nullable(); $t->softDeletes();
        });
        Schema::create('store_subscriptions', function (Blueprint $t) {
            $t->id(); $t->integer('store_id'); $t->integer('status'); $t->date('expire_date'); $t->integer('order_limit');
        });
        Schema::create('products', function (Blueprint $t) {
            $t->id(); $t->integer('store_id'); $t->string('status'); $t->string('name'); $t->string('slug'); $t->string('image')->nullable(); $t->softDeletes();
        });
        Schema::create('product_variants', function (Blueprint $t) {
            $t->id(); $t->integer('product_id'); $t->integer('status'); $t->decimal('price',12,2); $t->decimal('special_price',12,2)->nullable();
            $t->integer('stock_quantity'); $t->string('variant_slug')->default('default'); $t->softDeletes();
        });
        Schema::create('customers', function (Blueprint $t) {
            $t->id(); $t->integer('status')->default(1); $t->boolean('is_guest')->default(false); $t->string('email')->nullable(); $t->boolean('marketing_email')->default(false); $t->boolean('email_verified')->default(false); $t->string('firebase_token')->nullable(); $t->string('fcm_token')->nullable(); $t->softDeletes();
        });
        Schema::create('wishlists', function (Blueprint $t) {
            $t->id(); $t->integer('customer_id'); $t->integer('product_id'); $t->timestamps();
        });
        (require database_path('migrations/2026_09_09_100000_add_wishlist_price_alerts.php'))->up();
        Schema::create('universal_notifications', function (Blueprint $t) {
            $t->id(); $t->integer('notifiable_id'); $t->string('notifiable_type'); $t->string('title'); $t->text('message'); $t->json('data'); $t->string('status'); $t->timestamps();
        });
        Schema::create('flash_sales', function (Blueprint $t) {
            $t->id(); $t->integer('status'); $t->timestamp('start_time'); $t->timestamp('end_time');
        });
        Schema::create('flash_sale_products', function (Blueprint $t) {
            $t->id(); $t->integer('product_id'); $t->integer('store_id'); $t->integer('flash_sale_id');
        });
        DB::table('stores')->insert(['id'=>1,'status'=>1,'subscription_type'=>'commission']);
        DB::table('customers')->insert(['id'=>1]);
        DB::table('products')->insert(['id'=>1,'store_id'=>1,'status'=>'approved','name'=>'Protein','slug'=>'protein','image'=>'1']);
        DB::table('product_variants')->insert(['id'=>1,'product_id'=>1,'status'=>1,'price'=>1200,'stock_quantity'=>2]);
        DB::table('wishlists')->insert(['id'=>1,'customer_id'=>1,'product_id'=>1]);
    }

    public function test_initial_baseline_dry_run_and_single_discount_notification(): void
    {
        $service = new WishlistPriceAlertService();
        $this->assertFalse($service->check(1, false));
        $this->assertNull(Wishlist::withoutGlobalScopes()->find(1)->price_alert_snapshot);
        $this->assertFalse($service->check(1, true));
        DB::table('product_variants')->where('id',1)->update(['special_price'=>990]);
        $this->assertTrue($service->check(1, false));
        $this->assertSame(0, UniversalNotification::count());
        $this->assertTrue($service->check(1, true));
        $this->assertFalse($service->check(1, true));
        $this->assertSame(1, UniversalNotification::count());
        $this->assertEquals(990, UniversalNotification::first()->data['new_price']);
        Queue::assertNothingPushed();
    }

    public function test_increase_new_variant_and_repeated_discount_do_not_alert(): void
    {
        $service = new WishlistPriceAlertService();
        $this->assertSame([], $service->drops([1=>10000], [1=>12000,2=>5000], []));
        $this->assertSame([], $service->drops([1=>12000], [1=>9000], ['1:9000'=>true]));
    }

    public function test_stock_disabled_customer_and_store_gates(): void
    {
        $service = new WishlistPriceAlertService(); $service->check(1,true);
        DB::table('product_variants')->update(['special_price'=>900,'stock_quantity'=>0]);
        $this->assertFalse($service->check(1,true));
        DB::table('product_variants')->update(['stock_quantity'=>2]);
        DB::table('wishlists')->update(['price_alert_enabled'=>false]);
        $this->assertFalse($service->check(1,true));
        DB::table('wishlists')->update(['price_alert_enabled'=>true]);
        DB::table('stores')->update(['status'=>0]);
        $this->assertFalse($service->check(1,true));
        DB::table('stores')->update(['status'=>1]);
        DB::table('customers')->update(['status'=>0]);
        $this->assertFalse($service->check(1,true));
        $this->assertSame(0,UniversalNotification::count());
    }

    public function test_daily_limit_keeps_pending_drop(): void
    {
        $service = new WishlistPriceAlertService(); $service->check(1,true);
        DB::table('product_variants')->update(['special_price'=>1000]); $service->check(1,true);
        DB::table('product_variants')->update(['special_price'=>900]);
        $this->assertFalse($service->check(1,true));
        $this->travel(25)->hours();
        $this->assertTrue($service->check(1,true));
        $this->assertSame(2,UniversalNotification::count());
    }

    public function test_preferences_cannot_change_another_customers_favourite(): void
    {
        DB::table('customers')->insert(['id'=>2]);
        $this->actingAs(Customer::find(2),'api_customer');
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
        (new WishListManageController())->updatePriceAlerts(Request::create('/', 'PATCH',[
            'product_id'=>1,'price_alert_enabled'=>false,
        ]));
    }

    public function test_email_delivery_requires_consent_and_is_not_repeated(): void
    {
        $service = new WishlistPriceAlertService(); $service->check(1,true);
        DB::table('product_variants')->update(['special_price'=>900]);
        DB::table('wishlists')->update(['price_alert_email'=>true]);
        $service->check(1,true);
        $job = new \App\Jobs\DeliverWishlistPriceAlert(UniversalNotification::first()->id);
        \Illuminate\Support\Facades\Mail::shouldReceive('raw')->once()->andReturnNull();
        $job->handle(); // No marketing consent: no delivery attempt recorded.
        $this->assertArrayNotHasKey('delivery_attempted', UniversalNotification::first()->data);
        DB::table('customers')->update(['email'=>'test@example.test','marketing_email'=>true,'email_verified'=>true]);
        $job->handle();
        $job->handle();
        $this->assertArrayHasKey('email', UniversalNotification::first()->data['delivery_attempted']);
    }

    public function test_read_notification_is_scoped_to_owner(): void
    {
        $service = new WishlistPriceAlertService(); $service->check(1,true);
        DB::table('product_variants')->update(['special_price'=>900]); $service->check(1,true);
        DB::table('customers')->insert(['id'=>2]);
        $this->actingAs(Customer::find(2),'api_customer');
        $response = (new \App\Http\Controllers\Api\V1\NotificationManageController())->markAsRead(
            Request::create('/', 'PATCH',['id'=>UniversalNotification::first()->id]));
        $this->assertSame(404,$response->status());
        $this->assertSame('unread',UniversalNotification::first()->status);
    }

    public function test_migration_can_be_rolled_back(): void
    {
        (require database_path('migrations/2026_09_09_100000_add_wishlist_price_alerts.php'))->down();
        $this->assertFalse(Schema::hasColumn('wishlists','price_alert_snapshot'));
    }
}
