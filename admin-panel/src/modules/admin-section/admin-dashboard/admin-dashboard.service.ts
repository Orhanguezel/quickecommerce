import { useBaseService } from "@/modules/core/base.service";
import { AdminDashboard } from "./admin-dashboard.type";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";

export const useAdminDashboardService = () => {
  return useBaseService<AdminDashboard>(API_ENDPOINTS.ADMIN_DASHBOARD_LIST);
};
export const useAdminSalesService = () => {
  return useBaseService<AdminDashboard>(API_ENDPOINTS.ADMIN_SALES_LIST);
};
export const useAdminOrderGrowthService = () => {
  return useBaseService<AdminDashboard>(API_ENDPOINTS.ADMIN_ORDER_GROWTH_LIST);
};
export const useAdminOtherSummaryService = () => {
  return useBaseService<AdminDashboard>(API_ENDPOINTS.ADMIN_OTHER_SUMMARY_LIST);
};
export const useStoreTypeListService = () => {
    return useBaseService<AdminDashboard>(API_ENDPOINTS.STORE_TYPE_LIST);
};
