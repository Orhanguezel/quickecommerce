<?php

namespace Modules\Chat\app\Http\Controllers\Api;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\SettingOption;
use App\Models\Translation;
use Illuminate\Http\Request;
use Modules\Chat\app\Models\AiChatConversation;

class AdminAiChatSettingsController extends Controller
{
    /**
     * GET/POST AI Chat Settings.
     */
    public function settings(Request $request)
    {
        if ($request->isMethod('POST')) {
            $request->validate([
                'com_ai_chat_enabled' => 'nullable|string',
                'com_ai_chat_active_provider' => 'nullable|string|in:groq,openai,anthropic,gemini',
                'com_ai_chat_api_key' => 'nullable|string',
                'com_ai_chat_model' => 'nullable|string',
                'com_ai_chat_max_tokens' => 'nullable|integer|min:100|max:4096',
                'com_ai_chat_temperature' => 'nullable|numeric|min:0|max:2',
                'com_ai_chat_system_prompt' => 'nullable|string',
                'com_ai_chat_guest_enabled' => 'nullable|string',
            ]);

            $fields = [
                'com_ai_chat_enabled',
                'com_ai_chat_active_provider',
                'com_ai_chat_api_key',
                'com_ai_chat_model',
                'com_ai_chat_max_tokens',
                'com_ai_chat_temperature',
                'com_ai_chat_system_prompt',
                'com_ai_chat_guest_enabled',
            ];

            foreach ($fields as $field) {
                if ($request->has($field)) {
                    com_option_update($field, $request->input($field, ''));
                }
            }

            // Handle system prompt translations
            if ($request->has('translations')) {
                $settingOption = SettingOption::where('option_name', 'com_ai_chat_system_prompt')->first();
                if ($settingOption) {
                    foreach ($request->input('translations', []) as $lang => $value) {
                        Translation::updateOrCreate(
                            [
                                'translatable_type' => SettingOption::class,
                                'translatable_id' => $settingOption->id,
                                'language' => $lang,
                                'key' => 'com_ai_chat_system_prompt',
                            ],
                            ['value' => $value]
                        );
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'AI Chat settings updated successfully.',
            ]);
        }

        // GET - return current settings
        $settings = [];
        $fields = [
            'com_ai_chat_enabled',
            'com_ai_chat_active_provider',
            'com_ai_chat_api_key',
            'com_ai_chat_model',
            'com_ai_chat_max_tokens',
            'com_ai_chat_temperature',
            'com_ai_chat_system_prompt',
            'com_ai_chat_guest_enabled',
        ];

        foreach ($fields as $field) {
            $settings[$field] = com_option_get($field);
        }

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * GET AI Chat conversations (admin monitoring).
     */
    public function conversations(Request $request)
    {
        $perPage = $request->input('per_page', 20);

        $conversations = AiChatConversation::with(['customer:id,first_name,last_name,email'])
            ->withCount('messages')
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $conversations,
        ]);
    }
}
