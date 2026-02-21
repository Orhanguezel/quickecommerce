<?php

use App\Enums\PermissionKey;
use App\Http\Controllers\Api\V1\Auth\PartnerLoginController;
use App\Http\Controllers\Api\V1\DynamicFieldsManageController;
use App\Http\Controllers\Api\V1\NotificationManageController;
use App\Http\Controllers\Api\V1\OpenAiController;
use App\Http\Controllers\Api\V1\Product\ProductAttributeController;
use App\Http\Controllers\Api\V1\Product\ProductAuthorController;
use App\Http\Controllers\Api\V1\Product\ProductVariantController;
use App\Http\Controllers\Api\V1\Seller\SellerBannerManageController;
use App\Http\Controllers\Api\V1\Seller\SellerCargoController;
use App\Http\Controllers\Api\V1\Seller\SellerBusinessSettingsController;
use App\Http\Controllers\Api\V1\Seller\SellerDeliverymanManageController;
use App\Http\Controllers\Api\V1\Seller\SellerFlashSaleProductManageController;
use App\Http\Controllers\Api\V1\Seller\SellerInventoryManageController;
use App\Http\Controllers\Api\V1\Seller\SellerManageController;
use App\Http\Controllers\Api\V1\Seller\SellerProductManageController;
use App\Http\Controllers\Api\V1\Seller\SellerProductQueryController;
use App\Http\Controllers\Api\V1\Seller\SellerReviewController;
use App\Http\Controllers\Api\V1\Seller\SellerProductCategoryController;
use App\Http\Controllers\Api\V1\Seller\SellerStoreDashboardManageController;
use App\Http\Controllers\Api\V1\Seller\SellerStoreManageController;
use App\Http\Controllers\Api\V1\Seller\SellerStoreNoticeController;
use App\Http\Controllers\Api\V1\Seller\SellerStoreOrderController;
use App\Http\Controllers\Api\V1\Seller\SellerStoreOrderRefundManageController;
use App\Http\Controllers\Api\V1\Seller\SellerSupportTicketManageController;
use App\Http\Controllers\Api\V1\StaffController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;


Route::group(['namespace' => 'Api\V1'], function () {
    Route::group(['prefix' => 'seller/'], function () {
        Route::post('login', [PartnerLoginController::class, 'login']);
        // verify email
        Route::post('send-verification-email', [SellerManageController::class, 'sendVerificationEmail']);
        Route::post('verify-email', [SellerManageController::class, 'verifyEmail']);
        Route::post('resend-verification-email', [SellerManageController::class, 'resendVerificationEmail']);
        Route::post('registration', [UserController::class, 'registerSeller']);
        // password reset
        Route::post('forget-password', [SellerManageController::class, 'forgetPassword']);
        Route::post('verify-token', [SellerManageController::class, 'verifyToken']);
        Route::patch('reset-password', [SellerManageController::class, 'resetPassword']);
    });
});

