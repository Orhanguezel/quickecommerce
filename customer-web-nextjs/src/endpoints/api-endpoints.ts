export const API_ENDPOINTS = {
  // Auth (customer)
  LOGIN: "/customer/login",
  REGISTER: "/customer/registration",
  LOGOUT: "/customer/logout",
  REFRESH_TOKEN: "/customer/refresh-token",
  FORGOT_PASSWORD: "/customer/forget-password",
  VERIFY_TOKEN: "/customer/verify-token",
  RESET_PASSWORD: "/customer/reset-password",
  OTP_LOGIN_SEND: "/otp-login/send",
  OTP_LOGIN_VERIFY: "/otp-login/verify",
  OTP_LOGIN_RESEND: "/otp-login/resend",

  // Site
  SITE_GENERAL_INFO: "/site-general-info",
  MENU: "/menu",
  SLIDER_LIST: "/slider-list",
  BANNER_LIST: "/banner-list",
  FOOTER: "/footer",
  PAGES: "/pages",
  THEME: "/theme",

  // Products
  PRODUCTS: "/product-list",
  PRODUCT_DETAIL: "/product",
  CATEGORIES: "/product-category/list",
  BRANDS: "/brand-list",
  PRODUCT_ATTRIBUTES: "/product/attribute-list",
  PRODUCT_QA: "/product-qa",
  PRODUCT_QA_ASK: "/product-qa/ask",
  PRODUCT_SUGGESTION: "/product-suggestion",
  REVIEW_ADD: "/product-review/store",
  REVIEW_REACTION: "/product-review/reaction",

  // Homepage Product Sections
  NEW_ARRIVALS: "/new-arrivals",
  BEST_SELLING: "/best-selling-products",
  FEATURED_PRODUCTS: "/featured-products",
  TRENDING_PRODUCTS: "/trending-products",
  POPULAR_PRODUCTS: "/popular-products",
  TOP_DEALS: "/top-deal-products",
  TOP_RATED: "/top-rated-products",
  WEEK_BEST: "/week-best-products",
  FLASH_DEALS: "/flash-deals",
  FLASH_DEAL_PRODUCTS: "/flash-deal-products",
  SHIPPING_CAMPAIGNS_ACTIVE: "/shipping-campaigns/active",

  // Search
  SEARCH: "/search",

  // Wishlist (customer - auth required)
  WISHLIST_LIST: "/customer/wish-list/list",
  WISHLIST_STORE: "/customer/wish-list/store",
  WISHLIST_REMOVE: "/customer/wish-list/remove",

  // Address (customer - auth required)
  ADDRESS_LIST: "/customer/address/customer-addresses",
  ADDRESS_GET: "/customer/address/customer-address",
  ADDRESS_ADD: "/customer/address/add",
  ADDRESS_UPDATE: "/customer/address/update",
  ADDRESS_DEFAULT: "/customer/address/make-default",
  ADDRESS_DELETE: "/customer/address/remove",

  // Checkout & Orders
  ORDER_CHECKOUT: "/orders/checkout",
  CHECK_COUPON: "/check-coupon",
  DELIVERY_CHARGE: "/calculate-delivery-charge",
  CHECKOUT_INFO: "/checkout-info",
  CHECKOUT_EXTRA_INFO: "/get-check-out-page-extra-info",
  STRIPE_SESSION: "/orders/create-stripe-session",
  IYZICO_SESSION: "/orders/create-iyzico-session",
  PAYMENT_STATUS: "/customer/orders/payment-status-update",

  // Orders (customer - auth required)
  ORDERS: "/customer/orders",
  ORDER_CANCEL: "/customer/orders/cancel-order",
  ORDER_INVOICE: "/customer/orders/invoice",
  ORDER_REFUND: "/customer/orders/request-refund",
  REFUND_REASONS: "/orders/refund-reason-list",

  // User (customer - auth required)
  PROFILE: "/customer/profile",
  UPDATE_PROFILE: "/customer/profile/update",
  CHANGE_PASSWORD: "/customer/profile/change-password",
  DELETE_ACCOUNT: "/customer/profile/delete",

  // Wallet
  WALLET: "/customer/wallet",
  WALLET_DEPOSIT: "/customer/wallet/deposit",
  WALLET_TRANSACTIONS: "/customer/wallet/transactions",
  WALLET_STRIPE_SESSION: "/wallet/create-stripe-session",
  WALLET_IYZICO_SESSION: "/wallet/create-iyzico-session",
  WALLET_GENERATE_HMAC: "/wallet/generate-hmac",

  // Blog
  BLOGS: "/blogs",
  BLOG_DETAIL: "/blog",

  // Stores
  STORES: "/store-list",
  STORE_DETAIL: "/store-details",
  STORE_TYPES: "/store-types",

  // Support Tickets
  SUPPORT_TICKETS: "/customer/support-ticket/list",
  SUPPORT_TICKET_CREATE: "/customer/support-ticket/store",
  SUPPORT_TICKET_DETAIL: "/customer/support-ticket/details",
  SUPPORT_TICKET_MESSAGES: "/customer/support-ticket/messages",
  SUPPORT_TICKET_ADD_MESSAGE: "/customer/support-ticket/add-message",
  SUPPORT_TICKET_RESOLVE: "/customer/support-ticket/resolve",

  // Coupons
  COUPONS: "/coupons",

  // Payment Gateways
  PAYMENT_GATEWAYS: "/payment-gateways",

  // Areas / Location
  AREA_LIST: "/area-list",

  // Currency
  CURRENCY_LIST: "/currency-list",
  CURRENCIES: "/currencies",
  CURRENCY_DEFAULT: "/currency/default",
  CURRENCY_CONVERT: "/currency/convert",

  // Seller
  SELLER_REGISTER: "/seller/registration",

  // Notifications
  NOTIFICATIONS: "/customer/notifications",

  // Chat
  CHAT_LIST: "/customer/chat/list",
  CHAT_MESSAGES: "/customer/chat/messages",
  CHAT_SEND: "/customer/chat/send",
  CHAT_SEEN: "/customer/chat/seen",

  // AI Chat
  AI_CHAT_STATUS: "/ai-chat/status",
  AI_CHAT_SEND: "/customer/ai-chat/send",
  AI_CHAT_GUEST_SEND: "/ai-chat/send",
  AI_CHAT_HISTORY: "/customer/ai-chat/history",
} as const;
