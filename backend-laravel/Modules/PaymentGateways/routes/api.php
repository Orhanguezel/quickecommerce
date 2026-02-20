<?php

use App\Enums\PermissionKey;
use App\Http\Controllers\Api\V1\Com\ComSiteGeneralController;
use Illuminate\Support\Facades\Route;
use Modules\PaymentGateways\app\Http\Controllers\Api\PaymentGatewaysController;
use Modules\PaymentGateways\app\Http\Controllers\Api\PaymentGatewaySettingsController;

Route::middleware(['auth:sanctum', 'permission:' . PermissionKey::ADMIN_PAYMENT_SETTINGS->value, 'detect.platform'])->prefix('v1')->group(function () {
    Route::group(['prefix' => 'admin/payment-gateways'], function () {
        Route::match(['GET', 'POST'], '/{gateway?}', [PaymentGatewaySettingsController::class, 'paymentGatewayUpdate']);
    });
    Route::group(['prefix' => 'admin/currency'], function () {
        Route::get('/', [PaymentGatewaySettingsController::class, 'listCurrency']);
        Route::post('/add', [PaymentGatewaySettingsController::class, 'createCurrency']);
        Route::get('details/{id}', [PaymentGatewaySettingsController::class, 'getCurrencyById']);
        Route::put('/update', [PaymentGatewaySettingsController::class, 'updateCurrency']);
        Route::delete('remove/{id}', [PaymentGatewaySettingsController::class, 'deleteCurrency']);
        // currency settings route
        Route::get('/settings', [PaymentGatewaySettingsController::class, 'currencySettingsGet']);
        Route::put('/settings/update', [PaymentGatewaySettingsController::class, 'currencySettingsUpdate']);
    });
});

Route::middleware('detect.platform')->group(function () {
    Route::group(['prefix' => 'v1/'], function () {
        // payment gateways lists
        Route::get('/currency-list', [ComSiteGeneralController::class, 'currencyList']);
        Route::get('currency-info', [PaymentGatewaysController::class, 'currencySettingsGet']);
        Route::get('payment-gateways', [PaymentGatewaysController::class, 'paymentGateways']);
    });
});
