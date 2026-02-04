import { useBaseService } from "@/modules/core/base.service";
import { Category, CoupponCheck, CustomerList, Invoice, Product, ProductQueryOptions } from "./Pos.type";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

export const useProductListService = () => {
    return useBaseService<ProductQueryOptions>(SELLER_API_ENDPOINTS.POS_PRODUCT_LIST);
};

export const useProductDetailsService = () => {
    return useBaseService<Product>(SELLER_API_ENDPOINTS.POS_PRODUCT_DETAILS);
};

export const usePosCustomerStoreService = () => {
  return useBaseService<CustomerList>(SELLER_API_ENDPOINTS.POS_CUSTOMER_STORE);
};
export const usePosCustomerListService = () => {
  return useBaseService<CustomerList>(SELLER_API_ENDPOINTS.POS_CUSTOMER_LIST);
};

export const useCouponCheckService = () => {
    return useBaseService<CoupponCheck>(SELLER_API_ENDPOINTS.COUPON_CHECK);
};
export const usePlaceOrderService = () => {
    return useBaseService<CoupponCheck>(SELLER_API_ENDPOINTS.POS_PLACE_ORDER);
};
export const usePosInvoiceService = () => {
    return useBaseService<Invoice>(SELLER_API_ENDPOINTS.POS_INVOICE);
};

export const usePosCategoryService = () => {
  return useBaseService<Category>(SELLER_API_ENDPOINTS.POS_CATEGORY);
};

export const usePosSettingsService = () => {
  return useBaseService<any>(SELLER_API_ENDPOINTS.POS_SETTINGS);
};

