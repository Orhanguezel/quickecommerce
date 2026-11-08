<?php

use App\Http\Controllers\Api\V1\Whatsapp\AdminController;
use App\Http\Controllers\Api\V1\Whatsapp\PreferenceController;
use App\Http\Controllers\Api\V1\Whatsapp\WebhookController;
use Illuminate\Support\Facades\Route;

Route::get('webhooks/whatsapp', [WebhookController::class, 'verify']);
Route::post('webhooks/whatsapp', [WebhookController::class, 'receive']);
Route::prefix('admin/whatsapp')->middleware(['auth:sanctum', \App\Http\Middleware\WhatsappAdmin::class, 'permission:whatsapp.manage', 'throttle:60,1'])->group(function () {
    Route::get('/', [AdminController::class, 'status']);
    Route::post('connect', [AdminController::class, 'connect']);
    Route::post('refresh', [AdminController::class, 'refresh']);
    Route::post('subscribe', [AdminController::class, 'subscribe']);
    Route::post('settings', [AdminController::class, 'settings']);
    Route::match(['GET', 'POST'], 'templates', [AdminController::class, 'templates']);
});
Route::prefix('admin/whatsapp')->middleware(['auth:sanctum', \App\Http\Middleware\WhatsappAdmin::class, 'permission:whatsapp.inbox', 'throttle:60,1'])->group(function () {
    Route::get('messages/{id}', [AdminController::class, 'detail']);
    Route::get('messages', [AdminController::class, 'messages']);
    Route::get('conversations/{id}', [AdminController::class, 'conversation']);
    Route::get('messages/{id}/media', [AdminController::class, 'download']);
    Route::post('conversations/{id}/media', [AdminController::class, 'media']);
    Route::post('messages/{id}/read', [AdminController::class, 'read']);
    Route::post('conversations/{id}/reply', [AdminController::class, 'reply']);
});
Route::prefix('customer/profile/whatsapp-preferences')->middleware(['auth:api_customer', 'check.customer.account.status', 'throttle:30,1'])->group(function () {
    Route::get('/', [PreferenceController::class, 'show']);
    Route::post('/', [PreferenceController::class, 'save']);
});

Route::prefix('admin/whatsapp')->middleware(['auth:sanctum', \App\Http\Middleware\WhatsappAdmin::class, 'permission:whatsapp.send', 'throttle:10,1'])->group(function () {
    Route::post('preview', [AdminController::class, 'preview']);
    Route::post('test-send', [AdminController::class, 'testSend']);
    Route::post('messages/{id}/retry', [AdminController::class, 'retry']);
});
