<?php

use App\Enums\PermissionKey;
use App\Http\Controllers\Api\V1\Admin\AdminAreaSetupManageController;
use App\Http\Controllers\Api\V1\Admin\AdminBannerManageController;
use App\Http\Controllers\Api\V1\Admin\AdminCashCollectionController;
use App\Http\Controllers\Api\V1\Admin\AdminCommissionManageController;
use App\Http\Controllers\Api\V1\Admin\AdminContactManageController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminDeliverymanManageController;
use App\Http\Controllers\Api\V1\Admin\AdminFlashSaleManageController;
use App\Http\Controllers\Api\V1\Admin\AdminInventoryManageController;
use App\Http\Controllers\Api\V1\Admin\AdminCargoController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderManageController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderRefundManageController;
use App\Http\Controllers\Api\V1\Admin\AdminProductManageController;
use App\Http\Controllers\Api\V1\Admin\AdminProductQueryManageController;
use App\Http\Controllers\Api\V1\Admin\AdminReportAnalyticsManageController;
use App\Http\Controllers\Api\V1\Admin\AdminReviewManageController;
use App\Http\Controllers\Api\V1\Admin\AdminSellerManageController;
use App\Http\Controllers\Api\V1\Admin\AdminSitemapController;
use App\Http\Controllers\Api\V1\Admin\AdminStoreManageController;
use App\Http\Controllers\Api\V1\Admin\AdminStoreNoticeController;
use App\Http\Controllers\Api\V1\Admin\AdminStoreTypeManageController;
use App\Http\Controllers\Api\V1\Admin\AdminSupportTicketManageController;
use App\Http\Controllers\Api\V1\Admin\AdminUnitManageController;
use App\Http\Controllers\Api\V1\Admin\AdminWithdrawManageController;
use App\Http\Controllers\Api\V1\Admin\AdminWithdrawSettingsController;
use App\Http\Controllers\Api\V1\Admin\CustomerManageController as AdminCustomerManageController;
use App\Http\Controllers\Api\V1\Admin\DepartmentManageController;
use App\Http\Controllers\Api\V1\Admin\EmailSettingsController;
use App\Http\Controllers\Api\V1\Admin\EmailTemplateManageController;
use App\Http\Controllers\Api\V1\Admin\PagesManageController;
use App\Http\Controllers\Api\V1\Admin\ThemeManageController;
use App\Http\Controllers\Api\V1\DynamicFieldsManageController;
use App\Http\Controllers\Api\V1\Com\AreaController;
use App\Http\Controllers\Api\V1\Com\SubscriberManageController;
use App\Http\Controllers\Api\V1\CouponManageController;
use App\Http\Controllers\Api\V1\DynamicFieldsOptionManageController;
use App\Http\Controllers\Api\V1\MediaController;
use App\Http\Controllers\Api\V1\MenuManageController;
use App\Http\Controllers\Api\V1\NotificationManageController;
use App\Http\Controllers\Api\V1\OpenAiController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\Product\ProductAttributeController;
use App\Http\Controllers\Api\V1\Product\ProductAuthorController;
use App\Http\Controllers\Api\V1\ProductBrandController;
use App\Http\Controllers\Api\V1\ProductCategoryController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\SliderManageController;
use App\Http\Controllers\Api\V1\StaffController;
use App\Http\Controllers\Api\V1\SystemManagementController;
use App\Http\Controllers\Api\V1\TagManageController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;
use Modules\Wallet\app\Http\Controllers\Api\AdminWithdrawGatewayManageController;
use Modules\Wallet\app\Http\Controllers\Api\AdminWithdrawRequestManageController;
use Modules\Wallet\app\Http\Controllers\Api\WalletManageAdminController;


