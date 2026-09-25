<?php

namespace App\Services;

use App\Mail\VerificationCodeMail;
use App\Models\EmailVerificationCode;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

/**
 * 6 haneli e-posta dogrulama kodu uretir/dogrular.
 *
 * Iki akis da bunu kullanir:
 *  - purpose=account        : uyelik kaydi sonrasi e-posta dogrulamasi
 *  - purpose=guest_checkout : misafir siparisi oncesi e-posta dogrulamasi
 *
 * Kod DB'de HASH'li tutulur, 15 dk gecerlidir, 5 yanlis denemede yanar.
 * Gonderim: ayni e-postaya 60 sn'de bir, saatte en fazla 5; ayni IP'den
 * saatte en fazla 15 kod.
 */
class EmailVerificationCodeService
{
    public const CODE_TTL_MINUTES = 15;
    public const RESEND_COOLDOWN_SECONDS = 60;
    public const MAX_SENDS_PER_HOUR = 5;
    public const MAX_SENDS_PER_IP_PER_HOUR = 15;
    public const MAX_ATTEMPTS = 5;

    /**
     * Uyelik e-posta dogrulamasi acik mi?
     * Admin panel > Sistem ayarlari > "com_user_email_verification".
     * Cache'siz okunur ki acma/kapama aninda etkili olsun.
     */
    public static function accountVerificationEnabled(): bool
    {
        return self::optionEnabled(com_option_get('com_user_email_verification', null, false));
    }

    /**
     * Misafir checkout e-posta dogrulamasi acik mi?
     * Ayar hic yoksa VARSAYILAN ACIK (sahte siparis korumasi). SMTP coker de
     * checkout tikanirsa "com_guest_checkout_email_verification" = off yapip
     * aninda kapatilabilir.
     */
    public static function guestVerificationEnabled(): bool
    {
        $value = com_option_get('com_guest_checkout_email_verification', null, false);

        if ($value === null || $value === '') {
            return true;
        }

        return self::optionEnabled($value);
    }

    private static function optionEnabled(mixed $value): bool
    {
        return in_array(strtolower((string) $value), ['on', '1', 'true'], true);
    }

    /**
     * Kod uretir ve e-posta ile gonderir.
     *
     * @return array{ok:bool,code:string,message:string,retry_after:int|null}
     */
    public function issue(string $email, string $purpose, ?string $name = null, ?string $ip = null): array
    {
        $email = $this->normalizeEmail($email);

        // GONDERIM SAYACLARI DB SATIRINDA TUTULMAZ.
        //
        // Onceki surumde limitler email_verification_codes satirinin
        // send_count/ip alanlarindaydi; satir ise dogrulama basarili olunca
        // VEYA 5 yanlis denemede siliniyordu. Yani saldirgan 5 kod isteyip
        // ardindan 6 yanlis kod deneyerek satiri sildiriyor ve hem e-posta
        // hem IP sayacini SIFIRLIYORDU -> secilen bir adrese sinirsiz
        // dogrulama maili (Gmail SMTP kotasi yanar, siparis mailleri susar).
        // Sayaclar artik Redis'te (RateLimiter), satirin omrunden bagimsiz.
        $cooldownKey = $this->limiterKey('cd', $purpose, $email);
        $emailKey = $this->limiterKey('send', $purpose, $email);
        $ipKey = $ip !== null ? 'evc:ip:' . sha1($ip) : null;

        if (RateLimiter::tooManyAttempts($cooldownKey, 1)) {
            $wait = RateLimiter::availableIn($cooldownKey);
            return $this->fail('cooldown', "Yeni kod icin {$wait} saniye bekleyin.", max($wait, 1));
        }

        if (RateLimiter::tooManyAttempts($emailKey, self::MAX_SENDS_PER_HOUR)) {
            return $this->fail(
                'too_many_sends',
                'Bu e-posta icin cok fazla kod istendi. Lutfen 1 saat sonra tekrar deneyin.',
                max(RateLimiter::availableIn($emailKey), 1)
            );
        }

        if ($ipKey !== null && RateLimiter::tooManyAttempts($ipKey, self::MAX_SENDS_PER_IP_PER_HOUR)) {
            return $this->fail(
                'ip_limit',
                'Cok fazla dogrulama kodu istendi. Lutfen daha sonra tekrar deneyin.',
                max(RateLimiter::availableIn($ipKey), 1)
            );
        }

        $row = EmailVerificationCode::where('email', $email)->where('purpose', $purpose)->first();

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        try {
            // Kod once gonderilir; SMTP patlarsa DB'ye yazip kullaniciyi
            // "kod gitti" diye kandirmayalim.
            Mail::to($email)->send(new VerificationCodeMail($code, $purpose, $name));
        } catch (\Throwable $e) {
            Log::error('[email-verification] kod gonderilemedi', [
                'email' => $email,
                'purpose' => $purpose,
                'error' => $e->getMessage(),
            ]);

            return $this->fail('send_failed', 'Dogrulama e-postasi gonderilemedi. Lutfen tekrar deneyin.');
        }

        RateLimiter::hit($cooldownKey, self::RESEND_COOLDOWN_SECONDS);
        RateLimiter::hit($emailKey, 3600);
        if ($ipKey !== null) {
            RateLimiter::hit($ipKey, 3600);
        }

        if ($row) {
            $row->update([
                'code_hash' => Hash::make($code),
                'expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
                'attempts' => 0,
                'send_count' => $row->send_count + 1,
                'last_sent_at' => now(),
                'ip' => $ip ?? $row->ip,
            ]);
        } else {
            EmailVerificationCode::create([
                'email' => $email,
                'purpose' => $purpose,
                'code_hash' => Hash::make($code),
                'expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
                'attempts' => 0,
                'send_count' => 1,
                'last_sent_at' => now(),
                'ip' => $ip,
            ]);
        }

        return [
            'ok' => true,
            'code' => 'sent',
            'message' => 'Dogrulama kodu e-posta adresinize gonderildi.',
            'retry_after' => self::RESEND_COOLDOWN_SECONDS,
        ];
    }

