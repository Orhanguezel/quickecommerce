import { useBaseService } from "@/modules/core/base.service";
import {
  Category,
  CoupponCheck,
  CustomerList,
  Invoice,
  Product,
  ProductQueryOptions,
} from "./Pos.type";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";

export const useProductListService = () => {
  return useBaseService<ProductQueryOptions>(API_ENDPOINTS.POS_PRODUCT_LIST);
};

export const useProductDetailsService = () => {
  return useBaseService<Product>(API_ENDPOINTS.POS_PRODUCT_DETAILS);
};

export const usePosCustomerStoreService = () => {
  return useBaseService<CustomerList>(API_ENDPOINTS.POS_CUSTOMER_STORE);
};
export const usePosCustomerListService = () => {
  return useBaseService<CustomerList>(API_ENDPOINTS.POS_CUSTOMER_LIST);
};

export const useCouponCheckService = () => {
  return useBaseService<CoupponCheck>(API_ENDPOINTS.COUPON_CHECK);
};
export const usePlaceOrderService = () => {
  return useBaseService<CoupponCheck>(API_ENDPOINTS.POS_PLACE_ORDER);
};
export const usePosInvoiceService = () => {
  return useBaseService<Invoice>(API_ENDPOINTS.POS_INVOICE);
};

export const usePosCategoryService = () => {
  return useBaseService<Category>(API_ENDPOINTS.POS_CATEGORY);
};

export const usePosSettingsService = () => {
  return useBaseService<any>(API_ENDPOINTS.POS_SETTINGS);
};
