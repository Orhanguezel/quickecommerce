<?php

use App\Http\Controllers\Api\V1\Admin\AdminDeliverymanManageController;
use App\Http\Controllers\Api\V1\Admin\CurrencyController as AdminCurrencyController;
use App\Http\Controllers\Api\V1\Admin\ThemeManageController;
use App\Http\Controllers\Api\V1\Com\ComSiteGeneralController;
use App\Http\Controllers\Api\V1\CurrencyController;
use App\Http\Controllers\Api\V1\Com\FrontendPageSettingsController;
use App\Http\Controllers\Api\V1\Com\HeaderFooterController;
use App\Http\Controllers\Api\V1\Com\LiveLocationController;
use App\Http\Controllers\Api\V1\Com\SubscriberManageController;
use App\Http\Controllers\Api\V1\ContactManageController;
use App\Http\Controllers\Api\V1\Customer\CustomerCargoController;
use App\Http\Controllers\Api\V1\Customer\CustomerOrderController;
use Modules\Blog\app\Http\Controllers\Api\FrontendBlogController;
use App\Http\Controllers\Api\V1\Customer\CustomerProductQueryController;
use App\Http\Controllers\Api\V1\Customer\PlaceOrderController;
use App\Http\Controllers\Api\V1\DeliveryChargeCalculateController;
use App\Http\Controllers\Api\V1\FrontendController;
use App\Http\Controllers\Api\V1\IyzicoPaymentController;
use App\Http\Controllers\Api\V1\MenuManageController;
use App\Http\Controllers\Api\V1\OtherChargeInfoController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\StripePaymentController;
use App\Http\Controllers\Api\V1\StripeWebhookController;
use App\Http\Controllers\Api\V1\TaxInfoController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\Webhooks\GdeliverWebhookController;
use App\Http\Middleware\ApiAuthMiddleware;
use Illuminate\Support\Facades\Route;

Route::post('/token', [UserController::class, 'login']);
Route::post('/refresh-token', [UserController::class, 'refreshToken']);
Route::post('/register', [UserController::class, 'register']);
Route::post('/forget-password', [UserController::class, 'forgetPassword']);
Route::post('/reset-password', [UserController::class, 'resetPassword']);

Route::group(['middleware' => ['auth:sanctum', ApiAuthMiddleware::class]], function () {
    Route::get('/permissions', [PermissionController::class, 'permissions']);
    Route::get('/roles', [PermissionController::class, 'roles']);
    Route::middleware('detect.platform')->group(function () {
        Route::post('/logout', [UserController::class, 'logout']);
        Route::group(['prefix' => 'user/'], function () {
            Route::get('me', [UserController::class, 'me']);
            Route::get('profile', [UserController::class, 'userProfile']);
            Route::post('/profile-edit', [UserController::class, 'userProfileUpdate']);
            Route::post('/email-change', [UserController::class, 'userEmailUpdate']);
            Route::patch('/change-password', [UserController::class, 'changePassword']);
        });
    });
});

Route::post('contact-us', [ContactManageController::class, 'store']);

