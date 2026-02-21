export const SELLER_API_ENDPOINTS = {
  SHOP_OWNER_LOGIN: "/v1/seller/login",
  SELLER_ROLES: "roles",
  ROLES_FOR_STORE_OWNER: "v1/roles-status-update",
  PERMISSIONS_FOR_STORE_OWNER: "v1/seller/permissions-for-store-owner",

  SEND_VERIFICATION_EMAIL: "v1/seller/send-verification-email",
  RESEND_VERIFICATION_EMAIL: "v1/seller/resend-verification-email",
  VERIFY_TOKEN_BY_EMAIL: "v1/seller/verify-email",

  // store categories (seller-managed)
  SELLER_CATEGORY_LIST: "v1/seller/store/category/list",
  SELLER_CATEGORY_ADD: "v1/seller/store/category/add",
  SELLER_CATEGORY_UPDATE: "v1/seller/store/category/update",
  SELLER_CATEGORY_EDIT: "v1/seller/store/category/details",
  SELLER_CATEGORY_STATUS: "v1/seller/store/category/change-status",
  SELLER_CATEGORY_REMOVE: "v1/seller/store/category/remove",

  // product attribute
  ATTRIBUTE_LIST: "v1/seller/store/attribute/list",
  ATTRIBUTE_ADD: "v1/seller/store/attribute/add",
  ATTRIBUTE_UPDATE: "v1/seller/store/attribute/update",
  ATTRIBUTE_EDIT: "v1/seller/store/attribute/details",
  ATTRIBUTE_REMOVE: "v1/seller/store/attribute/remove",
  ATTRIBUTE_STATUS_CHANGE: "v1/seller/store/attribute/status",

  // Product Author
  AUTHOR_LIST: "v1/seller/store/product/author/list",
  AUTHOR_STATUS: "v1/seller/store/product/author/status",
  AUTHOR_SAVE: "v1/seller/store/product/author/add",
  AUTHOR_UPDATE: "v1/seller/store/product/author/update",
  AUTHOR_EDIT: "v1/seller/store/product/author/details",
  AUTHOR_REMOVE: "v1/seller/store/product/author/remove",

  COUPON_LIST: "v1/seller/product/coupon/list",
  COUPON_SAVE: "v1/seller/product/coupon/add",
  COUPON_UPDATE: "v1/seller/product/coupon/update",
  COUPON_EDIT: "v1/seller/product/coupon/details",
  COUPON_DELETE: "v1/seller/product/coupon/remove",

  // seller store
  SELLER_STORE_LIST: "v1/seller/store/list",
  SELLER_STORE_ADD: "v1/seller/store/add",
  SELLER_STORE_EDIT: "v1/seller/store/details",
  SELLER_STORE_UPDATE: "v1/seller/store/update",
  STORE_DROPDOWN_LIST: "v1/seller/store-fetch-list",
  STORE_DASHBOARD: "v1/seller/store/dashboard",

  // seller business plan
  BUSINESS_PLAN_DETAILS_LIST: "v1/seller/store/settings/business-plan",
  COMMISSION_SETTINGS: "v1/seller/store/get-commission-settings",
  BUSINESS_PLAN_HISTORY_LIST: "v1/seller/store/subscription/package/history",
  PAYMENT_STATUS_UPDATE: "v1/subscription/package/payment-status-update",
  PACKAGE_RENEW: "v1/subscription/package/renew",
  BUY_PACKAGE: "v1/subscription/package/buy",
  BUSINESS_PLAN_CHANGE: "v1/seller/store/settings/business-plan-change",
  GENERATE_BUSINESS_PLAN_HMAC: "v1/subscription/package/generate-hmac",

  // seller wallet
  WALLET_LIST: "v1/seller/store/financial/wallet",
  WALLET_AMOUNT_DEPOSIT: "v1/seller/store/financial/wallet/deposit",
  WALLET_TRANSACTIONS: "v1/seller/store/financial/wallet/transactions",
  WALLET_STATUS_UPDATE: "v1/wallet/payment-status-update",
  GENERATE_WALLET_HMAC: "v1/wallet/generate-hmac",

  // Seller Staff
  STAFF_ADD: "v1/seller/store/staff/add",
  STAFF_LIST: "v1/seller/store/staff/list",
  STAFF_EDIT: "v1/seller/store/staff/details",
  STAFF_UPDATE: "v1/seller/store/staff/update",
  STAFF_STATUS: "v1/seller/store/staff/change-status",
  STAFF_REMOVE: "v1/seller/store/staff/remove",
  STAFF_PASSWORD_CHANGE: "v1/seller/store/staff/change-password",
  // seller product manage
  PRODUCT_ADD: "v1/seller/store/product/add",
  PRODUCT_LIST: "v1/seller/store/product/list",
  PRODUCT_EDIT: "v1/seller/store/product/details",
  PRODUCT_UPDATE: "v1/seller/store/product/update",
  PRODUCT_REMOVE: "v1/seller/store/product/remove",
  PRODUCT_FEATURE_MAKE: "v1/seller/store/product/add-to-featured",
  PRODUCT_DESCRIPTION_GENERATE: "v1/seller/generate/content",

  PRODUCT_DYNAMIC_FIELD: "v1/seller/store/dynamic-fields",

  STOCK_REPORT_LIST: "v1/seller/store/product/stock-report",
  PRODUCT_ATTRIBUTE: "v1/seller/attributes/type-wise",
  INVENTORY_LIST: "v1/seller/store/product/inventory",
  EXPORT: "v1/seller/store/product/export",
  IMPORT: "v1/seller/store/product/import",

  // order
  SELLER_ORDER_LIST: "v1/seller/store/orders",
  SELLER_ORDER_STATUS_UPDATE: "v1/seller/store/orders/change-order-status",
  SELLER_ORDER_INVOICE: "v1/seller/store/orders/invoice",
  SELLER_ORDER_CANCEL: "v1/seller/store/orders/cancel-order",

  REVIEWS_LIST: "v1/seller/store/feedback-control/review",
  REVIEWS_APPROVE: "v1/seller/store/feedback-control/review/approve",
  REVIEWS_REJECT: "v1/seller/store/feedback-control/review/reject",
  REVIEWS_DELETE: "v1/seller/store/feedback-control/review/remove",

  QUESTIONS_LIST: "v1/seller/store/feedback-control/questions",
  QUESTIONS_APPROVE: "v1/seller/store/feedback-control/questions/approve",
  QUESTIONS_REJECT: "v1/seller/store/feedback-control/questions/reject",
  QUESTIONS_STATUS_CHANGE:
    "v1/seller/store/feedback-control/questions/change-status",
  QUESTIONS_DELETE: "v1/seller/store/feedback-control/questions/remove",
  QUESTIONS_REPLY: "v1/seller/store/feedback-control/questions/reply",

  SUPPORT_TICKET_LIST: "v1/seller/store/support-ticket/list",
  SUPPORT_TICKET_EDIT: "v1/seller/store/support-ticket/details",
  SUPPORT_TICKET_DETAILS: "v1/seller/store/support-ticket/get-ticket-messages",
  SUPPORT_TICKET_ADD: "v1/seller/store/support-ticket/add",
  SUPPORT_TICKET_UPDATE: "v1/seller/store/support-ticket/update",
  SUPPORT_TICKET_ADD_MESSAGE: "v1/seller/store/support-ticket/message/add",
  SUPPORT_TICKET_REPLY_MESSAGE: "v1/seller/store/support-ticket/message/add",
  SUPPORT_TICKET_RESOLVE: "v1/seller/store/support-ticket/resolve",
  SUPPORT_TICKET_PRIORITY_CHANGE:
    "v1/seller/store/support-ticket/change-priority-status",

  WITHDRAW_REQUEST_LIST: "v1/seller/store/financial/withdraw",
  WITHDRAW_REQUEST_ADD: "v1/seller/store/financial/withdraw/withdraw-request",
  WITHDRAW_REQUEST_DETAILS: "v1/seller/store/financial/withdraw/details",
  WITHDRAW_METHOD_DROPDOWN: "v1/withdraw/gateway-method-list",

  WITHDRAW_SETTINGS: "v1/seller/store/financial/withdraw/settings",
  WITHDRAW_METHOD_LIST: "v1/seller/store/financial/withdraw/gateway-list",
  WITHDRAW_METHOD_ADD: "v1/seller/store/financial/withdraw/gateway-add",
  WITHDRAW_METHOD_EDIT: "v1/seller/store/financial/withdraw/gateway-details",
  WITHDRAW_METHOD_UPDATE: "v1/seller/store/financial/withdraw/gateway-update",
  WITHDRAW_METHOD_DELETE: "v1/seller/store/financial/withdraw/gateway-delete",
  WITHDRAW_METHOD_STATUS_CHANGE:
    "v1/seller/store/financial/withdraw/gateway-change-status",

  REFUND_REQUEST_LIST: "v1/seller/store/orders/refund-request",
  REFUND_REQUEST_STATUS_CHANGE: "v1/seller/store/orders/refund-request/handle",
  REFUND_REASON_LIST: "v1/orders/refund-reason-list",

  FLASH_DEALS_ACTIVE_LIST:
    "v1/seller/store/promotional/flash-deals/active-deals",
  FLASH_DEALS_MY_LIST: "v1/seller/store/promotional/flash-deals/my-deals",
  FLASH_DEALS_JOIN_STORE: "v1/seller/store/promotional/flash-deals/join-deals",

  SELLER_DASHBOARD_LIST: "v1/seller/dashboard",
  SELLER_SALES_LIST: "v1/seller/dashboard/sales-summary",
  SELLER_ORDER_GROWTH_LIST: "v1/seller/dashboard/order-growth-summary",
  SELLER_OTHER_SUMMARY_LIST: "v1/seller/dashboard/other-summary",

  CONTACT_US: "contact-us",

  NOTICES_LIST: "v1/seller/store-notices/list",
  NOTICES_DETAILS: "v1/seller/store-notices/details",

  SELLER_NOTIFICATIONS_ADD: "v1/seller/store/notifications",
  SELLER_NOTIFICATIONS_READ: "v1/seller/store/notifications/read",
  SELLER_NOTIFICATIONS_REMOVE: "v1/admin/notifications/remove",

  CHAT_SETTINGS: "v1/admin/chat/settings",
  LIVE_CHAT_LIST: "v1/seller/store/chat/list",
  CHAT_DETAILS: "v1/seller/store/chat/messages-details",
  REPLY_MESSAGE: "v1/seller/store/chat/send",

  POS_PRODUCT_LIST: "v1/seller/store/pos/products",
  POS_PRODUCT_DETAILS: "v1/seller/store/pos/products",

  POS_CUSTOMER_STORE: "v1/seller/store/pos/add-customer",
  POS_CUSTOMER_LIST: "v1/seller/store/pos/customers",
  COUPON_CHECK: "v1/check-coupon",
  POS_PLACE_ORDER: "v1/seller/store/pos/checkout",
  POS_INVOICE: "v1/seller/store/pos/invoice",
  POS_CATEGORY: "v1/product-category/list",
  POS_SETTINGS: "v1/seller/store/pos/settings",

  POS_ORDER_LIST: "v1/seller/store/pos/orders",
  POS_ORDER_DETAILS: "v1/seller/store/pos/orders",

};
