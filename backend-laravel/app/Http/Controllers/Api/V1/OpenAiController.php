<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class OpenAiController
{

    public function generateContent(Request $request){

        $validator = Validator::make($request->all(), [
            'prompt' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
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

        // Try OpenAI first, fallback to Claude if it fails
        if ($openaiEnabled) {
            try {
                $generatedContent = $this->callOpenAI($request->prompt);
                return response()->json([
                    'success' => true,
                    'generated_content' => $generatedContent
                ]);
            } catch (\Exception $e) {
                \Log::warning('OpenAI failed, checking Claude fallback', [
                    'message' => $e->getMessage(),
                ]);
                // If Claude is also enabled, fallback
                if ($claudeEnabled) {
                    try {
                        $generatedContent = $this->callClaude($request->prompt);
                        return response()->json([
                            'success' => true,
                            'generated_content' => $generatedContent
                        ]);
                    } catch (\Exception $e2) {
                        \Log::error('AI Content Generation Error (Claude fallback)', [
                            'message' => $e2->getMessage(),
                        ]);
                        return $this->aiErrorResponse($e2->getMessage());
                    }
                }
                // No Claude fallback
                \Log::error('AI Content Generation Error (OpenAI)', [
                    'message' => $e->getMessage(),
                ]);
                return $this->aiErrorResponse($e->getMessage());
            }
        }

        // Only Claude enabled
        try {
            $generatedContent = $this->callClaude($request->prompt);
            return response()->json([
                'success' => true,
                'generated_content' => $generatedContent
            ]);
        } catch (\Exception $e) {
            \Log::error('AI Content Generation Error (Claude)', [
                'message' => $e->getMessage(),
            ]);
            return $this->aiErrorResponse($e->getMessage());
        }

    }

    private function callOpenAI($prompt)
    {
        $apiKey = trim(com_option_get('com_openai_api_key'));
        $model = com_option_get('com_openai_model') ?? 'gpt-4o-mini';
        $timeout = (int) (com_option_get('com_openai_timeout') ?? 30);

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
                'max_tokens' => $this->getMaxTokens(500),
                'temperature' => 0.7
            ]);

        $data = $response->json();

        // Check if OpenAI returned an error
        if (isset($data['error'])) {
            throw new \Exception('OpenAI Error: ' . $data['error']['message']);
        }

        if (!isset($data['choices'][0]['message']['content'])) {
            throw new \Exception('Invalid OpenAI API response format');
        }

        return trim($data['choices'][0]['message']['content']);
    }

    private function callClaude($prompt)
    {
        $apiKey = trim(com_option_get('com_claude_api_key'));
        $model = com_option_get('com_claude_model') ?? 'claude-sonnet-4-5-20250929';
        $timeout = (int) (com_option_get('com_claude_timeout') ?? 30);

        $response = Http::timeout($timeout)
            ->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'Content-Type' => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => $model,
                'max_tokens' => 1024,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
            ]);

        $data = $response->json();

        // Check if Claude returned an error
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

    private function getPrompts()
    {
        return [
            'description' => 'You are a professional product copywriter.',
        ];
    }

    private function getMaxTokens(int $min = 500): int
    {
        return 500;
    }


}
