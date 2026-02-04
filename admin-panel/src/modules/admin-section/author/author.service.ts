
import { useBaseService } from "@/modules/core/base.service";
import { Author } from "./author.type";
import { statusUpdateData } from "./author.schema";
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";


export const useAuthorRequestListService = () => {
    return useBaseService<Author>(API_ENDPOINTS.AUTHOR_REQUEST_LIST);
};
export const useAuthorRequestService = () => {
  return useBaseService<Author>(API_ENDPOINTS.AUTHOR_REQUEST_APPROVE);
};


export const useAuthorListService = () => {
    return useBaseService<Author>(API_ENDPOINTS.AUTHOR_LIST);
};

export const useAuthorSaveService = () => {
    return useBaseService<Author>(API_ENDPOINTS.AUTHOR_ADD);
};

export const useAuthorUpdateService = () => {
    return useBaseService<Author>(API_ENDPOINTS.AUTHOR_UPDATE);
};

export const useAuthorEditService = () => {
    return useBaseService<Author>(API_ENDPOINTS.AUTHOR_EDIT);
};

export const useAuthorStatusUpdateService = () => {
    return useBaseService<statusUpdateData>(API_ENDPOINTS.AUTHOR_STATUS);
};

export const useAuthorDeleteService = () => {
  return useBaseService<any, any>(
    API_ENDPOINTS.AUTHOR_REMOVE
  );
};