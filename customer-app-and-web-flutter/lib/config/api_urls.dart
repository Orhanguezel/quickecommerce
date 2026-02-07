class ApiUrls{
  static const baseUrlMart = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'https://sportoonline.com',
  );
  static String registration() => '$baseUrlMart/api/v1/customer/registration';
  static String loginUrl() => '$baseUrlMart/api/v1/customer/login';
  static String refreshTokenUrl() => '$baseUrlMart/api/v1/customer/refresh-token';
  static String pageSettingsUrl() => '$baseUrlMart/api/v1/maintenance-page-settings';
  static String googleUrl() => '$baseUrlMart/api/v1/auth/google?role=customer';
  static String contactUrl() => '$baseUrlMart/api/v1/pages/contact';
  static String contactSendMessageUrl() => '$baseUrlMart/api/contact-us';
  static String facebookUrl() => '$baseUrlMart/api/v1/auth/facebook?role=customer';


  static String sendOTPUrl () => '$baseUrlMart/api/v1/otp-login/send';
  static String verifyOTPUrl () => '$baseUrlMart/api/v1/otp-login/verify';
  static String resendOTPUrl () => '$baseUrlMart/api/v1/otp-login/resend';


  static String logoutUrl () => '$baseUrlMart/api/logout';
  // step 1
  static String forgetUrl () => '$baseUrlMart/api/v1/customer/forget-password';
  //step 2
  static String verifyTokenUrl() => '$baseUrlMart/api/v1/customer/verify-token';
  // step 3
  static String resetPasswordUrl() => '$baseUrlMart/api/v1/customer/reset-password';

  /// email verification && email change
 static String sendEmailVerificationUrl() => '$baseUrlMart/api/v1/customer/send-verification-email';
 static String resendEmailVerificationUrl() => '$baseUrlMart/api/v1/customer/resend-verification-email';
 static String verificationEmailUrl() => '$baseUrlMart/api/v1/customer/verify-email';
 static String changeEmailUrl() => '$baseUrlMart/api/v1/customer/profile/change-email';


 /// password change
  static String changePasswordUrl() => '$baseUrlMart/api/v1/customer/profile/change-password';
  static String profileEditUrl() => '$baseUrlMart/api/v1/customer/profile/update';
  static String generalInfoUrl() => '$baseUrlMart/api/v1/site-general-info';
  static String couponListUrl() => '$baseUrlMart/api/v1/coupons';
  static String activateDeactivateUrl() => '$baseUrlMart/api/v1/customer/profile/activate-deactivate';
  static String deleteAccountUrl() => '$baseUrlMart/api/v1/customer/profile/delete';
  static String imageUploadUrl() => '$baseUrlMart/api/v1/media-upload/store';
  static String homePageSettingsUrl() => '$baseUrlMart/api/v1/home-page-settings';
  static String profileUrl() => '$baseUrlMart/api/v1/customer/profile';
  static String askQuestionUrl() => '$baseUrlMart/api/v1/customer/product-query/ask-question';
  static String searchQuestionUrl() => '$baseUrlMart/api/v1/product-query/search-question';
  static String dashboardUrl() => '$baseUrlMart/api/v1/customer';
  static String categoryListUrl() => '$baseUrlMart/api/v1/product-category/list';
  static String categoryProductUrl() => '$baseUrlMart/api/v1/product-category/product';
  static String allProductUrl() => '$baseUrlMart/api/v1/product-list';
  static String trendingProductsUrl() => '$baseUrlMart/api/v1/trending-products';
  static String weekBestProductsUrl() => '$baseUrlMart/api/v1/week-best-products';
  static String productDetailsSettingUrl() => '$baseUrlMart/api/v1/product-details-page-settings';
  static String reviewReactionUrl() => '$baseUrlMart/api/v1/customer/review/reaction';
  static String productDetailsUrl(String slug)=> '$baseUrlMart/api/v1/product/$slug';
  static String newArrivalsUrl() => '$baseUrlMart/api/v1/new-arrivals';
  static String bestSaleUrl() => '$baseUrlMart/api/v1/best-selling-products';
  static String topDealUrl() => '$baseUrlMart/api/v1/top-deal-products';
  static String topRatedUrl() => '$baseUrlMart/api/v1/top-rated-products';
  static String productSuggestionUrl() => '$baseUrlMart/api/v1/product-suggestion';
  static String keywordSuggestionUrl() => '$baseUrlMart/api/v1/keyword-suggestion';
  static String menuListUrl() => '$baseUrlMart/api/v1/menu';
  static String popularProductsUrl() => '$baseUrlMart/api/v1/popular-products';
  static String featuredProductsUrl() => '$baseUrlMart/api/v1/featured-products';
  static String wishListUrl() => '$baseUrlMart/api/v1/customer/wish-list/list';
  static String wishListAddUrl() => '$baseUrlMart/api/v1/customer/wish-list/store';
  static String wishListDeleteUrl() => '$baseUrlMart/api/v1/customer/wish-list/remove';
  static String brandListUrl() => '$baseUrlMart/api/v1/brand-list';
  static String storeTypesUrl() => '$baseUrlMart/api/v1/store-types';
  static String sliderListUrl() => '$baseUrlMart/api/v1/slider-list';
  static String bannerListUrl() => '$baseUrlMart/api/v1/banner-list';
  static String flashDealsUrl() => '$baseUrlMart/api/v1/flash-deals';
  static String flashDealProductsUrl() => '$baseUrlMart/api/v1/flash-deal-products';
  static String blogListUrl() => '$baseUrlMart/api/v1/blogs';
  static String blogDetailUrl(String slug) => '$baseUrlMart/api/v1/blog/$slug';

  static String addressAddUrl() => '$baseUrlMart/api/v1/customer/address/add';
  static String addressListUrl() => '$baseUrlMart/api/v1/customer/address/customer-addresses';
  static String addressUpdateUrl() => '$baseUrlMart/api/v1/customer/address/update';
  static String addressDeleteUrl(String id) => '$baseUrlMart/api/v1/customer/address/remove/$id';
  static String ticketAddUrl() => '$baseUrlMart/api/v1/customer/support-ticket/store';
  static String ticketListUrl() => '$baseUrlMart/api/v1/customer/support-ticket/list';
  static String ticketDetailsUrl(String id) => '$baseUrlMart/api/v1/customer/support-ticket/details/$id';
  static String ticketUpdateUrl() => '$baseUrlMart/api/v1/customer/support-ticket/update';
  static String ticketResolveUrl() => '$baseUrlMart/api/v1/customer/support-ticket/resolve';
  static String departmentListUrl() => '$baseUrlMart/api/v1/department-list';
  static String sendMessageUrl() => '$baseUrlMart/api/v1/customer/support-ticket/add-message';
  static String pusherSendMessageUrl() => '$baseUrlMart/api/v1/customer/chat/send';
  static String getMessageUrl(String id) => '$baseUrlMart/api/v1/customer/support-ticket/messages/$id';

  static String chatListUrl() => '$baseUrlMart/api/v1/customer/chat/list';
  static String messagesSendUrl() => '$baseUrlMart/api/v1/customer/chat/send';
  static String messagesDetailsUrl() => '$baseUrlMart/api/v1/customer/chat/messages-details';
  static String pusherApiKey() =>  "74d65fc559e3f61711fb";
  static String pusherCluster() =>  "ap2";

  static String walletUrl() => '$baseUrlMart/api/v1/customer/wallet';
  static String walletGenerateHMacUrl() => '$baseUrlMart/api/v1/wallet/generate-hmac';
  static String walletDepositUrl() => '$baseUrlMart/api/v1/customer/wallet/deposit';
 /// stripe payment for web
 static String createWalletStripeSessionUrl() => '$baseUrlMart/api/v1/wallet/create-stripe-session';
 static String stripeWalletWebhookUrl() => '$baseUrlMart/api/v1/wallet/stripe/webhook';
  static String paymentUpdateUrl() => '$baseUrlMart/api/v1/wallet/payment-status-update';
  static String walletTransactionsUrl() => '$baseUrlMart/api/v1/customer/wallet/transactions';
  static String paymentGatewaysUrl() => '$baseUrlMart/api/v1/payment-gateways';
  static String currencyInfoUrl() => '$baseUrlMart/api/v1/currency-info';
  static String currencyListUrl() => '$baseUrlMart/api/v1/currency-list';
  static String checkCouponUrl() => '$baseUrlMart/api/v1/customer/orders/check-coupon';
  static String generateHMacUrl() => '$baseUrlMart/api/v1/customer/generate-hmac';
  static String placeOrderUrl() {
    return '$baseUrlMart/api/v1/orders/checkout'; }

  static String deliveryChargeUrl() => '$baseUrlMart/api/v1/calculate-delivery-charge';
  static String extraChargeUrl() => '$baseUrlMart/api/v1/get-check-out-page-extra-info';
  static String taxInfoUrl() => '$baseUrlMart/api/v1/store-tax-info';
  static String orderListUrl() => '$baseUrlMart/api/v1/customer/orders';
  static String reviewAddUrl() => '$baseUrlMart/api/v1/customer/review/add';
  static String orderTrackUrl() => '$baseUrlMart/api/v1/track-order-location';
  static String orderDetailsUrl(String id) {
    return '$baseUrlMart/api/v1/customer/orders/$id';
  }
  static String cancelOrderUrl() => '$baseUrlMart/api/v1/customer/orders/cancel-order';
  static String requestRefundUrl() => '$baseUrlMart/api/v1/customer/orders/request-refund';
  static String refundReasonListUrl() => '$baseUrlMart/api/v1/orders/refund-reason-list';
  static String paymentStatusUpdateUrl() => '$baseUrlMart/api/v1/customer/orders/payment-status-update';
 /// stripe payment for web
 static String createStripeSessionUrl() => '$baseUrlMart/api/v1/orders/create-stripe-session';
 static String stripeWebhookUrl() => '$baseUrlMart/api/v1/stripe/webhook';
  static String notificationUrl() => '$baseUrlMart/api/v1/customer/notifications';
  static String notificationReadUrl() => '$baseUrlMart/api/v1/customer/notifications/read';

  static String storeListUrl() => '$baseUrlMart/api/v1/store-list';
  static String storeDetailsUrl(String slug) {
    return '$baseUrlMart/api/v1/store-details/$slug';
  }

  static String tramsAndConditionAndPrivacyPolicyUrl(String base) => '$baseUrlMart/api/v1/pages/$base';

 static  String secretKeyForHas = "customize_your_stripe_secret_key_has";
  static String stripePublishableKey="customize_your_stripe_secret_key_pub";
  static String secretKey = 'customize_your_stripe_secret_key';
  static String googleAPIKey = 'customize_your_googleAPIKey';
}
