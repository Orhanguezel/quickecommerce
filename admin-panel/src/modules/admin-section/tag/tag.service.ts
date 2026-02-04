import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Tag } from "./tag.type";

export const useTagService = () => {
  return useBaseService<any>(API_ENDPOINTS.GET_TAG);
};
export const useTagAllService = () => {
  return useBaseService<Tag>(API_ENDPOINTS.TAG);
};
export const useTagAddService = () => {
  return useBaseService<Tag>(API_ENDPOINTS.TAG_ADD);
};
export const useTagUpdateService = () => {
  return useBaseService<Tag>(API_ENDPOINTS.TAG_UPDATE);
};
export const useTagRemoveService = () => {
  return useBaseService<any>(API_ENDPOINTS.TAG_REMOVE);
};
