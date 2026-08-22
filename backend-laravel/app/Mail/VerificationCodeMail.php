<?php

namespace App\Mail;

use App\Models\EmailVerificationCode;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * 6 haneli e-posta dogrulama kodu maili.
 *
 * Bilerek queue'ya ATILMAZ: kullanici kodu ekranda bekliyor ve kuyruk
 * worker'i duruyorsa kodun hic gitmedigini aninda gormemiz gerekiyor
 * (EmailVerificationCodeService gonderim hatasini kullaniciya doner).
 */
class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public string $purpose = EmailVerificationCode::PURPOSE_ACCOUNT,
        public ?string $name = null,
    ) {
    }

    public function build()
    {
        $isGuest = $this->purpose === EmailVerificationCode::PURPOSE_GUEST_CHECKOUT;

        return $this->subject($isGuest ? 'Sipariş doğrulama kodunuz' : 'E-posta doğrulama kodunuz')
            ->view('mail.verification-code')
            ->with([
                'code' => $this->code,
                'name' => $this->name,
                'isGuest' => $isGuest,
                'ttlMinutes' => \App\Services\EmailVerificationCodeService::CODE_TTL_MINUTES,
            ]);
    }
}
