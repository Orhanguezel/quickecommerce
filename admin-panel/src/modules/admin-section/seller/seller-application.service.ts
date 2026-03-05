import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { SellerApplication } from "./seller-application.type";

export const useSellerApplicationListService = () => {
  return useBaseService<SellerApplication>(
    API_ENDPOINTS.ADMIN_SELLER_APPLICATION_LIST
  );
};

export const useSellerApplicationDetailsService = () => {
  return useBaseService<SellerApplication>(
    API_ENDPOINTS.ADMIN_SELLER_APPLICATION_DETAILS
  );
};

export const useSellerApplicationApproveService = () => {
  return useBaseService<any>(API_ENDPOINTS.ADMIN_SELLER_APPLICATION_APPROVE);
};

export const useSellerApplicationRejectService = () => {
  return useBaseService<any>(API_ENDPOINTS.ADMIN_SELLER_APPLICATION_REJECT);
};