Route::group(['namespace' => 'Api\V1', 'middleware' => ['auth:sanctum']], function () {
    /*--------------------- Com route start  ----------------------------*/
    Route::get('/logout', [UserController::class, 'logout']);
    // media manage
    Route::group(['prefix' => 'media-upload'], function () {
        Route::post('/store', [MediaController::class, 'mediaUpload']);
        Route::get('/load-more', [MediaController::class, 'load_more']);
        Route::post('/alt', [MediaController::class, 'alt_change']);
        Route::post('/delete', [MediaController::class, 'delete_media']);
    });
    // Marketing area manage
    Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_AREA_LIST->value]], function () {
        Route::get('com/area/list', [AreaController::class, 'listAreas']);
    });
    Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_AREA_ADD->value]], function () {
        Route::get('com/area/{id}', [AreaController::class, 'getAreaById']);
        Route::post('com/area/add', [AreaController::class, 'createArea']);
        Route::post('com/area/update', [AreaController::class, 'updateArea']);
        Route::put('com/area/status/{id}', [AreaController::class, 'updateAreaStatus']);
        Route::delete('com/area/remove/{id}', [AreaController::class, 'deleteArea']);
    });
    /*--------------------- Com route end  ----------------------------*/

    /* --------------------- Admin route start ------------------------- */
    Route::group(['prefix' => 'admin/'], function () {

        // Dashboard manage
        Route::group(['prefix' => 'dashboard/', 'middleware' => ['permission:' . PermissionKey::ADMIN_DASHBOARD->value]], function () {
            Route::get('/', [AdminDashboardController::class, 'summaryData']);
            Route::get('sales-summary', [AdminDashboardController::class, 'salesSummaryData']);
            Route::get('other-summary', [AdminDashboardController::class, 'otherSummaryData']);
            Route::get('order-growth-summary', [AdminDashboardController::class, 'orderGrowthData']);
        });

        // Orders & Reviews Manage
        Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_ORDERS_ALL->value]], function () {
            Route::group(['prefix' => 'orders/'], function () {
                Route::get('invoice', [AdminOrderManageController::class, 'invoice']);
                Route::patch('change-order-status', [AdminOrderManageController::class, 'changeOrderStatus']);
                Route::patch('change-payment-status', [AdminOrderManageController::class, 'changePaymentStatus']);
                Route::post('assign-deliveryman', [AdminOrderManageController::class, 'assignDeliveryMan']);
                Route::patch('cancel-order', [AdminOrderManageController::class, 'cancelOrder']);
                Route::get('refund-request', [AdminOrderRefundManageController::class, 'orderRefundRequest'])->middleware('permission:' . PermissionKey::ADMIN_ORDERS_RETURNED_OR_REFUND_REQUEST->value);
                Route::post('refund-request/handle', [AdminOrderRefundManageController::class, 'handleRefundRequest'])->middleware('permission:' . PermissionKey::ADMIN_ORDERS_RETURNED_OR_REFUND_REQUEST->value);
                Route::group(['prefix' => 'refund-reason/', 'middleware' => ['permission:' . PermissionKey::ADMIN_ORDERS_RETURNED_OR_REFUND_REASON->value]], function () {
                    Route::get('list', [AdminOrderRefundManageController::class, 'allOrderRefundReason']);
                    Route::post('add', [AdminOrderRefundManageController::class, 'createOrderRefundReason']);
                    Route::get('details/{id}', [AdminOrderRefundManageController::class, 'showOrderRefundReason']);
                    Route::post('update', [AdminOrderRefundManageController::class, 'updateOrderRefundReason']);
                    Route::delete('remove/{id}', [AdminOrderRefundManageController::class, 'deleteOrderRefundReason']);
                });
                // Dynamic route should be last
                Route::get('{order_id?}', [AdminOrderManageController::class, 'allOrders']);
            });

            // Cargo (Geliver) - sipariş bazlı
            Route::prefix('orders/{orderId}/cargo')->group(function () {
                Route::get('offers', [AdminCargoController::class, 'offers']);
                Route::post('/', [AdminCargoController::class, 'createShipment']);
                Route::get('/', [AdminCargoController::class, 'show']);
                Route::delete('/', [AdminCargoController::class, 'cancel']);
            });
        });

        // Cargo genel (gönderici adresi, şehirler, liste)
        Route::prefix('cargo')->group(function () {
            Route::get('/', [AdminCargoController::class, 'index']);
            Route::post('sender-address', [AdminCargoController::class, 'createSenderAddress']);
            Route::get('cities', [AdminCargoController::class, 'cities']);
        });

        // Product manage
        Route::group(['prefix' => 'product/'], function () {
            // Product Inventory
            Route::group(['prefix' => 'inventory', 'middleware' => ['permission:' . PermissionKey::ADMIN_PRODUCT_INVENTORY->value]], function () {
                Route::get('/', [AdminInventoryManageController::class, 'allInventories']);
                Route::post('update', [AdminInventoryManageController::class, 'updateInventory']);
                Route::post('remove', [AdminInventoryManageController::class, 'deleteInventory']);
            });
            Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_PRODUCTS_MANAGE->value]], function () {
                Route::get('list', [AdminProductManageController::class, 'listProducts']);
                Route::post('add', [AdminProductManageController::class, 'createProduct']);
                Route::post('add-to-featured', [AdminProductManageController::class, 'addToFeatured']);
                Route::get('details/{slug}', [AdminProductManageController::class, 'getProductBySlug']);
                Route::put('update', [AdminProductManageController::class, 'updateProduct']);
                Route::delete('remove/{id?}', [AdminProductManageController::class, 'deleteProduct']);
                Route::get('trash-list', [AdminProductManageController::class, 'getProductTrashList'])->middleware('permission:' . PermissionKey::ADMIN_PRODUCTS_TRASH_MANAGEMENT->value);
                Route::post('trash-restore', [AdminProductManageController::class, 'restoreProductTrashed'])->middleware('permission:' . PermissionKey::ADMIN_PRODUCTS_TRASH_MANAGEMENT->value);
                Route::post('trash-delete', [AdminProductManageController::class, 'deleteProductTrashed'])->middleware('permission:' . PermissionKey::ADMIN_PRODUCTS_TRASH_MANAGEMENT->value);
                Route::post('approve', [AdminProductManageController::class, 'approveProductRequests']);
                Route::get('request', [AdminProductManageController::class, 'productRequests'])->middleware('permission:' . PermissionKey::ADMIN_PRODUCT_PRODUCT_APPROVAL_REQ->value);
                Route::post('export', [AdminProductManageController::class, 'exportProducts'])->middleware('permission:' . PermissionKey::ADMIN_PRODUCT_PRODUCT_BULK_EXPORT->value);
                Route::post('import', [AdminProductManageController::class, 'importProducts'])->middleware('permission:' . PermissionKey::ADMIN_PRODUCT_PRODUCT_BULK_IMPORT->value);
                Route::patch('change-status', [AdminProductManageController::class, 'changeProductStatus']);
                Route::get('stock-report', [AdminProductManageController::class, 'lowOrOutOfStockProducts'])->middleware('permission:' . PermissionKey::ADMIN_PRODUCT_STOCK_REPORT->value);
                Route::get('{product_slug}', [AdminProductManageController::class, 'productDetails']);
            });
        });
        // seller Store Management
        Route::group(['prefix' => 'store/'], function () {
            // Store List Routes
            Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_STORE_LIST->value]], function () {
                Route::get('list', [AdminStoreManageController::class, 'listStores']);
                Route::get('seller-stores', [AdminStoreManageController::class, 'listSellerStores']);
                Route::get('details/{id}', [AdminStoreManageController::class, 'getStoreById']);
            });
            // Store Add Routes
            Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_STORE_ADD->value]], function () {
                Route::post('add', [AdminStoreManageController::class, 'createStore']);
                Route::post('update', [AdminStoreManageController::class, 'updateStore']);
                Route::patch('change-status', [AdminStoreManageController::class, 'changeStoreStatus']);
                Route::delete('remove/{id}', [AdminStoreManageController::class, 'deleteStore']);
                Route::get('deleted-records', [AdminStoreManageController::class, 'deletedStoreRecords']);
                Route::get('trash-list', [AdminStoreManageController::class, 'getStoreTrashList'])->middleware('permission:' . PermissionKey::ADMIN_STORE_TRASH_MANAGEMENT->value);
                Route::post('trash-restore', [AdminStoreManageController::class, 'restoreStoreTrashed'])->middleware('permission:' . PermissionKey::ADMIN_STORE_TRASH_MANAGEMENT->value);
                Route::post('trash-delete', [AdminStoreManageController::class, 'deleteStoreTrashed'])->middleware('permission:' . PermissionKey::ADMIN_STORE_TRASH_MANAGEMENT->value);
            });
            // Store Approval Request Routes
            Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_STORE_APPROVAL->value]], function () {
                Route::get('request', [AdminStoreManageController::class, 'listStoreRequests']);
                Route::post('approve', [AdminStoreManageController::class, 'approveStoreRequest']);
            });
        });
        // Flash Sale manage
        Route::group(['prefix' => 'promotional/'], function () {
            // Flash Deals
            Route::group(['prefix' => 'flash-deals'], function () {
                Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_PROMOTIONAL_FLASH_SALE_MANAGE->value]], function () {
                    Route::get('list', [AdminFlashSaleManageController::class, 'listFlashSales']);
                    Route::get('list-dropdown', [AdminFlashSaleManageController::class, 'getFlashSaleDropdown']);
                    Route::post('add', [AdminFlashSaleManageController::class, 'createFlashSale']);
                    Route::post('add-products', [AdminFlashSaleManageController::class, 'adminAddProductToFlashSale']);
                    Route::get('all-products', [AdminFlashSaleManageController::class, 'listAllFlashSaleProducts']);
                    Route::get('store-wise-products', [AdminFlashSaleManageController::class, 'getProductsNotInFlashSale']);
                    Route::post('update-products', [AdminFlashSaleManageController::class, 'adminUpdateProductToFlashSale']);
                    Route::get('details/{id}', [AdminFlashSaleManageController::class, 'getFlashSaleById']);
                    Route::put('update', [AdminFlashSaleManageController::class, 'updateFlashSale']);
                    Route::patch('change-status', [AdminFlashSaleManageController::class, 'changeFlashSaleStatus']);
                    Route::delete('remove/{id}', [AdminFlashSaleManageController::class, 'deleteFlashSale']);
                    Route::post('deactivate', [AdminFlashSaleManageController::class, 'deactivateFlashSale']);
                });
                // Join Deals
                Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_PROMOTIONAL_FLASH_SALE_JOIN_DEALS->value]], function () {
                    Route::get('join-request', [AdminFlashSaleManageController::class, 'listFlashSaleProductRequests']);
                    Route::patch('join-request/approve', [AdminFlashSaleManageController::class, 'approveFlashSaleProduct']);
                    Route::patch('join-request/reject', [AdminFlashSaleManageController::class, 'rejectFlashSaleProduct']);
                });
            });
            // Banner Management
            Route::group(['prefix' => 'banner/', 'middleware' => ['permission:' . PermissionKey::ADMIN_PROMOTIONAL_BANNER_MANAGE->value]], function () {
                Route::get('list', [AdminBannerManageController::class, 'listBanners']);
                Route::post('add', [AdminBannerManageController::class, 'createBanner']);
                Route::get('details/{id}', [AdminBannerManageController::class, 'getBannerById']);
                Route::put('update', [AdminBannerManageController::class, 'updateBanner']);
                Route::patch('change-status', [AdminBannerManageController::class, 'changeBannerStatus']);
                Route::delete('remove/{id}', [AdminBannerManageController::class, 'deleteBanner']);
            });
        });
        // Customer Manage
        Route::group(['prefix' => 'customer/'], function () {
            // CUSTOMER
            Route::group(['permission:' . PermissionKey::ADMIN_CUSTOMER_MANAGEMENT_LIST->value], function () {
                Route::get('list', [AdminCustomerManageController::class, 'listCustomers']);
                Route::get('details/{id}', [AdminCustomerManageController::class, 'getCustomerById']);
                Route::post('register', [AdminCustomerManageController::class, 'registerCustomer']);
                Route::patch('change-status', [AdminCustomerManageController::class, 'changeCustomerStatus']);
                Route::patch('change-password', [AdminCustomerManageController::class, 'changeCustomerPassword']);
                Route::patch('email-verify', [AdminCustomerManageController::class, 'verifyCustomerEmail']);
                Route::put('update-profile', [AdminCustomerManageController::class, 'updateCustomerProfile']);
                Route::patch('suspend', [AdminCustomerManageController::class, 'suspendCustomer']);
                Route::post('remove', [AdminCustomerManageController::class, 'deleteCustomer']);
                Route::get('trash-list', [AdminCustomerManageController::class, 'getCustomerTrashList'])->middleware('permission:' . PermissionKey::ADMIN_CUSTOMER_TRASH_MANAGEMENT->value);
                Route::post('trash-restore', [AdminCustomerManageController::class, 'restoreCustomerTrashed'])->middleware('permission:' . PermissionKey::ADMIN_CUSTOMER_TRASH_MANAGEMENT->value);
                Route::post('trash-delete', [AdminCustomerManageController::class, 'deleteCustomerTrashed'])->middleware('permission:' . PermissionKey::ADMIN_CUSTOMER_TRASH_MANAGEMENT->value);
            });
            // Newsletter
            Route::group(['permission:' . PermissionKey::ADMIN_CUSTOMER_MANAGEMENT_LIST->value], function () {
                Route::group(['prefix' => 'newsletter/'], function () {
                    Route::get('list', [SubscriberManageController::class, 'listSubscribers']);
                    Route::patch('bulk-status-change', [SubscriberManageController::class, 'bulkSubscriberStatusChange']);
                    Route::post('bulk-email-send', [SubscriberManageController::class, 'sendBulkEmail']);
                    Route::delete('remove/{id}', [SubscriberManageController::class, 'deleteSubscriber']);
                });
            });
        });
        // contact message
        Route::group(['prefix' => 'contact-messages/', 'middleware' => ['permission:' . PermissionKey::ADMIN_CUSTOMER_CONTACT_MESSAGES->value]], function () {
            Route::get('list', [AdminContactManageController::class, 'listContacts']);
            Route::post('reply', [AdminContactManageController::class, 'replyContacts']);
            Route::patch('change-status', [AdminContactManageController::class, 'changeContactStatus']);
            Route::post('remove', [AdminContactManageController::class, 'deleteContacts']);
        });
        // Seller Manage
        Route::group(['prefix' => 'seller/', 'middleware' => ['permission:' . PermissionKey::ADMIN_SELLER_MANAGEMENT->value]], function () {
            Route::post('registration', [UserController::class, 'registerSeller'])->middleware('permission:' . PermissionKey::ADMIN_SELLER_REGISTRATION->value);
            Route::post('update', [AdminSellerManageController::class, 'updateSellerProfile']);
            Route::get('list', [AdminSellerManageController::class, 'listSellers']);
            Route::get('history/{id}', [AdminSellerManageController::class, 'sellerDashboard']);
            Route::get('active', [AdminSellerManageController::class, 'listActiveSellers']);
            Route::get('details/{id}', [AdminSellerManageController::class, 'getSellerById']);
            Route::get('list/pending', [AdminSellerManageController::class, 'listPendingSellers']);
            Route::patch('approve', [AdminSellerManageController::class, 'approveSeller']);
            Route::patch('suspend', [AdminSellerManageController::class, 'rejectSeller']);
            Route::patch('change-status', [AdminSellerManageController::class, 'changeSellerStatus']);
            Route::patch('change-password', [AdminSellerManageController::class, 'changeSellerPassword']);
            Route::post('remove', [AdminSellerManageController::class, 'deleteSellers']);
            Route::get('trash-list', [AdminSellerManageController::class, 'getSellerTrashList'])->middleware('permission:' . PermissionKey::ADMIN_SELLER_TRASH_MANAGEMENT->value);;
            Route::post('trash-restore', [AdminSellerManageController::class, 'restoreSellerTrashed'])->middleware('permission:' . PermissionKey::ADMIN_SELLER_TRASH_MANAGEMENT->value);;
            Route::post('trash-delete', [AdminSellerManageController::class, 'deleteSellerTrashed'])->middleware('permission:' . PermissionKey::ADMIN_SELLER_TRASH_MANAGEMENT->value);;
        });
        // Department manage
        Route::group(['prefix' => 'department/'], function () {
            Route::get('list', [DepartmentManageController::class, 'listDepartments']);
            Route::post('add', [DepartmentManageController::class, 'createDepartment']);
            Route::get('details/{id}', [DepartmentManageController::class, 'getDepartmentById']);
            Route::put('update', [DepartmentManageController::class, 'updateDepartment']);
            Route::delete('remove/{id}', [DepartmentManageController::class, 'deleteDepartment']);
        });


        // Slider manage
        Route::group(['prefix' => 'slider/', 'middleware' => ['permission:' . PermissionKey::ADMIN_SLIDER_MANAGE_LIST->value]], function () {
            Route::get('list', [SliderManageController::class, 'listSliders']);
            Route::post('add', [SliderManageController::class, 'createSlider']);
            Route::get('details/{id}', [SliderManageController::class, 'getSliderById']);
            Route::put('update', [SliderManageController::class, 'updateSlider']);
            Route::patch('change-status', [SliderManageController::class, 'changeSliderStatus']);
            Route::delete('remove/{id}', [SliderManageController::class, 'deleteSlider']);
        });

        // media manage
        Route::group(['prefix' => 'media-manage/', 'middleware' => ['permission:' . PermissionKey::ADMIN_MEDIA_MANAGE->value]], function () {
            Route::get('/', [MediaController::class, 'allMediaManage']);
            Route::post('delete', [MediaController::class, 'mediaFileDelete']);
        });

        // Product Brand Routing
        Route::group(['prefix' => 'brand/'], function () {
            Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_PRODUCT_BRAND_LIST->value]], function () {
                Route::get('list', [ProductBrandController::class, 'listBrands']);
                Route::post('add', [ProductBrandController::class, 'createBrand']);
                Route::put('update', [ProductBrandController::class, 'updateBrand']);
                Route::get('details/{id}', [ProductBrandController::class, 'getBrandById']);
                Route::patch('change-status', [ProductBrandController::class, 'changeBrandStatus']);
                Route::post('remove', [ProductBrandController::class, 'deleteBrands']);
            });
        });
        // Product Author manage
        Route::group(['prefix' => 'product/author/', 'middleware' => ['permission:' . PermissionKey::ADMIN_PRODUCT_AUTHORS_MANAGE->value]], function () {
            Route::get('list', [ProductAuthorController::class, 'listAuthors']);
            Route::post('add', [ProductAuthorController::class, 'createAuthor']);
            Route::get('details/{id}', [ProductAuthorController::class, 'getAuthorById']);
            Route::post('update', [ProductAuthorController::class, 'updateAuthor']);
            Route::post('remove', [ProductAuthorController::class, 'deleteAuthors']);
            Route::patch('change-status', [ProductAuthorController::class, 'changeAuthorStatus']);
            Route::post('approve', [ProductAuthorController::class, 'approveAuthors']);
            Route::get('author-request', [ProductAuthorController::class, 'listAuthorRequest']);
        });
        // Product Category Routing
        Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_PRODUCT_CATEGORY_LIST->value]], function () {
            Route::get('product-categories/list', [ProductCategoryController::class, 'listProductCategories']);
            Route::post('product-categories/add', [ProductCategoryController::class, 'createProductCategory']);
            Route::get('product-categories/details/{id}', [ProductCategoryController::class, 'getProductCategoryById']);
            Route::post('product-categories/update', [ProductCategoryController::class, 'createProductCategory']);
            Route::patch('product-categories/change-status', [ProductCategoryController::class, 'changeProductCategoryStatus']);
            Route::post('product-categories/remove', [ProductCategoryController::class, 'deleteProductCategories']);
        });

        // User Management
        Route::group(['middleware' => [getPermissionMiddleware('ban-user')]], function () {
            Route::patch('users/block-user', [UserController::class, 'banUser']);
        });
        Route::group(['middleware' => [getPermissionMiddleware('active-user')]], function () {
            Route::patch('users/unblock-user', [UserController::class, 'activeUser']);
        });

        //Product Attribute Management
        Route::group(['prefix' => 'attribute/', 'middleware/' => ['permission:' . PermissionKey::PRODUCT_ATTRIBUTE_ADD->value]], function () {
            Route::get('list', [ProductAttributeController::class, 'listAttributes']);
            Route::get('details/{id}', [ProductAttributeController::class, 'getAttributeById']);
            Route::get('type-wise', [ProductAttributeController::class, 'typeWiseAttributes']);
            Route::post('add', [ProductAttributeController::class, 'createAttribute']);
            Route::post('update', [ProductAttributeController::class, 'updateAttribute']);
            Route::patch('change-status', [ProductAttributeController::class, 'changeAttributeStatus']);
            Route::delete('remove/{id}', [ProductAttributeController::class, 'deleteAttribute']);
        });
        // Coupon manage
        Route::group(['prefix' => 'coupon/', 'middleware' => ['permission:' . PermissionKey::ADMIN_COUPON_MANAGE->value]], function () {
            Route::get('list', [CouponManageController::class, 'listCoupons']);
            Route::get('coupon-wise-line', [CouponManageController::class, 'couponWiseLine']);
            Route::get('details/{id}', [CouponManageController::class, 'getCouponById']);
            Route::post('add', [CouponManageController::class, 'createCoupon']);
            Route::post('update', [CouponManageController::class, 'updateCoupon']);
            Route::patch('status-change', [CouponManageController::class, 'changeCouponStatus']);
            Route::delete('remove/{id}', [CouponManageController::class, 'deleteCoupon']);
        });
        Route::group(['prefix' => 'coupon-line/', 'middleware' => ['permission:' . PermissionKey::ADMIN_COUPON_LINE_MANAGE->value]], function () {
            Route::get('list', [CouponManageController::class, 'listCouponLines']);
            Route::get('details/{id}', [CouponManageController::class, 'getCouponLineById']);
            Route::post('add', [CouponManageController::class, 'createCouponLine']);
            Route::post('update', [CouponManageController::class, 'updateCouponLine']);
            Route::delete('remove/{id}', [CouponManageController::class, 'deleteCouponLine']);
        });
        // Tag manage
        Route::group(['prefix' => 'tag/', 'middleware' => ['permission:' . PermissionKey::ADMIN_PRODUCT_TAG_LIST->value]], function () {
            Route::get('list', [TagManageController::class, 'listTags']);
            Route::post('add', [TagManageController::class, 'createTag']);
            Route::get('details/{id}', [TagManageController::class, 'getTagById']);
            Route::post('update', [TagManageController::class, 'updateTag']);
            Route::post('remove', [TagManageController::class, 'deleteTags']);
        });
        // Unit manage
        Route::group(['prefix' => 'unit/', 'middleware' => ['permission:' . PermissionKey::ADMIN_PRODUCT_UNIT_LIST->value]], function () {
            Route::get('list', [AdminUnitManageController::class, 'listUnits']);
            Route::post('add', [AdminUnitManageController::class, 'createUnit']);
            Route::get('details/{id}', [AdminUnitManageController::class, 'getUnitById']);
            Route::post('update', [AdminUnitManageController::class, 'updateUnit']);
            Route::delete('remove/{id}', [AdminUnitManageController::class, 'deleteUnit']);
        });

        // dynamic fields manage
        Route::group(['prefix' => 'dynamic-fields/', 'middleware' => ['permission:' . PermissionKey::ADMIN_DYNAMIC_FIELDS->value]], function () {
            Route::get('/', [DynamicFieldsManageController::class, 'getDynamicOptionForProduct']);
            Route::get('list', [DynamicFieldsManageController::class, 'list']);
            Route::post('add', [DynamicFieldsManageController::class, 'createDynamicField']);
            Route::get('details/{id}', [DynamicFieldsManageController::class, 'getDynamicFieldById']);
            Route::post('update', [DynamicFieldsManageController::class, 'updateDynamicField']);
            Route::delete('remove/{id}', [DynamicFieldsManageController::class, 'deleteDynamicField']);
            Route::patch('change-status', [DynamicFieldsManageController::class, 'changeDynamicFieldStatus']);
        });

        // dynamic fields values manage
        Route::group(['prefix' => 'dynamic-fields/options/', 'middleware' => ['permission:' . PermissionKey::ADMIN_DYNAMIC_FIELDS->value]], function () {
            Route::get('list', [DynamicFieldsOptionManageController::class, 'list']);
            Route::post('add', [DynamicFieldsOptionManageController::class, 'createDynamicFieldOption']);
            Route::get('details/{id}', [DynamicFieldsOptionManageController::class, 'getDynamicFieldByIdOption']);
            Route::post('update', [DynamicFieldsOptionManageController::class, 'updateDynamicFieldOption']);
            Route::delete('remove/{id}', [DynamicFieldsOptionManageController::class, 'deleteDynamicFieldOption']);
        });

        // Staff manage
        Route::group(['prefix' => 'staff/'], function () {
            Route::get('list', [StaffController::class, 'listStaffs'])->middleware(['permission:' . PermissionKey::ADMIN_STAFF_LIST->value]);
            Route::post('add', [StaffController::class, 'createStaff'])->middleware(['permission:' . PermissionKey::ADMIN_STAFF_MANAGE->value]);
            Route::get('details/{id}', [StaffController::class, 'getStaffById'])->middleware(['permission:' . PermissionKey::ADMIN_STAFF_MANAGE->value]);
            Route::post('update', [StaffController::class, 'updateStaff'])->middleware(['permission:' . PermissionKey::ADMIN_STAFF_MANAGE->value]);
            Route::patch('change-status', [StaffController::class, 'changeStaffStatus'])->middleware(['permission:' . PermissionKey::ADMIN_STAFF_MANAGE->value]);
            Route::patch('change-password', [StaffController::class, 'changeStaffPassword'])->middleware(['permission:' . PermissionKey::ADMIN_STAFF_MANAGE->value]);
            Route::post('remove', [StaffController::class, 'deleteStaffs'])->middleware(['permission:' . PermissionKey::ADMIN_STAFF_MANAGE->value]);
        });

        // Pages manage
        Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_PAGES_LIST->value]], function () {
            Route::get('pages/list', [PagesManageController::class, 'listPages']);
            Route::post('pages/store', [PagesManageController::class, 'createPage']);
            Route::get('pages/details/{id}', [PagesManageController::class, 'getPageById']);
            Route::post('pages/update', [PagesManageController::class, 'updatePage']);
            Route::delete('pages/remove/{id}', [PagesManageController::class, 'deletePage']);
        });

        // Notifications manage
        Route::prefix('notifications/')->middleware(['permission:' . PermissionKey::ADMIN_NOTIFICATION_MANAGEMENT->value])->group(function () {
            Route::get('/', [NotificationManageController::class, 'listNotifications']);
            Route::patch('/read', [NotificationManageController::class, 'markAsRead']);
            Route::post('remove', [NotificationManageController::class, 'destroy']);
        });

        // Store Notice manage
        Route::prefix('store-notices/')->middleware(['permission:' . PermissionKey::ADMIN_NOTICE_MANAGEMENT->value])->group(function () {
            Route::get('list', [AdminStoreNoticeController::class, 'index']);
            Route::post('add', [AdminStoreNoticeController::class, 'store']);
            Route::get('details/{id}', [AdminStoreNoticeController::class, 'show']);
            Route::post('update', [AdminStoreNoticeController::class, 'update']);
            Route::post('change-status', [AdminStoreNoticeController::class, 'changeStatus']);
            Route::post('remove', [AdminStoreNoticeController::class, 'destroy']);
        });

        Route::group(['prefix' => 'feedback-control/'], function () {
            Route::group(['prefix' => 'review/'], function () {
                Route::get('/', [AdminReviewManageController::class, 'index']);
                Route::post('approve', [AdminReviewManageController::class, 'approveReview']);
                Route::post('reject', [AdminReviewManageController::class, 'rejectReview']);
                Route::post('remove', [AdminReviewManageController::class, 'destroy']);
            });
            Route::group(['prefix' => 'questions/'], function () {
                Route::get('/', [AdminProductQueryManageController::class, 'getAllQueries']);
                Route::post('change-status', [AdminProductQueryManageController::class, 'changeStatus']);
                Route::post('remove', [AdminProductQueryManageController::class, 'destroy']);
            });
        });
        // Admin Deliveryman management
        Route::prefix('deliveryman/')->group(function () {
            // delivery man manage
            Route::group(['middleware' => ['permission:' . PermissionKey::ADMIN_DELIVERYMAN_MANAGE_LIST->value]], function () {
                Route::get('list', [AdminDeliverymanManageController::class, 'index']);
                Route::get('list-dropdown', [AdminDeliverymanManageController::class, 'deliverymanDropdownList']);
                Route::get('request', [AdminDeliverymanManageController::class, 'deliverymanRequest'])->middleware(['permission:' . PermissionKey::ADMIN_DELIVERYMAN_REQUEST->value]);
                Route::post('add', [AdminDeliverymanManageController::class, 'store']);
                Route::post('change-password', [AdminDeliverymanManageController::class, 'changePassword']);
                Route::get('details/{id}', [AdminDeliverymanManageController::class, 'show']);
                Route::post('update', [AdminDeliverymanManageController::class, 'update']);
                Route::post('change-status', [AdminDeliverymanManageController::class, 'changeStatus']);
                Route::post('verification', [AdminDeliverymanManageController::class, 'deliverymanVerification']);
                Route::post('handle-request', [AdminDeliverymanManageController::class, 'handleRequest']);
                Route::delete('remove/{id}', [AdminDeliverymanManageController::class, 'destroy']);
                Route::get('trash-list', [AdminDeliverymanManageController::class, 'getTrashList'])->middleware('permission:'.PermissionKey::ADMIN_DELIVERYMAN_TRASH_MANAGEMENT->value);
                Route::post('trash-restore', [AdminDeliverymanManageController::class, 'restoreTrashed'])->middleware('permission:'.PermissionKey::ADMIN_DELIVERYMAN_TRASH_MANAGEMENT->value);
                Route::post('trash-delete', [AdminDeliverymanManageController::class, 'deleteTrashed'])->middleware('permission:'.PermissionKey::ADMIN_DELIVERYMAN_TRASH_MANAGEMENT->value);
                Route::get('history/{id}', [AdminDeliverymanManageController::class, 'deliverymanDashboard']);
            });
            //vehicle-types
            Route::prefix('vehicle-types/')->middleware(['permission:' . PermissionKey::ADMIN_DELIVERYMAN_VEHICLE_TYPE->value])->group(function () {
                Route::get('list', [AdminDeliverymanManageController::class, 'indexVehicle']);
                Route::get('list-dropdown', [AdminDeliverymanManageController::class, 'vehicleTypeDropdown']);
                Route::get('request', [AdminDeliverymanManageController::class, 'vehicleRequest']);
                Route::post('add', [AdminDeliverymanManageController::class, 'storeVehicle']);
                Route::get('details/{id}', [AdminDeliverymanManageController::class, 'showVehicle']);
                Route::post('update', [AdminDeliverymanManageController::class, 'updateVehicle']);
                Route::post('change-status', [AdminDeliverymanManageController::class, 'changeVehicleStatus']);
                Route::post('approve', [AdminDeliverymanManageController::class, 'approveVehicleRequest']);
                Route::delete('remove/{id}', [AdminDeliverymanManageController::class, 'destroyVehicle']);
            });
        });

        // Support ticket management
        Route::group(['prefix' => 'support-ticket/', 'middleware' => 'permission:' . PermissionKey::ADMIN_SUPPORT_TICKETS_MANAGE->value], function () {
            Route::get('list', [AdminSupportTicketManageController::class, 'index']);
            Route::get('details/{id?}', [AdminSupportTicketManageController::class, 'show']);
            Route::post('change-priority-status', [AdminSupportTicketManageController::class, 'changePriorityStatus']);
            Route::post('resolve', [AdminSupportTicketManageController::class, 'resolve']);
            Route::post('message/reply', [AdminSupportTicketManageController::class, 'replyMessage']);
            Route::get('get-ticket-messages/{ticket_id}', [AdminSupportTicketManageController::class, 'getTicketMessages']);
            Route::post('remove', [AdminSupportTicketManageController::class, 'destroy']);
        });

        // FINANCIAL WITHDRAWALS management
        Route::group(['prefix' => 'financial/'], function () {
            // waller manage
            Route::group(['prefix' => 'wallet/', PermissionKey::ADMIN_WALLET_MANAGE->value], function () {
                Route::match(['get', 'post'], 'settings', [WalletManageAdminController::class, 'depositSettings'])->middleware(['permission:' . PermissionKey::ADMIN_WALLET_SETTINGS->value]);
                Route::get('list', [WalletManageAdminController::class, 'index']);
                Route::post('status', [WalletManageAdminController::class, 'status']);
                Route::post('deposit', [WalletManageAdminController::class, 'depositCreateByAdmin']);
                Route::get('transactions', [WalletManageAdminController::class, 'transactionRecords'])->middleware(['permission:' . PermissionKey::ADMIN_WALLET_TRANSACTION->value]);
                Route::post('transactions-status', [WalletManageAdminController::class, 'transactionStatus']);
                Route::post('transactions-payment-status-change', [WalletManageAdminController::class, 'transactionPaymentStatusChange']);
            });

            // withdrawals manage
            Route::group(['prefix' => 'withdraw/'], function () {

                // settings
                Route::group(['middleware' => 'permission:' . PermissionKey::ADMIN_FINANCIAL_WITHDRAW_MANAGE_SETTINGS->value], function () {
                    Route::match(['get', 'post'], 'settings', [AdminWithdrawSettingsController::class, 'withdrawSettings']);
                });

                // gateway manage
                Route::group(['middleware' => 'permission:' . PermissionKey::ADMIN_WITHDRAW_METHOD_MANAGEMENT->value], function () {
                    Route::get('gateway-list', [AdminWithdrawGatewayManageController::class, 'withdrawGatewayList']);
                    Route::post('gateway-add', [AdminWithdrawGatewayManageController::class, 'withdrawGatewayAdd']);
                    Route::get('gateway-details/{id?}', [AdminWithdrawGatewayManageController::class, 'withdrawGatewayDetails']);
                    Route::post('gateway-update', [AdminWithdrawGatewayManageController::class, 'withdrawGatewayUpdate']);
                    Route::delete('gateway-delete/{id}', [AdminWithdrawGatewayManageController::class, 'withdrawGatewayDelete']);
                    Route::post('gateway-change-status', [AdminWithdrawGatewayManageController::class, 'withdrawGatewayChangeStatus']);
                });

                // all manage
                Route::group(['middleware' => 'permission:' . PermissionKey::ADMIN_FINANCIAL_WITHDRAW_MANAGE_HISTORY->value], function () {
                    Route::get('/', [AdminWithdrawManageController::class, 'withdrawAllList']);
                    Route::get('details/{id}', [AdminWithdrawManageController::class, 'withdrawDetails']);
                });
                // request manage
                Route::group(['middleware' => 'permission:' . PermissionKey::ADMIN_FINANCIAL_WITHDRAW_MANAGE_REQUEST->value], function () {
                    Route::get('request-list', [AdminWithdrawRequestManageController::class, 'withdrawRequestList']);
                    Route::post('request-approve', [AdminWithdrawRequestManageController::class, 'withdrawRequestApprove']);
                    Route::post('request-reject', [AdminWithdrawRequestManageController::class, 'withdrawRequestReject']);
                });
            });
            // Collect Cash (for cash collection)
            Route::match(['get', 'post'], 'cash-collection', [AdminCashCollectionController::class, 'collectCash'])->middleware('permission:' . PermissionKey::ADMIN_FINANCIAL_COLLECT_CASH->value);
        });


        // business-operations
        Route::group(['prefix' => 'business-operations/'], function () {
            // store type
            Route::group(['prefix' => 'store-type/', 'middleware' => 'permission:' . PermissionKey::ADMIN_STORE_TYPE_MANAGE->value], function () {
                Route::get('list', [AdminStoreTypeManageController::class, 'allStoreTypes']);
                Route::get('details/{id}', [AdminStoreTypeManageController::class, 'storeTypeDetails']);
                Route::post('add', [AdminStoreTypeManageController::class, 'createStoreType']);
                Route::post('update', [AdminStoreTypeManageController::class, 'updateStoreType']);
                Route::post('change-status', [AdminStoreTypeManageController::class, 'changeStatus']);
            });
            // area setup
            Route::prefix('area/')->middleware(['permission:' . PermissionKey::ADMIN_GEO_AREA_MANAGE->value])->group(function () {
                Route::get('list', [AdminAreaSetupManageController::class, 'index']);
                Route::post('add', [AdminAreaSetupManageController::class, 'store']);
                Route::post('update', [AdminAreaSetupManageController::class, 'update']);
                Route::get('details/{id}', [AdminAreaSetupManageController::class, 'show']);
                Route::post('change-status', [AdminAreaSetupManageController::class, 'changeStatus']);
                Route::delete('remove/{id}', [AdminAreaSetupManageController::class, 'destroy']);
                Route::post('settings/update', [AdminAreaSetupManageController::class, 'updateStoreAreaSetting']);
                Route::get('settings/details/{store_area_id}', [AdminAreaSetupManageController::class, 'storeAreaSettingsDetails']);
            });
            // commission Settings
            Route::prefix('commission')->middleware(['permission:' . PermissionKey::ADMIN_COMMISSION_SETTINGS->value])->group(function () {
                Route::match(['get', 'post'], '/settings', [AdminCommissionManageController::class, 'commissionSettings']);
            });
        });

        // report-analytics
        Route::group(['prefix' => 'report-analytics/'], function () {
            Route::get('reportList', [AdminReportAnalyticsManageController::class, 'reportList'])->middleware('permission:' . PermissionKey::ADMIN_REPORT_ANALYTICS_ORDER->value);
            Route::get('order', [AdminReportAnalyticsManageController::class, 'orderReport'])->middleware('permission:' . PermissionKey::ADMIN_REPORT_ANALYTICS_ORDER->value);
            Route::get('transaction', [AdminReportAnalyticsManageController::class, 'transactionReport'])->middleware('permission:' . PermissionKey::ADMIN_REPORT_ANALYTICS_TRANSACTION->value);
        });

        /*--------------------- System management ----------------------------*/
        Route::group(['prefix' => 'system-management/'], function () {
            Route::match(['get', 'post'], '/general-settings', [SystemManagementController::class, 'generalSettings'])->middleware('permission:' . PermissionKey::GENERAL_SETTINGS->value);
            // menu manage
            Route::prefix('menu-customization/')->middleware(['permission:' . PermissionKey::MENU_CUSTOMIZATION->value])->group(function () {
                Route::get('list', [MenuManageController::class, 'menus']);
                Route::post('store', [MenuManageController::class, 'store']);
                Route::get('details/{id}', [MenuManageController::class, 'show']);
                Route::post('update', [MenuManageController::class, 'update']);
                Route::post('update-position', [MenuManageController::class, 'updatePosition']);
                Route::delete('remove/{id?}', [MenuManageController::class, 'destroy']);
            });

            // theme manage
            Route::prefix('themes/')->middleware(['permission:' . PermissionKey::THEMES_SETTINGS->value])->group(function () {
                Route::get('list', [ThemeManageController::class, 'themes']);
                Route::post('store', [ThemeManageController::class, 'storeTheme']);
                Route::get('details/{theme_slug?}', [ThemeManageController::class, 'themeDataGet']);
                // theme active/deactivate
                Route::patch('active', [ThemeManageController::class, 'themeActive']);
            });

            Route::match(['get', 'post'], '/footer-customization', [SystemManagementController::class, 'footerCustomization'])->middleware('permission:' . PermissionKey::FOOTER_CUSTOMIZATION->value);
            Route::match(['get', 'post'], '/maintenance-settings', [SystemManagementController::class, 'maintenanceSettings'])->middleware('permission:' . PermissionKey::MAINTENANCE_SETTINGS->value);
            Route::match(['get', 'post'], '/seo-settings', [SystemManagementController::class, 'seoSettings'])->middleware('permission:' . PermissionKey::SEO_SETTINGS->value);
            Route::match(['get', 'post'], '/gdpr-cookie-settings', [SystemManagementController::class, 'gdprCookieSettings'])->middleware('permission:' . PermissionKey::GDPR_COOKIE_SETTINGS->value);
            Route::match(['get', 'post'], '/firebase-settings', [SystemManagementController::class, 'firebaseSettings'])->middleware('permission:' . PermissionKey::FIREBASE_SETTINGS->value);
            Route::match(['get', 'post'], '/social-login-settings', [SystemManagementController::class, 'socialLoginSettings'])->middleware('permission:' . PermissionKey::SOCIAL_LOGIN_SETTINGS->value);
            Route::match(['get', 'post'], '/openai-settings', [SystemManagementController::class, 'openAiSettings'])->middleware('permission:' . PermissionKey::GOOGLE_MAP_SETTINGS->value);
            Route::match(['get', 'post'], '/google-map-settings', [SystemManagementController::class, 'googleMapSettings'])->middleware('permission:' . PermissionKey::GOOGLE_MAP_SETTINGS->value);
            Route::match(['get', 'post'], '/recaptcha-settings', [SystemManagementController::class, 'recaptchaSettings'])->middleware('permission:' . PermissionKey::RECAPTCHA_SETTINGS->value);
            Route::match(['get', 'post'], '/cargo-settings', [SystemManagementController::class, 'cargoSettings'])->middleware('permission:' . PermissionKey::CARGO_SETTINGS->value);

            Route::post('/license-system', [SystemManagementController::class, 'licenseSystem'])->middleware('permission:' . PermissionKey::LICENSE_SYSTEM->value);

            // database and cache settings
            Route::post('/cache-management', [SystemManagementController::class, 'cacheManagement'])->middleware('permission:' . PermissionKey::CACHE_MANAGEMENT->value);
            Route::post('/database-update-controls', [SystemManagementController::class, 'databaseUpdateControl'])->middleware('permission:' . PermissionKey::DATABASE_UPDATE_CONTROLS->value);
            // email settings
            Route::group(['middleware' => ['permission:' . PermissionKey::SMTP_SETTINGS->value]], function () {
                Route::match(['get', 'post'], '/email-settings/smtp', [EmailSettingsController::class, 'smtpSettings']);
                Route::post('/email-settings/test-mail-send', [EmailSettingsController::class, 'testMailSend']);
            });
            // email settings
            Route::group(['prefix' => 'email-settings/email-template/', 'middleware' => 'permission:' . PermissionKey::EMAIL_TEMPLATES->value], function () {
                Route::get('list', [EmailTemplateManageController::class, 'allEmailTemplate']);
                Route::post('add', [EmailTemplateManageController::class, 'addEmailTemplate']);
                Route::get('details/{id}', [EmailTemplateManageController::class, 'emailTemplateDetails']);
                Route::post('edit', [EmailTemplateManageController::class, 'editEmailTemplate']);
                Route::delete('remove/{id}', [EmailTemplateManageController::class, 'deleteEmailTemplate']);
                Route::post('change-status', [EmailTemplateManageController::class, 'changeStatus']);
            });
            Route::match(['get', 'post'], 'sitemap-settings', [AdminSitemapController::class, 'generate'])->middleware('permission:' . PermissionKey::SITEMAP_SETTINGS->value);
        });

        /*--------------------- Roles &  permissions manage ----------------------------*/
        Route::get('permissions', [PermissionController::class, 'index']);
        Route::post('permissions-for-store-owner', [PermissionController::class, 'permissionForStoreOwner']);
        Route::get('module-wise-permissions', [PermissionController::class, 'moduleWisePermissions']);
        Route::group(['prefix' => 'roles/', 'middleware' => 'permission:' . PermissionKey::USERS_ROLE_ADD->value], function () {
            Route::get('list', [RoleController::class, 'index'])->middleware('permission:' . PermissionKey::USERS_ROLE_LIST->value);
            Route::post('add', [RoleController::class, 'store']);
            Route::get('details/{id}', [RoleController::class, 'show']);
            Route::post('update', [RoleController::class, 'update']);
            Route::post('change-status', [RoleController::class, 'changeStatus']);
            Route::delete('remove/{id}', [RoleController::class, 'destroy']);
        });

        // open ai
        Route::post('/generate/content', [OpenAiController::class, 'generateContent']);
    });
});
