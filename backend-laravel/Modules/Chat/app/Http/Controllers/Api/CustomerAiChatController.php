<?php

namespace Modules\Chat\app\Http\Controllers\Api;

use App\Http\Controllers\Api\V1\Controller;
use Illuminate\Http\Request;
use Modules\Chat\app\Models\AiChatConversation;
use Modules\Chat\app\Models\AiChatMessage;
use Modules\Chat\app\Services\AiChatService;

class CustomerAiChatController extends Controller
{
    public function __construct(
        private AiChatService $aiChatService,
    ) {}

    /**
     * Send a message and get an AI response (authenticated customer).
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

        $request->validate([
            'message' => 'required|string|max:2000',
            'session_id' => 'required|string|max:64',
        ]);

        $customerId = auth('api_customer')->id();
        $locale = app()->getLocale();

        try {
            $result = $this->aiChatService->sendMessage(
                $request->message,
                $request->session_id,
                $customerId,
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
            \Log::error('AI Chat Error (Customer)', [
                'customer_id' => $customerId,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'AI yanıt veremedi. Lütfen tekrar deneyin.',
            ], 500);
        }
    }

    /**
     * Get conversation history.
     */
    public function history(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string|max:64',
        ]);

        $customerId = auth('api_customer')->id();

        $conversation = AiChatConversation::where('session_id', $request->session_id)
            ->where('customer_id', $customerId)
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $messages = AiChatMessage::where('conversation_id', $conversation->id)
            ->where('role', '!=', 'system')
            ->orderBy('created_at')
            ->get(['id', 'role', 'content', 'created_at']);

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }
}
