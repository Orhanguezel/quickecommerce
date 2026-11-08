<?php

namespace App\Services\Whatsapp;

final class WhatsappProviderException extends \RuntimeException
{
    public function __construct(public readonly ?int $httpStatus, public readonly string $providerCode, public readonly bool $definiteRejection = false)
    {
        parent::__construct('Meta işlemi tamamlanamadı ('.$providerCode.').');
    }
}
