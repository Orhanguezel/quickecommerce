<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\HttpFoundation\Response;

class RateLimitServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->rateLimiterCheck();
    }

    protected function rateLimiterCheck()
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by(
                $request->user()?->id ?: $request->ip()
            )->response(function (Request $request, array $headers) {
                return response()->json([
                    'status' => false,
                    'message' => 'You have exceeded the maximum number of requests. Please try again later.',
                ], Response::HTTP_TOO_MANY_REQUESTS, $headers);
            });
        });

        RateLimiter::for('funnel', function (Request $request) {
            return Limit::perMinute(120)->by(
                $request->input('events.0.visitor_id')
                    ?: $request->input('events.0.session_id')
                    ?: $request->ip()
            )->response(function (Request $request, array $headers) {
                return response()->json([
                    'status' => false,
                    'message' => 'Too many analytics events. Please try again later.',
                ], Response::HTTP_TOO_MANY_REQUESTS, $headers);
            });
        });

        // Hassas public API'lar (coupons, flash-deal-products, site-general-info,
        // theme) bot tarafindan ezildiginde sunucu hatasi/yuk uretiyordu.
        // IP basina 30/dk yeterli (gercek kullanici 1-2/dk yeter).
        RateLimiter::for('public-api', function (Request $request) {
            return Limit::perMinute(30)->by(
                $request->user()?->id ?: $request->ip()
            )->response(function (Request $request, array $headers) {
                return response()->json([
                    'status' => false,
                    'message' => 'Too many requests. Please try again later.',
                ], Response::HTTP_TOO_MANY_REQUESTS, $headers);
            });
        });
    }
}
