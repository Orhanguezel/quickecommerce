import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { altChangeData, Media, mediaDeleteData } from "./product.type";


export const useMediaLibraryService = () => {
  return useBaseService<Media>(API_ENDPOINTS.PRODUCT_MEDIA_LIBRARY);
};

export const useMediaDeleteService = () => {
  return useBaseService<mediaDeleteData>(API_ENDPOINTS.PRODUCT_MEDIA_DELETE);
};
export const useAltChangeService = () => {
  return useBaseService<altChangeData>(API_ENDPOINTS.PRODUCT_ALT_CHANGE);
};



