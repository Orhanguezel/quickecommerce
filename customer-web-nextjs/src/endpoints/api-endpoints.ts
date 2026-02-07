export const API_ENDPOINTS = {
  // Auth (customer)
  LOGIN: "/customer/login",
  REGISTER: "/customer/registration",
  LOGOUT: "/customer/logout",
  REFRESH_TOKEN: "/customer/refresh-token",
  FORGOT_PASSWORD: "/customer/forget-password",
  VERIFY_TOKEN: "/customer/verify-token",
  RESET_PASSWORD: "/customer/reset-password",

  // Site
  SITE_GENERAL_INFO: "/site-general-info",
  MENU: "/menu",
  SLIDER_LIST: "/slider-list",
  BANNER_LIST: "/banner-list",
  PAGES: "/pages",

  // Products
  PRODUCTS: "/product-list",
  PRODUCT_DETAIL: "/product",
  CATEGORIES: "/product-category/list",
  BRANDS: "/brand-list",
  PRODUCT_QA: "/product-qa",
  PRODUCT_SUGGESTION: "/product-suggestion",

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

  // Search
  SEARCH: "/search",

  // Cart
  CART: "/cart",
  CART_ADD: "/cart/add",
  CART_UPDATE: "/cart/update",
  CART_REMOVE: "/cart/remove",

  // Wishlist
  WISHLIST: "/wishlist",
  WISHLIST_TOGGLE: "/wishlist/toggle",

  // Orders
  ORDERS: "/orders",
  ORDER_DETAIL: "/orders",
  ORDER_CANCEL: "/orders/cancel",

  // Checkout
  CHECKOUT: "/checkout",
  DELIVERY_CHARGE: "/delivery-charge",
  APPLY_COUPON: "/apply-coupon",

  // User
  PROFILE: "/profile",
  UPDATE_PROFILE: "/update-profile",
  CHANGE_PASSWORD: "/change-password",
  ADDRESSES: "/addresses",

  // Wallet
  WALLET: "/wallet",
  WALLET_DEPOSIT: "/wallet/deposit",

  // Blog
  BLOGS: "/blogs",
  BLOG_DETAIL: "/blog",

  // Stores
  STORES: "/store-list",
  STORE_DETAIL: "/store-details",
  STORE_TYPES: "/store-types",

  // Support
  SUPPORT_TICKETS: "/support-tickets",

  // Coupons
  COUPONS: "/coupons",

  // Notifications
  NOTIFICATIONS: "/notifications",
} as const;
