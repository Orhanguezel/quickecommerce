<?php

namespace Modules\Chat\app\Http\Controllers\Api;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\SettingOption;
use App\Models\Translation;
use Illuminate\Http\Request;
use Modules\Chat\app\Models\AiChatConversation;
use Modules\Chat\app\Models\AiChatMessage;

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
                'translations' => 'nullable|array',
                'translations.*' => 'nullable|string',
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
                    foreach ((array) $request->input('translations', []) as $lang => $value) {
                        $normalizedValue = is_string($value) ? trim($value) : '';
                        $where = [
                            'translatable_type' => SettingOption::class,
                            'translatable_id' => $settingOption->id,
                            'language' => $lang,
                            'key' => 'com_ai_chat_system_prompt',
                        ];

                        // Avoid inserting NULL into translations.value (NOT NULL column).
                        if ($normalizedValue === '') {
                            Translation::where($where)->delete();
                            continue;
                        }

                        Translation::updateOrCreate(
                            $where,
                            ['value' => $normalizedValue]
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

        // Include saved translations for system prompt so admin can edit existing texts.
        $translations = [];
        $settingOption = SettingOption::where('option_name', 'com_ai_chat_system_prompt')->first();
        if ($settingOption) {
            $rows = Translation::where('translatable_type', SettingOption::class)
                ->where('translatable_id', $settingOption->id)
                ->where('key', 'com_ai_chat_system_prompt')
                ->get(['language', 'value']);

            foreach ($rows as $row) {
                $translations[$row->language] = $row->value;
            }
        }
        $settings['translations'] = $translations;
        if (empty($settings['com_ai_chat_system_prompt'])) {
            $fallback = collect($translations)->first(function ($v) {
                return is_string($v) && trim($v) !== '';
            });
            if (!empty($fallback)) {
                $settings['com_ai_chat_system_prompt'] = $fallback;
            }
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

    /**
     * GET conversation messages (admin monitoring).
     */
    public function conversationMessages(Request $request, int $conversationId)
    {
        $perPage = (int) $request->input('per_page', 30);

        $conversation = AiChatConversation::with(['customer:id,first_name,last_name,email'])
            ->findOrFail($conversationId);

        $messages = AiChatMessage::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'conversation' => $conversation,
            'data' => $messages,
        ]);
    }
}
