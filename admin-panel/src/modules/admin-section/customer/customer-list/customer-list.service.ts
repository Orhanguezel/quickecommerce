import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { CustomerList } from "./customer-list.type";
import { statusUpdateData } from "./customer-list.schema";

// Hook for Join Request Service
export const useCustomerListQueryService = () => {
  return useBaseService<CustomerList>(API_ENDPOINTS.ADMIN_CUSTOMER_LIST);
};
export const useCustomerListEditService = () => {
  return useBaseService<CustomerList>(API_ENDPOINTS.ADMIN_CUSTOMER_DETAILS);
};
export const useCustomerListStatusUpdateService = () => {
  return useBaseService<CustomerList>(
    API_ENDPOINTS.ADMIN_CUSTOMER_LIST_STATUS_CHANGE
  );
};

export const useCustomerStoreService = () => {
  return useBaseService<CustomerList>(API_ENDPOINTS.ADMIN_CUSTOMER_ADD);
};
export const useCustomerUpdateService = () => {
  return useBaseService<CustomerList>(API_ENDPOINTS.ADMIN_CUSTOMER_UPDATE);
};
export const useCustomerEmailVerifyService = () => {
  return useBaseService<CustomerList>(API_ENDPOINTS.CUSTOMER_EMAIL_VERIFY);
};
export const useCustomerSuspendService = () => {
  return useBaseService<CustomerList>(API_ENDPOINTS.CUSTOMER_SUSPEND);
};

export const useCustomerListDeleteService = () => {
  return useBaseService<CustomerList>(API_ENDPOINTS.CUSTOMER_LIST_DELETE);
};

export const useChangePasswordService = () => {
  return useBaseService<statusUpdateData>(
    API_ENDPOINTS.CUSTOMER_PASSWORD_CHANGE
  );
};

export const useTrashQueryService = () => {
  return useBaseService<CustomerList>(API_ENDPOINTS.TRASH_CUSTOMER_LIST);
};
export const useTrashRestoreService = () => {
  return useBaseService<CustomerList, any>(
    API_ENDPOINTS.TRASH_CUSTOMER_RESTORE
  );
};
export const useTrashDeleteService = () => {
  return useBaseService<CustomerList, any>(API_ENDPOINTS.TRASH_CUSTOMER_DELETE);
};
