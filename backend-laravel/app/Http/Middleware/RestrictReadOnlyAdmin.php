<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Salt-okunur (read-only) yonetici korumasi.
 *
 * Rolu `read_only = true` olan bir kullanici tum admin panelini GORUNTULEYEBILIR
 * ama hicbir degisiklik yapamaz: butun mutasyon HTTP metodlari (POST/PUT/PATCH/DELETE)
 * 403 ile reddedilir. Okuma uclari (GET/HEAD/OPTIONS) serbesttir.
 *
 * DemoModeMiddleware ile ayni deseni izler; fark, tetikleyicinin env degil
 * kullanicinin rolu olmasidir.
 */
class RestrictReadOnlyAdmin
{
    protected array $blockedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    public function handle(Request $request, Closure $next): Response
    {
        // Sadece mutasyon isteklerini incele; okuma her zaman serbest.
        if (in_array($request->method(), $this->blockedMethods, true)) {
            $user = Auth::guard('sanctum')->user();

            if ($user && $this->isReadOnly($user)) {
                return response()->json([
                    'status'  => false,
                    'message' => __('messages.read_only_account'),
                ], 403);
            }
        }

        return $next($request);
    }

    /**
     * Kullanicinin atanmis rollerinden herhangi biri read_only ise true.
     */
    protected function isReadOnly($user): bool
    {
        return method_exists($user, 'roles')
            && $user->roles()->where('read_only', true)->exists();
    }
}
