import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Pages } from "./pages.type";

export const useAllPagesService = () => {
  return useBaseService<Pages>(API_ENDPOINTS.ALL_PAGES);
};
export const usePageService = () => {
  return useBaseService<any>(API_ENDPOINTS.PAGES_GET);
};

export const usePageAllService = () => {
  return useBaseService<Pages>(API_ENDPOINTS.PAGES);
};
export const usePageAddService = () => {
  return useBaseService<Pages>(API_ENDPOINTS.PAGES_ADD);
};
export const usePageUpdateService = () => {
  return useBaseService<Pages>(API_ENDPOINTS.PAGES_UPDATE);
};
export const usePageRemoveService = () => {
  return useBaseService<Pages>(API_ENDPOINTS.PAGES_REMOVE);
};
