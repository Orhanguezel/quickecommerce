import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { useAppSelector } from "@/redux/hooks/index";
import { productDelete, statusUpdateData } from "./product.schema";
import { altChangeData, Media, mediaDeleteData, Product } from "./product.type";

export const useStoreListService = () => {
    return useBaseService<Product>(API_ENDPOINTS.STORE_DROPDOWN_LIST);
};

export const useProductStoreService = () => {
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const slug = selectedStore?.slug
  return useBaseService<Product>(API_ENDPOINTS.PRODUCT_ADD);
};
export const useProductQueryService = () => {
  return useBaseService<Product>(API_ENDPOINTS.PRODUCT_LIST);
};

export const useProductEditService = () => {
  return useBaseService<Product>(API_ENDPOINTS.PRODUCT_EDIT);
};
export const useProductRequestDetailsService = () => {
  return useBaseService<Product>(API_ENDPOINTS.PRODUCT_DETAILS);
};
export const useProductUpdateService = () => {
  return useBaseService<Product>(API_ENDPOINTS.PRODUCT_UPDATE);
};
export const useProductStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.PRODUCT_STATUS_UPDATE);
};

export const useCouponLineDeleteService = () => {
  return useBaseService<productDelete, any>(
    API_ENDPOINTS.PRODUCT_REMOVE
  );
};
export const useMakeFeatureService = () => {
  return useBaseService<productDelete, any>(
    API_ENDPOINTS.PRODUCT_FEATURE_MAKE
  );
};

export const useTrashProductQueryService = () => {
  return useBaseService<Product>(API_ENDPOINTS.TRASH_PRODUCT_LIST);
};
export const useTrashProductRestoreService = () => {
  return useBaseService<productDelete, any>(
    API_ENDPOINTS.TRASH_PRODUCT_RESTORE
  );
};
export const useTrashProductDeleteService = () => {
  return useBaseService<productDelete, any>(
    API_ENDPOINTS.TRASH_PRODUCT_DELETE
  );
};


export const useDynamicFieldService = () => {
  return useBaseService<any>(API_ENDPOINTS.PRODUCT_DYNAMIC_FIELD);
};

export const useProductDescriptionGenerateService = () => {
  return useBaseService<any>(API_ENDPOINTS.PRODUCT_DESCRIPTION_GENERATE);
};








export const useMediaLibraryService = () => {
  return useBaseService<Media>(API_ENDPOINTS.PRODUCT_MEDIA_LIBRARY);
};

export const useMediaDeleteService = () => {
  return useBaseService<mediaDeleteData>(API_ENDPOINTS.PRODUCT_MEDIA_DELETE);
};
export const useAltChangeService = () => {
  return useBaseService<altChangeData>(API_ENDPOINTS.PRODUCT_ALT_CHANGE);
};



