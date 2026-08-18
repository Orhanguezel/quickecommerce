<?php

namespace Modules\Chat\app\Services;

use App\Models\OrderMaster;
use App\Models\Product;
use App\Models\Translation;
use App\Services\AdminNotifier;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Modules\Chat\app\Models\AiChatConversation;
use Modules\Chat\app\Models\AiChatKnowledge;
use Modules\Chat\app\Models\AiChatMessage;
use Modules\PaymentGateways\app\Models\PaymentGateway;

class AiChatService
{
    /**
     * Send a message and get an AI response.
     */
    public function sendMessage(string $message, string $sessionId, ?int $customerId, string $locale): array
    {
        // Get or create conversation
        $conversation = AiChatConversation::firstOrCreate(
            ['session_id' => $sessionId],
            ['customer_id' => $customerId, 'status' => 'active']
        );

        // Update customer_id if now authenticated
        if ($customerId && !$conversation->customer_id) {
            $conversation->update(['customer_id' => $customerId]);
        }

        // Store user message
        AiChatMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $message,
        ]);

        // Build conversation history (last 10 messages for context)
        $history = AiChatMessage::where('conversation_id', $conversation->id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->reverse()
            ->values();

        // Kisa "calismiyor" gibi mesajlari onceki odeme/destek baglamiyla
        // birlikte degerlendir. Bildirim AI yanitindan ONCE gercekten yazilir;
        // boylece model yapmadigi bir islem icin "ilettim" diyemez.
        $supportRequested = $this->needsSupportEscalation($message, $history);
        $supportNotified = $supportRequested
            ? $this->notifyAdminLiveSupport($conversation, $message)
            : false;

        // Build system prompt with context
        $systemPrompt = $this->buildSystemPrompt($locale, $customerId, $message, $supportRequested, $supportNotified);

        // Build messages array for AI
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($history as $msg) {
            if ($msg->role === 'system') continue;
            $messages[] = [
                'role' => $msg->role,
                'content' => $msg->content,
            ];
        }

        // Call AI provider
        $provider = com_option_get('com_ai_chat_active_provider') ?: 'groq';
        $result = $this->callProvider($provider, $messages);
        $result['content'] = $this->sanitizeOperationalClaims($result['content'], $supportNotified);

        // Store assistant response
        AiChatMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $result['content'],
            'tokens_used' => $result['tokens_used'],
            'provider' => $provider,
        ]);

        return [
            'content' => $result['content'],
            'conversation_id' => $conversation->id,
            'tokens_used' => $result['tokens_used'],
            'support_requested' => $supportRequested,
            'support_notified' => $supportNotified,
        ];
    }

    /**
     * Kullanici insan/canli destek talep ediyor mu? (TR + EN sinyaller)
     */
    private function wantsHumanSupport(string $message): bool
    {
        $m = mb_strtolower($message, 'UTF-8');
        // Turkce karakterleri sadelestir (i/ı, ş, ç, ğ, ü, ö)
        $m = strtr($m, ['ı' => 'i', 'ş' => 's', 'ç' => 'c', 'ğ' => 'g', 'ü' => 'u', 'ö' => 'o', 'İ' => 'i']);

        $signals = [
            'canli destek', 'musteri temsilci', 'temsilci', 'yetkili',
            'operator', 'gercek kisi', 'musteri hizmet', 'destek ekibi',
            'insana bag', 'insanla', 'bir insan', 'birine bag', 'yetkiliye bag',
            'gercek biri', 'canli yardim',
            'human', 'live support', 'live agent', 'real person', 'real human',
            'speak to someone', 'talk to a human', 'customer representative', 'agent',
        ];

        foreach ($signals as $needle) {
            if (str_contains($m, $needle)) {
                return true;
            }
        }

        return false;
    }

    /** @param \Illuminate\Support\Collection<int,AiChatMessage> $history */
    private function needsSupportEscalation(string $message, $history): bool
    {
        if ($this->wantsHumanSupport($message)) {
            return true;
        }

        $current = $this->normalizeText($message);
        $failureSignals = ['calismiyor', 'olmuyor', 'hata', 'yapamadim', 'yapamiyorum', 'basarisiz', 'reddedildi'];
        if (!collect($failureSignals)->contains(fn ($signal) => str_contains($current, $signal))) {
            return false;
        }

        $context = $this->normalizeText($history->pluck('content')->implode(' '));
        return collect(['odeme', 'kart', 'checkout', 'siparis', 'para'])->contains(
            fn ($signal) => str_contains($context, $signal)
        );
    }

    /**
     * Canli destek talebini admine bildir (ortak AdminNotifier: panel cani +
     * e-posta + best-effort Firebase). Ayni konusmada bir kez.
     */
    private function notifyAdminLiveSupport(AiChatConversation $conversation, string $message): bool
    {
        // Ayni konusmada tekrar bildirim gonderme
        if ($conversation->support_notified_at) {
            return true;
        }

        $customerLabel = $conversation->customer_id
            ? ('Musteri #' . $conversation->customer_id)
            : 'Misafir';

        $notified = AdminNotifier::notifyPrimarySiteAdmin(
            'Canli destek talebi (AI sohbet)',
            $customerLabel . ' canli destek istedi: "' . mb_substr(trim($message), 0, 120) . '"',
            [
                'type' => 'ai_chat_live_support',
                'conversation_id' => $conversation->id,
                'customer_id' => $conversation->customer_id,
                'session_id' => $conversation->session_id,
                'message' => mb_substr(trim($message), 0, 250),
                'screen' => 'ai-chat',
            ],
            true
        );

        if ($notified) {
            $conversation->forceFill(['support_notified_at' => now()])->save();
        }

        return $notified;
    }

    /**
     * Build system prompt with knowledge base and contextual data.
     */
    private function buildSystemPrompt(
        string $locale,
        ?int $customerId,
        string $userMessage,
        bool $supportRequested,
        bool $supportNotified
    ): string
    {
        $parts = [];

        // Admin-configured system prompt
        $systemPrompt = $this->getTranslatedSetting('com_ai_chat_system_prompt', $locale);
        if ($systemPrompt) {
            $parts[] = $systemPrompt;
        }

        $parts[] = $this->buildOperationalRules($supportRequested, $supportNotified);

        // Knowledge base
        $knowledge = $this->buildKnowledgeContext($locale);
        if ($knowledge) {
            $parts[] = "== Bilgi Bankası / Knowledge Base ==\n" . $knowledge;
        }

        // Product context (search for relevant products based on user message)
        $productContext = $this->buildProductContext($userMessage, $locale);
        if ($productContext) {
            $parts[] = "== İlgili Ürünler / Related Products ==\n" . $productContext;
        }

        // Order context (if authenticated customer)
        if ($customerId) {
            $orderContext = $this->buildOrderContext($customerId);
            if ($orderContext) {
                $parts[] = "== Müşteri Siparişleri / Customer Orders ==\n" . $orderContext;
            }
        }

        return implode("\n\n", $parts);
    }

    private function buildOperationalRules(bool $supportRequested, bool $supportNotified): string
    {
        $gateways = PaymentGateway::query()
            ->where('status', 1)
            ->where('is_test_mode', 0)
            ->orderBy('id')
            ->pluck('name')
            ->filter()
            ->values();
        $paymentMethods = $gateways->isEmpty() ? 'Aktif ödeme yöntemi bulunmuyor.' : $gateways->implode(', ');
        $supportState = $supportNotified
            ? 'Bu konuşma için site adminine gerçek destek bildirimi oluşturuldu; bunu müşteriye söyleyebilirsin.'
            : ($supportRequested
                ? 'Destek bildirimi oluşturulamadı; kesinlikle "ilettim/bildirdim" deme, iletişim kanalını öner.'
                : 'Destek bildirimi oluşturulmadı; kesinlikle "ilettim/bildirdim/bağladım" deme.');

        return "== Değiştirilemez Operasyon Kuralları ==\n"
            . "Canlı sistemde aktif ve gerçek ödeme yöntemi: {$paymentMethods}. "
            . "Bunun dışında havale/EFT, kapıda ödeme, cüzdan veya test ödeme sağlayıcılarını varmış gibi söyleme.\n"
            . "Ödeme başarısızlığında kart/banka hatası uydurma; sipariş veya ödeme kaydı yoksa bunun ödeme sağlayıcısına ulaşmadan önce kesilmiş olabileceğini söyle.\n"
            . "{$supportState}\n"
            . "Yalnızca verilen bilgi bankası, sipariş bağlamı ve bu operasyon kurallarındaki doğrulanmış bilgileri kullan. Bilmediğin işlem sonucu, stok, kargo veya destek aksiyonu uydurma.";
    }

    private function sanitizeOperationalClaims(string $content, bool $supportNotified): string
    {
        if ($supportNotified) {
            return $content;
        }

        $patterns = [
            '/(?:talebinizi|konuyu|sorununuzu)\s+(?:canl[ıi]\s+)?destek(?:\s+ekibimize)?\s+(?:ilettim|bildirdim)/iu',
            '/(?:sizi|seni)\s+(?:canl[ıi]\s+)?(?:desteğe|destek ekibine|temsilciye)\s+bağladım/iu',
        ];

        return preg_replace($patterns, 'Bu konuşma için henüz destek bildirimi oluşturulmadı', $content) ?: $content;
    }

    private function normalizeText(string $value): string
    {
        return strtr(mb_strtolower($value, 'UTF-8'), [
            'ı' => 'i', 'ş' => 's', 'ç' => 'c', 'ğ' => 'g', 'ü' => 'u', 'ö' => 'o', 'İ' => 'i',
        ]);
    }

    /**
     * Get translated setting value.
     */
    private function getTranslatedSetting(string $key, string $locale): ?string
    {
        $defaultValue = com_option_get($key);

        if ($locale === 'tr') {
            return $defaultValue;
        }

        // Try to find translation
        $settingOption = \App\Models\SettingOption::where('option_name', $key)->first();
        if (!$settingOption) {
            return $defaultValue;
        }

        $translation = Translation::where('translatable_type', \App\Models\SettingOption::class)
            ->where('translatable_id', $settingOption->id)
            ->where('language', $locale)
            ->where('key', $key)
            ->first();

        return $translation?->value ?: $defaultValue;
    }

    /**
     * Build knowledge base context from active entries.
     */
    private function buildKnowledgeContext(string $locale): string
    {
        $entries = AiChatKnowledge::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->take(20)
            ->get();

        if ($entries->isEmpty()) {
            return '';
        }

        $lines = [];
        foreach ($entries as $entry) {
            $question = $entry->question;
            $answer = $entry->answer;

            // Get translations if not Turkish
            if ($locale !== 'tr') {
                $translations = Translation::where('translatable_type', AiChatKnowledge::class)
                    ->where('translatable_id', $entry->id)
                    ->where('language', $locale)
                    ->get()
                    ->keyBy('key');

                if ($translations->has('question')) {
                    $question = $translations->get('question')->value;
                }
                if ($translations->has('answer')) {
                    $answer = $translations->get('answer')->value;
                }
            }

            $lines[] = "S: {$question}\nC: {$answer}";
        }

        return implode("\n\n", $lines);
    }

    /**
     * Build product context by searching for relevant products.
     */
    private function buildProductContext(string $query, string $locale): string
    {
        // Simple keyword search on product name
        $keywords = array_filter(explode(' ', $query), fn($w) => mb_strlen($w) >= 3);

        if (empty($keywords)) {
            return '';
        }

        $products = Product::where('status', 1)
            ->where(function ($q) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $q->orWhere('name', 'like', "%{$keyword}%");
                }
            })
            ->take(5)
            ->get(['id', 'name', 'slug']);

        if ($products->isEmpty()) {
            return '';
        }

        $lines = [];
        foreach ($products as $product) {
            $name = $product->name;

            // Get translated name if not TR
            if ($locale !== 'tr') {
                $translation = Translation::where('translatable_type', Product::class)
                    ->where('translatable_id', $product->id)
                    ->where('language', $locale)
                    ->where('key', 'name')
                    ->first();
                if ($translation) {
                    $name = $translation->value;
                }
            }

            $lines[] = "- {$name} (/{$product->slug})";
        }

        return implode("\n", $lines);
    }

    /**
     * Build order context for authenticated customer.
     */
    private function buildOrderContext(int $customerId): string
    {
        $orderMasters = OrderMaster::where('customer_id', $customerId)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->with(['orders' => function ($q) {
                $q->select('id', 'order_master_id', 'invoice_number', 'status', 'payment_status', 'refund_status');
            }])
            ->get(['id', 'order_amount', 'payment_status', 'payment_gateway', 'created_at']);

        if ($orderMasters->isEmpty()) {
            return 'Bu müşterinin henüz siparişi bulunmamaktadır.';
        }

        $statusMap = [
            'pending' => 'Beklemede',
            'confirmed' => 'Onaylandı',
            'processing' => 'Hazırlanıyor',
            'shipped' => 'Kargoya Verildi',
            'delivered' => 'Teslim Edildi',
            'cancelled' => 'İptal Edildi',
            'returned' => 'İade Edildi',
        ];

        // İptal/iade sebeplerini topla (order_refunds + order_refund_reasons).
        // Boylece bot "neden iptal edildi" sorusuna gercek sebebi (orn. tedarikci
        // stogu tukenmis) ve iade durumunu soyleyebilir, "destek'e sor" demez.
        $orderIds = $orderMasters->flatMap(fn ($m) => $m->orders->pluck('id'))->all();
        $refundInfo = [];
        if (!empty($orderIds)) {
            $rows = \DB::table('order_refunds')
                ->leftJoin('order_refund_reasons', 'order_refunds.order_refund_reason_id', '=', 'order_refund_reasons.id')
                ->whereIn('order_refunds.order_id', $orderIds)
                ->get(['order_refunds.order_id', 'order_refunds.status as refund_status', 'order_refund_reasons.reason as reason_name']);
            foreach ($rows as $r) {
                $refundInfo[$r->order_id] = $r;
            }
        }

        $lines = [];
        foreach ($orderMasters as $master) {
            $date = $master->created_at->format('d.m.Y');
            $amount = number_format($master->order_amount, 2);

            foreach ($master->orders as $order) {
                $status = $statusMap[$order->status] ?? $order->status;
                $line = "- Sipariş #{$order->invoice_number} ({$date}): ₺{$amount} - {$status}";

                $extra = [];
                $ri = $refundInfo[$order->id] ?? null;
                if ($ri) {
                    $reason = $this->humanizeRefundReason($ri->reason_name);
                    if ($reason) {
                        $extra[] = "İptal/iade sebebi: {$reason}";
                    }
                    if (($ri->refund_status ?? '') === 'refunded' || ($order->refund_status ?? '') === 'refunded') {
                        $extra[] = "ödeme müşteriye iade edildi";
                    }
                } elseif ($order->status === 'cancelled') {
                    if (($order->refund_status ?? '') === 'refunded') {
                        $extra[] = "ödeme iade edildi";
                    } elseif (!in_array($order->payment_status, ['paid', 'refunded'], true)) {
                        // Odenmemis/suresi dolmus sepet otomatik iptal edildi
                        $extra[] = "ödeme tamamlanmadığı için otomatik iptal edildi";
                    }
                }

                if (!empty($extra)) {
                    $line .= ' (' . implode('; ', $extra) . ')';
                }
                $lines[] = $line;
            }
        }

        return implode("\n", $lines)
            . "\n\nNOT: Yukarıda bir siparişin iptal/iade sebebi belirtilmişse, müşteri sorduğunda bu sebebi açıkça ve nazikçe söyle (örn. tedarikçide stok kalmadığı için iptal edildiyse bunu belirt). Sebep belirtilmemişse uydurma.";
    }

    /**
     * order_refund_reasons.reason degerini musteriye uygun, net bir cumleye cevirir.
     */
    private function humanizeRefundReason(?string $reason): ?string
    {
        if (!$reason) {
            return null;
        }
        $r = mb_strtolower($reason, 'UTF-8');
        if (str_contains($r, 'stog') || str_contains($r, 'stok') || str_contains($r, 'tüken') || str_contains($r, 'tuken')) {
            return 'Tedarikçide ürün stoğu kalmadığı için sipariş iptal edildi';
        }
        // "Diğer" / "Other" gibi jenerik sebepler musteriye anlamsiz -> gosterme
        if (in_array($r, ['diğer', 'diger', 'other', '-', ''], true)) {
            return null;
        }
        // "(otomatik)" gibi teknik ekleri temizle
        return trim(preg_replace('/\s*\(otomatik\)\s*/iu', '', $reason)) ?: null;
    }

    /**
     * Call the configured AI provider.
     */
    private function callProvider(string $provider, array $messages): array
    {
        return match ($provider) {
            'anthropic' => $this->callAnthropic($messages),
            'gemini' => $this->callGemini($messages),
            default => $this->callOpenAICompatible($messages),
        };
    }

    /**
     * Call OpenAI-compatible API (OpenAI or Groq).
     */
    private function callOpenAICompatible(array $messages): array
    {
        $apiKey = trim(com_option_get('com_ai_chat_api_key') ?: '');
        $model = com_option_get('com_ai_chat_model') ?: 'llama-3.3-70b-versatile';
        $maxTokens = (int) (com_option_get('com_ai_chat_max_tokens') ?: 1024);
        $temperature = (float) (com_option_get('com_ai_chat_temperature') ?: 0.7);

        // Auto-detect Groq keys
        $endpoint = str_starts_with($apiKey, 'gsk_')
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';

        $response = Http::timeout(30)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post($endpoint, [
                'model' => $model,
                'messages' => $messages,
                'max_tokens' => $maxTokens,
                'temperature' => $temperature,
            ]);

        $data = $response->json();

        if (isset($data['error'])) {
            Log::error('AI Chat OpenAI/Groq Error', ['error' => $data['error']]);
            throw new \Exception($data['error']['message'] ?? 'AI provider error');
        }

        return [
            'content' => trim($data['choices'][0]['message']['content'] ?? ''),
            'tokens_used' => $data['usage']['total_tokens'] ?? null,
        ];
    }

    /**
     * Call Anthropic Claude API.
     */
    private function callAnthropic(array $messages): array
    {
        $apiKey = trim(com_option_get('com_ai_chat_api_key') ?: '');
        $model = com_option_get('com_ai_chat_model') ?: 'claude-sonnet-4-5-20250929';
        $maxTokens = (int) (com_option_get('com_ai_chat_max_tokens') ?: 1024);
        $temperature = (float) (com_option_get('com_ai_chat_temperature') ?: 0.7);

        // Extract system message
        $system = '';
        $chatMessages = [];
        foreach ($messages as $msg) {
            if ($msg['role'] === 'system') {
                $system .= $msg['content'] . "\n";
            } else {
                $chatMessages[] = $msg;
            }
        }

        // Anthropic: roller user/assistant SIRAYLA olmali ve user ile baslamali.
        // (OpenAI/groq esnek; Anthropic ardisik ayni rolde 400 verir.)
        $normalized = [];
        foreach ($chatMessages as $msg) {
            $role = ($msg['role'] === 'assistant') ? 'assistant' : 'user';
            if (empty($normalized)) {
                if ($role !== 'user') {
                    continue; // bastaki assistant mesajlarini atla
                }
                $normalized[] = ['role' => $role, 'content' => $msg['content']];
            } elseif ($normalized[count($normalized) - 1]['role'] === $role) {
                $normalized[count($normalized) - 1]['content'] .= "\n" . $msg['content'];
            } else {
                $normalized[] = ['role' => $role, 'content' => $msg['content']];
            }
        }
        if (empty($normalized)) {
            $normalized[] = ['role' => 'user', 'content' => '(bos)'];
        }

        $body = [
            'model' => $model,
            'max_tokens' => $maxTokens,
            'temperature' => $temperature,
            'messages' => $normalized,
        ];

        if ($system) {
            $body['system'] = trim($system);
        }

        $response = Http::timeout(30)
            ->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'Content-Type' => 'application/json',
            ])
            ->post('https://api.anthropic.com/v1/messages', $body);

        $data = $response->json();

        if (isset($data['error'])) {
            Log::error('AI Chat Anthropic Error', ['error' => $data['error']]);
            throw new \Exception($data['error']['message'] ?? 'Anthropic API error');
        }

        $tokensUsed = ($data['usage']['input_tokens'] ?? 0) + ($data['usage']['output_tokens'] ?? 0);

        return [
            'content' => trim($data['content'][0]['text'] ?? ''),
            'tokens_used' => $tokensUsed,
        ];
    }

    /**
     * Call Google Gemini API.
     */
    private function callGemini(array $messages): array
    {
        $apiKey = trim(com_option_get('com_ai_chat_api_key') ?: '');
        $model = com_option_get('com_ai_chat_model') ?: 'gemini-2.0-flash';
        $maxTokens = (int) (com_option_get('com_ai_chat_max_tokens') ?: 1024);
        $temperature = (float) (com_option_get('com_ai_chat_temperature') ?: 0.7);

        // Convert messages to Gemini format
        $systemInstruction = '';
        $contents = [];
        foreach ($messages as $msg) {
            if ($msg['role'] === 'system') {
                $systemInstruction .= $msg['content'] . "\n";
            } else {
                $contents[] = [
                    'role' => $msg['role'] === 'assistant' ? 'model' : 'user',
                    'parts' => [['text' => $msg['content']]],
                ];
            }
        }

        $body = [
            'contents' => $contents,
            'generationConfig' => [
                'maxOutputTokens' => $maxTokens,
                'temperature' => $temperature,
            ],
        ];

        if ($systemInstruction) {
            $body['systemInstruction'] = [
                'parts' => [['text' => trim($systemInstruction)]],
            ];
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $response = Http::timeout(30)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($url, $body);

        $data = $response->json();

        if (isset($data['error'])) {
            Log::error('AI Chat Gemini Error', ['error' => $data['error']]);
            throw new \Exception($data['error']['message'] ?? 'Gemini API error');
        }

        $tokensUsed = ($data['usageMetadata']['totalTokenCount'] ?? null);

        return [
            'content' => trim($data['candidates'][0]['content']['parts'][0]['text'] ?? ''),
            'tokens_used' => $tokensUsed,
        ];
    }
}
