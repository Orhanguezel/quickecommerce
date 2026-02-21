<?php

namespace Modules\Chat\app\Http\Controllers\Api;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Models\Customer;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Modules\Chat\app\Models\Chat;
use Modules\Chat\app\Models\ChatMessage;
use Modules\Chat\app\Transformers\ChatListResource;
use Modules\Chat\app\Transformers\ChatMessageDetailsResource;

class AdminChatController extends Controller
{
    protected function repairOrphanStoreChats(): void
    {
        $validStoreIds = Store::query()->pluck('id');
        if ($validStoreIds->isEmpty()) {
            return;
        }

        $existingStoreChatStoreIds = Chat::query()
            ->where('user_type', 'store')
            ->whereIn('user_id', $validStoreIds)
            ->pluck('user_id');

        $orphanStoreChats = Chat::query()
            ->where('user_type', 'store')
            ->whereNotIn('user_id', $validStoreIds)
            ->orderBy('id')
            ->get(['id', 'user_id']);

        if ($orphanStoreChats->isEmpty()) {
            return;
        }

        $missingStoreIds = Store::query()
            ->whereNotIn('id', $existingStoreChatStoreIds)
            ->orderBy('id')
            ->pluck('id')
            ->values();

        if ($missingStoreIds->count() !== $orphanStoreChats->count()) {
            return;
        }

        foreach ($orphanStoreChats->values() as $index => $chat) {
            $targetStoreId = $missingStoreIds->get($index);
            if (empty($targetStoreId)) {
                continue;
            }
            Chat::query()->where('id', $chat->id)->update(['user_id' => $targetStoreId]);
        }
    }

    public function adminChatList(Request $request)
    {
        $auth_user = auth()->guard('api')->user();
        $auth_id = $auth_user->id;
        $auth_type = 'admin';

        // Ensure admin chat exists for first-message flow.
        Chat::firstOrCreate([
            'user_id' => $auth_id,
            'user_type' => $auth_type,
        ]);

        // Repair stale store chat rows caused by store reseeding/id changes.
        $this->repairOrphanStoreChats();

        $name = $request->input('search');
        $type = $request->input('type');

        // Main query
        $query = Chat::query()
            ->with('user')
            ->whereIn('user_type', ['store', 'deliveryman'])
            ->whereHasMorph('user', [Store::class, User::class]);

        // Apply search filter
        if ($name) {
            // Get matching chat IDs separately to avoid complex polymorphic issues
            $matchingChatIds = collect();

            // Deliveryman matches - direct database query
            $deliverymanChats = Chat::where('user_type', 'deliveryman')
                ->join('users', 'chats.user_id', '=', 'users.id')
                ->where(function ($q) use ($name) {
                    $q->where('users.first_name', 'like', "%{$name}%")
                        ->orWhere('users.last_name', 'like', "%{$name}%")
                        ->orWhereRaw("LOWER(CONCAT(users.first_name, ' ', users.last_name)) LIKE ?", ["%" . strtolower($name) . "%"]);
                })
                ->pluck('chats.id');
            $matchingChatIds = $matchingChatIds->merge($deliverymanChats);

            // Store matches
            $storeChats = Chat::where('user_type', 'store')
                ->whereHasMorph('user', [Store::class], function ($q) use ($name) {
                    $q->where('name', 'like', "%{$name}%");
                })->pluck('id');
            $matchingChatIds = $matchingChatIds->merge($storeChats);

            // Filter main query by matching IDs
            if ($matchingChatIds->isNotEmpty()) {
                $query->whereIn('id', $matchingChatIds->toArray());
            } else {
                // No matches found
                $query->whereRaw('1 = 0'); // Force empty result
            }
        }

        // Apply type filter
        if (!empty($type) && $type !== 'all') {
            $query->where('user_type', $type);
        }

        $chats = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => ChatListResource::collection($chats),
            'meta' => new PaginationResource($chats),
        ]);
    }

    public function chatWiseFetchMessages(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'receiver_id' => 'required|integer',
            'receiver_type' => 'required|string|in:customer,store,admin,deliveryman',
            'search' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $auth_id = auth()->guard('api')->user()->id;
        $chat = Chat::where('user_id', $auth_id)->first();

        if (empty($chat)) {
            return response()->json([
                'success' => false,
                'message' => __('chat::messages.not_found', ['name' => 'Chat']),
            ]);
        }


        $auth_type = 'admin';

        $receiver_id = $request->receiver_id;
        $receiver_type = $request->receiver_type;

        // get message
        $message_query = ChatMessage::query()
            ->where(function ($query) use ($auth_id, $auth_type, $receiver_id, $receiver_type) {
                $query->where(function ($q) use ($auth_id, $auth_type, $receiver_id, $receiver_type) {
                    $q->where('sender_id', $auth_id)
                        ->where('sender_type', $auth_type)
                        ->where('receiver_id', $receiver_id)
                        ->where('receiver_type', $receiver_type);
                })->orWhere(function ($q) use ($auth_id, $auth_type, $receiver_id, $receiver_type) {
                    $q->where('sender_id', $receiver_id)
                        ->where('sender_type', $receiver_type)
                        ->where('receiver_id', $auth_id)
                        ->where('receiver_type', $auth_type);
                });
            });

        $unread_message = (clone $message_query)->where('is_seen', 0)->count();
        (clone $message_query)->where('is_seen', 1)->update(['is_seen' => 1]);

        $messages = $message_query
            ->latest()
            ->paginate(30);

        return response()->json([
            'success' => true,
            'unread_message' => $unread_message,
            'data' => ChatMessageDetailsResource::collection($messages),
            'meta' => new PaginationResource($messages)
        ]);
    }

    public function markAsSeen(Request $request)
    {
        ChatMessage::where('chat_id', $request->chat_id)
            ->where('receiver_id', auth()->id())
            ->where('is_seen', 0)
            ->update(['is_seen' => 1]);

        return response()->json(['success' => true]);
    }
}
