import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Customer } from "./customer.type";

export const useCustomerService = () => {
  return useBaseService<Customer>(API_ENDPOINTS.CUSTOMER_LIST);
};
