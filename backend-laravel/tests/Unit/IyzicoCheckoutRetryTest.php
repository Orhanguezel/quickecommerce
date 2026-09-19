<?php

namespace Tests\Unit;

use App\Exceptions\IyzicoConnectionException;
use App\Services\IyzicoService;
use Iyzipay\Model\CheckoutFormInitialize;
use Tests\TestCase;

class IyzicoCheckoutRetryTest extends TestCase
{
    private function service(): IyzicoService
    {
        return new class extends IyzicoService {
            public function initializeForTest(callable $send): CheckoutFormInitialize
            {
                return $this->initializeCheckoutWithRetry($send, 'test-conversation');
            }
        };
    }

    public function test_empty_transport_response_is_retried(): void
    {
        $calls = 0;
        $result = $this->service()->initializeForTest(function () use (&$calls) {
            $calls++;
            $response = new CheckoutFormInitialize();
            if ($calls === 2) {
                $response->setStatus('success');
            }
            return $response;
        });

        $this->assertSame(2, $calls);
        $this->assertSame('success', $result->getStatus());
    }

    public function test_provider_rejection_is_not_retried(): void
    {
        $calls = 0;
        $result = $this->service()->initializeForTest(function () use (&$calls) {
            $calls++;
            $response = new CheckoutFormInitialize();
            $response->setStatus('failure');
            $response->setErrorCode('1000');
            return $response;
        });

        $this->assertSame(1, $calls);
        $this->assertSame('1000', $result->getErrorCode());
    }

    public function test_non_json_provider_response_is_retried(): void
    {
        $calls = 0;
        $result = $this->service()->initializeForTest(function () use (&$calls) {
            $calls++;
            $response = new CheckoutFormInitialize();
            if ($calls === 1) {
                $response->setRawResult('<html>upstream error</html>');
            } else {
                $response->setStatus('success');
            }
            return $response;
        });

        $this->assertSame(2, $calls);
        $this->assertSame('success', $result->getStatus());
    }

    public function test_persistent_empty_response_reports_connection_failure(): void
    {
        $calls = 0;
        try {
            $this->service()->initializeForTest(function () use (&$calls) {
                $calls++;
                return new CheckoutFormInitialize();
            });
            $this->fail('Expected an IyzicoConnectionException.');
        } catch (IyzicoConnectionException) {
            $this->assertSame(3, $calls);
        }
    }
}
