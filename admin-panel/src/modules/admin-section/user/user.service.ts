import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { User } from "./user.type";
import { statusUpdateData } from "./user.schema";

export const useUserService = () => {
  return useBaseService<User>(API_ENDPOINTS.STAFF);
};

export const useUserUpdateService = () => {
  return useBaseService<User>(API_ENDPOINTS.STAFF_UPDATE);
};

export const useUserStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(
    API_ENDPOINTS.STAFF_STATUS
  );
};
