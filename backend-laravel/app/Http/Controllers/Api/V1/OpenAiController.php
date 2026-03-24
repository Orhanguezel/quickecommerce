<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class OpenAiController
{

    public function generateContent(Request $request){

        $validator = Validator::make($request->all(), [
            'prompt' => 'nullable|string|max:5000',
            'action' => 'nullable|string|in:full,enhance,translate,generate_meta',
            'product_name' => 'nullable|string|max:500',
            'category_name' => 'nullable|string|max:500',
            'existing_content' => 'nullable|array',
            'source_locale' => 'nullable|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $action = $request->input('action');

        // If action-based request, build the prompt automatically
        if ($action) {
            $prompt = $this->buildActionPrompt($action, $request->all());
        } else {
            // Legacy: plain prompt mode
            if (!$request->prompt) {
                return response()->json([
                    'success' => false,
                    'message' => 'Either prompt or action is required'
                ], 422);
            }
            $prompt = $request->prompt;
        }

        // Determine which AI provider is enabled
        $openaiEnabled = com_option_get('com_openai_enable_disable') === 'on';
        $claudeEnabled = com_option_get('com_claude_enable_disable') === 'on';

        if (!$openaiEnabled && !$claudeEnabled) {
            return response()->json([
                'success' => false,
                'message' => 'AI content generation is currently disabled'
            ], 503);
        }

        $maxTokens = $action ? 4000 : 500;

        // Try OpenAI first, fallback to Claude if it fails
        if ($openaiEnabled) {
            try {
                $generatedContent = $this->callOpenAI($prompt, $maxTokens);
                return $this->formatResponse($generatedContent, $action);
            } catch (\Exception $e) {
                \Log::warning('OpenAI failed, checking Claude fallback', [
                    'message' => $e->getMessage(),
                ]);
                if ($claudeEnabled) {
                    try {
                        $generatedContent = $this->callClaude($prompt, $maxTokens);
                        return $this->formatResponse($generatedContent, $action);
                    } catch (\Exception $e2) {
                        \Log::error('AI Content Generation Error (Claude fallback)', [
                            'message' => $e2->getMessage(),
                        ]);
                        return $this->aiErrorResponse($e2->getMessage());
                    }
                }
                \Log::error('AI Content Generation Error (OpenAI)', [
                    'message' => $e->getMessage(),
                ]);
                return $this->aiErrorResponse($e->getMessage());
            }
        }

        // Only Claude enabled
        try {
            $generatedContent = $this->callClaude($prompt, $maxTokens);
            return $this->formatResponse($generatedContent, $action);
        } catch (\Exception $e) {
            \Log::error('AI Content Generation Error (Claude)', [
                'message' => $e->getMessage(),
            ]);
            return $this->aiErrorResponse($e->getMessage());
        }

    }

    private function buildActionPrompt(string $action, array $params): string
    {
        $productName = $params['product_name'] ?? 'Unknown Product';
        $categoryName = $params['category_name'] ?? '';
        $existingContent = $params['existing_content'] ?? [];
        $sourceLocale = $params['source_locale'] ?? 'tr';

        $locales = ['tr', 'en'];
        $localeNames = ['tr' => 'Turkish', 'en' => 'English'];

        $systemBase = "You are a professional e-commerce product content writer. You write SEO-optimized, compelling product content.\n";
        $jsonStructure = '{"tr":{"name":"","slug":"","description":"","short_description":"","meta_title":"","meta_description":"","meta_keywords":[]},"en":{"name":"","slug":"","description":"","short_description":"","meta_title":"","meta_description":"","meta_keywords":[]}}';

        switch ($action) {
            case 'full':
                $categoryCtx = $categoryName ? "\nProduct category: {$categoryName}" : '';
                return $systemBase . "Generate complete product content for \"{$productName}\".{$categoryCtx}

Create content for these locales: " . implode(', ', array_map(fn($l) => "{$l} ({$localeNames[$l]})", $locales)) . "

For each locale generate:
- name: Product name (localized)
- slug: URL-friendly slug (lowercase, hyphens, no special chars)
- description: Rich HTML product description (2-4 paragraphs, use <p>, <ul>, <li>, <strong> tags)
- short_description: One sentence summary
- meta_title: SEO title (max 60 chars)
- meta_description: SEO description (max 155 chars)
- meta_keywords: Array of 5-8 relevant keywords

Return ONLY valid JSON, no markdown, no explanation. Schema:
{$jsonStructure}";

            case 'enhance':
                $existingJson = json_encode($existingContent, JSON_UNESCAPED_UNICODE);
                return $systemBase . "Enhance and improve the following product content. Make descriptions more compelling, fix grammar, improve SEO.

Existing content:
{$existingJson}

Keep the same structure and locales. Improve quality, expand thin descriptions, optimize meta tags for SEO.
Return ONLY valid JSON, no markdown, no explanation. Schema:
{$jsonStructure}";

            case 'translate':
                $existingJson = json_encode($existingContent, JSON_UNESCAPED_UNICODE);
                $targetLocales = array_filter($locales, fn($l) => $l !== $sourceLocale);
                return $systemBase . "Translate the following product content from {$sourceLocale} ({$localeNames[$sourceLocale]}) to other locales.

Source content:
{$existingJson}

Keep the {$sourceLocale} content as-is. Translate/adapt for: " . implode(', ', array_map(fn($l) => "{$l} ({$localeNames[$l]})", $targetLocales)) . "
Adapt the slug for each locale. Translate meta tags for local SEO.
Return ONLY valid JSON, no markdown, no explanation. Schema:
{$jsonStructure}";

            case 'generate_meta':
                $existingJson = json_encode($existingContent, JSON_UNESCAPED_UNICODE);
                return $systemBase . "Generate SEO meta tags based on the following product content.

Product content:
{$existingJson}

For each locale, generate optimized:
- meta_title: SEO title (max 60 chars, include main keyword)
- meta_description: SEO description (max 155 chars, include call-to-action)
- meta_keywords: Array of 5-8 relevant search keywords

Keep name, slug, description, short_description from existing content unchanged.
Return ONLY valid JSON, no markdown, no explanation. Schema:
{$jsonStructure}";

            default:
                return "Generate product content for \"{$productName}\"";
        }
    }

    private function formatResponse(string $generatedContent, ?string $action)
    {
        // For action-based requests, try to parse JSON and return structured
        if ($action) {
            $parsed = $this->parseJsonFromResponse($generatedContent);
            if ($parsed) {
                return response()->json([
                    'success' => true,
                    'results' => $parsed,
                    'generated_content' => $generatedContent,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'generated_content' => $generatedContent
        ]);
    }

    private function parseJsonFromResponse(string $text): ?array
    {
        $text = trim($text);
        // Try direct parse
        $decoded = json_decode($text, true);
        if (is_array($decoded)) return $decoded;

        // Extract JSON from markdown code blocks
        if (preg_match('/```(?:json)?\s*\n?([\s\S]*?)\n?```/', $text, $m)) {
            $decoded = json_decode(trim($m[1]), true);
            if (is_array($decoded)) return $decoded;
        }

        // Find first { to last }
        $first = strpos($text, '{');
        $last = strrpos($text, '}');
        if ($first !== false && $last !== false && $last > $first) {
            $decoded = json_decode(substr($text, $first, $last - $first + 1), true);
            if (is_array($decoded)) return $decoded;
        }

        return null;
    }

    private function callOpenAI($prompt, $maxTokens = 500)
    {
        $apiKey = trim(com_option_get('com_openai_api_key'));
        $model = com_option_get('com_openai_model') ?? 'gpt-4o-mini';
        $timeout = (int) (com_option_get('com_openai_timeout') ?? 60);

        // Auto-detect Groq keys (gsk_ prefix) and use Groq endpoint
        $endpoint = str_starts_with($apiKey, 'gsk_')
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';

        $response = Http::timeout($timeout)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post($endpoint, [
                'model' => $model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => $maxTokens,
                'temperature' => 0.7
            ]);

        $data = $response->json();

        if (isset($data['error'])) {
            throw new \Exception('OpenAI Error: ' . $data['error']['message']);
        }

        if (!isset($data['choices'][0]['message']['content'])) {
            throw new \Exception('Invalid OpenAI API response format');
        }

        return trim($data['choices'][0]['message']['content']);
    }

    private function callClaude($prompt, $maxTokens = 4096)
    {
        $apiKey = trim(com_option_get('com_claude_api_key'));
        $model = com_option_get('com_claude_model') ?? 'claude-sonnet-4-5-20250929';
        $timeout = (int) (com_option_get('com_claude_timeout') ?? 60);

        $response = Http::timeout($timeout)
            ->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'Content-Type' => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => $model,
                'max_tokens' => $maxTokens,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
            ]);

        $data = $response->json();

        if (isset($data['error'])) {
            throw new \Exception('Claude Error: ' . ($data['error']['message'] ?? 'Unknown error'));
        }

        if (!isset($data['content'][0]['text'])) {
            throw new \Exception('Invalid Claude API response format');
        }

        return trim($data['content'][0]['text']);
    }

    private function aiErrorResponse(string $rawMessage)
    {
        if (str_contains($rawMessage, 'billing') || str_contains($rawMessage, 'credit balance')) {
            $message = 'AI content generation failed: Your API quota/credits have been exceeded. Please check your plan or billing.';
        } elseif (str_contains($rawMessage, 'invalid_api_key') || str_contains($rawMessage, 'authentication_error') || str_contains($rawMessage, 'Incorrect API key') || str_contains($rawMessage, 'invalid x-api-key')) {
            $message = 'AI content generation failed: API key is invalid.';
        } elseif (str_contains($rawMessage, 'The project')) {
            $message = 'AI content generation failed: Project not found. Please check your API settings.';
        } else {
            $message = 'AI content generation failed. Please try again later.';
        }
        return response()->json([
            'success' => false,
            'message' => $message
        ], 500);
    }
}
