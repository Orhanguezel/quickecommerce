import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { couponDelete, couponStatusChange, statusUpdateData } from "./coupon.schema";
import { Coupon } from "./coupon.type";

// Hook for Coupon Service
export const useCouponQueryService = () => {
  return useBaseService<Coupon>(API_ENDPOINTS.COUPON_LIST);
};
export const useCouponStoreService = () => {
  return useBaseService<Coupon>(API_ENDPOINTS.COUPON_ADD);
};
export const useCouponEditService = () => {
  return useBaseService<Coupon>(API_ENDPOINTS.COUPON_EDIT);
};
export const useCouponUpdateService = () => {
  return useBaseService<Coupon>(API_ENDPOINTS.COUPON_UPDATE);
};

export const useCouponStatusUpdateService = () => {
  return useBaseService<couponStatusChange>(
    API_ENDPOINTS.COUPON_STATUS_CHANGE
  );
};

export const useCouponDeleteService = () => {
  return useBaseService<couponDelete, any>(
    API_ENDPOINTS.COUPON_DELETE
  );
};