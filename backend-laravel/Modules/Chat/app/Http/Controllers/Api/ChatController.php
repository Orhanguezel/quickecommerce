<?php

namespace Modules\Chat\app\Http\Controllers\Api;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Customer;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use Modules\Chat\app\Models\Chat;
use Modules\Chat\app\Models\ChatMessage;

class ChatController extends Controller
{
    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'receiver_id' => 'required|integer',
            'message' => 'nullable|string',
            'file' => 'nullable|file|mimes:png,jpg,jpeg,webp,gif,pdf|max:2048', // max 2MB
            'store_id' => 'nullable|exists:stores,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check authenticated user
        $authUser = auth()->guard('api')->user();
        if ($authUser->activity_scope == 'store_level' && $authUser->store_owner) {
            if (!isset($request->store_id)){
                return response()->json([
                    'message' => __('validation.required',["attribute" => "store_id"]),
                ],422);
            }
            $authStore = Store::where('id', $request->store_id)->where('store_seller_id', $authUser->id)->first();
            if (!$authUser) {
                return response()->json([
                    'message' => __('chat::messages.store.doesnt.belongs.to.seller')
                ],422);
            }
        }
        if (!$authUser) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized.',
            ], 403);
        }

        // if sender type (store) and receiver type (customer or deliveryman) not send message
        if ($authUser->activity_scope === 'store_level' && $request->receiver_type === 'store') {
            return response()->json([
                'success' => false,
                'message' => 'Store cannot send messages only send to admin and customer.',
            ], 422);
        }

        // receiver info check
        $receiver_id = $request->receiver_id;
        $receiver_type = $request->receiver_type;

        if ($authUser->activity_scope === 'store_level') {
            $isLiveChatEnabled = checkSubscription($request->store_id, 'live_chat');
            if (!$isLiveChatEnabled) {
                return response()->json([
                    'message' => __('chat::messages.feature_not_available', ['name' => 'Chat']),
                ], 422);
            }
        }

        if ($receiver_type == 'store' && $authUser->activity_scope !== 'system_level') {
            $isLiveChatEnabled = checkSubscription($receiver_id, 'live_chat');
            if (!$isLiveChatEnabled) {
                return response()->json([
                    'message' => __('chat::messages.feature_not_available', ['name' => 'Chat']),
                ], 422);
            }
        }

        // Get Receiver info
        if ($receiver_type === 'customer') {
            $receiver = Customer::find($receiver_id);
        } elseif ($receiver_type === 'store') {
            $receiver = Store::find($receiver_id);
        } elseif (in_array($receiver_type, ['admin', 'deliveryman'])) {
            $receiver = User::find($receiver_id);
        }
        // Check  sender type
        if ($authUser->activity_scope === 'system_level') {
            $authType = 'admin';
        } elseif ($authUser->activity_scope === 'store_level') {
            $authType = 'store';
        } elseif ($authUser->activity_scope === 'delivery_level') {
            $authType = 'deliveryman';
        } else {
            $authType = 'customer';
        }

        // if receiver exits
        if (empty($receiver)) {
            return response()->json([
                'success' => false,
                'message' => 'Receiver not found',
            ], 404);
        }

        // Receiver Type Set
        if (!empty($receiver)) {
            if ($receiver->activity_scope === 'system_level') {
                $receiver_type = 'admin';
            } elseif (isset($receiver->store_type) && !empty($receiver->store_type)) {
                // store check and store not exits activity_scope check only store_type
                $receiver_type = 'store';
            } elseif ($receiver->activity_scope === 'delivery_level') {
                $receiver_type = 'deliveryman';
            } else {
                $receiver_type = 'customer';
            }
        }

        // if sender and receiver type same  message not send
        if ($authType === $receiver_type) {
            return response()->json([
                'success' => true,
                'message' => 'Sender and receiver cannot be of the same type.',
            ]);
        }

        // receiver chat id
        $receiver_chat = Chat::select('id')->where('user_id', $receiver->id)->where('user_type', $receiver_type)->first();
        if (empty($receiver_chat)) {
            return response()->json([
                'success' => false,
                'message' => 'Receiver chat not found',
            ], 422);
        }


        $data = [
            'receiver_chat_id' => $receiver_chat->id,
            'sender_id' => $authType == 'store' ? $authStore->id : $authUser->id,
            'sender_type' => $authType,
            'receiver_id' => $receiver->id,
            'receiver_type' => $receiver_type,
            'message' => $request->message,
        ];


        // sender chat id
        $sender_chat_id = Chat::where('user_id', $authUser->id)->first()->id;
        $data['chat_id'] = $sender_chat_id;

        // upload file
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());
            $filename = time() . '_' . Str::random(10) . '.' . $extension;
            $uploadPath = 'uploads/chat/' . $filename;
            $fullPath = storage_path('app/public/' . $uploadPath);
            $directory = dirname($fullPath);

            // Ensure the directory exists
            if (!File::exists($directory)) {
                File::makeDirectory($directory, 0755, true);
            }

            // Image files
            if (in_array($extension, ['png', 'jpg', 'jpeg', 'webp', 'gif'])) {
                $image = Image::make($file)->resize(1000, null, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });

                $image->save($fullPath);
            } // PDF or other allowed non-image
            elseif ($extension === 'pdf') {
                $file->storeAs('uploads/chat', $filename, 'public');
            }

            $data['file'] = $uploadPath;
        }

        $message = ChatMessage::create($data);

        // Update online_at only for this store
        try {
            $storeId = (int)$request->store_id;
            if ($storeId) {
                Store::where('id', $storeId)
                    ->where('store_seller_id', $authUser->id)
                    ->update(['online_at' => (new \DateTime())->format("Y-m-d H:i:s")]);
            }
        } catch (\Exception $e) {
        }

        try {
            //  broadcast with Pusher
            event(new \App\Events\MessageSent($message));
        } catch (\Exception $e) {
        }

        return response()->json([
            'success' => true,
            'message_id' => $message->id,
            'sender_id' => $message->sender_id,
            'receiver_id' => $message->receiver_id,
            'receiver_type' => $message->receiver_type,
            'message_text' => $message->message,
            'file_url' => $message->file ? asset('storage/' . $message->file) : null,
            'message' => 'Message sent Successfully',
        ]);

    }

}
