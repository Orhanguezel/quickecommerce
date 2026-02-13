<?php

namespace Modules\Chat\app\Services;

use App\Models\OrderMaster;
use App\Models\Product;
use App\Models\Translation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Modules\Chat\app\Models\AiChatConversation;
use Modules\Chat\app\Models\AiChatKnowledge;
use Modules\Chat\app\Models\AiChatMessage;

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

        // Build system prompt with context
        $systemPrompt = $this->buildSystemPrompt($locale, $customerId, $message);

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
        ];
    }

    /**
     * Build system prompt with knowledge base and contextual data.
     */
    private function buildSystemPrompt(string $locale, ?int $customerId, string $userMessage): string
    {
        $parts = [];

        // Admin-configured system prompt
        $systemPrompt = $this->getTranslatedSetting('com_ai_chat_system_prompt', $locale);
        if ($systemPrompt) {
            $parts[] = $systemPrompt;
        }

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
                $q->select('id', 'order_master_id', 'invoice_number', 'status', 'payment_status');
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

        $lines = [];
        foreach ($orderMasters as $master) {
            $date = $master->created_at->format('d.m.Y');
            $amount = number_format($master->order_amount, 2);

            foreach ($master->orders as $order) {
                $status = $statusMap[$order->status] ?? $order->status;
                $lines[] = "- Sipariş #{$order->invoice_number} ({$date}): ₺{$amount} - {$status}";
            }
        }

        return implode("\n", $lines);
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

        $body = [
            'model' => $model,
            'max_tokens' => $maxTokens,
            'temperature' => $temperature,
            'messages' => $chatMessages,
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
