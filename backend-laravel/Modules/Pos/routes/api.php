<?php

use App\Enums\PermissionKey;
use Illuminate\Support\Facades\Route;
use Modules\Pos\app\Http\Controllers\Api\Admin\AdminPosSaleController;
use Modules\Pos\app\Http\Controllers\Api\Admin\PosSettingsController;
use Modules\Pos\app\Http\Controllers\Api\Seller\SellerPosSaleController;


Route::group(['namespace' => 'Api\V1', 'middleware' => ['auth:sanctum']], function () {
    // POS Manage
    Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_POS_SALES->value]], function () {
        Route::group(['prefix' => '/v1/admin/pos'], function () {
            Route::post('checkout', [AdminPosSaleController::class, 'createOrder']);
            Route::get('products', [AdminPosSaleController::class, 'listProducts']);
            Route::get('products/{slug}', [AdminPosSaleController::class, 'getProductBySlug']);
            Route::get('customers', [AdminPosSaleController::class, 'listCustomers']);
            Route::post('add-customer', [AdminPosSaleController::class, 'addCustomer']);
            Route::post('invoice', [AdminPosSaleController::class, 'invoice']);
            Route::get('orders/{order_id?}', [AdminPosSaleController::class, 'orders'])->middleware('permission:' . PermissionKey::ADMIN_POS_ORDERS->value);

            Route::group(['prefix' => '/settings', 'middleware' => ['permission:' . PermissionKey::ADMIN_POS_SETTINGS->value]], function () {
                Route::get('/', [AdminPosSaleController::class, 'posSettings']);
                Route::put('/', [AdminPosSaleController::class, 'updatePosSettings']);
            });
        });
    });
    // POS Manage
    Route::group(['prefix' => 'v1/seller/store/pos', 'middleware' => ['check.email.verification.option:seller', 'permission:' . PermissionKey::SELLER_STORE_POS_SALES->value]], function () {
        Route::post('checkout', [SellerPosSaleController::class, 'createOrder']);
        Route::get('products', [SellerPosSaleController::class, 'listProducts']);
        Route::get('products/{slug}', [SellerPosSaleController::class, 'getProductBySlug']);
        Route::get('customers', [SellerPosSaleController::class, 'listCustomers']);
        Route::post('add-customer', [SellerPosSaleController::class, 'addCustomer']);
        Route::post('invoice', [SellerPosSaleController::class, 'invoice']);
        Route::get('orders/{order_id?}', [SellerPosSaleController::class, 'orders'])->middleware('permission:' . PermissionKey::SELLER_STORE_POS_ORDERS->value);
        Route::get('/settings', [AdminPosSaleController::class, 'posSettings']);
    });

});







