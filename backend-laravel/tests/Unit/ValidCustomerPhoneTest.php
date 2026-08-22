<?php

namespace Tests\Unit;

use App\Rules\ValidCustomerPhone;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ValidCustomerPhoneTest extends TestCase
{
    public static function validNumbers(): array
    {
        return [
            'TR mobil' => ['5537802270'],
            'TR mobil bas sifirli' => ['05456094374'],
            'TR bosluklu' => ['0555 123 45 67'],
            'TR sabit hat' => ['02123456789'],
            'E164 TR' => ['+905554037272'],
            'E164 Macaristan' => ['+36704334801'],
            '00 onekli' => ['00905551234567'],
            'ulke kodu artisiz' => ['905551234567'],
        ];
    }

    public static function invalidNumbers(): array
    {
        return [
            // Sahte siparis #204'teki numara: 12 hane, gecerli bir TR numarasi degil.
            'sahte 12 hane' => ['535788754541'],
            'bos' => [''],
            'harf' => ['abc'],
            'kisa' => ['12345'],
            'gecersiz TR onek' => ['1234567890'],
            'sadece sifir' => ['00000000000'],
        ];
    }

    #[Test]
    #[DataProvider('validNumbers')]
    public function it_accepts_real_numbers(string $number): void
    {
        $this->assertTrue(ValidCustomerPhone::isValid($number), "{$number} gecerli olmaliydi");
    }

    #[Test]
    #[DataProvider('invalidNumbers')]
    public function it_rejects_fake_numbers(string $number): void
    {
        $this->assertFalse(ValidCustomerPhone::isValid($number), "{$number} reddedilmeliydi");
    }
}
