import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { MediaManage } from "./media-manage.type";
import { statusUpdateData } from "./media-manage.schema";

// Hook for MediaManage Service
export const useMediaManageQueryService = () => {
  return useBaseService<MediaManage>(API_ENDPOINTS.ADMIN_MEDIA_MANAGE_LIST);
};

export const useMediaManageDeleteService = () => {
  return useBaseService<any, any>(
    API_ENDPOINTS.ADMIN_MEDIA_MANAGE_REMOVE
  );
};