/*--------------------- Route without auth  ----------------------------*/
Route::group(['prefix' => 'v1/'], function () {
    Route::middleware('detect.platform')->group(function () {
        Route::group(['prefix' => 'auth/'], function () {
            Route::get('google', [UserController::class, 'redirectToGoogle']);
            Route::get('google/callback', [UserController::class, 'handleGoogleCallback']);
            Route::get('facebook', [UserController::class, 'redirectToFacebook']);
            Route::get('facebook/callback', [UserController::class, 'handleFacebookCallback']);
            Route::post('forget-password', [UserController::class, 'forgetPassword']);
            Route::post('verify-token', [UserController::class, 'verifyToken']);
            Route::post('reset-password', [UserController::class, 'resetPassword']);
        });

        // Product Category
        Route::group(['prefix' => 'product-category/'], function () {
            Route::get('list', [FrontendController::class, 'productCategoryList']);
            Route::get('product', [FrontendController::class, 'categoryWiseProducts']);
        });
    });

    // public routes for frontend
    Route::middleware('detect.platform')->group(function () {
        Route::get('/slider-list', [FrontendController::class, 'sliders']);
        Route::match(['GET', 'POST'], '/product-list', [FrontendController::class, 'products']);
        Route::get('/product/attribute-list', [FrontendController::class, 'productAttributes']);
        Route::get('/product/{product_slug}', [FrontendController::class, 'productDetails']);
        Route::get('/new-arrivals', [FrontendController::class, 'newArrivals']);
        Route::get('/best-selling-products', [FrontendController::class, 'bestSellingProducts']);
        Route::get('/featured-products', [FrontendController::class, 'featuredProducts']);
        Route::get('/week-best-products', [FrontendController::class, 'weekBestProducts']);
        Route::get('/trending-products', [FrontendController::class, 'trendingProducts']);
        Route::get('/popular-products', [FrontendController::class, 'popularProducts']);
        Route::get('/top-deal-products', [FrontendController::class, 'topDeals']);
        Route::get('/top-rated-products', [FrontendController::class, 'topRatedProducts']);
        Route::get('/banner-list', [FrontendController::class, 'banners']);
        Route::post('/subscribe', [SubscriberManageController::class, 'subscribe']);
        Route::post('/unsubscribe', [SubscriberManageController::class, 'unsubscribe']);
        Route::get('/area-list', [FrontendController::class, 'areas']);
        Route::get('/tag-list', [FrontendController::class, 'tags']);
        Route::get('/brand-list', [FrontendController::class, 'brands']);
        Route::get('/store-types', [FrontendController::class, 'storeTypes']);
        Route::get('/behaviour-list', [FrontendController::class, 'behaviourList']);
        Route::get('/unit-list', [FrontendController::class, 'units']);
        Route::get('/customer-list', [FrontendController::class, 'customers']);
        Route::get('/store-list', [FrontendController::class, 'stores']);
        Route::get('/store-list-dropdown', [FrontendController::class, 'storesDropdown']);
        Route::get('/store-details/{slug}', [FrontendController::class, 'storeDetails']);
        Route::get('/department-list', [FrontendController::class, 'departments']);
        Route::get('/flash-deals', [FrontendController::class, 'flashDeals']);
        Route::get('/flash-deal-products', [FrontendController::class, 'flashDealProducts']);
        Route::get('/shipping-campaigns/active', [FrontendController::class, 'getActiveShippingCampaigns']);
        Route::get('/product-suggestion', [FrontendController::class, 'searchSuggestions']);
        Route::get('/keyword-suggestion', [FrontendController::class, 'keywordSuggestions']);
        Route::get('/orders/refund-reason-list', [FrontendController::class, 'orderRefundReasons']);
        Route::get('/coupons', [FrontendController::class, 'coupons']);
        Route::get('/pages/{slug}', [FrontendController::class, 'page']);
        Route::get('/become-a-seller', [FrontendController::class, 'becomeASeller']);
        Route::get('/all/pages', [FrontendController::class, 'pages']);
        Route::get('/store-wise-products', [FrontendController::class, 'storeWiseProducts']);
        Route::post('/get-check-out-page-extra-info', [FrontendController::class, 'checkOutPageExtraInfo']);
        Route::get('/menu', [MenuManageController::class, 'menus']);
        Route::put('/update-location', [LiveLocationController::class, 'updateLocation']);
        Route::post('/track-order-location', [LiveLocationController::class, 'trackOrder']);
        Route::get('/vehicle-types/list-dropdown', [AdminDeliverymanManageController::class, 'vehicleTypeDropdown']);

        Route::get('/product-query/search-question', [CustomerProductQueryController::class, 'searchQuestions']);

        // home page footer api route
        Route::get('/theme', [ThemeManageController::class, 'activeThemeData']);
        Route::get('/footer', [HeaderFooterController::class, 'siteFooterInfo']);
        Route::get('/footer-settings', [HeaderFooterController::class, 'siteFooterInfo']); // Alias for /footer
        Route::get('/site-general-info', [ComSiteGeneralController::class, 'siteGeneralInfo']);
        Route::get('/general-settings', [ComSiteGeneralController::class, 'siteGeneralInfo']); // Alias for /site-general-info
        Route::get('/currency-list', [ComSiteGeneralController::class, 'currencyList']);

        // Currency routes (Public)
        Route::get('/currencies', [CurrencyController::class, 'index']);
        Route::get('/currency/default', [CurrencyController::class, 'default']);
        Route::post('/currency/convert', [CurrencyController::class, 'convert']);

        Route::get('/maintenance-page-settings', [ComSiteGeneralController::class, 'siteMaintenancePage']);
        Route::get('/google-map-settings', [ComSiteGeneralController::class, 'googleMapSettings']);
        Route::get('/gdpr-cookie-settings', [ComSiteGeneralController::class, 'gdprCookieSettings']);

        // blog routes
        Route::get('/blogs', [FrontendBlogController::class, 'blogs']);
        Route::get('/blog/{slug}', [FrontendBlogController::class, 'blogDetails']);
        Route::get('/blog-page-settings', [FrontendBlogController::class, 'BlogPageSettings']);

        // pages settings routes
        Route::get('/register-page-settings', [FrontendPageSettingsController::class, 'RegisterPageSettings']);
        Route::get('/home-page-settings', [FrontendPageSettingsController::class, 'HomePageSettings']);
        Route::get('/login-page-settings', [FrontendPageSettingsController::class, 'LoginPageSettings']);
        Route::get('/product-details-page-settings', [FrontendPageSettingsController::class, 'productDetailsPageSettings']);

        // delivery charge calculate
        Route::get('/calculate-delivery-charge', [DeliveryChargeCalculateController::class, 'calculateDeliveryCharge']);
        Route::post('/store-tax-info', [TaxInfoController::class, 'storeTaxInformation']);
        Route::get('/other-charge-info', [OtherChargeInfoController::class, 'otherChargeInformation']);
        Route::post('/checkout-info', [OtherChargeInfoController::class, 'checkoutInfo']);
        Route::post('/check-coupon', [CustomerOrderController::class, 'checkCoupon']);

        // customer place order
        Route::group(['namespace' => 'Api\V1', 'middleware' => ['auth:api_customer', 'check.customer.account.status']], function () {
            Route::post('orders/checkout', [PlaceOrderController::class, 'placeOrder']);
            // Kargo takip (müşteri)
            Route::get('orders/{orderId}/cargo', [CustomerCargoController::class, 'show']);
            // create checkout session (returns stripe checkout url)
            Route::post('orders/create-stripe-session', [StripePaymentController::class, 'createCheckoutSession']);
            // create checkout session (returns iyzico payment url)
            Route::post('orders/create-iyzico-session', [IyzicoPaymentController::class, 'createCheckoutSession']);
            // stripe webhook (Stripe will call this)
            Route::post('stripe/webhook', [StripeWebhookController::class, 'handleWebhook']);
        });

        // iyzico callback (Iyzipay redirects customer here)
        Route::match(['GET', 'POST'], 'iyzico/callback', [IyzicoPaymentController::class, 'callback']);
        // iyzico wallet deposit callback
        Route::match(['GET', 'POST'], 'iyzico/wallet-callback', [IyzicoPaymentController::class, 'walletCallback']);
    });

    // Geliver kargo takip webhook (Geliver bu endpoint'i çağırır)
    Route::post('webhooks/geliver', [GdeliverWebhookController::class, 'handleWebhook']);
});

// Admin Currency Management Routes
Route::group(['prefix' => 'v1/admin', 'middleware' => ['auth:sanctum', ApiAuthMiddleware::class, 'detect.platform']], function () {
    Route::group(['prefix' => 'currencies'], function () {
        Route::get('/', [AdminCurrencyController::class, 'index']);
        Route::post('/update-rates', [AdminCurrencyController::class, 'updateRates']);
        Route::put('/{currency}', [AdminCurrencyController::class, 'update']);
        Route::post('/convert', [AdminCurrencyController::class, 'convert']);
        Route::get('/rate', [AdminCurrencyController::class, 'getRate']);
    });
});

