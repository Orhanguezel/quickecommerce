<?php

namespace Tests\Unit;

use App\Http\Middleware\CachePublicResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CachePublicResponseTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_it_caches_anonymous_successful_get_responses(): void
    {
        $middleware = new CachePublicResponse();
        $calls = 0;
        $next = function () use (&$calls) {
            $calls++;

            return response()->json(['calls' => $calls]);
        };

        $first = $middleware->handle(Request::create('/api/featured-products?per_page=10'), $next, 60);
        $second = $middleware->handle(Request::create('/api/featured-products?per_page=10'), $next, 60);

        $this->assertSame(1, $calls);
        $this->assertSame('MISS', $first->headers->get('X-Public-Cache'));
        $this->assertSame('HIT', $second->headers->get('X-Public-Cache'));
        $this->assertSame($first->getContent(), $second->getContent());
    }

    public function test_it_does_not_cache_authenticated_requests(): void
    {
        $middleware = new CachePublicResponse();
        $calls = 0;
        $next = function () use (&$calls) {
            $calls++;

            return response()->json(['calls' => $calls]);
        };
        $request = Request::create('/api/featured-products');
        $request->headers->set('Authorization', 'Bearer customer-token');

        $middleware->handle($request, $next, 60);
        $middleware->handle($request, $next, 60);

        $this->assertSame(2, $calls);
    }
}
