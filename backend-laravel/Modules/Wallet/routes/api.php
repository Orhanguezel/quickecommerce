<?php

use App\Enums\PermissionKey;
use App\Http\Controllers\Api\V1\HmacGenerateController;
use App\Http\Controllers\Api\V1\StripePaymentController;
use App\Http\Controllers\Api\V1\StripeWebhookController;
use Illuminate\Support\Facades\Route;
use Modules\Wallet\app\Http\Controllers\Api\SellerAndDeliverymanWithdrawController;
use Modules\Wallet\app\Http\Controllers\Api\WalletCommonController;

Route::middleware(['auth:sanctum','detect.platform'])->prefix('v1')->group(function () {
    // seller wallet
    Route::prefix('seller/store/financial/')->middleware(['check.email.verification.option:seller','permission:' . PermissionKey::SELLER_STORE_FINANCIAL_WALLET->value])->group(function () {
        Route::group(['prefix' => 'wallet/'], function () {
            Route::get('/', [WalletCommonController::class, 'myWalletInfo']);
            Route::post('deposit', [WalletCommonController::class, 'depositCreate']);
            Route::get('transactions', [WalletCommonController::class, 'transactionRecords']);
        });
        // withdraw history
        Route::group(['prefix' => 'withdraw/', 'middleware' => ['check.email.verification.option:seller','permission:' . PermissionKey::SELLER_STORE_FINANCIAL_WITHDRAWALS->value]], function () {
            Route::get('/', [SellerAndDeliverymanWithdrawController::class, 'withdrawAllList']);
            Route::get('details/{id?}', [SellerAndDeliverymanWithdrawController::class, 'withdrawDetails']);
            Route::post('withdraw-request', [SellerAndDeliverymanWithdrawController::class, 'withdrawRequest']);
        });
    });

    // deliveryman wallet
    Route::group(['prefix' => 'deliveryman/'], function () {
        Route::group(['prefix' => 'wallet/'], function () {
            Route::get('/', [WalletCommonController::class, 'myWalletInfo']);
            Route::post('deposit', [WalletCommonController::class, 'depositCreate']);
            Route::get('transactions', [WalletCommonController::class, 'transactionRecords']);
            Route::get('wallet-history', [WalletCommonController::class, 'walletHistory']);
        });
        Route::group(['prefix' => 'withdraw/'], function () {
            Route::get('/', [SellerAndDeliverymanWithdrawController::class, 'withdrawAllList']);
            Route::get('details/{id?}', [SellerAndDeliverymanWithdrawController::class, 'withdrawDetails']);
            Route::post('withdraw-request', [SellerAndDeliverymanWithdrawController::class, 'withdrawRequest']);
        });
    });

    // Customer Wallet
    Route::group(['prefix' => 'customer/wallet','middleware' => ['check.email.verification.option:customer']], function () {
        Route::get('/', [WalletCommonController::class, 'myWalletInfo']);
        Route::post('deposit', [WalletCommonController::class, 'depositCreate']);
        Route::get('transactions', [WalletCommonController::class, 'transactionRecords']);
    });

    //wallet common routes
    Route::group(['prefix' => '/wallet'], function () {
        Route::post('/payment-status-update', [WalletCommonController::class, 'paymentStatusUpdate'])->middleware('verify.hmac');
        Route::get('/generate-hmac', [HmacGenerateController::class, 'generateHmac']);
        Route::post('/create-stripe-session', [StripePaymentController::class, 'createCheckoutSessionForWallet']);
        Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhookForWallet']);
    });

    Route::get('withdraw/gateway-method-list', [SellerAndDeliverymanWithdrawController::class, 'withdrawGatewayList']);
});
