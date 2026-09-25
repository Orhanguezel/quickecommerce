<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailVerificationCode extends Model
{
    public const PURPOSE_ACCOUNT = 'account';
    public const PURPOSE_GUEST_CHECKOUT = 'guest_checkout';
    public const PURPOSE_EMAIL_CHANGE = 'email_change';

    protected $table = 'email_verification_codes';

    protected $fillable = [
        'email',
        'purpose',
        'code_hash',
        'expires_at',
        'attempts',
        'send_count',
        'last_sent_at',
        'ip',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'last_sent_at' => 'datetime',
        'attempts' => 'integer',
        'send_count' => 'integer',
    ];

    public function isExpired(): bool
    {
        return $this->expires_at === null || $this->expires_at->isPast();
    }
}
