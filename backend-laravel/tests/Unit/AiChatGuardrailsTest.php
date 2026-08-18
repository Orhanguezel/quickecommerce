<?php

namespace Tests\Unit;

use Illuminate\Support\Collection;
use Modules\Chat\app\Models\AiChatMessage;
use Modules\Chat\app\Services\AiChatService;
use PHPUnit\Framework\Attributes\Test;
use ReflectionMethod;
use Tests\TestCase;

class AiChatGuardrailsTest extends TestCase
{
    #[Test]
    public function short_failure_message_escalates_when_previous_context_is_payment(): void
    {
        $history = new Collection([
            new AiChatMessage(['role' => 'user', 'content' => 'Ödeme nasıl yapılır?']),
            new AiChatMessage(['role' => 'assistant', 'content' => 'Ödeme adımlarını izleyin.']),
            new AiChatMessage(['role' => 'user', 'content' => 'Çalışmıyor']),
        ]);

        $method = new ReflectionMethod(AiChatService::class, 'needsSupportEscalation');
        $result = $method->invoke(app(AiChatService::class), 'Çalışmıyor', $history);

        $this->assertTrue($result);
    }

    #[Test]
    public function it_removes_fake_support_delivery_claim_when_no_notification_exists(): void
    {
        $method = new ReflectionMethod(AiChatService::class, 'sanitizeOperationalClaims');
        $result = $method->invoke(
            app(AiChatService::class),
            'Talebinizi canlı destek ekibimize ilettim, bekleyiniz.',
            false
        );

        $this->assertStringNotContainsString('ilettim', mb_strtolower($result));
        $this->assertStringContainsString('henüz destek bildirimi oluşturulmadı', $result);
    }
}
