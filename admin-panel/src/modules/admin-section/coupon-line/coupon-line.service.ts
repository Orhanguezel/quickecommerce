import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";

import { CouponLine } from "./coupon-line.type";
import { couponLineDelete, couponLineStatusChange } from "./coupon-line.schema";

// Hook for Coupon Line Service
export const useCouponLineQueryService = () => {
  return useBaseService<CouponLine>(API_ENDPOINTS.COUPON_LINE_LIST);
};
export const useCouponLineStoreService = () => {
  return useBaseService<CouponLine>(API_ENDPOINTS.COUPON_LINE_ADD);
};
export const useCouponLineEditService = () => {
  return useBaseService<CouponLine>(API_ENDPOINTS.COUPON_LINE_EDIT);
};
export const useCouponLineUpdateService = () => {
  return useBaseService<CouponLine>(API_ENDPOINTS.COUPON_LINE_UPDATE);
};

export const useCouponLineStatusUpdateService = () => {
  return useBaseService<couponLineStatusChange>(
    API_ENDPOINTS.COUPON_STATUS_CHANGE
  );
};

export const useCouponLineDeleteService = () => {
  return useBaseService<couponLineDelete, any>(
    API_ENDPOINTS.COUPON_LINE_DELETE
  );
};