Route::group(['namespace' => 'Api\V1', 'middleware' => ['auth:sanctum', 'check.email.verification.option:seller']], function () {
    Route::group(['prefix' => 'seller/'], function () {
        Route::get('store-fetch-list', [SellerStoreManageController::class, 'sellerWiseStore']);
        Route::get('attributes/type-wise', [ProductAttributeController::class, 'typeWiseAttributes']);

        // profile manage
        Route::group(['prefix' => 'profile/'], function () {
            Route::get('/', [SellerManageController::class, 'sellerProfile']);
            Route::post('/update', [SellerManageController::class, 'updateProfile']);
            Route::post('/change-email', [SellerManageController::class, 'updateEmail']);
            Route::get('/deactivate', [SellerManageController::class, 'deactivateAccount']);
            Route::get('/delete', [SellerManageController::class, 'deleteAccount']);
        });

        Route::group(['prefix' => 'dashboard/'], function () {
            Route::get('/', [SellerStoreDashboardManageController::class, 'summaryData']);
            Route::get('sales-summary', [SellerStoreDashboardManageController::class, 'salesSummaryData']);
            Route::get('other-summary', [SellerStoreDashboardManageController::class, 'otherSummaryData']);
            Route::get('order-growth-summary', [SellerStoreDashboardManageController::class, 'orderGrowthData']);
        });

        // Seller Store manage
        Route::group(['prefix' => 'store/'], function () {
            Route::group(['prefix' => 'dashboard'], function () {
                Route::get('/{slug?}', [SellerStoreDashboardManageController::class, 'summaryData']);
                Route::get('sales-summary/{slug?}', [SellerStoreDashboardManageController::class, 'salesSummaryData']);
                Route::get('other-summary/{slug?}', [SellerStoreDashboardManageController::class, 'otherSummaryData']);
                Route::get('order-growth-summary/{slug?}', [SellerStoreDashboardManageController::class, 'orderGrowthData']);
            });

            // seller deliveryman manage
            Route::group(['prefix' => 'deliveryman/'], function () {
                Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_DELIVERYMAN_MANAGE_LIST->value]], function () {
                    Route::get('list', [SellerDeliverymanManageController::class, 'listDeliverymen']);
                    Route::post('add', [SellerDeliverymanManageController::class, 'createDeliveryman']);
                    Route::get('details/{id}', [SellerDeliverymanManageController::class, 'getDeliverymanById']);
                    Route::post('update', [SellerDeliverymanManageController::class, 'updateDeliveryman']);
                    Route::post('change-status', [SellerDeliverymanManageController::class, 'changeDeliverymanStatus']);
                    Route::delete('remove/{id}', [SellerDeliverymanManageController::class, 'deleteDeliveryman']);
                });
                //vehicle-types
                Route::prefix('vehicle-types/')->middleware(['permission:' . PermissionKey::ADMIN_DELIVERYMAN_VEHICLE_TYPE->value])->group(function () {
                    Route::get('list', [SellerDeliverymanManageController::class, 'listVehicles']);
                    Route::post('add', [SellerDeliverymanManageController::class, 'addVehicle']);
                    Route::get('details/{id}', [SellerDeliverymanManageController::class, 'getVehicleById']);
                    Route::post('update', [SellerDeliverymanManageController::class, 'updateVehicle']);
                    Route::post('change-status', [SellerDeliverymanManageController::class, 'changeVehicleStatus']);
                    Route::delete('remove/{id}', [SellerDeliverymanManageController::class, 'destroyVehicle']);
                });
            });
            // seller product manage
            Route::group(['prefix' => 'orders/'], function () {
                Route::group(['middleware' => ['permission:' . PermissionKey::SELLER_STORE_ORDER_MANAGE->value]], function () {
                    Route::get('invoice', [SellerStoreOrderController::class, 'orderInvoice']);
                    Route::post('change-order-status', [SellerStoreOrderController::class, 'changeOrderStatus']);
                    Route::post('cancel-order', [SellerStoreOrderController::class, 'cancelOrder']);
                    Route::get('refund-request', [SellerStoreOrderRefundManageController::class, 'orderRefundRequests'])->middleware('permission:' . PermissionKey::SELLER_ORDERS_RETURNED_OR_REFUND_REQUEST->value);
                    Route::post('refund-request/handle', [SellerStoreOrderRefundManageController::class, 'handleRefundRequest'])->middleware('permission:' . PermissionKey::SELLER_ORDERS_RETURNED_OR_REFUND_REQUEST->value);
                    Route::get('{order_id?}', [SellerStoreOrderController::class, 'allOrders']);

                    // Cargo (Geliver) - sipariş bazlı
                    Route::prefix('{orderId}/cargo')->group(function () {
                        Route::post('/', [SellerCargoController::class, 'createShipment']);
                        Route::get('/', [SellerCargoController::class, 'show']);
                        Route::delete('/', [SellerCargoController::class, 'cancel']);
                    });
                });
            });

            // my store manage
            Route::group(['middleware' => ['permission:' . PermissionKey::SELLER_STORE_MY_SHOP->value]], function () {
                Route::get('list', [SellerStoreManageController::class, 'listStores']);
                Route::get('details/{id}', [SellerStoreManageController::class, 'getStoreById']);
                Route::post('add', [SellerStoreManageController::class, 'createStore']); // create store
                Route::post('update', [SellerStoreManageController::class, 'updateStore']);
                Route::delete('remove/{id}', [SellerStoreManageController::class, 'deleteStore']);
                Route::get('get-commission-settings', [SellerStoreManageController::class, 'commissionSettings']);
            });

            // seller product manage
            Route::group(['prefix' => 'product/'], function () {
                // Product Inventory
                Route::group(['middleware' => ['permission:' . PermissionKey::SELLER_STORE_PRODUCT_INVENTORY->value]], function () {
                    Route::get('inventory', [SellerInventoryManageController::class, 'listInventories']);
                });
                // Product
                Route::group(['middleware' => ['permission:' . PermissionKey::SELLER_STORE_PRODUCT_LIST->value]], function () {
                    Route::get('list', [SellerProductManageController::class, 'listProducts']);
                    Route::get('details/{slug}', [SellerProductManageController::class, 'getProductBySlug']);
                    Route::post('add', [SellerProductManageController::class, 'createProduct'])->middleware('permission:' . PermissionKey::SELLER_STORE_PRODUCT_ADD->value);
                    Route::post('add-to-featured', [SellerProductManageController::class, 'addToFeatured']);
                    Route::put('update', [SellerProductManageController::class, 'updateProduct']);
                    Route::delete('remove/{id}', [SellerProductManageController::class, 'deleteProduct']);
                    Route::get('deleted/records', [SellerProductManageController::class, 'deletedProducts']);
                    Route::post('export', [SellerProductManageController::class, 'exportProducts'])->middleware('permission:' . PermissionKey::SELLER_STORE_PRODUCT_BULK_EXPORT->value);
                    Route::post('import', [SellerProductManageController::class, 'importProducts'])->middleware('permission:' . PermissionKey::SELLER_STORE_PRODUCT_BULK_IMPORT->value);
                    Route::get('stock-report', [SellerProductManageController::class, 'lowOrOutOfStockProducts'])->middleware('permission:' . PermissionKey::SELLER_STORE_PRODUCT_STOCK_REPORT->value);
                });

                // Product variant
                Route::group(['prefix' => 'variant/', 'middleware' => ['permission:' . PermissionKey::PRODUCT_ATTRIBUTE_ADD->value]], function () {
                    Route::get('list', [ProductVariantController::class, 'listVariants']);
                    Route::get('details', [ProductVariantController::class, 'getVariantById']);
                    Route::post('add', [ProductVariantController::class, 'addVariant']);
                    Route::post('update', [ProductVariantController::class, 'updateVariant']);
                    Route::delete('remove/{id}', [ProductVariantController::class, 'deleteVariant']);
                    Route::get('deleted/records', [ProductVariantController::class, 'deletedVariants']);
                });

                // Product Author
                Route::group(['prefix' => 'author/', 'middleware' => ['permission:' . PermissionKey::SELLER_STORE_PRODUCT_AUTHORS_MANAGE->value]], function () {
                    Route::get('list', [ProductAuthorController::class, 'sellerAuthors']);
                    Route::post('add', [ProductAuthorController::class, 'authorAddRequest']);
                    Route::post('update', [ProductAuthorController::class, 'updateAuthor']);
                    Route::get('details/{id}', [ProductAuthorController::class, 'getAuthorById']);
                    Route::post('remove', [ProductAuthorController::class, 'deleteAuthors']);
                });
            });
            // Seller Category Management
            Route::group(['prefix' => 'category/', 'middleware' => ['permission:' . PermissionKey::SELLER_STORE_CATEGORY_MANAGE->value]], function () {
                Route::get('list', [SellerProductCategoryController::class, 'index']);
                Route::get('details/{id}', [SellerProductCategoryController::class, 'show']);
                Route::post('add', [SellerProductCategoryController::class, 'store']);
                Route::post('update', [SellerProductCategoryController::class, 'update']);
                Route::post('change-status', [SellerProductCategoryController::class, 'statusChange']);
                Route::delete('remove/{id}', [SellerProductCategoryController::class, 'destroy']);
            });

            //Product Attribute Management
            Route::group(['prefix' => 'attribute/', 'middleware/' => ['permission:' . PermissionKey::SELLER_PRODUCT_ATTRIBUTE_ADD->value]], function () {
                Route::get('list', [ProductAttributeController::class, 'listAttributes']);
                Route::get('details/{id}', [ProductAttributeController::class, 'getAttributeById']);
                Route::get('type-wise', [ProductAttributeController::class, 'typeWiseAttributes']);
                Route::post('add', [ProductAttributeController::class, 'createAttribute']);
                Route::post('update', [ProductAttributeController::class, 'updateAttribute']);
                Route::post('change-status', [ProductAttributeController::class, 'changeAttributeStatus']);
                Route::delete('remove/{id}', [ProductAttributeController::class, 'deleteAttribute']);
            });


            // dynamic fields manage
            Route::group(['prefix' => 'dynamic-fields/', 'middleware' => ['permission:' . PermissionKey::SELLER_PRODUCT_ATTRIBUTE_ADD->value]], function () {
                Route::get('/', [DynamicFieldsManageController::class, 'getDynamicOptionForProduct']);
            });

            // Staff manage
            Route::group(['prefix' => 'staff/', 'middleware' => ['permission:' . PermissionKey::SELLER_STORE_STAFF_MANAGE->value]], function () {
                Route::get('list', [StaffController::class, 'listStaffs']);
                Route::post('add', [StaffController::class, 'createStaff']);
                Route::get('details/{id}', [StaffController::class, 'getStaffById']);
                Route::post('update', [StaffController::class, 'updateStaff']);
                Route::post('change-status', [StaffController::class, 'changeStaffStatus']);
                Route::post('remove', [StaffController::class, 'deleteStaffs']);
            });


            // Support ticket manage
            Route::group(['prefix' => 'support-ticket/', 'middleware' => 'permission:' . PermissionKey::SELLER_STORE_SUPPORT_TICKETS_MANAGE->value], function () {
                Route::get('list', [SellerSupportTicketManageController::class, 'listSupportTickets']);
                Route::get('details/{id?}', [SellerSupportTicketManageController::class, 'getSupportTicketById']);
                Route::post('add', [SellerSupportTicketManageController::class, 'createSupportTicket']);
                Route::post('update', [SellerSupportTicketManageController::class, 'updateSupportTicket']);
                Route::post('change-priority-status', [SellerSupportTicketManageController::class, 'changePriorityStatus']);
                Route::post('resolve', [SellerSupportTicketManageController::class, 'resolveSupportTicket']);
                Route::get('get-ticket-messages/{ticket_id}', [SellerSupportTicketManageController::class, 'ticketMessages']);
                Route::post('message/add', [SellerSupportTicketManageController::class, 'addMessage']);
            });

            // Review
            Route::group(['prefix' => 'feedback-control/'], function () {
                Route::group(['prefix' => 'review/', 'middleware' => 'permission:' . PermissionKey::SELLER_STORE_FEEDBACK_CONTROL_REVIEWS->value], function () {
                    Route::get('/', [SellerReviewController::class, 'index']);
                });
                Route::group(['prefix' => 'questions/', 'middleware' => 'permission:' . PermissionKey::SELLER_STORE_FEEDBACK_CONTROL_QUESTIONS->value], function () {
                    Route::get('/', [SellerProductQueryController::class, 'getQuestions']);
                    Route::post('reply', [SellerProductQueryController::class, 'replyQuestion']);
                });
            });

            // Notifications manage
            Route::prefix('notifications/')->middleware(['permission:' . PermissionKey::SELLER_NOTIFICATION_MANAGEMENT->value])->group(function () {
                Route::get('/', [NotificationManageController::class, 'listNotifications']);
                Route::post('/read', [NotificationManageController::class, 'markAsRead']);
            });

            // store settings
            Route::group(['prefix' => 'settings/'], function () {
                // business settings
                Route::group(['middleware' => 'permission:' . PermissionKey::SELLER_STORE_BUSINESS_PLAN->value], function () {
                    Route::get('business-plan', [SellerBusinessSettingsController::class, 'businessPlanInfo']);
                    Route::post('business-plan-change', [SellerBusinessSettingsController::class, 'businessPlanChange']);
                });
            });
            // Flash Sale manage
            Route::group(['prefix' => 'promotional/'], function () {
                Route::group(['prefix' => 'flash-deals'], function () {
                    Route::group(['middleware' => ['permission:' . PermissionKey::SELLER_STORE_PROMOTIONAL_FLASH_SALE_MY_DEALS->value]], function () {
                        Route::get('my-deals', [SellerFlashSaleProductManageController::class, 'flashSaleProducts']);
                    });
                    Route::group(['middleware' => ['permission:' . PermissionKey::SELLER_STORE_PROMOTIONAL_FLASH_SALE_ACTIVE_DEALS->value]], function () {
                        Route::post('join-deals', [SellerFlashSaleProductManageController::class, 'addProductToFlashSale']);
                        Route::post('update-join-deals', [SellerFlashSaleProductManageController::class, 'updateProductToFlashSale']);
                        Route::get('active-deals', [SellerFlashSaleProductManageController::class, 'validFlashSales']);
                    });
                });

                // Banner Management
                Route::group(['prefix' => 'banner/', 'middleware' => ['permission:' . PermissionKey::SELLER_STORE_PROMOTIONAL_BANNER_MANAGE->value]], function () {
                    Route::get('list', [SellerBannerManageController::class, 'listBanners']);
                    Route::post('add', [SellerBannerManageController::class, 'createBanner']);
                    Route::get('details/{id}', [SellerBannerManageController::class, 'getBannerById']);
                    Route::post('update', [SellerBannerManageController::class, 'updateBanner']);
                    Route::delete('remove/{id}', [SellerBannerManageController::class, 'deleteBanner']);
                });
            });
        });

        // Store Notice manage
        Route::group(['prefix' => 'store-notices/'], function () {
            Route::get('list', [SellerStoreNoticeController::class, 'index']);
            Route::get('details', [SellerStoreNoticeController::class, 'show']);
        });

        // open ai
        Route::post('/generate/content', [OpenAiController::class, 'generateContent']);

    });
});
