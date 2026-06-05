<?php

namespace App\Services;

final class ProbeResult
{
    public function __construct(
        public readonly ?bool $inStock,
        public readonly string $signal,
        public readonly int $durationMs,
        public readonly ?string $error = null,
    ) {}

    public function isDefinitelyOutOfStock(): bool
    {
        return $this->inStock === false;
    }

    public function isDefinitelyInStock(): bool
    {
        return $this->inStock === true;
    }

    public function isUncertain(): bool
    {
        return $this->inStock === null;
    }

    public function toArray(): array
    {
        return [
            'in_stock' => $this->inStock,
            'signal' => $this->signal,
            'duration_ms' => $this->durationMs,
            'error' => $this->error,
        ];
    }
}
