<?php

use App\Enums\PermissionKey;
use Illuminate\Support\Facades\Route;
use Modules\Chat\app\Http\Controllers\Api\AdminChatController;
use Modules\Chat\app\Http\Controllers\Api\AdminChatManageController;
use Modules\Chat\app\Http\Controllers\Api\ChatController;
use Modules\Chat\app\Http\Controllers\Api\ChatManageController;
use Modules\Chat\app\Http\Controllers\Api\DeliverymanChatController;
use Modules\Chat\app\Http\Controllers\Api\StoreChatController;
use Modules\Chat\app\Http\Controllers\Api\CustomerChatController;
use Modules\Chat\app\Http\Controllers\Api\AdminAiChatSettingsController;
use Modules\Chat\app\Http\Controllers\Api\AdminAiChatKnowledgeController;
use Modules\Chat\app\Http\Controllers\Api\CustomerAiChatController;
use Modules\Chat\app\Http\Controllers\Api\GuestAiChatController;


//  Admin Chat manage
Route::middleware(['auth:sanctum','online.track', 'detect.platform'])->prefix('v1/admin/chat/')->group(function () {
    Route::prefix('settings')->middleware(['permission:' . PermissionKey::ADMIN_CHAT_SETTINGS->value])->group(function () {
        Route::match(['get', 'post'], '/', [AdminChatManageController::class, 'chatPusherSettings']);
    });

    // prefix manage
    Route::prefix('manage/')->middleware(['permission:' . PermissionKey::ADMIN_CHAT_MANAGE->value])->group(function () {
        Route::get('list', [AdminChatController::class, 'adminChatList']);
        Route::post('send', [ChatController::class, 'sendMessage']);
        Route::get('messages-details', [AdminChatController::class, 'chatWiseFetchMessages']);
        Route::post('chat/seen', [AdminChatController::class, 'markAsSeen']);
    });
});

//  Seller Chat manage
Route::middleware(['auth:sanctum','online.track','check.email.verification.option:seller', 'detect.platform'])->prefix('v1/seller/store/')->group(function () {
    Route::prefix('chat')->middleware(['permission:' . PermissionKey::SELLER_CHAT_MANAGE->value])->group(function () {
        Route::get('list', [StoreChatController::class, 'chatList']);
        Route::post('send', [ChatController::class, 'sendMessage']);
        Route::get('messages-details', [StoreChatController::class, 'chatWiseFetchMessages']);
        Route::post('chat/seen', [StoreChatController::class, 'markAsSeen']);
    });
});

//  Customer Chat manage
Route::middleware(['auth:sanctum','online.track','check.email.verification.option:customer', 'detect.platform'])->prefix('v1/customer/chat/')->group(function () {
    Route::get('list/', [CustomerChatController::class, 'customerChatList']);
    Route::post('send', [CustomerChatController::class, 'customerSendMessage']);
    Route::get('messages-details', [CustomerChatController::class, 'chatWiseFetchMessages']);
    Route::post('chat/seen', [CustomerChatController::class, 'markAsSeen']);
});

//  deliveryman Chat manage
Route::middleware(['auth:sanctum','online.track', 'detect.platform'])->prefix('v1/deliveryman/chat/')->group(function () {
    Route::get('list/', [DeliverymanChatController::class, 'deliverymanChatList']);
    Route::post('send', [ChatController::class, 'sendMessage']);
    Route::get('messages-details', [DeliverymanChatController::class, 'deliverymanChatWiseFetchMessages']);
    Route::post('chat/seen', [DeliverymanChatController::class, 'markAsSeen']);
});


// pusher info
Route::middleware(['auth:sanctum','detect.platform'])->prefix('v1/')->group(function () {
    Route::get('/chat-credentials', [ChatManageController::class, 'getChatCredentials']);
});


// ── AI Chat (Admin Settings & Knowledge Base) ───────────────────
Route::middleware(['auth:sanctum', 'online.track', 'detect.platform'])
    ->prefix('v1/admin/ai-chat/')
    ->group(function () {
        Route::match(['get', 'post'], 'settings', [AdminAiChatSettingsController::class, 'settings'])
            ->middleware('permission:' . PermissionKey::ADMIN_CHAT_SETTINGS->value);

        Route::prefix('knowledge')->middleware('permission:' . PermissionKey::ADMIN_CHAT_SETTINGS->value)->group(function () {
            Route::get('list', [AdminAiChatKnowledgeController::class, 'list']);
            Route::post('add', [AdminAiChatKnowledgeController::class, 'store']);
            Route::get('details/{id}', [AdminAiChatKnowledgeController::class, 'details']);
            Route::post('update', [AdminAiChatKnowledgeController::class, 'update']);
            Route::delete('remove/{id}', [AdminAiChatKnowledgeController::class, 'remove']);
            Route::post('change-status', [AdminAiChatKnowledgeController::class, 'changeStatus']);
        });

        Route::get('conversations', [AdminAiChatSettingsController::class, 'conversations'])
            ->middleware('permission:' . PermissionKey::ADMIN_CHAT_SETTINGS->value);
        Route::get('conversations/{conversationId}/messages', [AdminAiChatSettingsController::class, 'conversationMessages'])
            ->middleware('permission:' . PermissionKey::ADMIN_CHAT_SETTINGS->value);
    });

// ── AI Chat (Customer - authenticated) ──────────────────────────
Route::middleware(['auth:sanctum', 'online.track', 'check.email.verification.option:customer', 'detect.platform', 'throttle:10,1'])
    ->prefix('v1/customer/ai-chat/')
    ->group(function () {
        Route::post('send', [CustomerAiChatController::class, 'send']);
        Route::get('history', [CustomerAiChatController::class, 'history']);
    });

// ── AI Chat (Guest - no auth) ───────────────────────────────────
Route::middleware(['detect.platform'])
    ->prefix('v1/ai-chat/')
    ->group(function () {
        Route::post('send', [GuestAiChatController::class, 'send'])->middleware('throttle:5,1');
        Route::get('status', [GuestAiChatController::class, 'status']);
    });