    /**
     * Kodu dogrular. Basarili olursa kayit silinir (kod tek kullanimlik).
     *
     * @return array{ok:bool,code:string,message:string,retry_after:int|null}
     */
    public function verify(string $email, string $purpose, string $code): array
    {
        $email = $this->normalizeEmail($email);
        $code = trim($code);

        $row = EmailVerificationCode::where('email', $email)->where('purpose', $purpose)->first();

        if (!$row) {
            return $this->fail('not_found', 'Dogrulama kodu bulunamadi. Lutfen yeni kod isteyin.');
        }

        if ($row->isExpired()) {
            $row->delete();
            return $this->fail('expired', 'Dogrulama kodunun suresi doldu. Lutfen yeni kod isteyin.');
        }

        if ($row->attempts >= self::MAX_ATTEMPTS) {
            $row->delete();
            return $this->fail('too_many_attempts', 'Cok fazla hatali deneme yapildi. Lutfen yeni kod isteyin.');
        }

        if (!Hash::check($code, $row->code_hash)) {
            $row->increment('attempts');
            $left = max(self::MAX_ATTEMPTS - ($row->attempts), 0);

            return $this->fail('invalid', "Dogrulama kodu hatali. Kalan deneme: {$left}.");
        }

        $row->delete();

        return [
            'ok' => true,
            'code' => 'verified',
            'message' => 'E-posta adresiniz dogrulandi.',
            'retry_after' => null,
        ];
    }

    /** Bekleyen kodu iptal eder (or. e-posta degistiginde). */
    public function invalidate(string $email, string $purpose): void
    {
        EmailVerificationCode::where('email', $this->normalizeEmail($email))
            ->where('purpose', $purpose)
            ->delete();
    }

    /** Sayac anahtarlari: e-posta acik metin olarak cache'e yazilmasin. */
    private function limiterKey(string $prefix, string $purpose, string $email): string
    {
        return 'evc:' . $prefix . ':' . sha1($purpose . '|' . $email);
    }

    private function normalizeEmail(string $email): string
    {
        return mb_strtolower(trim($email));
    }

    /** @return array{ok:bool,code:string,message:string,retry_after:int|null} */
    private function fail(string $code, string $message, ?int $retryAfter = null): array
    {
        return [
            'ok' => false,
            'code' => $code,
            'message' => $message,
            'retry_after' => $retryAfter,
        ];
    }
}
