<?php

namespace App\Services\Whatsapp;

use Illuminate\Validation\ValidationException;
use libphonenumber\PhoneNumberFormat;
use libphonenumber\PhoneNumberUtil;

final class WhatsappPhone
{
    public static function normalize(string $value): string
    {
        try {
            $util = PhoneNumberUtil::getInstance();
            $number = $util->parse(trim($value), 'TR');
            if (! $util->isValidNumber($number)) {
                throw new \InvalidArgumentException;
            }

            return $util->format($number, PhoneNumberFormat::E164);
        } catch (\Throwable) {
            throw ValidationException::withMessages(['phone' => 'Geçerli ülke kodlu bir telefon numarası girin.']);
        }
    }

    public static function mask(string $value): string
    {
        return strlen($value) > 4 ? '•••• '.substr($value, -4) : '••••';
    }
}
