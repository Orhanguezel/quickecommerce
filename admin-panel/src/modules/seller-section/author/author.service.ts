import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Author } from "./author.type";
import { statusUpdateData } from "./author.schema";


export const useAuthorListService = () => {
    return useBaseService<Author>(SELLER_API_ENDPOINTS.AUTHOR_LIST);
};

export const useAuthorSaveService = () => {
    return useBaseService<Author>(SELLER_API_ENDPOINTS.AUTHOR_SAVE);
};

export const useAuthorUpdateService = () => {
    return useBaseService<Author>(SELLER_API_ENDPOINTS.AUTHOR_UPDATE);
};

export const useAuthorEditService = () => {
    return useBaseService<Author>(SELLER_API_ENDPOINTS.AUTHOR_EDIT);
};

export const useAuthorStatusUpdateService = () => {
    return useBaseService<statusUpdateData>(SELLER_API_ENDPOINTS.AUTHOR_STATUS);
};

export const useAuthorDeleteService = () => {
  return useBaseService<statusUpdateData, any>(
    SELLER_API_ENDPOINTS.AUTHOR_REMOVE
  );
};