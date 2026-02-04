import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { statusUpdateData } from "./store-notices.schema";
import { Notice } from "./store-notices.type";

// Hook for Notice Service
export const useNoticeQueryService = () => {
  return useBaseService<Notice>(API_ENDPOINTS.NOTICE_LIST);
};

export const useNoticeStoreService = () => {
  return useBaseService<Notice>(API_ENDPOINTS.NOTICE_ADD);
};
export const useNoticeEditService = () => {
  return useBaseService<Notice>(API_ENDPOINTS.NOTICE_EDIT);
};
export const useNoticeUpdateService = () => {
  return useBaseService<Notice>(API_ENDPOINTS.NOTICE_UPDATE);
};
export const useNoticeStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.NOTICE_STATUS_CHANGE);
};
export const useNoticeDeleteService = () => {
  return useBaseService<Notice, any>(
    API_ENDPOINTS.NOTICE_DELETE
  );
};
