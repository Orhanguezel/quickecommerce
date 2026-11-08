<?php

namespace Tests\Unit;

use App\Models\ProductQuery;
use App\Models\Review;
use App\Models\UniversalNotification;
use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Events\Dispatcher;
use PHPUnit\Framework\TestCase;

require_once __DIR__.'/../../app/Services/FeedbackNotificationService.php';
require_once __DIR__.'/../../app/Models/ProductQuery.php';
require_once __DIR__.'/../../app/Models/Review.php';

class FeedbackNotificationTest extends TestCase
{
    private Capsule $db;

    protected function setUp(): void
    {
        $container = new Container;
        Container::setInstance($container);
        $this->db = new Capsule($container);
        $this->db->addConnection(['driver' => 'sqlite', 'database' => ':memory:']);
        $this->db->setEventDispatcher(new Dispatcher($container));
        $this->db->setAsGlobal();
        $this->db->bootEloquent();
        Model::clearBootedModels();
        Capsule::schema()->create('users', function (Blueprint $t) {
            $t->id(); $t->string('activity_scope'); $t->softDeletes();
        });
        foreach (['product_queries', 'reviews'] as $name) {
            Capsule::schema()->create($name, function (Blueprint $t) {
                $t->id(); $t->unsignedBigInteger('store_id')->nullable();
                $t->string('status')->nullable(); $t->timestamps(); $t->softDeletes();
            });
        }
        Capsule::schema()->create('universal_notifications', function (Blueprint $t) {
            $t->id(); $t->unsignedBigInteger('notifiable_id');
            foreach (['notifiable_type', 'title', 'message', 'data', 'status'] as $column) $t->text($column);
            $t->timestamps();
        });
        Capsule::table('users')->insert([
            ['id' => 1, 'activity_scope' => 'store_level'],
            ['id' => 2, 'activity_scope' => 'system_level'],
            ['id' => 3, 'activity_scope' => 'system_level'],
        ]);
    }

    public function test_creating_feedback_notifies_shared_admin_inbox_once_and_updates_do_not_repeat(): void
    {
        $question = ProductQuery::create(['store_id' => 9]);
        $review = Review::create(['store_id' => 9]);
        $question->update(['status' => '1']);
        $review->update(['status' => '1']);
        $notifications = UniversalNotification::orderBy('id')->get();
        self::assertCount(2, $notifications);
        self::assertSame(['product_question', 'customer_review'], $notifications->pluck('data.type')->all());
        foreach ($notifications as $notification) {
            self::assertEquals(2, $notification->notifiable_id);
            self::assertSame('admin', $notification->notifiable_type);
            self::assertSame('unread', $notification->status);
            self::assertArrayNotHasKey('order_id', $notification->data);
        }
        self::assertEquals($question->id, $notifications[0]->data['feedback_id']);
        self::assertEquals($review->id, $notifications[1]->data['feedback_id']);
    }

    public function test_rolled_back_feedback_leaves_no_notification(): void
    {
        Capsule::connection()->beginTransaction();
        ProductQuery::create([]);
        Review::create([]);
        self::assertSame(2, UniversalNotification::count());
        Capsule::connection()->rollBack();
        self::assertSame(0, UniversalNotification::count());
        self::assertSame(0, ProductQuery::count());
        self::assertSame(0, Review::count());
    }

    public function test_no_admin_does_not_notify_sellers_or_prevent_feedback(): void
    {
        Capsule::table('users')->where('activity_scope', 'system_level')->delete();
        ProductQuery::create([]);
        Review::create([]);
        self::assertSame(0, UniversalNotification::count());
        self::assertSame(1, ProductQuery::count());
        self::assertSame(1, Review::count());
    }
}
