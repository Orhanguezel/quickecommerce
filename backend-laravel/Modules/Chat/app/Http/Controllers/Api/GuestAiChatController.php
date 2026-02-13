<?php

namespace Modules\Chat\app\Http\Controllers\Api;

use App\Http\Controllers\Api\V1\Controller;
use Illuminate\Http\Request;
use Modules\Chat\app\Services\AiChatService;

class GuestAiChatController extends Controller
{
    public function __construct(
        private AiChatService $aiChatService,
    ) {}

    /**
     * Send a message and get an AI response (no auth required).
     */
    public function send(Request $request)
    {
        // Check if AI chat is enabled
        if (com_option_get('com_ai_chat_enabled') !== 'on') {
            return response()->json([
                'success' => false,
                'message' => 'AI chat is currently disabled.',
            ], 503);
        }

        // Check if guest chat is allowed
        if (com_option_get('com_ai_chat_guest_enabled') !== 'on') {
            return response()->json([
                'success' => false,
                'message' => 'Guest AI chat is not available. Please login.',
            ], 403);
        }

        $request->validate([
            'message' => 'required|string|max:2000',
            'session_id' => 'required|string|max:64',
        ]);

        $locale = app()->getLocale();

        try {
            $result = $this->aiChatService->sendMessage(
                $request->message,
                $request->session_id,
                null, // no customer_id for guest
                $locale
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'message' => $result['content'],
                    'conversation_id' => $result['conversation_id'],
                    'tokens_used' => $result['tokens_used'],
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('AI Chat Error (Guest)', [
                'session_id' => $request->session_id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'AI yanıt veremedi. Lütfen tekrar deneyin.',
            ], 500);
        }
    }

    /**
     * Check if AI chat is enabled (public endpoint).
     */
    public function status()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'enabled' => com_option_get('com_ai_chat_enabled') === 'on',
                'guest_enabled' => com_option_get('com_ai_chat_guest_enabled') === 'on',
            ],
        ]);
    }
}
