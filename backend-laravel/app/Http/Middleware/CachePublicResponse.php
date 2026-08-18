<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CachePublicResponse
{
    public function handle(Request $request, Closure $next, int|string $ttl = 3600): Response
    {
        if (! $request->isMethod('GET') || $request->bearerToken() || $request->user()) {
            return $next($request);
        }

        $version = Cache::get('public-catalog:version', '1');
        $key = 'public-response:' . hash('sha256', implode('|', [
            $version,
            $request->fullUrl(),
            (string) $request->header('X-Platform', ''),
            (string) $request->header('Accept-Language', ''),
        ]));

        $cached = Cache::get($key);
        if (is_array($cached)) {
            return response($cached['content'], $cached['status'], $cached['headers'])
                ->header('X-Public-Cache', 'HIT');
        }

        /** @var Response $response */
        $response = $next($request);

        if ($response->getStatusCode() === 200 && ! $response->headers->has('Set-Cookie')) {
            $headers = [
                'Content-Type' => $response->headers->get('Content-Type', 'application/json'),
                'Cache-Control' => 'public, max-age=60, s-maxage=' . (int) $ttl,
            ];

            Cache::put($key, [
                'content' => $response->getContent(),
                'status' => $response->getStatusCode(),
                'headers' => $headers,
            ], now()->addSeconds((int) $ttl));

            foreach ($headers as $name => $value) {
                $response->headers->set($name, $value);
            }
            $response->headers->set('X-Public-Cache', 'MISS');
        }

        return $response;
    }
}
