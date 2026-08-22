<?php

namespace App\Http\Middleware;

use App\Services\EmailVerificationCodeService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckEmailVerificationOption
{
    /**
     * Hesap panelini e-posta dogrulamasi arkasina alir.
     *
     * Ayar: setting_options.com_user_email_verification (on/off).
     *
     * Onemli iki nokta:
     *  - MISAFIR (is_guest) hesaplar MUAFTIR. Misafir kendi akisinda zaten
     *    e-posta kodu ile dogrulaniyor; burada 403 verilirse "siparisim"
     *    / "odeme ozeti" ekranlari kirilir ve satis durur.
     *  - Kullanici e-posta ile degil ID ile bulunur. Onceki surum
     *    Customer::where('email', ...) ile ariyordu; ayni e-postaya sahip
     *    baska bir kayit varsa yanlis sonuc dondurebiliyordu.
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        foreach ($roles as $role) {
            if ($role === 'customer') {
                $user = auth('api_customer')->user();
                if (!$user) {
                    continue; // auth:api_customer middleware'i zaten hallediyor
                }
                if ((bool) ($user->is_guest ?? false)) {
                    continue; // misafir akisi muaf
                }
                $isVerified = (bool) $user->email_verified;
            } elseif ($role === 'seller') {
                $user = auth('api')->user();
                if (!$user) {
                    continue;
                }
                $isVerified = (bool) $user->email_verified;
            } else {
                continue; // bilinmeyen rol
            }

            if (!$isVerified && EmailVerificationCodeService::accountVerificationEnabled()) {
                return response()->json([
                    'status' => false,
                    'status_code' => Response::HTTP_FORBIDDEN,
                    'email_verified' => false,
                    'code' => 'email_not_verified',
                    'message' => 'E-posta adresiniz henüz doğrulanmadı.',
                ], Response::HTTP_FORBIDDEN);
            }
        }

        return $next($request);
    }
}
