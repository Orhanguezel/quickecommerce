import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { useAppSelector } from "@/redux/hooks/index";
import { productDelete } from "./product.schema";
import { altChangeData, Media, mediaDeleteData, Product } from "./product.type";

export const useStoreListService = () => {
    return useBaseService<Product>(SELLER_API_ENDPOINTS.STORE_DROPDOWN_LIST);
};

export const useProductStoreService = () => {
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const slug = selectedStore?.slug
  return useBaseService<Product>(SELLER_API_ENDPOINTS.PRODUCT_ADD);
};
export const useProductQueryService = () => {
  return useBaseService<Product>(SELLER_API_ENDPOINTS.PRODUCT_LIST);
};

export const useProductEditService = () => {
  return useBaseService<Product>(SELLER_API_ENDPOINTS.PRODUCT_EDIT);
};
export const useProductUpdateService = () => {
  return useBaseService<Product>(SELLER_API_ENDPOINTS.PRODUCT_UPDATE);
};


export const useCouponLineDeleteService = () => {
  return useBaseService<productDelete, any>(
    SELLER_API_ENDPOINTS.PRODUCT_REMOVE
  );
};

export const useMakeFeatureService = () => {
  return useBaseService<productDelete, any>(
    SELLER_API_ENDPOINTS.PRODUCT_FEATURE_MAKE
  );
};


export const useProductDescriptionGenerateService = () => {
  return useBaseService<any>(SELLER_API_ENDPOINTS.PRODUCT_DESCRIPTION_GENERATE);
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



export const useDynamicFieldService = () => {
  return useBaseService<altChangeData>(SELLER_API_ENDPOINTS.PRODUCT_DYNAMIC_FIELD);
};