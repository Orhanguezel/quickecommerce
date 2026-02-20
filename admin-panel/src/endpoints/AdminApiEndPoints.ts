export const API_ENDPOINTS = {
  // routes for admin
  PERMISSIONS: "v1/admin/permissions",
  MODULE_WISE_PERMISSIONS: "v1/admin/module-wise-permissions",
  FOOTER: "v1/footer",
  SUBSCRIBE: "v1/subscribe",
  UNSUBSCRIBE: "v1/unsubscribe",
  ROLES: "v1/admin/roles/list",
  ROLES_ADD: "v1/admin/roles/add",
  ROLES_UPDATE: "v1/admin/roles/update",
  ROLES_EDIT: "v1/admin/roles/details",
  ROLES_STATUS_CHANGE: "v1/admin/roles/change-status",
  ROLES_REMOVE: "v1/admin/roles/remove",
  // brand
  ADMIN_BRAND_ADD: "v1/admin/brand/add",
  ADMIN_BRAND_EDIT: "v1/admin/brand/details",
  ADMIN_BRAND_LIST: "v1/admin/brand/list",
  ADMIN_BRAND_UPDATE: "v1/admin/brand/update",
  ADMIN_BRAND_STATUS: "v1/admin/brand/change-status",
  ADMIN_BRAND_REMOVE: "v1/admin/brand/remove",
  //Author
  PRODUCT_AUTHOR_LIST: "v1/admin/product/author/list",
  PRODUCT_AUTHOR_REQUEST: "v1/admin/product/author/author-request",
  PRODUCT_AUTHOR_APPROVED: "v1/admin/product/author/approve",
  PRODUCT_AUTHOR_STORE: "v1/admin/product/author/add",
  PRODUCT_AUTHOR_UPDATE: "v1/admin/product/author/update",
  PRODUCT_AUTHOR_DETAILS: "v1/admin/product/author/details",
  PRODUCT_AUTHOR_REMOVE: "v1/admin/product/author/remove",
  PRODUCT_AUTHOR_STATUS_CHANGE: "v1/admin/product/author/change-status",
  // Category
  CATEGORY: "v1/admin/product-categories/list",
  CATEGORY_EDIT: "v1/admin/product-categories/details",
  CATEGORY_ADD: "v1/admin/product-categories/add",
  CATEGORY_UPDATE: "v1/admin/product-categories/update",
  CATEGORY_STATUS: "v1/admin/product-categories/change-status",
  CATEGORY_REMOVE: "v1/admin/product-categories/remove",

  // product attribute
  PRODUCT_ATTRIBUTE: "v1/admin/attribute/list",
  PRODUCT_ATTRIBUTE_ADD: "v1/admin/attribute/add",
  PRODUCT_ATTRIBUTE_EDIT: "v1/admin/attribute",
  PRODUCT_ATTRIBUTE_REMOVE: "v1/admin/attribute/remove",
  PRODUCT_ATTRIBUTE_STATUS_CHANGE: "v1/admin/attribute/status",

  // themes  settings option
  THEMES_LIST: "v1/admin/system-management/themes/list",
  THEMES_DETAILS: "v1/admin/system-management/themes/details",
  THEMES_ADD: "v1/admin/system-management/themes/store",
  THEME_STATUS: "v1/admin/system-management/themes/active",

  // business operation
  //Area Setup
  BUSINESS_OPERATION_AREA_LIST: "v1/admin/business-operation/area/list",
  // Subscriptions
  BUSINESS_OPERATION_SUBSCRIPTION_PACKAGE_LIST:
    "v1/admin/business-operation/subscriptions/package/list",
  // commission
  BUSINESS_OPERATION_COMMISSION_SETTINGS:
    "v1/admin/business-operations/commission/settings",
  BUSINESS_OPERATION_COMMISSION_HISTORY:
    "v1/admin/business-operation/commission/history",

  // System Management Settings
  GENERAL_SETTINGS: "v1/admin/system-management/general-settings",
  PAYMENT_GETWAY: "v1/admin/payment-gateways",
  PAYMENT_GETWAY_CURRENCY: "v1/admin/payment-gateways/settings/currency",
  SEO_SETTINGS: "v1/admin/system-management/seo-settings",
  MAINTENANCE_SETTINGS: "v1/admin/system-management/maintenance-settings",
  SOCIAL_SETTINGS: "v1/admin/system-management/social-login-settings",
  FOOTER_CUSTOMIZATION: "v1/admin/system-management/footer-customization",
  SMTP_SETTINGS: "v1/admin/system-management/email-settings/smtp",
  TEST_EMAIL: "v1/admin/system-management/email-settings/test-mail-send",
  CASHE_MANAGEMENT: "v1/admin/system-management/cache-management",
  DATABASE_UPDATE_CONTROL:
    "v1/admin/system-management/database-update-controls",
  FIREBASE_SETTINGS: "v1/admin/system-management/firebase-settings",
  GOOGLE_MAP_SETTINGS: "v1/admin/system-management/google-map-settings",
  RECAPTCHA_SETTINGS: "v1/admin/system-management/recaptcha-settings",

  REGISTER_SETTINGS: "v1/admin/system-management/page-settings/register",
  LOGIN_SETTINGS: "v1/admin/system-management/page-settings/login",
  ADMIN_SIGN_IN_SETTINGS: "v1/login-page-settings",
  ABOUT_SETTINGS: "v1/admin/system-management/page-settings/about",
  CONTACT_SETTINGS: "v1/admin/system-management/page-settings/contact",
  PRODUCT_DETAILS_SETTINGS:
    "v1/admin/system-management/page-settings/product-details",
  BLOG_DETAILS_SETTINGS:
    "v1/admin/system-management/page-settings/blog-details",
  HOME_SETTINGS: "v1/admin/system-management/page-settings/home",

  TAG: "v1/admin/tag/list",
  GET_TAG: "v1/admin/tag/details",
  TAG_ADD: "v1/admin/tag/add",
  TAG_UPDATE: "v1/admin/tag/update",
  TAG_REMOVE: "v1/admin/tag/remove",

  PAGES: "v1/admin/pages/list",
  ALL_PAGES: "v1/all/pages",
  PAGES_GET: "v1/admin/pages/details",
  PAGES_ADD: "v1/admin/pages/store",
  PAGES_UPDATE: "v1/admin/pages/update",
  PAGES_REMOVE: "v1/admin/pages/remove",

  BLOG_CATEGORY: "v1/admin/blog/category/list",
  BLOG_CATEGORY_FETCH: "v1/admin/blog/category/fetch/list",
  BLOG_CATEGORY_EDIT: "v1/admin/blog/category/details",
  BLOG_CATEGORY_ADD: "v1/admin/blog/category/add",
  BLOG_CATEGORY_UPDATE: "v1/admin/blog/category/update",
  BLOG_CATEGORY_STATUS_UPDATE: "v1/admin/blog/category/change-status",
  BLOG_CATEGORY_REMOVE: "v1/admin/blog/category/remove",

  BLOG_POST: "v1/admin/blog/list",
  BLOG_POST_ADD: "v1/admin/blog/add",
  BLOG_POST_EDIT: "v1/admin/blog/details",
  BLOG_POST_UPDATE: "v1/admin/blog/update",
  BLOG_POST_STATUS_UPDATE: "v1/admin/blog/change-status",
  BLOG_POST_DELETE: "v1/admin/blog/remove",

  COUPON_LIST: "v1/admin/coupon/list",
  COUPON_ADD: "v1/admin/coupon/add",
  COUPON_EDIT: "v1/admin/coupon/details",
  COUPON_UPDATE: "v1/admin/coupon/update",
  COUPON_STATUS_CHANGE: "v1/admin/coupon/status-change",
  COUPON_DELETE: "v1/admin/coupon/remove",

  PACKAGE_LIST: "v1/admin/business-operations/subscription/package/list",
  PACKAGE_ADD: "v1/admin/business-operations/subscription/package/store",
  PACKAGE_EDIT: "v1/admin/business-operations/subscription/package/details",
  PACKAGE_UPDATE: "v1/admin/business-operations/subscription/package/update",
  PACKAGE_STATUS_CHANGE:
    "v1/admin/business-operations/subscription/package/change-status",
  PACKAGE_DELETE: "v1/admin/business-operations/subscription/package/delete",

  SUBSCRIPTION_STORE_LIST:
    "v1/admin/business-operations/subscription/store/list",
  SUBSCRIPTION_STORE_STATUS_CHANGE:
    "v1/admin/business-operations/subscription/store/change-status",
  SUBSCRIPTION_STORE_HISTORY:
    "v1/admin/business-operations/subscription/store/history",

  AREA_LIST: "v1/admin/business-operations/area/list",
  AREA_ADD: "v1/admin/business-operations/area/add",
  AREA_EDIT: "v1/admin/business-operations/area/details",
  AREA_UPDATE: "v1/admin/business-operations/area/update",
  AREA_STATUS_CHANGE: "v1/admin/business-operations/area/change-status",
  AREA_DELETE: "v1/admin/business-operations/area/remove",
  AREA_SETTINGS_UPDATE: "v1/admin/business-operations/area/settings/update",
  AREA_SETTINGS_EDIT: "v1/admin/business-operations/area/settings/details",

  ADMIN_STORE_TYPE_LIST: "v1/admin/business-operations/store-type/list",
  STORE_TYPE_ADD: "v1/admin/business-operations/store-type/add",
  STORE_TYPE_EDIT: "v1/admin/business-operations/store-type/details",
  STORE_TYPE_UPDATE: "v1/admin/business-operations/store-type/update",
  STORE_TYPE_STATUS_CHANGE:
    "v1/admin/business-operations/store-type/change-status",
  STORE_TYPE_DELETE: "v1/admin/business-operations/store-type/remove",

  COUPON_LINE_LIST: "v1/admin/coupon-line/list",
  COUPON_LINE_ADD: "v1/admin/coupon-line/add",
  COUPON_LINE_EDIT: "v1/admin/coupon-line/details",
  COUPON_LINE_UPDATE: "v1/admin/coupon-line/update",
  COUPON_LINE_DELETE: "v1/admin/coupon-line/remove",

  SELLER_LIST: "v1/admin/seller/active",
  SELLER_STORE__LIST: "v1/admin/store/seller-stores",
  STORE_DROPDOWN_LIST: "v1/admin/store-fetch-list",
  PRODUCT_ADD: "v1/admin/product/add",
  PRODUCT_LIST: "v1/admin/product/list",
  PRODUCT_EDIT: "v1/admin/product/details",
  PRODUCT_DETAILS: "v1/admin/product",
  PRODUCT_UPDATE: "v1/admin/product/update",
  PRODUCT_REMOVE: "v1/admin/product/remove",
  PRODUCT_FEATURE_MAKE: "v1/admin/product/add-to-featured",
  PRODUCT_STATUS_UPDATE: "v1/admin/product/change-status",

  TRASH_PRODUCT_LIST: "v1/admin/product/trash-list",
  TRASH_PRODUCT_RESTORE: "v1/admin/product/trash-restore",
  TRASH_PRODUCT_DELETE: "v1/admin/product/trash-delete",

  STOCK_REPORT_LIST: "v1/admin/product/stock-report",
  INVENTORY_LIST: "v1/admin/product/inventory",
  INVENTORY_DELETE: "v1/admin/product/inventory/remove",
  REQUEST_LIST: "v1/admin/product/request",
  REQUEST_APPROVE: "v1/admin/product/approve",
  EXPORT: "v1/admin/product/export",
  IMPORT: "v1/admin/product/import",

  //author
  AUTHOR_REQUEST_LIST: "v1/admin/product/author/author-request",
  AUTHOR_REQUEST_APPROVE: "v1/admin/product/author/approve",
  AUTHOR_LIST: "v1/admin/product/author/list",
  AUTHOR_ADD: "v1/admin/product/author/add",
  AUTHOR_EDIT: "v1/admin/product/author/details",
  AUTHOR_UPDATE: "v1/admin/product/author/update",
  AUTHOR_STATUS: "v1/admin/product/author/change-status",
  AUTHOR_REMOVE: "v1/admin/product/author/remove",

  //unit
  ADMIN_UNIT_LIST: "v1/admin/unit/list",
  UNIT_SAVE: "v1/admin/unit/add",
  UNIT_UPDATE: "v1/admin/unit/update",
  UNIT_EDIT: "v1/admin/unit/details",
  UNIT_DELETE: "v1/admin/unit/remove",

  // product attribute
  ATTRIBUTE_LIST: "v1/admin/attribute/list",
  ATTRIBUTE_ADD: "v1/admin/attribute/add",
  ATTRIBUTE_UPDATE: "v1/admin/attribute/update",
  ATTRIBUTE_EDIT: "v1/admin/attribute/details",
  ATTRIBUTE_REMOVE: "v1/admin/attribute/remove",
  ATTRIBUTE_STATUS_CHANGE: "v1/admin/attribute/status",
  ATTRIBUTE_TYPE_WISE: "v1/admin/attribute/type-wise",

  // admin wallet
  WALLET_LIST: "v1/admin/financial/wallet/list",
  WALLET_AMOUNT_DEPOSIT: "v1/admin/financial/wallet/deposit",
  WALLET_STATUS_UPDATE: "v1/admin/financial/wallet/status",
  WALLET_TRANSACTIONS: "v1/admin/financial/wallet/transactions",
  TRANSACTIONS_STATUS_UPDATE: "v1/admin/financial/wallet/transactions-status",
  TRANSACTIONS_PAYMENT_STATUS_UPDATE:
    "v1/admin/financial/wallet/transactions-payment-status-change",
  WALLET_SETTINGS: "v1/admin/financial/wallet/settings",

  // admin flash deals
  FLASH_DEALS_LIST: "v1/admin/promotional/flash-deals/list",
  FLASH_DEALS_DROPDOWN_LIST: "v1/admin/promotional/flash-deals/list-dropdown",
  FLASH_DEALS_ALL_PRODUCTS_LIST:
    "v1/admin/promotional/flash-deals/all-products",
  FLASH_DEALS_ADD: "v1/admin/promotional/flash-deals/add",
  FLASH_DEALS_EDIT: "v1/admin/promotional/flash-deals/details",
  FLASH_DEALS_UPDATE: "v1/admin/promotional/flash-deals/update",
  FLASH_DEALS_STATUS_UPDATE: "v1/admin/promotional/flash-deals/change-status",
  FLASH_DEALS_DELETE: "v1/admin/promotional/flash-deals/remove",
  DEACTIVATE_EXPIRED_FLASH_SALE: "v1/admin/promotional/flash-deals/deactivate",
  JOIN_REQUEST_LIST: "v1/admin/promotional/flash-deals/join-request",
  JOIN_REQUEST_APPROVE: "v1/admin/promotional/flash-deals/join-request/approve",
  JOIN_REQUEST_REJECT: "v1/admin/promotional/flash-deals/join-request/reject",

  DELIVERYMAN_LIST: "v1/admin/deliveryman/list",
  DELIVERYMAN_REQUEST_LIST: "v1/admin/deliveryman/request",
  DELIVERYMAN_APPROVE: "v1/admin/deliveryman/handle-request",
  DELIVERYMAN_ADD: "v1/admin/deliveryman/add",
  DELIVERYMAN_EDIT: "v1/admin/deliveryman/details",
  DELIVERYMAN_DETAILS: "v1/admin/deliveryman/history",
  DELIVERYMAN_UPDATE: "v1/admin/deliveryman/update",
  DELIVERYMAN_STATUS_UPDATE: "v1/admin/deliveryman/change-status",
  DELIVERYMAN_STATUS_VERIFY: "v1/admin/deliveryman/verification",
  DELIVERYMAN_REMOVE: "v1/admin/deliveryman/remove",
  DELIVERYMAN_PASSWORD_CHANGE: "v1/admin/deliveryman/change-password",

  TRASH_DELIVERYMAN_LIST: "v1/admin/deliveryman/trash-list",
  TRASH_DELIVERYMAN_RESTORE: "v1/admin/deliveryman/trash-restore",
  TRASH_DELIVERYMAN_DELETE: "v1/admin/deliveryman/trash-delete",

  VEHICLE_TYPE_LIST: "v1/admin/deliveryman/vehicle-types/list",
  VEHICLE_TYPE_DROPDOWN_LIST:
    "v1/admin/deliveryman/vehicle-types/list-dropdown",
  VEHICLE_TYPE_ADD: "v1/admin/deliveryman/vehicle-types/add",
  VEHICLE_TYPE_EDIT: "v1/admin/deliveryman/vehicle-types/details",
  VEHICLE_TYPE_UPDATE: "v1/admin/deliveryman/vehicle-types/update",
  VEHICLE_TYPE_STATUS_UPDATE:
    "v1/admin/deliveryman/vehicle-types/change-status",
  VEHICLE_TYPE_REMOVE: "v1/admin/deliveryman/vehicle-types/remove",

  REVIEWS_LIST: "v1/admin/feedback-control/review",
  REVIEWS_APPROVE: "v1/admin/feedback-control/review/approve",
  REVIEWS_REJECT: "v1/admin/feedback-control/review/reject",
  REVIEWS_DELETE: "v1/admin/feedback-control/review/remove",

  QUESTIONS_LIST: "v1/admin/feedback-control/questions",
  QUESTIONS_APPROVE: "v1/admin/feedback-control/questions/approve",
  QUESTIONS_REJECT: "v1/admin/feedback-control/questions/reject",
  QUESTIONS_STATUS_CHANGE: "v1/admin/feedback-control/questions/change-status",
  QUESTIONS_DELETE: "v1/admin/feedback-control/questions/remove",

  // store
  ADMIN_STORE_LIST: "v1/admin/store/list",
  ADMIN_STORE_ADD: "v1/admin/store/add",
  ADMIN_STORE_EDIT: "v1/admin/store/details",
  ADMIN_STORE_UPDATE: "v1/admin/store/update",
  ADMIN_STORE_STATUS_UPDATE: "v1/admin/store/change-status",
  ADMIN_STORE_DELETE: "v1/admin/store/remove",
  STORE_DASHBOARD: "v1/seller/store/dashboard",
  STORE_REQUEST_APPROVAL_LIST: "v1/admin/store/request",
  STORE_REQUEST_APPROVE: "v1/admin/store/approve",

  TRASH_STORE_LIST: "v1/admin/store/trash-list",
  TRASH_STORE_RESTORE: "v1/admin/store/trash-restore",
  TRASH_STORE_DELETE: "v1/admin/store/trash-delete",

  // order
  ADMIN_ORDER_LIST: "v1/admin/orders",
  ADMIN_ORDER_ADD: "v1/admin/store/add",
  ADMIN_ORDER_EDIT: "v1/admin/store/details",
  ADMIN_ORDER_UPDATE: "v1/admin/store/update",
  ADMIN_ORDER_STATUS_UPDATE: "v1/admin/orders/change-order-status",
  ADMIN_PAYMENT_STATUS_UPDATE: "v1/admin/orders/change-payment-status",
  ADMIN_ORDER_DELETE: "v1/admin/store/remove",
  ADMIN_ORDER_INVOICE: "v1/admin/orders/invoice",
  ADMIN_ORDER_CANCEL: "v1/admin/orders/cancel-order",
  ADMIN_DELIVERY_ASSIGN: "v1/admin/orders/assign-deliveryman",
  ADMIN_DELIVERY_DROPDOWN_LIST: "v1/admin/deliveryman/list-dropdown",

  SUPPORT_TICKET_LIST: "v1/admin/support-ticket/list",
  SUPPORT_TICKET_EDIT: "v1/admin/support-ticket/details",
  SUPPORT_TICKET_DETAILS: "v1/admin/support-ticket/get-ticket-messages",
  SUPPORT_TICKET_ADD: "v1/admin/support-ticket/add",
  SUPPORT_TICKET_UPDATE: "v1/admin/support-ticket/update",
  SUPPORT_TICKET_ADD_MESSAGE: "v1/admin/support-ticket/message/add",
  SUPPORT_TICKET_REPLY_MESSAGE: "v1/admin/support-ticket/message/reply",
  SUPPORT_TICKET_RESOLVE: "v1/admin/support-ticket/resolve",
  SUPPORT_TICKET_REMOVE: "v1/admin/support-ticket/remove",
  SUPPORT_TICKET_PRIORITY_CHANGE:
    "v1/admin/support-ticket/change-priority-status",

  WITHDRAW_SETTINGS: "v1/admin/financial/withdraw/settings",
  WITHDRAW_METHOD_LIST: "v1/admin/financial/withdraw/gateway-list",
  WITHDRAW_METHOD_ADD: "v1/admin/financial/withdraw/gateway-add",
  WITHDRAW_METHOD_EDIT: "v1/admin/financial/withdraw/gateway-details",
  WITHDRAW_METHOD_UPDATE: "v1/admin/financial/withdraw/gateway-update",
  WITHDRAW_METHOD_DELETE: "v1/admin/financial/withdraw/gateway-delete",
  WITHDRAW_METHOD_STATUS_CHANGE:
    "v1/admin/financial/withdraw/gateway-change-status",

  WITHDRAW_LIST: "v1/admin/financial/withdraw",
  WITHDRAW_DETAILS: "v1/admin/financial/withdraw/details",

  WITHDRAW_REQUEST_LIST: "v1/admin/financial/withdraw/request-list",
  WITHDRAW_REQUEST_ADD: "v1/admin/financial/withdraw/withdraw-request",
  WITHDRAW_REQUEST_DETAILS: "v1/admin/financial/withdraw/details",
  WITHDRAW_METHOD_DROPDOWN: "v1/withdraw/gateway-method-list",
  WITHDRAW_REQUEST_REJECT: "v1/admin/financial/withdraw/request-reject",
  WITHDRAW_REQUEST_APPROVE: "v1/admin/financial/withdraw/request-approve",

  REFUND_REASON_LIST: "v1/admin/orders/refund-reason/list",
  REFUND_REASON_ADD: "v1/admin/orders/refund-reason/add",
  REFUND_REASON_EDIT: "v1/admin/orders/refund-reason/details",
  REFUND_REASON_UPDATE: "v1/admin/orders/refund-reason/update",
  REFUND_REASON_DELETE: "v1/admin/orders/refund-reason/remove",
  REFUND_REASON_STATUS_CHANGE:
    "v1/admin/financial/withdraw/gateway-change-status",

  REFUND_REQUEST_LIST: "v1/admin/orders/refund-request",
  REFUND_REQUEST_STATUS_CHANGE: "v1/admin/orders/refund-request/handle",
  UPDATE_LIVE_LOCATION: "v1/track-order-location",

  EMAIL_TEMPLATE_LIST:
    "v1/admin/system-management/email-settings/email-template/list",
  EMAIL_TEMPLATE_ADD:
    "v1/admin/system-management/email-settings/email-template/add",
  EMAIL_TEMPLATE_EDIT:
    "v1/admin/system-management/email-settings/email-template/details",
  EMAIL_TEMPLATE_UPDATE:
    "v1/admin/system-management/email-settings/email-template/edit",
  EMAIL_TEMPLATE_DELETE:
    "v1/admin/system-management/email-settings/email-template/remove",
  EMAIL_TEMPLATE_STATUS_CHANGE:
    "v1/admin/system-management/email-settings/email-template/change-status",

  SLIDER_LIST: "v1/admin/slider/list",
  SLIDER_ADD: "v1/admin/slider/add",
  SLIDER_EDIT: "v1/admin/slider/details",
  SLIDER_UPDATE: "v1/admin/slider/update",
  SLIDER_DELETE: "v1/admin/slider/remove",
  SLIDER_STATUS_CHANGE: "v1/admin/slider/change-status",

  BANNER_LIST: "v1/admin/promotional/banner/list",
  BANNER_ADD: "v1/admin/promotional/banner/add",
  BANNER_EDIT: "v1/admin/promotional/banner/details",
  BANNER_UPDATE: "v1/admin/promotional/banner/update",
  BANNER_DELETE: "v1/admin/promotional/banner/remove",
  BANNER_STATUS_CHANGE: "v1/admin/promotional/banner/change-status",

  BECOME_SELLER_LIST: "v1/admin/system-management/page-settings/become-seller",
  BECOME_SELLER_ADD: "v1/admin/system-management/page-settings/become-seller",

  CONTACT_MESSAGES_LIST: "v1/admin/contact-messages/list",
  CONTACT_MESSAGES_REPLY: "v1/admin/contact-messages/reply",
  CONTACT_MESSAGES_STATUS_CHANGE: "v1/admin/contact-messages/change-status",
  CONTACT_MESSAGES_DELETE: "v1/admin/contact-messages/remove",

  SUBSCRIBER_LIST: "v1/admin/customer/newsletter/list",
  SUBSCRIBER_LIST_STATUS_CHANGE:
    "v1/admin/customer/newsletter/bulk-status-change",
  SUBSCRIBER_LIST_DELETE: "v1/admin/customer/newsletter/remove",

  ADMIN_CUSTOMER_LIST: "v1/admin/customer/list",
  ADMIN_CUSTOMER_ADD: "v1/admin/customer/register",
  ADMIN_CUSTOMER_UPDATE: "v1/admin/customer/update-profile",
  ADMIN_CUSTOMER_DETAILS: "v1/admin/customer/details",
  ADMIN_CUSTOMER_LIST_STATUS_CHANGE: "v1/admin/customer/change-status",
  CUSTOMER_SUSPEND: "v1/admin/customer/suspend",
  CUSTOMER_EMAIL_VERIFY: "v1/admin/customer/email-verify",
  CUSTOMER_LIST_DELETE: "v1/admin/customer/remove",
  CUSTOMER_PASSWORD_CHANGE: "v1/admin/customer/change-password",

  TRASH_CUSTOMER_LIST: "v1/admin/customer/trash-list",
  TRASH_CUSTOMER_RESTORE: "v1/admin/customer/trash-restore",
  TRASH_CUSTOMER_DELETE: "v1/admin/customer/trash-delete",

  MENU_CUSTOMIZATION_LIST: "v1/admin/system-management/menu-customization/list",
  MENU_CUSTOMIZATION_ADD: "v1/admin/system-management/menu-customization/store",
  MENU_CUSTOMIZATION_EDIT:
    "v1/admin/system-management/menu-customization/details",
  MENU_CUSTOMIZATION_UPDATE:
    "v1/admin/system-management/menu-customization/update",
  MENU_CUSTOMIZATION_DELETE:
    "v1/admin/system-management/menu-customization/remove",
  MENU_CUSTOMIZATION_POSITION_CHANGE:
    "v1/admin/system-management/menu-customization/update-position",

  CASH_COLLECT_LIST: "v1/admin/financial/cash-collection",

  NOTICE_LIST: "v1/admin/store-notices/list",
  NOTICE_ADD: "v1/admin/store-notices/add",
  NOTICE_EDIT: "v1/admin/store-notices/details",
  NOTICE_UPDATE: "v1/admin/store-notices/update",
  NOTICE_DELETE: "v1/admin/store-notices/remove",
  NOTICE_STATUS_CHANGE: "v1/admin/store-notices/change-status",

  REPORT_ANALYTICS_LIST: "v1/admin/report-analytics/order",
  TRANSACTION_REPORT_LIST: "v1/admin/report-analytics/transaction",

  CHAT_SETTINGS: "v1/admin/chat/settings",
  LIVE_CHAT_LIST: "v1/admin/chat/manage/list",
  CHAT_DETAILS: "v1/admin/chat/manage/messages-details",
  REPLY_MESSAGE: "v1/admin/chat/manage/send",
  AI_CHAT_SETTINGS: "v1/admin/ai-chat/settings",
  AI_CHAT_CONVERSATIONS: "v1/admin/ai-chat/conversations",
  AI_CHAT_CONVERSATION_MESSAGES: "v1/admin/ai-chat/conversations",
  AI_CHAT_KNOWLEDGE_LIST: "v1/admin/ai-chat/knowledge/list",
  AI_CHAT_KNOWLEDGE_ADD: "v1/admin/ai-chat/knowledge/add",
  AI_CHAT_KNOWLEDGE_DETAILS: "v1/admin/ai-chat/knowledge/details",
  AI_CHAT_KNOWLEDGE_UPDATE: "v1/admin/ai-chat/knowledge/update",
  AI_CHAT_KNOWLEDGE_REMOVE: "v1/admin/ai-chat/knowledge/remove",
  AI_CHAT_KNOWLEDGE_CHANGE_STATUS: "v1/admin/ai-chat/knowledge/change-status",
  ADMIN_DASHBOARD_LIST: "v1/admin/dashboard",
  ADMIN_SALES_LIST: "v1/admin/dashboard/sales-summary",
  ADMIN_ORDER_GROWTH_LIST: "v1/admin/dashboard/order-growth-summary",
  ADMIN_OTHER_SUMMARY_LIST: "v1/admin/dashboard/other-summary",

  DEPARTMENT: "v1/admin/department/list",
  GET_DEPARTMENT: "v1/admin/department/details",
  DEPARTMENT_ADD: "v1/admin/department/add",
  DEPARTMENT_UPDATE: "v1/admin/department/update",
  DEPARTMENT_REMOVE: "v1/admin/department/remove",

  // Admin Staff
  ADMIN_STAFF_LIST: "v1/admin/staff/list",
  ADMIN_STAFF_ADD: "v1/admin/staff/add",
  ADMIN_STAFF_EDIT: "v1/admin/staff/details",
  ADMIN_STAFF_UPDATE: "v1/admin/staff/update",
  ADMIN_STAFF_STATUS: "v1/admin/staff/change-status",
  ADMIN_STAFF_REMOVE: "v1/admin/staff/remove",
  ADMIN_STAFF_PASSWORD_CHANGE: "v1/admin/staff/change-password",

  ADMIN_NOTIFICATIONS_ADD: "v1/admin/notifications",
  ADMIN_NOTIFICATIONS_READ: "v1/admin/notifications/read",
  ADMIN_NOTIFICATIONS_REMOVE: "v1/admin/notifications/remove",

  ADMIN_SELLER_LIST: "v1/admin/seller/list",
  ADMIN_ACTIVE_SELLER_LIST: "v1/admin/seller/active",
  ADMIN_PENDING_SELLER_LIST: "v1/admin/seller/list/pending",
  ADMIN_SELLER_STATUS_UPDATE: "v1/admin/seller/change-status",
  ADMIN_SELLER_ADD: "v1/admin/seller/registration",

  TRASH_SELLER_LIST: "v1/admin/seller/trash-list",
  TRASH_SELLER_RESTORE: "v1/admin/seller/trash-restore",
  TRASH_SELLER_DELETE: "v1/admin/seller/trash-delete",

  ADMIN_SELLER_EDIT: "v1/admin/seller/details",
  ADMIN_SELLER_UPDATE: "v1/admin/seller/update",
  ADMIN_SELLER_REMOVE: "v1/admin/seller/remove",
  ADMIN_SELLER_PASSWORD_CHANGE: "v1/admin/seller/change-password",
  ADMIN_SELLER_DETAILS: "v1/admin/seller/history",

  ADMIN_MEDIA_MANAGE_LIST: "v1/admin/media-manage",
  ADMIN_MEDIA_MANAGE_REMOVE: "v1/admin/media-manage/delete",

  GDPR_COOKIE_LIST: "v1/admin/system-management/gdpr-cookie-settings",
  GDPR_COOKIE_ADD: "v1/admin/system-management/gdpr-cookie-settings",

  ADMIN_SMS_PROVIDER_SETTINGS: "v1/admin/sms-provider/settings/update",
  ADMIN_OTP_LOGIN_STATUS_UPDATE:
    "v1/admin/sms-provider/settings/otp-login-status",
  ADMIN_SMS_PROVIDER_STATUS_UPDATE:
    "v1/admin/sms-provider/settings/status-update",
  ADMIN_SMS_PROVIDER_SETTINGS_UPDATE: "v1/admin/sms-provider/settings/update",

  ADMIN_SITEMAP_SETTINGS: "v1/admin/system-management/sitemap-settings",

  POS_PRODUCT_LIST: "v1/admin/pos/products",
  POS_PRODUCT_DETAILS: "v1/admin/pos/products",

  POS_CUSTOMER_STORE: "v1/admin/pos/add-customer",
  POS_CUSTOMER_LIST: "v1/admin/pos/customers",
  COUPON_CHECK: "v1/check-coupon",
  POS_PLACE_ORDER: "v1/admin/pos/checkout",
  POS_INVOICE: "v1/admin/pos/invoice",
  POS_CATEGORY: "v1/product-category/list",

  POS_ORDER_LIST: "v1/admin/pos/orders",
  POS_ORDER_DETAILS: "v1/admin/pos/orders",

  POS_SETTINGS: "v1/admin/pos/settings",

  CURRENCY_LIST: "v1/admin/currency",
  CURRENCY_CREATE: "v1/admin/currency/add",
  CURRENCY_BY_ID: "v1/admin/currency/details",
  CURRENCY_UPDATE: "v1/admin/currency/update",
  CURRENCY_DELETE: "v1/admin/currency/remove",

  CURRENCY_SETTINGS: "v1/admin/currency/settings",
  CURRENCY_SETTINGS_UPDATE: "v1/admin/currency/settings/update",

  DYNAMIC_FIELD_LIST: "v1/admin/dynamic-fields/list",
  DYNAMIC_FIELD_CREATE: "v1/admin/dynamic-fields/add",
  DYNAMIC_FIELD_BY_ID: "v1/admin/dynamic-fields/details",
  DYNAMIC_FIELD_UPDATE: "v1/admin/dynamic-fields/update",
  DYNAMIC_REQUIRED_FIELD_UPDATE: "v1/admin/dynamic-fields/change-status",
  DYNAMIC_FIELD_STATUS_UPDATE: "v1/admin/dynamic-fields/change-status",
  DYNAMIC_FIELD_DELETE: "v1/admin/dynamic-fields/remove",

  DYNAMIC_FIELD_OPTION_LIST: "v1/admin/dynamic-fields/options/list",
  DYNAMIC_FIELD_OPTION_CREATE: "v1/admin/dynamic-fields/options/add",
  DYNAMIC_FIELD_OPTION_BY_ID: "v1/admin/dynamic-fields/options/details",
  DYNAMIC_FIELD_OPTION_UPDATE: "v1/admin/dynamic-fields/options/update",
  DYNAMIC_FIELD_OPTION_DELETE: "v1/admin/dynamic-fields/options/remove",

  OPEN_AI_SETTINGS: "v1/admin/system-management/openai-settings",

  //common routes  for users
  YOUTUBE_SEARCH_API: "https://www.googleapis.com/youtube/v3/search",
  REGISTER: "/register",
  USERS_LOGIN: "/token",
  STORE_OWNER_REGISTER: "v1/seller/registration",
  SHOP_OWNER_LOGIN: "/v1/seller/login",
  USERS: "users",
  STAFF: "staff",
  STAFF_UPDATE: "staff/update",
  STAFF_STATUS: "staff/change-status",
  FORGET_PASSWORD: "v1/auth/forget-password",
  VERIFY_FORGET_PASSWORD_TOKEN: "/verify-forget-password-token",
  RESET_PASSWORD: "/reset-password",
  CHANGE_PASSWORD: "change-password",
  LOGOUT: "/logout",
  ME: "/user/me",
  GET_PERMISSIONS: "/permissions",
  PROFILE_SETTINGS: "user/profile",
  PROFILE_SETTINGS_EDIT: "user/profile-edit",
  PROFILE_SETTINGS_PASSWORD_CHANGE: "user/change-password",
  PRODUCT_AREA_LIST: "v1/com/area/list",
  PRODUCT_AREA_ADD: "v1/com/area/add",
  PRODUCT_AREA_EDIT: "v1/com/area",
  PRODUCT_AREA_UPDATE: "v1/com/area/update",
  PRODUCT_AREA_STATUS_UPDATE: "v1/com/area/status",
  PRODUCT_AREA_REMOVE: "v1/com/area/remove",
  PRODUCT_MEDIA_ADD: "v1/media-upload/store",
  PRODUCT_MEDIA_LIBRARY: "v1/media-upload/load-more",
  PRODUCT_MEDIA_DELETE: "v1/media-upload/delete",
  PRODUCT_ALT_CHANGE: "v1/media-upload/alt",

  PRODUCT_DYNAMIC_FIELD: "v1/admin/dynamic-fields",
  PRODUCT_DESCRIPTION_GENERATE: "v1/admin/generate/content",


  CATEGORY_LIST: "v1/product-category/list",
  BRAND_LIST: "v1/brand-list",
  AREA_DROPDOWN_LIST: "v1/area-list",
  PAYMENT_GATEWAY_LIST: "v1/payment-gateways",
  DEPARTMENT_LIST: "v1/department-list",
  UNIT_LIST: "v1/unit-list",
  STORE_TYPE_LIST: "v1/store-types",
  TYPE_WISE_STORE_LIST: "v1/store-list-dropdown",
  STORE_WISE_PRODUCT_LIST: "v1/store-wise-products",
  CUSTOMER_LIST: "v1/customer-list",
  SUBSCRIPTION_PACKAGE_LIST: "v1/subscription/packages",
  BECOME_A_SELLER: "v1/become-a-seller",

  GENERAL: "v1/site-general-info",
  CURRENCY: "v1/currency-info",
  CURRENCY_DROPDOWN_LIST: "v1/currency-list",

  ADMIN_FORGOT_PASSWORD: "v1/auth/forget-password",
  ADMIN_VERIFY_TOKEN: "v1/auth/verify-token",
  ADMIN_RESET_PASSWORD: "v1/auth/reset-password",

  GOOGLE_MAP_FOR_ALL: "v1/google-map-settings",
};
