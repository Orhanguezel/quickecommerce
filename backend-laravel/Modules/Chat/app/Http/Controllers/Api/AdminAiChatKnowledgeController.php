<?php

namespace Modules\Chat\app\Http\Controllers\Api;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Translation;
use Illuminate\Http\Request;
use Modules\Chat\app\Models\AiChatKnowledge;

class AdminAiChatKnowledgeController extends Controller
{
    /**
     * List knowledge base entries.
     */
    public function list(Request $request)
    {
        $query = AiChatKnowledge::query()->with('translations');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                  ->orWhere('answer', 'like', "%{$search}%");
            });
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        $perPage = $request->input('per_page', 20);

        $entries = $query->orderBy('sort_order')
            ->orderBy('id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $entries,
        ]);
    }

    /**
     * Create a new knowledge entry.
     */
    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string|max:50',
            'question' => 'required|string',
            'answer' => 'required|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $entry = AiChatKnowledge::create([
            'category' => $request->category,
            'question' => $request->question,
            'answer' => $request->answer,
            'is_active' => $request->input('is_active', true),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        // Handle translations
        $this->saveTranslations($entry, $request->input('translations', []));

        return response()->json([
            'success' => true,
            'message' => 'Knowledge entry created successfully.',
            'data' => $entry,
        ], 201);
    }

    /**
     * Get single knowledge entry details.
     */
    public function details($id)
    {
        $entry = AiChatKnowledge::with('translations')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $entry,
        ]);
    }

    /**
     * Update a knowledge entry.
     */
    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:ai_chat_knowledge,id',
            'category' => 'required|string|max:50',
            'question' => 'required|string',
            'answer' => 'required|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $entry = AiChatKnowledge::findOrFail($request->id);
        $entry->update([
            'category' => $request->category,
            'question' => $request->question,
            'answer' => $request->answer,
            'is_active' => $request->input('is_active', true),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        // Handle translations
        $this->saveTranslations($entry, $request->input('translations', []));

        return response()->json([
            'success' => true,
            'message' => 'Knowledge entry updated successfully.',
            'data' => $entry,
        ]);
    }

    /**
     * Delete a knowledge entry.
     */
    public function remove($id)
    {
        $entry = AiChatKnowledge::findOrFail($id);

        // Delete translations
        $entry->translations()->delete();
        $entry->delete();

        return response()->json([
            'success' => true,
            'message' => 'Knowledge entry deleted successfully.',
        ]);
    }

    /**
     * Toggle is_active status.
     */
    public function changeStatus(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:ai_chat_knowledge,id',
        ]);

        $entry = AiChatKnowledge::findOrFail($request->id);
        $entry->update(['is_active' => !$entry->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Status changed successfully.',
            'data' => ['is_active' => $entry->is_active],
        ]);
    }

    /**
     * Save translations for a knowledge entry.
     */
    private function saveTranslations(AiChatKnowledge $entry, array $translations): void
    {
        foreach ($translations as $lang => $fields) {
            foreach (['question', 'answer'] as $key) {
                if (isset($fields[$key])) {
                    Translation::updateOrCreate(
                        [
                            'translatable_type' => AiChatKnowledge::class,
                            'translatable_id' => $entry->id,
                            'language' => $lang,
                            'key' => $key,
                        ],
                        ['value' => $fields[$key]]
                    );
                }
            }
        }
    }
}
