<?php

namespace Tests\Unit;

use App\Console\Commands\ScrapersRecordRun;
use PHPUnit\Framework\TestCase;

class ScrapersRecordRunTest extends TestCase
{
    public function test_success_without_nonempty_output_evidence_is_rejected_before_recording_or_resolving_alerts(): void
    {
        foreach ([null, '', '0', '50', '-1', 'unknown'] as $size) {
            $command = new class($size) extends ScrapersRecordRun {
                public array $errors = [];

                public function __construct(private ?string $size)
                {
                    parent::__construct();
                }

                public function option($key = null)
                {
                    return match ($key) {
                        'source' => 'heynut',
                        'exit-code', 'duration' => '0',
                        'json-size' => $this->size,
                        'triggered-by' => 'manual',
                        default => null,
                    };
                }

                public function error($string, $verbosity = null)
                {
                    $this->errors[] = $string;
                }
            };

            // No application/database is booted: touching run records or alerts
            // would fail this test instead of returning the validation error.
            $this->assertSame(1, $command->handle());
            $this->assertStringContainsString('--json-size', $command->errors[0]);
        }
    }
}
