<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use libphonenumber\NumberParseException;
use libphonenumber\PhoneNumberUtil;

/**
 * Musteri telefon numarasi dogrulamasi.
 *
 * Onceden `required|string|max:32` idi; "535788754541" gibi 12 haneli uydurma
 * numaralar gecip siparise dusuyordu (bkz. sahte siparis #204).
 *
 * Kabul edilenler:
 *  - Yerel TR formatlari: 5551234567 / 05551234567 / 0 555 123 45 67
 *  - Uluslararasi: +905551234567, 00905551234567, +36704334801
 *
 * Numara NORMALIZE EDILMEZ, sadece dogrulanir: customers.phone UNIQUE ve
 * mevcut kayitlar karisik formatta (bazisi 0'li, bazisi +90'li). Format
 * degistirmek "ayni misafir tekrar geldi" eslesmesini bozar.
 */
class ValidCustomerPhone implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value) || trim($value) === '') {
            $fail('Telefon numarasi zorunludur.');
            return;
        }

        if (!self::isValid($value)) {
            $fail('Gecerli bir telefon numarasi giriniz (or. 0555 123 45 67).');
        }
    }

    public static function isValid(string $value): bool
    {
        $cleaned = preg_replace('/[\s\-\(\)\.\/]/', '', trim($value)) ?? '';

        if ($cleaned === '') {
            return false;
        }

        // 00 90 ... -> +90 ...
        if (str_starts_with($cleaned, '00')) {
            $cleaned = '+' . substr($cleaned, 2);
        }

        if (!preg_match('/^\+?[0-9]+$/', $cleaned)) {
            return false;
        }

        // '+' ile baslamiyorsa varsayilan ulke TR.
        $region = str_starts_with($cleaned, '+') ? null : 'TR';

        try {
            $util = PhoneNumberUtil::getInstance();
            $parsed = $util->parse($cleaned, $region);

            return $util->isValidNumber($parsed);
        } catch (NumberParseException) {
            return false;
        }
    }
}
